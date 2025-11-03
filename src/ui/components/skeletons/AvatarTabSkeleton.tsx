import React from 'react';
import { ConditionalMotion } from '../../../lib/motion';
import GlassCard from '../../cards/GlassCard';
import SkeletonBase from './SkeletonBase';
import { usePerformanceMode } from '../../../system/context/PerformanceModeContext';

interface AvatarTabSkeletonProps {
  className?: string;
}

const AvatarTabSkeleton: React.FC<AvatarTabSkeletonProps> = ({ className = '' }) => {
  const { isPerformanceMode } = usePerformanceMode();

  return (
    <div className={`space-y-8 w-full ${className}`}>
      <GlassCard className="p-6">
        <div className="flex items-center mb-4">
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
        </div>

        <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] rounded-xl overflow-hidden"
          style={{
            background: isPerformanceMode
              ? 'rgba(139, 92, 246, 0.06)'
              : 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(59, 130, 246, 0.04))',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {isPerformanceMode ? (
              <div className="relative">
                <div
                  className="w-32 h-32 rounded-full border-4"
                  style={{ borderColor: 'rgba(139, 92, 246, 0.3)' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-24 h-24 rounded-full"
                    style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                    }}
                  />
                </div>
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span className="text-white/70 text-sm font-medium">
                    Chargement de votre avatar...
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
                  style={{ borderColor: 'rgba(139, 92, 246, 0.3)' }}
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
                      background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4), rgba(139, 92, 246, 0.1))',
                      boxShadow: '0 0 40px rgba(139, 92, 246, 0.3)'
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
                    Chargement de votre avatar...
                  </span>
                </ConditionalMotion>
              </ConditionalMotion>
            )}
          </div>

          {!isPerformanceMode && (
            <ConditionalMotion
              className="absolute top-4 right-4 w-20 h-20 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2), transparent)',
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

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
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
          <SkeletonBase
            width="100px"
            height="24px"
            borderRadius="12px"
            shimmer
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
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
              <div className="flex items-center gap-2 mb-2">
                <SkeletonBase width="32px" height="32px" borderRadius="8px" shimmer />
                <SkeletonBase width="80px" height="12px" shimmer />
              </div>
              <SkeletonBase width="60px" height="24px" shimmer className="mb-1" />
              <SkeletonBase width="50px" height="14px" shimmer />
            </ConditionalMotion>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <SkeletonBase
              width="40px"
              height="40px"
              borderRadius="50%"
              shimmer
            />
            <SkeletonBase
              width="200px"
              height="20px"
              shimmer
            />
          </div>
          <SkeletonBase
            width="120px"
            height="24px"
            borderRadius="12px"
            shimmer
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, index) => (
            <ConditionalMotion
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
              className="p-4 rounded-xl text-center"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="flex justify-center mb-3">
                <SkeletonBase width="48px" height="48px" borderRadius="50%" shimmer />
              </div>
              <SkeletonBase width="80%" height="16px" shimmer className="mx-auto mb-2" />
              <SkeletonBase width="60%" height="14px" shimmer className="mx-auto" />
            </ConditionalMotion>
          ))}
        </div>

        <ConditionalMotion
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="p-4 rounded-xl"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <SkeletonBase width="100%" height="14px" shimmer className="mb-2" />
          <SkeletonBase width="90%" height="14px" shimmer className="mb-2" />
          <SkeletonBase width="80%" height="14px" shimmer />
        </ConditionalMotion>
      </GlassCard>

      <div className="mt-8 text-center">
        <SkeletonBase
          width="250px"
          height="56px"
          borderRadius="28px"
          shimmer
          className="mx-auto"
        />
      </div>
    </div>
  );
};

export default AvatarTabSkeleton;
