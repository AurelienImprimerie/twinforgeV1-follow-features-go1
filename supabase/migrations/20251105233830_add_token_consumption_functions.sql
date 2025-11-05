/*
  # Add Token Consumption Functions and Schema Fixes

  ## Overview
  This migration adds the missing `consume_tokens_atomic` and `add_tokens` PostgreSQL functions
  required for AI token management, and fixes the user_token_balance schema to match application expectations.

  ## Changes

  1. Schema Updates
    - Add `available_tokens` column to `user_token_balance` table
    - Add `subscription_tokens`, `onetime_tokens`, `bonus_tokens` columns for token source tracking
    - Add `last_monthly_reset` column for subscription token refresh tracking
    - Create `token_transactions` table for audit trail and idempotency

  2. New Tables
    - `token_transactions`
      - `id` (uuid, primary key)
      - `request_id` (text, unique) - for idempotency
      - `user_id` (uuid, foreign key to profiles)
      - `token_amount` (integer) - positive for additions, negative for consumption
      - `balance_before` (integer)
      - `balance_after` (integer)
      - `edge_function_name` (text)
      - `operation_type` (text)
      - `openai_model` (text, nullable)
      - `openai_input_tokens` (integer, nullable)
      - `openai_output_tokens` (integer, nullable)
      - `openai_cost_usd` (numeric, nullable)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)

  3. Functions
    - `consume_tokens_atomic` - Atomically consume tokens with idempotency and rate limiting
    - `add_tokens` - Add tokens to user balance with source tracking

  4. Security
    - Enable RLS on token_transactions table
    - Users can view their own transactions
    - Service role can manage all transactions
    - Rate limiting: 100 requests per minute per user

  ## Notes
  - All token operations are atomic to prevent race conditions
  - Idempotency is enforced using request_id to prevent duplicate charges
  - Rate limiting prevents abuse
  - Complete audit trail is maintained in token_transactions table
*/

-- Add missing columns to user_token_balance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_token_balance' AND column_name = 'available_tokens'
  ) THEN
    ALTER TABLE user_token_balance ADD COLUMN available_tokens integer NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_token_balance' AND column_name = 'subscription_tokens'
  ) THEN
    ALTER TABLE user_token_balance ADD COLUMN subscription_tokens integer NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_token_balance' AND column_name = 'onetime_tokens'
  ) THEN
    ALTER TABLE user_token_balance ADD COLUMN onetime_tokens integer NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_token_balance' AND column_name = 'bonus_tokens'
  ) THEN
    ALTER TABLE user_token_balance ADD COLUMN bonus_tokens integer NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_token_balance' AND column_name = 'last_monthly_reset'
  ) THEN
    ALTER TABLE user_token_balance ADD COLUMN last_monthly_reset timestamptz;
  END IF;
END $$;

-- Migrate data from balance to available_tokens if needed
UPDATE user_token_balance
SET available_tokens = balance
WHERE available_tokens = 0 AND balance > 0;

-- Create token_transactions table for audit trail and idempotency
CREATE TABLE IF NOT EXISTS token_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token_amount integer NOT NULL,
  balance_before integer NOT NULL,
  balance_after integer NOT NULL,
  edge_function_name text NOT NULL,
  operation_type text NOT NULL,
  openai_model text,
  openai_input_tokens integer,
  openai_output_tokens integer,
  openai_cost_usd numeric(12, 6),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on token_transactions
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for token_transactions
CREATE POLICY "Users can view own token transactions"
  ON token_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all token transactions"
  ON token_transactions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS token_transactions_user_id_idx ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS token_transactions_request_id_idx ON token_transactions(request_id);
CREATE INDEX IF NOT EXISTS token_transactions_created_at_idx ON token_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS token_transactions_edge_function_idx ON token_transactions(edge_function_name);

-- Function: consume_tokens_atomic
-- Atomically consume tokens with idempotency, rate limiting, and proper error handling
CREATE OR REPLACE FUNCTION consume_tokens_atomic(
  p_request_id text,
  p_user_id uuid,
  p_token_amount integer,
  p_edge_function_name text,
  p_operation_type text,
  p_openai_model text DEFAULT NULL,
  p_openai_input_tokens integer DEFAULT NULL,
  p_openai_output_tokens integer DEFAULT NULL,
  p_openai_cost_usd numeric DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance_before integer;
  v_balance_after integer;
  v_existing_transaction token_transactions;
  v_recent_requests_count integer;
BEGIN
  -- Check for idempotency: if this request_id was already processed, return the cached result
  SELECT * INTO v_existing_transaction
  FROM token_transactions
  WHERE request_id = p_request_id;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'duplicate', true,
      'message', 'Request already processed (idempotent)',
      'balance_after', v_existing_transaction.balance_after,
      'tokens_consumed', 0
    );
  END IF;

  -- Rate limiting: check requests in the last minute
  SELECT COUNT(*) INTO v_recent_requests_count
  FROM token_transactions
  WHERE user_id = p_user_id
    AND created_at > (now() - interval '1 minute');

  IF v_recent_requests_count >= 100 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'rate_limit_exceeded',
      'message', 'Too many requests. Please try again in a moment.',
      'retry_after_seconds', 5
    );
  END IF;

  -- Lock the user's token balance row for update
  SELECT available_tokens INTO v_balance_before
  FROM user_token_balance
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- If user has no token balance record, create one
  IF NOT FOUND THEN
    INSERT INTO user_token_balance (
      user_id,
      available_tokens,
      subscription_tokens,
      onetime_tokens,
      bonus_tokens,
      balance,
      monthly_refresh_amount
    )
    VALUES (p_user_id, 0, 0, 0, 0, 0, 0)
    RETURNING available_tokens INTO v_balance_before;
  END IF;

  -- Check if user has enough tokens
  IF v_balance_before < p_token_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'insufficient_tokens',
      'message', 'Insufficient tokens for this operation',
      'available_tokens', v_balance_before,
      'required_tokens', p_token_amount
    );
  END IF;

  -- Calculate new balance
  v_balance_after := v_balance_before - p_token_amount;

  -- Update the balance atomically
  UPDATE user_token_balance
  SET
    available_tokens = v_balance_after,
    balance = v_balance_after,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Record the transaction for audit trail and idempotency
  INSERT INTO token_transactions (
    request_id,
    user_id,
    token_amount,
    balance_before,
    balance_after,
    edge_function_name,
    operation_type,
    openai_model,
    openai_input_tokens,
    openai_output_tokens,
    openai_cost_usd,
    metadata
  )
  VALUES (
    p_request_id,
    p_user_id,
    -p_token_amount,
    v_balance_before,
    v_balance_after,
    p_edge_function_name,
    p_operation_type,
    p_openai_model,
    p_openai_input_tokens,
    p_openai_output_tokens,
    p_openai_cost_usd,
    p_metadata
  );

  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'balance_before', v_balance_before,
    'balance_after', v_balance_after,
    'tokens_consumed', p_token_amount,
    'message', 'Tokens consumed successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Return error with details
    RETURN jsonb_build_object(
      'success', false,
      'error', 'database_error',
      'message', SQLERRM,
      'sqlstate', SQLSTATE
    );
END;
$$;

-- Function: add_tokens
-- Add tokens to user balance with source tracking
CREATE OR REPLACE FUNCTION add_tokens(
  p_user_id uuid,
  p_token_amount integer,
  p_source text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance_before integer;
  v_balance_after integer;
  v_request_id text;
BEGIN
  -- Generate unique request ID
  v_request_id := 'add_tokens_' || gen_random_uuid()::text;

  -- Lock the user's token balance row for update
  SELECT available_tokens INTO v_balance_before
  FROM user_token_balance
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- If user has no token balance record, create one
  IF NOT FOUND THEN
    INSERT INTO user_token_balance (
      user_id,
      available_tokens,
      subscription_tokens,
      onetime_tokens,
      bonus_tokens,
      balance,
      monthly_refresh_amount
    )
    VALUES (p_user_id, 0, 0, 0, 0, 0, 0)
    RETURNING available_tokens INTO v_balance_before;
  END IF;

  -- Calculate new balance
  v_balance_after := v_balance_before + p_token_amount;

  -- Update the balance atomically
  UPDATE user_token_balance
  SET
    available_tokens = v_balance_after,
    balance = v_balance_after,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Update source-specific columns based on source
  IF p_source = 'subscription' THEN
    UPDATE user_token_balance
    SET subscription_tokens = subscription_tokens + p_token_amount
    WHERE user_id = p_user_id;
  ELSIF p_source = 'purchase' THEN
    UPDATE user_token_balance
    SET onetime_tokens = onetime_tokens + p_token_amount
    WHERE user_id = p_user_id;
  ELSIF p_source = 'bonus' THEN
    UPDATE user_token_balance
    SET bonus_tokens = bonus_tokens + p_token_amount
    WHERE user_id = p_user_id;
  END IF;

  -- Record the transaction
  INSERT INTO token_transactions (
    request_id,
    user_id,
    token_amount,
    balance_before,
    balance_after,
    edge_function_name,
    operation_type,
    metadata
  )
  VALUES (
    v_request_id,
    p_user_id,
    p_token_amount,
    v_balance_before,
    v_balance_after,
    'add_tokens',
    p_source,
    p_metadata
  );

  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_balance_after,
    'tokens_added', p_token_amount,
    'message', 'Tokens added successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Return error with details
    RETURN jsonb_build_object(
      'success', false,
      'error', 'database_error',
      'message', SQLERRM
    );
END;
$$;

-- Grant execute permissions to authenticated users and service role
GRANT EXECUTE ON FUNCTION consume_tokens_atomic TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION add_tokens TO authenticated, service_role;
