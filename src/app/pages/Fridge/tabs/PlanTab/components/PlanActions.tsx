/**
 * Plan Actions Component
 * Component for meal plan actions (generate, export)
 */

import React from 'react';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';

interface PlanActionsProps {
  onGenerate: () => void;
  onRegenerateWeek: () => void;
  onGenerateNextWeek: () => void;
  onExport: () => void;
  onClearPlan: () => void;
  isGenerating: boolean;
  hasContext: boolean;
  hasPlan: boolean; // Legacy - kept for compatibility
  hasCurrentWeekPlan: boolean;
  currentWeek: number;
  isCurrentWeekActive: boolean;
  canGenerateNext: boolean;
  isWeekAvailable: (weekNumber: number) => boolean;
}

/**
 * Plan Actions Component - Actions du Plan
 */
const PlanActions: React.FC<PlanActionsProps> = ({
  // Props kept for compatibility but component functionality moved to PlanHeaderSection
}) => {
  // Component functionality has been moved to PlanHeaderSection
  return null;
};

export default PlanActions;