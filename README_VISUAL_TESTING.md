# Visual Regression Testing Quick Start

This project includes automated visual regression testing for the Lab Interface using Playwright.

## Quick Commands

```bash
# Generate baseline screenshots (first time setup)
npm run test:visual:update

# Run visual regression tests
npm run test:visual

# Run tests with interactive UI
npm run test:visual:ui

# View test results
npm run test:visual:report
```

## What Gets Tested

- ✅ Full lab interface layout
- ✅ Top silo section (silos 1-55)
- ✅ Bottom silo section (silos 101-195)
- ✅ Cylinder sensor panel
- ✅ Control panel with buttons
- ✅ Selected silo states
- ✅ Hover states and tooltips
- ✅ Manual/Auto test modes
- ✅ Temperature color variations
- ✅ Different viewport sizes
- ✅ Error states and edge cases

## First Time Setup

1. Make sure the dev server is running: `npm run dev`
2. Generate baseline screenshots: `npm run test:visual:update`
3. Run tests to verify: `npm run test:visual`

## Documentation

See [VISUAL_TESTING.md](./VISUAL_TESTING.md) for complete documentation.

## Test Structure

```
tests/
└── lab-interface-visual.spec.ts  # Main visual test suite

playwright.config.ts              # Playwright configuration
VISUAL_TESTING.md                 # Complete documentation
```

## Key Features

- **Automatic Screenshot Comparison**: Detects visual changes automatically
- **Cross-Browser Testing**: Tests on Chrome, Firefox, and Safari
- **Responsive Testing**: Tests different viewport sizes
- **Interactive States**: Tests hover, selection, and loading states
- **Temperature Visualization**: Validates color-coded temperature displays
- **Auto Test Simulation**: Tests the auto-reading functionality

## When Tests Fail

1. Check the test report: `npm run test:visual:report`
2. Review the visual differences
3. If changes are intentional, update baselines: `npm run test:visual:update`
4. Re-run tests to confirm: `npm run test:visual`