import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../cards/GlassCard';
import SpatialIcon from '../icons/SpatialIcon';
import { ICONS } from '../icons/registry';
import { useFeedback } from '../../hooks/useFeedback';
import type { ProfileCompletionResult } from '../../system/profile/profileCompletionService';
import { navigateWithScroll } from '../../utils/navigationUtils';

// Storage key for dismissed nudges
const NUDGE_DISMISS_KEY = 'twinforge:profile-nudge:dismissed';
const DISMISS_DURATION_HOURS = 24;

/**
 * Check if nudge was recently dismissed
 */
function isNudgeDismissed(): boolean {
  try {
    const dismissedData = localStorage.getItem(NUDGE_DISMISS_KEY);
    if (!dismissedData) return false;
    
    const { timestamp } = JSON.parse(dismissedData);
    const dismissedAt = new Date(timestamp);
    const now = new Date();
    const hoursSinceDismiss = (now.getTime() - dismissedAt.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceDismiss < DISMISS_DURATION_HOURS;
  } catch {
    return false;
  }
}

/**
 * Mark nudge as dismissed
 */
function dismissNudge(): void {
  try {
    localStorage.setItem(NUDGE_DISMISS_KEY, JSON.stringify({
      timestamp: new Date().toISOString(),
      completionPercentage: 0 // Will be updated by component
    }));
  } catch {
    // Ignore localStorage errors
  }
}

interface ProfileNudgeProps {
  completion: ProfileCompletionResult;
  variant?: 'banner' | 'card' | 'compact';
  className?: string;
  onDismiss?: () => void;
  showDismiss?: boolean;
}

/**
 * Profile Nudge Component - VisionOS 26 Style
 * Non-intrusive component to guide users to complete their profile
 */
const ProfileNudge: React.FC<ProfileNudgeProps> = ({
  completion,
  variant = 'card',
  className = '',
  onDismiss,
  showDismiss = true
}) => {
  const navigate = useNavigate();
  const { click, success } = useFeedback();
  const [isDismissed, setIsDismissed] = React.useState(false);

  // Check if nudge was dismissed on mount
  React.useEffect(() => {
    setIsDismissed(isNudgeDismissed());
  }, []);

  // Defensive check: Don't show if completion is null/undefined
  if (!completion) {
    if (process.env.NODE_ENV === 'development') {
      console.error('ProfileNudge: completion prop is null or undefined');
    }
    return null;
  }

  // Don't show if profile is sufficient or nudge was dismissed
  if (completion.isSufficient || isDismissed) {
    return null;
  }

  const handleNavigateToProfile = () => {
    click();

    if (completion.nextAction) {
      // Parse route: /profile?tab=nutrition#section-id
      const route = completion.nextAction.route;

      // Split on # first to get hash
      const [pathWithQuery, hash] = route.split('#');

      // Then split on ? to get path and query
      const [basePath, search] = pathWithQuery.split('?');

      // Extract tab from search params if present
      const params = new URLSearchParams(search);
      const tab = params.get('tab');

      navigateWithScroll(navigate, basePath, {
        tab: tab || undefined,
        hash: hash || undefined,
        smooth: true,
        delay: 200 // Increase delay for tab switching + scroll
      });
      success();
    }
  };

  const handleDismiss = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    click();
    
    // Mark as dismissed in localStorage
    dismissNudge();
    setIsDismissed(true);
    
    onDismiss?.();
  };

  // Get priority color based on missing fields
  const priorityColor = completion.missingHighPriorityFields.length > 0 ? '#EF4444' : '#F59E0B';
  const priorityLabel = completion.missingHighPriorityFields.length > 0 ? 'Critique' : 'Recommandé';

  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`w-full ${className}`}
      >
        <GlassCard 
          className="p-4"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, color-mix(in srgb, ${priorityColor} 12%, transparent) 0%, transparent 60%),
              var(--glass-opacity)
            `,
            borderColor: `color-mix(in srgb, ${priorityColor} 25%, transparent)`,
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.2),
              0 0 20px color-mix(in srgb, ${priorityColor} 15%, transparent),
              inset 0 1px 0 rgba(255, 255, 255, 0.15)
            `
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: `color-mix(in srgb, ${priorityColor} 20%, transparent)`,
                  border: `2px solid color-mix(in srgb, ${priorityColor} 40%, transparent)`
                }}
              >
                <SpatialIcon Icon={ICONS.User} size={18} style={{ color: priorityColor }} />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">{completion.suggestedMessage}</h4>
                <p className="text-white/70 text-xs">
                  {completion.completionPercentage}% complété • {priorityLabel}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {completion.nextAction && (
                <button
                  onClick={handleNavigateToProfile}
                  className="btn-glass--primary px-4 py-2 text-sm"
                >
                  {completion.nextAction.label}
                </button>
              )}
              {showDismiss && (
                <button
                  onClick={handleDismiss}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <SpatialIcon Icon={ICONS.X} size={14} className="text-white/60" />
                </button>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`inline-flex ${className}`}
      >
        <button
          onClick={handleNavigateToProfile}
          className="flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all duration-200"
          style={{
            background: `color-mix(in srgb, ${priorityColor} 15%, transparent)`,
            border: `1px solid color-mix(in srgb, ${priorityColor} 30%, transparent)`,
            color: priorityColor
          }}
        >
          <SpatialIcon Icon={ICONS.AlertCircle} size={14} />
          <span className="font-medium">Profil {completion.completionPercentage}%</span>
        </button>
      </motion.div>
    );
  }

  // Default card variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={className}
    >
      <GlassCard 
        className="p-6"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, ${priorityColor} 12%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, #06B6D4 8%, transparent) 0%, transparent 50%),
            var(--glass-opacity)
          `,
          borderColor: `color-mix(in srgb, ${priorityColor} 25%, transparent)`,
          boxShadow: `
            0 12px 40px rgba(0, 0, 0, 0.25),
            0 0 30px color-mix(in srgb, ${priorityColor} 15%, transparent),
            inset 0 2px 0 rgba(255, 255, 255, 0.15)
          `
        }}
      >
        <div className="flex items-start gap-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, ${priorityColor} 35%, transparent), color-mix(in srgb, ${priorityColor} 25%, transparent))
              `,
              border: `2px solid color-mix(in srgb, ${priorityColor} 50%, transparent)`,
              boxShadow: `0 0 20px color-mix(in srgb, ${priorityColor} 30%, transparent)`
            }}
          >
            <SpatialIcon Icon={ICONS.User} size={20} style={{ color: priorityColor }} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold text-lg">
                Optimisez vos Recettes
              </h3>
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ background: priorityColor }}
                />
                <span 
                  className="text-sm font-medium"
                  style={{ color: priorityColor }}
                >
                  {priorityLabel}
                </span>
              </div>
            </div>
            
            <p className="text-white/80 text-sm mb-4 leading-relaxed">
              {completion.suggestedMessage}
            </p>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-white/60 mb-2">
                <span>Profil complété</span>
                <span>{completion.completionPercentage}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-2 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${priorityColor}, color-mix(in srgb, ${priorityColor} 80%, white))`,
                    width: `${completion.completionPercentage}%`
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${completion.completionPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Missing Fields Preview */}
            {completion.missingHighPriorityFields.length > 0 && (
              <div className="mb-4">
                <h5 className="text-white/90 text-sm font-medium mb-2">Champs essentiels manquants :</h5>
                <div className="space-y-1">
                  {completion.missingHighPriorityFields.slice(0, 3).map((field, index) => (
                    <div key={field.key} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-400" />
                      <span className="text-red-300 text-xs">{field.label}</span>
                      <span className="text-white/50 text-xs">• {field.description}</span>
                    </div>
                  ))}
                  {completion.missingHighPriorityFields.length > 3 && (
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-400" />
                      <span className="text-red-300 text-xs">
                        +{completion.missingHighPriorityFields.length - 3} autres champs
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              {completion.nextAction && (
                <button
                  onClick={handleNavigateToProfile}
                  className="btn-glass--primary px-4 py-2"
                >
                  <div className="flex items-center gap-2">
                    <SpatialIcon Icon={ICONS.ArrowRight} size={14} />
                    <span>{completion.nextAction.label}</span>
                  </div>
                </button>
              )}
              
              {showDismiss && (
                <button
                  onClick={handleDismiss}
                  className="btn-glass--secondary-nav px-3 py-2"
                  title="Ignorer pour maintenant"
                >
                  <SpatialIcon Icon={ICONS.X} size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default ProfileNudge;