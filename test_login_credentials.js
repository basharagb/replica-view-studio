// Test login credentials for debugging
// Run this in the browser console to test different login credentials

console.log('🔐 [LOGIN TEST] Available test credentials:');
console.log('================================');

const testCredentials = [
  { username: 'ahmed', password: 'ahmed', role: 'Admin' },
  { username: 'hussein', password: 'hussein', role: 'Technician' },
  { username: 'bashar', password: 'bashar', role: 'Operator' },
  { username: 'admin', password: 'admin', role: 'Admin (fallback)' },
  { username: 'user', password: 'user', role: 'User (fallback)' }
];

testCredentials.forEach((cred, index) => {
  console.log(`${index + 1}. Username: ${cred.username} | Password: ${cred.password} | Role: ${cred.role}`);
});

// Function to test login programmatically
async function testLogin(username, password) {
  console.log(`🔄 [TEST] Testing login with ${username}/${password}...`);
  
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ [SUCCESS] Login successful:', data);
      return data;
    } else {
      console.log('❌ [FAILED] Login failed:', data.message || 'Unknown error');
      return null;
    }
  } catch (error) {
    console.error('❌ [ERROR] Network error:', error);
    return null;
  }
}

// Function to test all credentials
async function testAllCredentials() {
  console.log('\n🚀 [AUTO TEST] Testing all credentials...');
  
  for (const cred of testCredentials) {
    const result = await testLogin(cred.username, cred.password);
    if (result) {
      console.log(`✅ Working credentials found: ${cred.username}/${cred.password}`);
      break;
    }
    // Wait a bit between attempts
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

console.log('\n📝 [INSTRUCTIONS]:');
console.log('1. Try these credentials in the login form');
console.log('2. Or run: testLogin("ahmed", "ahmed")');
console.log('3. Or run: testAllCredentials() to test all');

// Auto-test if running in browser
if (typeof window !== 'undefined') {
  console.log('\n🔄 [AUTO] Testing first credential...');
  testLogin('ahmed', 'ahmed');
}
