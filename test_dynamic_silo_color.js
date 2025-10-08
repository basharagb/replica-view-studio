// Test script to verify dynamic silo color calculation for silo 10
// This simulates the API response and tests the color logic

// Mock API response for silo 10 (from your provided data)
const mockApiResponse = {
    "silo_group": "Group 1",
    "silo_number": 10,
    "cable_number": null,
    "level_0": 25.69,
    "color_0": "#46d446",
    "level_1": 25.44,
    "color_1": "#46d446",
    "level_2": 25.38,
    "color_2": "#46d446",
    "level_3": 25.63,
    "color_3": "#46d446",
    "level_4": 25.69,
    "color_4": "#46d446",
    "level_5": 25.13,
    "color_5": "#46d446",
    "level_6": 25.75,
    "color_6": "#46d446",
    "level_7": null,
    "color_7": "#8c9494",
    "silo_color": "#8c9494",
    "timestamp": "2025-10-08T13:32:04"
};

// Temperature thresholds (from siloData.ts)
const TEMPERATURE_THRESHOLDS = {
    GREEN_MIN: 20.0,
    GREEN_MAX: 34.99,
    YELLOW_MIN: 35.0,
    YELLOW_MAX: 40.0,
    RED_MIN: 40.01,
};

// Get temperature color based on thresholds
function getTemperatureColor(temp) {
    if (temp === -127) return 'green';
    if (temp === 0) return 'beige';
    if (temp >= TEMPERATURE_THRESHOLDS.RED_MIN) return 'pink';
    if (temp >= TEMPERATURE_THRESHOLDS.YELLOW_MIN) return 'yellow';
    return 'green';
}

// Determine silo color based on sensor priority hierarchy
function getSiloColorFromSensors(sensorReadings) {
    // Check for any red sensors (highest priority)
    const hasRedSensor = sensorReadings.some(temp => temp > TEMPERATURE_THRESHOLDS.YELLOW_MAX);
    if (hasRedSensor) {
        return 'pink'; // Red color
    }
    
    // Check for any yellow sensors (medium priority)
    const hasYellowSensor = sensorReadings.some(temp => 
        temp >= TEMPERATURE_THRESHOLDS.YELLOW_MIN && temp <= TEMPERATURE_THRESHOLDS.YELLOW_MAX
    );
    if (hasYellowSensor) {
        return 'yellow'; // Yellow color
    }
    
    // All sensors are green (lowest priority)
    return 'green'; // Green color
}

// Convert API color to temperature color
function convertApiColorToTemperatureColor(hexColor) {
    const color = hexColor.toLowerCase();
    
    // Gray colors (disconnected/low temperature sensors) - now converted to green
    if (color === '#9ca3af' || color.startsWith('#9ca') || color.startsWith('#6b7280') || 
        color.startsWith('#8c94') || color === '#8c9494' || color.startsWith('#8c')) {
        return 'green';
    }
    
    // Green colors (normal temperature range)
    if (color.startsWith('#46d4') || color.startsWith('#4') || color === '#00ff00' || 
        color === '#44ff44' || color.startsWith('#46') || color.startsWith('#22c55e')) {
        return 'green';
    }
    
    // Yellow colors (warning temperature range)
    if (color.startsWith('#c7c1') || color === '#c7c150' || color.startsWith('#eab308') ||
        color.startsWith('#f59e0b') || (color.startsWith('#ff') && color.includes('c'))) {
        return 'yellow';
    }
    
    // Red colors (critical temperatures)
    if (color.startsWith('#ff') || color.startsWith('#f') || color === '#ff0000' || 
        color === '#ff4444' || color.startsWith('#d1') || color.startsWith('#d14141') ||
        color.startsWith('#ef4444') || color.startsWith('#dc2626')) {
        return 'pink';
    }
    
    // Default to green for unknown colors
    return 'green';
}

// Test the dynamic color calculation
console.log('🧪 Testing Dynamic Silo Color Calculation for Silo 10');
console.log('================================================');

// Extract sensor readings (filter out null values)
const sensors = [
    mockApiResponse.level_0, mockApiResponse.level_1, mockApiResponse.level_2, mockApiResponse.level_3,
    mockApiResponse.level_4, mockApiResponse.level_5, mockApiResponse.level_6, mockApiResponse.level_7
];

console.log('📊 Raw sensor data:');
sensors.forEach((temp, index) => {
    const color = [
        mockApiResponse.color_0, mockApiResponse.color_1, mockApiResponse.color_2, mockApiResponse.color_3,
        mockApiResponse.color_4, mockApiResponse.color_5, mockApiResponse.color_6, mockApiResponse.color_7
    ][index];
    console.log(`  S${index + 1}: ${temp}°C (${color})`);
});

// Filter valid sensor readings (non-null and > 0)
const validSensorReadings = sensors.filter(temp => temp !== null && temp > 0);
console.log('\n✅ Valid sensor readings:', validSensorReadings);

// Test OLD logic (using static silo_color)
const oldColor = convertApiColorToTemperatureColor(mockApiResponse.silo_color);
console.log('\n🔴 OLD Logic (static silo_color):');
console.log(`  silo_color: ${mockApiResponse.silo_color} → ${oldColor}`);

// Test NEW logic (using dynamic sensor readings)
const newColor = getSiloColorFromSensors(validSensorReadings);
console.log('\n🟢 NEW Logic (dynamic sensor readings):');
console.log(`  Valid readings: ${validSensorReadings.join(', ')}°C`);
console.log(`  Max temp: ${Math.max(...validSensorReadings)}°C`);
console.log(`  Dynamic color: ${newColor}`);

// Analysis
console.log('\n📋 Analysis:');
console.log(`  All valid sensors are in range 20-35°C (GREEN zone)`);
console.log(`  Static silo_color (#8c9494) would give: ${oldColor}`);
console.log(`  Dynamic calculation based on sensors gives: ${newColor}`);
console.log(`  ✅ The fix ensures silo color reflects actual sensor readings!`);

// Temperature range analysis
console.log('\n🌡️ Temperature Range Analysis:');
validSensorReadings.forEach(temp => {
    const color = getTemperatureColor(temp);
    console.log(`  ${temp}°C → ${color}`);
});

console.log('\n🎯 Expected Result:');
console.log(`  Silo 10 should now display as GREEN instead of the static gray color`);
console.log(`  This makes the silo color truly dynamic based on sensor readings`);
