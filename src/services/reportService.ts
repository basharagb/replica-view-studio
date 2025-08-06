import { SiloReportData, AlarmReportData, SensorReading } from '../types/reports';
import { getSiloColorByNumber, getAlertLevel, getSensorReadings } from './siloData';
import { topSiloGroups, bottomSiloGroups, cylinderSilos } from './siloData';

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

// Get silos that currently have alarms
export const getAlarmedSilos = (): Array<{ number: number; status: string }> => {
  const allSiloNumbers = getAllSiloNumbers();
  const alarmedSilos: Array<{ number: number; status: string }> = [];
  
  allSiloNumbers.forEach(siloNum => {
    const sensorReadings = getSensorReadings(siloNum);
    const maxTemp = Math.max(...sensorReadings);
    const alertLevel = getAlertLevel(maxTemp);
    
    // Consider Warning and Critical as alarmed states
    if (alertLevel === 'warning' || alertLevel === 'critical') {
      alarmedSilos.push({
        number: siloNum,
        status: alertLevel === 'critical' ? 'Critical' : 'Warning'
      });
    }
  });
  
  return alarmedSilos;
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
  if (maxTemp >= 30) return 'Warning';
  return 'Normal';
};

// Generate silo report data for a specific silo and time period
export const generateSiloReportData = (
  siloNumber: number,
  startDate: Date,
  endDate: Date
): SiloReportData[] => {
  const data: SiloReportData[] = [];
  const timeDiff = endDate.getTime() - startDate.getTime();
  const intervalMinutes = Math.max(5, Math.floor(timeDiff / (1000 * 60 * 100))); // Max 100 records
  
  let currentTime = new Date(startDate);
  
  while (currentTime <= endDate) {
    const sensorReadings = generateHistoricalSensorReadings(siloNumber, currentTime);
    const alarmStatus = generateAlarmStatus(sensorReadings);
    const siloTemperature = Math.max(
      sensorReadings.sensor1,
      sensorReadings.sensor2,
      sensorReadings.sensor3,
      sensorReadings.sensor4,
      sensorReadings.sensor5,
      sensorReadings.sensor6,
      sensorReadings.sensor7,
      sensorReadings.sensor8
    );
    
    data.push({
      dateTime: new Date(currentTime),
      sensorReadings,
      alarmStatus,
      siloTemperature
    });
    
    // Move to next interval
    currentTime = new Date(currentTime.getTime() + intervalMinutes * 60 * 1000);
  }
  
  return data;
};

// Generate alarm report data for multiple silos and time period
export const generateAlarmReportData = (
  siloNumbers: number[],
  startDate: Date,
  endDate: Date
): AlarmReportData[] => {
  const data: AlarmReportData[] = [];
  
  siloNumbers.forEach(siloNumber => {
    const siloData = generateSiloReportData(siloNumber, startDate, endDate);
    
    // Convert to alarm report data and filter only alarmed records
    siloData.forEach(record => {
      if (record.alarmStatus === 'Warning' || record.alarmStatus === 'Critical') {
        data.push({
          ...record,
          siloNumber
        });
      }
    });
  });
  
  // Sort by date time and then by silo number
  return data.sort((a, b) => {
    const timeDiff = a.dateTime.getTime() - b.dateTime.getTime();
    if (timeDiff !== 0) return timeDiff;
    return a.siloNumber - b.siloNumber;
  });
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
