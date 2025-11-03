import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import PageHeader from '../../ui/page/PageHeader';
import Tabs from '../../ui/tabs/TabsComponent';
import ScannerTab from './Fridge/tabs/ScannerTab';
import FridgesTab from './Fridge/tabs/FridgesTab';
import RecipesTab from './Fridge/tabs/RecipesTab';
import PlanTab from './Fridge/tabs/PlanTab';
import ShoppingListTab from './Fridge/tabs/ShoppingListTab';

/**
 * FridgePage - Forge Culinaire
 * Page principale avec système d'onglets pour la gestion d'inventaire, recettes, plans et courses
 */
const FridgePage: React.FC = () => {
  const location = useLocation();

  // Configuration des titres, sous-titres et couleurs par onglet
  const tabConfig = useMemo(() => {
    const hash = location.hash.replace('#', '');
    const activeTab = hash ? decodeURIComponent(hash) : 'scanner';

    const configs: Record<string, { title: string; subtitle: string; iconColor: string }> = {
      scanner: {
        title: 'Scanner',
        subtitle: 'Scannez le contenu de votre frigo',
        iconColor: '#EC4899'
      },
      inventaire: {
        title: 'Inventaire',
        subtitle: 'Gérez vos ingrédients disponibles',
        iconColor: '#06B6D4'
      },
      recipes: {
        title: 'Recettes',
        subtitle: 'Recettes adaptées à votre inventaire',
        iconColor: '#10B981'
      },
      plan: {
        title: 'Plan',
        subtitle: 'Planifiez vos repas de la semaine',
        iconColor: '#8B5CF6'
      },
      courses: {
        title: 'Courses',
        subtitle: 'Générez votre liste de courses',
        iconColor: '#F59E0B'
      }
    };

    return configs[activeTab] || configs.scanner;
  }, [location.hash]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-6"
    >
      <PageHeader
        icon="ChefHat"
        title={tabConfig.title}
        subtitle={tabConfig.subtitle}
        circuit="fridge"
        iconColor={tabConfig.iconColor}
      />

      <Tabs defaultValue="scanner" forgeContext="fridge">
        <Tabs.List role="tablist" aria-label="Forge Culinaire Navigation">
          <Tabs.Trigger value="scanner" icon="ScanLine">
            Scanner
          </Tabs.Trigger>
          <Tabs.Trigger value="inventaire" icon="Refrigerator">
            Inventaire
          </Tabs.Trigger>
          <Tabs.Trigger value="recipes" icon="ChefHat">
            Recettes
          </Tabs.Trigger>
          <Tabs.Trigger value="plan" icon="Calendar">
            Plan
          </Tabs.Trigger>
          <Tabs.Trigger value="courses" icon="ShoppingCart">
            Courses
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Panel value="scanner">
          <ScannerTab />
        </Tabs.Panel>

        <Tabs.Panel value="inventaire">
          <FridgesTab />
        </Tabs.Panel>

        <Tabs.Panel value="recipes">
          <RecipesTab />
        </Tabs.Panel>

        <Tabs.Panel value="plan">
          <PlanTab />
        </Tabs.Panel>

        <Tabs.Panel value="courses">
          <ShoppingListTab />
        </Tabs.Panel>
      </Tabs>
    </motion.div>
  );
};

export default FridgePage;
