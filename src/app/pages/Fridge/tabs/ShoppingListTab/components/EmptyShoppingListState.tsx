import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';

import { useUserStore } from '../../../../../../system/store/userStore';
import { calculateRecipeWorkshopCompletion } from '../../../../../../system/profile/profileCompletionService';
import ProfileNudge from '../../../../../../ui/components/ProfileNudge';
import logger from '../../../../../../lib/utils/logger';

interface EmptyShoppingListStateProps {
  hasAvailableMealPlans: boolean;
  onGenerateFromPlan: () => void;
  onScanFridge: () => void;
}

/**
 * Empty state component for shopping list tab with orange theme
 */
const EmptyShoppingListState: React.FC<EmptyShoppingListStateProps> = ({ 
  onGenerate,
  hasAvailableMealPlans,
  onGenerateFromPlan,
  onScanFridge
}) => {
  const navigate = useNavigate();
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  
  const { profile } = useUserStore();

  // Calculate profile completion
  const profileCompletion = calculateRecipeWorkshopCompletion(profile);

  // Dynamic button configuration based on available meal plans
  const buttonConfig = hasAvailableMealPlans ? {
    text: "Forger une liste depuis un plan de repas",
    icon: ICONS.ShoppingCart,
    action: onGenerateFromPlan ? () => {
      logger.info('User initiated shopping list generation from meal plan');
      onGenerateFromPlan();
    } : () => {}
  } : {
    text: "Scanner mon frigo pour forger une liste",
    icon: ICONS.Scan,
    action: onScanFridge ? () => {
      logger.info('User initiated fridge scan for shopping list');
      onScanFridge();
    } : () => {}
  };

  const handleNavigateToProfile = () => {
    navigateWithScroll(navigate, '/profile', {
      tab: 'nutrition',
      smooth: true,
      delay: 150
    });
  };

  // Dynamic content based on meal plans availability
  const dynamicContent = hasAvailableMealPlans ? {
    title: "Forgez votre Liste de Courses",
    description: "Forgez une liste de courses optimisée à partir de vos plans de repas existants ou scannez votre frigo pour une approche personnalisée."
  } : {
    title: "Votre Atelier de Courses",
    description: "Commencez par scanner votre frigo pour forger des listes de courses intelligentes basées sur vos ingrédients actuels."
  };

  return (
    <GlassCard 
      className="w-full"
      style={{
        background: 'radial-gradient(circle at 20% 50%, rgba(251, 146, 60, 0.15) 0%, rgba(249, 115, 22, 0.1) 50%, rgba(234, 88, 12, 0.05) 100%)',
        borderColor: 'rgba(251, 146, 60, 0.2)',
        boxShadow: '0 8px 32px rgba(251, 146, 60, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="p-6 text-center">
        {/* Main Icon */}
        <div className="flex justify-center mb-6">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle, rgba(251, 146, 60, 0.2) 0%, rgba(249, 115, 22, 0.15) 100%)',
              border: '2px solid rgba(251, 146, 60, 0.3)',
              boxShadow: '0 8px 24px rgba(251, 146, 60, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            <SpatialIcon
              Icon={ICONS.ShoppingCart}
              size={48}
              style={{
                color: 'var(--color-plasma-orange)',
                filter: 'drop-shadow(0 2px 4px rgba(251, 146, 60, 0.3))'
              }}
            />
          </div>
        </div>

        {/* Title and Description */}
        <h2 className="text-2xl font-bold text-white mb-3">
          {dynamicContent.title}
        </h2>
        <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
          {dynamicContent.description}
        </p>

        {/* Three Summary Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          {/* Génération Intelligente */}
          <div className="text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{
                background: 'radial-gradient(circle, rgba(251, 146, 60, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%)',
                border: '1px solid rgba(251, 146, 60, 0.2)',
                boxShadow: '0 4px 16px rgba(251, 146, 60, 0.15)'
              }}
            >
              <SpatialIcon
                Icon={ICONS.Zap}
                size={32} 
                style={{
                  color: 'var(--color-plasma-orange)',
                  filter: 'drop-shadow(0 2px 4px rgba(251, 146, 60, 0.3))'
                }}
              />
            </div>
            <h4 className="text-white font-semibold mb-2">Forge des Courses</h4>
            <p className="text-white/70 text-sm">
              Mécanismes de la Forge pour des listes optimisées selon vos besoins nutritionnels.
            </p>
          </div>

          {/* Optimisation Budget */}
          <div className="text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{
                background: 'radial-gradient(circle, rgba(251, 146, 60, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%)',
                border: '1px solid rgba(251, 146, 60, 0.2)',
                boxShadow: '0 4px 16px rgba(251, 146, 60, 0.15)'
              }}
            >
              <SpatialIcon
                Icon={ICONS.Package}
                size={32} 
                style={{
                  color: 'var(--color-plasma-orange)',
                  filter: 'drop-shadow(0 2px 4px rgba(251, 146, 60, 0.3))'
                }}
              />
            </div>
            <h4 className="text-white font-semibold mb-2">Optimisation Budget</h4>
            <p className="text-white/70 text-sm">
              Suggestions d'alternatives économiques sans compromettre la qualité nutritionnelle.
            </p>
          </div>

          {/* Conseils Personnalisés */}
          <div className="text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{
                background: 'radial-gradient(circle, rgba(251, 146, 60, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%)',
                border: '1px solid rgba(251, 146, 60, 0.2)',
                boxShadow: '0 4px 16px rgba(251, 146, 60, 0.15)'
              }}
            >
              <SpatialIcon
                Icon={ICONS.Lightbulb}
                size={32} 
                style={{
                  color: 'var(--color-plasma-orange)',
                  filter: 'drop-shadow(0 2px 4px rgba(251, 146, 60, 0.3))'
                }}
              />
            </div>
            <h4 className="text-white font-semibold mb-2">Conseils Personnalisés</h4>
            <p className="text-white/70 text-sm">
              Recommandations adaptées à vos préférences alimentaires et contraintes.
            </p>
          </div>
        </div>

        {/* Dynamic CTA Button */}
        <div className="mb-8">
          <button
            onClick={buttonConfig.action}
            className="group relative px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.4) 0%, rgba(249, 115, 22, 0.35) 50%, rgba(234, 88, 12, 0.3) 100%)',
              border: '2px solid rgba(251, 146, 60, 0.4)',
              boxShadow: '0 12px 40px rgba(251, 146, 60, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
              color: '#FFFFFF',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)'
            }}
          >
            <div className="relative flex items-center justify-center gap-3">
              <SpatialIcon 
                Icon={buttonConfig.icon} 
                size={24} 
                style={{
                  color: '#FFFFFF',
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                }}
              />
              <span>{buttonConfig.text}</span>
            </div>
          </button>
        </div>

        {/* Profile Nudge - Only show if profile is not sufficient and not dismissed */}
        {profileCompletion && !profileCompletion.isSufficient && !nudgeDismissed && (
          <div className="mb-8">
            <ProfileNudge
              completion={profileCompletion}
              variant="banner"
              onDismiss={() => setNudgeDismissed(true)}
              showDismiss={true}
            />
          </div>
        )}

        {/* Tip Section */}
        <div 
          className="mt-8 p-4 rounded-lg"
          style={{
            background: 'rgba(251, 146, 60, 0.08)',
            border: '1px solid rgba(251, 146, 60, 0.15)'
          }}
        >
          <div className="flex items-start gap-3">
            <SpatialIcon 
              Icon={ICONS.Lightbulb} 
              size={20} 
              style={{
                color: 'var(--color-plasma-orange)',
                filter: 'drop-shadow(0 2px 4px rgba(251, 146, 60, 0.3))'
              }}
              className="flex-shrink-0 mt-0.5"
            />
            <div className="flex-1 text-left">
              <h4 className="text-white font-medium mb-1">Astuce TwinForge</h4>
              <p className="text-white/70 text-sm">
                {hasAvailableMealPlans 
                  ? "Utilisez vos plans de repas existants pour forger des listes de courses optimisées, ou scannez votre frigo pour une approche basée sur vos ingrédients actuels."
                  : "Commencez par scanner votre frigo pour identifier vos ingrédients disponibles et forger des listes de courses personnalisées."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default EmptyShoppingListState;