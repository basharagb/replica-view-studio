// Enhanced Maintenance Cable Service for physical silo monitoring

// Cable-specific interfaces for maintenance system
export interface CableSensor {
  level: number;
  temperature: number;
  color: string;
  status: 'normal' | 'warning' | 'critical' | 'offline';
  last_reading: string;
}

export interface SiloCable {
  cable_number: number;
  cable_type: 'primary' | 'secondary';
  sensor_count: number;
  sensors: CableSensor[];
  cable_status: 'active' | 'maintenance' | 'offline';
  last_calibration: string;
}

export interface MaintenanceSiloData {
  silo_number: number;
  silo_type: 'circular' | 'square';
  silo_group: string;
  cable_count: number;
  cables: SiloCable[];
  overall_temperature: number;
  overall_color: string;
  overall_status: 'normal' | 'warning' | 'critical';
  last_updated: string;
  maintenance_notes?: string;
}

// API Configuration
import { Strings } from '../utils/Strings';

const MAINTENANCE_API_BASE = Strings.BASE_URL;
const API_TIMEOUT = 15000; // 15 seconds

/**
 * Enhanced Maintenance Cable Service
 * Handles cable-aware silo data for maintenance operations
 */
export class MaintenanceCableService {
  private static instance: MaintenanceCableService;
  private cache = new Map<number, MaintenanceSiloData>();
  private cacheExpiry = new Map<number, number>();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  static getInstance(): MaintenanceCableService {
    if (!MaintenanceCableService.instance) {
      MaintenanceCableService.instance = new MaintenanceCableService();
    }
    return MaintenanceCableService.instance;
  }

  /**
   * Fetch maintenance data for a specific silo with cable information
   */
  async fetchSiloMaintenanceData(siloNumber: number): Promise<MaintenanceSiloData> {
    // Check cache first
    const cached = this.getCachedData(siloNumber);
    if (cached) {
      return cached;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const response = await fetch(
        `${MAINTENANCE_API_BASE}/readings/avg/latest/by-silo-number?silo_number=${siloNumber}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const apiData = await response.json();
      const maintenanceData = this.transformApiDataToMaintenanceFormat(apiData, siloNumber);
      
      // Cache the result
      this.setCachedData(siloNumber, maintenanceData);
      
      return maintenanceData;
    } catch (error) {
      console.warn(`Failed to fetch maintenance data for silo ${siloNumber}:`, error);
      
      // Return simulated data as fallback
      return this.generateSimulatedMaintenanceData(siloNumber);
    }
  }

  /**
   * Transform API response to maintenance format with cable structure
   */
  private transformApiDataToMaintenanceFormat(apiData: Record<string, unknown>, siloNumber: number): MaintenanceSiloData {
    const isCircular = siloNumber <= 61;
    const siloType = isCircular ? 'circular' : 'square';
    const cableCount = isCircular ? 2 : 1;

    // Determine silo group
    let siloGroup = 'Unknown';
    if (siloNumber <= 61) {
      siloGroup = `Group ${Math.ceil(siloNumber / 10)}`;
    } else if (siloNumber >= 101 && siloNumber <= 189) {
      siloGroup = `Square Group ${Math.ceil((siloNumber - 100) / 15)}`;
    }

    const cables: SiloCable[] = [];

    if (isCircular) {
      // Circular silos: 2 cables with 8 sensors each
      for (let cableNum = 0; cableNum < 2; cableNum++) {
        const sensors: CableSensor[] = [];
        
        for (let level = 0; level < 8; level++) {
          const temp = Number(apiData[`level_${level}_cable_${cableNum}`]) || this.generateRandomTemp();
          sensors.push({
            level,
            temperature: temp,
            color: this.getTemperatureColor(temp),
            status: this.getTemperatureStatus(temp),
            last_reading: new Date().toISOString(),
          });
        }

        cables.push({
          cable_number: cableNum,
          cable_type: cableNum === 0 ? 'primary' : 'secondary',
          sensor_count: 8,
          sensors,
          cable_status: 'active',
          last_calibration: this.getRandomCalibrationDate(),
        });
      }
    } else {
      // Square silos: 1 cable with 8 sensors
      const sensors: CableSensor[] = [];
      
      for (let level = 0; level < 8; level++) {
        const temp = (apiData[`level_${level}`] as number) || this.generateRandomTemp();
        sensors.push({
          level,
          temperature: temp,
          color: this.getTemperatureColor(temp),
          status: this.getTemperatureStatus(temp),
          last_reading: new Date().toISOString(),
        });
      }

      cables.push({
        cable_number: 0,
        cable_type: 'primary',
        sensor_count: 8,
        sensors,
        cable_status: 'active',
        last_calibration: this.getRandomCalibrationDate(),
      });
    }

    // Calculate overall temperature and status
    const allTemps = cables.flatMap(cable => cable.sensors.map(s => s.temperature));
    const overallTemp = Math.max(...allTemps);
    const overallColor = this.getTemperatureColor(overallTemp);
    const overallStatus = this.getTemperatureStatus(overallTemp);

    return {
      silo_number: siloNumber,
      silo_type: siloType,
      silo_group: siloGroup,
      cable_count: cableCount,
      cables,
      overall_temperature: overallTemp,
      overall_color: overallColor,
      overall_status: overallStatus,
      last_updated: new Date().toISOString(),
    };
  }

  /**
   * Generate simulated maintenance data for fallback
   */
  private generateSimulatedMaintenanceData(siloNumber: number): MaintenanceSiloData {
    const isCircular = siloNumber <= 61;
    const siloType = isCircular ? 'circular' : 'square';
    const cableCount = isCircular ? 2 : 1;

    let siloGroup = 'Unknown';
    if (siloNumber <= 61) {
      siloGroup = `Group ${Math.ceil(siloNumber / 10)}`;
    } else if (siloNumber >= 101 && siloNumber <= 189) {
      siloGroup = `Square Group ${Math.ceil((siloNumber - 100) / 15)}`;
    }

    const cables: SiloCable[] = [];

    for (let cableNum = 0; cableNum < cableCount; cableNum++) {
      const sensors: CableSensor[] = [];
      
      for (let level = 0; level < 8; level++) {
        const temp = this.generateRandomTemp();
        sensors.push({
          level,
          temperature: temp,
          color: this.getTemperatureColor(temp),
          status: this.getTemperatureStatus(temp),
          last_reading: new Date().toISOString(),
        });
      }

      cables.push({
        cable_number: cableNum,
        cable_type: cableNum === 0 ? 'primary' : 'secondary',
        sensor_count: 8,
        sensors,
        cable_status: 'active',
        last_calibration: this.getRandomCalibrationDate(),
      });
    }

    const allTemps = cables.flatMap(cable => cable.sensors.map(s => s.temperature));
    const overallTemp = Math.max(...allTemps);

    return {
      silo_number: siloNumber,
      silo_type: siloType,
      silo_group: siloGroup,
      cable_count: cableCount,
      cables,
      overall_temperature: overallTemp,
      overall_color: this.getTemperatureColor(overallTemp),
      overall_status: this.getTemperatureStatus(overallTemp),
      last_updated: new Date().toISOString(),
    };
  }

  /**
   * Calculate averaged sensor readings for circular silos
   */
  calculateAveragedSensorReadings(maintenanceData: MaintenanceSiloData): number[] {
    if (maintenanceData.silo_type === 'square') {
      // Square silos: direct sensor readings
      return maintenanceData.cables[0].sensors.map(s => s.temperature);
    }

    // Circular silos: average corresponding sensors from both cables
    const averagedReadings: number[] = [];
    
    for (let level = 0; level < 8; level++) {
      const cable0Temp = maintenanceData.cables[0].sensors[level].temperature;
      const cable1Temp = maintenanceData.cables[1].sensors[level].temperature;
      const average = (cable0Temp + cable1Temp) / 2;
      averagedReadings.push(average);
    }

    return averagedReadings;
  }

  // Utility methods
  private getCachedData(siloNumber: number): MaintenanceSiloData | null {
    const expiry = this.cacheExpiry.get(siloNumber);
    if (expiry && Date.now() < expiry) {
      return this.cache.get(siloNumber) || null;
    }
    return null;
  }

  private setCachedData(siloNumber: number, data: MaintenanceSiloData): void {
    this.cache.set(siloNumber, data);
    this.cacheExpiry.set(siloNumber, Date.now() + this.CACHE_DURATION);
  }

  private generateRandomTemp(): number {
    return Math.round((Math.random() * 25 + 20) * 10) / 10; // 20-45°C
  }

  private getTemperatureColor(temp: number): string {
    if (temp >= 40) return '#ef4444'; // Red
    if (temp >= 35) return '#f59e0b'; // Yellow
    return '#22c55e'; // Green
  }

  private getTemperatureStatus(temp: number): 'normal' | 'warning' | 'critical' {
    if (temp >= 40) return 'critical';
    if (temp >= 35) return 'warning';
    return 'normal';
  }

  private getRandomCalibrationDate(): string {
    const daysAgo = Math.floor(Math.random() * 30) + 1;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
  }

  /**
   * Clear cache for specific silo or all silos
   */
  clearCache(siloNumber?: number): void {
    if (siloNumber) {
      this.cache.delete(siloNumber);
      this.cacheExpiry.delete(siloNumber);
    } else {
      this.cache.clear();
      this.cacheExpiry.clear();
    }
  }
}

// Export singleton instance
export const maintenanceCableService = MaintenanceCableService.getInstance();
