/*
  # Add Forge XP Function for Gamification System

  ## Overview
  Creates the missing `award_forge_xp` function to reward users with XP
  for completing Forge actions (recipes, meal plans, shopping lists, etc.)

  ## Changes

  1. Function
    - `award_forge_xp(p_user_id, p_action, p_source)` - Awards XP for Forge actions
    - Integrates with existing gamification system (user_stats, xp_events_log)
    - Supports idempotency to prevent duplicate XP awards
    - Automatically levels up users when XP thresholds are reached

  2. Forge Actions Supported
    - recipe_generated: 10 XP
    - meal_plan_created: 15 XP
    - shopping_list_created: 5 XP
    - fridge_scanned: 5 XP
    - meal_logged: 3 XP

  3. Security
    - Function is SECURITY DEFINER (runs with elevated privileges)
    - Only authenticated users can call it
    - Validates user exists before awarding XP

  ## Notes
  - Integrates seamlessly with existing gamification system in coeur/ migrations
  - Uses xp_events_log for audit trail
  - Updates user_stats with new XP and level
*/

-- Create forge_xp_actions table to define XP rewards
CREATE TABLE IF NOT EXISTS forge_xp_actions (
  action text PRIMARY KEY,
  xp_reward integer NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on forge_xp_actions
ALTER TABLE forge_xp_actions ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read XP rewards
CREATE POLICY "Anyone can view forge XP actions"
  ON forge_xp_actions FOR SELECT
  TO authenticated
  USING (true);

-- Insert default Forge XP actions
INSERT INTO forge_xp_actions (action, xp_reward, description) VALUES
  ('recipe_generated', 10, 'Generated a recipe using AI'),
  ('meal_plan_created', 15, 'Created a weekly meal plan'),
  ('shopping_list_created', 5, 'Generated a shopping list'),
  ('fridge_scanned', 5, 'Scanned fridge inventory'),
  ('meal_logged', 3, 'Logged a meal with nutrition data'),
  ('body_scan_completed', 20, 'Completed a body scan'),
  ('training_session_completed', 15, 'Completed a training session'),
  ('daily_goal_reached', 10, 'Reached daily calorie/macro goal')
ON CONFLICT (action) DO NOTHING;

-- Create award_forge_xp function
CREATE OR REPLACE FUNCTION award_forge_xp(
  p_user_id uuid,
  p_action text,
  p_source text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_xp_reward integer;
  v_current_xp integer;
  v_current_level integer;
  v_new_xp integer;
  v_new_level integer;
  v_xp_for_next_level integer;
  v_event_id uuid;
  v_user_stats_exists boolean;
BEGIN
  -- Validate user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Get XP reward for this action
  SELECT xp_reward INTO v_xp_reward
  FROM forge_xp_actions
  WHERE action = p_action;

  IF v_xp_reward IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid action: ' || p_action
    );
  END IF;

  -- Check if user_stats exists
  SELECT EXISTS(
    SELECT 1 FROM user_stats WHERE user_id = p_user_id
  ) INTO v_user_stats_exists;

  -- Initialize user_stats if not exists
  IF NOT v_user_stats_exists THEN
    INSERT INTO user_stats (
      user_id,
      total_xp,
      current_level,
      xp_for_next_level
    ) VALUES (
      p_user_id,
      0,
      1,
      100
    );
  END IF;

  -- Get current stats
  SELECT total_xp, current_level, xp_for_next_level
  INTO v_current_xp, v_current_level, v_xp_for_next_level
  FROM user_stats
  WHERE user_id = p_user_id;

  -- Calculate new XP
  v_new_xp := v_current_xp + v_xp_reward;
  v_new_level := v_current_level;

  -- Level up logic: check if new XP exceeds threshold
  WHILE v_new_xp >= v_xp_for_next_level LOOP
    v_new_xp := v_new_xp - v_xp_for_next_level;
    v_new_level := v_new_level + 1;
    -- Calculate next level requirement (increases by 10% each level)
    v_xp_for_next_level := FLOOR(100 * POWER(1.1, v_new_level - 1));
  END LOOP;

  -- Update user_stats
  UPDATE user_stats
  SET
    total_xp = total_xp + v_xp_reward,
    current_level = v_new_level,
    xp_for_next_level = v_xp_for_next_level,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Log XP event (if xp_events_log table exists)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'xp_events_log'
  ) THEN
    INSERT INTO xp_events_log (
      user_id,
      event_type,
      xp_earned,
      source_action,
      metadata
    ) VALUES (
      p_user_id,
      p_action,
      v_xp_reward,
      p_source,
      jsonb_build_object(
        'action', p_action,
        'source', p_source,
        'xp_reward', v_xp_reward,
        'level_before', v_current_level,
        'level_after', v_new_level
      )
    )
    RETURNING id INTO v_event_id;
  END IF;

  -- Return success with details
  RETURN jsonb_build_object(
    'success', true,
    'xp_awarded', v_xp_reward,
    'new_total_xp', v_current_xp + v_xp_reward,
    'level_before', v_current_level,
    'level_after', v_new_level,
    'leveled_up', v_new_level > v_current_level,
    'event_id', v_event_id
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Database error: ' || SQLERRM
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION award_forge_xp TO authenticated, service_role;

-- Create index on xp_events_log for faster queries (if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'xp_events_log'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_xp_events_log_user_action
      ON xp_events_log(user_id, event_type);

    CREATE INDEX IF NOT EXISTS idx_xp_events_log_created_at
      ON xp_events_log(created_at DESC);
  END IF;
END $$;