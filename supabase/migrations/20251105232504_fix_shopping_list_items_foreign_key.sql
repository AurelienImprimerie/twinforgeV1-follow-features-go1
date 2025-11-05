/*
  # Fix Shopping List Items Foreign Key Constraint
  
  ## Problem
  The `shopping_list_items` table has a foreign key constraint pointing to the wrong table:
  - Current: `shopping_lists_old_backup` (backup table)
  - Expected: `shopping_lists` (main table)
  
  ## Changes
  1. Drop the incorrect foreign key constraint
  2. Add the correct foreign key constraint pointing to `shopping_lists`
  3. Ensure referential integrity with CASCADE on delete
  
  ## Important Notes
  - This migration is safe as it only corrects a mispointed reference
  - Data integrity is maintained throughout the operation
  - The constraint will properly cascade deletions from parent to child records
*/

-- Step 1: Drop the incorrect foreign key constraint
ALTER TABLE shopping_list_items 
  DROP CONSTRAINT IF EXISTS shopping_list_items_shopping_list_id_fkey;

-- Step 2: Add the correct foreign key constraint pointing to shopping_lists
ALTER TABLE shopping_list_items
  ADD CONSTRAINT shopping_list_items_shopping_list_id_fkey 
  FOREIGN KEY (shopping_list_id) 
  REFERENCES shopping_lists(id) 
  ON DELETE CASCADE;

-- Step 3: Verify the constraint is correct
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'shopping_list_items'
      AND ccu.table_name = 'shopping_lists'
      AND ccu.column_name = 'id'
  ) THEN
    RAISE EXCEPTION 'Foreign key constraint was not created correctly';
  END IF;
END $$;
