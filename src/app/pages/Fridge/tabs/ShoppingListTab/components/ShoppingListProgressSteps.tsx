import React from 'react';
import GlassCard from '../../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';
import { LOADING_STEPS } from './shoppingListConstants';
import { cssSupports } from './shoppingListUtils';

export interface ShoppingListProgressStepsProps {
  simulatedProgressPercentage: number;
}

/**
 * Shopping List Progress Steps Component
 */
const ShoppingListProgressSteps: React.FC<ShoppingListProgressStepsProps> = ({ simulatedProgressPercentage }) => {
  return (
    <GlassCard 
      className="border-white/20"
      style={{
        background: `
          linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 50%, rgba(255, 255, 255, 0.03) 100%)
        `,
        backdropFilter: 'blur(20px) saturate(180%)',
        border: `1px solid ${cssSupports('color', 'color-mix(in srgb, white 25%, transparent)', 'rgba(255, 255, 255, 0.25)')}`,
        boxShadow: `
          0 12px 40px rgba(0, 0, 0, 0.5),
          0 6px 20px rgba(255, 255, 255, 0.15),
          0 2px 8px rgba(255, 255, 255, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          inset 0 -1px 0 rgba(0, 0, 0, 0.3)
        `
      }}
    >
      <div className="p-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-white/10 blur-sm"></div>
            <div 
              className="relative p-2 rounded-full"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: `
                  0 2px 8px rgba(0, 0, 0, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2)
                `
              }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent blur-sm"></div>
              <SpatialIcon Icon={ICONS.Clock} className="relative w-5 h-5 text-white/70 drop-shadow-lg" />
            </div>
          </div>
          <span className="text-white/80 text-sm font-medium">Étapes de génération TwinForge</span>
        </div>
        
        <div className="space-y-3">
          {LOADING_STEPS.map((item, index) => {
            const stepProgress = (item.step / LOADING_STEPS.length) * 100;
            const currentStepIndex = Math.floor((simulatedProgressPercentage / 100) * LOADING_STEPS.length);
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            
            return (
              <div key={item.step} className="flex items-center gap-3">
                <div className="relative">
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400/40 to-orange-600/20 blur-md"></div>
                  )}
                  <div 
                    className="relative w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-500"
                    style={
                      isCompleted
                        ? {
                            background: `
                              radial-gradient(circle at 30% 30%, rgba(251, 146, 60, 0.5) 0%, rgba(249, 115, 22, 0.3) 40%, rgba(234, 88, 12, 0.15) 100%)
                            `,
                            border: `1px solid ${cssSupports('color', 'color-mix(in srgb, #fb923c 60%, transparent)', 'rgba(251, 146, 60, 0.6)')}`,
                            color: 'rgba(251, 146, 60, 0.9)',
                            boxShadow: `
                              0 2px 8px rgba(0, 0, 0, 0.3),
                              0 1px 4px rgba(251, 146, 60, 0.4),
                              inset 0 1px 0 rgba(255, 255, 255, 0.15)
                            `
                          }
                        : isActive
                        ? {
                            background: `
                              radial-gradient(circle at 30% 30%, rgba(251, 146, 60, 0.3) 0%, rgba(249, 115, 22, 0.2) 40%, rgba(234, 88, 12, 0.1) 100%)
                            `,
                            border: `1px solid ${cssSupports('color', 'color-mix(in srgb, #fb923c 40%, transparent)', 'rgba(251, 146, 60, 0.4)')}`,
                            color: 'rgba(251, 146, 60, 0.8)',
                            boxShadow: `
                              0 2px 8px rgba(0, 0, 0, 0.2),
                              inset 0 1px 0 rgba(255, 255, 255, 0.1)
                            `
                          }
                        : {
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'rgba(255, 255, 255, 0.5)'
                          }
                    }
                  >
                    {isActive && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-300/20 to-transparent blur-sm"></div>
                    )}
                    {isCompleted ? (
                      <SpatialIcon Icon={ICONS.Check} size={20} className="relative drop-shadow-lg" />
                    ) : (
                      <SpatialIcon Icon={ICONS[item.icon as keyof typeof ICONS]} size={20} className="relative drop-shadow-lg" />
                    )}
                  </div>
                </div>
                <span className={`text-base ${
                  isActive
                    ? 'text-white font-medium'
                    : 'text-white/50'
                }`}>
                  {item.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
};

export default ShoppingListProgressSteps;