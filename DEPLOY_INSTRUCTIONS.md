# Instructions de déploiement - Fix Chat

## Problème
Le chat échoue avec l'erreur CSRF: `"Origin not allowed: https://...webcontainer-api.io"`

## Solution
Le fichier `supabase/functions/_shared/csrfProtection.ts` a été mis à jour pour accepter tous les domaines WebContainer, mais **il faut redéployer la fonction sur Supabase**.

## Déploiement requis

### Option 1: Via Supabase CLI (recommandé)
```bash
# Depuis le répertoire du projet
supabase functions deploy chat-ai
```

### Option 2: Via le Dashboard Supabase
1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans "Edge Functions"
4. Trouver la fonction `chat-ai`
5. Cliquer sur "Deploy" ou "Redeploy"

## Fichiers modifiés
- `supabase/functions/_shared/csrfProtection.ts` - Ajout du support pour `webcontainer-api.io`
- `src/system/head/integration/ChatIntegration.ts` - Ajout de la vérification `isInitialized()`

## Vérification
Après le déploiement, le chat devrait fonctionner normalement. Les logs Supabase devraient montrer:
```
✅ [CSRFProtection] Development environment detected, allowing origin: https://...webcontainer-api.io
```

Au lieu de:
```
❌ Origin not allowed: https://...webcontainer-api.io
```

## Alternative temporaire
Si vous ne pouvez pas redéployer immédiatement, vous pouvez désactiver temporairement la validation CSRF en commentant les lignes 114-138 dans `supabase/functions/chat-ai/index.ts`, mais **ce n'est pas recommandé pour la production**.
