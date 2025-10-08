// Debug script to test alerts API fetch from frontend context
console.log('🚨 [DEBUG] Testing alerts API fetch...');

const testAlertsAPI = async () => {
  try {
    const url = 'http://192.168.1.92:5000/alerts/active';
    console.log(`🚨 [DEBUG] Fetching from: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`🚨 [DEBUG] Response status: ${response.status}`);
    console.log(`🚨 [DEBUG] Response headers:`, response.headers);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`🚨 [DEBUG] Received ${data.length} alerts`);
    
    // Count by type
    const counts = data.reduce((acc, alert) => {
      acc[alert.alert_type] = (acc[alert.alert_type] || 0) + 1;
      return acc;
    }, {});
    
    console.log('🚨 [DEBUG] Alert counts:', counts);
    console.log('🚨 [DEBUG] First 3 alerts:', data.slice(0, 3));
    
    return data;
    
  } catch (error) {
    console.error('🚨 [DEBUG] Fetch failed:', error);
    throw error;
  }
};

// Test the API
testAlertsAPI()
  .then(() => console.log('🚨 [DEBUG] Test completed successfully'))
  .catch(error => console.error('🚨 [DEBUG] Test failed:', error));
