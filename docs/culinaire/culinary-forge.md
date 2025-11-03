# Culinary Forge (Recipe Workshop) - Technical Documentation

**Status:** Production Ready
**Version:** 1.0
**Last Update:** January 2025

---

## Overview

The Culinary Forge is TwinForge's intelligent recipe and meal planning system. It enables users to scan their fridge, build a smart inventory, generate personalized recipes, create optimized meal plans, and generate shopping lists through a complete AI-powered pipeline.

---

## Core Capabilities

### 1. Computer Vision Fridge Scanning
- **Multi-image support**: Up to 6 photos per scan
- **AI Vision Model**: GPT-4o Vision for ingredient detection
- **Detection accuracy**: 85-95% confidence average
- **Processing time**: 8-20 seconds per scan

### 2. Smart Inventory Management
- Real-time quantity tracking
- Freshness scoring (0-1 scale)
- Automatic categorization
- Expiry date estimation
- User editing capabilities

### 3. Personalized Recipe Generation
- **AI Model**: GPT-5 Mini with streaming
- **Generation mode**: Progressive (5-10 recipes per batch)
- **Customization**: Respects allergies, diet restrictions, equipment, skill level
- **Optimization**: Based on available inventory
- **Processing time**: 15-45 seconds with streaming

### 4. Weekly Meal Planning
- **AI Model**: GPT-5 Mini
- **Optimization**: Nutritional balance + inventory usage
- **Scope**: 7-day plans with breakfast/lunch/dinner/snacks
- **Processing time**: 20-60 seconds per week
- **Intelligence**: AI explanations for meal choices

### 5. Smart Shopping Lists
- **AI Model**: GPT-5 Mini
- **Organization**: By aisle/category
- **Features**: Quantity aggregation, budget estimation
- **Processing time**: 8-20 seconds per list

---

## Technical Architecture

### Pipeline Flow
```
User Photos → Fridge Scan Vision → Inventory Processing → Complementary Suggestions
    ↓
Database (fridge_items + recipe_sessions)
    ↓
Recipe Generation (Streaming) → Database (recipes)
    ↓
Meal Plan Generation → Database (meal_plans)
    ↓
Shopping List Generation → Frontend Export
```

### Edge Functions (8 Agents)

1. **fridge-scan-vision** (GPT-4o Vision)
   - Multi-image analysis (1-6 photos)
   - Ingredient detection with bounding boxes
   - Quantity and freshness estimation

2. **inventory-processor** (GPT-5 Mini)
   - Data normalization and validation
   - Smart categorization
   - Duplicate detection

3. **inventory-complementer** (GPT-5 Mini)
   - Logical complement suggestions
   - Recipe possibilities identification
   - Nutritional gap detection

4. **recipe-generator** (GPT-5 Mini + Streaming)
   - Progressive generation (SSE)
   - Strict constraint compliance (allergies, diet)
   - Inventory-optimized recipes
   - Skill level adaptation

5. **recipe-detail-generator** (GPT-5 Mini)
   - Step-by-step instructions
   - Precise timing per step
   - Equipment lists
   - Chef tips

6. **meal-plan-generator** (GPT-5 Mini)
   - Weekly optimization
   - Daily nutritional balance
   - Maximum inventory usage
   - Meal variety

7. **shopping-list-generator** (GPT-5 Mini)
   - Aisle organization
   - Quantity aggregation
   - Budget estimation
   - Personalized buying tips

8. **image-generator** (DALL-E 3, Optional)
   - Culinary photography style
   - Recipe-specific images
   - Standard/HD quality options

---

## Database Schema

### Core Tables

**fridge_items**
- Session-based inventory storage
- User editing support
- Freshness tracking
- RLS enabled

**recipes**
- Complete recipe data (ingredients, instructions, nutrition)
- Session linkage
- Dietary tags
- Image URLs (optional)

**recipe_sessions**
- Inventory snapshots
- Selected recipe IDs
- User preferences capture
- Generation status tracking

**meal_plans**
- Weekly plan data (7 days × meals)
- Nutritional summaries
- AI explanations
- Session linkage

**shopping_lists**
- Organized by category
- Budget estimations
- Linked to meal plans
- Optional suggestions

**ai_analysis_jobs**
- Cost tracking
- Cache management (input_hash)
- Deduplication
- Error logging

---

## Profile Integration

### Critical Fields (Required)
- **allergies**: Filters dangerous ingredients
- **intolerances**: Excludes incompatible foods
- **diet**: Dietary restrictions (vegetarian, vegan, keto, etc.)

### Optimization Fields (Enhanced Personalization)
- **objective**: Influences recipe nutritional profile
- **macroTargets**: Guides nutritional values
- **household**: Servings calculation
- **kitchenEquipment**: Available cooking tools
- **mealPrepPreferences**: Time constraints, skill level
- **foodPreferences**: Liked/disliked cuisines and ingredients
- **shoppingPreferences**: Budget, frequency, buying preferences

---

## Cost Management

### Per-Component Costs (Estimated)
- Fridge scan: $0.0015–0.008 (1-6 images)
- Inventory processing: $0.0005–0.002
- Complementary suggestions: $0.001–0.004
- Recipe generation (5-10): $0.003–0.012
- Recipe details: $0.002–0.008
- Meal plan (weekly): $0.005–0.020
- Shopping list: $0.002–0.008
- Recipe image: $0.04 (optional)

### Complete Pipeline Average
- Scan → Inventory: $0.003–0.014
- Inventory → Recipes: $0.003–0.012
- Recipes → Plan: $0.005–0.020
- Plan → Shopping List: $0.002–0.008
- **Total (without images)**: $0.013–0.054

### Cost Optimization Strategy
- **Intelligent caching**: 36h recipes, 48h plans, 24h lists
- **Data thresholds**: Minimum inventory required
- **Graceful fallbacks**: Basic data without extra cost
- **Monitoring**: Per-user tracking and quotas

---

## Performance Metrics

### SLO Targets (p95)
- Fridge scan → Saved inventory: < 30 seconds
- Inventory → 10 recipes: < 60 seconds
- Inventory → Weekly plan: < 90 seconds
- Success rate per step: > 95%
- Cache hit rate: > 40% recipes, > 60% plans

### Optimization Features
- React Query caching (adaptive staleTime)
- Zustand persistence (localStorage)
- Server-Sent Events (SSE) for streaming
- Lazy loading (12 recipes per page)
- Client-side image compression

---

## UI/UX System Integration

### Design System
- **VisionOS 26 Liquid Glass Premium**: Consistent across all tabs
- **Tab Colors**: Distinct per section (Cyan, Pink, Violet, Orange)
- **Animations**: Spring physics with reduced-motion support
- **Haptic Feedback**: Success, error, selection patterns

### Sound Design
- **"Strike & Bloom" Audio**: Interaction feedback system
- **Spatial Effects**: Contextual audio cues
- **Navigation Sounds**: Tab switches, confirmations
- **Status Sounds**: Success, warning, error states

### Haptic Patterns
- **Tap (10ms)**: Standard buttons
- **Press (20ms)**: Important actions
- **Impact (30ms)**: Critical actions
- **Success [10,50,10]**: Recipe saved, plan generated
- **Error [30,50,30]**: Generation failure, validation error

---

## Four-Tab System

### 1. Inventory Tab (Cyan #06B6D4)
**Purpose**: Manage saved inventories, launch generations

**Key Components**:
- `FridgeSessionList`: Inventory history
- `InventoryManagementHeader`: Bulk actions
- `SelectedInventoryActionsCard`: Generation triggers
- `UserGuideCard`: Onboarding guidance

**Actions**:
- Select inventory for recipe/plan generation
- Delete individual or all inventories
- Launch new fridge scan
- View inventory details

### 2. Recipes Tab (Pink #EC4899)
**Purpose**: Browse, filter, manage generated recipes

**Key Components**:
- `RecipeCard`: Individual recipe display
- `RecipeFilterSystem`: Advanced filtering UI
- `RecipeGenerationLoader`: Streaming progress
- `EmptyRecipesState`: Guidance for new users

**Features**:
- Search by title/ingredients
- Filter by dietary tags, time, servings
- Save/unsave favorites
- Export to PDF/JSON/text
- Delete individual recipes
- View detailed instructions (modal)

### 3. Plan Tab (Violet #8B5CF6)
**Purpose**: Create and manage weekly meal plans

**Key Components**:
- `DayPlanCard`: Daily meal breakdown
- `WeekNavigator`: Week selection
- `NutritionalSummary`: Nutritional breakdown
- `AIExplanationCard`: AI reasoning display
- `PlanActions`: Export/regenerate/save

**Features**:
- Generate weekly plans from inventory
- Navigate between weeks
- View daily nutritional totals
- Export plan (PDF/JSON)
- Regenerate specific weeks
- View AI explanations

### 4. Shopping Tab (Orange #F59E0B)
**Purpose**: Generate and manage shopping lists

**Key Components**:
- `ShoppingListCategory`: Aisle organization
- `ShoppingListItem`: Individual items with quantities
- `BudgetEstimationCard`: AI cost estimation
- `ShoppingListAdvice`: Personalized tips
- `ShoppingListExportActions`: Export options

**Features**:
- Generate from meal plans
- Check/uncheck items
- View budget estimation
- Organize by aisle
- Export (text/PDF/share)
- View shopping tips

---

## Key Synchronization Points

### Frontend ↔ Backend
- **React Query keys**: Standardized per resource type
- **Zustand pipeline state**: Persisted in localStorage
- **Real-time updates**: Invalidation on mutations
- **Optimistic updates**: Immediate UI feedback

### Profile ↔ Culinary Forge
- **Bidirectional sync**: Profile changes trigger regeneration flags
- **Snapshot system**: Preferences captured per session
- **Impact tracking**: Profile fields → Recipe/Plan adaptation

### Audio/Haptic ↔ UI Actions
- **Generation start**: Impact haptic + spatial sound
- **Recipe saved**: Success haptic + confirmation sound
- **Error occurred**: Error haptic + alert sound
- **Tab switch**: Selection haptic + navigation sound

### CSS ↔ Design System
- **Tab color system**: CSS variables from tabsConfig.ts
- **Glass morphism**: Unified card system (glassV2)
- **Animations**: Framer Motion variants (visionos-mobile.ts)
- **Responsive breakpoints**: Mobile-first approach

---

## Critical Integration Notes

### For Multi-Project Fusion
1. **Shared Types**: Recipe, ShoppingList, MealPlan interfaces must match across projects
2. **Edge Function Contracts**: Input/output schemas must be identical
3. **Database Schema**: RLS policies and table structures must align
4. **Profile Structure**: Field names and validation schemas must be consistent
5. **CSS Variables**: Design tokens (colors, spacing, shadows) must match
6. **Animation Variants**: Motion configuration values must be synchronized
7. **Haptic Patterns**: Duration arrays must be identical
8. **Audio Events**: Event names and parameters must match

### Critical Configuration
- **Cache durations**: Must match across projects (36h/48h/24h)
- **Debounce timings**: Consistent validation delays (500ms)
- **Auto-save intervals**: Aligned save cycles (30s)
- **Retry strategies**: Identical backoff algorithms
- **Feature flags**: Same flag names and default values

---

## Future Central Brain Integration

### Exportable Metrics
- **Culinary habits**: Preferred recipe types, cooking frequency
- **Shopping patterns**: Budget usage, frequency, preferences
- **Nutritional compliance**: Macro targets adherence
- **Waste tracking**: Inventory usage rate

### Cross-Forge Correlations
- **With Nutritional Forge**: Generated recipes vs. actual meals consumed
- **With Energy Forge**: Meal timing vs. workout schedules
- **With Time Forge**: Meal plans optimized for fasting windows
- **With Body Forge**: Recipes adapted to morphological objectives

---

## Success Criteria for Fusion

### Technical
- ✅ All Edge Functions deployed with identical contracts
- ✅ Database migrations applied in correct order
- ✅ RLS policies tested and validated
- ✅ Profile fields synchronized
- ✅ CSS design tokens aligned

### UX
- ✅ Tab transitions smooth across all forges
- ✅ Audio/haptic feedback consistent
- ✅ Animations perform well on target devices
- ✅ Glass morphism rendering correctly

### Data
- ✅ Cache mechanisms working (hit rates meet targets)
- ✅ Cost tracking accurate
- ✅ User data properly isolated (RLS)
- ✅ Cross-forge data accessible where needed

---

**For Internal Team**: This document contains all critical technical details needed to integrate the Culinary Forge with other TwinForge features. Focus on synchronization points and configuration consistency during fusion.
