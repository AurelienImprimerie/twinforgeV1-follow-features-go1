import React from 'react';
import { ConditionalMotion } from '../../../lib/motion';
import GlassCard from '../../cards/GlassCard';
import SkeletonBase from './SkeletonBase';
import { usePerformanceMode } from '../../../system/context/PerformanceModeContext';

interface FaceViewer3DSkeletonProps {
  className?: string;
}

const FaceViewer3DSkeleton: React.FC<FaceViewer3DSkeletonProps> = ({ className = '' }) => {
  const { isPerformanceMode } = usePerformanceMode();

  return (
    <div className={`space-y-6 w-full ${className}`}>
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SkeletonBase
              width="40px"
              height="40px"
              borderRadius="50%"
              shimmer
            />
            <SkeletonBase
              width="150px"
              height="24px"
              shimmer
            />
          </div>

          <SkeletonBase
            width="120px"
            height="20px"
            shimmer
          />
        </div>

        <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] rounded-xl overflow-hidden"
          style={{
            background: isPerformanceMode
              ? 'rgba(236, 72, 153, 0.06)'
              : 'linear-gradient(135deg, rgba(236, 72, 153, 0.08), rgba(236, 72, 153, 0.04))',
            border: '1px solid rgba(236, 72, 153, 0.2)'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {isPerformanceMode ? (
              <div className="relative">
                <div
                  className="w-32 h-32 rounded-full border-4"
                  style={{ borderColor: 'rgba(236, 72, 153, 0.3)' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-24 h-24 rounded-full"
                    style={{
                      background: 'rgba(236, 72, 153, 0.2)',
                    }}
                  />
                </div>
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span className="text-white/70 text-sm font-medium">
                    Chargement du visage 3D...
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
                  style={{ borderColor: 'rgba(236, 72, 153, 0.3)' }}
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
                      background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4), rgba(236, 72, 153, 0.1))',
                      boxShadow: '0 0 40px rgba(236, 72, 153, 0.3)'
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
                    Chargement du visage 3D...
                  </span>
                </ConditionalMotion>
              </ConditionalMotion>
            )}
          </div>

          {!isPerformanceMode && (
            <ConditionalMotion
              className="absolute top-4 right-4 w-20 h-20 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2), transparent)',
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonBase
          height="64px"
          borderRadius="9999px"
          shimmer
        />
        <SkeletonBase
          height="64px"
          borderRadius="9999px"
          shimmer
        />
      </div>
    </div>
  );
};

export default FaceViewer3DSkeleton;
