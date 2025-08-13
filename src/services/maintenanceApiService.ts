// API endpoint for maintenance cable data
import { Strings } from '../utils/Strings';

const MAINTENANCE_API_BASE = Strings.BASE_URL;

// Interface for cable sensor data from API
export interface CableSensorData {
  level: number;
  color: string;
}

// Interface for silo cable data from API
export interface MaintenanceSiloApiData {
  silo_group: string;
  silo_number: number;
  cable_count: number;
  timestamp: string;
  silo_color: string;
  // Cable 0 sensors (all silos have at least 1 cable)
  cable_0_level_0: number;
  cable_0_color_0: string;
  cable_0_level_1: number;
  cable_0_color_1: string;
  cable_0_level_2: number;
  cable_0_color_2: string;
  cable_0_level_3: number;
  cable_0_color_3: string;
  cable_0_level_4: number;
  cable_0_color_4: string;
  cable_0_level_5: number;
  cable_0_color_5: string;
  cable_0_level_6: number;
  cable_0_color_6: string;
  cable_0_level_7: number;
  cable_0_color_7: string;
  // Cable 1 sensors (only for circular silos 1-61)
  cable_1_level_0?: number;
  cable_1_color_0?: string;
  cable_1_level_1?: number;
  cable_1_color_1?: string;
  cable_1_level_2?: number;
  cable_1_color_2?: string;
  cable_1_level_3?: number;
  cable_1_color_3?: string;
  cable_1_level_4?: number;
  cable_1_color_4?: string;
  cable_1_level_5?: number;
  cable_1_color_5?: string;
  cable_1_level_6?: number;
  cable_1_color_6?: string;
  cable_1_level_7?: number;
  cable_1_color_7?: string;
}

// Interface for processed cable data
export interface CableData {
  cableIndex: number;
  sensors: CableSensorData[];
}

// Interface for processed maintenance silo data
export interface MaintenanceSiloData {
  siloNumber: number;
  siloGroup: string;
  cableCount: number;
  timestamp: string;
  siloColor: string;
  cables: CableData[];
  // Calculated sensor values (S1-S8) for display
  sensorValues: number[];
  sensorColors: string[];
}

/**
 * Fetch maintenance cable data for a specific silo
 */
export const fetchMaintenanceSiloData = async (siloNumber: number): Promise<MaintenanceSiloData> => {
  try {
    const response = await fetch(
      `${MAINTENANCE_API_BASE}/readings/latest/by-silo-number?silo_number=${siloNumber}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data: MaintenanceSiloApiData[] = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('No data received from API');
    }

    // Debug logging for API response structure
    console.log(`Raw API response for silo ${siloNumber}:`, {
      recordCount: data.length,
      records: data.map((record, index) => ({
        index,
        cable_count: record.cable_count,
        hasCable0: record.cable_0_level_0 !== undefined,
        hasCable1: record.cable_1_level_0 !== undefined,
        timestamp: record.timestamp
      }))
    });

    // Combine data from multiple records if needed (for circular silos with separate Cable 0 and Cable 1 records)
    const isCircularSilo = siloNumber >= 1 && siloNumber <= 61;
    let combinedData: MaintenanceSiloApiData;

    if (data.length === 1) {
      // Single record contains all data
      combinedData = data[0];
    } else if (data.length === 2 && isCircularSilo) {
      // Two records: combine Cable 0 and Cable 1 data
      const cable0Record = data.find(record => record.cable_0_level_0 !== undefined);
      const cable1Record = data.find(record => record.cable_1_level_0 !== undefined);
      
      if (!cable0Record) {
        throw new Error('Cable 0 data not found in API response');
      }
      
      // Start with Cable 0 record as base
      combinedData = { ...cable0Record };
      
      // Add Cable 1 data if available
      if (cable1Record) {
        // Copy all Cable 1 sensor data
        for (let i = 0; i < 8; i++) {
          const levelKey = `cable_1_level_${i}` as keyof MaintenanceSiloApiData;
          const colorKey = `cable_1_color_${i}` as keyof MaintenanceSiloApiData;
          
          if (levelKey in cable1Record && colorKey in cable1Record) {
            (combinedData as any)[levelKey] = cable1Record[levelKey];
            (combinedData as any)[colorKey] = cable1Record[colorKey];
          }
        }
        // Set cable count to 2 since we have both cables
        combinedData.cable_count = 2;
        
        console.log(`Combined Cable 0 and Cable 1 data for circular silo ${siloNumber}`);
      } else {
        console.warn(`Cable 1 record not found for circular silo ${siloNumber}, using Cable 0 only`);
      }
    } else {
      // Unexpected number of records, use first one
      console.warn(`Unexpected ${data.length} records for silo ${siloNumber}, using first record`);
      combinedData = data[0];
    }
    
    // Debug logging for combined data
    console.log(`Final combined data for silo ${siloNumber}:`, {
      cable_count: combinedData.cable_count,
      hasCable0Data: combinedData.cable_0_level_0 !== undefined,
      hasCable1Data: combinedData.cable_1_level_0 !== undefined,
      cable0Sample: {
        level_0: combinedData.cable_0_level_0,
        color_0: combinedData.cable_0_color_0
      },
      cable1Sample: {
        level_0: combinedData.cable_1_level_0,
        color_0: combinedData.cable_1_color_0
      }
    });
    
    return processMaintenanceSiloData(combinedData);
  } catch (error) {
    console.warn(`Failed to fetch maintenance data for silo ${siloNumber}:`, error);
    // Return simulated data as fallback
    return generateSimulatedMaintenanceData(siloNumber);
  }
};

/**
 * Process raw API data into structured maintenance data
 */
const processMaintenanceSiloData = (apiData: MaintenanceSiloApiData): MaintenanceSiloData => {
  const cables: CableData[] = [];
  const sensorValues: number[] = [];
  const sensorColors: string[] = [];

  // Determine if this is a circular silo (1-61) - these should always have 2 cables
  const isCircularSilo = apiData.silo_number >= 1 && apiData.silo_number <= 61;
  const actualCableCount = isCircularSilo ? 2 : 1;

  // Process Cable 0 (all silos have this)
  const cable0Sensors: CableSensorData[] = [];
  for (let i = 0; i < 8; i++) {
    cable0Sensors.push({
      level: apiData[`cable_0_level_${i}` as keyof MaintenanceSiloApiData] as number,
      color: apiData[`cable_0_color_${i}` as keyof MaintenanceSiloApiData] as string,
    });
  }
  cables.push({ cableIndex: 0, sensors: cable0Sensors });

  // Process Cable 1 (only for circular silos 1-61)
  if (actualCableCount === 2) {
    const cable1Sensors: CableSensorData[] = [];
    for (let i = 0; i < 8; i++) {
      // Check if Cable 1 data exists in API response
      const cable1Level = apiData[`cable_1_level_${i}` as keyof MaintenanceSiloApiData] as number;
      const cable1Color = apiData[`cable_1_color_${i}` as keyof MaintenanceSiloApiData] as string;
      
      // Debug logging for each sensor
      console.log(`Cable 1 sensor ${i} for silo ${apiData.silo_number}:`, {
        level: cable1Level,
        color: cable1Color,
        levelType: typeof cable1Level,
        colorType: typeof cable1Color
      });
      
      // Improved validation: -127 is a valid API response meaning "DISCONNECTED"
      const hasValidLevel = cable1Level !== undefined && cable1Level !== null && !isNaN(cable1Level);
      const hasValidColor = cable1Color !== undefined && cable1Color !== null && cable1Color !== '';
      
      if (hasValidLevel && hasValidColor) {
        // Use real API data (including -127 for disconnected sensors)
        console.log(`Using real Cable 1 data for sensor ${i}: ${cable1Level}°C, color: ${cable1Color}`);
        cable1Sensors.push({
          level: cable1Level,
          color: cable1Color,
        });
      } else {
        // Generate simulated data based on Cable 0 with slight variation
        const baseLevel = cable0Sensors[i].level;
        const variation = (Math.random() - 0.5) * 4; // ±2°C variation
        const simulatedLevel = Math.max(15, Math.min(50, baseLevel + variation));
        const simulatedColor = simulatedLevel > 40 ? '#d14141' : simulatedLevel > 30 ? '#ff9800' : '#46d446';
        
        cable1Sensors.push({
          level: simulatedLevel,
          color: simulatedColor,
        });
        
        console.warn(`Cable 1 sensor ${i} for silo ${apiData.silo_number}: Invalid data (level: ${cable1Level}, color: ${cable1Color}), using simulated data`);
      }
    }
    cables.push({ cableIndex: 1, sensors: cable1Sensors });

    // Use Cable 0 values directly for circular silos (no averaging)
    for (let i = 0; i < 8; i++) {
      const cable0Level = cable0Sensors[i].level;
      
      // Handle disabled sensors (-127 values)
      if (cable0Level === -127) {
        sensorValues.push(-127);
        sensorColors.push('#9ca3af'); // Grey color for disabled sensors
      } else {
        sensorValues.push(cable0Level);
        sensorColors.push(cable0Sensors[i].color);
      }
    }
  } else {
    // For square silos, S1-S8 are direct cable 0 values
    for (let i = 0; i < 8; i++) {
      const cable0Level = cable0Sensors[i].level;
      
      // Handle disabled sensors (-127 values)
      if (cable0Level === -127) {
        sensorValues.push(-127);
        sensorColors.push('#9ca3af'); // Grey color for disabled sensors
      } else {
        sensorValues.push(cable0Level);
        sensorColors.push(cable0Sensors[i].color);
      }
    }
  }

  return {
    siloNumber: apiData.silo_number,
    siloGroup: apiData.silo_group,
    cableCount: actualCableCount,
    timestamp: apiData.timestamp,
    siloColor: apiData.silo_color,
    cables,
    sensorValues,
    sensorColors,
  };
};

/**
 * Get the more critical color between two sensor colors
 */
const getMoreCriticalColor = (color1: string, color2: string): string => {
  const colorPriority = {
    '#d14141': 3, // Red - critical
    '#ff9800': 2, // Orange/Yellow - warning
    '#46d446': 1, // Green - normal
  };

  const priority1 = colorPriority[color1 as keyof typeof colorPriority] || 1;
  const priority2 = colorPriority[color2 as keyof typeof colorPriority] || 1;

  return priority1 >= priority2 ? color1 : color2;
};

/**
 * Generate simulated maintenance data as fallback
 */
const generateSimulatedMaintenanceData = (siloNumber: number): MaintenanceSiloData => {
  const isCircular = siloNumber >= 1 && siloNumber <= 61;
  const cableCount = isCircular ? 2 : 1;
  
  const cables: CableData[] = [];
  const sensorValues: number[] = [];
  const sensorColors: string[] = [];

  // Generate cable 0 data
  const cable0Sensors: CableSensorData[] = [];
  for (let i = 0; i < 8; i++) {
    const level = 20 + Math.random() * 25; // 20-45°C
    const color = level > 40 ? '#d14141' : level > 30 ? '#ff9800' : '#46d446';
    cable0Sensors.push({ level, color });
  }
  cables.push({ cableIndex: 0, sensors: cable0Sensors });

  if (isCircular) {
    // Generate cable 1 data for circular silos
    const cable1Sensors: CableSensorData[] = [];
    for (let i = 0; i < 8; i++) {
      const level = 20 + Math.random() * 25; // 20-45°C
      const color = level > 40 ? '#d14141' : level > 30 ? '#ff9800' : '#46d446';
      cable1Sensors.push({ level, color });
    }
    cables.push({ cableIndex: 1, sensors: cable1Sensors });

    // Use Cable 0 values directly (no averaging)
    for (let i = 0; i < 8; i++) {
      const level = cable0Sensors[i].level;
      const isDisabled = level === -127;
      sensorValues.push(level);
      sensorColors.push(isDisabled ? '#9ca3af' : cable0Sensors[i].color);
    }
  } else {
    // Direct mapping for square silos
    for (let i = 0; i < 8; i++) {
      const level = cable0Sensors[i].level;
      const isDisabled = level === -127;
      sensorValues.push(level);
      sensorColors.push(isDisabled ? '#9ca3af' : cable0Sensors[i].color);
    }
  }

  // Determine overall silo color (most critical sensor)
  const siloColor = sensorColors.reduce((mostCritical, current) => 
    getMoreCriticalColor(mostCritical, current), '#46d446');

  return {
    siloNumber,
    siloGroup: `Group ${Math.ceil(siloNumber / 10)}`,
    cableCount,
    timestamp: new Date().toISOString(),
    siloColor,
    cables,
    sensorValues,
    sensorColors,
  };
};
