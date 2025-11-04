import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Archive, Trash2, Edit2, Copy } from 'lucide-react';
import { useFeedback } from '../../../../../../hooks/useFeedback';
import type { SavedMealPlan } from '../../../../../../system/store/mealPlanLibraryStore';

interface PlanLibraryListProps {
  plans: SavedMealPlan[];
  selectedPlanId: string | null;
  onSelectPlan: (planId: string) => void;
  onArchivePlan: (planId: string) => Promise<void>;
  onUnarchivePlan: (planId: string) => Promise<void>;
  onDeletePlan: (planId: string) => Promise<void>;
  onDuplicatePlan: (planId: string) => Promise<void>;
  onEditTitle: (planId: string) => void;
}

const PlanLibraryList: React.FC<PlanLibraryListProps> = ({
  plans,
  selectedPlanId,
  onSelectPlan,
  onArchivePlan,
  onUnarchivePlan,
  onDeletePlan,
  onDuplicatePlan,
  onEditTitle
}) => {
  const { click } = useFeedback();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleArchive = async (e: React.MouseEvent, planId: string, isArchived: boolean) => {
    e.stopPropagation();
    click();

    if (isArchived) {
      await onUnarchivePlan(planId);
    } else {
      await onArchivePlan(planId);
    }
  };

  const handleDelete = async (e: React.MouseEvent, planId: string) => {
    e.stopPropagation();

    if (window.confirm('Êtes-vous sûr de vouloir supprimer définitivement ce plan ?')) {
      click();
      await onDeletePlan(planId);
    }
  };

  const handleDuplicate = async (e: React.MouseEvent, planId: string) => {
    e.stopPropagation();
    click();
    await onDuplicatePlan(planId);
  };

  const handleEditTitle = (e: React.MouseEvent, planId: string) => {
    e.stopPropagation();
    click();
    onEditTitle(planId);
  };

  if (plans.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-white/40" />
        <h3 className="text-xl font-semibold text-white mb-2">
          Aucun plan trouvé
        </h3>
        <p className="text-white/70">
          Commencez par créer votre premier plan de repas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            onClick={() => {
              click();
              onSelectPlan(plan.id);
            }}
            className={`glass-card p-6 cursor-pointer transition-all duration-200 ${
              selectedPlanId === plan.id
                ? 'ring-2 ring-primary/50 scale-[1.02]'
                : 'hover:scale-[1.01]'
            } ${plan.is_archived ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {plan.title}
                  </h3>
                  {plan.is_archived && (
                    <span className="px-2 py-1 text-xs font-medium bg-white/10 text-white/70 rounded-lg">
                      Archivé
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Semaine {plan.week_number}</span>
                  </div>
                  <div>
                    {formatDate(plan.start_date)} - {formatDate(plan.end_date)}
                  </div>
                  <div className="text-xs text-white/50">
                    Créé le {formatDate(plan.created_at)}
                  </div>
                </div>

                {plan.ai_explanation && (
                  <p className="mt-3 text-sm text-white/60 line-clamp-2">
                    {plan.ai_explanation}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleEditTitle(e, plan.id)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Modifier le titre"
                >
                  <Edit2 className="w-4 h-4 text-white/70" />
                </button>

                <button
                  onClick={(e) => handleDuplicate(e, plan.id)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Dupliquer"
                >
                  <Copy className="w-4 h-4 text-white/70" />
                </button>

                <button
                  onClick={(e) => handleArchive(e, plan.id, plan.is_archived)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title={plan.is_archived ? 'Désarchiver' : 'Archiver'}
                >
                  <Archive className={`w-4 h-4 ${plan.is_archived ? 'text-blue-400' : 'text-white/70'}`} />
                </button>

                {plan.is_archived && (
                  <button
                    onClick={(e) => handleDelete(e, plan.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Supprimer définitivement"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default PlanLibraryList;
