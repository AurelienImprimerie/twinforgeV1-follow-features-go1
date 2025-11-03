# Documentation Détaillée : La Forge Énergétique (Suivi d'Activité)

**Version :** 1.0 • **Statut :** Fonctionnelle et prête pour production • **Dernière mise à jour :** Janvier 2025

La Forge Énergétique est le système de suivi d'activité physique de TwinForge, permettant aux utilisateurs d'enregistrer, analyser et optimiser leurs sessions d'entraînement grâce à une pipeline intelligente complète.

---

## 📋 Table des Matières

- [Vue d'Ensemble](#vue-densemble)
- [Architecture Technique](#architecture-technique)
- [Pipeline Utilisateur Détaillée](#pipeline-utilisateur-détaillée)
- [Onglets de la Forge Énergétique](#onglets-de-la-forge-énergétique)
- [Intégration avec le Profil Utilisateur](#intégration-avec-le-profil-utilisateur)
- [Données Générées par la Forge Spatiale](#données-générées-par-la-forge-spatiale)
- [Contrats TypeScript](#contrats-typescript)
- [Edge Functions Détaillées](#edge-functions-détaillées)
- [Optimisations et Performance](#optimisations-et-performance)
- [Coûts et Gouvernance](#coûts-et-gouvernance)
- [Observabilité et Debugging](#observabilité-et-debugging)
- [Intégration Future avec le Cerveau Central](#intégration-future-avec-le-cerveau-central)

---

## 🎯 Vue d'Ensemble

### Objectif
Permettre aux utilisateurs de capturer leurs activités physiques (via audio ou texte), les analyser automatiquement, et recevoir des conseils personnalisés pour optimiser leur progression énergétique.

### Valeur Ajoutée
- **Capture naturelle :** Enregistrement vocal ou saisie texte intuitive
- **Analyse intelligente :** Extraction automatique des activités, durées, intensités
- **Calculs précis :** Estimation des calories basée sur les tables MET et le profil utilisateur
- **Conseils personnalisés :** Recommandations adaptées aux objectifs et au niveau de l'utilisateur
- **Visualisations riches :** Graphiques, heatmaps, tendances pour suivre la progression

### Rôle dans l'Écosystème TwinForge
La Forge Énergétique génère des données structurées qui alimenteront le futur "Cerveau Central" pour des conseils holistiques combinant activité, nutrition, jeûne et morphologie.

---

## 🏗️ Architecture Technique

### Stack Technique
- **Frontend :** React 18 + TypeScript + Framer Motion
- **State Management :** Zustand + React Query
- **Backend :** Supabase Edge Functions (Deno)
- **Forge Spatiale :** OpenAI GPT-5 (Mini pour analyse, Nano pour nettoyage)
- **Audio :** Web Audio API + MediaRecorder
- **Base de données :** PostgreSQL avec RLS

### Flux de Données
```
Utilisateur (Audio/Texte)
    ↓
Frontend (Capture + Validation)
    ↓
Edge Function: activity-transcriber (Whisper + GPT-5 Nano)
    ↓
Edge Function: activity-analyzer (GPT-5 Mini + Tables MET)
    ↓
Base de données (Table activities)
    ↓
Edge Function: activity-progress-generator (GPT-5 Mini + Cache intelligent)
    ↓
Frontend (Visualisations + Conseils)
```

---

## 🔄 Pipeline Utilisateur Détaillée

### 1. Capture de Mouvement (`CaptureStage`)

**Objectif :** Collecter la description de l'activité physique de l'utilisateur.

**Modes d'entrée :**
- **Audio :** Enregistrement vocal avec MediaRecorder API
- **Texte :** Saisie manuelle dans un textarea

**Composants Frontend :**
- `src/app/pages/Activity/components/CaptureStage/index.tsx` (Orchestrateur)
- `src/app/pages/Activity/components/CaptureStage/InputModeSelector.tsx` (Sélecteur audio/texte)
- `src/app/pages/Activity/components/CaptureStage/AudioInputInterface.tsx` (Interface audio)
- `src/app/pages/Activity/components/CaptureStage/TextInputInterface.tsx` (Interface texte)

**Données Collectées :**
- **Audio :** `Blob` WebM/Opus converti en Base64
- **Texte :** String de description libre
- **Métadonnées :** `userId`, `clientTraceId`, timestamp

**Validations :**
- **Audio :** Durée minimum 5s, maximum 120s, format supporté
- **Texte :** Longueur minimum 10 caractères, maximum 2000 caractères

### 2. Analyse de Forge (`AnalysisStage`)

**Objectif :** Transformer la description utilisateur en données structurées d'activité.

**Composants Frontend :**
- `src/app/pages/Activity/components/AnalysisStage/index.tsx` (Orchestrateur)
- `src/app/pages/Activity/components/AnalysisStage/AnalysisContainer.tsx` (Interface immersive)
- `src/app/pages/Activity/components/AnalysisStage/AnalysisStatus.tsx` (Statut en temps réel)
- `src/app/pages/Activity/components/AnalysisStage/AnalysisInfo.tsx` (Informations sur le processus)

**Processus Backend :**

#### Phase 1 : Transcription (Mode Audio uniquement)
- **Edge Function :** `activity-transcriber`
- **Modèle :** Whisper-1 + GPT-5 Nano
- **Durée :** ~3-8 secondes
- **Sortie :** Texte nettoyé et traduit en français

#### Phase 2 : Analyse des Activités
- **Edge Function :** `activity-analyzer`
- **Modèle :** GPT-5 Mini
- **Durée :** ~5-15 secondes
- **Sortie :** Liste d'activités structurées avec calories calculées

### 3. Revue Énergétique (`ReviewStage`)

**Objectif :** Permettre à l'utilisateur de valider et ajuster les données avant sauvegarde.

**Composants Frontend :**
- `src/app/pages/Activity/components/ReviewStage/index.tsx` (Orchestrateur)
- `src/app/pages/Activity/components/ReviewStage/ActivitySummary.tsx` (Résumé global)
- `src/app/pages/Activity/components/ReviewStage/ActivityList.tsx` (Liste éditable)
- `src/app/pages/Activity/components/ReviewStage/AddActivityForm.tsx` (Ajout manuel)
- `src/app/pages/Activity/components/ReviewStage/ReviewActions.tsx` (Actions finales)

**Fonctionnalités :**
- **Édition :** Modification de la durée, intensité, type d'activité
- **Ajout :** Nouvelle activité manuelle avec calcul automatique des calories
- **Suppression :** Retrait d'activités non pertinentes
- **Validation :** Vérification des données avant sauvegarde

**Sauvegarde :**
- **Table :** `activities` avec RLS
- **Invalidation cache :** React Query pour mise à jour temps réel
- **Audit :** Logs détaillés de la sauvegarde

---

## 📊 Onglets de la Forge Énergétique

### 🌅 Aujourd'hui (`ActivityDailyTab`)

**Objectif :** Afficher le résumé des activités du jour et inciter à l'action.

**Composants Clés :**
- `DailyStatsGrid` : Métriques quotidiennes (calories, activités, durée)
- `CalorieProgressCard` : Progression vers l'objectif quotidien (adapté selon `profile.objective`)
- `ActivitySummaryCard` : Résumé des types d'activités et intensités
- `RecentActivitiesCard` : Liste des activités du jour avec possibilité de suppression
- `DynamicActivityCTA` : Call-to-action adaptatif selon l'état de progression
- `ProfileCompletenessAlert` : Alerte si le profil est incomplet pour le tracking

**Logique de Données :**
- **Source :** Table `activities` filtrée par `user_id` et date du jour
- **Calculs temps réel :** Agrégation des calories, durée, nombre d'activités
- **Objectifs dynamiques :** Basés sur `profile.objective`, `profile.activity_level`, `profile.weight_kg`

### 💡 Insights (`ActivityInsightsTab`)

**Objectif :** Présenter les conseils personnalisés générés par la Forge Spatiale.

**Composants Clés :**
- `ProgressionPeriodSelector` : Sélection de période d'analyse (7j, 30j, 90j)
- `InsightsSummaryCard` : Résumé narratif et motivant des données
- `InsightCard` : Cartes individuelles d'insights avec actions exploitables
- `NoInsightsMessage` : Message contextuel intelligent quand les insights sont absents

**Logique de Données :**
- **Source :** Edge Function `activity-progress-generator`
- **Cache intelligent :** Côté serveur avec invalidation basée sur nouvelles activités
- **Seuils adaptatifs :** 3 activités (7j), 8 activités (30j), 20 activités (90j)
- **Fallback gracieux :** Données basiques même en cas d'erreur Forge Spatiale

### 📈 Progression (`ActivityProgressTab`)

**Objectif :** Visualiser les tendances, distributions et patterns d'activité.

**Composants Clés :**
- `GlobalStatsCard` : Métriques globales de la période
- `ActivityDistributionChart` : Répartition des types d'activités et intensités
- `ActivityHeatmap` : Calendrier d'activité avec intensité visuelle
- `ActivityInsightCards` : Insights textuels avec priorités et actions

**Logique de Données :**
- **Source :** Même Edge Function que l'onglet Insights
- **Visualisations :** Basées sur `distribution`, `daily_trends`, `heatmap_data`
- **Calculs avancés :** Score de régularité, équilibre des intensités, patterns temporels

### 📚 Historique (`ActivityHistoryTab`)

**Objectif :** Consulter l'historique complet des activités avec détails.

**Composants Clés :**
- `ActivityDetailModal` : Modal de détail avec possibilité de suppression
- Groupement par jour avec totaux quotidiens
- Interface de suppression avec confirmation

**Logique de Données :**
- **Source :** Table `activities` avec pagination
- **Groupement :** Par date avec calculs de totaux quotidiens
- **Actions :** Consultation détaillée, suppression avec invalidation cache

---

## 👤 Intégration avec le Profil Utilisateur

### Champs du Profil Utilisés

**Champs Critiques (Requis pour le fonctionnement) :**
- `weight_kg` : Calcul des calories via tables MET
- `sex` : Ajustement des estimations métaboliques
- `height_cm` : Calculs de BMR et ajustements

**Champs Optimisants (Améliorent la précision) :**
- `birthdate` : Calcul de l'âge pour ajustements métaboliques
- `activity_level` : Personnalisation des objectifs et seuils
- `objective` : Adaptation des conseils (`fat_loss`, `muscle_gain`, `recomp`)
- `job_category` : Contexte pour les recommandations d'activité

### Impact sur le Profil

**Mise à jour automatique :**
- `activity_level` peut être ajusté selon la régularité détectée
- Suggestions d'objectifs basées sur les patterns observés

**Synchronisation bidirectionnelle :**
- Changements de profil → Recalcul des objectifs et conseils
- Données d'activité → Suggestions d'amélioration du profil

---

## 🤖 Données Générées par la Forge Spatiale

### Données Brutes Structurées

**De `activity-transcriber` :**
```typescript
{
  cleanText: string;              // Texte nettoyé et traduit
  originalTranscription: string;  // Transcription brute Whisper
  confidence: number;             // Confiance de la transcription (0-1)
  processingTime: number;         // Temps de traitement (ms)
  costUsd: number;               // Coût OpenAI
}
```

**De `activity-analyzer` :**
```typescript
{
  activities: Array<{
    type: string;                 // Type d'activité (course, musculation, etc.)
    duration_min: number;         // Durée en minutes
    intensity: 'low'|'medium'|'high'|'very_high';
    calories_est: number;         // Calories estimées via MET
    met_value: number;           // Valeur MET utilisée
    notes?: string;              // Notes optionnelles
  }>;
  totalCalories: number;          // Total des calories de la session
  totalDuration: number;          // Durée totale de la session
  forgeInsights: string[];        // Conseils immédiats post-activité
  confidence: number;             // Confiance de l'analyse
  costUsd: number;               // Coût OpenAI
}
```

### Données d'Analyse Avancée

**De `activity-progress-generator` :**
```typescript
{
  insights: Array<{
    type: 'pattern'|'trend'|'recommendation'|'achievement';
    title: string;                // Titre de l'insight
    content: string;              // Description détaillée
    priority: 'low'|'medium'|'high';
    confidence: number;           // Confiance (0-1)
    icon: string;                // Icône suggérée
    color: string;               // Couleur hex
    actionable: boolean;         // Si l'insight a une action
    action?: string;             // Action recommandée
  }>;
  
  distribution: {
    activity_types: Array<{
      name: string;               // Nom du type d'activité
      percentage: number;         // Pourcentage du total
      total_minutes: number;      // Minutes totales
      total_calories: number;     // Calories totales
      color: string;             // Couleur pour graphiques
    }>;
    intensity_levels: Array<{
      level: string;              // Niveau d'intensité
      percentage: number;         // Pourcentage du total
      sessions_count: number;     // Nombre de sessions
      color: string;             // Couleur pour graphiques
    }>;
    time_patterns: Array<{
      period: string;             // Période (Matin, Après-midi, Soir)
      activity_count: number;     // Nombre d'activités
      avg_calories: number;       // Calories moyennes
      color: string;             // Couleur pour graphiques
    }>;
  };
  
  daily_trends: Array<{
    date: string;                 // Date ISO
    total_calories: number;       // Calories du jour
    total_duration: number;       // Durée du jour
    activities_count: number;     // Nombre d'activités
    avg_intensity: number;        // Intensité moyenne (0-4)
    dominant_type: string;        // Type d'activité principal
  }>;
  
  heatmap_data: {
    weeks: Array<Array<{
      date: string;               // Date ISO
      dayName: string;           // Nom du jour
      dayNumber: number;         // Numéro du jour
      monthName: string;         // Nom du mois
      status: 'none'|'low'|'medium'|'high'|'excellent';
      intensity: number;          // Intensité relative (0-1)
      calories: number;          // Calories du jour
      activitiesCount: number;   // Nombre d'activités
      duration: number;          // Durée totale
    }>>;
    stats: {
      excellentDays: number;      // Jours avec statut "excellent"
      activityRate: number;      // Pourcentage de jours actifs
      excellenceRate: number;    // Pourcentage de jours excellents
      avgCaloriesPerDay: number; // Calories moyennes par jour
      avgDurationPerDay: number; // Durée moyenne par jour
    };
  };
  
  summary: {
    total_activities: number;     // Total des activités
    total_calories: number;       // Total des calories
    total_duration: number;       // Durée totale
    avg_daily_calories: number;   // Calories moyennes par jour
    most_frequent_type: string;   // Type d'activité le plus fréquent
    avg_intensity: string;        // Intensité moyenne
    consistency_score: number;    // Score de régularité (0-100)
  };
  
  // Métadonnées
  activities: Activity[];         // Activités brutes utilisées
  current_activities: number;     // Nombre d'activités sur la période
  required_activities: number;    // Seuil minimum pour l'analyse
  processingTime: number;         // Temps de traitement
  costUsd: number;               // Coût OpenAI
  confidence: number;            // Confiance globale
  cached: boolean;               // Si les données viennent du cache
  generated_at: string;          // Timestamp de génération
}
```

---

## 📱 Onglets de la Forge Énergétique

### 🌅 Onglet "Aujourd'hui"

**Fichier :** `src/app/pages/Activity/ActivityDailyTab.tsx`

**Fonctionnalités :**
- **Alerte de complétude du profil** : Vérifie si les champs critiques sont remplis
- **CTA dynamique** : Bouton d'action adapté selon l'état de progression quotidienne
- **Grille de statistiques** : Calories, activités, durée, dernière activité
- **Carte de progression** : Avancement vers l'objectif quotidien (adapté selon `objective`)
- **Résumé d'activité** : Types dominants, intensité moyenne
- **Activités récentes** : Liste du jour avec suppression possible

**Hooks Utilisés :**
- `useTodayActivities()` : Activités du jour
- `useTodayActivityStats()` : Statistiques calculées
- `useDeleteActivity()` : Suppression d'activité

**Logique de Progression :**
```typescript
// Objectifs adaptatifs selon le profil
switch (profile.objective) {
  case 'fat_loss': 
    // Focus sur calories brûlées + cardio
    targetCalories = baseTarget + 100;
    break;
  case 'muscle_gain': 
    // Focus sur minutes de musculation
    targetStrengthMinutes = getTargetStrengthMinutes(activity_level);
    break;
  case 'recomp': 
    // Score combiné calories (60%) + force (40%)
    combinedScore = (calorieScore * 0.6) + (strengthScore * 0.4);
    break;
}
```

### 💡 Onglet "Insights"

**Fichier :** `src/app/pages/Activity/ActivityInsightsTab.tsx`

**Fonctionnalités :**
- **Sélecteur de période** : 7j, 30j, 90j avec seuils adaptatifs
- **Résumé narratif** : Message motivant basé sur les performances
- **Cartes d'insights** : Conseils individuels avec actions exploitables
- **Message contextuel** : Guidance intelligente quand les insights sont absents

**Hooks Utilisés :**
- `useActivityInsightsGenerator(period)` : Génération d'insights avec cache
- `useHasActivityHistory()` : Vérification de l'historique

**Types d'Insights Générés :**
- **Pattern** : Observations sur les habitudes (ex: "Vous préférez vous entraîner le matin")
- **Trend** : Tendances d'évolution (ex: "Progression visible dans la durée")
- **Recommendation** : Conseils actionnables (ex: "Ajoutez 15min de cardio")
- **Achievement** : Points forts (ex: "Excellente régularité cette semaine")

### 📈 Onglet "Progression"

**Fichier :** `src/app/pages/Activity/ActivityProgressTab.tsx`

**Fonctionnalités :**
- **Statistiques globales** : Métriques de la période sélectionnée
- **Graphique de distribution** : Types d'activités, intensités, patterns temporels
- **Heatmap d'activité** : Calendrier visuel avec intensité par jour
- **Cartes d'insights** : Même source que l'onglet Insights

**Composants de Visualisation :**
- `GlobalStatsCard` : Vue d'ensemble des métriques
- `ActivityDistributionChart` : Graphiques de répartition
- `ActivityHeatmap` : Calendrier d'activité avec légende
- `ActivityInsightCards` : Insights avec priorités visuelles

**Calculs Avancés :**
- **Score de régularité** : `(activités_réelles / activités_requises) * 100`
- **Score d'équilibre** : Basé sur la diversité des types et intensités
- **Patterns temporels** : Détection des créneaux préférés

### 📚 Onglet "Historique"

**Fichier :** `src/app/pages/Activity/ActivityHistoryTab.tsx`

**Fonctionnalités :**
- **Groupement par jour** : Activités organisées chronologiquement
- **Totaux quotidiens** : Calories et durée par jour
- **Modal de détail** : Informations complètes sur chaque activité
- **Suppression** : Avec confirmation et invalidation cache

**Composants Clés :**
- `ActivityDetailModal` : Modal avec détails techniques et actions
- Groupement automatique par date avec formatage français
- Interface de suppression avec feedback visuel

---

## 🔗 Intégration avec le Profil Utilisateur

### Champs Utilisés par la Forge Énergétique

**Onglet Identité (`ProfileIdentityTab`) :**
- `weight_kg` : **CRITIQUE** - Calcul des calories via tables MET
- `height_cm` : Calculs de BMR et ajustements métaboliques
- `sex` : Ajustement des estimations selon le genre
- `birthdate` : Calcul de l'âge pour personnalisation
- `activity_level` : Définition des objectifs et seuils
- `objective` : Adaptation des conseils et métriques

**Onglet Training (`ProfilePreferencesTab`) :**
- `workout.type` : Type d'entraînement préféré
- `workout.fitnessLevel` : Niveau actuel (débutant, intermédiaire, avancé)
- `workout.sessionsPerWeek` : Fréquence d'entraînement cible
- `workout.preferredDuration` : Durée préférée par session
- `workout.equipment` : Équipement disponible
- `workout.specificGoals` : Objectifs spécifiques mesurables

### Synchronisation Bidirectionnelle

**Profil → Forge Énergétique :**
- Changement de `weight_kg` → Recalcul automatique des calories
- Changement d'`objective` → Adaptation des seuils et conseils
- Changement d'`activity_level` → Ajustement des objectifs quotidiens

**Forge Énergétique → Profil :**
- Détection de régularité élevée → Suggestion d'augmenter `activity_level`
- Patterns d'activité → Suggestions d'équipement ou d'objectifs spécifiques
- Analyse des types dominants → Recommandations pour `workout.type`

---

## 🧠 Données Clés pour le Cerveau Central

### Données Immédiatement Exploitables

**Métriques Quantitatives :**
- `totalCalories`, `totalDuration` par session et par période
- `avg_daily_calories`, `consistency_score` pour évaluation globale
- `most_frequent_type`, `avg_intensity` pour profiling comportemental

**Insights Qualitatifs :**
- `forgeInsights` : Conseils immédiats post-activité
- `insights` structurés avec `type`, `priority`, `actionable`, `action`
- `strategic_advice` : Insights spécifiquement actionnables

**Patterns Comportementaux :**
- `time_patterns` : Créneaux préférés d'activité
- `distribution.activity_types` : Préférences d'activité
- `distribution.intensity_levels` : Profil d'intensité

### Données de Contexte

**Métadonnées de Qualité :**
- `confidence` : Fiabilité des analyses
- `processingTime`, `costUsd` : Métriques de performance
- `cached` : Fraîcheur des données

**Données Temporelles :**
- `daily_trends` : Évolution des métriques dans le temps
- `heatmap_data` : Régularité et intensité par jour
- `generated_at` : Timestamp pour la fraîcheur

### Potentiel de Synthèse pour le Cerveau Central

**Corrélations Possibles :**
- **Activité + Nutrition :** Corrélation entre calories brûlées et apport nutritionnel
- **Activité + Jeûne :** Impact du jeûne sur les performances d'entraînement
- **Activité + Morphologie :** Évolution corporelle selon les types d'activité
- **Activité + Émotions :** Corrélation entre activité et bien-être mental

**Conseils Holistiques Futurs :**
- Recommandations nutritionnelles basées sur les dépenses énergétiques
- Ajustement des fenêtres de jeûne selon les créneaux d'activité
- Programmes d'entraînement adaptés aux objectifs morphologiques
- Gestion du stress et du sommeil selon l'intensité d'activité

---

## 📋 Contrats TypeScript

### Interfaces Principales

```typescript
// Activité de base
export interface Activity {
  id: string;
  user_id: string;
  type: string;
  duration_min: number;
  intensity: 'low' | 'medium' | 'high' | 'very_high';
  calories_est: number;
  notes?: string;
  timestamp: string;
  created_at: string;
}

// Résultat de transcription
export interface TranscriptionResult {
  cleanText: string;
  originalTranscription: string;
  confidence: number;
  processingTime: number;
  costUsd: number;
}

// Résultat d'analyse
export interface AnalysisResult {
  activities: Array<{
    type: string;
    duration_min: number;
    intensity: 'low' | 'medium' | 'high' | 'very_high';
    calories_est: number;
    met_value: number;
    notes?: string;
  }>;
  totalCalories: number;
  totalDuration: number;
  forgeInsights: string[];
  confidence: number;
  costUsd: number;
}

// Insight structuré
export interface ActivityInsight {
  type: 'pattern' | 'trend' | 'recommendation' | 'achievement';
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  confidence: number;
  icon: string;
  color: string;
  actionable?: boolean;
  action?: string;
}

// Résumé de progression
export interface ActivitySummary {
  total_activities: number;
  total_calories: number;
  total_duration: number;
  avg_daily_calories: number;
  most_frequent_type: string;
  avg_intensity: string;
  consistency_score: number;
}
```

---

## ⚙️ Edge Functions Détaillées

### 🎤 `activity-transcriber`

**Rôle :** Agent 1 - Transcription et nettoyage du texte

**Modèles :**
- **Whisper-1** : Transcription audio → texte
- **GPT-5 Nano** : Nettoyage et traduction

**Spécialités :**
- Support des accents forts et créoles
- Correction des erreurs de reconnaissance vocale
- Traduction multilingue vers français standard
- Suppression des hésitations et parasites

**Performance :**
- **Durée :** 3-8 secondes
- **Coût :** ~$0.000023 par transcription
- **Confiance :** 95% en moyenne

### 🔍 `activity-analyzer`

**Rôle :** Agent 2 - Analyse des activités avec calcul des calories

**Modèle :** GPT-5 Mini (optimisé pour le raisonnement)

**Spécialités :**
- Extraction d'activités multiples depuis une description
- Estimation intelligente des durées manquantes
- Classification d'intensité basée sur les descriptions
- Calcul précis des calories via tables MET

**Tables MET Intégrées :**
- **Cardio :** Course, marche, vélo, natation
- **Musculation :** Poids libres, machines, bodyweight
- **Sports :** Football, tennis, basketball
- **Autres :** Yoga, pilates, danse, escalade

**Performance :**
- **Durée :** 5-15 secondes
- **Coût :** ~$0.000863 par analyse
- **Confiance :** 85% en moyenne

### 📊 `activity-progress-generator`

**Rôle :** Agent 3 - Génération d'insights et analyse des patterns

**Modèle :** GPT-5 Mini (optimisé pour l'analyse de données)

**Spécialités :**
- Détection de patterns temporels et comportementaux
- Génération d'insights structurés avec priorités
- Calculs de métriques avancées (régularité, équilibre)
- Recommandations personnalisées selon l'objectif

**Cache Intelligent :**
- **Validité :** 24h (7j), 72h (30j), 168h (90j)
- **Invalidation :** Basée sur nouvelles activités (+2 seuil)
- **Fallback :** Données basiques même en cas d'erreur

**Performance :**
- **Durée :** 8-25 secondes
- **Coût :** ~$0.0063 par génération
- **Confiance :** 85% en moyenne

---

## 🎯 Optimisations et Performance

### Frontend
- **React Query :** Cache intelligent avec `staleTime` adaptatif
- **Zustand :** State management optimisé
- **Framer Motion :** Animations conditionnelles (`prefers-reduced-motion`)
- **Audio System :** "Strike & Bloom" avec rate limiting

### Backend
- **Cache serveur :** Table `ai_trend_analyses` avec invalidation intelligente
- **Rate limiting :** Protection contre les appels excessifs
- **Retry logic :** Gestion des erreurs temporaires
- **Cost tracking :** Table `ai_analysis_jobs` pour audit

### Base de Données
- **RLS :** Sécurité au niveau ligne
- **Indexes :** Optimisés pour les requêtes fréquentes
- **Triggers :** `updated_at` automatique
- **Contraintes :** Validation des données

---

## 💰 Coûts et Gouvernance

### Coûts par Composant
- **Transcription :** ~$0.000023 (Whisper-1 + GPT-5 Nano)
- **Analyse :** ~$0.000863 (GPT-5 Mini)
- **Insights :** ~$0.0063 (GPT-5 Mini avec analyse avancée)

### Optimisations de Coûts
- **Cache intelligent :** Évite les régénérations inutiles
- **Seuils adaptatifs :** Pas d'analyse sans données suffisantes
- **Fallback gracieux :** Données basiques sans coût supplémentaire
- **Monitoring :** Tracking précis des coûts par utilisateur

### Gouvernance
- **Quotas utilisateur :** Limites par période
- **Audit trail :** Traçabilité complète des coûts
- **Alertes :** Dépassement de seuils prédéfinis

---

## 🔍 Observabilité et Debugging

### Logs Structurés
```typescript
// Exemple de log d'activité
{
  level: 'info',
  message: 'Activity analysis completed',
  context: {
    userId: 'uuid',
    clientTraceId: 'activity_123',
    activitiesCount: 3,
    totalCalories: 450,
    processingTime: 12500,
    costUsd: 0.000863,
    philosophy: 'activity_analysis_audit'
  },
  timestamp: '2025-01-15T10:30:00.000Z'
}
```

### Métriques Clés
- **SLO E2E :** < 45 secondes (transcription + analyse + sauvegarde)
- **Taux de succès :** > 95% pour chaque étape
- **Confiance moyenne :** > 80% pour les analyses
- **Cache hit rate :** > 60% pour les insights

### Debugging
- **clientTraceId :** Suivi de bout en bout
- **Correlation IDs :** Liaison entre frontend et backend
- **Error boundaries :** Gestion gracieuse des erreurs
- **Fallback strategies :** Dégradation progressive

---

## 🧠 Intégration Future avec le Cerveau Central

### Données Exportables

**Métriques Comportementales :**
- **Régularité :** `consistency_score`, patterns temporels
- **Préférences :** Types d'activité dominants, intensités préférées
- **Performance :** Évolution des calories, durée, fréquence

**Insights Actionnables :**
- **Recommandations :** Liste des actions suggérées avec priorités
- **Achievements :** Points forts à maintenir ou amplifier
- **Patterns :** Habitudes détectées pour optimisation globale

**Données de Contexte :**
- **Profil d'activité :** Niveau réel vs déclaré
- **Objectifs :** Progression vers les cibles définies
- **Contraintes :** Limitations physiques détectées

### Corrélations Futures

**Avec la Forge Nutritionnelle :**
- Calories brûlées vs apport nutritionnel
- Timing des repas vs créneaux d'activité
- Macronutriments vs type d'entraînement

**Avec la Forge du Temps :**
- Performance selon les fenêtres de jeûne
- Énergie disponible vs état de jeûne
- Optimisation des créneaux d'activité

**Avec TwinVision :**
- Évolution morphologique vs programme d'activité
- Efficacité des exercices selon la morphologie
- Adaptation des recommandations selon les mesures corporelles

### Architecture du Cerveau Central

**Sources de Données :**
```typescript
interface CentralBrainInput {
  // Forge Énergétique
  activitySummary: ActivitySummary;
  activityInsights: ActivityInsight[];
  activityPatterns: TimePatterns[];
  
  // Forge Nutritionnelle (futur)
  nutritionSummary: NutritionSummary;
  mealInsights: MealInsight[];
  
  // Forge du Temps (futur)
  fastingSummary: FastingSummary;
  fastingCompliance: FastingCompliance;
  
  // TwinVision (futur)
  morphologyData: MorphologyData;
  bodyComposition: BodyComposition;
  
  // Profil Utilisateur
  userProfile: UserProfile;
  userGoals: UserGoals;
}
```

**Sortie Attendue :**
```typescript
interface HolisticRecommendations {
  globalScore: number;                    // Score de bien-être global
  priorityActions: PriorityAction[];      // Actions prioritaires
  correlationInsights: Correlation[];     // Insights croisés
  weeklyPlan: WeeklyPlan;                // Plan hebdomadaire optimisé
  longTermStrategy: LongTermStrategy;     // Stratégie à long terme
}
```

---

## 🔧 Maintenance et Évolution

### Points d'Extension
- **Nouveaux types d'activité :** Ajout dans les tables MET
- **Modèles de Forge Spatiale :** Migration vers des modèles plus avancés
- **Métriques personnalisées :** Ajout de nouveaux KPIs
- **Intégrations externes :** Wearables, applications tierces

### Monitoring Continu
- **Performance :** Surveillance des SLOs
- **Coûts :** Optimisation continue des appels
- **Qualité :** Feedback utilisateur sur la précision
- **Évolution :** Adaptation selon les patterns d'usage

---

## 📞 Support et Contribution

Pour toute question technique ou suggestion d'amélioration concernant la Forge Énergétique, consultez ce document ou contactez l'équipe de développement.

**Fichiers clés à consulter :**
- Pipeline : `src/app/pages/Activity/ActivityInputPage.tsx`
- Hooks de données : `src/app/pages/Activity/hooks/useActivitiesData.ts`
- Repository : `src/system/data/activitiesRepository.ts`
- Edge Functions : `supabase/functions/activity-*`

---

*Cette documentation est maintenue à jour avec chaque évolution de la Forge Énergétique. Dernière révision : Janvier 2025*