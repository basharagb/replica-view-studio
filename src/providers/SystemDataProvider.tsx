/**
 * System Data Provider
 * Centralized data management for the entire Replica View Studio application
 * Ensures all components use consistent API data sources
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { dataSourceManager, DataSourceSettings, initializeSystem, performSystemHealthCheck } from '../config/apiConfig';
import { realTimeSensorService, LiveSiloSystem } from '../services/realTimeSensorService';
import { siloReadingsService } from '../services/siloReadingsService';
import { ProcessedSiloData } from '../types/api';

export interface SystemDataContextType {
  // Data Sources
  liveSystem: LiveSiloSystem;
  chartData: Map<string, ProcessedSiloData[]>;
  
  // System State
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  systemHealth: 'healthy' | 'degraded' | 'critical';
  
  // Settings
  dataSettings: DataSourceSettings;
  
  // Actions
  refreshAllData: () => Promise<void>;
  refreshLiveData: () => Promise<void>;
  refreshChartData: (key: string, params: any) => Promise<void>;
  clearError: () => void;
  
  // System Control
  enableAPIMode: () => void;
  enableMockMode: () => void;
  toggleRealTime: () => void;
  
  // Utilities
  getChartData: (key: string) => ProcessedSiloData[] | null;
  isAPIMode: () => boolean;
  isRealTimeEnabled: () => boolean;
  
  // Auto test state
  autoTestState: {
    isRunning: boolean;
    currentIndex: number;
    progress: number;
    completed: boolean;
  };
  updateAutoTestState: (state: Partial<{
    isRunning: boolean;
    currentIndex: number;
    progress: number;
    completed: boolean;
  }>) => void;
}

const SystemDataContext = createContext<SystemDataContextType | null>(null);

export interface SystemDataProviderProps {
  children: ReactNode;
}

export const SystemDataProvider: React.FC<SystemDataProviderProps> = ({ children }) => {
  // Core State
  const [liveSystem, setLiveSystem] = useState<LiveSiloSystem>({
    topSiloGroups: [],
    bottomSiloGroups: [],
    cylinderSilos: [],
    lastUpdated: new Date(),
    isLoading: true
  });
  
  const [chartData, setChartData] = useState<Map<string, ProcessedSiloData[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'degraded' | 'critical'>('healthy');
  const [dataSettings, setDataSettings] = useState<DataSourceSettings>(dataSourceManager.getSettings());
  
  // Auto test state (persists across page navigation)
  const [autoTestState, setAutoTestState] = useState<{
    isRunning: boolean;
    currentIndex: number;
    progress: number;
    completed: boolean;
  }>({
    isRunning: false,
    currentIndex: 0,
    progress: 0,
    completed: false
  });

  const updateAutoTestState = (state: Partial<typeof autoTestState>) => {
    setAutoTestState(prev => ({ ...prev, ...state }));
  };

  // Initialize system on mount
  useEffect(() => {
    console.log('🚀 SystemDataProvider: Initializing API-FIRST system');
    initializeSystem();
    
    // Subscribe to data source changes
    const unsubscribe = dataSourceManager.subscribe((newSettings) => {
      setDataSettings(newSettings);
      console.log('📡 Data source settings updated:', newSettings);
    });
    
    // Initial data load
    refreshAllData();
    
    // System health check
    performHealthCheck();
    
    return unsubscribe;
  }, []);

  // Set up real-time updates when enabled
  useEffect(() => {
    if (dataSettings.useAPIData && dataSettings.enableRealTimeUpdates) {
      console.log('🔄 Starting real-time updates');
      
      realTimeSensorService.startRealTimeUpdates(dataSettings.refreshInterval);
      
      const unsubscribe = realTimeSensorService.subscribe((newData) => {
        setLiveSystem(newData);
        setLastUpdated(new Date());
        setIsLoading(newData.isLoading);
        if (newData.error) {
          setError(newData.error);
        }
      });
      
      return () => {
        unsubscribe();
        realTimeSensorService.stopRealTimeUpdates();
      };
    } else {
      realTimeSensorService.stopRealTimeUpdates();
    }
  }, [dataSettings.useAPIData, dataSettings.enableRealTimeUpdates, dataSettings.refreshInterval]);

  // System health monitoring
  const performHealthCheck = async () => {
    try {
      const health = await performSystemHealthCheck();
      setSystemHealth(health.overallStatus);
      
      if (!health.apiAvailable && dataSettings.useAPIData) {
        setError('API unavailable - system may fallback to mock data');
      }
    } catch (err) {
      setSystemHealth('critical');
      setError('System health check failed');
    }
  };

  // Refresh all data
  const refreshAllData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        refreshLiveData(),
        performHealthCheck()
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh system data';
      setError(errorMessage);
      console.error('System data refresh failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh live sensor data
  const refreshLiveData = async () => {
    try {
      if (dataSettings.useAPIData) {
        const newData = await realTimeSensorService.getLiveSiloSystem();
        setLiveSystem(newData);
        setLastUpdated(new Date());
        
        if (newData.error) {
          setError(newData.error);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh live data';
      setError(errorMessage);
      throw err;
    }
  };

  // Refresh specific chart data
  const refreshChartData = async (key: string, params: any) => {
    try {
      if (dataSettings.useAPIData) {
        let data: ProcessedSiloData[] = [];
        
        // Determine which API endpoint to use based on params
        if (params.silo_number) {
          if (params.dataType === 'level') {
            data = await siloReadingsService.getLevelsBySiloNumbers(params);
          } else {
            data = await siloReadingsService.getReadingsBySiloNumbers(params);
          }
        } else if (params.group_id) {
          if (params.dataType === 'level') {
            data = await siloReadingsService.getLevelsByGroupIds(params);
          } else {
            data = await siloReadingsService.getReadingsByGroupIds(params);
          }
        }
        
        setChartData(prev => new Map(prev.set(key, data)));
        setLastUpdated(new Date());
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to refresh chart data: ${key}`;
      setError(errorMessage);
      throw err;
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // System control functions
  const enableAPIMode = () => {
    console.log('🔄 Switching to API mode system-wide');
    dataSourceManager.enableAPIMode();
    refreshAllData();
  };

  const enableMockMode = () => {
    console.log('⚠️ Switching to mock mode system-wide');
    dataSourceManager.enableMockMode();
  };

  const toggleRealTime = () => {
    console.log('🔄 Toggling real-time updates system-wide');
    dataSourceManager.toggleRealTime();
  };

  // Utility functions
  const getChartData = (key: string): ProcessedSiloData[] | null => {
    return chartData.get(key) || null;
  };

  const isAPIMode = (): boolean => {
    return dataSettings.useAPIData;
  };

  const isRealTimeEnabled = (): boolean => {
    return dataSettings.enableRealTimeUpdates;
  };

  const contextValue: SystemDataContextType = {
    // Data Sources
    liveSystem,
    chartData,
    
    // System State
    isLoading,
    error,
    lastUpdated,
    systemHealth,
    
    // Settings
    dataSettings,
    
    // Actions
    refreshAllData,
    refreshLiveData,
    refreshChartData,
    clearError,
    
    // System Control
    enableAPIMode,
    enableMockMode,
    toggleRealTime,
    
    // Utilities
    getChartData,
    isAPIMode,
    isRealTimeEnabled,
    
    // Auto test state
    autoTestState,
    updateAutoTestState
  };

  return (
    <SystemDataContext.Provider value={contextValue}>
      {children}
    </SystemDataContext.Provider>
  );
};

// Custom hook to use system data
export const useSystemData = (): SystemDataContextType => {
  const context = useContext(SystemDataContext);
  if (!context) {
    throw new Error('useSystemData must be used within a SystemDataProvider');
  }
  return context;
};

// Specialized hooks for different components
export const useLiveSystemData = () => {
  const { liveSystem, isLoading, error, refreshLiveData, isAPIMode } = useSystemData();
  return { liveSystem, isLoading, error, refreshLiveData, isAPIMode };
};

export const useChartSystemData = (chartKey: string, params: any) => {
  const { getChartData, refreshChartData, isLoading, error, isAPIMode } = useSystemData();
  
  const data = getChartData(chartKey);
  
  const refresh = () => refreshChartData(chartKey, params);
  
  return { data, refresh, isLoading, error, isAPIMode };
};
