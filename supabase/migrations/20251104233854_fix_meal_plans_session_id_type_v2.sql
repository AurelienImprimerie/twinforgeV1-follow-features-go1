/*
  # Fix meal_plans session_id Column Type
  
  ## Description
  Corrects the data type of session_id column from UUID to TEXT to support nanoid identifiers
  used by the meal plan generation pipeline. This fixes the error:
  "invalid input syntax for type uuid: 'MB86KZ0bcjYNjs72LacWP'"
  
  ## Changes
  1. **Drop Foreign Key First**
     - Removes foreign key constraint before type conversion
  
  2. **Column Type Modification**
     - Changes `session_id` from UUID to TEXT in meal_plans table
     - Maintains nullable constraint (session_id is optional)
  
  3. **Recreate Foreign Key**
     - Re-establishes foreign key relationship with meal_plan_generation_sessions
  
  ## Impact
  - Allows both nanoid strings and UUID strings to be stored in session_id
  - Maintains backward compatibility with existing data
  - Fixes the generation pipeline save functionality
*/

-- Step 1: Drop existing foreign key constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'meal_plans_session_id_fkey'
    AND table_name = 'meal_plans'
  ) THEN
    ALTER TABLE meal_plans DROP CONSTRAINT meal_plans_session_id_fkey;
    RAISE NOTICE 'Dropped existing foreign key constraint meal_plans_session_id_fkey';
  END IF;
END $$;

-- Step 2: Convert session_id column type from UUID to TEXT
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'meal_plans' 
    AND column_name = 'session_id'
  ) THEN
    ALTER TABLE meal_plans 
    ALTER COLUMN session_id TYPE text 
    USING CASE 
      WHEN session_id IS NULL THEN NULL 
      ELSE session_id::text 
    END;
    
    RAISE NOTICE 'Successfully converted meal_plans.session_id from UUID to TEXT';
  ELSE
    RAISE NOTICE 'Column meal_plans.session_id does not exist';
  END IF;
END $$;

-- Step 3: Recreate foreign key constraint with TEXT type
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'meal_plans' 
    AND column_name = 'session_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'meal_plan_generation_sessions'
  ) THEN
    ALTER TABLE meal_plans 
    ADD CONSTRAINT meal_plans_session_id_fkey 
    FOREIGN KEY (session_id) 
    REFERENCES meal_plan_generation_sessions(id) 
    ON DELETE SET NULL;
    
    RAISE NOTICE 'Created foreign key constraint meal_plans_session_id_fkey with TEXT type';
  END IF;
END $$;

-- Step 4: Create index on session_id for better query performance
CREATE INDEX IF NOT EXISTS idx_meal_plans_session_id ON meal_plans(session_id) WHERE session_id IS NOT NULL;