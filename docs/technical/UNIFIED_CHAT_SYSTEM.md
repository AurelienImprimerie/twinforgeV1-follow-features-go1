# Système de Chat Unifié - Architecture

## Vue d'ensemble

Le système de chat unifié permet aux utilisateurs d'interagir avec leur coach IA via deux modes de communication :
- **Mode Texte** : Chat classique avec saisie clavier et streaming de réponses
- **Mode Vocal** : Communication vocale en temps réel via OpenAI Realtime API

## Architecture

### Composants Principaux

#### 1. UnifiedFloatingButton
**Fichier** : `src/ui/components/chat/UnifiedFloatingButton.tsx`

**Responsabilités** :
- Bouton flottant unique en bas à droite de l'écran
- Affiche l'icône appropriée selon le mode (MessageSquare pour texte, Mic pour vocal)
- Indicateurs visuels d'état (connecté, en traitement, erreur)
- Badge de notification pour messages non lus
- Animations différenciées selon le mode actif

**États visuels** :
- Idle : Bouton au repos avec glow subtil
- Active : Animations pulsantes et glow intensifié
- Error : Badge rouge avec icône d'alerte
- Unread : Badge avec compteur de messages non lus

#### 2. UnifiedCoachDrawer
**Fichier** : `src/ui/components/chat/UnifiedCoachDrawer.tsx`

**Responsabilités** :
- Drawer qui slide depuis la droite
- Header avec indicateur de mode et contrôles
- Zone de messages scrollable
- Zone de saisie unique selon le mode
- Gestion de l'état de connexion vocal
- Détection automatique du mode selon la route

**Modes de communication** :
- **Texte** : Affiche `CoachChatInterface` avec input texte intégré
- **Vocal** : Affiche visualisation audio + transcription optionnelle

#### 3. CoachChatInterface
**Fichier** : `src/ui/components/coach/CoachChatInterface.tsx`

**Responsabilités** :
- Affichage des messages de conversation
- Rendu des messages interactifs (pour le mode training)
- Gestion du scroll automatique
- Zone d'input texte intégrée via `ChatInputBar`

**Note importante** : Ce composant contient son propre système d'input et ne doit pas être imbriqué dans un contexte qui fournit déjà un input.

### Stores

#### UnifiedCoachStore
**Fichier** : `src/system/store/unifiedCoachStore.ts`

**État principal** :
```typescript
{
  isPanelOpen: boolean;
  communicationMode: 'text' | 'voice';
  currentMode: 'training' | 'nutrition' | 'fasting' | 'body-scan' | 'general';
  messages: Message[];
  voiceState: 'idle' | 'ready' | 'connecting' | 'listening' | 'processing' | 'speaking' | 'error';
  isTyping: boolean;
  isProcessing: boolean;
  hasUnreadMessages: boolean;
  unreadCount: number;
}
```

**Actions principales** :
- `togglePanel()` : Ouvre/ferme le drawer
- `setCommunicationMode(mode)` : Bascule entre texte/vocal
- `setMode(mode)` : Change le contexte du coach
- `addMessage(message)` : Ajoute un message à la conversation
- `toggleCommunicationMode()` : Bascule entre les modes

### Services

#### 1. textChatService
**Fichier** : `src/system/services/textChatService.ts`

**Responsabilités** :
- Gestion du chat texte avec streaming
- Connexion à l'edge function `chat-ai`
- Émission d'événements pour les chunks de réponse
- Gestion des erreurs

#### 2. voiceCoachOrchestrator
**Fichier** : `src/system/services/voiceCoachOrchestrator.ts`

**Responsabilités** :
- Orchestration de la session vocale
- Gestion de la connexion WebRTC avec OpenAI Realtime API
- Streaming bidirectionnel audio
- Transcription en temps réel
- Gestion du cycle de vie de la session

#### 3. environmentDetectionService
**Fichier** : `src/system/services/environmentDetectionService.ts`

**Responsabilités** :
- Détection des capacités de l'environnement
- Identification des limitations (StackBlitz, WebContainer)
- Messages d'erreur contextuels
- Recommandations de fallback

## Flux de Communication

### Mode Texte

```
User Input → textChatService.sendMessage()
           → Edge Function (chat-ai)
           → OpenAI API (streaming)
           → textChatService events
           → UnifiedCoachStore update
           → CoachChatInterface re-render
```

### Mode Vocal

```
User Voice → voiceCoachOrchestrator.startVoiceSession()
           → OpenAI Realtime API (WebRTC)
           → Audio streaming bidirectionnel
           → Transcription temps réel
           → UnifiedCoachStore update
           → UnifiedCoachDrawer visualization
```

## Gestion des États

### État Vocal

| État | Description | UI |
|------|-------------|-----|
| `idle` | Aucune session active | Bouton au repos |
| `ready` | Prêt à démarrer | Prompt "Démarrer" |
| `connecting` | Connexion en cours | Spinner + "Connexion..." |
| `listening` | Écoute active | Ondes audio animées |
| `processing` | Traitement de la requête | "Traitement..." |
| `speaking` | Coach parle | Visualisation audio |
| `error` | Erreur de connexion | Badge rouge + message |

### Basculement de Mode

Le basculement entre modes est géré par `toggleCommunicationMode()` :

1. Vérifie les capacités de l'environnement
2. Arrête la session vocale si active
3. Nettoie les services appropriés
4. Met à jour le store
5. Réinitialise l'UI

## Détection d'Environnement

Le système détecte automatiquement si le mode vocal est disponible :

**Environnements supportés** :
- ✅ Navigateurs modernes (Chrome, Firefox, Safari)
- ✅ Applications natives
- ✅ Localhost

**Environnements limités** :
- ❌ StackBlitz (pas de WebSocket stable)
- ❌ WebContainers (limitations réseau)
- ⚠️ Certains proxies/VPN

En cas d'indisponibilité, le système :
1. Force le mode texte
2. Affiche un message explicatif
3. Désactive le bouton de basculement vocal
4. Affiche un banner d'avertissement

## Messages Interactifs (Mode Training)

Le mode training supporte des messages spéciaux avec actions :

- `exercise-list-intro` : Introduction avec liste d'exercices
- `category-selection` : Sélection de catégorie d'ajustement
- `option-selection` : Choix d'options spécifiques
- `validation` : Validation des changements
- `update-complete` : Confirmation de mise à jour

Ces messages sont rendus par `CoachMessageRenderer`.

## Persiste des Conversations

Les conversations sont sauvegardées dans Supabase via `chatConversationService` :

- Table `chat_conversations` : Métadonnées de conversation
- Table `chat_messages` : Messages individuels
- Chargement automatique de l'historique au changement de mode
- Sauvegarde en temps réel après chaque message

## Composants Obsolètes

### ⚠️ DEPRECATED - Ne plus utiliser

Les composants suivants sont obsolètes et seront supprimés dans une version future :

- **FloatingChatButton** → Utiliser `UnifiedFloatingButton`
- **FloatingVoiceCoachButton** → Utiliser `UnifiedFloatingButton`
- **GlobalChatDrawer** → Utiliser `UnifiedCoachDrawer`
- **VoiceCoachPanel** → Utiliser `UnifiedCoachDrawer`

### Stores obsolètes

- **globalChatStore** → Utiliser `unifiedCoachStore`
- **voiceCoachStore** → Utiliser `unifiedCoachStore`

## Migration

Pour migrer vers le système unifié :

1. Remplacer les imports :
```typescript
// ❌ Ancien
import FloatingChatButton from './chat/FloatingChatButton';
import GlobalChatDrawer from './chat/GlobalChatDrawer';

// ✅ Nouveau
import UnifiedFloatingButton from './chat/UnifiedFloatingButton';
import UnifiedCoachDrawer from './chat/UnifiedCoachDrawer';
```

2. Utiliser le store unifié :
```typescript
// ❌ Ancien
import { useGlobalChatStore } from '../store/globalChatStore';
import { useVoiceCoachStore } from '../store/voiceCoachStore';

// ✅ Nouveau
import { useUnifiedCoachStore } from '../store/unifiedCoachStore';
```

3. Mettre à jour l'utilisation :
```tsx
// ✅ Structure correcte
<UnifiedFloatingButton ref={chatButtonRef} />
<UnifiedCoachDrawer chatButtonRef={chatButtonRef} />
```

## Debugging

### Logs

Le système utilise un logger structuré avec les tags suivants :

- `UNIFIED_COACH_DRAWER` : Événements du drawer
- `UNIFIED_FLOATING_BUTTON` : Événements du bouton
- `TEXT_CHAT_SERVICE` : Service de chat texte
- `VOICE_COACH_ORCHESTRATOR` : Orchestration vocale
- `ENVIRONMENT_DETECTION` : Détection d'environnement

### Console Commands

```javascript
// Vérifier l'état du store
useUnifiedCoachStore.getState()

// Forcer le mode texte
useUnifiedCoachStore.getState().setCommunicationMode('text')

// Vérifier les capacités
import { environmentDetectionService } from './services/environmentDetectionService';
environmentDetectionService.logEnvironmentInfo()
```

## Bonnes Pratiques

### 1. Toujours vérifier les capacités avant le mode vocal

```typescript
const caps = environmentDetectionService.getCapabilities();
if (!caps.canUseVoiceMode) {
  // Forcer le mode texte ou afficher un message
}
```

### 2. Gérer les erreurs de connexion vocale

```typescript
try {
  await voiceCoachOrchestrator.startVoiceSession(mode);
} catch (error) {
  // Fallback vers le mode texte
  setCommunicationMode('text');
  setError(error.message);
}
```

### 3. Nettoyer les sessions lors de la fermeture

```typescript
const handleClose = () => {
  if (voiceState === 'listening') {
    stopListening();
  }
  if (communicationMode === 'text') {
    textChatService.cleanup();
  }
  closePanel();
};
```

## Limites Connues

1. **Mode vocal StackBlitz** : Non supporté en raison des limitations WebSocket
2. **Transcription temps réel** : Peut avoir un délai de 200-500ms
3. **Taille des messages** : Limitée par l'API OpenAI (contexte)
4. **Audio background** : Nécessite permissions microphone

## Améliorations Futures

- [ ] Support de plusieurs langues
- [ ] Sauvegarde locale des conversations (offline)
- [ ] Compression audio pour réduire la bande passante
- [ ] Mode "push-to-talk" pour le vocal
- [ ] Raccourcis clavier pour basculer les modes
- [ ] Historique de recherche dans les conversations
- [ ] Export des conversations

## Support

Pour toute question ou problème :
1. Vérifier les logs dans la console
2. Utiliser les commandes de debugging
3. Consulter la documentation des services individuels
4. Vérifier l'état du store avec `getState()`
