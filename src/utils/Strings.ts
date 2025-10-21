/**
 * Global Strings class containing all application constants
 * Centralized location for URLs, messages, and other string constants
 */
export class Strings {
  // API Configuration
  static readonly BASE_URL = 'http://192.168.1.14:5000';
  // SMS API proxied via Vite dev server to avoid CORS during development
  static readonly SMS_API_URL = '/sms';
  
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
    READINGS_LATEST: '/readings/latest/by-silo-number',
    
    // Environment Temperature
    ENV_TEMP: '/env_temp',
    
    // Silo level estimate
    LEVEL_ESTIMATE_BY_NUMBER: '/silos/level-estimate/by-number',
    
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
    // Use direct backend URL for alerts
    ALERTS_ACTIVE: `${this.BASE_URL}${this.ENDPOINTS.ALERTS_ACTIVE}`,
    READINGS_AVG_LATEST: `${this.BASE_URL}${this.ENDPOINTS.READINGS_AVG_LATEST}`,
    READINGS_AVG_HISTORICAL: `${this.BASE_URL}${this.ENDPOINTS.READINGS_AVG_HISTORICAL}`,
    READINGS_LATEST: `${this.BASE_URL}${this.ENDPOINTS.READINGS_LATEST}`,
    ENV_TEMP: `${this.BASE_URL}${this.ENDPOINTS.ENV_TEMP}`,
    LEVEL_ESTIMATE_BY_NUMBER: `${this.BASE_URL}${this.ENDPOINTS.LEVEL_ESTIMATE_BY_NUMBER}`,
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
