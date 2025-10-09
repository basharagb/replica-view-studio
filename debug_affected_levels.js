// Debug script to check affected levels in alerts API
import fetch from 'node-fetch';

async function debugAffectedLevels() {
    try {
        console.log('🔍 Fetching alerts from API...');
        const response = await fetch('http://192.168.1.92:5000/alerts/active');
        const alerts = await response.json();
        
        console.log(`📊 Found ${alerts.length} alerts`);
        
        // Find Silo 14 alerts
        const silo14Alerts = alerts.filter(alert => alert.silo_number === 14);
        console.log(`\n🎯 Silo 14 alerts: ${silo14Alerts.length}`);
        
        silo14Alerts.forEach((alert, index) => {
            console.log(`\n--- Alert ${index + 1} for Silo 14 ---`);
            console.log('Alert Type:', alert.alert_type);
            console.log('Affected Levels (from API):', alert.affected_levels);
            console.log('Silo Color:', alert.silo_color);
            console.log('Sensor readings:');
            for (let i = 0; i <= 7; i++) {
                const level = alert[`level_${i}`];
                const color = alert[`color_${i}`];
                console.log(`  Sensor ${i}: ${level}°C (${color})`);
            }
        });
        
        // Check what the affected_levels field actually contains
        if (silo14Alerts.length > 0) {
            const firstAlert = silo14Alerts[0];
            console.log('\n🔍 Analyzing affected_levels field:');
            console.log('Type:', typeof firstAlert.affected_levels);
            console.log('Is Array:', Array.isArray(firstAlert.affected_levels));
            console.log('Content:', JSON.stringify(firstAlert.affected_levels));
            console.log('Length:', firstAlert.affected_levels?.length);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

debugAffectedLevels();
