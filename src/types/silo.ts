// Silo system types for enhanced temperature monitoring

// Individual sensor data with metadata
export interface SensorReading {
  id: string;           // Unique sensor identifier (e.g., "S1", "S2")
  temperature: number;  // Current temperature reading
  position: string;     // Physical position description
  calibrationStatus: 'calibrated' | 'needs_calibration' | 'error';
  timestamp: Date;      // Last reading timestamp
  isActive: boolean;    // Sensor operational status
}

// Enhanced silo interface
export interface Silo {
  num: number;          // Silo number
  temp: number;         // Maximum temperature from all sensors
  sensors?: SensorReading[];  // Optional detailed sensor data
}

// Temperature trend indicators
export type TemperatureTrend = 'rising' | 'falling' | 'stable';

// Alert levels for temperature monitoring
export type AlertLevel = 'none' | 'warning' | 'critical';

// Enhanced temperature monitoring state
export interface TemperatureMonitoringState {
  currentTemp: number;
  maxTemp: number;
  minTemp: number;
  trend: TemperatureTrend;
  alertLevel: AlertLevel;
  lastUpdated: Date;
}

export interface SiloGroup {
  topRow?: Silo[];
  middleRow?: Silo[];
  bottomRow?: Silo[];
  row1?: Silo[];
  row2?: Silo[];
  row3?: Silo[];
  row4?: Silo[];
  row5?: Silo[];
}

export type ReadingMode = 'none' | 'manual' | 'auto';

export type TemperatureColor = 'green' | 'yellow' | 'pink' | 'beige';

export interface ReadingState {
  mode: ReadingMode;
  isReading: boolean;
  readingSilo: number | null;
  autoReadProgress: number;
}

export interface SiloSystemState {
  selectedSilo: number;
  selectedTemp: number;
  hoveredSilo: Silo | null;
  tooltipPosition: { x: number; y: number };
  readingState: ReadingState;
}

export interface TooltipPosition {
  x: number;
  y: number;
}