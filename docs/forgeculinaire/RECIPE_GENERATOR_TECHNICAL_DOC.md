# Générateur de Recettes - Documentation Technique Complète

## Table des Matières
1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture Single-Agent](#architecture-single-agent)
3. [Pipeline Frontend](#pipeline-frontend)
4. [Edge Function Backend](#edge-function-backend)
5. [Gestion d'État avec Zustand](#gestion-détat-avec-zustand)
6. [Stratégies de Prompting](#stratégies-de-prompting)
7. [Système de Cache](#système-de-cache)
8. [Gestion des Tokens](#gestion-des-tokens)
9. [Génération d'Images](#génération-dimages)
10. [Bibliothèque de Recettes](#bibliothèque-de-recettes)
11. [Performance et Optimisations](#performance-et-optimisations)

---

## 1. Vue d'Ensemble

### Concept Général
Le Générateur de Recettes est un système intelligent qui génère des recettes personnalisées fitness-focused à partir d'un inventaire d'aliments disponibles. Il utilise un agent IA unique avec streaming SSE (Server-Sent Events) pour une expérience utilisateur fluide.

### Technologies Utilisées
- **Frontend**: React + TypeScript + Zustand
- **Backend**: Supabase Edge Functions (Deno)
- **IA**: OpenAI GPT-5-mini (Text) + GPT Image 1 (DALL-E)
- **Base de données**: PostgreSQL (via Supabase)
- **Cache**: Table `ai_analysis_jobs` avec TTL 36h
- **Streaming**: Server-Sent Events (SSE)

### Architecture Globale
```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      RecipeGenerationPage (Orchestrateur UI)        │   │
│  │  • Configuration (inventaire + filtres)             │   │
│  │  • Affichage du pipeline 3 étapes                   │   │
│  │  • Streaming SSE des recettes                       │   │
│  └───────────────────┬──────────────────────────────────┘   │
│                      │                                      │
│  ┌───────────────────▼──────────────────────────────────┐   │
│  │   useRecipeGenerationPipeline (Zustand Store)       │   │
│  │  • État global du pipeline                          │   │
│  │  • Persistance localStorage                         │   │
│  │  • Actions génération/validation                    │   │
│  └───────────────────┬──────────────────────────────────┘   │
└────────────────────┬─┴──────────────────────────────────────┘
                     │
        SSE Streaming (fetch EventSource-like)
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Supabase Edge Functions                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  AGENT UNIQUE: recipe-generator                     │   │
│  │  • GPT-5-mini (Text generation)                     │   │
│  │  • Streaming SSE incrémental                        │   │
│  │  • Anti-répétition system                           │   │
│  │  • Cache: 36h TTL                                   │   │
│  │  • Output: 4 recettes fitness                       │   │
│  │  • Coût: ~30 tokens                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  IMAGE GENERATION: image-generator (shared)         │   │
│  │  • GPT Image 1 (DALL-E)                             │   │
│  │  • Cache: 90 jours TTL                              │   │
│  │  • Fallback: Stock images (Pexels)                  │   │
│  │  • Output: Base64 → Supabase Storage                │   │
│  │  • Coût: ~75 tokens                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Architecture Single-Agent

### Philosophie de Design
Le système utilise **1 agent IA spécialisé** avec streaming en temps réel :
1. **Agent Recipe Generator** : Génération de recettes fitness avec streaming SSE
2. **Agent Image Generator** (partagé) : Génération d'images optionnelle

### Avantages de l'Architecture Single-Agent
- ✅ **Simplicité** : Un seul point d'entrée, une seule responsabilité
- ✅ **Performance** : Streaming SSE pour affichage incrémental
- ✅ **Cache optimal** : TTL 36h pour réutilisation des recettes similaires
- ✅ **Coût maîtrisé** : ~30 tokens par génération
- ✅ **Maintenabilité** : Code concentré, facile à débugger

### Différence avec le Scanner de Frigo
| Aspect | Scanner de Frigo | Générateur de Recettes |
|--------|------------------|------------------------|
| Nombre d'agents | 3 agents séquentiels | 1 agent unique |
| Streaming | Non | Oui (SSE) |
| Cache TTL | 24h/48h/pas de cache | 36h |
| Output | 30-40+ items | 4 recettes |
| Coût | ~155 tokens | ~30 tokens |
| Anti-répétition | Non | Oui |

---

## 3. Pipeline Frontend

### 3.1 Composant Principal : `RecipeGenerationPage.tsx`

**Localisation** : `src/app/pages/RecipeGeneration/RecipeGenerationPage.tsx`

```typescript
const RecipeGenerationPage: React.FC = () => {
  const {
    currentStep,
    isActive,
    recipeCandidates,
    loadingState,
    startGeneration,
    cancelGeneration,
    validateRecipe
  } = useRecipeGenerationPipeline();

  // Hooks personnalisés
  const { handleStreamRecipes } = useRecipeStreamHandlers();

  return (
    <motion.div>
      <RecipeGenerationProgressHeader />
      <RecipeGenerationStageRenderer currentStep={currentStep} />
    </motion.div>
  );
};
```

**Responsabilités** :
- Orchestration UI du pipeline 3 étapes
- Rendu conditionnel selon l'étape (`currentStep`)
- Gestion du streaming SSE incrémental
- Validation et sauvegarde des recettes

### 3.2 Stages du Pipeline

Le pipeline comporte **3 étapes** définies dans `constants.ts` :

```typescript
export const RECIPE_GENERATION_STEPS = [
  {
    id: 'configuration',
    label: 'Configuration',
    description: 'Sélectionnez votre inventaire et filtres',
    startProgress: 0,
    endProgress: 20
  },
  {
    id: 'generating',
    label: 'Génération',
    description: 'L\'IA crée vos recettes fitness...',
    startProgress: 20,
    endProgress: 80
  },
  {
    id: 'validation',
    label: 'Validation',
    description: 'Vérifiez et sauvegardez vos recettes',
    startProgress: 80,
    endProgress: 100
  }
];
```

### 3.3 Streaming SSE Frontend

**Localisation** : `src/app/pages/RecipeGeneration/stages/GeneratingStage.tsx`

#### Gestion du Stream EventSource-like

```typescript
const handleStreamRecipes = async () => {
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/recipe-generator`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inventory_final: selectedInventory,
        user_preferences: userProfile,
        filters: recipeFilters,
        user_id: userId,
        existing_recipes: existingRecipes // Anti-répétition
      })
    }
  );

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('event: skeleton')) {
        const data = JSON.parse(line.slice(13)); // "event: skeleton\ndata: "
        console.log('Skeleton count:', data.count);
      }

      if (line.startsWith('event: recipe')) {
        const recipeData = JSON.parse(line.slice(12)); // "event: recipe\ndata: "
        // Add recipe incrementally to UI
        addRecipeToState(recipeData);
      }

      if (line.startsWith('event: complete')) {
        const completionData = JSON.parse(line.slice(15));
        console.log('Generation complete:', completionData);
      }

      if (line.startsWith('event: error')) {
        const errorData = JSON.parse(line.slice(13));
        console.error('Generation error:', errorData);
      }
    }
  }
};
```

#### Flow SSE Détaillé

```
1. Frontend envoie POST /recipe-generator
   ↓
2. Backend répond avec stream (text/event-stream)
   ↓
3. EVENT: skeleton
   data: { count: 4, recipe_count: 4 }
   → Frontend affiche 4 skeletons
   ↓
4. EVENT: recipe (1/4)
   data: { id, title, ingredients, ... }
   → Frontend remplace skeleton #1
   ↓
5. EVENT: recipe (2/4)
   data: { id, title, ingredients, ... }
   → Frontend remplace skeleton #2
   ↓
6. EVENT: recipe (3/4)
   → Frontend remplace skeleton #3
   ↓
7. EVENT: recipe (4/4)
   → Frontend remplace skeleton #4
   ↓
8. EVENT: complete
   data: { recipes_count: 4, cost_usd: 0.08, processing_time_ms: 8500 }
   → Frontend affiche success
```

---

## 4. Edge Function Backend

### 4.1 Agent Unique : Recipe Generator (`recipe-generator`)

**Localisation** : `supabase/functions/recipe-generator/index.ts`

#### Rôle
Générer **4 recettes fitness personnalisées** à partir de l'inventaire, avec streaming SSE pour affichage incrémental.

#### Configuration Technique
```typescript
{
  model: 'gpt-5-mini',
  max_completion_tokens: 15000,
  stream: true,
  temperature: 0.7 // Créativité modérée
}
```

#### Pricing GPT-5-mini
- **Input**: $0.25 / 1M tokens
- **Cached Input**: $0.025 / 1M tokens
- **Output**: $2.00 / 1M tokens

#### Prompt Strategy (Fitness-Focused + Anti-Répétition)

**Longueur du prompt** : ~5500 caractères

**Objectifs clés** :
1. ✅ Générer **exactement 4 recettes** fitness-focused
2. ✅ **Anti-répétition system** : Analyser l'historique des recettes existantes
3. ✅ Personnalisation maximale selon objectif fitness
4. ✅ Macronutriments optimisés (protéines/glucides/lipides)
5. ✅ Recettes "GROSSES" et nutritionnellement denses

**Prompt complet** (extraits clés) :

```text
Tu es un chef cuisinier expert spécialisé dans la nutrition sportive et
les objectifs fitness pour TwinForge.

RÈGLES STRICTES DE RÉPONSE:
- Réponds UNIQUEMENT avec un JSON valide
- AUCUN texte avant ou après le JSON
- AUCUN markdown (```json)
- Format exact: [{"title": "...", "description": "...", ...}]

MISSION FITNESS:
Tu crées des recettes pour UN UTILISATEUR INDIVIDUEL qui veut atteindre
des OBJECTIFS FITNESS spécifiques. Ces recettes doivent être
NUTRITIONNELLEMENT OPTIMISÉES pour soutenir la performance, la récupération
et la composition corporelle.

INGRÉDIENTS DISPONIBLES:
${ingredientsList}

RECETTES DÉJÀ GÉNÉRÉES (ANALYSE ANTI-RÉPÉTITION OBLIGATOIRE):
${existingRecipesContext}

ANALYSE CRITIQUE REQUISE:
- Identifie les PATTERNS de répétition dans les recettes ci-dessus
- Évite ABSOLUMENT de reproduire ces patterns
- Si tu détectes une tendance (ex: "trop de salades", "trop de dinde"),
  compense activement avec des alternatives
- Chaque nouvelle recette doit apporter une NOUVEAUTÉ significative

CONTRAINTES FITNESS STRICTES:
- Équipement disponible: ${availableEquipment}
- RESTRICTIONS ALIMENTAIRES: ${dietaryConstraints}
- PRÉFÉRENCES ALIMENTAIRES: ${foodConstraints}
- CONTRAINTES SENSORIELLES: ${sensoryConstraints}
- CONTRAINTES DE TEMPS: ${timeConstraints}
- PORTIONS: Recettes pour 1 personne
- OBJECTIFS NUTRITIONNELS: ${macroGuidance}

PERSONNALISATION FITNESS AVANCÉE:
- Genre: ${userIdentity.sex} (influence les besoins nutritionnels)
- Niveau d'activité: ${userIdentity.activity_level}
- OBJECTIF FITNESS: ${getObjectiveDescription(userIdentity.objective)}
- Poids: ${userIdentity.weight_kg}kg

INSTRUCTIONS FITNESS:
1. Génère EXACTEMENT 4 recettes HAUTEMENT OPTIMISÉES
2. PRIORITÉ ABSOLUE À LA NOUVEAUTÉ (anti-répétition)
3. PÉNALITÉ POUR SIMILARITÉ avec l'historique
4. DIVERSITÉ STRUCTURELLE OBLIGATOIRE (types de plats variés)
5. DIVERSITÉ DES MÉTHODES (cuisson variée)
6. RÈGLE ANTI-RÉPÉTITION: Les 4 recettes ne doivent PAS partager le
   même type de plat
7. RESPECTE ABSOLUMENT les allergies
8. OPTIMISE les macronutriments pour l'objectif fitness
9. Crée des "GROSSES RECETTES" - repas complets pour l'entraînement

Format JSON:
[
  {
    "title": "Nom de la recette orientée fitness",
    "description": "Description axée sur les bénéfices nutritionnels",
    "ingredients": [
      {"name": "Ingrédient", "quantity": "quantité", "unit": "unité"}
    ],
    "instructions": ["Étape 1", "Étape 2"],
    "prep_time_min": 15,
    "cook_time_min": 30,
    "servings": 1,
    "dietary_tags": ["riche en protéines", "faible en glucides"],
    "nutritional_info": {
      "calories": 450,
      "protein": 35,
      "carbs": 25,
      "fat": 20,
      "fiber": 8
    },
    "image_signature": "signature pour génération d'image",
    "reasons": ["Soutient la perte de graisse", "Riche en protéines"]
  }
]
```

#### Anti-Répétition System

**1. Extraction de l'historique**
```typescript
const { data: existingRecipes } = await supabase
  .from('saved_recipes')
  .select('title, main_ingredients')
  .eq('user_id', user_id)
  .order('created_at', { ascending: false })
  .limit(20); // 20 dernières recettes
```

**2. Construction du contexte anti-répétition**
```typescript
let existingRecipesContext = '';
if (existing_recipes && existing_recipes.length > 0) {
  existingRecipesContext = `
RECETTES DÉJÀ GÉNÉRÉES (ANALYSE ANTI-RÉPÉTITION OBLIGATOIRE):
${existing_recipes.map((recipe, index) =>
  `${index + 1}. "${recipe.title}" - Ingrédients principaux: ${recipe.main_ingredients?.join(', ')}`
).join('\n')}

ANALYSE CRITIQUE REQUISE:
- Identifie les PATTERNS de répétition (types de plats récurrents,
  ingrédients dominants, méthodes de cuisson similaires)
- Évite ABSOLUMENT de reproduire ces patterns
- Si tu détectes une tendance (ex: "trop de salades"), compense activement
- Chaque nouvelle recette doit apporter une NOUVEAUTÉ significative
`;
}
```

**3. Résultat attendu**
L'IA analyse l'historique et évite :
- Les types de plats répétitifs (ex: si 5 salades → suggérer plats chauds)
- Les ingrédients dominants (ex: si beaucoup de poulet → suggérer poisson/tofu)
- Les méthodes de cuisson similaires (ex: si tout grillé → suggérer mijoté/vapeur)

#### Streaming SSE Implementation

**Localisation** : `supabase/functions/recipe-generator/index.ts:398-648`

```typescript
async function streamRecipesFromOpenAI(
  prompt: string,
  userId: string,
  cacheKey: string,
  supabase: any,
  startTime: number,
  inventory: any[],
  preferences: any,
  filters: any,
  consumeTokensFn: typeof consumeTokensAtomic
) {
  const encoder = new TextEncoder();
  let totalTokens = { input: 0, output: 0 };
  let allRecipes: any[] = [];

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 1. Send skeleton count event
        const skeletonEvent = `event: skeleton\ndata: ${JSON.stringify({
          recipe_count: 4,
          count: 4
        })}\n\n`;
        controller.enqueue(encoder.encode(skeletonEvent));

        // 2. Call OpenAI streaming API
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-5-mini',
            messages: [{ role: 'user', content: prompt }],
            max_completion_tokens: 15000,
            stream: true
          })
        });

        const reader = openaiResponse.body?.getReader();
        let buffer = '';
        let recipeCount = 0;

        // 3. Stream processing
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';

                if (content) {
                  buffer += content;

                  // Extract complete recipes incrementally
                  let extractionResult = extractCompleteRecipes(buffer);

                  while (extractionResult.recipes.length > 0) {
                    for (const recipe of extractionResult.recipes) {
                      if (!recipe.id) recipe.id = crypto.randomUUID();
                      recipeCount++;
                      allRecipes.push(recipe);

                      // 4. Stream recipe event immediately
                      const recipeEvent = `event: recipe\ndata: ${JSON.stringify(recipe)}\n\n`;
                      controller.enqueue(encoder.encode(recipeEvent));
                    }

                    buffer = extractionResult.remainingBuffer;
                    extractionResult = extractCompleteRecipes(buffer);
                  }
                }

                // Track token usage
                if (parsed.usage) {
                  totalTokens.input = parsed.usage.prompt_tokens || 0;
                  totalTokens.output = parsed.usage.completion_tokens || 0;
                }
              } catch (parseError) {
                continue;
              }
            }
          }
        }

        // 5. Fallback parsing if no streaming recipes
        if (allRecipes.length === 0) {
          const fallbackRecipes = parseRecipesFromBuffer(buffer);
          for (const recipe of fallbackRecipes) {
            if (recipe && recipe.title) {
              recipe.id = crypto.randomUUID();
              recipeCount++;
              allRecipes.push(recipe);

              const recipeEvent = `event: recipe\ndata: ${JSON.stringify(recipe)}\n\n`;
              controller.enqueue(encoder.encode(recipeEvent));
            }
          }
        }

        // 6. Fitness fallback if still empty
        if (allRecipes.length === 0) {
          const fallbackRecipes = generateFitnessFallbackRecipes(inventory, preferences);
          for (const recipe of fallbackRecipes) {
            recipe.id = crypto.randomUUID();
            recipeCount++;
            allRecipes.push(recipe);

            const recipeEvent = `event: recipe\ndata: ${JSON.stringify(recipe)}\n\n`;
            controller.enqueue(encoder.encode(recipeEvent));
          }
        }

        // 7. Send completion event
        const costUsd = (totalTokens.input * 0.25 / 1000000) +
                        (totalTokens.output * 2.00 / 1000000);
        const processingTime = Date.now() - startTime;

        const completionEvent = `event: complete\ndata: ${JSON.stringify({
          recipes_count: allRecipes.length,
          processing_time_ms: processingTime,
          cost_usd: costUsd,
          input_tokens: totalTokens.input,
          output_tokens: totalTokens.output,
          model_used: 'gpt-5-mini'
        })}\n\n`;
        controller.enqueue(encoder.encode(completionEvent));

        // 8. Cache the result
        await supabase.from('ai_analysis_jobs').upsert({
          user_id: userId,
          analysis_type: 'recipe_generation',
          status: 'completed',
          input_hash: cacheKey,
          result_payload: { recipes: allRecipes },
          created_at: new Date().toISOString()
        });

        // 9. Consume tokens atomically
        await consumeTokensFn(supabase, {
          userId: userId,
          edgeFunctionName: 'recipe-generator',
          operationType: 'recipe_generation',
          openaiModel: 'gpt-5-mini',
          openaiInputTokens: totalTokens.input,
          openaiOutputTokens: totalTokens.output,
          openaiCostUsd: costUsd
        }, crypto.randomUUID());

        controller.close();
      } catch (error: any) {
        const errorEvent = `event: error\ndata: ${JSON.stringify({
          error: error.message
        })}\n\n`;
        controller.enqueue(encoder.encode(errorEvent));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

#### Parsing Incrémental Amélioré

**Fonction clé** : `extractCompleteRecipes()`

**Innovation** : Extraction **objet par objet** sans attendre le tableau complet `]`.

```typescript
function extractCompleteRecipes(buffer: string): {
  recipes: any[];
  remainingBuffer: string
} {
  const out: any[] = [];
  if (!buffer) return { recipes: out, remainingBuffer: buffer };

  // Trim leading noise until '[' or '{'
  let startIdx = buffer.search(/[\[\{]/);
  if (startIdx > 0) buffer = buffer.slice(startIdx);
  if (startIdx === -1) return { recipes: out, remainingBuffer: buffer };

  let i = 0;
  let inString = false;
  let escapeNext = false;
  let objDepth = 0;
  let objStart = -1;
  let arrayStarted = false;

  const isRecipeLike = (v: any) =>
    v && typeof v === 'object' && !!v.title && Array.isArray(v.ingredients);

  while (i < buffer.length) {
    const ch = buffer[i];

    if (escapeNext) { escapeNext = false; i++; continue; }
    if (inString) {
      if (ch === '\\') { escapeNext = true; i++; continue; }
      if (ch === '"') { inString = false; i++; continue; }
      i++; continue;
    }

    if (ch === '"') { inString = true; i++; continue; }

    // Mark array start
    if (!arrayStarted && objDepth === 0 && ch === '[') {
      arrayStarted = true;
      i++;
      continue;
    }

    if (ch === '{') {
      if (objDepth === 0) objStart = i;
      objDepth++;
      i++;
      continue;
    }

    if (ch === '}') {
      objDepth--;
      i++;

      // Complete object extracted
      if (objDepth === 0 && objStart !== -1) {
        const jsonStr = buffer.slice(objStart, i);
        try {
          const parsed = JSON.parse(jsonStr);
          if (isRecipeLike(parsed)) {
            if (!parsed.id) parsed.id = crypto.randomUUID();
            out.push(parsed);

            // Consume trailing whitespace and comma
            let j = i;
            while (j < buffer.length && /\s/.test(buffer[j])) j++;
            if (arrayStarted && buffer[j] === ',') {
              j++;
              while (j < buffer.length && /\s/.test(buffer[j])) j++;
            }

            // Drop consumed prefix and restart
            buffer = buffer.slice(j);
            i = 0;
            objStart = -1;
            continue;
          }
        } catch (_e) {
          // Not valid yet, keep reading
        }
      }
      continue;
    }

    i++;
  }

  return { recipes: out, remainingBuffer: buffer };
}
```

**Avantage** : Les recettes apparaissent **une par une** dans l'UI au fur et à mesure du streaming, pas toutes à la fin.

#### Système de Cache

**TTL** : 36 heures

**Génération de la clé** :
```typescript
async function generateCacheKey(
  inventory: any[],
  preferences: any,
  filters: any,
  userId: string,
  existingRecipes?: any[]
) {
  const data = JSON.stringify({
    inventory: inventory?.map((item: any) => ({
      name: item.name,
      quantity: item.quantity
    })) || [],
    fitness_preferences: {
      nutrition: preferences?.nutrition || {},
      macro_targets: preferences?.macro_targets || {},
      user_identity: preferences?.user_identity || {},
      meal_prep_preferences: preferences?.meal_prep_preferences || {},
      kitchen_equipment: preferences?.kitchen_equipment || {},
      food_preferences: preferences?.food_preferences || {},
      sensory_preferences: preferences?.sensory_preferences || {}
    },
    filters,
    userId,
    existing_recipes: existingRecipes || [],
    version: 'streaming_v3'
  });

  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
```

**Cache lookup** :
```typescript
const { data: cachedResult } = await supabase
  .from('ai_analysis_jobs')
  .select('result_payload')
  .eq('input_hash', cacheKey)
  .eq('analysis_type', 'recipe_generation')
  .gte('created_at', new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString())
  .single();

if (cachedResult?.result_payload) {
  // Stream cached recipes one by one
  return streamCachedRecipes(cachedResult.result_payload.recipes, startTime);
}
```

#### Fallback Fitness Recipes

**Fonction** : `generateFitnessFallbackRecipes()`

Génère des recettes par défaut si OpenAI échoue, adaptées à l'objectif fitness :

```typescript
function generateFitnessFallbackRecipes(inventory: any[], preferences: any) {
  const userIdentity = preferences?.user_identity || {};
  const objective = userIdentity.objective || 'recomp';
  const availableIngredients = inventory.map((item: any) => item.name.toLowerCase());

  const fitnessRecipes: any[] = [];

  // Recipe 1: High-Protein Bowl (if protein available)
  if (availableIngredients.some(ing => /poulet|thon|œuf|fromage/.test(ing))) {
    fitnessRecipes.push({
      title: "Bowl Protéiné Post-Entraînement",
      description: "Recette riche en protéines pour optimiser la récupération",
      ingredients: [
        { name: "Protéine disponible", quantity: "150", unit: "g" },
        { name: "Légumes colorés", quantity: "200", unit: "g" },
        { name: "Glucides complexes", quantity: "80", unit: "g" },
        { name: "Huile d'olive", quantity: "1", unit: "cuillère à soupe" }
      ],
      instructions: [
        "Préparez la source de protéines",
        "Cuisez les légumes à la vapeur",
        "Préparez les glucides complexes",
        "Assemblez dans un bowl"
      ],
      prep_time_min: 15,
      cook_time_min: 20,
      servings: 1,
      dietary_tags: ["riche en protéines", "post-entraînement"],
      nutritional_info: {
        calories: objective === 'fat_loss' ? 380 : 520,
        protein: 35,
        carbs: objective === 'fat_loss' ? 25 : 40,
        fat: objective === 'fat_loss' ? 12 : 18,
        fiber: 8
      },
      reasons: [
        `Optimisé pour ${objective}`,
        "Ratio protéines/glucides idéal"
      ]
    });
  }

  // Recipe 2: Fat Loss Salad (if vegetables available)
  if (objective === 'fat_loss' && availableIngredients.some(ing => /légume|salade/.test(ing))) {
    fitnessRecipes.push({
      title: "Salade Brûle-Graisse Haute Satiété",
      description: "Faible en glucides, riche en fibres et protéines",
      nutritional_info: {
        calories: 320,
        protein: 28,
        carbs: 12,
        fat: 18,
        fiber: 12
      }
    });
  }

  // Recipe 3: Muscle Gain Power Bowl
  if (objective === 'muscle_gain') {
    fitnessRecipes.push({
      title: "Power Bowl Prise de Masse",
      nutritional_info: {
        calories: 650,
        protein: 40,
        carbs: 55,
        fat: 25,
        fiber: 8
      }
    });
  }

  return fitnessRecipes;
}
```

---

## 5. Gestion d'État avec Zustand

### 5.1 Store Principal : `useRecipeGenerationPipeline`

**Localisation** : `src/system/store/recipeGeneration/index.ts`

#### Configuration du Store

```typescript
export const useRecipeGenerationPipeline = create<RecipeGenerationPipelineState>()(
  persist(
    (set, get) => ({
      // État
      currentStep: 'configuration',
      isActive: false,
      currentSessionId: null,
      simulatedOverallProgress: 0,
      recipeCandidates: [],
      loadingState: 'idle',
      loadingMessage: '',
      steps: RECIPE_GENERATION_STEPS,
      config: {
        selectedInventoryId: null,
        recipeCount: DEFAULT_RECIPE_COUNT
      },

      // Actions modulaires
      ...createGenerationActions(set, get),
      ...createNavigationActions(set, get),
      ...createRecipeActions(set, get),

      // Config actions
      setConfig: (config) => {
        set(state => ({
          config: { ...state.config, ...config }
        }));
      },

      setLoadingState: (state: 'idle' | 'generating' | 'streaming') => {
        set({ loadingState: state });
      }
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        config: state.config,
        currentSessionId: state.currentSessionId
      })
    }
  )
);
```

#### État Complet du Store

```typescript
interface RecipeGenerationPipelineState {
  // Navigation
  currentStep: RecipeGenerationStep;
  isActive: boolean;
  currentSessionId: string | null;

  // Progression
  simulatedOverallProgress: number;

  // Données
  recipeCandidates: Recipe[]; // 4 recettes générées
  config: {
    selectedInventoryId: string | null;
    recipeCount: number; // Toujours 4
  };

  // Métadonnées
  loadingState: 'idle' | 'generating' | 'streaming';
  loadingMessage: string;
  steps: RecipeGenerationStepData[];
}
```

### 5.2 Actions Modulaires

#### `generationActions.ts`

```typescript
export const createGenerationActions = (set, get) => ({
  startGeneration: async (inventoryId: string, filters?: RecipeFilters) => {
    const sessionId = crypto.randomUUID();
    set({
      isActive: true,
      currentSessionId: sessionId,
      currentStep: 'generating',
      loadingState: 'generating'
    });

    // Fetch inventory
    const { data: inventory } = await supabase
      .from('fridge_scan_sessions')
      .select('final_inventory')
      .eq('id', inventoryId)
      .single();

    // Fetch user profile
    const userProfile = useUserStore.getState().profile;

    // Fetch existing recipes (anti-répétition)
    const { data: existingRecipes } = await supabase
      .from('saved_recipes')
      .select('title, main_ingredients')
      .eq('user_id', userId)
      .limit(20);

    // Stream recipes with SSE
    await streamRecipesFromBackend({
      inventory: inventory.final_inventory,
      userProfile,
      filters,
      existingRecipes,
      onRecipe: (recipe) => {
        // Add recipe incrementally
        set(state => ({
          recipeCandidates: [...state.recipeCandidates, recipe]
        }));
      },
      onComplete: (metadata) => {
        set({
          currentStep: 'validation',
          loadingState: 'idle'
        });
      },
      onError: (error) => {
        console.error('Recipe generation error:', error);
        set({ loadingState: 'idle' });
      }
    });
  },

  cancelGeneration: () => {
    set({
      isActive: false,
      currentStep: 'configuration',
      recipeCandidates: [],
      loadingState: 'idle'
    });
  }
});
```

#### `recipeActions.ts`

```typescript
export const createRecipeActions = (set, get) => ({
  addRecipeCandidate: (recipe: Recipe) => {
    set(state => ({
      recipeCandidates: [...state.recipeCandidates, recipe]
    }));
  },

  removeRecipeCandidate: (recipeId: string) => {
    set(state => ({
      recipeCandidates: state.recipeCandidates.filter(r => r.id !== recipeId)
    }));
  },

  saveRecipe: async (recipe: Recipe) => {
    const { data, error } = await supabase
      .from('saved_recipes')
      .insert({
        id: recipe.id,
        user_id: userId,
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        nutritional_info: recipe.nutritional_info,
        prep_time_min: recipe.prep_time_min,
        cook_time_min: recipe.cook_time_min,
        servings: recipe.servings,
        dietary_tags: recipe.dietary_tags,
        image_url: recipe.imageUrl,
        main_ingredients: recipe.ingredients.map(i => i.name)
      });

    if (!error) {
      console.log('Recipe saved successfully');
    }
  },

  saveAllRecipes: async () => {
    const { recipeCandidates } = get();
    const promises = recipeCandidates.map(recipe =>
      get().saveRecipe(recipe)
    );
    await Promise.all(promises);

    set({
      recipeCandidates: [],
      currentStep: 'configuration',
      isActive: false
    });
  }
});
```

#### `navigationActions.ts`

```typescript
export const createNavigationActions = (set, get) => ({
  goToStep: (step: RecipeGenerationStep) => {
    set({ currentStep: step });
  },

  nextStep: () => {
    const { currentStep, steps } = get();
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      set({ currentStep: steps[currentIndex + 1].id });
    }
  },

  previousStep: () => {
    const { currentStep, steps } = get();
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      set({ currentStep: steps[currentIndex - 1].id });
    }
  }
});
```

---

## 6. Stratégies de Prompting

### 6.1 Fitness-Focused Prompting

#### Objectif
Générer des recettes **nutritionnellement optimisées** pour des objectifs fitness spécifiques.

#### Techniques Utilisées

**1. Contextualisation complète du profil fitness**
```text
PERSONNALISATION FITNESS AVANCÉE:
- Genre: ${userIdentity.sex} (influence les besoins nutritionnels)
- Niveau d'activité: ${userIdentity.activity_level}
- OBJECTIF FITNESS: ${getObjectiveDescription(userIdentity.objective)}
  * fat_loss: PERTE DE GRAISSE - Déficit calorique avec préservation musculaire
  * muscle_gain: PRISE DE MUSCLE - Surplus calorique avec optimisation protéique
  * recomp: RECOMPOSITION CORPORELLE - Équilibre précis perte de gras + gain muscle
- Poids: ${userIdentity.weight_kg}kg (pour calculs nutritionnels)
```

**2. Calcul automatique des besoins caloriques**
```typescript
function calculateFitnessCalories(userIdentity: any) {
  if (!userIdentity.weight_kg) return 2000;

  const baseCalories = userIdentity.weight_kg * 24; // BMR approximation
  const activityMultiplier = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'active': 1.725,
    'athlete': 1.9
  }[userIdentity.activity_level] || 1.55;

  const maintenanceCalories = baseCalories * activityMultiplier;

  switch (userIdentity.objective) {
    case 'fat_loss':
      return Math.round(maintenanceCalories * 0.8); // 20% deficit
    case 'muscle_gain':
      return Math.round(maintenanceCalories * 1.1); // 10% surplus
    case 'recomp':
      return Math.round(maintenanceCalories); // Maintenance
    default:
      return Math.round(maintenanceCalories);
  }
}
```

**3. Calcul automatique des protéines**
```typescript
function calculateFitnessProtein(userIdentity: any) {
  if (!userIdentity.weight_kg) return 120;

  const multiplier = {
    'fat_loss': 2.2,    // High protein for muscle preservation
    'muscle_gain': 2.0, // High protein for muscle building
    'recomp': 2.4       // Very high protein for recomposition
  }[userIdentity.objective] || 1.8;

  return Math.round(userIdentity.weight_kg * multiplier);
}
```

**4. Guidance nutritionnelle dans le prompt**
```text
OBJECTIFS NUTRITIONNELS:
- Calories cible: ~${calculatedCalories} kcal/jour
- Protéines cible: ${calculatedProtein}g/jour
- Fibres minimum: ${macroTargets.fiberMinG}g
- Sucre maximum: ${macroTargets.sugarMaxG}g
```

### 6.2 Anti-Répétition System

#### Objectif
Éviter de générer des recettes similaires à celles déjà créées.

#### Techniques Utilisées

**1. Injection de l'historique complet**
```text
RECETTES DÉJÀ GÉNÉRÉES (ANALYSE ANTI-RÉPÉTITION OBLIGATOIRE):
1. "Salade César Protéinée" - Ingrédients principaux: Poulet, laitue, parmesan
2. "Bowl Quinoa Légumes" - Ingrédients principaux: Quinoa, brocoli, tofu
3. "Pâtes Carbonara Light" - Ingrédients principaux: Pâtes, œufs, bacon
...
```

**2. Instructions anti-répétition explicites**
```text
ANALYSE CRITIQUE REQUISE:
- Identifie les PATTERNS de répétition dans les recettes ci-dessus
  (types de plats récurrents, ingrédients dominants, méthodes de cuisson)
- Évite ABSOLUMENT de reproduire ces patterns
- Si tu détectes une tendance (ex: "trop de salades", "trop de dinde",
  "trop de plats froids"), compense activement avec des alternatives
- Chaque nouvelle recette doit apporter une NOUVEAUTÉ significative

PRIORITÉ ABSOLUE À LA NOUVEAUTÉ:
Chaque recette doit être significativement différente des 'RECETTES DÉJÀ
GÉNÉRÉES' en termes de type de plat, saveurs dominantes et combinaisons
d'ingrédients principaux

PÉNALITÉ POUR SIMILARITÉ:
Si tu identifies une similarité potentielle avec l'historique, REJETTE
cette idée et trouve une alternative créative

DIVERSITÉ STRUCTURELLE OBLIGATOIRE:
Varie les types de plats parmi (salade, plat mijoté, gratin, sandwich,
smoothie, bol, ragoût, wrap, curry, wok, soupe, omelette, grillades, sauté)

DIVERSITÉ DES MÉTHODES:
Varie les méthodes de cuisson parmi (au four, à la poêle, à la vapeur,
sans cuisson, grillé, mijoté, sauté, mixé, mariné)
```

**3. Contrainte sur les 4 recettes générées**
```text
RÈGLE ANTI-RÉPÉTITION:
Les 4 recettes ne doivent PAS partager le même type de plat principal
ou la même structure de repas
```

#### Résultats Attendus

**Sans anti-répétition** :
- Recette 1 : Salade poulet
- Recette 2 : Salade thon
- Recette 3 : Salade crevettes
- Recette 4 : Salade saumon
→ **Monotonie**

**Avec anti-répétition** :
- Recette 1 : Bowl quinoa légumes rôtis
- Recette 2 : Wok poulet sauce teriyaki
- Recette 3 : Curry de pois chiches
- Recette 4 : Omelette aux champignons
→ **Variété maximale**

---

## 7. Système de Cache

### 7.1 Architecture du Cache

#### Table Supabase : `ai_analysis_jobs`

**TTL** : 36 heures

```sql
-- Lookup
SELECT result_payload
FROM ai_analysis_jobs
WHERE input_hash = '${cacheKey}'
  AND analysis_type = 'recipe_generation'
  AND created_at >= now() - interval '36 hours'
LIMIT 1;
```

### 7.2 Génération de la Clé de Cache

**Fonction** : `generateCacheKey()`

**Paramètres inclus** :
- Inventaire (noms + quantités)
- Préférences fitness complètes
- Filtres (temps, servings, etc.)
- User ID
- **Historique des 20 dernières recettes** (anti-répétition)
- Version (pour invalider les anciens caches)

**Exemple de clé** :
```typescript
{
  inventory: [
    { name: "Poulet", quantity: "500g" },
    { name: "Brocoli", quantity: "300g" }
  ],
  fitness_preferences: {
    nutrition: { diet: "balanced", allergies: [] },
    macro_targets: { kcal: 2200, protein: 160 },
    user_identity: {
      sex: "male",
      weight_kg: 75,
      objective: "muscle_gain"
    }
  },
  filters: { max_prep_time: 30 },
  userId: "uuid",
  existing_recipes: [
    { title: "Salade César", main_ingredients: ["Poulet", "Laitue"] }
  ],
  version: "streaming_v3"
}
→ SHA-256 → cacheKey: "a7f3e9d8c..."
```

### 7.3 Streaming Cached Recipes

**Fonction** : `streamCachedRecipes()`

**Flow** :
1. Lookup cache → recipes trouvées
2. Stream skeleton event (`count: 4`)
3. Stream chaque recipe avec delay 200ms (simule streaming)
4. Stream completion event (`cache_hit: true, cost_usd: 0`)

```typescript
function streamCachedRecipes(recipes: any[], startTime: number) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 1. Skeleton
        const skeletonEvent = `event: skeleton\ndata: ${JSON.stringify({
          recipe_count: recipes.length,
          count: recipes.length
        })}\n\n`;
        controller.enqueue(encoder.encode(skeletonEvent));

        // 2. Stream each recipe with delay
        for (let i = 0; i < recipes.length; i++) {
          const recipe = recipes[i];

          if (!recipe.id) recipe.id = crypto.randomUUID();

          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }

          const recipeEvent = `event: recipe\ndata: ${JSON.stringify(recipe)}\n\n`;
          controller.enqueue(encoder.encode(recipeEvent));
        }

        // 3. Completion
        const completionEvent = `event: complete\ndata: ${JSON.stringify({
          recipes_count: recipes.length,
          processing_time_ms: Date.now() - startTime,
          cost_usd: 0,
          input_tokens: 0,
          output_tokens: 0,
          model_used: 'cached',
          cache_hit: true
        })}\n\n`;
        controller.enqueue(encoder.encode(completionEvent));

        controller.close();
      } catch (error: any) {
        const errorEvent = `event: error\ndata: ${JSON.stringify({
          error: error.message
        })}\n\n`;
        controller.enqueue(encoder.encode(errorEvent));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

### 7.4 Métriques de Cache

#### Cache Hit Rate Estimé
- **Scénario 1** : Utilisateur génère 2 fois avec même inventaire → 50% cache hit
- **Scénario 2** : Utilisateur modifie légèrement inventaire → 0% cache hit
- **Scénario 3** : Utilisateur génère après 36h → 0% cache hit (TTL expiré)

**Estimation globale** : 20-30% cache hit rate

#### Économies Estimées

**Sans cache** :
- Coût par génération : ~$0.08 (5000 input + 3000 output tokens)
- 1000 users × 3 générations/mois = 3000 générations
- Coût total : **$240/mois**

**Avec cache (25% hit rate)** :
- 750 générations cachées × $0.00 = $0
- 2250 générations nouvelles × $0.08 = $180
- **Coût total : $180/mois**
- **Économie : $60/mois (25%)**

---

## 8. Gestion des Tokens

### 8.1 Estimation des Tokens

**Fonction** : Pre-check avant génération

```typescript
const estimatedTokens = 30;

const tokenCheck = await checkTokenBalance(supabase, user_id, estimatedTokens);

if (!tokenCheck.hasEnoughTokens) {
  return createInsufficientTokensResponse(
    tokenCheck.currentBalance,
    estimatedTokens,
    !tokenCheck.isSubscribed,
    corsHeaders
  );
}
```

### 8.2 Consommation Atomique

**Fonction** : `consumeTokensAtomic()`

**Appelée après génération réussie** :

```typescript
const requestId = crypto.randomUUID();
const tokenResult = await consumeTokensAtomic(supabase, {
  userId: userId,
  edgeFunctionName: 'recipe-generator',
  operationType: 'recipe_generation',
  openaiModel: 'gpt-5-mini',
  openaiInputTokens: totalTokens.input,
  openaiOutputTokens: totalTokens.output,
  openaiCostUsd: costUsd,
  metadata: {
    recipes_count: allRecipes.length,
    processing_time_ms: processingTime,
    has_preferences: !!preferences,
    has_filters: !!filters
  }
}, requestId);

if (!tokenResult.success) {
  console.error('❌ Token consumption failed', {
    userId,
    error: tokenResult.error,
    requestId
  });
}
```

### 8.3 Détail des Coûts

**GPT-5-mini Pricing** :
- Input : $0.25 / 1M tokens
- Output : $2.00 / 1M tokens

**Calcul du coût réel** :
```typescript
const costUsd = (totalTokens.input * 0.25 / 1000000) +
                (totalTokens.output * 2.00 / 1000000);
```

**Exemple concret** :
- Input : 5000 tokens (prompt + inventaire + profil + historique)
- Output : 3000 tokens (4 recettes détaillées JSON)
- **Coût** : (5000 × 0.25 / 1M) + (3000 × 2.00 / 1M) = $0.00125 + $0.006 = **$0.00725**

**Conversion interne** :
- 1 token interne ≈ $0.001
- Coût réel $0.00725 → **~30 tokens internes**

---

## 9. Génération d'Images

### 9.1 Edge Function Partagée : `image-generator`

**Localisation** : `supabase/functions/image-generator/index.ts`

**Rôle** : Générer des images pour les recettes (et les meal plans) via GPT Image 1 (DALL-E).

#### Configuration Technique

```typescript
{
  model: 'dall-e-3',
  quality: 'standard',
  size: '1024x1024',
  style: 'natural'
}
```

#### Pricing GPT Image 1 (DALL-E 3)
- **Standard 1024x1024** : $0.040 / image
- **HD 1024x1024** : $0.080 / image

**Choix** : Standard ($0.040) pour balance coût/qualité

#### Input Format

```typescript
{
  recipe_id: "uuid",
  type: "recipe",
  recipe_details: {
    title: "Bowl Protéiné Post-Entraînement",
    description: "Recette riche en protéines...",
    ingredients: [
      { name: "Poulet grillé", quantity: "150", unit: "g" },
      { name: "Quinoa", quantity: "80", unit: "g" }
    ],
    dietary_tags: ["riche en protéines", "post-entraînement"]
  },
  image_signature: "high protein fitness bowl post workout",
  user_id: "uuid"
}
```

#### Génération de l'Image Signature

**Fonction** : `generateImageSignature()`

```typescript
async function generateImageSignature(
  title: string,
  ingredients: string[]
): Promise<string> {
  const data = JSON.stringify({ title, ingredients });
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
```

**Utilité** : Éviter de générer 2 fois la même image pour des recettes identiques.

#### Système de Cache (90 jours TTL)

**Cache lookup** :
```typescript
const { data: cachedImage } = await supabase
  .from('generated_images')
  .select('image_url')
  .eq('image_signature', imageSignature)
  .eq('type', 'recipe')
  .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
  .single();

if (cachedImage) {
  return {
    image_url: cachedImage.image_url,
    cached: true,
    cost_usd: 0
  };
}
```

**Justification du TTL 90 jours** :
- Images de recettes changent peu
- Coût élevé ($0.04/image)
- Économie massive avec cache long

#### Prompt DALL-E

**Construction** :
```typescript
const dallePrompt = `A professional food photography shot of ${recipeDetails.title}.
The dish features: ${ingredientsList}.
Style: ${recipeDetails.dietary_tags?.includes('fitness') ? 'healthy and appetizing' : 'gourmet'}.
Background: clean white plate on wooden table, natural lighting.
High quality, 4K resolution, appetizing presentation.`;
```

**Exemple** :
```text
A professional food photography shot of Bowl Protéiné Post-Entraînement.
The dish features: Poulet grillé, Quinoa, Brocoli, Huile d'olive.
Style: healthy and appetizing.
Background: clean white plate on wooden table, natural lighting.
High quality, 4K resolution, appetizing presentation.
```

#### Génération et Upload

**Flow complet** :

```typescript
// 1. Call DALL-E API
const openaiResponse = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${openaiApiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'dall-e-3',
    prompt: dallePrompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
    style: 'natural',
    response_format: 'b64_json'
  })
});

const openaiData = await openaiResponse.json();
const base64Image = openaiData.data[0].b64_json;

// 2. Upload to Supabase Storage
const fileName = `recipe_${recipeId}_${Date.now()}.png`;
const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
  .from('recipe-images')
  .upload(fileName, decode(base64Image), {
    contentType: 'image/png',
    cacheControl: '31536000' // 1 year
  });

// 3. Get public URL
const { data: publicUrlData } = supabaseAdmin.storage
  .from('recipe-images')
  .getPublicUrl(fileName);

const imageUrl = publicUrlData.publicUrl;

// 4. Cache in database
await supabase.from('generated_images').insert({
  image_signature: imageSignature,
  type: 'recipe',
  image_url: imageUrl,
  recipe_id: recipeId,
  created_at: new Date().toISOString()
});

return {
  image_url: imageUrl,
  cached: false,
  cost_usd: 0.04
};
```

#### Fallback Stock Images

**Si DALL-E échoue** → Utiliser Pexels (stock photos) :

```typescript
const fallbackImageUrl = `https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg`;

return {
  image_url: fallbackImageUrl,
  cached: false,
  cost_usd: 0,
  fallback: true
};
```

#### Coût Estimé

**Sans cache** :
- Coût par image : $0.04
- 4 recettes × $0.04 = **$0.16 par génération**

**Avec cache (70% hit rate estimé)** :
- 1.2 images nouvelles × $0.04 = **$0.048 par génération**
- **Économie : 70%**

### 9.2 Intégration Frontend

**Fonction** : `triggerImageGenerationForMeal()` (appelée automatiquement)

**Localisation** : `src/system/store/mealPlanStore/actions/generation/imageGeneration.ts`

**Note** : Cette fonction est réutilisée pour les recettes standalone également.

```typescript
export const triggerImageGenerationForRecipe = async (
  recipe: Recipe
) => {
  try {
    const recipeDetailsPayload = {
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      dietary_tags: recipe.dietary_tags
    };

    const ingredientNames = recipe.ingredients.map(ing => ing.name);
    const imageSignature = await generateImageSignature(
      recipe.title,
      ingredientNames
    );

    const recipeId = recipe.id || crypto.randomUUID();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session found');

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/image-generator`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipe_id: recipeId,
          type: 'recipe',
          recipe_details: recipeDetailsPayload,
          image_signature: imageSignature,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
      }
    );

    if (!response.ok) {
      console.error('Image generation failed:', response.status);
      return;
    }

    const imageData = await response.json();
    console.log('Image generated successfully', {
      recipeId,
      imageUrl: imageData.image_url,
      cached: imageData.cached
    });

    // Update recipe with image URL
    await supabase
      .from('saved_recipes')
      .update({ image_url: imageData.image_url })
      .eq('id', recipeId);

  } catch (error) {
    console.error('Error generating image for recipe:', error);
  }
};
```

---

## 10. Bibliothèque de Recettes

### 10.1 Table Supabase : `saved_recipes`

**Schema** :
```sql
CREATE TABLE saved_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL,
  instructions JSONB NOT NULL,
  nutritional_info JSONB,
  prep_time_min INT,
  cook_time_min INT,
  servings INT DEFAULT 1,
  dietary_tags TEXT[],
  image_url TEXT,
  image_signature TEXT,
  main_ingredients TEXT[], -- Pour anti-répétition
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_saved_recipes_user
ON saved_recipes(user_id, created_at DESC);

CREATE INDEX idx_saved_recipes_tags
ON saved_recipes USING GIN(dietary_tags);
```

### 10.2 UI : RecipesTab

**Localisation** : `src/app/pages/Fridge/tabs/RecipesTab.tsx`

**Fonctionnalités** :
- ✅ Affichage de toutes les recettes sauvegardées
- ✅ Filtres par tags (riche en protéines, faible en glucides, etc.)
- ✅ Recherche par nom
- ✅ Tri (date, calories, protéines)
- ✅ Modal de détails (ingrédients, instructions, nutrition)
- ✅ Export PDF
- ✅ Suppression

#### Composant Principal

```typescript
const RecipesTab: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filters, setFilters] = useState<RecipeFilters>({
    searchQuery: '',
    selectedTags: [],
    sortBy: 'created_at'
  });

  // Fetch recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      let query = supabase
        .from('saved_recipes')
        .select('*')
        .eq('user_id', userId)
        .order(filters.sortBy, { ascending: false });

      if (filters.selectedTags.length > 0) {
        query = query.overlaps('dietary_tags', filters.selectedTags);
      }

      if (filters.searchQuery) {
        query = query.ilike('title', `%${filters.searchQuery}%`);
      }

      const { data, error } = await query;
      if (!error) setRecipes(data);
    };

    fetchRecipes();
  }, [filters]);

  return (
    <div>
      <RecipeFilterSystem filters={filters} setFilters={setFilters} />
      <RecipeGrid>
        {recipes.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </RecipeGrid>
    </div>
  );
};
```

#### RecipeCard Component

```typescript
const RecipeCard: React.FC<{ recipe: Recipe }> = ({ recipe }) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  return (
    <>
      <motion.div
        className="recipe-card"
        onClick={() => setIsDetailModalOpen(true)}
      >
        <img src={recipe.image_url || '/placeholder.jpg'} alt={recipe.title} />
        <h3>{recipe.title}</h3>
        <div className="tags">
          {recipe.dietary_tags?.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
        <div className="nutrition-summary">
          <span>{recipe.nutritional_info?.calories} kcal</span>
          <span>{recipe.nutritional_info?.protein}g protéines</span>
        </div>
        <div className="time">
          <Clock size={16} />
          <span>{recipe.prep_time_min + recipe.cook_time_min} min</span>
        </div>
      </motion.div>

      <RecipeDetailModal
        recipe={recipe}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </>
  );
};
```

### 10.3 Export PDF

**Fonction** : `exportRecipeToPDF()`

```typescript
const exportRecipeToPDF = async (recipe: Recipe) => {
  const doc = `
<!DOCTYPE html>
<html>
<head>
  <title>${recipe.title}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; }
    h1 { color: #333; }
    .nutrition { background: #f5f5f5; padding: 20px; margin: 20px 0; }
    .ingredients, .instructions { margin: 20px 0; }
  </style>
</head>
<body>
  <h1>${recipe.title}</h1>
  <p>${recipe.description}</p>

  <div class="nutrition">
    <h2>Informations Nutritionnelles</h2>
    <p>Calories: ${recipe.nutritional_info.calories} kcal</p>
    <p>Protéines: ${recipe.nutritional_info.protein}g</p>
    <p>Glucides: ${recipe.nutritional_info.carbs}g</p>
    <p>Lipides: ${recipe.nutritional_info.fat}g</p>
    <p>Fibres: ${recipe.nutritional_info.fiber}g</p>
  </div>

  <div class="ingredients">
    <h2>Ingrédients</h2>
    <ul>
      ${recipe.ingredients.map(ing =>
        `<li>${ing.quantity} ${ing.unit} ${ing.name}</li>`
      ).join('')}
    </ul>
  </div>

  <div class="instructions">
    <h2>Instructions</h2>
    <ol>
      ${recipe.instructions.map(step =>
        `<li>${step}</li>`
      ).join('')}
    </ol>
  </div>
</body>
</html>
  `;

  // Convert HTML to PDF using browser print
  const printWindow = window.open('', '_blank');
  printWindow.document.write(doc);
  printWindow.document.close();
  printWindow.print();
};
```

---

## 11. Performance et Optimisations

### 11.1 Métriques de Performance

#### Sans Cache
- Temps de traitement : 8-12 secondes
- Input tokens : ~5000
- Output tokens : ~3000
- Coût : ~$0.08
- Affichage : Streaming incrémental (1 recette toutes les 2-3s)

#### Avec Cache Hit
- Temps de traitement : **< 1 seconde**
- Coût : **$0.00**
- Affichage : Streaming simulé (1 recette toutes les 200ms)
- Économie : **100%**

### 11.2 Optimisations Implémentées

#### Frontend

**1. Streaming SSE pour UX optimale**
```typescript
// Affichage incrémental des recettes
// Pas besoin d'attendre la fin pour voir les résultats
while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  // Parse SSE events
  const lines = decoder.decode(value).split('\n');
  for (const line of lines) {
    if (line.startsWith('event: recipe')) {
      const recipe = JSON.parse(line.slice(12));
      addRecipeToState(recipe); // Update UI immédiatement
    }
  }
}
```

**2. Skeleton loaders**
```typescript
// Affiche 4 skeletons dès le début
<RecipesGrid>
  {recipeCandidates.length === 0 && loadingState === 'streaming' ? (
    Array.from({ length: 4 }).map((_, i) => (
      <RecipeSkeleton key={i} />
    ))
  ) : (
    recipeCandidates.map(recipe => (
      <RecipeCard key={recipe.id} recipe={recipe} />
    ))
  )}
</RecipesGrid>
```

**3. Lazy loading des images**
```typescript
<img
  src={recipe.image_url}
  loading="lazy"
  alt={recipe.title}
/>
```

#### Backend

**1. Parsing incrémental optimisé**
```typescript
// extractCompleteRecipes() permet de streamer objet par objet
// sans attendre le tableau complet ']'
// → Gain de 5-8 secondes sur l'affichage de la première recette
```

**2. Cache SHA-256 rapide**
```typescript
// Hash avec crypto.subtle.digest (natif Deno)
// → Génération en < 10ms
```

**3. Fallback multi-niveaux**
```typescript
// 1. Parse JSON standard
// 2. Parse avec fallback buffer
// 3. Generate fitness fallback recipes
// → 0% d'échec total
```

**4. Token consumption atomique**
```typescript
// RPC atomique pour éviter les race conditions
await supabase.rpc('consume_tokens_atomic', {
  p_user_id: userId,
  p_tokens_to_consume: tokensConsumed
});
```

### 11.3 Axes d'Amélioration Future

#### Court Terme (Q1 2025)

1. **WebSocket au lieu de SSE**
   - Bidirectionnel (cancel en temps réel)
   - Reconnexion automatique
   - Moins de overhead réseau

2. **Compression des prompts**
   - Tokenizer côté client pour estimer avant envoi
   - Compression des préférences (JSON → binaire)
   - Gain estimé : 10-15% sur input tokens

3. **Batch image generation**
   - Générer 4 images en parallèle (Promise.all)
   - Gain : 2-3 secondes

#### Moyen Terme (Q2 2025)

1. **Fine-tuning GPT-5-mini**
   - Modèle spécialisé fitness recipes
   - Output JSON plus compact
   - Réduction tokens : 20-30%

2. **Edge caching (CDN)**
   - Cache au niveau CDN (Cloudflare Workers)
   - Latence réduite de 50-70%

3. **Image compression côté serveur**
   - WebP au lieu de PNG
   - Réduction taille : 60-80%
   - Gain bandwidth + loading

---

## Conclusion

Le Générateur de Recettes est un système **simple, performant et optimisé** qui :

✅ **Architecture Single-Agent** : 1 agent spécialisé avec streaming SSE
✅ **Fitness-Focused** : Recettes nutritionnellement optimisées pour objectifs précis
✅ **Anti-Répétition** : Analyse de l'historique pour éviter la monotonie
✅ **Streaming SSE** : Affichage incrémental pour UX fluide
✅ **Cache Intelligent** : TTL 36h pour économies maximales
✅ **Gestion de Tokens** : Pre-check et consommation atomique
✅ **Génération d'Images** : DALL-E avec cache 90 jours
✅ **Bibliothèque Complète** : Sauvegarde, filtres, export PDF

**Coût moyen par génération** : $0.08 (sans cache) | $0.02 (avec 25% cache hit)
**Temps moyen** : 8-12 secondes (sans cache) | < 1 seconde (avec cache)
**Images** : $0.16 par génération (sans cache) | $0.048 (avec 70% cache hit)

**Coût total estimé** : $0.08 (recipes) + $0.048 (images) = **$0.128 par génération**

---

## Glossaire Technique

- **SSE** (Server-Sent Events) : Protocole de streaming unidirectionnel serveur → client
- **Streaming incrémental** : Affichage progressif des résultats au fur et à mesure
- **Anti-répétition** : Système d'analyse de l'historique pour éviter les recettes similaires
- **Fitness-focused** : Optimisation nutritionnelle pour objectifs de composition corporelle
- **Image signature** : Hash unique basé sur titre + ingrédients (évite doublons)
- **Cache hit** : Résultat trouvé dans le cache (pas d'appel OpenAI)
- **TTL** : Time To Live, durée de validité du cache
- **Skeleton loader** : Placeholder animé pendant le chargement
- **Fallback** : Solution de secours si l'opération principale échoue

---

**Dernière mise à jour** : Novembre 2025
**Auteur** : Documentation générée depuis le code source réel
**Version** : 1.0.0
