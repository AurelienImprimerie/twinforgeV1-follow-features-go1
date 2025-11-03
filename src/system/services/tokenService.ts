import { supabase } from '../supabase/client';
import logger from '../../lib/utils/logger';

export interface TokenBalance {
  balance: number;
  lastResetAt: string;
}

export interface TokenTransaction {
  id: string;
  userId: string;
  transactionType: 'consume' | 'add' | 'refund';
  amount: number;
  balanceAfter: number;
  source: string | null;
  edgeFunctionName: string | null;
  operationType: string | null;
  openaiModel: string | null;
  openaiInputTokens: number | null;
  openaiOutputTokens: number | null;
  openaiCostUsd: number | null;
  metadata: any;
  createdAt: string;
}

export interface SubscriptionPlan {
  name: string;
  tokens_per_month: number;
  price_eur: number;
  stripe_price_id: string | null;
}

export interface TokenPack {
  name: string;
  tokens: number;
  price_eur: number;
  bonus_percent: number;
}

export interface PricingConfig {
  subscriptionPlans: Record<string, SubscriptionPlan>;
  tokenPacks: Record<string, TokenPack>;
}

export interface UserSubscription {
  id: string;
  userId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  planType: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export class TokenService {
  static async getTokenBalance(): Promise<TokenBalance | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Use maybeSingle() instead of single() to avoid PGRST116 error when row doesn't exist
      const { data, error } = await supabase
        .from('user_token_balance')
        .select('available_tokens, last_monthly_reset')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        logger.error('TOKEN_SERVICE', 'Error fetching token balance', { error });
        return null;
      }

      // If no data, user token balance hasn't been initialized yet
      if (!data) {
        logger.warn('TOKEN_SERVICE', 'Token balance not found for user - may need initialization', { userId: user.id });
        return null;
      }

      return {
        balance: data.available_tokens,
        lastResetAt: data.last_monthly_reset,
      };
    } catch (error) {
      logger.logError('Unexpected error fetching token balance', error);
      return null;
    }
  }

  static async getTokenTransactions(limit: number = 50): Promise<TokenTransaction[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('token_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('TOKEN_SERVICE', 'Error fetching token transactions', { error });
        return [];
      }

      return data.map(tx => ({
        id: tx.id,
        userId: tx.user_id,
        transactionType: tx.transaction_type,
        amount: tx.token_amount,
        balanceAfter: tx.balance_after,
        source: tx.metadata?.source || null,
        edgeFunctionName: tx.edge_function_name,
        operationType: tx.operation_type,
        openaiModel: tx.openai_model_used,
        openaiInputTokens: tx.openai_tokens_input,
        openaiOutputTokens: tx.openai_tokens_output,
        openaiCostUsd: tx.openai_cost_usd,
        metadata: tx.metadata,
        createdAt: tx.created_at,
      }));
    } catch (error) {
      logger.logError('Unexpected error fetching token transactions', error);
      return [];
    }
  }

  static async getPricingConfig(): Promise<PricingConfig | null> {
    try {
      // Use maybeSingle() for pricing config too
      const { data, error } = await supabase
        .from('token_pricing_config')
        .select('subscription_plans, token_packs')
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        logger.error('TOKEN_SERVICE', 'Error fetching pricing config', { error });
        return null;
      }

      return {
        subscriptionPlans: data.subscription_plans,
        tokenPacks: data.token_packs,
      };
    } catch (error) {
      logger.logError('Unexpected error fetching pricing config', error);
      return null;
    }
  }

  static async getUserSubscription(): Promise<UserSubscription | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Use maybeSingle() instead of single() to avoid PGRST116 error
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        logger.error('TOKEN_SERVICE', 'Error fetching user subscription', { error });
        return null;
      }

      if (!data) {
        // No subscription found
        return null;
      }

      return {
        id: data.id,
        userId: data.user_id,
        status: data.status,
        planType: data.plan_type,
        stripeCustomerId: data.stripe_customer_id,
        stripeSubscriptionId: data.stripe_subscription_id,
        currentPeriodStart: data.current_period_start,
        currentPeriodEnd: data.current_period_end,
        cancelAtPeriodEnd: data.cancel_at_period_end,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      logger.logError('Unexpected error fetching user subscription', error);
      return null;
    }
  }

  static async createCheckoutSession(
    mode: 'subscription' | 'payment',
    planType?: string,
    tokenPackId?: string
  ): Promise<{ url: string } | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mode,
            plan_type: planType,
            token_pack_id: tokenPackId,
            success_url: `${window.location.origin}/settings?tab=subscription&success=true`,
            cancel_url: `${window.location.origin}/settings?tab=subscription&canceled=true`,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        logger.error('TOKEN_SERVICE', 'Error creating checkout session', { error });
        return null;
      }

      const data = await response.json();
      return { url: data.url };
    } catch (error) {
      logger.logError('Unexpected error creating checkout session', error);
      return null;
    }
  }

  static async createPortalSession(): Promise<{ url: string } | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            return_url: `${window.location.origin}/settings?tab=subscription`,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        logger.error('TOKEN_SERVICE', 'Error creating portal session', { error });
        return null;
      }

      const data = await response.json();
      return { url: data.url };
    } catch (error) {
      logger.logError('Unexpected error creating portal session', error);
      return null;
    }
  }

  static formatTokenAmount(tokens: number | undefined | null): string {
    if (tokens === undefined || tokens === null || isNaN(tokens)) {
      return '0';
    }
    if (tokens >= 1000) {
      // Use Math.floor to avoid rounding up (14973 → 14.9k not 15.0k)
      const thousands = Math.floor(tokens / 100) / 10;
      return `${thousands.toFixed(1)}k`;
    }
    return tokens.toString();
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }

  static getOperationTypeLabel(operationType: string): string {
    const labels: Record<string, string> = {
      'chat-completion': 'Assistant conversationnel',
      'image-generation': 'Génération d\'illustration',
      'audio-transcription': 'Transcription audio',
      'voice-realtime': 'Coach vocal en temps réel',
      'body-scan-analysis': 'Analyse corporelle',
      'meal-analysis': 'Analyse nutritionnelle',
      'training-analysis': 'Analyse d\'entraînement',
      'recipe-generation': 'Génération de recette',
      'insight-generation': 'Génération d\'insights',
    };
    return labels[operationType] || operationType;
  }

  static subscribeToPricingConfig(callback: (config: PricingConfig | null) => void) {
    const channel = supabase
      .channel('pricing-config-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'token_pricing_config',
        },
        async () => {
          const config = await this.getPricingConfig();
          callback(config);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  static subscribeToTokenBalance(userId: string, callback: (balance: TokenBalance | null) => void) {
    const channel = supabase
      .channel(`token-balance-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_token_balance',
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          const balance = await this.getTokenBalance();
          callback(balance);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}
