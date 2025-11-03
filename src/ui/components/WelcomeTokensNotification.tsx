import React, { useEffect, useState } from 'react';
import { ConditionalMotion } from '../../lib/motion';
import TokenIcon from '../icons/TokenIcon';
import SpatialIcon from '../icons/SpatialIcon';
import { ICONS } from '../icons/registry';
import { TokenService } from '../../system/services/tokenService';
import { supabase } from '../../system/supabase/client';
import logger from '../../lib/utils/logger';

interface WelcomeTokensNotificationProps {
  onDismiss?: () => void;
}

const WelcomeTokensNotification: React.FC<WelcomeTokensNotificationProps> = ({ onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tokenAmount, setTokenAmount] = useState(15000);

  useEffect(() => {
    checkForWelcomeTokens();
  }, []);

  const checkForWelcomeTokens = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const hasSeenWelcome = localStorage.getItem(`welcome_tokens_shown_${user.id}`);

      if (hasSeenWelcome) {
        logger.info('WELCOME_TOKENS', 'User has already seen welcome notification', { userId: user.id });
        return;
      }

      const { data: transactions } = await supabase
        .from('token_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('transaction_type', 'bonus')
        .or('metadata->>reason.eq.welcome_bonus,metadata->>reason.eq.backfill_welcome_bonus')
        .order('created_at', { ascending: false })
        .limit(1);

      if (transactions && transactions.length > 0) {
        const transaction = transactions[0];
        const createdAt = new Date(transaction.created_at);
        const now = new Date();
        const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

        if (diffMinutes < 5) {
          setTokenAmount(transaction.token_amount);
          setIsVisible(true);

          logger.info('WELCOME_TOKENS', 'Showing welcome tokens notification', {
            userId: user.id,
            tokenAmount: transaction.token_amount,
            transactionAge: diffMinutes
          });

          setTimeout(() => {
            handleDismiss();
          }, 10000);
        }
      }
    } catch (error) {
      logger.error('WELCOME_TOKENS', 'Error checking for welcome tokens', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const handleDismiss = async () => {
    setIsVisible(false);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      localStorage.setItem(`welcome_tokens_shown_${user.id}`, 'true');

      logger.info('WELCOME_TOKENS', 'Welcome notification dismissed', { userId: user.id });
    }

    if (onDismiss) {
      onDismiss();
    }
  };

  if (!isVisible) return null;

  return (
    <ConditionalMotion
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-full mx-4"
    >
      <div className="glass-card-premium p-6 rounded-2xl shadow-2xl border border-white/20">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <ConditionalMotion
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1
              }}
            >
              <TokenIcon
                size={48}
                variant="success"
                withGlow={true}
              />
            </ConditionalMotion>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-1">
              Bienvenue sur TwinForgeFit !
            </h3>
            <p className="text-sm text-white/80 mb-3">
              Vous avez reçu <span className="font-bold text-emerald-400">{TokenService.formatTokenAmount(tokenAmount)} tokens</span> pour commencer votre aventure.
              Utilisez-les pour analyser vos repas, créer des programmes d'entraînement personnalisés et bien plus encore.
            </p>

            <div className="flex items-center gap-2 text-xs text-white/60">
              <SpatialIcon
                Icon={ICONS.Info}
                size={14}
                className="flex-shrink-0"
              />
              <span>
                Vos tokens se rechargent chaque mois avec votre abonnement
              </span>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Fermer"
          >
            <SpatialIcon
              Icon={ICONS.X}
              size={20}
              className="text-white/60 hover:text-white"
            />
          </button>
        </div>

        <ConditionalMotion
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: 10, ease: "linear" }}
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-b-2xl origin-left"
          style={{ width: '100%' }}
        />
      </div>
    </ConditionalMotion>
  );
};

export default WelcomeTokensNotification;
