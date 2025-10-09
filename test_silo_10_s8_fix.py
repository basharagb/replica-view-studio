#!/usr/bin/env python3
import requests
import json

def test_silo_10_s8_fix():
    try:
        print('🔍 Testing Silo 10 S8 sensor fix...')
        response = requests.get('http://192.168.1.92:5000/readings/avg/latest/by-silo-number?silo_number=10')
        
        if response.status_code != 200:
            print(f'❌ API Error: {response.status_code}')
            return
            
        data = response.json()
        
        if not data:
            print('❌ No data returned for Silo 10')
            return
            
        silo_data = data[0]
        print(f'📊 Silo 10 API Response:')
        print(f'  Silo Number: {silo_data.get("silo_number")}')
        print(f'  Timestamp: {silo_data.get("timestamp")}')
        
        print('\n🌡️ Sensor Readings:')
        for i in range(8):
            level = silo_data.get(f'level_{i}')
            color = silo_data.get(f'color_{i}')
            sensor_name = f'S{i+1}'
            print(f'  {sensor_name}: {level}°C ({color})')
        
        # Check S7 and S8 specifically
        s7_temp = silo_data.get('level_6')  # S7 is level_6
        s7_color = silo_data.get('color_6')
        s8_temp = silo_data.get('level_7')  # S8 is level_7  
        s8_color = silo_data.get('color_7')
        
        print(f'\n🎯 Focus on S7 and S8:')
        print(f'  S7: {s7_temp}°C ({s7_color})')
        print(f'  S8: {s8_temp}°C ({s8_color})')
        
        # Check if S8 appears disconnected
        is_s8_disconnected = (s8_temp == 0 or s8_temp is None or 
                             s8_color in ['#9ca3af', '#8c9494', '#6b7280'])
        
        print(f'\n🔍 Analysis:')
        print(f'  S8 appears disconnected: {is_s8_disconnected}')
        
        if is_s8_disconnected and s7_temp and s7_temp > 0:
            print(f'  ✅ Fix should apply: S8 will show S7 value ({s7_temp}°C, {s7_color})')
            print(f'  📱 In UI: S8 should display {s7_temp}°C with {s7_color} color')
        elif not is_s8_disconnected:
            print(f'  ℹ️ S8 appears to be working normally - fix will not apply')
        else:
            print(f'  ⚠️ Both S7 and S8 have issues - fix may not work properly')
            
    except Exception as error:
        print(f'❌ Error: {error}')

if __name__ == '__main__':
    test_silo_10_s8_fix()
