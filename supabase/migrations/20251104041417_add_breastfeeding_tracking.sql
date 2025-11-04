/*
  # Breastfeeding Tracking System - Complete Integration

  ## Summary
  This migration adds comprehensive breastfeeding tracking capabilities to TwinForge,
  allowing mothers to track their breastfeeding status and receive personalized
  recommendations across all forges (nutrition, activity, fasting, recipes).

  ## 1. New Table Created

  ### `breastfeeding_tracking`
  Stores breastfeeding status and details for each user
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `is_breastfeeding` (boolean) - Whether user is currently breastfeeding
  - `breastfeeding_type` (text, nullable) - Type: 'exclusive', 'mixed', 'weaning'
  - `baby_age_months` (integer, nullable) - Age of baby in months (0-36)
  - `start_date` (date, nullable) - When breastfeeding started
  - `notes` (text, nullable) - Free-form notes
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ## 2. Security (RLS)

  All tables have strict Row Level Security:
  - SELECT: Users can only view their own data
  - INSERT: Users can only insert their own data
  - UPDATE: Users can only update their own data
  - DELETE: Users can only delete their own data

  ## 3. Indexes

  Performance indexes on:
  - `breastfeeding_tracking.user_id` for fast user lookup
  - `breastfeeding_tracking.is_breastfeeding` for filtering active breastfeeding users

  ## Important Notes

  - All breastfeeding data is highly sensitive and encrypted at rest
  - System supports smooth transitions and status changes
  - Integrates seamlessly with existing reproductive health tracking
  - Baby age helps personalize nutritional recommendations (needs vary by age)
  - Breastfeeding type affects caloric needs: exclusive (+500kcal/day), mixed (+300-400kcal/day)
*/

-- 1. Create breastfeeding_tracking table
CREATE TABLE IF NOT EXISTS breastfeeding_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_breastfeeding boolean NOT NULL DEFAULT false,
  breastfeeding_type text,
  baby_age_months integer,
  start_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_breastfeeding_type CHECK (
    breastfeeding_type IS NULL OR breastfeeding_type IN ('exclusive', 'mixed', 'weaning')
  ),
  CONSTRAINT valid_baby_age CHECK (
    baby_age_months IS NULL OR (baby_age_months >= 0 AND baby_age_months <= 36)
  ),

  -- One record per user
  UNIQUE(user_id)
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_breastfeeding_user_id
  ON breastfeeding_tracking(user_id);

CREATE INDEX IF NOT EXISTS idx_breastfeeding_is_active
  ON breastfeeding_tracking(is_breastfeeding)
  WHERE is_breastfeeding = true;

-- 3. Enable Row Level Security
ALTER TABLE breastfeeding_tracking ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies

-- SELECT: Users can view their own breastfeeding data
CREATE POLICY "Users can view own breastfeeding data"
  ON breastfeeding_tracking
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: Users can insert their own breastfeeding data
CREATE POLICY "Users can insert own breastfeeding data"
  ON breastfeeding_tracking
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own breastfeeding data
CREATE POLICY "Users can update own breastfeeding data"
  ON breastfeeding_tracking
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own breastfeeding data
CREATE POLICY "Users can delete own breastfeeding data"
  ON breastfeeding_tracking
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_breastfeeding_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_breastfeeding_tracking_updated_at ON breastfeeding_tracking;
CREATE TRIGGER trigger_update_breastfeeding_tracking_updated_at
  BEFORE UPDATE ON breastfeeding_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_breastfeeding_tracking_updated_at();

-- 7. Add helpful comment
COMMENT ON TABLE breastfeeding_tracking IS 'Tracks breastfeeding status for personalized nutrition, activity, and fasting recommendations across all TwinForge forges';
COMMENT ON COLUMN breastfeeding_tracking.breastfeeding_type IS 'exclusive: breastfeeding only, mixed: breastfeeding + formula/solids, weaning: transitioning to solids';
COMMENT ON COLUMN breastfeeding_tracking.baby_age_months IS 'Baby age in months (0-36) - helps personalize nutritional recommendations as needs change over time';
