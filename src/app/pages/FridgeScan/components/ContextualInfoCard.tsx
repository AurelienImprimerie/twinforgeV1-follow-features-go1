import React from 'react';
import { motion } from 'framer-motion';
import { usePerformanceMode } from '../../../../system/context/PerformanceModeContext';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';

/**
 * Contextual Info Card - Carte d'Information Contextuelle
 * Composant éducatif expliquant le processus d'analyse de la Forge Spatiale
 */
const ContextualInfoCard: React.FC = () => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  return (
    <MotionDiv
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay: 0.4 }
      })}
    >
      <GlassCard className="fridge-info-panel p-6">
        <div className="flex items-start gap-3">
          <div className="fridge-icon-info w-8 h-8 flex-shrink-0 mt-1">
            <SpatialIcon Icon={ICONS.Info} size={12} color="var(--fridge-inventory-primary)" variant="pure" />
          </div>
          <div>
            <h4 className="text-cyan-300 font-semibold mb-2">Que fait la Forge Spatiale ?</h4>
            <div className="space-y-2 text-sm text-cyan-200">
              <p>• <strong>Vision de la Forge :</strong> Détection précise des aliments et ingrédients</p>
              <p>• <strong>Analyse Nutritionnelle :</strong> Évaluation de la fraîcheur et des quantités</p>
              <p>• <strong>Cartographie de la Forge :</strong> Catégorisation et normalisation des données</p>
              <p>• <strong>Préparation Recettes :</strong> Optimisation pour la génération de recettes</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </MotionDiv>
  );
};

export default ContextualInfoCard;