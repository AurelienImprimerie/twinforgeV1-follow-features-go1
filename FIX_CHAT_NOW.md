# FIX CHAT - Action immédiate requise

## Le problème
Le chat échoue avec: `CSRF validation failed - Origin not allowed`

## Pourquoi ?
La fonction Edge `chat-ai` déployée sur Supabase utilise une **ancienne version** du fichier `csrfProtection.ts` qui ne reconnaît pas `.local-credentialless.webcontainer-api.io`

## ✅ Solution RAPIDE (2 méthodes)

### Méthode 1: Redéployer la fonction (RECOMMANDÉ)
```bash
# Dans le terminal, depuis le répertoire du projet:
supabase functions deploy chat-ai
```

Cela déploiera la **nouvelle version** du code qui accepte tous les domaines WebContainer.

### Méthode 2: Désactiver temporairement CSRF (SI vous ne pouvez pas déployer maintenant)

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans "Edge Functions" > "chat-ai"
4. Modifier le code en ligne (lignes 110-138)
5. Commenter la validation CSRF:

```typescript
// Sprint 3 Phase 5.3: CSRF Protection for AI chat (prompt injection prevention)
// TEMPORAIREMENT DÉSACTIVÉ POUR DÉVELOPPEMENT
/*
const csrfProtection = createCSRFProtection(supabase);
const csrfToken = req.headers.get('x-csrf-token');

const csrfValidation = await csrfProtection.validateRequest(
  user.id,
  csrfToken,
  req,
  'chat-ai'
);

if (!csrfValidation.valid) {
  log('error', 'CSRF validation failed', requestId, {
    error: csrfValidation.error,
    tokenProvided: !!csrfToken,
    originValidated: csrfValidation.originValidated,
  });

  return new Response(
    JSON.stringify({
      error: 'CSRF validation failed',
      message: csrfValidation.error
    }),
    {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
}
*/

log('info', 'CSRF validation SKIPPED (dev mode)', requestId);
```

6. Sauvegarder et redéployer

⚠️ **IMPORTANT**: Réactivez CSRF en production!

## Vérification
Après le fix, testez le chat. Vous devriez voir dans les logs Supabase:
```
✅ [CSRFProtection] Development environment detected, allowing origin
```

## Fichiers modifiés localement (déjà OK)
- ✅ `src/system/head/integration/ChatIntegration.ts` - Vérification Brain
- ✅ `supabase/functions/_shared/csrfProtection.ts` - Support WebContainer

Ces fichiers sont prêts, il suffit de redéployer!
