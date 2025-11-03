import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SpatialIcon from '../icons/SpatialIcon';
import { ICONS } from '../icons/registry';
import { useFeedback } from '../../hooks/useFeedback';
import logger from '../../lib/utils/logger';

interface BackButtonProps {
  className?: string;
  showOnHome?: boolean;
}

/**
 * Back Button Component - VisionOS 26 Liquid Glass Pill
 * Intelligent navigation button with inline pill circular style matching sidebar/bottombar
 */
const BackButton: React.FC<BackButtonProps> = ({
  className = '',
  showOnHome = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { click } = useFeedback();

  // Determine if back button should be visible
  const shouldShow = React.useMemo(() => {
    // Don't show on home page unless explicitly requested
    if (location.pathname === '/' && !showOnHome) {
      return false;
    }

    // Check if there's navigation history
    // Note: We can't directly access history length in modern browsers for security reasons
    // So we'll show the button on all non-home pages and let the browser handle it
    return location.pathname !== '/';
  }, [location.pathname, showOnHome]);

  // Handle back navigation
  const handleBack = React.useCallback(() => {
    try {
      click(); // Audio feedback

      logger.debug('BACK_BUTTON', 'Back navigation triggered', {
        currentPath: location.pathname,
        timestamp: new Date().toISOString()
      });

      // Use browser's back functionality
      navigate(-1);
    } catch (error) {
      logger.warn('BACK_BUTTON', 'Back navigation failed, redirecting to home', {
        error: error instanceof Error ? error.message : 'Unknown error',
        currentPath: location.pathname
      });

      // Fallback to home if back navigation fails
      navigate('/');
    }
  }, [navigate, location.pathname, click]);

  if (!shouldShow) {
    return null;
  }

  return (
    <motion.button
      onClick={handleBack}
      className={className}
      style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        position: 'relative',
        overflow: 'visible',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `
          radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18) 0%, transparent 50%),
          rgba(255, 255, 255, 0.10)
        `,
        border: '1px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(16px) saturate(140%)',
        WebkitBackdropFilter: 'blur(16px) saturate(140%)',
        boxShadow: `
          0 8px 24px rgba(0, 0, 0, 0.25),
          0 2px 12px rgba(0, 0, 0, 0.18),
          inset 0 1px 0 rgba(255, 255, 255, 0.12)
        `,
        transition: 'transform 280ms cubic-bezier(0.25, 0.1, 0.25, 1), background 180ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 180ms cubic-bezier(0.16, 1, 0.3, 1), border-color 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        transform: 'translateZ(0)',
        willChange: 'transform, filter',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        if (window.matchMedia('(hover: hover)').matches) {
          e.currentTarget.style.background = `
            radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 60%),
            rgba(255, 255, 255, 0.10)
          `;
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
          e.currentTarget.style.boxShadow = `
            0 8px 24px rgba(0, 0, 0, 0.25),
            0 2px 12px rgba(0, 0, 0, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            0 0 20px rgba(255,255,255,0.15),
            0 4px 16px rgba(0,0,0,0.2)
          `;
        }
      }}
      onMouseLeave={(e) => {
        if (window.matchMedia('(hover: hover)').matches) {
          e.currentTarget.style.background = `
            radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18) 0%, transparent 50%),
            rgba(255, 255, 255, 0.10)
          `;
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
          e.currentTarget.style.boxShadow = `
            0 8px 24px rgba(0, 0, 0, 0.25),
            0 2px 12px rgba(0, 0, 0, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.12)
          `;
        }
      }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      aria-label="Retour à la page précédente"
      title="Retour"
    >
      <SpatialIcon
        Icon={ICONS.ArrowLeft}
        size={18}
        style={{
          color: 'rgba(255,255,255,0.9)',
          filter: 'drop-shadow(0 0 8px rgba(24, 227, 255, 0.3))'
        }}
        aria-hidden="true"
      />
    </motion.button>
  );
};

export default BackButton;