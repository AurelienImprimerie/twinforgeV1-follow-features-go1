import React from 'react';
import LoaderCard from '../../ui/components/LoaderCard';

/**
 * Loading Fallback Component
 * Consistent loading state for lazy-loaded routes using unified LoaderCard
 */
export const LoadingFallback: React.FC<{ title?: string; subtitle?: string }> = ({
  title = "Initialisation de TwinForge",
  subtitle = "Préparation de votre espace de forge..."
}) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] bg-transparent">
      <LoaderCard
        variant="default"
        title={title}
        subtitle={subtitle}
        showProgressBar={false}
      />
    </div>
  );
};

export default LoadingFallback;