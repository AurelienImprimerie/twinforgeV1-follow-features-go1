/**
 * Settings Section Component
 * Reusable section container for settings pages
 */

import React from 'react';

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  icon,
  children,
  className = '',
}) => {
  return (
    <section className={`settings-section ${className}`}>
      <div className="settings-section-header">
        {icon && <div className="settings-section-icon">{icon}</div>}
        <div className="settings-section-title-group">
          <h3 className="settings-section-title">{title}</h3>
          {description && <p className="settings-section-description">{description}</p>}
        </div>
      </div>
      <div className="settings-section-content">{children}</div>
    </section>
  );
};
