// Real Silo API Service for connecting to physical silo sensors
// API Endpoint: http://idealchiprnd.pythonanywhere.com/readings/avg/latest/by-silo-number

import { TemperatureColor } from '../types/silo';

// API Response interface matching the real API structure
export interface RealSiloApiResponse {
  silo_group: string;
  silo_number: number;
  cable_number: number | null;
  level_0: number;  // S1 sensor
  color_0: string;  // S1 color
  level_1: number;  // S2 sensor
  color_1: string;  // S2 color
  level_2: number;  // S3 sensor
  color_2: string;  // S3 color
  level_3: number;  // S4 sensor
  color_3: string;  // S4 color
  level_4: number;  // S5 sensor
  color_4: string;  // S5 color
  level_5: number;  // S6 sensor
  color_5: string;  // S6 color
  level_6: number;  // S7 sensor
  color_6: string;  // S7 color
  level_7: number;  // S8 sensor
  color_7: string;  // S8 color
  silo_color: string;
  timestamp: string;
}

// Processed silo data for internal use
export interface ProcessedSiloData {
  siloNumber: number;
  sensors: number[];  // [S1, S2, S3, S4, S5, S6, S7, S8]
  sensorColors: string[];  // Colors for each sensor
  siloColor: string;
  maxTemp: number;
  timestamp: Date;
  isLoaded: boolean;
}

// Default wheat color for unloaded silos
export const WHEAT_COLOR = '#93856b';

// API configuration
const API_BASE_URL = 'http://idealchiprnd.pythonanywhere.com';
const API_ENDPOINT = '/readings/avg/latest/by-silo-number';

// Cache for storing fetched silo data
class SiloDataCache {
  private cache = new Map<number, ProcessedSiloData>();
  private loadingStates = new Map<number, boolean>();

  // Check if silo data is cached
  has(siloNumber: number): boolean {
    return this.cache.has(siloNumber);
  }

  // Get cached silo data
  get(siloNumber: number): ProcessedSiloData | undefined {
    return this.cache.get(siloNumber);
  }

  // Set silo data in cache
  set(siloNumber: number, data: ProcessedSiloData): void {
    this.cache.set(siloNumber, data);
    this.loadingStates.set(siloNumber, false);
  }

  // Check if silo is currently loading
  isLoading(siloNumber: number): boolean {
    return this.loadingStates.get(siloNumber) || false;
  }

  // Set loading state for silo
  setLoading(siloNumber: number, loading: boolean): void {
    this.loadingStates.set(siloNumber, loading);
  }

  // Get default wheat-colored silo data
  getDefaultSiloData(siloNumber: number): ProcessedSiloData {
    return {
      siloNumber,
      sensors: [0, 0, 0, 0, 0, 0, 0, 0],  // All sensors zero
      sensorColors: Array(8).fill(WHEAT_COLOR),
      siloColor: WHEAT_COLOR,
      maxTemp: 0,
      timestamp: new Date(),
      isLoaded: false
    };
  }

  // Clear all cached data
  clear(): void {
    this.cache.clear();
    this.loadingStates.clear();
  }

  // Get all cached silo numbers
  getCachedSiloNumbers(): number[] {
    return Array.from(this.cache.keys());
  }
}

// Global cache instance
const siloCache = new SiloDataCache();

// Convert API response to processed silo data
function processApiResponse(apiData: RealSiloApiResponse): ProcessedSiloData {
  const sensors = [
    apiData.level_0,  // S1
    apiData.level_1,  // S2
    apiData.level_2,  // S3
    apiData.level_3,  // S4
    apiData.level_4,  // S5
    apiData.level_5,  // S6
    apiData.level_6,  // S7
    apiData.level_7   // S8
  ];

  const sensorColors = [
    apiData.color_0,  // S1 color
    apiData.color_1,  // S2 color
    apiData.color_2,  // S3 color
    apiData.color_3,  // S4 color
    apiData.color_4,  // S5 color
    apiData.color_5,  // S6 color
    apiData.color_6,  // S7 color
    apiData.color_7   // S8 color
  ];

  const maxTemp = Math.max(...sensors);

  return {
    siloNumber: apiData.silo_number,
    sensors,
    sensorColors,
    siloColor: apiData.silo_color,
    maxTemp,
    timestamp: new Date(apiData.timestamp),
    isLoaded: true
  };
}

// Fetch silo data from real API
export async function fetchSiloData(siloNumber: number): Promise<ProcessedSiloData> {
  // Check if already loading
  if (siloCache.isLoading(siloNumber)) {
    // Wait for existing request to complete
    return new Promise((resolve) => {
      const checkCache = () => {
        if (!siloCache.isLoading(siloNumber)) {
          resolve(siloCache.get(siloNumber) || siloCache.getDefaultSiloData(siloNumber));
        } else {
          setTimeout(checkCache, 100);
        }
      };
      checkCache();
    });
  }

  // Return cached data if available
  if (siloCache.has(siloNumber)) {
    return siloCache.get(siloNumber)!;
  }

  // Set loading state
  siloCache.setLoading(siloNumber, true);

  try {
    const url = `${API_BASE_URL}${API_ENDPOINT}?silo_number=${siloNumber}`;
    // Fetching silo data from API (logging removed for performance)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const apiData: RealSiloApiResponse[] = await response.json();
    
    if (!apiData || apiData.length === 0) {
      throw new Error(`No data returned for silo ${siloNumber}`);
    }

    // Process the first (and should be only) result
    const processedData = processApiResponse(apiData[0]);
    
    // Cache the processed data
    siloCache.set(siloNumber, processedData);
    
    // Successfully fetched silo data (logging removed for performance)
    return processedData;

  } catch (error) {
    console.error(`Failed to fetch silo ${siloNumber} data:`, error);
    
    // Clear loading state
    siloCache.setLoading(siloNumber, false);
    
    // Return default wheat-colored data on error
    const defaultData = siloCache.getDefaultSiloData(siloNumber);
    siloCache.set(siloNumber, defaultData);
    
    return defaultData;
  }
}

// Fetch multiple silos data in parallel
export async function fetchMultipleSilosData(siloNumbers: number[]): Promise<ProcessedSiloData[]> {
  const promises = siloNumbers.map(siloNumber => fetchSiloData(siloNumber));
  return Promise.all(promises);
}

// Get silo data (from cache or default)
export function getSiloData(siloNumber: number): ProcessedSiloData {
  return siloCache.get(siloNumber) || siloCache.getDefaultSiloData(siloNumber);
}

// Check if silo data is loaded from API
export function isSiloDataLoaded(siloNumber: number): boolean {
  const data = siloCache.get(siloNumber);
  return data?.isLoaded || false;
}

// Get all loaded silo numbers
export function getLoadedSiloNumbers(): number[] {
  return siloCache.getCachedSiloNumbers().filter(siloNumber => 
    isSiloDataLoaded(siloNumber)
  );
}

// Clear all cached silo data
export function clearSiloDataCache(): void {
  siloCache.clear();
  // Silo data cache cleared
}

// Convert hex color to internal temperature color type
export function convertApiColorToTemperatureColor(hexColor: string): TemperatureColor {
  // Convert API hex colors to internal color system
  const color = hexColor.toLowerCase();
  
  // Green colors (various shades)
  if (color.startsWith('#46d4') || color.startsWith('#4') || color === '#00ff00' || color === '#44ff44' || color.startsWith('#46')) {
    return 'green';
  }
  
  // Yellow colors
  if (color.startsWith('#c7c1') || color === '#c7c150' || color.startsWith('#ff') && color.includes('c')) {
    return 'yellow';
  }
  
  // Red colors (critical temperatures)
  if (color.startsWith('#ff') || color.startsWith('#f') || color === '#ff0000' || color === '#ff4444') {
    return 'pink';
  }
  
  // Default to green for unknown colors (safer than wheat for real sensor data)
  // Unknown API color, defaulting to green
  return 'green';
}

// Retry mechanism for failed API calls
export async function fetchSiloDataWithRetry(
  siloNumber: number, 
  maxRetries: number = 3, 
  delayMs: number = 1000
): Promise<ProcessedSiloData> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchSiloData(siloNumber);
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt}/${maxRetries} failed for silo ${siloNumber}:`, error);
      
      if (attempt < maxRetries) {
        // Wait before retry with exponential backoff
        const delay = delayMs * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error(`All ${maxRetries} attempts failed for silo ${siloNumber}:`, lastError);
  
  // Return default data after all retries failed
  const defaultData = siloCache.getDefaultSiloData(siloNumber);
  siloCache.set(siloNumber, defaultData);
  return defaultData;
}

// Export cache instance for testing/debugging
export { siloCache };
