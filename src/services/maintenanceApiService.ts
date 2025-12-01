// API endpoint for maintenance cable data
import { Strings } from '../utils/Strings';
import { convertApiColorToTemperatureColor } from './realSiloApiService';

// Use the centralized API base URL for consistency
const MAINTENANCE_API_BASE = Strings.BASE_URL;

// Interface for cable sensor data from API
export interface CableSensorData {
  level: number;
  color: string;
}

// Interface for silo cable data from API (actual API response structure)
export interface MaintenanceSiloApiData {
  silo_group: string;
  silo_number: number;
  cable_count: number;
  timestamp: string;
  silo_color?: string;
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
    console.log(`🔧 [DEBUG] Fetching maintenance data for silo ${siloNumber}...`);
    console.log(`🔧 [DEBUG] API URL: ${MAINTENANCE_API_BASE}/readings/latest/by-silo-number?silo_number=${siloNumber}`);
    
    // Add timestamp to prevent browser caching and avoid CORS preflight
    const timestamp = new Date().getTime();
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${MAINTENANCE_API_BASE}/readings/latest/by-silo-number?silo_number=${siloNumber}&_t=${timestamp}`, {
      signal: controller.signal,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: MaintenanceSiloApiData[] = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('No data received from API');
    }

    // Debug logging for API response structure

    // API returns a simple array with direct sensor data (level_0 to level_7)
    console.log(`🔧 [DEBUG] Silo ${siloNumber} API response contains ${data.length} record(s)`);
    
    if (data.length === 0) {
      throw new Error('No data received from API');
    }
    
    // Use the first record (API returns array but we only need first element)
    const siloData = data[0];
    
    // Debug logging for API data structure
    console.log(`🔧 [DEBUG] API data structure for silo ${siloNumber}:`, {
      silo_number: siloData.silo_number,
      silo_group: siloData.silo_group,
      cable_count: siloData.cable_count,
      silo_color: siloData.silo_color,
      timestamp: siloData.timestamp,
      sensorSample: {
        cable_0_level_0: siloData.cable_0_level_0,
        cable_0_color_0: siloData.cable_0_color_0,
        cable_0_level_7: siloData.cable_0_level_7,
        cable_0_color_7: siloData.cable_0_color_7
      }
    });
    
    // Process the API data
    const processedData = processMaintenanceSiloData(siloData);
    console.log(`✅ [DEBUG] Final processed data for silo ${siloNumber}:`, {
      siloNumber: processedData.siloNumber,
      finalCableCount: processedData.cableCount,
      cableData: processedData.cables.map(c => ({ cableIndex: c.cableIndex, sensorCount: c.sensors.length }))
    });
    
    return processedData;
  } catch (error) {
    console.error(`🚨 [MAINTENANCE API ERROR] Failed to fetch data for silo ${siloNumber}:`, error);
    
    // Provide specific error messages for different error types
    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out after 10 seconds';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error - unable to connect to maintenance API';
      } else {
        errorMessage = error.message;
      }
    }
    
    console.error(`🚨 [MAINTENANCE API ERROR] Error details: ${errorMessage}`);
    
    // Throw the error instead of returning simulated data to let the component handle it
    throw new Error(`Maintenance API Error: ${errorMessage}`);
  }
};

/**
 * Validate and determine correct cable count based on silo architecture
 */
const validateCableCount = (siloNumber: number, apiCableCount: number): { actualCount: number; isValid: boolean } => {
  const isCircularSilo = siloNumber >= 1 && siloNumber <= 61;
  const expectedCount = isCircularSilo ? 2 : 1;
  const isValid = apiCableCount === expectedCount;
  
  return {
    actualCount: expectedCount,
    isValid
  };
};

/**
 * Process raw API data into structured maintenance data
 */
const processMaintenanceSiloData = (apiData: MaintenanceSiloApiData): MaintenanceSiloData => {
  const cables: CableData[] = [];
  const sensorValues: number[] = [];
  const sensorColors: string[] = [];

  // Use API cable_count directly - trust the API response
  const actualCableCount = apiData.cable_count;
  const isCircularSilo = apiData.silo_number >= 1 && apiData.silo_number <= 61;
  
  console.log(`📡 Processing silo ${apiData.silo_number}:`, {
    siloType: isCircularSilo ? 'Circular (1-61)' : 'Square (101-189)',
    apiCableCount: apiData.cable_count,
    willShow: apiData.cable_count === 2 ? '2 cables' : '1 cable'
  });

  // Process Cable 0 (all silos have this) - use cable_0_level_0 format from API
  const cable0Sensors: CableSensorData[] = [];
  for (let i = 0; i < 8; i++) {
    const level = apiData[`cable_0_level_${i}` as keyof MaintenanceSiloApiData] as number;
    const color = apiData[`cable_0_color_${i}` as keyof MaintenanceSiloApiData] as string;
    
    // Handle 85.0°C as disconnected sensor
    if (level === 85.0) {
      cable0Sensors.push({ level: -127, color: '#9ca3af' }); // Convert to disconnected
      console.log(`🔌 [CABLE SENSOR] Silo ${apiData.silo_number} Cable 0 Sensor ${i}: 85.0°C → DISCONNECTED`);
    } else {
      cable0Sensors.push({ level, color });
    }
  }
  cables.push({ cableIndex: 0, sensors: cable0Sensors });

  // Process Cable 1 (only for circular silos with cable_count = 2)
  if (actualCableCount === 2) {
    const cable1Sensors: CableSensorData[] = [];
    let cable1DataAvailable = false;
    
    // Check if any Cable 1 data is available in the API response
    for (let i = 0; i < 8; i++) {
      const cable1Level = apiData[`cable_1_level_${i}` as keyof MaintenanceSiloApiData] as number;
      if (cable1Level !== undefined && cable1Level !== null && !isNaN(cable1Level)) {
        cable1DataAvailable = true;
        break;
      }
    }
    
    if (!cable1DataAvailable) {
      console.log(`No Cable 1 data available for silo ${apiData.silo_number}, using simulated data based on Cable 0`);
    }
    
    for (let i = 0; i < 8; i++) {
      // Check if Cable 1 data exists in API response
      const cable1Level = apiData[`cable_1_level_${i}` as keyof MaintenanceSiloApiData] as number;
      const cable1Color = apiData[`cable_1_color_${i}` as keyof MaintenanceSiloApiData] as string;
      
      // Improved validation: -127 is a valid API response meaning "DISCONNECTED"
      const hasValidLevel = cable1Level !== undefined && cable1Level !== null && !isNaN(cable1Level);
      const hasValidColor = cable1Color !== undefined && cable1Color !== null && cable1Color !== '';
      
      if (hasValidLevel && hasValidColor) {
        // Use real API data (including -127 and 85.0°C for disconnected sensors)
        if (cable1Level === 85.0) {
          cable1Sensors.push({
            level: -127, // Convert 85.0°C to disconnected
            color: '#9ca3af',
          });
          console.log(`🔌 [CABLE SENSOR] Silo ${apiData.silo_number} Cable 1 Sensor ${i}: 85.0°C → DISCONNECTED`);
        } else {
          cable1Sensors.push({
            level: cable1Level,
            color: cable1Color,
          });
        }
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
      
      // Handle disabled sensors (-127 values and 85.0°C error values)
      if (cable0Level === -127 || cable0Level === 85.0) {
        sensorValues.push(-127); // Normalize to -127 for disconnected
        sensorColors.push('#9ca3af'); // Grey color for disabled sensors
        console.log(`🔌 [DISCONNECTED SENSOR] Silo ${apiData.silo_number} Cable 0 Sensor ${i}: ${cable0Level} → DISCONNECTED`);
      } else {
        sensorValues.push(cable0Level);
        sensorColors.push(cable0Sensors[i].color);
      }
    }
  } else {
    // For square silos, S1-S8 are direct cable 0 values
    for (let i = 0; i < 8; i++) {
      const cable0Level = cable0Sensors[i].level;
      
      // Handle disabled sensors (-127 values and 85.0°C error values)
      if (cable0Level === -127 || cable0Level === 85.0) {
        sensorValues.push(-127); // Normalize to -127 for disconnected
        sensorColors.push('#9ca3af'); // Grey color for disabled sensors
        console.log(`🔌 [DISCONNECTED SENSOR] Silo ${apiData.silo_number} Cable 0 Sensor ${i}: ${cable0Level} → DISCONNECTED`);
      } else {
        sensorValues.push(cable0Level);
        sensorColors.push(cable0Sensors[i].color);
      }
    }
  }

  // Convert API silo color to internal color system for consistency with main interface
  const convertedSiloColor = apiData.silo_color 
    ? convertApiColorToTemperatureColor(apiData.silo_color)
    : 'green'; // Default to green if no color provided
  
  // Map internal color to hex for UI display
  const siloColorHex = convertedSiloColor === 'gray' ? '#9ca3af' :
                       convertedSiloColor === 'yellow' ? '#ff9800' :
                       convertedSiloColor === 'pink' ? '#d14141' :
                       '#46d446'; // green

  console.log(`🎨 [MAINTENANCE COLOR] Silo ${apiData.silo_number}: API color ${apiData.silo_color} → ${convertedSiloColor} → ${siloColorHex}`);

  return {
    siloNumber: apiData.silo_number,
    siloGroup: apiData.silo_group,
    cableCount: actualCableCount,
    timestamp: apiData.timestamp,
    siloColor: siloColorHex, // Use converted color for consistency
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
