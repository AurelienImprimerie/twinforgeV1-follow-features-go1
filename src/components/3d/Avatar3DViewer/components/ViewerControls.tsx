/**
 * Viewer Controls Component (compact + mobile icons larger)
 * Camera controls overlay for 3D viewer
 * - Dock vertical compact
 * - Icons: 18px on mobile, 14px ≥ sm
 * - A11y: aria-pressed, focus ring
 * - Perf: memo + configs memoized
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';

interface ViewerControlsProps {
  activeView: 'front' | 'profile' | 'threequarter';
  isAutoRotating: boolean;
  onCameraViewChange: (view: 'front' | 'profile' | 'threequarter') => void;
  onAutoRotateToggle: () => void;
  onCameraReset: () => void;
  showControls: boolean;
}

const ViewerControls: React.FC<ViewerControlsProps> = ({
  activeView,
  isAutoRotating,
  onCameraViewChange,
  onAutoRotateToggle,
  onCameraReset,
  showControls,
}) => {
  if (!showControls) return null;

  // config des boutons de vue (mémo)
  const viewButtons = useMemo(
    () => ([
      { key: 'front' as const,        icon: ICONS.User,      color: '#60A5FA', label: 'Vue de face' },
      { key: 'threequarter' as const, icon: ICONS.RotateCcw, color: '#8B5CF6', label: 'Vue 3/4' },
      { key: 'profile' as const,      icon: ICONS.ArrowRight,color: '#06B6D4', label: 'Vue de profil' },
    ]),
    []
  );

  return (
    <motion.div
      className="absolute top-2 right-2 sm:top-3 sm:right-3"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* DOCK COMPACT */}
      <div
        className="
          flex flex-col items-center
          gap-1 sm:gap-1.5
          p-1 sm:p-1.5
          rounded-xl
          bg-black/60 backdrop-blur-md
          border border-white/15
          shadow-lg
        "
        role="toolbar"
        aria-label="Contrôles de la caméra"
      >
        {/* Boutons de vue */}
        {viewButtons.map(({ key, icon, color, label }) => {
          const isActive = activeView === key;
          return (
            <button
              key={key}
              onClick={() => onCameraViewChange(key)}
              className={[
                // taille compacte et carrée
                'w-8 h-8 sm:w-9 sm:h-9 rounded-lg',
                'flex items-center justify-center',
                'transition-all outline-none',
                // états
                isActive
                  ? 'bg-white/10 text-white border border-white/20 shadow'
                  : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent',
                // focus
                'focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-0'
              ].join(' ')}
              style={isActive ? { boxShadow: `0 0 0 1px color-mix(in srgb, ${color} 35%, transparent), 0 6px 14px rgba(0,0,0,.35)` } : undefined}
              aria-label={label}
              aria-pressed={isActive}
              title={label}
              type="button"
            >
              <SpatialIcon
                Icon={icon}
                size={14} // fallback
                // Mobile 18px, ≥ sm 14px
                className="!w-[18px] !h-[18px] sm:!w-[14px] sm:!h-[14px]"
                color={isActive ? color : undefined}
              />
            </button>
          );
        })}

        {/* séparateur fin */}
        <div className="w-6 sm:w-7 h-px my-1 sm:my-1.5 bg-white/10 rounded-full" aria-hidden="true" />

        {/* Auto-rotate */}
        <button
          onClick={onAutoRotateToggle}
          className={[
            'w-8 h-8 sm:w-9 sm:h-9 rounded-lg',
            'flex items-center justify-center',
            'transition-all outline-none',
            isAutoRotating
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/25'
              : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/15',
            'focus-visible:ring-2 focus-visible:ring-white/50'
          ].join(' ')}
          aria-pressed={isAutoRotating}
          aria-label={isAutoRotating ? 'Désactiver la rotation automatique' : 'Activer la rotation automatique'}
          title={isAutoRotating ? 'Désactiver la rotation automatique' : 'Activer la rotation automatique'}
          type="button"
        >
          <motion.div
            animate={isAutoRotating ? { rotate: 360 } : { rotate: 0 }}
            transition={isAutoRotating ? { duration: 4, repeat: Infinity, ease: 'linear' } : { duration: 0.2 }}
          >
            <SpatialIcon
              Icon={ICONS.RotateCcw}
              size={14} // fallback
              className="!w-[18px] !h-[18px] sm:!w-[14px] sm:!h-[14px]"
            />
          </motion.div>
        </button>

        {/* Reset */}
        <button
          onClick={onCameraReset}
          className="
            w-8 h-8 sm:w-9 sm:h-9 rounded-lg
            flex items-center justify-center
            bg-white/5 text-white/70 hover:text-white hover:bg-white/10
            border border-white/15
            transition-all outline-none
            focus-visible:ring-2 focus-visible:ring-white/50
          "
          aria-label="Réinitialiser la vue"
          title="Réinitialiser la vue"
          type="button"
        >
          <SpatialIcon
            Icon={ICONS.Target}
            size={14} // fallback
            className="!w-[18px] !h-[18px] sm:!w-[14px] sm:!h-[14px]"
          />
        </button>
      </div>
    </motion.div>
  );
};

// évite les re-renders inutiles si props inchangées
export default React.memo(ViewerControls);