/**
 * API Types for Replica View Studio
 * Comprehensive TypeScript interfaces for all silo monitoring API endpoints
 */

// Base API Configuration
export const API_BASE_URL = 'http://idealchiprnd.pythonanywhere.com';

// Request Parameter Types
export interface BaseRequestParams {
  start: string; // ISO format with hour precision: "2025-07-16T00:00"
  end: string;   // ISO format with hour precision: "2025-07-16T19:00"
}

export interface SiloNumberRequestParams extends BaseRequestParams {
  silo_number: number[]; // Array of silo numbers
}

export interface GroupIdRequestParams extends BaseRequestParams {
  group_id: number[]; // Array of group IDs
}

// Enhanced request params with selectedDays for binning
export interface BinnedRequestParams {
  selectedDays: number; // Integer range [1-24]
  endTime?: Date; // Optional override for end time
}

export interface SiloBinnedRequestParams extends BinnedRequestParams {
  silo_number: number[];
}

export interface GroupBinnedRequestParams extends BinnedRequestParams {
  group_id: number[];
}

// Core Data Types
export interface SiloReading {
  id: number;
  silo_number: number;
  timestamp: string; // ISO format
  level?: number;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  flow_rate?: number;
  vibration?: number;
  power_consumption?: number;
  status?: string;
  alert_level?: 'normal' | 'warning' | 'critical';
}

export interface LevelReading {
  id: number;
  silo_number: number;
  timestamp: string;
  level: number;
  group_id?: number;
}

export interface GroupReading {
  id: number;
  group_id: number;
  silo_number: number;
  timestamp: string;
  level?: number;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  flow_rate?: number;
  vibration?: number;
  power_consumption?: number;
  status?: string;
  alert_level?: 'normal' | 'warning' | 'critical';
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  count?: number;
}

export interface APIError {
  success: false;
  error: string;
  message: string;
  timestamp: string;
  status_code: number;
}

// Specific Response Types for Each Endpoint
export interface LevelsBySiloResponse extends APIResponse<LevelReading[]> {}
export interface LevelsMaxResponse extends APIResponse<LevelReading[]> {}
export interface LevelsLatestResponse extends APIResponse<LevelReading[]> {}
export interface LevelsByGroupResponse extends APIResponse<GroupReading[]> {}
export interface ReadingsBySiloResponse extends APIResponse<SiloReading[]> {}
export interface ReadingsByGroupResponse extends APIResponse<GroupReading[]> {}

// Binned Data Types (for integration with chartBinning.ts)
export interface BinnedSiloData {
  silo_number: number;
  binIndex: number;
  timestamp: Date;
  level?: number;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  flow_rate?: number;
  vibration?: number;
  power_consumption?: number;
  count: number; // Number of raw data points in this bin
  timeRange: {
    start: Date;
    end: Date;
  };
  label: string; // X-axis label
}

export interface BinnedGroupData {
  group_id: number;
  silo_number: number;
  binIndex: number;
  timestamp: Date;
  level?: number;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  flow_rate?: number;
  vibration?: number;
  power_consumption?: number;
  count: number;
  timeRange: {
    start: Date;
    end: Date;
  };
  label: string;
}

// Aggregation Types
export type AggregationType = 'avg' | 'max' | 'min' | 'sum' | 'count' | 'latest';

export interface AggregationConfig {
  level?: AggregationType;
  temperature?: AggregationType;
  humidity?: AggregationType;
  pressure?: AggregationType;
  flow_rate?: AggregationType;
  vibration?: AggregationType;
  power_consumption?: AggregationType;
}

// Service Response Types (processed data ready for charts)
export interface ProcessedSiloData {
  silo_number: number;
  binnedData: BinnedSiloData[];
  rawDataCount: number;
  timeRange: {
    start: Date;
    end: Date;
  };
  selectedDays: number;
}

export interface ProcessedGroupData {
  group_id: number;
  silos: ProcessedSiloData[];
  combinedBinnedData: BinnedGroupData[];
  totalRawDataCount: number;
  timeRange: {
    start: Date;
    end: Date;
  };
  selectedDays: number;
}

// API Endpoint Enum
export enum APIEndpoints {
  LEVELS_BY_SILO = '/readings/by-silo-number/levels',
  LEVELS_MAX_BY_SILO = '/readings/by-silo-number/levels/max',
  LEVELS_LATEST_BY_SILO = '/readings/by-silo-number/levels/latest',
  LEVELS_BY_GROUP = '/readings/by-group/levels',
  LEVELS_MAX_BY_GROUP = '/readings/by-group/levels/max',
  LEVELS_LATEST_BY_GROUP = '/readings/by-group/levels/latest',
  READINGS_BY_SILO = '/readings/by-silo-number',
  READINGS_BY_GROUP = '/readings/by-group'
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Loading State Types
export interface LoadingState {
  isLoading: boolean;
  endpoint?: string;
  progress?: number;
  message?: string;
}

// Error State Types
export interface ErrorState {
  hasError: boolean;
  error?: APIError | Error;
  endpoint?: string;
  retryCount?: number;
  canRetry?: boolean;
}

// Chart Integration Types
export interface ChartDataConfig {
  siloNumbers?: number[];
  groupIds?: number[];
  selectedDays: number;
  dataType: 'levels' | 'temperature' | 'humidity' | 'pressure' | 'flow_rate' | 'vibration' | 'power_consumption';
  aggregationType: AggregationType;
  endTime?: Date;
}

export interface ChartState {
  data: BinnedSiloData[] | BinnedGroupData[];
  loading: LoadingState;
  error: ErrorState;
  config: ChartDataConfig;
  lastUpdated?: Date;
}
