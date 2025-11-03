import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { useFeedback } from '../../../../../hooks/useFeedback';

interface ReadyForProcessingProps {
  onProceedToProcessing: () => void;
  isProcessingInProgress: boolean;
  hasPhoto: boolean;
  hasScannedBarcodes: boolean;
  hasScannedProducts: boolean;
  scannedBarcodesCount: number;
  scannedProductsCount: number;
}

/**
 * Ready For Processing Component
 * Interface de confirmation pour lancer l'analyse IA
 */
const ReadyForProcessing: React.FC<ReadyForProcessingProps> = ({
  onProceedToProcessing,
  isProcessingInProgress,
  hasPhoto,
  hasScannedBarcodes,
  hasScannedProducts,
  scannedBarcodesCount,
  scannedProductsCount,
}) => {
  const { success } = useFeedback();

  // Générer le message contextuel selon ce qui a été capturé
  const getContextualMessage = () => {
    const totalItems = scannedBarcodesCount + scannedProductsCount;

    if (hasPhoto && (hasScannedBarcodes || hasScannedProducts)) {
      return {
        title: 'Photo et codes-barres détectés !',
        subtitle: `Votre photo${hasScannedBarcodes ? ` et ${scannedBarcodesCount} code${scannedBarcodesCount > 1 ? 's-barres' : '-barre'}` : ''}${hasScannedProducts ? ` et ${scannedProductsCount} produit${scannedProductsCount > 1 ? 's' : ''}` : ''} sont prêts pour l'analyse complète.`,
      };
    } else if (hasScannedBarcodes && hasScannedProducts) {
      return {
        title: `${totalItems} élément${totalItems > 1 ? 's' : ''} détecté${totalItems > 1 ? 's' : ''} !`,
        subtitle: `${scannedBarcodesCount} code${scannedBarcodesCount > 1 ? 's-barres' : '-barre'} et ${scannedProductsCount} produit${scannedProductsCount > 1 ? 's' : ''} prêts pour l'analyse.`,
      };
    } else if (hasScannedBarcodes) {
      return {
        title: `${scannedBarcodesCount} code${scannedBarcodesCount > 1 ? 's-barres' : '-barre'} détecté${scannedBarcodesCount > 1 ? 's' : ''} !`,
        subtitle: 'Vos codes-barres sont prêts pour l\'analyse nutritionnelle avancée.',
      };
    } else if (hasScannedProducts) {
      return {
        title: `${scannedProductsCount} produit${scannedProductsCount > 1 ? 's' : ''} scanné${scannedProductsCount > 1 ? 's' : ''} !`,
        subtitle: 'Vos produits sont prêts pour l\'analyse nutritionnelle.',
      };
    } else {
      return {
        title: 'Photo capturée avec succès !',
        subtitle: 'Votre carburant nutritionnel est prêt pour l\'analyse TwinForge.',
      };
    }
  };

  const message = getContextualMessage();

  return (
    <div className="meal-ready-processing meal-capture-enter">
      <GlassCard 
        className="p-6 text-center relative glass-card--ready-processing perf-critical"
        style={{
          background: `
            radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(34, 197, 94, 0.12) 0%, transparent 60%),
            radial-gradient(circle at 50% 50%, rgba(52, 211, 153, 0.08) 0%, transparent 70%),
            var(--glass-opacity)
          `,
          borderColor: 'rgba(16, 185, 129, 0.4)',
          boxShadow: `
            0 16px 48px rgba(0, 0, 0, 0.3),
            0 0 40px rgba(16, 185, 129, 0.25),
            0 0 80px rgba(34, 197, 94, 0.15),
            inset 0 2px 0 rgba(255, 255, 255, 0.2)
          `
        }}
      >
        {/* Halo de Forge Nutritionnelle */}
        <div
          className="absolute inset-0 rounded-inherit pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
            filter: 'blur(20px)',
            transform: 'scale(1.2)',
            zIndex: -1,
            animation: 'forge-nutritional-glow 3s ease-in-out infinite'
          }}
        />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                  linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(34, 197, 94, 0.4))
                `,
                border: '2px solid rgba(16, 185, 129, 0.6)',
                boxShadow: `
                  0 0 40px rgba(16, 185, 129, 0.5),
                  inset 0 2px 0 rgba(255, 255, 255, 0.3)
                `
              }}
            >
              <SpatialIcon 
                Icon={ICONS.Check} 
                size={28} 
                className="text-white"
                style={{
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))'
                }}
              />
            </div>
            
            <h3 className="text-white text-xl font-bold text-center">
              {message.title}
            </h3>

            <p className="text-green-100 text-base leading-relaxed max-w-md mx-auto text-center">
              {message.subtitle}
            </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              success();
              onProceedToProcessing();
            }}
            className="w-full max-w-md mx-auto py-3 btn-breathing-css btn-touch-feedback touch-feedback-css"
            disabled={isProcessingInProgress}
            style={{
              '--scan-primary': '#10B981',
              position: 'relative',
              overflow: 'hidden',
              background: `
                linear-gradient(135deg, 
                  rgba(16, 185, 129, 0.9), 
                  rgba(34, 197, 94, 0.7),
                  rgba(52, 211, 153, 0.8)
                )
              `,
              backdropFilter: 'blur(20px) saturate(160%)',
              boxShadow: `
                0 16px 48px rgba(16, 185, 129, 0.5),
                0 0 80px rgba(16, 185, 129, 0.4),
                0 0 120px rgba(34, 197, 94, 0.3),
                inset 0 3px 0 rgba(255,255,255,0.4),
                inset 0 -3px 0 rgba(0,0,0,0.2)
              `,
              borderRadius: '999px',
              border: '2px solid rgba(16, 185, 129, 0.8)',
            }}
          >
            <div className="relative z-10 flex items-center justify-center gap-3">
              <div className={isProcessingInProgress ? 'icon-spin-css' : ''}>
                <SpatialIcon 
                  Icon={isProcessingInProgress ? ICONS.Loader2 : ICONS.Zap} 
                  size={20} 
                  className="text-white"
                  style={{
                    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))'
                  }}
                />
              </div>
              <span className="text-lg font-bold text-white">
                {isProcessingInProgress ? 'Analyse en cours...' : 'Lancer l\'analyse avancée'}
              </span>
            </div>
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default ReadyForProcessing;