import { useEffect } from 'react';
import { useToast } from '../ui/components/ToastProvider';
import { supabase } from '../system/supabase/client';
import logger from '../lib/utils/logger';

export function useWelcomeTokensToast() {
  const { showToast } = useToast();

  useEffect(() => {
    checkAndShowWelcomeToast();
  }, []);

  const checkAndShowWelcomeToast = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const toastKey = `welcome_tokens_toast_shown_${user.id}`;
      const hasShownToast = localStorage.getItem(toastKey);

      if (hasShownToast) {
        return;
      }

      const { data: transactions } = await supabase
        .from('token_transactions')
        .select('token_amount, created_at')
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

        if (diffMinutes < 10) {
          setTimeout(() => {
            showToast({
              type: 'success',
              title: 'Bienvenue sur TwinForgeFit!',
              message: `Vous avez reçu ${transaction.token_amount.toLocaleString('fr-FR')} tokens pour commencer votre aventure.`,
              duration: 6000
            });

            localStorage.setItem(toastKey, 'true');

            logger.info('WELCOME_TOKENS_TOAST', 'Welcome tokens toast shown', {
              userId: user.id,
              tokenAmount: transaction.token_amount
            });
          }, 2000);
        }
      }
    } catch (error) {
      logger.error('WELCOME_TOKENS_TOAST', 'Error checking for welcome tokens toast', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
