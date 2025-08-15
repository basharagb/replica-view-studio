// Historical Silo API Service for fetching real data for reports and graphs
import { Strings } from '../utils/Strings';

// API Endpoint: {BASE_URL}/readings/avg/by-silo-number

import { RealSiloApiResponse } from './realSiloApiService';

// Historical data interfaces
export interface HistoricalSiloData {
  siloNumber: number;
  timestamp: Date;
  sensors: number[];  // [S1, S2, S3, S4, S5, S6, S7, S8]
  sensorColors: string[];  // Colors for each sensor
  siloColor: string;
  maxTemp: number;
  avgTemp: number;
  minTemp: number;
  alertLevel: 'Normal' | 'Warning' | 'Critical';
}

export interface TemperatureGraphData {
  time: string;
  timestamp: Date;
  [key: string]: any; // Dynamic silo properties like silo_1, silo_2, etc.
}

export interface SiloReportRecord {
  timestamp: Date;
  timeString: string;
  maxTemp: number;
  avgTemp: number;
  minTemp: number;
  alertStatus: 'Normal' | 'Warning' | 'Critical';
  sensors: number[];
}

// API configuration
const API_BASE_URL = Strings.BASE_URL;
const API_ENDPOINT = '/readings/avg/by-silo-number';

// Temperature thresholds for alert levels
const TEMP_THRESHOLDS = {
  WARNING: 35.0,
  CRITICAL: 40.0
};

/**
 * Fetch historical data for multiple silos within a date range
 */
export async function fetchHistoricalSiloData(
  siloNumbers: number[],
  startDate: Date,
  endDate: Date
): Promise<HistoricalSiloData[]> {
  try {
    // Format dates for API
    const startStr = formatDateForApi(startDate);
    const endStr = formatDateForApi(endDate);
    
    // Build query parameters
    const siloParams = siloNumbers.map(num => `silo_number=${num}`).join('&');
    const url = `${API_BASE_URL}${API_ENDPOINT}?${siloParams}&start=${startStr}&end=${endStr}`;
    
    console.log(`Fetching historical data from: ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const apiData: RealSiloApiResponse[] = await response.json();
    console.log(`Fetched ${apiData.length} historical records`);
    
    // Process API response into internal format
    return apiData.map(processHistoricalApiResponse);
    
  } catch (error) {
    console.error('Error fetching historical silo data:', error);
    throw error;
  }
}

/**
 * Fetch historical data for a single silo
 */
export async function fetchSingleSiloHistoricalData(
  siloNumber: number,
  startDate: Date,
  endDate: Date
): Promise<HistoricalSiloData[]> {
  return fetchHistoricalSiloData([siloNumber], startDate, endDate);
}

/**
 * Generate temperature graph data for multiple silos with proper handling of missing readings
 * Creates 24 evenly distributed horizontal time points across the date range
 */
export async function generateTemperatureGraphData(
  siloNumbers: number[],
  startDate: Date,
  endDate: Date
): Promise<TemperatureGraphData[]> {
  try {
    console.log(`Generating graph data for silos [${siloNumbers.join(', ')}] from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    const historicalData = await fetchHistoricalSiloData(siloNumbers, startDate, endDate);
    console.log(`Fetched ${historicalData.length} historical records`);
    
    // Group data by timestamp and silo
    const timeGroups = new Map<string, Map<number, HistoricalSiloData>>();
    
    historicalData.forEach(record => {
      const timeKey = record.timestamp.toISOString();
      if (!timeGroups.has(timeKey)) {
        timeGroups.set(timeKey, new Map());
      }
      timeGroups.get(timeKey)!.set(record.siloNumber, record);
    });
    
    // Create 24 evenly distributed time points across the date range
    const totalDurationMs = endDate.getTime() - startDate.getTime();
    const intervalMs = totalDurationMs / 23; // 23 intervals for 24 points
    
    const graphData: TemperatureGraphData[] = [];
    
    for (let i = 0; i < 24; i++) {
      const pointTime = new Date(startDate.getTime() + (i * intervalMs));
      
      const dataPoint: TemperatureGraphData = {
        time: formatTimeForDisplay(pointTime),
        timestamp: pointTime
      };
      
      // For each silo, find the closest reading to this time point
      siloNumbers.forEach(siloNum => {
        const closestReading = findClosestReading(historicalData, siloNum, pointTime);
        
        if (closestReading) {
          // Check if the closest reading is within a reasonable time window
          const timeDiff = Math.abs(closestReading.timestamp.getTime() - pointTime.getTime());
          const maxAllowedDiff = intervalMs * 0.5; // Allow readings within half an interval
          
          if (timeDiff <= maxAllowedDiff) {
            dataPoint[`silo_${siloNum}`] = closestReading.maxTemp;
          } else {
            // No reading within reasonable time window - show as null/zero
            dataPoint[`silo_${siloNum}`] = null;
          }
        } else {
          // No readings found for this silo - show as null/zero
          dataPoint[`silo_${siloNum}`] = null;
        }
      });
      
      graphData.push(dataPoint);
    }
    
    // Log statistics about data coverage
    const totalPoints = graphData.length * siloNumbers.length;
    const nullPoints = graphData.reduce((count, point) => {
      return count + siloNumbers.filter(silo => point[`silo_${silo}`] === null).length;
    }, 0);
    const coveragePercent = ((totalPoints - nullPoints) / totalPoints * 100).toFixed(1);
    
    console.log(`Graph data generated: ${graphData.length} time points, ${coveragePercent}% data coverage`);
    console.log(`Missing data points: ${nullPoints}/${totalPoints}`);
    
    return graphData;
    
  } catch (error) {
    console.error('Error generating temperature graph data:', error);
    throw error;
  }
}

/**
 * Find the closest reading for a specific silo to a target timestamp
 */
function findClosestReading(
  historicalData: HistoricalSiloData[], 
  siloNumber: number, 
  targetTime: Date
): HistoricalSiloData | null {
  const siloReadings = historicalData.filter(record => record.siloNumber === siloNumber);
  
  if (siloReadings.length === 0) {
    return null;
  }
  
  // Find the reading with minimum time difference
  let closestReading = siloReadings[0];
  let minTimeDiff = Math.abs(closestReading.timestamp.getTime() - targetTime.getTime());
  
  for (let i = 1; i < siloReadings.length; i++) {
    const timeDiff = Math.abs(siloReadings[i].timestamp.getTime() - targetTime.getTime());
    if (timeDiff < minTimeDiff) {
      minTimeDiff = timeDiff;
      closestReading = siloReadings[i];
    }
  }
  
  return closestReading;
}

/**
 * Generate silo report data from real API
 */
export async function generateSiloReportData(
  siloNumber: number,
  startDate: Date,
  endDate: Date
): Promise<SiloReportRecord[]> {
  try {
    const historicalData = await fetchSingleSiloHistoricalData(siloNumber, startDate, endDate);
    
    return historicalData.map(record => ({
      timestamp: record.timestamp,
      timeString: formatTimeForReport(record.timestamp),
      maxTemp: record.maxTemp,
      avgTemp: record.avgTemp,
      minTemp: record.minTemp,
      alertStatus: record.alertLevel,
      sensors: record.sensors
    }));
    
  } catch (error) {
    console.error('Error generating silo report data:', error);
    throw error;
  }
}

/**
 * Get alarmed silos from real API data
 */
export async function getAlarmedSilosFromApi(
  siloNumbers: number[],
  startDate: Date,
  endDate: Date
): Promise<Array<{ number: number; status: string; lastAlertTime?: Date }>> {
  try {
    const historicalData = await fetchHistoricalSiloData(siloNumbers, startDate, endDate);
    
    // Group by silo and find latest alert status
    const siloAlerts = new Map<number, { status: string; timestamp: Date }>();
    
    historicalData.forEach(record => {
      if (record.alertLevel !== 'Normal') {
        const existing = siloAlerts.get(record.siloNumber);
        if (!existing || record.timestamp > existing.timestamp) {
          siloAlerts.set(record.siloNumber, {
            status: record.alertLevel,
            timestamp: record.timestamp
          });
        }
      }
    });
    
    return Array.from(siloAlerts.entries()).map(([siloNumber, alert]) => ({
      number: siloNumber,
      status: alert.status,
      lastAlertTime: alert.timestamp
    }));
    
  } catch (error) {
    console.error('Error getting alarmed silos from API:', error);
    throw error;
  }
}

/**
 * Process API response into internal historical data format
 */
function processHistoricalApiResponse(apiData: RealSiloApiResponse): HistoricalSiloData {
  // Extract sensor readings
  const sensors = [
    apiData.level_0, apiData.level_1, apiData.level_2, apiData.level_3,
    apiData.level_4, apiData.level_5, apiData.level_6, apiData.level_7
  ];
  
  // Extract sensor colors
  const sensorColors = [
    apiData.color_0, apiData.color_1, apiData.color_2, apiData.color_3,
    apiData.color_4, apiData.color_5, apiData.color_6, apiData.color_7
  ];
  
  // Calculate temperature statistics
  const maxTemp = Math.max(...sensors);
  const avgTemp = sensors.reduce((sum, temp) => sum + temp, 0) / sensors.length;
  const minTemp = Math.min(...sensors);
  
  // Determine alert level based on max temperature
  let alertLevel: 'Normal' | 'Warning' | 'Critical' = 'Normal';
  if (maxTemp > TEMP_THRESHOLDS.CRITICAL) {
    alertLevel = 'Critical';
  } else if (maxTemp >= TEMP_THRESHOLDS.WARNING) {
    alertLevel = 'Warning';
  }
  
  return {
    siloNumber: apiData.silo_number,
    timestamp: new Date(apiData.timestamp),
    sensors: sensors,
    sensorColors: sensorColors,
    siloColor: apiData.silo_color,
    maxTemp: Math.round(maxTemp * 100) / 100,
    avgTemp: Math.round(avgTemp * 100) / 100,
    minTemp: Math.round(minTemp * 100) / 100,
    alertLevel: alertLevel
  };
}

/**
 * Format date for API request (ISO format without milliseconds)
 */
function formatDateForApi(date: Date): string {
  return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm format
}

/**
 * Format time for display in graphs
 */
function formatTimeForDisplay(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

/**
 * Format time for reports
 */
function formatTimeForReport(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

/**
 * Get available date range from API (for validation)
 */
export async function getAvailableDateRange(): Promise<{ start: Date; end: Date } | null> {
  try {
    // Fetch a small sample to determine available date range
    const sampleUrl = `${API_BASE_URL}${API_ENDPOINT}?silo_number=1&start=2025-01-01T00:00&end=2025-12-31T23:59`;
    
    const response = await fetch(sampleUrl);
    if (!response.ok) return null;
    
    const data: RealSiloApiResponse[] = await response.json();
    if (data.length === 0) return null;
    
    const timestamps = data.map(record => new Date(record.timestamp));
    const start = new Date(Math.min(...timestamps.map(d => d.getTime())));
    const end = new Date(Math.max(...timestamps.map(d => d.getTime())));
    
    return { start, end };
    
  } catch (error) {
    console.error('Error getting available date range:', error);
    return null;
  }
}

// Export utility functions for external use
export {
  formatDateForApi,
  formatTimeForDisplay,
  formatTimeForReport,
  TEMP_THRESHOLDS
};
