/*
  # Correction Finale du Schéma Shopping Lists - Unification des colonnes de prix

  ## Problème
  La table `shopping_list_items` avait deux migrations contradictoires:
  - Migration initiale: utilisait `estimated_price` (numeric)
  - Migration de correction: utilisait `estimated_price_cents` (integer)

  Cela causait l'erreur PGRST204 lors de l'insertion des items.

  ## Solution
  1. Supprimer la colonne `estimated_price` (numeric) si elle existe
  2. Confirmer que `estimated_price_cents` (integer) existe et est la seule colonne de prix
  3. Corriger aussi la table `shopping_lists` pour utiliser `total_estimated_cost_cents` (integer)
  4. Ajouter une colonne `completed_items` pour suivre la progression des courses

  ## Structure Finale
  - shopping_lists.total_estimated_cost_cents (integer) - Prix total en centimes
  - shopping_list_items.estimated_price_cents (integer) - Prix unitaire en centimes

  ## Note
  Les prix sont stockés en centimes pour éviter les erreurs d'arrondi.
  L'affichage se fera en euros sans centimes (70 € au lieu de 70,00 €).
*/

-- Étape 1: Supprimer l'ancienne colonne estimated_price si elle existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'shopping_list_items'
    AND column_name = 'estimated_price'
  ) THEN
    ALTER TABLE shopping_list_items DROP COLUMN estimated_price;
  END IF;
END $$;

-- Étape 2: S'assurer que estimated_price_cents existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'shopping_list_items'
    AND column_name = 'estimated_price_cents'
  ) THEN
    ALTER TABLE shopping_list_items ADD COLUMN estimated_price_cents integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Étape 3: Corriger la table shopping_lists pour utiliser total_estimated_cost_cents
DO $$
BEGIN
  -- Supprimer l'ancienne colonne total_estimated_cost (numeric) si elle existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'shopping_lists'
    AND column_name = 'total_estimated_cost'
  ) THEN
    ALTER TABLE shopping_lists DROP COLUMN total_estimated_cost;
  END IF;

  -- Ajouter la nouvelle colonne total_estimated_cost_cents (integer) si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'shopping_lists'
    AND column_name = 'total_estimated_cost_cents'
  ) THEN
    ALTER TABLE shopping_lists ADD COLUMN total_estimated_cost_cents integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Étape 4: Ajouter completed_items pour suivre la progression
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'shopping_lists'
    AND column_name = 'completed_items'
  ) THEN
    ALTER TABLE shopping_lists ADD COLUMN completed_items integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Étape 5: Créer un index sur is_checked pour les requêtes de progression
CREATE INDEX IF NOT EXISTS shopping_list_items_list_id_checked_idx
  ON shopping_list_items(shopping_list_id, is_checked);

-- Étape 6: Ajouter un trigger pour mettre à jour completed_items automatiquement
CREATE OR REPLACE FUNCTION update_shopping_list_completed_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculer le nombre d'items cochés pour cette liste
  UPDATE shopping_lists
  SET completed_items = (
    SELECT COUNT(*) FROM shopping_list_items
    WHERE shopping_list_id = NEW.shopping_list_id
    AND is_checked = true
  )
  WHERE id = NEW.shopping_list_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur les updates de shopping_list_items
DROP TRIGGER IF EXISTS update_completed_count_trigger ON shopping_list_items;
CREATE TRIGGER update_completed_count_trigger
  AFTER INSERT OR UPDATE OF is_checked ON shopping_list_items
  FOR EACH ROW
  EXECUTE FUNCTION update_shopping_list_completed_count();
