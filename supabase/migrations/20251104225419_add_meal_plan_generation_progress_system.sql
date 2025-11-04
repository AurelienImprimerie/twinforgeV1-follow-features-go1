/*
  # Système de Sauvegarde de Progression pour Génération de Plans Alimentaires

  ## Description
  Ce système permet de sauvegarder la progression de génération des plans alimentaires
  pour permettre aux utilisateurs de reprendre là où ils se sont arrêtés, même après
  une déconnexion ou fermeture de l'application.

  ## Nouvelles Tables

  ### `meal_plan_generation_sessions`
  Table principale pour gérer les sessions de génération de plans alimentaires.
  - `id` (text, primary key) - ID unique de session (nanoid)
  - `user_id` (uuid, foreign key) - Référence à auth.users
  - `config` (jsonb) - Configuration de génération (inventaire, nombre de semaines, batch cooking)
  - `current_step` (text) - Étape actuelle ('validation' ou 'recipe_details_validation')
  - `is_completed` (boolean) - Indique si la session est terminée
  - `created_at` (timestamptz) - Date de création
  - `updated_at` (timestamptz) - Date de dernière mise à jour

  ### `meal_plan_generation_progress`
  Table pour sauvegarder la progression à l'étape de validation (step 3).
  - `id` (uuid, primary key) - ID unique
  - `session_id` (text, foreign key) - Référence à meal_plan_generation_sessions
  - `meal_plans` (jsonb) - Plans alimentaires générés
  - `created_at` (timestamptz) - Date de création
  - `updated_at` (timestamptz) - Date de dernière mise à jour

  ### `meal_plan_recipes_progress`
  Table pour sauvegarder la progression à l'étape de génération des recettes détaillées (step 5).
  - `id` (uuid, primary key) - ID unique
  - `session_id` (text, foreign key) - Référence à meal_plan_generation_sessions
  - `recipes` (jsonb) - Recettes détaillées générées
  - `created_at` (timestamptz) - Date de création
  - `updated_at` (timestamptz) - Date de dernière mise à jour

  ## Sécurité
  - RLS activé sur toutes les tables
  - Policies restrictives : les utilisateurs ne peuvent accéder qu'à leurs propres données
  - Cleanup automatique des anciennes sessions (>30 jours)

  ## Contraintes
  - Une seule session active par utilisateur (contrainte unique sur user_id + is_completed=false)
  - Cascade delete : suppression des progressions liées quand la session est supprimée
*/

-- Drop existing objects if they exist to allow clean recreation
DROP TABLE IF EXISTS meal_plan_recipes_progress CASCADE;
DROP TABLE IF EXISTS meal_plan_generation_progress CASCADE;
DROP TABLE IF EXISTS meal_plan_generation_sessions CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_meal_plan_sessions() CASCADE;

-- Create meal_plan_generation_sessions table
CREATE TABLE meal_plan_generation_sessions (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  config jsonb NOT NULL DEFAULT '{}',
  current_step text NOT NULL DEFAULT 'validation',
  is_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create unique index to ensure only one active session per user
CREATE UNIQUE INDEX meal_plan_generation_sessions_user_active_idx 
  ON meal_plan_generation_sessions(user_id) 
  WHERE is_completed = false;

-- Create index for faster queries
CREATE INDEX meal_plan_generation_sessions_user_id_idx 
  ON meal_plan_generation_sessions(user_id);

-- Enable RLS
ALTER TABLE meal_plan_generation_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meal_plan_generation_sessions
CREATE POLICY "Users can view own sessions"
  ON meal_plan_generation_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON meal_plan_generation_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON meal_plan_generation_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON meal_plan_generation_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create meal_plan_generation_progress table
CREATE TABLE meal_plan_generation_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL REFERENCES meal_plan_generation_sessions(id) ON DELETE CASCADE,
  meal_plans jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create unique index to ensure one progress per session
CREATE UNIQUE INDEX meal_plan_generation_progress_session_id_idx 
  ON meal_plan_generation_progress(session_id);

-- Enable RLS
ALTER TABLE meal_plan_generation_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meal_plan_generation_progress
CREATE POLICY "Users can view own progress"
  ON meal_plan_generation_progress
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meal_plan_generation_sessions
      WHERE meal_plan_generation_sessions.id = meal_plan_generation_progress.session_id
      AND meal_plan_generation_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own progress"
  ON meal_plan_generation_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meal_plan_generation_sessions
      WHERE meal_plan_generation_sessions.id = meal_plan_generation_progress.session_id
      AND meal_plan_generation_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own progress"
  ON meal_plan_generation_progress
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meal_plan_generation_sessions
      WHERE meal_plan_generation_sessions.id = meal_plan_generation_progress.session_id
      AND meal_plan_generation_sessions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meal_plan_generation_sessions
      WHERE meal_plan_generation_sessions.id = meal_plan_generation_progress.session_id
      AND meal_plan_generation_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own progress"
  ON meal_plan_generation_progress
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meal_plan_generation_sessions
      WHERE meal_plan_generation_sessions.id = meal_plan_generation_progress.session_id
      AND meal_plan_generation_sessions.user_id = auth.uid()
    )
  );

-- Create meal_plan_recipes_progress table
CREATE TABLE meal_plan_recipes_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL REFERENCES meal_plan_generation_sessions(id) ON DELETE CASCADE,
  recipes jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create unique index to ensure one recipes progress per session
CREATE UNIQUE INDEX meal_plan_recipes_progress_session_id_idx 
  ON meal_plan_recipes_progress(session_id);

-- Enable RLS
ALTER TABLE meal_plan_recipes_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meal_plan_recipes_progress
CREATE POLICY "Users can view own recipes progress"
  ON meal_plan_recipes_progress
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meal_plan_generation_sessions
      WHERE meal_plan_generation_sessions.id = meal_plan_recipes_progress.session_id
      AND meal_plan_generation_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own recipes progress"
  ON meal_plan_recipes_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meal_plan_generation_sessions
      WHERE meal_plan_generation_sessions.id = meal_plan_recipes_progress.session_id
      AND meal_plan_generation_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own recipes progress"
  ON meal_plan_recipes_progress
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meal_plan_generation_sessions
      WHERE meal_plan_generation_sessions.id = meal_plan_recipes_progress.session_id
      AND meal_plan_generation_sessions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meal_plan_generation_sessions
      WHERE meal_plan_generation_sessions.id = meal_plan_recipes_progress.session_id
      AND meal_plan_generation_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own recipes progress"
  ON meal_plan_recipes_progress
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meal_plan_generation_sessions
      WHERE meal_plan_generation_sessions.id = meal_plan_recipes_progress.session_id
      AND meal_plan_generation_sessions.user_id = auth.uid()
    )
  );

-- Function to cleanup old completed sessions (>30 days)
CREATE OR REPLACE FUNCTION cleanup_old_meal_plan_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM meal_plan_generation_sessions
  WHERE is_completed = true
  AND updated_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
