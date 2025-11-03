import React from 'react';
import { motion } from 'framer-motion';
import { usePerformanceMode } from '../../../../system/context/PerformanceModeContext';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';
import type { FridgeItem } from '../../../../domain/recipe';

interface InventoryItemProps {
  item: FridgeItem;
  index: number;
  isEditing: boolean;
  onEdit: (itemId: string, field: keyof FridgeItem, value: any) => void;
  onRemove: (itemId: string) => void;
  onStartEdit: (itemId: string) => void;
  onStopEdit: () => void;
}

const InventoryItem: React.FC<InventoryItemProps> = ({
  item,
  index,
  isEditing,
  onEdit,
  onRemove,
  onStartEdit,
  onStopEdit
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;
  const MotionButton = isPerformanceMode ? 'button' : motion.button;

  const getCategoryColor = (category: string): string => {
    const categoryColors: Record<string, string> = {
      'Légumes': '#22C55E',
      'Fruits': '#F59E0B',
      'Viandes': '#EF4444',
      'Poissons': '#06B6D4',
      'Produits laitiers': '#8B5CF6',
      'Céréales': '#D97706',
      'Épices': '#EC4899',
      'Autre': '#6B7280'
    };
    return categoryColors[category] || '#6B7280';
  };

  const categoryColor = getCategoryColor(item.category);

  return (
    <MotionDiv
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -20, scale: 0.95 },
        transition: {
          duration: 0.35,
          delay: index * 0.04,
          ease: [0.4, 0, 0.2, 1]
        }
      })}
      className="group"
    >
      <GlassCard
        className="p-4"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, ${categoryColor} 8%, transparent) 0%, transparent 60%),
            rgba(255, 255, 255, 0.06)
          `,
          borderColor: `color-mix(in srgb, ${categoryColor} 25%, transparent)`,
          boxShadow: `
            0 4px 16px rgba(0, 0, 0, 0.2),
            0 0 16px color-mix(in srgb, ${categoryColor} 15%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.12)
          `,
          backdropFilter: 'blur(20px) saturate(150%)',
          WebkitBackdropFilter: 'blur(20px) saturate(150%)',
          transition: isPerformanceMode ? 'none' : 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          if (!isPerformanceMode && window.matchMedia('(hover: hover)').matches) {
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)';
            e.currentTarget.style.boxShadow = `
              0 8px 24px rgba(0, 0, 0, 0.3),
              0 0 24px color-mix(in srgb, ${categoryColor} 25%, transparent),
              inset 0 1px 0 rgba(255, 255, 255, 0.18)
            `;
            e.currentTarget.style.borderColor = `color-mix(in srgb, ${categoryColor} 40%, transparent)`;
          }
        }}
        onMouseLeave={(e) => {
          if (!isPerformanceMode && window.matchMedia('(hover: hover)').matches) {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = `
              0 4px 16px rgba(0, 0, 0, 0.2),
              0 0 16px color-mix(in srgb, ${categoryColor} 15%, transparent),
              inset 0 1px 0 rgba(255, 255, 255, 0.12)
            `;
            e.currentTarget.style.borderColor = `color-mix(in srgb, ${categoryColor} 25%, transparent)`;
          }
        }}
      >
        <div className="flex items-center gap-4">
          {/* Icône de Catégorie */}
          <MotionDiv
            className="flex-shrink-0"
            {...(!isPerformanceMode && {
              whileHover: { scale: 1.1, rotate: 5 },
              transition: { type: 'spring', stiffness: 400, damping: 17 }
            })}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, ${categoryColor} 30%, transparent), color-mix(in srgb, ${categoryColor} 20%, transparent))
                `,
                border: `2px solid color-mix(in srgb, ${categoryColor} 50%, transparent)`,
                boxShadow: `
                  0 0 20px color-mix(in srgb, ${categoryColor} 30%, transparent),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2)
                `
              }}
            >
              <SpatialIcon
                Icon={ICONS.Utensils}
                size={22}
                style={{
                  color: categoryColor,
                  filter: `drop-shadow(0 0 8px ${categoryColor})`
                }}
              />
            </div>
          </MotionDiv>

          {/* Informations de l'Ingrédient */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => onEdit(item.id, 'name', e.target.value)}
                  className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 py-2.5 text-white text-base font-medium outline-none focus:border-pink-400/50 focus:bg-white/15 transition-all"
                  placeholder="Nom de l'ingrédient"
                  autoFocus
                  style={{ backdropFilter: 'blur(12px)' }}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={item.quantity}
                    onChange={(e) => onEdit(item.id, 'quantity', e.target.value)}
                    className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 py-2.5 text-white text-sm font-medium outline-none focus:border-pink-400/50 focus:bg-white/15 transition-all"
                    placeholder="Quantité"
                    style={{ backdropFilter: 'blur(12px)' }}
                  />
                  <select
                    value={item.category}
                    onChange={(e) => onEdit(item.id, 'category', e.target.value)}
                    className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 py-2.5 text-white text-sm font-medium outline-none focus:border-pink-400/50 focus:bg-white/15 transition-all"
                    style={{ backdropFilter: 'blur(12px)' }}
                  >
                    <option value="Légumes">Légumes</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Viandes">Viandes</option>
                    <option value="Poissons">Poissons</option>
                    <option value="Produits laitiers">Produits laitiers</option>
                    <option value="Céréales">Céréales</option>
                    <option value="Épices">Épices</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <h4 className="text-white font-bold text-lg truncate"
                    style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                  {item.name}
                </h4>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-white/80 text-sm font-medium">
                    {item.quantity}
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: `color-mix(in srgb, ${categoryColor} 18%, transparent)`,
                      color: categoryColor,
                      border: `1.5px solid color-mix(in srgb, ${categoryColor} 35%, transparent)`,
                      boxShadow: `0 0 12px color-mix(in srgb, ${categoryColor} 20%, transparent)`
                    }}
                  >
                    {item.category}
                  </span>
                  {item.confidence < 0.7 && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-400/30 text-orange-300 text-xs font-medium">
                      <SpatialIcon Icon={ICONS.AlertTriangle} size={12} />
                      Incertain
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-2">
            {isEditing ? (
              <MotionButton
                onClick={onStopEdit}
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(34, 197, 94, 0.15))',
                  border: '2px solid rgba(34, 197, 94, 0.4)',
                  boxShadow: '0 0 16px rgba(34, 197, 94, 0.3)',
                  backdropFilter: 'blur(12px)'
                }}
                {...(!isPerformanceMode && {
                  whileHover: { scale: 1.1 },
                  whileTap: { scale: 0.95 }
                })}
                aria-label="Valider"
              >
                <SpatialIcon Icon={ICONS.Check} size={18} className="text-green-400" />
              </MotionButton>
            ) : (
              <>
                <MotionButton
                  onClick={() => onStartEdit(item.id)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '2px solid rgba(255, 255, 255, 0.18)',
                    backdropFilter: 'blur(12px)'
                  }}
                  {...(!isPerformanceMode && {
                    whileHover: {
                      scale: 1.08,
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    },
                    whileTap: { scale: 0.95 }
                  })}
                  aria-label="Modifier"
                >
                  <SpatialIcon Icon={ICONS.Edit} size={16} className="text-white/90" />
                </MotionButton>
                <MotionButton
                  onClick={() => onRemove(item.id)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '2px solid rgba(239, 68, 68, 0.3)',
                    backdropFilter: 'blur(12px)'
                  }}
                  {...(!isPerformanceMode && {
                    whileHover: {
                      scale: 1.08,
                      backgroundColor: 'rgba(239, 68, 68, 0.25)',
                      borderColor: 'rgba(239, 68, 68, 0.5)',
                      boxShadow: '0 0 16px rgba(239, 68, 68, 0.4)'
                    },
                    whileTap: { scale: 0.95 }
                  })}
                  aria-label="Supprimer"
                >
                  <SpatialIcon Icon={ICONS.Trash2} size={16} className="text-red-400" />
                </MotionButton>
              </>
            )}
          </div>
        </div>
      </GlassCard>
    </MotionDiv>
  );
};

export default InventoryItem;
