/*
  # Fix Forge Culinary XP Values and Action Names

  ## Overview
  This migration corrects the XP values for Forge Culinaire actions to match
  the values defined in GamificationService and aligns action naming conventions.

  ## Problem Identified
  The `forge_xp_actions` table had incorrect XP values that didn't match the
  GamificationService constants, causing confusion and incorrect XP attribution:

  - recipe_generated: 10 XP (was) → 20 XP (should be)
  - meal_plan_created: 15 XP (was) → 35 XP (should be)
  - shopping_list_created: 5 XP (was) → 15 XP (should be)
  - fridge_scanned: 5 XP (was) → 30 XP (should be)

  ## Changes

  1. Update XP Values
     - Correct all Forge Culinaire XP values to match GamificationService
     - Ensures consistency between database and application code

  2. Standardize Action Names
     - Use consistent naming: *_generated for AI-generated content
     - Use consistent naming: *_scan for scanning actions
     - Add aliases in award_forge_xp function for backward compatibility

  3. Update award_forge_xp Function
     - Add support for multiple action name variations
     - Map old names to new canonical names
     - Maintain backward compatibility during transition

  ## Security
  - No RLS changes required
  - Maintains existing security policies
  - Function remains SECURITY DEFINER

  ## Notes
  - This aligns Forge Culinaire with the main gaming system
  - All future integrations should use GamificationService directly
  - The award_forge_xp function is kept for legacy compatibility only
*/

-- ============================================
-- Step 1: Update XP Values in forge_xp_actions
-- ============================================

-- Update existing Forge Culinaire actions with correct XP values
UPDATE forge_xp_actions
SET xp_reward = 20, description = 'Generated a recipe using AI (Forge Culinaire)'
WHERE action = 'recipe_generated';

UPDATE forge_xp_actions
SET xp_reward = 35, description = 'Created a weekly meal plan (Forge Culinaire)'
WHERE action = 'meal_plan_created';

UPDATE forge_xp_actions
SET xp_reward = 15, description = 'Generated a shopping list (Forge Culinaire)'
WHERE action = 'shopping_list_created';

UPDATE forge_xp_actions
SET xp_reward = 30, description = 'Scanned fridge inventory (Forge Culinaire)'
WHERE action = 'fridge_scanned';

-- ============================================
-- Step 2: Add Canonical Action Names (Aliases)
-- ============================================

-- Insert canonical names if they don't exist, or update if they do
INSERT INTO forge_xp_actions (action, xp_reward, description) VALUES
  ('fridge_scan', 30, 'Scanned fridge inventory (canonical name)'),
  ('meal_plan_generated', 35, 'Generated a weekly meal plan (canonical name)'),
  ('shopping_list_generated', 15, 'Generated a shopping list (canonical name)')
ON CONFLICT (action) DO UPDATE SET
  xp_reward = EXCLUDED.xp_reward,
  description = EXCLUDED.description;

-- ============================================
-- Step 3: Update award_forge_xp Function
-- Add support for action name aliases
-- ============================================

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
  v_canonical_action text;
  v_xp_reward integer;
  v_current_xp bigint;
  v_current_level integer;
  v_new_xp bigint;
  v_new_level integer;
  v_xp_to_next_level integer;
  v_event_id uuid;
  v_user_progress_exists boolean;
  v_event_category text;
BEGIN
  -- Validate user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Map action aliases to canonical names for consistency
  v_canonical_action := CASE
    -- Fridge Scan aliases
    WHEN p_action IN ('fridge_scan', 'fridge_scanned') THEN 'fridge_scan'

    -- Recipe Generation aliases
    WHEN p_action IN ('recipe_generated', 'recipe_created') THEN 'recipe_generated'

    -- Meal Plan aliases
    WHEN p_action IN ('meal_plan_generated', 'meal_plan_created') THEN 'meal_plan_generated'

    -- Shopping List aliases
    WHEN p_action IN ('shopping_list_generated', 'shopping_list_created') THEN 'shopping_list_generated'

    -- Default: use as-is
    ELSE p_action
  END;

  -- Get XP reward for canonical action
  SELECT xp_reward INTO v_xp_reward
  FROM forge_xp_actions
  WHERE action = v_canonical_action;

  -- Fallback: try with original action name if canonical not found
  IF v_xp_reward IS NULL THEN
    SELECT xp_reward INTO v_xp_reward
    FROM forge_xp_actions
    WHERE action = p_action;
  END IF;

  IF v_xp_reward IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid action: ' || p_action || ' (canonical: ' || v_canonical_action || ')'
    );
  END IF;

  -- Determine event category based on action
  v_event_category := CASE
    WHEN v_canonical_action IN ('recipe_generated', 'meal_plan_generated', 'shopping_list_generated', 'fridge_scan', 'meal_logged') THEN 'nutrition'
    WHEN v_canonical_action IN ('body_scan_completed') THEN 'body_scan'
    WHEN v_canonical_action IN ('training_session_completed') THEN 'training'
    WHEN v_canonical_action IN ('daily_goal_reached') THEN 'general'
    ELSE 'general'
  END;

  -- Check if user_gamification_progress exists
  SELECT EXISTS(
    SELECT 1 FROM user_gamification_progress WHERE user_id = p_user_id
  ) INTO v_user_progress_exists;

  -- Initialize user_gamification_progress if not exists
  IF NOT v_user_progress_exists THEN
    INSERT INTO user_gamification_progress (
      user_id,
      current_xp,
      current_level,
      xp_to_next_level,
      total_xp_earned
    ) VALUES (
      p_user_id,
      0,
      1,
      100,
      0
    );
  END IF;

  -- Get current stats
  SELECT current_xp, current_level, xp_to_next_level
  INTO v_current_xp, v_current_level, v_xp_to_next_level
  FROM user_gamification_progress
  WHERE user_id = p_user_id;

  -- Calculate new XP
  v_new_xp := v_current_xp + v_xp_reward;
  v_new_level := v_current_level;

  -- Level up logic: check if new XP exceeds threshold
  WHILE v_new_xp >= v_xp_to_next_level LOOP
    v_new_xp := v_new_xp - v_xp_to_next_level;
    v_new_level := v_new_level + 1;
    -- Calculate next level requirement (increases by 10% each level)
    v_xp_to_next_level := FLOOR(100 * POWER(1.1, v_new_level - 1));
  END LOOP;

  -- Update user_gamification_progress
  UPDATE user_gamification_progress
  SET
    current_xp = v_new_xp,
    total_xp_earned = total_xp_earned + v_xp_reward,
    current_level = v_new_level,
    xp_to_next_level = v_xp_to_next_level,
    last_activity_date = CURRENT_DATE,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Log XP event with canonical action name
  INSERT INTO xp_events_log (
    user_id,
    event_type,
    event_category,
    base_xp,
    multiplier,
    final_xp,
    event_date,
    event_metadata
  ) VALUES (
    p_user_id,
    v_canonical_action,  -- Use canonical name for consistency
    v_event_category,
    v_xp_reward,
    1.0,
    v_xp_reward,
    now(),
    jsonb_build_object(
      'action', v_canonical_action,
      'original_action', p_action,
      'source', p_source,
      'xp_reward', v_xp_reward,
      'level_before', v_current_level,
      'level_after', v_new_level
    )
  )
  RETURNING id INTO v_event_id;

  -- Return success with details
  RETURN jsonb_build_object(
    'success', true,
    'xp_awarded', v_xp_reward,
    'new_total_xp', v_current_xp + v_xp_reward,
    'level_before', v_current_level,
    'level_after', v_new_level,
    'leveled_up', v_new_level > v_current_level,
    'event_id', v_event_id,
    'canonical_action', v_canonical_action
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Database error: ' || SQLERRM
    );
END;
$$;

-- Grant execute permissions (should already exist, but ensure it's set)
GRANT EXECUTE ON FUNCTION award_forge_xp TO authenticated, service_role;

-- ============================================
-- Step 4: Add Comments for Documentation
-- ============================================

COMMENT ON FUNCTION award_forge_xp IS
'Awards XP for Forge actions with support for action name aliases.
Canonical names: fridge_scan, recipe_generated, meal_plan_generated, shopping_list_generated.
This function is kept for legacy compatibility - new code should use GamificationService directly.';

COMMENT ON TABLE forge_xp_actions IS
'Defines XP rewards for Forge actions. Values must match GamificationService constants.
Canonical action names should be used for consistency.';
