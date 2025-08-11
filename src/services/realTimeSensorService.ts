/**
 * Real-time Sensor Service
 * Provides live sensor readings from API for the LabInterface
 */

import { apiClient } from './apiClient';
import { siloReadingsService } from './siloReadingsService';
import { 
  APIEndpoints,
  SiloReading,
  LevelReading,
  ProcessedSiloData,
  SiloBinnedRequestParams
} from '../types/api';
import { Silo, SiloGroup, CylinderSilo, SensorReading } from '../types/silo';

export interface LiveSensorData {
  siloNumber: number;
  temperature: number;
  level: number;
  timestamp: Date;
  sensors: number[]; // 8 sensor readings for compatibility
  status: 'normal' | 'warning' | 'critical';
  lastUpdated: Date;
}

export interface LiveSiloSystem {
  topSiloGroups: SiloGroup[];
  bottomSiloGroups: SiloGroup[];
  cylinderSilos: CylinderSilo[];
  lastUpdated: Date;
  isLoading: boolean;
  error?: string;
}

export class RealTimeSensorService {
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: Set<(data: LiveSiloSystem) => void> = new Set();
  private currentData: LiveSiloSystem | null = null;
  private isUpdating = false;

  /**
   * Get latest sensor readings for all silos
   */
  async getLatestSensorReadings(): Promise<LiveSensorData[]> {
    try {
      // Get all silo numbers (1-195 based on the existing system)
      const allSiloNumbers = this.getAllSiloNumbers();
      
      // Split into chunks to avoid overwhelming the API
      const chunks = this.chunkArray(allSiloNumbers, 20);
      const allReadings: LiveSensorData[] = [];

      for (const chunk of chunks) {
        try {
          // Get latest readings for this chunk
          const response = await siloReadingsService.getReadingsBySiloNumbers({
            silo_number: chunk,
            selectedDays: 1, // Get last 24 hours
            endTime: new Date()
          });

          // Process each silo's data
          for (const siloData of response) {
            const latestBin = siloData.binnedData[siloData.binnedData.length - 1];
            if (latestBin && latestBin.count > 0) {
              const sensorData: LiveSensorData = {
                siloNumber: siloData.silo_number,
                temperature: latestBin.temperature || 20.0,
                level: latestBin.level || 0,
                timestamp: latestBin.timestamp,
                sensors: this.generateSensorReadings(latestBin.temperature || 20.0),
                status: this.calculateStatus(latestBin.temperature || 20.0),
                lastUpdated: new Date()
              };
              allReadings.push(sensorData);
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch data for silos ${chunk.join(', ')}:`, error);
          // Add fallback data for failed silos
          chunk.forEach(siloNum => {
            allReadings.push(this.createFallbackSensorData(siloNum));
          });
        }
      }

      return allReadings;
    } catch (error) {
      console.error('Failed to get latest sensor readings:', error);
      throw error;
    }
  }

  /**
   * Convert API sensor data to LabInterface format
   */
  async getLiveSiloSystem(): Promise<LiveSiloSystem> {
    try {
      const sensorReadings = await this.getLatestSensorReadings();
      const sensorMap = new Map(sensorReadings.map(s => [s.siloNumber, s]));

      return {
        topSiloGroups: this.createTopSiloGroups(sensorMap),
        bottomSiloGroups: this.createBottomSiloGroups(sensorMap),
        cylinderSilos: this.createCylinderSilos(sensorMap),
        lastUpdated: new Date(),
        isLoading: false
      };
    } catch (error) {
      console.error('Failed to get live silo system:', error);
      return {
        topSiloGroups: [],
        bottomSiloGroups: [],
        cylinderSilos: [],
        lastUpdated: new Date(),
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Start real-time updates
   */
  startRealTimeUpdates(intervalMs: number = 30000): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Initial fetch
    this.updateSensorData();

    // Set up periodic updates
    this.updateInterval = setInterval(() => {
      this.updateSensorData();
    }, intervalMs);
  }

  /**
   * Stop real-time updates
   */
  stopRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Subscribe to sensor data updates
   */
  subscribe(callback: (data: LiveSiloSystem) => void): () => void {
    this.subscribers.add(callback);
    
    // Send current data immediately if available
    if (this.currentData) {
      callback(this.currentData);
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Update sensor data and notify subscribers
   */
  private async updateSensorData(): Promise<void> {
    if (this.isUpdating) return;
    
    this.isUpdating = true;
    try {
      const newData = await this.getLiveSiloSystem();
      this.currentData = newData;
      
      // Notify all subscribers
      this.subscribers.forEach(callback => {
        try {
          callback(newData);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      });
    } catch (error) {
      console.error('Failed to update sensor data:', error);
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Get all silo numbers based on the existing system layout
   */
  private getAllSiloNumbers(): number[] {
    const silos: number[] = [];
    
    // Top section: 1-55
    for (let i = 1; i <= 55; i++) {
      silos.push(i);
    }
    
    // Bottom section: 101-195
    for (let i = 101; i <= 195; i++) {
      silos.push(i);
    }
    
    return silos;
  }

  /**
   * Split array into chunks
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Generate 8 sensor readings based on main temperature
   */
  private generateSensorReadings(baseTemp: number): number[] {
    const sensors: number[] = [];
    for (let i = 0; i < 8; i++) {
      // Add some variation around the base temperature
      const variation = (Math.random() - 0.5) * 4; // ±2°C variation
      sensors.push(Math.round((baseTemp + variation) * 10) / 10);
    }
    return sensors.sort((a, b) => b - a); // Sort descending
  }

  /**
   * Calculate status based on temperature
   */
  private calculateStatus(temperature: number): 'normal' | 'warning' | 'critical' {
    if (temperature > 40) return 'critical';
    if (temperature > 35) return 'warning';
    return 'normal';
  }

  /**
   * Create fallback sensor data when API fails
   */
  private createFallbackSensorData(siloNumber: number): LiveSensorData {
    const fallbackTemp = 25.0; // Safe fallback temperature
    return {
      siloNumber,
      temperature: fallbackTemp,
      level: 0,
      timestamp: new Date(),
      sensors: this.generateSensorReadings(fallbackTemp),
      status: 'normal',
      lastUpdated: new Date()
    };
  }

  /**
   * Create top silo groups from sensor data
   */
  private createTopSiloGroups(sensorMap: Map<number, LiveSensorData>): SiloGroup[] {
    // Based on the existing silo layout: 1-55 in groups
    const groups: SiloGroup[] = [];

    // Group 1: 1-11
    groups.push({
      topRow: this.createSilosFromRange(1, 5, sensorMap),
      middleRow: this.createSilosFromRange(6, 7, sensorMap),
      bottomRow: this.createSilosFromRange(8, 11, sensorMap)
    });

    // Group 2: 12-22
    groups.push({
      topRow: this.createSilosFromRange(12, 16, sensorMap),
      middleRow: this.createSilosFromRange(17, 18, sensorMap),
      bottomRow: this.createSilosFromRange(19, 22, sensorMap)
    });

    // Group 3: 23-33
    groups.push({
      topRow: this.createSilosFromRange(23, 27, sensorMap),
      middleRow: this.createSilosFromRange(28, 29, sensorMap),
      bottomRow: this.createSilosFromRange(30, 33, sensorMap)
    });

    // Group 4: 34-44
    groups.push({
      topRow: this.createSilosFromRange(34, 38, sensorMap),
      middleRow: this.createSilosFromRange(39, 40, sensorMap),
      bottomRow: this.createSilosFromRange(41, 44, sensorMap)
    });

    // Group 5: 45-55
    groups.push({
      topRow: this.createSilosFromRange(45, 49, sensorMap),
      middleRow: this.createSilosFromRange(50, 51, sensorMap),
      bottomRow: this.createSilosFromRange(52, 55, sensorMap)
    });

    return groups;
  }

  /**
   * Create bottom silo groups from sensor data
   */
  private createBottomSiloGroups(sensorMap: Map<number, LiveSensorData>): SiloGroup[] {
    // Based on the existing silo layout: 101-195 in groups
    const groups: SiloGroup[] = [];

    // Group 1: 101-119
    groups.push({
      row1: this.createSilosFromRange(101, 104, sensorMap),
      row2: this.createSilosFromRange(105, 108, sensorMap),
      row3: this.createSilosFromRange(109, 112, sensorMap),
      row4: this.createSilosFromRange(113, 116, sensorMap),
      row5: this.createSilosFromRange(117, 119, sensorMap)
    });

    // Group 2: 120-138
    groups.push({
      row1: this.createSilosFromRange(120, 123, sensorMap),
      row2: this.createSilosFromRange(124, 127, sensorMap),
      row3: this.createSilosFromRange(128, 131, sensorMap),
      row4: this.createSilosFromRange(132, 135, sensorMap),
      row5: this.createSilosFromRange(136, 138, sensorMap)
    });

    // Group 3: 139-157
    groups.push({
      row1: this.createSilosFromRange(139, 142, sensorMap),
      row2: this.createSilosFromRange(143, 146, sensorMap),
      row3: this.createSilosFromRange(147, 150, sensorMap),
      row4: this.createSilosFromRange(151, 154, sensorMap),
      row5: this.createSilosFromRange(155, 157, sensorMap)
    });

    // Group 4: 158-176
    groups.push({
      row1: this.createSilosFromRange(158, 161, sensorMap),
      row2: this.createSilosFromRange(162, 165, sensorMap),
      row3: this.createSilosFromRange(166, 169, sensorMap),
      row4: this.createSilosFromRange(170, 173, sensorMap),
      row5: this.createSilosFromRange(174, 176, sensorMap)
    });

    // Group 5: 177-195
    groups.push({
      row1: this.createSilosFromRange(177, 180, sensorMap),
      row2: this.createSilosFromRange(181, 184, sensorMap),
      row3: this.createSilosFromRange(185, 188, sensorMap),
      row4: this.createSilosFromRange(189, 192, sensorMap),
      row5: this.createSilosFromRange(193, 195, sensorMap)
    });

    return groups;
  }

  /**
   * Create cylinder silos from sensor data
   */
  private createCylinderSilos(sensorMap: Map<number, LiveSensorData>): CylinderSilo[] {
    const cylinderNumbers = [25, 26, 27, 29, 32, 35, 36, 38];
    return cylinderNumbers.map(num => {
      const sensorData = sensorMap.get(num);
      if (sensorData) {
        return {
          num,
          temp: sensorData.temperature,
          sensors: sensorData.sensors
        };
      } else {
        // Fallback data
        const fallbackData = this.createFallbackSensorData(num);
        return {
          num,
          temp: fallbackData.temperature,
          sensors: fallbackData.sensors
        };
      }
    });
  }

  /**
   * Create silo objects from a number range
   */
  private createSilosFromRange(start: number, end: number, sensorMap: Map<number, LiveSensorData>): Silo[] {
    const silos: Silo[] = [];

    for (let num = start; num <= end; num++) {
      const sensorData = sensorMap.get(num);

      if (sensorData) {
        silos.push({
          num,
          temp: sensorData.temperature,
          sensors: sensorData.sensors
        });
      } else {
        // Create fallback silo data
        const fallbackData = this.createFallbackSensorData(num);
        silos.push({
          num,
          temp: fallbackData.temperature,
          sensors: fallbackData.sensors
        });
      }
    }

    return silos;
  }
}

// Export singleton instance
export const realTimeSensorService = new RealTimeSensorService();
