/**
 * Profile Identity Components
 * Reusable UI components for profile identity forms
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';
import { useFeedback } from '../../../../hooks/useFeedback';
import { calculateBMI, calculateWeightDifference, getBMICategory, calculateBMIValue } from '../utils/profileCalculations';

/**
 * Enhanced Progress Bar Component - VisionOS 26 Style
 */
export const ProgressBar: React.FC<{ 
  percentage: number; 
  title: string; 
  subtitle?: string;
  color?: string;
}> = ({ percentage, title, subtitle, color = '#60A5FA' }) => {
  return (
    <GlassCard className="p-6 mb-6" style={{
      background: `
        radial-gradient(circle at 30% 20%, color-mix(in srgb, ${color} 8%, transparent) 0%, transparent 60%),
        var(--glass-opacity)
      `,
      borderColor: `color-mix(in srgb, ${color} 20%, transparent)`
    }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-xl mb-1 flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, ${color} 35%, transparent), color-mix(in srgb, ${color} 25%, transparent))
                `,
                border: `2px solid color-mix(in srgb, ${color} 50%, transparent)`,
                boxShadow: `0 0 20px color-mix(in srgb, ${color} 30%, transparent)`
              }}
            >
            <SpatialIcon Icon={ICONS.User} size={20} style={{ color }} variant="pure" />
            </div>
            <div>
              <div className="text-xl">{title}</div>
              {subtitle && (
                <div className="text-white/60 text-sm font-normal mt-0.5">{subtitle}</div>
              )}
            </div>
          </h3>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ 
                background: color,
                boxShadow: `0 0 8px ${color}60`
              }} 
            />
            <span className="text-white font-bold text-lg">
              {percentage}%
            </span>
          </div>
          <span className="text-white/60 text-xs">Complété</span>
        </div>
      </div>
      
      <div className="relative">
        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-3 rounded-full relative overflow-hidden"
            style={{ 
              background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 80%, white))`,
              boxShadow: `0 0 12px ${color}60, inset 0 1px 0 rgba(255,255,255,0.3)`
            }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `linear-gradient(90deg, 
                  transparent 0%, 
                  rgba(255,255,255,0.4) 50%, 
                  transparent 100%
                )`,
                animation: 'progressShimmer 2s ease-in-out infinite'
              }}
            />
          </motion.div>
        </div>
        
        <div className="flex justify-between mt-2 text-xs text-white/50">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>
    </GlassCard>
  );
};

/**
 * Section Save Button Component
 */
export const SectionSaveButton: React.FC<{
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  sectionName: string;
}> = ({ isDirty, isSaving, onSave, sectionName }) => {
  const { formSubmit } = useFeedback();
  
  if (!isDirty) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex justify-end mt-4"
    >
      <button
        type="button"
        onClick={() => {
          formSubmit();
          onSave();
        }}
        disabled={isSaving}
        className="btn-glass px-4 py-2 text-sm"
      >
        <div className="flex items-center gap-2">
          {isSaving ? (
            <SpatialIcon Icon={ICONS.Loader2} size={14} className="animate-spin" />
          ) : (
            <SpatialIcon Icon={ICONS.Save} size={14} />
          )}
          <span>{isSaving ? 'Sauvegarde...' : `Sauvegarder ${sectionName}`}</span>
        </div>
      </button>
    </motion.div>
  );
};

/**
 * BMI Calculator Card Component
 */
export const BMICalculatorCard: React.FC<{
  height: number | undefined;
  weight: number | undefined;
  targetWeight: number | undefined;
}> = ({ height, weight, targetWeight }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlassCard className="p-6" style={{
        background: `
          radial-gradient(circle at 30% 20%, rgba(52, 211, 153, 0.08) 0%, transparent 60%),
          var(--glass-opacity)
        `,
        borderColor: 'rgba(52, 211, 153, 0.2)'
      }}>
        <h3 className="text-white font-semibold text-xl mb-6 flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, #10B981 35%, transparent), color-mix(in srgb, #10B981 25%, transparent))
              `,
              border: '2px solid color-mix(in srgb, #10B981 50%, transparent)',
              boxShadow: '0 0 20px color-mix(in srgb, #10B981 30%, transparent)'
            }}
          >
            <SpatialIcon Icon={ICONS.Activity} size={20} style={{ color: '#10B981' }} variant="pure" />
          </div>
          <div>
            <div className="text-xl">Calculs Automatiques</div>
            <div className="text-white/60 text-sm font-normal mt-0.5">Métriques calculées en temps réel</div>
          </div>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* BMI */}
          <div className="text-center p-6 rounded-xl bg-emerald-500/10 border border-emerald-400/20">
            <div className="text-3xl font-bold text-emerald-400 mb-2">
              {calculateBMI(weight, height)}
            </div>
            <div className="text-emerald-300 text-sm font-medium">Indice de Masse Corporelle</div>
          </div>

          {/* BMI Category */}
          <div className="text-center p-6 rounded-xl bg-blue-500/10 border border-blue-400/20">
            <div className="text-xl font-bold text-blue-400 mb-2">
              {getBMICategory(calculateBMIValue(weight, height))}
            </div>
            <div className="text-blue-300 text-sm font-medium">Catégorie</div>
          </div>

          {/* Weight Difference */}
          <div className="text-center p-6 rounded-xl bg-purple-500/10 border border-purple-400/20">
            <div className="text-xl font-bold text-purple-400 mb-2">
              {calculateWeightDifference(targetWeight, weight)}
            </div>
            <div className="text-purple-300 text-sm font-medium">Objectif</div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};