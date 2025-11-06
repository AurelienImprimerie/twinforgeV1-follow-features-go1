# Déployer la correction du chat

Le chat échoue avec l'erreur: `CSRF validation failed - Origin not allowed`

## Le problème

La fonction Edge `chat-ai` déployée sur Supabase utilise une ancienne version du code de protection CSRF qui ne reconnaît pas les domaines WebContainer comme `.local-credentialless.webcontainer-api.io`.

## La solution

Le code a été corrigé localement dans `supabase/functions/_shared/csrfProtection.ts` (lignes 122-125) pour accepter tous les sous-domaines WebContainer. Il faut maintenant redéployer la fonction.

## Déploiement

### ⚠️ IMPORTANT

Je ne peux pas déployer les Edge Functions Supabase depuis cet environnement WebContainer. Vous devez le faire manuellement.

### Option 1: Via Supabase CLI (recommandé)

Si vous avez Supabase CLI installé localement:

```bash
# 1. Cloner ou télécharger le projet en local
# 2. Depuis le répertoire du projet:
supabase functions deploy chat-ai
```

### Option 2: Via le Dashboard Supabase

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans "Edge Functions"
4. Trouver la fonction `chat-ai`
5. Cliquer sur "Deploy" ou le menu "..." puis "Redeploy"

Le Dashboard devrait détecter automatiquement les changements dans votre repository Git si vous avez configuré l'intégration.

## Vérification après déploiement

Une fois déployé, testez le chat. Les logs Supabase devraient afficher:

```
✅ [CSRFProtection] Development environment detected, allowing origin: https://...webcontainer-api.io
```

Au lieu de:

```
❌ Origin not allowed: https://...webcontainer-api.io
```

## Fichiers modifiés

Les fichiers suivants ont été mis à jour localement et sont prêts à être déployés:

- ✅ `supabase/functions/_shared/csrfProtection.ts` - Accepte maintenant tous les domaines WebContainer
- ✅ `src/system/head/integration/ChatIntegration.ts` - Vérifie que Brain est initialisé
- ✅ Build réussi - Le projet compile correctement

## Alternative temporaire (NON RECOMMANDÉ)

Si vous ne pouvez vraiment pas déployer maintenant, vous pouvez désactiver temporairement la validation CSRF en modifiant directement le code dans le Dashboard Supabase:

1. Aller dans "Edge Functions" > "chat-ai"
2. Éditer le code en ligne
3. Commenter les lignes 110-138 (validation CSRF)
4. Sauvegarder

⚠️ Cette solution est TEMPORAIRE et doit être corrigée avant la production!
