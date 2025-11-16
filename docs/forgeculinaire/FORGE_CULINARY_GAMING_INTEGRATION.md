# Forge Culinaire - Gaming System Integration

**Version:** 2.0 (Post-Correction)
**Date:** 2025-12-01
**Status:** ✅ Production Ready

---

## Overview

Ce document détaille l'intégration complète entre la **Forge Culinaire** (scanner de frigo, générateur de recettes, générateur de plan de repas, générateur de liste de courses) et le **Système de Gaming** (attribution XP, levels, streaks).

**Principe Fondamental:** La Forge Culinaire s'adapte au système de gaming, jamais l'inverse.

---

## Architecture Système

### Composants Principaux

```
┌─────────────────────────────────────────────────────────────┐
│                    FORGE CULINAIRE                          │
├─────────────────────────────────────────────────────────────┤
│  • Scanner de Frigo                                         │
│  • Générateur de Recettes                                   │
│  • Générateur de Plan de Repas                              │
│  • Générateur de Liste de Courses                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Utilise GamificationService
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              SYSTÈME DE GAMING (COEUR)                      │
├─────────────────────────────────────────────────────────────┤
│  GamificationService                                        │
│    ├─ awardFridgeScanXp()                                   │
│    ├─ awardRecipeGeneratedXp()                              │
│    ├─ awardMealPlanGeneratedXp()                            │
│    └─ awardShoppingListGeneratedXp()                        │
├─────────────────────────────────────────────────────────────┤
│  award_xp() RPC Function                                    │
│    ├─ Calcule multiplicateurs (streak, etc.)                │
│    ├─ Gère les montées de niveau                            │
│    ├─ Log dans xp_events_log                                │
│    └─ Met à jour user_gamification_progress                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Valeurs XP Officielles

| Action | XP | Source | Catégorie |
|--------|-----|--------|-----------|
| **Scanner de Frigo** | 30 XP | `GamificationService.awardFridgeScanXp()` | nutrition |
| **Recette Générée** | 20 XP | `GamificationService.awardRecipeGeneratedXp()` | nutrition |
| **Plan de Repas Généré** | 35 XP | `GamificationService.awardMealPlanGeneratedXp()` | nutrition |
| **Liste de Courses Générée** | 15 XP | `GamificationService.awardShoppingListGeneratedXp()` | nutrition |

**Note:** Ces valeurs sont définies dans `src/services/dashboard/coeur/GamificationService.ts` lignes 71-81.

---

## Implémentations par Composant

### 1. Scanner de Frigo

**Fichier:** `src/system/store/fridgeScan/actions/sessionActions.ts`
**Moment d'Attribution:** Après la sauvegarde réussie de la session (quand l'utilisateur termine le scan)
**Ligne:** ~244-295

```typescript
// Award XP for fridge scan using GamificationService
(async () => {
  try {
    const userId = useUserStore.getState().session?.user?.id;

    if (!userId) return;

    const { gamificationService } = await import('../../../../services/dashboard/coeur');
    const xpResult = await gamificationService.awardFridgeScanXp(userId, {
      session_id: state.currentSessionId,
      items_detected: state.userEditedInventory.length,
      photo_count: state.capturedPhotos.length,
      timestamp: new Date().toISOString(),
      source: 'fridge_scan_pipeline'
    });

    logger.info('FRIDGE_SCAN_PIPELINE', 'XP awarded successfully', {
      xpAwarded: xpResult.xpAwarded,
      leveledUp: xpResult.leveledUp,
      newLevel: xpResult.newLevel
    });

    // Refresh gaming widget
    const { queryClient } = await import('../../../../app/providers/AppProviders');
    await queryClient.invalidateQueries({ queryKey: ['gamification-progress'] });
    await queryClient.invalidateQueries({ queryKey: ['xp-events'] });
  } catch (error) {
    logger.warn('Failed to award XP', { error });
    // Don't throw - XP failure should not block user workflow
  }
})();
```

**Métadonnées Transmises:**
- `session_id`: ID unique de la session de scan
- `items_detected`: Nombre d'items détectés dans le frigo
- `photo_count`: Nombre de photos capturées
- `timestamp`: Horodatage de l'action
- `source`: Source de l'action ('fridge_scan_pipeline')

---

### 2. Générateur de Recettes

**Fichiers:**
- `src/system/store/fridgeScan/actions/recipeGenerationActions.ts` (ligne ~614-663)
- `src/system/store/recipeGeneration/actions/generationActions.ts` (ligne ~464-510)

**Moment d'Attribution:** Après la génération complète des recettes (event 'complete' du SSE)

```typescript
// Award XP for recipe generation using GamificationService
(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || totalRecipesReceived === 0) return;

    const { gamificationService } = await import('../../../../services/dashboard/coeur');
    const xpResult = await gamificationService.awardRecipeGeneratedXp(user.id, {
      session_id: state.currentSessionId,
      recipes_generated: totalRecipesReceived,
      source: 'recipe_generation_pipeline',
      timestamp: new Date().toISOString()
    });

    logger.info('XP awarded for recipe generation', {
      xpAwarded: xpResult.xpAwarded,
      recipesGenerated: totalRecipesReceived
    });

    // Refresh gaming widget
    const { queryClient } = await import('../../../../app/providers/AppProviders');
    await queryClient.invalidateQueries({ queryKey: ['gamification-progress'] });
  } catch (error) {
    logger.warn('Failed to award XP', { error });
  }
})();
```

**Métadonnées Transmises:**
- `session_id`: ID de session
- `recipes_generated`: Nombre de recettes générées
- `recipe_id`: ID de la recette (si unique)
- `recipe_title`: Titre de la recette
- `ingredients_count`: Nombre d'ingrédients
- `source`: 'recipe_generation_pipeline' ou 'fridge_scan_pipeline'

---

### 3. Générateur de Plan de Repas

**Fichier:** `src/system/store/mealPlanStore/actions/generation/planGeneration.ts`
**Moment d'Attribution:** Après la génération complète du plan de 7 jours
**Ligne:** ~328-361

**✅ DÉJÀ CORRECTEMENT IMPLÉMENTÉ** - Ce composant suit déjà les bonnes pratiques.

```typescript
// Award XP for meal plan generation
(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id && readyDays.length === 7) {
      const { gamificationService } = await import('../../../../../services/dashboard/coeur');
      await gamificationService.awardMealPlanGeneratedXp(user.id, {
        weekNumber,
        planId: mealPlanData.id,
        daysGenerated: readyDays.length,
        timestamp: new Date().toISOString()
      });

      logger.info('XP awarded for meal plan generation', {
        planId: mealPlanData.id,
        xpAwarded: 35
      });

      // Force refetch
      const { queryClient } = await import('../../../../../app/providers/AppProviders');
      await queryClient.refetchQueries({ queryKey: ['gamification-progress'], type: 'active' });
    }
  } catch (xpError) {
    logger.warn('Failed to award XP for meal plan generation', { error: xpError });
  }
})();
```

**Métadonnées Transmises:**
- `weekNumber`: Numéro de la semaine
- `planId`: ID du plan généré
- `daysGenerated`: Nombre de jours générés (doit être 7)
- `timestamp`: Horodatage

---

### 4. Générateur de Liste de Courses

**Fichier:** `src/system/store/shoppingListGenerationPipeline/index.ts`
**Moment d'Attribution:** Après la génération complète de la liste
**Ligne:** ~448-499

```typescript
// Award XP for shopping list generation using GamificationService
(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { gamificationService } = await import('../../../services/dashboard/coeur');
    const xpResult = await gamificationService.awardShoppingListGeneratedXp(user.id, {
      list_id: shoppingListCandidate.id,
      list_name: shoppingListCandidate.name,
      total_items: shoppingListCandidate.totalItems,
      categories_count: shoppingListCandidate.categories.length,
      generation_mode: shoppingListCandidate.generationMode,
      session_id: currentSessionId,
      meal_plan_id: config.selectedMealPlanId,
      timestamp: new Date().toISOString()
    });

    logger.info('XP awarded for shopping list', {
      xpAwarded: xpResult.xpAwarded,
      totalItems: shoppingListCandidate.totalItems
    });

    // Refresh gaming widget
    const { queryClient } = await import('../../../app/providers/AppProviders');
    await queryClient.invalidateQueries({ queryKey: ['gamification-progress'] });
  } catch (error) {
    logger.warn('Failed to award XP', { error });
  }
})();
```

**Métadonnées Transmises:**
- `list_id`: ID de la liste
- `list_name`: Nom de la liste
- `total_items`: Nombre total d'items
- `categories_count`: Nombre de catégories
- `generation_mode`: 'user_only' ou 'user_and_family'
- `meal_plan_id`: ID du plan de repas source (si applicable)

---

## Base de Données

### Table: `forge_xp_actions`

Définit les valeurs XP pour chaque action Forge.

```sql
CREATE TABLE forge_xp_actions (
  action text PRIMARY KEY,
  xp_reward integer NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

**Valeurs Actuelles (Post-Correction):**

| action | xp_reward | description |
|--------|-----------|-------------|
| `fridge_scan` | 30 | Scanned fridge inventory (canonical name) |
| `fridge_scanned` | 30 | Scanned fridge inventory (legacy alias) |
| `recipe_generated` | 20 | Generated a recipe using AI |
| `meal_plan_generated` | 35 | Generated a weekly meal plan (canonical) |
| `meal_plan_created` | 35 | Generated a weekly meal plan (legacy alias) |
| `shopping_list_generated` | 15 | Generated a shopping list (canonical) |
| `shopping_list_created` | 15 | Generated a shopping list (legacy alias) |

### Function: `award_forge_xp(p_user_id, p_action, p_source)`

**Note:** Cette fonction RPC existe pour compatibilité legacy. **Le nouveau code doit utiliser `GamificationService` directement.**

**Fonctionnalités:**
- Supporte les alias d'actions (ancien/nouveau nommage)
- Map vers les noms canoniques
- Appelle en interne la logique similaire à `award_xp()`
- Log dans `xp_events_log` avec métadonnées complètes

### Table: `xp_events_log`

Stocke l'historique de toutes les attributions XP.

```sql
SELECT * FROM xp_events_log
WHERE user_id = '<user-id>'
  AND event_type IN ('fridge_scan', 'recipe_generated', 'meal_plan_generated', 'shopping_list_generated')
ORDER BY event_date DESC;
```

### Table: `user_gamification_progress`

Stocke la progression gaming de chaque utilisateur.

```sql
SELECT
  current_xp,
  current_level,
  total_xp_earned,
  xp_to_next_level,
  current_streak_days
FROM user_gamification_progress
WHERE user_id = '<user-id>';
```

---

## Pattern d'Intégration (Template)

Pour toute nouvelle fonctionnalité de la Forge Culinaire:

```typescript
// 1. Import du service de gamification
import { gamificationService } from '@/services/dashboard/coeur';

// 2. Après l'action réussie (dans un bloc async IIFE pour ne pas bloquer)
(async () => {
  try {
    // 3. Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logger.warn('USER_NOT_AUTHENTICATED', 'Cannot award XP');
      return;
    }

    // 4. Appeler la méthode appropriée du GamificationService
    const xpResult = await gamificationService.awardXXXXXp(user.id, {
      // Métadonnées spécifiques à l'action
      session_id: sessionId,
      timestamp: new Date().toISOString(),
      // ... autres métadonnées pertinentes
    });

    // 5. Logger le succès
    logger.info('XP_AWARDED', 'XP attribution successful', {
      xpAwarded: xpResult.xpAwarded,
      baseXp: xpResult.baseXp,
      multiplier: xpResult.multiplier,
      leveledUp: xpResult.leveledUp,
      newLevel: xpResult.newLevel
    });

    // 6. Rafraîchir le widget gaming
    const { queryClient } = await import('@/app/providers/AppProviders');
    await queryClient.invalidateQueries({ queryKey: ['gamification-progress'] });
    await queryClient.invalidateQueries({ queryKey: ['xp-events'] });
    await queryClient.invalidateQueries({ queryKey: ['daily-actions'] });

  } catch (error) {
    // 7. Logger l'erreur mais NE PAS BLOQUER l'utilisateur
    logger.warn('XP_ATTRIBUTION_FAILED', 'Failed to award XP', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    // NE PAS throw - l'échec d'attribution XP ne doit jamais bloquer le workflow
  }
})();
```

---

## Règles et Bonnes Pratiques

### ✅ À FAIRE

1. **Toujours utiliser `GamificationService`** - Jamais d'appels RPC directs
2. **Async IIFE** - Ne jamais bloquer le workflow utilisateur
3. **Vérifier l'authentification** - Toujours vérifier `user` avant attribution
4. **Logger les succès ET les échecs** - Pour debugging et monitoring
5. **Rafraîchir les queries React Query** - Pour mise à jour immédiate du widget
6. **Passer des métadonnées riches** - Pour traçabilité et analytics
7. **Catch silencieux** - Logger l'erreur mais ne pas throw

### ❌ À NE PAS FAIRE

1. ❌ **Ne JAMAIS appeler `supabase.rpc('award_forge_xp')` directement**
2. ❌ **Ne JAMAIS utiliser `useForgeXpRewards()`** pour les actions Forge Culinaire
3. ❌ **Ne JAMAIS bloquer l'utilisateur si l'attribution XP échoue**
4. ❌ **Ne JAMAIS attribuer des XP avant la fin de l'action** (attendre validation/sauvegarde)
5. ❌ **Ne JAMAIS modifier les tables gaming directement** (user_gamification_progress, xp_events_log)
6. ❌ **Ne JAMAIS créer de nouveaux RPC functions pour XP** - Utiliser GamificationService

---

## Debugging et Validation

### Logs à Vérifier

Après chaque action Forge, chercher ces logs:

```typescript
// Succès
logger.info('FRIDGE_SCAN_PIPELINE', 'XP awarded successfully via GamificationService', {
  xpAwarded: 30,
  baseXp: 30,
  multiplier: 1.0,
  leveledUp: false,
  newLevel: 5
});

// Échec
logger.warn('FRIDGE_SCAN_PIPELINE', 'Failed to award XP', {
  error: 'User not authenticated'
});
```

### Requêtes SQL de Validation

```sql
-- Vérifier l'événement XP le plus récent
SELECT
  event_type,
  base_xp,
  final_xp,
  event_category,
  event_metadata,
  event_date
FROM xp_events_log
WHERE user_id = '<user-id>'
ORDER BY event_date DESC
LIMIT 5;

-- Vérifier la progression totale
SELECT
  current_xp,
  total_xp_earned,
  current_level,
  xp_to_next_level,
  current_streak_days,
  last_activity_date
FROM user_gamification_progress
WHERE user_id = '<user-id>';

-- Vérifier les valeurs XP configurées
SELECT action, xp_reward, description
FROM forge_xp_actions
WHERE action IN ('fridge_scan', 'recipe_generated', 'meal_plan_generated', 'shopping_list_generated')
ORDER BY action;
```

---

## Migration Notes

### Changements Effectués (2025-12-01)

1. **Migration SQL:** `20251201000000_fix_forge_culinary_xp_values.sql`
   - Correction des valeurs XP dans `forge_xp_actions`
   - Ajout d'aliases pour compatibilité
   - Mise à jour de `award_forge_xp()` pour supporter les aliases

2. **Scanner de Frigo:** Refactorisé pour utiliser `GamificationService`
   - Fichier: `sessionActions.ts`
   - Changement: `useForgeXpRewards` → `gamificationService.awardFridgeScanXp()`

3. **Générateur de Recettes:** Refactorisé pour utiliser `GamificationService`
   - Fichiers: `recipeGenerationActions.ts`, `generationActions.ts`
   - Changement: `supabase.rpc('award_forge_xp')` → `gamificationService.awardRecipeGeneratedXp()`

4. **Générateur de Liste de Courses:** Refactorisé pour utiliser `GamificationService`
   - Fichier: `shoppingListGenerationPipeline/index.ts`
   - Changement: `useForgeXpRewards` → `gamificationService.awardShoppingListGeneratedXp()`

5. **Générateur de Plan de Repas:** ✅ Déjà correct
   - Fichier: `planGeneration.ts`
   - Aucun changement nécessaire

### Tests de Validation

Après déploiement, valider chaque composant:

- [ ] Scanner de frigo → 30 XP attribués
- [ ] Génération de recette → 20 XP attribués
- [ ] Génération de plan de repas → 35 XP attribués
- [ ] Génération de liste de courses → 15 XP attribués
- [ ] Widget gaming rafraîchi immédiatement
- [ ] Logs présents dans `xp_events_log`
- [ ] `user_gamification_progress` mis à jour correctement
- [ ] Multiplicateurs de streak appliqués (si série active)
- [ ] Montée de niveau déclenchée si seuil atteint

---

## Problèmes Connus et Solutions

### Problème: XP non attribués

**Symptômes:**
- Aucun log d'attribution XP
- Widget gaming ne se rafraîchit pas
- Pas d'entrée dans `xp_events_log`

**Solutions:**
1. Vérifier que l'utilisateur est authentifié
2. Vérifier les logs d'erreur dans la console
3. Vérifier que `gamificationService` est bien importé
4. Vérifier que la méthode appropriée est appelée
5. Vérifier les permissions RLS sur les tables gaming

### Problème: Mauvaise valeur XP

**Symptômes:**
- XP attribués ne correspondent pas aux valeurs attendues
- XP affichés différents de la base de données

**Solutions:**
1. Vérifier la table `forge_xp_actions` pour les valeurs configurées
2. Vérifier que la migration `20251201000000` a bien été appliquée
3. Vérifier les logs pour voir la valeur `baseXp` vs `finalXp`
4. Vérifier les multiplicateurs de streak

### Problème: Widget gaming ne se rafraîchit pas

**Symptômes:**
- XP attribués mais widget ne s'actualise pas
- Nécessite un refresh manuel de la page

**Solutions:**
1. Vérifier que `queryClient.invalidateQueries()` est appelé
2. Vérifier que les queries keys sont corrects
3. Vérifier la console pour des erreurs React Query
4. Forcer un refetch avec `refetchQueries()` au lieu de `invalidateQueries()`

---

## Contact et Support

Pour toute question ou problème d'intégration:

1. Consulter ce document en premier
2. Vérifier les logs de l'application
3. Vérifier les tables `xp_events_log` et `user_gamification_progress`
4. Consulter le code de référence du Générateur de Plan de Repas (déjà correct)
5. Créer un ticket avec logs et requêtes SQL de debug

---

**Document maintenu par:** Équipe Gaming System
**Dernière mise à jour:** 2025-12-01
**Version:** 2.0
