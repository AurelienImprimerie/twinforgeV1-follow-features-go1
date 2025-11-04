/*
  # Menstrual Cycle Tracking System - Complete Integration

  ## Summary
  This migration adds comprehensive menstrual cycle tracking capabilities to TwinForge,
  allowing women to track their cycles and receive personalized recommendations across
  all forges (nutrition, activity, fasting, recipes).

  ## 1. New Tables Created

  ### `menstrual_cycles`
  Stores core menstrual cycle data for each user
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `cycle_start_date` (date) - Date of cycle start (first day of period)
  - `cycle_end_date` (date, nullable) - Date of cycle end
  - `cycle_length` (integer, nullable) - Total cycle duration in days (21-45)
  - `period_duration` (integer, nullable) - Period duration in days (2-10)
  - `flow_intensity` (text, nullable) - Flow intensity: 'light', 'moderate', 'heavy'
  - `cycle_regularity` (text) - Cycle regularity: 'regular', 'irregular', 'very_irregular'
  - `notes` (text, nullable) - Free-form notes
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### `menstrual_symptoms_tracking`
  Daily symptom tracking for detailed monitoring
  - `id` (uuid, primary key) - Unique identifier
  - `cycle_id` (uuid, foreign key, nullable) - Reference to cycle
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `symptom_date` (date) - Date of symptom occurrence
  - `symptom_type` (text) - Type of symptom (cramps, headache, bloating, mood_swings, etc.)
  - `intensity` (integer) - Intensity 1-10
  - `notes` (text, nullable) - Additional notes
  - `created_at` (timestamptz) - Record creation timestamp

  ## 2. Security (RLS)

  All tables have strict Row Level Security:
  - SELECT: Users can only view their own data
  - INSERT: Users can only insert their own data
  - UPDATE: Users can only update their own data
  - DELETE: Users can only delete their own data

  ## 3. Indexes

  Performance indexes on:
  - `menstrual_cycles.user_id` for fast user lookup
  - `menstrual_cycles.cycle_start_date` for chronological queries
  - `menstrual_symptoms_tracking.user_id, symptom_date` for efficient symptom queries

  ## Important Notes

  - All menstrual data is highly sensitive and encrypted at rest
  - System supports smooth transitions between all reproductive stages
  - Integrates with existing menopause and breastfeeding tracking
  - Used by 5 edge functions: meal-plan-generator, recipe-detail-generator,
    activity-progress-generator, fasting-insights-generator, nutrition-trend-analysis
*/

-- 1. Create menstrual_cycles table
CREATE TABLE IF NOT EXISTS menstrual_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_start_date date NOT NULL,
  cycle_end_date date,
  cycle_length integer,
  period_duration integer,
  flow_intensity text,
  cycle_regularity text NOT NULL DEFAULT 'regular',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_cycle_length CHECK (cycle_length IS NULL OR (cycle_length >= 21 AND cycle_length <= 45)),
  CONSTRAINT valid_period_duration CHECK (period_duration IS NULL OR (period_duration >= 2 AND period_duration <= 10)),
  CONSTRAINT valid_flow_intensity CHECK (
    flow_intensity IS NULL OR flow_intensity IN ('light', 'moderate', 'heavy')
  ),
  CONSTRAINT valid_cycle_regularity CHECK (
    cycle_regularity IN ('regular', 'irregular', 'very_irregular')
  ),
  CONSTRAINT valid_cycle_dates CHECK (
    cycle_end_date IS NULL OR cycle_end_date > cycle_start_date
  ),

  -- Unique constraint: one cycle per user per start date
  UNIQUE(user_id, cycle_start_date)
);

-- 2. Create menstrual_symptoms_tracking table
CREATE TABLE IF NOT EXISTS menstrual_symptoms_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id uuid REFERENCES menstrual_cycles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptom_date date NOT NULL DEFAULT CURRENT_DATE,
  symptom_type text NOT NULL,
  intensity integer NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_intensity CHECK (intensity >= 1 AND intensity <= 10),
  CONSTRAINT valid_symptom_type CHECK (
    symptom_type IN (
      'cramps', 'headache', 'bloating', 'mood_swings', 'fatigue',
      'breast_tenderness', 'acne', 'nausea', 'back_pain', 'food_cravings',
      'irritability', 'anxiety', 'depression', 'insomnia', 'diarrhea',
      'constipation', 'hot_flashes', 'other'
    )
  ),

  -- One symptom type per user per date
  UNIQUE(user_id, symptom_date, symptom_type)
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_menstrual_cycles_user_id
  ON menstrual_cycles(user_id);

CREATE INDEX IF NOT EXISTS idx_menstrual_cycles_user_start_date
  ON menstrual_cycles(user_id, cycle_start_date DESC);

CREATE INDEX IF NOT EXISTS idx_menstrual_symptoms_user_date
  ON menstrual_symptoms_tracking(user_id, symptom_date DESC);

CREATE INDEX IF NOT EXISTS idx_menstrual_symptoms_cycle_id
  ON menstrual_symptoms_tracking(cycle_id);

-- 4. Enable Row Level Security
ALTER TABLE menstrual_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menstrual_symptoms_tracking ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for menstrual_cycles

-- SELECT: Users can view their own cycles
CREATE POLICY "Users can view own menstrual cycles"
  ON menstrual_cycles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: Users can insert their own cycles
CREATE POLICY "Users can insert own menstrual cycles"
  ON menstrual_cycles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own cycles
CREATE POLICY "Users can update own menstrual cycles"
  ON menstrual_cycles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own cycles
CREATE POLICY "Users can delete own menstrual cycles"
  ON menstrual_cycles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. Create RLS Policies for menstrual_symptoms_tracking

-- SELECT: Users can view their own symptoms
CREATE POLICY "Users can view own menstrual symptoms"
  ON menstrual_symptoms_tracking
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: Users can log their own symptoms
CREATE POLICY "Users can insert own menstrual symptoms"
  ON menstrual_symptoms_tracking
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own symptoms
CREATE POLICY "Users can update own menstrual symptoms"
  ON menstrual_symptoms_tracking
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own symptoms
CREATE POLICY "Users can delete own menstrual symptoms"
  ON menstrual_symptoms_tracking
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 7. Create updated_at trigger for menstrual_cycles
CREATE OR REPLACE FUNCTION update_menstrual_cycles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_menstrual_cycles_updated_at'
  ) THEN
    CREATE TRIGGER set_menstrual_cycles_updated_at
      BEFORE UPDATE ON menstrual_cycles
      FOR EACH ROW
      EXECUTE FUNCTION update_menstrual_cycles_updated_at();
  END IF;
END $$;

-- 8. Add helpful comments
COMMENT ON TABLE menstrual_cycles IS 'Tracks menstrual cycles for personalized nutrition, activity, and fasting recommendations across all TwinForge forges';
COMMENT ON TABLE menstrual_symptoms_tracking IS 'Tracks daily menstrual symptoms for detailed cycle monitoring and pattern analysis';
COMMENT ON COLUMN menstrual_cycles.cycle_regularity IS 'regular: predictable cycles, irregular: varies ±3 days, very_irregular: highly unpredictable';
COMMENT ON COLUMN menstrual_cycles.flow_intensity IS 'light: light flow, moderate: normal flow, heavy: heavy flow requiring frequent changes';
COMMENT ON COLUMN menstrual_symptoms_tracking.intensity IS 'Symptom intensity scale from 1 (minimal) to 10 (severe/debilitating)';
