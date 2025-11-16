#!/usr/bin/env node

/**
 * Debug script to test the alerts API endpoint directly
 * This will help identify if the API is returning empty data or if there's a timeout issue
 */

// Node.js 22+ has built-in fetch

const API_BASE = 'http://192.168.1.92:5000';
const ALERTS_ENDPOINT = '/alerts/active';

async function testAlertsAPI() {
    console.log('🚨 [DEBUG] Testing Alerts API...');
    console.log(`🚨 [DEBUG] Endpoint: ${API_BASE}${ALERTS_ENDPOINT}`);
    console.log('🚨 [DEBUG] Starting request...\n');
    
    const startTime = Date.now();
    
    try {
        // Test with pagination parameters
        const url = `${API_BASE}${ALERTS_ENDPOINT}?page=1&limit=20&_t=${Date.now()}`;
        console.log(`🚨 [DEBUG] Full URL: ${url}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 600000 // 10 minute timeout
        });
        
        const fetchTime = Date.now() - startTime;
        console.log(`🚨 [DEBUG] Response received in ${fetchTime}ms`);
        console.log(`🚨 [DEBUG] Status: ${response.status} ${response.statusText}`);
        console.log(`🚨 [DEBUG] Headers:`, Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const responseText = await response.text();
        console.log(`🚨 [DEBUG] Response size: ${responseText.length} characters`);
        
        // Try to parse as JSON
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (parseError) {
            console.error('🚨 [DEBUG] Failed to parse JSON:', parseError.message);
            console.log('🚨 [DEBUG] Raw response (first 500 chars):', responseText.substring(0, 500));
            return;
        }
        
        console.log('\n🚨 [DEBUG] Parsed Response Structure:');
        console.log('- success:', responseData.success);
        console.log('- message:', responseData.message);
        console.log('- data type:', Array.isArray(responseData.data) ? 'array' : typeof responseData.data);
        console.log('- data length:', responseData.data ? responseData.data.length : 'null/undefined');
        console.log('- pagination:', responseData.pagination ? 'present' : 'missing');
        
        if (responseData.pagination) {
            console.log('  - current_page:', responseData.pagination.current_page);
            console.log('  - total_items:', responseData.pagination.total_items);
            console.log('  - total_pages:', responseData.pagination.total_pages);
            console.log('  - per_page:', responseData.pagination.per_page);
        }
        
        if (responseData.data && responseData.data.length > 0) {
            console.log('\n🚨 [DEBUG] Sample Alert Data (first alert):');
            const firstAlert = responseData.data[0];
            console.log('- silo_number:', firstAlert.silo_number);
            console.log('- alert_type:', firstAlert.alert_type);
            console.log('- affected_levels:', firstAlert.affected_levels);
            console.log('- silo_color:', firstAlert.silo_color);
            console.log('- timestamp:', firstAlert.timestamp);
            console.log('- active_since:', firstAlert.active_since);
            
            console.log('\n🚨 [DEBUG] Alert Distribution by Type:');
            const typeCounts = responseData.data.reduce((acc, alert) => {
                acc[alert.alert_type] = (acc[alert.alert_type] || 0) + 1;
                return acc;
            }, {});
            console.log(typeCounts);
            
            console.log('\n🚨 [DEBUG] Alert Distribution by Silo:');
            const siloCounts = responseData.data.reduce((acc, alert) => {
                acc[alert.silo_number] = (acc[alert.silo_number] || 0) + 1;
                return acc;
            }, {});
            console.log(siloCounts);
        } else {
            console.log('\n🚨 [DEBUG] ❌ NO ALERT DATA FOUND');
            console.log('🚨 [DEBUG] This explains why the UI shows "Loading..." for a long time');
            console.log('🚨 [DEBUG] The API is returning an empty data array');
        }
        
        console.log(`\n🚨 [DEBUG] ✅ API test completed successfully in ${fetchTime}ms`);
        
    } catch (error) {
        const fetchTime = Date.now() - startTime;
        console.error(`\n🚨 [DEBUG] ❌ API test failed after ${fetchTime}ms:`, error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('🚨 [DEBUG] Connection refused - API server may be down');
        } else if (error.code === 'ETIMEDOUT') {
            console.error('🚨 [DEBUG] Request timed out - API server may be overloaded');
        } else if (error.name === 'AbortError') {
            console.error('🚨 [DEBUG] Request was aborted - timeout reached');
        }
    }
}

// Test without pagination
async function testAlertsAPISimple() {
    console.log('\n🚨 [DEBUG] Testing simple alerts API (no pagination)...');
    
    const startTime = Date.now();
    
    try {
        const url = `${API_BASE}${ALERTS_ENDPOINT}`;
        console.log(`🚨 [DEBUG] Simple URL: ${url}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000 // 30 second timeout
        });
        
        const fetchTime = Date.now() - startTime;
        console.log(`🚨 [DEBUG] Simple response received in ${fetchTime}ms`);
        console.log(`🚨 [DEBUG] Status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log('🚨 [DEBUG] Simple response data length:', responseData.length || 'not an array');
        
        if (Array.isArray(responseData) && responseData.length > 0) {
            console.log('🚨 [DEBUG] ✅ Simple API returns data');
        } else {
            console.log('🚨 [DEBUG] ❌ Simple API also returns empty data');
        }
        
    } catch (error) {
        const fetchTime = Date.now() - startTime;
        console.error(`🚨 [DEBUG] Simple API test failed after ${fetchTime}ms:`, error.message);
    }
}

// Run both tests
async function runAllTests() {
    console.log('🚨 [DEBUG] Starting comprehensive alerts API testing...\n');
    
    await testAlertsAPI();
    await testAlertsAPISimple();
    
    console.log('\n🚨 [DEBUG] All tests completed.');
    console.log('🚨 [DEBUG] If both tests show empty data, the issue is with the backend API.');
    console.log('🚨 [DEBUG] If tests show data but UI is slow, the issue is with frontend processing.');
}

runAllTests().catch(console.error);
