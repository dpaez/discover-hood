import { test, expect } from '@playwright/test';

test('Should load home with address input and Popular Locations', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.locator('h1')).toContainText('Address Insights');

  const addressInput = page.getByRole('combobox');
  await expect(addressInput).toBeVisible();
  await expect(addressInput).toHaveAttribute(
    'placeholder',
    'Discover the neighbourhood...',
  );

  const popularHeading = page.getByRole('heading', {
    name: 'Popular Locations',
  });
  await expect(popularHeading).toBeVisible();

  const popularLinks = popularHeading.locator('..').getByRole('link');
  await expect(popularLinks).toHaveCount(5);

  for (let i = 0; i < 5; i++) {
    await expect(popularLinks.nth(i)).not.toHaveText('');
  }
});

test('Address autocomplete returns suggestions matching the query', async ({
  page,
}) => {
  await page.goto('/');

  const addressInput = page.getByRole('combobox');
  await expect(addressInput).toBeVisible();

  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/latlon') && response.status() === 200,
    { timeout: 30_000 },
  );

  await addressInput.fill('Empire State')
  await responsePromise

  const firstOption = page.getByRole('option').first();
  await expect(firstOption).toBeVisible({ timeout: 30_000 });
  await expect(firstOption).toContainText(/Empire|New York/i);
});

test('Lat/lon query params populate the address input', async ({ page }) => {
  await page.goto('/?lat=40.74844&lon=-73.98566');

  const addressInput = page.locator('#address-input');
  await expect(addressInput).toBeVisible({ timeout: 30_000 });
  await expect(addressInput).not.toHaveValue('', { timeout: 30_000 });
  await expect(addressInput).toHaveValue(/Empire|New York|Manhattan/i);
});
