import React from 'react';
import { motion } from 'framer-motion';
import Tabs from '../../ui/tabs/TabsComponent';
import PageHeader from '../../ui/page/PageHeader';
import GlassCard from '../../ui/cards/GlassCard';
import UnderConstructionCard from '../components/UnderConstructionCard';
import { PLACEHOLDER_PAGES_CONFIG } from '../../config/placeholderPagesConfig';

/**
 * NotificationsPage - Centre de Notifications
 * Page de gestion des alertes et rappels
 */
const NotificationsPage: React.FC = () => {
  const config = PLACEHOLDER_PAGES_CONFIG.notifications;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-6"
    >
      <PageHeader
        icon={config.icon}
        title={config.title}
        subtitle={config.subtitle}
        circuit={config.circuit as any}
        iconColor={config.color}
      />

      <Tabs defaultValue={config.tabs[0].value} className="w-full notifications-tabs">
        <Tabs.List role="tablist" aria-label="Sections des Notifications" className="mb-6 w-full">
          {config.tabs.map((tab) => (
            <Tabs.Trigger key={tab.value} value={tab.value} icon={tab.icon}>
              <span className="tab-text">{tab.label}</span>
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {config.tabs.map((tab) => (
          <Tabs.Panel key={tab.value} value={tab.value}>
            <GlassCard className="p-6">
              <UnderConstructionCard
                title={tab.label}
                description={tab.description}
                icon={tab.icon}
                color={config.color}
                features={tab.features}
              />
            </GlassCard>
          </Tabs.Panel>
        ))}
      </Tabs>
    </motion.div>
  );
};

export default NotificationsPage;