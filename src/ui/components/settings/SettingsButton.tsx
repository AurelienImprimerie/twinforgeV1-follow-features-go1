/**
 * Settings Button Component
 * Reusable button for settings actions
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

export type SettingsButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface SettingsButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: SettingsButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  type = 'button',
  className = '',
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        settings-button
        settings-button-${variant}
        ${fullWidth ? 'settings-button-full-width' : ''}
        ${isDisabled ? 'settings-button-disabled' : ''}
        ${loading ? 'settings-button-loading' : ''}
        ${className}
      `}
    >
      {loading && (
        <Loader2 className="settings-button-loader" size={18} />
      )}
      {!loading && icon && <span className="settings-button-icon">{icon}</span>}
      <span className="settings-button-label">{children}</span>
    </button>
  );
};
