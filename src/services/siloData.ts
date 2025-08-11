import { Silo, SiloGroup, TemperatureColor, SensorReading, AlertLevel, TemperatureTrend, TemperatureMonitoringState } from '../types/silo';
import { getSiloData, isSiloDataLoaded, WHEAT_COLOR, convertApiColorToTemperatureColor } from './realSiloApiService';

// Temperature threshold constants for silo monitoring system
export const TEMPERATURE_THRESHOLDS = {
  GREEN_MIN: 20.0,      // Green: Low readings (20 to <35)
  GREEN_MAX: 34.99,     // Green: Low readings (20 to <35)
  YELLOW_MIN: 35.0,     // Yellow: Medium readings (35 to 40)
  YELLOW_MAX: 40.0,     // Yellow: Medium readings (35 to 40)
  RED_MIN: 40.01,       // Red: High readings (>40)
} as const;

// Temperature range for random generation (20-50°C)
export const TEMP_RANGE = {
  MIN: 20.0,
  MAX: 50.0,
} as const;

// Cylinder silo data with 8 sensor readings each (backward compatibility)
export interface CylinderSilo {
  num: number;          // Silo number
  temp: number;         // Maximum temperature from all sensors
  sensors: number[];    // 8 sensor readings array (legacy format)
}

// Enhanced cylinder silo with detailed sensor metadata (future use)
export interface EnhancedCylinderSilo extends Silo {
  sensorReadings: number[];  // Legacy sensor readings array
  enhancedSensors?: SensorReading[];  // Optional enhanced sensor data
}

// Generate random temperature using defined range
const generateRandomTemp = (): number => {
  const range = TEMP_RANGE.MAX - TEMP_RANGE.MIN;
  return Math.round((Math.random() * range + TEMP_RANGE.MIN) * 10) / 10; // 20.0 to 50.0
};

// Sensor position descriptions for 8 sensors
const SENSOR_POSITIONS = [
  'Top-North', 'Top-East', 'Mid-North', 'Mid-East', 
  'Mid-South', 'Mid-West', 'Bottom-South', 'Bottom-West'
] as const;

// Generate enhanced sensor reading with metadata
const generateEnhancedSensorReading = (temperature: number, index: number): SensorReading => {
  const now = new Date();
  return {
    id: `S${index + 1}`,
    temperature,
    position: SENSOR_POSITIONS[index],
    calibrationStatus: Math.random() > 0.95 ? 'needs_calibration' : 'calibrated',
    timestamp: new Date(now.getTime() - Math.random() * 300000), // Random time within last 5 minutes
    isActive: Math.random() > 0.02 // 98% uptime
  };
};

// Generate enhanced sensor readings array
export const generateEnhancedSensorReadings = (baseTemp: number): SensorReading[] => {
  const readings = generateSensorReadings(baseTemp);
  return readings.map((temp, index) => generateEnhancedSensorReading(temp, index));
};

// Generate 8 sensor readings for any silo and return sorted (highest to lowest)
export const generateSensorReadings = (baseTemp: number): number[] => {
  const variance = 2.0; // Temperature variance range
  const readings = Array.from({ length: 8 }, () => {
    const offset = (Math.random() - 0.5) * 2 * variance;
    return Math.round((baseTemp + offset) * 10) / 10; // Round to 1 decimal
  });
  
  // Sort from highest to lowest (S1 = highest, S8 = lowest)
  return readings.sort((a, b) => b - a);
};

// Generate silo with wheat color (unloaded state) - all sensors zero
const generateWheatSilo = (num: number): Silo => {
  return {
    num,
    temp: 0 // Zero temperature for wheat color state
  };
};

// Generate silo with 8 sensors and calculate temperature using priority hierarchy
const generateSiloWithSensors = (num: number): Silo => {
  // First check if we have real API data
  const apiData = getSiloData(num);
  if (apiData.isLoaded) {
    return {
      num,
      temp: apiData.maxTemp
    };
  }
  
  // If not loaded from API, return wheat color silo (zero temperature)
  if (!isSiloDataLoaded(num)) {
    return generateWheatSilo(num);
  }
  
  // Fallback to random generation (legacy behavior)
  const baseTemp = generateRandomTemp();
  const sensors = generateSensorReadings(baseTemp);
  const siloStatus = calculateSiloStatus(sensors);
  
  return {
    num,
    temp: siloStatus.temperature // Silo temperature is the MAX of all 8 sensors
  };
};

// Generate random silo data for a group
const generateSiloGroup = (siloNumbers: number[]): Silo[] => {
  return siloNumbers.map(num => generateSiloWithSensors(num));
};

// Generate top section silo groups
const generateTopSiloGroups = (): SiloGroup[] => {
  return [
    // Group 1 (leftmost)
    {
      topRow: generateSiloGroup([55, 51, 47]),
      middleRow: generateSiloGroup([54, 52, 50, 48, 46]),
      bottomRow: generateSiloGroup([53, 49, 45])
    },
    // Group 2
    {
      topRow: generateSiloGroup([44, 40, 36]),
      middleRow: generateSiloGroup([43, 41, 39, 37, 35]),
      bottomRow: generateSiloGroup([42, 38, 34])
    },
    // Group 3
    {
      topRow: generateSiloGroup([33, 29, 25]),
      middleRow: generateSiloGroup([32, 30, 28, 26, 24]),
      bottomRow: generateSiloGroup([31, 27, 23])
    },
    // Group 4
    {
      topRow: generateSiloGroup([22, 18, 14]),
      middleRow: generateSiloGroup([21, 19, 17, 15, 13]),
      bottomRow: generateSiloGroup([20, 16, 12])
    },
    // Group 5 (rightmost)
    {
      topRow: generateSiloGroup([11, 7, 3]),
      middleRow: generateSiloGroup([10, 8, 6, 4, 2]),
      bottomRow: generateSiloGroup([9, 5, 1])
    }
  ];
};

// Generate bottom section silo groups
const generateBottomSiloGroups = (): SiloGroup[] => {
  return [
    // Group 1 (leftmost)
    {
      row1: generateSiloGroup([195, 188, 181]),
      row2: generateSiloGroup([194, 190, 187, 183, 180]),
      row3: generateSiloGroup([193, 186, 179]),
      row4: generateSiloGroup([192, 189, 185, 182, 178]),
      row5: generateSiloGroup([191, 184, 177])
    },
    // Group 2
    {
      row1: generateSiloGroup([176, 169, 162]),
      row2: generateSiloGroup([175, 171, 168, 164, 161]),
      row3: generateSiloGroup([174, 167, 160]),
      row4: generateSiloGroup([173, 170, 166, 163, 159]),
      row5: generateSiloGroup([172, 165, 158])
    },
    // Group 3
    {
      row1: generateSiloGroup([157, 150, 143]),
      row2: generateSiloGroup([156, 152, 149, 145, 142]),
      row3: generateSiloGroup([155, 148, 141]),
      row4: generateSiloGroup([154, 151, 147, 144, 140]),
      row5: generateSiloGroup([153, 146, 139])
    },
    // Group 4
    {
      row1: generateSiloGroup([138, 131, 124]),
      row2: generateSiloGroup([137, 133, 130, 126, 123]),
      row3: generateSiloGroup([136, 129, 122]),
      row4: generateSiloGroup([135, 132, 128, 125, 121]),
      row5: generateSiloGroup([134, 127, 120])
    },
    // Group 5 (rightmost) - contains selected silo 112
    {
      row1: generateSiloGroup([119, 112, 105]),
      row2: generateSiloGroup([118, 114, 111, 107, 104]),
      row3: generateSiloGroup([117, 110, 103]),
      row4: generateSiloGroup([116, 113, 109, 106, 102]),
      row5: generateSiloGroup([115, 108, 101])
    }
  ];
};

// Generate cylinder silos
const generateCylinderSilos = (): CylinderSilo[] => {
  const cylinderNumbers = [25, 26, 27, 29, 32, 35, 36, 38];
  return cylinderNumbers.map(num => {
    const baseTemp = generateRandomTemp();
    const sensors = generateSensorReadings(baseTemp);
    const maxTemp = Math.max(...sensors);
    
    return {
      num,
      temp: maxTemp, // Silo temperature is MAX of all sensors
      sensors: sensors
    };
  });
};

// Mutable data structures that can be updated
export let topSiloGroups: SiloGroup[] = [
  {
    topRow: [{ num: 55, temp: 42.5 }, { num: 51, temp: 41.8 }, { num: 47, temp: 44.2 }],
    middleRow: [{ num: 54, temp: 43.1 }, { num: 52, temp: 45.3 }, { num: 50, temp: 42.4 }, { num: 48, temp: 37.2 }, { num: 46, temp: 31.8 }],
    bottomRow: [{ num: 53, temp: 39.1 }, { num: 49, temp: 33.7 }, { num: 45, temp: 28.3 }]
  },
  {
    topRow: [{ num: 44, temp: 45.3 }, { num: 40, temp: 40.8 }, { num: 36, temp: 43.1 }],
    middleRow: [{ num: 43, temp: 41.7 }, { num: 41, temp: 42.8 }, { num: 39, temp: 44.1 }, { num: 37, temp: 38.7 }, { num: 35, temp: 34.2 }],
    bottomRow: [{ num: 42, temp: 35.5 }, { num: 38, temp: 39.4 }, { num: 34, temp: 24.8 }]
  },
  {
    topRow: [{ num: 33, temp: 44.6 }, { num: 29, temp: 42.4 }, { num: 25, temp: 40.1 }],
    middleRow: [{ num: 32, temp: 43.9 }, { num: 30, temp: 41.3 }, { num: 28, temp: 45.2 }, { num: 26, temp: 37.8 }, { num: 24, temp: 35.0 }],
    bottomRow: [{ num: 31, temp: 38.2 }, { num: 27, temp: 30.9 }, { num: 23, temp: 26.3 }]
  },
  {
    topRow: [{ num: 22, temp: 43.9 }, { num: 18, temp: 41.3 }, { num: 14, temp: 45.2 }],
    middleRow: [{ num: 21, temp: 40.7 }, { num: 19, temp: 42.8 }, { num: 17, temp: 44.1 }, { num: 15, temp: 39.6 }, { num: 13, temp: 37.4 }],
    bottomRow: [{ num: 20, temp: 34.6 }, { num: 16, temp: 38.9 }, { num: 12, temp: 21.5 }]
  },
  {
    topRow: [{ num: 11, temp: 40.7 }, { num: 7, temp: 42.8 }, { num: 3, temp: 44.1 }],
    middleRow: [{ num: 10, temp: 41.5 }, { num: 8, temp: 43.6 }, { num: 6, temp: 42.1 }, { num: 4, temp: 36.3 }, { num: 2, temp: 39.2 }],
    bottomRow: [{ num: 9, temp: 31.6 }, { num: 5, temp: 37.9 }, { num: 1, temp: 24.9 }]
  }
];

export let bottomSiloGroups: SiloGroup[] = [
  {
    row1: [{ num: 195, temp: 43.2 }, { num: 188, temp: 41.6 }, { num: 181, temp: 44.8 }],
    row2: [{ num: 194, temp: 42.1 }, { num: 190, temp: 45.3 }, { num: 187, temp: 40.9 }, { num: 183, temp: 43.7 }, { num: 180, temp: 41.8 }],
    row3: [{ num: 193, temp: 42.4 }, { num: 186, temp: 38.4 }, { num: 179, temp: 35.7 }],
    row4: [{ num: 192, temp: 37.5 }, { num: 189, temp: 33.4 }, { num: 185, temp: 39.8 }, { num: 182, temp: 36.2 }, { num: 178, temp: 31.5 }],
    row5: [{ num: 191, temp: 32.8 }, { num: 184, temp: 26.9 }, { num: 177, temp: 24.6 }]
  },
  {
    row1: [{ num: 176, temp: 41.8 }, { num: 169, temp: 42.4 }, { num: 162, temp: 44.5 }],
    row2: [{ num: 175, temp: 40.6 }, { num: 171, temp: 43.8 }, { num: 168, temp: 41.3 }, { num: 164, temp: 42.7 }, { num: 161, temp: 44.1 }],
    row3: [{ num: 174, temp: 41.9 }, { num: 167, temp: 38.1 }, { num: 160, temp: 34.9 }],
    row4: [{ num: 173, temp: 39.3 }, { num: 170, temp: 37.6 }, { num: 166, temp: 30.1 }, { num: 163, temp: 36.9 }, { num: 159, temp: 35.2 }],
    row5: [{ num: 172, temp: 38.8 }, { num: 165, temp: 27.2 }, { num: 158, temp: 23.7 }]
  },
  {
    row1: [{ num: 157, temp: 42.7 }, { num: 150, temp: 44.1 }, { num: 143, temp: 41.9 }],
    row2: [{ num: 156, temp: 43.4 }, { num: 152, temp: 40.2 }, { num: 149, temp: 42.3 }, { num: 145, temp: 44.9 }, { num: 142, temp: 41.5 }],
    row3: [{ num: 155, temp: 43.6 }, { num: 148, temp: 39.7 }, { num: 141, temp: 37.3 }],
    row4: [{ num: 154, temp: 38.6 }, { num: 151, temp: 36.7 }, { num: 147, temp: 35.8 }, { num: 144, temp: 35.4 }, { num: 140, temp: 33.9 }],
    row5: [{ num: 153, temp: 31.2 }, { num: 146, temp: 26.3 }, { num: 139, temp: 24.5 }]
  },
  {
    row1: [{ num: 138, temp: 44.9 }, { num: 131, temp: 41.5 }, { num: 124, temp: 43.6 }],
    row2: [{ num: 137, temp: 40.7 }, { num: 133, temp: 42.8 }, { num: 130, temp: 44.3 }, { num: 126, temp: 41.4 }, { num: 123, temp: 42.6 }],
    row3: [{ num: 136, temp: 44.7 }, { num: 129, temp: 39.1 }, { num: 122, temp: 37.8 }],
    row4: [{ num: 135, temp: 38.4 }, { num: 132, temp: 36.1 }, { num: 128, temp: 34.8 }, { num: 125, temp: 39.5 }, { num: 121, temp: 37.2 }],
    row5: [{ num: 134, temp: 33.7 }, { num: 127, temp: 28.6 }, { num: 120, temp: 25.7 }]
  },
  {
    row1: [{ num: 119, temp: 41.4 }, { num: 112, temp: 42.6 }, { num: 105, temp: 44.7 }],
    row2: [{ num: 118, temp: 43.9 }, { num: 114, temp: 40.8 }, { num: 111, temp: 42.1 }, { num: 107, temp: 41.2 }, { num: 104, temp: 43.2 }],
    row3: [{ num: 117, temp: 42.5 }, { num: 110, temp: 38.9 }, { num: 103, temp: 36.3 }],
    row4: [{ num: 116, temp: 39.2 }, { num: 113, temp: 35.6 }, { num: 109, temp: 37.7 }, { num: 106, temp: 34.3 }, { num: 102, temp: 30.5 }],
    row5: [{ num: 115, temp: 33.7 }, { num: 108, temp: 27.8 }, { num: 101, temp: 25.1 }]
  }
];

export let cylinderSilos: CylinderSilo[] = [
  { 
    num: 201, 
    temp: 43.2,
    sensors: [43.2, 42.8, 42.5, 42.1, 41.8, 41.4, 41.1, 40.7]
  },
  { 
    num: 202, 
    temp: 44.8,
    sensors: [44.8, 44.4, 44.1, 43.7, 43.3, 43.0, 42.6, 42.2]
  },
  { 
    num: 203, 
    temp: 41.5,
    sensors: [41.5, 41.1, 40.8, 40.4, 40.1, 39.7, 39.4, 39.0]
  },
  { 
    num: 204, 
    temp: 42.3,
    sensors: [42.3, 41.9, 41.6, 41.2, 40.9, 40.5, 40.2, 39.8]
  },
  { 
    num: 205, 
    temp: 38.4,
    sensors: [38.4, 37.9, 37.6, 37.2, 36.8, 36.5, 36.1, 35.8]
  },
  { 
    num: 206, 
    temp: 39.1,
    sensors: [39.1, 38.7, 38.3, 37.9, 37.5, 37.1, 36.8, 36.4]
  },
  { 
    num: 207, 
    temp: 29.6,
    sensors: [29.6, 29.2, 28.9, 28.5, 28.1, 27.8, 27.4, 27.1]
  },
  { 
    num: 208, 
    temp: 26.7,
    sensors: [26.7, 26.3, 25.9, 25.6, 25.2, 24.8, 24.5, 24.1]
  }
];

// Function to clear sensor readings cache
export const clearSensorReadingsCache = (): void => {
  // Clear all dynamically generated readings but keep the predefined ones
  const keysToKeep = [18, 25, 26, 27, 29, 32, 35, 36, 38, 112];
  Object.keys(predefinedReadings).forEach(key => {
    const numKey = parseInt(key);
    if (!keysToKeep.includes(numKey)) {
      delete predefinedReadings[numKey];
    }
  });
};

// Function to regenerate all silo data
export const regenerateAllSiloData = (): void => {
  topSiloGroups = generateTopSiloGroups();
  bottomSiloGroups = generateBottomSiloGroups();
  cylinderSilos = generateCylinderSilos();
  
  // Clear caches when data changes
  clearSensorReadingsCache();
  clearSiloLookupCache();
  
  // Update predefined readings for cylinder silos
  cylinderSilos.forEach(silo => {
    predefinedReadings[silo.num] = silo.sensors;
  });
};

// Temperature color mapping - Silo monitoring system with priority hierarchy
export const getTemperatureColor = (temp: number): TemperatureColor => {
  // If temperature is 0, return wheat color (unloaded state)
  if (temp === 0) return 'beige';
  
  if (temp >= TEMPERATURE_THRESHOLDS.RED_MIN) return 'pink';
  if (temp >= TEMPERATURE_THRESHOLDS.YELLOW_MIN) return 'yellow';
  return 'green';
};

// Calculate alert level based on temperature - Priority hierarchy
export const getAlertLevel = (temp: number): AlertLevel => {
  if (temp > TEMPERATURE_THRESHOLDS.YELLOW_MAX) return 'critical';    // Red: >40°C (Highest priority)
  if (temp >= TEMPERATURE_THRESHOLDS.YELLOW_MIN) return 'warning';    // Yellow: 30-40°C (Medium priority)
  return 'none';                                                      // Green: <30°C (Lowest priority)
};

// Calculate temperature trend (simplified version - would use historical data in real implementation)
export const getTemperatureTrend = (currentTemp: number, previousTemp?: number): TemperatureTrend => {
  if (!previousTemp) return 'stable';
  const diff = currentTemp - previousTemp;
  if (diff > 1) return 'rising';
  if (diff < -1) return 'falling';
  return 'stable';
};

// Determine silo color based on sensor priority hierarchy
// Priority: Red (>40°C) > Yellow (35-40°C) > Green (<35°C)
export const getSiloColorFromSensors = (sensorReadings: number[]): TemperatureColor => {
  // Check for any red sensors (highest priority)
  const hasRedSensor = sensorReadings.some(temp => temp > TEMPERATURE_THRESHOLDS.YELLOW_MAX);
  if (hasRedSensor) {
    return 'pink'; // Red color
  }
  
  // Check for any yellow sensors (medium priority)
  const hasYellowSensor = sensorReadings.some(temp => 
    temp >= TEMPERATURE_THRESHOLDS.YELLOW_MIN && temp <= TEMPERATURE_THRESHOLDS.YELLOW_MAX
  );
  if (hasYellowSensor) {
    return 'yellow'; // Yellow color
  }
  
  // All sensors are green (lowest priority)
  return 'green'; // Green color
};

// Calculate silo temperature and color based on sensor priority hierarchy
export const calculateSiloStatus = (sensorReadings: number[]) => {
  const maxTemp = Math.max(...sensorReadings);
  const priorityColor = getSiloColorFromSensors(sensorReadings);
  
  return {
    temperature: maxTemp,
    color: priorityColor,
    alertLevel: getAlertLevel(maxTemp)
  };
};

// Get silo color based on silo number using sensor priority hierarchy
export const getSiloColorByNumber = (siloNum: number): TemperatureColor => {
  // First check if we have real API data
  const apiData = getSiloData(siloNum);
  if (apiData.isLoaded) {
    // Use API color directly if available, or convert from API color
    return convertApiColorToTemperatureColor(apiData.siloColor);
  }
  
  // If silo hasn't been fetched yet, return wheat color
  if (!isSiloDataLoaded(siloNum)) {
    return 'beige';
  }
  
  const sensorReadings = getSensorReadings(siloNum);
  return getSiloColorFromSensors(sensorReadings);
};

// Generate temperature monitoring state
export const generateTemperatureMonitoringState = (currentTemp: number, previousTemp?: number): TemperatureMonitoringState => {
  return {
    currentTemp,
    maxTemp: currentTemp, // In real implementation, this would be from historical data
    minTemp: currentTemp, // In real implementation, this would be from historical data
    trend: getTemperatureTrend(currentTemp, previousTemp),
    alertLevel: getAlertLevel(currentTemp),
    lastUpdated: new Date()
  };
};

// Get all silos in order for auto-read functionality
export const getAllSilos = (): Silo[] => {
  const allSilos: Silo[] = [];

  // Add top section silos
  topSiloGroups.forEach((group) => {
    if (group.topRow) group.topRow.forEach(silo => allSilos.push(silo));
    if (group.middleRow) group.middleRow.forEach(silo => allSilos.push(silo));
    if (group.bottomRow) group.bottomRow.forEach(silo => allSilos.push(silo));
  });

  // Add bottom section silos
  bottomSiloGroups.forEach((group) => {
    if (group.row1) group.row1.forEach(silo => allSilos.push(silo));
    if (group.row2) group.row2.forEach(silo => allSilos.push(silo));
    if (group.row3) group.row3.forEach(silo => allSilos.push(silo));
    if (group.row4) group.row4.forEach(silo => allSilos.push(silo));
    if (group.row5) group.row5.forEach(silo => allSilos.push(silo));
  });

  // Add cylinder silos (convert to Silo format)
  cylinderSilos.forEach(silo => {
    const siloData: Silo = {
      num: silo.num,
      temp: silo.temp
      // sensors property is optional in Silo interface
    };
    allSilos.push(siloData);
  });

  // Sort by silo number
  const sortedSilos = allSilos.sort((a, b) => a.num - b.num);
  
  return sortedSilos;
};

let siloLookupMap: Map<number, Silo> | null = null;

const buildSiloLookupMap = (): Map<number, Silo> => {
  const map = new Map<number, Silo>();
  const allSilos = getAllSilos();
  allSilos.forEach(silo => map.set(silo.num, silo));
  return map;
};

// Find silo by number with O(1) lookup
export const findSiloByNumber = (siloNum: number): Silo | null => {
  if (!siloLookupMap) {
    siloLookupMap = buildSiloLookupMap();
  }
  return siloLookupMap.get(siloNum) || null;
};

export const clearSiloLookupCache = (): void => {
  siloLookupMap = null;
};

// Temperature scale values for display - updated for 20-50°C range
export const temperatureScaleValues = [20.0, 25.0, 30.0, 35.0, 40.0, 45.0, 50.0];

// Predefined sensor readings for specific silos - SORTED from highest to lowest
const predefinedReadings: { [key: number]: number[] } = {
  18: [39.6, 39.2, 38.8, 38.4, 38.0, 37.6, 37.2, 36.8], // Sorted highest to lowest - YELLOW (max=39.6)
  25: [44.6, 43.7, 42.9, 42.8, 42.8, 42.1, 42.0, 41.2], // Sorted highest to lowest
  26: [48.4, 47.6, 47.6, 46.8, 46.7, 46.5, 45.9, 45.0], // Sorted highest to lowest
  27: [44.9, 44.8, 44.7, 44.6, 44.5, 44.5, 44.4, 44.3], // Sorted highest to lowest
  29: [43.5, 43.4, 43.3, 43.2, 43.1, 43.1, 43.0, 42.9], // Sorted highest to lowest
  32: [43.6, 42.8, 42.8, 41.9, 41.7, 41.0, 40.1, 39.2], // Sorted highest to lowest
  35: [46.5, 45.7, 45.7, 44.9, 44.8, 44.6, 43.0, 42.1], // Sorted highest to lowest
  36: [50.2, 50.1, 50.0, 49.9, 49.8, 49.8, 49.7, 49.6], // Sorted highest to lowest
  38: [44.4, 44.3, 44.2, 44.1, 44.0, 43.9, 43.8, 43.8], // Sorted highest to lowest
  112: [40.4, 40.3, 40.3, 40.2, 40.1, 40.1, 40.0, 39.9] // Sorted highest to lowest
};

// Get sensor readings for any silo - SORTED from highest to lowest
export const getSensorReadings = (siloNum: number): number[] => {
  // PRIORITY 1: Check if we have real API data (always use API data when available)
  const apiData = getSiloData(siloNum);
  if (apiData.isLoaded) {
    console.log(`Using real API data for silo ${siloNum}:`, apiData.sensors);
    // Return real API sensor readings exactly in S1-S8 order for positional accuracy
    return [...apiData.sensors];
  }
  
  // PRIORITY 2: For silos that haven't been fetched from API yet, show simulated readings
  const silo = findSiloByNumber(siloNum);
  if (!silo) return [0, 0, 0, 0, 0, 0, 0, 0];
  
  // PRIORITY 3: If we have predefined readings, use them (already sorted)
  if (predefinedReadings[siloNum]) {
    console.log(`Using predefined readings for silo ${siloNum}:`, predefinedReadings[siloNum]);
    return predefinedReadings[siloNum];
  }
  
  // PRIORITY 4: Generate realistic sensor readings for silos without predefined data
  const baseTemp = silo.temp === 0 ? 25 + (siloNum % 10) : silo.temp; // Use realistic base temp for wheat silos
  const readings = generateSensorReadings(baseTemp);
  predefinedReadings[siloNum] = readings;
  console.log(`Generated new readings for silo ${siloNum}:`, readings);
  return readings;
};

// Cylinder measurements (from original LabCylinder) - updated for three-tier color demonstration
export const cylinderMeasurements = [23.5, 28.7, 33.2, 37.8, 39.4, 42.1, 44.6, 46.3]; // Green, Green, Green, Yellow, Yellow, Red, Red, Red
