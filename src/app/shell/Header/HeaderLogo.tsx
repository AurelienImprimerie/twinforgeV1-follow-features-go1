import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFeedback } from '../../../hooks/useFeedback';
import logger from '../../../lib/utils/logger';
import TwinForgeLogo from '../../../ui/components/branding/TwinForgeLogo';

/**
 * Header Logo Component - Simplified
 * TWINFORGE branding with Dual Ingot symbol
 */
export const HeaderLogo: React.FC = () => {
  const navigate = useNavigate();
  const { click, headerClick } = useFeedback();
  const [isHovered, setIsHovered] = React.useState(false);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    logger.trace('HEADER', 'Logo click triggered');
    navigate('/', { replace: true });
  };

  const handlePointerDown = () => {
    logger.trace('HEADER', 'Logo pointer down');
    headerClick(); // Son spécifique header au pointer down
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <>
      {/* Desktop Logo - Format rectangulaire */}
      <div className="hidden lg:block">
        <button
          onClick={handleLogoClick}
          onPointerDown={handlePointerDown}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="focus-ring rounded-lg transition-colors cursor-pointer flex items-center justify-center h-full"
          aria-label="Retour au tableau de bord"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleLogoClick(e as any);
            }
          }}
        >
          <div className="flex items-center justify-center h-full">
            <motion.div
              className="relative transition-all duration-300 ease-out"
              animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <TwinForgeLogo variant="desktop" isHovered={isHovered} />
            </motion.div>
          </div>
        </button>
      </div>

      {/* Mobile Logo - Version unique optimisée */}
      <div className="lg:hidden">
        <button
          onClick={handleLogoClick}
          onPointerDown={handlePointerDown}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="focus-ring rounded-lg transition-colors cursor-pointer flex items-center justify-center"
          aria-label="Retour au tableau de bord"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleLogoClick(e as any);
            }
          }}
        >
          <motion.div
            className="relative"
            animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <TwinForgeLogo variant="mobile" isHovered={isHovered} />
          </motion.div>
        </button>
      </div>
    </>
  );
};