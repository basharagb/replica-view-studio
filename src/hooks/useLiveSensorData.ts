/**
 * React Hook for Live Sensor Data
 * Manages real-time sensor readings from API for LabInterface
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { realTimeSensorService, LiveSiloSystem, LiveSensorData } from '../services/realTimeSensorService';
import { Silo, SiloGroup, CylinderSilo } from '../types/silo';

export interface UseLiveSensorDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  enableRealTimeUpdates?: boolean;
}

export interface UseLiveSensorDataReturn {
  // Data
  topSiloGroups: SiloGroup[];
  bottomSiloGroups: SiloGroup[];
  cylinderSilos: CylinderSilo[];
  
  // State
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isRealTime: boolean;
  
  // Actions
  refreshData: () => Promise<void>;
  toggleRealTime: () => void;
  clearError: () => void;
  
  // Utilities
  findSiloByNumber: (num: number) => Silo | null;
  getAllSilos: () => Silo[];
}

export function useLiveSensorData(options: UseLiveSensorDataOptions = {}): UseLiveSensorDataReturn {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    enableRealTimeUpdates = true
  } = options;

  // State
  const [siloSystem, setSiloSystem] = useState<LiveSiloSystem>({
    topSiloGroups: [],
    bottomSiloGroups: [],
    cylinderSilos: [],
    lastUpdated: new Date(),
    isLoading: true
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealTime, setIsRealTime] = useState(enableRealTimeUpdates);
  
  // Refs
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const mountedRef = useRef(true);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh data manually
  const refreshData = useCallback(async () => {
    if (!mountedRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newData = await realTimeSensorService.getLiveSiloSystem();
      
      if (mountedRef.current) {
        setSiloSystem(newData);
        if (newData.error) {
          setError(newData.error);
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sensor data';
        setError(errorMessage);
        console.error('Error refreshing sensor data:', err);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Toggle real-time updates
  const toggleRealTime = useCallback(() => {
    setIsRealTime(prev => {
      const newValue = !prev;
      
      if (newValue) {
        // Start real-time updates
        realTimeSensorService.startRealTimeUpdates(refreshInterval);
        
        // Subscribe to updates
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
        unsubscribeRef.current = realTimeSensorService.subscribe((data) => {
          if (mountedRef.current) {
            setSiloSystem(data);
            setIsLoading(data.isLoading);
            setError(data.error || null);
          }
        });
      } else {
        // Stop real-time updates
        realTimeSensorService.stopRealTimeUpdates();
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
      }
      
      return newValue;
    });
  }, [refreshInterval]);

  // Find silo by number
  const findSiloByNumber = useCallback((num: number): Silo | null => {
    // Search in top groups
    for (const group of siloSystem.topSiloGroups) {
      const found = [
        ...(group.topRow || []),
        ...(group.middleRow || []),
        ...(group.bottomRow || [])
      ].find(silo => silo.num === num);
      if (found) return found;
    }
    
    // Search in bottom groups
    for (const group of siloSystem.bottomSiloGroups) {
      const found = [
        ...(group.row1 || []),
        ...(group.row2 || []),
        ...(group.row3 || []),
        ...(group.row4 || []),
        ...(group.row5 || [])
      ].find(silo => silo.num === num);
      if (found) return found;
    }
    
    return null;
  }, [siloSystem]);

  // Get all silos
  const getAllSilos = useCallback((): Silo[] => {
    const allSilos: Silo[] = [];
    
    // Add from top groups
    siloSystem.topSiloGroups.forEach(group => {
      if (group.topRow) allSilos.push(...group.topRow);
      if (group.middleRow) allSilos.push(...group.middleRow);
      if (group.bottomRow) allSilos.push(...group.bottomRow);
    });
    
    // Add from bottom groups
    siloSystem.bottomSiloGroups.forEach(group => {
      if (group.row1) allSilos.push(...group.row1);
      if (group.row2) allSilos.push(...group.row2);
      if (group.row3) allSilos.push(...group.row3);
      if (group.row4) allSilos.push(...group.row4);
      if (group.row5) allSilos.push(...group.row5);
    });
    
    return allSilos;
  }, [siloSystem]);

  // Initialize and setup
  useEffect(() => {
    mountedRef.current = true;
    
    // Initial data fetch
    refreshData();
    
    // Setup real-time updates if enabled
    if (isRealTime && autoRefresh) {
      realTimeSensorService.startRealTimeUpdates(refreshInterval);
      
      unsubscribeRef.current = realTimeSensorService.subscribe((data) => {
        if (mountedRef.current) {
          setSiloSystem(data);
          setIsLoading(data.isLoading);
          setError(data.error || null);
        }
      });
    }
    
    return () => {
      mountedRef.current = false;
      
      // Cleanup
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      
      // Only stop real-time updates if this is the last component using them
      // In a real app, you might want a more sophisticated cleanup strategy
      realTimeSensorService.stopRealTimeUpdates();
    };
  }, [refreshData, isRealTime, autoRefresh, refreshInterval]);

  // Handle real-time toggle changes
  useEffect(() => {
    if (isRealTime && autoRefresh) {
      realTimeSensorService.startRealTimeUpdates(refreshInterval);
      
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      
      unsubscribeRef.current = realTimeSensorService.subscribe((data) => {
        if (mountedRef.current) {
          setSiloSystem(data);
          setIsLoading(data.isLoading);
          setError(data.error || null);
        }
      });
    } else {
      realTimeSensorService.stopRealTimeUpdates();
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    }
  }, [isRealTime, autoRefresh, refreshInterval]);

  return {
    // Data
    topSiloGroups: siloSystem.topSiloGroups,
    bottomSiloGroups: siloSystem.bottomSiloGroups,
    cylinderSilos: siloSystem.cylinderSilos,
    
    // State
    isLoading,
    error,
    lastUpdated: siloSystem.lastUpdated,
    isRealTime,
    
    // Actions
    refreshData,
    toggleRealTime,
    clearError,
    
    // Utilities
    findSiloByNumber,
    getAllSilos
  };
}

// Specialized hooks for specific use cases

/**
 * Hook for real-time monitoring with frequent updates
 */
export function useRealTimeMonitoring() {
  return useLiveSensorData({
    autoRefresh: true,
    refreshInterval: 15000, // 15 seconds
    enableRealTimeUpdates: true
  });
}

/**
 * Hook for periodic updates with less frequent refresh
 */
export function usePeriodicSensorData() {
  return useLiveSensorData({
    autoRefresh: true,
    refreshInterval: 60000, // 1 minute
    enableRealTimeUpdates: false
  });
}

/**
 * Hook for manual control over sensor data updates
 */
export function useManualSensorData() {
  return useLiveSensorData({
    autoRefresh: false,
    enableRealTimeUpdates: false
  });
}
