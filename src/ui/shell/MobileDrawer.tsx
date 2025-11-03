import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '../../app/nav/Link';
import { ICONS } from '../icons/registry';
import SpatialIcon from '../icons/SpatialIcon';
import { useLocation } from 'react-router-dom';
import { useUserStore } from '../../system/store/userStore';
import { getCircuitColor } from '../theme/circuits';
import { navFor } from '../../app/shell/navigation';
import { useOverlayStore, Z_INDEX } from '../../system/store/overlayStore';
import logger from '../../lib/utils/logger';
import TokenBalanceWidget from '../../app/shell/TokenBalanceWidget';
import LogoutConfirmationModal from '../components/LogoutConfirmationModal';
import { LogoutService } from '../../system/services/logoutService';

const Section = React.memo(({ title, children, type }: { title: string; children: React.ReactNode; type?: 'primary' | 'twin' | 'forge-category' }) => {
  const shouldHaveTopSpace = type === 'forge-category';
  const needsSeparator = title === 'Alimentation' || title === 'Activité' || title === 'Santé';

  return (
    <div className={shouldHaveTopSpace ? 'mt-4' : ''}>
      {title && (
        <>
          {/* Séparateur visuel avant Alimentation, Activité et Santé */}
          {needsSeparator && (
            <div className="sidebar-category-separator" />
          )}
          <h3 className="sidebar-section-title text-white/50 text-xs uppercase tracking-wider font-semibold mb-1 px-1">
            {title}
          </h3>
        </>
      )}
      <div className="space-y-0.5">
        {children}
      </div>
    </div>
  );
});
Section.displayName = 'Section';

const MobileDrawer = React.memo(() => {
  const { isOpen, close } = useOverlayStore();
  const drawerOpen = isOpen('mobileDrawer');
  const location = useLocation();
  const navRef = React.useRef<HTMLElement>(null);
  const { profile } = useUserStore();

  const [expandedForges, setExpandedForges] = React.useState<Record<string, boolean>>({});
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  // Body scroll lock - Empêche le scroll de la page principale quand la sidebar est ouverte
  useEffect(() => {
    if (drawerOpen) {
      // Sauvegarder l'état original du body
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;

      // Verrouiller le scroll du body
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';

      return () => {
        // Restaurer l'état original
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.width = '';
        document.body.style.height = '';
      };
    }
  }, [drawerOpen]);

  // Memoize navSections to prevent re-renders
  const navSections = useMemo(() => navFor(), []);

  // Auto-expand menu if user is on a sub-page and close others
  React.useEffect(() => {
    const currentPath = location.pathname;
    const newExpandedState: Record<string, boolean> = {};

    navSections.forEach(section => {
      section.items.forEach(item => {
        if (item.subItems && item.subItems.length > 0) {
          const hasActiveSubItem = item.subItems.some(subItem => {
            const subPath = subItem.to.split('#')[0];
            return currentPath === subPath;
          });

          // If this item has an active sub-item, expand it
          if (hasActiveSubItem) {
            newExpandedState[item.to] = true;
          } else {
            newExpandedState[item.to] = false;
          }
        }
      });
    });

    setExpandedForges(newExpandedState);
  }, [location.pathname, navSections]);

  // Handle toggle expand for forge items with auto-close others
  const handleToggleExpand = useCallback((itemTo: string) => {
    setExpandedForges(prev => {
      const isCurrentlyExpanded = prev[itemTo];

      // If closing the current item, just toggle it
      if (isCurrentlyExpanded) {
        return {
          ...prev,
          [itemTo]: false
        };
      }

      // If opening, close all others and open this one
      const newState: Record<string, boolean> = {};
      Object.keys(prev).forEach(key => {
        newState[key] = false;
      });
      newState[itemTo] = true;

      return newState;
    });
  }, []);

  const handleLogoutClick = useCallback(() => {
    logger.info('MOBILE_DRAWER', 'Logout button clicked');
    setIsLogoutModalOpen(true);
  }, []);

  const handleLogoutConfirm = useCallback(async () => {
    logger.info('MOBILE_DRAWER', 'Logout confirmed');
    close();
    await LogoutService.softLogout();
  }, [close]);

  const handleLogoutCancel = useCallback(() => {
    logger.info('MOBILE_DRAWER', 'Logout cancelled');
    setIsLogoutModalOpen(false);
  }, []);

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            style={{ zIndex: Z_INDEX.BACKDROP }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              logger.debug('MOBILE_DRAWER', 'Backdrop clicked - closing drawer');
              close();
            }}
          />

          {/* Drawer */}
          <motion.nav
            ref={navRef}
            className="mobile-drawer fixed top-0 left-0 h-full w-[85vw] max-w-[340px] overflow-y-auto"
            style={{
              zIndex: Z_INDEX.MOBILE_DRAWER,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            role="navigation"
            aria-label="Navigation mobile"
          >
            <div className="py-3 pl-3 pr-2.5 space-y-2">
              {/* Navigation Sections */}
              {navSections.map((section, index) => (
                <React.Fragment key={index}>
                  <Section title={section.title} type={section.type}>
                    {section.items.map((item) => {
                    const hasSubItems = item.subItems && item.subItems.length > 0;

                    // Check if any sub-item is active
                    const hasActiveSubItem = hasSubItems && item.subItems.some(subItem => {
                      const subPath = subItem.to.split('#')[0];
                      const subHash = subItem.to.split('#')[1];
                      const currentPath = location.pathname;
                      const currentHash = location.hash.replace('#', '') || 'daily';
                      return currentPath === subPath && (!subHash || currentHash === subHash);
                    });

                    const handleNavItemClick = (e: React.MouseEvent) => {
                      if (hasSubItems) {
                        e.preventDefault();
                        handleToggleExpand(item.to);
                      } else {
                        close();
                      }
                    };

                    return (
                      <div key={item.to} className="relative sidebar-nav-item-container">
                        <Link
                          to={item.to}
                          className={`
                            sidebar-item
                            ${item.isPrimary ? 'sidebar-item--primary' : ''}
                            ${item.isTwin ? 'sidebar-item--twin' : ''}
                            ${item.isForge ? 'sidebar-item--forge' : ''}
                            ${hasSubItems ? 'sidebar-item--with-submenu' : ''}
                            group focus-ring
                            ${isActive(item.to) || hasActiveSubItem
                              ? 'text-white shadow-sm'
                              : 'text-white/70 hover:text-white'
                            }
                          `}
                          onClick={handleNavItemClick}
                          style={{ '--item-circuit-color': item.circuitColor } as React.CSSProperties}
                        >
                          {/* Icon container with glass pill effect */}
                          <div className={`sidebar-item-icon-container ${
                            isActive(item.to) || hasActiveSubItem ? 'sidebar-item-icon-container--active' : ''
                          }`}>
                            <SpatialIcon
                              Icon={ICONS[item.icon]}
                              size={16}
                              className={`sidebar-item-icon ${isActive(item.to) || hasActiveSubItem ? '' : 'opacity-80 group-hover:opacity-100'}`}
                              color={isActive(item.to) || hasActiveSubItem ? item.circuitColor : undefined}
                              style={isActive(item.to) || hasActiveSubItem ? {
                                color: item.circuitColor,
                                filter: `drop-shadow(0 0 8px ${item.circuitColor}60)`
                              } : undefined}
                            />
                          </div>

                          {/* Text content */}
                          <div className="flex-1 min-w-0">
                            <div className={`sidebar-item-label font-medium text-xs truncate ${
                              isActive(item.to) || hasActiveSubItem ? 'text-white' : 'text-white/82'
                            }`}>
                              {item.label}
                            </div>
                            <div className={`sidebar-item-subtitle text-xxs truncate mt-0 ${
                              isActive(item.to) || hasActiveSubItem ? 'text-white/70' : 'text-white/50'
                            }`}>
                              {item.subtitle}
                            </div>
                          </div>
                        </Link>

                        {/* Sub-items menu */}
                        {hasSubItems && (
                          <div
                            className={`sidebar-submenu ${expandedForges[item.to] ? 'sidebar-submenu--expanded' : ''}`}
                            role="group"
                            aria-label={`Sous-menu ${item.label}`}
                          >
                            <div className="sidebar-submenu-inner">
                              {item.subItems.map((subItem) => {
                                const SubIcon = ICONS[subItem.icon];
                                const subPath = subItem.to.split('#')[0];
                                const subHash = subItem.to.split('#')[1];
                                const currentPath = location.pathname;
                                const currentHash = location.hash.replace('#', '') || 'daily';
                                const isSubActive = currentPath === subPath && (!subHash || currentHash === subHash);

                                // Le bouton primaire (Scanner/Tracker) est toujours lumineux si on est sur cette page
                                const isPrimaryAndPageActive = subItem.isPrimarySubMenu && currentPath === subPath;

                                return (
                                  <Link
                                    key={subItem.to}
                                    to={subItem.to}
                                    className={`
                                      sidebar-submenu-item
                                      ${subItem.isPrimarySubMenu ? 'sidebar-submenu-item--primary' : 'sidebar-submenu-item--secondary'}
                                      ${isSubActive || isPrimaryAndPageActive ? 'sidebar-submenu-item--active' : ''}
                                      focus-ring
                                    `}
                                    onClick={() => close()}
                                    aria-current={isSubActive ? 'page' : undefined}
                                    style={{ '--item-circuit-color': subItem.color || item.circuitColor } as React.CSSProperties}
                                  >
                                    <div className={`sidebar-submenu-item-icon-container ${isSubActive || isPrimaryAndPageActive ? 'sidebar-submenu-item-icon-container--active' : ''}`}>
                                      <SpatialIcon
                                        Icon={SubIcon}
                                        size={subItem.isPrimarySubMenu ? 16 : 14}
                                        className="sidebar-submenu-item-icon"
                                      />
                                    </div>
                                    <span className="sidebar-submenu-item-label">
                                      {subItem.label}
                                    </span>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  </Section>

                  {/* Séparateur après le Tableau de Bord (section primaire) */}
                  {section.type === 'primary' && (
                    <div className="sidebar-primary-separator" aria-hidden="true" />
                  )}
                </React.Fragment>
              ))}

              {/* ========== SECTION COMPTE ========== */}
              <div className="mt-4">
                <div className="sidebar-category-separator mb-3" />
                <div className="px-1.5 mb-1.5">
                  <h3 className="text-white/50 text-xs uppercase tracking-wider font-semibold">
                    Compte
                  </h3>
                </div>
                <div className="space-y-0.5">
                  {/* Token Balance Widget */}
                  <div className="mb-2 px-0.5">
                    <TokenBalanceWidget />
                  </div>

                  {/* Bouton Profil */}
                  <Link
                    to="/profile"
                    className={`
                      sidebar-item group focus-ring
                      ${isActive('/profile') ? 'text-white shadow-sm' : 'text-white/70 hover:text-white'}
                    `}
                    onClick={() => close()}
                    style={{ '--item-circuit-color': '#FDC830' } as React.CSSProperties}
                  >
                    <div className={`sidebar-item-icon-container ${isActive('/profile') ? 'sidebar-item-icon-container--active' : ''}`}>
                      <SpatialIcon
                        Icon={ICONS.User}
                        size={16}
                        className={`sidebar-item-icon ${isActive('/profile') ? '' : 'opacity-80 group-hover:opacity-100'}`}
                        style={isActive('/profile') ? {
                          color: '#FDC830',
                          filter: 'drop-shadow(0 0 8px rgba(253, 200, 48, 0.6))'
                        } : undefined}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`sidebar-item-label font-medium text-xs truncate ${isActive('/profile') ? 'text-white' : 'text-white/82'}`}>
                        Mon Profil
                      </div>
                      <div className={`sidebar-item-subtitle text-xxs truncate mt-0 ${isActive('/profile') ? 'text-white/70' : 'text-white/50'}`}>
                        Infos personnelles
                      </div>
                    </div>
                  </Link>

                  {/* Bouton Paramètres */}
                  <Link
                    to="/settings"
                    className={`
                      sidebar-item group focus-ring
                      ${isActive('/settings') ? 'text-white shadow-sm' : 'text-white/70 hover:text-white'}
                    `}
                    onClick={() => close()}
                    style={{ '--item-circuit-color': '#FDC830' } as React.CSSProperties}
                  >
                    <div className={`sidebar-item-icon-container ${isActive('/settings') ? 'sidebar-item-icon-container--active' : ''}`}>
                      <SpatialIcon
                        Icon={ICONS.Settings}
                        size={16}
                        className={`sidebar-item-icon ${isActive('/settings') ? '' : 'opacity-80 group-hover:opacity-100'}`}
                        style={isActive('/settings') ? {
                          color: '#FDC830',
                          filter: 'drop-shadow(0 0 8px rgba(253, 200, 48, 0.6))'
                        } : undefined}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`sidebar-item-label font-medium text-xs truncate ${isActive('/settings') ? 'text-white' : 'text-white/82'}`}>
                        Paramètres
                      </div>
                      <div className={`sidebar-item-subtitle text-xxs truncate mt-0 ${isActive('/settings') ? 'text-white/70' : 'text-white/50'}`}>
                        Configuration
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Séparateur avant déconnexion */}
                <div className="sidebar-category-separator my-2" />

                {/* Bouton Déconnexion avec gradient orange - HARMONISÉ avec sidebar */}
                <button
                  onClick={handleLogoutClick}
                  className="sidebar-item group focus-ring text-white/70 hover:text-white w-full"
                  style={{
                    '--item-circuit-color': '#FF6B35',
                    textAlign: 'left'
                  } as React.CSSProperties}
                >
                  <div
                    className="sidebar-item-icon-container"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.2), rgba(247, 147, 30, 0.15))',
                      border: '1.5px solid rgba(255, 107, 53, 0.35)',
                      boxShadow: '0 0 16px rgba(255, 107, 53, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                    }}
                  >
                    <SpatialIcon
                      Icon={ICONS.LogOut}
                      size={16}
                      className="sidebar-item-icon opacity-80 group-hover:opacity-100"
                      style={{
                        color: '#FF6B35',
                        filter: 'drop-shadow(0 0 6px rgba(255, 107, 53, 0.4))'
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="sidebar-item-label font-medium text-xs truncate text-white/82 text-left">
                      Déconnexion
                    </div>
                    <div className="sidebar-item-subtitle text-xxs truncate mt-0 text-white/50 text-left">
                      Se déconnecter
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </motion.nav>

          <LogoutConfirmationModal
            isOpen={isLogoutModalOpen}
            onConfirm={handleLogoutConfirm}
            onCancel={handleLogoutCancel}
          />
        </>
      )}
    </AnimatePresence>
  );
});

MobileDrawer.displayName = 'MobileDrawer';

export default MobileDrawer;
