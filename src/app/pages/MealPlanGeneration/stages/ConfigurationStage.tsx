import React from 'react';
import { motion } from 'framer-motion';
import { usePerformanceMode } from '../../../../system/context/PerformanceModeContext';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';
import CustomDropdown from '../../../pages/Fridge/tabs/RecipesTab/components/CustomDropdown';
import { WEEK_COUNT_OPTIONS } from '../../../../system/store/mealPlanGenerationPipeline';

interface ConfigurationStageProps {
  availableInventories: any[];
  selectedInventoryId: string | null;
  weekCount: number;
  batchCooking: boolean;
  onSetWeekCount: (count: number) => void;
  onSetBatchCooking: (enabled: boolean) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  onExit: () => void;
}

const ConfigurationStage: React.FC<ConfigurationStageProps> = ({
  availableInventories,
  selectedInventoryId,
  weekCount,
  batchCooking,
  onSetWeekCount,
  onSetBatchCooking,
  onGenerate,
  isGenerating,
  onExit
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  const selectedInventory = availableInventories.find(inv => inv.id === selectedInventoryId);
  const hasValidInventory = selectedInventory && selectedInventory.inventory_final?.length > 0;

  const weekCountOptions = WEEK_COUNT_OPTIONS.map(option => ({
    value: option.value.toString(),
    label: option.label
  }));

  return (
    <div className="space-y-6">
      {/* Main Configuration Card */}
      <MotionDiv
        {...(!isPerformanceMode && {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5 }
        })}
      >
        <GlassCard
          className="p-8"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, color-mix(in srgb, #8B5CF6 12%, transparent) 0%, transparent 60%),
              radial-gradient(circle at 70% 80%, color-mix(in srgb, #A855F7 8%, transparent) 0%, transparent 50%),
              linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.05)),
              rgba(11, 14, 23, 0.85)
            `,
            borderColor: 'color-mix(in srgb, #8B5CF6 30%, transparent)',
            boxShadow: `
              0 20px 60px rgba(0, 0, 0, 0.3),
              0 0 40px color-mix(in srgb, #8B5CF6 20%, transparent),
              inset 0 2px 0 rgba(255, 255, 255, 0.15)
            `,
            backdropFilter: 'blur(24px) saturate(150%)',
            WebkitBackdropFilter: 'blur(24px) saturate(150%)'
          }}
        >
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div
                className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center"
                style={{
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 60%),
                    linear-gradient(135deg, color-mix(in srgb, #8B5CF6 40%, transparent), color-mix(in srgb, #A855F7 35%, transparent))
                  `,
                  border: '3px solid color-mix(in srgb, #8B5CF6 50%, transparent)',
                  boxShadow: `
                    0 0 30px color-mix(in srgb, #8B5CF6 40%, transparent),
                    inset 0 2px 0 rgba(255,255,255,0.3)
                  `
                }}
              >
                <SpatialIcon
                  Icon={ICONS.Settings}
                  size={48}
                  color="rgba(255, 255, 255, 0.95)"
                  variant="pure"
                />
              </div>

              <div>
                <h2
                  className="text-3xl font-bold text-white mb-3"
                  style={{
                    textShadow: '0 0 25px color-mix(in srgb, #8B5CF6 50%, transparent)'
                  }}
                >
                  Configurez votre Génération
                </h2>
                <p className="text-white/80 text-lg">
                  Choisissez votre inventaire et vos préférences de planification
                </p>
              </div>
            </div>

            {/* Configuration Form */}
            <div className="space-y-6">
              {/* Week Count Selection */}
              <div className="space-y-3">
                <label className="block text-white font-semibold text-sm">
                  Nombre de semaines
                </label>
                <CustomDropdown
                  options={weekCountOptions}
                  value={weekCount.toString()}
                  onChange={(value) => onSetWeekCount(parseInt(value))}
                  placeholder="Nombre de semaines"
                  className="w-full"
                  disabled={isGenerating}
                />
              </div>

              {/* Batch Cooking Toggle */}
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer p-4 rounded-xl transition-all duration-200"
                  style={{
                    background: batchCooking ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${batchCooking ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.15)'}`
                  }}
                >
                  <div className="flex items-center gap-3">
                    <SpatialIcon Icon={ICONS.Flame} size={24} className="text-purple-400" />
                    <div>
                      <span className="text-white font-semibold block">Batch Cooking</span>
                      <span className="text-white/70 text-sm">Préparez plusieurs portions à l'avance</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={batchCooking}
                    onChange={(e) => onSetBatchCooking(e.target.checked)}
                    disabled={isGenerating}
                    className="w-5 h-5 rounded accent-purple-500"
                  />
                </label>
              </div>

              {/* Selected Inventory Info */}
              {!availableInventories.length ? (
                <MotionDiv
                  {...(!isPerformanceMode && {
                    initial: { opacity: 0 },
                    animate: { opacity: 1 }
                  })}
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(251, 146, 60, 0.1)',
                    border: '1px solid rgba(251, 146, 60, 0.3)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <SpatialIcon Icon={ICONS.AlertTriangle} size={20} className="text-amber-400" />
                    <div>
                      <p className="text-white font-medium">Aucun inventaire disponible</p>
                      <p className="text-white/70 text-sm">
                        Scannez votre frigo pour commencer à générer des plans !
                      </p>
                    </div>
                  </div>
                </MotionDiv>
              ) : hasValidInventory && (
                <MotionDiv
                  {...(!isPerformanceMode && {
                    initial: { opacity: 0 },
                    animate: { opacity: 1 }
                  })}
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <SpatialIcon Icon={ICONS.Check} size={20} className="text-purple-400" />
                    <div>
                      <p className="text-white font-medium">Inventaire le plus récent sélectionné</p>
                      <p className="text-white/70 text-sm">
                        {selectedInventory.inventory_final.length} ingrédients disponibles
                      </p>
                    </div>
                  </div>
                </MotionDiv>
              )}
            </div>

            {/* Generate Button */}
            <MotionDiv
              {...(!isPerformanceMode && {
                initial: { opacity: 0, y: 10 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.3, delay: 0.2 }
              })}
            >
              <button
                onClick={onGenerate}
                disabled={!hasValidInventory || isGenerating}
                className={`w-full text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 ${
                  !hasValidInventory || isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                }`}
                style={
                  hasValidInventory && !isGenerating
                    ? {
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(168, 85, 247, 0.85) 100%)',
                        backdropFilter: 'blur(20px) saturate(160%)',
                        border: '2px solid color-mix(in srgb, #8B5CF6 60%, transparent)',
                        boxShadow: `
                          0 12px 40px color-mix(in srgb, #8B5CF6 40%, transparent),
                          0 0 60px color-mix(in srgb, #8B5CF6 30%, transparent),
                          inset 0 3px 0 rgba(255, 255, 255, 0.4),
                          inset 0 -3px 0 rgba(0, 0, 0, 0.2)
                        `,
                        WebkitBackdropFilter: 'blur(20px) saturate(160%)'
                      }
                    : undefined
                }
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-lg">Génération en cours...</span>
                  </>
                ) : (
                  <>
                    <SpatialIcon Icon={ICONS.Sparkles} size={24} />
                    <span className="text-lg">Générer {weekCount} Semaine{weekCount > 1 ? 's' : ''}</span>
                  </>
                )}
              </button>
            </MotionDiv>
          </div>
        </GlassCard>
      </MotionDiv>

      {/* Exit Button */}
      <MotionDiv
        {...(!isPerformanceMode && {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.3, delay: 0.6 }
        })}
        className="flex justify-end"
      >
        <button
          onClick={onExit}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all duration-200"
        >
          Quitter
        </button>
      </MotionDiv>
    </div>
  );
};

export default ConfigurationStage;
