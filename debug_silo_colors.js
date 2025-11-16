#!/usr/bin/env node

/**
 * Debug script to check silo color issues for silos 33, 28, 31
 * This will help identify if API data is being loaded correctly
 */

// Node.js 22+ has built-in fetch

const API_BASE = 'http://192.168.1.92:5000';
const READINGS_ENDPOINT = '/readings/avg/latest/by-silo-number';

async function testSiloAPI(siloNumber) {
    console.log(`\n🔍 [DEBUG] Testing silo ${siloNumber}...`);
    
    const startTime = Date.now();
    
    try {
        const url = `${API_BASE}${READINGS_ENDPOINT}?silo_number=${siloNumber}&_t=${Date.now()}`;
        console.log(`🔍 [DEBUG] URL: ${url}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(30000) // 30 second timeout
        });
        
        const fetchTime = Date.now() - startTime;
        console.log(`🔍 [DEBUG] Response received in ${fetchTime}ms`);
        console.log(`🔍 [DEBUG] Status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log(`🔍 [DEBUG] Response type:`, Array.isArray(responseData) ? 'array' : typeof responseData);
        console.log(`🔍 [DEBUG] Response length:`, responseData.length);
        
        if (Array.isArray(responseData) && responseData.length > 0) {
            const siloData = responseData[0];
            console.log(`🔍 [DEBUG] ✅ Silo ${siloNumber} API data:`, {
                silo_number: siloData.silo_number,
                silo_color: siloData.silo_color,
                max_temp: Math.max(
                    siloData.level_0 || 0, siloData.level_1 || 0, siloData.level_2 || 0, siloData.level_3 || 0,
                    siloData.level_4 || 0, siloData.level_5 || 0, siloData.level_6 || 0, siloData.level_7 || 0
                ),
                sensors: [
                    siloData.level_0, siloData.level_1, siloData.level_2, siloData.level_3,
                    siloData.level_4, siloData.level_5, siloData.level_6, siloData.level_7
                ],
                colors: [
                    siloData.color_0, siloData.color_1, siloData.color_2, siloData.color_3,
                    siloData.color_4, siloData.color_5, siloData.color_6, siloData.color_7
                ]
            });
            
            // Determine expected color based on sensor readings
            const validSensors = [
                siloData.level_0, siloData.level_1, siloData.level_2, siloData.level_3,
                siloData.level_4, siloData.level_5, siloData.level_6, siloData.level_7
            ].filter(temp => temp !== null && temp > 0);
            
            if (validSensors.length > 0) {
                const maxTemp = Math.max(...validSensors);
                let expectedColor = 'green';
                if (maxTemp > 40) expectedColor = 'red';
                else if (maxTemp >= 35) expectedColor = 'yellow';
                
                console.log(`🔍 [DEBUG] Expected color based on max temp ${maxTemp}°C: ${expectedColor}`);
            }
            
        } else if (Array.isArray(responseData) && responseData.length === 0) {
            console.log(`🔍 [DEBUG] ❌ Silo ${siloNumber} - DISCONNECTED (empty array)`);
        } else {
            console.log(`🔍 [DEBUG] ❌ Silo ${siloNumber} - Unexpected response format`);
        }
        
    } catch (error) {
        const fetchTime = Date.now() - startTime;
        console.error(`🔍 [DEBUG] ❌ Silo ${siloNumber} test failed after ${fetchTime}ms:`, error.message);
    }
}

async function testProblemSilos() {
    console.log('🔍 [DEBUG] Testing problem silos: 33, 28, 31...\n');
    
    const problemSilos = [33, 28, 31];
    
    for (const siloNum of problemSilos) {
        await testSiloAPI(siloNum);
    }
    
    console.log('\n🔍 [DEBUG] Testing completed.');
    console.log('🔍 [DEBUG] If silos return valid data but show wheat color in UI:');
    console.log('  1. Check if API data is being cached correctly');
    console.log('  2. Check if markSiloCompleted() is being called');
    console.log('  3. Check if getSiloColorByNumber() is using API data');
    console.log('  4. Check if there\'s a race condition in auto scan');
}

testProblemSilos().catch(console.error);
