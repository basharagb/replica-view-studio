# Task: Align Silo Sensors (S1-S8) with Grain Level (L1-L8) Horizontally

## Problem Analysis
From the screenshot, I can see that the Silo Sensors widget shows S1-S8 vertically, and the Grain Level widget shows L1-L8 vertically. The user wants these to be horizontally aligned so that S1 aligns with L1, S2 with L2, etc.

## Current State
- LabCylinder.tsx: Shows S1-S8 sensors from top to bottom
- GrainLevelCylinder.tsx: Shows L1-L8 levels from top to bottom
- Both components are already ordered correctly (1-8 from top to bottom)

## Task Plan
- [x] Analyze current component structure
- [x] Create new branch for changes
- [x] Review current alignment and spacing
- [x] Adjust heights and spacing to ensure perfect horizontal alignment
- [x] Fix widget height mismatch (made both widgets same height: 95%, minHeight: 325px)
- [x] Standardize padding, margins, and spacing between both components
- [x] Remove bottom space below L8 in Grain Level widget (removed flex: 1 expansion)
- [x] Test the alignment
- [x] Code cleanup and formatting completed by user
- [x] Write unit tests (6 tests passing - alignment verification)
- [x] Modified Temperature Alerts popup to only show critical alerts (>40°C)
- [x] Changed popup to start minimized by default (only opens when clicked)
- [x] Removed automatic popup opening behavior
- [x] Updated alert button text to show "Critical Alerts" instead of general alerts
- [x] Fixed all references to warning alerts in the component
- [ ] Commit changes and push to main (requires user approval)

## Notes
- Both components use flex-col with gap spacing
- LabCylinder uses h-6 for sensor items
- GrainLevelCylinder uses heightStyle with 20px height
- Need to ensure consistent heights and spacing for perfect alignment