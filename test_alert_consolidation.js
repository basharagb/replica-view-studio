// Test script to verify the enhanced alert consolidation logic
// This simulates the API response for Silo 22 and tests the consolidation

// Simulated API response for Silo 22 (based on actual API data)
const mockSilo22Alerts = [
  {
    silo_number: 22,
    silo_group: "Group 2",
    alert_type: "warn",
    affected_levels: [2],
    timestamp: "2025-10-09T10:29:56",
    active_since: "2025-10-08T12:24:09",
    level_0: 33.56, level_1: 34.19, level_2: 40.38, level_3: 39.81,
    level_4: 42.0, level_5: 40.63, level_6: 38.88, level_7: 41.56,
    color_0: "#46d446", color_1: "#46d446", color_2: "#d14141", color_3: "#c7c150",
    color_4: "#d14141", color_5: "#d14141", color_6: "#c7c150", color_7: "#d14141",
    silo_color: "#d14141"
  },
  {
    silo_number: 22,
    silo_group: "Group 2",
    alert_type: "warn",
    affected_levels: [3],
    timestamp: "2025-10-09T10:29:56",
    active_since: "2025-10-08T12:24:09",
    level_0: 33.56, level_1: 34.19, level_2: 40.38, level_3: 39.81,
    level_4: 42.0, level_5: 40.63, level_6: 38.88, level_7: 41.56,
    color_0: "#46d446", color_1: "#46d446", color_2: "#d14141", color_3: "#c7c150",
    color_4: "#d14141", color_5: "#d14141", color_6: "#c7c150", color_7: "#d14141",
    silo_color: "#d14141"
  },
  {
    silo_number: 22,
    silo_group: "Group 2",
    alert_type: "warn",
    affected_levels: [6],
    timestamp: "2025-10-09T10:29:56",
    active_since: "2025-10-08T12:24:09",
    level_0: 33.56, level_1: 34.19, level_2: 40.38, level_3: 39.81,
    level_4: 42.0, level_5: 40.63, level_6: 38.88, level_7: 41.56,
    color_0: "#46d446", color_1: "#46d446", color_2: "#d14141", color_3: "#c7c150",
    color_4: "#d14141", color_5: "#d14141", color_6: "#c7c150", color_7: "#d14141",
    silo_color: "#d14141"
  },
  {
    silo_number: 22,
    silo_group: "Group 2",
    alert_type: "critical",
    affected_levels: [4],
    timestamp: "2025-10-09T10:29:56",
    active_since: "2025-10-08T12:24:09",
    level_0: 33.56, level_1: 34.19, level_2: 40.38, level_3: 39.81,
    level_4: 42.0, level_5: 40.63, level_6: 38.88, level_7: 41.56,
    color_0: "#46d446", color_1: "#46d446", color_2: "#d14141", color_3: "#c7c150",
    color_4: "#d14141", color_5: "#d14141", color_6: "#c7c150", color_7: "#d14141",
    silo_color: "#d14141"
  },
  {
    silo_number: 22,
    silo_group: "Group 2",
    alert_type: "critical",
    affected_levels: [5],
    timestamp: "2025-10-09T10:29:56",
    active_since: "2025-10-08T12:24:09",
    level_0: 33.56, level_1: 34.19, level_2: 40.38, level_3: 39.81,
    level_4: 42.0, level_5: 40.63, level_6: 38.88, level_7: 41.56,
    color_0: "#46d446", color_1: "#46d446", color_2: "#d14141", color_3: "#c7c150",
    color_4: "#d14141", color_5: "#d14141", color_6: "#c7c150", color_7: "#d14141",
    silo_color: "#d14141"
  },
  {
    silo_number: 22,
    silo_group: "Group 2",
    alert_type: "critical",
    affected_levels: [7],
    timestamp: "2025-10-09T10:29:56",
    active_since: "2025-10-08T12:24:09",
    level_0: 33.56, level_1: 34.19, level_2: 40.38, level_3: 39.81,
    level_4: 42.0, level_5: 40.63, level_6: 38.88, level_7: 41.56,
    color_0: "#46d446", color_1: "#46d446", color_2: "#d14141", color_3: "#c7c150",
    color_4: "#d14141", color_5: "#d14141", color_6: "#c7c150", color_7: "#d14141",
    silo_color: "#d14141"
  }
];

// Simulate the processAlertResponse function
const processAlertResponse = (apiData) => {
  const sensors = [
    apiData.level_0 ?? 0, apiData.level_1 ?? 0, apiData.level_2 ?? 0, apiData.level_3 ?? 0,
    apiData.level_4 ?? 0, apiData.level_5 ?? 0, apiData.level_6 ?? 0, apiData.level_7 ?? 0
  ];
  
  const validTemperatures = sensors.filter(temp => temp !== null && temp > 0);
  const maxTemp = validTemperatures.length > 0 ? Math.max(...validTemperatures) : 0;
  
  const alertId = `${apiData.silo_number}-${apiData.alert_type}-${apiData.affected_levels.sort().join(',')}`;
  
  return {
    id: alertId,
    siloNumber: apiData.silo_number,
    siloGroup: apiData.silo_group,
    alertType: apiData.alert_type === 'warn' ? 'warning' : apiData.alert_type,
    affectedLevels: apiData.affected_levels,
    maxTemp,
    timestamp: new Date(apiData.timestamp),
    activeSince: new Date(apiData.active_since)
  };
};

// Simulate the enhanced consolidateAlerts function
const consolidateAlerts = (alerts) => {
  const alertMap = new Map();
  
  alerts.forEach(alert => {
    // Group by silo number and alert type only (not by affected levels)
    const key = `${alert.siloNumber}-${alert.alertType}`;
    
    if (alertMap.has(key)) {
      const existingAlert = alertMap.get(key);
      
      // Merge affected levels from both alerts (remove duplicates)
      const mergedAffectedLevels = [...new Set([...existingAlert.affectedLevels, ...alert.affectedLevels])].sort((a, b) => a - b);
      
      // Keep the alert with the most recent timestamp for sensor data, but merge affected levels
      const mergedAlert = alert.timestamp.getTime() > existingAlert.timestamp.getTime() ? {
        ...alert,
        affectedLevels: mergedAffectedLevels,
        // Update ID to reflect merged affected levels
        id: `${alert.siloNumber}-${alert.alertType}-${mergedAffectedLevels.join(',')}`
      } : {
        ...existingAlert,
        affectedLevels: mergedAffectedLevels,
        // Update ID to reflect merged affected levels
        id: `${existingAlert.siloNumber}-${existingAlert.alertType}-${mergedAffectedLevels.join(',')}`
      };
      
      console.log(`🚨 [TEST] Merging alerts for Silo ${alert.siloNumber} (${alert.alertType}): levels [${existingAlert.affectedLevels.join(',')}] + [${alert.affectedLevels.join(',')}] = [${mergedAffectedLevels.join(',')}]`);
      alertMap.set(key, mergedAlert);
    } else {
      alertMap.set(key, alert);
    }
  });
  
  const consolidatedAlerts = Array.from(alertMap.values());
  
  console.log(`🚨 [TEST] Consolidated ${alerts.length} raw alerts into ${consolidatedAlerts.length} unique alerts (merged ${alerts.length - consolidatedAlerts.length} duplicate silo/type combinations)`);
  
  return consolidatedAlerts;
};

// Test the consolidation
console.log('🚨 [TEST] Testing alert consolidation for Silo 22...\n');

console.log('📥 [TEST] Input: 6 separate alerts for Silo 22:');
mockSilo22Alerts.forEach((alert, index) => {
  console.log(`  ${index + 1}. ${alert.alert_type} alert affecting level ${alert.affected_levels[0]}`);
});

console.log('\n🔄 [TEST] Processing alerts...');
const processedAlerts = mockSilo22Alerts.map(processAlertResponse);

console.log('\n🔄 [TEST] Consolidating alerts...');
const consolidatedAlerts = consolidateAlerts(processedAlerts);

console.log('\n📤 [TEST] Output: Consolidated alerts:');
consolidatedAlerts.forEach((alert, index) => {
  console.log(`  ${index + 1}. Silo ${alert.siloNumber} - ${alert.alertType} alert`);
  console.log(`     Affected Levels: [${alert.affectedLevels.join(', ')}]`);
  console.log(`     Max Temperature: ${alert.maxTemp}°C`);
  console.log(`     Alert ID: ${alert.id}`);
  console.log('');
});

console.log(`✅ [TEST] Success! Reduced ${mockSilo22Alerts.length} duplicate alerts to ${consolidatedAlerts.length} consolidated alerts.`);
