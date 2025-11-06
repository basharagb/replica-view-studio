// Debug script to test API endpoints from browser console
// Run this in the browser developer console to test the APIs

console.log('🔧 [DEBUG] API Testing Script');
console.log('================================');

// Test alerts API
async function testAlertsAPI() {
  console.log('🚨 [TEST] Testing Alerts API...');
  try {
    const response = await fetch('/api/alerts/active');
    console.log('Alerts API Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Alerts API Success:', data.length, 'alerts found');
      console.log('First alert:', data[0]);
    } else {
      console.error('❌ Alerts API Failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ Alerts API Network Error:', error);
  }
}

// Test login API
async function testLoginAPI() {
  console.log('🔐 [TEST] Testing Login API...');
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });
    
    console.log('Login API Status:', response.status);
    
    const data = await response.json();
    if (response.ok) {
      console.log('✅ Login API Success:', data);
    } else {
      console.error('❌ Login API Failed:', data);
    }
  } catch (error) {
    console.error('❌ Login API Network Error:', error);
  }
}

// Test silo readings API
async function testSiloAPI() {
  console.log('🏭 [TEST] Testing Silo Readings API...');
  try {
    const response = await fetch('/api/readings/avg/latest/by-silo-number?silo_number=10');
    console.log('Silo API Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Silo API Success:', data);
    } else {
      console.error('❌ Silo API Failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ Silo API Network Error:', error);
  }
}

// Clear all caches
function clearAllCaches() {
  console.log('🗑️ [CLEAR] Clearing all caches...');
  localStorage.clear();
  sessionStorage.clear();
  console.log('✅ All caches cleared');
}

// Run all tests
async function runAllTests() {
  console.log('🚀 [START] Running all API tests...');
  await testAlertsAPI();
  await testLoginAPI();
  await testSiloAPI();
  console.log('🏁 [DONE] All tests completed');
}

// Instructions
console.log('\n📝 [INSTRUCTIONS] Available functions:');
console.log('- testAlertsAPI() - Test alerts endpoint');
console.log('- testLoginAPI() - Test login endpoint');
console.log('- testSiloAPI() - Test silo readings endpoint');
console.log('- clearAllCaches() - Clear localStorage and sessionStorage');
console.log('- runAllTests() - Run all tests at once');
console.log('\nExample: Type "runAllTests()" and press Enter');

// Auto-run tests if this script is executed directly
if (typeof window !== 'undefined') {
  console.log('\n🔄 [AUTO] Running tests automatically...');
  runAllTests();
}
