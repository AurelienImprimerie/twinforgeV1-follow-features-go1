import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import GlassCard from '../../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';
import { useFeedback } from '../../../../../../hooks/useFeedback';
import type { Recipe } from '../../../../../../domain/recipe';
import React from 'react';

interface RecipeDetailModalProps {
  recipe: Recipe;
  onClose: () => void;
  onToggleSave?: (recipe: Recipe) => void;
  isSaved?: boolean;
}

/**
 * Recipe Detail Modal - Modal de Détail de Recette
 * Affiche les détails complets d'une recette avec possibilité de sauvegarder/supprimer
 * Basé sur le modal ActivityDetailModal pour une cohérence visuelle et fonctionnelle
 */
const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  onClose,
  onToggleSave,
  isSaved = false
}) => {
  const { click } = useFeedback();

  // Debug: Log recipe data structure
  React.useEffect(() => {
    console.log('📋 RecipeDetailModal opened with recipe:', {
      id: recipe.id,
      title: recipe.title,
      hasImage: !!recipe.imageUrl,
      instructionsCount: recipe.instructions?.length || 0,
      firstInstruction: recipe.instructions?.[0],
      nutritionalInfo: recipe.nutritionalInfo,
      ingredientsCount: recipe.ingredients?.length || 0
    });
  }, [recipe]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      click();
      onClose();
    }
  };

  const handleToggleSave = () => {
    if (onToggleSave) {
      click();
      onToggleSave(recipe);
    }
  };

  // Couleur thématique pour les recettes (vert émeraude)
  const recipeColor = '#10B981';

  // Lock body scroll when modal is open
  React.useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, []);

  // Handle ESC key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        click();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [click, onClose]);

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-detail-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full max-w-4xl"
          style={{
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <GlassCard
            className="p-6"
            style={{
              background: `
                radial-gradient(circle at 30% 20%, color-mix(in srgb, ${recipeColor} 12%, transparent) 0%, transparent 60%),
                radial-gradient(circle at 70% 80%, color-mix(in srgb, ${recipeColor} 8%, transparent) 0%, transparent 50%),
                linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.10)),
                rgba(11, 14, 23, 0.95)
              `,
              borderColor: `color-mix(in srgb, ${recipeColor} 30%, transparent)`,
              boxShadow: `
                0 25px 80px rgba(0, 0, 0, 0.6),
                0 0 60px color-mix(in srgb, ${recipeColor} 30%, transparent),
                inset 0 3px 0 rgba(255, 255, 255, 0.3),
                inset 0 -3px 0 rgba(0, 0, 0, 0.2)
              `,
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)'
            }}
          >
            {/* Close Button - Positioned absolutely */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full transition-all duration-200"
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)'
              }}
              aria-label="Fermer le détail"
            >
              <SpatialIcon Icon={ICONS.X} size={18} className="text-white" />
            </button>

            {/* Image de la recette en pleine largeur */}
            {recipe.imageUrl ? (
              <div
                className="w-full h-64 rounded-2xl overflow-hidden mb-6"
                style={{
                  border: `3px solid color-mix(in srgb, ${recipeColor} 60%, transparent)`,
                  boxShadow: `0 0 40px color-mix(in srgb, ${recipeColor} 50%, transparent)`
                }}
              >
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                className="w-full h-64 rounded-2xl mb-6 flex items-center justify-center"
                style={{
                  border: `2px dashed color-mix(in srgb, ${recipeColor} 40%, transparent)`,
                  background: `linear-gradient(135deg,
                    color-mix(in srgb, ${recipeColor} 8%, transparent),
                    color-mix(in srgb, ${recipeColor} 4%, transparent)
                  )`
                }}
              >
                <div className="text-center">
                  <SpatialIcon Icon={ICONS.Image} size={48} className="text-white/40 mx-auto mb-3" />
                  <p className="text-white/60 text-sm">Image en cours de génération...</p>
                </div>
              </div>
            )}

            {/* Header - Titre et description */}
            <div className="mb-6">
              <h2
                id="recipe-detail-title"
                className="text-3xl font-bold text-white mb-3"
              >
                {recipe.title}
              </h2>
              {recipe.description && (
                <p className="text-white/70 text-base leading-relaxed">
                  {recipe.description}
                </p>
              )}
            </div>

            {/* Métriques Principales */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 rounded-xl" style={{
                background: `color-mix(in srgb, ${recipeColor} 10%, transparent)`,
                border: `1px solid color-mix(in srgb, ${recipeColor} 20%, transparent)`
              }}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <SpatialIcon Icon={ICONS.Clock} size={16} style={{ color: '#3B82F6' }} />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {recipe.prepTimeMin || 0}
                </div>
                <div className="text-white/70 text-sm">Préparation (min)</div>
              </div>

              <div className="text-center p-4 rounded-xl" style={{
                background: `color-mix(in srgb, ${recipeColor} 10%, transparent)`,
                border: `1px solid color-mix(in srgb, ${recipeColor} 20%, transparent)`
              }}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <SpatialIcon Icon={ICONS.Flame} size={16} style={{ color: '#F59E0B' }} />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {recipe.cookTimeMin || 0}
                </div>
                <div className="text-white/70 text-sm">Cuisson (min)</div>
              </div>

              <div className="text-center p-4 rounded-xl" style={{
                background: `color-mix(in srgb, ${recipeColor} 10%, transparent)`,
                border: `1px solid color-mix(in srgb, ${recipeColor} 20%, transparent)`
              }}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <SpatialIcon Icon={ICONS.Users} size={16} style={{ color: '#8B5CF6' }} />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {recipe.servings || 1}
                </div>
                <div className="text-white/70 text-sm">Portions</div>
              </div>
            </div>

            {/* Ingrédients */}
            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div className="mb-6 p-4 rounded-xl" style={{
                background: `color-mix(in srgb, ${recipeColor} 6%, transparent)`,
                border: `1px solid color-mix(in srgb, ${recipeColor} 15%, transparent)`
              }}>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-lg">
                  <SpatialIcon Icon={ICONS.ShoppingCart} size={18} style={{ color: recipeColor }} />
                  Ingrédients
                </h4>
                <div className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-1 font-bold">•</span>
                      <span className="text-white/80 text-sm">
                        {ingredient?.quantity && `${ingredient.quantity} `}
                        {ingredient?.unit && `${ingredient.unit} `}
                        {ingredient?.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            {recipe.instructions && recipe.instructions.length > 0 && (
              <div className="mb-6 p-4 rounded-xl" style={{
                background: `color-mix(in srgb, ${recipeColor} 6%, transparent)`,
                border: `1px solid color-mix(in srgb, ${recipeColor} 15%, transparent)`
              }}>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-lg">
                  <SpatialIcon Icon={ICONS.FileText} size={18} style={{ color: recipeColor }} />
                  Instructions
                </h4>
                <div className="space-y-4">
                  {recipe.instructions.map((instruction, index) => {
                    // Handle both string[] and RecipeInstruction[] formats
                    const stepNumber = typeof instruction === 'object' ? instruction?.step : index + 1;
                    const instructionText = typeof instruction === 'string'
                      ? instruction
                      : instruction?.instruction || '';
                    const timeMin = typeof instruction === 'object' ? instruction?.timeMin : undefined;

                    return (
                      <div key={stepNumber || index} className="flex gap-4">
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                          style={{
                            background: `color-mix(in srgb, ${recipeColor} 20%, transparent)`,
                            border: `2px solid color-mix(in srgb, ${recipeColor} 40%, transparent)`
                          }}
                        >
                          <span className="text-emerald-400 font-bold text-sm">
                            {stepNumber}
                          </span>
                        </div>
                        <div className="flex-1">
                          {instructionText && (
                            <p className="text-white/80 text-sm leading-relaxed">
                              {instructionText}
                            </p>
                          )}
                          {timeMin && (
                            <p className="text-white/50 text-xs mt-1">
                              ⏱️ {timeMin} min
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Informations Nutritionnelles */}
            {recipe.nutritionalInfo && (
              <div className="mb-6 p-4 rounded-xl" style={{
                background: `color-mix(in srgb, ${recipeColor} 6%, transparent)`,
                border: `1px solid color-mix(in srgb, ${recipeColor} 15%, transparent)`
              }}>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-lg">
                  <SpatialIcon Icon={ICONS.Activity} size={18} style={{ color: recipeColor }} />
                  Informations Nutritionnelles
                </h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">
                      {recipe.nutritionalInfo.calories || (recipe.nutritionalInfo as any).kcal || 0}
                    </div>
                    <div className="text-white/70 text-xs">Calories (kcal)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">
                      {Math.round(recipe.nutritionalInfo.protein || 0)}
                    </div>
                    <div className="text-white/70 text-xs">Protéines (g)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">
                      {Math.round(recipe.nutritionalInfo.carbs || 0)}
                    </div>
                    <div className="text-white/70 text-xs">Glucides (g)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">
                      {Math.round(recipe.nutritionalInfo.fat || 0)}
                    </div>
                    <div className="text-white/70 text-xs">Lipides (g)</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tags Diététiques */}
            {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {recipe.dietaryTags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs rounded-full font-medium"
                      style={{
                        background: `color-mix(in srgb, ${recipeColor} 15%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${recipeColor} 30%, transparent)`,
                        color: '#A7F3D0'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Informations Techniques */}
            <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <SpatialIcon Icon={ICONS.Info} size={14} className="text-white/70" />
                Informations Techniques
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/60">ID :</span>
                  <div className="text-white/80 font-mono text-xs mt-1">
                    {recipe.id.substring(0, 8)}...
                  </div>
                </div>
                {recipe.createdAt && (
                  <div>
                    <span className="text-white/60">Créée le :</span>
                    <div className="text-white/80 text-xs mt-1">
                      {format(new Date(recipe.createdAt), 'dd/MM/yyyy HH:mm')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {onToggleSave && (
                <button
                  onClick={handleToggleSave}
                  className="flex-1 px-4 py-3 rounded-full font-semibold"
                  style={{
                    background: isSaved
                      ? `linear-gradient(135deg,
                          color-mix(in srgb, #EF4444 80%, transparent),
                          color-mix(in srgb, #F59E0B 60%, transparent)
                        )`
                      : `linear-gradient(135deg,
                          color-mix(in srgb, ${recipeColor} 80%, transparent),
                          color-mix(in srgb, #22C55E 60%, transparent)
                        )`,
                    border: isSaved
                      ? '2px solid color-mix(in srgb, #EF4444 60%, transparent)'
                      : `2px solid color-mix(in srgb, ${recipeColor} 60%, transparent)`,
                    boxShadow: isSaved
                      ? `
                          0 12px 40px color-mix(in srgb, #EF4444 40%, transparent),
                          0 0 60px color-mix(in srgb, #EF4444 30%, transparent),
                          inset 0 3px 0 rgba(255,255,255,0.4)
                        `
                      : `
                          0 12px 40px color-mix(in srgb, ${recipeColor} 40%, transparent),
                          0 0 60px color-mix(in srgb, ${recipeColor} 30%, transparent),
                          inset 0 3px 0 rgba(255,255,255,0.4)
                        `,
                    backdropFilter: 'blur(20px) saturate(160%)',
                    color: '#fff'
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <SpatialIcon
                      Icon={isSaved ? ICONS.Trash2 : ICONS.Bookmark}
                      size={16}
                      className="text-white"
                    />
                    <span>{isSaved ? 'Retirer de la bibliothèque' : 'Sauvegarder'}</span>
                  </div>
                </button>
              )}

              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-full font-semibold"
                style={{
                  background: `linear-gradient(135deg,
                    color-mix(in srgb, #6B7280 80%, transparent),
                    color-mix(in srgb, #9CA3AF 60%, transparent)
                  )`,
                  border: '2px solid color-mix(in srgb, #6B7280 60%, transparent)',
                  boxShadow: `
                    0 8px 32px color-mix(in srgb, #6B7280 30%, transparent),
                    inset 0 2px 0 rgba(255,255,255,0.3)
                  `,
                  backdropFilter: 'blur(16px) saturate(140%)',
                  color: '#fff'
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <SpatialIcon Icon={ICONS.X} size={16} className="text-white" />
                  <span>Fermer</span>
                </div>
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default RecipeDetailModal;
