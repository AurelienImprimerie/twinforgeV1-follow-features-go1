// src/app/shell/Header/Header.tsx
import React from 'react';
import { motion } from 'framer-motion';
import SpatialIcon from '../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../ui/icons/registry';
import MobileDrawer from '../../../ui/shell/MobileDrawer';
import { HeaderLogo } from './HeaderLogo';
import { useFeedback } from '../../../hooks';
import { BackButton } from '../../../ui/buttons';
import { useOverlayStore } from '../../../system/store/overlayStore';
import { usePerformanceMode } from '../../../system/context/PerformanceModeContext';
import CentralActionsMenu from '../CentralActionsMenu';
import logger from '../../../lib/utils/logger';

export const Header = React.memo(() => {
  const { click } = useFeedback();
  const { isOpen, toggle } = useOverlayStore();
  const centralMenuOpen = isOpen('centralMenu');
  const { isPerformanceMode } = usePerformanceMode();

  return (
    <>
      <header
        className={`
          header-liquid-glass h-[64px] z-9997-important will-change-transform-important position-fixed-important transform-gpu-important isolation-isolate-important contain-layout-style-paint-important
          fixed top-2 left-4 right-4 z-[9999]
          rounded-glass-lg
          ${isPerformanceMode ? '' : 'backdrop-blur-xl'}
          transition-all duration-300
        `}
        style={{
          left: '24px',
          right: '24px',
          top: '8px',
          borderRadius: '20px',
          overflow: 'hidden',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          WebkitTransformStyle: 'preserve-3d',
          transformStyle: 'preserve-3d',
          WebkitPerspective: '1000px',
          perspective: '1000px',
          background: isPerformanceMode
            ? 'rgb(11, 14, 23)'
            : undefined,
          backgroundColor: isPerformanceMode
            ? 'rgb(11, 14, 23)'
            : undefined,
          backgroundImage: isPerformanceMode
            ? 'none'
            : undefined,
          backdropFilter: isPerformanceMode ? 'none' : undefined,
          WebkitBackdropFilter: isPerformanceMode ? 'none' : undefined,
          border: isPerformanceMode ? '1px solid rgba(255, 255, 255, 0.15)' : undefined,
        }}
        role="banner"
        aria-label="TwinForge Pont de Commandement"
      >
        <div className="w-full h-full flex items-center justify-between gap-2 px-4 md:px-6">
          {/* Left */}
          <div className="flex items-center gap-1 md:gap-3">
            {/* Bouton Retour - Référence visuelle */}
            <BackButton />
            <HeaderLogo />
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Bouton Zap - Outils du Forgeron */}
            <motion.button
              type="button"
              className="user-panel-toggle relative central-action-button"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                position: 'relative',
                overflow: 'visible',
                padding: 0,
                alignItems: 'center',
                justifyContent: 'center',
                display: 'flex',
                background: centralMenuOpen
                  ? `radial-gradient(circle at 30% 30%, rgba(247, 147, 30, 0.45) 0%, transparent 60%), linear-gradient(135deg, rgba(247, 147, 30, 0.35), rgba(255, 107, 53, 0.3))`
                  : `radial-gradient(circle at 30% 30%, rgba(247, 147, 30, 0.25) 0%, transparent 60%), linear-gradient(135deg, rgba(247, 147, 30, 0.2), rgba(255, 107, 53, 0.15))`,
                border: centralMenuOpen
                  ? '2px solid rgba(247, 147, 30, 0.6)'
                  : '2px solid rgba(247, 147, 30, 0.35)',
                backdropFilter: 'blur(16px) saturate(150%)',
                WebkitBackdropFilter: 'blur(16px) saturate(150%)',
                boxShadow: centralMenuOpen
                  ? `0 0 0 1px rgba(255, 255, 255, 0.15) inset, 0 4px 32px rgba(247, 147, 30, 0.5), 0 2px 16px rgba(0, 0, 0, 0.25)`
                  : `0 0 0 1px rgba(255, 255, 255, 0.08) inset, 0 4px 24px rgba(247, 147, 30, 0.25), 0 2px 12px rgba(0, 0, 0, 0.2)`,
                transition: 'background 180ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 180ms cubic-bezier(0.16, 1, 0.3, 1), border-color 180ms cubic-bezier(0.16, 1, 0.3, 1)',
                transform: 'translateZ(0)',
                willChange: 'auto',
                cursor: 'pointer'
              }}
              aria-label="Ouvrir les outils du forgeron"
              aria-expanded={centralMenuOpen}
              aria-haspopup="menu"
              onPointerDown={() => click()}
              onClick={() => toggle('centralMenu')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  click();
                  toggle('centralMenu');
                }
              }}
            >
              {/* Carrés fixes aux 4 coins - sans animation */}
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    width: '6px',
                    height: '6px',
                    borderRadius: '1.5px',
                    background: 'linear-gradient(135deg, #F7931E, rgba(255, 255, 255, 0.9))',
                    boxShadow: '0 0 16px #F7931E',
                    top: i < 2 ? '2px' : 'auto',
                    bottom: i >= 2 ? '2px' : 'auto',
                    left: i % 2 === 0 ? '2px' : 'auto',
                    right: i % 2 === 1 ? '2px' : 'auto',
                    zIndex: 2,
                    transform: i % 2 === 0 ? 'rotate(45deg)' : 'rotate(-45deg)',
                    opacity: centralMenuOpen ? 0.7 : 0.5
                  }}
                />
              ))}

              <SpatialIcon
                Icon={ICONS.Zap}
                size={22}
                style={{
                  color: centralMenuOpen ? '#F7931E' : '#FF9F40',
                  filter: centralMenuOpen
                    ? 'drop-shadow(0 0 14px rgba(247, 147, 30, 0.9))'
                    : 'drop-shadow(0 0 10px rgba(255, 159, 64, 0.6))'
                }}
                aria-hidden="true"
              />

              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle at center, rgba(247, 147, 30, 0.25) 0%, transparent 70%)',
                  filter: 'blur(10px)',
                  zIndex: -1,
                  pointerEvents: 'none',
                  opacity: centralMenuOpen ? 0.7 : 0.4
                }}
                aria-hidden="true"
              />
            </motion.button>

            {/* Bouton Hamburger - Menu de navigation - MASQUÉ sur desktop */}
            <motion.button
              type="button"
              className="user-panel-toggle relative lg:hidden"
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
                transition: 'background 180ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 180ms cubic-bezier(0.16, 1, 0.3, 1), border-color 180ms cubic-bezier(0.16, 1, 0.3, 1)',
                transform: 'translateZ(0)',
                willChange: 'auto',
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
              aria-label="Ouvrir le menu de navigation principal"
              aria-expanded={isOpen('mobileDrawer')}
              aria-haspopup="menu"
              onPointerDown={() => click()}
              onClick={() => {
                logger.debug('HEADER', 'Mobile drawer toggle clicked');
                toggle('mobileDrawer');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  click();
                  logger.debug('HEADER', 'Mobile drawer toggle via keyboard');
                  toggle('mobileDrawer');
                }
              }}
            >
              <SpatialIcon
                Icon={ICONS.Menu}
                size={20}
                style={{
                  color: 'rgba(255,255,255,0.9)',
                  filter: 'drop-shadow(0 0 8px rgba(247, 147, 30, 0.3))'
                }}
                aria-hidden="true"
              />
            </motion.button>
          </div>
        </div>
      </header>

      <MobileDrawer />
      <CentralActionsMenu isOpen={centralMenuOpen} onClose={() => {}} />
    </>
  );
});

Header.displayName = 'Header';