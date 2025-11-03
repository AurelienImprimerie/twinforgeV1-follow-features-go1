import React from 'react';
import { motion } from 'framer-motion';
import { usePerformanceMode } from '../../../../../../system/context/PerformanceModeContext';
import GlassCard from '../../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';
import { ShoppingList } from '../../../../../../domain/shoppingList';
import { cssSupports } from './shoppingListUtils';
import logger from '../../../../../../lib/utils/logger';

export interface ShoppingListExportActionsProps {
  shoppingList: ShoppingList;
}

/**
 * Shopping List Export Actions Component
 */
const ShoppingListExportActions: React.FC<ShoppingListExportActionsProps> = ({ shoppingList }) => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionButton = isPerformanceMode ? 'button' : motion.button;
  const handleExportPdf = () => {
    logger.info('PDF export requested', { shoppingListId: shoppingList.id });
    
    // Format shopping list data for logging
    const formattedData = {
      name: shoppingList.name,
      totalItems: shoppingList.totalItems,
      categories: shoppingList.categories?.map(cat => ({
        name: cat.name,
        items: cat.items.map(item => `${item.name} - ${item.quantity}`)
      }))
    };
    
    logger.debug('Formatted shopping list for PDF export', formattedData);
    
    // Show toast message (placeholder for actual PDF generation)
    if (typeof window !== 'undefined' && window.alert) {
      window.alert('Génération PDF en cours de développement. Cette fonctionnalité sera bientôt disponible !');
    }
  };

  const handleExportText = async () => {
    logger.info('Text export requested', { shoppingListId: shoppingList.id });
    
    // Format shopping list as plain text
    let textContent = `${shoppingList.name}\n`;
    textContent += `${'='.repeat(shoppingList.name.length)}\n\n`;
    
    shoppingList.categories?.forEach(category => {
      textContent += `${category.name}:\n`;
      category.items.forEach(item => {
        textContent += `  • ${item.name} - ${item.quantity}`;
        if (item.notes) {
          textContent += ` (${item.notes})`;
        }
        textContent += '\n';
      });
      textContent += '\n';
    });
    
    textContent += `Total: ${shoppingList.totalItems} articles\n`;
    
    try {
      // Copy to clipboard
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(textContent);
        logger.info('Shopping list copied to clipboard successfully');
        
        // Show success message
        if (typeof window !== 'undefined' && window.alert) {
          window.alert('Liste de courses copiée dans le presse-papiers !');
        }
      } else {
        // Fallback for older browsers
        logger.warn('Clipboard API not available, using fallback');
        if (typeof window !== 'undefined' && window.alert) {
          window.alert('Votre navigateur ne supporte pas la copie automatique. Voici votre liste:\n\n' + textContent);
        }
      }
    } catch (error) {
      logger.error('Failed to copy to clipboard', error);
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('Erreur lors de la copie. Voici votre liste:\n\n' + textContent);
      }
    }
  };

  return (
    <GlassCard
      className="border-white/20 p-1"
      style={{
        background: `
          linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 50%, rgba(255, 255, 255, 0.03) 100%)
        `,
        backdropFilter: 'blur(20px) saturate(180%)',
        border: `1px solid ${cssSupports('color', 'color-mix(in srgb, white 25%, transparent)', 'rgba(255, 255, 255, 0.25)')}`,
        boxShadow: `
          0 12px 40px rgba(0, 0, 0, 0.5),
          0 6px 20px rgba(255, 255, 255, 0.15),
          0 2px 8px rgba(255, 255, 255, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          inset 0 -1px 0 rgba(0, 0, 0, 0.3)
        `
      }}
    >
      <div className="p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-white/10 blur-sm"></div>
              <div 
                className="relative w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: `
                    0 2px 8px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `
                }}
              >
                <SpatialIcon Icon={ICONS.Download} size={20} className="relative text-white/70 drop-shadow-lg" />
              </div>
            </div>
            <span className="text-white/80 text-base font-medium">Exporter votre liste</span>
          </div>
          <div className="flex gap-2">
            <MotionButton
              {...(!isPerformanceMode && {
                whileHover: { scale: 1.05 },
                whileTap: { scale: 0.95 }
              })}
              onClick={handleExportPdf}
              className={`px-2 py-1 bg-white/10 hover:bg-orange-500/20 rounded-lg text-white/70 hover:text-orange-200 ${!isPerformanceMode ? 'transition-all duration-300' : ''} text-xs border border-white/20 hover:border-orange-400/30`}
            >
              PDF
            </MotionButton>
            <MotionButton
              {...(!isPerformanceMode && {
                whileHover: { scale: 1.05 },
                whileTap: { scale: 0.95 }
              })}
              onClick={handleExportText}
              className={`px-2 py-1 bg-white/10 hover:bg-orange-500/20 rounded-lg text-white/70 hover:text-orange-200 ${!isPerformanceMode ? 'transition-all duration-300' : ''} text-xs border border-white/20 hover:border-orange-400/30`}
            >
              Texte
            </MotionButton>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default ShoppingListExportActions;