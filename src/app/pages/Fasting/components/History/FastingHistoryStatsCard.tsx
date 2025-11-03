import React from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import type { FastingHistoryStats } from '../../hooks/useFastingHistory';

interface FastingHistoryStatsCardProps {
  stats: FastingHistoryStats;
  className?: string;
}

/**
 * Get performance theme based on completion rate
 */
function getPerformanceTheme(completionRate: number) {
  if (completionRate >= 90) {
    return {
      color: '#22C55E',
      icon: 'Check' as const,
      badge: 'Excellent',
      description: 'Discipline exceptionnelle'
    };
  } else if (completionRate >= 70) {
    return {
      color: '#F59E0B',
      icon: 'Target' as const,
      badge: 'Bien',
      description: 'Bonne régularité'
    };
  } else if (completionRate >= 50) {
    return {
      color: '#06B6D4',
      icon: 'TrendingUp' as const,
      badge: 'Modéré',
      description: 'En progression'
    };
  } else {
    return {
      color: '#8B5CF6',
      icon: 'Timer' as const,
      badge: 'Débutant',
      description: 'Développement en cours'
    };
  }
}

/**
 * Fasting History Stats Card - Statistiques Globales de l'Historique
 * Affiche les métriques clés de toutes les sessions historiques
 */
const FastingHistoryStatsCard: React.FC<FastingHistoryStatsCardProps> = ({
  stats,
  className = ''
}) => {
  const completionRate = stats.totalSessions > 0 ? 
    (stats.completedSessions / stats.totalSessions) * 100 : 0;
  
  const theme = getPerformanceTheme(completionRate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      <GlassCard
        className="p-6"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, ${theme.color} 15%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, ${theme.color} 10%, transparent) 0%, transparent 50%),
            var(--glass-opacity)
          `,
          borderColor: `color-mix(in srgb, ${theme.color} 30%, transparent)`,
          boxShadow: `
            0 16px 48px rgba(0, 0, 0, 0.3),
            0 0 40px color-mix(in srgb, ${theme.color} 25%, transparent),
            inset 0 2px 0 rgba(255, 255, 255, 0.2)
          `,
          backdropFilter: 'blur(24px) saturate(170%)'
        }}
      >
        <div className="space-y-6">
          {/* Header avec Performance Globale */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center breathing-icon"
                style={{
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 60%),
                    linear-gradient(135deg, color-mix(in srgb, ${theme.color} 40%, transparent), color-mix(in srgb, ${theme.color} 30%, transparent))
                  `,
                  border: `2px solid color-mix(in srgb, ${theme.color} 60%, transparent)`,
                  boxShadow: `0 0 25px color-mix(in srgb, ${theme.color} 50%, transparent)`
                }}
              >
                <SpatialIcon
                  Icon={ICONS[theme.icon]}
                  size={20}
                  style={{ color: theme.color }}
                  variant="pure"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Statistiques Globales</h3>
                <p className="text-white/80 text-sm mt-0.5">
                  Toutes vos sessions • {theme.description}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ 
                    background: theme.color,
                    boxShadow: `0 0 8px ${theme.color}60`
                  }} 
                />
                <span className="text-white font-bold text-2xl">
                  {Math.round(completionRate)}%
                </span>
              </div>
              <div 
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  background: `color-mix(in srgb, ${theme.color} 15%, transparent)`,
                  color: theme.color
                }}
              >
                {theme.badge}
              </div>
            </div>
          </div>

          {/* Métriques Principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Sessions */}
            <motion.div
              className="text-center p-4 rounded-xl"
              style={{
                background: 'color-mix(in srgb, #3B82F6 10%, transparent)',
                border: '1px solid color-mix(in srgb, #3B82F6 20%, transparent)'
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {stats.totalSessions}
              </div>
              <div className="text-blue-300 text-sm font-medium">Sessions</div>
              <div className="text-white/50 text-xs mt-1">Total</div>
            </motion.div>

            {/* Completed Sessions */}
            <motion.div
              className="text-center p-4 rounded-xl"
              style={{
                background: 'color-mix(in srgb, #22C55E 10%, transparent)',
                border: '1px solid color-mix(in srgb, #22C55E 20%, transparent)'
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-2xl font-bold text-green-400 mb-1">
                {stats.completedSessions}
              </div>
              <div className="text-green-300 text-sm font-medium">Complétées</div>
              <div className="text-white/50 text-xs mt-1">Succès</div>
            </motion.div>

            {/* Total Hours */}
            <motion.div
              className="text-center p-4 rounded-xl"
              style={{
                background: 'color-mix(in srgb, #F59E0B 10%, transparent)',
                border: '1px solid color-mix(in srgb, #F59E0B 20%, transparent)'
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="text-2xl font-bold text-orange-400 mb-1">
                {stats.totalHours}h
              </div>
              <div className="text-orange-300 text-sm font-medium">Temps Total</div>
              <div className="text-white/50 text-xs mt-1">Jeûné</div>
            </motion.div>

            {/* Average Duration */}
            <motion.div
              className="text-center p-4 rounded-xl"
              style={{
                background: 'color-mix(in srgb, #8B5CF6 10%, transparent)',
                border: '1px solid color-mix(in srgb, #8B5CF6 20%, transparent)'
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {stats.averageDuration}h
              </div>
              <div className="text-purple-300 text-sm font-medium">Moyenne</div>
              <div className="text-white/50 text-xs mt-1">Durée</div>
            </motion.div>
          </div>

          {/* Records et Détails */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Records */}
            <div className="space-y-3">
              <h5 className="text-white/80 font-medium text-sm flex items-center gap-2">
                <SpatialIcon Icon={ICONS.Star} size={14} className="text-yellow-400" />
                Records Personnels
              </h5>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-white/70 text-sm">Session la plus longue</span>
                  <span className="text-white font-bold">{stats.longestSession}h</span>
                </div>
                {stats.shortestSession > 0 && (
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-white/70 text-sm">Session la plus courte</span>
                    <span className="text-white font-bold">{stats.shortestSession}h</span>
                  </div>
                )}
                {stats.mostUsedProtocol && (
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-white/70 text-sm">Protocole favori</span>
                    <span className="text-white font-bold">{stats.mostUsedProtocol}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Historique */}
            <div className="space-y-3">
              <h5 className="text-white/80 font-medium text-sm flex items-center gap-2">
                <SpatialIcon Icon={ICONS.Calendar} size={14} className="text-cyan-400" />
                Historique
              </h5>
              <div className="space-y-2">
                {stats.firstSessionDate && (
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-white/70 text-sm">Première session</span>
                    <span className="text-white font-bold">
                      {format(parseISO(stats.firstSessionDate), 'dd/MM/yyyy')}
                    </span>
                  </div>
                )}
                {stats.lastSessionDate && (
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-white/70 text-sm">Dernière session</span>
                    <span className="text-white font-bold">
                      {format(parseISO(stats.lastSessionDate), 'dd/MM/yyyy')}
                    </span>
                  </div>
                )}
                {stats.cancelledSessions > 0 && (
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-white/70 text-sm">Sessions annulées</span>
                    <span className="text-red-400 font-bold">{stats.cancelledSessions}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Message Motivationnel */}
          <motion.div 
            className="p-5 rounded-xl text-center"
            style={{
              background: `
                radial-gradient(circle at 30% 20%, color-mix(in srgb, ${theme.color} 12%, transparent) 0%, transparent 60%),
                color-mix(in srgb, ${theme.color} 6%, transparent)
              `,
              border: `2px solid color-mix(in srgb, ${theme.color} 25%, transparent)`,
              boxShadow: `
                0 8px 32px rgba(0, 0, 0, 0.2),
                0 0 20px color-mix(in srgb, ${theme.color} 20%, transparent),
                inset 0 1px 0 rgba(255, 255, 255, 0.15)
              `
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <SpatialIcon Icon={ICONS.Lightbulb} size={18} style={{ color: theme.color }} />
              <h4 className="font-bold text-lg" style={{ color: theme.color }}>
                Bilan de votre Forge Temporelle
              </h4>
            </div>
            
            <p className="text-white/90 text-base leading-relaxed">
              {completionRate >= 90 ? 
                `Maîtrise exceptionnelle ! Vous avez complété ${stats.completedSessions} sessions sur ${stats.totalSessions} avec ${stats.totalHours}h de jeûne total. Votre discipline temporelle est remarquable.` :
              completionRate >= 70 ?
                `Excellente progression ! ${Math.round(completionRate)}% de taux de réussite avec une moyenne de ${stats.averageDuration}h par session. Continuez cette régularité.` :
              completionRate >= 50 ?
                `Développement solide ! Votre record personnel est de ${stats.longestSession}h. Visez plus de régularité pour optimiser les bénéfices métaboliques.` :
                `Début prometteur ! Chaque session forge votre discipline. Votre parcours temporel commence avec ${stats.totalSessions} sessions tentées.`
              }
            </p>
          </motion.div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default FastingHistoryStatsCard;