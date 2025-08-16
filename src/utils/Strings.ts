/**
 * Global Strings class containing all application constants
 * Centralized location for URLs, messages, and other string constants
 */
export class Strings {
  // API Configuration
  static readonly BASE_URL = 'http://localhost:5000';
  
  // API Endpoints
  static readonly ENDPOINTS = {
    // Authentication
    LOGIN: '/login',
    LOGOUT: '/logout',
    
    // Alerts
    ALERTS_ACTIVE: '/alerts/active',
    
    // Readings
    READINGS_AVG_LATEST: '/readings/avg/latest/by-silo-number',
    READINGS_AVG_HISTORICAL: '/readings/avg/by-silo-number',
    
    // Maintenance
    MAINTENANCE_SILO: '/maintenance/silo',
    MAINTENANCE_CABLE: '/maintenance/cable',
    
    // Reports
    REPORTS_SILO: '/reports/silo',
    REPORTS_ALARM: '/reports/alarm',
  } as const;
  
  // Complete URLs (Base + Endpoint)
  static readonly URLS = {
    LOGIN: `${this.BASE_URL}${this.ENDPOINTS.LOGIN}`,
    LOGOUT: `${this.BASE_URL}${this.ENDPOINTS.LOGOUT}`,
    ALERTS_ACTIVE: `${this.BASE_URL}${this.ENDPOINTS.ALERTS_ACTIVE}`,
    READINGS_AVG_LATEST: `${this.BASE_URL}${this.ENDPOINTS.READINGS_AVG_LATEST}`,
    READINGS_AVG_HISTORICAL: `${this.BASE_URL}${this.ENDPOINTS.READINGS_AVG_HISTORICAL}`,
    MAINTENANCE_SILO: `${this.BASE_URL}${this.ENDPOINTS.MAINTENANCE_SILO}`,
    MAINTENANCE_CABLE: `${this.BASE_URL}${this.ENDPOINTS.MAINTENANCE_CABLE}`,
    REPORTS_SILO: `${this.BASE_URL}${this.ENDPOINTS.REPORTS_SILO}`,
    REPORTS_ALARM: `${this.BASE_URL}${this.ENDPOINTS.REPORTS_ALARM}`,
  } as const;
  
  // Application Messages
  static readonly MESSAGES = {
    LOADING: 'Loading...',
    ERROR_NETWORK: 'Network error occurred',
    ERROR_UNAUTHORIZED: 'Unauthorized access',
    SUCCESS_LOGIN: 'Login successful',
    SUCCESS_LOGOUT: 'Logout successful',
  } as const;
  
  // Application Labels
  static readonly LABELS = {
    TEMPERATURE: 'Temperature',
    SILO: 'Silo',
    SENSOR: 'Sensor',
    DISABLED: 'DISABLED',
    CRITICAL: 'Critical',
    WARNING: 'Warning',
    NORMAL: 'Normal',
  } as const;
}
