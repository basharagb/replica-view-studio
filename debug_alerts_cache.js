// Debug script to test alerts cache and force refresh
console.log('🚨 [DEBUG] Testing alerts cache and refresh...');

// Import the alerts service functions
import { 
  fetchActiveAlerts, 
  clearAlertsCache, 
  refreshAlerts,
  getCriticalAlertsCount,
  getWarningAlertsCount,
  getDisconnectAlertsCount
} from './src/services/alertsApiService.js';

const debugAlertsSystem = async () => {
  try {
    console.log('🚨 [DEBUG] Step 1: Clearing alerts cache...');
    clearAlertsCache();
    
    console.log('🚨 [DEBUG] Step 2: Fetching fresh alerts...');
    const result = await refreshAlerts();
    
    console.log('🚨 [DEBUG] Result:', {
      alertsCount: result.alerts.length,
      isLoading: result.isLoading,
      error: result.error
    });
    
    if (result.alerts.length > 0) {
      console.log('🚨 [DEBUG] Alert counts by type:');
      console.log('  Critical:', getCriticalAlertsCount());
      console.log('  Warning:', getWarningAlertsCount());
      console.log('  Disconnect:', getDisconnectAlertsCount());
      
      console.log('🚨 [DEBUG] First 3 alerts:', result.alerts.slice(0, 3));
    }
    
    return result;
    
  } catch (error) {
    console.error('🚨 [DEBUG] Debug failed:', error);
    throw error;
  }
};

// Test the system
debugAlertsSystem()
  .then(() => console.log('🚨 [DEBUG] Debug completed successfully'))
  .catch(error => console.error('🚨 [DEBUG] Debug failed:', error));
