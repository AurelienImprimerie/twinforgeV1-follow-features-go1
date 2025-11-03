import React from 'react';

interface AIStatusBadgeProps {
  isActive: boolean; 
  model?: string; 
  fallbackUsed?: boolean;
  className?: string;
}

/**
 * AI Status Badge Component
 * Displays the current status of the analysis system
 */
const AIStatusBadge: React.FC<AIStatusBadgeProps> = ({ 
  isActive, 
  model, 
  fallbackUsed, 
  className = '' 
}) => {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${className}`}
         style={{
           background: isActive ? 
             'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(34, 197, 94, 0.15))' :
             'rgba(255, 255, 255, 0.05)',
           border: isActive ? 
             '1px solid rgba(16, 185, 129, 0.4)' : 
             '1px solid rgba(255, 255, 255, 0.1)',
           backdropFilter: 'blur(8px) saturate(120%)'
         }}>
      <div className={`w-2 h-2 rounded-full ${
        isActive ? 'bg-green-400' : 'bg-gray-400'
      }`} 
           style={{
             boxShadow: isActive ? '0 0 8px rgba(16, 185, 129, 0.6)' : 'none',
             animation: isActive ? 'pulse 2s ease-in-out infinite' : 'none'
           }} />
      <span className={isActive ? 'text-green-300' : 'text-gray-400'}>
        {isActive ? 
          (fallbackUsed ? `Fallback (${model})` : `TwinForge (${model})`) : 
          'Inactive'
        }
      </span>
    </div>
  );
};

export default AIStatusBadge;