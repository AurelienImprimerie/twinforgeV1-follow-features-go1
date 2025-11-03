import { motion } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { useToast } from '../../../../../ui/components/ToastProvider';
import React from 'react';

interface TextInputInterfaceProps {
  textInput: string;
  onTextInputChange: (text: string) => void;
  onProcessText: (text: string) => void;
  isProcessing: boolean;
}

/**
 * Text Input Interface - Interface de Saisie Manuelle TwinForge
 * Interface dédiée à la saisie texte pour la capture d'activité
 */
const TextInputInterface: React.FC<TextInputInterfaceProps> = ({
  textInput,
  onTextInputChange,
  onProcessText,
  isProcessing
}) => {
  const { showToast } = useToast();

  const handleProcessText = () => {
    if (!textInput.trim()) {
      showToast({
        type: 'error',
        title: 'Texte requis',
        message: 'Veuillez décrire votre activité avant de continuer',
        duration: 3000
      });
      return;
    }

    if (textInput.trim().length < 10) {
      showToast({
        type: 'warning',
        title: 'Description trop courte',
        message: 'Ajoutez plus de détails sur votre activité pour une analyse précise',
        duration: 3000
      });
      return;
    }

    onProcessText(textInput.trim());
  };

  return (
    <GlassCard className="capture-text-container capture-stage-card capture-input-interface">
      <div className="space-y-6">
        {/* Titre et Instructions */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center mb-4">
            <div className="capture-text-icon-3d">
              <div className="capture-text-icon-inner">
                <SpatialIcon
                  Icon={ICONS.FileText}
                  size={40}
                  style={{ color: '#8B5CF6' }}
                  variant="pure"
                />
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white">
            Saisie Manuelle
          </h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-md mx-auto">
            Décrivez votre session d'activité physique en détail
          </p>
        </div>

        {/* Zone de Saisie */}
        <div className="space-y-4">
          <label htmlFor="activity-description" className="block text-white/90 text-sm font-medium text-left">
            Description de votre activité
          </label>
          <textarea
            id="activity-description"
            value={textInput}
            onChange={(e) => onTextInputChange(e.target.value)}
            className="capture-text-input"
            placeholder="Ex: J'ai fait 30 minutes de course à pied ce matin à intensité modérée, puis 10 minutes d'étirements pour récupérer..."
          />
          
          {/* Compteur de caractères */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/60 text-left">
              {textInput.length < 10 ? 'Ajoutez plus de détails pour une analyse précise' : 'Description complète'}
            </span>
            <span className={`font-medium ${
              textInput.length < 10 ? 'text-orange-400' : 
              textInput.length < 50 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {textInput.length} caractères
            </span>
          </div>
        </div>

        {/* Bouton de Traitement */}
        {textInput.trim() && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <button
              onClick={handleProcessText}
              className="capture-action-button-3d capture-action-button-3d-primary"
            >
              <div className="flex items-center gap-3">
                <SpatialIcon Icon={ICONS.Zap} size={24} className="text-white" />
                <span>Processer ma Forge</span>
              </div>
            </button>
          </motion.div>
        )}

        {/* Conseils Texte */}
        <div className="capture-text-hint">
          <h4 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
            <SpatialIcon Icon={ICONS.Info} size={16} style={{ color: '#8B5CF6' }} />
            Conseils pour une Description Optimale
          </h4>
          <div className="text-purple-200 text-sm space-y-1 text-left">
            <p>• Décrivez clairement chaque activité et sa durée</p>
            <p>• Précisez l'intensité (facile, modéré, intense, très intense)</p>
            <p>• Ajoutez des détails sur le contexte (matin, soir, etc.)</p>
            <p>• Exemple : "Course 45min intense + étirements 10min"</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default TextInputInterface;