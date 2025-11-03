import { motion } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { getIntensityColor, getActivityIcon, getIntensityLabel } from './ActivityUtils';
import React from 'react';

interface Activity {
  id?: string;
  type: string;
  duration_min: number;
  intensity: 'low' | 'medium' | 'high' | 'very_high';
  calories_est: number;
  notes?: string;
}

interface ActivityListProps {
  activities: Activity[];
  updateActivity: (index: number, updates: Partial<Activity>) => void;
  removeActivity: (index: number) => void;
}

/**
 * Activity List - Liste des Activités avec Contrôles d'Édition
 * Affiche et permet d'éditer chaque activité de la session
 */
const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  updateActivity,
  removeActivity
}) => {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <GlassCard 
            className="p-6"
            style={{
              background: `
                radial-gradient(circle at 30% 20%, color-mix(in srgb, ${getIntensityColor(activity.intensity)} 8%, transparent) 0%, transparent 60%),
                var(--glass-opacity)
              `,
              borderColor: `color-mix(in srgb, ${getIntensityColor(activity.intensity)} 20%, transparent)`
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: `
                      radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
                      linear-gradient(135deg, color-mix(in srgb, ${getIntensityColor(activity.intensity)} 30%, transparent), color-mix(in srgb, ${getIntensityColor(activity.intensity)} 20%, transparent))
                    `,
                    border: `2px solid color-mix(in srgb, ${getIntensityColor(activity.intensity)} 40%, transparent)`,
                    boxShadow: `0 0 20px color-mix(in srgb, ${getIntensityColor(activity.intensity)} 30%, transparent)`
                  }}
                >
                  <SpatialIcon 
                    Icon={ICONS[getActivityIcon(activity.type) as keyof typeof ICONS]} 
                    size={20} 
                    style={{ color: getIntensityColor(activity.intensity) }} 
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold text-lg">{activity.type}</h4>
                  <p className="text-white/60 text-sm">
                    Intensité {getIntensityLabel(activity.intensity)}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => removeActivity(index)}
                className="p-2 rounded-full transition-all duration-200"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}
                title="Supprimer cette activité"
              >
                <SpatialIcon Icon={ICONS.Trash2} size={16} className="text-red-400" />
              </button>
            </div>

            {/* Contrôles d'Édition */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Durée */}
              <div className="space-y-2">
                <label className="text-white/80 text-sm font-medium">Durée (minutes)</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateActivity(index, { 
                      duration_min: Math.max(5, activity.duration_min - 5) 
                    })}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <SpatialIcon Icon={ICONS.Minus} size={14} className="text-white" />
                  </button>
                  <div className="flex-1 text-center">
                    <div className="text-white font-bold text-lg">{activity.duration_min}</div>
                    <div className="text-white/60 text-xs">min</div>
                  </div>
                  <button
                    onClick={() => updateActivity(index, { 
                      duration_min: Math.min(300, activity.duration_min + 5) 
                    })}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <SpatialIcon Icon={ICONS.Plus} size={14} className="text-white" />
                  </button>
                </div>
              </div>

              {/* Intensité */}
              <div className="space-y-2">
                <label className="text-white/80 text-sm font-medium">Intensité</label>
                <select
                  value={activity.intensity}
                  onChange={(e) => updateActivity(index, { 
                    intensity: e.target.value as Activity['intensity'] 
                  })}
                  className="glass-input w-full"
                >
                  <option value="low">Faible</option>
                  <option value="medium">Modérée</option>
                  <option value="high">Intense</option>
                  <option value="very_high">Très Intense</option>
                </select>
              </div>

              {/* Calories (calculées automatiquement) */}
              <div className="space-y-2">
                <label className="text-white/80 text-sm font-medium">Calories</label>
                <div className="text-center">
                  <motion.div 
                    key={activity.calories_est}
                    initial={{ scale: 1.2, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="text-2xl font-bold text-white"
                  >
                    {activity.calories_est}
                  </motion.div>
                  <div className="text-white/60 text-xs">kcal brûlées</div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {activity.notes && (
              <div className="mt-4 p-3 rounded-xl" style={{
                background: `color-mix(in srgb, ${getIntensityColor(activity.intensity)} 6%, transparent)`,
                border: `1px solid color-mix(in srgb, ${getIntensityColor(activity.intensity)} 15%, transparent)`
              }}>
                <div className="flex items-start gap-2">
                  <SpatialIcon Icon={ICONS.FileText} size={14} style={{ color: getIntensityColor(activity.intensity) }} className="mt-0.5" />
                  <p className="text-white/80 text-sm">{activity.notes}</p>
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
};

export default ActivityList;