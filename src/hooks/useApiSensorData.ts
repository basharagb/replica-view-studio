/**
 * React Hook for API-integrated Sensor Data
 * Manages real-time sensor readings from the actual API for LabInterface
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  fetchSiloReadings, 
  markSiloAsChecked, 
  getSiloData, 
  clearSiloCache,
  SiloData 
} from '../services/apiService';
import { Silo, SiloGroup } from '../types/silo';

export interface UseApiSensorDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export interface UseApiSensorDataReturn {
  // Data
  topSiloGroups: SiloGroup[];
  bottomSiloGroups: SiloGroup[];
  
  // State
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Actions
  refreshData: () => Promise<void>;
  testSilo: (siloNumber: number) => Promise<void>;
  clearError: () => void;
  
  // Utilities
  findSiloByNumber: (num: number) => Silo | null;
  getAllSilos: () => Silo[];
}

// Convert API SiloData to Silo format
const convertApiSiloToSilo = (apiSilo: SiloData): Silo => {
  const enhancedSensors = apiSilo.sensors.map((temp, index) => ({
    id: `S${index + 1}`,
    temperature: temp,
    position: `Sensor ${index + 1}`,
    calibrationStatus: 'calibrated' as const,
    timestamp: new Date(apiSilo.timestamp),
    isActive: true
  }));

  return {
    num: apiSilo.num,
    temp: apiSilo.temp,
    sensors: enhancedSensors
  };
};

// Generate correct silo layout based on user's images
const generateTopSiloGroups = (): SiloGroup[] => {
  return [
    // Group 1 (1-10)
    {
      topRow: [1, 2, 3].map(num => convertApiSiloToSilo(getSiloData(num))),
      middleRow: [6, 7].map(num => convertApiSiloToSilo(getSiloData(num))),
      bottomRow: [8, 9, 10].map(num => convertApiSiloToSilo(getSiloData(num)))
    },
    // Group 2 (12-21)
    {
      topRow: [12, 13, 14].map(num => convertApiSiloToSilo(getSiloData(num))),
      middleRow: [17, 18].map(num => convertApiSiloToSilo(getSiloData(num))),
      bottomRow: [19, 20, 21].map(num => convertApiSiloToSilo(getSiloData(num)))
    },
    // Group 3 (23-32)
    {
      topRow: [23, 24, 25].map(num => convertApiSiloToSilo(getSiloData(num))),
      middleRow: [28, 29].map(num => convertApiSiloToSilo(getSiloData(num))),
      bottomRow: [30, 31, 32].map(num => convertApiSiloToSilo(getSiloData(num)))
    },
    // Group 4 (34-43)
    {
      topRow: [34, 35, 36].map(num => convertApiSiloToSilo(getSiloData(num))),
      middleRow: [39, 40].map(num => convertApiSiloToSilo(getSiloData(num))),
      bottomRow: [41, 42, 43].map(num => convertApiSiloToSilo(getSiloData(num)))
    },
    // Group 5 (45-54)
    {
      topRow: [45, 46, 47].map(num => convertApiSiloToSilo(getSiloData(num))),
      middleRow: [50, 51].map(num => convertApiSiloToSilo(getSiloData(num))),
      bottomRow: [52, 53, 54].map(num => convertApiSiloToSilo(getSiloData(num)))
    }
  ];
};

const generateBottomSiloGroups = (): SiloGroup[] => {
  return [
    // Group 1 (195-177)
    {
      topRow: [195, 188, 181].map(num => convertApiSiloToSilo(getSiloData(num))),
      middleRow: [194, 190, 187, 183, 180].map(num => convertApiSiloToSilo(getSiloData(num))),
      bottomRow: [193, 186, 179].map(num => convertApiSiloToSilo(getSiloData(num))),
      row4: [192, 185, 182, 178].map(num => convertApiSiloToSilo(getSiloData(num))),
      row5: [191, 184, 177].map(num => convertApiSiloToSilo(getSiloData(num)))
    },
    // Group 2 (176-158)
    {
      topRow: [176, 169, 162].map(num => convertApiSiloToSilo(getSiloData(num))),
      middleRow: [175, 171, 168, 164, 161].map(num => convertApiSiloToSilo(getSiloData(num))),
      bottomRow: [174, 167, 160].map(num => convertApiSiloToSilo(getSiloData(num))),
      row4: [173, 170, 166, 163, 159].map(num => convertApiSiloToSilo(getSiloData(num))),
      row5: [172, 165, 158].map(num => convertApiSiloToSilo(getSiloData(num)))
    },
    // Group 3 (157-139)
    {
      topRow: [157, 150, 143].map(num => convertApiSiloToSilo(getSiloData(num))),
      middleRow: [156, 152, 149, 145, 142].map(num => convertApiSiloToSilo(getSiloData(num))),
      bottomRow: [155, 148, 141].map(num => convertApiSiloToSilo(getSiloData(num))),
      row4: [154, 151, 147, 144, 140].map(num => convertApiSiloToSilo(getSiloData(num))),
      row5: [153, 146, 139].map(num => convertApiSiloToSilo(getSiloData(num)))
    },
    // Group 4 (138-120)
    {
      topRow: [138, 131, 124].map(num => convertApiSiloToSilo(getSiloData(num))),
      middleRow: [137, 133, 130, 126, 123].map(num => convertApiSiloToSilo(getSiloData(num))),
      bottomRow: [136, 129, 122].map(num => convertApiSiloToSilo(getSiloData(num))),
      row4: [135, 132, 128, 125, 121].map(num => convertApiSiloToSilo(getSiloData(num))),
      row5: [134, 127, 120].map(num => convertApiSiloToSilo(getSiloData(num)))
    },
    // Group 5 (119-101)
    {
      topRow: [119, 112, 105].map(num => convertApiSiloToSilo(getSiloData(num))),
      middleRow: [118, 114, 111, 107, 104].map(num => convertApiSiloToSilo(getSiloData(num))),
      bottomRow: [117, 110, 103].map(num => convertApiSiloToSilo(getSiloData(num))),
      row4: [116, 113, 109, 106, 102].map(num => convertApiSiloToSilo(getSiloData(num))),
      row5: [115, 108, 101].map(num => convertApiSiloToSilo(getSiloData(num)))
    }
  ];
};

export function useApiSensorData(options: UseApiSensorDataOptions = {}): UseApiSensorDataReturn {
  const {
    autoRefresh = false,
    refreshInterval = 30000 // 30 seconds
  } = options;

  // State
  const [topSiloGroups, setTopSiloGroups] = useState<SiloGroup[]>([]);
  const [bottomSiloGroups, setBottomSiloGroups] = useState<SiloGroup[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize with wheat-colored silos
  useEffect(() => {
    setTopSiloGroups(generateTopSiloGroups());
    setBottomSiloGroups(generateBottomSiloGroups());
    setLastUpdated(new Date());
  }, []);

  // Auto refresh setup
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        refreshData();
      }, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval]);

  // Refresh data function
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Regenerate groups with updated data
      setTopSiloGroups(generateTopSiloGroups());
      setBottomSiloGroups(generateBottomSiloGroups());
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Test silo function - fetches real data from API
  const testSilo = useCallback(async (siloNumber: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch real data from API
      const siloReadings = await fetchSiloReadings([siloNumber]);
      if (siloReadings.length > 0) {
        // Mark silo as checked
        markSiloAsChecked(siloNumber);
        
        // Refresh the display to show updated data
        setTopSiloGroups(generateTopSiloGroups());
        setBottomSiloGroups(generateBottomSiloGroups());
        setLastUpdated(new Date());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to test silo ${siloNumber}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Find silo by number
  const findSiloByNumber = useCallback((num: number): Silo | null => {
    const allGroups = [...topSiloGroups, ...bottomSiloGroups];
    
    for (const group of allGroups) {
      const rows = [group.topRow, group.middleRow, group.bottomRow, group.row4, group.row5];
      for (const row of rows) {
        if (row) {
          const silo = row.find(s => s.num === num);
          if (silo) return silo;
        }
      }
    }
    
    return null;
  }, [topSiloGroups, bottomSiloGroups]);

  // Get all silos
  const getAllSilos = useCallback((): Silo[] => {
    const allSilos: Silo[] = [];
    const allGroups = [...topSiloGroups, ...bottomSiloGroups];
    
    for (const group of allGroups) {
      const rows = [group.topRow, group.middleRow, group.bottomRow, group.row4, group.row5];
      for (const row of rows) {
        if (row) {
          allSilos.push(...row);
        }
      }
    }
    
    return allSilos.sort((a, b) => a.num - b.num);
  }, [topSiloGroups, bottomSiloGroups]);

  return {
    // Data
    topSiloGroups,
    bottomSiloGroups,
    
    // State
    isLoading,
    error,
    lastUpdated,
    
    // Actions
    refreshData,
    testSilo,
    clearError,
    
    // Utilities
    findSiloByNumber,
    getAllSilos
  };
}
