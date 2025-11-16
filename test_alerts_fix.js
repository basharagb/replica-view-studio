#!/usr/bin/env node

/**
 * Test script to verify the alerts API fix works correctly
 */

// Node.js 22+ has built-in fetch

const API_BASE = 'http://192.168.1.92:5000';
const ALERTS_ENDPOINT = '/alerts/active';

async function testSimpleAlertsAPI() {
    console.log('🚨 [TEST] Testing simple alerts API (what the frontend now uses)...');
    
    const startTime = Date.now();
    
    try {
        const url = `${API_BASE}${ALERTS_ENDPOINT}?_t=${Date.now()}`;
        console.log(`🚨 [TEST] URL: ${url}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(60000) // 1 minute timeout
        });
        
        const fetchTime = Date.now() - startTime;
        console.log(`🚨 [TEST] Response received in ${fetchTime}ms`);
        console.log(`🚨 [TEST] Status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log(`🚨 [TEST] Response data type:`, Array.isArray(responseData) ? 'array' : typeof responseData);
        console.log(`🚨 [TEST] Total alerts:`, responseData.length);
        
        if (Array.isArray(responseData) && responseData.length > 0) {
            console.log('\n🚨 [TEST] ✅ SUCCESS - API returns alert data');
            console.log(`🚨 [TEST] Sample alert structure:`, {
                silo_number: responseData[0].silo_number,
                alert_type: responseData[0].alert_type,
                affected_levels: responseData[0].affected_levels,
                timestamp: responseData[0].timestamp,
                active_since: responseData[0].active_since
            });
            
            // Test client-side pagination
            const page = 1;
            const limit = 20;
            const totalItems = responseData.length;
            const totalPages = Math.ceil(totalItems / limit);
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedData = responseData.slice(startIndex, endIndex);
            
            console.log('\n🚨 [TEST] Client-side pagination test:');
            console.log(`- Total items: ${totalItems}`);
            console.log(`- Items per page: ${limit}`);
            console.log(`- Total pages: ${totalPages}`);
            console.log(`- Page ${page} items: ${paginatedData.length}`);
            console.log(`- Has next page: ${page < totalPages}`);
            console.log(`- Has previous page: ${page > 1}`);
            
        } else {
            console.log('\n🚨 [TEST] ❌ EMPTY - API returns no alert data');
        }
        
        console.log(`\n🚨 [TEST] ✅ Test completed in ${fetchTime}ms`);
        
    } catch (error) {
        const fetchTime = Date.now() - startTime;
        console.error(`\n🚨 [TEST] ❌ Test failed after ${fetchTime}ms:`, error.message);
    }
}

testSimpleAlertsAPI().catch(console.error);
