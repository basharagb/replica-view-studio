#!/usr/bin/env python3
import requests
import json

def test_affected_levels_fix():
    try:
        print('🔍 Testing affected levels fix...')
        response = requests.get('http://192.168.1.92:5000/alerts/active')
        alerts = response.json()
        
        # Find Silo 14 alerts
        silo14_alerts = [alert for alert in alerts if alert.get('silo_number') == 14]
        print(f'\n📊 Silo 14 has {len(silo14_alerts)} raw alerts from API')
        
        # Group by alert type to simulate API consolidation
        alert_types = {}
        for alert in silo14_alerts:
            alert_type = alert.get('alert_type')
            if alert_type not in alert_types:
                alert_types[alert_type] = []
            alert_types[alert_type].append(alert)
        
        print('\n🔄 After API consolidation (by alert type):')
        consolidated_alerts = []
        for alert_type, type_alerts in alert_types.items():
            # Merge affected levels for same alert type
            all_levels = []
            for alert in type_alerts:
                all_levels.extend(alert.get('affected_levels', []))
            merged_levels = sorted(list(set(all_levels)))
            
            consolidated_alert = {
                'alert_type': alert_type,
                'affected_levels': merged_levels,
                'priority': 'critical' if alert_type == 'critical' else 'warning' if alert_type == 'warn' else 'normal'
            }
            consolidated_alerts.append(consolidated_alert)
            print(f'  {alert_type}: levels {merged_levels}')
        
        # Simulate UI consolidation with new logic (highest priority only)
        print('\n🎯 After UI consolidation (highest priority only):')
        priority_order = {'critical': 3, 'warning': 2, 'normal': 1}
        
        # Find highest priority alert
        highest_priority_alert = None
        highest_priority_value = 0
        
        for alert in consolidated_alerts:
            priority_value = priority_order.get(alert['priority'], 0)
            if priority_value > highest_priority_value:
                highest_priority_value = priority_value
                highest_priority_alert = alert
        
        if highest_priority_alert:
            print(f'  Final display: {highest_priority_alert["alert_type"]} alert with levels {highest_priority_alert["affected_levels"]}')
            print(f'  ✅ Should show: "Affected Levels: {", ".join(map(str, highest_priority_alert["affected_levels"]))}"')
        else:
            print('  ❌ No alerts found')
        
        print('\n🔍 Expected behavior:')
        print('  - OLD: Shows levels [0,1,2,3,4,5,6,7] (merged all alert types)')
        print(f'  - NEW: Shows levels {highest_priority_alert["affected_levels"] if highest_priority_alert else "none"} (highest priority only)')
        
    except Exception as error:
        print(f'❌ Error: {error}')

if __name__ == '__main__':
    test_affected_levels_fix()
