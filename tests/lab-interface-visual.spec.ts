import { test, expect } from '@playwright/test';

test.describe('Lab Interface Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the lab interface
    await page.goto('/');
    
    // Wait for the interface to fully load
    await page.waitForSelector('[data-testid="lab-interface"]', { timeout: 10000 });
    
    // Wait for any animations or loading states to complete
    await page.waitForTimeout(1000);
  });

  test('should match full lab interface layout', async ({ page }) => {
    // Take a screenshot of the entire lab interface
    await expect(page).toHaveScreenshot('lab-interface-full.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match top silo groups section', async ({ page }) => {
    // Focus on the top section with silo groups (1-55)
    const topSection = page.locator('[data-testid="top-silo-section"]');
    await expect(topSection).toHaveScreenshot('lab-interface-top-section.png', {
      animations: 'disabled',
    });
  });

  test('should match bottom silo groups section', async ({ page }) => {
    // Focus on the bottom section with silo groups (101-195)
    const bottomSection = page.locator('[data-testid="bottom-silo-section"]');
    await expect(bottomSection).toHaveScreenshot('lab-interface-bottom-section.png', {
      animations: 'disabled',
    });
  });

  test('should match cylinder panel', async ({ page }) => {
    // Focus on the cylinder sensor panel
    const cylinderPanel = page.locator('[data-testid="lab-cylinder"]');
    await expect(cylinderPanel).toHaveScreenshot('lab-cylinder-panel.png', {
      animations: 'disabled',
    });
  });

  test('should match control panel', async ({ page }) => {
    // Focus on the right side control panel with input and buttons
    const controlPanel = page.locator('[data-testid="control-panel"]');
    await expect(controlPanel).toHaveScreenshot('lab-control-panel.png', {
      animations: 'disabled',
    });
  });

  test('should match selected silo state', async ({ page }) => {
    // Click on a specific silo to select it
    await page.locator('text="112"').first().click();
    await page.waitForTimeout(500); // Wait for selection animation
    
    // Take screenshot showing selected state
    await expect(page).toHaveScreenshot('lab-interface-selected-silo.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match hover state on silo', async ({ page }) => {
    // Hover over a silo to show tooltip
    await page.locator('text="115"').first().hover();
    await page.waitForTimeout(300); // Wait for hover effects
    
    // Take screenshot showing hover state and tooltip
    await expect(page).toHaveScreenshot('lab-interface-hover-state.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match manual test mode active state', async ({ page }) => {
    // Click on Start Manual Test button
    await page.locator('[data-testid="manual-test-button"]').click();
    await page.waitForTimeout(500);
    
    // Take screenshot showing manual test active state
    await expect(page).toHaveScreenshot('lab-interface-manual-test-active.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match auto test mode with progress', async ({ page }) => {
    // Click on Start Auto Test button
    await page.locator('[data-testid="auto-test-button"]').click();
    await page.waitForTimeout(1000); // Wait for auto test to start
    
    // Take screenshot showing auto test progress
    await expect(page).toHaveScreenshot('lab-interface-auto-test-progress.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match different silo input values', async ({ page }) => {
    // Test different silo numbers in the input
    const testValues = [1, 25, 50, 101, 150, 195];
    
    for (const value of testValues) {
      // Clear and enter new value
      await page.locator('[data-testid="silo-input"]').fill(value.toString());
      await page.waitForTimeout(300);
      
      // Take screenshot for this specific silo
      await expect(page).toHaveScreenshot(`lab-interface-silo-${value}.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    }
  });

  test('should match temperature color variations', async ({ page }) => {
    // Test different silos that should have different temperature colors
    const silosWithDifferentTemps = [
      { silo: 1, description: 'cold-temp' },
      { silo: 25, description: 'medium-temp' },
      { silo: 50, description: 'warm-temp' },
      { silo: 112, description: 'hot-temp' },
    ];
    
    for (const { silo, description } of silosWithDifferentTemps) {
      await page.locator('[data-testid="silo-input"]').fill(silo.toString());
      await page.waitForTimeout(300);
      
      // Focus on a specific silo group to show temperature colors
      const topSection = page.locator('[data-testid="top-silo-section"]');
      await expect(topSection).toHaveScreenshot(`lab-interface-${description}.png`, {
        animations: 'disabled',
      });
    }
  });

  test('should match responsive layout on different viewport sizes', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop-large' },
      { width: 1366, height: 768, name: 'desktop-medium' },
      { width: 1024, height: 768, name: 'tablet-landscape' },
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot(`lab-interface-${viewport.name}.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    }
  });

  test('should match individual component states', async ({ page }) => {
    // Test individual LabCircle components
    const circles = page.locator('.rounded-full').first();
    await expect(circles).toHaveScreenshot('lab-circle-component.png', {
      animations: 'disabled',
    });
    
    // Test individual LabNumberSquare components
    const squares = page.locator('.rounded-sm').first();
    await expect(squares).toHaveScreenshot('lab-number-square-component.png', {
      animations: 'disabled',
    });
  });

  test('should match error states and edge cases', async ({ page }) => {
    // Test with invalid silo number
    await page.locator('input[type="number"]').fill('999');
    await page.waitForTimeout(300);
    
    await expect(page).toHaveScreenshot('lab-interface-invalid-silo.png', {
      fullPage: true,
      animations: 'disabled',
    });
    
    // Test with empty input
    await page.locator('input[type="number"]').fill('');
    await page.waitForTimeout(300);
    
    await expect(page).toHaveScreenshot('lab-interface-empty-input.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});