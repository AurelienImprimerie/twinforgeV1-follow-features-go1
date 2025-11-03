import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import { useFeedback } from '@/hooks/useFeedback';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';

interface FastingDataCompletenessAlertProps {
  missingData: string[];
  analysisType?: string;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Fasting Data Completeness Alert - Alerte de Complétude des Données
 * Informe l'utilisateur des données manquantes pour optimiser les insights
 */
const FastingDataCompletenessAlert: React.FC<FastingDataCompletenessAlertProps> = ({
  missingData,
  analysisType = "analyse IA",
  onDismiss,
  className = ''
}) => {
  const navigate = useNavigate();
  const { click } = useFeedback();
  const { isPerformanceMode } = usePerformanceMode();

  // Conditional motion components
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  if (missingData.length === 0) return null;

  const handleCompleteProfile = () => {
    click();
    navigate('/profile#identity');
  };

  const handleDismiss = () => {
    click();
    onDismiss?.();
  };

  return (
    <MotionDiv
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: -10, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -10, scale: 0.95 },
        transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
      })}
      className={className}
    >
      <GlassCard 
        className="p-5"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, #F59E0B 12%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, #EF4444 8%, transparent) 0%, transparent 50%),
            var(--glass-opacity)
          `,
          borderColor: 'color-mix(in srgb, #F59E0B 30%, transparent)',
          boxShadow: isPerformanceMode
            ? '0 12px 40px rgba(0, 0, 0, 0.25)'
            : `
              0 12px 40px rgba(0, 0, 0, 0.25),
              0 0 30px color-mix(in srgb, #F59E0B 20%, transparent),
              inset 0 2px 0 rgba(255, 255, 255, 0.15)
            `,
          backdropFilter: isPerformanceMode ? 'none' : 'blur(20px) saturate(160%)'
        }}
      >
        <div className="flex items-start gap-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, #F59E0B 35%, transparent), color-mix(in srgb, #F59E0B 25%, transparent))
              `,
              border: '2px solid color-mix(in srgb, #F59E0B 50%, transparent)',
              boxShadow: isPerformanceMode ? 'none' : '0 0 20px color-mix(in srgb, #F59E0B 30%, transparent)'
            }}
          >
            <SpatialIcon Icon={ICONS.AlertTriangle} size={20} style={{ color: '#F59E0B' }} />
          </div>
          
          <div className="flex-1">
            <h4 className="text-orange-300 font-bold text-lg mb-2">
              Optimisez votre {analysisType}
            </h4>
            <p className="text-orange-200 text-sm mb-4 leading-relaxed">
              Pour une {analysisType} plus précise et personnalisée de la Forge Spatiale, complétez les informations manquantes :
            </p>
            
            <div className="space-y-2 mb-4">
              {missingData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  <span className="text-orange-200 text-sm">{item}</span>
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleCompleteProfile}
                className="btn-glass--primary px-4 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <SpatialIcon Icon={ICONS.User} size={14} />
                  <span>Compléter le Profil</span>
                </div>
              </button>
              
              {onDismiss && (
                <button
                  onClick={handleDismiss}
                  className="btn-glass--secondary-nav px-3 py-2 text-sm"
                  style={{
                    transition: isPerformanceMode ? 'all 0.15s ease' : 'all 0.2s ease'
                  }}
                >
                  <span>Plus tard</span>
                </button>
              )}
            </div>
          </div>
          
          {onDismiss && (
            <button
              onClick={handleDismiss}
              className="p-2 rounded-full hover:bg-white/10 flex-shrink-0"
              style={{
                transition: isPerformanceMode ? 'all 0.15s ease' : 'all 0.2s ease'
              }}
              aria-label="Fermer l'alerte"
            >
              <SpatialIcon Icon={ICONS.X} size={14} className="text-white/60" />
            </button>
          )}
        </div>
      </GlassCard>
    </MotionDiv>
  );
};

export default FastingDataCompletenessAlert;