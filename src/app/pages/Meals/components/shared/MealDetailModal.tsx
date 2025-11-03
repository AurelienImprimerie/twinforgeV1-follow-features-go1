import React, { useState } from 'react';
import { format } from 'date-fns';
import { useToast } from '@/ui/components/ToastProvider';
import { useFeedback } from '@/hooks/useFeedback';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import logger from '@/lib/utils/logger';
import Portal from '@/ui/components/Portal';

interface MealDetailModalProps {
  meal: any;
  onClose: () => void;
  onDelete: (mealId: string) => void;
}

/**
 * Modal de Détail d'un Repas avec option de suppression
 * Composant partagé entre DailyRecapTab et MealHistoryTab
 */
const MealDetailModal: React.FC<MealDetailModalProps> = ({ meal, onClose, onDelete }) => {
  const { click, error: errorSound } = useFeedback();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Debug modal lifecycle
  React.useEffect(() => {
    console.log(`🔍 MODAL_DEBUG [SHARED_MODAL_MOUNTED]`, {
      mealId: meal?.id,
      mealType: meal?.meal_type,
      timestamp: new Date().toISOString()
    });
    return () => {
      console.log(`🔍 MODAL_DEBUG [SHARED_MODAL_UNMOUNTED]`, {
        mealId: meal?.id,
        timestamp: new Date().toISOString()
      });
    };
  }, [meal?.id]);

  const handleDelete = React.useCallback(async () => {
    if (isDeleting) return;
    
    console.log(`🔍 MODAL_DEBUG [SHARED_DELETE_STARTED]`, { mealId: meal?.id });
    setIsDeleting(true);
    try {
      await onDelete(meal.id);
      console.log(`🔍 MODAL_DEBUG [SHARED_DELETE_SUCCESS]`, { mealId: meal?.id });
      onClose();
    } catch (error) {
      errorSound();
      console.log(`🔍 MODAL_DEBUG [SHARED_DELETE_ERROR]`, { 
        mealId: meal?.id, 
        error: error instanceof Error ? error.message : 'Unknown' 
      });
      logger.error('MEAL_DELETE', 'Failed to delete meal', {
        mealId: meal.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsDeleting(false);
    }
  }, [meal?.id, onDelete, onClose, isDeleting, errorSound]);
  
  const handleClose = React.useCallback(() => {
    console.log(`🔍 MODAL_DEBUG [SHARED_CLOSE_TRIGGERED]`, { mealId: meal?.id });
    click();
    onClose();
  }, [meal?.id, onClose, click]);

  return (
    <Portal>
      <div 
        className="modal-backdrop-enter" 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '1rem',
          paddingTop: '1.5rem',
          overflow: 'hidden',
          isolation: 'isolate',
          contain: 'layout style paint'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            console.log(`🔍 MODAL_DEBUG [SHARED_BACKDROP_CLICK]`, { mealId: meal?.id });
            handleClose();
          }
        }}
      >
        <div
          className="modal-content-enter"
          onClick={(e) => {
            e.stopPropagation(); // Prevent backdrop click when clicking on modal content
          }}
          style={{
            width: '100%',
            maxWidth: '48rem',
            margin: '0 auto'
          }}
        >
          <GlassCard
            className="relative w-full"
            style={{
              background: `
                radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.12) 0%, transparent 60%),
                radial-gradient(circle at 70% 80%, rgba(34, 197, 94, 0.08) 0%, transparent 50%),
                var(--glass-opacity)
              `,
              borderColor: 'rgba(16, 185, 129, 0.3)',
              boxShadow: `
                0 16px 48px rgba(0, 0, 0, 0.4),
                0 0 40px rgba(16, 185, 129, 0.2),
                inset 0 2px 0 rgba(255, 255, 255, 0.15)
              `,
              backdropFilter: 'blur(24px) saturate(160%)',
              overflow: 'hidden',
              maxHeight: 'inherit'
            }}
          >
          {/* Boutons d'action - Repositionnés en haut */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
            {/* Bouton Supprimer */}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-3 rounded-full transition-all duration-200"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                backdropFilter: 'blur(8px) saturate(120%)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              }}
              title="Supprimer ce repas"
            >
              {isDeleting ? (
                <SpatialIcon Icon={ICONS.Loader2} size={18} className="text-red-400 animate-spin" />
              ) : (
                <SpatialIcon Icon={ICONS.Trash2} size={18} className="text-red-400" />
              )}
            </button>
            
            {/* Bouton Fermer */}
            <button
              onClick={handleClose}
              className="p-3 rounded-full transition-all duration-200"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px) saturate(120%)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              }}
            >
              <SpatialIcon Icon={ICONS.X} size={18} className="text-white/80" />
            </button>
          </div>

          {/* Scrollable content container */}
          <div 
            className="overflow-y-auto p-6" 
            style={{ 
              maxHeight: 'min(80vh, calc(100vh - 6rem))',
              scrollbarWidth: 'thin', 
              scrollbarColor: 'rgba(255,255,255,0.2) transparent',
              overflowX: 'visible'
            }}
          >
            {/* Photo du repas */}
            {meal.photo_url && (
              <div className="mb-6">
                <div className="aspect-[4/3] rounded-xl overflow-hidden relative">
                  <img
                    src={meal.photo_url}
                    alt="Photo du repas"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.warn('MEAL_MODAL', 'Image failed to load', {
                        photoUrl: meal.photo_url,
                        mealId: meal.id,
                        isBlob: meal.photo_url.startsWith('blob:'),
                        timestamp: new Date().toISOString()
                      });
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('MEAL_MODAL', 'Image loaded successfully', {
                        photoUrl: meal.photo_url,
                        mealId: meal.id,
                        timestamp: new Date().toISOString()
                      });
                    }}
                    style={{
                      border: '2px solid color-mix(in srgb, var(--nutrition-primary) 30%, transparent)'
                    }}
                  />
                  
                  {/* Overlay décoratif */}
                  <div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{
                      background: `
                        linear-gradient(135deg, 
                          color-mix(in srgb, var(--nutrition-primary) 4%, transparent) 0%, 
                          transparent 30%, 
                          color-mix(in srgb, var(--brand-accent) 3%, transparent) 70%, 
                          transparent 100%
                        )
                      `,
                      mixBlendMode: 'overlay'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: `
                      radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
                      linear-gradient(135deg, color-mix(in srgb, var(--nutrition-primary) 30%, transparent), color-mix(in srgb, var(--nutrition-primary) 20%, transparent))
                    `,
                    border: '2px solid color-mix(in srgb, var(--nutrition-primary) 40%, transparent)',
                    boxShadow: '0 0 20px color-mix(in srgb, var(--nutrition-primary) 30%, transparent)'
                  }}
                >
                  <SpatialIcon Icon={ICONS.Utensils} size={20} style={{ color: 'var(--nutrition-primary)' }} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Analyse Nutritionnelle</h3>
                  <p className="text-green-200 text-sm">
                    {meal.meal_name || (meal.meal_type ? 
                      meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1) : 
                      'Repas'
                    )}
                  </p>
                  <p className="text-green-300/70 text-xs mt-1">
                    {meal.meal_type ? 
                      meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1) : 
                      'Repas'
                    } • {format(new Date(meal.timestamp), 'dd/MM/yyyy à HH:mm')}
                  </p>
                </div>
              </div>
            </div>

            {/* Contenu du repas */}
            <div className="space-y-6">
              {/* Calories totales */}
              <div 
                className="text-center p-6 rounded-xl"
                style={{
                  background: `
                    radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--nutrition-primary) 12%, transparent) 0%, transparent 60%),
                    rgba(255, 255, 255, 0.05)
                  `,
                  border: '1px solid color-mix(in srgb, var(--nutrition-primary) 25%, transparent)',
                  backdropFilter: 'blur(12px) saturate(130%)',
                  boxShadow: '0 0 20px color-mix(in srgb, var(--nutrition-primary) 15%, transparent)'
                }}
              >
                <div className="text-5xl font-bold mb-3" style={{ color: 'var(--nutrition-primary)' }}>
                  {meal.total_kcal || 0}
                </div>
                <div className="text-green-300 font-medium">Énergie Totale Forgée</div>
                <div className="text-white/50 text-sm mt-1">Kilocalories analysées</div>
              </div>

              {/* Aliments détectés */}
              {meal.items && meal.items.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background: `
                          radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
                          linear-gradient(135deg, color-mix(in srgb, #06B6D4 30%, transparent), color-mix(in srgb, #06B6D4 20%, transparent))
                        `,
                        border: '2px solid color-mix(in srgb, #06B6D4 40%, transparent)',
                        boxShadow: '0 0 20px color-mix(in srgb, #06B6D4 30%, transparent)'
                      }}
                    >
                      <SpatialIcon Icon={ICONS.Eye} size={18} className="text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-xl">Aliments Détectés</h4>
                      <p className="text-cyan-200 text-sm">Aliments identifiés automatiquement</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {meal.items.map((item: any, index: number) => (
                      <div 
                        key={index}
                        className="p-5 rounded-xl"
                        style={{
                          background: `color-mix(in srgb, var(--nutrition-primary) 4%, transparent)`,
                          border: '1px solid color-mix(in srgb, var(--nutrition-primary) 12%, transparent)',
                          backdropFilter: 'blur(8px) saturate(120%)'
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-semibold text-lg">{item.name || `Aliment ${index + 1}`}</span>
                          <span className="text-green-400 font-bold text-lg">{item.calories || 0} kcal</span>
                        </div>
                        
                        {(item.proteins || item.carbs || item.fats) && (
                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <div className="flex items-center gap-1">
                              <SpatialIcon Icon={ICONS.Activity} size={10} style={{ color: 'var(--nutrition-proteins)' }} />
                              <span style={{ color: 'var(--nutrition-proteins)' }}>P: {Math.round(item.proteins || 0)}g</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <SpatialIcon Icon={ICONS.Zap} size={10} style={{ color: 'var(--nutrition-carbs)' }} />
                              <span style={{ color: 'var(--nutrition-carbs)' }}>G: {Math.round(item.carbs || 0)}g</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <SpatialIcon Icon={ICONS.Heart} size={10} style={{ color: 'var(--nutrition-fats)' }} />
                              <span style={{ color: 'var(--nutrition-fats)' }}>L: {Math.round(item.fats || 0)}g</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
    </Portal>
  );
};

export default MealDetailModal;