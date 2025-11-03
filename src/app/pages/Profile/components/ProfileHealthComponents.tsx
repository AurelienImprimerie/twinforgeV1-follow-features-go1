/**
 * Profile Health Components
 * Reusable UI components for profile health forms
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';
import { useFeedback } from '../../../../hooks/useFeedback';

/**
 * Enhanced Progress Bar Component - VisionOS 26 Style
 */
export const ProgressBar: React.FC<{ 
  percentage: number; 
  title: string; 
  subtitle?: string;
  color?: string;
}> = ({ percentage, title, subtitle, color = '#EF4444' }) => {
  return (
    <GlassCard className="p-6 mb-6" style={{
      background: `
        radial-gradient(circle at 30% 20%, color-mix(in srgb, ${color} 8%, transparent) 0%, transparent 60%),
        var(--glass-opacity)
      `,
      borderColor: `color-mix(in srgb, ${color} 20%, transparent)`
    }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-xl mb-1 flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, ${color} 35%, transparent), color-mix(in srgb, ${color} 25%, transparent))
                `,
                border: `2px solid color-mix(in srgb, ${color} 50%, transparent)`,
                boxShadow: `0 0 20px color-mix(in srgb, ${color} 30%, transparent)`
              }}
            >
              <SpatialIcon Icon={ICONS.Heart} size={20} style={{ color }} variant="pure" />
            </div>
            <div>
              <div className="text-xl">{title}</div>
              {subtitle && (
                <div className="text-white/60 text-sm font-normal mt-0.5">{subtitle}</div>
              )}
            </div>
          </h3>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ 
                background: color,
                boxShadow: `0 0 8px ${color}60`
              }} 
            />
            <span className="text-white font-bold text-lg">
              {percentage}%
            </span>
          </div>
          <span className="text-white/60 text-xs">Complété</span>
        </div>
      </div>
      
      <div className="relative">
        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-3 rounded-full relative overflow-hidden"
            style={{ 
              background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 80%, white))`,
              boxShadow: `0 0 12px ${color}60, inset 0 1px 0 rgba(255,255,255,0.3)`
            }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `linear-gradient(90deg, 
                  transparent 0%, 
                  rgba(255,255,255,0.4) 50%, 
                  transparent 100%
                )`,
                animation: 'progressShimmer 2s ease-in-out infinite'
              }}
            />
          </motion.div>
        </div>
        
        <div className="flex justify-between mt-2 text-xs text-white/50">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>
    </GlassCard>
  );
};

/**
 * Section Save Button Component
 */
export const SectionSaveButton: React.FC<{
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  sectionName: string;
}> = ({ isDirty, isSaving, onSave, sectionName }) => {
  const { formSubmit } = useFeedback();
  
  if (!isDirty) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex justify-end mt-4"
    >
      <button
        type="button"
        onClick={() => {
          formSubmit();
          onSave();
        }}
        disabled={isSaving}
        className="btn-glass px-4 py-2 text-sm"
      >
        <div className="flex items-center gap-2">
          {isSaving ? (
            <SpatialIcon Icon={ICONS.Loader2} size={14} className="animate-spin" />
          ) : (
            <SpatialIcon Icon={ICONS.Save} size={14} />
          )}
          <span>{isSaving ? 'Sauvegarde...' : `Sauvegarder ${sectionName}`}</span>
        </div>
      </button>
    </motion.div>
  );
};

/**
 * Array Item Manager Component for Health Data with Auto-Scroll
 */
export const ArrayItemManager: React.FC<{
  items: string[];
  newItem: string;
  setNewItem: (value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  placeholder: string;
  itemColor: string;
  itemLabel: string;
}> = ({ items, newItem, setNewItem, onAdd, onRemove, placeholder, itemColor, itemLabel }) => {
  const { click } = useFeedback();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listContainerRef = React.useRef<HTMLDivElement>(null);
  const lastItemRef = React.useRef<HTMLDivElement>(null);
  const previousItemsLengthRef = React.useRef(items.length);

  // Auto-scroll to newly added item and refocus input
  React.useEffect(() => {
    if (items.length > previousItemsLengthRef.current) {
      // An item was added
      click();

      // Wait for animation to start, then scroll
      setTimeout(() => {
        if (lastItemRef.current) {
          lastItemRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }
      }, 50);

      // Refocus input for easy multiple additions
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }

    previousItemsLengthRef.current = items.length;
  }, [items.length, click]);

  const handleAdd = () => {
    if (newItem.trim()) {
      onAdd();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          className="glass-input flex-1"
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <button
          type="button"
          onClick={handleAdd}
          className="btn-glass px-4"
          disabled={!newItem.trim()}
        >
          <SpatialIcon Icon={ICONS.Plus} size={14} />
        </button>
      </div>

      <div ref={listContainerRef} className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.div
              key={`${item}-${index}`}
              ref={index === items.length - 1 ? lastItemRef : null}
              className="chip chip--on flex items-center gap-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              style={{
                background: `${itemColor}15`,
                borderColor: `${itemColor}30`,
                color: itemColor
              }}
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="hover:opacity-80 transition-opacity"
                style={{ color: itemColor }}
                aria-label={`Retirer ${itemLabel} "${item}"`}
              >
                <SpatialIcon Icon={ICONS.X} size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};