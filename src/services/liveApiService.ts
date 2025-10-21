/**
 * Live API Service
 * Fetches real sensor data from the provided API endpoint
 */
import { Silo, SiloGroup, SensorReading } from '../types/silo';
import { Strings } from '../utils/Strings';

// API response type based on the provided sample
interface APISiloResponse {
  silo_group: string;
  silo_number: number;
  cable_number: null;
  level_0: number;
  color_0: string;
  level_1: number;
  color_1: string;
  level_2: number;
  color_2: string;
  level_3: number;
  color_3: string;
  level_4: number;
  color_4: string;
  level_5: number;
  color_5: string;
  level_6: number;
  color_6: string;
  level_7: number;
  color_7: string;
  silo_color: string;
  timestamp: string;
}

// Cylinder silo data with 8 sensor readings each (backward compatibility)
export interface CylinderSilo {
  num: number;          // Silo number
  temp: number;         // Maximum temperature from all sensors
  sensors: number[];    // 8 sensor readings array (legacy format)
}

// Function to fetch live sensor data from the API
export async function fetchLiveSensorData(): Promise<{ topSiloGroups: SiloGroup[]; bottomSiloGroups: SiloGroup[]; cylinderSilos: CylinderSilo[] }> {
  try {
    // Fetch data from the centralized configuration endpoint
    const response = await fetch(`${Strings.BASE_URL}/readings/avg/latest/by-silo-number`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data: APISiloResponse[] = await response.json();
    
    // Process the data into the format expected by the application
    return processApiData(data);
  } catch (error) {
    console.error('Error fetching live sensor data:', error);
    throw error;
  }
}

// Process API data into the application's data structure
function processApiData(apiData: APISiloResponse[]): { topSiloGroups: SiloGroup[]; bottomSiloGroups: SiloGroup[]; cylinderSilos: CylinderSilo[] } {
  // Create silo objects from API data
  const silos = apiData.map(item => {
    // Create sensor readings array
    const sensorValues: number[] = [
      item.level_0,
      item.level_1,
      item.level_2,
      item.level_3,
      item.level_4,
      item.level_5,
      item.level_6,
      item.level_7
    ];
    
    // Convert sensor values to SensorReading objects
    const sensorReadings: SensorReading[] = sensorValues.map((value, index) => ({
      id: `S${index + 1}`,
      temperature: value,
      position: `Sensor ${index + 1}`,
      calibrationStatus: 'calibrated',
      timestamp: new Date(),
      isActive: true
    }));
    
    return {
      num: item.silo_number,
      temp: Math.max(...sensorValues),
      sensors: sensorReadings
    };
  });
  
  // Group silos into top and bottom sections
  const topSilos = silos.filter(silo => silo.num <= 55);
  const bottomSilos = silos.filter(silo => silo.num >= 101 && silo.num <= 195);
  const cylinderSilosData = silos.filter(silo => silo.num >= 201 && silo.num <= 208);
  
  // Convert to CylinderSilo format
  const cylinderSilos: CylinderSilo[] = cylinderSilosData.map(silo => ({
    num: silo.num,
    temp: silo.temp,
    sensors: silo.sensors.map(sensor => sensor.temperature)
  }));
  
  // Create silo groups (simplified structure for now)
  const topSiloGroups: SiloGroup[] = [];
  const bottomSiloGroups: SiloGroup[] = [];
  
  // Group top silos
  if (topSilos.length > 0) {
    topSiloGroups.push({
      topRow: topSilos.slice(0, Math.min(5, topSilos.length)),
      middleRow: topSilos.slice(5, Math.min(10, topSilos.length)),
      bottomRow: topSilos.slice(10, Math.min(15, topSilos.length))
    });
  }
  
  // Group bottom silos
  if (bottomSilos.length > 0) {
    // Split into groups of 5 rows each
    for (let i = 0; i < bottomSilos.length; i += 15) {
      const groupSilos = bottomSilos.slice(i, i + 15);
      bottomSiloGroups.push({
        row1: groupSilos.slice(0, 3),
        row2: groupSilos.slice(3, 8),
        row3: groupSilos.slice(8, 11),
        row4: groupSilos.slice(11, 16),
        row5: [] // Empty for now
      });
    }
  }
  
  return { topSiloGroups, bottomSiloGroups, cylinderSilos };
}

// Function to fetch data for a specific silo
export async function fetchSiloData(siloNumber: number): Promise<Silo | null> {
  try {
    const response = await fetch(`${Strings.BASE_URL}/readings/avg/latest/by-silo-number?silo_number=${siloNumber}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data: APISiloResponse[] = await response.json();
    
    if (data.length === 0) {
      return null;
    }
    
    const item = data[0];
    const sensorValues: number[] = [
      item.level_0,
      item.level_1,
      item.level_2,
      item.level_3,
      item.level_4,
      item.level_5,
      item.level_6,
      item.level_7
    ];
    
    // Convert sensor values to SensorReading objects
    const sensorReadings: SensorReading[] = sensorValues.map((value, index) => ({
      id: `S${index + 1}`,
      temperature: value,
      position: `Sensor ${index + 1}`,
      calibrationStatus: 'calibrated',
      timestamp: new Date(),
      isActive: true
    }));
    
    return {
      num: item.silo_number,
      temp: Math.max(...sensorValues),
      sensors: sensorReadings
    };
  } catch (error) {
    console.error(`Error fetching data for silo ${siloNumber}:`, error);
    return null;
  }
}