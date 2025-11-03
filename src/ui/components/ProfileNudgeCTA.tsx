import React from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../cards/GlassCard';
import SpatialIcon from '../icons/SpatialIcon';
import { ICONS } from '../icons/registry';
import { useFeedback } from '../../hooks/useFeedback';
import type { ProfileCompletionResult } from '../../system/profile/profileCompletionService';
import { navigateWithScroll } from '../../utils/navigationUtils';

interface ProfileNudgeCTAProps {
  completion: ProfileCompletionResult;
  forgeName: string;
  forgeColor: string;
  className?: string;
}

const ProfileNudgeCTA: React.FC<ProfileNudgeCTAProps> = ({
  completion,
  forgeName,
  forgeColor,
  className = ''
}) => {
  const navigate = useNavigate();
  const { click } = useFeedback();

  if (!completion || completion.isSufficient) {
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
    }
  };

  const priorityColor = completion.missingHighPriorityFields.length > 0 ? '#EF4444' : '#F59E0B';
  const priorityLabel = completion.missingHighPriorityFields.length > 0 ? 'Champs critiques manquants' : 'Optimisation recommandée';

  return (
    <GlassCard
      className={`p-6 ${className}`}
      style={{
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, ${priorityColor} 10%, transparent) 0%, transparent 60%),
          radial-gradient(circle at 70% 80%, color-mix(in srgb, ${forgeColor} 8%, transparent) 0%, transparent 50%),
          var(--glass-opacity)
        `,
        borderColor: `color-mix(in srgb, ${priorityColor} 20%, transparent)`,
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.2),
          0 0 20px color-mix(in srgb, ${priorityColor} 12%, transparent),
          inset 0 1px 0 rgba(255, 255, 255, 0.1)
        `
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
              linear-gradient(135deg, color-mix(in srgb, ${priorityColor} 30%, transparent), color-mix(in srgb, ${priorityColor} 20%, transparent))
            `,
            border: `2px solid color-mix(in srgb, ${priorityColor} 40%, transparent)`,
            boxShadow: `0 0 20px color-mix(in srgb, ${priorityColor} 25%, transparent)`
          }}
        >
          <SpatialIcon Icon={ICONS.AlertCircle} size={20} style={{ color: priorityColor }} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: priorityColor }}
            />
            <span
              className="text-sm font-semibold"
              style={{ color: priorityColor }}
            >
              {priorityLabel}
            </span>
          </div>

          <h4 className="text-white font-bold text-base mb-2">
            Complétez votre profil pour {forgeName}
          </h4>

          <p className="text-white/70 text-sm mb-3 leading-relaxed">
            {completion.suggestedMessage}
          </p>

          <div className="mb-4">
            <div className="flex justify-between text-xs text-white/60 mb-1.5">
              <span>Profil complété</span>
              <span className="font-semibold">{completion.completionPercentage}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-1.5 rounded-full transition-all duration-1000 ease-out"
                style={{
                  background: `linear-gradient(90deg, ${priorityColor}, color-mix(in srgb, ${priorityColor} 80%, white))`,
                  width: `${completion.completionPercentage}%`
                }}
              />
            </div>
          </div>

          {completion.missingHighPriorityFields.length > 0 && (
            <div className="mb-4 p-3 rounded-lg" style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.15)'
            }}>
              <div className="flex items-start gap-2">
                <SpatialIcon
                  Icon={ICONS.AlertTriangle}
                  size={14}
                  className="flex-shrink-0 mt-0.5"
                  style={{ color: '#EF4444' }}
                />
                <div className="flex-1">
                  <p className="text-red-300 text-xs font-medium mb-1">
                    Champs essentiels manquants :
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {completion.missingHighPriorityFields.map((field) => (
                      <span
                        key={field.key}
                        className="inline-block px-2 py-0.5 rounded text-xs"
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#FCA5A5'
                        }}
                      >
                        {field.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {completion.nextAction && (
            <button
              onClick={handleNavigateToProfile}
              className="group relative overflow-hidden px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, color-mix(in srgb, ${priorityColor} 85%, transparent) 0%, color-mix(in srgb, ${priorityColor} 75%, transparent) 100%)`,
                border: `2px solid color-mix(in srgb, ${priorityColor} 60%, transparent)`,
                boxShadow: `
                  0 8px 24px color-mix(in srgb, ${priorityColor} 35%, transparent),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.15)
                `,
                color: '#FFFFFF',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
              }}
            >
              <div className="relative flex items-center justify-center gap-2">
                <SpatialIcon
                  Icon={ICONS.User}
                  size={16}
                  style={{
                    color: '#FFFFFF',
                    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
                  }}
                />
                <span>{completion.nextAction.label}</span>
                <SpatialIcon
                  Icon={ICONS.ArrowRight}
                  size={14}
                  style={{
                    color: '#FFFFFF',
                    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
                  }}
                />
              </div>
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default ProfileNudgeCTA;
