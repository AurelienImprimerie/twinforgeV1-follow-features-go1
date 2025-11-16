/**
 * EmptyGamificationState - Nouvelle Version Gaming
 * État vide motivant avec niveau 1 visible et barre de progression
 * Objectif: Donner envie de gagner des points et d'utiliser les actions
 */

import { motion } from 'framer-motion';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import LevelProgressBar from '../coeur/GamingProgressWidget/components/LevelProgressBar';
import ActionCommandPanel from '../coeur/GamingProgressWidget/components/ActionCommandPanel';

export default function EmptyGamificationState() {
  const { performanceMode } = usePerformanceMode();

  const handleActionPanelClick = () => {
    const actionPanel = document.querySelector('[data-action-panel]');
    if (actionPanel) {
      actionPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <motion.div
      className="glass-card-premium p-6 sm:p-8 rounded-3xl space-y-6 relative overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 30% 30%, rgba(247, 147, 30, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 70% 70%, rgba(251, 191, 36, 0.25) 0%, transparent 50%),
          rgba(247, 147, 30, 0.05)
        `,
        backdropFilter: 'blur(20px) saturate(150%)',
        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
        border: '2px solid rgba(247, 147, 30, 0.4)',
        boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.15)`
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background - Static */}

      {/* Hero Section - Niveau 1 Débutant */}
      <div className="space-y-6 relative">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: '#F7931E' }}
              title="Prêt à commencer"
            />
            <span className="text-sm text-white/60 font-medium">
              Ton aventure commence maintenant
            </span>
          </div>

          {/* Icône principale - Statique */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-3">
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Icône Hammer - Statique */}
                <div
                  className="relative w-20 h-20 rounded-3xl flex items-center justify-center backdrop-blur-sm"
                  style={{
                    background: 'linear-gradient(135deg, rgba(247, 147, 30, 0.4), rgba(247, 147, 30, 0.2))',
                    border: '2px solid rgba(247, 147, 30, 0.5)',
                    boxShadow: '0 0 20px rgba(247, 147, 30, 0.3)',
                  }}
                >
                  <SpatialIcon name="Hammer" size={40} color="#F7931E" glowColor="#FBBF24" variant="pure" />
                </div>
              </div>
            </div>

            {/* Titre motivant */}
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              Forgeron Débutant
            </h2>

            {/* Badge Niveau 1 */}
            <div
              className="inline-block px-6 py-2 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(247, 147, 30, 0.3), rgba(251, 191, 36, 0.2))',
                border: '2px solid rgba(247, 147, 30, 0.4)'
              }}
            >
              <span className="text-2xl font-black text-orange-400">Niveau 1</span>
            </div>

            {/* Message motivant */}
            <p className="text-white/70 text-base max-w-md mx-auto">
              Gagne des points en complétant tes actions quotidiennes et progresse vers le niveau 2!
            </p>
          </div>
        </div>

        {/* Stats de départ */}
        <div className="grid grid-cols-2 gap-4">
          {/* Points Total */}
          <div
            className="glass-card rounded-2xl p-5 border-2 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(247, 147, 30, 0.15), rgba(251, 191, 36, 0.1))',
              borderColor: 'rgba(247, 147, 30, 0.4)',
              boxShadow: '0 8px 32px rgba(247, 147, 30, 0.2)'
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <SpatialIcon name="Zap" size={20} color="#F7931E" />
              <span className="text-sm text-white/70 font-semibold">Points</span>
            </div>
            <p className="text-4xl font-black text-white mb-1">0</p>
            <p className="text-xs text-orange-400 font-medium">Commence maintenant</p>
          </div>

          {/* Prochain Niveau */}
          <div
            className="glass-card rounded-2xl p-5 border-2 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(249, 115, 22, 0.1))',
              borderColor: 'rgba(249, 115, 22, 0.4)',
              boxShadow: '0 8px 32px rgba(249, 115, 22, 0.2)'
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <SpatialIcon name="Target" size={20} color="#F97316" />
              <span className="text-sm text-white/70 font-semibold">Objectif</span>
            </div>
            <p className="text-4xl font-black text-white mb-1">100</p>
            <p className="text-xs text-orange-400 font-medium">pts pour niveau 2</p>
          </div>
        </div>
      </div>

      {/* Barre de progression à 0% - Motivante */}
      <LevelProgressBar
        levelProgress={0}
        xpToNextLevel={100}
        performanceMode={performanceMode}
      />

      {/* Action Command Panel */}
      <div data-action-panel>
        <ActionCommandPanel />
      </div>
    </motion.div>
  );
}
