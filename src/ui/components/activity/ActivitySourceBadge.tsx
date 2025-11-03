import React from 'react';
import SpatialIcon from '../../icons/SpatialIcon';
import { ICONS } from '../../icons/registry';

export type ActivitySource = 'manual' | 'wearable' | 'enriched';

interface ActivitySourceBadgeProps {
  source: ActivitySource;
  wearableProvider?: string;
  enriched?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * ActivitySourceBadge - Badge indicating the source of activity data
 *
 * Sources:
 * - manual: User entered activity manually (text/voice)
 * - wearable: Activity synced from connected wearable device
 * - enriched: Manual activity enriched with wearable biometric data
 */
export const ActivitySourceBadge: React.FC<ActivitySourceBadgeProps> = ({
  source,
  wearableProvider,
  enriched = false,
  size = 'sm',
  className = '',
}) => {
  const getSourceConfig = () => {
    if (enriched) {
      return {
        label: 'Enrichi',
        icon: ICONS.Zap,
        bgColor: 'bg-purple-500/20',
        textColor: 'text-purple-300',
        borderColor: 'border-purple-500/50',
        iconColor: '#A855F7',
        tooltip: 'Activité manuelle enrichie avec données biométriques',
      };
    }

    switch (source) {
      case 'wearable':
        return {
          label: wearableProvider || 'Montre',
          icon: ICONS.Watch,
          bgColor: 'bg-blue-500/20',
          textColor: 'text-blue-300',
          borderColor: 'border-blue-500/50',
          iconColor: '#3B82F6',
          tooltip: `Synchronisé depuis ${wearableProvider || 'votre montre connectée'}`,
        };
      case 'manual':
      default:
        return {
          label: 'Manuel',
          icon: ICONS.Edit,
          bgColor: 'bg-slate-500/20',
          textColor: 'text-slate-300',
          borderColor: 'border-slate-500/50',
          iconColor: '#64748B',
          tooltip: 'Activité saisie manuellement',
        };
    }
  };

  const config = getSourceConfig();
  const iconSize = size === 'sm' ? 10 : 12;
  const paddingClass = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-1';
  const textClass = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <div
      className={`
        inline-flex items-center gap-1
        ${paddingClass}
        ${config.bgColor}
        ${config.textColor}
        border ${config.borderColor}
        rounded-full
        font-medium ${textClass}
        ${className}
      `}
      title={config.tooltip}
    >
      <SpatialIcon
        Icon={config.icon}
        size={iconSize}
        style={{ color: config.iconColor }}
        variant="pure"
      />
      <span>{config.label}</span>
    </div>
  );
};

export default ActivitySourceBadge;
