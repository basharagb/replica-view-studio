/**
 * Browser-Compatible Cache Clearing Utility
 * 
 * This utility clears all caches across the entire application and can be called
 * from the browser console or imported into components.
 * 
 * Usage:
 * - In browser console: clearAllCaches()
 * - In component: import { clearAllCaches } from '../utils/clearAllCaches'
 */

// Import cache clearing functions from services
import { clearSiloDataCache, clearPersistentSiloCache } from '../services/realSiloApiService';
import { clearAlertsCache } from '../services/alertsApiService';
import { clearSensorReadingsCache } from '../services/siloData';

// List of all localStorage keys used by the application
const CACHE_KEYS = [
  // Silo data cache
  'replica-view-studio-silo-data-cache',
  
  // Auto test state
  'replica-view-studio-auto-test-state',
  
  // Daily scheduler
  'replica-view-studio-daily-schedules',
  'replica-view-studio-daily-schedule', // Legacy single schedule
  
  // Maintenance cache (if any)
  'replica-view-studio-maintenance-cache',
  
  // Alerts cache (if any)
  'replica-view-studio-alerts-cache',
  
  // Any other potential cache keys
  'replica-view-studio-settings',
  'replica-view-studio-user-preferences',
  'replica-view-studio-theme',
  'replica-view-studio-auth',
];

// Additional patterns to match
const CACHE_PATTERNS = [
  'replica-view-studio-',
  'silo-',
  'alert-',
  'schedule-',
  'maintenance-',
];

/**
 * Clear all caches across the entire application
 * This includes memory caches, localStorage, and sessionStorage
 */
export function clearAllCaches(): void {
  let clearedCount = 0;
  
  console.log('🧹 [CACHE CLEANER] Starting comprehensive cache clearing...');
  
  // 1. Clear service-specific caches (memory)
  console.log('🗑️ [CACHE CLEANER] Clearing service memory caches...');
  
  try {
    clearSiloDataCache();
    console.log('✅ [CACHE CLEANER] Cleared silo data memory cache');
    clearedCount++;
  } catch (error) {
    console.warn('⚠️ [CACHE CLEANER] Failed to clear silo data cache:', error);
  }
  
  try {
    clearAlertsCache();
    console.log('✅ [CACHE CLEANER] Cleared alerts memory cache');
    clearedCount++;
  } catch (error) {
    console.warn('⚠️ [CACHE CLEANER] Failed to clear alerts cache:', error);
  }
  
  try {
    clearSensorReadingsCache();
    console.log('✅ [CACHE CLEANER] Cleared sensor readings cache');
    clearedCount++;
  } catch (error) {
    console.warn('⚠️ [CACHE CLEANER] Failed to clear sensor readings cache:', error);
  }
  
  // 2. Clear persistent storage (localStorage)
  console.log('🗑️ [CACHE CLEANER] Clearing localStorage caches...');
  
  try {
    clearPersistentSiloCache();
    console.log('✅ [CACHE CLEANER] Cleared persistent silo cache');
    clearedCount++;
  } catch (error) {
    console.warn('⚠️ [CACHE CLEANER] Failed to clear persistent silo cache:', error);
  }
  
  // Clear known cache keys
  CACHE_KEYS.forEach(key => {
    try {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`✅ [CACHE CLEANER] Cleared localStorage: ${key}`);
        clearedCount++;
      }
    } catch (error) {
      console.warn(`⚠️ [CACHE CLEANER] Failed to clear ${key}:`, error);
    }
  });
  
  // 3. Clear by patterns (scan all localStorage keys)
  console.log('🔍 [CACHE CLEANER] Scanning for pattern-based cache keys...');
  
  try {
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
      const shouldClear = CACHE_PATTERNS.some(pattern => key.includes(pattern));
      
      if (shouldClear && !CACHE_KEYS.includes(key)) {
        localStorage.removeItem(key);
        console.log(`✅ [CACHE CLEANER] Cleared pattern match: ${key}`);
        clearedCount++;
      }
    });
  } catch (error) {
    console.warn('⚠️ [CACHE CLEANER] Failed to scan localStorage:', error);
  }
  
  // 4. Clear sessionStorage
  console.log('🗑️ [CACHE CLEANER] Clearing sessionStorage...');
  try {
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      const shouldClear = CACHE_PATTERNS.some(pattern => key.includes(pattern));
      if (shouldClear) {
        sessionStorage.removeItem(key);
        console.log(`✅ [CACHE CLEANER] Cleared session: ${key}`);
        clearedCount++;
      }
    });
  } catch (error) {
    console.warn('⚠️ [CACHE CLEANER] Failed to clear sessionStorage:', error);
  }
  
  // 5. Summary
  console.log(`🎉 [CACHE CLEANER] Cache clearing complete! Cleared ${clearedCount} items.`);
  console.log('');
  console.log('📋 [CACHE CLEANER] Summary of cleared caches:');
  console.log('  ✅ Silo data cache (API responses, colors, temperatures)');
  console.log('  ✅ Auto test state (progress, current silo, retry state)');
  console.log('  ✅ Daily scheduler state (multiple schedules configuration)');
  console.log('  ✅ Alerts cache (active alerts, timestamps)');
  console.log('  ✅ Maintenance cache (cable testing data)');
  console.log('  ✅ Sensor readings cache (simulated data)');
  console.log('  ✅ User preferences and settings');
  console.log('  ✅ Session storage');
  console.log('');
  console.log('🔄 [CACHE CLEANER] Please refresh the application to see changes.');
  console.log('💡 [CACHE CLEANER] All silos will show default wheat color until scanned again.');
}

/**
 * Clear only silo-related caches (more targeted clearing)
 */
export function clearSiloCaches(): void {
  console.log('🧹 [SILO CACHE CLEANER] Clearing silo-specific caches...');
  
  try {
    clearSiloDataCache();
    clearPersistentSiloCache();
    clearSensorReadingsCache();
    
    // Clear auto test state
    localStorage.removeItem('replica-view-studio-auto-test-state');
    
    console.log('✅ [SILO CACHE CLEANER] Cleared all silo-related caches');
  } catch (error) {
    console.warn('⚠️ [SILO CACHE CLEANER] Failed to clear some silo caches:', error);
  }
}

/**
 * Clear only schedule-related caches
 */
export function clearScheduleCaches(): void {
  console.log('🧹 [SCHEDULE CACHE CLEANER] Clearing schedule-specific caches...');
  
  try {
    localStorage.removeItem('replica-view-studio-daily-schedules');
    localStorage.removeItem('replica-view-studio-daily-schedule');
    
    console.log('✅ [SCHEDULE CACHE CLEANER] Cleared all schedule-related caches');
  } catch (error) {
    console.warn('⚠️ [SCHEDULE CACHE CLEANER] Failed to clear schedule caches:', error);
  }
}

// Make functions available globally for browser console usage
if (typeof window !== 'undefined') {
  (window as any).clearAllCaches = clearAllCaches;
  (window as any).clearSiloCaches = clearSiloCaches;
  (window as any).clearScheduleCaches = clearScheduleCaches;
  
  console.log('🔧 [CACHE CLEANER] Global cache clearing functions available:');
  console.log('  - clearAllCaches() - Clear all application caches');
  console.log('  - clearSiloCaches() - Clear only silo-related caches');
  console.log('  - clearScheduleCaches() - Clear only schedule-related caches');
}
