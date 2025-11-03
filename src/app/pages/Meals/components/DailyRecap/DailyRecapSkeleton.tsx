import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';

/**
 * Daily Recap Skeleton - Squelette de chargement pour l'onglet "Aujourd'hui"
 * Reproduit la structure visuelle des composants principaux pendant le chargement
 */
const DailyRecapSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 w-full">
      {/* Skeleton pour DailyStatsGrid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { color: '#10B981', icon: 'Zap', title: 'Énergie Quotidienne' },
          { color: '#3B82F6', icon: 'Utensils', title: 'Repas Forgés' },
          { color: '#8B5CF6', icon: 'Clock', title: 'Dernière Forge' }
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <GlassCard 
              className="p-6 text-center"
              style={{
                background: `
                  radial-gradient(circle at 30% 20%, color-mix(in srgb, ${item.color} 6%, transparent) 0%, transparent 60%),
                  var(--glass-opacity)
                `,
                borderColor: `color-mix(in srgb, ${item.color} 15%, transparent)`
              }}
            >
              <div className="text-center mb-6">
                <div 
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{
                    background: `
                      radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                      linear-gradient(135deg, color-mix(in srgb, ${item.color} 35%, transparent), color-mix(in srgb, ${item.color} 25%, transparent))
                    `,
                    border: `2px solid color-mix(in srgb, ${item.color} 50%, transparent)`,
                    boxShadow: `0 0 30px color-mix(in srgb, ${item.color} 40%, transparent)`
                  }}
                >
                  <SpatialIcon Icon={ICONS[item.icon as keyof typeof ICONS]} size={28} style={{ color: item.color }} />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm">Chargement...</p>
              </div>
              
              {/* Skeleton Value */}
              <div className="space-y-2">
                <div className="h-8 bg-white/10 rounded-lg skeleton-glass mx-auto w-20"></div>
                <div className="h-3 bg-white/5 rounded w-16 mx-auto"></div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Skeleton pour CalorieProgressCard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <GlassCard 
          className="p-6"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.06) 0%, transparent 60%),
              var(--glass-opacity)
            `,
            borderColor: 'rgba(16, 185, 129, 0.15)'
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
                  linear-gradient(135deg, rgba(16, 185, 129, 0.30), rgba(34, 197, 94, 0.20))
                `,
                border: '2px solid rgba(16, 185, 129, 0.40)',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.30)'
              }}
            >
              <SpatialIcon Icon={ICONS.Target} size={20} className="text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-xl">Progression Énergétique</h3>
              <p className="text-white/60 text-sm">Chargement de votre progression...</p>
            </div>
            <div className="text-right">
              <div className="h-6 bg-white/10 rounded w-12 skeleton-glass"></div>
              <div className="h-3 bg-white/5 rounded w-16 mt-1"></div>
            </div>
          </div>
          
          {/* Skeleton Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-4 mb-4">
            <motion.div
              className="h-4 rounded-full bg-green-400/30"
              initial={{ width: 0 }}
              animate={{ width: '60%' }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
          
          <div className="flex items-center justify-between text-sm text-white/70">
            <div className="h-4 bg-white/10 rounded w-16 skeleton-glass"></div>
            <div className="h-4 bg-white/10 rounded w-16 skeleton-glass"></div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Skeleton pour MacronutrientsCard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <GlassCard 
          className="p-6"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.06) 0%, transparent 60%),
              var(--glass-opacity)
            `,
            borderColor: 'rgba(16, 185, 129, 0.15)'
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
                  linear-gradient(135deg, rgba(16, 185, 129, 0.30), rgba(34, 197, 94, 0.20))
                `,
                border: '2px solid rgba(16, 185, 129, 0.40)',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.30)'
              }}
            >
              <SpatialIcon Icon={ICONS.BarChart3} size={20} className="text-green-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl">Forge Macronutritionnelle</h3>
              <p className="text-green-200 text-sm">Chargement des macronutriments...</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { color: '#EF4444', name: 'Protéines' },
              { color: '#F59E0B', name: 'Glucides' },
              { color: '#8B5CF6', name: 'Lipides' },
              { color: '#06B6D4', name: 'Fibres' }
            ].map((macro, index) => (
              <motion.div
                key={macro.name}
                className="text-center p-4 rounded-xl"
                style={{
                  background: `color-mix(in srgb, ${macro.color} 8%, transparent)`,
                  borderColor: `color-mix(in srgb, ${macro.color} 20%, transparent)`,
                  border: '1px solid'
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              >
                <div className="flex items-center justify-center gap-1 mb-2">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      background: `color-mix(in srgb, ${macro.color} 15%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${macro.color} 25%, transparent)`
                    }}
                  >
                    <SpatialIcon 
                      Icon={ICONS[index === 0 ? 'Activity' : index === 1 ? 'Zap' : index === 2 ? 'Heart' : 'Ruler']} 
                      size={12} 
                      style={{ color: macro.color }}
                    />
                  </div>
                </div>
                <div className="h-6 bg-white/10 rounded skeleton-glass mb-2"></div>
                <div className="text-sm font-medium" style={{ color: macro.color }}>{macro.name}</div>
                <div className="h-3 bg-white/5 rounded w-16 mx-auto mt-1"></div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Skeleton pour RecentMealsCard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <GlassCard 
          className="p-8 text-center"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.06) 0%, transparent 60%),
              var(--glass-opacity)
            `,
            borderColor: 'rgba(16, 185, 129, 0.15)'
          }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
                  linear-gradient(135deg, rgba(16, 185, 129, 0.30), rgba(34, 197, 94, 0.20))
                `,
                border: '2px solid rgba(16, 185, 129, 0.40)',
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.30)'
              }}
            >
              <SpatialIcon Icon={ICONS.Utensils} size={28} className="text-green-400" />
            </div>
            <div className="text-left">
              <h3 className="text-2xl font-bold text-white">Chargement des Repas</h3>
              <p className="text-white/70 text-base">Récupération de vos données nutritionnelles...</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i}
                className="flex items-center justify-between p-4 rounded-xl"
                style={{
                  background: 'rgba(16, 185, 129, 0.04)',
                  border: '1px solid rgba(16, 185, 129, 0.12)',
                  backdropFilter: 'blur(8px) saturate(120%)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 skeleton-glass"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-white/10 rounded w-20 skeleton-glass"></div>
                    <div className="h-3 bg-white/5 rounded w-16 skeleton-glass"></div>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="h-5 bg-white/10 rounded w-16 skeleton-glass"></div>
                  <div className="h-3 bg-white/5 rounded w-12 skeleton-glass"></div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Skeleton pour ScanMealCTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <GlassCard 
          className="p-8 text-center relative overflow-visible"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 60%),
              var(--glass-opacity)
            `,
            borderColor: 'rgba(16, 185, 129, 0.2)'
          }}
        >
          <div className="relative z-10 space-y-6">
            {/* Icône de Forge Nutritionnelle */}
            <motion.div
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center relative"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                  linear-gradient(135deg, rgba(16, 185, 129, 0.30), rgba(34, 197, 94, 0.20))
                `,
                border: '2px solid rgba(16, 185, 129, 0.40)',
                boxShadow: '0 0 40px rgba(16, 185, 129, 0.30)'
              }}
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 0 40px rgba(16, 185, 129, 0.30)',
                  '0 0 50px rgba(16, 185, 129, 0.50)',
                  '0 0 40px rgba(16, 185, 129, 0.30)'
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <SpatialIcon Icon={ICONS.Camera} size={32} className="text-green-400" />
            </motion.div>

            <div className="space-y-3">
              <div className="h-8 bg-white/10 rounded-lg skeleton-glass mx-auto w-64"></div>
              <div className="h-5 bg-white/5 rounded mx-auto w-80"></div>
            </div>

            <div className="h-14 bg-green-400/20 rounded-full skeleton-glass mx-auto w-64"></div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default DailyRecapSkeleton;