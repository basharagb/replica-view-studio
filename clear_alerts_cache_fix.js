// Clear alerts cache to test the affected levels fix
console.log('🧹 Clearing alerts cache to test affected levels fix...');

// Clear localStorage cache
if (typeof localStorage !== 'undefined') {
    const keys = Object.keys(localStorage);
    const alertKeys = keys.filter(key => key.includes('alert') || key.includes('Alert'));
    alertKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`Removed localStorage key: ${key}`);
    });
}

// Clear sessionStorage cache  
if (typeof sessionStorage !== 'undefined') {
    const keys = Object.keys(sessionStorage);
    const alertKeys = keys.filter(key => key.includes('alert') || key.includes('Alert'));
    alertKeys.forEach(key => {
        sessionStorage.removeItem(key);
        console.log(`Removed sessionStorage key: ${key}`);
    });
}

console.log('✅ Cache cleared! Refresh the Alert Silo Monitoring page to see the fix.');
console.log('🎯 Expected: Silo 14 should now show "Affected Levels: 1, 4, 5" instead of "0, 1, 2, 3, 4, 5, 6, 7"');
