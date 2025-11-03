import React from 'react';
import { ConditionalMotion } from '../../../lib/motion';
import GlassCard from '../../cards/GlassCard';
import SkeletonBase from './SkeletonBase';
import { usePerformanceMode } from '../../../system/context/PerformanceModeContext';

interface ProjectionTabSkeletonProps {
  className?: string;
}

const ProjectionTabSkeleton: React.FC<ProjectionTabSkeletonProps> = ({ className = '' }) => {
  const { isPerformanceMode } = usePerformanceMode();

  return (
    <div className={`space-y-6 w-full ${className}`}>
      <GlassCard className="p-6">
        <div className="flex items-start gap-3 mb-6">
          <SkeletonBase
            width="48px"
            height="48px"
            borderRadius="50%"
            shimmer
          />
          <div className="flex-1 space-y-2">
            <SkeletonBase
              width="220px"
              height="20px"
              shimmer
            />
            <SkeletonBase
              width="90%"
              height="14px"
              shimmer
            />
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center mb-2">
            <SkeletonBase width="180px" height="16px" shimmer />
            <SkeletonBase width="100px" height="14px" shimmer />
          </div>
          <div className="flex items-center gap-3">
            <SkeletonBase width="40px" height="40px" borderRadius="12px" shimmer />
            <div className="flex-1 space-y-2">
              <SkeletonBase width="60px" height="28px" shimmer className="mx-auto" />
              <SkeletonBase width="100%" height="6px" borderRadius="9999px" shimmer />
            </div>
            <SkeletonBase width="40px" height="40px" borderRadius="12px" shimmer />
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center mb-2">
            <SkeletonBase width="160px" height="16px" shimmer />
            <SkeletonBase width="80px" height="14px" shimmer />
          </div>
          <div className="flex items-center gap-3">
            <SkeletonBase width="40px" height="40px" borderRadius="12px" shimmer />
            <div className="flex-1 space-y-2">
              <SkeletonBase width="60px" height="28px" shimmer className="mx-auto" />
              <SkeletonBase width="100%" height="6px" borderRadius="9999px" shimmer />
            </div>
            <SkeletonBase width="40px" height="40px" borderRadius="12px" shimmer />
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center mb-2">
            <SkeletonBase width="140px" height="16px" shimmer />
            <SkeletonBase width="120px" height="14px" shimmer />
          </div>
          <div className="flex items-center gap-3">
            <SkeletonBase width="40px" height="40px" borderRadius="12px" shimmer />
            <div className="flex-1 space-y-2">
              <SkeletonBase width="60px" height="28px" shimmer className="mx-auto" />
              <SkeletonBase width="100%" height="6px" borderRadius="9999px" shimmer />
            </div>
            <SkeletonBase width="40px" height="40px" borderRadius="12px" shimmer />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <SkeletonBase width="140px" height="16px" shimmer />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, index) => (
              <SkeletonBase
                key={index}
                width="100%"
                height="36px"
                borderRadius="8px"
                shimmer
              />
            ))}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <SkeletonBase
            width="40px"
            height="40px"
            borderRadius="50%"
            shimmer
          />
          <SkeletonBase
            width="240px"
            height="20px"
            shimmer
          />
        </div>

        <div className="relative h-[450px] sm:h-[550px] lg:h-[650px] rounded-xl overflow-hidden"
          style={{
            background: isPerformanceMode
              ? 'rgba(16, 185, 129, 0.06)'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(6, 182, 212, 0.04))',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {isPerformanceMode ? (
              <div className="relative">
                <div
                  className="w-32 h-32 rounded-full border-4"
                  style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-24 h-24 rounded-full"
                    style={{
                      background: 'rgba(16, 185, 129, 0.2)',
                    }}
                  />
                </div>
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span className="text-white/70 text-sm font-medium">
                    Calcul de votre projection...
                  </span>
                </div>
              </div>
            ) : (
              <ConditionalMotion
                className="relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <ConditionalMotion
                  className="w-32 h-32 rounded-full border-4"
                  style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                <ConditionalMotion
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <ConditionalMotion
                    className="w-24 h-24 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4), rgba(16, 185, 129, 0.1))',
                      boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)'
                    }}
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </ConditionalMotion>

                <ConditionalMotion
                  className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                  animate={{
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <span className="text-white/70 text-sm font-medium">
                    Calcul de votre projection...
                  </span>
                </ConditionalMotion>
              </ConditionalMotion>
            )}
          </div>

          {!isPerformanceMode && (
            <ConditionalMotion
              className="absolute top-4 right-4 w-20 h-20 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2), transparent)',
              }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
          )}
        </div>
      </GlassCard>

      <div className="glass-card p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-start gap-2">
          <SkeletonBase width="16px" height="16px" borderRadius="50%" shimmer className="mt-0.5" />
          <div className="flex-1 space-y-2">
            <SkeletonBase width="100%" height="12px" shimmer />
            <SkeletonBase width="95%" height="12px" shimmer />
            <SkeletonBase width="85%" height="12px" shimmer />
          </div>
        </div>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <SkeletonBase
            width="40px"
            height="40px"
            borderRadius="50%"
            shimmer
          />
          <SkeletonBase
            width="180px"
            height="20px"
            shimmer
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, index) => (
            <ConditionalMotion
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
              className="p-4 rounded-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <SkeletonBase width="32px" height="32px" borderRadius="8px" shimmer />
                <SkeletonBase width="80px" height="16px" shimmer />
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <SkeletonBase width="80px" height="32px" shimmer />
                <SkeletonBase width="60px" height="20px" shimmer />
              </div>
              <div className="flex items-center gap-2">
                <SkeletonBase width="16px" height="16px" borderRadius="4px" shimmer />
                <SkeletonBase width="100px" height="14px" shimmer />
              </div>
            </ConditionalMotion>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default ProjectionTabSkeleton;
