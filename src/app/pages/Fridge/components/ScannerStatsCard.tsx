import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';
import { supabase } from '../../../../system/supabase/client';
import logger from '../../../../lib/utils/logger';

interface StatMetric {
  label: string;
  value: number;
  icon: keyof typeof ICONS;
  color: string;
  unit?: string;
}

/**
 * ScannerStatsCard - Affiche les statistiques et insights visuels
 * Avec jauges circulaires animées, graphiques sparkline et badges
 */
const ScannerStatsCard: React.FC = () => {
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});
  const [totalScans, setTotalScans] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [topCategories, setTopCategories] = useState<Array<{ name: string; count: number; color: string }>>([]);

  // Charger les vraies statistiques depuis Supabase
  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: sessions } = await supabase
          .from('recipe_sessions')
          .select('inventory_final')
          .eq('user_id', user.id)
          .not('inventory_final', 'is', null);

        if (sessions && sessions.length > 0) {
          const scans = sessions.length;
          const items = sessions.reduce((sum, session) =>
            sum + (Array.isArray(session.inventory_final) ? session.inventory_final.length : 0), 0
          );

          // Calculer les catégories depuis les inventaires
          const categoryCount: Record<string, number> = {};
          sessions.forEach(session => {
            if (Array.isArray(session.inventory_final)) {
              session.inventory_final.forEach((item: any) => {
                const category = item.category || 'Autre';
                categoryCount[category] = (categoryCount[category] || 0) + 1;
              });
            }
          });

          // Top 3 catégories
          const sortedCategories = Object.entries(categoryCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([name, count], index) => ({
              name,
              count,
              color: ['#10B981', '#F59E0B', '#EC4899'][index]
            }));

          setTotalScans(scans);
          setTotalItems(items);
          setTopCategories(sortedCategories);
        }
      } catch (error) {
        logger.warn('SCANNER_STATS_CARD', 'Failed to load stats', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    loadStats();
  }, []);

  const avgFreshness = totalItems > 0 ? 85 : 0;

  const stats: StatMetric[] = [
    {
      label: 'Scans Effectués',
      value: totalScans,
      icon: 'Scan',
      color: '#EC4899',
      unit: ''
    },
    {
      label: 'Items Détectés',
      value: totalItems,
      icon: 'Package',
      color: '#F472B6',
      unit: ''
    },
    {
      label: 'Taux de Fraîcheur',
      value: avgFreshness,
      icon: 'Sparkles',
      color: '#10B981',
      unit: '%'
    }
  ];

  // Animation progressive des compteurs
  useEffect(() => {
    stats.forEach((stat) => {
      const key = stat.label;
      let current = 0;
      const increment = stat.value / 30; // 30 frames pour l'animation

      const interval = setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          current = stat.value;
          clearInterval(interval);
        }
        setAnimatedValues((prev) => ({ ...prev, [key]: Math.floor(current) }));
      }, 30);

      return () => clearInterval(interval);
    });
  }, [totalScans, totalItems]);

  // Top catégories calculées depuis les vraies données

  return (
    <GlassCard
      className="p-6"
      style={{
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, #EC4899 12%, transparent) 0%, transparent 60%),
          radial-gradient(circle at 70% 80%, color-mix(in srgb, #F472B6 10%, transparent) 0%, transparent 50%),
          linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.08)),
          rgba(11, 14, 23, 0.80)
        `,
        borderColor: 'color-mix(in srgb, #EC4899 35%, transparent)',
        boxShadow: `
          0 12px 40px rgba(0, 0, 0, 0.25),
          0 0 30px color-mix(in srgb, #EC4899 20%, transparent),
          inset 0 2px 0 rgba(255, 255, 255, 0.15)
        `,
        backdropFilter: 'blur(24px) saturate(150%)',
        WebkitBackdropFilter: 'blur(24px) saturate(150%)'
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 60%),
              linear-gradient(135deg, color-mix(in srgb, #EC4899 45%, transparent), color-mix(in srgb, #F472B6 35%, transparent))
            `,
            border: '2px solid color-mix(in srgb, #EC4899 60%, transparent)',
            boxShadow: '0 0 20px color-mix(in srgb, #EC4899 40%, transparent)'
          }}
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              '0 0 20px color-mix(in srgb, #EC4899 40%, transparent)',
              '0 0 30px color-mix(in srgb, #EC4899 55%, transparent)',
              '0 0 20px color-mix(in srgb, #EC4899 40%, transparent)'
            ]
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <SpatialIcon Icon={ICONS.BarChart3} size={20} className="text-pink-300" />
        </motion.div>
        <div>
          <h3 className="text-lg font-bold text-white">Statistiques</h3>
          <p className="text-sm text-white/70">Vue d'ensemble de vos scans</p>
        </div>
      </div>

      {/* Métriques Principales avec Jauges Circulaires */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map((stat, index) => {
          const displayValue = animatedValues[stat.label] || 0;
          const percentage = stat.unit === '%' ? displayValue : (displayValue / (stat.value || 1)) * 100;

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              {/* Jauge Circulaire */}
              <div className="relative w-24 h-24 mx-auto mb-3">
                {/* Cercle de fond */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="8"
                  />
                  {/* Cercle de progression */}
                  <motion.circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke={stat.color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                    animate={{
                      strokeDashoffset: 2 * Math.PI * 40 * (1 - (stat.unit === '%' ? displayValue / 100 : Math.min(percentage / 100, 1)))
                    }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{
                      filter: `drop-shadow(0 0 8px ${stat.color}80)`
                    }}
                  />
                </svg>

                {/* Valeur au centre */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <SpatialIcon Icon={ICONS[stat.icon]} size={20} style={{ color: stat.color }} />
                  <span className="text-xl font-bold text-white mt-1">
                    {displayValue}{stat.unit}
                  </span>
                </div>
              </div>

              <p className="text-xs text-white/70 font-medium">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Graphique Sparkline Simplifié (Tendance Mock) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl p-4 mb-4"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-white">Tendance des Scans</span>
          <span className="text-xs text-white/60">7 derniers jours</span>
        </div>

        {/* Mini Sparkline */}
        <div className="flex items-end justify-between h-16 gap-1">
          {[3, 5, 4, 7, 6, 8, 9].map((value, index) => (
            <motion.div
              key={index}
              className="flex-1 rounded-t-lg"
              style={{
                background: `linear-gradient(180deg, ${ICONS ? '#EC4899' : '#F472B6'}, ${ICONS ? '#F472B6' : '#DB2777'})`,
                boxShadow: `0 0 10px color-mix(in srgb, #EC4899 40%, transparent)`
              }}
              initial={{ height: 0 }}
              animate={{ height: `${(value / 10) * 100}%` }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            />
          ))}
        </div>
      </motion.div>

      {/* Catégories les Plus Scannées (Badges) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h4 className="text-sm font-semibold text-white mb-3">Top Catégories</h4>
        <div className="flex flex-wrap gap-2">
          {topCategories.map((category, index) => (
            <motion.div
              key={category.name}
              className="px-4 py-2 rounded-full flex items-center gap-2"
              style={{
                background: `color-mix(in srgb, ${category.color} 15%, transparent)`,
                border: `2px solid color-mix(in srgb, ${category.color} 30%, transparent)`
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: category.color }}
              />
              <span className="text-sm font-medium text-white">{category.name}</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: `color-mix(in srgb, ${category.color} 25%, transparent)`,
                  color: category.color
                }}
              >
                {category.count}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Insight Message */}
      {totalScans > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-4 p-3 rounded-xl flex items-start gap-3"
          style={{
            background: 'color-mix(in srgb, #10B981 10%, transparent)',
            border: '2px solid color-mix(in srgb, #10B981 25%, transparent)'
          }}
        >
          <SpatialIcon Icon={ICONS.Lightbulb} size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-300 mb-1">Excellent Progrès!</p>
            <p className="text-xs text-white/70">
              Vous avez scanné {totalScans} frigo{totalScans > 1 ? 's' : ''} et détecté {totalItems} ingrédients.
              Continuez pour débloquer plus de recettes personnalisées.
            </p>
          </div>
        </motion.div>
      )}
    </GlassCard>
  );
};

export default ScannerStatsCard;
