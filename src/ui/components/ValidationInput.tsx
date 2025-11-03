/**
 * Validation Input
 * Enhanced input with real-time validation feedback
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpatialIcon from '../icons/SpatialIcon';
import { ICONS } from '../icons/registry';
import { useFieldValidation, type ValidationStatus } from '../../hooks/useFieldValidation';
import { z } from 'zod';
import ContextualTooltip from './ContextualTooltip';

interface ValidationInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  onBlur?: () => void;
  schema?: z.ZodSchema;
  error?: string;
  helpText?: string;
  examples?: string[];
  learnMoreUrl?: string;
  showValidation?: boolean;
  containerClassName?: string;
}

/**
 * Get status icon and color based on validation state
 */
function getValidationIcon(status: ValidationStatus) {
  switch (status) {
    case 'validating':
      return { icon: ICONS.Loader2, color: '#F59E0B', spin: true };
    case 'valid':
      return { icon: ICONS.Check, color: '#10B981', spin: false };
    case 'invalid':
      return { icon: ICONS.AlertCircle, color: '#EF4444', spin: false };
    default:
      return null;
  }
}

const ValidationInput: React.FC<ValidationInputProps> = ({
  label,
  value,
  onChange,
  onBlur,
  schema,
  error: externalError,
  helpText,
  examples,
  learnMoreUrl,
  showValidation = true,
  containerClassName = '',
  className = '',
  ...inputProps
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const { status, error: validationError, isValidating } = useFieldValidation(value, {
    schema,
    debounceMs: 500,
    validateOnChange: true,
  });

  const displayError = externalError || validationError;
  const validationIcon = showValidation ? getValidationIcon(status) : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = inputProps.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    onChange(newValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {/* Label with optional tooltip */}
      <div className="flex items-center gap-2">
        <label
          htmlFor={inputProps.id}
          className="block text-white/90 text-sm font-medium"
        >
          {label}
          {inputProps.required && <span className="text-red-400 ml-1">*</span>}
        </label>

        {/* Help tooltip */}
        {(helpText || examples || learnMoreUrl) && (
          <ContextualTooltip
            title="Information"
            content={helpText}
            examples={examples}
            learnMoreUrl={learnMoreUrl}
            placement="top"
          >
            <button
              type="button"
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Plus d'informations"
            >
              <SpatialIcon
                Icon={ICONS.HelpCircle}
                size={14}
                className="text-white/40 hover:text-white/60"
              />
            </button>
          </ContextualTooltip>
        )}
      </div>

      {/* Input with validation indicator */}
      <div className="relative">
        <input
          {...inputProps}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`
            glass-input
            pr-12
            ${isFocused ? 'ring-2 ring-blue-400/30' : ''}
            ${displayError ? 'border-red-400/50 focus:border-red-400' : ''}
            ${status === 'valid' && !displayError ? 'border-green-400/50' : ''}
            ${className}
          `}
          aria-invalid={!!displayError}
          aria-describedby={displayError ? `${inputProps.id}-error` : undefined}
        />

        {/* Validation indicator */}
        <AnimatePresence>
          {showValidation && validationIcon && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  validationIcon.spin ? 'animate-spin' : ''
                }`}
                style={{
                  background: `${validationIcon.color}20`,
                  border: `1px solid ${validationIcon.color}40`,
                }}
              >
                <SpatialIcon
                  Icon={validationIcon.icon}
                  size={12}
                  style={{ color: validationIcon.color }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Focus ring animation */}
        {isFocused && (
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              boxShadow: '0 0 0 3px rgba(96, 165, 250, 0.2)',
            }}
          />
        )}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {displayError && (
          <motion.div
            id={`${inputProps.id}-error`}
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-2 text-red-300 text-xs"
          >
            <SpatialIcon Icon={ICONS.AlertCircle} size={12} className="mt-0.5 flex-shrink-0" />
            <span>{displayError}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ValidationInput;
