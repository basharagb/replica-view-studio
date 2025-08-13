# Task: Modify Maintenance Section in Silo 45 - Cable Testing

## Problem Analysis
Need to modify the Maintenance section in Silo 45 - Cable Testing to:
1. Remove average readings
2. Handle disabled sensors (value -127) by coloring them grey

## Task Plan
- [x] Create new branch for changes
- [x] Find the Maintenance section in Silo 45 - Cable Testing
- [x] Identify where average readings are displayed and remove them
- [x] Add logic to detect -127 values (disabled sensors)
- [x] Apply grey styling for disabled sensors
- [x] Remove remaining averaging logic from API service
- [ ] Test the changes
- [ ] Write unit tests
- [ ] Commit changes (requires user approval)

## Changes Made
1. **MaintenanceCablePopup.tsx**:
   - Removed "Avg Temp" statistic from Cable Statistics Summary
   - Updated grid layout from 4 columns to 3 columns
   - Removed "Averaged from both cables" badge
   - Changed title from "Calculated Sensor Values" to "Sensor Values"
   - Added logic to detect -127 values and display "DISABLED" with grey styling
   - Updated Min/Max temp calculations to exclude disabled sensors (-127)

2. **maintenanceApiService.ts**:
   - Removed averaging logic for both circular and square silos
   - Added -127 disabled sensor detection in both processing paths
   - Set grey color (#9ca3af) for disabled sensors
   - Now uses Cable 0 values directly instead of averaging with Cable 1

## Lessons
- **TypeScript Mock Data Fix**: When creating mock data for tests, ensure all required properties from the interface are included. The `MaintenanceSiloData` interface requires `timestamp` and `siloColor` properties that were missing from the mock data, causing TypeScript compilation errors.

## Previous Task Completed
- [x] Align Silo Sensors (S1-S8) with Grain Level (L1-L8) Horizontally - COMPLETED

## Current Issue Fixed
- [x] Fixed TypeScript error in MaintenanceCablePopup.test.tsx by adding missing `timestamp` and `siloColor` properties to mock data

## Current Task: Map -127 Temperature to 'disabled' String
- [x] Verified API service properly detects -127 values and sets grey color (#9ca3af)
- [x] Verified UI component displays 'DISABLED' text instead of '-127.0°C' for disabled sensors
- [x] Implementation is already complete and working correctly

## New Task: Cable Temperature Comparison -127 Mapping
- [x] Find Cable Temperature Comparison component/section
- [x] Implement -127 to 'disabled' mapping in temperature comparison display
- [x] Test the changes - Development server running on http://localhost:8085