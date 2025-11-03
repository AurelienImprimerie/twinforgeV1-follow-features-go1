# Culinary Forge - Complete Documentation

**Version**: 2.0
**Last Updated**: October 2025
**Status**: Production Ready

---

## Overview

The Culinary Forge is TwinForge's intelligent recipe workshop and meal planning system. It transforms your fridge into a source of culinary inspiration by using AI to scan ingredients, generate personalized recipes, create optimized meal plans, and produce smart shopping lists.

### Core Mission

**"From Fridge to Table with Intelligence"**

The Culinary Forge solves three common problems:
1. **"What should I cook?"** - AI generates recipes based on what you already have
2. **"What's for dinner this week?"** - Automated meal planning with nutritional optimization
3. **"What do I need to buy?"** - Smart shopping lists that minimize waste and optimize budget

---

## System Components

### 1. Fridge Scanning (Vision AI)

**Purpose**: Convert photos of your fridge/pantry into a structured digital inventory

**How It Works**:
- Take 1-6 photos of fridge shelves, pantry, or countertop
- GPT-4o Vision AI identifies all visible ingredients
- Estimates quantities and freshness
- Categorizes items automatically
- Allows manual editing and refinement

**Technical Details**:
```typescript
Input: Array<Photo> (1-6 images, JPEG/PNG)
Processing: GPT-4o Vision API
Output: {
  items: Array<{
    name: string;
    category: string;
    quantity: number;
    unit: string;
    freshness: number; // 0-1 scale
    confidence: number; // 0-1 scale
  }>;
  metadata: {
    scan_duration: number;
    total_items: number;
    avg_confidence: number;
  }
}
Time: 8-20 seconds per scan
Cost: $0.0015-0.008 (varies with photo count)
```

**Accuracy**:
- Detection: 85-95% confidence average
- Quantity estimation: ±15-20% typical error
- Freshness assessment: Based on visual cues (wilting, browning, etc.)

**User Flow**:
```
Camera Open → Take Photos (1-6) → AI Processing → Review & Edit → Save Inventory
```

---

### 2. Inventory Management

**Purpose**: Maintain accurate, up-to-date inventory of available ingredients

**Features**:

#### Real-Time Tracking
- Add items manually or via scan
- Edit quantities and freshness
- Mark items as used or depleted
- Delete expired items

#### Smart Categorization
- Automatic category assignment
- Standard categories: Proteins, Vegetables, Fruits, Dairy, Grains, Condiments, etc.
- Custom category support
- Category-based filtering

#### Freshness Scoring
```typescript
Freshness Scale (0-1):
- 0.9-1.0: Fresh/Just purchased
- 0.7-0.89: Good condition
- 0.5-0.69: Use soon
- 0.3-0.49: Use immediately
- 0-0.29: Consider discarding
```

#### Expiry Tracking (Coming Soon)
- Manual expiry date entry
- AI-estimated shelf life
- Expiration notifications
- Waste reduction insights

**Database Schema**:
```sql
CREATE TABLE fridge_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  session_id UUID REFERENCES recipe_sessions NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity DECIMAL(10,2),
  unit TEXT,
  freshness DECIMAL(3,2) DEFAULT 1.0,
  notes TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 3. Recipe Generation (AI-Powered)

**Purpose**: Create personalized, inventory-optimized recipes using AI

**Generation Modes**:

#### Progressive Streaming
- Recipes appear one at a time as they're generated
- Real-time progress feedback
- User can stop generation early if satisfied
- Typical: 5-10 recipes in 30-45 seconds

#### Batch Generation
- Generate fixed number (e.g., 10 recipes)
- Wait for all to complete before display
- Slightly faster per recipe
- Better for users who want full set

**Personalization Factors**:

1. **Available Inventory** (Primary)
   - Prioritizes ingredients you already have
   - Suggests complementary items if needed
   - Optimizes for minimal waste

2. **Dietary Restrictions** (Critical)
   - Allergies: Hard exclusions (e.g., peanuts, shellfish)
   - Intolerances: Excludes incompatible foods (e.g., lactose, gluten)
   - Diet type: Vegetarian, vegan, keto, paleo, etc.

3. **Nutritional Goals**
   - Macro targets (protein, carbs, fats)
   - Calorie ranges
   - Objective alignment (weight loss, muscle gain, maintenance)

4. **Kitchen Equipment**
   - Available tools: Oven, stovetop, microwave, blender, etc.
   - Excludes recipes requiring unavailable equipment

5. **Skill Level**
   - Beginner: Simple recipes, basic techniques
   - Intermediate: More complex dishes
   - Advanced: Gourmet preparations

6. **Time Constraints**
   - Quick meals: < 20 minutes
   - Standard: 20-45 minutes
   - Elaborate: 45+ minutes

7. **Food Preferences**
   - Favorite cuisines (Italian, Asian, Mexican, etc.)
   - Liked/disliked ingredients
   - Taste preferences (spicy, sweet, savory)

**Recipe Structure**:
```typescript
interface Recipe {
  id: string;
  title: string;
  description: string;
  servings: number;
  prep_time_minutes: number;
  cook_time_minutes: number;
  total_time_minutes: number;
  difficulty: 'easy' | 'medium' | 'hard';

  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
    is_from_inventory: boolean;
  }>;

  instructions: Array<{
    step_number: number;
    instruction: string;
    time_minutes?: number;
  }>;

  nutrition: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g?: number;
    sugar_g?: number;
  };

  tags: string[]; // e.g., ['vegetarian', 'quick', 'italian']
  dietary_flags: string[]; // e.g., ['gluten-free', 'dairy-free']
  equipment_needed: string[];
  chef_tips?: string[];

  image_url?: string; // Optional AI-generated image
  created_at: string;
}
```

**Generation Process**:
```
User Triggers Generation
  ↓
Load User Profile (allergies, diet, preferences)
  ↓
Load Selected Inventory
  ↓
Build AI Prompt with Constraints
  ↓
Call GPT-4o-mini (Streaming)
  ↓
Parse JSON Recipes Incrementally
  ↓
Validate Against Constraints
  ↓
Save to Database
  ↓
Display to User
```

**AI Prompt Structure** (Simplified):
```
You are a professional chef and nutritionist. Generate 10 recipes using:

AVAILABLE INVENTORY:
[List of ingredients with quantities]

MUST EXCLUDE (Allergies):
[List of allergens]

DIETARY RESTRICTIONS:
[e.g., Vegetarian, Gluten-free]

NUTRITIONAL TARGETS:
Calories: [target range]
Protein: [target range]
Carbs: [target range]
Fat: [target range]

KITCHEN EQUIPMENT:
[Available tools]

SKILL LEVEL: [Beginner/Intermediate/Advanced]
TIME CONSTRAINT: [Max minutes]

PREFERENCES:
Favorite cuisines: [List]
Disliked ingredients: [List]

Generate recipes that:
1. Prioritize inventory ingredients
2. Stay within nutritional targets
3. Match skill level
4. Respect time constraints
5. Exclude allergens completely

Output as JSON array of recipes.
```

**Cost**: $0.003-0.012 per generation (5-10 recipes)

---

### 4. Recipe Detail Expansion

**Purpose**: Provide comprehensive cooking guidance for selected recipes

**Enhanced Details**:

1. **Step-by-Step Instructions**
   - Numbered steps with clear actions
   - Time estimates per step
   - Visual cues (e.g., "until golden brown")

2. **Equipment List**
   - All tools needed
   - Alternatives if unavailable

3. **Ingredient Preparation**
   - Prep instructions (diced, minced, julienned)
   - Pre-cooking requirements (marinating, thawing)

4. **Chef Tips**
   - Professional techniques
   - Common mistakes to avoid
   - Substitution suggestions

5. **Serving Suggestions**
   - Plating ideas
   - Complementary sides
   - Beverage pairings

**User Flow**:
```
Recipe Card → "View Details" → Modal Opens → Full Instructions + Tips
```

**Cost**: $0.002-0.008 per recipe detail expansion

---

### 5. Weekly Meal Planning

**Purpose**: Generate optimized 7-day meal plans based on inventory and goals

**Plan Structure**:
```typescript
interface MealPlan {
  id: string;
  user_id: string;
  week_start_date: string; // ISO date

  days: Array<{
    date: string;
    meals: {
      breakfast?: Recipe;
      lunch?: Recipe;
      dinner?: Recipe;
      snacks?: Array<Recipe>;
    };
    daily_nutrition: {
      calories: number;
      protein_g: number;
      carbs_g: number;
      fat_g: number;
    };
  }>;

  weekly_nutrition: {
    avg_calories: number;
    avg_protein_g: number;
    avg_carbs_g: number;
    avg_fat_g: number;
  };

  ai_explanation: string; // Why this plan was chosen
  inventory_usage_rate: number; // 0-1, how much inventory was used

  created_at: string;
}
```

**Optimization Criteria**:

1. **Nutritional Balance**
   - Daily calorie targets ±10%
   - Macro distribution aligned with goals
   - Micronutrient variety (vitamins, minerals)

2. **Inventory Utilization**
   - Maximize use of available ingredients
   - Prioritize items with lower freshness
   - Minimize waste

3. **Meal Variety**
   - Different cuisines throughout week
   - No repeated meals (unless user preference)
   - Balanced protein sources

4. **Practical Constraints**
   - Meal prep time distribution
   - Leftover planning (dinner → next day lunch)
   - Shopping list minimization

5. **Dietary Compliance**
   - All meals respect allergies/intolerances
   - Consistent with diet type
   - Within macro targets

**AI Explanation Example**:
> "This week's plan focuses on high-protein meals to support your muscle gain goal. I've scheduled your carb-heavy meals on training days (Mon, Wed, Fri) and lighter dinners on rest days. The plan uses 85% of your current inventory, prioritizing vegetables that need to be used soon. You'll need to shop for chicken breast, salmon, and a few fresh vegetables."

**Generation Process**:
```
User Selects Inventory → Triggers Plan Generation
  ↓
Load User Profile + Goals
  ↓
Analyze Inventory (quantities, freshness)
  ↓
Generate 7 Days of Meals (AI)
  ↓
Calculate Nutritional Totals
  ↓
Validate Against Constraints
  ↓
Generate AI Explanation
  ↓
Save Plan to Database
  ↓
Display to User
```

**Cost**: $0.005-0.020 per weekly plan

**Time**: 20-60 seconds generation time

---

### 6. Shopping List Generation

**Purpose**: Create organized, budget-optimized shopping lists from meal plans

**List Structure**:
```typescript
interface ShoppingList {
  id: string;
  user_id: string;
  meal_plan_id: string;

  categories: Array<{
    name: string; // e.g., "Produce", "Dairy", "Meat"
    items: Array<{
      name: string;
      quantity: number;
      unit: string;
      estimated_cost: number;
      notes?: string; // e.g., "Organic preferred"
    }>;
  }>;

  budget_estimate: {
    low: number;
    high: number;
    currency: string;
  };

  shopping_tips: string[]; // AI-generated advice

  created_at: string;
}
```

**Organization Strategies**:

#### By Aisle (Default)
Standard grocery store layout:
1. Produce (fruits, vegetables)
2. Meat & Seafood
3. Dairy & Eggs
4. Bakery
5. Pantry Staples (grains, pasta, canned goods)
6. Condiments & Spices
7. Frozen Foods
8. Beverages

#### By Store Section
For big-box stores with departments:
1. Fresh Foods
2. Packaged Foods
3. Refrigerated
4. Frozen
5. Non-Food

#### Custom
User can reorder categories or create custom organization

**Smart Features**:

1. **Quantity Aggregation**
   - Combines same items across recipes
   - Example: "Chicken breast" needed in 3 recipes → "1.5 kg chicken breast"

2. **Budget Estimation**
   - AI estimates cost ranges per item
   - Provides low/high totals
   - Based on average grocery prices in user's region

3. **Shopping Tips**
   - "Buy chicken in bulk for better price"
   - "Organic spinach recommended for freshness"
   - "Consider frozen berries if fresh are expensive"

4. **Store Integration (Coming Soon)**
   - Direct links to online grocery stores
   - Price comparison across stores
   - One-click add to cart

**Generation Process**:
```
Meal Plan Selected → Extract All Ingredients
  ↓
Remove Inventory Items (already have)
  ↓
Aggregate Quantities
  ↓
Categorize by Aisle
  ↓
Estimate Costs (AI)
  ↓
Generate Shopping Tips
  ↓
Save List
  ↓
Display to User
```

**Cost**: $0.002-0.008 per list

**Time**: 8-20 seconds

---

## User Interface

### Four-Tab System

The Culinary Forge UI is organized into 4 primary tabs:

#### 1. Fridge Tab (Inventory Management)
**Color Theme**: Cyan (#06B6D4)

**Components**:
- **Scan CTA Card**: Prominent button to launch new fridge scan
- **Recent Scans List**: History of past scans with timestamps
- **Inventory Stats**: Total items, categories, freshness distribution
- **Scanner Tips**: Guidance for better scan quality

**User Actions**:
- Launch new fridge scan
- View/edit saved inventories
- Select inventory for recipe generation
- Delete old inventories

**Empty State**:
> "Your fridge inventory is empty. Scan your fridge to get started with AI recipes and meal plans!"

---

#### 2. Recipes Tab
**Color Theme**: Pink (#EC4899)

**Components**:
- **Recipe Cards Grid**: Visual grid of generated recipes
- **Filter System**: Advanced filtering by tags, time, servings
- **Search Bar**: Search by title or ingredients
- **Generation Loader**: Streaming progress for active generation

**Recipe Card Display**:
- Recipe title and image (if available)
- Quick stats: Time, servings, difficulty
- Nutrition preview: Calories, P/C/F
- Dietary tags (vegetarian, gluten-free, etc.)
- Actions: View Details, Save, Delete

**User Actions**:
- Generate new recipes from selected inventory
- Filter and search existing recipes
- View detailed instructions
- Save favorites
- Export recipes (PDF, JSON, text)
- Delete unwanted recipes

**Empty State**:
> "No recipes yet. Select an inventory from the Fridge tab and generate AI recipes!"

---

#### 3. Plan Tab
**Color Theme**: Violet (#8B5CF6)

**Components**:
- **Week Navigator**: Previous/Next week selection
- **Daily Meal Cards**: Expandable cards per day
  - Breakfast, Lunch, Dinner, Snacks
  - Nutrition totals per day
- **Weekly Summary**: Aggregated nutrition stats
- **AI Explanation Card**: Reasoning behind plan choices
- **Plan Actions**: Export, Regenerate, Save

**Daily Meal Card**:
```
Monday, January 15
─────────────────────────
Breakfast: Protein Oatmeal Bowl (420 kcal)
Lunch: Grilled Chicken Salad (550 kcal)
Dinner: Salmon with Roasted Vegetables (680 kcal)
Snack: Greek Yogurt with Berries (180 kcal)
─────────────────────────
Daily Total: 1,830 kcal | 135g P | 165g C | 60g F
```

**User Actions**:
- Generate weekly meal plan from inventory
- Navigate between weeks
- Expand/collapse daily meals
- View recipe details for each meal
- Export plan (PDF, JSON)
- Regenerate specific weeks
- Share plan via email/SMS

**Empty State**:
> "No meal plan yet. Select an inventory and generate your first weekly plan!"

---

#### 4. Shopping Tab
**Color Theme**: Orange (#F59E0B)

**Components**:
- **Shopping List Header**: Budget estimate, item count
- **Category Sections**: Organized by aisle
- **Item Checkboxes**: Mark items as purchased
- **Budget Card**: Cost estimation with breakdown
- **Shopping Tips**: AI-generated advice
- **Export Actions**: Share, PDF, print

**Shopping List Item**:
```
☐ Chicken Breast - 1.5 kg ($12-15)
  Tip: Buy family pack for better price
```

**User Actions**:
- Generate list from meal plan
- Check off items as purchased
- View budget estimation
- Read shopping tips
- Export list (text, PDF, share to phone)
- Send to partner/family via SMS/email

**Empty State**:
> "No shopping list yet. Generate a meal plan first, then create your shopping list!"

---

### Cross-Tab Workflows

#### Workflow 1: Full Pipeline
```
Fridge Tab → Scan Fridge → Review Inventory
  ↓
Recipes Tab → Generate 10 Recipes → Review & Save Favorites
  ↓
Plan Tab → Generate Weekly Plan → Review Daily Meals
  ↓
Shopping Tab → Generate List → Export & Shop
```

#### Workflow 2: Quick Recipe Generation
```
Fridge Tab → Select Existing Inventory
  ↓
Recipes Tab → Generate Recipes → View Details → Cook
```

#### Workflow 3: Meal Plan Update
```
Plan Tab → Regenerate Week → Review Changes → Accept
  ↓
Shopping Tab → Regenerate List → Export
```

---

## AI System Details

### Models Used

1. **GPT-4o Vision** (Fridge Scanning)
   - Best-in-class vision model
   - Accurate ingredient detection
   - Handles complex refrigerator scenes

2. **GPT-4o-mini** (All Text Generation)
   - Fast and cost-effective
   - Excellent for structured output (JSON)
   - Consistent recipe quality
   - Used for: Recipes, Plans, Shopping Lists, Tips

3. **DALL-E 3** (Optional Recipe Images)
   - High-quality food photography
   - Photorealistic results
   - Opt-in feature (additional cost)

### Prompt Engineering

**Key Techniques**:

1. **Structured Output**
   - Always request JSON format
   - Provide clear schema examples
   - Use type annotations

2. **Constraint Reinforcement**
   - Repeat critical constraints (allergies, diet)
   - Use strong directive language
   - Validate outputs programmatically

3. **Few-Shot Learning**
   - Include 1-2 example recipes in prompt
   - Show desired format and style
   - Improves consistency

4. **Chain-of-Thought**
   - Ask AI to "think step-by-step"
   - Request explanations alongside outputs
   - Improves reasoning quality

**Example Prompt Template**:
```
ROLE: You are a professional chef and nutritionist.

TASK: Generate [N] recipes using available ingredients.

CONSTRAINTS:
- MUST use ingredients from inventory list
- MUST exclude: [allergies list]
- MUST comply with: [diet type]
- Target nutrition: [macro ranges]
- Equipment available: [list]
- Skill level: [level]
- Max time: [minutes]

OUTPUT FORMAT:
[
  {
    "title": "string",
    "description": "string",
    "servings": number,
    ...
  }
]

EXAMPLE:
{
  "title": "Grilled Chicken with Roasted Vegetables",
  "description": "A protein-rich meal with colorful vegetables",
  ...
}

Think step-by-step:
1. Review inventory and identify main protein sources
2. Select complementary vegetables and carbs
3. Design balanced meals within macro targets
4. Ensure variety across recipes
5. Output JSON array

BEGIN GENERATION:
```

---

## Profile Integration

### Required Profile Fields

The Culinary Forge requires the following user profile data for personalization:

#### Critical Safety Fields

1. **allergies** (string[])
   - List of allergens to exclude
   - Examples: `['peanuts', 'shellfish', 'tree nuts']`
   - **Hard constraint**: Never included in any recipe

2. **intolerances** (string[])
   - Foods that cause discomfort
   - Examples: `['lactose', 'gluten']`
   - **Soft constraint**: Avoided but may suggest alternatives

3. **diet** (string)
   - Primary dietary restriction
   - Options: `vegetarian`, `vegan`, `pescatarian`, `keto`, `paleo`, `none`
   - **Hard constraint**: All recipes must comply

#### Optimization Fields

4. **objective** (string)
   - Health/fitness goal
   - Options: `muscle_gain`, `weight_loss`, `maintenance`, `performance`
   - Influences macro targets and calorie ranges

5. **macroTargets** (object)
   ```typescript
   {
     protein_g: number;
     carbs_g: number;
     fat_g: number;
     calories: number;
   }
   ```
   - Daily targets for recipes to aim toward

6. **household** (number)
   - Number of people
   - Affects default servings per recipe

7. **kitchenEquipment** (string[])
   - Available cooking tools
   - Examples: `['oven', 'stovetop', 'blender', 'instant_pot']`
   - Excludes recipes requiring unavailable equipment

8. **mealPrepPreferences** (object)
   ```typescript
   {
     max_time_minutes: number;
     skill_level: 'beginner' | 'intermediate' | 'advanced';
     meal_prep_day?: 'sunday' | 'wednesday' | etc.;
   }
   ```

9. **foodPreferences** (object)
   ```typescript
   {
     favorite_cuisines: string[]; // ['italian', 'asian', 'mexican']
     disliked_ingredients: string[]; // ['cilantro', 'mushrooms']
     spice_tolerance: 'mild' | 'medium' | 'hot';
   }
   ```

10. **shoppingPreferences** (object)
    ```typescript
    {
      budget_per_week: number; // in currency units
      shopping_frequency: 'daily' | 'weekly' | 'biweekly';
      preferred_stores: string[];
      organic_priority: boolean;
    }
    ```

### Profile Validation

Before generation, the system validates:
- `allergies` is array with length ≥ 0
- `diet` is one of allowed values
- `macroTargets` has all required fields
- `kitchenEquipment` includes at least one cooking method

If validation fails → User prompted to complete profile

---

## Database Schema

### Core Tables

#### fridge_items
Stores individual inventory items from scans:

```sql
CREATE TABLE fridge_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  session_id UUID REFERENCES recipe_sessions NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity DECIMAL(10,2),
  unit TEXT,
  freshness DECIMAL(3,2) CHECK (freshness >= 0 AND freshness <= 1),
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  notes TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fridge_items_user_session
  ON fridge_items(user_id, session_id);

-- RLS Policies
ALTER TABLE fridge_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own fridge items"
  ON fridge_items FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### recipe_sessions
Groups fridge scans and generated recipes:

```sql
CREATE TABLE recipe_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  inventory_snapshot JSONB, -- Copy of fridge_items at generation time
  profile_snapshot JSONB, -- User preferences at generation time
  selected_recipe_ids UUID[],
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recipe_sessions_user
  ON recipe_sessions(user_id, created_at DESC);

-- RLS
ALTER TABLE recipe_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sessions"
  ON recipe_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### recipes
Stores generated recipes:

```sql
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  session_id UUID REFERENCES recipe_sessions,
  title TEXT NOT NULL,
  description TEXT,
  servings INTEGER DEFAULT 4,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  total_time_minutes INTEGER,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),

  ingredients JSONB NOT NULL, -- Array of ingredient objects
  instructions JSONB NOT NULL, -- Array of step objects
  nutrition JSONB, -- Nutrition facts object

  tags TEXT[],
  dietary_flags TEXT[],
  equipment_needed TEXT[],
  chef_tips TEXT[],

  image_url TEXT,
  is_favorite BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recipes_user ON recipes(user_id, created_at DESC);
CREATE INDEX idx_recipes_tags ON recipes USING GIN(tags);
CREATE INDEX idx_recipes_favorite ON recipes(user_id, is_favorite);

-- RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own recipes"
  ON recipes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### meal_plans
Stores weekly meal plans:

```sql
CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  session_id UUID REFERENCES recipe_sessions,
  week_start_date DATE NOT NULL,

  days JSONB NOT NULL, -- Array of 7 day objects with meals
  weekly_nutrition JSONB,
  ai_explanation TEXT,
  inventory_usage_rate DECIMAL(3,2),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meal_plans_user
  ON meal_plans(user_id, week_start_date DESC);

-- RLS
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own meal plans"
  ON meal_plans FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### shopping_lists
Stores generated shopping lists:

```sql
CREATE TABLE shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  meal_plan_id UUID REFERENCES meal_plans,

  categories JSONB NOT NULL, -- Array of category objects with items
  budget_estimate JSONB,
  shopping_tips TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shopping_lists_user
  ON shopping_lists(user_id, created_at DESC);

-- RLS
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own shopping lists"
  ON shopping_lists FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## Edge Functions

### 1. fridge-scan-vision

**Purpose**: Analyze fridge photos and detect ingredients

**Input**:
```typescript
{
  user_id: string;
  session_id: string;
  image_urls: string[]; // 1-6 Supabase Storage URLs
}
```

**Process**:
1. Load images from Storage
2. Send to GPT-4o Vision with detection prompt
3. Parse JSON response with ingredients
4. Estimate quantities and freshness
5. Insert into `fridge_items` table

**Output**:
```typescript
{
  items: Array<FridgeItem>;
  metadata: {
    scan_duration_ms: number;
    total_items: number;
    avg_confidence: number;
  }
}
```

**Cost**: ~$0.0015-0.008 per scan

---

### 2. inventory-processor

**Purpose**: Normalize and validate detected ingredients

**Input**:
```typescript
{
  user_id: string;
  session_id: string;
}
```

**Process**:
1. Load raw items from `fridge_items`
2. Normalize names (e.g., "Tomato" → "tomatoes")
3. Standardize units
4. Categorize items
5. Detect and merge duplicates
6. Update database

**Output**:
```typescript
{
  processed_items: number;
  duplicates_merged: number;
  categories_assigned: string[];
}
```

**Cost**: ~$0.0005-0.002

---

### 3. inventory-complementer

**Purpose**: Suggest complementary ingredients for better recipes

**Input**:
```typescript
{
  user_id: string;
  session_id: string;
}
```

**Process**:
1. Load processed inventory
2. Analyze for gaps (e.g., has protein but no carbs)
3. Generate complement suggestions with AI
4. Return to frontend (not saved)

**Output**:
```typescript
{
  suggestions: Array<{
    ingredient: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}
```

**Cost**: ~$0.001-0.004

---

### 4. recipe-generator

**Purpose**: Generate personalized recipes from inventory

**Input**:
```typescript
{
  user_id: string;
  session_id: string;
  num_recipes: number; // Typically 5-10
  stream: boolean; // Enable Server-Sent Events
}
```

**Process**:
1. Load user profile + inventory + session preferences
2. Build comprehensive AI prompt with constraints
3. Call GPT-4o-mini with streaming enabled
4. Parse JSON recipes incrementally
5. Validate each recipe (allergies, diet, etc.)
6. Insert into `recipes` table
7. Stream to frontend via SSE

**Output** (per recipe):
```typescript
{
  recipe: Recipe;
  validation: {
    passed: boolean;
    issues: string[];
  }
}
```

**Cost**: ~$0.003-0.012 per batch (5-10 recipes)

---

### 5. recipe-detail-generator

**Purpose**: Expand recipe with detailed instructions and tips

**Input**:
```typescript
{
  recipe_id: string;
  user_id: string;
}
```

**Process**:
1. Load base recipe
2. Generate enhanced details with AI
3. Update recipe in database

**Output**:
```typescript
{
  recipe: Recipe; // With expanded fields
}
```

**Cost**: ~$0.002-0.008 per recipe

---

### 6. meal-plan-generator

**Purpose**: Create optimized weekly meal plan

**Input**:
```typescript
{
  user_id: string;
  session_id: string;
  week_start_date: string; // ISO date
}
```

**Process**:
1. Load profile + inventory + macro targets
2. Generate 7 days of meals with AI
3. Calculate nutritional totals
4. Generate AI explanation
5. Save to `meal_plans` table

**Output**:
```typescript
{
  meal_plan: MealPlan;
}
```

**Cost**: ~$0.005-0.020 per week

---

### 7. shopping-list-generator

**Purpose**: Create organized shopping list from meal plan

**Input**:
```typescript
{
  user_id: string;
  meal_plan_id: string;
}
```

**Process**:
1. Load meal plan + all recipe ingredients
2. Load current inventory
3. Subtract inventory from needed ingredients
4. Aggregate quantities
5. Categorize by aisle with AI
6. Estimate costs
7. Generate shopping tips
8. Save to `shopping_lists` table

**Output**:
```typescript
{
  shopping_list: ShoppingList;
}
```

**Cost**: ~$0.002-0.008 per list

---

### 8. image-generator (Optional)

**Purpose**: Generate photorealistic recipe images

**Input**:
```typescript
{
  recipe_id: string;
  user_id: string;
  quality: 'standard' | 'hd';
}
```

**Process**:
1. Load recipe details
2. Build DALL-E prompt (culinary photography style)
3. Generate image
4. Upload to Supabase Storage
5. Update recipe with image URL

**Output**:
```typescript
{
  image_url: string;
}
```

**Cost**: ~$0.04 per image (standard), ~$0.08 (HD)

---

## Central Brain Integration

### Data Exports to Central Brain

The Culinary Forge exports structured data for cross-forge intelligence:

```typescript
interface CulinaryForgeExport {
  forge_id: 'culinary';
  user_id: string;
  timestamp: string;
  data_type: 'metric' | 'trend' | 'event';
  payload: {
    // Weekly metrics
    recipes_generated: number;
    meal_plans_created: number;
    inventory_scans: number;
    avg_recipe_complexity: number; // 1-10 scale

    // Habits
    preferred_cuisines: string[];
    cooking_frequency: number; // meals/week
    avg_meal_prep_time: number; // minutes

    // Nutritional patterns
    avg_daily_calories: number;
    avg_macros: { protein_g: number; carbs_g: number; fat_g: number };
    dietary_compliance_rate: number; // 0-1

    // Shopping behavior
    avg_weekly_budget: number;
    shopping_frequency: number; // times/week
    waste_rate: number; // 0-1, unused inventory
  };
}
```

### Cross-Forge Correlations

#### With Nutrition Forge
**Correlation**: Generated recipes vs. actual meals consumed

**Insight Example**:
> "You generate meal plans with 2,200 kcal/day but actually consume 2,500 kcal/day. Your meal plans should increase portions by 15% to match your actual intake."

**Action**: Adjust meal plan servings automatically

---

#### With Energy Forge
**Correlation**: Meal timing vs. workout schedules

**Insight Example**:
> "Your training sessions are scheduled at 6am, but your meal plans have breakfast at 8am. Consider adding a pre-workout meal or snack 1-2 hours before training."

**Action**: Shift meal plan timing or add pre-workout meal

---

#### With Time Forge
**Correlation**: Meal plans vs. fasting windows

**Insight Example**:
> "Your meal plans spread eating from 7am-9pm (14-hour window), but your fasting goal is 16:8 (8-hour window). Adjust meal timing to fit within 12pm-8pm eating window."

**Action**: Regenerate meal plans with fasting-compliant timing

---

#### With Body Forge
**Correlation**: Recipe nutrition vs. body composition changes

**Insight Example**:
> "Your meal plans average 160g protein/day, and you've gained 1.5kg lean mass in 60 days. This protein intake is optimal for your muscle gain goal. Maintain current meal plans."

**Action**: No change needed, validation of current approach

---

#### With Training Forge
**Correlation**: Meal timing vs. training intensity

**Insight Example**:
> "Your high-intensity training days (Mon/Wed/Fri) show better performance when you consume 50g+ carbs 2-3 hours before. Update meal plans to schedule carb-rich meals pre-workout on these days."

**Action**: Adjust meal plan carb timing around training

---

## Token Consumption

### Typical Usage Scenarios

#### Casual User (Pro Tier - 150,000 tokens/month)
- 2 fridge scans/month: ~12,000 tokens
- 4 recipe generations (10 recipes each): ~32,000 tokens
- 2 meal plans: ~30,000 tokens
- 2 shopping lists: ~10,000 tokens
- Recipe details expansion (10 recipes): ~40,000 tokens
- **Total**: ~124,000 tokens (83% of allowance)

#### Active User (Elite Tier - 300,000 tokens/month)
- 4 fridge scans/month: ~24,000 tokens
- 8 recipe generations: ~64,000 tokens
- 4 meal plans: ~60,000 tokens
- 4 shopping lists: ~20,000 tokens
- Recipe details (20 recipes): ~80,000 tokens
- Recipe images (10 images): ~50,000 tokens
- **Total**: ~298,000 tokens (99% of allowance)

#### Power User (Champion Tier - 600,000 tokens/month)
- 8 fridge scans/month: ~48,000 tokens
- 12 recipe generations: ~96,000 tokens
- 8 meal plans: ~120,000 tokens
- 8 shopping lists: ~40,000 tokens
- Recipe details (40 recipes): ~160,000 tokens
- Recipe images (20 images): ~100,000 tokens
- Central Brain analysis: ~30,000 tokens
- **Total**: ~594,000 tokens (99% of allowance)

---

## Performance Optimization

### Caching Strategy

#### Recipe Caching (36 hours)
```typescript
cache_key: `recipes:user:${user_id}:session:${session_id}`
ttl: 129600 // 36 hours in seconds

// Why 36h?
// - Recipes don't change frequently
// - Reduces regeneration costs
// - Inventory may change, but recipes stay relevant
```

#### Meal Plan Caching (48 hours)
```typescript
cache_key: `meal_plans:user:${user_id}:week:${week_start_date}`
ttl: 172800 // 48 hours

// Why 48h?
// - Week plans are static once generated
// - Longer TTL = fewer regenerations
// - User can manually regenerate if needed
```

#### Shopping List Caching (24 hours)
```typescript
cache_key: `shopping_lists:user:${user_id}:plan:${meal_plan_id}`
ttl: 86400 // 24 hours

// Why 24h?
// - Lists change as users shop
// - Shorter TTL keeps lists fresh
// - Cheap to regenerate if needed
```

### Database Optimization

1. **Indexes**: All query paths have covering indexes
2. **JSONB Queries**: Use GIN indexes for tag/dietary filtering
3. **Pagination**: Lazy loading (12 recipes per page)
4. **Connection Pooling**: Supabase handles automatically

### Frontend Optimization

1. **React Query**: Aggressive caching with stale-while-revalidate
2. **Zustand Persistence**: localStorage for pipeline state
3. **Image Lazy Loading**: Recipe images load on scroll
4. **Virtual Scrolling**: For large recipe lists
5. **Debounced Search**: 300ms delay on search input

---

## Privacy and Security

### Data Protection

1. **Fridge Photos**: Deleted immediately after processing (retained < 60 seconds)
2. **Recipes**: Encrypted at rest in database
3. **Meal Plans**: User-owned, not shared or analyzed in aggregate
4. **Shopping Lists**: Private, not accessible to third parties

### RLS Policies

All tables have Row Level Security enabled:
- Users can ONLY access their own data
- Service role can access all data (for Edge Functions)
- No cross-user data leakage possible

### GDPR Compliance

- **Right to Access**: Users can export all recipes/plans as JSON
- **Right to Deletion**: Cascade delete removes all Culinary data
- **Right to Rectification**: Users can edit any saved data
- **Data Minimization**: Only necessary profile fields are used

---

## Future Enhancements

### Q1 2026
- **Barcode scanning in recipes**: Link recipes to specific products
- **Recipe rating system**: User feedback for AI learning
- **Custom recipe import**: Add non-AI recipes to library

### Q2 2026
- **Grocery store integration**: Direct API links to Instacart, Amazon Fresh
- **Price tracking**: Historical price data for budget optimization
- **Meal prep mode**: Batch cooking optimizations

### Q3 2026
- **Social sharing**: Share recipes with friends
- **Recipe remixing**: AI variations of existing recipes
- **Voice cooking mode**: Hands-free step-by-step guidance

### Q4 2026
- **Restaurant menu scanning**: Analyze restaurant meals
- **Nutritionist chat**: AI nutritionist for food questions
- **Family meal planning**: Multi-person households with different diets

---

## Troubleshooting

### Common Issues

#### Issue: Fridge scan detects wrong items
**Solution**:
- Retake photos with better lighting
- Remove clutter from view
- Take multiple angles
- Manually edit inventory after scan

#### Issue: Recipes don't match preferences
**Solution**:
- Update user profile with accurate preferences
- Check that allergies/diet are set correctly
- Regenerate recipes with updated profile

#### Issue: Meal plan doesn't fit eating window
**Solution**:
- Update fasting preferences in Time Forge
- Regenerate meal plan
- Central Brain will adjust timing automatically

#### Issue: Shopping list costs are inaccurate
**Solution**:
- Budget estimates are averages, not guarantees
- Prices vary by region and store
- Use as rough guide, not exact budget

---

## Support Resources

### For Users
- In-app help tooltips on each tab
- Video tutorial: "How to Scan Your Fridge"
- FAQ: Common Culinary Forge questions
- Email support: support@twinforge.app

### For Developers
- Edge Function source code documentation
- Database schema reference
- API integration guide (Legend/Titan tiers)

---

## Conclusion

The Culinary Forge transforms the daily challenge of "What's for dinner?" into an intelligent, personalized experience. By combining computer vision, AI recipe generation, and nutritional optimization, it saves users time, reduces food waste, and supports their health goals.

**Key Differentiators**:
1. **Inventory-First**: Recipes based on what you already have
2. **AI Personalization**: Respects allergies, diet, preferences, and goals
3. **Complete Pipeline**: Scan → Recipes → Meal Plan → Shopping List
4. **Central Brain Integration**: Correlates with other Forges for holistic health

**Next Steps**:
- Complete Phase 1: All core features production-ready ✓
- Phase 2: Store integrations and price tracking
- Phase 3: Social features and recipe sharing
- Phase 4: Advanced AI nutritionist mode

---

*This document is the complete reference for the Culinary Forge system. For technical implementation details, see `/docs/technical/culinary-forge.md`. For website content, see relevant sections in WEBSITE_CONTENT_GUIDE.md.*
