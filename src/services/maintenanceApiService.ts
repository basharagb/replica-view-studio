// API endpoint for maintenance cable data
const MAINTENANCE_API_BASE = '192.168.1.14:5000';

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
      `http://${MAINTENANCE_API_BASE}/readings/latest/by-silo-number?silo_number=${siloNumber}`,
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

    const siloData = data[0]; // Get first silo data
    return processMaintenanceSiloData(siloData);
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
      
      if (cable1Level !== undefined && cable1Color !== undefined) {
        // Use real API data
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
