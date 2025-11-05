/*
  # Correction du schéma shopping_lists pour le système de génération

  ## Problème identifié
  La table shopping_lists existe avec l'ancienne structure (session_id, items).
  La nouvelle structure nécessite des colonnes pour stocker les métadonnées 
  de génération (name, meal_plan_id, generation_mode, budget_estimation, etc.)

  ## Actions
  1. Renommer l'ancienne table shopping_lists en shopping_lists_old_backup
  2. Créer la nouvelle table shopping_lists avec la bonne structure
  3. Créer la table shopping_list_items pour les articles
  4. Activer RLS et créer les policies
  5. Créer les indexes de performance
  6. Créer les triggers updated_at

  ## Structure finale
  - shopping_lists: métadonnées de la liste (name, mode, budget, suggestions, advice)
  - shopping_list_items: articles individuels avec catégories et prix
  
  ## Note importante
  - Les prix sont stockés en centimes (integer) pour éviter les erreurs d'arrondi
  - total_estimated_cost_cents: prix total en centimes
  - estimated_price_cents: prix unitaire en centimes
*/

-- Étape 1: Renommer l'ancienne table pour backup
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'shopping_lists') THEN
    ALTER TABLE shopping_lists RENAME TO shopping_lists_old_backup;
  END IF;
END $$;

-- Étape 2: Créer la nouvelle table shopping_lists
CREATE TABLE IF NOT EXISTS shopping_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Liste de Courses',
  meal_plan_id uuid,
  generation_mode text NOT NULL CHECK (generation_mode IN ('user_only', 'user_and_family')),
  total_items integer NOT NULL DEFAULT 0,
  total_estimated_cost_cents integer NOT NULL DEFAULT 0,
  budget_estimation jsonb,
  suggestions jsonb,
  advice jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Étape 3: Créer la table shopping_list_items
CREATE TABLE IF NOT EXISTS shopping_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id uuid NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  category_name text NOT NULL,
  category_icon text NOT NULL DEFAULT 'Package',
  category_color text NOT NULL DEFAULT '#fb923c',
  item_name text NOT NULL,
  quantity text NOT NULL DEFAULT '1',
  estimated_price_cents integer NOT NULL DEFAULT 0,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_checked boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Étape 4: Enable RLS
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;

-- Étape 5: Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Users can insert own shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Users can update own shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Users can delete own shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Users can view own shopping list items" ON shopping_list_items;
DROP POLICY IF EXISTS "Users can insert own shopping list items" ON shopping_list_items;
DROP POLICY IF EXISTS "Users can update own shopping list items" ON shopping_list_items;
DROP POLICY IF EXISTS "Users can delete own shopping list items" ON shopping_list_items;

-- Étape 6: Create policies for shopping_lists
CREATE POLICY "Users can view own shopping lists"
  ON shopping_lists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shopping lists"
  ON shopping_lists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shopping lists"
  ON shopping_lists FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own shopping lists"
  ON shopping_lists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Étape 7: Create policies for shopping_list_items
CREATE POLICY "Users can view own shopping list items"
  ON shopping_list_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = shopping_list_items.shopping_list_id
      AND shopping_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own shopping list items"
  ON shopping_list_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = shopping_list_items.shopping_list_id
      AND shopping_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own shopping list items"
  ON shopping_list_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = shopping_list_items.shopping_list_id
      AND shopping_lists.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = shopping_list_items.shopping_list_id
      AND shopping_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own shopping list items"
  ON shopping_list_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = shopping_list_items.shopping_list_id
      AND shopping_lists.user_id = auth.uid()
    )
  );

-- Étape 8: Create indexes
CREATE INDEX IF NOT EXISTS shopping_lists_user_id_idx ON shopping_lists(user_id);
CREATE INDEX IF NOT EXISTS shopping_lists_created_at_idx ON shopping_lists(created_at DESC);
CREATE INDEX IF NOT EXISTS shopping_list_items_shopping_list_id_idx ON shopping_list_items(shopping_list_id);
CREATE INDEX IF NOT EXISTS shopping_list_items_is_checked_idx ON shopping_list_items(is_checked);

-- Étape 9: Create trigger functions
CREATE OR REPLACE FUNCTION update_shopping_lists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_shopping_list_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Étape 10: Apply triggers
DROP TRIGGER IF EXISTS shopping_lists_updated_at_trigger ON shopping_lists;
CREATE TRIGGER shopping_lists_updated_at_trigger
  BEFORE UPDATE ON shopping_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_shopping_lists_updated_at();

DROP TRIGGER IF EXISTS shopping_list_items_updated_at_trigger ON shopping_list_items;
CREATE TRIGGER shopping_list_items_updated_at_trigger
  BEFORE UPDATE ON shopping_list_items
  FOR EACH ROW
  EXECUTE FUNCTION update_shopping_list_items_updated_at();
