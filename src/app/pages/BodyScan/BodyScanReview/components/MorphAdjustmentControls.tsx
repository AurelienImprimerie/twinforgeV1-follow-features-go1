import React, { useState, useCallback, useMemo } from 'react';
import { ConditionalMotion } from '../../../../../lib/motion/ConditionalMotion';
import { useBodyScanPerformance } from '../../../../../hooks/useBodyScanPerformance';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { useFeedback } from '../../../../../hooks/useFeedback';
import type { MorphPolicy } from '../../../../../lib/morph/constraints';
import { useDebounce } from '../../../../../lib/utils/hooks';
import logger from '../../../../../lib/utils/logger';
import './measurements.css';

const KEY_MORPHS = {
  bodyShape: [
    { key: 'bodybuilderSize', label: 'Développement musculaire', icon: 'Zap' as const, color: '#8B5CF6', gradient: 'from-purple-500 to-purple-600' },
    { key: 'pearFigure', label: 'Masse grasse', icon: 'Triangle' as const, color: '#F59E0B', gradient: 'from-amber-500 to-amber-600' },
    { key: 'narrowWaist', label: 'Tour de taille', icon: 'Minimize2' as const, color: '#10B981', gradient: 'from-emerald-500 to-emerald-600' },
    { key: 'emaciated', label: 'Gabarit', icon: 'Minus' as const, color: '#06B6D4', gradient: 'from-cyan-500 to-cyan-600' },
  ],
  curves: [
    { key: 'bigHips', label: 'Hanches', icon: 'Circle' as const, color: '#EC4899', gradient: 'from-pink-500 to-pink-600' },
    { key: 'assLarge', label: 'Fessiers', icon: 'Circle' as const, color: '#F97316', gradient: 'from-orange-500 to-orange-600' },
  ],
  chest: []
};

interface MorphAdjustmentControlsProps {
  currentMorphData: Record<string, number>;
  setCurrentMorphData: (morphData: Record<string, number>) => void;
  resetMorphsToInitial: () => void;
  morphPolicy: MorphPolicy;
  resolvedGender: 'male' | 'female';
  isViewerReady: boolean;
  avatar3DRef: React.RefObject<any>;
}

function getAvailableMorphs(
  gender: 'male' | 'female',
  morphPolicy: MorphPolicy
): Array<{ key: string; label: string; icon: keyof typeof ICONS; color: string; gradient: string; category: string }> {
  const availableMorphs: Array<{ key: string; label: string; icon: keyof typeof ICONS; color: string; gradient: string; category: string }> = [];

  KEY_MORPHS.bodyShape.forEach(morph => {
    const range = morphPolicy.ranges[morph.key];
    if (range && !(range.min === 0 && range.max === 0)) {
      availableMorphs.push({ ...morph, category: 'Corps' });
    }
  });

  KEY_MORPHS.curves.forEach(morph => {
    const range = morphPolicy.ranges[morph.key];
    if (range && !(range.min === 0 && range.max === 0)) {
      availableMorphs.push({ ...morph, category: 'Courbes' });
    }
  });

  KEY_MORPHS.chest.forEach(morph => {
    const range = morphPolicy.ranges[morph.key];
    if (range && !(range.min === 0 && range.max === 0)) {
      availableMorphs.push({ ...morph, category: 'Poitrine' });
    }
  });

  return availableMorphs;
}

const MorphAdjustmentControls: React.FC<MorphAdjustmentControlsProps> = React.memo(({
  currentMorphData,
  setCurrentMorphData,
  resetMorphsToInitial,
  morphPolicy,
  resolvedGender,
  isViewerReady,
  avatar3DRef
}) => {
  const performanceConfig = useBodyScanPerformance();
  const [isExpanded, setIsExpanded] = useState(false);
  const [adjustedMorphs, setAdjustedMorphs] = useState<Set<string>>(new Set());
  const { click, formInput } = useFeedback();

  const debouncedMorphData = useDebounce(currentMorphData, 50);

  const availableMorphs = useMemo(() =>
    getAvailableMorphs(resolvedGender, morphPolicy),
    [resolvedGender, morphPolicy]
  );

  React.useEffect(() => {
    if (isViewerReady && avatar3DRef.current?.updateMorphData) {
      logger.debug('MORPH_ADJUSTMENT', 'Applying debounced morph data to 3D viewer', {
        morphDataKeys: Object.keys(debouncedMorphData),
        resolvedGender,
      });
      avatar3DRef.current.updateMorphData(debouncedMorphData);
    }
  }, [debouncedMorphData, isViewerReady, avatar3DRef, resolvedGender]);

  const handleSliderChange = useCallback((morphKey: string, newValue: number) => {
    const range = morphPolicy.ranges[morphKey];
    if (!range) return;

    const clampedValue = Math.max(range.min, Math.min(range.max, newValue));

    const newMorphData = {
      ...currentMorphData,
      [morphKey]: clampedValue
    };
    setCurrentMorphData(newMorphData);
    setAdjustedMorphs(prev => new Set([...prev, morphKey]));

    try {
      formInput();
    } catch (audioError) {
      console.warn('MORPH_ADJUSTMENT', 'Audio feedback failed for slider change', { audioError });
    }

    logger.debug('MORPH_ADJUSTMENT', 'Morph value updated via slider', {
      morphKey,
      value: clampedValue.toFixed(3),
      resolvedGender,
      philosophy: 'slider_based_morph_update'
    });
  }, [currentMorphData, setCurrentMorphData, setAdjustedMorphs, formInput, morphPolicy.ranges, resolvedGender]);

  const handleResetAll = useCallback(() => {
    click();
    setAdjustedMorphs(new Set());
    resetMorphsToInitial();
  }, [resetMorphsToInitial, click, setAdjustedMorphs]);

  const morphsByCategory = useMemo(() => {
    const grouped: Record<string, typeof availableMorphs> = {};
    availableMorphs.forEach(morph => {
      if (!grouped[morph.category]) {
        grouped[morph.category] = [];
      }
      grouped[morph.category].push(morph);
    });
    return grouped;
  }, [availableMorphs]);

  const totalHiddenMorphs = useMemo(() => {
    const corpsMorphs = morphsByCategory['Corps'] || [];
    const otherCategories = Object.entries(morphsByCategory).filter(([category]) => category !== 'Corps');
    const hiddenCorpsMorphs = Math.max(0, corpsMorphs.length - 3);
    const hiddenOtherMorphs = otherCategories.reduce((total, [, morphs]) => total + morphs.length, 0);
    return hiddenCorpsMorphs + hiddenOtherMorphs;
  }, [morphsByCategory]);

  if (!isViewerReady || availableMorphs.length === 0) {
    return null;
  }

  const corpsMorphs = morphsByCategory['Corps'] || [];
  const otherCategories = Object.entries(morphsByCategory).filter(([category]) => category !== 'Corps');

  return (
    <ConditionalMotion
      className="slide-enter"
      initial={performanceConfig.enableInitialAnimations ? { opacity: 0, y: 20 } : false}
      animate={performanceConfig.enableInitialAnimations ? { opacity: 1, y: 0 } : { opacity: 1 }}
      transition={performanceConfig.enableFramerMotion ? { duration: 0.6, delay: 0.4 } : undefined}
    >
      <GlassCard className="morph-adjustment-card">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-white font-semibold flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(139,92,246,0.3) 0%, transparent 60%),
                  linear-gradient(135deg, rgba(139,92,246,0.25), rgba(167,139,250,0.25))
                `,
                border: '2px solid rgba(139,92,246,0.4)',
                boxShadow: '0 0 20px rgba(139,92,246,0.25), inset 0 1px 0 rgba(255,255,255,0.1)'
              }}
            >
              <SpatialIcon Icon={ICONS.Sliders} size={20} style={{ color: '#A78BFA' }} variant="pure" />
            </div>
            <span className="text-lg">Ajustements morphologiques</span>
            {adjustedMorphs.size > 0 && (
              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(37,99,235,0.3))',
                  border: '1px solid rgba(59,130,246,0.5)',
                  color: '#60A5FA',
                  boxShadow: '0 0 15px rgba(59,130,246,0.3)'
                }}
              >
                {adjustedMorphs.size} modifié{adjustedMorphs.size > 1 ? 's' : ''}
              </span>
            )}
          </h4>

          {adjustedMorphs.size > 0 && (
            <button
              onClick={handleResetAll}
              className="btn-glass px-4 py-2 text-sm flex items-center gap-2 hover:bg-white/5 transition-colors"
              title="Réinitialiser tous les ajustements"
            >
              <SpatialIcon Icon={ICONS.RotateCcw} size={16} />
              <span>Réinitialiser</span>
            </button>
          )}
        </div>

        <p className="text-white/70 text-sm mb-6 leading-relaxed">
          Affinez votre avatar avec précision. Chaque ajustement est appliqué en temps réel sur le modèle 3D.
        </p>

        {/* Corps category - always visible with first 3 morphs */}
        {corpsMorphs.length > 0 && (
          <div className="mb-6">
            <h5 className="text-white/90 font-semibold text-sm mb-4 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center border border-purple-400/30">
                <SpatialIcon Icon={ICONS.User} size={14} className="text-purple-400" />
              </div>
              Corps
            </h5>

            <div className="space-y-4">
              {corpsMorphs.slice(0, isExpanded ? corpsMorphs.length : 3).map((morph, index) => {
                const range = morphPolicy.ranges[morph.key];
                if (!range) return null;

                const currentValue = currentMorphData[morph.key] !== undefined && currentMorphData[morph.key] !== null
                  ? currentMorphData[morph.key]
                  : 0;

                const isAdjusted = adjustedMorphs.has(morph.key);
                const percentValue = ((currentValue - range.min) / (range.max - range.min)) * 100;

                return (
                  <ConditionalMotion
                    key={morph.key}
                    className={`
                      p-5 rounded-2xl backdrop-blur-sm transition-all duration-300
                      ${isAdjusted ? 'ring-2 ring-blue-400/40 shadow-lg shadow-blue-500/20' : ''}
                    `}
                    style={{
                      background: isAdjusted
                        ? 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(37,99,235,0.08))'
                        : 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                      border: `1px solid ${isAdjusted ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)'}`,
                    }}
                    initial={performanceConfig.enableStaggerAnimations ? { opacity: 0, x: -20 } : false}
                    animate={performanceConfig.enableStaggerAnimations ? { opacity: 1, x: 0 } : { opacity: 1 }}
                    transition={performanceConfig.enableFramerMotion ? { delay: 0.1 * index, duration: 0.4 } : undefined}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg bg-gradient-to-br ${morph.gradient} flex items-center justify-center shadow-lg`}
                          style={{ boxShadow: `0 4px 12px ${morph.color}40` }}
                        >
                          <SpatialIcon
                            Icon={ICONS[morph.icon] || ICONS.Circle}
                            size={18}
                            style={{ color: 'white' }}
                            variant="pure"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium text-base">
                              {morph.label}
                            </span>
                            {isAdjusted && (
                              <div
                                className="w-2 h-2 rounded-full animate-pulse"
                                style={{ backgroundColor: '#60A5FA', boxShadow: '0 0 8px #60A5FA' }}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        className="px-3 py-1.5 rounded-lg text-sm font-mono font-bold"
                        style={{
                          background: isAdjusted
                            ? 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(37,99,235,0.2))'
                            : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${isAdjusted ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)'}`,
                          color: isAdjusted ? '#60A5FA' : 'rgba(255,255,255,0.7)'
                        }}
                      >
                        {currentValue.toFixed(2)}
                      </div>
                    </div>

                    {/* Custom styled slider */}
                    <div className="relative">
                      <input
                        type="range"
                        min={range.min}
                        max={range.max}
                        step={0.01}
                        value={currentValue}
                        onChange={(e) => handleSliderChange(morph.key, parseFloat(e.target.value))}
                        className="w-full h-3 appearance-none bg-transparent cursor-pointer rounded-full"
                        style={{
                          background: `linear-gradient(to right, ${morph.color} 0%, ${morph.color} ${percentValue}%, rgba(255,255,255,0.1) ${percentValue}%, rgba(255,255,255,0.1) 100%)`,
                          boxShadow: `inset 0 1px 3px rgba(0,0,0,0.3), 0 0 ${isAdjusted ? '12px' : '0px'} ${morph.color}40`,
                        }}
                      />

                      {/* Range indicators */}
                      <div className="flex justify-between mt-2 text-xs text-white/40 font-medium">
                        <span>Min: {range.min.toFixed(1)}</span>
                        <span>Max: {range.max.toFixed(1)}</span>
                      </div>
                    </div>
                  </ConditionalMotion>
                );
              })}
            </div>
          </div>
        )}

        {/* Expand/collapse button */}
        {totalHiddenMorphs > 0 && (
          <button
            onClick={() => {
              click();
              setIsExpanded(!isExpanded);
            }}
            className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:bg-white/5"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(167,139,250,0.1))',
              border: '1px solid rgba(139,92,246,0.3)',
              color: '#A78BFA'
            }}
          >
            <SpatialIcon Icon={isExpanded ? ICONS.ChevronUp : ICONS.ChevronDown} size={16} />
            <span>
              {isExpanded
                ? 'Réduire'
                : `Afficher ${totalHiddenMorphs} contrôle${totalHiddenMorphs > 1 ? 's' : ''} supplémentaire${totalHiddenMorphs > 1 ? 's' : ''}`
              }
            </span>
          </button>
        )}

        {/* Other categories - only visible when expanded */}
        {isExpanded && otherCategories.map(([category, morphs]) => (
          <div key={category} className="mt-6">
            <h5 className="text-white/90 font-semibold text-sm mb-4 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-500/20 to-pink-600/20 flex items-center justify-center border border-pink-400/30">
                <SpatialIcon Icon={ICONS.Circle} size={14} className="text-pink-400" />
              </div>
              {category}
            </h5>

            <div className="space-y-4">
              {morphs.map((morph, index) => {
                const range = morphPolicy.ranges[morph.key];
                if (!range) return null;

                const currentValue = currentMorphData[morph.key] !== undefined && currentMorphData[morph.key] !== null
                  ? currentMorphData[morph.key]
                  : 0;

                const isAdjusted = adjustedMorphs.has(morph.key);
                const percentValue = ((currentValue - range.min) / (range.max - range.min)) * 100;

                return (
                  <ConditionalMotion
                    key={morph.key}
                    className={`
                      p-5 rounded-2xl backdrop-blur-sm transition-all duration-300
                      ${isAdjusted ? 'ring-2 ring-blue-400/40 shadow-lg shadow-blue-500/20' : ''}
                    `}
                    style={{
                      background: isAdjusted
                        ? 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(37,99,235,0.08))'
                        : 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                      border: `1px solid ${isAdjusted ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)'}`,
                    }}
                    initial={performanceConfig.enableStaggerAnimations ? { opacity: 0, x: -20 } : false}
                    animate={performanceConfig.enableStaggerAnimations ? { opacity: 1, x: 0 } : { opacity: 1 }}
                    transition={performanceConfig.enableFramerMotion ? { delay: 0.1 * index, duration: 0.4 } : undefined}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg bg-gradient-to-br ${morph.gradient} flex items-center justify-center shadow-lg`}
                          style={{ boxShadow: `0 4px 12px ${morph.color}40` }}
                        >
                          <SpatialIcon
                            Icon={ICONS[morph.icon] || ICONS.Circle}
                            size={18}
                            style={{ color: 'white' }}
                            variant="pure"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium text-base">
                              {morph.label}
                            </span>
                            {isAdjusted && (
                              <div
                                className="w-2 h-2 rounded-full animate-pulse"
                                style={{ backgroundColor: '#60A5FA', boxShadow: '0 0 8px #60A5FA' }}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        className="px-3 py-1.5 rounded-lg text-sm font-mono font-bold"
                        style={{
                          background: isAdjusted
                            ? 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(37,99,235,0.2))'
                            : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${isAdjusted ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)'}`,
                          color: isAdjusted ? '#60A5FA' : 'rgba(255,255,255,0.7)'
                        }}
                      >
                        {currentValue.toFixed(2)}
                      </div>
                    </div>

                    {/* Custom styled slider */}
                    <div className="relative">
                      <input
                        type="range"
                        min={range.min}
                        max={range.max}
                        step={0.01}
                        value={currentValue}
                        onChange={(e) => handleSliderChange(morph.key, parseFloat(e.target.value))}
                        className="w-full h-3 appearance-none bg-transparent cursor-pointer rounded-full"
                        style={{
                          background: `linear-gradient(to right, ${morph.color} 0%, ${morph.color} ${percentValue}%, rgba(255,255,255,0.1) ${percentValue}%, rgba(255,255,255,0.1) 100%)`,
                          boxShadow: `inset 0 1px 3px rgba(0,0,0,0.3), 0 0 ${isAdjusted ? '12px' : '0px'} ${morph.color}40`,
                        }}
                      />

                      {/* Range indicators */}
                      <div className="flex justify-between mt-2 text-xs text-white/40 font-medium">
                        <span>Min: {range.min.toFixed(1)}</span>
                        <span>Max: {range.max.toFixed(1)}</span>
                      </div>
                    </div>
                  </ConditionalMotion>
                );
              })}
            </div>
          </div>
        ))}
      </GlassCard>
    </ConditionalMotion>
  );
});

MorphAdjustmentControls.displayName = 'MorphAdjustmentControls';

export default MorphAdjustmentControls;
