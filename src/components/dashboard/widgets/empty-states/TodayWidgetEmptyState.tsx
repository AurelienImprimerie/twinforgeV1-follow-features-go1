import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import type { IconName } from '@/ui/icons/registry';

const QUICK_ACTIONS = [
  {
    icon: 'Dumbbell',
    label: 'Lancer un entraînement',
    link: '/training',
    color: '#18E3FF'
  },
  {
    icon: 'Utensils',
    label: 'Scanner un repas',
    link: '/fridge',
    color: '#10B981'
  },
  {
    icon: 'Timer',
    label: 'Démarrer un jeûne',
    link: '/fasting',
    color: '#F59E0B'
  }
] as const;

export function TodayWidgetEmptyState() {
  return (
    <div className="text-center py-8 px-4">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="mb-6"
      >
        <div className="relative inline-block">
          <div
            className="absolute inset-0 blur-2xl opacity-40 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #10B981 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />
          <SpatialIcon name="Calendar" size={56} className="relative" color="#10B981" />
        </div>
      </motion.div>

      <motion.h3
        className="text-2xl font-bold mb-3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Nouvelle Journée, Nouvelles Opportunités
      </motion.h3>

      <motion.p
        className="text-sm opacity-70 mb-8 max-w-md mx-auto"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Commencez votre journée en utilisant une des Forges TwinForge.
        Chaque action compte pour votre consistance quotidienne!
      </motion.p>

      <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto">
        {QUICK_ACTIONS.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <Link to={action.link}>
              <motion.div
                className="p-4 rounded-xl flex items-center gap-3 group cursor-pointer"
                style={{
                  background: `color-mix(in srgb, ${action.color} 10%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${action.color} 30%, transparent)`
                }}
                whileHover={{ scale: 1.03, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `color-mix(in srgb, ${action.color} 20%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${action.color} 40%, transparent)`
                  }}
                >
                  <SpatialIcon name={action.icon as IconName} size={24} color={action.color} />
                </div>

                <span className="flex-1 text-left font-medium">{action.label}</span>

                <motion.div
                  className="opacity-50 group-hover:opacity-100 transition-opacity"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <SpatialIcon name="ArrowRight" size={20} color={action.color} />
                </motion.div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-8 flex items-center justify-center gap-2 text-xs opacity-60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <SpatialIcon name="Flame" size={14} color="#F59E0B" />
        <span>Commencez votre série de consistance aujourd'hui</span>
      </motion.div>
    </div>
  );
}
