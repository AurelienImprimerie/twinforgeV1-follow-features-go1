import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Tabs from '../../ui/tabs/TabsComponent';
import PageHeader from '../../ui/page/PageHeader';
import GlassCard from '../../ui/cards/GlassCard';
import UnderConstructionCard from '../components/UnderConstructionCard';
import ConnectedDevicesTab from './Settings/ConnectedDevicesTab';
import GeneralSettingsTab from './Settings/GeneralSettingsTab';
import PreferencesSettingsTab from './Settings/PreferencesSettingsTab';
import Render3DQualitySettings from './Settings/Render3DQualitySettings';
import { NotificationsSettingsTab } from './Settings/NotificationsSettingsTab';
import { PrivacySettingsTab } from './Settings/PrivacySettingsTab';
import SubscriptionManagementTab from './Settings/SubscriptionManagementTab';
import { PLACEHOLDER_PAGES_CONFIG } from '../../config/placeholderPagesConfig';

/**
 * SettingsPage - Réglages
 * Page de configuration et personnalisation de l'application
 */
const SettingsPage: React.FC = () => {
  const config = PLACEHOLDER_PAGES_CONFIG.settings;
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const initialTab = tabFromUrl && config.tabs.find(t => t.value === tabFromUrl)
    ? tabFromUrl
    : config.tabs[0].value;
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update active tab when URL changes
  useEffect(() => {
    if (tabFromUrl && config.tabs.find(t => t.value === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl, config.tabs]);

  const activeTabConfig = config.tabs.find(tab => tab.value === activeTab) || config.tabs[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-6"
      style={{
        '--settings-active-color': activeTabConfig.color || config.color
      } as React.CSSProperties}
    >
      <PageHeader
        icon={activeTabConfig.icon || config.icon}
        title={activeTabConfig.label}
        subtitle={activeTabConfig.description}
        circuit={config.circuit as any}
        iconColor={activeTabConfig.color || config.color}
      />

      <Tabs
        value={activeTab}
        defaultValue={initialTab}
        className="w-full settings-tabs"
        onValueChange={(value) => setActiveTab(value)}
      >
        <Tabs.List role="tablist" aria-label="Sections des Réglages" className="mb-6 w-full">
          {config.tabs.map((tab) => (
            <Tabs.Trigger key={tab.value} value={tab.value} icon={tab.icon}>
              <span className="tab-text">{tab.label}</span>
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {config.tabs.map((tab) => (
          <Tabs.Panel key={tab.value} value={tab.value}>
            {tab.value === 'preferences' ? (
              <PreferencesSettingsTab />
            ) : tab.value === 'notifications' ? (
              <NotificationsSettingsTab />
            ) : tab.value === 'appareils' ? (
              <ConnectedDevicesTab />
            ) : tab.value === 'performance' ? (
              <div className="space-y-8">
                <GeneralSettingsTab />
                <Render3DQualitySettings />
              </div>
            ) : tab.value === 'confidentialite' ? (
              <PrivacySettingsTab />
            ) : tab.value === 'account' ? (
              <SubscriptionManagementTab />
            ) : (
              <GlassCard className="p-6">
                <UnderConstructionCard
                  title={tab.label}
                  description={tab.description}
                  icon={tab.icon}
                  color={config.color}
                  features={tab.features}
                />
              </GlassCard>
            )}
          </Tabs.Panel>
        ))}
      </Tabs>
    </motion.div>
  );
};

export default SettingsPage;