import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePerformanceMode } from '../../../../../../system/context/PerformanceModeContext';
import GlassCard from '../../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';
import { useFeedback } from '../../../../../../hooks/useFeedback';
import { useFridgeScanPipeline } from '../../../../../../system/store/fridgeScan';

/**
 * UserGuideCard - Carte d'information pour l'atelier de recettes (thématisée Cyan)
 * Utilise des couleurs cyan pour s'harmoniser avec l'onglet frigo.
 */
const UserGuideCard: React.FC = () => {
  const navigate = useNavigate();
  const { click } = useFeedback();
  const { startScan } = useFridgeScanPipeline();
  const { isPerformanceMode } = usePerformanceMode();

  const handleNewScan = () => {
    click();
    startScan();
    navigate('/fridge/scan');
  };

  return (
    <GlassCard className="fridge-glass-inventory p-8 text-center relative overflow-hidden rounded-3xl transform-gpu preserve-3d will-transform transition-all duration-300">
      <div className="flex flex-col items-center space-y-6">
        {/* Icône principale */}
        <div className={`fridge-icon-inventory ${isPerformanceMode ? '' : 'fridge-ai-focus-inventory'} w-20 h-20 mx-auto`}>
          <SpatialIcon
            Icon={ICONS.Refrigerator}
            size={36}
            color="rgba(255, 255, 255, 0.95)"
            variant="pure"
          />
        </div>

        {/* Titre et sous-titre */}
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Mon Inventaire
          </h2>
          <p className="text-white/80 text-base md:text-lg leading-relaxed">
            Gérez vos ingrédients, forgez des recettes et des plans alimentaires
          </p>
        </div>

        {/* Trois blocs de résumé explicatifs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          {/* Scan Rapide */}
          <div className="text-center space-y-3">
            <div className="fridge-icon-inventory w-12 h-12 mx-auto">
              <SpatialIcon
                Icon={ICONS.Camera}
                size={24}
                color="rgba(255, 255, 255, 0.95)"
                variant="pure"
              />
            </div>
            <h4 className="text-lg font-semibold text-white">Scan Rapide</h4>
            <p className="text-white/70 text-sm">
              Photographiez votre frigo en quelques secondes pour un inventaire automatique
            </p>
          </div>

          {/* Recettes Personnalisées */}
          <div className="text-center space-y-3">
            <div className="fridge-icon-inventory w-12 h-12 mx-auto">
              <SpatialIcon
                Icon={ICONS.Utensils}
                size={24}
                color="rgba(255, 255, 255, 0.95)"
                variant="pure"
              />
            </div>
            <h4 className="text-lg font-semibold text-white">Recettes Forgées</h4>
            <p className="text-white/70 text-sm">
              Forgez des recettes adaptées à vos ingrédients disponibles
            </p>
          </div>

          {/* Plans de Repas */}
          <div className="text-center space-y-3">
            <div className="fridge-icon-inventory w-12 h-12 mx-auto">
              <SpatialIcon
                Icon={ICONS.Calendar}
                size={24}
                color="rgba(255, 255, 255, 0.95)"
                variant="pure"
              />
            </div>
            <h4 className="text-lg font-semibold text-white">Plans de Repas</h4>
            <p className="text-white/70 text-sm">
              Créez des plans alimentaires équilibrés pour toute la semaine
            </p>
          </div>
        </div>

        {/* Bouton d'action */}
        <button
          onClick={handleNewScan}
          className="fridge-btn-inventory-primary px-6 md:px-8 py-3 md:py-4 text-lg md:text-xl font-bold relative overflow-hidden rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <span className="relative z-10 flex items-center gap-2">
            <SpatialIcon
              Icon={ICONS.Camera}
              size={20}
              color="white"
              variant="pure"
            />
            Commencer - Scanner Mon Frigo
          </span>
        </button>

        {/* Section Astuce */}
        <div className="fridge-info-panel mt-8 p-4 w-full">
          <div className="flex items-start gap-3">
            <SpatialIcon
              Icon={ICONS.Lightbulb}
              size={20}
              color="rgba(255, 255, 255, 0.95)"
              variant="pure"
              style={{ marginTop: '2px' }}
            />
            <div className="text-left">
              <h5 className="text-sm font-semibold text-white/90 mb-1">Astuce TwinForge</h5>
              <p className="text-white/70 text-xs leading-relaxed">
                Pour de meilleurs résultats, photographiez votre frigo avec un bon éclairage et organisez vos aliments de manière visible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default UserGuideCard;