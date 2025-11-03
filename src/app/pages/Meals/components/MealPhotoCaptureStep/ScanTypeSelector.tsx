import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import type { ScanType } from '../MealScanFlow/ScanFlowState';

interface ScanTypeSelectorProps {
  onSelectScanType: (scanType: ScanType) => void;
}

const ScanTypeSelector: React.FC<ScanTypeSelectorProps> = ({ onSelectScanType }) => {
  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <GlassCard
          className="p-6 cursor-pointer touch-feedback-css transition-all hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(5, 150, 105, 0.08))',
            borderColor: 'rgba(16, 185, 129, 0.3)',
          }}
          onClick={() => onSelectScanType('photo-analysis')}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.15))',
                border: '2px solid rgba(16, 185, 129, 0.4)',
              }}
            >
              <SpatialIcon Icon={ICONS.Camera} size={32} className="text-emerald-300" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-white font-bold text-lg">Scanner un Repas avec IA</h3>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#10B981',
                  }}
                >
                  Recommandé
                </span>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Analysez votre repas complet avec l'intelligence artificielle. Détection automatique des aliments, calcul précis des macros et conseils personnalisés.
              </p>

              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 text-xs text-emerald-300">
                  <SpatialIcon Icon={ICONS.Zap} size={14} />
                  <span>Analyse IA GPT</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-300">
                  <SpatialIcon Icon={ICONS.Target} size={14} />
                  <span>Conseils personnalisés</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-300">
                  <SpatialIcon Icon={ICONS.TrendingUp} size={14} />
                  <span>Détection multi-aliments</span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <SpatialIcon Icon={ICONS.ChevronRight} size={24} className="text-emerald-400" />
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <GlassCard
          className="p-6 cursor-pointer touch-feedback-css transition-all hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(79, 70, 229, 0.08))',
            borderColor: 'rgba(99, 102, 241, 0.3)',
          }}
          onClick={() => onSelectScanType('barcode-scan')}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(79, 70, 229, 0.15))',
                border: '2px solid rgba(99, 102, 241, 0.4)',
              }}
            >
              <SpatialIcon Icon={ICONS.ScanBarcode} size={32} className="text-indigo-300" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-white font-bold text-lg">Scanner un Code-Barre</h3>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: '#818CF8',
                  }}
                >
                  Rapide
                </span>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Scannez le code-barre d'un produit emballé. Données nutritionnelles précises issues de la base OpenFoodFacts.
              </p>

              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 text-xs text-indigo-300">
                  <SpatialIcon Icon={ICONS.Zap} size={14} />
                  <span>Instantané</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-indigo-300">
                  <SpatialIcon Icon={ICONS.Database} size={14} />
                  <span>OpenFoodFacts</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-indigo-300">
                  <SpatialIcon Icon={ICONS.Package} size={14} />
                  <span>Produits emballés</span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <SpatialIcon Icon={ICONS.ChevronRight} size={24} className="text-indigo-400" />
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="text-center"
      >
        <p className="text-gray-400 text-xs">
          Les deux modes enregistrent vos repas dans votre historique nutritionnel
        </p>
      </motion.div>
    </div>
  );
};

export default ScanTypeSelector;
