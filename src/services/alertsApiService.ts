// Alerts API Service for fetching active alerts from the API
import { Strings } from '../utils/Strings';

// API Response interface matching the alerts API structure
export interface AlertApiResponse {
  silo_group: string;
  silo_number: number;
  cable_number: number | null;
  level_0: number | null;
  color_0: string;
  level_1: number | null;
  color_1: string;
  level_2: number | null;
  color_2: string;
  level_3: number | null;
  color_3: string;
  level_4: number | null;
  color_4: string;
  level_5: number | null;
  color_5: string;
  level_6: number | null;
  color_6: string;
  level_7: number | null;
  color_7: string;
  silo_color: string;
  timestamp: string;
  alert_type: 'critical' | 'warn' | 'disconnect';
  affected_levels: number[];
  active_since: string;
}

// Processed alert data for internal use
export interface ProcessedAlert {
  id: string;
  siloNumber: number;
  siloGroup: string;
  alertType: 'critical' | 'warning' | 'disconnect';
  affectedLevels: number[];
  sensors: number[];
  sensorColors: string[];
  siloColor: string;
  maxTemp: number;
  timestamp: Date;
  activeSince: Date;
  duration: string; // Human-readable duration
}

// Cache for storing fetched alerts data
class AlertsCache {
  private cache: ProcessedAlert[] = [];
  private lastFetch: Date | null = null;
  private readonly CACHE_DURATION_MS = 3600000; // 1 hour cache (3600 seconds)
  private isLoading: boolean = false;
  private lastError: string | null = null;

  // Check if cache is still valid
  isCacheValid(): boolean {
    if (!this.lastFetch) return false;
    return Date.now() - this.lastFetch.getTime() < this.CACHE_DURATION_MS;
  }

  // Check if currently loading
  isCurrentlyLoading(): boolean {
    return this.isLoading;
  }

  // Set loading state
  setLoading(loading: boolean): void {
    this.isLoading = loading;
  }

  // Get last error
  getLastError(): string | null {
    return this.lastError;
  }

  // Set last error
  setLastError(error: string | null): void {
    this.lastError = error;
  }

  // Get cached alerts
  getAlerts(): ProcessedAlert[] {
    return this.cache;
  }

  // Set alerts in cache
  setAlerts(alerts: ProcessedAlert[]): void {
    this.cache = alerts;
    this.lastFetch = new Date();
    this.isLoading = false;
    this.lastError = null;
  }

  // Clear cache
  clear(): void {
    this.cache = [];
    this.lastFetch = null;
    this.isLoading = false;
    this.lastError = null;
  }
}

// Global cache instance
const alertsCache = new AlertsCache();

// Calculate human-readable duration
const calculateDuration = (activeSince: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - activeSince.getTime();
  
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else {
    return `${minutes}m`;
  }
};

// Convert API response to processed alert data
const processAlertResponse = (apiData: AlertApiResponse): ProcessedAlert => {
  // Handle null values by converting them to 0
  const sensors = [
    apiData.level_0 ?? 0, apiData.level_1 ?? 0, apiData.level_2 ?? 0, apiData.level_3 ?? 0,
    apiData.level_4 ?? 0, apiData.level_5 ?? 0, apiData.level_6 ?? 0, apiData.level_7 ?? 0
  ];
  
  const sensorColors = [
    apiData.color_0, apiData.color_1, apiData.color_2, apiData.color_3,
    apiData.color_4, apiData.color_5, apiData.color_6, apiData.color_7
  ];
  
  // Filter out null/zero values when calculating max temperature
  const validTemperatures = sensors.filter(temp => temp !== null && temp > 0);
  const maxTemp = validTemperatures.length > 0 ? Math.max(...validTemperatures) : 0;
  
  const timestamp = new Date(apiData.timestamp);
  const activeSince = new Date(apiData.active_since);
  
  // Create initial ID for the alert based on silo number, alert type, and affected levels
  // Note: This ID may be updated during consolidation when merging affected levels
  const alertId = `${apiData.silo_number}-${apiData.alert_type}-${apiData.affected_levels.sort().join(',')}`;
  
  console.log(`🚨 [ALERTS API] Processing alert for Silo ${apiData.silo_number}:`, {
    alertType: apiData.alert_type,
    affectedLevels: apiData.affected_levels,
    maxTemp: `${maxTemp}°C`,
    siloColor: apiData.silo_color,
    timestamp: apiData.timestamp,
    activeSince: apiData.active_since,
    duration: calculateDuration(activeSince)
  });
  
  return {
    id: alertId,
    siloNumber: apiData.silo_number,
    siloGroup: apiData.silo_group,
    alertType: apiData.alert_type === 'warn' ? 'warning' : apiData.alert_type,
    affectedLevels: apiData.affected_levels,
    sensors,
    sensorColors,
    siloColor: apiData.silo_color,
    maxTemp,
    timestamp,
    activeSince,
    duration: calculateDuration(activeSince)
  };
};

// Consolidate duplicate alerts by merging alerts with same silo number and alert type
const consolidateAlerts = (alerts: ProcessedAlert[]): ProcessedAlert[] => {
  const alertMap = new Map<string, ProcessedAlert>();
  
  alerts.forEach(alert => {
    // Group by silo number and alert type only (not by affected levels)
    const key = `${alert.siloNumber}-${alert.alertType}`;
    
    if (alertMap.has(key)) {
      const existingAlert = alertMap.get(key)!;
      
      // Merge affected levels from both alerts (remove duplicates)
      const mergedAffectedLevels = [...new Set([...existingAlert.affectedLevels, ...alert.affectedLevels])].sort((a, b) => a - b);
      
      // Keep the alert with the most recent timestamp for sensor data, but merge affected levels
      const mergedAlert: ProcessedAlert = alert.timestamp.getTime() > existingAlert.timestamp.getTime() ? {
        ...alert,
        affectedLevels: mergedAffectedLevels,
        // Update ID to reflect merged affected levels
        id: `${alert.siloNumber}-${alert.alertType}-${mergedAffectedLevels.join(',')}`
      } : {
        ...existingAlert,
        affectedLevels: mergedAffectedLevels,
        // Update ID to reflect merged affected levels
        id: `${existingAlert.siloNumber}-${existingAlert.alertType}-${mergedAffectedLevels.join(',')}`
      };
      
      console.log(`🚨 [ALERTS API] Merging alerts for Silo ${alert.siloNumber} (${alert.alertType}): levels [${existingAlert.affectedLevels.join(',')}] + [${alert.affectedLevels.join(',')}] = [${mergedAffectedLevels.join(',')}]`);
      alertMap.set(key, mergedAlert);
    } else {
      alertMap.set(key, alert);
    }
  });
  
  const consolidatedAlerts = Array.from(alertMap.values());
  
  if (alerts.length !== consolidatedAlerts.length) {
    console.log(`🚨 [ALERTS API] Consolidated ${alerts.length} raw alerts into ${consolidatedAlerts.length} unique alerts (merged ${alerts.length - consolidatedAlerts.length} duplicate silo/type combinations)`);
  }
  
  return consolidatedAlerts;
};

// Fetch active alerts from API with improved error handling and loading states
export async function fetchActiveAlerts(forceRefresh: boolean = false): Promise<{
  alerts: ProcessedAlert[];
  isLoading: boolean;
  error: string | null;
}> {
  // Return cached data if still valid and not forcing refresh
  if (!forceRefresh && alertsCache.isCacheValid()) {
    console.log('🚨 [ALERTS API] Returning cached alerts data');
    return {
      alerts: alertsCache.getAlerts(),
      isLoading: false,
      error: null
    };
  }

  // If already loading, return current state
  if (alertsCache.isCurrentlyLoading()) {
    console.log('🚨 [ALERTS API] Already loading, returning current state');
    return {
      alerts: alertsCache.getAlerts(), // Return cached data while loading
      isLoading: true,
      error: null
    };
  }

  // Set loading state
  alertsCache.setLoading(true);
  alertsCache.setLastError(null);

  try {
    const url = Strings.URLS.ALERTS_ACTIVE;
    console.log(`🚨 [ALERTS API] Fetching active alerts from: ${url}`);

    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const urlWithTimestamp = `${url}?_t=${timestamp}`;
    
    const response = await fetch(urlWithTimestamp, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Extended timeout for large datasets (10 minutes)
      signal: AbortSignal.timeout(600000) // 10 minute timeout
    });

    if (!response.ok) {
      throw new Error(`Alerts API request failed: ${response.status} ${response.statusText}`);
    }

    const apiData: AlertApiResponse[] = await response.json();
    
    console.log(`🚨 [ALERTS API] Received ${apiData.length} active alerts`);
    
    if (!apiData || apiData.length === 0) {
      console.log('🚨 [ALERTS API] No active alerts found');
      alertsCache.setAlerts([]);
      return {
        alerts: [],
        isLoading: false,
        error: null
      };
    }

    // Process all alerts and consolidate duplicates
    const processedAlerts = apiData.map(processAlertResponse);
    
    // Consolidate duplicate alerts (same silo_number and affected_levels)
    const consolidatedAlerts = consolidateAlerts(processedAlerts);
    
    // Sort alerts by severity and then by active time (most recent first)
    consolidatedAlerts.sort((a, b) => {
      // Priority order: critical > warning > disconnect
      const severityOrder = { critical: 3, warning: 2, disconnect: 1 };
      const severityDiff = severityOrder[b.alertType] - severityOrder[a.alertType];
      
      if (severityDiff !== 0) {
        return severityDiff;
      }
      
      // If same severity, sort by active time (most recent first)
      return b.activeSince.getTime() - a.activeSince.getTime();
    });
    
    // Cache the processed data
    alertsCache.setAlerts(consolidatedAlerts);
    
    console.log(`🚨 [ALERTS API] Successfully processed ${apiData.length} raw alerts, consolidated to ${consolidatedAlerts.length} unique alerts`);
    return {
      alerts: consolidatedAlerts,
      isLoading: false,
      error: null
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('🚨 [ALERTS API] Failed to fetch active alerts:', errorMessage);
    
    // Set error state
    alertsCache.setLoading(false);
    alertsCache.setLastError(errorMessage);
    
    // Return cached data with error state
    return {
      alerts: alertsCache.getAlerts(), // Return any cached data
      isLoading: false,
      error: errorMessage
    };
  }
}

// Get alerts by silo number
export function getAlertsBySilo(siloNumber: number): ProcessedAlert[] {
  return alertsCache.getAlerts().filter(alert => alert.siloNumber === siloNumber);
}

// Get alerts by type
export function getAlertsByType(alertType: 'critical' | 'warning' | 'disconnect'): ProcessedAlert[] {
  return alertsCache.getAlerts().filter(alert => alert.alertType === alertType);
}

// Get critical alerts count
export function getCriticalAlertsCount(): number {
  return alertsCache.getAlerts().filter(alert => alert.alertType === 'critical').length;
}

// Get warning alerts count
export function getWarningAlertsCount(): number {
  return alertsCache.getAlerts().filter(alert => alert.alertType === 'warning').length;
}

// Get disconnect alerts count
export function getDisconnectAlertsCount(): number {
  return alertsCache.getAlerts().filter(alert => alert.alertType === 'disconnect').length;
}

// Clear alerts cache
export function clearAlertsCache(): void {
  alertsCache.clear();
  console.log('🚨 [ALERTS API] Cleared alerts cache');
}

// Format timestamp for display
export function formatAlertTimestamp(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

// Format duration for display
export function formatAlertDuration(activeSince: Date): string {
  return calculateDuration(activeSince);
}

// Get loading state
export function isAlertsLoading(): boolean {
  return alertsCache.isCurrentlyLoading();
}

// Get last error
export function getAlertsError(): string | null {
  return alertsCache.getLastError();
}

// Force refresh alerts (bypass cache)
export async function refreshAlerts(): Promise<{
  alerts: ProcessedAlert[];
  isLoading: boolean;
  error: string | null;
}> {
  return fetchActiveAlerts(true);
}

// Export cache instance for testing/debugging
export { alertsCache };
