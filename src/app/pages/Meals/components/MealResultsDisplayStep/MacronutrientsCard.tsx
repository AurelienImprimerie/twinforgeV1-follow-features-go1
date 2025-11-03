import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';

interface MacronutrientsCardProps {
  analysisResults: any;
  celebrationActive: boolean;
}

/**
 * Macronutrients Card - Affichage des 3 Macronutriments (sans calories)
 * Protéines, Glucides, Lipides uniquement
 */
const MacronutrientsCard: React.FC<MacronutrientsCardProps> = ({
  analysisResults,
  celebrationActive,
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="macronutrients-card-container">
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          className="macronutrients-header-icon"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <SpatialIcon
            Icon={ICONS.BarChart3}
            size={20}
            style={{ color: 'var(--nutrition-secondary)' }}
          />
        </motion.div>
        <h3 className="text-xl font-bold text-white">Macronutriments Forgés</h3>
      </div>
      
      {/* Grille 3 Colonnes - Protéines, Glucides, Lipides */}
      <div className="nutrition-stats-grid">
        {/* Protéines */}
        <motion.div
          className="nutrition-stat-card proteins"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduceMotion ? 0.1 : 0.5,
            delay: reduceMotion ? 0 : 0.1
          }}
        >
          <div className={`nutrition-stat-icon ${celebrationActive ? 'celebrating' : ''}`}>
            <SpatialIcon Icon={ICONS.Activity} size={20} style={{ color: 'var(--nutrition-proteins)' }} />
          </div>
          <motion.div
            className="nutrition-stat-value"
            style={{ color: 'var(--nutrition-proteins)' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: reduceMotion ? 'tween' : 'spring',
              stiffness: 300,
              delay: reduceMotion ? 0 : 0.3
            }}
          >
            {Math.round(analysisResults.macronutrients.proteins)}g
          </motion.div>
          <div className="text-white font-medium text-sm">Protéines</div>
          <div className="text-white/50 text-xs mt-1">Récupération</div>
        </motion.div>

        {/* Glucides */}
        <motion.div
          className="nutrition-stat-card carbs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduceMotion ? 0.1 : 0.5,
            delay: reduceMotion ? 0 : 0.2
          }}
        >
          <div className={`nutrition-stat-icon ${celebrationActive ? 'celebrating' : ''}`}>
            <SpatialIcon Icon={ICONS.Zap} size={20} style={{ color: 'var(--nutrition-carbs)' }} />
          </div>
          <motion.div
            className="nutrition-stat-value"
            style={{ color: 'var(--nutrition-carbs)' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: reduceMotion ? 'tween' : 'spring',
              stiffness: 300,
              delay: reduceMotion ? 0 : 0.4
            }}
          >
            {Math.round(analysisResults.macronutrients.carbs)}g
          </motion.div>
          <div className="text-white font-medium text-sm">Glucides</div>
          <div className="text-white/50 text-xs mt-1">Énergie rapide</div>
        </motion.div>

        {/* Lipides */}
        <motion.div
          className="nutrition-stat-card fats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduceMotion ? 0.1 : 0.5,
            delay: reduceMotion ? 0 : 0.3
          }}
        >
          <div className={`nutrition-stat-icon ${celebrationActive ? 'celebrating' : ''}`}>
            <SpatialIcon Icon={ICONS.Heart} size={20} style={{ color: 'var(--nutrition-fats)' }} />
          </div>
          <motion.div
            className="nutrition-stat-value"
            style={{ color: 'var(--nutrition-fats)' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: reduceMotion ? 'tween' : 'spring',
              stiffness: 300,
              delay: reduceMotion ? 0 : 0.5
            }}
          >
            {Math.round(analysisResults.macronutrients.fats)}g
          </motion.div>
          <div className="text-white font-medium text-sm">Lipides</div>
          <div className="text-white/50 text-xs mt-1">Graisses saines</div>
        </motion.div>
      </div>

      {/* Confiance de l'Analyse Macros */}
      <motion.div
        className="nutrition-confidence-indicator"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: reduceMotion ? 0.1 : 0.6,
          delay: reduceMotion ? 0 : 0.6
        }}
      >
        <div className="flex items-center gap-2">
          <SpatialIcon 
            Icon={ICONS.BarChart3} 
            size={16} 
            style={{
              color: 'var(--nutrition-secondary)',
              filter: 'drop-shadow(0 0 8px color-mix(in srgb, var(--nutrition-secondary) 60%, transparent))'
            }}
          />
          <span className="text-white/90 text-sm font-medium">Répartition Macronutritionnelle</span>
        </div>
        <div className="text-right">
          <div className="font-bold text-lg" style={{ color: 'var(--nutrition-secondary)' }}>
            {Math.round(
              (analysisResults.macronutrients.proteins + 
               analysisResults.macronutrients.carbs + 
               analysisResults.macronutrients.fats) / 3
            )}g
          </div>
          <div className="text-white/60 text-xs">Moyenne</div>
        </div>
      </motion.div>
    </div>
  );
};

export default MacronutrientsCard;