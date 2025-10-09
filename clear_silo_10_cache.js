// Clear Silo 10 cache to apply S8 sensor fix immediately
console.log('🧹 Clearing Silo 10 cache to apply S8 sensor fix...');

// Clear localStorage cache for Silo 10
if (typeof localStorage !== 'undefined') {
    const keys = Object.keys(localStorage);
    const silo10Keys = keys.filter(key => key.includes('silo') && key.includes('10'));
    silo10Keys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`Removed localStorage key: ${key}`);
    });
}

// Clear sessionStorage cache for Silo 10
if (typeof sessionStorage !== 'undefined') {
    const keys = Object.keys(sessionStorage);
    const silo10Keys = keys.filter(key => key.includes('silo') && key.includes('10'));
    silo10Keys.forEach(key => {
        sessionStorage.removeItem(key);
        console.log(`Removed sessionStorage key: ${key}`);
    });
}

console.log('✅ Silo 10 cache cleared!');
console.log('🎯 Expected result: S8 should now show 25.75°C (same as S7) instead of gray/disconnected');
console.log('📱 Action: Scan Silo 10 to see the fix in action');
