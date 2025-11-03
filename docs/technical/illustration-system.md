# Illustration System Documentation

## Overview

The TwinForge Illustration System is an intelligent, cost-optimized solution for generating and managing exercise and session illustrations. The system uses a multi-level matching algorithm with AI generation as a fallback, ensuring optimal performance and minimal API costs.

## Architecture

### Core Components

1. **Database Tables**
   - `illustration_library`: Central repository for all illustrations
   - `exercise_visual_metadata`: Rich metadata catalog for exercises
   - `illustration_generation_queue`: Async generation queue with prioritization
   - `training_session_illustrations`: Links sessions to illustrations

2. **Services**
   - `IllustrationMatchingService`: Intelligent matching algorithm
   - `IllustrationGenerationService`: Queue management and generation coordination

3. **UI Components**
   - `ExerciseIllustration`: Display component with lazy loading
   - `ExerciseIllustrationModal`: Fullscreen modal viewer

4. **Edge Functions**
   - `generate-training-illustration`: AI generation using OpenAI DALL-E 3

5. **Storage**
   - `training-illustrations` bucket: CDN-optimized image storage

## Matching Algorithm

The system uses a cascading fallback strategy:

### Level 1: Exact Match (Score: 100)
- Direct match by normalized exercise name
- Same discipline required
- Best quality, instant return

### Level 2: Variant Match (Score: 60-90)
- Similar exercise names (word similarity)
- Examples: "Squat" → "Front Squat", "Bench Press" → "Incline Bench Press"
- Same discipline required

### Level 3: Pattern Match (Score: 40-60)
- Same movement pattern (push, pull, squat, hinge, etc.)
- Overlapping muscle groups
- Similar equipment

### Level 4: Generic Match (Score: 20)
- Any illustration from the same discipline
- Used as last resort before generation

### Level 5: Queue Generation
- No match found, queue for AI generation
- User sees fallback icon immediately
- Illustration available on next visit

## AI Generation

### DALL-E 3 (OpenAI)
- **Cost**: ~$0.04 per image (standard quality)
- **Speed**: ~10-15 seconds
- **Quality**: Excellent
- **Use**: All illustration generation

### Prompt Templates

The system generates optimized prompts per discipline:

**Force (Technical Style)**:
```
Professional fitness illustration, {exercise}, male athlete demonstrating proper form,
muscle anatomy visible, gym environment, technical drawing style, educational diagram,
clean white background, 4K quality
```

**Endurance (Dynamic Style)**:
```
Dynamic sports illustration, {discipline} athlete in motion, {movement},
professional gear, outdoor environment, motion blur effect, vibrant colors,
inspirational, 4K quality
```

**Calisthenics (Minimalist Style)**:
```
Calisthenics movement illustration, {exercise}, bodyweight exercise,
urban environment, minimalist background, athletic body, proper form highlighted,
educational, 4K quality
```

## Storage Organization

Illustrations are stored in Supabase Storage with this structure:

```
training-illustrations/
  ├── force/
  │   ├── exercise/
  │   │   ├── squat-barre-front-view.webp
  │   │   ├── bench-press-side-view.webp
  │   │   └── ...
  │   └── session/
  │       └── ...
  ├── endurance/
  │   └── ...
  ├── functional/
  │   └── ...
  ├── competitions/
  │   └── ...
  └── calisthenics/
      └── ...
```

## Cache Strategy

### L1: Memory Cache (Map)
- 50 most used illustrations
- TTL: 1 hour
- Cleared on page reload

### L2: Database Cache
- All illustrations in `illustration_library`
- Permanent until manually removed
- Usage tracked for analytics

### L3: Browser Cache
- Native HTTP caching via CDN
- Handled automatically by Supabase Storage

## Usage Tracking

The system tracks:
- Usage count per illustration
- Last used timestamp
- Match quality scores
- Generation costs
- Cache hit rates

## Integration Example

### In React Components

```typescript
import { ExerciseIllustration } from '@/ui/components/training/illustrations';

function MyComponent() {
  return (
    <ExerciseIllustration
      exerciseName="Squat"
      discipline="force"
      muscleGroups={['Quadriceps', 'Glutes']}
      equipment={['barbell']}
      size="thumb"
      onClick={() => console.log('Clicked')}
    />
  );
}
```

### Manual Generation

```typescript
import { illustrationGenerationService } from '@/system/services/illustrationGenerationService';

const queueId = await illustrationGenerationService.queueGeneration({
  type: 'exercise',
  exerciseName: 'Squat',
  discipline: 'force',
  muscleGroups: ['Quadriceps', 'Glutes'],
  equipment: ['barbell'],
  priority: 10
});
```

## Pre-Generation Script

To pre-generate priority illustrations:

```bash
npx tsx scripts/generate-priority-illustrations.ts
```

This will:
1. Fetch top 50 exercises by priority
2. Check if illustrations already exist
3. Queue missing illustrations for generation
4. Display summary of queued/skipped/failed

## Cost Optimization

### Expected Costs

**Phase 1: Initial Pre-Generation (300 illustrations)**
- Using DALL-E 3: ~$12 (300 × $0.04)
- One-time cost

**Phase 2: Ongoing Generation**
- With 90% cache hit rate: ~5-10 new/month
- Using DALL-E 3: ~$0.40/month (10 × $0.04)

**Storage Costs**
- Supabase free tier: 1GB storage
- ~3000 images fit in 1GB (avg 300KB/image)
- More than sufficient for years

### ROI Analysis

**Without Smart Caching** (generating every time):
- 1000 users × 50 sessions/year = 50,000 generations
- At $0.04 each = $2,000/year

**With Smart Caching** (90% hit rate):
- Only 5,000 new generations needed
- At $0.04 each = $200/year
- **Savings: $1,800/year (90%)**

## Monitoring

### Key Metrics

1. **Cache Hit Rate**
   ```sql
   SELECT
     COUNT(*) as total_requests,
     SUM(CASE WHEN match_type = 'exact' THEN 1 ELSE 0 END) as exact_matches,
     ROUND(SUM(CASE WHEN match_type = 'exact' THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as hit_rate
   FROM illustration_usage_logs;
   ```

2. **Most Used Illustrations**
   ```sql
   SELECT exercise_name, discipline, usage_count
   FROM illustration_library
   WHERE type = 'exercise'
   ORDER BY usage_count DESC
   LIMIT 20;
   ```

3. **Generation Queue Status**
   ```sql
   SELECT status, COUNT(*) as count
   FROM illustration_generation_queue
   GROUP BY status;
   ```

4. **Total Generation Cost**
   ```sql
   SELECT
     generation_source,
     COUNT(*) as count,
     SUM(generation_cost_usd) as total_cost
   FROM illustration_library
   GROUP BY generation_source;
   ```

## Troubleshooting

### No Illustrations Showing

1. Check if migrations ran successfully
2. Verify `illustration_library` has data
3. Check browser console for errors
4. Verify Supabase Storage bucket is public

### Generation Failing

1. Check Edge Function logs in Supabase Dashboard
2. Verify OPENAI_API_KEY is set in Supabase Edge Function secrets
3. Check rate limits on OpenAI
4. Review `illustration_generation_queue` error messages

### Slow Performance

1. Check cache hit rate (should be >80%)
2. Verify CDN is working (check network tab)
3. Consider pre-generating more illustrations
4. Check database indexes are created

## Future Enhancements

1. **Automatic Background Processing**
   - Cron job to process generation queue
   - Smart pre-generation based on usage patterns

2. **Quality Improvements**
   - User ratings for illustrations
   - Automatic re-generation of low-quality images
   - A/B testing different styles

3. **Advanced Matching**
   - Machine learning for better similarity matching
   - Semantic search using embeddings
   - Cross-discipline matching

4. **Analytics Dashboard**
   - Real-time monitoring UI
   - Cost tracking and predictions
   - Coverage visualization

## API Reference

See service files for detailed API documentation:
- `/src/system/services/illustrationMatchingService.ts`
- `/src/system/services/illustrationGenerationService.ts`
