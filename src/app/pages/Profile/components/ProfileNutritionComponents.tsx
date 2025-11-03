/**
 * Profile Nutrition Components
 * Reusable UI components for profile nutrition forms
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';
import { useFeedback } from '../../../../hooks/useFeedback';

export const ProgressBar: React.FC<{ 
  percentage: number; 
  title: string; 
  subtitle?: string;
  color?: string;
}> = ({ percentage, title, subtitle, color = '#10B981' }) => {
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
              <SpatialIcon Icon={ICONS.Utensils} size={20} style={{ color }} variant="pure" />
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
                border: `2px solid color-mix(in srgb, #10B981 50%, transparent)`,
                boxShadow: `0 0 20px color-mix(in srgb, #10B981 30%, transparent)`
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

export const ArrayItemManager: React.FC<{
  items: string[];
  newItem: string;
  setNewItem: (value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  placeholder: string;
  itemColor: string;
  itemLabel: string;
}> = React.memo(({ items, newItem, setNewItem, onAdd, onRemove, placeholder, itemColor, itemLabel }) => {
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

  const handleAdd = React.useCallback(() => {
    if (newItem.trim()) {
      onAdd();
    }
  }, [newItem, onAdd]);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  }, [handleAdd]);

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
          onKeyDown={handleKeyDown}
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
                background: `color-mix(in srgb, ${itemColor}, 0.15)`,
                borderColor: `color-mix(in srgb, ${itemColor}, 0.30)`,
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
}, (prevProps, nextProps) => {
  // Custom comparison for React.memo
  if (prevProps.items.length !== nextProps.items.length) return false;
  if (prevProps.newItem !== nextProps.newItem) return false;
  if (prevProps.placeholder !== nextProps.placeholder) return false;
  if (prevProps.itemColor !== nextProps.itemColor) return false;
  if (prevProps.itemLabel !== nextProps.itemLabel) return false;

  // Deep comparison of items array
  for (let i = 0; i < prevProps.items.length; i++) {
    if (prevProps.items[i] !== nextProps.items[i]) return false;
  }

  return true;
});

export const TriStatePreferenceManager: React.FC<{
  items: Array<{ name: string; preference: 'like' | 'neutral' | 'dislike' | 'ban' }>;
  onUpdate: (items: Array<{ name: string; preference: 'like' | 'neutral' | 'dislike' | 'ban' }>) => void;
  suggestions: string[];
  placeholder: string;
  itemColor: string;
}> = React.memo(({ items, onUpdate, suggestions, placeholder, itemColor }) => {
  const [newItem, setNewItem] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const addItem = React.useCallback((name: string) => {
    if (name.trim() && !items.find(item => item.name === name.trim())) {
      const newItems = [...items, { name: name.trim(), preference: 'neutral' as const }];
      onUpdate(newItems);
      setNewItem('');
      setShowSuggestions(false);
    }
  }, [items, onUpdate]);

  const updatePreference = React.useCallback((index: number, preference: 'like' | 'neutral' | 'dislike' | 'ban') => {
    const currentItem = items[index];
    if (currentItem && currentItem.preference !== preference) {
      const updated = [...items];
      updated[index] = { ...updated[index], preference };
      onUpdate(updated);
    }
  }, [items, onUpdate]);

  const removeItem = React.useCallback((index: number) => {
    const filtered = items.filter((_, i) => i !== index);
    onUpdate(filtered);
  }, [items, onUpdate]);

  const getPreferenceColor = React.useCallback((preference: string) => {
    switch (preference) {
      case 'like': return '#10B981';
      case 'neutral': return '#6B7280';
      case 'dislike': return '#F59E0B';
      case 'ban': return '#EF4444';
      default: return '#6B7280';
    }
  }, []);

  const getPreferenceIcon = React.useCallback((preference: string) => {
    switch (preference) {
      case 'like': return ICONS.Heart;
      case 'neutral': return ICONS.Minus;
      case 'dislike': return ICONS.X;
      case 'ban': return ICONS.Ban;
      default: return ICONS.Minus;
    }
  }, []);

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            className="glass-input flex-1"
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addItem(newItem);
              }
            }}
          />
          <button
            type="button"
            onClick={() => addItem(newItem)}
            className="btn-glass px-4"
          >
            <SpatialIcon Icon={ICONS.Plus} size={14} />
          </button>
        </div>
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl p-2 z-10">
            <div className="flex flex-wrap gap-1">
              {suggestions.filter(s => !items.find(item => item.name === s)).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addItem(suggestion)}
                  className="text-xs px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        {items.map((item, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <span className="flex-1 text-white">{item.name}</span>
            
            <div className="flex items-center gap-1">
              {(['like', 'neutral', 'dislike', 'ban'] as const).map((pref) => (
                <button
                  key={pref}
                  type="button"
                  onClick={() => updatePreference(index, pref)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    item.preference === pref 
                      ? 'bg-white/20 border border-white/30' 
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                  style={{
                    color: item.preference === pref ? getPreferenceColor(pref) : '#9CA3AF'
                  }}
                >
                  <SpatialIcon Icon={getPreferenceIcon(pref)} size={14} />
                </button>
              ))}
            </div>
            
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
            >
              <SpatialIcon Icon={ICONS.Trash2} size={14} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for React.memo to avoid unnecessary re-renders
  if (prevProps.items.length !== nextProps.items.length) return false;
  if (prevProps.placeholder !== nextProps.placeholder) return false;
  if (prevProps.itemColor !== nextProps.itemColor) return false;

  // Deep comparison of items array
  for (let i = 0; i < prevProps.items.length; i++) {
    if (prevProps.items[i].name !== nextProps.items[i].name) return false;
    if (prevProps.items[i].preference !== nextProps.items[i].preference) return false;
  }

  // Deep comparison of suggestions array
  if (prevProps.suggestions.length !== nextProps.suggestions.length) return false;
  for (let i = 0; i < prevProps.suggestions.length; i++) {
    if (prevProps.suggestions[i] !== nextProps.suggestions[i]) return false;
  }

  return true;
});