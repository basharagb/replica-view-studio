/**
 * React Hook for Cottage Temperature Data
 * Manages real-time temperature readings from cottage environment sensors
 * slave_id 21 = Inside temperature
 * slave_id 22 = Outside temperature
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface CottageTemperatureReading {
  slave_id: number;
  temperature_c: number;
  timestamp: string;
}

export interface CottageTemperatureData {
  inside: {
    temperature: number;
    timestamp: string;
    status: 'normal' | 'warning' | 'error' | 'disconnected';
  } | null;
  outside: {
    temperature: number;
    timestamp: string;
    status: 'normal' | 'warning' | 'error' | 'disconnected';
  } | null;
  lastUpdated: Date | null;
}

export interface UseCottageTemperatureOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  enableRealTimeUpdates?: boolean;
  apiUrl?: string;
}

export interface UseCottageTemperatureReturn {
  // Data
  data: CottageTemperatureData;
  
  // State
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  
  // Actions
  refreshData: () => Promise<void>;
  clearError: () => void;
}

import { Strings } from '../utils/Strings';

// Compute default API URL based on environment
// Use the cottage temperature API endpoint from centralized config
const DEFAULT_API_URL = `${Strings.BASE_URL}/env_temp`;

// Helper function to determine temperature status
function getTemperatureStatus(temp: number): 'normal' | 'warning' | 'error' | 'disconnected' {
  if (temp === -127.0) return 'disconnected'; // Sensor disconnected
  if (temp < -50 || temp > 60) return 'error'; // Sensor error/malfunction
  if (temp < 0 || temp > 50) return 'warning'; // Extreme temperatures
  return 'normal';
}

export function useCottageTemperature(options: UseCottageTemperatureOptions = {}): UseCottageTemperatureReturn {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    enableRealTimeUpdates = true,
    apiUrl = DEFAULT_API_URL
  } = options;

  // State
  const [data, setData] = useState<CottageTemperatureData>({
    inside: null,
    outside: null,
    lastUpdated: null
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Refs
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const errorLoggedRef = useRef(false); // Prevent repeated error logging

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch temperature data
  const fetchTemperatureData = useCallback(async (): Promise<CottageTemperatureData> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Handle 404 specifically for missing endpoint
        if (response.status === 404) {
          throw new Error('Environment temperature endpoint not available on this server');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const readings: CottageTemperatureReading[] = await response.json();
      
      // Process readings to separate inside and outside temperatures
      const insideReading = readings.find(r => r.slave_id === 21);
      const outsideReading = readings.find(r => r.slave_id === 22);
      
      const processedData: CottageTemperatureData = {
        inside: insideReading ? {
          temperature: insideReading.temperature_c,
          timestamp: insideReading.timestamp,
          status: getTemperatureStatus(insideReading.temperature_c)
        } : null,
        outside: outsideReading ? {
          temperature: outsideReading.temperature_c,
          timestamp: outsideReading.timestamp,
          status: getTemperatureStatus(outsideReading.temperature_c)
        } : null,
        lastUpdated: new Date()
      };
      
      return processedData;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Request timeout - cottage temperature API not responding');
      }
      // Provide more specific error messages
      if (err instanceof Error && err.message.includes('404')) {
        throw new Error('Environment temperature service not available - endpoint missing');
      }
      throw err instanceof Error ? err : new Error('Failed to fetch cottage temperature data');
    }
  }, [apiUrl]);

  // Refresh data manually
  const refreshData = useCallback(async () => {
    if (!mountedRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newData = await fetchTemperatureData();
      
      if (mountedRef.current) {
        setData(newData);
        setIsConnected(true);
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cottage temperature data';
        setError(errorMessage);
        setIsConnected(false);
        // Only log error once to prevent console spam
        if (!errorLoggedRef.current) {
          console.error('Error fetching cottage temperature data:', err);
          errorLoggedRef.current = true;
        }
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [fetchTemperatureData]);

  // Setup auto-refresh
  useEffect(() => {
    if (!enableRealTimeUpdates || !autoRefresh) return;

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        refreshData();
      }
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshData, enableRealTimeUpdates, autoRefresh, refreshInterval]);

  // Initialize and cleanup
  useEffect(() => {
    mountedRef.current = true;
    
    // Initial data fetch
    refreshData();
    
    return () => {
      mountedRef.current = false;
      
      // Cleanup interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshData]);

  return {
    // Data
    data,
    
    // State
    isLoading,
    error,
    isConnected,
    
    // Actions
    refreshData,
    clearError
  };
}

// Specialized hook for real-time monitoring with frequent updates
export function useRealTimeCottageTemperature() {
  return useCottageTemperature({
    autoRefresh: true,
    refreshInterval: 15000, // 15 seconds
    enableRealTimeUpdates: true
  });
}

// Specialized hook for periodic updates with less frequent refresh
export function usePeriodicCottageTemperature() {
  return useCottageTemperature({
    autoRefresh: true,
    refreshInterval: 60000, // 1 minute
    enableRealTimeUpdates: true
  });
}
