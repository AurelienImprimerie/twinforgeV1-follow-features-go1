# Forge Culinaire - Intégration Gaming & XP

## Vue d'Ensemble

La **Forge Culinaire** est entièrement intégrée au système de gamification avec attribution automatique de XP pour chaque action utilisateur.

### Actions Récompensées

| Action | XP Attribués | Event Type | Catégorie |
|--------|--------------|------------|-----------|
| **Scanner frigo** | **30 XP** | `fridge_scan` | `nutrition` |
| **Générer recette** | **20 XP** | `recipe_generated` | `nutrition` |
| **Générer plan repas** | **35 XP** | `meal_plan_generated` | `nutrition` |
| **Générer liste courses** | **15 XP** | `shopping_list_generated` | `nutrition` |

---

## Implémentation Technique

### Fichier Source

**`src/services/dashboard/coeur/GamificationService.ts`**

### Valeurs XP (Lignes 73-83)

```typescript
const XP_VALUES = {
  // Forge Culinaire
  FRIDGE_SCAN: 30,                  // Scanner son frigo
  RECIPE_GENERATED: 20,             // Générer une recette
  MEAL_PLAN_GENERATED: 35,          // Générer un plan de repas
  SHOPPING_LIST_GENERATED: 15,      // Générer une liste de courses
} as const;
```

### Méthodes d'Attribution

#### 1. Scanner de Frigo (30 XP)

**Méthode**: `awardFridgeScanXp()`

```typescript
// Ligne 367-369
async awardFridgeScanXp(userId: string, scanData?: Record<string, any>): Promise<XpAwardResult> {
  return this.awardXp(userId, 'fridge_scan', 'nutrition', XP_VALUES.FRIDGE_SCAN, scanData || {});
}
```

**Appelé dans**:
- `src/system/store/fridgeScan/actions/sessionActions.ts`
- Après succès du scan frigo (Agent 3 complementer terminé)

#### 2. Génération de Recette (20 XP)

**Méthode**: `awardRecipeGeneratedXp()`

```typescript
// Ligne 371-373
async awardRecipeGeneratedXp(userId: string, recipeData?: Record<string, any>): Promise<XpAwardResult> {
  return this.awardXp(userId, 'recipe_generated', 'nutrition', XP_VALUES.RECIPE_GENERATED, recipeData || {});
}
```

**Appelé dans**:
- `src/system/store/fridgeScan/actions/recipeGenerationActions.ts`
- `src/system/store/recipeGeneration/actions/generationActions.ts`
- Après génération réussie d'une recette (streaming SSE terminé)

#### 3. Génération Plan de Repas (35 XP)

**Méthode**: `awardMealPlanGeneratedXp()`

```typescript
// Ligne 375-377
async awardMealPlanGeneratedXp(userId: string, planData?: Record<string, any>): Promise<XpAwardResult> {
  return this.awardXp(userId, 'meal_plan_generated', 'nutrition', XP_VALUES.MEAL_PLAN_GENERATED, planData || {});
}
```

**Appelé dans**:
- `src/system/store/mealPlanStore/actions/generation/planGeneration.ts`
- Après génération réussie du plan 7 jours (21 repas)

#### 4. Génération Liste de Courses (15 XP)

**Méthode**: `awardShoppingListGeneratedXp()`

```typescript
// Ligne 379-381
async awardShoppingListGeneratedXp(userId: string, listData?: Record<string, any>): Promise<XpAwardResult> {
  return this.awardXp(userId, 'shopping_list_generated', 'nutrition', XP_VALUES.SHOPPING_LIST_GENERATED, listData || {});
}
```

**Appelé dans**:
- `src/system/store/shoppingListGenerationPipeline/index.ts`
- `src/system/store/shoppingListStore.ts`
- Après génération réussie liste de courses

---

## Catégorisation Forge Culinaire vs Forge Nutritionnelle

### Logique de Séparation (Lignes 184-187)

```typescript
private _isCulinaireEvent(eventType: string): boolean {
  const culinaireEvents = ['fridge_scan', 'recipe_generated', 'meal_plan_generated', 'shopping_list_generated'];
  return culinaireEvents.includes(eventType);
}
```

### Notification UI (Lignes 204-210)

```typescript
if (eventCategory === 'nutrition' && this._isCulinaireEvent(eventType)) {
  finalCategory = 'culinaire';
  finalColor = '#EC4899'; // Rose - Forge Culinaire
} else {
  finalCategory = this._mapEventCategoryToNotificationCategory(eventCategory);
  finalColor = this._getCategoryColor(eventCategory);
}
```

**Couleurs**:
- Forge Culinaire: `#EC4899` (Rose)
- Forge Nutritionnelle: `#10B981` (Vert)

---

## Icônes Actions

### Mapping (Lignes 107-126)

```typescript
private _getActionIcon(eventType: string): keyof typeof ICONS {
  const iconMap: Record<string, keyof typeof ICONS> = {
    'fridge_scan': 'Refrigerator',
    'recipe_generated': 'ChefHat',
    'meal_plan_generated': 'Calendar',
    'shopping_list_generated': 'ShoppingCart',
  };
  return iconMap[eventType] || 'Star';
}
```

### Labels (Lignes 146-165)

```typescript
private _getActionLabel(eventType: string): string {
  const labelMap: Record<string, string> = {
    'fridge_scan': 'Scan de frigo',
    'recipe_generated': 'Recette générée',
    'meal_plan_generated': 'Plan de repas',
    'shopping_list_generated': 'Liste de courses',
  };
  return labelMap[eventType] || eventType;
}
```

---

## Système de Notifications

### Store Points

**Fichier**: `src/system/store/coeur/pointsNotificationStore.ts`

**Notification déclenchée** (ligne 212-220):

```typescript
showNotification({
  type: 'forge-action',
  actionId: eventType,
  actionLabel: this._getActionLabel(eventType),
  pointsAwarded: xpAwarded,
  icon: this._getActionIcon(eventType),
  color: finalColor,
  category: finalCategory,  // 'culinaire'
});
```

---

## Flow Complet d'Attribution XP

### Exemple: Scanner de Frigo

```
1. USER: Capture photos frigo
   ↓
2. FRONTEND: useFridgeScanPipeline
   ↓
3. EDGE FUNCTION: fridge-scan-vision (Agent 1)
   ↓
4. EDGE FUNCTION: inventory-processor (Agent 2)
   ↓
5. EDGE FUNCTION: inventory-complementer (Agent 3)
   ↓
6. STORE: sessionActions.completeFridgeScan()
   ↓
7. GAMING: gamificationService.awardFridgeScanXp()
   ↓
8. DATABASE: INSERT xp_events_log + UPDATE user_gamification_progress
   ↓
9. UI NOTIFICATION: "🛒 Scan de frigo +30 XP"
```

---

## Multiplicateurs & Bonus

### Multiplicateur de Base

Toutes les actions Forge Culinaire bénéficient des **multiplicateurs gaming standard**:

1. **Streak**: +10% par jour consécutif (max +50%)
2. **First of Day**: Première action de la journée
3. **Weekly Completion**: Bonus actions hebdomadaires

### Formule XP Final

```typescript
// Ligne 310-316 (RPC award_xp)
finalXp = baseXp * multiplier;

// Exemple Fridge Scan avec streak 5 jours:
// baseXp = 30
// multiplier = 1.0 + (0.1 * 5) = 1.5
// finalXp = 30 * 1.5 = 45 XP
```

---

## Système Multi-Occurrences

### Comportement (v2.0)

**Table**: `daily_actions_completion`

**Logique**:
- ✅ **Première occurrence du jour**: Full XP + bonus
- ❌ **Occurrences suivantes**: Tracked mais 0 XP

**Exemple**:
```
Scanner frigo 1x: +30 XP (+ streak bonus)
Scanner frigo 2x: +0 XP (tracked only)
Scanner frigo 3x: +0 XP (tracked only)
```

**Colonnes tracking**:
- `is_first_of_day`: boolean
- `occurrence_number`: integer
- `xp_awarded`: integer (0 pour occurrences suivantes)

---

## Intégration Edge Functions

### Fridge Scan Vision

**Fichier**: `supabase/functions/fridge-scan-vision/index.ts`

Pas d'attribution XP directe dans l'Edge Function. L'attribution se fait côté frontend après validation utilisateur.

### Inventory Complementer

Idem, pas d'attribution directe. XP attribué après acceptation suggestions.

### Recipe Generator

**Fichier**: `supabase/functions/recipe-generator/index.ts`

Pas d'attribution XP dans Edge Function. Attribution dans store frontend après validation recette.

### Meal Plan Generator

**Fichier**: `supabase/functions/meal-plan-generator/index.ts`

Pas d'attribution XP dans Edge Function. Attribution après génération complète 7 jours.

### Shopping List Generator

**Fichier**: `supabase/functions/shopping-list-generator/index.ts`

Pas d'attribution XP dans Edge Function. Attribution après génération liste.

---

## Tables Supabase

### xp_events_log

Toutes les actions Forge Culinaire sont loggées:

```sql
CREATE TABLE xp_events_log (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  event_type text,              -- 'fridge_scan', 'recipe_generated', etc.
  event_category text,           -- 'nutrition'
  base_xp integer,              -- 30, 20, 35, 15
  multiplier numeric,           -- 1.0 + bonuses
  final_xp integer,             -- base_xp * multiplier
  event_date timestamptz,
  event_metadata jsonb,
  created_at timestamptz
);
```

### user_gamification_progress

Progression globale mise à jour:

```sql
CREATE TABLE user_gamification_progress (
  user_id uuid PRIMARY KEY,
  current_xp integer,
  current_level integer,
  total_xp_earned integer,
  current_streak_days integer,
  longest_streak_days integer,
  last_activity_date date,
  updated_at timestamptz
);
```

---

## Points Clés

1. **Toutes les actions Forge Culinaire donnent des XP** (30, 20, 35, 15)
2. **Attribution automatique** via `GamificationService`
3. **Notifications visuelles** rose `#EC4899` pour différenciation
4. **Multiplicateurs applicables** (streak, first of day)
5. **Multi-occurrences**: Seule la 1ère du jour donne XP
6. **Tracking complet** dans `xp_events_log`
7. **Intégration seamless** avec système gaming global

---

**Dernière mise à jour**: Novembre 2025
**Version**: 1.0 (Code-accurate)
**Fichier source**: `src/services/dashboard/coeur/GamificationService.ts`
