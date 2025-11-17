# Forge Nutritionnelle - Intégration Gaming & XP

## Vue d'Ensemble

La **Forge Nutritionnelle** est entièrement intégrée au système de gamification avec attribution automatique de XP pour chaque action de tracking nutritionnel.

### Actions Récompensées

| Action | XP Attribués | Event Type | Catégorie |
|--------|--------------|------------|-----------|
| **Scanner repas (photo)** | **25 XP** | `meal_scan` | `nutrition` |
| **Scanner code-barre** | **15 XP** | `barcode_scan` | `nutrition` |
| **Objectif calorique atteint** | **50 XP** | `daily_calorie_goal_met` | `nutrition` |

---

## Implémentation Technique

### Fichier Source

**`src/services/dashboard/coeur/GamificationService.ts`**

### Valeurs XP (Lignes 73-77)

```typescript
const XP_VALUES = {
  // Forge Nutritionnelle
  MEAL_SCAN: 25,                    // Scanner un repas (harmonisé)
  BARCODE_SCAN: 15,                 // Scanner un code-barre
  DAILY_CALORIE_GOAL_MET: 50,       // Objectif calorique journalier atteint
} as const;
```

### Méthodes d'Attribution

#### 1. Scanner Repas (25 XP)

**Méthode**: `awardMealScanXp()`

```typescript
// Ligne 359-361
async awardMealScanXp(userId: string, mealData?: Record<string, any>): Promise<XpAwardResult> {
  return this.awardXp(userId, 'meal_scan', 'nutrition', XP_VALUES.MEAL_SCAN, mealData || {});
}
```

**Appelé dans**:
- `src/app/pages/Meals/components/MealScanFlow/ScanFlowHandlers.tsx`
- Après analyse réussie photo repas (meal-analyzer Edge Function)

**Edge Function associée**:
- `supabase/functions/meal-analyzer/index.ts`
  - Modèle: GPT-5-mini Vision
  - Analyse: Aliments + Macros + Insights personnalisés
  - Context: Profil complet utilisateur

#### 2. Scanner Code-Barre (15 XP)

**Méthode**: `awardBarcodeScanXp()`

```typescript
// Ligne 363-365
async awardBarcodeScanXp(userId: string, barcodeData?: Record<string, any>): Promise<XpAwardResult> {
  return this.awardXp(userId, 'barcode_scan', 'nutrition', XP_VALUES.BARCODE_SCAN, barcodeData || {});
}
```

**Appelé dans**:
- `src/app/pages/Meals/components/MealScanFlow/BarcodePipelineHandlers.ts`
- Après scan réussi code-barre produit

**Bibliothèques utilisées**:
- `@yudiel/react-qr-scanner` (scanner caméra)
- `BarcodeDetector` API native (fallback)
- Formats: EAN-13, EAN-8, UPC-A, UPC-E, Code-128, Code-39

**Service externe**:
- OpenFoodFacts API pour données nutritionnelles produit

#### 3. Objectif Calorique Atteint (50 XP)

**Méthode**: `awardCalorieGoalMetXp()`

```typescript
// Ligne 383-394
async awardCalorieGoalMetXp(
  userId: string,
  calorieData: Record<string, any>
): Promise<XpAwardResult> {
  return this.awardXp(
    userId,
    'daily_calorie_goal_met',
    'nutrition',
    XP_VALUES.DAILY_CALORIE_GOAL_MET,
    calorieData
  );
}
```

**Logique de déclenchement**:
- Calculé quotidiennement
- Vérifie: `total_calories_consumed` proche de `target_calories` (±10%)
- Attribution automatique à minuit si objectif atteint

---

## Catégorisation Forge Nutritionnelle

### Événements Nutrition Pure (Lignes 184-187)

```typescript
private _isCulinaireEvent(eventType: string): boolean {
  const culinaireEvents = ['fridge_scan', 'recipe_generated', 'meal_plan_generated', 'shopping_list_generated'];
  return culinaireEvents.includes(eventType);
}

// Si NOT culinaire && category === 'nutrition' → Forge Nutritionnelle
```

**Actions Forge Nutritionnelle**:
- `meal_scan`
- `barcode_scan`
- `daily_calorie_goal_met`

### Notification UI (Lignes 204-210)

```typescript
// Forge Nutritionnelle garde category 'nutrition'
finalCategory = 'nutrition';
finalColor = '#10B981'; // Vert - Forge Nutritionnelle
```

**Couleurs**:
- Forge Nutritionnelle: `#10B981` (Vert)
- Forge Culinaire: `#EC4899` (Rose)

---

## Icônes Actions

### Mapping (Lignes 107-126)

```typescript
private _getActionIcon(eventType: string): keyof typeof ICONS {
  const iconMap: Record<string, keyof typeof ICONS> = {
    'meal_scan': 'Utensils',
    'barcode_scan': 'ScanLine',
    'daily_calorie_goal_met': 'Target',
  };
  return iconMap[eventType] || 'Star';
}
```

### Labels (Lignes 146-165)

```typescript
private _getActionLabel(eventType: string): string {
  const labelMap: Record<string, string> = {
    'meal_scan': 'Scan de repas',
    'barcode_scan': 'Scan de code-barre',
    'daily_calorie_goal_met': 'Objectif calorique',
  };
  return labelMap[eventType] || eventType;
}
```

---

## Flow Complet Scan Repas

### Exemple: Scanner un Repas (Photo)

```
1. USER: Capture photo repas
   ↓
2. FRONTEND: MealScanFlowPage
   ↓
3. STORE: Meal scan pipeline (photo → barcode toggle)
   ↓
4. EDGE FUNCTION: meal-analyzer
   - GPT-5-mini Vision
   - Analyse aliments détectés
   - Calcul macros
   - Insights personnalisés
   ↓
5. STORE: ScanFlowHandlers.handleAnalysisSuccess()
   ↓
6. GAMING: gamificationService.awardMealScanXp()
   ↓
7. DATABASE:
   - INSERT meals table
   - INSERT xp_events_log
   - UPDATE user_gamification_progress
   ↓
8. UI NOTIFICATION: "🍽️ Scan de repas +25 XP"
```

---

## Flow Scan Code-Barre

### Exemple: Scanner Code-Barre Produit

```
1. USER: Active mode barcode dans meal scan
   ↓
2. FRONTEND: BarcodeScannerView (@yudiel/react-qr-scanner)
   ↓
3. SCAN: Détection code-barre (EAN-13, UPC-A, etc.)
   ↓
4. API CALL: OpenFoodFacts (données produit)
   ↓
5. STORE: BarcodePipelineHandlers.handleBarcodeScanned()
   ↓
6. GAMING: gamificationService.awardBarcodeScanXp()
   ↓
7. DATABASE:
   - INSERT scanned_products
   - INSERT xp_events_log
   - UPDATE user_gamification_progress
   ↓
8. UI NOTIFICATION: "🔍 Scan de code-barre +15 XP"
```

---

## Système de Barcode Scanning

### Fichiers Clés

**Scanner Image**:
- `src/lib/barcode/barcodeImageScanner.ts`
  - Interface: `BarcodeImageScanResult`
  - Fonction: `scanBarcodeFromImage(file: File)`
  - Fallback: BarcodeDetector API native

**Composant UI**:
- `src/app/pages/Meals/components/MealPhotoCaptureStep/BarcodeScannerView.tsx`
  - Intégration: `@yudiel/react-qr-scanner`
  - Formats supportés: 6 types (EAN-13, EAN-8, UPC-A, UPC-E, Code-128, Code-39)

**Service OpenFoodFacts**:
- `src/system/services/openFoodFactsService.ts`
  - API: https://world.openfoodfacts.org/api/v0/product/{barcode}.json
  - Data: Nom, marque, nutrition, allergènes, additifs

### Configuration BarcodeDetector

```typescript
// Ligne 37-46 barcodeImageScanner.ts
const barcodeDetector = new (window as any).BarcodeDetector({
  formats: [
    'ean_13',
    'ean_8',
    'upc_a',
    'upc_e',
    'code_128',
    'code_39',
  ],
});
```

---

## Multiplicateurs & Bonus

### Multiplicateur de Base

Toutes les actions Forge Nutritionnelle bénéficient des **multiplicateurs gaming standard**:

1. **Streak**: +10% par jour consécutif (max +50%)
2. **First of Day**: Première action de la journée
3. **Weekly Completion**: Bonus actions hebdomadaires

### Formule XP Final

```typescript
// RPC award_xp
finalXp = baseXp * multiplier;

// Exemple Meal Scan avec streak 3 jours:
// baseXp = 25
// multiplier = 1.0 + (0.1 * 3) = 1.3
// finalXp = 25 * 1.3 = 32 XP (arrondi)
```

---

## Système Multi-Occurrences

### Comportement (v2.0)

**Table**: `daily_actions_completion`

**Logique**:
- ✅ **Première occurrence du jour**: Full XP + bonus
- ❌ **Occurrences suivantes**: Tracked mais 0 XP

**Exemple Meal Scan**:
```
Scanner repas 1x: +25 XP (+ streak bonus)
Scanner repas 2x: +0 XP (tracked only)
Scanner repas 3x: +0 XP (tracked only)
```

**Colonnes tracking**:
- `is_first_of_day`: boolean
- `occurrence_number`: integer
- `xp_awarded`: integer (0 pour occurrences suivantes)

---

## Edge Function: meal-analyzer

### Configuration

**Fichier**: `supabase/functions/meal-analyzer/index.ts`

**Modèle IA**: GPT-5-mini Vision

**Input**:
```typescript
interface MealAnalysisRequest {
  user_id: string;
  image_url?: string;           // Photo repas
  image_data?: string;          // Base64
  scanned_products?: ScannedProductData[];  // Code-barres
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp?: string;
  user_profile_context?: {      // Profil complet
    sex, height_cm, weight_kg, target_weight_kg,
    activity_level, objective, birthdate,
    nutrition, health, emotions, workout, constraints,
    calculated_metrics
  };
}
```

**Output**:
```typescript
interface MealAnalysisResponse {
  success: boolean;
  detected_foods: DetectedFood[];     // Aliments + macros
  total_nutrition: {
    calories, proteins, carbs, fats, fiber, sugar, sodium
  };
  personalized_insights: PersonalizedInsight[];  // Recommandations IA
  objective_alignment: ObjectiveAlignment;       // Alignement objectifs
  meal_timing_feedback?: string;
  hydration_recommendation?: string;
}
```

**Pricing**: GPT-5-mini Vision
- Input: $0.25/1M tokens
- Output: $2.00/1M tokens

---

## Hook useForgeXpRewards

### Fichier

`src/hooks/useForgeXpRewards.ts`

### Harmonisation XP

Ce hook centralise l'attribution XP pour **Forge Nutritionnelle** + **Forge Culinaire**:

```typescript
// Harmonisé avec GamificationService
const MEAL_SCAN_XP = 25;        // Forge Nutritionnelle
const FRIDGE_SCAN_XP = 30;      // Forge Culinaire
const RECIPE_XP = 20;           // Forge Culinaire
```

**Utilisation**:
- Appelé après succès actions
- Gère notifications visuelles
- Track dans daily_actions_completion

---

## Tables Supabase

### meals

Stocke les repas scannés:

```sql
CREATE TABLE meals (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  meal_name text,
  meal_type text,                -- breakfast, lunch, dinner, snack
  items jsonb,                   -- Aliments détectés
  total_calories numeric,
  total_proteins numeric,
  total_carbs numeric,
  total_fats numeric,
  photo_url text,
  timestamp timestamptz,
  created_at timestamptz
);
```

### scanned_products (Code-barres)

```sql
CREATE TABLE scanned_products (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  barcode text,
  product_name text,
  brand text,
  nutrition_data jsonb,          -- OpenFoodFacts data
  portion_multiplier numeric,
  scanned_at timestamptz,
  meal_id uuid REFERENCES meals(id)
);
```

### xp_events_log

Toutes les actions Forge Nutritionnelle loggées:

```sql
CREATE TABLE xp_events_log (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  event_type text,              -- 'meal_scan', 'barcode_scan', etc.
  event_category text,          -- 'nutrition'
  base_xp integer,              -- 25, 15, 50
  multiplier numeric,           -- 1.0 + bonuses
  final_xp integer,             -- base_xp * multiplier
  event_date timestamptz,
  event_metadata jsonb,
  created_at timestamptz
);
```

---

## Intégration Profil Utilisateur

### Context Complet (meal-analyzer)

L'Edge Function `meal-analyzer` reçoit **contexte utilisateur complet**:

**Nutrition**:
- Diet (vegan, keto, etc.)
- Allergies
- Intolerances
- Disliked foods
- Budget level
- Protein target
- Fasting window

**Health**:
- Blood type
- Chronic conditions
- Medications

**Emotions**:
- Stress level
- Sleep quality

**Workout**:
- Workout intensity
- Next workout time

**Calculated Metrics**:
- BMR (Basal Metabolic Rate)
- TDEE (Total Daily Energy Expenditure)
- Target calories

**Objectif**: Insights **ultra-personnalisés** par repas

---

## Points Clés

1. **3 actions Forge Nutritionnelle** donnent des XP (25, 15, 50)
2. **Scanner repas**: GPT-5-mini Vision + profil complet
3. **Scanner code-barre**: @yudiel/react-qr-scanner + OpenFoodFacts
4. **Attribution automatique** via `GamificationService`
5. **Notifications vertes** `#10B981` pour différenciation
6. **Multiplicateurs applicables** (streak, first of day)
7. **Multi-occurrences**: Seule la 1ère du jour donne XP
8. **Tracking complet** dans tables meals + xp_events_log
9. **Insights personnalisés** basés sur profil complet

---

**Dernière mise à jour**: Novembre 2025
**Version**: 1.0 (Code-accurate)
**Fichiers sources**:
- `src/services/dashboard/coeur/GamificationService.ts`
- `supabase/functions/meal-analyzer/index.ts`
- `src/lib/barcode/barcodeImageScanner.ts`
