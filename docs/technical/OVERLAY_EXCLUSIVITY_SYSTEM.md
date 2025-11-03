# Système d'Exclusivité des Overlays

## Vue d'ensemble

Le système d'exclusivité des overlays garantit qu'**un seul panneau peut être ouvert à la fois** sur tous les appareils (mobile, tablette, desktop). Les transitions entre panneaux sont fluides et optimisées pour des performances maximales.

## Architecture

### Composants Principaux

1. **overlayStore** (`src/system/store/overlayStore.ts`)
   - Store central Zustand gérant l'état de tous les overlays
   - Gère les IDs des overlays actifs et précédents
   - Fournit les actions `open()`, `close()`, `toggle()`, `isOpen()`

2. **overlayTransitionManager** (`src/system/store/overlayTransitionManager.ts`)
   - Singleton gérant les transitions fluides entre panneaux
   - Détecte automatiquement le type d'appareil (mobile/tablette/desktop)
   - Optimise les performances selon les capacités de l'appareil
   - Gère les optimisations GPU pour les animations

3. **usePanelExclusivity** (`src/hooks/usePanelExclusivity.ts`)
   - Hook React pour une utilisation sécurisée des overlays
   - Protection contre les clics rapides (debounce)
   - Callbacks avant/après ouverture et fermeture
   - Détection des transitions en cours

4. **OverlayBackdrop** (`src/components/overlay/OverlayBackdrop.tsx`)
   - Composant backdrop universel pour tous les overlays
   - Gère automatiquement l'affichage selon l'état de l'overlayStore
   - Clics sur le backdrop ferment l'overlay actif

## Types d'Overlays

```typescript
type OverlayId = 'none' | 'mobileDrawer' | 'centralMenu' | 'userPanel' | 'sidebar' | 'chatDrawer';
```

### Hiérarchie Z-Index

```typescript
export const Z_INDEX = {
  BOTTOM_BAR: 9996,          // Barre de navigation mobile
  SIDEBAR: 9997,             // Sidebar desktop
  CHAT_NOTIFICATION: 9997,   // Notifications de chat
  FLOATING_CHAT_BUTTON: 9994,// Bouton flottant de chat
  CHAT_DRAWER: 9995,         // Drawer de chat
  USER_PANEL: 9998,          // Panneau utilisateur
  CENTRAL_MENU: 9998,        // Menu central d'actions
  MOBILE_DRAWER: 9998,       // Menu de navigation mobile
  BACKDROP: 9993,            // Backdrop universel
} as const;
```

## Flux de Fonctionnement

### Ouverture d'un Panneau

1. L'utilisateur clique sur un bouton d'ouverture
2. Le hook `usePanelExclusivity` vérifie :
   - Pas de transition en cours
   - Respect du délai de debounce (300ms par défaut)
3. Si validé, appel de `overlayStore.open(overlayId)`
4. L'overlayStore détecte si un autre overlay est ouvert
5. Si oui, le **overlayTransitionManager** orchestre :
   - Fermeture du panneau actuel (animation de sortie)
   - Délai optimisé selon l'appareil (100-150ms)
   - Ouverture du nouveau panneau (animation d'entrée)
6. Si non, ouverture directe du panneau

### Fermeture d'un Panneau

1. L'utilisateur clique sur :
   - Le bouton de fermeture du panneau
   - Le backdrop
   - La touche Escape
2. Appel de `overlayStore.close()`
3. Animation de sortie
4. État retour à `activeOverlayId: 'none'`

### Gestion de la Touche Escape

Le hook `useGlobalEscapeKey` écoute la touche Escape et ferme l'overlay actif avec la bonne priorité :

```typescript
// Priorité : chat drawer > autres overlays > fallback chat
if (activeOverlayId === 'chatDrawer' && isChatOpen) {
  closeChat();
} else if (activeOverlayId !== 'none') {
  close();
}
```

## Optimisations de Performance

### Détection d'Appareil

Le système détecte automatiquement :
- **Low-end devices** : < 4 GB RAM ou < 4 CPU cores
- **Mobile** : largeur < 768px
- **Tablette** : 768px ≤ largeur < 1024px
- **Desktop** : largeur ≥ 1024px

### Configurations Optimisées

| Appareil | Délai Transition | GPU Optimization | Notes |
|----------|------------------|------------------|-------|
| Low-end | 100ms | ✓ | Transitions rapides, moins d'effets |
| Mobile | 120ms | ✓ | Léger mais visible |
| Tablette | 150ms | ✓ | Transitions riches |
| Desktop | 150ms | ✓ | Expérience complète |

### Optimisations GPU

Pendant les transitions, le système active :
```css
--overlay-will-change: transform, opacity;
--overlay-transform: translateZ(0);
```

Désactivées 500ms après la fin de l'animation pour économiser les ressources.

## Utilisation dans les Composants

### Exemple : MobileDrawer

```typescript
import { useOverlayStore, Z_INDEX } from '../../system/store/overlayStore';

const MobileDrawer = () => {
  const { isOpen, close } = useOverlayStore();
  const drawerOpen = isOpen('mobileDrawer');

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            style={{ zIndex: Z_INDEX.BACKDROP }}
            onClick={() => close()}
          />

          {/* Drawer */}
          <motion.nav
            style={{ zIndex: Z_INDEX.MOBILE_DRAWER }}
          >
            {/* Contenu */}
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
};
```

### Exemple : Header avec Toggle

```typescript
import { useOverlayStore } from '../../../system/store/overlayStore';
import { usePanelExclusivity } from '../../../hooks/usePanelExclusivity';

const Header = () => {
  const { toggle } = usePanelExclusivity({
    overlayId: 'mobileDrawer',
    debounceDelay: 300,
    onAfterOpen: () => {
      // Actions après ouverture
    },
  });

  return (
    <button onClick={toggle}>
      Menu
    </button>
  );
};
```

### Exemple : GlobalChatDrawer

```typescript
import { useOverlayStore } from '../../../system/store/overlayStore';
import { useGlobalChatStore } from '../../../system/store/globalChatStore';

const GlobalChatDrawer = () => {
  const { isOpen, close } = useGlobalChatStore();
  const overlayStore = useOverlayStore();

  // Sync avec l'overlayStore
  useEffect(() => {
    const unsubscribe = useOverlayStore.subscribe(
      (state) => state.activeOverlayId,
      (activeOverlayId) => {
        if (activeOverlayId !== 'chatDrawer' && activeOverlayId !== 'none' && isOpen) {
          close();
        }
      }
    );
    return unsubscribe;
  }, [isOpen, close]);

  // ...
};
```

## Comportements Spéciaux

### Chat et Autres Overlays

- Si le chat est ouvert et l'utilisateur ouvre un autre panneau → le chat se ferme automatiquement
- Si un autre panneau est ouvert et l'utilisateur ouvre le chat → l'autre panneau se ferme automatiquement
- Le bouton de chat flottant reste visible même quand un overlay est ouvert, mais le drawer de chat lui-même se ferme

### Body Scroll Lock

Le MobileDrawer verrouille le scroll du body quand il est ouvert :

```typescript
useEffect(() => {
  if (drawerOpen) {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    return () => {
      // Restauration
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }
}, [drawerOpen]);
```

## Logs et Debugging

Tous les composants loggent leurs actions via `logger` :

```typescript
logger.debug('OVERLAY_STORE', 'Opening overlay', { overlayId });
logger.info('OVERLAY_TRANSITION_MANAGER', 'Transition complete');
logger.warn('PANEL_EXCLUSIVITY', 'Action blocked - too soon');
```

Filtres disponibles dans la console :
- `OVERLAY_STORE` : Actions du store
- `OVERLAY_TRANSITION_MANAGER` : Transitions
- `PANEL_EXCLUSIVITY` : Hook de sécurité
- `MOBILE_DRAWER` : Menu mobile
- `GLOBAL_CHAT_DRAWER` : Chat drawer
- `ESCAPE_KEY` : Gestion Escape

## Tests Recommandés

1. **Test de transition rapide**
   - Ouvrir MobileDrawer
   - Immédiatement ouvrir CentralMenu
   - Vérifier : transition fluide sans clignotement

2. **Test de double clic**
   - Double-cliquer rapidement sur un bouton d'ouverture
   - Vérifier : un seul panneau s'ouvre (debounce actif)

3. **Test Escape**
   - Ouvrir n'importe quel panneau
   - Appuyer sur Escape
   - Vérifier : le panneau se ferme correctement

4. **Test Backdrop**
   - Ouvrir n'importe quel panneau
   - Cliquer sur le backdrop
   - Vérifier : le panneau se ferme

5. **Test de performance**
   - Ouvrir et fermer rapidement plusieurs panneaux
   - Vérifier : pas de lag, transitions fluides
   - Monitorer les FPS dans DevTools

6. **Test responsive**
   - Tester sur mobile (< 768px)
   - Tester sur tablette (768-1024px)
   - Tester sur desktop (> 1024px)
   - Vérifier : transitions adaptées à chaque appareil

## Migration depuis useShell

L'ancien hook `useShell` est maintenant deprecated mais conservé pour compatibilité :

```typescript
// ❌ Ancien (deprecated)
const { drawerOpen, setDrawer } = useShell();
setDrawer(true);

// ✅ Nouveau (recommandé)
const { isOpen, toggle } = useOverlayStore();
toggle('mobileDrawer');

// ✅ Ou avec sécurité
const { toggle } = usePanelExclusivity({
  overlayId: 'mobileDrawer',
});
toggle();
```

## Points d'Attention

1. **Toujours utiliser les Z_INDEX constants** pour maintenir la hiérarchie
2. **Ne pas manipuler directement activeOverlayId** dans les composants
3. **Utiliser usePanelExclusivity** pour la protection contre les clics rapides
4. **Tester sur vrais appareils** mobiles, pas seulement en émulation
5. **Monitorer les performances** avec React DevTools Profiler

## Performance Budget

- **Transition overlay → overlay** : < 200ms
- **Ouverture simple** : < 100ms
- **Fermeture** : < 100ms
- **Frame drops** : 0 (60 FPS constant)
- **Memory leaks** : 0

## Roadmap Future

- [ ] Gestion des overlays imbriqués (modal dans un drawer)
- [ ] Animations de transition personnalisées par overlay
- [ ] Support du swipe-to-close sur mobile
- [ ] Historique de navigation entre overlays
- [ ] Analytics des transitions (temps moyen, taux de rebond)
