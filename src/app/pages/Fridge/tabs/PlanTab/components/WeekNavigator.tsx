/**
 * Week Navigator Component
 * Component for navigating between weeks and managing multi-week plans
 */

import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';
import CustomDropdown from '../../RecipesTab/components/CustomDropdown';

interface WeekNavigatorProps {
  currentWeek: number;
  availableWeeks: number[];
  isGenerating: boolean;
  onWeekChange: (week: number) => void;
  getWeekDateRange: (weekNumber: number) => { formatted: string; startDate: string; endDate: string };
  onRegenerateWeek?: () => void;
}

/**
 * Week Navigator Component - Navigateur de Semaines
 */
const WeekNavigator: React.FC<WeekNavigatorProps> = ({
  // Props kept for compatibility but component is now disabled
}) => {
  // Component functionality has been moved to PlanHeaderSection
  return null;
};

export default WeekNavigator;