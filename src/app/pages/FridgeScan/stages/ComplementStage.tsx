import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFeedback } from '@/hooks';
import { useToast } from '../../../../ui/components/ToastProvider';
import { usePerformanceMode } from '../../../../system/context/PerformanceModeContext';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';
import SuggestedItemsCard from '../components/SuggestedItemsCard';
import type { FridgeItem } from '../../../../domain/recipe';
import type { SuggestedFridgeItem } from '../../../../system/store/fridgeScan/types';
import logger from '../../../../lib/utils/logger';

interface ComplementStageProps {
  userEditedInventory: FridgeItem[];
  suggestedComplementaryItems: SuggestedFridgeItem[];
  addSelectedComplementaryItems: (items: FridgeItem[]) => void;
  onContinueToValidation: () => void;
  onBackToPhoto: () => void;
}

const ComplementStage: React.FC<ComplementStageProps> = ({
  userEditedInventory,
  suggestedComplementaryItems,
  addSelectedComplementaryItems,
  onContinueToValidation,
  onBackToPhoto
}) => {
  const { click, success } = useFeedback();
  const { showToast } = useToast();
  const { isPerformanceMode } = usePerformanceMode();
  const [hasUnaddedSelections, setHasUnaddedSelections] = useState(false);

  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  const handleAddSelectedItems = (selectedItems: FridgeItem[]) => {
    logger.info('COMPLEMENT_STAGE', 'Adding selected complementary items', {
      selectedItemsCount: selectedItems.length,
      selectedItems: selectedItems.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity
      })),
      timestamp: new Date().toISOString()
    });

    addSelectedComplementaryItems(selectedItems);
    success();
    setHasUnaddedSelections(false);

    showToast({
      type: 'success',
      title: 'Ingrédients ajoutés !',
      message: `${selectedItems.length} ingrédient${selectedItems.length > 1 ? 's' : ''} ajouté${selectedItems.length > 1 ? 's' : ''} à votre inventaire`,
      duration: 3000
    });

    setTimeout(() => {
      onContinueToValidation();
    }, 1000);
  };

  const handleContinueToValidation = () => {
    click();
    logger.info('COMPLEMENT_STAGE', 'User chose to continue to validation', {
      currentInventoryCount: userEditedInventory.length,
      suggestedItemsCount: suggestedComplementaryItems.length,
      hasUnaddedSelections,
      timestamp: new Date().toISOString()
    });
    onContinueToValidation();
  };

  const handleBackToPhoto = () => {
    click();
    logger.info('COMPLEMENT_STAGE', 'User chose to go back to photo capture', {
      timestamp: new Date().toISOString()
    });
    onBackToPhoto();
  };

  return (
    <div className="glass-card p-6 space-y-6"
         style={{
           background: `
             radial-gradient(circle at 30% 20%, color-mix(in srgb, #EC4899 18%, transparent) 0%, transparent 60%),
             radial-gradient(circle at 70% 80%, color-mix(in srgb, #18E3FF 15%, transparent) 0%, transparent 50%),
             linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.08)),
             rgba(11, 14, 23, 0.85)
           `,
           borderColor: 'color-mix(in srgb, #EC4899 35%, transparent)',
           boxShadow: `
             0 16px 48px rgba(0, 0, 0, 0.3),
             0 0 36px color-mix(in srgb, #EC4899 25%, transparent),
             inset 0 2px 0 rgba(255, 255, 255, 0.18)
           `,
           backdropFilter: 'blur(28px) saturate(160%)',
           WebkitBackdropFilter: 'blur(28px) saturate(160%)'
         }}>
      <MotionDiv
        {...(!isPerformanceMode && {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 },
          transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
        })}
        className="space-y-6"
      >
        {/* Information Card */}
        <MotionDiv
          {...(!isPerformanceMode && {
            initial: { opacity: 0, scale: 0.95 },
            animate: { opacity: 1, scale: 1 },
            transition: { duration: 0.4, delay: 0.1 }
          })}
          className="glass-card p-5"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, color-mix(in srgb, #A78BFA 18%, transparent) 0%, transparent 60%),
              radial-gradient(circle at 70% 80%, color-mix(in srgb, #8B5CF6 15%, transparent) 0%, transparent 50%),
              rgba(255, 255, 255, 0.06)
            `,
            borderColor: 'color-mix(in srgb, #8B5CF6 35%, transparent)',
            boxShadow: `
              0 8px 24px rgba(0, 0, 0, 0.2),
              0 0 24px color-mix(in srgb, #8B5CF6 20%, transparent),
              inset 0 1px 0 rgba(255, 255, 255, 0.15)
            `,
            backdropFilter: 'blur(20px) saturate(150%)'
          }}
        >
          <div className="flex items-start gap-4">
            <MotionDiv
              className="flex-shrink-0"
              {...(!isPerformanceMode && {
                animate: {
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    '0 0 20px rgba(147, 51, 234, 0.3)',
                    '0 0 28px rgba(147, 51, 234, 0.5)',
                    '0 0 20px rgba(147, 51, 234, 0.3)'
                  ]
                },
                transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
              })}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                   style={{
                     background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.25) 0%, rgba(168, 85, 247, 0.35) 100%)',
                     border: '2px solid rgba(147, 51, 234, 0.5)',
                     boxShadow: '0 0 24px rgba(147, 51, 234, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2)',
                     backdropFilter: 'blur(12px)'
                   }}>
                <SpatialIcon Icon={ICONS.AlertCircle} size={22} className="text-purple-300" />
              </div>
            </MotionDiv>
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-bold text-white">
                Inventaire Insuffisant Détecté
              </h3>
              <p className="text-sm text-gray-200 leading-relaxed">
                Votre frigo contient seulement <span className="font-bold text-purple-300">{userEditedInventory.length} ingrédient{userEditedInventory.length > 1 ? 's' : ''}</span>.
              </p>
              <p className="text-sm text-gray-300 leading-relaxed">
                Pour optimiser vos possibilités culinaires, nous vous suggérons d'ajouter quelques ingrédients complémentaires.
              </p>
            </div>
          </div>
        </MotionDiv>

        {/* Suggested Items Card */}
        {suggestedComplementaryItems.length > 0 && (
          <SuggestedItemsCard
            suggestedItems={suggestedComplementaryItems}
            onAddSelectedItems={handleAddSelectedItems}
            onSelectionChange={setHasUnaddedSelections}
          />
        )}

        {/* Action Buttons */}
        <MotionDiv
          {...(!isPerformanceMode && {
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.4, delay: 0.3 }
          })}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={handleContinueToValidation}
            className="flex-1 px-7 py-4 rounded-2xl font-semibold text-base transition-all duration-300 group"
            style={{
              background: `
                linear-gradient(135deg,
                  color-mix(in srgb, #EC4899 75%, transparent),
                  color-mix(in srgb, #F472B6 60%, transparent)
                )
              `,
              border: '2px solid color-mix(in srgb, #EC4899 60%, transparent)',
              boxShadow: `
                0 8px 24px color-mix(in srgb, #EC4899 40%, transparent),
                0 0 32px color-mix(in srgb, #EC4899 25%, transparent),
                inset 0 2px 0 rgba(255, 255, 255, 0.4)
              `,
              color: 'white'
            }}
            onMouseEnter={(e) => {
              if (window.matchMedia('(hover: hover)').matches) {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = `
                  0 12px 32px color-mix(in srgb, #EC4899 55%, transparent),
                  0 0 40px color-mix(in srgb, #EC4899 35%, transparent),
                  inset 0 2px 0 rgba(255, 255, 255, 0.5)
                `;
              }
            }}
            onMouseLeave={(e) => {
              if (window.matchMedia('(hover: hover)').matches) {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = `
                  0 8px 24px color-mix(in srgb, #EC4899 40%, transparent),
                  0 0 32px color-mix(in srgb, #EC4899 25%, transparent),
                  inset 0 2px 0 rgba(255, 255, 255, 0.4)
                `;
              }
            }}
          >
            <div className="flex items-center justify-center gap-3">
              <SpatialIcon Icon={ICONS.ArrowRight} size={22} />
              <span>Continuer la Validation</span>
            </div>
          </button>

          <button
            onClick={handleBackToPhoto}
            className="flex-1 px-7 py-4 rounded-2xl font-semibold text-base transition-all duration-300"
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
            <div className="flex items-center justify-center gap-3">
              <SpatialIcon Icon={ICONS.Camera} size={22} />
              <span>Reprendre des Photos</span>
            </div>
          </button>
        </MotionDiv>

        {/* Dynamic guidance text */}
        {hasUnaddedSelections && (
          <div className="text-center">
            <p className="text-sm text-orange-300 bg-orange-500/10 border border-orange-500/20 rounded-lg px-4 py-2">
              💡 Vous avez sélectionné des aliments mais ne les avez pas encore ajoutés.
              Cliquez sur "Ajouter X aliments" ou continuez sans les ajouter.
            </p>
          </div>
        )}

        {/* Stats Summary */}
        <MotionDiv
          {...(!isPerformanceMode && {
            initial: { opacity: 0, scale: 0.95 },
            animate: { opacity: 1, scale: 1 },
            transition: { duration: 0.4, delay: 0.4 }
          })}
          className="glass-card p-5"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, color-mix(in srgb, #18E3FF 18%, transparent) 0%, transparent 60%),
              radial-gradient(circle at 70% 80%, color-mix(in srgb, #06B6D4 15%, transparent) 0%, transparent 50%),
              rgba(255, 255, 255, 0.06)
            `,
            borderColor: 'color-mix(in srgb, #18E3FF 35%, transparent)',
            boxShadow: `
              0 8px 24px rgba(0, 0, 0, 0.2),
              0 0 24px color-mix(in srgb, #18E3FF 20%, transparent),
              inset 0 1px 0 rgba(255, 255, 255, 0.15)
            `,
            backdropFilter: 'blur(20px) saturate(150%)'
          }}
        >
          <div className="grid grid-cols-2 gap-6 text-center">
            <div className="space-y-2">
              <MotionDiv
                className="text-4xl font-bold"
                style={{ color: '#A78BFA', textShadow: '0 0 16px rgba(167, 139, 250, 0.5)' }}
                {...(!isPerformanceMode && {
                  animate: {
                    scale: [1, 1.05, 1]
                  },
                  transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                })}
              >
                {userEditedInventory.length}
              </MotionDiv>
              <div className="text-sm font-medium text-gray-300">Ingrédients détectés</div>
            </div>
            <div className="space-y-2">
              <MotionDiv
                className="text-4xl font-bold"
                style={{ color: '#18E3FF', textShadow: '0 0 16px rgba(24, 227, 255, 0.5)' }}
                {...(!isPerformanceMode && {
                  animate: {
                    scale: [1, 1.05, 1]
                  },
                  transition: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }
                })}
              >
                {suggestedComplementaryItems.length}
              </MotionDiv>
              <div className="text-sm font-medium text-gray-300">Suggestions disponibles</div>
            </div>
          </div>
        </MotionDiv>
      </MotionDiv>
    </div>
  );
};

export default ComplementStage;
