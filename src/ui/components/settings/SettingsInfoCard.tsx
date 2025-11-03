/**
 * Settings Info Card Component
 * Reusable info/warning/error card for settings pages
 */

import React from 'react';
import { AlertCircle, Info, AlertTriangle, CheckCircle } from 'lucide-react';

export type SettingsInfoCardType = 'info' | 'warning' | 'error' | 'success';

interface SettingsInfoCardProps {
  type?: SettingsInfoCardType;
  title?: string;
  message: string | React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const iconMap = {
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
  success: CheckCircle,
};

export const SettingsInfoCard: React.FC<SettingsInfoCardProps> = ({
  type = 'info',
  title,
  message,
  actions,
  className = '',
}) => {
  const Icon = iconMap[type];

  return (
    <div className={`settings-info-card settings-info-card-${type} ${className}`}>
      <div className="settings-info-card-icon">
        <Icon size={20} />
      </div>

      <div className="settings-info-card-content">
        {title && <h4 className="settings-info-card-title">{title}</h4>}
        <div className="settings-info-card-message">{message}</div>
        {actions && <div className="settings-info-card-actions">{actions}</div>}
      </div>
    </div>
  );
};
