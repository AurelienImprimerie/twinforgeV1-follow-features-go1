import React from 'react';
import { motion } from 'framer-motion';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';
import { useFeedback } from '../../../../../../hooks/useFeedback';

interface RecipeActionButtonsProps {
  onExportAllRecipes: () => void;
  onDeleteAllRecipes: () => void;
  recipesCount: number;
}

const RecipeActionButtons: React.FC<RecipeActionButtonsProps> = ({
  onExportAllRecipes,
  onDeleteAllRecipes,
  recipesCount
}) => {
  const { click } = useFeedback();

  if (recipesCount === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-end gap-3 mb-6"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          click();
          onExportAllRecipes();
        }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200"
        style={{
          background: 'linear-gradient(135deg, color-mix(in srgb, #10B981 20%, transparent), color-mix(in srgb, #10B981 10%, transparent))',
          border: '1px solid color-mix(in srgb, #10B981 30%, transparent)',
          boxShadow: `
            0 4px 16px color-mix(in srgb, #10B981 15%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.15)
          `,
          backdropFilter: 'blur(20px) saturate(180%)',
          color: '#10B981'
        }}
        title="Exporter toutes les recettes"
      >
        <SpatialIcon Icon={ICONS.Download} size={18} className="text-green-400" />
        <span className="text-sm">Exporter</span>
        <span className="text-xs opacity-70">({recipesCount})</span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          click();
          onDeleteAllRecipes();
        }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200"
        style={{
          background: 'linear-gradient(135deg, color-mix(in srgb, #EF4444 20%, transparent), color-mix(in srgb, #EF4444 10%, transparent))',
          border: '1px solid color-mix(in srgb, #EF4444 30%, transparent)',
          boxShadow: `
            0 4px 16px color-mix(in srgb, #EF4444 15%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.15)
          `,
          backdropFilter: 'blur(20px) saturate(180%)',
          color: '#EF4444'
        }}
        title="Supprimer toutes les recettes"
      >
        <SpatialIcon Icon={ICONS.Trash2} size={18} className="text-red-400" />
        <span className="text-sm">Supprimer</span>
        <span className="text-xs opacity-70">({recipesCount})</span>
      </motion.button>
    </motion.div>
  );
};

export default RecipeActionButtons;
