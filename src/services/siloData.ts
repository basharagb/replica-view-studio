import { Silo, SiloGroup, TemperatureColor } from '../types/silo';

// Cylinder silo data with 8 sensor readings each
export interface CylinderSilo extends Silo {
  sensors: number[];  // 8 sensor readings
}

// Generate random temperature between 20-50°C
const generateRandomTemp = (): number => {
  return Math.round((Math.random() * 30 + 20) * 10) / 10; // 20.0 to 50.0
};

// Generate random silo data for a group
const generateSiloGroup = (siloNumbers: number[]): Silo[] => {
  return siloNumbers.map(num => ({
    num,
    temp: generateRandomTemp()
  }));
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
    const temp = generateRandomTemp();
    return {
      num,
      temp,
      sensors: generateSensorReadings(temp)
    };
  });
};

// Mutable data structures that can be updated
export let topSiloGroups: SiloGroup[] = generateTopSiloGroups();
export let bottomSiloGroups: SiloGroup[] = generateBottomSiloGroups();
export let cylinderSilos: CylinderSilo[] = generateCylinderSilos();

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

// Temperature color mapping - new demo ranges
export const getTemperatureColor = (temp: number): TemperatureColor => {
  if (temp <= 35.0) return 'green';      // Green: 20-35°C
  if (temp <= 40.0) return 'yellow';     // Yellow: 35-40°C
  if (temp > 40.0) return 'pink';        // Red/Pink: over 40°C
  return 'beige';                        // Default - Beige
};

// Get all silos in order for auto-read functionality
export const getAllSilos = (): Silo[] => {
  const allSilos: Silo[] = [];

  // Add top section silos
  topSiloGroups.forEach(group => {
    if (group.topRow) group.topRow.forEach(silo => allSilos.push(silo));
    if (group.middleRow) group.middleRow.forEach(silo => allSilos.push(silo));
    if (group.bottomRow) group.bottomRow.forEach(silo => allSilos.push(silo));
  });

  // Add bottom section silos
  bottomSiloGroups.forEach(group => {
    if (group.row1) group.row1.forEach(silo => allSilos.push(silo));
    if (group.row2) group.row2.forEach(silo => allSilos.push(silo));
    if (group.row3) group.row3.forEach(silo => allSilos.push(silo));
    if (group.row4) group.row4.forEach(silo => allSilos.push(silo));
    if (group.row5) group.row5.forEach(silo => allSilos.push(silo));
  });

  // Add cylinder silos
  cylinderSilos.forEach(silo => allSilos.push(silo));

  // Sort by silo number
  return allSilos.sort((a, b) => a.num - b.num);
};

// Find silo by number
export const findSiloByNumber = (siloNum: number): Silo | null => {
  const allSilos = getAllSilos();
  return allSilos.find(silo => silo.num === siloNum) || null;
};

// Temperature scale values for display - updated for 20-50°C range
export const temperatureScaleValues = [20.0, 25.0, 30.0, 35.0, 40.0, 45.0, 50.0];

// Predefined sensor readings for specific silos - updated to 20-50°C range
const predefinedReadings: { [key: number]: number[] } = {
  25: [29.8, 28.1, 30.7, 28.0, 29.9, 31.6, 27.2, 29.8],
  26: [33.5, 32.9, 34.6, 33.8, 35.4, 32.0, 33.7, 34.6],
  27: [43.4, 43.8, 43.5, 43.7, 43.9, 43.3, 43.6, 43.5],
  29: [42.0, 42.4, 42.1, 42.3, 42.5, 41.9, 42.2, 42.1],
  32: [28.7, 27.1, 29.8, 28.0, 30.6, 26.2, 28.9, 29.8],
  35: [31.6, 30.0, 32.7, 31.9, 33.5, 29.1, 31.8, 32.7],
  36: [37.7, 38.1, 37.8, 38.0, 37.6, 38.2, 37.9, 37.8],
  38: [41.9, 42.3, 42.0, 42.2, 41.8, 42.4, 42.1, 42.0],
  112: [35.1, 35.3, 35.0, 35.4, 35.2, 34.9, 35.3, 35.1]
};

// Generate 8 sensor readings for any silo based on its main temperature
export const generateSensorReadings = (mainTemp: number): number[] => {
  const variance = 0.3; // Temperature variance range
  return Array.from({ length: 8 }, () => {
    const offset = (Math.random() - 0.5) * 2 * variance;
    return mainTemp + offset;
  });
};

// Get sensor readings for any silo
export const getSensorReadings = (siloNum: number): number[] => {
  const silo = findSiloByNumber(siloNum);
  if (!silo) return [0, 0, 0, 0, 0, 0, 0, 0];
  
  return predefinedReadings[siloNum] || generateSensorReadings(silo.temp);
};

// Cylinder measurements (from original LabCylinder) - kept for backward compatibility
export const cylinderMeasurements = [25.0, 26.0, 27.0, 29.0, 32.0, 35.0, 36.0, 38.0];