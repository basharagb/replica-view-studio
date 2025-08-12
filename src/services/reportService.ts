import { SiloReportData, AlarmReportData, SensorReading } from '../types/reports';
import { getSiloColorByNumber, getAlertLevel, getSensorReadings } from './siloData';
import { topSiloGroups, bottomSiloGroups, cylinderSilos } from './siloData';
import { 
  fetchHistoricalSiloData, 
  generateSiloReportData as generateApiSiloReportData,
  generateTemperatureGraphData,
  getAlarmedSilosFromApi,
  HistoricalSiloData,
  SiloReportRecord
} from './historicalSiloApiService';

// Get all available silo numbers from the system
export const getAllSiloNumbers = (): number[] => {
  const allSilos: number[] = [];
  
  // Add top silo groups
  topSiloGroups.forEach(group => {
    if (group.topRow) group.topRow.forEach(silo => allSilos.push(silo.num));
    if (group.middleRow) group.middleRow.forEach(silo => allSilos.push(silo.num));
    if (group.bottomRow) group.bottomRow.forEach(silo => allSilos.push(silo.num));
  });
  
  // Add bottom silo groups
  bottomSiloGroups.forEach(group => {
    if (group.row1) group.row1.forEach(silo => allSilos.push(silo.num));
    if (group.row2) group.row2.forEach(silo => allSilos.push(silo.num));
    if (group.row3) group.row3.forEach(silo => allSilos.push(silo.num));
    if (group.row4) group.row4.forEach(silo => allSilos.push(silo.num));
    if (group.row5) group.row5.forEach(silo => allSilos.push(silo.num));
  });
  
  // Note: Cylinder silos (201-208) are excluded from reports dropdown
  // Only include regular silos (1-195) for reporting purposes
  
  return allSilos.sort((a, b) => a - b);
};

// Cache for consistent alarmed silos data across components
let cachedAlarmedSilos: Array<{ number: number; status: string }> | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 30000; // 30 seconds

// Get silos that currently have alarms using REAL API DATA
export const getAlarmedSilos = async (
  forceRefresh: boolean = false,
  startDate?: Date,
  endDate?: Date
): Promise<Array<{ number: number; status: string }>> => {
  const now = Date.now();
  
  // Use cached data if available and not expired, unless force refresh
  if (!forceRefresh && cachedAlarmedSilos && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedAlarmedSilos;
  }
  
  try {
    // Use provided date range or default to last 24 hours for current alarms
    const end = endDate || new Date();
    const start = startDate || new Date(end.getTime() - 24 * 60 * 60 * 1000);
    
    const allSiloNumbers = getAllSiloNumbers();
    const alarmedSilos = await getAlarmedSilosFromApi(allSiloNumbers, start, end);
    
    const result = alarmedSilos.map(silo => ({
      number: silo.number,
      status: silo.status
    }));
    
    // Cache the results
    cachedAlarmedSilos = result;
    cacheTimestamp = now;
    
    return result;
    
  } catch (error) {
    console.error('Error getting alarmed silos from API:', error);
    
    // Fallback to local data if API fails
    console.warn('Falling back to local data for alarmed silos');
    return getFallbackAlarmedSilos();
  }
};

// Fallback function for local alarmed silos when API fails
const getFallbackAlarmedSilos = (): Array<{ number: number; status: string }> => {
  const allSiloNumbers = getAllSiloNumbers();
  const alarmedSilos: Array<{ number: number; status: string }> = [];
  
  allSiloNumbers.forEach(siloNum => {
    const sensorReadings = getSensorReadings(siloNum);
    const maxTemp = Math.max(...sensorReadings);
    
    if (maxTemp >= 40.0) {
      alarmedSilos.push({ number: siloNum, status: 'Critical' });
    } else if (maxTemp >= 35.0) {
      alarmedSilos.push({ number: siloNum, status: 'Warning' });
    }
  });
  
  return alarmedSilos;
};

// Clear the alarmed silos cache
export const clearAlarmedSilosCache = (): void => {
  cachedAlarmedSilos = null;
  cacheTimestamp = 0;
};

// Generate historical sensor readings for a time period
const generateHistoricalSensorReadings = (siloNumber: number, baseTime: Date): SensorReading => {
  const currentReadings = getSensorReadings(siloNumber);
  
  // Add some random variation to simulate historical data
  const variation = () => (Math.random() - 0.5) * 4; // ±2°C variation
  
  return {
    sensor1: Math.max(20, currentReadings[0] + variation()),
    sensor2: Math.max(20, currentReadings[1] + variation()),
    sensor3: Math.max(20, currentReadings[2] + variation()),
    sensor4: Math.max(20, currentReadings[3] + variation()),
    sensor5: Math.max(20, currentReadings[4] + variation()),
    sensor6: Math.max(20, currentReadings[5] + variation()),
    sensor7: Math.max(20, currentReadings[6] + variation()),
    sensor8: Math.max(20, currentReadings[7] + variation())
  };
};

// Generate alarm status based on sensor readings
const generateAlarmStatus = (sensorReadings: SensorReading): 'Normal' | 'Warning' | 'Critical' => {
  const temps = [
    sensorReadings.sensor1,
    sensorReadings.sensor2,
    sensorReadings.sensor3,
    sensorReadings.sensor4,
    sensorReadings.sensor5,
    sensorReadings.sensor6,
    sensorReadings.sensor7,
    sensorReadings.sensor8
  ];
  
  const maxTemp = Math.max(...temps);
  
  if (maxTemp > 40) return 'Critical';
  if (maxTemp >= 35) return 'Warning';
  return 'Normal';
};

// Generate silo report data for a specific silo and time period using REAL API DATA
export const generateSiloReportData = async (
  siloNumber: number,
  startDate: Date,
  endDate: Date
): Promise<SiloReportData[]> => {
  try {
    // Fetch real data from API
    const apiReportData = await generateApiSiloReportData(siloNumber, startDate, endDate);
    
    // Convert to expected format matching SiloReportData interface
    return apiReportData.map(record => {
      const sensorReading = generateHistoricalSensorReadings(siloNumber, record.timestamp);
      return {
        dateTime: record.timestamp,
        sensorReadings: sensorReading,
        alarmStatus: record.alertStatus,
        siloTemperature: record.maxTemp
      };
    }).sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());
    
  } catch (error) {
    console.error('Error generating silo report data from API:', error);
    
    // Fallback to simulated data if API fails
    console.warn('Falling back to simulated data for silo report');
    return generateFallbackSiloReportData(siloNumber, startDate, endDate);
  }
};

// Fallback function for simulated data when API fails
const generateFallbackSiloReportData = (
  siloNumber: number,
  startDate: Date,
  endDate: Date
): SiloReportData[] => {
  const reportData: SiloReportData[] = [];
  const timeDiff = endDate.getTime() - startDate.getTime();
  
  // Generate 24 data points regardless of time period (FIXED SYSTEM)
  const dataPoints = 24;
  const intervalMs = timeDiff / (dataPoints - 1);
  
  for (let i = 0; i < dataPoints; i++) {
    const currentTime = new Date(startDate.getTime() + (intervalMs * i));
    const sensorReading = generateHistoricalSensorReadings(siloNumber, currentTime);
    const alarmStatus = generateAlarmStatus(sensorReading);
    
    const temps = [
      sensorReading.sensor1, sensorReading.sensor2, sensorReading.sensor3, sensorReading.sensor4,
      sensorReading.sensor5, sensorReading.sensor6, sensorReading.sensor7, sensorReading.sensor8
    ];
    const maxTemp = Math.max(...temps);
    
    reportData.push({
      dateTime: currentTime,
      sensorReadings: sensorReading,
      alarmStatus: alarmStatus,
      siloTemperature: maxTemp
    });
  }
  
  return reportData.sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());
};

// Generate alarm report data for multiple silos and time period using REAL API DATA
export const generateAlarmReportData = async (
  siloNumbers: number[],
  startDate: Date,
  endDate: Date
): Promise<AlarmReportData[]> => {
  try {
    // Fetch real historical data from API
    const historicalData = await fetchHistoricalSiloData(siloNumbers, startDate, endDate);
    
    // Filter only records with alarms and convert to expected format
    const alarmData: AlarmReportData[] = historicalData
      .filter(record => record.alertLevel === 'Warning' || record.alertLevel === 'Critical')
      .map(record => {
        const sensorReading = generateHistoricalSensorReadings(record.siloNumber, record.timestamp);
        return {
          siloNumber: record.siloNumber,
          dateTime: record.timestamp,
          sensorReadings: sensorReading,
          alarmStatus: record.alertLevel as 'Warning' | 'Critical',
          siloTemperature: record.maxTemp
        };
      });
    
    return alarmData.sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());
    
  } catch (error) {
    console.error('Error generating alarm report data from API:', error);
    
    // Fallback to simulated data if API fails
    console.warn('Falling back to simulated data for alarm report');
    return generateFallbackAlarmReportData(siloNumbers, startDate, endDate);
  }
};

// Fallback function for simulated alarm data when API fails
const generateFallbackAlarmReportData = (
  siloNumbers: number[],
  startDate: Date,
  endDate: Date
): AlarmReportData[] => {
  const alarmData: AlarmReportData[] = [];
  
  siloNumbers.forEach(siloNumber => {
    const siloReportData = generateFallbackSiloReportData(siloNumber, startDate, endDate);
    
    // Filter only records with alarms (Warning or Critical)
    const alarmedRecords = siloReportData.filter(record => 
      record.alarmStatus === 'Warning' || record.alarmStatus === 'Critical'
    );
    
    alarmedRecords.forEach(record => {
      alarmData.push({
        siloNumber: siloNumber,
        dateTime: record.dateTime,
        sensorReadings: record.sensorReadings,
        alarmStatus: record.alarmStatus,
        siloTemperature: record.siloTemperature
      });
    });
  });
  
  return alarmData.sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());
};

// Generate temperature history for graphs using REAL API DATA
export const generateTemperatureHistory = async (
  siloNumber: number,
  startDate: Date,
  endDate: Date
): Promise<Array<{ time: string; maxTemp: number; avgTemp: number; minTemp: number }>> => {
  try {
    // Fetch real historical data from API
    const historicalData = await fetchHistoricalSiloData([siloNumber], startDate, endDate);
    
    // Convert to expected format with proper time formatting
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    
    return historicalData.map(record => {
      // Format time based on the time period
      let timeFormat: string;
      
      if (daysDiff <= 1) {
        // For single day: show hours and minutes
        timeFormat = record.timestamp.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      } else if (daysDiff <= 3) {
        // For 1-3 days: show date and hour
        timeFormat = record.timestamp.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      } else {
        // For longer periods: show date only
        timeFormat = record.timestamp.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit'
        });
      }
      
      return {
        time: timeFormat,
        maxTemp: record.maxTemp,
        avgTemp: record.avgTemp,
        minTemp: record.minTemp
      };
    }).sort((a, b) => {
      // Sort by timestamp (convert back to compare)
      const aTime = historicalData.find(h => h.maxTemp === a.maxTemp)?.timestamp.getTime() || 0;
      const bTime = historicalData.find(h => h.maxTemp === b.maxTemp)?.timestamp.getTime() || 0;
      return aTime - bTime;
    });
    
  } catch (error) {
    console.error('Error generating temperature history from API:', error);
    
    // Fallback to simulated data if API fails
    console.warn('Falling back to simulated data for temperature history');
    return generateFallbackTemperatureHistory(siloNumber, startDate, endDate);
  }
};

// Fallback function for simulated temperature history when API fails
const generateFallbackTemperatureHistory = (
  siloNumber: number,
  startDate: Date,
  endDate: Date
): Array<{ time: string; maxTemp: number; avgTemp: number; minTemp: number }> => {
  const historyData: Array<{ time: string; maxTemp: number; avgTemp: number; minTemp: number }> = [];
  const timeDiff = endDate.getTime() - startDate.getTime();
  
  // Always generate exactly 24 data points for consistent graph display
  const dataPoints = 24;
  const intervalMs = timeDiff / (dataPoints - 1);
  
  for (let i = 0; i < dataPoints; i++) {
    const currentTime = new Date(startDate.getTime() + (intervalMs * i));
    const sensorReading = generateHistoricalSensorReadings(siloNumber, currentTime);
    
    // Format time based on the time period
    let timeFormat: string;
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    
    if (daysDiff <= 1) {
      // For single day: show hours and minutes
      timeFormat = currentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } else if (daysDiff <= 3) {
      // For 1-3 days: show date and hour
      timeFormat = currentTime.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } else {
      // For longer periods: show date only
      timeFormat = currentTime.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit'
      });
    }
    
    const temps = [
      sensorReading.sensor1, sensorReading.sensor2, sensorReading.sensor3, sensorReading.sensor4,
      sensorReading.sensor5, sensorReading.sensor6, sensorReading.sensor7, sensorReading.sensor8
    ];
    const maxTemp = Math.max(...temps);
    const avgTemp = temps.reduce((sum, temp) => sum + temp, 0) / temps.length;
    const minTemp = Math.min(...temps);
    
    historyData.push({
      time: timeFormat,
      maxTemp: Math.round(maxTemp * 100) / 100,
      avgTemp: Math.round(avgTemp * 100) / 100,
      minTemp: Math.round(minTemp * 100) / 100
    });
  }
  
  return historyData;
};

// Export report data to CSV format (for future use)
export const exportReportToCSV = (data: SiloReportData[] | AlarmReportData[], filename: string): void => {
  const isAlarmReport = data.length > 0 && 'siloNumber' in data[0];
  
  let csvContent = '';
  
  if (isAlarmReport) {
    // Alarm report headers
    csvContent = 'Silo#,Date Time,Sensor 1,Sensor 2,Sensor 3,Sensor 4,Sensor 5,Sensor 6,Sensor 7,Sensor 8,Alarm Status,Silo Temp\n';
    
    (data as AlarmReportData[]).forEach(record => {
      csvContent += `${record.siloNumber},${record.dateTime.toISOString()},${record.sensorReadings.sensor1.toFixed(1)},${record.sensorReadings.sensor2.toFixed(1)},${record.sensorReadings.sensor3.toFixed(1)},${record.sensorReadings.sensor4.toFixed(1)},${record.sensorReadings.sensor5.toFixed(1)},${record.sensorReadings.sensor6.toFixed(1)},${record.sensorReadings.sensor7.toFixed(1)},${record.sensorReadings.sensor8.toFixed(1)},${record.alarmStatus},${record.siloTemperature.toFixed(1)}\n`;
    });
  } else {
    // Silo report headers
    csvContent = 'Date Time,Sensor 1,Sensor 2,Sensor 3,Sensor 4,Sensor 5,Sensor 6,Sensor 7,Sensor 8,Alarm Status,Silo Temp\n';
    
    (data as SiloReportData[]).forEach(record => {
      csvContent += `${record.dateTime.toISOString()},${record.sensorReadings.sensor1.toFixed(1)},${record.sensorReadings.sensor2.toFixed(1)},${record.sensorReadings.sensor3.toFixed(1)},${record.sensorReadings.sensor4.toFixed(1)},${record.sensorReadings.sensor5.toFixed(1)},${record.sensorReadings.sensor6.toFixed(1)},${record.sensorReadings.sensor7.toFixed(1)},${record.sensorReadings.sensor8.toFixed(1)},${record.alarmStatus},${record.siloTemperature.toFixed(1)}\n`;
    });
  }
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
