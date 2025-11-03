/**
 * Settings Toggle Component
 * Reusable toggle switch for settings
 */

import React from 'react';
import { ConditionalMotion } from '../../../lib/motion';

interface SettingsToggleProps {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
}

export const SettingsToggle: React.FC<SettingsToggleProps> = ({
  label,
  description,
  enabled,
  onChange,
  disabled = false,
  loading = false,
}) => {
  const handleToggle = () => {
    if (!disabled && !loading) {
      onChange(!enabled);
    }
  };

  return (
    <div
      className={`settings-toggle-container ${disabled ? 'disabled' : ''} ${loading ? 'loading' : ''}`}
    >
      <div className="settings-toggle-labels">
        <label className="settings-toggle-label">{label}</label>
        {description && <p className="settings-toggle-description">{description}</p>}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        onClick={handleToggle}
        disabled={disabled || loading}
        className={`settings-toggle-switch ${enabled ? 'enabled' : 'disabled'}`}
      >
        <ConditionalMotion
          className="settings-toggle-thumb"
          animate={{
            x: enabled ? 20 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 700,
            damping: 35,
          }}
        />
      </button>
    </div>
  );
};
