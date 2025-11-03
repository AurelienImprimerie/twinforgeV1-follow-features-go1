# TwinForge — Energy Forge Project Structure

**Version:** 1.0 • **Status:** Functional • **Last Update:** January 2025

Complete documentation of the file and folder organization for the **Energy Forge** (activity tracking system) of TwinForge.

---

## 📋 Table of Contents

- [Energy Forge Overview](#energy-forge-overview)
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

## 🎯 Energy Forge Overview

The **Energy Forge** is TwinForge's activity tracking system, allowing users to record, analyze, and optimize their workout sessions through a complete intelligent pipeline with personalized AI analyses. [FORGE_ENERGETIQUE.md]

### Objectives
- **Natural capture**: Intuitive voice recording or text input. [FORGE_ENERGETIQUE.md]
- **Intelligent analysis**: Automatic extraction of activities, durations, and intensities. [FORGE_ENERGETIQUE.md]
- **Precise calculations**: Calorie estimation based on MET tables and user profile. [FORGE_ENERGETIQUE.md]
- **Personalized advice**: Recommendations adapted to user goals and fitness level. [FORGE_ENERGETIQUE.md]
- **Rich visualizations**: Graphs, heatmaps, and trends to track progress. [FORGE_ENERGETIQUE.md]

---

## 🏗️ Feature Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Framer Motion [README.md]
- **State Management**: Zustand (pipeline state) + React Query (network cache) [README.md]
- **Backend**: Supabase Edge Functions (Deno) [README.md]
- **Spatial Forge**: OpenAI GPT-5 (Mini for analysis, Nano for cleaning) + Whisper-1 for transcription. [README.md]
- **Audio**: Web Audio API + MediaRecorder [FORGE_ENERGETIQUE.md]
- **Database**: PostgreSQL with RLS. [README.md]

### Data Flow
```
User (Audio/Texte)
    ↓
Frontend (Capture + Validation)
    ↓
Edge Function: activity-transcriber (Whisper + GPT-5 Nano)
    ↓
Edge Function: activity-analyzer (GPT-5 Mini + Tables MET)
    ↓
Database (table activities)
    ↓
Edge Function: activity-progress-generator (GPT-5 Mini + Intelligent Cache)
    ↓
Frontend (Visualizations + AI Advice)
```
[FORGE_ENERGETIQUE.md]

---

## 📁 Page Structure

### Main Page
```
src/app/pages/
├─ ActivityPage.tsx             # Main page with 4 tabs (Daily, Insights, Progression, History)
└─ Activity/
   └─ ActivityInputPage.tsx      # Pipeline for capture, analysis, and review
```

### Tabs
- `src/app/pages/Activity/ActivityDailyTab.tsx`
- `src/app/pages/Activity/ActivityInsightsTab.tsx`
- `src/app/pages/Activity/ActivityProgressTab.tsx`
- `src/app/pages/Activity/ActivityHistoryTab.tsx`

---

## 🧩 Components by Category

### 📁 Complete Component Structure
```
src/app/pages/Activity/
├─ components/
│  ├─ index.ts                  # Centralized export (not explicitly found, but implied)
│  ├─ DailyRecap/
│  │  ├─ ProfileCompletenessAlert.tsx # Alert for incomplete profile
│  │  ├─ DynamicActivityCTA/index.tsx # Adaptive call-to-action
│  │  ├─ DailyStatsGrid.tsx     # Daily activity statistics grid
│  │  ├─ CalorieProgressCard.tsx # Calorie progress based on goals
│  │  ├─ ActivitySummaryCard.tsx # Summary of daily activities
│  │  └─ RecentActivitiesCard.tsx # List of recent activities
│  ├─ CaptureStage/
│  │  ├─ InputModeSelector.tsx  # Select audio or text input
│  │  ├─ AudioInputInterface.tsx # Audio recording interface
│  │  └─ TextInputInterface.tsx # Manual text input interface
│  ├─ AnalysisStage/
│  │  ├─ AnalysisContainer.tsx  # Main container for analysis visualization
│  │  ├─ AnalysisInfo.tsx       # Information about the analysis process
│  │  ├─ AnalysisStatus.tsx     # Real-time analysis status
│  │  ├─ AnalysisEffects.tsx    # Visual effects for analysis
│  │  ├─ AnalysisIcon.tsx       # Central analysis icon
│  │  ├─ AnalysisModules.tsx    # Modules processing visualization
│  │  └─ AnalysisProgress.tsx   # Progress bar for analysis
│  ├─ ReviewStage/
│  │  ├─ ActivitySummary.tsx    # Summary of analyzed activities
│  │  ├─ ActivityList.tsx       # Editable list of activities
│  │  ├─ AddActivityForm.tsx    # Form to manually add an activity
│  │  ├─ ActivityInsightsDisplay.tsx # Display AI insights from analysis
│  │  └─ ReviewActions.tsx      # Save/Cancel buttons for review
│  ├─ Insights/
│  │  └─ ProgressionPeriodSelector.tsx # Selector for analysis period
│  ├─ Progression/
│  │  ├─ ActivityAnalysisLoadingSkeleton.tsx # Loading state for progression analysis
│  │  ├─ ActivityDistributionChart.tsx # Chart for activity type distribution
│  │  ├─ ActivityInsightCards.tsx # Cards displaying AI insights
│  │  ├─ ActivityHeatmap.tsx    # Heatmap visualization of activity
│  │  └─ GlobalStatsCard.tsx    # Global statistics for the period
│  └─ History/
│     └─ ActivityDetailModal.tsx # Modal for detailed activity view
```

### 📝 Category Descriptions

**Tabs**: Main tabs of `ActivityPage.tsx`
- `ActivityDailyTab`: Current status and today's sessions. [FORGE_ENERGETIQUE.md]
- `ActivityInsightsTab`: AI analysis of activity patterns. [FORGE_ENERGETIQUE.md]
- `ActivityProgressTab`: Progression metrics and trends. [FORGE_ENERGETIQUE.md]
- `ActivityHistoryTab`: Complete history with filters. [FORGE_ENERGETIQUE.md]

**Stages**: `ActivityInputPage.tsx` pipeline steps
- `CaptureStage`: Collects activity description via audio or text. [FORGE_ENERGETIQUE.md]
- `AnalysisStage`: Transforms user description into structured activity data. [FORGE_ENERGETIQUE.md]
- `ReviewStage`: Allows user to validate and adjust data before saving. [FORGE_ENERGETIQUE.md]

**DailyRecap**: Components for `ActivityDailyTab`
- `ProfileCompletenessAlert`: Alerts if profile is incomplete for activity tracking.
- `DynamicActivityCTA`: Adaptive call-to-action based on daily activity status.
- `DailyStatsGrid`: Displays key daily metrics (calories, activities, duration).
- `CalorieProgressCard`: Shows progress towards daily calorie/strength goals.
- `ActivitySummaryCard`: Provides an overview of activity types and characteristics.
- `RecentActivitiesCard`: Lists activities recorded today with deletion option.

**CaptureStage**: Components for the capture step
- `InputModeSelector`: Allows switching between audio and text input.
- `AudioInputInterface`: Handles audio recording and processing.
- `TextInputInterface`: Manages manual text input.

**AnalysisStage**: Components for the analysis step
- `AnalysisContainer`: Orchestrates analysis visualization and effects.
- `AnalysisInfo`: Provides information about the analysis process.
- `AnalysisStatus`: Displays real-time analysis status and metrics.
- `AnalysisEffects`: Background visual effects during analysis.
- `AnalysisIcon`: Central icon with glow and pulsing rings.
- `AnalysisModules`: Visualizes processing modules.
- `AnalysisProgress`: Progress bar for the analysis.

**ReviewStage**: Components for the review step
- `ActivitySummary`: Global summary of the activity session.
- `ActivityList`: Editable list of activities.
- `AddActivityForm`: Form to manually add a new activity.
- `ActivityInsightsDisplay`: Displays AI-generated insights.
- `ReviewActions`: Buttons to save or cancel the review.

**Insights**: AI analysis specific components for `ActivityInsightsTab`
- `ProgressionPeriodSelector`: Selector for the analysis period.
- `ActivityInsightCards`: Cards displaying personalized AI insights.

**Progression**: Trend visualization components for `ActivityProgressTab`
- `ActivityAnalysisLoadingSkeleton`: Loading state for progression analysis.
- `ActivityDistributionChart`: Visualizes activity types, intensities, and temporal patterns.
- `ActivityHeatmap`: Calendar heatmap showing activity regularity and intensity.
- `GlobalStatsCard`: Displays global statistics for the selected period.

**History**: History management components for `ActivityHistoryTab`
- `ActivityDetailModal`: Modal for detailed activity view and deletion.

---

## 🎣 Hooks and Business Logic

### 📁 Specialized Hooks
```
src/app/pages/Activity/hooks/
├─ useActivityPipeline.ts       # Pipeline state management
└─ useActivitiesData.ts         # Data management for activities
```

### 📝 Hook Responsibilities

**`useActivityPipeline`** - Feature core
- **Pipeline state**: Manages `currentStep`, `overallProgress`, `message`, `subMessage`.
- **Actions**: `startPipeline()`, `setStep()`, `setAudioData()`, `setTranscriptionResult()`, `setAnalysisResult()`, `completePipeline()`, `cancelPipeline()`, `handleError()`.
- **Data storage**: Stores `audioData`, `transcriptionResult`, `analysisResult`.

**`useActivitiesData`** - Data management for activities
- `useActivityHistory()`: Fetches historical activities.
- `useActivityInsightsGenerator()`: Generates AI insights with caching.
- `useTodayActivities()`: Fetches today's activities.
- `useTodayActivityStats()`: Calculates statistics for today's activities.
- `useRecentActivities()`: Fetches recent activities.
- `useGlobalActivityStats()`: Fetches global activity statistics.
- `useDeleteActivity()`: Handles activity deletion.
- `useHasActivityHistory()`: Checks if the user has any activity history.
- `useActivityProgressionData()`: Fetches activity progression data.

---

## 🛠️ Utilities and Helpers

### 📁 Energy Forge Utilities
```
src/app/pages/Activity/components/ReviewStage/ActivityUtils.ts # Activity-specific calculations and formatting
src/lib/nutrition/proteinCalculator.ts         # Protein target calculations (used by profile)
src/system/data/activitiesRepository.ts        # Supabase interactions for activities
```

### 📝 Key Utility Functions

**`ActivityUtils.ts`** - Formatting and calculations
- `calculateCalories()`: Calculates calories burned based on activity type, intensity, duration, and weight.
- `getIntensityColor()`: Returns a color based on activity intensity.
- `getActivityIcon()`: Returns an icon name based on activity type.
- `getIntensityLabel()`: Returns a French label for intensity.

**`proteinCalculator.ts`** - Protein target calculations
- `calculateProteinTarget()`: Calculates recommended protein intake based on user profile.
- `canCalculateProteinTarget()`: Checks if enough profile data is available for protein calculation.

**`activitiesRepository.ts`** - Supabase interactions
- `fetchActivitiesForDate()`: Fetches activities for a specific date.
- `calculateActivityStats()`: Calculates statistics from a list of activities.
- `fetchRecentActivities()`: Fetches recent activities.
- `deleteActivity()`: Deletes an activity.
- `fetchGlobalActivityStats()`: Fetches global activity statistics.
- `getUserActivities()`: Fetches activities for a date range.
- `validateActivityData()`: Validates activity data before insertion.

---

## ⚡ Edge Functions

### 📁 Serverless Functions
```
supabase/functions/
├─ activity-transcriber/        # Agent 1: Transcription and text cleaning
│  └─ index.ts                  # Whisper-1 + GPT-5 Nano
├─ activity-analyzer/           # Agent 2: Activity analysis and calorie calculation
│  └─ index.ts                  # GPT-5 Mini + MET Tables
└─ activity-progress-generator/ # Agent 3: Insights generation and pattern analysis
   └─ index.ts                  # GPT-5 Mini + Intelligent Cache
```

### 📝 Edge Function Specialties

**`activity-transcriber`** - Transcription and text cleaning
- **Model**: Whisper-1 + GPT-5 Nano. [FORGE_ENERGETIQUE.md]
- **Specialties**: Supports strong accents, creoles, corrects ASR errors, translates to standard French. [FORGE_ENERGETIQUE.md]
- **Average cost**: ~$0.000023 USD. [FORGE_ENERGETIQUE.md]
- **Duration**: ~3-8 seconds. [FORGE_ENERGETIQUE.md]

**`activity-analyzer`** - Activity analysis and calorie calculation
- **Model**: GPT-5 Mini. [FORGE_ENERGETIQUE.md]
- **Specialties**: Extracts multiple activities, estimates missing durations, classifies intensity, calculates calories via MET tables. [FORGE_ENERGETIQUE.md]
- **Average cost**: ~$0.000863 USD. [FORGE_ENERGETIQUE.md]
- **Duration**: ~5-15 seconds. [FORGE_ENERGETIQUE.md]

**`activity-progress-generator`** - Insights generation and pattern analysis
- **Model**: GPT-5 Mini. [FORGE_ENERGETIQUE.md]
- **Specialties**: Detects temporal and behavioral patterns, generates structured insights, calculates advanced metrics (regularity, balance), personalized recommendations. [FORGE_ENERGETIQUE.md]
- **Cache**: Intelligent server-side cache (24h for 7d, 72h for 30d, 168h for 90d) with invalidation based on new activities. [FORGE_ENERGETIQUE.md]
- **Average cost**: ~$0.0063 USD. [FORGE_ENERGETIQUE.md]
- **Duration**: ~8-25 seconds. [FORGE_ENERGETIQUE.md]

---

## 👤 Profile Integration

### 📁 Integration Files
```
src/app/pages/Profile/ProfileIdentityTab.tsx   # Basic identity and measurements
src/app/pages/Profile/ProfilePreferencesTab.tsx # Workout preferences
src/system/store/userStore.ts                   # Profile data synchronization
```

### 📝 Profile Fields Used

**Critical Fields (Required for functionality):**
- `weight_kg`: **CRITICAL** - Used for calorie calculation via MET tables. [FORGE_ENERGETIQUE.md]
- `sex`: Adjusts metabolic estimations. [FORGE_ENERGETIQUE.md]
- `height_cm`: Used for BMR calculations and metabolic adjustments. [FORGE_ENERGETIQUE.md]

**Optimizing Fields (Improve accuracy and personalization):**
- `birthdate`: Used for age calculation for metabolic adjustments. [FORGE_ENERGETIQUE.md]
- `activity_level`: Personalizes goals and thresholds. [FORGE_ENERGETIQUE.md]
- `objective`: Adapts advice (`fat_loss`, `muscle_gain`, `recomp`). [FORGE_ENERGETIQUE.md]
- `job_category`: Provides context for activity recommendations. [FORGE_ENERGETIQUE.md]

**Workout Configuration (from `ProfilePreferencesTab`):**
- `preferences.workout.type`: Preferred workout type.
- `preferences.workout.fitnessLevel`: Current fitness level.
- `preferences.workout.sessionsPerWeek`: Target workout frequency.
- `preferences.workout.preferredDuration`: Preferred session duration.
- `preferences.workout.equipment`: Available equipment.
- `preferences.workout.specificGoals`: Specific measurable goals.

---

## ⚙️ Configuration Files

### 📁 Specific Configuration
```
src/config/featureFlags.ts     # Feature flags for testing and development
```

### 📝 Available Feature Flags
- `VITE_FEATURE_FACE_SCAN`: (General feature flag, not specific to Energy Forge but impacts avatar)
- `VITE_AUDIO_ENABLED`: (General feature flag, not specific to Energy Forge)

---

## 🎨 Styles and Animations

### 📁 Energy Forge Specific Styles
```
src/styles/
├─ components/
│  ├─ bodyscan/_variables.css   # BodyScan variables (some shared with activity)
│  ├─ bodyscan/_processing.css  # Processing animations (reused for analysis stage)
│  ├─ bodyscan/_celebration.css # Success celebration animations (reused for completion)
│  └─ meals/meals.css           # Meal scan styles (some animations might be generic)
├─ glassV2/
│  └─ animations.css            # Breathing, pulse, and general glass animations
└─ effects/
   └─ motion.css                # Spatial icon animations and transitions
```

### 📝 Energy Forge-Specific Animations
- **Breathing icons**: For active indicators (`breathing-icon` class).
- **Progress animations**: Smooth progress bar updates (`progressShimmer` keyframe).
- **Analysis effects**: Scan lines, particles, grid pulse (`energyScanVertical`, `energyParticleFloat`, `energyGridPulse`, `energyShimmer`, `energyFlow` keyframes).
- **Celebration effects**: Success completion animations (`celebration-*` keyframes).
- **Dynamic CTA animations**: Pulsing and shimmering effects (`urgent-forge-glow-css`, `dynamic-particle-css`, `dynamic-shimmer-css` keyframes).

---

## 🗄️ Database

### 📁 Main Tables
```
activities                      # User activity sessions
├─ id (uuid, PK)
├─ user_id (uuid, FK → users)
├─ type (text)
├─ duration_min (integer)
├─ intensity (text: low|medium|high|very_high)
├─ calories_est (integer)
├─ notes (text, nullable)
├─ timestamp (timestamptz)
└─ created_at (timestamptz)

ai_analysis_jobs                # AI analysis cache and cost tracking
├─ id (uuid, PK)
├─ user_id (uuid, FK → users)
├─ analysis_type (enum: activity_analysis|activity_transcription|trend_analysis)
├─ status (enum: pending|processing|completed|failed)
├─ request_payload (jsonb)
├─ result_payload (jsonb)
├─ error_message (text, nullable)
├─ created_at (timestamptz)
├─ updated_at (timestamptz)
└─ input_hash (text, nullable) # Deduplication key for trend analysis
```

### 📝 Security and Performance
- **RLS enabled** on all tables. [README.md]
- **Optimized indexes** for queries by `user_id` and `timestamp`. [Database Schema]
- **Automatic triggers** for `updated_at`. [Database Schema]
- **Validation constraints** on `intensity` (enum check). [Database Schema]

---

*This documentation is specific to the Energy Forge. Consult other STRUCTURE_*.md files for other features. Last revision: January 2025*