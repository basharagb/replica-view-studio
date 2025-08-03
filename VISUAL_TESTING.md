# Visual Regression Testing for Lab Interface

This document describes the automated visual regression testing setup for the Lab Interface components using Playwright.

## Overview

The visual regression testing system automatically captures screenshots of the lab interface and compares them against baseline images to detect visual changes. This helps ensure that UI changes don't introduce unintended visual regressions.

## Setup

### Prerequisites

- Node.js and npm installed
- The development server running on `http://localhost:5173`

### Installation

The necessary dependencies are already installed:
- `@playwright/test` - Playwright testing framework with visual comparison capabilities

### Browser Installation

Playwright browsers are automatically installed. If you need to reinstall them:

```bash
npx playwright install
```

## Test Structure

### Test Files

- `tests/lab-interface-visual.spec.ts` - Main visual regression test suite

### Test Categories

1. **Layout Tests**
   - Full interface layout
   - Top silo section (silos 1-55)
   - Bottom silo section (silos 101-195)
   - Cylinder panel
   - Control panel

2. **Interactive State Tests**
   - Selected silo states
   - Hover states with tooltips
   - Manual test mode active
   - Auto test mode with progress
   - Different silo input values

3. **Visual Variation Tests**
   - Temperature color variations
   - Different viewport sizes
   - Individual component states

4. **Edge Case Tests**
   - Invalid silo numbers
   - Empty input states
   - Error conditions

## Running Tests

### Basic Commands

```bash
# Run all visual tests
npm run test:visual

# Run tests with UI mode (interactive)
npm run test:visual:ui

# Run tests in headed mode (see browser)
npm run test:visual:headed

# Update baseline screenshots
npm run test:visual:update

# Show test report
npm run test:visual:report
```

### First Time Setup

1. **Generate Baseline Screenshots**
   ```bash
   npm run test:visual:update
   ```
   This creates the initial baseline screenshots that future test runs will compare against.

2. **Review Baselines**
   Check the generated screenshots in `test-results/` directory to ensure they look correct.

3. **Run Tests**
   ```bash
   npm run test:visual
   ```

## Test Configuration

### Playwright Configuration (`playwright.config.ts`)

- **Base URL**: `http://localhost:5173`
- **Browsers**: Chrome, Firefox, Safari
- **Screenshots**: Taken on failure
- **Traces**: Collected on retry
- **Web Server**: Automatically starts dev server

### Visual Comparison Settings

- **Animations**: Disabled for consistent screenshots
- **Full Page**: Captures entire page when needed
- **Threshold**: Default Playwright visual comparison threshold

## Test Data IDs

The following test IDs are used for reliable element selection:

- `data-testid="lab-interface"` - Main interface container
- `data-testid="top-silo-section"` - Top silo groups section
- `data-testid="bottom-silo-section"` - Bottom silo groups section
- `data-testid="lab-cylinder"` - Cylinder sensor panel
- `data-testid="control-panel"` - Right side control panel
- `data-testid="silo-input"` - Silo number input field
- `data-testid="manual-test-button"` - Manual test button
- `data-testid="auto-test-button"` - Auto test button
- `data-testid="auto-test-progress"` - Auto test progress bar
- `data-testid="temperature-tooltip"` - Temperature tooltip

## Screenshot Organization

Screenshots are organized by test name and browser:

```
test-results/
├── lab-interface-visual-should-match-full-lab-interface-layout-chromium/
│   └── lab-interface-full.png
├── lab-interface-visual-should-match-top-silo-groups-section-chromium/
│   └── lab-interface-top-section.png
└── ...
```

## Maintenance

### Updating Baselines

When intentional visual changes are made:

1. **Review Changes**: Ensure changes are intentional
2. **Update Baselines**: Run `npm run test:visual:update`
3. **Verify Results**: Run `npm run test:visual` to confirm tests pass
4. **Commit Changes**: Include updated screenshots in version control

### Adding New Tests

1. **Add Test Case**: Create new test in `tests/lab-interface-visual.spec.ts`
2. **Use Test IDs**: Prefer `data-testid` selectors for reliability
3. **Generate Baseline**: Run with `--update-snapshots`
4. **Verify**: Ensure test passes consistently

### Debugging Failed Tests

1. **View Report**: Run `npm run test:visual:report`
2. **Compare Images**: Review actual vs expected screenshots
3. **Run Headed**: Use `npm run test:visual:headed` to see browser
4. **Check Timing**: Adjust `waitForTimeout` if needed

## Best Practices

### Test Reliability

- Use `data-testid` attributes instead of CSS selectors
- Disable animations with `animations: 'disabled'`
- Add appropriate wait times for dynamic content
- Use consistent viewport sizes

### Screenshot Quality

- Ensure consistent lighting/display settings
- Run tests in consistent environment
- Avoid system-specific fonts or rendering differences
- Use stable test data

### Performance

- Group related screenshots in single test when possible
- Use appropriate timeout values
- Consider parallel execution limits

## Troubleshooting

### Common Issues

1. **Flaky Tests**
   - Increase wait times
   - Disable animations
   - Use more specific selectors

2. **Font Rendering Differences**
   - Use web fonts instead of system fonts
   - Set consistent font rendering settings

3. **Timing Issues**
   - Add explicit waits for dynamic content
   - Wait for network requests to complete

4. **Browser Differences**
   - Review cross-browser compatibility
   - Consider browser-specific baselines

### Environment Issues

- Ensure development server is running
- Check port availability (5173)
- Verify browser installations
- Clear browser cache if needed

## Integration

### CI/CD Integration

For continuous integration:

```yaml
# Example GitHub Actions
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run Visual Tests
  run: npm run test:visual

- name: Upload Test Results
  uses: actions/upload-artifact@v3
  if: failure()
  with:
    name: playwright-report
    path: playwright-report/
```

### Git Integration

Include in `.gitignore`:
```
test-results/
playwright-report/
```

Include in version control:
```
tests/
playwright.config.ts
VISUAL_TESTING.md
```

## Support

For issues or questions:
1. Check Playwright documentation: https://playwright.dev/
2. Review test output and reports
3. Examine browser console for errors
4. Verify component functionality manually