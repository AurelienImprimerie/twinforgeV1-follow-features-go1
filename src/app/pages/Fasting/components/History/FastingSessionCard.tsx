import React from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import { useFeedback } from '@/hooks/useFeedback';
import { useDeleteFastingSession, type FastingHistorySession } from '../../hooks/useFastingHistory';
import { determineSessionOutcome, getOutcomeTheme } from '../../utils/fastingUtils';
import { FASTING_PROTOCOLS } from '@/lib/nutrition/fastingProtocols';

interface FastingSessionCardProps {
  session: FastingHistorySession;
  index: number;
  onDelete?: (sessionId: string) => void;
  className?: string;
}

/**
 * Get protocol display name
 */
function getProtocolDisplayName(protocolId: string | null): string {
  if (!protocolId) return 'Protocole personnalisé';
  
  const protocol = FASTING_PROTOCOLS.find(p => p.id === protocolId);
  return protocol?.name || protocolId;
}

/**
 * Format duration for display
 */
function formatDuration(hours: number | null): string {
  if (!hours || hours <= 0) return '--';
  
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

/**
 * Fasting Session Card - Carte de Session Individuelle
 * Affiche les détails d'une session de jeûne avec actions
 */
const FastingSessionCard: React.FC<FastingSessionCardProps> = ({
  session,
  index,
  onDelete,
  className = ''
}) => {
  const { click, error: errorSound } = useFeedback();
  const deleteSessionMutation = useDeleteFastingSession();
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  // Determine session outcome and theme
  const outcome = session.actual_duration_hours && session.target_hours ? 
    determineSessionOutcome(session.actual_duration_hours, session.target_hours) : 
    'missed';
  
  const theme = getOutcomeTheme(outcome);
  const protocolName = getProtocolDisplayName(session.protocol_id);
  const actualDuration = formatDuration(session.actual_duration_hours);
  const targetDuration = `${session.target_hours}h`;
  
  // Calculate completion percentage
  const completionPercentage = session.actual_duration_hours && session.target_hours ? 
    Math.round((session.actual_duration_hours / session.target_hours) * 100) : 0;

  const handleDelete = async () => {
    try {
      await deleteSessionMutation.mutateAsync(session.id);
      onDelete?.(session.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleDeleteClick = () => {
    click();
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    click();
    setShowDeleteConfirm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05,
        ease: [0.25, 0.1, 0.25, 1] 
      }}
      className={className}
    >
      <GlassCard
        className="p-5 relative overflow-visible"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, ${theme.primaryColor} 8%, transparent) 0%, transparent 60%),
            var(--glass-opacity)
          `,
          borderColor: `color-mix(in srgb, ${theme.primaryColor} 20%, transparent)`,
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.2),
            0 0 20px color-mix(in srgb, ${theme.primaryColor} 12%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.12)
          `,
          backdropFilter: 'blur(16px) saturate(150%)'
        }}
      >
        <div className="space-y-4">
          {/* Header avec Statut */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
                    linear-gradient(135deg, color-mix(in srgb, ${theme.primaryColor} 30%, transparent), color-mix(in srgb, ${theme.primaryColor} 20%, transparent))
                  `,
                  border: `2px solid color-mix(in srgb, ${theme.primaryColor} 40%, transparent)`,
                  boxShadow: `0 0 16px color-mix(in srgb, ${theme.primaryColor} 25%, transparent)`
                }}
              >
                <SpatialIcon 
                  Icon={ICONS[theme.icon]} 
                  size={16} 
                  style={{ color: theme.primaryColor }} 
                />
              </div>
              <div>
                <h4 className="text-white font-semibold">
                  {format(parseISO(session.start_time), 'dd MMM yyyy')}
                </h4>
                <p className="text-white/70 text-sm">
                  {protocolName} • {format(parseISO(session.start_time), 'HH:mm')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Status Badge */}
              <div 
                className="px-3 py-1.5 rounded-full"
                style={{
                  background: `color-mix(in srgb, ${theme.primaryColor} 15%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${theme.primaryColor} 25%, transparent)`
                }}
              >
                <span className="text-xs font-medium" style={{ color: theme.primaryColor }}>
                  {session.status === 'completed' ? 'Complétée' : 
                   session.status === 'cancelled' ? 'Annulée' : 'Active'}
                </span>
              </div>

              {/* Delete Button */}
              <button
                onClick={handleDeleteClick}
                className="p-2 rounded-full hover:bg-red-500/20 transition-colors"
                title="Supprimer cette session"
              >
                <SpatialIcon Icon={ICONS.Trash2} size={14} className="text-red-400" />
              </button>
            </div>
          </div>

          {/* Métriques de Session */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Durée Réelle */}
            <div className="text-center p-3 rounded-lg" style={{
              background: `color-mix(in srgb, ${theme.primaryColor} 8%, transparent)`,
              border: `1px solid color-mix(in srgb, ${theme.primaryColor} 15%, transparent)`
            }}>
              <div className="text-lg font-bold text-white mb-1">
                {actualDuration}
              </div>
              <div className="text-white/70 text-xs">Durée Réelle</div>
            </div>

            {/* Objectif */}
            <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-lg font-bold text-white mb-1">
                {targetDuration}
              </div>
              <div className="text-white/70 text-xs">Objectif</div>
            </div>

            {/* Progression */}
            <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-lg font-bold text-white mb-1">
                {completionPercentage}%
              </div>
              <div className="text-white/70 text-xs">Progression</div>
            </div>

            {/* Heure de Fin */}
            <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-lg font-bold text-white mb-1">
                {session.end_time ? format(parseISO(session.end_time), 'HH:mm') : '--:--'}
              </div>
              <div className="text-white/70 text-xs">Fin</div>
            </div>
          </div>

          {/* Notes si présentes */}
          {session.notes && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start gap-2">
                <SpatialIcon Icon={ICONS.FileText} size={14} className="text-white/60 mt-0.5" />
                <div>
                  <h6 className="text-white/80 font-medium text-sm mb-1">Notes</h6>
                  <p className="text-white/70 text-sm leading-relaxed">{session.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Barre de Progression */}
          {session.status === 'completed' && session.actual_duration_hours && session.target_hours && (
            <div>
              <div className="flex justify-between text-sm text-white/70 mb-2">
                <span>Progression vers l'objectif</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-2 rounded-full relative overflow-hidden"
                  style={{
                    background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                    boxShadow: `0 0 8px color-mix(in srgb, ${theme.primaryColor} 60%, transparent)`,
                    width: `${Math.min(100, completionPercentage)}%`
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, completionPercentage)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 + index * 0.05 }}
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
            </div>
          )}
        </div>

        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <motion.div
            className="absolute inset-0 rounded-inherit flex items-center justify-center"
            style={{
              background: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(8px)',
              zIndex: 10
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center space-y-4 p-4">
              <div 
                className="w-12 h-12 mx-auto rounded-full flex items-center justify-center"
                style={{
                  background: 'color-mix(in srgb, #EF4444 20%, transparent)',
                  border: '2px solid color-mix(in srgb, #EF4444 40%, transparent)'
                }}
              >
                <SpatialIcon Icon={ICONS.AlertTriangle} size={20} style={{ color: '#EF4444' }} />
              </div>
              
              <div>
                <h5 className="text-white font-bold mb-2">Supprimer cette session ?</h5>
                <p className="text-white/80 text-sm">
                  Session du {format(parseISO(session.start_time), 'dd/MM/yyyy')} • {actualDuration}
                </p>
              </div>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleDelete}
                  disabled={deleteSessionMutation.isPending}
                  className="btn-glass--warning px-4 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    {deleteSessionMutation.isPending ? (
                      <SpatialIcon Icon={ICONS.Loader2} size={12} className="animate-spin" />
                    ) : (
                      <SpatialIcon Icon={ICONS.Trash2} size={12} />
                    )}
                    <span>{deleteSessionMutation.isPending ? 'Suppression...' : 'Supprimer'}</span>
                  </div>
                </button>
                
                <button
                  onClick={handleCancelDelete}
                  className="btn-glass--secondary-nav px-4 py-2 text-sm"
                >
                  <span>Annuler</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </GlassCard>
    </motion.div>
  );
};

export default FastingSessionCard;