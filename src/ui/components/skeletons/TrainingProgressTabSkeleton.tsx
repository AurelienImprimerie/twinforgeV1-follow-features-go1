import React from 'react';
import { ConditionalMotion } from '../../../lib/motion';
import GlassCard from '../../cards/GlassCard';
import SkeletonBase from './SkeletonBase';
import { usePerformanceMode } from '../../../system/context/PerformanceModeContext';

interface TrainingProgressTabSkeletonProps {
  className?: string;
}

const TrainingProgressTabSkeleton: React.FC<TrainingProgressTabSkeletonProps> = ({ className = '' }) => {
  const { isPerformanceMode } = usePerformanceMode();

  return (
    <div className={`space-y-6 w-full ${className}`}>
      <div className="flex justify-center">
        <div className="inline-flex gap-2 p-1 rounded-lg" style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {[...Array(3)].map((_, index) => (
            <SkeletonBase
              key={index}
              width="110px"
              height="36px"
              borderRadius="8px"
              shimmer
            />
          ))}
        </div>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <SkeletonBase
              width="48px"
              height="48px"
              borderRadius="50%"
              shimmer
            />
            <SkeletonBase
              width="160px"
              height="24px"
              shimmer
            />
          </div>
          <SkeletonBase
            width="100px"
            height="28px"
            borderRadius="14px"
            shimmer
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
              <div className="flex items-center gap-2 mb-3">
                <SkeletonBase width="36px" height="36px" borderRadius="8px" shimmer />
                <SkeletonBase width="70px" height="12px" shimmer />
              </div>
              <SkeletonBase width="80px" height="28px" shimmer className="mb-2" />
              <SkeletonBase width="60px" height="14px" shimmer />
            </ConditionalMotion>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, index) => (
            <ConditionalMotion
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="p-3 rounded-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div className="flex items-center gap-2">
                <SkeletonBase width="20px" height="20px" borderRadius="4px" shimmer />
                <SkeletonBase width="120px" height="12px" shimmer />
              </div>
            </ConditionalMotion>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
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

        <ConditionalMotion
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <SkeletonBase width="100%" height="16px" shimmer />
          <SkeletonBase width="95%" height="16px" shimmer />
          <SkeletonBase width="88%" height="16px" shimmer />
          <SkeletonBase width="92%" height="16px" shimmer />
        </ConditionalMotion>

        <div className="mt-4 pt-4 border-t border-white/10">
          <SkeletonBase width="140px" height="12px" shimmer />
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
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

        <div className="relative h-[300px] rounded-xl overflow-hidden"
          style={{
            background: isPerformanceMode
              ? 'rgba(59, 130, 246, 0.05)'
              : 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.03))',
            border: '1px solid rgba(59, 130, 246, 0.15)'
          }}
        >
          {isPerformanceMode ? (
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around px-8 pb-8 gap-2">
              {[...Array(8)].map((_, index) => {
                const randomHeight = 40 + Math.random() * 60;
                return (
                  <div
                    key={index}
                    className="flex-1 rounded-t-lg"
                    style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      height: `${randomHeight}%`
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <>
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around px-8 pb-8 gap-2">
                {[...Array(8)].map((_, index) => {
                  const randomHeight = 40 + Math.random() * 60;
                  return (
                    <ConditionalMotion
                      key={index}
                      className="flex-1 rounded-t-lg"
                      style={{
                        background: 'linear-gradient(to top, rgba(59, 130, 246, 0.3), rgba(59, 130, 246, 0.15))',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        height: `${randomHeight}%`
                      }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{
                        duration: 0.6,
                        delay: 0.2 + index * 0.1,
                        ease: 'easeOut'
                      }}
                    />
                  );
                })}
              </div>

              <ConditionalMotion
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.03) 50%, transparent 100%)'
                }}
                animate={{
                  x: ['-100%', '200%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            </>
          )}
        </div>

        <div className="flex justify-center gap-6 mt-4">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <SkeletonBase width="12px" height="12px" borderRadius="2px" shimmer />
              <SkeletonBase width="80px" height="12px" shimmer />
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <SkeletonBase
            width="40px"
            height="40px"
            borderRadius="50%"
            shimmer
          />
          <SkeletonBase
            width="220px"
            height="20px"
            shimmer
          />
        </div>

        <div className="relative h-[280px] rounded-xl overflow-hidden"
          style={{
            background: isPerformanceMode
              ? 'rgba(16, 185, 129, 0.05)'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(34, 197, 94, 0.03))',
            border: '1px solid rgba(16, 185, 129, 0.15)'
          }}
        >
          {!isPerformanceMode && (
            <>
              <svg className="absolute inset-0 w-full h-full">
                <ConditionalMotion
                  as="path"
                  d="M 50 200 Q 100 150, 150 180 T 300 140 T 450 160 T 600 120 T 750 150"
                  stroke="rgba(16, 185, 129, 0.3)"
                  strokeWidth="3"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </svg>

              <ConditionalMotion
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.03) 50%, transparent 100%)'
                }}
                animate={{
                  x: ['-100%', '200%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: 0.5
                }}
              />
            </>
          )}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
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
            width="120px"
            height="28px"
            borderRadius="14px"
            shimmer
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[...Array(3)].map((_, index) => (
            <ConditionalMotion
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="p-3 rounded-lg text-center"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <SkeletonBase width="60px" height="24px" shimmer className="mx-auto mb-2" />
              <SkeletonBase width="80px" height="12px" shimmer className="mx-auto" />
            </ConditionalMotion>
          ))}
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
              <div key={index} className="text-center">
                <SkeletonBase width="100%" height="14px" shimmer />
              </div>
            ))}
          </div>

          {[...Array(5)].map((_, weekIndex) => (
            <ConditionalMotion
              key={weekIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + weekIndex * 0.1 }}
              className="grid grid-cols-7 gap-1"
            >
              {[...Array(7)].map((_, dayIndex) => (
                <div
                  key={dayIndex}
                  className="aspect-square rounded-lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                />
              ))}
            </ConditionalMotion>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6 text-center">
        <div className="flex justify-center mb-3">
          <SkeletonBase
            width="56px"
            height="56px"
            borderRadius="50%"
            shimmer
          />
        </div>
        <SkeletonBase width="200px" height="24px" shimmer className="mx-auto mb-2" />
        <SkeletonBase width="80%" height="14px" shimmer className="mx-auto mb-4" />
        <SkeletonBase width="180px" height="40px" borderRadius="8px" shimmer className="mx-auto" />
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-center gap-3">
          <SkeletonBase width="16px" height="16px" borderRadius="4px" shimmer />
          <SkeletonBase width="300px" height="14px" shimmer />
        </div>
      </GlassCard>
    </div>
  );
};

export default TrainingProgressTabSkeleton;
