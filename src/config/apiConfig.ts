/**
 * System-wide API Configuration
 * Manages global API settings and data source preferences for the entire application
 */

export interface APIConfig {
  baseURL: string;
  defaultDataSource: 'api' | 'mock';
  enableRealTime: boolean;
  refreshInterval: number;
  fallbackToMock: boolean;
  retryAttempts: number;
  timeout: number;
}

export interface DataSourceSettings {
  useAPIData: boolean;
  enableRealTimeUpdates: boolean;
  refreshInterval: number;
  fallbackEnabled: boolean;
}

// Global API Configuration
export const API_CONFIG: APIConfig = {
  baseURL: 'http://idealchiprnd.pythonanywhere.com',
  defaultDataSource: 'api', // API-FIRST: Use real data by default
  enableRealTime: true,
  refreshInterval: 30000, // 30 seconds
  fallbackToMock: true, // Fallback to mock only when API fails
  retryAttempts: 3,
  timeout: 30000
};

// System-wide data source settings
export const SYSTEM_DATA_SETTINGS: DataSourceSettings = {
  useAPIData: true, // PRIMARY: Always start with API data
  enableRealTimeUpdates: true,
  refreshInterval: 30000,
  fallbackEnabled: true
};

// Component-specific configurations
export const COMPONENT_CONFIGS = {
  // Live Readings Interface
  liveReadings: {
    useAPIData: true, // API-FIRST
    enableRealTime: true,
    refreshInterval: 15000, // 15 seconds for live monitoring
    showDataSourceToggle: true, // Allow manual override
    fallbackToMock: true
  },
  
  // Chart Components
  charts: {
    useAPIData: true, // API-FIRST
    enableRealTime: false, // Charts update on demand
    refreshInterval: 60000, // 1 minute
    showDataSourceToggle: false, // Hide toggle for cleaner UI
    fallbackToMock: true
  },
  
  // Temperature Displays
  temperature: {
    useAPIData: true, // API-FIRST
    enableRealTime: true,
    refreshInterval: 20000, // 20 seconds
    showDataSourceToggle: false,
    fallbackToMock: true
  },
  
  // Sensor Panels
  sensors: {
    useAPIData: true, // API-FIRST
    enableRealTime: true,
    refreshInterval: 25000, // 25 seconds
    showDataSourceToggle: false,
    fallbackToMock: true
  }
};

// Environment-based configuration
export function getEnvironmentConfig(): APIConfig {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    return {
      ...API_CONFIG,
      defaultDataSource: 'api', // Production: Always API
      fallbackToMock: false, // No fallback in production
      enableRealTime: true
    };
  }
  
  if (isDevelopment) {
    return {
      ...API_CONFIG,
      defaultDataSource: 'api', // Development: Still API-first
      fallbackToMock: true, // Allow fallback for development
      enableRealTime: true
    };
  }
  
  return API_CONFIG;
}

// Global state management for data source
class DataSourceManager {
  private static instance: DataSourceManager;
  private currentSettings: DataSourceSettings;
  private subscribers: Set<(settings: DataSourceSettings) => void> = new Set();
  
  private constructor() {
    this.currentSettings = { ...SYSTEM_DATA_SETTINGS };
  }
  
  static getInstance(): DataSourceManager {
    if (!DataSourceManager.instance) {
      DataSourceManager.instance = new DataSourceManager();
    }
    return DataSourceManager.instance;
  }
  
  getSettings(): DataSourceSettings {
    return { ...this.currentSettings };
  }
  
  updateSettings(newSettings: Partial<DataSourceSettings>): void {
    this.currentSettings = { ...this.currentSettings, ...newSettings };
    this.notifySubscribers();
  }
  
  subscribe(callback: (settings: DataSourceSettings) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
  
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.currentSettings));
  }
  
  // Force API mode system-wide
  enableAPIMode(): void {
    this.updateSettings({
      useAPIData: true,
      enableRealTimeUpdates: true
    });
  }
  
  // Emergency fallback to mock mode
  enableMockMode(): void {
    this.updateSettings({
      useAPIData: false,
      enableRealTimeUpdates: false
    });
  }
  
  // Toggle real-time updates system-wide
  toggleRealTime(): void {
    this.updateSettings({
      enableRealTimeUpdates: !this.currentSettings.enableRealTimeUpdates
    });
  }
}

export const dataSourceManager = DataSourceManager.getInstance();

// Utility functions
export function isAPIMode(): boolean {
  return dataSourceManager.getSettings().useAPIData;
}

export function isRealTimeEnabled(): boolean {
  return dataSourceManager.getSettings().enableRealTimeUpdates;
}

export function getComponentConfig(component: keyof typeof COMPONENT_CONFIGS) {
  return COMPONENT_CONFIGS[component];
}

// Initialize system with API-first configuration
export function initializeSystem(): void {
  console.log('🚀 Initializing Replica View Studio with API-FIRST configuration');
  console.log('📡 Primary Data Source: API');
  console.log('🔄 Real-time Updates: Enabled');
  console.log('🛡️ Fallback Mode: Mock data (emergency only)');
  
  // Force API mode on startup
  dataSourceManager.enableAPIMode();
}

// System health check
export async function performSystemHealthCheck(): Promise<{
  apiAvailable: boolean;
  realTimeWorking: boolean;
  fallbackReady: boolean;
  overallStatus: 'healthy' | 'degraded' | 'critical';
}> {
  try {
    // Test API connectivity
    const response = await fetch(`${API_CONFIG.baseURL}/readings/by-silo-number?silo_number=1&start=2025-07-16T00:00&end=2025-07-16T19:00`, {
      method: 'GET',
      timeout: 10000
    });
    
    const apiAvailable = response.ok;
    const realTimeWorking = isRealTimeEnabled();
    const fallbackReady = true; // Mock data always available
    
    let overallStatus: 'healthy' | 'degraded' | 'critical';
    
    if (apiAvailable && realTimeWorking) {
      overallStatus = 'healthy';
    } else if (apiAvailable || fallbackReady) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'critical';
    }
    
    return {
      apiAvailable,
      realTimeWorking,
      fallbackReady,
      overallStatus
    };
  } catch (error) {
    return {
      apiAvailable: false,
      realTimeWorking: false,
      fallbackReady: true,
      overallStatus: 'critical'
    };
  }
}
