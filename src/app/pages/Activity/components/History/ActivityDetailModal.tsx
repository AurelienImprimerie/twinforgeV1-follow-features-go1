import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { useFeedback } from '../../../../../hooks/useFeedback';
import { getActivityIcon, getIntensityColor, getIntensityLabel } from '../ReviewStage/ActivityUtils';
import WearableConnectionBadge from '../shared/WearableConnectionBadge';
import React from 'react';

interface Activity {
  id: string;
  user_id: string;
  type: string;
  duration_min: number;
  intensity: 'low' | 'medium' | 'high' | 'very_high';
  calories_est: number;
  notes?: string;
  timestamp: string;
  created_at: string;
}

interface ActivityDetailModalProps {
  activity: Activity;
  onClose: () => void;
  onDelete?: (activityId: string) => void;
}

/**
 * Activity Detail Modal - Modal de Détail d'Activité
 * Affiche les détails complets d'une activité avec possibilité de suppression
 */
const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  onClose,
  onDelete
}) => {
  const { click } = useFeedback();

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      click();
      onClose();
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(activity.id);
      onClose();
    }
  };

  const intensityColor = getIntensityColor(activity.intensity);
  const activityIcon = getActivityIcon(activity.type);

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-detail-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <GlassCard 
            className="p-6"
            style={{
              background: `
                radial-gradient(circle at 30% 20%, color-mix(in srgb, ${intensityColor} 12%, transparent) 0%, transparent 60%),
                radial-gradient(circle at 70% 80%, color-mix(in srgb, ${intensityColor} 8%, transparent) 0%, transparent 50%),
                linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.10)),
                rgba(11, 14, 23, 0.95)
              `,
              borderColor: `color-mix(in srgb, ${intensityColor} 30%, transparent)`,
              boxShadow: `
                0 25px 80px rgba(0, 0, 0, 0.6),
                0 0 60px color-mix(in srgb, ${intensityColor} 30%, transparent),
                inset 0 3px 0 rgba(255, 255, 255, 0.3),
                inset 0 -3px 0 rgba(0, 0, 0, 0.2)
              `,
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: `
                      radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                      linear-gradient(135deg, color-mix(in srgb, ${intensityColor} 40%, transparent), color-mix(in srgb, ${intensityColor} 30%, transparent))
                    `,
                    border: `3px solid color-mix(in srgb, ${intensityColor} 60%, transparent)`,
                    boxShadow: `0 0 30px color-mix(in srgb, ${intensityColor} 50%, transparent)`
                  }}
                >
                  <SpatialIcon 
                    Icon={ICONS[activityIcon as keyof typeof ICONS]} 
                    size={28} 
                    style={{ color: intensityColor }}
                    variant="pure"
                  />
                </div>
                <div>
                  <div>
                    <h2
                      id="activity-detail-title"
                      className="text-2xl font-bold text-white mb-1"
                    >
                      {activity.type}
                    </h2>
                    <p className="text-white/70 text-sm mb-2">
                      {format(new Date(activity.timestamp), 'EEEE dd MMMM yyyy à HH:mm', { locale: fr })}
                    </p>
                    <WearableConnectionBadge activityId={activity.id} />
                  </div>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 rounded-full transition-all duration-200"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                aria-label="Fermer le détail"
              >
                <SpatialIcon Icon={ICONS.X} size={18} className="text-white/80" />
              </button>
            </div>

            {/* Métriques Principales */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 rounded-xl" style={{
                background: `color-mix(in srgb, ${intensityColor} 10%, transparent)`,
                border: `1px solid color-mix(in srgb, ${intensityColor} 20%, transparent)`
              }}>
                <div className="text-2xl font-bold text-white mb-1">
                  {activity.duration_min}
                </div>
                <div className="text-white/70 text-sm">Minutes</div>
              </div>
              
              <div className="text-center p-4 rounded-xl" style={{
                background: `color-mix(in srgb, ${intensityColor} 10%, transparent)`,
                border: `1px solid color-mix(in srgb, ${intensityColor} 20%, transparent)`
              }}>
                <div className="text-2xl font-bold text-white mb-1">
                  {activity.calories_est}
                </div>
                <div className="text-white/70 text-sm">Calories</div>
              </div>
              
              <div className="text-center p-4 rounded-xl" style={{
                background: `color-mix(in srgb, ${intensityColor} 10%, transparent)`,
                border: `1px solid color-mix(in srgb, ${intensityColor} 20%, transparent)`
              }}>
                <div className="text-lg font-bold text-white mb-1">
                  {getIntensityLabel(activity.intensity)}
                </div>
                <div className="text-white/70 text-sm">Intensité</div>
              </div>
            </div>

            {/* Notes */}
            {activity.notes && (
              <div className="mb-6 p-4 rounded-xl" style={{
                background: `color-mix(in srgb, ${intensityColor} 6%, transparent)`,
                border: `1px solid color-mix(in srgb, ${intensityColor} 15%, transparent)`
              }}>
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <SpatialIcon Icon={ICONS.FileText} size={14} style={{ color: intensityColor }} />
                  Notes
                </h4>
                <p className="text-white/80 text-sm leading-relaxed">
                  {activity.notes}
                </p>
              </div>
            )}

            {/* Données Wearable Détaillées */}
            <div className="mb-6">
              <WearableConnectionBadge activityId={activity.id} showDetails={true} />
            </div>

            {/* Informations Techniques */}
            <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <SpatialIcon Icon={ICONS.Info} size={14} className="text-white/70" />
                Informations Techniques
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/60">ID :</span>
                  <div className="text-white/80 font-mono text-xs mt-1">
                    {activity.id.substring(0, 8)}...
                  </div>
                </div>
                <div>
                  <span className="text-white/60">Créé le :</span>
                  <div className="text-white/80 text-xs mt-1">
                    {format(new Date(activity.created_at), 'dd/MM/yyyy HH:mm')}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-3 rounded-full font-semibold"
                  style={{
                    background: `linear-gradient(135deg, 
                      color-mix(in srgb, #EF4444 80%, transparent), 
                      color-mix(in srgb, #F59E0B 60%, transparent)
                    )`,
                    border: '2px solid color-mix(in srgb, #EF4444 60%, transparent)',
                    boxShadow: `
                      0 12px 40px color-mix(in srgb, #EF4444 40%, transparent),
                      0 0 60px color-mix(in srgb, #EF4444 30%, transparent),
                      inset 0 3px 0 rgba(255,255,255,0.4)
                    `,
                    backdropFilter: 'blur(20px) saturate(160%)',
                    color: '#fff'
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <SpatialIcon Icon={ICONS.Trash2} size={16} className="text-white" />
                    <span>Supprimer</span>
                  </div>
                </button>
              )}
              
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-full font-semibold"
                style={{
                  background: `linear-gradient(135deg, 
                    color-mix(in srgb, #6B7280 80%, transparent), 
                    color-mix(in srgb, #9CA3AF 60%, transparent)
                  )`,
                  border: '2px solid color-mix(in srgb, #6B7280 60%, transparent)',
                  boxShadow: `
                    0 8px 32px color-mix(in srgb, #6B7280 30%, transparent),
                    inset 0 2px 0 rgba(255,255,255,0.3)
                  `,
                  backdropFilter: 'blur(16px) saturate(140%)',
                  color: '#fff'
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <SpatialIcon Icon={ICONS.X} size={16} className="text-white" />
                  <span>Fermer</span>
                </div>
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default ActivityDetailModal;