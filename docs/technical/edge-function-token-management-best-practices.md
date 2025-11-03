# Edge Function Token Management Best Practices

## Introduction

Ce document décrit les meilleures pratiques pour gérer les limites de tokens dans les Edge Functions utilisant OpenAI, basé sur l'expérience de correction du problème de troncature JSON dans `training-coach-functional`.

## Problème Courant: Troncature JSON

### Symptômes
- Erreur `"Unexpected end of JSON input"` lors du parsing
- Nécessité de plusieurs retries avant succès
- Logs montrant `completionTokens` égal ou proche de `max_completion_tokens`

### Cause
Le modèle IA atteint la limite de tokens avant de terminer le JSON, résultant en un JSON mal formé.

## Best Practices

### 1. Token Budget Management

#### a) Définir une Limite Appropriée

```typescript
// ❌ MAUVAIS: Limite trop serrée
max_completion_tokens: 2000,  // Risque de troncature

// ✅ BON: Limite avec marge de sécurité (20-50%)
max_completion_tokens: 4500,  // Permet des réponses complexes
```

**Règle:** Observez les logs de production et ajoutez 20-50% de marge au pic observé.

#### b) Optimiser les Prompts

**Prompt Système:**
```typescript
// ❌ MAUVAIS: Verbeux, répétitif
const SYSTEM_PROMPT = `Tu es un coach expert...
(200 lignes d'explications détaillées)
Voici un exemple complet:
{
  "field1": "value",
  "field2": {
    "nested": "value"
  },
  // ... 50 lignes d'exemple
}`;

// ✅ BON: Concis, essentiel
const SYSTEM_PROMPT = `Coach expert.

Principes: Variété, intensity 80-95%, multi-articulaires
Formats: AMRAP, For Time, EMOM
Safety: Technique > Speed > Load

JSON: {compact format example}`;
```

**Prompt Utilisateur:**
```typescript
// ❌ MAUVAIS: Envoie tout le contexte
const prompt = `Context: ${JSON.stringify(fullUserContext, null, 2)}`;

// ✅ BON: Extrait uniquement les champs essentiels
const essentialContext = {
  age: userContext.age,
  level: userContext.fitnessLevel,
  goals: userContext.goals
};
const prompt = `Context: ${JSON.stringify(essentialContext)}`;
```

### 2. Monitoring en Temps Réel

#### a) Tracker le Pourcentage d'Utilisation

```typescript
const completionTokens = data.usage?.completion_tokens || 0;
const maxTokens = 4500;
const tokenUsagePercent = (completionTokens / maxTokens) * 100;

console.log('[FUNCTION] Token usage', {
  completionTokens,
  maxTokens,
  usagePercent: tokenUsagePercent.toFixed(1) + '%'
});
```

#### b) Warnings Préventifs

```typescript
// Warning si approche de la limite (>80%)
if (tokenUsagePercent > 80) {
  console.warn('[FUNCTION] Token usage high - potential truncation risk', {
    completionTokens,
    maxTokens,
    usagePercent: tokenUsagePercent.toFixed(1) + '%',
    warningThreshold: '80%'
  });
}
```

#### c) Logs Détaillés

```typescript
console.log('[FUNCTION] OpenAI response parsed', {
  hasChoices: !!data.choices,
  choicesLength: data.choices?.length || 0,
  totalTokens: data.usage?.total_tokens,
  promptTokens: data.usage?.prompt_tokens,
  completionTokens,
  tokenUsagePercent: tokenUsagePercent.toFixed(1) + '%'
});
```

### 3. Détection de Troncature

#### a) Vérifications Avant Parsing

```typescript
const contentString = data.choices[0].message.content;
const contentLength = contentString.length;
const endsWithBrace = contentString.trim().endsWith('}');
const openBraces = (contentString.match(/{/g) || []).length;
const closeBraces = (contentString.match(/}/g) || []).length;
const bracesBalanced = openBraces === closeBraces;

console.log('[FUNCTION] JSON validation', {
  contentLength,
  endsWithBrace,
  openBraces,
  closeBraces,
  bracesBalanced,
  possibleTruncation: !endsWithBrace || !bracesBalanced
});
```

#### b) Warnings Précoces

```typescript
if (!endsWithBrace || !bracesBalanced) {
  console.warn('[FUNCTION] JSON appears truncated', {
    endsWithBrace,
    bracesBalanced,
    missingBraces: openBraces - closeBraces,
    completionTokens,
    approachingLimit: completionTokens > (maxTokens * 0.9)
  });
}
```

### 4. Réparation JSON Automatique

#### a) Réparation Multi-Passes

```typescript
let fixedContent = contentString.trim();
let repairAttempts = [];

// Pass 1: Fix missing closing braces/brackets
if (!fixedContent.endsWith('}')) {
  const openBraces = (fixedContent.match(/{/g) || []).length;
  const closeBraces = (fixedContent.match(/}/g) || []).length;
  const missingBraces = openBraces - closeBraces;

  if (missingBraces > 0) {
    // Close arrays first, then objects
    const openBrackets = (fixedContent.match(/\[/g) || []).length;
    const closeBrackets = (fixedContent.match(/\]/g) || []).length;
    const missingBrackets = openBrackets - closeBrackets;

    if (missingBrackets > 0) {
      fixedContent += ']'.repeat(missingBrackets);
      repairAttempts.push(`Added ${missingBrackets} closing bracket(s)`);
    }

    fixedContent += '}'.repeat(missingBraces);
    repairAttempts.push(`Added ${missingBraces} closing brace(s)`);
  }
}

// Pass 2: Remove trailing commas (common AI error)
fixedContent = fixedContent.replace(/,\s*}/g, '}');
fixedContent = fixedContent.replace(/,\s*]/g, ']');

console.log('[FUNCTION] JSON repair attempted', {
  repairAttempts,
  addedCharacters: fixedContent.length - contentString.length
});
```

#### b) Logging des Tentatives

```typescript
try {
  prescription = JSON.parse(fixedContent);
  console.log('[FUNCTION] Successfully parsed repaired JSON', {
    repairAttempts,
    finalLength: fixedContent.length
  });
} catch (secondParseError) {
  console.error('[FUNCTION] Failed even after repair', {
    originalError: parseError.message,
    fixedError: secondParseError.message,
    repairAttempts,
    recommendation: 'Consider increasing max_completion_tokens'
  });
  throw new Error(`Failed after ${repairAttempts.length} repair attempts`);
}
```

### 5. Error Handling Robuste

#### a) Logs d'Erreur Détaillés

```typescript
catch (parseError) {
  console.error('[FUNCTION] JSON parse failed', {
    error: parseError.message,
    errorType: parseError.constructor.name,
    contentLength: contentString.length,
    contentSample: contentString.substring(0, 500),
    contentEnd: contentString.substring(Math.max(0, contentString.length - 200)),
    completionTokens,
    tokenLimit: maxTokens,
    likelyTruncation: completionTokens >= (maxTokens * 0.95)
  });
}
```

#### b) Fallback Graceful

```typescript
// Generate fallback on critical errors
if (latencyMs > 60000 || error.name === 'AbortError') {
  console.log('[FUNCTION] Timeout detected, using fallback');
  return {
    success: true,
    prescription: generateFallbackPrescription(context),
    metadata: {
      model: 'fallback',
      isFallback: true
    }
  };
}
```

## Template de Code Complet

```typescript
async function generateWithAI(request: any): Promise<any> {
  const startTime = Date.now();
  const MAX_TOKENS = 4500;

  try {
    // 1. Build optimized prompt
    const systemPrompt = buildOptimizedSystemPrompt();
    const userPrompt = buildEssentialUserPrompt(request);

    // 2. Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: MAX_TOKENS,
        response_format: { type: 'json_object' }
      }),
      signal: AbortSignal.timeout(65000)
    });

    const data = await response.json();

    // 3. Monitor token usage
    const completionTokens = data.usage?.completion_tokens || 0;
    const tokenUsagePercent = (completionTokens / MAX_TOKENS) * 100;

    console.log('[AI] Response received', {
      completionTokens,
      usagePercent: tokenUsagePercent.toFixed(1) + '%'
    });

    if (tokenUsagePercent > 80) {
      console.warn('[AI] High token usage detected', {
        usagePercent: tokenUsagePercent.toFixed(1) + '%'
      });
    }

    // 4. Detect truncation
    const contentString = data.choices[0].message.content;
    const endsWithBrace = contentString.trim().endsWith('}');
    const openBraces = (contentString.match(/{/g) || []).length;
    const closeBraces = (contentString.match(/}/g) || []).length;

    if (!endsWithBrace || openBraces !== closeBraces) {
      console.warn('[AI] Possible JSON truncation detected');
    }

    // 5. Parse with repair
    let result;
    try {
      result = JSON.parse(contentString);
    } catch (parseError) {
      console.error('[AI] Parse failed, attempting repair');

      // Repair logic
      let fixed = contentString.trim();
      if (openBraces > closeBraces) {
        fixed += '}'.repeat(openBraces - closeBraces);
      }
      fixed = fixed.replace(/,\s*}/g, '}');

      result = JSON.parse(fixed);
      console.log('[AI] Successfully repaired and parsed');
    }

    return {
      success: true,
      data: result,
      metadata: {
        tokensUsed: data.usage?.total_tokens,
        latencyMs: Date.now() - startTime
      }
    };

  } catch (error) {
    console.error('[AI] Generation failed', {
      error: error.message,
      latencyMs: Date.now() - startTime
    });

    // Fallback if timeout
    if (error.name === 'AbortError') {
      return generateFallback(request);
    }

    throw error;
  }
}
```

## Checklist de Déploiement

Avant de déployer une Edge Function avec génération IA:

- [ ] `max_completion_tokens` a une marge de 20-50% au-dessus des besoins observés
- [ ] Prompts système et utilisateur sont optimisés (pas de verbosité inutile)
- [ ] Monitoring des tokens avec logs de pourcentage d'utilisation
- [ ] Warnings à >80% d'utilisation
- [ ] Détection de troncature avant parsing
- [ ] Logique de réparation JSON multi-passes
- [ ] Logs d'erreur détaillés avec contexte complet
- [ ] Fallback graceful en cas de timeout
- [ ] Tests avec scénarios edge cases (payload maximum)

## Métriques à Monitorer en Production

1. **Token Usage Distribution**
   - Moyenne des `completionTokens` utilisés
   - Pics observés
   - Pourcentage de requests >80% de la limite

2. **Taux de Succès**
   - Succès au premier essai
   - Nécessité de retry
   - Succès après réparation JSON

3. **Performance**
   - Latence moyenne
   - Timeout rate
   - Fallback usage rate

4. **Coûts**
   - Coût moyen par génération
   - Total tokens par jour
   - Coût total par jour

## Conclusion

Une gestion appropriée des tokens nécessite:
1. **Prévention:** Limites adéquates + prompts optimisés
2. **Monitoring:** Tracking en temps réel + warnings préventifs
3. **Résilience:** Détection + réparation automatique + fallbacks

En suivant ces best practices, vous éviterez 95%+ des problèmes de troncature JSON tout en maintenant des coûts optimisés.

---

**Version:** 1.0
**Date:** 2025-10-08
**Basé sur:** Correction training-coach-functional
