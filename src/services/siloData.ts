import { Silo, SiloGroup, TemperatureColor, SensorReading, AlertLevel, TemperatureTrend, TemperatureMonitoringState } from '../types/silo';
import { realTimeSensorService } from './realTimeSensorService';
import { getSiloData as getApiSiloData, markSiloAsChecked, fetchSiloReadings, SiloData } from './apiService';

// Temperature threshold constants for silo monitoring system
export const TEMPERATURE_THRESHOLDS = {
  GREEN_MIN: 20.0,      // Green: Low readings (20 to <30)
  GREEN_MAX: 29.99,     // Green: Low readings (20 to <30)
  YELLOW_MIN: 30.0,     // Yellow: Medium readings (30 to 40)
  YELLOW_MAX: 40.0,     // Yellow: Medium readings (30 to 40)
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

// Convert API SiloData to Silo format
const convertApiSiloToSilo = (apiSilo: SiloData): Silo => {
  const enhancedSensors = apiSilo.sensors.map((temp, index) => ({
    id: `S${index + 1}`,
    temperature: temp,
    position: SENSOR_POSITIONS[index] || `Sensor ${index + 1}`,
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

// Get silo data with proper format conversion
const getSiloData = (siloNumber: number): Silo => {
  const apiSilo = getApiSiloData(siloNumber);
  return convertApiSiloToSilo(apiSilo);
};

// Generate silo with 8 sensors and calculate temperature using priority hierarchy
const generateSiloWithSensors = (num: number): Silo => {
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

// Correct silo layout based on user's images
// Top section: Circular silos (1-61)
const generateTopSiloGroups = (): SiloGroup[] => {
  return [
    // Group 1 (1-10)
    {
      topRow: [getSiloData(1), getSiloData(2), getSiloData(3)],
      middleRow: [getSiloData(6), getSiloData(7)],
      bottomRow: [getSiloData(8), getSiloData(9), getSiloData(10)]
    },
    // Group 2 (12-21)
    {
      topRow: [getSiloData(12), getSiloData(13), getSiloData(14)],
      middleRow: [getSiloData(17), getSiloData(18)],
      bottomRow: [getSiloData(19), getSiloData(20), getSiloData(21)]
    },
    // Group 3 (23-32)
    {
      topRow: [getSiloData(23), getSiloData(24), getSiloData(25)],
      middleRow: [getSiloData(28), getSiloData(29)],
      bottomRow: [getSiloData(30), getSiloData(31), getSiloData(32)]
    },
    // Group 4 (34-43)
    {
      topRow: [getSiloData(34), getSiloData(35), getSiloData(36)],
      middleRow: [getSiloData(39), getSiloData(40)],
      bottomRow: [getSiloData(41), getSiloData(42), getSiloData(43)]
    },
    // Group 5 (45-54)
    {
      topRow: [getSiloData(45), getSiloData(46), getSiloData(47)],
      middleRow: [getSiloData(50), getSiloData(51)],
      bottomRow: [getSiloData(52), getSiloData(53), getSiloData(54)]
    }
  ];
};

// Bottom section: Square silos (101-195) arranged in groups
const generateBottomSiloGroups = (): SiloGroup[] => {
  return [
    // Group 1 (195-177)
    {
      topRow: [getSiloData(195), getSiloData(188), getSiloData(181)],
      middleRow: [getSiloData(194), getSiloData(190), getSiloData(187), getSiloData(183), getSiloData(180)],
      bottomRow: [getSiloData(193), getSiloData(186), getSiloData(179)],
      row4: [getSiloData(192), getSiloData(185), getSiloData(182), getSiloData(178)],
      row5: [getSiloData(191), getSiloData(184), getSiloData(177)]
    },
    // Group 2 (176-158)
    {
      topRow: [getSiloData(176), getSiloData(169), getSiloData(162)],
      middleRow: [getSiloData(175), getSiloData(171), getSiloData(168), getSiloData(164), getSiloData(161)],
      bottomRow: [getSiloData(174), getSiloData(167), getSiloData(160)],
      row4: [getSiloData(173), getSiloData(170), getSiloData(166), getSiloData(163), getSiloData(159)],
      row5: [getSiloData(172), getSiloData(165), getSiloData(158)]
    },
    // Group 3 (157-139)
    {
      topRow: [getSiloData(157), getSiloData(150), getSiloData(143)],
      middleRow: [getSiloData(156), getSiloData(152), getSiloData(149), getSiloData(145), getSiloData(142)],
      bottomRow: [getSiloData(155), getSiloData(148), getSiloData(141)],
      row4: [getSiloData(154), getSiloData(151), getSiloData(147), getSiloData(144), getSiloData(140)],
      row5: [getSiloData(153), getSiloData(146), getSiloData(139)]
    },
    // Group 4 (138-120)
    {
      topRow: [getSiloData(138), getSiloData(131), getSiloData(124)],
      middleRow: [getSiloData(137), getSiloData(133), getSiloData(130), getSiloData(126), getSiloData(123)],
      bottomRow: [getSiloData(136), getSiloData(129), getSiloData(122)],
      row4: [getSiloData(135), getSiloData(132), getSiloData(128), getSiloData(125), getSiloData(121)],
      row5: [getSiloData(134), getSiloData(127), getSiloData(120)]
    },
    // Group 5 (119-101)
    {
      topRow: [getSiloData(119), getSiloData(112), getSiloData(105)],
      middleRow: [getSiloData(118), getSiloData(114), getSiloData(111), getSiloData(107), getSiloData(104)],
      bottomRow: [getSiloData(117), getSiloData(110), getSiloData(103)],
      row4: [getSiloData(116), getSiloData(113), getSiloData(109), getSiloData(106), getSiloData(102)],
      row5: [getSiloData(115), getSiloData(108), getSiloData(101)]
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

// Mutable data structures that can be updated - now using API data
export let topSiloGroups: SiloGroup[] = generateTopSiloGroups();
export let bottomSiloGroups: SiloGroup[] = generateBottomSiloGroups();

// Legacy static data for backward compatibility
const legacyTopSiloGroups: SiloGroup[] = [
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

// Legacy bottom silo groups for backward compatibility
const legacyBottomSiloGroups: SiloGroup[] = [
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
  if (temp > TEMPERATURE_THRESHOLDS.YELLOW_MAX) return 'pink';        // Red: >40°C - Highest priority
  if (temp >= TEMPERATURE_THRESHOLDS.YELLOW_MIN) return 'yellow';     // Yellow: 30-40°C - Medium priority
  if (temp >= TEMPERATURE_THRESHOLDS.GREEN_MIN) return 'green';       // Green: 20-30°C - Lowest priority
  return 'beige';                                                     // Default - Below range
};

// Get default wheat color for initial state
export const getDefaultWheatColor = (): TemperatureColor => {
  return 'beige';
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
// Priority: Red (>40°C) > Yellow (30-40°C) > Green (<30°C)
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
  const silo = findSiloByNumber(siloNum);
  if (!silo) return [0, 0, 0, 0, 0, 0, 0, 0];
  
  // If we have predefined readings, use them (already sorted)
  if (predefinedReadings[siloNum]) {
    return predefinedReadings[siloNum];
  }
  
  // Generate new readings and sort them
  const readings = generateSensorReadings(silo.temp);
  predefinedReadings[siloNum] = readings;
  return readings;
};

// Cylinder measurements (from original LabCylinder) - updated for three-tier color demonstration
export const cylinderMeasurements = [23.5, 28.7, 33.2, 37.8, 39.4, 42.1, 44.6, 46.3]; // Green, Green, Green, Yellow, Yellow, Red, Red, Red
