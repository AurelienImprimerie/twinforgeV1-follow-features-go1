import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChefHat, Download } from 'lucide-react';
import type { SavedMealPlan } from '../../../../../../system/store/mealPlanLibraryStore';
import DayPlanCard from './DayPlanCard';

interface PlanLibraryViewerProps {
  plan: SavedMealPlan;
  onViewRecipe: (meal: any) => void;
  onExport: () => void;
}

const PlanLibraryViewer: React.FC<PlanLibraryViewerProps> = ({
  plan,
  onViewRecipe,
  onExport
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Plan Header */}
      <div className="glass-card p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">
              {plan.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-white/70">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>
                  {formatDate(plan.start_date)} - {formatDate(plan.end_date)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5" />
                <span>Semaine {plan.week_number}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all"
          >
            <Download className="w-5 h-5" />
            Exporter
          </button>
        </div>

        {/* AI Explanation */}
        {plan.ai_explanation && (
          <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl">
            <h3 className="text-sm font-semibold text-white/90 mb-2">
              Explication du Plan
            </h3>
            <p className="text-white/70 text-sm leading-relaxed">
              {plan.ai_explanation}
            </p>
          </div>
        )}

        {/* Nutritional Summary */}
        {plan.nutritional_summary && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(plan.nutritional_summary).map(([key, value]) => (
              <div key={key} className="p-3 bg-white/5 rounded-lg">
                <div className="text-xs text-white/60 mb-1 capitalize">
                  {key.replace(/_/g, ' ')}
                </div>
                <div className="text-lg font-semibold text-white">
                  {typeof value === 'number' ? Math.round(value) : value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Day Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {plan.plan_data.days.filter((day: any) => day && day.date).map((day: any, index: number) => (
          <DayPlanCard
            key={day.date}
            day={day}
            index={index}
            isEditable={false}
            onViewRecipe={onViewRecipe}
            onGenerateDetailedRecipe={() => {}}
            onGenerateAllDetailedRecipesForDay={() => {}}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default PlanLibraryViewer;
