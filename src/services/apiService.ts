// API Service for fetching real silo data from the server
export interface SiloReading {
  silo_group: string;
  silo_number: number;
  cable_number: number | null;
  level_0: number;
  color_0: string;
  level_1: number;
  color_1: string;
  level_2: number;
  color_2: string;
  level_3: number;
  color_3: string;
  level_4: number;
  color_4: string;
  level_5: number;
  color_5: string;
  level_6: number;
  color_6: string;
  level_7: number;
  color_7: string;
  silo_color: string;
  timestamp: string;
}

export interface SiloData {
  num: number;
  temp: number;
  color: string;
  sensors: number[];
  sensorColors: string[];
  group: string;
  timestamp: string;
  isChecked: boolean; // Whether this silo has been tested
}

const API_BASE_URL = 'http://idealchiprnd.pythonanywhere.com';

// Cache for silo readings to avoid repeated API calls
const siloReadingsCache = new Map<number, SiloData>();
const checkedSilos = new Set<number>(); // Track which silos have been checked

// Convert API response to our internal format
const convertApiResponseToSiloData = (reading: SiloReading): SiloData => {
  const sensors = [
    reading.level_0, reading.level_1, reading.level_2, reading.level_3,
    reading.level_4, reading.level_5, reading.level_6, reading.level_7
  ];
  
  const sensorColors = [
    reading.color_0, reading.color_1, reading.color_2, reading.color_3,
    reading.color_4, reading.color_5, reading.color_6, reading.color_7
  ];

  // Calculate max temperature from sensors
  const maxTemp = Math.max(...sensors);

  return {
    num: reading.silo_number,
    temp: maxTemp,
    color: reading.silo_color,
    sensors,
    sensorColors,
    group: reading.silo_group,
    timestamp: reading.timestamp,
    isChecked: checkedSilos.has(reading.silo_number)
  };
};

// Fetch readings for specific silos
export const fetchSiloReadings = async (siloNumbers: number[]): Promise<SiloData[]> => {
  try {
    // Build query string with multiple silo_number parameters
    const queryParams = siloNumbers.map(num => `silo_number=${num}`).join('&');
    const url = `${API_BASE_URL}/readings/avg/latest/by-silo-number?${queryParams}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const readings: SiloReading[] = await response.json();
    
    // Convert to our format and cache
    const siloDataList = readings.map(reading => {
      const siloData = convertApiResponseToSiloData(reading);
      siloReadingsCache.set(siloData.num, siloData);
      return siloData;
    });
    
    return siloDataList;
  } catch (error) {
    console.error('Error fetching silo readings:', error);
    throw error;
  }
};

// Fetch single silo reading
export const fetchSingleSiloReading = async (siloNumber: number): Promise<SiloData> => {
  const readings = await fetchSiloReadings([siloNumber]);
  if (readings.length === 0) {
    throw new Error(`No reading found for silo ${siloNumber}`);
  }
  return readings[0];
};

// Mark silo as checked (tested)
export const markSiloAsChecked = (siloNumber: number): void => {
  checkedSilos.add(siloNumber);
  // Update cache if silo exists
  const cachedSilo = siloReadingsCache.get(siloNumber);
  if (cachedSilo) {
    cachedSilo.isChecked = true;
    siloReadingsCache.set(siloNumber, cachedSilo);
  }
};

// Get cached silo data or return default wheat color
export const getSiloData = (siloNumber: number): SiloData => {
  const cached = siloReadingsCache.get(siloNumber);
  if (cached) {
    return cached;
  }
  
  // Return default wheat color silo if not checked
  return {
    num: siloNumber,
    temp: 0,
    color: '#DEB887', // Wheat color
    sensors: [0, 0, 0, 0, 0, 0, 0, 0],
    sensorColors: ['#DEB887', '#DEB887', '#DEB887', '#DEB887', '#DEB887', '#DEB887', '#DEB887', '#DEB887'],
    group: `Group ${Math.ceil(siloNumber / 20)}`,
    timestamp: new Date().toISOString(),
    isChecked: false
  };
};

// Clear cache
export const clearSiloCache = (): void => {
  siloReadingsCache.clear();
  checkedSilos.clear();
};

// Get all checked silos
export const getCheckedSilos = (): number[] => {
  return Array.from(checkedSilos);
};

// Check if silo is checked
export const isSiloChecked = (siloNumber: number): boolean => {
  return checkedSilos.has(siloNumber);
};
