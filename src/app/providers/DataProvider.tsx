/**
 * Data Provider - Simplified for Body Scan
 * Central data layer provider with source switching
 */

import React, { ReactNode } from 'react';
import { setDataSource, isMock } from '../../system/data/dataSource';

interface DataProviderProps {
  children: ReactNode;
}

/**
 * Data Provider Component
 * Sets up React Query and data source implementations
 */
export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  React.useEffect(() => {
    // Configure data source based on environment
    
    setDataSource({});
  }, []);
  
  return (
    <>{children}</>
  );
};

