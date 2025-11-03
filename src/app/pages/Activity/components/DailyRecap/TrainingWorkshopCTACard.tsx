/**
 * TrainingWorkshopCTACard
 * CTA card invitant à utiliser le générateur de training
 * Affiché dans l'onglet Aujourd'hui de la Forge Énergétique
 * Condition: Affiche si pas de training depuis 3 jours
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { Haptics } from '../../../../../utils/haptics';
import { supabase } from '../../../../../system/supabase/client';
import { useUserStore } from '../../../../../system/store/userStore';
import { differenceInDays } from 'date-fns';

const TRAINING_COLOR = '#18E3FF';

interface LastTrainingInfo {
  lastSessionDate: Date | null;
  daysSinceLastSession: number;
  hasDraft: boolean;
}

const TrainingWorkshopCTACard: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useUserStore();

  // Récupérer les informations sur le dernier training
  const { data: trainingInfo, isLoading } = useQuery<LastTrainingInfo>({
    queryKey: ['last-training-info', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        return {
          lastSessionDate: null,
          daysSinceLastSession: 999,
          hasDraft: false,
        };
      }

      // Chercher la dernière session complétée
      const { data: lastSession } = await supabase
        .from('training_sessions')
        .select('completed_at')
        .eq('user_id', session.user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Chercher si un draft existe
      const { data: draftSession } = await supabase
        .from('training_sessions')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('status', 'draft')
        .limit(1)
        .maybeSingle();

      const lastSessionDate = lastSession?.completed_at
        ? new Date(lastSession.completed_at)
        : null;

      const daysSinceLastSession = lastSessionDate
        ? differenceInDays(new Date(), lastSessionDate)
        : 999;

      return {
        lastSessionDate,
        daysSinceLastSession,
        hasDraft: !!draftSession,
      };
    },
    enabled: !!session?.user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Ne pas afficher si moins de 3 jours depuis le dernier training
  if (!isLoading && trainingInfo && trainingInfo.daysSinceLastSession < 3) {
    return null;
  }

  const handleNavigateToTraining = () => {
    Haptics.press();
    navigate('/training/pipeline');
  };

  if (isLoading) {
    return null; // Pas de skeleton, simplement masquer pendant le chargement
  }

  // Messages contextuels
  const getMessage = (): { title: string; subtitle: string; buttonText: string } => {
    if (!trainingInfo) {
      return {
        title: 'Commencez votre première session',
        subtitle: 'Générez un programme d\'entraînement personnalisé',
        buttonText: 'Créer mon Training',
      };
    }

    if (trainingInfo.hasDraft) {
      return {
        title: 'Reprendre votre draft',
        subtitle: 'Vous avez une session en cours de préparation',
        buttonText: 'Continuer le Training',
      };
    }

    if (trainingInfo.daysSinceLastSession >= 7) {
      return {
        title: 'Prêt à reprendre le training?',
        subtitle: 'Plus de 7 jours sans entraînement structuré',
        buttonText: 'Générer une Séance',
      };
    }

    return {
      title: 'Besoin d\'un plan structuré?',
      subtitle: 'Générez votre prochaine séance personnalisée',
      buttonText: 'Lancer le Générateur',
    };
  };

  const message = getMessage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard
        className="p-6 relative overflow-hidden cursor-pointer"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, ${TRAINING_COLOR} 12%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, ${TRAINING_COLOR} 8%, transparent) 0%, transparent 50%),
            rgba(255, 255, 255, 0.08)
          `,
          border: `1px solid color-mix(in srgb, ${TRAINING_COLOR} 25%, transparent)`,
          boxShadow: `0 4px 16px rgba(0, 0, 0, 0.2), 0 0 24px color-mix(in srgb, ${TRAINING_COLOR} 12%, transparent)`,
        }}
        onClick={handleNavigateToTraining}
      >
        {/* Particles d'angle animés */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-sm"
              style={{
                background: `linear-gradient(135deg, ${TRAINING_COLOR}, rgba(255, 255, 255, 0.8))`,
                boxShadow: `0 0 12px ${TRAINING_COLOR}`,
                top: i < 2 ? '8px' : 'auto',
                bottom: i >= 2 ? '8px' : 'auto',
                left: i % 2 === 0 ? '8px' : 'auto',
                right: i % 2 === 1 ? '8px' : 'auto',
              }}
              initial={{
                rotate: i % 2 === 0 ? 45 : -45,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
                rotate: i % 2 === 0 ? [45, 55, 45] : [-45, -55, -45],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.15,
                ease: [0.4, 0, 0.2, 1],
              }}
            />
          ))}
        </div>

        {/* Header avec icône */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, color-mix(in srgb, ${TRAINING_COLOR} 35%, transparent) 0%, transparent 60%),
                  rgba(255, 255, 255, 0.12)
                `,
                border: `2px solid color-mix(in srgb, ${TRAINING_COLOR} 50%, transparent)`,
                boxShadow: `0 4px 16px color-mix(in srgb, ${TRAINING_COLOR} 30%, transparent)`,
              }}
              whileHover={{ scale: 1.05, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  y: [0, -2, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <SpatialIcon
                  Icon={ICONS.Dumbbell}
                  size={24}
                  style={{
                    color: TRAINING_COLOR,
                    filter: `drop-shadow(0 0 12px ${TRAINING_COLOR}90)`,
                  }}
                />
              </motion.div>
            </motion.div>
            <div>
              <h3 className="text-white font-bold text-lg">
                Atelier de Training
              </h3>
              <p className="text-white/50 text-xs">
                Générateur intelligent de séances
              </p>
            </div>
          </div>

          <motion.div
            whileHover={{ x: 3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <SpatialIcon
              Icon={ICONS.ChevronRight}
              size={20}
              style={{ color: 'rgba(255, 255, 255, 0.4)' }}
            />
          </motion.div>
        </div>

        {/* Message principal */}
        <div className="mb-4 relative z-10">
          <h4 className="text-white font-semibold text-base mb-1">
            {message.title}
          </h4>
          <p className="text-white/60 text-sm">
            {message.subtitle}
          </p>
        </div>

        {/* Badge d'information si draft ou délai */}
        {trainingInfo && (trainingInfo.hasDraft || trainingInfo.daysSinceLastSession >= 7) && (
          <div
            className="px-3 py-2 rounded-lg mb-4 flex items-center gap-2 relative z-10"
            style={{
              background: trainingInfo.hasDraft
                ? 'rgba(34, 197, 94, 0.1)'
                : 'rgba(245, 158, 11, 0.1)',
              border: trainingInfo.hasDraft
                ? '1px solid rgba(34, 197, 94, 0.2)'
                : '1px solid rgba(245, 158, 11, 0.2)',
            }}
          >
            <SpatialIcon
              Icon={trainingInfo.hasDraft ? ICONS.FileText : ICONS.Clock}
              size={14}
              style={{
                color: trainingInfo.hasDraft ? '#22C55E' : '#F59E0B',
              }}
            />
            <span className="text-xs text-white/80">
              {trainingInfo.hasDraft
                ? 'Draft sauvegardé prêt à être repris'
                : `${trainingInfo.daysSinceLastSession} jours sans training structuré`}
            </span>
          </div>
        )}

        {/* Bouton CTA */}
        <motion.button
          whileHover={{
            scale: 1.02,
            y: -2,
            transition: { type: 'spring', stiffness: 400, damping: 25 },
          }}
          whileTap={{
            scale: 0.98,
            y: 0,
            transition: { type: 'spring', stiffness: 500, damping: 30 },
          }}
          className="w-full px-4 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 relative overflow-hidden group"
          style={{
            background: `linear-gradient(180deg, ${TRAINING_COLOR} 0%, color-mix(in srgb, ${TRAINING_COLOR} 85%, #000) 100%)`,
            border: `2px solid ${TRAINING_COLOR}`,
            color: '#FFFFFF',
            textShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
            boxShadow: `
              0 1px 0 0 rgba(255, 255, 255, 0.35) inset,
              0 -1px 0 0 rgba(0, 0, 0, 0.2) inset,
              0 10px 30px -5px color-mix(in srgb, ${TRAINING_COLOR} 60%, transparent),
              0 5px 15px -2px rgba(0, 0, 0, 0.5)
            `,
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(120deg, transparent 0%, transparent 40%, rgba(255, 255, 255, 0.3) 50%, transparent 60%, transparent 100%)',
            }}
            animate={{
              x: ['-200%', '200%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2,
              ease: 'easeInOut',
            }}
          />

          {/* Highlight en haut */}
          <div
            className="absolute top-0 left-8 right-8 h-[2px] rounded-full opacity-60"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
            }}
          />

          <span className="relative z-10">{message.buttonText}</span>
          <motion.div
            className="relative z-10"
            animate={{ x: [0, 4, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <SpatialIcon
              Icon={ICONS.Target}
              size={18}
              style={{
                color: '#FFFFFF',
                filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.6))',
              }}
            />
          </motion.div>

          {/* Glow shadow en bas */}
          <div
            className="absolute -bottom-2 left-8 right-8 h-2 rounded-full blur-md opacity-50 group-hover:opacity-70 transition-opacity"
            style={{
              background: `radial-gradient(ellipse, ${TRAINING_COLOR} 0%, transparent 70%)`,
            }}
          />
        </motion.button>
      </GlassCard>
    </motion.div>
  );
};

export default TrainingWorkshopCTACard;
