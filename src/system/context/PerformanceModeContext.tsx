import React, { createContext, useContext, useEffect } from 'react';
import { usePerformanceModeStore, PerformanceMode } from '../store/performanceModeStore';
import { useUserStore } from '../store/userStore';
import { useDeviceCapabilities } from '../../hooks/useDeviceCapabilities';

interface PerformanceModeContextType {
  // New 3-mode system
  mode: PerformanceMode;
  recommendedMode: PerformanceMode | null;
  isLoading: boolean;
  setMode: (mode: PerformanceMode) => Promise<void>;

  // Legacy support
  isPerformanceMode: boolean;
  togglePerformanceMode: () => Promise<void>;
}

const PerformanceModeContext = createContext<PerformanceModeContextType>({
  mode: 'balanced',
  recommendedMode: null,
  isPerformanceMode: false,
  isLoading: true,
  setMode: async () => {},
  togglePerformanceMode: async () => {},
});

export const usePerformanceMode = () => useContext(PerformanceModeContext);

interface PerformanceModeProviderProps {
  children: React.ReactNode;
}

export const PerformanceModeProvider: React.FC<PerformanceModeProviderProps> = ({ children }) => {
  const {
    mode,
    recommendedMode,
    isPerformanceMode,
    isLoading,
    setMode: setModeStore,
    loadMode,
  } = usePerformanceModeStore();

  const { profile } = useUserStore();
  const capabilities = useDeviceCapabilities();

  // Load performance mode on mount with device recommendation
  useEffect(() => {
    loadMode(profile?.id, capabilities.recommendedMode);
  }, [profile?.id, capabilities.recommendedMode, loadMode]);

  const setMode = async (newMode: PerformanceMode) => {
    await setModeStore(newMode, profile?.id);
  };

  const togglePerformanceMode = async () => {
    const newMode: PerformanceMode = isPerformanceMode ? 'balanced' : 'high-performance';
    await setMode(newMode);
  };

  const value: PerformanceModeContextType = {
    mode,
    recommendedMode,
    isPerformanceMode,
    isLoading,
    setMode,
    togglePerformanceMode,
  };

  return (
    <PerformanceModeContext.Provider value={value}>
      {children}
    </PerformanceModeContext.Provider>
  );
};
