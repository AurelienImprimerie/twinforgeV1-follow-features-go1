import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw, AlertCircle, Database, Clock, CheckCircle, Server } from 'lucide-react';
import GlassCard from '../../ui/cards/GlassCard';
import logger from '../../lib/utils/logger';
import { supabase } from '../../system/supabase/client';

interface CacheEntry {
  key: string;
  value: any;
  size: number;
  timestamp?: string;
}

interface CacheStats {
  totalEntries: number;
  totalSize: number;
  aiCacheEntries: number;
  aiCacheSize: number;
}

interface SupabaseCacheEntry {
  cache_key: string;
  cache_type: string;
  cached_data: any;
  created_at: string;
  expires_at: string;
  user_id?: string;
}

export default function DevCachePage() {
  const [cacheEntries, setCacheEntries] = useState<CacheEntry[]>([]);
  const [stats, setStats] = useState<CacheStats>({
    totalEntries: 0,
    totalSize: 0,
    aiCacheEntries: 0,
    aiCacheSize: 0,
  });
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string>('');
  const [supabaseCacheEntries, setSupabaseCacheEntries] = useState<SupabaseCacheEntry[]>([]);
  const [loadingSupabaseCache, setLoadingSupabaseCache] = useState(false);

  const loadCacheData = () => {
    const entries: CacheEntry[] = [];
    let totalSize = 0;
    let aiCacheEntries = 0;
    let aiCacheSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      try {
        const value = localStorage.getItem(key);
        if (!value) continue;

        const size = new Blob([value]).size;
        totalSize += size;

        const parsedValue = JSON.parse(value);

        if (key.includes('ai-cache')) {
          aiCacheEntries++;
          aiCacheSize += size;
        }

        entries.push({
          key,
          value: parsedValue,
          size,
          timestamp: parsedValue?.timestamp || parsedValue?.createdAt || 'N/A',
        });
      } catch (e) {
        // Invalid JSON, skip
      }
    }

    entries.sort((a, b) => a.key.localeCompare(b.key));

    setCacheEntries(entries);
    setStats({
      totalEntries: entries.length,
      totalSize,
      aiCacheEntries,
      aiCacheSize,
    });

    logger.info('DEV_CACHE_PAGE', 'Cache data loaded', {
      totalEntries: entries.length,
      aiCacheEntries,
    });
  };

  useEffect(() => {
    loadCacheData();
    loadSupabaseCache();
  }, []);

  const loadSupabaseCache = async () => {
    setLoadingSupabaseCache(true);
    try {
      const { data, error } = await supabase
        .from('training_ai_cache')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('DEV_CACHE_PAGE', 'Failed to load Supabase cache', { error: error.message });
        setLastAction('❌ Erreur lors du chargement du cache Supabase');
        setTimeout(() => setLastAction(''), 3000);
      } else {
        setSupabaseCacheEntries(data || []);
        logger.info('DEV_CACHE_PAGE', 'Supabase cache loaded', { count: data?.length || 0 });
      }
    } catch (error) {
      logger.error('DEV_CACHE_PAGE', 'Exception loading Supabase cache', { error });
    } finally {
      setLoadingSupabaseCache(false);
    }
  };

  const clearSupabaseCache = async () => {
    if (!confirm('Êtes-vous sûr de vouloir vider TOUT le cache Supabase (training_ai_cache) ?')) return;

    setLoadingSupabaseCache(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLastAction('❌ Utilisateur non connecté');
        setTimeout(() => setLastAction(''), 3000);
        return;
      }

      // Delete all cache entries for current user
      const { error } = await supabase
        .from('training_ai_cache')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        logger.error('DEV_CACHE_PAGE', 'Failed to clear Supabase cache', { error: error.message });
        setLastAction('❌ Erreur lors de la suppression du cache');
      } else {
        await loadSupabaseCache();
        setLastAction('✅ Cache Supabase vidé avec succès');
        logger.info('DEV_CACHE_PAGE', 'Supabase cache cleared');
      }
      setTimeout(() => setLastAction(''), 3000);
    } catch (error) {
      logger.error('DEV_CACHE_PAGE', 'Exception clearing Supabase cache', { error });
      setLastAction('❌ Erreur lors de la suppression du cache');
      setTimeout(() => setLastAction(''), 3000);
    } finally {
      setLoadingSupabaseCache(false);
    }
  };

  const deleteSupabaseCacheEntry = async (cacheKey: string) => {
    if (!confirm(`Supprimer l'entrée "${cacheKey}" du cache Supabase ?`)) return;

    setLoadingSupabaseCache(true);
    try {
      const { error } = await supabase
        .from('training_ai_cache')
        .delete()
        .eq('cache_key', cacheKey);

      if (error) {
        logger.error('DEV_CACHE_PAGE', 'Failed to delete cache entry', { error: error.message, cacheKey });
        setLastAction('❌ Erreur lors de la suppression');
      } else {
        await loadSupabaseCache();
        setLastAction(`✅ Entrée "${cacheKey}" supprimée`);
        logger.info('DEV_CACHE_PAGE', 'Cache entry deleted', { cacheKey });
      }
      setTimeout(() => setLastAction(''), 3000);
    } catch (error) {
      logger.error('DEV_CACHE_PAGE', 'Exception deleting cache entry', { error, cacheKey });
      setLastAction('❌ Erreur lors de la suppression');
      setTimeout(() => setLastAction(''), 3000);
    } finally {
      setLoadingSupabaseCache(false);
    }
  };

  const clearAllCache = () => {
    if (!confirm('Êtes-vous sûr de vouloir vider TOUT le cache localStorage ?')) return;

    localStorage.clear();
    loadCacheData();
    setLastAction('✅ Tout le cache a été vidé');
    setTimeout(() => setLastAction(''), 3000);

    logger.info('DEV_CACHE_PAGE', 'All cache cleared');
  };

  const clearAiCache = () => {
    if (!confirm('Êtes-vous sûr de vouloir vider uniquement le cache AI ?')) return;

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.includes('ai-cache')) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
    loadCacheData();
    setLastAction(`✅ ${keysToRemove.length} entrées AI supprimées`);
    setTimeout(() => setLastAction(''), 3000);

    logger.info('DEV_CACHE_PAGE', 'AI cache cleared', { count: keysToRemove.length });
  };

  const clearEntry = (key: string) => {
    if (!confirm(`Supprimer l'entrée "${key}" ?`)) return;

    localStorage.removeItem(key);
    loadCacheData();
    setSelectedEntry(null);
    setLastAction(`✅ Entrée "${key}" supprimée`);
    setTimeout(() => setLastAction(''), 3000);

    logger.info('DEV_CACHE_PAGE', 'Cache entry removed', { key });
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cache Manager</h1>
          <p className="text-neutral-400">Gestion du localStorage en développement</p>
        </div>
        <button
          onClick={loadCacheData}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Rafraîchir
        </button>
      </div>

      {/* Last Action */}
      {lastAction && (
        <div className="px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
          {lastAction}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard variant="premium">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Database className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-400">Total Entries</p>
              <p className="text-2xl font-bold text-white">{stats.totalEntries}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="premium">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-500/10">
              <Database className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-400">Total Size</p>
              <p className="text-2xl font-bold text-white">{formatBytes(stats.totalSize)}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="premium">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-orange-500/10">
              <AlertCircle className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-400">AI Cache</p>
              <p className="text-2xl font-bold text-white">{stats.aiCacheEntries}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="premium">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-500/10">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-400">AI Size</p>
              <p className="text-2xl font-bold text-white">{formatBytes(stats.aiCacheSize)}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Actions */}
      <GlassCard variant="premium">
        <h3 className="text-lg font-bold text-white mb-3">Actions - LocalStorage</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={clearAiCache}
            className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium transition-colors flex items-center gap-2 border border-red-500/30"
          >
            <Trash2 className="w-4 h-4" />
            Vider Cache AI
          </button>
          <button
            onClick={clearAllCache}
            className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium transition-colors flex items-center gap-2 border border-red-500/30"
          >
            <Trash2 className="w-4 h-4" />
            Vider Tout le Cache
          </button>
        </div>
      </GlassCard>

      {/* Supabase Cache Section */}
      <GlassCard variant="premium">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Server className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Cache Supabase (training_ai_cache)</h3>
              <p className="text-sm text-neutral-400">{supabaseCacheEntries.length} entrées</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadSupabaseCache}
              disabled={loadingSupabaseCache}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loadingSupabaseCache ? 'animate-spin' : ''}`} />
              Rafraîchir
            </button>
            <button
              onClick={clearSupabaseCache}
              disabled={loadingSupabaseCache || supabaseCacheEntries.length === 0}
              className="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium transition-colors flex items-center gap-2 border border-red-500/30 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Vider Cache Supabase
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {loadingSupabaseCache ? (
            <p className="text-neutral-400 text-center py-8">Chargement...</p>
          ) : supabaseCacheEntries.length === 0 ? (
            <p className="text-neutral-400 text-center py-8">Aucune entrée dans le cache Supabase</p>
          ) : (
            supabaseCacheEntries.map((entry) => {
              const isExpired = new Date(entry.expires_at) < new Date();
              const hasExercises = entry.cached_data?.exercises && Array.isArray(entry.cached_data.exercises);
              const isValid = hasExercises && entry.cached_data.exercises.length > 0;

              return (
                <div
                  key={entry.cache_key}
                  className={`p-4 rounded-lg transition-colors cursor-pointer border ${
                    isExpired
                      ? 'bg-red-500/10 border-red-500/30'
                      : !isValid
                      ? 'bg-orange-500/10 border-orange-500/30'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => setSelectedEntry(selectedEntry === entry.cache_key ? null : entry.cache_key)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-medium truncate">{entry.cache_key}</p>
                        {isExpired && (
                          <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                            Expiré
                          </span>
                        )}
                        {!isValid && !isExpired && (
                          <span className="px-2 py-0.5 rounded text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30">
                            ⚠️ Invalide
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Database className="w-3 h-3" />
                          Type: {entry.cache_type || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Créé: {new Date(entry.created_at).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expire: {new Date(entry.expires_at).toLocaleString()}
                        </span>
                        {hasExercises && (
                          <span className="text-green-400">
                            ✓ {entry.cached_data.exercises.length} exercices
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSupabaseCacheEntry(entry.cache_key);
                      }}
                      disabled={loadingSupabaseCache}
                      className="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors border border-red-500/30 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {selectedEntry === entry.cache_key && (
                    <div className="mt-4 p-3 rounded bg-black/30 border border-white/5">
                      <pre className="text-xs text-neutral-300 overflow-x-auto max-h-96">
                        {JSON.stringify(entry.cached_data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </GlassCard>

      {/* Cache Entries List */}
      <GlassCard variant="premium">
        <h2 className="text-xl font-bold text-white mb-4">Entrées du Cache</h2>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {cacheEntries.length === 0 ? (
            <p className="text-neutral-400 text-center py-8">Aucune entrée dans le cache</p>
          ) : (
            cacheEntries.map((entry) => (
              <div
                key={entry.key}
                className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/10"
                onClick={() => setSelectedEntry(selectedEntry === entry.key ? null : entry.key)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{entry.key}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Database className="w-3 h-3" />
                        {formatBytes(entry.size)}
                      </span>
                      {entry.timestamp !== 'N/A' && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearEntry(entry.key);
                    }}
                    className="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors border border-red-500/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {selectedEntry === entry.key && (
                  <div className="mt-4 p-3 rounded bg-black/30 border border-white/5">
                    <pre className="text-xs text-neutral-300 overflow-x-auto">
                      {JSON.stringify(entry.value, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}
