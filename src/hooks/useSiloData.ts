/**
 * Custom React Hook for Silo Data Management
 * Provides easy integration with the API service and binning system
 */

import { useState, useEffect, useCallback } from 'react';
import { siloReadingsService } from '../services/siloReadingsService';
import {
  ProcessedSiloData,
  ProcessedGroupData,
  LoadingState,
  ErrorState,
  ChartDataConfig,
  AggregationType
} from '../types/api';

export interface UseSiloDataOptions {
  siloNumbers?: number[];
  groupIds?: number[];
  selectedDays: number;
  dataType: 'levels' | 'temperature' | 'all_readings';
  aggregationType?: AggregationType;
  endTime?: Date;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export interface UseSiloDataReturn {
  data: ProcessedSiloData[] | ProcessedGroupData[];
  loading: LoadingState;
  error: ErrorState;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export function useSiloData(options: UseSiloDataOptions): UseSiloDataReturn {
  const [data, setData] = useState<ProcessedSiloData[] | ProcessedGroupData[]>([]);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false });
  const [error, setError] = useState<ErrorState>({ hasError: false });

  const {
    siloNumbers,
    groupIds,
    selectedDays,
    dataType,
    aggregationType = 'avg',
    endTime,
    autoRefresh = false,
    refreshInterval = 30000 // 30 seconds default
  } = options;

  const clearError = useCallback(() => {
    setError({ hasError: false });
  }, []);

  const fetchData = useCallback(async () => {
    // Validate parameters
    if (!siloNumbers?.length && !groupIds?.length) {
      setError({
        hasError: true,
        error: new Error('Either siloNumbers or groupIds must be provided'),
        canRetry: false
      });
      return;
    }

    if (selectedDays < 1 || selectedDays > 24) {
      setError({
        hasError: true,
        error: new Error('selectedDays must be between 1 and 24'),
        canRetry: false
      });
      return;
    }

    setLoading({ 
      isLoading: true, 
      message: `Fetching ${dataType} data...`,
      endpoint: dataType 
    });
    setError({ hasError: false });

    try {
      let result: ProcessedSiloData[] | ProcessedGroupData[] = [];

      if (siloNumbers?.length) {
        // Fetch silo-based data
        const params = {
          silo_number: siloNumbers,
          selectedDays,
          endTime
        };

        switch (dataType) {
          case 'levels':
            if (aggregationType === 'max') {
              result = await siloReadingsService.getMaxLevelsBySiloNumbers(params);
            } else if (aggregationType === 'latest') {
              result = await siloReadingsService.getLatestLevelsBySiloNumbers(params);
            } else {
              result = await siloReadingsService.getLevelsBySiloNumbers(params);
            }
            break;
          case 'all_readings':
            result = await siloReadingsService.getReadingsBySiloNumbers(params);
            break;
          default:
            throw new Error(`Unsupported data type: ${dataType}`);
        }
      } else if (groupIds?.length) {
        // Fetch group-based data
        const params = {
          group_id: groupIds,
          selectedDays,
          endTime
        };

        switch (dataType) {
          case 'levels':
            if (aggregationType === 'max') {
              result = await siloReadingsService.getMaxLevelsByGroupIds(params);
            } else if (aggregationType === 'latest') {
              result = await siloReadingsService.getLatestLevelsByGroupIds(params);
            } else {
              result = await siloReadingsService.getLevelsByGroupIds(params);
            }
            break;
          case 'all_readings':
            result = await siloReadingsService.getReadingsByGroupIds(params);
            break;
          default:
            throw new Error(`Unsupported data type: ${dataType}`);
        }
      }

      setData(result);
      console.log(`Successfully fetched ${result.length} ${dataType} records`);

    } catch (err) {
      console.error(`Error fetching ${dataType} data:`, err);
      setError({
        hasError: true,
        error: err as Error,
        endpoint: dataType,
        canRetry: true,
        retryCount: (error.retryCount || 0) + 1
      });
    } finally {
      setLoading({ isLoading: false });
    }
  }, [siloNumbers, groupIds, selectedDays, dataType, aggregationType, endTime, error.retryCount]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      if (!loading.isLoading) {
        fetchData();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loading.isLoading, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    clearError
  };
}

// Specialized hooks for common use cases

export function useSiloLevels(
  siloNumbers: number[],
  selectedDays: number,
  aggregationType: AggregationType = 'avg',
  endTime?: Date
): UseSiloDataReturn {
  return useSiloData({
    siloNumbers,
    selectedDays,
    dataType: 'levels',
    aggregationType,
    endTime
  });
}

export function useSiloReadings(
  siloNumbers: number[],
  selectedDays: number,
  endTime?: Date,
  autoRefresh: boolean = false
): UseSiloDataReturn {
  return useSiloData({
    siloNumbers,
    selectedDays,
    dataType: 'all_readings',
    endTime,
    autoRefresh,
    refreshInterval: autoRefresh ? 30000 : undefined
  });
}

export function useGroupLevels(
  groupIds: number[],
  selectedDays: number,
  aggregationType: AggregationType = 'avg',
  endTime?: Date
): UseSiloDataReturn {
  return useSiloData({
    groupIds,
    selectedDays,
    dataType: 'levels',
    aggregationType,
    endTime
  });
}

export function useGroupReadings(
  groupIds: number[],
  selectedDays: number,
  endTime?: Date,
  autoRefresh: boolean = false
): UseSiloDataReturn {
  return useSiloData({
    groupIds,
    selectedDays,
    dataType: 'all_readings',
    endTime,
    autoRefresh,
    refreshInterval: autoRefresh ? 30000 : undefined
  });
}

// Utility hook for real-time monitoring
export function useRealTimeSiloMonitoring(
  siloNumbers: number[],
  selectedDays: number = 1
): UseSiloDataReturn {
  return useSiloData({
    siloNumbers,
    selectedDays,
    dataType: 'all_readings',
    autoRefresh: true,
    refreshInterval: 15000 // 15 seconds for real-time monitoring
  });
}
