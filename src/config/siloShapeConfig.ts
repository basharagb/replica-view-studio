/**
 * Silo Shape Configuration
 * 
 * Defines the actual physical shape of each silo based on hardware configuration.
 * This mapping determines the correct cable count for maintenance operations:
 * - Circular silos: 2 cables
 * - Square silos: 1 cable
 */

export type SiloShape = 'circular' | 'square';

export interface SiloShapeInfo {
  shape: SiloShape;
  cableCount: number;
}

/**
 * Silo shape mapping based on actual physical configuration
 * This needs to be populated with the correct shape data for each silo
 */
export const SILO_SHAPE_MAP: Record<number, SiloShapeInfo> = {
  // Based on user feedback:
  43: { shape: 'square', cableCount: 1 },    // User confirmed: square silo
  158: { shape: 'circular', cableCount: 2 }, // User confirmed: circular silo
  
  // TODO: Add remaining silo shape mappings based on actual hardware configuration
  // This is a placeholder - needs to be populated with real data
  
  // Example entries (these need to be verified):
  1: { shape: 'square', cableCount: 1 },
  2: { shape: 'square', cableCount: 1 },
  3: { shape: 'square', cableCount: 1 },
  4: { shape: 'square', cableCount: 1 },
  5: { shape: 'square', cableCount: 1 },
  6: { shape: 'square', cableCount: 1 },
  7: { shape: 'square', cableCount: 1 },
  8: { shape: 'square', cableCount: 1 },
  9: { shape: 'square', cableCount: 1 },
  10: { shape: 'square', cableCount: 1 },
  
  // Add more mappings as needed...
};

/**
 * Get silo shape information for a given silo number
 */
export function getSiloShape(siloNumber: number): SiloShapeInfo {
  const shapeInfo = SILO_SHAPE_MAP[siloNumber];
  
  if (shapeInfo) {
    return shapeInfo;
  }
  
  // Fallback: if no mapping exists, log warning and use default
  console.warn(`No shape mapping found for silo ${siloNumber}, using default square shape`);
  return { shape: 'square', cableCount: 1 };
}

/**
 * Check if a silo is circular
 */
export function isCircularSilo(siloNumber: number): boolean {
  return getSiloShape(siloNumber).shape === 'circular';
}

/**
 * Get the correct cable count for a silo based on its shape
 */
export function getSiloCableCount(siloNumber: number): number {
  return getSiloShape(siloNumber).cableCount;
}

/**
 * Get all circular silo numbers
 */
export function getCircularSilos(): number[] {
  return Object.entries(SILO_SHAPE_MAP)
    .filter(([_, info]) => info.shape === 'circular')
    .map(([siloNum, _]) => parseInt(siloNum));
}

/**
 * Get all square silo numbers
 */
export function getSquareSilos(): number[] {
  return Object.entries(SILO_SHAPE_MAP)
    .filter(([_, info]) => info.shape === 'square')
    .map(([siloNum, _]) => parseInt(siloNum));
}
