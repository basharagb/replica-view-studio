// Debug script to check current state of silo 10 in the browser
// This will help us understand why the fix might not be working

console.log('🔍 Debugging Silo 10 Current State');
console.log('================================');

// Check if we're in the browser environment
if (typeof window !== 'undefined') {
    console.log('✅ Running in browser environment');
    
    // Try to access the silo data cache from localStorage
    try {
        const cacheKey = 'replica-view-studio-silo-data-cache';
        const cachedData = localStorage.getItem(cacheKey);
        
        if (cachedData) {
            const parsed = JSON.parse(cachedData);
            console.log('📦 Cached silo data found:', Object.keys(parsed));
            
            if (parsed['10']) {
                console.log('🎯 Silo 10 data in cache:', parsed['10']);
            } else {
                console.log('❌ Silo 10 NOT found in cache - this explains the issue!');
                console.log('💡 Solution: Need to scan silo 10 to load API data');
            }
        } else {
            console.log('❌ No cached silo data found');
        }
    } catch (error) {
        console.log('❌ Error reading cache:', error);
    }
    
    // Check if React components are available
    if (window.React) {
        console.log('✅ React is available');
    }
    
} else {
    console.log('❌ Not running in browser - this is a Node.js environment');
    console.log('💡 This script should be run in the browser console');
}

// Instructions for manual testing
console.log('\n📋 Manual Testing Instructions:');
console.log('1. Open browser dev tools (F12)');
console.log('2. Go to Console tab');
console.log('3. Paste this script and run it');
console.log('4. Check if silo 10 data is cached');
console.log('5. If not cached, click on silo 10 to trigger API fetch');
console.log('6. Check the color after API data is loaded');

// API test function
console.log('\n🧪 API Test Function:');
console.log('Run this in browser console to test API directly:');
console.log(`
async function testSilo10API() {
    try {
        const response = await fetch('http://192.168.1.92:5000/readings/avg/latest/by-silo-number?silo_number=10');
        const data = await response.json();
        console.log('🌐 API Response:', data);
        
        if (data && data.length > 0) {
            const silo = data[0];
            const validSensors = [
                silo.level_0, silo.level_1, silo.level_2, silo.level_3,
                silo.level_4, silo.level_5, silo.level_6, silo.level_7
            ].filter(temp => temp !== null && temp > 0);
            
            console.log('📊 Valid sensor readings:', validSensors);
            console.log('🌡️ Max temperature:', Math.max(...validSensors));
            console.log('🎨 Static silo_color:', silo.silo_color);
            console.log('💡 Expected dynamic color: GREEN (all sensors 20-35°C range)');
        }
    } catch (error) {
        console.error('❌ API Error:', error);
    }
}
`);
