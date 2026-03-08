import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001';

test.describe('Session and upload flows', () => {
  test('upload page requires authentication', async ({ page }) => {
    await page.goto(`${BASE}/upload`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('team rooms page requires authentication', async ({ page }) => {
    await page.goto(`${BASE}/team-rooms`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('shared session page shows invalid for bad token', async ({ page }) => {
    await page.goto(`${BASE}/shared/invalid-token-xyz`);
    await expect(page.getByText(/expired|invalid/i)).toBeVisible({ timeout: 8000 });
  });

  test('training page loads', async ({ page }) => {
    await page.goto(`${BASE}/training`);
    await expect(page).toHaveTitle(/Training|Standor/i);
  });
});
