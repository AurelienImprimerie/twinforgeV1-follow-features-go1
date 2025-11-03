/**
 * Fasting Components Barrel Export
 * Centralized export for all Fasting components organized by category
 */

// Tabs Components
export { default as FastingDailyTab } from './Tabs/FastingDailyTab';
export { default as FastingHistoryTab } from './Tabs/FastingHistoryTab';
export { default as FastingInsightsTab } from './Tabs/FastingInsightsTab';
export { default as FastingProgressionTab } from './Tabs/FastingProgressionTab';

// Stages Components
export { default as FastingSetupStage } from './Stages/FastingSetupStage';
export { default as FastingActiveStage } from './Stages/FastingActiveStage';
export { default as FastingCompletionStage } from './Stages/FastingCompletionStage';

// Cards Components
export { default as DynamicFastingCTA } from './Cards/DynamicFastingCTA';
/** @deprecated Remplacé par DynamicFastingCTA qui inclut toutes ces fonctionnalités */
export { default as FastingCurrentSessionCard } from './Cards/FastingCurrentSessionCard';
export { default as FastingDailySummaryCard } from './Cards/FastingDailySummaryCard';
export { default as FastingMetabolicPhasesCard } from './Cards/FastingMetabolicPhasesCard';
export { default as FastingProtocolInfoCard } from './Cards/FastingProtocolInfoCard';
export { default as FastingTipsCard } from './Cards/FastingTipsCard';
export { default as FastingAchievementsCard } from './Cards/FastingAchievementsCard';
export { default as FastingSessionSummaryCard } from './Cards/FastingSessionSummaryCard';

// Shared Components
export { default as FastingProgressHeader } from './Shared/FastingProgressHeader';
export { default as FastingPeriodSelector } from './Shared/FastingPeriodSelector';
export { default as FastingDataCompletenessAlert } from './Shared/FastingDataCompletenessAlert';

// Insights Components
export { default as FastingInsightsLoadingSkeleton } from './Insights/FastingInsightsLoadingSkeleton';
export { default as FastingInsightsSummaryCard } from './Insights/FastingInsightsSummaryCard';
export { default as FastingInsightCard } from './Insights/FastingInsightCard';

// Progression Components
export { default as FastingProgressionLoadingSkeleton } from './Progression/FastingProgressionLoadingSkeleton';
export { default as FastingProgressionSummaryCard } from './Progression/FastingProgressionSummaryCard';
export { default as FastingConsistencyChart } from './Progression/FastingConsistencyChart';
export { default as FastingDurationTrendChart } from './Progression/FastingDurationTrendChart';
export { default as FastingHeatmap } from './Progression/FastingHeatmap';

// History Components
export { default as FastingHistoryFilters } from './History/FastingHistoryFilters';
export { default as FastingHistoryStatsCard } from './History/FastingHistoryStatsCard';
export { default as FastingSessionCard } from './History/FastingSessionCard';
export { default as FastingHistoryLoadingSkeleton } from './History/FastingHistoryLoadingSkeleton';