// Script to clear alerts cache and test the new consolidation logic
// This simulates clearing the cache that would happen when refreshing alerts

console.log('🚨 [CACHE] Clearing alerts cache to test new consolidation logic...');

// In the browser console, you can run:
// 1. Open Developer Tools (F12)
// 2. Go to Console tab
// 3. Run: localStorage.clear(); sessionStorage.clear();
// 4. Refresh the page or click the refresh button in the Alert System

console.log('📝 [INSTRUCTIONS] To test the new alert consolidation:');
console.log('1. Open the browser developer tools (F12)');
console.log('2. Go to the Console tab');
console.log('3. Run: localStorage.clear(); sessionStorage.clear();');
console.log('4. Click the refresh button (🔄) in the Alert System panel');
console.log('5. Check the console logs for consolidation messages');
console.log('6. Verify Silo 22 now shows only 2 alerts instead of 6');

console.log('\n🔍 [EXPECTED RESULT] Silo 22 should show:');
console.log('- 1 Warning alert with affected levels [2, 3, 6]');
console.log('- 1 Critical alert with affected levels [4, 5, 7]');
console.log('- Total: 2 alerts instead of 6 duplicates');

console.log('\n🚨 [CONSOLE LOGS] Look for these messages in the browser console:');
console.log('- "Merging alerts for Silo 22 (warning): levels [2] + [3] = [2,3]"');
console.log('- "Merging alerts for Silo 22 (critical): levels [4] + [5] = [4,5]"');
console.log('- "Consolidated X raw alerts into Y unique alerts"');
