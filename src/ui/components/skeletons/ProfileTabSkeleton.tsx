/**
 * Profile Tab Skeleton Loader
 * Skeleton loader for profile tab content with shimmer effect
 */

import React from 'react';
import GlassCard from '../../cards/GlassCard';
import './skeletons.css';

interface ProfileTabSkeletonProps {
  sectionsCount?: number;
}

const ProfileTabSkeleton: React.FC<ProfileTabSkeletonProps> = ({
  sectionsCount = 3,
}) => {
  return (
    <div className="space-y-6 w-full">
      {/* Progress Bar Skeleton */}
      <GlassCard className="p-6 animate-pulse-subtle">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full skeleton-shimmer" />
            <div className="space-y-2">
              <div className="w-48 h-6 skeleton-shimmer rounded" />
              <div className="w-64 h-4 skeleton-shimmer rounded" />
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="w-16 h-6 skeleton-shimmer rounded ml-auto" />
            <div className="w-20 h-3 skeleton-shimmer rounded ml-auto" />
          </div>
        </div>
        <div className="w-full h-3 skeleton-shimmer rounded-full" />
      </GlassCard>

      {/* Form Sections Skeleton */}
      {Array.from({ length: sectionsCount }).map((_, index) => (
        <GlassCard key={index} className="p-6 animate-pulse-subtle">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full skeleton-shimmer" />
              <div className="space-y-2">
                <div className="w-40 h-5 skeleton-shimmer rounded" />
                <div className="w-56 h-3 skeleton-shimmer rounded" />
              </div>
            </div>
            <div className="w-20 h-6 skeleton-shimmer rounded-full" />
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, fieldIndex) => (
              <div key={fieldIndex} className="space-y-3">
                <div className="w-32 h-4 skeleton-shimmer rounded" />
                <div className="w-full h-11 skeleton-shimmer rounded-lg" />
              </div>
            ))}
          </div>
        </GlassCard>
      ))}

      {/* Save Button Skeleton */}
      <div className="flex justify-center pt-4">
        <div className="w-48 h-14 skeleton-shimmer rounded-xl" />
      </div>
    </div>
  );
};

export default ProfileTabSkeleton;
