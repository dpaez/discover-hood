import { test, expect } from '@playwright/test';

test('Should load home', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  await expect(page.locator('h1')).toContainText('Address Insights');
});
