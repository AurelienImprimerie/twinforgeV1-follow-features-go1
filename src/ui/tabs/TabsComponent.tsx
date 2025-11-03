import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ICONS } from '../icons/registry';
import { TabsContext, useTabs } from './TabsContext';
import { getTabColor, uniformTabPanelVariants } from './tabsConfig';

// Main Tabs component
const Tabs: React.FC<{
  defaultValue: string;
  value?: string;
  className?: string;
  children: ReactNode;
  onValueChange?: (value: string) => void;
  forgeContext?: string;
}> & {
  List: React.FC<{
    role?: string;
    'aria-label'?: string;
    className?: string;
    children: ReactNode;
  }>;
  Trigger: React.FC<{
    value: string;
    icon?: keyof typeof ICONS;
    children: ReactNode;
  }>;
  Panel: React.FC<{
    value: string;
    children: ReactNode;
  }>;
} = ({ defaultValue, value, className = '', children, onValueChange, forgeContext }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Use controlled value if provided, otherwise derive from URL hash
  const activeTab = React.useMemo(() => {
    // If value prop is provided (controlled mode), use it
    if (value !== undefined) {
      return value;
    }

    // Otherwise derive from URL hash (uncontrolled mode)
    const hash = location.hash.replace('#', '');
    // Decode URI component to handle spaces and special characters
    const decodedHash = hash ? decodeURIComponent(hash) : '';
    return decodedHash || defaultValue;
  }, [value, location.hash, defaultValue]);

  // Handle tab change by updating URL hash
  const setActiveTab = React.useCallback((value: string) => {
    navigate({ hash: value });
    onValueChange?.(value);
  }, [navigate, onValueChange]);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, forgeContext }}>
      <div className={`tabs w-full ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

// TabsList component
const TabsList: React.FC<{
  role?: string;
  'aria-label'?: string;
  className?: string;
  children: ReactNode;
}> = ({ 
  role = 'tablist', 
  'aria-label': ariaLabel, 
  className = '', 
  children 
}) => {
  const listRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = React.useState(false);
  const [activeTabIndex, setActiveTabIndex] = React.useState(0);
  const { activeTab } = useTabs();
  
  // Get all tab triggers to calculate indicators
  const [tabTriggers, setTabTriggers] = React.useState<Element[]>([]);
  
  // VisionOS 26 - Enhanced overflow detection and tab tracking
  React.useEffect(() => {
    const checkOverflow = () => {
      const element = listRef.current;
      const container = containerRef.current;
      if (!element || !container) return;
      
      const overflowDetected = element.scrollWidth > element.clientWidth;
      setHasOverflow(overflowDetected);
      container.classList.toggle('has-overflow', overflowDetected);
      
      // Get all tab triggers for indicator calculation
      const triggers = Array.from(element.querySelectorAll('.tabs-trigger'));
      setTabTriggers(triggers);
    };
    
    checkOverflow();
    
    const resizeObserver = new ResizeObserver(checkOverflow);
    if (listRef.current) {
      resizeObserver.observe(listRef.current);
    }
    
    return () => resizeObserver.disconnect();
  }, [children]);
  
  // Track active tab index for indicators
  React.useEffect(() => {
    const currentIndex = tabTriggers.findIndex(trigger =>
      trigger.getAttribute('aria-selected') === 'true' ||
      trigger.getAttribute('value') === activeTab
    );
    if (currentIndex !== -1) {
      setActiveTabIndex(currentIndex);
    }
  }, [activeTab, tabTriggers]);

  // Auto-scroll to active tab when activeTab changes (e.g., from navigation)
  React.useEffect(() => {
    if (!listRef.current) return;

    // Find the active tab button
    const activeTabButton = listRef.current.querySelector(`button[id="tab-${activeTab}"]`) as HTMLElement;

    if (activeTabButton) {
      // Check if the tab is actually out of view
      const container = listRef.current;
      const tabRect = activeTabButton.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const isOutOfView =
        tabRect.left < containerRect.left ||
        tabRect.right > containerRect.right;

      // Only scroll if there's overflow or tab is out of view
      if (hasOverflow || isOutOfView) {
        // Use a small delay to ensure the tab is rendered and positioned
        setTimeout(() => {
          activeTabButton.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }, 100);
      }
    }
  }, [activeTab, hasOverflow]);
  
  // Calculate tab indicators - one per tab
  const scrollIndicators = React.useMemo(() => {
    if (!hasOverflow || tabTriggers.length === 0) return [];
    
    // Create one indicator per tab
    return tabTriggers.map((_, index) => ({
      id: index,
      active: index === activeTabIndex
    }));
  }, [hasOverflow, tabTriggers, activeTabIndex]);
  
  // Clone children and pass listRef and hasOverflow to TabsTrigger components
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === TabsTrigger) {
      return React.cloneElement(child, { 
        listRef, 
        hasOverflow,
        ...child.props 
      } as any);
    }
    return child;
  });

  return (
    <div>
      <div 
        ref={containerRef}
        className={`tabs-list-container ${className}`}
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--brand-primary) 8%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, var(--color-plasma-cyan) 6%, transparent) 0%, transparent 50%),
            rgba(255, 255, 255, 0.05)
          `,
          border: '2px solid color-mix(in srgb, var(--color-plasma-cyan) 15%, transparent)',
          backdropFilter: 'blur(16px) saturate(140%)',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.25),
            0 0 20px color-mix(in srgb, var(--brand-primary) 10%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.15)
          `
        }}
      >
        <div 
          ref={listRef}
          role={role}
          aria-label={ariaLabel}
          className="tabs-list"
        >
          {childrenWithProps}
        </div>
      </div>
      
      {/* Tab Indicators - VisionOS 26 Style - One per tab */}
      {hasOverflow && scrollIndicators.length > 0 && (
        <div className="tabs-scroll-indicators">
          {scrollIndicators.map((indicator) => (
            <div
              key={indicator.id}
              className={`tabs-scroll-dot ${indicator.active ? 'tabs-scroll-dot--active' : ''}`}
              title={`Onglet ${indicator.id + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// TabsTrigger component
const TabsTrigger: React.FC<{
  value: string;
  icon?: keyof typeof ICONS;
  children: ReactNode;
  listRef?: React.RefObject<HTMLDivElement>;
  hasOverflow?: boolean;
}> = ({ value, icon, children, listRef, hasOverflow }) => {
  const { activeTab, setActiveTab, forgeContext } = useTabs();
  const isActive = activeTab === value;
  const IconComponent = icon ? ICONS[icon] : null;
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // Récupération de la couleur depuis la configuration centralisée avec contexte de forge
  const getTabIconColor = (tabValue: string, isActive: boolean, forgeCtx?: string) => {
    if (!isActive) return undefined;

    // Try with forge context first (e.g., "activity:daily")
    if (forgeCtx) {
      const contextualKey = `${forgeCtx}:${tabValue}`;
      const contextualColor = getTabColor(contextualKey);
      if (contextualColor) return contextualColor;
    }

    // Fallback to direct value
    return getTabColor(tabValue);
  };

  const handleClick = () => {
    setActiveTab(value);

    // Auto-scroll functionality for mobile when there's overflow
    if (hasOverflow && listRef?.current && triggerRef.current) {
      triggerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  };
  const iconColor = getTabIconColor(value, isActive, forgeContext);
  return (
    <button
      ref={triggerRef}
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${value}`}
      id={`tab-${value}`}
      className={`tabs-trigger ${isActive ? 'active' : ''}`}
      onClick={handleClick}
      style={{
        '--button-color': iconColor || 'var(--color-plasma-cyan)',
      } as React.CSSProperties}
    >
      {IconComponent && (
        <IconComponent
          className="tab-icon"
          color={iconColor}
          style={iconColor ? { color: iconColor } : undefined}
        />
      )}
      {children}
    </button>
  );
};

// TabsPanel component with uniform animations
const TabsPanel: React.FC<{
  value: string;
  children: ReactNode;
  disableAnimation?: boolean;
}> = ({ value, children, disableAnimation = false }) => {
  const { activeTab } = useTabs();
  const isActive = activeTab === value;
  const [hasBeenActive, setHasBeenActive] = React.useState(isActive);

  // Track if this panel has ever been active to trigger initial load
  React.useEffect(() => {
    if (isActive && !hasBeenActive) {
      setHasBeenActive(true);
    }
  }, [isActive, hasBeenActive]);

  // Don't render content until first activation
  if (!hasBeenActive) {
    return null;
  }

  // Toujours rendre le contenu mais le cacher avec display:none quand inactif
  // Cela préserve l'état des composants enfants React
  return (
    <div
      role="tabpanel"
      id={`panel-${value}`}
      aria-labelledby={`tab-${value}`}
      className="tabs-panel pt-6 md:pt-8"
      style={{ display: isActive ? 'block' : 'none' }}
    >
      {children}
    </div>
  );
};

// Attach sub-components
Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Panel = TabsPanel;

export default Tabs;