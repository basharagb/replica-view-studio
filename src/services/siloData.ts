import { Silo, SiloGroup, TemperatureColor } from '../types/silo';

// Cylinder silo data with 8 sensor readings each
export interface CylinderSilo extends Silo {
  sensors: number[];  // 8 sensor readings
}

// Generate random temperature between 20-50°C
const generateRandomTemp = (): number => {
  return Math.round((Math.random() * 30 + 20) * 10) / 10; // 20.0 to 50.0
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

// Generate silo with 8 sensors and calculate MAX temperature
const generateSiloWithSensors = (num: number): Silo => {
  const baseTemp = generateRandomTemp();
  const sensors = generateSensorReadings(baseTemp);
  const maxTemp = Math.max(...sensors); // Silo temp is MAX of all sensors
  
  return {
    num,
    temp: maxTemp // Silo temperature is the MAX of all 8 sensors
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
  // Group 1 (leftmost)
  {
    topRow: [{ num: 55, temp: 44.2 }, { num: 51, temp: 42.8 }, { num: 47, temp: 41.5 }],
    middleRow: [{ num: 54, temp: 43.1 }, { num: 52, temp: 42.3 }, { num: 50, temp: 41.8 }, { num: 48, temp: 42.7 }, { num: 46, temp: 43.9 }],
    bottomRow: [{ num: 53, temp: 44.5 }, { num: 49, temp: 42.1 }, { num: 45, temp: 43.2 }]
  },
  // Group 2
  {
    topRow: [{ num: 44, temp: 43.8 }, { num: 40, temp: 44.1 }, { num: 36, temp: 42.9 }],
    middleRow: [{ num: 43, temp: 44.3 }, { num: 41, temp: 44.5 }, { num: 39, temp: 41.2 }, { num: 37, temp: 42.1 }, { num: 35, temp: 43.8 }],
    bottomRow: [{ num: 42, temp: 44.7 }, { num: 38, temp: 44.2 }, { num: 34, temp: 43.1 }]
  },
  // Group 3
  {
    topRow: [{ num: 33, temp: 44.8 }, { num: 29, temp: 44.3 }, { num: 25, temp: 42.9 }],
    middleRow: [{ num: 32, temp: 43.9 }, { num: 30, temp: 43.8 }, { num: 28, temp: 43.2 }, { num: 26, temp: 43.7 }, { num: 24, temp: 44.1 }],
    bottomRow: [{ num: 31, temp: 41.2 }, { num: 27, temp: 44.9 }, { num: 23, temp: 42.1 }]
  },
  // Group 4
  {
    topRow: [{ num: 22, temp: 44.9 }, { num: 18, temp: 44.2 }, { num: 14, temp: 44.3 }],
    middleRow: [{ num: 21, temp: 43.8 }, { num: 19, temp: 43.2 }, { num: 17, temp: 42.9 }, { num: 15, temp: 43.9 }, { num: 13, temp: 43.8 }],
    bottomRow: [{ num: 20, temp: 43.1 }, { num: 16, temp: 42.1 }, { num: 12, temp: 44.3 }]
  },
  // Group 5 (rightmost)
  {
    topRow: [{ num: 11, temp: 44.4 }, { num: 7, temp: 44.4 }, { num: 3, temp: 42.2 }],
    middleRow: [{ num: 10, temp: 41.1 }, { num: 8, temp: 43.8 }, { num: 6, temp: 43.2 }, { num: 4, temp: 42.9 }, { num: 2, temp: 43.9 }],
    bottomRow: [{ num: 9, temp: 44.5 }, { num: 5, temp: 44.6 }, { num: 1, temp: 43.8 }]
  }
];

export let bottomSiloGroups: SiloGroup[] = [
  // Group 1 (leftmost)
  {
    row1: [{ num: 195, temp: 42.5 }, { num: 188, temp: 43.4 }, { num: 181, temp: 44.4 }],
    row2: [{ num: 194, temp: 43.3 }, { num: 190, temp: 44.3 }, { num: 187, temp: 45.2 }, { num: 183, temp: 46.2 }, { num: 180, temp: 47.1 }],
    row3: [{ num: 193, temp: 48.1 }, { num: 186, temp: 49.0 }, { num: 179, temp: 50.1 }],
    row4: [{ num: 192, temp: 51.1 }, { num: 189, temp: 52.2 }, { num: 185, temp: 53.2 }, { num: 182, temp: 54.3 }, { num: 178, temp: 55.3 }],
    row5: [{ num: 191, temp: 56.4 }, { num: 184, temp: 57.4 }, { num: 177, temp: 58.5 }]
  },
  // Group 2
  {
    row1: [{ num: 176, temp: 41.5 }, { num: 169, temp: 42.4 }, { num: 162, temp: 43.4 }],
    row2: [{ num: 175, temp: 44.3 }, { num: 171, temp: 45.3 }, { num: 168, temp: 46.2 }, { num: 164, temp: 47.2 }, { num: 161, temp: 48.1 }],
    row3: [{ num: 174, temp: 49.1 }, { num: 167, temp: 50.0 }, { num: 160, temp: 51.1 }],
    row4: [{ num: 173, temp: 52.1 }, { num: 170, temp: 53.2 }, { num: 166, temp: 54.2 }, { num: 163, temp: 55.3 }, { num: 159, temp: 56.3 }],
    row5: [{ num: 172, temp: 57.4 }, { num: 165, temp: 58.4 }, { num: 158, temp: 59.5 }]
  },
  // Group 3
  {
    row1: [{ num: 157, temp: 40.5 }, { num: 150, temp: 41.4 }, { num: 143, temp: 42.4 }],
    row2: [{ num: 156, temp: 43.3 }, { num: 152, temp: 44.3 }, { num: 149, temp: 45.2 }, { num: 145, temp: 46.2 }, { num: 142, temp: 47.1 }],
    row3: [{ num: 155, temp: 48.1 }, { num: 148, temp: 49.0 }, { num: 141, temp: 50.1 }],
    row4: [{ num: 154, temp: 51.1 }, { num: 151, temp: 52.2 }, { num: 147, temp: 53.2 }, { num: 144, temp: 54.3 }, { num: 140, temp: 55.3 }],
    row5: [{ num: 153, temp: 56.4 }, { num: 146, temp: 57.4 }, { num: 139, temp: 58.5 }]
  },
  // Group 4
  {
    row1: [{ num: 138, temp: 39.5 }, { num: 131, temp: 40.4 }, { num: 124, temp: 41.4 }],
    row2: [{ num: 137, temp: 42.3 }, { num: 133, temp: 43.3 }, { num: 130, temp: 44.2 }, { num: 126, temp: 45.2 }, { num: 123, temp: 46.1 }],
    row3: [{ num: 136, temp: 47.1 }, { num: 129, temp: 48.0 }, { num: 122, temp: 49.1 }],
    row4: [{ num: 135, temp: 50.1 }, { num: 132, temp: 51.2 }, { num: 128, temp: 52.2 }, { num: 125, temp: 53.3 }, { num: 121, temp: 54.3 }],
    row5: [{ num: 134, temp: 55.4 }, { num: 127, temp: 56.4 }, { num: 120, temp: 57.5 }]
  },
  // Group 5 (rightmost) - contains selected silo 112
  {
    row1: [{ num: 119, temp: 38.5 }, { num: 112, temp: 40.2 }, { num: 105, temp: 44.7 }],
    row2: [{ num: 118, temp: 39.4 }, { num: 114, temp: 40.3 }, { num: 111, temp: 44.8 }, { num: 107, temp: 41.2 }, { num: 104, temp: 42.2 }],
    row3: [{ num: 117, temp: 44.9 }, { num: 110, temp: 45.0 }, { num: 103, temp: 43.1 }],
    row4: [{ num: 116, temp: 39.4 }, { num: 113, temp: 44.1 }, { num: 109, temp: 45.0 }, { num: 106, temp: 46.1 }, { num: 102, temp: 47.1 }],
    row5: [{ num: 115, temp: 44.3 }, { num: 108, temp: 44.3 }, { num: 101, temp: 44.4 }]
  }
];

export let cylinderSilos: CylinderSilo[] = [
  { 
    num: 25, 
    temp: 44.6, // MAX of sensors
    sensors: [44.6, 43.7, 42.9, 42.8, 42.8, 42.1, 42.0, 41.2] // Sorted highest to lowest
  },
  { 
    num: 26, 
    temp: 48.4, // MAX of sensors
    sensors: [48.4, 47.6, 47.6, 46.8, 46.7, 46.5, 45.9, 45.0] // Sorted highest to lowest
  },
  { 
    num: 27, 
    temp: 44.9, // MAX of sensors
    sensors: [44.9, 44.8, 44.7, 44.6, 44.5, 44.5, 44.4, 44.3] // Sorted highest to lowest
  },
  { 
    num: 29, 
    temp: 43.5, // MAX of sensors
    sensors: [43.5, 43.4, 43.3, 43.2, 43.1, 43.1, 43.0, 42.9] // Sorted highest to lowest
  },
  { 
    num: 32, 
    temp: 43.6, // MAX of sensors
    sensors: [43.6, 42.8, 42.8, 41.9, 41.7, 41.0, 40.1, 39.2] // Sorted highest to lowest
  },
  { 
    num: 35, 
    temp: 46.5, // MAX of sensors
    sensors: [46.5, 45.7, 45.7, 44.9, 44.8, 44.6, 43.0, 42.1] // Sorted highest to lowest
  },
  { 
    num: 36, 
    temp: 50.2, // MAX of sensors
    sensors: [50.2, 50.1, 50.0, 49.9, 49.8, 49.8, 49.7, 49.6] // Sorted highest to lowest
  },
  { 
    num: 38, 
    temp: 44.4, // MAX of sensors
    sensors: [44.4, 44.3, 44.2, 44.1, 44.0, 43.9, 43.8, 43.8] // Sorted highest to lowest
  }
];

// Function to regenerate all silo data
export const regenerateAllSiloData = (): void => {
  topSiloGroups = generateTopSiloGroups();
  bottomSiloGroups = generateBottomSiloGroups();
  cylinderSilos = generateCylinderSilos();
  
  // Update predefined readings for cylinder silos
  cylinderSilos.forEach(silo => {
    predefinedReadings[silo.num] = silo.sensors;
  });
};

// Temperature color mapping - based on MAX temperature
export const getTemperatureColor = (temp: number): TemperatureColor => {
  if (temp <= 35.0) return 'green';      // Green: 20-35°C
  if (temp <= 40.0) return 'yellow';     // Yellow: 35-40°C
  if (temp > 40.0) return 'pink';        // Red/Pink: over 40°C
  return 'beige';                        // Default - Beige
};

// Get all silos in order for auto-read functionality
export const getAllSilos = (): Silo[] => {
  const allSilos: Silo[] = [];

  console.log('Getting all silos - topSiloGroups:', topSiloGroups.length);
  console.log('Getting all silos - bottomSiloGroups:', bottomSiloGroups.length);
  console.log('Getting all silos - cylinderSilos:', cylinderSilos.length);

  // Add top section silos
  topSiloGroups.forEach((group, groupIndex) => {
    console.log(`Processing top group ${groupIndex}:`, group);
    if (group.topRow) group.topRow.forEach(silo => allSilos.push(silo));
    if (group.middleRow) group.middleRow.forEach(silo => allSilos.push(silo));
    if (group.bottomRow) group.bottomRow.forEach(silo => allSilos.push(silo));
  });

  // Add bottom section silos
  bottomSiloGroups.forEach((group, groupIndex) => {
    console.log(`Processing bottom group ${groupIndex}:`, group);
    if (group.row1) group.row1.forEach(silo => allSilos.push(silo));
    if (group.row2) group.row2.forEach(silo => allSilos.push(silo));
    if (group.row3) group.row3.forEach(silo => allSilos.push(silo));
    if (group.row4) group.row4.forEach(silo => allSilos.push(silo));
    if (group.row5) group.row5.forEach(silo => allSilos.push(silo));
  });

  // Add cylinder silos
  cylinderSilos.forEach(silo => allSilos.push(silo));

  console.log('Total silos collected:', allSilos.length);

  // Sort by silo number
  const sortedSilos = allSilos.sort((a, b) => a.num - b.num);
  console.log('Sorted silos count:', sortedSilos.length);
  
  return sortedSilos;
};

// Find silo by number
export const findSiloByNumber = (siloNum: number): Silo | null => {
  const allSilos = getAllSilos();
  return allSilos.find(silo => silo.num === siloNum) || null;
};

// Temperature scale values for display - updated for 20-50°C range
export const temperatureScaleValues = [20.0, 25.0, 30.0, 35.0, 40.0, 45.0, 50.0];

// Predefined sensor readings for specific silos - SORTED from highest to lowest
const predefinedReadings: { [key: number]: number[] } = {
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

// Cylinder measurements (from original LabCylinder) - kept for backward compatibility
export const cylinderMeasurements = [25.0, 26.0, 27.0, 29.0, 32.0, 35.0, 36.0, 38.0];