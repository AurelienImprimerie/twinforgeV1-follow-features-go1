import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Activity, TrendingUp, Database, Clock } from 'lucide-react';
import GlassCard from '../../ui/cards/GlassCard';
import { supabase } from '../../system/supabase/client';
import logger from '../../lib/utils/logger';

interface TokenAnomaly {
  id: string;
  user_id: string;
  anomaly_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  edge_function_name: string | null;
  operation_type: string | null;
  description: string;
  request_count: number | null;
  time_window_seconds: number | null;
  attempted_tokens: number | null;
  actual_balance: number | null;
  action_taken: string | null;
  resolved: boolean;
  created_at: string;
}

interface ConsumptionLock {
  request_id: string;
  user_id: string;
  edge_function_name: string;
  operation_type: string;
  token_amount: number;
  status: string;
  created_at: string;
  expires_at: string;
}

interface Stats {
  totalAnomalies: number;
  unresolvedAnomalies: number;
  criticalAnomalies: number;
  activeLocks: number;
  recentConsumptions: number;
}

export default function DevCacheMonitoringPage() {
  const [anomalies, setAnomalies] = useState<TokenAnomaly[]>([]);
  const [locks, setLocks] = useState<ConsumptionLock[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalAnomalies: 0,
    unresolvedAnomalies: 0,
    criticalAnomalies: 0,
    activeLocks: 0,
    recentConsumptions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedAnomaly, setSelectedAnomaly] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('DEV_MONITORING', 'User not authenticated');
        return;
      }

      // Load anomalies
      const { data: anomaliesData, error: anomaliesError } = await supabase
        .from('token_anomalies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (anomaliesError) {
        logger.error('DEV_MONITORING', 'Failed to load anomalies', { error: anomaliesError.message });
      } else {
        setAnomalies(anomaliesData || []);
      }

      // Load active locks
      const { data: locksData, error: locksError } = await supabase
        .from('token_consumption_locks')
        .select('*')
        .eq('user_id', user.id)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (locksError) {
        logger.error('DEV_MONITORING', 'Failed to load locks', { error: locksError.message });
      } else {
        setLocks(locksData || []);
      }

      // Calculate stats
      const unresolvedCount = (anomaliesData || []).filter(a => !a.resolved).length;
      const criticalCount = (anomaliesData || []).filter(a => a.severity === 'critical').length;
      const activeLockCount = (locksData || []).filter(l => l.status === 'pending').length;

      setStats({
        totalAnomalies: (anomaliesData || []).length,
        unresolvedAnomalies: unresolvedCount,
        criticalAnomalies: criticalCount,
        activeLocks: (locksData || []).length,
        recentConsumptions: activeLockCount,
      });

      logger.info('DEV_MONITORING', 'Data loaded successfully', {
        anomaliesCount: anomaliesData?.length || 0,
        locksCount: locksData?.length || 0
      });
    } catch (error) {
      logger.error('DEV_MONITORING', 'Exception loading data', { error });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getAnomalyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'high_frequency': '⚡ Haute Fréquence',
      'duplicate_request': '🔄 Requête Dupliquée',
      'race_condition_attempt': '⚔️ Tentative Race Condition',
      'suspicious_pattern': '🔍 Pattern Suspect',
      'balance_mismatch': '⚠️ Désynchronisation',
      'failed_consumption': '❌ Échec de Consommation',
    };
    return labels[type] || type;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-400" />
            Token Security Monitoring
          </h1>
          <p className="text-neutral-400">Surveillance en temps réel du système de tokens</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Activity className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Rafraîchir
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <GlassCard variant="premium">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-400">Total Anomalies</p>
              <p className="text-2xl font-bold text-white">{stats.totalAnomalies}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="premium">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-yellow-500/10">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-400">Non Résolues</p>
              <p className="text-2xl font-bold text-white">{stats.unresolvedAnomalies}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="premium">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-red-500/10">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-400">Critiques</p>
              <p className="text-2xl font-bold text-white">{stats.criticalAnomalies}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="premium">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-500/10">
              <Database className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-400">Verrous Actifs</p>
              <p className="text-2xl font-bold text-white">{stats.activeLocks}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="premium">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-500/10">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-400">En Cours</p>
              <p className="text-2xl font-bold text-white">{stats.recentConsumptions}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Anomalies Section */}
      <GlassCard variant="premium">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          Anomalies Détectées
        </h2>

        {loading ? (
          <div className="text-center py-8 text-neutral-400">Chargement...</div>
        ) : anomalies.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <p className="text-green-400 font-medium">Aucune anomalie détectée</p>
            <p className="text-neutral-400 text-sm mt-2">Le système fonctionne normalement</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {anomalies.map((anomaly) => (
              <div
                key={anomaly.id}
                className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                  getSeverityColor(anomaly.severity)
                } ${selectedAnomaly === anomaly.id ? 'ring-2 ring-white/20' : ''}`}
                onClick={() => setSelectedAnomaly(selectedAnomaly === anomaly.id ? null : anomaly.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-white">
                        {getAnomalyTypeLabel(anomaly.anomaly_type)}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold border ${
                        getSeverityColor(anomaly.severity)
                      }`}>
                        {anomaly.severity}
                      </span>
                      {!anomaly.resolved && (
                        <span className="px-2 py-0.5 rounded text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          Non résolu
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/80 mb-2">{anomaly.description}</p>
                    <div className="flex items-center gap-4 text-xs text-neutral-400">
                      {anomaly.edge_function_name && (
                        <span>📦 {anomaly.edge_function_name}</span>
                      )}
                      {anomaly.request_count && (
                        <span>📊 {anomaly.request_count} requêtes</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(anomaly.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedAnomaly === anomaly.id && (
                  <div className="mt-4 p-3 rounded bg-black/30 border border-white/5">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {anomaly.time_window_seconds && (
                        <div>
                          <span className="text-neutral-400">Fenêtre temporelle:</span>
                          <span className="text-white ml-2">{anomaly.time_window_seconds}s</span>
                        </div>
                      )}
                      {anomaly.attempted_tokens && (
                        <div>
                          <span className="text-neutral-400">Tokens tentés:</span>
                          <span className="text-white ml-2">{anomaly.attempted_tokens}</span>
                        </div>
                      )}
                      {anomaly.actual_balance !== null && (
                        <div>
                          <span className="text-neutral-400">Solde réel:</span>
                          <span className="text-white ml-2">{anomaly.actual_balance}</span>
                        </div>
                      )}
                      {anomaly.action_taken && (
                        <div className="col-span-2">
                          <span className="text-neutral-400">Action prise:</span>
                          <span className="text-white ml-2">{anomaly.action_taken}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Active Locks Section */}
      {locks.length > 0 && (
        <GlassCard variant="premium">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-green-400" />
            Verrous Actifs
          </h2>

          <div className="space-y-2">
            {locks.map((lock) => {
              const isExpired = new Date(lock.expires_at) < new Date();
              const isPending = lock.status === 'pending';

              return (
                <div
                  key={lock.request_id}
                  className={`p-3 rounded-lg border ${
                    isExpired
                      ? 'bg-red-500/10 border-red-500/30'
                      : isPending
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-green-500/10 border-green-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex-1">
                      <span className="text-white font-medium">{lock.edge_function_name}</span>
                      <span className="text-neutral-400 ml-2">/ {lock.operation_type}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-400">
                      <span>{lock.token_amount} tokens</span>
                      <span className={`px-2 py-1 rounded uppercase font-bold ${
                        lock.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : lock.status === 'failed'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {lock.status}
                      </span>
                      <span>
                        {isExpired ? '⏰ Expiré' : `⏳ Expire dans ${Math.round((new Date(lock.expires_at).getTime() - Date.now()) / 1000)}s`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
