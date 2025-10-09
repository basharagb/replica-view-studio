#!/usr/bin/env python3
import requests
import json

def debug_affected_levels():
    try:
        print('🔍 Fetching alerts from API...')
        response = requests.get('http://192.168.1.92:5000/alerts/active')
        alerts = response.json()
        
        print(f'📊 Found {len(alerts)} alerts')
        
        # Find Silo 14 alerts
        silo14_alerts = [alert for alert in alerts if alert.get('silo_number') == 14]
        print(f'\n🎯 Silo 14 alerts: {len(silo14_alerts)}')
        
        for i, alert in enumerate(silo14_alerts):
            print(f'\n--- Alert {i + 1} for Silo 14 ---')
            print('Alert Type:', alert.get('alert_type'))
            print('Affected Levels (from API):', alert.get('affected_levels'))
            print('Silo Color:', alert.get('silo_color'))
            print('Sensor readings:')
            for j in range(8):
                level = alert.get(f'level_{j}')
                color = alert.get(f'color_{j}')
                print(f'  Sensor {j}: {level}°C ({color})')
        
        # Check what the affected_levels field actually contains
        if silo14_alerts:
            first_alert = silo14_alerts[0]
            affected_levels = first_alert.get('affected_levels')
            print('\n🔍 Analyzing affected_levels field:')
            print('Type:', type(affected_levels))
            print('Content:', json.dumps(affected_levels))
            print('Length:', len(affected_levels) if affected_levels else 0)
            
            # Check if it's actually sensor indices instead of silo levels
            print('\n🤔 Analysis:')
            if affected_levels == list(range(8)):
                print('❌ PROBLEM: affected_levels contains [0,1,2,3,4,5,6,7] - these are SENSOR INDICES, not silo levels!')
            else:
                print('✅ affected_levels appears to contain actual silo levels')
        
    except Exception as error:
        print(f'❌ Error: {error}')

if __name__ == '__main__':
    debug_affected_levels()
