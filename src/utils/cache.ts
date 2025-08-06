/**
 * Cache management utilities
 */

/**
 * Clears browser cache and storage before reload
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
    
    // Force reload with cache bypass
    window.location.reload();
  } catch (error) {
    console.warn('Cache clearing failed, performing regular reload:', error);
    // Fallback to regular reload if cache clearing fails
    window.location.reload();
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
