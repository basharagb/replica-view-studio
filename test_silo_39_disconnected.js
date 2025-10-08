// Test script to verify silo 39 disconnected behavior
// This script will clear silo 39 cache and fetch fresh data to test gray color

import { clearSiloCache, fetchSiloData, convertApiColorToTemperatureColor } from './src/services/realSiloApiService.js';

async function testSilo39Disconnected() {
  console.log('🧪 [TEST] Testing Silo 39 Disconnected Behavior');
  console.log('=' .repeat(50));
  
  // Clear cache for silo 39 to ensure fresh fetch
  console.log('1. Clearing silo 39 cache...');
  clearSiloCache(39);
  
  // Fetch fresh data for silo 39
  console.log('2. Fetching fresh data for silo 39...');
  try {
    const siloData = await fetchSiloData(39);
    
    console.log('3. Silo 39 API Response Analysis:');
    console.log(`   - Silo Number: ${siloData.siloNumber}`);
    console.log(`   - Is Loaded: ${siloData.isLoaded}`);
    console.log(`   - Max Temperature: ${siloData.maxTemp}°C`);
    console.log(`   - Silo Color (API): ${siloData.siloColor}`);
    console.log(`   - Sensors: [${siloData.sensors.join(', ')}]`);
    console.log(`   - Sensor Colors: [${siloData.sensorColors.join(', ')}]`);
    
    // Test color conversion
    console.log('4. Color Conversion Test:');
    const convertedColor = convertApiColorToTemperatureColor(siloData.siloColor);
    console.log(`   - API Color: ${siloData.siloColor}`);
    console.log(`   - Converted Color: ${convertedColor}`);
    
    // Expected results for disconnected silo
    console.log('5. Expected vs Actual Results:');
    console.log(`   - Expected: Gray color for disconnected silo`);
    console.log(`   - Actual: ${convertedColor} color`);
    console.log(`   - Test Result: ${convertedColor === 'gray' ? '✅ PASS' : '❌ FAIL'}`);
    
    if (convertedColor === 'gray') {
      console.log('🎉 SUCCESS: Silo 39 correctly shows as gray (disconnected)');
    } else {
      console.log('❌ FAILURE: Silo 39 should show as gray but shows as', convertedColor);
    }
    
  } catch (error) {
    console.error('❌ Error testing silo 39:', error);
  }
  
  console.log('=' .repeat(50));
  console.log('🧪 [TEST] Silo 39 Disconnected Test Complete');
}

// Run the test
testSilo39Disconnected();
