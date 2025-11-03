# Training Coach Notification System - Step 3

## Vue d'ensemble

Système de notifications contextuelles du coach IA pendant la Step 3 (Séance d'entraînement). Design inspiré de visionOS 26 avec glassmorphism premium et animations fluides.

## Architecture

### Services

#### `trainingCoachNotificationService.ts`
Service principal qui gère les notifications du coach pendant la séance.

**Fonctionnalités:**
- Initialisation avec l'ID de session
- Affichage de notifications contextuelles
- Queue de notifications avec priorités
- Persistence dans Supabase pour analytics
- Haptic feedback différencié par type
- Tracking des interactions utilisateur

**Méthodes principales:**
- `initialize(sessionId)` - Initialise le service avec une session
- `showNotification(id, context, customMessage)` - Affiche une notification immédiate
- `queueNotification(id, delayMs, context)` - Met en queue une notification avec délai
- `onArrival()` - Notification d'arrivée sur la séance
- `onNewExercise(context)` - Notification nouvel exercice
- `onSetComplete(context)` - Notification série terminée
- `onLoadAdjustUp/Down(context)` - Notification ajustement de charge
- `onRestPhase(context)` - Déclenche 3 conseils pendant le repos
- `onTransitionReady()` - Notification transition (2-3 mots max)
- `onRPEFeedback(rpe, context)` - Feedback basé sur le RPE
- `onExerciseComplete()` - Notification exercice terminé

### Store Zustand

#### `trainingCoachStore.ts`
Store de gestion d'état pour les notifications du coach.

**État:**
- `currentNotification` - Notification actuellement affichée
- `notificationQueue` - Queue des notifications en attente
- `notificationHistory` - Historique des IDs de notifications affichées
- `isProcessing` - Flag de traitement en cours
- `lastNotificationTime` - Timestamp de la dernière notification

**Actions:**
- `showNotification()` - Affiche une notification
- `hideNotification()` - Cache la notification actuelle
- `queueNotification()` - Ajoute à la queue
- `processQueue()` - Traite la queue avec priorités
- `clearQueue()` - Vide la queue
- `reset()` - Reset complet du store

### Configuration

#### `trainingCoachMessages.ts`
Templates de messages variés pour chaque événement.

**Structure:**
```typescript
const TRAINING_COACH_MESSAGES: Record<TrainingNotificationId, MessageTemplate> = {
  'step3-arrival': createMessageTemplate([...]),
  'step3-new-exercise': createMessageTemplate([...]),
  // ... etc
}
```

**Interpolation de contexte:**
Supporte les variables: `{exerciseName}`, `{load}`, `{currentSet}`, `{restTime}`, etc.

### Types TypeScript

#### `trainingCoachNotification.ts`
Types complets pour le système de notifications.

**Types principaux:**
- `TrainingNotificationId` - IDs de toutes les notifications possibles
- `NotificationPriority` - Priorités: low, medium, high, critical
- `NotificationType` - Types: motivation, instruction, tip, feedback, warning, success
- `TrainingNotificationContext` - Contexte riche pour personnalisation
- `TrainingNotification` - Structure complète d'une notification

## Points d'intégration Step 3

### Événements déclenchés

1. **Arrivée sur la séance** (`handleStartSession`)
   - Message de bienvenue motivant
   - Priorité: high

2. **Timer de préparation** (10, 5, 3 secondes, GO)
   - Messages de countdown progressifs
   - Priorités: medium → high → critical

3. **Nouvel exercice** (`handleExerciseComplete`)
   - Queue avec délai de 2s
   - Message motivant avec nom exercice
   - Priorité: high

4. **Série terminée** (`handleSetComplete`)
   - Félicitations immédiates
   - Priorité: medium

5. **Ajustement de charge** (`handleAdjustLoad`)
   - Feedback différencié (augmentation/diminution)
   - Priorité: medium

6. **Phase de repos** (effet `useEffect` sur `isResting`)
   - **3 conseils séquentiels** avec timing intelligent:
     - Tip 1: 2s après début repos (conseil sur prochain exercice)
     - Tip 2: à 40% du repos (si repos ≥ 30s) (respiration/hydratation)
     - Tip 3: à 70% du repos (si repos ≥ 45s) (préparation mentale)
   - Priorité: low

7. **Transition 3s** (`handleTransitionComplete`)
   - Message ultra-court (2-3 mots: "Prêt !", "Focus !", "Go !")
   - Priorité: high

8. **Feedback RPE** (`handleExerciseComplete`)
   - Message adapté au niveau de difficulté (facile/modéré/dur)
   - Priorité: medium

9. **Exercice terminé** (`handleExerciseComplete`)
   - Félicitations avant passage au suivant
   - Priorité: high

## UI/UX - Design visionOS 26

### Composant `TrainingCoachNotificationBubble`

**Position:**
- Fixed bottom-right
- Desktop: `bottom: 100px, right: 90px`
- Mobile: `bottom: 80px, right: 16px`
- Z-index: 9995

**Animations (Framer Motion):**
```typescript
initial: { x: 40, opacity: 0, scale: 0.85 }
animate: { x: 0, opacity: 1, scale: 1 }
exit: { x: 40, opacity: 0, scale: 0.85 }
transition: {
  type: 'spring',
  stiffness: 320,
  damping: 28,
  mass: 0.8
}
```

**Style Liquid Glass:**
- Backdrop-filter blur
- Gradient radial basé sur le type de notification
- Border color dynamique selon le type
- Highlight shine en haut-gauche
- Progress bar en bas (durée 3s)

**Couleurs par type:**
- Motivation: `#FF6B35` (orange énergique)
- Instruction: `#3B82F6` (bleu info)
- Tip: `#10B981` (vert conseil)
- Feedback: `#8B5CF6` (violet)
- Warning: `#F59E0B` (ambre)
- Success: `#22C55E` (vert succès)

**Icônes dynamiques:**
Chaque type a son icône Lucide React appropriée.

### Interactions

**Haptic Feedback:**
- Success: vibration de succès
- Warning: vibration d'avertissement
- Tap: vibration légère (instruction, feedback)

**Click/Tap:**
- Cache la notification immédiatement
- Track l'interaction dans Supabase
- Ouvre le chat global si configuré

**Auto-hide:**
- Durée par défaut: 3000ms
- Progress bar visuelle
- Cooldown entre notifications: 500ms

## Persistence Supabase

### Table `training_coach_notifications`

```sql
CREATE TABLE training_coach_notifications (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  session_id uuid,
  notification_id text NOT NULL,
  notification_type text NOT NULL,
  message text NOT NULL,
  priority text DEFAULT 'medium',
  context jsonb DEFAULT '{}',
  was_displayed boolean DEFAULT false,
  was_clicked boolean DEFAULT false,
  display_duration_ms integer DEFAULT 3000,
  created_at timestamptz DEFAULT now()
);
```

**RLS Policies:**
- Users can insert own notifications
- Users can read own notifications
- Users can update own notifications (for tracking)

**Indexes:**
- `user_id` - Fast user queries
- `session_id` - Session-specific queries
- `created_at` - Chronological queries
- `notification_id` - Analytics
- Composite: `(user_id, session_id, created_at DESC)`

## Système de Queue et Priorités

### Priorités
1. **Critical** (0) - GO, moments clés
2. **High** (1) - Nouvel exercice, transitions
3. **Medium** (2) - Sets, ajustements, RPE
4. **Low** (3) - Tips pendant repos

### Algorithme de queue
1. Tri par priorité puis par timestamp schedulé
2. Cooldown de 500ms entre notifications
3. Si notification visible, mise en queue automatique
4. Processing asynchrone avec délais respectés

## Intégration Chat AI Global

### Hook `useStep3ChatContext`

Enrichit le contexte du chat AI avec les données de la Step 3:
- Exercice actuel (nom, variante, série, charge, reps)
- Progression (exercice X/Y)
- État (repos, temps restant)
- Prochain exercice
- Dernier RPE
- Temps de séance

**Prompt système:**
Instruit l'AI à rester:
- ULTRA COURT (5-15 mots)
- MOTIVANT
- TECHNIQUE
- ADAPTÉ au contexte
- ÉNERGIQUE (émojis appropriés)

## Performance et Optimisations

### GPU Acceleration
- `transform: translateZ(0)` sur toutes les animations
- `will-change: transform, opacity`
- `isolation: isolate`

### Memory Management
- Cleanup dans `useEffect` cleanup
- Queue limitée intelligemment
- History tracking minimal

### Responsive Design
- Breakpoints mobiles
- Tailles adaptatives
- Touch-friendly (48px minimum)

### Accessibilité
- `role="button"` avec `tabIndex={0}`
- Support clavier (Enter, Space)
- `aria-label` descriptif
- Support `prefers-reduced-motion`
- Support `prefers-contrast: high`

## Analytics et Tracking

### Métriques collectées
- Nombre de notifications affichées par type
- Taux de clic par notification
- Durée d'affichage moyenne
- Distribution par session
- Patterns d'engagement

### Utilisation analytics
```typescript
// Query exemple
const { data } = await supabase
  .from('training_coach_notifications')
  .select('*')
  .eq('user_id', userId)
  .eq('session_id', sessionId)
  .order('created_at', { ascending: false });
```

## Maintenance et Extension

### Ajouter un nouveau type de notification

1. **Ajouter l'ID dans `trainingCoachNotification.ts`:**
```typescript
export type TrainingNotificationId =
  | 'step3-new-notification'
  // ...
```

2. **Créer les messages dans `trainingCoachMessages.ts`:**
```typescript
'step3-new-notification': createMessageTemplate([
  'Message 1',
  'Message 2'
])
```

3. **Définir type et priorité dans `trainingCoachNotificationService.ts`:**
```typescript
NOTIFICATION_TYPES['step3-new-notification'] = 'motivation';
NOTIFICATION_PRIORITIES['step3-new-notification'] = 'high';
```

4. **Créer la méthode dans le service:**
```typescript
onNewEvent(context?: TrainingNotificationContext) {
  this.showNotification('step3-new-notification', context);
}
```

5. **Intégrer dans Step3Seance:**
```typescript
trainingCoachNotificationService.onNewEvent(context);
```

## Best Practices

### Messages
- ✅ Courts et directs (5-15 mots)
- ✅ Variété pour éviter répétition
- ✅ Émojis appropriés au contexte
- ✅ Positifs et motivants
- ❌ Éviter messages négatifs
- ❌ Pas de jargon complexe

### Timing
- ✅ Respecter les cooldowns
- ✅ Queue pour éviter chevauchements
- ✅ Délais intelligents (2s nouveau exercice)
- ✅ Tips repos bien espacés
- ❌ Pas de spam de notifications

### Performance
- ✅ Cleanup systématique
- ✅ GPU acceleration
- ✅ Lazy loading quand possible
- ✅ Memoization des composants
- ❌ Éviter re-renders inutiles

## Testing

### Scénarios de test
1. **Arrivée séance** - Notification immédiate
2. **Countdown 10s** - Progression messages
3. **Premier exercice** - Pas de "nouvel exercice"
4. **Série complete** - Félicitations
5. **Repos court (30s)** - 1-2 tips
6. **Repos long (60s+)** - 3 tips espacés
7. **Ajustement charge** - Up/Down différencié
8. **Transition 3s** - Message ultra-court
9. **RPE bas/moyen/haut** - Feedback adapté
10. **Dernier exercice** - Pas de "nouvel exercice"

### Validation
- ✅ Pas de doublons simultanés
- ✅ Queue respecte priorités
- ✅ Animations fluides 60fps
- ✅ Responsive toutes tailles
- ✅ Accessibilité complète
- ✅ Persistence Supabase fonctionne

## Support et Debugging

### Logs
Tous les événements sont loggés avec `logger`:
- `TRAINING_COACH_SERVICE` - Service level
- `TRAINING_COACH` - Store level

### Debug
```typescript
// Activer logs détaillés
logger.setLevel('debug');

// Inspecter la queue
const { notificationQueue } = useTrainingCoachStore.getState();
console.log(notificationQueue);

// History
const { notificationHistory } = useTrainingCoachStore.getState();
console.log(notificationHistory);
```

### Problèmes communs

**Notifications ne s'affichent pas:**
- Vérifier que le service est initialisé
- Vérifier le z-index (9995)
- Vérifier que sessionId est défini

**Trop de notifications:**
- Vérifier cooldown (500ms)
- Vérifier que cleanup est appelé
- Vérifier les useEffect dependencies

**Animations saccadées:**
- Vérifier GPU acceleration
- Réduire blur/saturate si nécessaire
- Tester sur device réel

---

## Conclusion

Système complet de notifications contextuelles du coach IA pour la Step 3, suivant les best practices visionOS 26 avec:
- ✅ Design liquid glass premium
- ✅ Animations fluides naturelles
- ✅ Haptic feedback approprié
- ✅ 3 conseils intelligents pendant repos
- ✅ Messages courts et motivants
- ✅ Queue avec priorités
- ✅ Persistence analytics Supabase
- ✅ Performance optimisée
- ✅ Accessibilité complète
- ✅ Extensible et maintenable
