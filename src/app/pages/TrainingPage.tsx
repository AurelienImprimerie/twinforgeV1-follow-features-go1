import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Tabs from '../../ui/tabs/TabsComponent';
import PageHeader from '../../ui/page/PageHeader';
import { PLACEHOLDER_PAGES_CONFIG } from '../../config/placeholderPagesConfig';
import UnderConstructionCard from '../components/UnderConstructionCard';
import { ICONS } from '../../ui/icons/registry';

const TrainingPage: React.FC = () => {
  const config = PLACEHOLDER_PAGES_CONFIG.training;
  const [activeTab, setActiveTab] = useState(config.tabs[0].value);

  const currentTabConfig = React.useMemo(() => {
    return config.tabs.find(tab => tab.value === activeTab) || config.tabs[0];
  }, [activeTab, config.tabs]);

  const currentHeaderConfig = currentTabConfig.pageHeader || {
    icon: config.icon,
    title: config.title,
    subtitle: config.subtitle,
    color: config.color
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-6 relative"
    >
      <PageHeader
        icon={currentHeaderConfig.icon as keyof typeof ICONS}
        title={currentHeaderConfig.title}
        subtitle={currentHeaderConfig.subtitle}
        circuit={config.circuit as any}
        iconColor={currentHeaderConfig.color}
      />

      <Tabs defaultValue={config.tabs[0].value} className="w-full training-tabs" onValueChange={setActiveTab}>
        <Tabs.List role="tablist" aria-label="Sections de l'Atelier de Training" className="mb-6 w-full">
          {config.tabs.map((tab) => (
            <Tabs.Trigger key={tab.value} value={tab.value} icon={tab.icon}>
              <span className="tab-text">{tab.label}</span>
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {config.tabs.map((tab) => (
          <Tabs.Panel key={tab.value} value={tab.value}>
            <UnderConstructionCard
              title={tab.label}
              description={tab.description}
              features={tab.features}
            />
          </Tabs.Panel>
        ))}
      </Tabs>
    </motion.div>
  );
};

export default TrainingPage;
