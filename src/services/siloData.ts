import { Silo, SiloGroup, TemperatureColor } from '../types/silo';

// Top section silos - exact layout from sillo logic (1-55) - Temperatures in Celsius
export const topSiloGroups: SiloGroup[] = [
  // Group 1 (leftmost)
  {
    topRow: [{ num: 55, temp: -2.1 }, { num: 51, temp: 1.7 }, { num: 47, temp: -1.9 }],
    middleRow: [{ num: 54, temp: -1.8 }, { num: 52, temp: -1.8 }, { num: 50, temp: -1.9 }, { num: 48, temp: -1.8 }, { num: 46, temp: -1.8 }],
    bottomRow: [{ num: 53, temp: 3.4 }, { num: 49, temp: -1.7 }, { num: 45, temp: 1.8 }]
  },
  // Group 2
  {
    topRow: [{ num: 44, temp: 1.8 }, { num: 40, temp: 1.9 }, { num: 36, temp: 1.9 }],
    middleRow: [{ num: 43, temp: 2.0 }, { num: 41, temp: 2.1 }, { num: 39, temp: -2.2 }, { num: 37, temp: -2.1 }, { num: 35, temp: -1.8 }],
    bottomRow: [{ num: 42, temp: 3.4 }, { num: 38, temp: 2.1 }, { num: 34, temp: -1.8 }]
  },
  // Group 3
  {
    topRow: [{ num: 33, temp: 3.5 }, { num: 29, temp: 2.2 }, { num: 25, temp: -1.9 }],
    middleRow: [{ num: 32, temp: -1.9 }, { num: 30, temp: -1.8 }, { num: 28, temp: -1.8 }, { num: 26, temp: -1.7 }, { num: 24, temp: -1.7 }],
    bottomRow: [{ num: 31, temp: -2.2 }, { num: 27, temp: 3.6 }, { num: 23, temp: -2.1 }]
  },
  // Group 4
  {
    topRow: [{ num: 22, temp: 3.6 }, { num: 18, temp: 2.2 }, { num: 14, temp: 2.3 }],
    middleRow: [{ num: 21, temp: -1.8 }, { num: 19, temp: -1.8 }, { num: 17, temp: -1.9 }, { num: 15, temp: -1.9 }, { num: 13, temp: -1.8 }],
    bottomRow: [{ num: 20, temp: -1.8 }, { num: 16, temp: -1.7 }, { num: 12, temp: 2.3 }]
  },
  // Group 5 (rightmost)
  {
    topRow: [{ num: 11, temp: 2.4 }, { num: 7, temp: 2.4 }, { num: 3, temp: -2.2 }],
    middleRow: [{ num: 10, temp: -2.1 }, { num: 8, temp: -1.8 }, { num: 6, temp: -1.8 }, { num: 4, temp: -1.9 }, { num: 2, temp: -1.9 }],
    bottomRow: [{ num: 9, temp: 2.5 }, { num: 5, temp: 2.6 }, { num: 1, temp: -1.8 }]
  }
];

// Bottom section silos - exact layout from sillo logic (101-195) - Temperatures in Celsius
export const bottomSiloGroups: SiloGroup[] = [
  // Group 1 (leftmost)
  {
    row1: [{ num: 195, temp: -0.5 }, { num: 188, temp: -0.4 }, { num: 181, temp: -0.4 }],
    row2: [{ num: 194, temp: -0.3 }, { num: 190, temp: -0.3 }, { num: 187, temp: -0.2 }, { num: 183, temp: -0.2 }, { num: 180, temp: -0.1 }],
    row3: [{ num: 193, temp: -0.1 }, { num: 186, temp: 0.0 }, { num: 179, temp: 0.1 }],
    row4: [{ num: 192, temp: 0.1 }, { num: 189, temp: 0.2 }, { num: 185, temp: 0.2 }, { num: 182, temp: 0.3 }, { num: 178, temp: 0.3 }],
    row5: [{ num: 191, temp: 0.4 }, { num: 184, temp: 0.4 }, { num: 177, temp: 0.5 }]
  },
  // Group 2
  {
    row1: [{ num: 176, temp: -0.5 }, { num: 169, temp: -0.4 }, { num: 162, temp: -0.4 }],
    row2: [{ num: 175, temp: -0.3 }, { num: 171, temp: -0.3 }, { num: 168, temp: -0.2 }, { num: 164, temp: -0.2 }, { num: 161, temp: -0.1 }],
    row3: [{ num: 174, temp: -0.1 }, { num: 167, temp: 0.0 }, { num: 160, temp: 0.1 }],
    row4: [{ num: 173, temp: 0.1 }, { num: 170, temp: 0.2 }, { num: 166, temp: 0.2 }, { num: 163, temp: 0.3 }, { num: 159, temp: 0.3 }],
    row5: [{ num: 172, temp: 0.4 }, { num: 165, temp: 0.4 }, { num: 158, temp: 0.5 }]
  },
  // Group 3
  {
    row1: [{ num: 157, temp: -0.5 }, { num: 150, temp: -0.4 }, { num: 143, temp: -0.4 }],
    row2: [{ num: 156, temp: -0.3 }, { num: 152, temp: -0.3 }, { num: 149, temp: -0.2 }, { num: 145, temp: -0.2 }, { num: 142, temp: -0.1 }],
    row3: [{ num: 155, temp: -0.1 }, { num: 148, temp: 0.0 }, { num: 141, temp: 0.1 }],
    row4: [{ num: 154, temp: 0.1 }, { num: 151, temp: 0.2 }, { num: 147, temp: 0.2 }, { num: 144, temp: 0.3 }, { num: 140, temp: 0.3 }],
    row5: [{ num: 153, temp: 0.4 }, { num: 146, temp: 0.4 }, { num: 139, temp: 0.5 }]
  },
  // Group 4
  {
    row1: [{ num: 138, temp: -0.5 }, { num: 131, temp: -0.4 }, { num: 124, temp: -0.4 }],
    row2: [{ num: 137, temp: -0.3 }, { num: 133, temp: -0.3 }, { num: 130, temp: -0.2 }, { num: 126, temp: -0.2 }, { num: 123, temp: -0.1 }],
    row3: [{ num: 136, temp: -0.1 }, { num: 129, temp: 0.0 }, { num: 122, temp: 0.1 }],
    row4: [{ num: 135, temp: 0.1 }, { num: 132, temp: 0.2 }, { num: 128, temp: 0.2 }, { num: 125, temp: 0.3 }, { num: 121, temp: 0.3 }],
    row5: [{ num: 134, temp: 0.4 }, { num: 127, temp: 0.4 }, { num: 120, temp: 0.5 }]
  },
  // Group 5 (rightmost) - contains selected silo 112
  {
    row1: [{ num: 119, temp: -0.5 }, { num: 112, temp: 0.2 }, { num: 105, temp: 3.4 }],
    row2: [{ num: 118, temp: -0.4 }, { num: 114, temp: -0.3 }, { num: 111, temp: 3.4 }, { num: 107, temp: -0.2 }, { num: 104, temp: -0.2 }],
    row3: [{ num: 117, temp: 3.5 }, { num: 110, temp: 3.6 }, { num: 103, temp: -0.1 }],
    row4: [{ num: 116, temp: -0.4 }, { num: 113, temp: -0.1 }, { num: 109, temp: 0.0 }, { num: 106, temp: 0.1 }, { num: 102, temp: 0.1 }],
    row5: [{ num: 115, temp: 2.3 }, { num: 108, temp: 2.3 }, { num: 101, temp: 2.4 }]
  }
];

// Temperature color mapping based on sillo logic
export const getTemperatureColor = (temp: number): TemperatureColor => {
  if (temp <= -1.0) return 'green';      // Low - Green
  if (temp <= 1.5) return 'yellow';      // Mid - Yellow  
  if (temp <= 4.0) return 'pink';        // High - Pink (was red in original)
  return 'beige';                        // Default - Beige (was wheat in original)
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

// Temperature scale values for display
export const temperatureScaleValues = [-3.9, -3.3, -2.8, -1.7, 0.0, 1.7, 2.2, 3.3];

// Cylinder silo data - interactive silos with temperatures
export const cylinderSilos: Silo[] = [
  { num: 25, temp: -1.9 },  // From existing data (silo 25)
  { num: 26, temp: -1.7 },  // From existing data (silo 26)
  { num: 27, temp: 3.6 },   // From existing data (silo 27)
  { num: 29, temp: 2.2 },   // From existing data (silo 29)
  { num: 32, temp: -1.9 },  // From existing data (silo 32)
  { num: 35, temp: -1.8 },  // From existing data (silo 35)
  { num: 36, temp: 1.9 },   // From existing data (silo 36)
  { num: 38, temp: 2.1 }    // From existing data (silo 38)
];

// Cylinder measurements (from original LabCylinder) - kept for backward compatibility
export const cylinderMeasurements = [25.0, 26.0, 27.0, 29.0, 32.0, 35.0, 36.0, 38.0];