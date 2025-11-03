# TwinForge - Technical Architecture

**Version:** 3.0 (MVP)
**Status:** Production Base (Activity, Meals, Fasting, Culinary, Body Scan)
**Last Update:** January 2025

---

## System Overview

TwinForge is a modular wellness application with integrated Spatial Forge (AI) and Time Forge systems, built on React + Supabase.

### Core Principles
- **DB-first architecture**: PostgreSQL with RLS everywhere
- **Typed contracts**: End-to-end TypeScript safety
- **Idempotence**: Input hashing for deduplication
- **SLO-driven**: p95 performance targets per feature
- **Cost-bounded**: AI thresholds + intelligent caching
- **Privacy by design**: RLS + private storage + data minimization

---

## High-Level Architecture

```
Client (React 18 + TypeScript)
├─ VisionOS 26 UI (Tailwind + Framer Motion)
├─ "Strike & Bloom" Audio (Web Audio API)
├─ State (Zustand) + Data (React Query + persistence)
├─ 3D (Three.js + React Three Fiber)
└─ Supabase SDK (Auth, DB, Storage, Edge Functions)

Supabase
├─ PostgreSQL (RLS, indexes, triggers)
├─ Storage (private buckets, signed URLs)
└─ Edge Functions (Deno)
    ├─ activities: transcriber, analyzer, progress-generator
    ├─ meals: analyzer, daily-summary, trend-analysis
    ├─ fasting: insights-generator, progression-analyzer
    ├─ culinary: scan-vision, inventory-processor, complementer,
    │            recipe-generator, meal-plan-generator, shopping-list-generator
    └─ body: scan-estimate, scan-semantic, scan-match, scan-refine, scan-commit
```

---

## MVP Features (Phase 1)

### 1. Energy Forge (Activity Tracking)
**Pipeline**: Audio/Text → Transcription → Analysis → Insights

**Edge Functions**:
- `activity-transcriber` (Whisper-1 + GPT-5 Nano)
- `activity-analyzer` (GPT-5 Mini + MET calculation)
- `activity-progress-generator` (GPT-5 Mini, thresholds: 3/8/20 activities)

**Cost**: ~$0.000886 per session
**SLO**: < 45s E2E (p95)

### 2. Nutritional Forge (Meal Scanner)
**Pipeline**: Photo → Vision Analysis → Macros → Insights

**Edge Functions**:
- `meal-analyzer` (GPT-5 Vision)
- `daily-nutrition-summary` (GPT-5 Mini, 24h cache)
- `nutrition-trend-analysis` (GPT-5 Mini, 24h/7d cache)

**Cost**: ~$0.00025–0.0025 per scan
**SLO**: < 30s E2E (p95)

### 3. Time Forge (Intermittent Fasting)
**Pipeline**: Start/Stop → Real-time Timer → Metabolic Phases → Insights

**Edge Functions**:
- `fasting-insights-generator` (GPT-5 Mini, 24h cache)
- `fasting-progression-analyzer` (GPT-5 Mini, 24h cache)

**Cost**: ~$0.0008–0.004 per analysis
**SLO**: < 10s AI (timer local continuous)

### 4. Culinary Forge (Recipe Workshop)
**Pipeline**: Photos → Inventory → Recipes → Meal Plans → Shopping Lists

**Edge Functions**:
- `fridge-scan-vision` (GPT-4o Vision)
- `inventory-processor`, `inventory-complementer` (GPT-5 Mini)
- `recipe-generator` (GPT-5 Mini, streaming)
- `meal-plan-generator` (GPT-5 Mini)
- `shopping-list-generator` (GPT-5 Mini)
- `image-generator` (DALL-E 3, optional)

**Cost**: ~$0.013–0.054 complete pipeline (without images)
**SLO**: Scan < 30s, Recipes < 60s, Plan < 90s
**Cache**: 36h recipes, 48h plans, 24h lists

### 5. Body Forge (TwinVision - Body Scan Only)
**Pipeline**: 2 Photos → Estimate → Semantic → Match → Refine → Commit → 3D Avatar

**Edge Functions**:
- `scan-estimate`, `scan-semantic`, `scan-match`, `scan-refine-morphs`, `scan-commit`
- `generate-morph-insights` (optional)

**Cost**: ~$0.0045–0.027 complete pipeline
**SLO**: < 90s E2E (p95)
**Note**: Face Scan disabled in MVP (feature flag)

### 6. Profile System
**Tabs**: Identity, Nutrition, Training, Health, Emotions, Avatar

**Features**:
- Auto-save system (30s intervals)
- Real-time validation
- Profile completion tracking
- Bidirectional sync with all forges

---

## Frontend Architecture

### Project Structure
```
src/
├─ app/                  # Application layer
│  ├─ pages/             # Feature pages
│  ├─ providers/         # Context providers
│  └─ shell/             # Layout (Header, Sidebar, Navigation)
├─ audio/                # "Strike & Bloom" audio system
├─ config/               # Feature flags, themes
├─ domain/               # Business types
├─ hooks/                # Reusable React hooks
├─ lib/                  # Utilities (device, motion, nutrition, 3d)
├─ system/               # Infrastructure
│  ├─ data/              # Repositories
│  ├─ store/             # Zustand stores
│  └─ supabase/          # Client configuration
└─ ui/                   # Design system components
```

### State Management
- **Zustand**: Feature-specific stores (1 store per file, typed selectors)
- **React Query**: Network cache (stable keys, adaptive staleTime, explicit invalidations)
- **Persistence**: localStorage for pipelines (fasting, scan)

### Key Hooks
- `useSmartAutoSave`: Generic auto-save with queue + retry
- `useProfileAutoSave`: Specialized for profile data
- `useFieldValidation`: Real-time field validation (debounced)
- `useFeedback`: Audio + haptic feedback orchestration
- `usePWAInstall`, `usePWAUpdate`: Progressive Web App features

---

## Backend Architecture (Supabase)

### Database Schema (Key Tables)

**User Data Tables**:
- `activities` (user_id, type, duration_min, intensity, calories_est, timestamp)
- `meals` (user_id, timestamp, items:jsonb, total_kcal, photo_url)
- `fasting_sessions` (user_id, start_time, end_time, protocol_id, status)
- `fridge_items` (user_id, session_id, name, category, freshness_score)
- `recipes` (session_id, user_id, title, ingredients:jsonb, instructions:jsonb, nutritional_info:jsonb)
- `meal_plans` (session_id, user_id, week_number, plan_data:jsonb)
- `shopping_lists` (session_id, user_id, meal_plan_id, items:jsonb, budget_estimation:jsonb)
- `body_scans` (user_id, timestamp, metrics:jsonb, morph3d:jsonb)
- `user_avatars` (user_id PK, current_scan_id, morph3d:jsonb)

**AI Management Tables**:
- `ai_daily_summaries` (nutrition)
- `ai_trend_analyses` (nutrition)
- `ai_analysis_jobs` (id, user_id, analysis_type, status, input_hash, result_payload)

### Security (RLS)
- **Enabled everywhere**: All user data tables
- **Policies**: `auth.uid()` isolation per user
- **Service role**: Edge Functions only, minimized usage
- **Storage**: Private buckets (`meal-photos`, `recipe-images`, `avatars`)
- **URLs**: Short-lived signed URLs (60-300s)

### Performance Optimizations
- **Indexes**: `(user_id, timestamp DESC)` on temporal data
- **Triggers**: `updated_at` auto-update
- **Deduplication**: `input_hash` (SHA256) for AI caching
- **Cleanup jobs**: Automatic data retention policies

---

## AI Spatial Forge System

### Models Used
- **GPT-4o Vision**: Fridge scanning, meal analysis
- **GPT-5 Mini**: Recipe generation, meal plans, insights, analysis
- **GPT-5 Nano**: Activity transcription cleanup
- **Whisper-1**: Audio transcription
- **DALL-E 3**: Recipe images (optional)

### Cost Governance
- **Intelligent caching**: `input_hash` deduplication (24-48h TTL)
- **Data thresholds**: Minimum data required before AI analysis (3/8/20 pattern)
- **Fallback strategies**: Basic calculations when AI not needed
- **Rate limiting**: Per-user quotas
- **Monitoring**: Cost tracking per analysis type

### Idempotence Strategy
1. Canonical payload serialization (sorted keys)
2. SHA-256 hash generation (+ model version)
3. Database lookup (`ai_analysis_jobs.input_hash`)
4. Cache hit: Return stored result
5. Cache miss: Execute + store

---

## Design System (VisionOS 26)

### Visual Language
- **Glass Morphism**: Liquid Glass Premium v2
- **Color System**: Circuit-based (Plasma Cyan primary)
- **Typography**: SF Pro Display/Text (system fallbacks)
- **Spacing**: 8px base unit
- **Shadows**: Multi-layer with glow effects

### Tab System
Each feature has distinct tab colors:
- **Profile**: Blue, Green, Red, Orange, Cyan, Violet
- **Culinary**: Cyan, Pink, Violet, Orange
- **Meals**: Green, Cyan
- **Fasting**: Orange, Violet, Cyan
- **Activity**: Blue, Cyan, Violet
- **Body Scan**: Fuchsia, Violet

### Animation System
**Source**: `src/styles/animations/visionos-mobile.ts`

**Key Variants**:
- `tabTransitions`: Tab switch animations with direction
- `sectionCardVariants`: Card appearance
- `staggerContainerVariants`: Container for stagger children
- `successCheckVariants`: Animated checkmark
- `glowPulseVariants`: Pulsing glow for active elements
- `modalVariants`: Modal/backdrop animations
- `shakeVariants`: Error shake feedback

**Configuration**:
- Device capability detection
- `prefers-reduced-motion` support
- Adaptive duration/stiffness/damping
- GPU acceleration (transform, opacity only)

### Audio System ("Strike & Bloom")
**Source**: `src/audio/`

**Sound Layers**:
- **Navigation**: Tab switches, page transitions
- **Interaction**: Button clicks, toggles, selections
- **Status**: Success, warning, error feedback
- **Spatial Effects**: 3D positioning for contextual cues
- **Forgeron Sounds**: Feature-specific signature sounds

**Implementation**:
- Web Audio API (AudioContext)
- Sound synthesis (oscillators + filters)
- Spatial audio (PannerNode)
- Rate limiting (prevent sound spam)
- Accessibility mode (respects user preferences)

### Haptic System
**Source**: `src/utils/haptics.ts`

**Patterns**:
- `tap` (10ms): Standard buttons
- `press` (20ms): Important actions
- `impact` (30ms): Critical actions
- `success` [10,50,10]: Double-tap success
- `warning` [20,100,20,100,20]: Triple-tap alert
- `error` [30,50,30]: Alert pattern
- `selection` (5ms): List item selection

**Integration**:
- Vibration API support check
- `prefers-reduced-motion` respect
- localStorage preference (`haptics-enabled`)
- React hook (`useHaptics`)

---

## Observability & SLO

### Structured Logging
```typescript
{
  level: 'info' | 'warn' | 'error',
  message: string,
  timestamp: ISO8601,
  context: {
    userId?: string,
    clientTraceId?: string,
    fn?: string,
    costUsd?: number,
    tokensUsed?: number,
    processingTime?: number,
    cached?: boolean
  }
}
```

### Performance Metrics (p95)
- **Activity Forge**: < 45s E2E
- **Nutritional Forge**: < 30s E2E
- **Time Forge**: < 10s AI (timer local)
- **Culinary Forge**: Scan < 30s, Recipes < 60s, Plan < 90s
- **Body Forge**: < 90s E2E

### Dashboards (Recommended)
- Success/failure rate per Edge Function
- Cumulative cost per model
- Cache hit rate (target: recipes > 40%, plans > 60%)
- User quotas and usage patterns

---

## Feature Flags

**Source**: `src/config/featureFlags.ts`

### General
- `VITE_AUDIO_ENABLED`: Enable audio feedback
- `MEAL_SCAN_ENABLED`: Enable meal scanning
- `ENABLE_3D_AVATAR_VIEWER`: Enable 3D viewer

### MVP Cut
- `ENABLE_FACE_SCAN`: false (post-MVP)
- `ENABLE_MORPHOLOGICAL_INSIGHTS`: true

### Development
- `MOCK_*`: Mock AI responses for testing
- `BYPASS_MIN_DATA_FOR_AI`: Skip data thresholds
- `FASTING_CACHE_DURATION`: Override cache TTL

---

## Post-MVP Roadmap (Phase 2+)

### Central Brain (Global Synthesis Agent)
**Goal**: Cross-forge data synthesis → holistic recommendations

**Inputs**:
- Activity summaries + trends
- Nutritional compliance + patterns
- Fasting adherence + insights
- Culinary habits + inventory usage
- Morphological data + evolution

**Output**:
```typescript
{
  globalScore: number,
  priorityActions: Action[],
  correlations: Correlation[],
  weeklyPlan: WeeklyStrategy,
  culinaryOptimizations: CulinaryTip[]
}
```

**Architecture**:
- Edge Function: `central-brain-synthesizer` (GPT-5 Mini)
- Batch mode: CRON daily
- On-demand mode: 24h TTL with input_hash
- Cost: ~$0.001–0.006 per user per day

### Training Workshop
**Goal**: Generate personalized training programs + video streaming

**Features**:
- Exercise program generation (Mini)
- HLS video streaming (Supabase Storage or CDN)
- Progress tracking
- Equipment adaptation

**Tables**:
- `training_programs` (user_id, weeks, goal, level)
- `training_sessions` (program_id, day, blocks:jsonb)
- `training_videos` (hls_url, duration, muscle_groups)
- `video_progress` (user_id, video_id, progress_s, completed)

### Settings, Notifications, Onboarding
- User preferences management
- In-app + Web Push notifications
- Guided tours + checklists
- Profile completion tracking

### Face Scan (Body Forge Extension)
- 2-photo face capture
- Facial morphology analysis
- 3D head model generation
- Integration with avatar system

---

## Critical Synchronization Points for Multi-Project Fusion

### 1. TypeScript Contracts
**Must Match Exactly**:
- Domain types: `Activity`, `Meal`, `FastingSession`, `Recipe`, `MealPlan`, `ShoppingList`, `BodyScan`, `Profile`
- Edge Function input/output schemas
- Supabase table row types
- React Query key structures

### 2. Database Schema
**Must Align**:
- Table names, column names, data types
- RLS policies (identical `auth.uid()` checks)
- Indexes (same columns, same order)
- Triggers (same logic)
- Foreign key constraints

### 3. CSS Design Tokens
**Must Synchronize**:
```css
--color-plasma-cyan: #18E3FF
--glass-bg-base: rgba(255, 255, 255, 0.05)
--glass-border: rgba(255, 255, 255, 0.1)
--shadow-glow-sm: 0 0 20px rgba(24, 227, 255, 0.3)
--spacing-unit: 8px
--border-radius-card: 24px
```

### 4. Animation Configuration
**Must Match**:
- Duration values (200-300ms)
- Spring stiffness (300-500)
- Spring damping (25-30)
- Easing curves
- Reduced motion breakpoints

### 5. Audio/Haptic Events
**Must Use Same Event Names**:
```typescript
// Audio
'navigation:tab-switch'
'interaction:button-press'
'status:success'
'status:error'

// Haptic
Haptics.tap()
Haptics.success()
Haptics.error()
```

### 6. Feature Flags
**Must Have Same Defaults**:
```typescript
VITE_AUDIO_ENABLED: true
VITE_RECIPE_WORKSHOP_ENABLED: true
ENABLE_FACE_SCAN: false
```

### 7. Cache Durations
**Must Be Consistent**:
- Activity insights: 24h/72h/168h (1d/3d/7d)
- Nutritional summaries: 24h
- Fasting insights: 24h
- Recipes: 36h
- Meal plans: 48h
- Shopping lists: 24h

### 8. Supabase Configuration
**Must Align**:
- Project URL structure
- Storage bucket names (`meal-photos`, `recipe-images`, `avatars`)
- Edge Function deployment paths
- RLS service role usage patterns

---

## Testing Strategy (Pre-Fusion Checklist)

### Unit Tests
- Pure logic functions (utils, mappers, calculations)
- Hooks (with React Testing Library)
- Validators (Zod schemas)

### Integration Tests
- Repository functions (Supabase client)
- Edge Function contracts
- React Query cache behavior

### E2E Tests (Recommended)
- Activity: Audio → Transcription → Save
- Meals: Photo → Analysis → Summary
- Fasting: Start → Timer → Stop → Insights
- Culinary: Scan → Recipes → Plan → Shopping List
- Body: Photos → Avatar → Insights
- Profile: Edit → Auto-save → Validation

### Non-Functional Tests
- Performance: Web Vitals (LCP < 2.5s, CLS < 0.1, TTI < 3.5s mobile)
- Accessibility: axe-core audits
- Security: RLS policy tests (user A cannot access user B data)

---

## Deployment Checklist (Fusion Ready)

### Frontend
- [ ] Build succeeds (`npm run build`)
- [ ] No TypeScript errors
- [ ] All feature flags set correctly for environment
- [ ] CSS variables consistent across projects
- [ ] Animation variants identical
- [ ] Audio/haptic event names aligned

### Backend
- [ ] All Edge Functions deployed
- [ ] Database migrations applied in order
- [ ] RLS policies tested (cannot bypass isolation)
- [ ] Indexes created
- [ ] Storage buckets configured with RLS
- [ ] Signed URL expiration times set

### Contracts
- [ ] Domain types match across projects
- [ ] Edge Function schemas identical
- [ ] React Query keys standardized
- [ ] Cache durations aligned
- [ ] Cost tracking keys consistent

### Configuration
- [ ] Environment variables set (`.env`)
- [ ] Feature flags synchronized
- [ ] Supabase project URLs correct
- [ ] API keys secured (no client exposure)

---

## Success Metrics (Post-Fusion)

### Technical
- Build time < 15s
- Bundle size < 600KB gzipped (JS)
- No console errors in production
- All forges functional independently
- Cross-forge data access working

### UX
- Tab transitions smooth (no jank)
- Audio/haptic feedback consistent
- Glass morphism rendering correctly
- Animations respect reduced motion
- Auto-save working without data loss

### Data
- RLS isolating users correctly
- Cache hit rates meeting targets
- Cost per user within budget
- No data leakage between users
- Profile sync working bidirectionally

---

**For Internal Team**: This architecture document is the source of truth for technical decisions. All projects must adhere to these standards for successful fusion. When in doubt, refer to this document or escalate for architecture review.
