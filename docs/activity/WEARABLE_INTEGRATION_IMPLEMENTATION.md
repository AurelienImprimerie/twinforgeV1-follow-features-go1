# Intégration des Objets Connectés - Forge Énergétique

## Vue d'Ensemble

Implémentation complète de l'intégration des objets connectés (wearables) dans la Forge Énergétique de TwinForge. Cette intégration enrichit les métriques d'activité avec des données biométriques temps réel provenant de montres et capteurs connectés.

## Architecture Implémentée

### 1. Base de Données

#### Migration: `20251010120000_enrich_activities_with_wearable_metrics.sql`

**Nouvelles colonnes ajoutées à `activities`:**

**Fréquence Cardiaque (HR)**
- `hr_avg`: FC moyenne (bpm)
- `hr_max`: FC maximale (bpm)
- `hr_min`: FC minimale (bpm)
- `hr_resting_pre`: FC au repos avant activité
- `hr_recovery_1min`: FC 1 minute après effort

**Zones de Fréquence Cardiaque**
- `hr_zone1_minutes`: Zone 1 (50-60% FCmax) - Récupération
- `hr_zone2_minutes`: Zone 2 (60-70% FCmax) - Endurance
- `hr_zone3_minutes`: Zone 3 (70-80% FCmax) - Tempo
- `hr_zone4_minutes`: Zone 4 (80-90% FCmax) - Seuil
- `hr_zone5_minutes`: Zone 5 (90-100% FCmax) - VO2max

**Variabilité Cardiaque (HRV)**
- `hrv_pre_activity`: HRV avant activité (ms)
- `hrv_post_activity`: HRV après activité (ms)
- `hrv_avg_overnight`: HRV moyenne nocturne (ms)

**Métriques de Performance**
- `vo2max_estimated`: VO2max estimé (ml/kg/min)
- `training_load_score`: Score TRIMP (charge d'entraînement)
- `efficiency_score`: Efficience (vitesse/FC)
- `fatigue_index`: Index de fatigue (0-100)

**Distance et Mouvement**
- `distance_meters`: Distance parcourue
- `avg_pace`: Allure moyenne (MM:SS/km)
- `avg_speed_kmh`: Vitesse moyenne
- `elevation_gain_meters`: Dénivelé positif
- `elevation_loss_meters`: Dénivelé négatif

**Cadence et Puissance**
- `avg_cadence_rpm`: Cadence moyenne
- `max_cadence_rpm`: Cadence maximale
- `avg_power_watts`: Puissance moyenne
- `max_power_watts`: Puissance maximale
- `normalized_power`: Puissance normalisée (NP)

**Récupération et Sommeil**
- `sleep_quality_score`: Qualité sommeil (0-100)
- `sleep_duration_hours`: Durée de sommeil
- `recovery_score`: Score de récupération (0-100)
- `stress_level_pre`: Niveau de stress pré-activité
- `body_battery_pre`: Body Battery Garmin

**Métadonnées Wearable**
- `wearable_device_id`: Référence au device connecté
- `wearable_activity_id`: ID chez le provider
- `wearable_synced_at`: Date de synchronisation
- `wearable_raw_data`: Données brutes (JSONB)

**Qualité des Données**
- `data_completeness_score`: Score de complétude (0-100)
- `gps_accuracy_meters`: Précision GPS
- `sensor_quality_score`: Qualité capteurs (0-100)

#### Calculs Automatiques

**Trigger: `calculate_derived_wearable_metrics()`**

Calcule automatiquement:
- `data_completeness_score`: % de champs wearable remplis
- `training_load_score`: TRIMP basé sur zones HR
- `efficiency_score`: Ratio vitesse/FC

#### Vue Matérialisée

**`mv_user_wearable_stats`**: Agrège les statistiques wearable par utilisateur
- Total activités avec wearable
- Moyennes: FC, VO2max, récupération, charge
- Dernière activité wearable

### 2. Composants React

#### HeartRateMetricsCard.tsx

Affiche les métriques cardiaques enrichies:
- FC moyenne, max, min, récupération
- Distribution des zones HR avec barres de progression colorées
- Animations fluides et design VisionOS
- Badge de données enrichies

**Props:**
```typescript
interface HeartRateMetrics {
  hr_avg?: number | null;
  hr_max?: number | null;
  hr_min?: number | null;
  hr_recovery_1min?: number | null;
  hr_zone1_minutes?: number | null;
  hr_zone2_minutes?: number | null;
  hr_zone3_minutes?: number | null;
  hr_zone4_minutes?: number | null;
  hr_zone5_minutes?: number | null;
}
```

#### RecoveryScoreCard.tsx

Affiche le score de récupération et métriques associées:
- Gauge circulaire pour le score de récupération (0-100)
- Couleur adaptative selon le score
- Conseils personnalisés selon le niveau de récupération
- Métriques détaillées: HRV, sommeil, stress, Body Battery
- Recommandations d'intensité d'entraînement

**Niveaux:**
- 80-100: Excellente (prêt pour effort intense)
- 60-79: Bonne (entraînement normal)
- 40-59: Modérée (privilégier léger)
- 0-39: Faible (repos recommandé)

#### PerformanceMetricsCard.tsx

Affiche les métriques de performance avancées:
- VO2max estimé avec niveau et couleur
- Distance, allure, vitesse, dénivelé
- Cadence et puissance (vélo/course)
- Training Load Score (TRIMP)
- Score d'efficience

**Adaptatif par type d'activité:**
- Cadence en RPM pour vélo, SPM pour course
- Métriques de puissance pour cyclisme
- Allure pour course

#### WearableBadge.tsx

Badge compact indiquant l'enrichissement wearable:
- Affichage conditionnel (seulement si données wearable)
- Score de complétude des données
- Nom du device (optionnel)
- Couleurs adaptatives selon complétude

#### WearableEnrichedSection.tsx

Section agrégée pour ActivityDailyTab:
- Agrège toutes les activités wearable du jour
- Somme des zones HR
- Total distances et charges
- Layout responsive (grid 1 col mobile, 2 cols desktop)
- Message informatif sur la synchronisation

### 3. Infrastructure Existante (Audit)

#### Tables Supabase

**`connected_devices`**: Déjà implémentée
- Gère connexions OAuth aux providers
- Supporte 11 providers (Strava, Garmin, Fitbit, Apple Health, etc.)
- Tokens chiffrés, statuts, scopes

**`device_sync_history`**: Déjà implémentée
- Historique complet des synchronisations
- Tracking performance et erreurs

**`wearable_health_data`**: Déjà implémentée
- Stockage normalisé des données de santé
- Timestamp, valeurs numériques/texte/JSON
- Quality score

**`sync_preferences`**: Déjà implémentée
- Préférences de synchronisation par device
- Fréquence, types de données, notifications

#### Services React

**`wearableDataService.ts`**: Déjà implémenté
- CRUD complet sur connected_devices
- Récupération health_data avec filtres
- Normalisation des workouts
- Agrégation de données

**`useWearableSync.ts`**: Hook déjà implémenté
- Gestion état synchronisation
- Trigger sync manuel/auto
- Historique et préférences

#### Edge Functions

**`wearable-sync`**: Déjà implémentée
- Synchronisation avec providers externes
- Normalisation des données

**`wearable-oauth-callback`**: Déjà implémentée
- Gestion callback OAuth
- Stockage sécurisé des tokens

## Intégration dans les Onglets

### Onglet Aujourd'hui (ActivityDailyTab)

**Composants ajoutés:**
1. **WearableEnrichedSection**: Section complète des métriques enrichies
2. **RecoveryScoreCard**: Score de récupération en vedette
3. **HeartRateMetricsCard**: Métriques cardiaques du jour
4. **PerformanceMetricsCard**: Performances agrégées

**À intégrer dans ActivityDailyTab.tsx:**
```tsx
import { WearableEnrichedSection } from './components/DailyRecap/WearableEnrichedSection';

// Dans le render, après CalorieProgressCard
{todayActivities && todayActivities.length > 0 && (
  <WearableEnrichedSection activities={todayActivities} />
)}
```

### Onglet Insights (À implémenter - Phase 2)

**Insights biométriques enrichis:**
- Corrélation FC/Performance
- Détection de surentraînement (HRV trend)
- Fenêtres optimales d'entraînement
- Comparaison FC vs moyenne attendue
- Conseils d'intensité basés sur zones HR historiques

### Onglet Progression (À implémenter - Phase 2)

**Graphiques avancés:**
- Évolution VO2max estimée
- Heatmap zones HR (temps en Z1-Z5 par jour)
- Training Load Chart (TRIMP over time)
- Courbe Fitness/Fatigue (modèle Banister)
- Tendances HR au repos
- Score de récupération quotidien

### Onglet Historique (À implémenter - Phase 2)

**Enrichissement des détails:**
- Graphiques FC par activité
- Zones HR par séance
- Comparaison avec moyennes personnelles
- Export données détaillées

## Synchronisation Automatique (Phase 3)

### Détection Automatique

**Mode "Auto-sync":**
- Import transparent depuis wearables
- Notification: "Nouvelle activité détectée"
- Validation croisée données wearable vs déclaration

### Fusion Intelligente

**Stratégie:**
1. Détection doublons (timestamp ± 5min)
2. Merge données manuelles + wearable
3. Priorité aux métriques wearable (plus précises)
4. Calcul calories dynamique si HR disponible

## Calculs Améliorés

### Remplacement MET par Firstbeat

**Algorithme de Firstbeat pour calories:**
- Plus précis que MET statique
- Basé sur HR réelle + profil utilisateur
- Intégration des zones HR

### VO2max Estimation

**Formules:**
- Course: Modèle Cooper + HR
- Vélo: Modèle puissance/FC
- Général: HR max/resting ratio

### TRIMP (Training Impulse)

**Calcul:**
```
TRIMP = Σ (minutes_zone × facteur_zone)
Zone 1: 1.0
Zone 2: 2.0
Zone 3: 3.0
Zone 4: 4.0
Zone 5: 5.0
```

### Fatigue Index

**Basé sur:**
- HRV trend (7 jours)
- Training Load cumulée
- Qualité sommeil
- Stress pré-activité

## Métriques Exclusives Wearables

1. **Score de Résilience Cardiaque**: Vitesse récupération HR
2. **Efficience Aérobie**: Vitesse/puissance par battement
3. **Index d'Adaptation**: Amélioration HR pour même effort
4. **Score de Variabilité**: Consistance performance
5. **Potentiel d'Entraînement**: Basé sur récupération + historique
6. **Peak Fitness Prediction**: Estimation forme de pointe

## Expérience Utilisateur

### Badges et Indicateurs

- **Badge "Enrichi par wearable"**: Sur toutes les activités
- **Score de complétude**: Transparence sur qualité données
- **Indicateurs de synchronisation**: Statut en temps réel

### Onboarding Wearables

**Flow recommandé:**
1. Détection objets connectés disponibles
2. Proposition connexion
3. Explication valeur ajoutée
4. Configuration préférences sync
5. Premier import automatique

### Mode Coaching en Direct (Phase 3)

**Alertes temps réel:**
- "Vous êtes en Zone 4, maintenez 2 minutes"
- "FC élevée, ralentissez légèrement"
- "Excellente cadence, continuez !"

## Performance et Optimisations

### Cache Intelligent

**Stratégie:**
- Vue matérialisée `mv_user_wearable_stats`
- Refresh automatique après sync
- Réduction requêtes agrégation

### Index de Performance

```sql
idx_activities_wearable_device -- Requêtes par device
idx_activities_hr_avg -- Analyses FC
idx_activities_vo2max -- Suivi VO2max
idx_activities_wearable_synced -- Données récentes
idx_activities_hr_zones -- Activités avec zones
idx_activities_recovery -- Score récupération
```

### Lazy Loading

- Composants wearable chargés à la demande
- Sections masquées si pas de données

## Sécurité et Confidentialité

### RLS Policies

- Toutes les politiques existantes s'appliquent
- Isolation stricte par user_id
- Pas d'accès cross-user

### Données Sensibles

- Tokens OAuth chiffrés (application layer)
- HRV et métriques santé privées
- Export données conforme RGPD

## Tests et Validation

### Scénarios de Test

1. **Activité manuelle**: Tous NULL dans colonnes wearable
2. **Activité wearable partielle**: Certaines métriques seulement
3. **Activité wearable complète**: Toutes métriques enrichies
4. **Sync automatique**: Import transparent
5. **Multi-devices**: Plusieurs wearables même provider

### Métriques de Qualité

- `data_completeness_score` > 80% = données excellentes
- `sensor_quality_score` > 70% = capteurs fiables
- `gps_accuracy_meters` < 10m = GPS précis

## Roadmap Future

### Phase 2 (Insights et Progression)
- Insights biométriques avancés
- Graphiques de tendances
- Comparaisons personnelles

### Phase 3 (Synchronisation Avancée)
- Auto-sync temps réel
- Coaching en direct
- Webhooks providers

### Phase 4 (AI Avancée)
- Prédiction performance
- Détection patterns
- Recommandations adaptatives

## Documentation Technique

### Fichiers Créés

```
supabase/migrations/
  20251010120000_enrich_activities_with_wearable_metrics.sql

src/app/pages/Activity/components/Wearable/
  HeartRateMetricsCard.tsx
  RecoveryScoreCard.tsx
  PerformanceMetricsCard.tsx
  WearableBadge.tsx
  index.ts

src/app/pages/Activity/components/DailyRecap/
  WearableEnrichedSection.tsx

docs/activity/
  WEARABLE_INTEGRATION_IMPLEMENTATION.md (ce fichier)
```

### Dépendances

- Framer Motion (animations)
- React hooks existants
- Services Supabase existants
- Infrastructure wearables existante

## Conclusion

Cette implémentation pose les fondations solides pour l'intégration complète des objets connectés dans TwinForge. L'architecture est:

- **Rétrocompatible**: Activités manuelles non impactées
- **Progressive**: Enrichissement graduel selon données disponibles
- **Performante**: Calculs optimisés, cache intelligent
- **Sécurisée**: RLS, chiffrement, isolation stricte
- **Extensible**: Nouvelles métriques facilement ajoutables

Les utilisateurs sans wearables conservent l'expérience actuelle, tandis que ceux avec objets connectés accèdent à un niveau supérieur d'insights et de personnalisation.

Le build compile avec succès et l'application est prête pour la suite de l'implémentation !
