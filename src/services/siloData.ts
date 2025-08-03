import { Silo, SiloGroup, TemperatureColor } from '../types/silo';

// Top section silos - demo data with temperatures 20-50°C
export const topSiloGroups: SiloGroup[] = [
  // Group 1 (leftmost)
  {
    topRow: [{ num: 55, temp: 28.1 }, { num: 51, temp: 41.7 }, { num: 47, temp: 29.9 }],
    middleRow: [{ num: 54, temp: 32.8 }, { num: 52, temp: 31.8 }, { num: 50, temp: 30.9 }, { num: 48, temp: 33.8 }, { num: 46, temp: 34.8 }],
    bottomRow: [{ num: 53, temp: 43.4 }, { num: 49, temp: 27.7 }, { num: 45, temp: 41.8 }]
  },
  // Group 2
  {
    topRow: [{ num: 44, temp: 38.8 }, { num: 40, temp: 39.9 }, { num: 36, temp: 37.9 }],
    middleRow: [{ num: 43, temp: 42.0 }, { num: 41, temp: 42.1 }, { num: 39, temp: 22.2 }, { num: 37, temp: 23.1 }, { num: 35, temp: 31.8 }],
    bottomRow: [{ num: 42, temp: 43.4 }, { num: 38, temp: 42.1 }, { num: 34, temp: 28.8 }]
  },
  // Group 3
  {
    topRow: [{ num: 33, temp: 43.5 }, { num: 29, temp: 42.2 }, { num: 25, temp: 29.9 }],
    middleRow: [{ num: 32, temp: 28.9 }, { num: 30, temp: 31.8 }, { num: 28, temp: 32.8 }, { num: 26, temp: 33.7 }, { num: 24, temp: 34.7 }],
    bottomRow: [{ num: 31, temp: 22.2 }, { num: 27, temp: 43.6 }, { num: 23, temp: 23.1 }]
  },
  // Group 4
  {
    topRow: [{ num: 22, temp: 43.6 }, { num: 18, temp: 42.2 }, { num: 14, temp: 42.3 }],
    middleRow: [{ num: 21, temp: 31.8 }, { num: 19, temp: 32.8 }, { num: 17, temp: 29.9 }, { num: 15, temp: 30.9 }, { num: 13, temp: 33.8 }],
    bottomRow: [{ num: 20, temp: 28.8 }, { num: 16, temp: 27.7 }, { num: 12, temp: 42.3 }]
  },
  // Group 5 (rightmost)
  {
    topRow: [{ num: 11, temp: 42.4 }, { num: 7, temp: 42.4 }, { num: 3, temp: 23.2 }],
    middleRow: [{ num: 10, temp: 22.1 }, { num: 8, temp: 31.8 }, { num: 6, temp: 32.8 }, { num: 4, temp: 29.9 }, { num: 2, temp: 30.9 }],
    bottomRow: [{ num: 9, temp: 42.5 }, { num: 5, temp: 42.6 }, { num: 1, temp: 28.8 }]
  }
];

// Bottom section silos - demo data with temperatures 20-50°C
export const bottomSiloGroups: SiloGroup[] = [
  // Group 1 (leftmost)
  {
    row1: [{ num: 195, temp: 29.5 }, { num: 188, temp: 30.4 }, { num: 181, temp: 31.4 }],
    row2: [{ num: 194, temp: 32.3 }, { num: 190, temp: 33.3 }, { num: 187, temp: 34.2 }, { num: 183, temp: 35.2 }, { num: 180, temp: 36.1 }],
    row3: [{ num: 193, temp: 37.1 }, { num: 186, temp: 38.0 }, { num: 179, temp: 39.1 }],
    row4: [{ num: 192, temp: 40.1 }, { num: 189, temp: 41.2 }, { num: 185, temp: 42.2 }, { num: 182, temp: 43.3 }, { num: 178, temp: 44.3 }],
    row5: [{ num: 191, temp: 45.4 }, { num: 184, temp: 46.4 }, { num: 177, temp: 47.5 }]
  },
  // Group 2
  {
    row1: [{ num: 176, temp: 28.5 }, { num: 169, temp: 29.4 }, { num: 162, temp: 30.4 }],
    row2: [{ num: 175, temp: 31.3 }, { num: 171, temp: 32.3 }, { num: 168, temp: 33.2 }, { num: 164, temp: 34.2 }, { num: 161, temp: 35.1 }],
    row3: [{ num: 174, temp: 36.1 }, { num: 167, temp: 37.0 }, { num: 160, temp: 38.1 }],
    row4: [{ num: 173, temp: 39.1 }, { num: 170, temp: 40.2 }, { num: 166, temp: 41.2 }, { num: 163, temp: 42.3 }, { num: 159, temp: 43.3 }],
    row5: [{ num: 172, temp: 44.4 }, { num: 165, temp: 45.4 }, { num: 158, temp: 46.5 }]
  },
  // Group 3
  {
    row1: [{ num: 157, temp: 27.5 }, { num: 150, temp: 28.4 }, { num: 143, temp: 29.4 }],
    row2: [{ num: 156, temp: 30.3 }, { num: 152, temp: 31.3 }, { num: 149, temp: 32.2 }, { num: 145, temp: 33.2 }, { num: 142, temp: 34.1 }],
    row3: [{ num: 155, temp: 35.1 }, { num: 148, temp: 36.0 }, { num: 141, temp: 37.1 }],
    row4: [{ num: 154, temp: 38.1 }, { num: 151, temp: 39.2 }, { num: 147, temp: 40.2 }, { num: 144, temp: 41.3 }, { num: 140, temp: 42.3 }],
    row5: [{ num: 153, temp: 43.4 }, { num: 146, temp: 44.4 }, { num: 139, temp: 45.5 }]
  },
  // Group 4
  {
    row1: [{ num: 138, temp: 26.5 }, { num: 131, temp: 27.4 }, { num: 124, temp: 28.4 }],
    row2: [{ num: 137, temp: 29.3 }, { num: 133, temp: 30.3 }, { num: 130, temp: 31.2 }, { num: 126, temp: 32.2 }, { num: 123, temp: 33.1 }],
    row3: [{ num: 136, temp: 34.1 }, { num: 129, temp: 35.0 }, { num: 122, temp: 36.1 }],
    row4: [{ num: 135, temp: 37.1 }, { num: 132, temp: 38.2 }, { num: 128, temp: 39.2 }, { num: 125, temp: 40.3 }, { num: 121, temp: 41.3 }],
    row5: [{ num: 134, temp: 42.4 }, { num: 127, temp: 43.4 }, { num: 120, temp: 44.5 }]
  },
  // Group 5 (rightmost) - contains selected silo 112
  {
    row1: [{ num: 119, temp: 25.5 }, { num: 112, temp: 35.2 }, { num: 105, temp: 43.4 }],
    row2: [{ num: 118, temp: 26.4 }, { num: 114, temp: 27.3 }, { num: 111, temp: 43.4 }, { num: 107, temp: 28.2 }, { num: 104, temp: 29.2 }],
    row3: [{ num: 117, temp: 43.5 }, { num: 110, temp: 43.6 }, { num: 103, temp: 30.1 }],
    row4: [{ num: 116, temp: 26.4 }, { num: 113, temp: 31.1 }, { num: 109, temp: 32.0 }, { num: 106, temp: 33.1 }, { num: 102, temp: 34.1 }],
    row5: [{ num: 115, temp: 42.3 }, { num: 108, temp: 42.3 }, { num: 101, temp: 42.4 }]
  }
];

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

// Cylinder silo data with 8 sensor readings each (kept for backward compatibility)
export interface CylinderSilo extends Silo {
  sensors: number[];  // 8 sensor readings
}

export const cylinderSilos: CylinderSilo[] = [
  { num: 25, temp: 29.9, sensors: predefinedReadings[25] },
  { num: 26, temp: 33.7, sensors: predefinedReadings[26] },
  { num: 27, temp: 43.6, sensors: predefinedReadings[27] },
  { num: 29, temp: 42.2, sensors: predefinedReadings[29] },
  { num: 32, temp: 28.9, sensors: predefinedReadings[32] },
  { num: 35, temp: 31.8, sensors: predefinedReadings[35] },
  { num: 36, temp: 37.9, sensors: predefinedReadings[36] },
  { num: 38, temp: 42.1, sensors: predefinedReadings[38] }
];

// Cylinder measurements (from original LabCylinder) - kept for backward compatibility
export const cylinderMeasurements = [25.0, 26.0, 27.0, 29.0, 32.0, 35.0, 36.0, 38.0];