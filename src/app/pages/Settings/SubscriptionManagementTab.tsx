import React, { useState, useEffect, useRef } from 'react';
import { ConditionalMotion } from '../../../lib/motion';
import GlassCard from '../../../ui/cards/GlassCard';
import TokenIcon from '../../../ui/icons/TokenIcon';
import SpatialIcon from '../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../ui/icons/registry';
import { useToast } from '../../../ui/components/ToastProvider';
import { TokenService, type TokenBalance, type PricingConfig, type UserSubscription, type TokenTransaction } from '../../../system/services/tokenService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { usePerformanceMode } from '../../../system/context/PerformanceModeContext';
import { supabase } from '../../../system/supabase/client';
import logger from '../../../lib/utils/logger';

interface PlanConfig {
  color: string;
  gradient: string;
  borderColor: string;
  label: string;
}

const PLAN_COLORS: Record<string, PlanConfig> = {
  free: {
    color: '#64748B',
    gradient: 'linear-gradient(135deg, #64748B, #475569)',
    borderColor: 'rgba(100, 116, 139, 0.3)',
    label: 'Essai Gratuit',
  },
  starter_9: {
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    label: 'Starter',
  },
  pro_19: {
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981, #34D399)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    label: 'Pro',
  },
  premium_29: {
    color: '#F97316',
    gradient: 'linear-gradient(135deg, #F97316, #FB923C)',
    borderColor: 'rgba(249, 115, 22, 0.3)',
    label: 'Premium',
  },
  elite_39: {
    color: '#EC4899',
    gradient: 'linear-gradient(135deg, #EC4899, #F472B6)',
    borderColor: 'rgba(236, 72, 153, 0.3)',
    label: 'Elite',
  },
  expert_49: {
    color: '#EF4444',
    gradient: 'linear-gradient(135deg, #EF4444, #F87171)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    label: 'Expert',
  },
  master_59: {
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    label: 'Master',
  },
  ultimate_99: {
    color: '#FBBF24',
    gradient: 'linear-gradient(135deg, #FBBF24, #FCD34D)',
    borderColor: 'rgba(251, 191, 36, 0.3)',
    label: 'Ultimate',
  },
};

const getPlanConfig = (planId: string, priceEur: number): PlanConfig => {
  if (planId === 'free') return PLAN_COLORS.free;
  if (priceEur === 9) return PLAN_COLORS.starter_9;
  if (priceEur === 19) return PLAN_COLORS.pro_19;
  if (priceEur === 29) return PLAN_COLORS.premium_29;
  if (priceEur === 39) return PLAN_COLORS.elite_39;
  if (priceEur === 49) return PLAN_COLORS.expert_49;
  if (priceEur === 59) return PLAN_COLORS.master_59;
  if (priceEur === 99) return PLAN_COLORS.ultimate_99;
  return PLAN_COLORS.free;
};

interface PlanCardProps {
  planId: string;
  name: string;
  priceEur: number;
  tokensPerMonth: number;
  isCurrentPlan: boolean;
  isFree: boolean;
  onSelect: (planId: string) => void;
  isLoading: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({
  planId,
  name,
  priceEur,
  tokensPerMonth,
  isCurrentPlan,
  isFree,
  onSelect,
  isLoading,
}) => {
  const planConfig = getPlanConfig(planId, priceEur);

  return (
    <ConditionalMotion
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <GlassCard
        className={`p-5 transition-all cursor-pointer ${
          isCurrentPlan
            ? 'ring-2 scale-[1.05] shadow-2xl'
            : 'hover:scale-[1.02]'
        }`}
        style={{
          background: isCurrentPlan
            ? `${planConfig.gradient.replace('linear-gradient', 'linear-gradient(135deg, ')}35, ${planConfig.gradient.split(', ')[1]}20)`
            : `${planConfig.gradient.replace('linear-gradient', 'linear-gradient(135deg, ')}20, ${planConfig.gradient.split(', ')[1]}10)`,
          borderColor: isCurrentPlan
            ? `${planConfig.color}80`
            : planConfig.borderColor,
          boxShadow: isCurrentPlan
            ? `0 0 40px ${planConfig.color}40, 0 8px 32px rgba(0, 0, 0, 0.3)`
            : undefined,
        }}
        onClick={() => !isCurrentPlan && !isLoading && onSelect(planId)}
      >

        <div className="text-center mb-4">
          <h3 className={`text-lg font-bold text-white mb-1 ${
            isCurrentPlan ? 'text-xl' : ''
          }`}>
            {planConfig.label}
          </h3>
          {isFree && (
            <p className="text-xs text-slate-400">Découvrez l'application</p>
          )}
        </div>

        <div className="flex items-center justify-center mb-4">
          <TokenIcon
            size={48}
            variant={isCurrentPlan ? 'success' : 'normal'}
            withGlow={isCurrentPlan}
            customColor={planConfig.color}
          />
        </div>

        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-white mb-1">
            {isFree ? 'Gratuit' : `${priceEur}€`}
          </div>
          <div className="text-xs text-slate-400">
            {isFree ? 'À l\'inscription' : 'par mois'}
          </div>
        </div>

        <div
          className="mb-4 py-3 px-4 rounded-lg border text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderColor: planConfig.borderColor,
          }}
        >
          <div className="text-2xl font-bold text-white mb-1">
            {TokenService.formatTokenAmount(tokensPerMonth)}
          </div>
          <div className="text-xs text-slate-400">tokens / mois</div>
        </div>

        {isCurrentPlan && (
          <div className="mt-4 py-2 px-4 rounded-lg text-center font-bold text-sm" style={{
            background: `linear-gradient(135deg, ${planConfig.color}30, ${planConfig.color}20)`,
            border: `2px solid ${planConfig.color}60`,
            color: '#ffffff',
            textShadow: `0 0 8px ${planConfig.color}`,
          }}>
            ✓ Plan Actuel
          </div>
        )}

        {!isCurrentPlan && !isFree && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(planId);
            }}
            disabled={isLoading}
            className="w-full px-4 py-2.5 rounded-lg font-semibold text-white text-sm transition-all disabled:opacity-50"
            style={{
              background: planConfig.gradient,
            }}
          >
            {isLoading ? 'Chargement...' : 'Choisir ce plan'}
          </button>
        )}

        {isFree && !isCurrentPlan && (
          <div className="text-center text-xs text-slate-500">
            Plan offert à l'inscription
          </div>
        )}
      </GlassCard>
    </ConditionalMotion>
  );
};

const SubscriptionManagementTab: React.FC = () => {
  const { showToast } = useToast();
  const { mode } = usePerformanceMode();
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const realtimeChannelRef = useRef<any>(null);

  const isUltraPerformance = mode === 'high-performance';

  useEffect(() => {
    loadData();
  }, []);

  // Setup realtime subscription for token balance updates
  useEffect(() => {
    let mounted = true;

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mounted) return;

      logger.info('SUBSCRIPTION_TAB', '📡 Setting up realtime subscription for token balance');

      const channel = supabase
        .channel(`subscription-tab-tokens-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_token_balance',
            filter: `user_id=eq.${user.id}`,
          },
          async (payload) => {
            if (!mounted) return;

            logger.info('SUBSCRIPTION_TAB', '🔔 Token balance updated via realtime', {
              event: payload.eventType,
              oldBalance: payload.old?.available_tokens,
              newBalance: payload.new?.available_tokens
            });

            // Reload token balance
            const updatedBalance = await TokenService.getTokenBalance();
            if (updatedBalance && mounted) {
              setTokenBalance(updatedBalance);

              // Show toast notification on balance change
              if (payload.eventType === 'UPDATE' && payload.new?.available_tokens !== payload.old?.available_tokens) {
                const diff = (payload.new?.available_tokens || 0) - (payload.old?.available_tokens || 0);
                if (diff < 0) {
                  showToast({
                    type: 'info',
                    title: 'Tokens consommés',
                    message: `${Math.abs(diff)} tokens utilisés`,
                    duration: 3000,
                  });
                } else if (diff > 0) {
                  showToast({
                    type: 'success',
                    title: 'Tokens ajoutés',
                    message: `+${diff} tokens`,
                    duration: 3000,
                  });
                }
              }
            }
          }
        )
        .subscribe((status) => {
          logger.info('SUBSCRIPTION_TAB', '📡 Realtime subscription status', { status });
        });

      realtimeChannelRef.current = channel;
    };

    setupRealtime();

    return () => {
      mounted = false;
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [showToast]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [balance, sub, config, txs] = await Promise.all([
        TokenService.getTokenBalance(),
        TokenService.getUserSubscription(),
        TokenService.getPricingConfig(),
        TokenService.getTokenTransactions(20),
      ]);
      setTokenBalance(balance);
      setSubscription(sub);
      setPricingConfig(config);
      setTransactions(txs);

      if (config?.subscriptionPlans) {
        console.log('Loaded subscription plans:', config.subscriptionPlans);
        Object.entries(config.subscriptionPlans).forEach(([planId, plan]) => {
          console.log(`Plan ${planId}:`, plan);
        });
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les données',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    if (isCreatingSession) return;
    setIsCreatingSession(true);
    try {
      const result = await TokenService.createCheckoutSession('subscription', planId);
      if (result?.url) {
        window.location.href = result.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de créer la session de paiement',
        duration: 3000,
      });
      setIsCreatingSession(false);
    }
  };

  const handlePurchaseTokenPack = async (packId: string) => {
    if (isCreatingSession) return;
    setIsCreatingSession(true);
    try {
      const result = await TokenService.createCheckoutSession('payment', undefined, packId);
      if (result?.url) {
        window.location.href = result.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de créer la session de paiement',
        duration: 3000,
      });
      setIsCreatingSession(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-center h-40">
            <div className="text-slate-400">Chargement...</div>
          </div>
        </GlassCard>
      </div>
    );
  }

  const currentPlanType = subscription?.planType || 'free';
  const plans = pricingConfig?.subscriptionPlans || {};

  // Calculer les jours restants pour l'essai gratuit (14 jours)
  const calculateTrialDaysRemaining = () => {
    if (!subscription || subscription.status !== 'trialing') return null;

    const trialEndDate = subscription.trialEnd ? new Date(subscription.trialEnd) : null;
    if (!trialEndDate) return null;

    const now = new Date();
    const diffTime = trialEndDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  const trialDaysRemaining = calculateTrialDaysRemaining();

  // Ordre des forfaits du plus petit au plus grand
  const planOrder = ['starter_9', 'pro_19', 'premium_29', 'elite_39', 'expert_49', 'master_59', 'ultimate_99', 'free'];
  const sortedPlans = Object.entries(plans)
    .sort(([aId], [bId]) => {
      const aIndex = planOrder.indexOf(aId);
      const bIndex = planOrder.indexOf(bId);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

  const pack19 = pricingConfig?.tokenPacks?.pack_19;
  const displayedTransactions = showAllTransactions ? transactions : transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="rounded-xl p-5 border"
            style={isUltraPerformance ? {
              background: 'rgba(247, 147, 30, 0.15)',
              borderColor: 'rgba(247, 147, 30, 0.3)',
            } : {
              background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(253, 200, 48, 0.05))',
              borderColor: 'rgba(247, 147, 30, 0.3)',
              boxShadow: '0 4px 16px rgba(247, 147, 30, 0.1)'
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400 font-medium">Tokens Disponibles</span>
              <TokenIcon size={24} variant="success" withGlow={false} />
            </div>
            <div
              className="text-4xl font-bold mb-1"
              style={isUltraPerformance ? {
                color: '#F7931E'
              } : {
                background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FDC830 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {tokenBalance ? TokenService.formatTokenAmount(tokenBalance.balance) : '0'}
            </div>
            <div className="text-xs text-slate-500">
              Votre réserve d'énergie numérique
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400 font-medium">Statut</span>
              <SpatialIcon
                Icon={subscription?.status === 'active' ? ICONS.Check : ICONS.Clock}
                size={20}
                color={subscription?.status === 'active' ? '#10B981' : '#3B82F6'}
                variant="pure"
              />
            </div>
            <div className={`text-3xl font-bold mb-1 ${
              subscription?.status === 'active' ? 'text-emerald-400' : 'text-blue-400'
            }`}>
              {subscription?.status === 'active' ? 'Actif' : 'Essai Gratuit'}
            </div>
            <div className="text-xs text-slate-500">
              {subscription?.status === 'active'
                ? `Renouvellement le ${format(new Date(subscription.currentPeriodEnd), 'dd/MM/yyyy', { locale: fr })}`
                : trialDaysRemaining !== null
                  ? `${trialDaysRemaining} ${trialDaysRemaining > 1 ? 'jours restants' : 'jour restant'} sur 14`
                  : '15 000 tokens offerts pour découvrir l\'app'
              }
            </div>
          </div>
        </div>
      </GlassCard>

      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Forfaits Mensuels</h2>
        <p className="text-sm text-slate-400 mb-6">
          Choisissez le forfait qui correspond à votre utilisation. Vos tokens sont renouvelés automatiquement chaque mois.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sortedPlans.map(([planId, plan]) => {
            if (!plan) {
              console.warn(`Plan ${planId} is undefined`);
              return null;
            }
            return (
              <PlanCard
                key={planId}
                planId={planId}
                name={plan.name || planId}
                priceEur={plan.price_eur || 0}
                tokensPerMonth={plan.tokens_per_month || 0}
                isCurrentPlan={currentPlanType === planId}
                isFree={planId === 'free'}
                onSelect={handleSelectPlan}
                isLoading={isCreatingSession}
              />
            );
          })}
        </div>
      </div>

      {pack19 && (
        <GlassCard className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <TokenIcon size={48} variant="warning" withGlow={false} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">Besoin de tokens supplémentaires ?</h3>
              <p className="text-sm text-slate-400 mb-4">
                Rechargez votre réserve à tout moment avec un pack de tokens. Les tokens achetés sont permanents et s'ajoutent à votre solde mensuel.
              </p>
              <div className="flex items-center gap-4">
                <div
                  className="px-4 py-2 rounded-lg border"
                  style={{
                    background: 'rgba(247, 147, 30, 0.1)',
                    borderColor: 'rgba(247, 147, 30, 0.3)',
                  }}
                >
                  <div className="text-sm font-semibold text-white">
                    {TokenService.formatTokenAmount(pack19.tokens)} tokens
                  </div>
                </div>
                <button
                  onClick={() => handlePurchaseTokenPack('pack_19')}
                  disabled={isCreatingSession}
                  className="px-6 py-2 rounded-lg font-semibold text-white text-sm transition-all disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
                  }}
                >
                  {isCreatingSession ? 'Chargement...' : `Acheter pour ${TokenService.formatCurrency(pack19.price_eur)}`}
                </button>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {transactions.length > 0 && (
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <SpatialIcon Icon={ICONS.History} size={24} color="#60A5FA" variant="pure" />
              <h3 className="text-lg font-bold text-white">Historique des Transactions</h3>
            </div>
            {transactions.length > 5 && (
              <button
                onClick={() => setShowAllTransactions(!showAllTransactions)}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                {showAllTransactions ? 'Voir moins' : `Voir tout (${transactions.length})`}
              </button>
            )}
          </div>

          <div className="space-y-2">
            {displayedTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-3 px-4 bg-slate-800/30 rounded-lg border border-slate-700/30"
              >
                <div className="flex items-center gap-3 flex-1">
                  <TokenIcon
                    size={28}
                    variant={tx.transactionType === 'consume' ? 'warning' : 'success'}
                    withGlow={false}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white mb-1">
                      {tx.operationType ? TokenService.getOperationTypeLabel(tx.operationType) : tx.source || 'Transaction'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {format(new Date(tx.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-sm font-bold ${
                      tx.transactionType === 'consume' ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {tx.transactionType === 'consume' ? '-' : '+'}
                    {tx.amount}
                  </div>
                  <div className="text-xs text-slate-500">
                    Solde: {tx.balanceAfter}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <GlassCard className="p-6">
        <div className="flex items-start gap-3">
          <SpatialIcon Icon={ICONS.Info} size={20} color="#60A5FA" variant="pure" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white mb-3">Comment fonctionnent les forfaits ?</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <p>
                <strong className="text-white">Renouvellement automatique :</strong> Vos tokens sont renouvelés automatiquement chaque mois à la date anniversaire de votre abonnement.
              </p>
              <p>
                <strong className="text-white">Tokens non utilisés :</strong> Les tokens non utilisés d'un mois ne sont pas reportés. Choisissez le forfait adapté à votre utilisation réelle.
              </p>
              <p>
                <strong className="text-white">Changement de forfait :</strong> Vous pouvez changer de forfait à tout moment. Le changement prendra effet lors du prochain renouvellement.
              </p>
              <p>
                <strong className="text-white">Annulation :</strong> Vous pouvez annuler votre abonnement à tout moment. Vous conserverez l'accès jusqu'à la fin de la période en cours.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default SubscriptionManagementTab;
