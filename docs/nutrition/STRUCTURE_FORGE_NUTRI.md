# TwinForge — Nutritional Forge Project Structure
**Version:** 1.0 • **Status:** Functional • **Last Update:** January 2025

Complete documentation of the file and folder organization for the Nutritional Forge (meal scanning system) of TwinForge.

---

## 📋 Table of Contents

- [Nutritional Forge Overview](#nutritional-forge-overview)
- [Feature Architecture](#feature-architecture)
- [Page Structure](#page-structure)
- [Components by Category](#components-by-category)
- [Hooks and Business Logic](#hooks-and-business-logic)
- [Utilities and Helpers](#utilities-and-helpers)
- [Edge Functions](#edge-functions)
- [Profile Integration](#profile-integration)
- [Configuration Files](#configuration-files)
- [Styles and Animations](#styles-and-animations)
- [Database](#database)

---

## 🎯 Nutritional Forge Overview

The Nutritional Forge is TwinForge's meal scanning system, allowing users to capture, analyze, and understand their nutritional intake through a complete intelligent pipeline powered by advanced AI vision technology.

### Objectives
- **Intuitive capture:** Simple photo-based meal scanning via camera or gallery
- **Advanced AI analysis:** Food identification, quantity estimation, and macro/calorie calculation
- **Personalized insights:** Recommendations adapted to user profile and nutritional goals
- **Rich tracking:** Visualizations, trends, and patterns for nutritional progression
- **Intelligent cache:** Cost optimization with smart caching strategies

### Value Added
- **Natural interaction:** Photo-based input eliminates manual food logging
- **Precision analysis:** AI-powered food detection with confidence scoring
- **Contextual advice:** Recommendations based on objectives, allergies, and preferences
- **Comprehensive tracking:** Daily summaries, trend analysis, and progression metrics
- **Seamless integration:** Synchronized with user profile and other TwinForge modules

---

## 🏗️ Feature Architecture

### Tech Stack
- **Frontend:** React 18 + TypeScript + Framer Motion
- **State Management:** Zustand (scan pipeline) + React Query (network cache with localStorage persistence)
- **Backend:** Supabase Edge Functions (Deno)
- **Spatial Forge:** OpenAI GPT-5 Vision (Mini/Nano) for image analysis and insights
- **Image Processing:** Client-side compression and Base64 conversion
- **Database:** PostgreSQL with RLS and automatic triggers

### Data Flow

```
User (Photo Capture)
    ↓
Frontend (Image Processing + Validation)
    ↓
Edge Function: meal-analyzer (GPT-5 Vision + Food Database)
    ↓
Database (meals table)
    ↓
Edge Functions: daily-nutrition-summary / nutrition-trend-analysis (GPT-5 Mini + Cache)
    ↓
Frontend (Visualizations + AI Insights)
```

---

## 📁 Page Structure

### Main Pages

```
src/app/pages/
├─ Meals/
│  ├─ MealsPage.tsx              # Main page with 4 tabs (Today, Insights, Progression, History)
│  └─ MealScanFlowPage.tsx       # Scan pipeline (Capture → Processing → Results)
```

---

## 🧩 Components by Category

### 📁 Complete Component Structure

```
src/app/pages/Meals/
├─ components/
│  ├─ Tabs/
│  │  ├─ DailyRecapTab.tsx       # Today: current status & daily summary
│  │  ├─ MealInsightsTab.tsx     # Insights: AI pattern analysis
│  │  ├─ ProgressionTab.tsx      # Progression: metrics & trends
│  │  └─ MealHistoryTab.tsx      # History: complete meal records
│  ├─ ScanFlow/
│  │  ├─ MealPhotoCaptureStep/
│  │  │  ├─ index.tsx            # Photo capture orchestrator
│  │  │  ├─ CaptureGuide.tsx     # Visual capture guide
│  │  │  ├─ CapturedPhotoDisplay.tsx # Photo preview
│  │  │  ├─ NavigationControls.tsx # Navigation buttons
│  │  │  └─ ReadyForProcessing.tsx # Processing readiness indicator
│  │  ├─ MealAnalysisProcessingStep/
│  │  │  ├─ index.tsx            # Analysis orchestrator
│  │  │  ├─ AnalysisViewport.tsx # Immersive analysis view
│  │  │  ├─ ProgressDisplay.tsx  # Detailed progress bar
│  │  │  ├─ AnalysisOverlays.tsx # Visual overlays
│  │  │  └─ DataFlowVisualization.tsx # Data flow animations
│  │  └─ MealResultsDisplayStep/
│  │     ├─ index.tsx            # Results orchestrator
│  │     ├─ CalorieHighlightCard.tsx # Calorie emphasis
│  │     ├─ MacronutrientsCard.tsx # Macro breakdown
│  │     ├─ DetectedFoodsCard.tsx # Food list with details
│  │     ├─ PhotoDisplayCard.tsx # Analyzed photo display
│  │     └─ ActionButtons.tsx    # Save/retry/new scan actions
│  ├─ DailyRecap/
│  │  ├─ DailyStatsGrid.tsx      # Daily metrics grid
│  │  ├─ CalorieProgressCard.tsx # Calorie goal progress
│  │  ├─ CalorieAnalysis.tsx     # Calorie analysis utilities
│  │  ├─ MacronutrientsCard.tsx  # Macro summary card
│  │  ├─ MacroAnalysis.tsx       # Macro analysis utilities
│  │  ├─ RecentMealsCard.tsx     # Recent meals list
│  │  ├─ DailyRecapSkeleton.tsx  # Loading skeleton
│  │  ├─ ProfileCompletenessAlert.tsx # Profile completion alert
│  │  └─ DynamicScanCTA/
│  │     ├─ index.tsx            # Adaptive call-to-action
│  │     ├─ contextAnalysis.ts   # Nutritional context analysis
│  │     ├─ messageGenerator.ts  # Dynamic message generation
│  │     └─ urgencyCalculator.ts # CTA urgency calculation
│  ├─ MealInsights/
│  │  ├─ AIInsightCards.tsx      # AI insight cards
│  │  ├─ AILoadingSkeleton.tsx   # AI loading animation
│  │  ├─ MacroDistributionChart.tsx # Macro distribution visualization
│  │  ├─ NutritionHeatmap.tsx    # Nutritional activity heatmap
│  │  ├─ CalorieTrendChart.tsx   # Calorie trend visualization
│  │  ├─ ProgressionMetrics.tsx  # Progression metrics display
│  │  ├─ chartDataUtils.ts       # Chart data utilities
│  │  └─ progressionMetricsUtils.ts # Progression calculation utilities
│  ├─ shared/
│  │  ├─ MealProgressHeader.tsx  # Progress header component
│  │  └─ MealDetailModal.tsx     # Meal detail modal
│  └─ MealScanFlow/
│     ├─ ScanFlowState.tsx       # Scan flow state definitions
│     ├─ ScanFlowHandlers.tsx    # Scan flow event handlers
│     ├─ ScanExitConfirmationModal.tsx # Exit confirmation modal
│     └─ AIStatusBadge.tsx       # AI processing status badge
├─ DailyRecapTab.tsx             # Today tab implementation
├─ MealInsightsTab.tsx           # Insights tab implementation
├─ ProgressionTab.tsx            # Progression tab implementation
├─ MealHistoryTab.tsx            # History tab implementation
└─ MealScanFlowPage.tsx          # Main scan pipeline page
```

### 📝 Category Descriptions

**Tabs:** Main tabs of MealsPage
- `DailyRecapTab`: Current nutritional status and today's meals
- `MealInsightsTab`: AI analysis of nutritional patterns and trends
- `ProgressionTab`: Progression metrics and long-term trends
- `MealHistoryTab`: Complete meal history with filtering

**ScanFlow:** MealScanFlowPage pipeline steps
- `MealPhotoCaptureStep`: Photo capture with guidance and validation
- `MealAnalysisProcessingStep`: Real-time AI analysis with visual feedback
- `MealResultsDisplayStep`: Results display with save/retry options

**DailyRecap:** Today tab specific components
- `DailyStatsGrid`: Daily nutritional metrics overview
- `CalorieProgressCard`: Progress toward daily calorie goals
- `MacronutrientsCard`: Macronutrient breakdown and analysis
- `RecentMealsCard`: Today's meals with management options
- `DynamicScanCTA`: Context-aware call-to-action for scanning

**MealInsights:** AI analysis specific components
- `AIInsightCards`: Individual AI-generated insights with actions
- `MacroDistributionChart`: Visual macro distribution over time
- `NutritionHeatmap`: GitHub-style nutritional activity calendar
- `CalorieTrendChart`: Calorie intake trends and patterns
- `ProgressionMetrics`: Key progression indicators

**Shared:** Components used across tabs and flows
- `MealProgressHeader`: Real-time progress indication
- `MealDetailModal`: Detailed meal information modal
- `ScanExitConfirmationModal`: Confirmation for exiting during AI processing

---

## 🎣 Hooks and Business Logic

### 📁 Specialized Hooks and Logic

```
src/system/data/repositories/
└─ mealsRepo.ts                  # Meal operations and AI calls repository

src/app/pages/Profile/hooks/
└─ useProfileNutritionForm.ts    # Nutrition profile form management

src/app/pages/Meals/components/MealScanFlow/
├─ ScanFlowHandlers.tsx          # Scan pipeline state management
└─ ScanFlowState.tsx             # Scan flow state definitions
```

### 📝 Hook Responsibilities

**mealsRepo.ts** - Core meal operations
- **CRUD operations:** Create, read, update, delete meals with RLS
- **AI integration:** Calls to meal-analyzer, daily-nutrition-summary, nutrition-trend-analysis
- **Cache management:** Intelligent caching with invalidation strategies
- **Error handling:** Graceful fallbacks and retry logic

**ScanFlowHandlers.tsx** - Scan pipeline management
- **State orchestration:** Manages capture → processing → results flow
- **AI coordination:** Handles AI analysis requests and responses
- **Navigation protection:** Prevents accidental exit during processing
- **Error recovery:** Handles failures with user-friendly messaging

**useProfileNutritionForm.ts** - Profile integration
- **Form management:** Nutrition preferences, allergies, goals
- **Validation:** Ensures data consistency and completeness
- **Synchronization:** Bidirectional sync with meal analysis
- **Calculations:** Automatic protein targets and calorie goals

---

## 🛠️ Utilities and Helpers

### 📁 Nutritional Forge Utilities

```
src/lib/
├─ storage/
│  └─ imageUpload.ts             # Image upload and processing utilities
├─ nutrition/
│  ├─ proteinCalculator.ts       # Protein requirement calculations
│  └─ fastingProtocols.ts        # Fasting protocol definitions (profile integration)
└─ profile/
   └─ profileCompleteness.ts     # Profile completion analysis

src/app/pages/Meals/components/
├─ DailyRecap/
│  ├─ CalorieAnalysis.tsx        # Calorie analysis utilities
│  ├─ MacroAnalysis.tsx          # Macronutrient analysis utilities
│  └─ DynamicScanCTA/
│     ├─ contextAnalysis.ts      # Nutritional context analysis
│     ├─ messageGenerator.ts     # Dynamic message generation
│     └─ urgencyCalculator.ts    # CTA urgency calculation
├─ MealInsights/
│  ├─ chartDataUtils.ts          # Chart data processing utilities
│  └─ progressionMetricsUtils.ts # Progression metrics calculations
└─ MealScanFlow/
   └─ ScanFlowState.tsx          # Scan flow state definitions
```

### 📝 Key Utility Functions

**imageUpload.ts** - Image processing
- `compressImage()`: Client-side image compression for AI processing
- `convertToBase64()`: Image to Base64 conversion for API calls
- `validateImageFormat()`: Format and size validation
- `generateImageMetadata()`: Extract image metadata for analysis

**proteinCalculator.ts** - Nutritional calculations
- `calculateProteinTarget()`: Daily protein requirements based on profile
- `calculateCalorieTarget()`: Daily calorie goals based on objectives
- `calculateMacroDistribution()`: Optimal macro ratios for goals
- `assessNutritionalBalance()`: Meal balance evaluation

**contextAnalysis.ts** - CTA intelligence
- `analyzeNutritionalContext()`: Current nutritional status assessment
- `calculateScanUrgency()`: Urgency scoring for scan recommendations
- `generateContextualMessage()`: Personalized CTA messaging
- `determineOptimalScanTiming()`: Best times for meal scanning

**chartDataUtils.ts** - Visualization data
- `processCalorieTrendData()`: Calorie trend chart data preparation
- `calculateMacroDistribution()`: Macro distribution chart data
- `generateHeatmapData()`: Nutritional heatmap data processing
- `formatProgressionMetrics()`: Progression metrics formatting

---

## ⚡ Edge Functions

### 📁 Serverless Functions

```
supabase/functions/
├─ meal-analyzer/                # Agent 1: Image analysis and food detection
│  └─ index.ts                   # GPT-5 Vision + Food database integration
├─ daily-nutrition-summary/      # Agent 2: Daily nutritional summary
│  └─ index.ts                   # GPT-5 Mini + Daily aggregation
└─ nutrition-trend-analysis/     # Agent 3: Trend analysis and insights
   └─ index.ts                   # GPT-5 Mini + Pattern detection
```

### 📝 Edge Function Specialties

**meal-analyzer** - Image analysis and food detection
- **Model:** OpenAI GPT-5 Vision (Mini/Nano)
- **Specialties:** Food identification, portion estimation, nutritional calculation
- **Performance:** 5-20 seconds, ~$0.00025-$0.0025 USD, 80% confidence
- **Features:** Personalized insights, allergy detection, macro calculation
- **Fallback:** Basic estimation if AI fails

**daily-nutrition-summary** - Daily summary generation
- **Model:** GPT-5 Mini optimized for nutritional analysis
- **Specialties:** Daily aggregation, goal assessment, personalized recommendations
- **Cache:** 24 hours with automatic invalidation on new meals
- **Performance:** 3-10 seconds, ~$0.00025-$0.0025 USD, 85% confidence
- **Features:** Highlights, improvements, proactive alerts, overall scoring

**nutrition-trend-analysis** - Pattern analysis and strategic advice
- **Model:** GPT-5 Mini optimized for temporal data analysis
- **Specialties:** Trend detection, strategic recommendations, meal classification
- **Cache:** 24 hours (7-day analysis), 7 days (30-day analysis)
- **Performance:** 8-25 seconds, ~$0.0005-$0.005 USD, 80% confidence
- **Features:** Pattern recognition, compliance analysis, long-term strategy

---

## 👤 Profile Integration

### 📁 Integration Files

```
src/app/pages/Profile/
├─ ProfileNutritionTab.tsx       # Nutritional configuration in profile
├─ hooks/
│  └─ useProfileNutritionForm.ts # Nutrition form management
└─ validation/
   └─ profileNutritionValidation.ts # Nutrition data validation

src/system/store/
├─ userStore.ts                  # Profile data synchronization
└─ profileMappers.ts             # Profile data mapping utilities
```

### 📝 Profile Fields Used

**Critical Fields (Required for AI):**
- `weight_kg`: Calorie and protein requirement calculations
- `height_cm`: BMI calculations and metabolic adjustments
- `sex`: Gender-specific nutritional adjustments
- `objective`: Advice adaptation (fat_loss, muscle_gain, recomp)
- `activity_level`: TDEE calculations and recommendations

**Nutritional Configuration:**
- `nutrition.diet`: Dietary preferences (vegetarian, keto, etc.)
- `nutrition.allergies`: Allergy detection and avoidance
- `nutrition.intolerances`: Intolerance management
- `nutrition.proteinTarget_g`: Custom protein targets
- `nutrition.fastingWindow`: Meal timing context
- `nutrition.mealsPerDay`: Meal frequency preferences

**Optimizing Fields:**
- `birthdate`: Age-based metabolic adjustments
- `emotions.chronotype`: Optimal meal timing suggestions
- `emotions.stress`: Stress-based nutritional recommendations
- `job_category`: Lifestyle-based meal suggestions

---

## ⚙️ Configuration Files

### 📁 Specific Configuration

```
src/config/
└─ featureFlags.ts               # Feature flags for meal scanning
```

### 📝 Available Feature Flags

- `MEAL_SCAN_ENABLED`: Enable/disable meal scanning functionality
- `AI_ANALYSIS_ENABLED`: Toggle AI analysis features
- `MOCK_MEAL_DATA`: Use mock data for development
- `BYPASS_MIN_DATA_FOR_AI`: Bypass minimum data requirements for AI
- `MEAL_CACHE_DURATION`: Cache duration for AI analyses (default 24h)
- `IMAGE_COMPRESSION_QUALITY`: Image compression settings for AI processing

---

## 🎨 Styles and Animations

### 📁 Nutritional Forge Specific Styles

```
src/styles/
├─ components/
│  ├─ meal-scan.css              # Meal scanning component styles
│  └─ celebration-animations.css # Success celebration animations
├─ glassV2/
│  └─ animations.css             # Glass morphism animations (breathing, pulse, shimmer)
└─ effects/
   └─ motion.css                 # Spatial icon animations and transitions
```

### 📝 Meal-Specific Animations

- **Forge halo effects:** Glowing borders during AI processing
- **Particle animations:** Success celebrations for meal saves
- **Shimmer effects:** Loading states for AI analysis
- **Progress animations:** Smooth progress bar updates during processing
- **Photo capture effects:** Visual feedback for photo capture
- **Result reveal animations:** Smooth transitions for analysis results

---

## 🗄️ Database

### 📁 Main Tables

```sql
meals                           # User meal records
├─ id (uuid, PK)
├─ user_id (uuid, FK → users)
├─ timestamp (timestamptz)
├─ items (jsonb)                # Detected food items with nutritional data
├─ total_kcal (integer)
├─ meal_type (text)             # breakfast, lunch, dinner, snack
├─ meal_name (text)
├─ photo_url (text)             # Supabase Storage URL
└─ created_at (timestamptz)

ai_daily_summaries              # Daily nutritional summary cache
├─ id (uuid, PK)
├─ user_id (uuid, FK → users)
├─ analysis_date (date)
├─ summary (text)               # AI-generated daily summary
├─ highlights (jsonb)           # Daily highlights array
├─ improvements (jsonb)         # Improvement suggestions
├─ proactive_alerts (jsonb)     # Proactive alerts
├─ overall_score (integer)      # Daily nutrition score (0-100)
├─ recommendations (jsonb)      # Personalized recommendations
├─ model_used (text)            # AI model version
├─ tokens_used (jsonb)          # Token usage tracking
└─ created_at (timestamptz)

ai_trend_analyses               # Trend analysis cache
├─ id (uuid, PK)
├─ user_id (uuid, FK → users)
├─ analysis_period (text)       # 7_days, 30_days
├─ trends (jsonb)               # Detected trends array
├─ strategic_advice (jsonb)     # Strategic recommendations
├─ meal_classifications (jsonb) # Individual meal classifications
├─ diet_compliance (jsonb)      # Diet compliance analysis
├─ model_used (text)            # AI model version
├─ tokens_used (jsonb)          # Token usage tracking
└─ created_at (timestamptz)
```

### 📝 Security and Performance

- **RLS enabled** on all tables with user-specific policies
- **Optimized indexes** for queries by `user_id`, `timestamp`, and `analysis_date`
- **Automatic triggers** for `updated_at` timestamps
- **Validation constraints** on meal types, scores, and analysis periods
- **Foreign key constraints** ensuring data integrity
- **Bucket policies** for secure photo storage with signed URLs

---

*This documentation is specific to the Nutritional Forge. Consult other STRUCTURE_*.md files for other features. Last revision: January 2025*