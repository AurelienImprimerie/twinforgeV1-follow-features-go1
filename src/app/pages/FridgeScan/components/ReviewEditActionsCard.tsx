import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePerformanceMode } from '../../../../system/context/PerformanceModeContext';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';
import { useFeedback } from '../../../../hooks/useFeedback';
import { useToast } from '../../../../ui/components/ToastProvider';
import { useNavigate } from 'react-router-dom';
import { useFridgeScanPipeline } from '../../../../system/store/fridgeScan';
import { useMealPlanStore } from '../../../../system/store/mealPlanStore';
import type { FridgeItem } from '../../../../domain/recipe';
import logger from '../../../../lib/utils/logger';

interface ReviewEditActionsCardProps {
  userEditedInventory: FridgeItem[];
  onBack: () => void;
  handleManualExit: () => void;
  onValidateInventory: () => void;
}

/**
 * ReviewEditActionsCard - Dynamic CTA Component for ReviewEditStage
 * Manages the progression from inventory validation to recipe/meal plan generation
 * Optimized with performance mode for mobile
 */
const ReviewEditActionsCard: React.FC<ReviewEditActionsCardProps> = ({
  userEditedInventory,
  onBack,
  handleManualExit,
  onValidateInventory
}) => {
  const { click } = useFeedback();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { currentSessionId, resetPipeline } = useFridgeScanPipeline();
  const { selectInventory, loadAvailableInventories } = useMealPlanStore();
  const { isPerformanceMode } = usePerformanceMode();

  // Local state for inventory validation
  const [isInventoryValidated, setIsInventoryValidated] = useState(false);

  const MotionDiv = isPerformanceMode ? 'div' : motion.div;


  // Handle inventory validation - now calls the prop function
  const handleValidateInventoryClick = () => {
    onValidateInventory();
    setIsInventoryValidated(true);
  };

  // Handle meal plan generation
  const handleGenerateMealPlan = async () => {
    try {
      logger.info('REVIEW_EDIT_ACTIONS', 'Starting meal plan generation', {
        inventoryCount: userEditedInventory.length,
        sessionId: currentSessionId,
        timestamp: new Date().toISOString()
      });

      // Ensure inventory is selected in meal plan store
      if (currentSessionId) {
        selectInventory(currentSessionId);
      }

      // Reset the pipeline before navigation to prevent re-hydration loop
      logger.info('REVIEW_EDIT_ACTIONS', 'Resetting pipeline before navigation to plan tab', {
        sessionId: currentSessionId,
        timestamp: new Date().toISOString()
      });
      resetPipeline();

      // Navigate to plan tab
      navigate('/fridge#plan');

    } catch (error) {
      logger.error('REVIEW_EDIT_ACTIONS', 'Meal plan generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        inventoryCount: userEditedInventory.length,
        timestamp: new Date().toISOString()
      });

      showToast({
        type: 'error',
        title: 'Erreur de Navigation',
        message: 'Impossible d\'accéder à l\'onglet plan. Veuillez réessayer.',
        duration: 4000
      });
    }
  };

  // Handle recipe generation
  const handleGenerateRecipes = async () => {
    try {
      logger.info('REVIEW_EDIT_ACTIONS', 'Starting recipe generation', {
        inventoryCount: userEditedInventory.length,
        sessionId: currentSessionId,
        timestamp: new Date().toISOString()
      });

      // Ensure inventory is selected in meal plan store
      if (currentSessionId) {
        selectInventory(currentSessionId);
      }

      // Reset the pipeline before navigation to prevent re-hydration loop
      logger.info('REVIEW_EDIT_ACTIONS', 'Resetting pipeline before navigation to recipes tab', {
        sessionId: currentSessionId,
        timestamp: new Date().toISOString()
      });
      resetPipeline();

      // Navigate to recipes tab
      navigate('/fridge#recipes');

    } catch (error) {
      logger.error('REVIEW_EDIT_ACTIONS', 'Recipe generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        inventoryCount: userEditedInventory.length,
        timestamp: new Date().toISOString()
      });

      showToast({
        type: 'error',
        title: 'Erreur de Navigation',
        message: 'Impossible d\'accéder à l\'onglet recettes. Veuillez réessayer.',
        duration: 4000
      });
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!isInventoryValidated ? (
        <MotionDiv
          key="validation-state"
          {...(!isPerformanceMode && {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -20 },
            transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
          })}
          className="space-y-4"
        >
          {/* Validation CTA - Pink Theme */}
          <GlassCard
            className="p-8 text-center w-full"
            style={{
              background: `
                radial-gradient(circle at 30% 20%, color-mix(in srgb, #EC4899 18%, transparent) 0%, transparent 60%),
                radial-gradient(circle at 70% 80%, color-mix(in srgb, #F472B6 15%, transparent) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, color-mix(in srgb, #DB2777 12%, transparent) 0%, transparent 70%),
                linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.10)),
                rgba(11, 14, 23, 0.85)
              `,
              borderColor: 'color-mix(in srgb, #EC4899 40%, transparent)',
              boxShadow: `
                0 16px 48px rgba(0, 0, 0, 0.3),
                0 0 36px color-mix(in srgb, #EC4899 25%, transparent),
                inset 0 2px 0 rgba(255, 255, 255, 0.18)
              `,
              backdropFilter: 'blur(28px) saturate(160%)',
              WebkitBackdropFilter: 'blur(28px) saturate(160%)'
            }}
          >
            <div className="space-y-6">
              {/* Animated Icon */}
              <MotionDiv
                className="relative inline-block"
                {...(!isPerformanceMode && {
                  initial: { scale: 0.9, opacity: 0 },
                  animate: { scale: 1, opacity: 1 },
                  transition: { duration: 0.5, delay: 0.1 }
                })}
              >
                <MotionDiv
                  className="w-20 h-20 mx-auto rounded-full flex items-center justify-center relative"
                  style={{
                    background: `
                      radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35) 0%, transparent 60%),
                      radial-gradient(circle at 70% 70%, color-mix(in srgb, #EC4899 30%, transparent) 0%, transparent 50%),
                      linear-gradient(135deg, color-mix(in srgb, #EC4899 55%, transparent), color-mix(in srgb, #F472B6 45%, transparent))
                    `,
                    border: '3px solid color-mix(in srgb, #EC4899 70%, transparent)',
                    boxShadow: `
                      0 0 40px color-mix(in srgb, #EC4899 60%, transparent),
                      inset 0 3px 0 rgba(255,255,255,0.5)
                    `
                  }}
                  {...(!isPerformanceMode && {
                    animate: {
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        '0 0 40px rgba(236, 72, 153, 0.6)',
                        '0 0 50px rgba(236, 72, 153, 0.75)',
                        '0 0 40px rgba(236, 72, 153, 0.6)'
                      ]
                    },
                    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
                  })}
                >
                  <SpatialIcon
                    Icon={ICONS.Check}
                    size={36}
                    color="rgba(255, 255, 255, 0.95)"
                    variant="pure"
                  />

                  {/* Pulsing Ring - Désactivé en performance mode */}
                  {!isPerformanceMode && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2"
                      style={{
                        borderColor: 'color-mix(in srgb, #EC4899 65%, transparent)'
                      }}
                      animate={{
                        scale: [1, 1.5, 1.5],
                        opacity: [0.8, 0, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeOut'
                      }}
                    />
                  )}
                </MotionDiv>
              </MotionDiv>

              {/* Title and Description */}
              <MotionDiv
                {...(!isPerformanceMode && {
                  initial: { opacity: 0, y: 10 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.4, delay: 0.2 }
                })}
              >
                <h4
                  className="text-2xl font-bold text-white mb-3"
                  style={{
                    textShadow: '0 0 20px color-mix(in srgb, #EC4899 50%, transparent)'
                  }}
                >
                  Valider votre inventaire
                </h4>
                <p className="text-white/85 text-base leading-relaxed max-w-lg mx-auto">
                  <span className="font-bold text-pink-300">{userEditedInventory.length} ingrédient{userEditedInventory.length > 1 ? 's' : ''}</span> prêt{userEditedInventory.length > 1 ? 's' : ''} à être validé{userEditedInventory.length > 1 ? 's' : ''}.
                  Confirmez pour continuer vers la génération.
                </p>
              </MotionDiv>

              {/* Validation Button */}
              <MotionDiv
                {...(!isPerformanceMode && {
                  initial: { opacity: 0, scale: 0.95 },
                  animate: { opacity: 1, scale: 1 },
                  transition: { duration: 0.4, delay: 0.3 }
                })}
              >
                <button
                  onClick={() => {
                    click();
                    handleValidateInventoryClick();
                  }}
                  disabled={userEditedInventory.length === 0}
                  className="relative overflow-hidden px-10 py-4 text-lg font-bold rounded-2xl transition-all duration-300 group"
                  style={{
                    background: `
                      linear-gradient(135deg,
                        color-mix(in srgb, #EC4899 90%, transparent),
                        color-mix(in srgb, #F472B6 75%, transparent),
                        color-mix(in srgb, #DB2777 65%, transparent)
                      )
                    `,
                    border: '3px solid color-mix(in srgb, #EC4899 75%, transparent)',
                    boxShadow: `
                      0 18px 60px color-mix(in srgb, #EC4899 60%, transparent),
                      0 0 100px color-mix(in srgb, #EC4899 50%, transparent),
                      inset 0 5px 0 rgba(255,255,255,0.6)
                    `,
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    if (!isPerformanceMode && window.matchMedia('(hover: hover)').matches) {
                      e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
                      e.currentTarget.style.boxShadow = `
                        0 24px 80px color-mix(in srgb, #EC4899 75%, transparent),
                        0 0 130px color-mix(in srgb, #EC4899 65%, transparent),
                        inset 0 5px 0 rgba(255,255,255,0.7)
                      `;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isPerformanceMode && window.matchMedia('(hover: hover)').matches) {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = `
                        0 18px 60px color-mix(in srgb, #EC4899 60%, transparent),
                        0 0 100px color-mix(in srgb, #EC4899 50%, transparent),
                        inset 0 5px 0 rgba(255,255,255,0.6)
                      `;
                    }
                  }}
                >
                  {/* Shimmer Effect - Désactivé en performance mode */}
                  {!isPerformanceMode && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)'
                      }}
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}

                  <div className="flex items-center gap-3 relative z-10">
                    <SpatialIcon Icon={ICONS.Check} size={22} color="white" variant="pure" />
                    <span>Valider l'inventaire</span>
                  </div>
                </button>
              </MotionDiv>

              {/* Stats Badge */}
              <MotionDiv
                {...(!isPerformanceMode && {
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  transition: { delay: 0.4 }
                })}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full"
                style={{
                  background: 'color-mix(in srgb, #EC4899 18%, transparent)',
                  border: '2px solid color-mix(in srgb, #EC4899 35%, transparent)',
                  backdropFilter: 'blur(18px) saturate(150%)'
                }}
              >
                <SpatialIcon Icon={ICONS.Package} size={16} className="text-pink-300" />
                <span className="text-pink-200 text-sm font-semibold">
                  {userEditedInventory.length} ingrédient{userEditedInventory.length > 1 ? 's' : ''} en attente
                </span>
              </MotionDiv>
            </div>
          </GlassCard>

          {/* Navigation Buttons */}
          <MotionDiv
            {...(!isPerformanceMode && {
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: 0.35 }
            })}
            className="flex flex-col sm:flex-row gap-4 justify-between"
          >
            <button
              onClick={onBack}
              className="px-7 py-4 rounded-2xl font-semibold text-base transition-all duration-300 flex-1"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(16px)',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                if (window.matchMedia('(hover: hover)').matches) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (window.matchMedia('(hover: hover)').matches) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <SpatialIcon Icon={ICONS.ArrowLeft} size={18} />
                <span>Retour</span>
              </div>
            </button>

            <button
              onClick={() => {
                click();
                handleManualExit();
              }}
              className="px-7 py-4 rounded-2xl font-semibold text-base transition-all duration-300 flex-1"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(16px)',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                if (window.matchMedia('(hover: hover)').matches) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (window.matchMedia('(hover: hover)').matches) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <SpatialIcon Icon={ICONS.X} size={18} />
                <span>Quitter l'Atelier</span>
              </div>
            </button>
          </MotionDiv>
        </MotionDiv>
      ) : (
        <MotionDiv
          key="validated-state"
          {...(!isPerformanceMode && {
            initial: { opacity: 0, y: 20, scale: 0.95 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: -20, scale: 0.95 },
            transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
          })}
        >
          <GlassCard
            className="p-8 text-center w-full"
            style={{
              background: `
                radial-gradient(circle at 30% 20%, color-mix(in srgb, #EC4899 20%, transparent) 0%, transparent 60%),
                radial-gradient(circle at 70% 80%, color-mix(in srgb, #8B5CF6 18%, transparent) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, color-mix(in srgb, #F472B6 15%, transparent) 0%, transparent 70%),
                linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.10)),
                rgba(11, 14, 23, 0.85)
              `,
              borderColor: 'color-mix(in srgb, #EC4899 45%, transparent)',
              boxShadow: `
                0 20px 60px rgba(0, 0, 0, 0.35),
                0 0 40px color-mix(in srgb, #EC4899 30%, transparent),
                0 0 80px color-mix(in srgb, #8B5CF6 25%, transparent),
                inset 0 2px 0 rgba(255, 255, 255, 0.2)
              `,
              backdropFilter: 'blur(32px) saturate(170%)',
              WebkitBackdropFilter: 'blur(32px) saturate(170%)'
            }}
          >
            <div className="space-y-6">
              {/* Success Icon */}
              <MotionDiv
                {...(!isPerformanceMode && {
                  initial: { scale: 0, rotate: -180 },
                  animate: { scale: 1, rotate: 0 },
                  transition: { type: 'spring', stiffness: 200, damping: 15 }
                })}
              >
                <MotionDiv
                  className="w-20 h-20 mx-auto rounded-full flex items-center justify-center relative"
                  style={{
                    background: `
                      radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35) 0%, transparent 60%),
                      radial-gradient(circle at 70% 70%, color-mix(in srgb, #8B5CF6 30%, transparent) 0%, transparent 50%),
                      linear-gradient(135deg, color-mix(in srgb, #EC4899 55%, transparent), color-mix(in srgb, #8B5CF6 45%, transparent))
                    `,
                    border: '3px solid color-mix(in srgb, #EC4899 70%, transparent)',
                    boxShadow: `
                      0 0 40px color-mix(in srgb, #EC4899 60%, transparent),
                      0 0 80px color-mix(in srgb, #8B5CF6 40%, transparent),
                      inset 0 3px 0 rgba(255,255,255,0.5)
                    `
                  }}
                  {...(!isPerformanceMode && {
                    animate: {
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        '0 0 40px rgba(236, 72, 153, 0.6), 0 0 80px rgba(139, 92, 246, 0.4)',
                        '0 0 50px rgba(236, 72, 153, 0.75), 0 0 100px rgba(139, 92, 246, 0.55)',
                        '0 0 40px rgba(236, 72, 153, 0.6), 0 0 80px rgba(139, 92, 246, 0.4)'
                      ]
                    },
                    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
                  })}
                >
                  <SpatialIcon
                    Icon={ICONS.Sparkles}
                    size={36}
                    color="rgba(255, 255, 255, 0.95)"
                    variant="pure"
                  />
                </MotionDiv>
              </MotionDiv>

              {/* Title and Description */}
              <MotionDiv
                {...(!isPerformanceMode && {
                  initial: { opacity: 0, y: 10 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: 0.2 }
                })}
              >
                <h4
                  className="text-2xl font-bold text-white mb-3"
                  style={{
                    textShadow: '0 0 20px color-mix(in srgb, #EC4899 50%, transparent)'
                  }}
                >
                  Générer vos Recettes
                </h4>
                <p className="text-white/85 text-base leading-relaxed max-w-lg mx-auto">
                  Inventaire validé avec succès ! Choisissez votre prochaine étape pour exploiter vos ingrédients.
                </p>
              </MotionDiv>

              {/* Action Buttons */}
              <MotionDiv
                {...(!isPerformanceMode && {
                  initial: { opacity: 0, y: 10 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: 0.3 }
                })}
                className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto"
              >
                <button
                  onClick={() => {
                    click();
                    handleGenerateMealPlan();
                  }}
                  className="relative overflow-hidden px-8 py-4 text-base font-bold rounded-2xl transition-all duration-300 group flex-1"
                  style={{
                    background: `
                      linear-gradient(135deg,
                        color-mix(in srgb, #EC4899 85%, transparent),
                        color-mix(in srgb, #F472B6 70%, transparent)
                      )
                    `,
                    border: '2.5px solid color-mix(in srgb, #EC4899 70%, transparent)',
                    boxShadow: `
                      0 12px 40px color-mix(in srgb, #EC4899 50%, transparent),
                      0 0 60px color-mix(in srgb, #EC4899 35%, transparent),
                      inset 0 3px 0 rgba(255,255,255,0.5)
                    `,
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    if (window.matchMedia('(hover: hover)').matches) {
                      e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                      e.currentTarget.style.boxShadow = `
                        0 16px 50px color-mix(in srgb, #EC4899 65%, transparent),
                        0 0 80px color-mix(in srgb, #EC4899 50%, transparent),
                        inset 0 3px 0 rgba(255,255,255,0.6)
                      `;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (window.matchMedia('(hover: hover)').matches) {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = `
                        0 12px 40px color-mix(in srgb, #EC4899 50%, transparent),
                        0 0 60px color-mix(in srgb, #EC4899 35%, transparent),
                        inset 0 3px 0 rgba(255,255,255,0.5)
                      `;
                    }
                  }}
                >
                  <div className="flex items-center justify-center gap-2.5 relative z-10">
                    <SpatialIcon Icon={ICONS.Calendar} size={20} color="white" variant="pure" />
                    <span>Plan Repas</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    click();
                    handleGenerateRecipes();
                  }}
                  className="relative overflow-hidden px-8 py-4 text-base font-bold rounded-2xl transition-all duration-300 group flex-1"
                  style={{
                    background: `
                      linear-gradient(135deg,
                        color-mix(in srgb, #8B5CF6 85%, transparent),
                        color-mix(in srgb, #A78BFA 70%, transparent)
                      )
                    `,
                    border: '2.5px solid color-mix(in srgb, #8B5CF6 70%, transparent)',
                    boxShadow: `
                      0 12px 40px color-mix(in srgb, #8B5CF6 50%, transparent),
                      0 0 60px color-mix(in srgb, #8B5CF6 35%, transparent),
                      inset 0 3px 0 rgba(255,255,255,0.5)
                    `,
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    if (window.matchMedia('(hover: hover)').matches) {
                      e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                      e.currentTarget.style.boxShadow = `
                        0 16px 50px color-mix(in srgb, #8B5CF6 65%, transparent),
                        0 0 80px color-mix(in srgb, #8B5CF6 50%, transparent),
                        inset 0 3px 0 rgba(255,255,255,0.6)
                      `;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (window.matchMedia('(hover: hover)').matches) {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = `
                        0 12px 40px color-mix(in srgb, #8B5CF6 50%, transparent),
                        0 0 60px color-mix(in srgb, #8B5CF6 35%, transparent),
                        inset 0 3px 0 rgba(255,255,255,0.5)
                      `;
                    }
                  }}
                >
                  <div className="flex items-center justify-center gap-2.5 relative z-10">
                    <SpatialIcon Icon={ICONS.Sparkles} size={20} color="white" variant="pure" />
                    <span>Recettes</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    click();

                    // Reset pipeline before navigation to home
                    logger.info('REVIEW_EDIT_ACTIONS', 'Resetting pipeline before navigation to home', {
                      sessionId: currentSessionId,
                      timestamp: new Date().toISOString()
                    });
                    resetPipeline();

                    navigate('/');
                  }}
                  className="px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-300"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    backdropFilter: 'blur(16px)',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    if (window.matchMedia('(hover: hover)').matches) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (window.matchMedia('(hover: hover)').matches) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <SpatialIcon Icon={ICONS.Home} size={18} />
                    <span>Tableau de bord</span>
                  </div>
                </button>
              </MotionDiv>
            </div>
          </GlassCard>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
};

export default ReviewEditActionsCard;
