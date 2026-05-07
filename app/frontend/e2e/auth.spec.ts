import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

test.describe('Authentication flows', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto(BASE);
    await expect(page).toHaveTitle(/Standor/i);
  });

  test('login page renders form', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('register page renders form', async ({ page }) => {
    await page.goto(`${BASE}/register`);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('login shows error on invalid credentials', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.locator('input[type="email"]').fill('nonexistent@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    // Expect some error feedback
    await expect(page.getByText(/login failed/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('protected route redirects to login when unauthenticated', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('forgot password page renders', async ({ page }) => {
    await page.goto(`${BASE}/forgot-password`);
    await expect(page.getByRole('heading', { name: /forgot|reset/i })).toBeVisible();
  });
});
