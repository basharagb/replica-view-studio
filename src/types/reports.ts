export interface SensorReading {
  sensor1: number;
  sensor2: number;
  sensor3: number;
  sensor4: number;
  sensor5: number;
  sensor6: number;
  sensor7: number;
  sensor8: number;
}

export interface SiloReportData {
  dateTime: Date;
  sensorReadings: SensorReading;
  alarmStatus: 'Normal' | 'Warning' | 'Critical';
  siloTemperature: number;
}

export interface AlarmReportData extends SiloReportData {
  siloNumber: number;
}

export interface ReportFilters {
  startDate: Date | null;
  endDate: Date | null;
  selectedSilo?: number;
  selectedSilos?: number[];
}

export interface ReportState {
  isGenerated: boolean;
  data: SiloReportData[] | AlarmReportData[];
  filters: ReportFilters;
}

export interface PrintOptions {
  format: 'pdf' | 'printer';
  orientation: 'portrait' | 'landscape';
  includeCharts: boolean;
}
