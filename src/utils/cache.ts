/**
 * Cache management utilities
 */

/**
 * Clears browser cache and storage before redirecting to login
 */
export const clearCacheAndReload = async (): Promise<void> => {
  try {
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear IndexedDB if available
    if ('indexedDB' in window) {
      const databases = await indexedDB.databases();
      await Promise.all(
        databases.map(db => {
          if (db.name) {
            return new Promise<void>((resolve, reject) => {
              const deleteReq = indexedDB.deleteDatabase(db.name!);
              deleteReq.onsuccess = () => resolve();
              deleteReq.onerror = () => reject(deleteReq.error);
            });
          }
          return Promise.resolve();
        })
      );
    }
    
    // Clear service worker cache if available
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
    
    // Redirect to login page after clearing cache
    window.location.href = '/login';
  } catch (error) {
    console.warn('Cache clearing failed, redirecting to login:', error);
    // Fallback to login redirect if cache clearing fails
    window.location.href = '/login';
  }
};

/**
 * Clears only application data (localStorage, sessionStorage)
 */
export const clearApplicationData = (): void => {
  try {
    localStorage.clear();
    sessionStorage.clear();
    console.log('Application data cleared successfully');
  } catch (error) {
    console.warn('Failed to clear application data:', error);
  }
};

/**
 * Clear all API caches and application data
 */
export const clearAllCaches = (): void => {
  try {
    // Clear localStorage and sessionStorage
    clearApplicationData();
    
    // Clear specific cache keys that might be causing issues
    const cacheKeys = [
      'auth_token',
      'auth_user',
      'replica-view-studio-auto-test-state',
      'silo-data-cache',
      'alerts-cache',
      'cottage-temperature-cache'
    ];
    
    cacheKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    console.log('✅ All caches cleared successfully');
  } catch (error) {
    console.warn('❌ Failed to clear some caches:', error);
  }
};
