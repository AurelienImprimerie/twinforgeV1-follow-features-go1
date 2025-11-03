# TwinForge Monetization System

**Version**: 1.0
**Last Updated**: October 2025
**Purpose**: Complete documentation of subscription plans, token system, and payment infrastructure

---

## Overview

TwinForge uses a hybrid monetization model combining:

1. **Subscription Tiers**: 7 progressive plans from Essential to Titan
2. **Token-Based AI Consumption**: Pay for what you use within your tier
3. **Pay-As-You-Go Top-Ups**: Purchase additional tokens when needed
4. **Stripe Integration**: Secure payment processing and subscription management

### Business Model Philosophy

**Fair Usage Pricing**: Users pay for the AI compute they consume, with higher tiers offering better value per token and additional features. This ensures:

- Small-scale users aren't subsidizing power users
- Heavy users get volume discounts
- Transparent cost structure tied to real infrastructure costs
- Sustainable business model as AI costs scale

---

## Subscription Tiers

### Complete Tier Breakdown

| Tier | Price/Month | Tokens/Month | Token Value | Key Features |
|------|-------------|--------------|-------------|--------------|
| **Essential** | $9.99 | 50,000 | $0.0002/token | Basic tracking, manual entry, 1 Forge |
| **Pro** | $19.99 | 150,000 | $0.00013/token | AI analysis, all 6 Forges, basic insights |
| **Elite** | $29.99 | 300,000 | $0.0001/token | Advanced insights, priority support |
| **Champion** | $49.99 | 600,000 | $0.000083/token | Training programs, meal plans, wearables |
| **Master** | $79.99 | 1,000,000 | $0.00008/token | Central Brain full access |
| **Legend** | $149.99 | 2,500,000 | $0.00006/token | API access, custom integrations |
| **Titan** | $299.99 | Unlimited | Unlimited | White-glove service, dedicated coach |

### Tier Details

#### Essential - $9.99/month
**Target Audience**: Beginners, casual users, single-focus users

**Included**:
- 50,000 AI tokens per month
- Access to 1 Forge of choice
- Manual data entry
- Basic progress tracking
- Community support

**Limitations**:
- No AI-powered insights
- No cross-forge correlations
- No wearable integrations
- No meal plan generation

**Typical Usage**:
- 5-7 meal scans per month
- OR 3-5 training sessions with basic analysis
- OR 10-15 manual activity logs

---

#### Pro - $19.99/month
**Target Audience**: Active users, fitness enthusiasts, health-conscious individuals

**Included**:
- 150,000 AI tokens per month
- All 6 Forges unlocked
- AI-powered analysis for all activities
- Photo scanning (meals, body, fridge)
- Basic wearable integration
- Email support

**New Features**:
- AI meal analysis with nutrition breakdown
- Training session AI feedback
- Body scan with basic morphology
- Fasting insights
- Recipe suggestions

**Typical Usage**:
- 15-20 meal scans per month
- 8-10 training sessions with AI coaching
- 1 body scan
- 1 fridge scan with basic recipes
- Daily activity tracking

---

#### Elite - $29.99/month
**Target Audience**: Serious athletes, health optimizers, data-driven users

**Included**:
- 300,000 AI tokens per month
- Everything in Pro
- Advanced AI insights
- Trend analysis and predictions
- Priority email support
- Early access to new features

**New Features**:
- Detailed nutritional trend analysis
- Training progression analytics
- Body composition historical tracking
- Advanced fasting metabolic insights
- Cross-forge basic correlations

**Typical Usage**:
- 25-30 meal scans per month
- 12-15 training sessions with detailed analysis
- 2 body scans
- 1-2 fridge scans with full meal planning
- Weekly AI progression reports

---

#### Champion - $49.99/month
**Target Audience**: Competitive athletes, serious bodybuilders, performance-focused users

**Included**:
- 600,000 AI tokens per month
- Everything in Elite
- Full training program generation
- Complete meal plan automation
- Advanced wearable sync
- Priority chat support
- Custom goal tracking

**New Features**:
- Multi-week training program generation
- Periodization and deload recommendations
- Automated weekly meal plans
- Shopping list generation
- Competition preparation support
- Recovery optimization

**Typical Usage**:
- 40-50 meal scans per month
- 20-25 training sessions with full AI coaching
- 2-3 body scans
- 2-3 fridge scans with weekly meal plans
- 2-3 custom training program generations
- Daily AI check-ins

---

#### Master - $79.99/month
**Target Audience**: Elite athletes, coaches, biohackers, power users

**Included**:
- 1,000,000 AI tokens per month
- Everything in Champion
- **Central Brain full access**
- Holistic cross-forge recommendations
- Real-time optimization suggestions
- Phone support
- Quarterly consultation with nutrition/training expert

**New Features**:
- Complete Central Brain intelligence
- Predictive performance modeling
- Injury risk assessment
- Personalized supplement recommendations
- Advanced sleep and recovery tracking
- Custom notification rules

**Typical Usage**:
- Unlimited meal scanning
- 25-30 training sessions with elite coaching
- 3-4 body scans
- Weekly meal plan regeneration
- Multiple training program variations
- Daily Central Brain insights
- Continuous optimization

---

#### Legend - $149.99/month
**Target Audience**: Coaches with clients, fitness influencers, researchers, app developers

**Included**:
- 2,500,000 AI tokens per month
- Everything in Master
- **API access** to all TwinForge systems
- Webhook integrations
- Custom data exports
- Multi-user management (up to 5 connected accounts)
- Monthly strategy call

**New Features**:
- REST API for integrations
- Bulk operations support
- White-label options (coming soon)
- Anonymized population insights
- Advanced analytics dashboard
- Client management tools

**Typical Usage**:
- Managing 3-5 client accounts
- Bulk meal plan generation
- API-driven automation
- Custom reporting
- Research data collection

---

#### Titan - $299.99/month
**Target Audience**: Professional athletes, celebrities, ultra-high-net-worth individuals

**Included**:
- **Unlimited AI tokens**
- Everything in Legend
- Dedicated success manager
- White-glove onboarding
- Custom feature development priority
- Monthly video consultation with expert team
- 24/7 priority support

**New Features**:
- Truly unlimited AI usage
- Custom AI model fine-tuning on your data
- Bespoke training and nutrition protocols
- Direct line to development team
- Feature request priority
- VIP community access

**Typical Usage**:
- Unlimited everything
- Real-time continuous optimization
- Multiple daily Central Brain analyses
- Custom integrations and workflows
- Concierge-level support

---

## Token System

### What Are Tokens?

Tokens represent AI compute credits. Each AI operation consumes tokens based on:

1. **Model Used**: GPT-4o costs more than GPT-4o-mini
2. **Complexity**: More data analysis = more tokens
3. **Processing Time**: Longer operations = more tokens

### Token Costs by Operation

#### Nutrition Forge
```
Meal Photo Scan (simple):        5,000 - 8,000 tokens
Meal Photo Scan (complex):       8,000 - 12,000 tokens
Barcode Product Analysis:        2,000 - 3,000 tokens
Daily Nutrition Summary:         5,000 - 7,000 tokens
Weekly Trend Analysis:           10,000 - 15,000 tokens
AI Meal Recommendations:         8,000 - 12,000 tokens
```

#### Training Forge
```
Training Session Generation:     15,000 - 25,000 tokens
Session Analysis (post-workout): 8,000 - 12,000 tokens
Exercise Illustration Gen:       3,000 - 5,000 tokens (per exercise)
Multi-week Program:              40,000 - 60,000 tokens
Progression Analysis:            12,000 - 18,000 tokens
```

#### Body Forge
```
Body Scan Processing:            20,000 - 30,000 tokens
Morphology Refinement:           10,000 - 15,000 tokens
Body Composition Insights:       8,000 - 12,000 tokens
Historical Comparison:           6,000 - 10,000 tokens
```

#### Time Forge (Fasting)
```
Fasting Session Insights:        3,000 - 5,000 tokens
Weekly Fasting Analysis:         8,000 - 12,000 tokens
Progression Report:              10,000 - 15,000 tokens
Protocol Optimization:           12,000 - 18,000 tokens
```

#### Energy Forge (Activity)
```
Audio Activity Transcription:    4,000 - 6,000 tokens
Activity Analysis:               6,000 - 10,000 tokens
Weekly Activity Summary:         8,000 - 12,000 tokens
Performance Trend Analysis:      10,000 - 15,000 tokens
```

#### Culinary Forge
```
Fridge Scan Processing:          15,000 - 20,000 tokens
Recipe Generation (3 recipes):   12,000 - 18,000 tokens
Weekly Meal Plan Generation:     25,000 - 35,000 tokens
Shopping List Generation:        5,000 - 8,000 tokens
Recipe Detail Expansion:         4,000 - 6,000 tokens
```

#### Central Brain
```
Daily Quick Insights:            5,000 - 8,000 tokens
Weekly Comprehensive Analysis:   18,000 - 25,000 tokens
Monthly Deep Analysis:           35,000 - 50,000 tokens
Real-time Correlation (Titan):   3,000 - 5,000 tokens per check
```

### Token Rollover Policy

**No Rollover**: Unused tokens expire at the end of each billing cycle.

**Rationale**:
- Encourages active platform engagement
- Prevents token hoarding
- Simplifies billing and accounting
- Aligns with actual AI compute costs

**Exception**: Titan tier users with unlimited tokens are not affected.

---

## Top-Up System

### On-Demand Token Purchases

Users can purchase additional tokens when they exceed their monthly allocation:

| Package | Tokens | Price | Cost per Token |
|---------|--------|-------|----------------|
| Small | 50,000 | $14.99 | $0.0003/token |
| Medium | 150,000 | $39.99 | $0.00027/token |
| Large | 300,000 | $69.99 | $0.00023/token |
| XL | 600,000 | $119.99 | $0.0002/token |

### Top-Up Rules

1. **Available to All Tiers**: Even Essential users can buy top-ups
2. **Same Billing Cycle**: Top-up tokens expire with subscription tokens
3. **No Refunds**: All token purchases are final
4. **Unlimited Purchases**: No limit on number of top-ups per month
5. **Auto-Suggest**: App suggests top-up when user reaches 80% usage

---

## Payment Infrastructure

### Stripe Integration

**Products and Prices**:
- Each tier is a Stripe Product
- Monthly recurring price attached to each product
- Top-ups are one-time payments

**Implementation**:
```typescript
// Stripe Product IDs (Live Mode)
stripe_products: {
  essential: 'prod_essential_twinforge',
  pro: 'prod_pro_twinforge',
  elite: 'prod_elite_twinforge',
  champion: 'prod_champion_twinforge',
  master: 'prod_master_twinforge',
  legend: 'prod_legend_twinforge',
  titan: 'prod_titan_twinforge'
}

// Price IDs (Live Mode - Monthly)
stripe_prices: {
  essential: 'price_essential_monthly',
  pro: 'price_pro_monthly',
  elite: 'price_elite_monthly',
  champion: 'price_champion_monthly',
  master: 'price_master_monthly',
  legend: 'price_legend_monthly',
  titan: 'price_titan_monthly'
}
```

### Database Schema

#### subscriptions table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  tier TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### token_balances table
```sql
CREATE TABLE token_balances (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  subscription_tokens INTEGER DEFAULT 0,
  topup_tokens INTEGER DEFAULT 0,
  total_tokens_available INTEGER GENERATED ALWAYS AS
    (subscription_tokens + topup_tokens) STORED,
  tokens_used_this_cycle INTEGER DEFAULT 0,
  last_reset_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### token_transactions table
```sql
CREATE TABLE token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  transaction_type TEXT NOT NULL,
  tokens_delta INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  forge_id TEXT,
  operation_type TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_token_transactions_user
  ON token_transactions(user_id, created_at DESC);
```

#### subscription_plans table
```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT UNIQUE NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL,
  tokens_per_month INTEGER NOT NULL,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  features JSONB NOT NULL,
  display_order INTEGER NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Edge Functions

### Subscription Management

#### create-checkout-session
Creates Stripe Checkout session for new subscriptions:

```typescript
// supabase/functions/create-checkout-session/index.ts

import Stripe from 'npm:stripe@17.4.0';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-10-28.acacia'
});

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { tier, user_id } = await req.json();

    // Get price ID for tier
    const priceId = getPriceIdForTier(tier);

    // Create or get Stripe customer
    const customer = await getOrCreateStripeCustomer(user_id);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      mode: 'subscription',
      success_url: `${Deno.env.get('APP_URL')}/subscription/success`,
      cancel_url: `${Deno.env.get('APP_URL')}/subscription/cancel`,
      metadata: {
        user_id,
        tier
      }
    });

    return new Response(
      JSON.stringify({ url: session.url }),
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

#### create-portal-session
Creates Stripe Customer Portal session for subscription management:

```typescript
// supabase/functions/create-portal-session/index.ts

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();

    // Get Stripe customer ID
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user_id)
      .single();

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${Deno.env.get('APP_URL')}/settings/subscription`
    });

    return new Response(
      JSON.stringify({ url: session.url }),
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

#### stripe-webhooks
Handles Stripe webhook events:

```typescript
// supabase/functions/stripe-webhooks/index.ts

Deno.serve(async (req: Request) => {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Webhook signature verification failed' }),
      { status: 400 }
    );
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionCancellation(event.data.object);
      break;

    case 'invoice.payment_succeeded':
      await handlePaymentSuccess(event.data.object);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});

async function handleSubscriptionUpdate(subscription: any) {
  const user_id = subscription.metadata.user_id;
  const tier = subscription.metadata.tier;

  // Update subscriptions table
  await supabase
    .from('subscriptions')
    .upsert({
      user_id,
      stripe_customer_id: subscription.customer,
      stripe_subscription_id: subscription.id,
      tier,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      cancel_at_period_end: subscription.cancel_at_period_end
    });

  // Reset token balance for new period
  await resetTokenBalance(user_id, tier);
}

async function resetTokenBalance(user_id: string, tier: string) {
  const tokensForTier = getTokensForTier(tier);

  await supabase
    .from('token_balances')
    .upsert({
      user_id,
      subscription_tokens: tokensForTier,
      topup_tokens: 0, // Reset top-ups
      tokens_used_this_cycle: 0,
      last_reset_at: new Date()
    });
}
```

---

## Token Consumption Tracking

### Token Middleware

All AI Edge Functions use token middleware to track consumption:

```typescript
// supabase/functions/_shared/tokenMiddleware.ts

export async function consumeTokens(
  user_id: string,
  tokens_required: number,
  operation_details: {
    forge_id: string;
    operation_type: string;
    description: string;
  }
): Promise<{ success: boolean; error?: string }> {

  // 1. Check current balance
  const { data: balance } = await supabase
    .from('token_balances')
    .select('*')
    .eq('user_id', user_id)
    .single();

  if (!balance || balance.total_tokens_available < tokens_required) {
    return {
      success: false,
      error: 'Insufficient tokens. Please upgrade or purchase a top-up.'
    };
  }

  // 2. Consume tokens (topup first, then subscription)
  let topup_used = 0;
  let subscription_used = 0;

  if (balance.topup_tokens >= tokens_required) {
    topup_used = tokens_required;
  } else {
    topup_used = balance.topup_tokens;
    subscription_used = tokens_required - topup_used;
  }

  // 3. Update balance
  await supabase
    .from('token_balances')
    .update({
      topup_tokens: balance.topup_tokens - topup_used,
      subscription_tokens: balance.subscription_tokens - subscription_used,
      tokens_used_this_cycle: balance.tokens_used_this_cycle + tokens_required,
      updated_at: new Date()
    })
    .eq('user_id', user_id);

  // 4. Log transaction
  await supabase
    .from('token_transactions')
    .insert({
      user_id,
      transaction_type: 'consumption',
      tokens_delta: -tokens_required,
      balance_after: balance.total_tokens_available - tokens_required,
      description: operation_details.description,
      forge_id: operation_details.forge_id,
      operation_type: operation_details.operation_type,
      metadata: {
        topup_tokens_used: topup_used,
        subscription_tokens_used: subscription_used
      }
    });

  return { success: true };
}
```

### Usage Example in Edge Function

```typescript
// supabase/functions/meal-analyzer/index.ts

Deno.serve(async (req: Request) => {
  const { user_id, meal_photo_url } = await req.json();

  // Estimate token cost
  const estimated_tokens = 8000;

  // Check and consume tokens
  const tokenResult = await consumeTokens(user_id, estimated_tokens, {
    forge_id: 'nutrition',
    operation_type: 'meal_analysis',
    description: 'AI meal photo analysis'
  });

  if (!tokenResult.success) {
    return new Response(
      JSON.stringify({ error: tokenResult.error }),
      { status: 402 } // Payment Required
    );
  }

  // Proceed with AI analysis...
  const analysis = await analyzeMeal(meal_photo_url);

  // Calculate actual tokens used
  const actual_tokens = calculateActualTokens(analysis);

  // Refund difference if overestimated
  if (actual_tokens < estimated_tokens) {
    await refundTokens(user_id, estimated_tokens - actual_tokens);
  }

  return new Response(JSON.stringify(analysis));
});
```

---

## User Interface

### Subscription Management Page

Location: `/settings/subscription`

Components:
1. **Current Plan Card**
   - Tier name and price
   - Token balance (used/available)
   - Next billing date
   - Cancel/Upgrade buttons

2. **Token Usage Chart**
   - Daily token consumption graph
   - Breakdown by Forge
   - Projection for end of cycle

3. **Plan Comparison Table**
   - All 7 tiers side-by-side
   - Feature checklist
   - "Upgrade" buttons

4. **Top-Up Section**
   - Quick-buy token packages
   - Current balance display
   - Purchase history

5. **Billing History**
   - Past invoices
   - Download receipts
   - Payment method management

### Token Balance Widget

Displayed in app header:

```typescript
<TokenBalanceWidget>
  <TokenIcon />
  <Balance>
    {subscription_tokens + topup_tokens} tokens
  </Balance>
  <UsageBar percentage={tokens_used / total_tokens} />
  <Tooltip>
    Subscription: {subscription_tokens}
    Top-ups: {topup_tokens}
    Used this cycle: {tokens_used_this_cycle}
  </Tooltip>
</TokenBalanceWidget>
```

### Low Token Warnings

```typescript
notifications: {
  80_percent: {
    title: 'Token Balance Low',
    message: 'You\'ve used 80% of your monthly tokens',
    action: 'View top-up options',
    priority: 'medium'
  },
  95_percent: {
    title: 'Almost Out of Tokens',
    message: 'Only 5% of your tokens remaining',
    action: 'Purchase top-up now',
    priority: 'high'
  },
  depleted: {
    title: 'Tokens Depleted',
    message: 'Your token balance is empty. Upgrade or buy a top-up to continue.',
    action: 'Upgrade Plan',
    priority: 'critical'
  }
}
```

---

## Feature Gating

### Tier-Based Access Control

```typescript
// Feature access matrix
const FEATURE_GATES = {
  forges: {
    essential: ['energy', 'nutrition', 'time'], // Pick 1
    pro: ['energy', 'nutrition', 'time', 'body', 'culinary', 'training'],
    elite: ['all'],
    champion: ['all'],
    master: ['all'],
    legend: ['all'],
    titan: ['all']
  },

  ai_features: {
    essential: ['manual_entry_only'],
    pro: ['basic_ai_analysis'],
    elite: ['advanced_insights', 'trend_analysis'],
    champion: ['program_generation', 'meal_planning'],
    master: ['central_brain_full'],
    legend: ['api_access', 'bulk_operations'],
    titan: ['unlimited_everything', 'custom_features']
  },

  wearables: {
    essential: false,
    pro: ['basic_sync'],
    elite: ['advanced_sync', 'heart_rate_zones'],
    champion: ['full_sync', 'real_time'],
    master: ['predictive_analytics'],
    legend: ['multi_device'],
    titan: ['custom_integrations']
  },

  support: {
    essential: 'community',
    pro: 'email',
    elite: 'priority_email',
    champion: 'chat',
    master: 'phone',
    legend: 'dedicated_support',
    titan: '24_7_concierge'
  }
};
```

### Frontend Check

```typescript
// Check if user can access feature
function canAccessFeature(
  user_tier: string,
  feature: string
): boolean {
  const tierLevel = TIER_HIERARCHY.indexOf(user_tier);
  const requiredLevel = FEATURE_REQUIREMENTS[feature];

  return tierLevel >= requiredLevel;
}

// Usage in components
{canAccessFeature(userTier, 'central_brain') ? (
  <CentralBrainDashboard />
) : (
  <UpgradePrompt feature="Central Brain" requiredTier="Master" />
)}
```

---

## Pricing Strategy

### Market Positioning

**Essential**: Loss leader to capture market share
**Pro-Elite**: Sweet spot for majority of users, profitable margins
**Champion-Master**: High-value users, excellent margins
**Legend-Titan**: Premium positioning, bespoke service

### Competitive Analysis

| Competitor | Price Range | Our Advantage |
|------------|-------------|---------------|
| MyFitnessPal Premium | $9.99/mo | We have AI + 6 Forges vs. basic tracking |
| Noom | $59/mo | Cheaper with similar coaching, better tech |
| Future (AI Training) | $149/mo | More comprehensive, comparable price at Legend |
| Whoop | $30/mo | We integrate everything, not just recovery |

### Value Proposition

For **$29.99/Elite**:
- Replace MyFitnessPal ($9.99) + Strava Premium ($11.99) + Zero Fasting ($9.99) = $31.97
- Get integrated intelligence + Central Brain correlations
- Single platform vs. juggling 3+ apps

---

## Growth and Retention

### Freemium Trial

**7-Day Pro Trial**: All new users get 7 days of Pro tier free
- No credit card required
- 150,000 tokens to explore all Forges
- Automatically downgrade to Essential if no upgrade

### Upgrade Incentives

1. **Token Running Low**: Suggest upgrade vs. one-time top-up
2. **Feature Discovery**: "Unlock Central Brain with Master tier"
3. **Seasonal Promotions**: 20% off annual plans
4. **Referral Program**: Give 1 month free, get 1 month free

### Retention Tactics

1. **Annual Discount**: 2 months free (16.7% off)
2. **Pause Subscription**: Keep data, pause billing for 1-3 months
3. **Downgrade Path**: Make it easy to switch tiers without losing data
4. **Win-back Campaigns**: Special offers for churned users

---

## Analytics and Reporting

### Key Metrics

```sql
-- Monthly Recurring Revenue
SELECT
  SUM(price_monthly) as mrr,
  COUNT(*) as active_subscriptions
FROM subscriptions s
JOIN subscription_plans p ON s.tier = p.tier
WHERE s.status = 'active';

-- Average Revenue Per User
SELECT
  AVG(price_monthly) as arpu
FROM subscriptions s
JOIN subscription_plans p ON s.tier = p.tier
WHERE s.status = 'active';

-- Token Usage by Tier
SELECT
  tier,
  AVG(tokens_used_this_cycle) as avg_tokens_used,
  AVG(tokens_used_this_cycle::float / tokens_per_month) as utilization_rate
FROM token_balances tb
JOIN subscriptions s ON tb.user_id = s.user_id
JOIN subscription_plans p ON s.tier = p.tier
WHERE s.status = 'active'
GROUP BY tier, tokens_per_month;

-- Churn Rate
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) FILTER (WHERE status = 'canceled') as churned,
  COUNT(*) as total,
  (COUNT(*) FILTER (WHERE status = 'canceled')::float / COUNT(*)) as churn_rate
FROM subscriptions
GROUP BY month
ORDER BY month DESC;
```

---

## Future Enhancements

### Roadmap

**Q1 2026**: Annual Plans with discount
**Q2 2026**: Family Plans (shared tokens across 2-5 users)
**Q3 2026**: Enterprise Plans for gyms and coaches
**Q4 2026**: White-label licensing for corporate wellness

### Experimental Features

- **Usage-Based Pricing**: Pay only for tokens used (no subscription)
- **Crypto Payments**: Accept USDC/ETH for subscriptions
- **NFT Perks**: Exclusive NFT holders get Titan tier for life

---

## Support Resources

### For Users
- [Subscription FAQ](./docs/faq-subscription.md)
- [Token Usage Guide](./docs/token-usage-guide.md)
- [Billing Support](mailto:billing@twinforge.app)

### For Developers
- [Stripe Integration Docs](./STRIPE_PRODUCTS_SETUP.md)
- [Token Middleware API](./docs/api-token-middleware.md)
- [Webhook Testing Guide](./docs/stripe-webhook-testing.md)

---

## Conclusion

The TwinForge monetization system balances accessibility with sustainability through:

1. **Progressive tiers** that match user sophistication and needs
2. **Fair token-based pricing** that aligns costs with AI compute usage
3. **Flexible top-ups** for users who need occasional extra capacity
4. **Premium tiers** with white-glove service for high-value users

This model ensures:
- Entry-level users can start cheaply
- Power users pay fairly for heavy usage
- Business remains sustainable as AI costs scale
- Clear upgrade path from casual to professional use

---

*For implementation details, see STRIPE_PRODUCTS_SETUP.md and individual Edge Function documentation.*
