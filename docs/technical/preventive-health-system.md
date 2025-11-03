# Système de Santé Préventive - Documentation Technique

## Vue d'ensemble

Le système de santé préventive enrichit l'onglet santé du profil utilisateur avec des données complètes pour permettre une médecine préventive personnalisée par IA.

## Architecture

### 1. Modèle de Données

#### Health Profile V2

Le nouveau modèle de données santé (v2.0) est structuré comme suit:

```typescript
{
  version: "2.0",
  basic: {
    bloodType: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-",
    height_cm: number,
    weight_kg: number,
    bmi: number
  },
  medical_history: {
    conditions: string[],
    medications: string[],
    allergies: string[],
    surgeries: Surgery[],
    hospitalizations: Hospitalization[],
    chronic_diseases: string[],
    family_history: FamilyHistory
  },
  vaccinations: {
    up_to_date: boolean,
    records: VaccinationRecord[]
  },
  vital_signs: {
    blood_pressure_systolic: number,
    blood_pressure_diastolic: number,
    resting_heart_rate: number,
    blood_glucose_mg_dl: number,
    last_measured: string
  },
  lifestyle: {
    smoking_status: "never" | "former" | "current",
    alcohol_frequency: "never" | "occasional" | "moderate" | "frequent",
    sleep_hours_avg: number,
    stress_level: number (1-10),
    physical_activity_level: "sedentary" | "light" | "moderate" | "active" | "athlete"
  },
  reproductive_health: {...},
  mental_health: {...},
  medical_devices: {...},
  physical_limitations: string[],
  last_checkup_date: string,
  next_checkup_due: string
}
```

#### Rétrocompatibilité

Le système supporte automatiquement les profils santé V1 (ancien format) et V2 (nouveau format enrichi):

- **V1**: Format basique avec bloodType, conditions, medications, physicalLimitations
- **V2**: Format enrichi complet avec toutes les sections détaillées

La fonction `migrateHealthV1ToV2()` permet la migration automatique des données.

### 2. Base de Données

#### Tables Créées

##### `country_health_data`

Stocke les données sanitaires enrichies par pays:

- Maladies endémiques
- Vaccinations recommandées
- Risques sanitaires spécifiques
- Données climatiques
- Carences nutritionnelles communes
- Indices de qualité environnementale

**Mise à jour**: Les données sont cachées pendant 30 jours puis rafraîchies automatiquement.

##### `user_health_history`

Historique temporel des données de santé:

- Snapshots réguliers du profil santé
- Constantes vitales à chaque enregistrement
- Tracking de l'évolution dans le temps
- Source de données (manuel, wearable, examen médical, etc.)

#### Extensions `user_profile`

Nouvelles colonnes ajoutées:

- `health_schema_version`: '1.0' ou '2.0'
- `country_health_cache`: Cache JSONB des données pays
- `health_enriched_at`: Timestamp du dernier enrichissement

### 3. Services

#### CountryHealthEnrichmentService

Service singleton pour l'enrichissement automatique des données pays.

**Fonctionnalités:**

- Récupération des données via REST Countries API
- Enrichissement avec données épidémiologiques
- Système de cache intelligent (30 jours)
- Mise à jour automatique du cache utilisateur

**APIs utilisées:**

- **REST Countries API**: `https://restcountries.com/v3.1`
  - Données géographiques de base
  - Informations démographiques
  - Coordonnées géographiques

- **WHO GHO API** (prévu): `https://ghoapi.azureedge.net/api`
  - Données épidémiologiques
  - Statistiques sanitaires par pays

**Utilisation:**

```typescript
import { countryHealthService } from '@/system/services/countryHealthEnrichmentService';

// Enrichir les données d'un pays
const data = await countryHealthService.enrichCountryData('France');

// Mettre à jour le cache utilisateur
await countryHealthService.updateUserCountryCache(userId, 'France');

// Récupérer les données pays de l'utilisateur
const userData = await countryHealthService.getUserCountryHealthData(userId);
```

### 4. Composants UI

#### Sections de l'Onglet Santé

1. **BasicHealthSection**: Groupe sanguin, taille, poids
2. **VitalSignsSection**: Tension, fréquence cardiaque, glycémie
3. **LifestyleSection**: Tabagisme, alcool, sommeil, stress, activité physique
4. **FamilyHistorySection**: Antécédents familiaux et prédispositions génétiques
5. **CountryHealthDataDisplay**: Affichage des risques sanitaires locaux

#### Hook `useCountryHealthData`

Hook React pour gérer l'enrichissement automatique:

```typescript
const { countryData, loading, error, refresh } = useCountryHealthData();
```

**Fonctionnalités:**

- Chargement automatique au montage
- Rechargement lors du changement de pays
- Fonction de rafraîchissement manuel
- Gestion des états loading/error

### 5. Validation

#### Schémas Zod

Validation complète avec `profileHealthValidationV2.ts`:

- Validation par section (modularité)
- Contraintes de plage pour valeurs numériques
- Validation de formats de dates
- Règles métier spécifiques (ex: pression artérielle)

### 6. Calcul de Complétion

La fonction `calculateHealthCompletion()` gère les deux versions:

**V1 (5 champs critiques):**
- bloodType
- conditions
- medications
- physicalLimitations
- constraints

**V2 (14 champs critiques):**
- basic.bloodType
- medical_history (conditions, medications, family_history)
- vital_signs (blood_pressure, heart_rate)
- lifestyle (smoking, alcohol, sleep, stress, activity)
- vaccinations.up_to_date
- physical_limitations
- last_checkup_date

## Intégration avec IA

### Contexte pour Médecine Préventive

Le type `PreventiveMedicineContext` structure toutes les données pour l'analyse IA:

```typescript
{
  user_profile: HealthProfileV2,
  country_data: CountryHealthData,
  recent_history: UserHealthHistory[],
  risk_factors: string[],
  recommendations: string[],
  score: HealthScoreBreakdown
}
```

### Fonction Postgres `calculate_preventive_health_score`

Score de 0-100 basé sur:
- Complétude des informations de base (20 points)
- Historique médical (25 points)
- Vaccinations (15 points)
- Constantes vitales (20 points)
- Style de vie (20 points)

## Migration depuis V1

### Stratégie de Migration

1. **Détection automatique**: `isHealthV2()` vérifie la version
2. **Migration on-demand**: Première édition convertit V1 → V2
3. **Préservation des données**: Les données V1 sont mappées dans V2
4. **Rétrocompatibilité**: Les deux versions coexistent

### Processus de Migration

```typescript
import { migrateHealthV1ToV2, isHealthV2 } from '@/domain/health';

if (!isHealthV2(profile.health)) {
  const migratedHealth = migrateHealthV1ToV2(profile.health);
  await updateProfile({ health: migratedHealth });
}
```

## Sécurité

### Row Level Security (RLS)

- **country_health_data**: Lecture publique (authenticated), modification service_role uniquement
- **user_health_history**: Accès strictement privé par utilisateur
- **user_profile.health**: Déjà protégé par RLS existant

### Recommandations

1. **Chiffrement application**: Données médicales sensibles à chiffrer côté client avant envoi
2. **Logs d'audit**: Tous les accès aux données santé sont loggés
3. **Consentement explicite**: Validation utilisateur pour chaque catégorie de données
4. **Anonymisation IA**: Données envoyées à l'IA doivent être anonymisées

## Utilisation

### Ajout de Données dans le Profil

```typescript
const healthData: HealthProfileV2 = {
  version: '2.0',
  basic: {
    bloodType: 'A+',
    height_cm: 175,
    weight_kg: 70,
  },
  medical_history: {
    conditions: ['Asthme'],
    medications: ['Ventoline'],
    allergies: ['Pollen'],
    family_history: {
      cardiovascular: true,
      diabetes: false,
    },
  },
  vital_signs: {
    blood_pressure_systolic: 120,
    blood_pressure_diastolic: 80,
    resting_heart_rate: 65,
    last_measured: '2025-10-14',
  },
  lifestyle: {
    smoking_status: 'never',
    alcohol_frequency: 'occasional',
    sleep_hours_avg: 7.5,
    stress_level: 4,
    physical_activity_level: 'moderate',
  },
};

await updateProfile({ health: healthData });
```

### Création d'un Snapshot Historique

```typescript
// Automatique via fonction Postgres
const snapshotId = await supabase.rpc('create_health_snapshot', {
  p_user_id: userId,
  p_source: 'manual',
});
```

## Prochaines Étapes

### Fonctionnalités à Développer

1. **Pipeline d'Analyse Médicale**
   - Upload et OCR de documents médicaux
   - Extraction automatique des données
   - Intégration dans le profil santé

2. **Dashboard de Suivi**
   - Graphiques d'évolution temporelle
   - Alertes et notifications personnalisées
   - Recommandations préventives

3. **Intégration IA Avancée**
   - Analyse prédictive des risques
   - Génération de plans de prévention
   - Détection d'anomalies

4. **Enrichissement API**
   - Intégration WHO GHO API complète
   - Alertes épidémiologiques en temps réel
   - Données climatiques détaillées

5. **Wearables**
   - Synchronisation automatique constantes vitales
   - Historique automatique depuis appareils connectés
   - Analyse continue des tendances

## Support et Maintenance

### Logs

Tous les événements sont loggés avec le préfixe:
- `COUNTRY_HEALTH_ENRICHMENT`
- `COUNTRY_HEALTH_CACHE`
- `USER_COUNTRY_DATA`
- `COUNTRY_HEALTH_HOOK`

### Monitoring

Points de surveillance recommandés:
- Taux de succès enrichissement pays
- Latence API externes
- Taux de cache hit/miss
- Erreurs de validation

## Références

- [REST Countries API Documentation](https://restcountries.com/)
- [WHO GHO API Documentation](https://www.who.int/data/gho/info/gho-odata-api)
- [Zod Validation](https://zod.dev/)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
