// Clear maintenance cache to apply Silo 10 S8 sensor fix
console.log('🧹 Clearing maintenance cache to apply S8 sensor fix...');

// Clear localStorage cache for maintenance
if (typeof localStorage !== 'undefined') {
    const keys = Object.keys(localStorage);
    const maintenanceKeys = keys.filter(key => 
        key.includes('maintenance') || 
        key.includes('Maintenance') || 
        key.includes('cable') ||
        key.includes('Cable')
    );
    maintenanceKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`Removed localStorage key: ${key}`);
    });
}

// Clear sessionStorage cache for maintenance
if (typeof sessionStorage !== 'undefined') {
    const keys = Object.keys(sessionStorage);
    const maintenanceKeys = keys.filter(key => 
        key.includes('maintenance') || 
        key.includes('Maintenance') || 
        key.includes('cable') ||
        key.includes('Cable')
    );
    maintenanceKeys.forEach(key => {
        sessionStorage.removeItem(key);
        console.log(`Removed sessionStorage key: ${key}`);
    });
}

console.log('✅ Maintenance cache cleared!');
console.log('🎯 Expected result: In maintenance page, Silo 10 S8 should show same value as S7 instead of DISCONNECTED');
console.log('📱 Action: Open Silo 10 maintenance page to see the fix in action');
