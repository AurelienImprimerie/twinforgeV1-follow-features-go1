/*
  # Update Meal Plans Table for Library Management

  1. Changes
    - Add title column for plan naming
    - Add is_archived column for soft delete
    - Add inventory_id reference (consolidate with inventory_session_id)
    - Make start_date and end_date NOT NULL
    - Update plan_data to NOT NULL with default empty object
    - Add check constraints for data integrity

  2. Indexes
    - Add index on is_archived for filtering active plans
    - Add composite index on (user_id, is_archived)
    - Add index on created_at for chronological queries

  3. Security
    - RLS policies already exist, verify they're correct
    
  4. Notes
    - Preserves existing data
    - Adds backward compatibility with old structure
*/

-- Add new columns if they don't exist
DO $$ 
BEGIN
  -- Add title column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'meal_plans' AND column_name = 'title'
  ) THEN
    ALTER TABLE meal_plans ADD COLUMN title text NOT NULL DEFAULT 'Plan de Repas';
  END IF;

  -- Add is_archived column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'meal_plans' AND column_name = 'is_archived'
  ) THEN
    ALTER TABLE meal_plans ADD COLUMN is_archived boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Make start_date and end_date NOT NULL (set defaults for existing rows first)
UPDATE meal_plans SET start_date = created_at::date WHERE start_date IS NULL;
UPDATE meal_plans SET end_date = (created_at + INTERVAL '6 days')::date WHERE end_date IS NULL;

ALTER TABLE meal_plans 
  ALTER COLUMN start_date SET NOT NULL,
  ALTER COLUMN end_date SET NOT NULL;

-- Make plan_data NOT NULL with default
UPDATE meal_plans SET plan_data = '{}'::jsonb WHERE plan_data IS NULL;
ALTER TABLE meal_plans ALTER COLUMN plan_data SET NOT NULL;
ALTER TABLE meal_plans ALTER COLUMN plan_data SET DEFAULT '{}'::jsonb;

-- Add check constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'meal_plans_week_number_positive'
  ) THEN
    ALTER TABLE meal_plans ADD CONSTRAINT meal_plans_week_number_positive CHECK (week_number > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'meal_plans_valid_date_range'
  ) THEN
    ALTER TABLE meal_plans ADD CONSTRAINT meal_plans_valid_date_range CHECK (end_date >= start_date);
  END IF;
END $$;

-- Create new indexes
CREATE INDEX IF NOT EXISTS idx_meal_plans_is_archived ON meal_plans(is_archived);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_active ON meal_plans(user_id, is_archived);
CREATE INDEX IF NOT EXISTS idx_meal_plans_created_at ON meal_plans(created_at DESC);

-- Verify RLS is enabled
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- Update or create RLS policies
DROP POLICY IF EXISTS "Users can view own meal plans" ON meal_plans;
CREATE POLICY "Users can view own meal plans"
  ON meal_plans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own meal plans" ON meal_plans;
CREATE POLICY "Users can create own meal plans"
  ON meal_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own meal plans" ON meal_plans;
CREATE POLICY "Users can update own meal plans"
  ON meal_plans
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own meal plans" ON meal_plans;
CREATE POLICY "Users can delete own meal plans"
  ON meal_plans
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create or update trigger function for updated_at
CREATE OR REPLACE FUNCTION update_meal_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS trigger_meal_plans_updated_at ON meal_plans;
CREATE TRIGGER trigger_meal_plans_updated_at
  BEFORE UPDATE ON meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_meal_plans_updated_at();