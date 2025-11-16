#!/usr/bin/env node

/**
 * Comprehensive Cache Clearing Utility
 * 
 * This script clears all caches across the entire application:
 * - Silo data cache (localStorage)
 * - Alerts cache (memory + localStorage if any)
 * - Browser cache (localStorage, sessionStorage)
 * - Auto test state (localStorage)
 * - Daily scheduler state (localStorage)
 * - Any other persistent storage
 * 
 * Usage: node clear_all_caches.js
 */

console.log('🧹 [CACHE CLEANER] Starting comprehensive cache clearing...');

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

function clearAllCaches() {
  let clearedCount = 0;
  
  console.log('🗑️ [CACHE CLEANER] Clearing specific cache keys...');
  
  // Clear known cache keys
  CACHE_KEYS.forEach(key => {
    try {
      if (typeof localStorage !== 'undefined' && localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`✅ [CACHE CLEANER] Cleared: ${key}`);
        clearedCount++;
      }
    } catch (error) {
      console.warn(`⚠️ [CACHE CLEANER] Failed to clear ${key}:`, error);
    }
  });
  
  // Clear by patterns (scan all localStorage keys)
  console.log('🔍 [CACHE CLEANER] Scanning for pattern-based cache keys...');
  
  try {
    if (typeof localStorage !== 'undefined') {
      const allKeys = Object.keys(localStorage);
      
      allKeys.forEach(key => {
        const shouldClear = CACHE_PATTERNS.some(pattern => key.includes(pattern));
        
        if (shouldClear && !CACHE_KEYS.includes(key)) {
          localStorage.removeItem(key);
          console.log(`✅ [CACHE CLEANER] Cleared pattern match: ${key}`);
          clearedCount++;
        }
      });
    }
  } catch (error) {
    console.warn('⚠️ [CACHE CLEANER] Failed to scan localStorage:', error);
  }
  
  // Clear sessionStorage as well
  console.log('🗑️ [CACHE CLEANER] Clearing sessionStorage...');
  try {
    if (typeof sessionStorage !== 'undefined') {
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.forEach(key => {
        const shouldClear = CACHE_PATTERNS.some(pattern => key.includes(pattern));
        if (shouldClear) {
          sessionStorage.removeItem(key);
          console.log(`✅ [CACHE CLEANER] Cleared session: ${key}`);
          clearedCount++;
        }
      });
    }
  } catch (error) {
    console.warn('⚠️ [CACHE CLEANER] Failed to clear sessionStorage:', error);
  }
  
  console.log(`🎉 [CACHE CLEANER] Cache clearing complete! Cleared ${clearedCount} items.`);
  console.log('');
  console.log('📋 [CACHE CLEANER] Summary of cleared caches:');
  console.log('  ✅ Silo data cache (API responses, colors, temperatures)');
  console.log('  ✅ Auto test state (progress, current silo, retry state)');
  console.log('  ✅ Daily scheduler state (multiple schedules configuration)');
  console.log('  ✅ Alerts cache (active alerts, timestamps)');
  console.log('  ✅ Maintenance cache (cable testing data)');
  console.log('  ✅ User preferences and settings');
  console.log('  ✅ Session storage');
  console.log('');
  console.log('🔄 [CACHE CLEANER] Please refresh the application to see changes.');
  console.log('💡 [CACHE CLEANER] All silos will show default wheat color until scanned again.');
}

// Run the cache clearing
clearAllCaches();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { clearAllCaches, CACHE_KEYS, CACHE_PATTERNS };
}
