# Central Brain Integration System

**Version**: 1.0
**Last Updated**: October 2025
**Purpose**: AI orchestration layer for cross-forge intelligence and holistic recommendations

---

## Overview

The Central Brain is TwinForge's AI orchestration system that analyzes data across all six Forges to provide holistic, context-aware recommendations. Unlike individual Forge AIs that focus on their specific domain, the Central Brain understands the interconnections between nutrition, training, fasting, body composition, activity, and meal planning.

### Core Principle

**"The whole is greater than the sum of its parts"**

Individual health metrics in isolation provide limited value. The Central Brain's power comes from understanding how different aspects of health influence each other:

- Training intensity affects nutritional needs
- Fasting windows impact workout performance
- Sleep quality influences recovery and body composition
- Body composition changes inform training and nutrition adjustments
- Activity patterns suggest optimal meal timing

---

## Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                      CENTRAL BRAIN                          │
│                   (AI Orchestrator)                         │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Correlation │  │  Pattern     │  │  Prediction  │    │
│  │  Engine      │  │  Recognition │  │  Engine      │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │        Recommendation Generation System             │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ▲
                           │
         ┌─────────────────┴─────────────────┐
         │                                   │
    ┌────▼────┐  ┌────────┐  ┌───────┐  ┌────────┐  ┌──────┐  ┌─────────┐
    │ Energy  │  │Nutrition│  │ Time  │  │  Body  │  │Culinary│  │Training │
    │  Forge  │  │  Forge  │  │ Forge │  │ Forge  │  │ Forge  │  │  Forge  │
    └─────────┘  └────────┘  └───────┘  └────────┘  └──────┘  └─────────┘
```

### Components

#### 1. Data Collection Layer
Collects structured exports from each Forge in real-time.

#### 2. Correlation Engine
Identifies relationships and patterns across Forge data.

#### 3. Pattern Recognition System
Uses machine learning to detect trends and anomalies.

#### 4. Prediction Engine
Forecasts outcomes based on historical patterns.

#### 5. Recommendation Generator
Creates actionable, personalized advice.

---

## Data Integration

### Standardized Data Export Format

Each Forge exports data in a standardized JSON format for Central Brain consumption:

```typescript
interface ForgeDataExport {
  forge_id: 'energy' | 'nutrition' | 'time' | 'body' | 'culinary' | 'training';
  user_id: string;
  timestamp: string;
  data_type: 'event' | 'metric' | 'trend' | 'insight';
  payload: ForgeSpecificData;
  metadata: {
    confidence_score?: number;
    ai_model_used?: string;
    tokens_consumed?: number;
  };
}
```

### Forge-Specific Exports

#### Energy Forge
```typescript
{
  forge_id: 'energy',
  data_type: 'event',
  payload: {
    activity_type: 'running',
    duration_minutes: 45,
    distance_km: 7.2,
    calories_burned: 520,
    avg_heart_rate: 158,
    heart_rate_zones: {
      zone1: 5, zone2: 15, zone3: 20, zone4: 5
    },
    perceived_effort: 7,
    fatigue_level: 6
  }
}
```

#### Nutrition Forge
```typescript
{
  forge_id: 'nutrition',
  data_type: 'metric',
  payload: {
    meal_type: 'lunch',
    total_calories: 650,
    macros: {
      protein_g: 45,
      carbs_g: 65,
      fat_g: 22
    },
    meal_quality_score: 8.5,
    satiety_rating: 7,
    time_of_day: '13:30'
  }
}
```

#### Time Forge
```typescript
{
  forge_id: 'time',
  data_type: 'event',
  payload: {
    protocol: '16:8',
    fasting_duration_hours: 16.5,
    eating_window_start: '12:00',
    eating_window_end: '20:00',
    adherence_quality: 9,
    hunger_levels: [2, 4, 3, 5],
    energy_levels: [7, 8, 8, 7]
  }
}
```

#### Body Forge
```typescript
{
  forge_id: 'body',
  data_type: 'metric',
  payload: {
    body_fat_percentage: 18.5,
    lean_mass_kg: 68.2,
    limb_masses: {
      left_arm: 3.8, right_arm: 3.9,
      left_leg: 11.2, right_leg: 11.3,
      torso: 38.0
    },
    change_since_last_scan: {
      body_fat: -0.8,
      lean_mass: +1.2
    }
  }
}
```

#### Training Forge
```typescript
{
  forge_id: 'training',
  data_type: 'event',
  payload: {
    discipline: 'force',
    session_type: 'strength',
    exercises_completed: 8,
    total_volume_kg: 4500,
    avg_rest_between_sets: 120,
    session_duration: 75,
    performance_vs_prescription: 0.95,
    post_session_fatigue: 7
  }
}
```

#### Culinary Forge
```typescript
{
  forge_id: 'culinary',
  data_type: 'trend',
  payload: {
    weekly_meal_prep_adherence: 0.85,
    ingredient_variety_score: 7.5,
    budget_efficiency: 0.92,
    meal_plan_satisfaction: 8,
    shopping_list_completion: 0.88
  }
}
```

---

## Correlation Engine

### Cross-Forge Correlations

The Correlation Engine identifies relationships between different Forge data points:

#### Example 1: Training Impact on Nutrition
```typescript
correlation: {
  source_forge: 'training',
  target_forge: 'nutrition',
  relationship: 'causal',
  insight: 'High-intensity training sessions correlate with
           increased protein intake (+20g) on same day',
  confidence: 0.87,
  recommendation: 'Increase protein target to 180g on training days'
}
```

#### Example 2: Fasting Window Optimization
```typescript
correlation: {
  source_forges: ['training', 'time', 'energy'],
  relationship: 'performance_optimization',
  insight: 'Training performance drops 15% when fasting window
           extends into morning workout time',
  confidence: 0.92,
  recommendation: 'Shift fasting window to 18:00-10:00 to
                  align with 07:00 training sessions'
}
```

#### Example 3: Body Composition Progress
```typescript
correlation: {
  source_forges: ['body', 'nutrition', 'training'],
  relationship: 'progress_tracking',
  insight: 'Lean mass gain of 1.2kg over 30 days correlates with
           consistent protein intake (2g/kg) and progressive overload',
  confidence: 0.94,
  recommendation: 'Maintain current nutrition and training protocol'
}
```

### Pattern Detection

The Central Brain identifies recurring patterns:

#### Recovery Patterns
```typescript
pattern: {
  name: 'insufficient_recovery',
  indicators: [
    'Consecutive high-intensity training sessions',
    'Declining sleep quality (Activity Forge)',
    'Increased perceived fatigue',
    'Performance plateau'
  ],
  frequency: 'detected 3 times in last 30 days',
  recommendation: 'Implement mandatory rest day after 2 consecutive
                  high-intensity sessions'
}
```

#### Nutritional Timing Patterns
```typescript
pattern: {
  name: 'pre_workout_nutrition',
  indicators: [
    'Best training sessions occur 2-3 hours after meals',
    'Meals with 40g+ carbs before training show better performance',
    'Fasted training shows 12% lower output'
  ],
  recommendation: 'Schedule carb-rich meal 2.5 hours before training'
}
```

---

## Recommendation System

### Recommendation Categories

#### 1. Optimization Recommendations
Improve current performance and results:

```typescript
{
  category: 'optimization',
  priority: 'high',
  title: 'Optimize Training Nutrition Timing',
  description: 'Your training performance is 18% better when you
               consume 40-50g carbs 2-3 hours before workouts',
  affected_forges: ['nutrition', 'training'],
  action_items: [
    'Add pre-workout meal to Culinary Forge meal plan',
    'Set nutrition reminder 2.5 hours before training',
    'Track performance changes over next 2 weeks'
  ],
  expected_impact: '+15-20% training performance',
  confidence: 0.89
}
```

#### 2. Preventive Recommendations
Avoid negative outcomes:

```typescript
{
  category: 'preventive',
  priority: 'critical',
  title: 'Risk of Overtraining Detected',
  description: 'Pattern analysis shows declining recovery markers
               and increased fatigue despite maintained intensity',
  affected_forges: ['training', 'energy', 'time'],
  action_items: [
    'Reduce training volume by 20% this week',
    'Add extra rest day',
    'Increase sleep target to 8+ hours',
    'Consider shorter fasting window for recovery'
  ],
  expected_impact: 'Prevent performance decline and injury risk',
  confidence: 0.91
}
```

#### 3. Goal Alignment Recommendations
Ensure all Forges work toward user goals:

```typescript
{
  category: 'goal_alignment',
  priority: 'medium',
  title: 'Adjust Nutrition for Muscle Gain Goal',
  description: 'Current calorie intake (2200 kcal) insufficient
               for lean mass gain goal with training volume',
  affected_forges: ['nutrition', 'body', 'training'],
  action_items: [
    'Increase daily calories to 2600-2800',
    'Prioritize protein (180g/day)',
    'Update Culinary Forge meal plans',
    'Track body composition changes bi-weekly'
  ],
  expected_impact: '0.5-0.7kg lean mass gain per month',
  confidence: 0.86
}
```

#### 4. Efficiency Recommendations
Optimize time and resource usage:

```typescript
{
  category: 'efficiency',
  priority: 'low',
  title: 'Streamline Meal Prep',
  description: 'Your meal prep time could be reduced by batch
               cooking similar meals from Culinary Forge',
  affected_forges: ['culinary', 'nutrition'],
  action_items: [
    'Group similar recipes on Sunday prep day',
    'Use shared ingredients across 3-4 meals',
    'Reduce prep time by estimated 45 minutes/week'
  ],
  expected_impact: 'Save 3 hours/month while maintaining nutrition',
  confidence: 0.78
}
```

---

## AI Models and Processing

### Primary Models

#### GPT-4o for Correlation Analysis
Used for complex pattern recognition and recommendation generation:

```typescript
{
  model: 'gpt-4o',
  use_case: 'multi_forge_correlation_analysis',
  typical_prompt_structure: {
    context: 'User profile and goals',
    data: '30-90 days of structured exports from all active Forges',
    task: 'Identify correlations, patterns, and generate recommendations'
  },
  token_cost: '15,000-25,000 per analysis',
  frequency: 'Weekly or on-demand'
}
```

#### GPT-4o-mini for Quick Insights
Used for daily micro-insights:

```typescript
{
  model: 'gpt-4o-mini',
  use_case: 'daily_summary_and_quick_insights',
  typical_prompt_structure: {
    context: 'Recent 24-48 hours of data',
    task: 'Generate quick actionable insights'
  },
  token_cost: '3,000-5,000 per analysis',
  frequency: 'Daily'
}
```

### Processing Pipeline

```
┌─────────────────────────────────────────────────┐
│  1. DATA AGGREGATION                            │
│     Collect exports from all active Forges      │
│     Time window: 7-90 days                      │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│  2. PREPROCESSING                               │
│     Normalize data formats                      │
│     Calculate derived metrics                   │
│     Identify data quality issues                │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│  3. CORRELATION DETECTION                       │
│     Run correlation algorithms                  │
│     Statistical significance testing            │
│     Confidence scoring                          │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│  4. PATTERN RECOGNITION                         │
│     Apply ML models to detect patterns          │
│     Compare against known health patterns       │
│     Identify anomalies                          │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│  5. AI RECOMMENDATION GENERATION                │
│     GPT-4o analyzes correlations + patterns     │
│     Generates personalized recommendations      │
│     Prioritizes by impact and confidence        │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│  6. VALIDATION & DELIVERY                       │
│     Medical safety checks                       │
│     User preference filtering                   │
│     Deliver via appropriate channels            │
└─────────────────────────────────────────────────┘
```

---

## Database Schema

### Core Tables

#### central_brain_analyses
Stores complete analysis results:

```sql
CREATE TABLE central_brain_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  analysis_type TEXT NOT NULL,
  time_window_start TIMESTAMPTZ NOT NULL,
  time_window_end TIMESTAMPTZ NOT NULL,
  forges_included TEXT[] NOT NULL,
  correlations JSONB,
  patterns JSONB,
  recommendations JSONB,
  confidence_score DECIMAL(3,2),
  tokens_consumed INTEGER,
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### forge_data_exports
Central repository for all Forge exports:

```sql
CREATE TABLE forge_data_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  forge_id TEXT NOT NULL,
  data_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMPTZ NOT NULL,
  indexed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exports_user_forge_time
  ON forge_data_exports(user_id, forge_id, timestamp DESC);
```

#### user_brain_preferences
User-specific Central Brain configuration:

```sql
CREATE TABLE user_brain_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  enabled BOOLEAN DEFAULT true,
  analysis_frequency TEXT DEFAULT 'weekly',
  notification_preferences JSONB,
  excluded_forges TEXT[],
  custom_goals JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Edge Functions

### central-brain-analyze

Main analysis orchestrator:

```typescript
// supabase/functions/central-brain-analyze/index.ts

import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { user_id, time_window_days = 30 } = await req.json();

    // 1. Collect data from all active Forges
    const forgeData = await collectForgeData(supabase, user_id, time_window_days);

    // 2. Run correlation analysis
    const correlations = await detectCorrelations(forgeData);

    // 3. Identify patterns
    const patterns = await recognizePatterns(forgeData, correlations);

    // 4. Generate AI recommendations
    const recommendations = await generateRecommendations(
      user_id,
      forgeData,
      correlations,
      patterns
    );

    // 5. Save analysis
    const { data: analysis } = await supabase
      .from('central_brain_analyses')
      .insert({
        user_id,
        analysis_type: 'comprehensive',
        time_window_start: new Date(Date.now() - time_window_days * 86400000),
        time_window_end: new Date(),
        forges_included: Object.keys(forgeData),
        correlations,
        patterns,
        recommendations,
        confidence_score: calculateConfidence(correlations, patterns),
        model_used: 'gpt-4o'
      })
      .select()
      .single();

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### Helper Functions

#### collectForgeData
```typescript
async function collectForgeData(
  supabase: SupabaseClient,
  user_id: string,
  days: number
) {
  const cutoff = new Date(Date.now() - days * 86400000);

  const { data } = await supabase
    .from('forge_data_exports')
    .select('*')
    .eq('user_id', user_id)
    .gte('timestamp', cutoff.toISOString())
    .order('timestamp', { ascending: false });

  // Group by forge
  const grouped = {};
  for (const item of data || []) {
    if (!grouped[item.forge_id]) grouped[item.forge_id] = [];
    grouped[item.forge_id].push(item);
  }

  return grouped;
}
```

#### detectCorrelations
```typescript
async function detectCorrelations(forgeData: any) {
  const correlations = [];

  // Example: Training intensity vs. Nutrition
  if (forgeData.training && forgeData.nutrition) {
    const trainingDays = extractTrainingIntensity(forgeData.training);
    const proteinIntake = extractProteinIntake(forgeData.nutrition);

    const correlation = calculatePearsonCorrelation(trainingDays, proteinIntake);

    if (Math.abs(correlation) > 0.6) {
      correlations.push({
        forges: ['training', 'nutrition'],
        metric: 'training_intensity_vs_protein',
        correlation_coefficient: correlation,
        significance: correlation > 0 ? 'positive' : 'negative'
      });
    }
  }

  // Add more correlation checks...

  return correlations;
}
```

---

## User Interface

### Central Brain Dashboard

#### Insights Tab
Location: Main navigation or Profile section

Components:
1. **Weekly Summary Card**
   - Key correlations discovered
   - Top 3 recommendations
   - Progress on previous recommendations

2. **Forge Interconnections Visualization**
   - Interactive graph showing data flow
   - Strength of correlations visualized
   - Click to see detailed insights

3. **Recommendation Cards**
   - Prioritized by impact
   - Clear action items
   - "Apply" button to auto-configure Forges

4. **Historical Trends**
   - Long-term pattern visualization
   - Body composition vs. training vs. nutrition timeline
   - Milestone markers

### Notification System

Central Brain triggers notifications for:

```typescript
notification_types: {
  critical_insight: {
    title: 'Important Health Pattern Detected',
    priority: 'high',
    channel: ['push', 'in_app', 'email']
  },
  weekly_summary: {
    title: 'Your Weekly TwinForge Insights',
    priority: 'medium',
    channel: ['in_app', 'email']
  },
  recommendation_ready: {
    title: 'New Personalized Recommendation',
    priority: 'medium',
    channel: ['in_app']
  },
  goal_progress: {
    title: 'Goal Progress Update',
    priority: 'low',
    channel: ['in_app']
  }
}
```

---

## Privacy and Security

### Data Protection

1. **Aggregation Only**: Central Brain never accesses raw photos or personal identifiers
2. **Anonymized Processing**: AI analysis uses de-identified data structures
3. **User Control**: Users can disable Central Brain or exclude specific Forges
4. **Data Retention**: Analysis results stored for 90 days, then archived

### RLS Policies

```sql
-- Users can only access their own analyses
CREATE POLICY "Users can view own analyses"
  ON central_brain_analyses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Only Edge Functions can insert analyses
CREATE POLICY "Service role can insert analyses"
  ON central_brain_analyses FOR INSERT
  TO service_role
  WITH CHECK (true);
```

---

## Subscription Requirements

### Tier Access

| Tier | Central Brain Access |
|------|---------------------|
| Essential | No access |
| Pro | Basic weekly insights |
| Elite | Full insights + correlations |
| Champion | Priority analysis + custom goals |
| Master | **Full Central Brain access** |
| Legend | API access to analyses |
| Titan | Real-time continuous analysis |

### Token Consumption

Central Brain analyses are token-intensive:

- **Basic Weekly Analysis**: 15,000-20,000 tokens
- **Comprehensive Monthly Analysis**: 35,000-50,000 tokens
- **Real-time Continuous**: 5,000-10,000 tokens/day

Users must have sufficient tokens in their plan to trigger analyses.

---

## Implementation Roadmap

### Phase 1: Foundation (Current)
- Database schema setup
- Forge data export standardization
- Basic correlation detection

### Phase 2: Intelligence (Q1 2026)
- Advanced pattern recognition
- GPT-4o recommendation generation
- Weekly analysis automation

### Phase 3: Real-time (Q2 2026)
- Continuous monitoring
- Immediate insights on critical patterns
- Predictive recommendations

### Phase 4: Social Intelligence (Q3 2026)
- Anonymized population insights
- Benchmark comparisons
- Community pattern sharing

---

## Performance Optimization

### Caching Strategy

```typescript
// Cache frequently accessed user analyses
cache_key: `central_brain:user:${user_id}:latest`
ttl: 86400 // 24 hours

// Cache correlation templates
cache_key: `central_brain:correlations:${pattern_type}`
ttl: 604800 // 7 days
```

### Background Processing

All Central Brain analyses run as background jobs to avoid blocking user interactions:

```typescript
// Trigger analysis
await supabase.functions.invoke('central-brain-analyze', {
  body: { user_id, mode: 'background' }
});

// Poll for results
const analysis = await pollForAnalysis(analysis_id, max_wait_seconds: 30);
```

---

## Testing and Validation

### Correlation Accuracy Testing

Validate correlation detection with known health patterns:

```typescript
test_cases: [
  {
    name: 'High-intensity training increases protein needs',
    expected_correlation: 'positive, r > 0.7',
    test_data: 'synthetic_30days_high_training'
  },
  {
    name: 'Poor sleep reduces training performance',
    expected_correlation: 'negative, r < -0.6',
    test_data: 'synthetic_14days_sleep_deprivation'
  }
]
```

### Recommendation Quality Metrics

Track recommendation acceptance and outcomes:

```sql
CREATE TABLE recommendation_outcomes (
  recommendation_id UUID REFERENCES recommendations,
  user_id UUID REFERENCES auth.users,
  accepted BOOLEAN,
  applied_at TIMESTAMPTZ,
  outcome_rating INTEGER,
  outcome_notes TEXT
);
```

---

## Support and Resources

### For Developers
- Edge Function documentation
- Correlation algorithm library
- Testing framework

### For Users
- Central Brain FAQ
- Understanding Your Insights guide
- Video tutorials

### For Data Scientists
- Anonymized dataset access (Legend/Titan tiers)
- Correlation API
- Custom analysis requests

---

## Conclusion

The Central Brain is TwinForge's differentiating feature, transforming isolated health data into actionable, holistic intelligence. By understanding the complex interplay between nutrition, training, fasting, and body composition, it provides users with insights no single-purpose app can match.

**Next Steps**:
1. Complete Phase 1 database schema
2. Implement Edge Function for basic analysis
3. Build UI dashboard for insights
4. Launch Beta with Master tier users

---

*This document is the technical foundation for Central Brain implementation. Refer to individual Forge documentation for data export specifications.*
