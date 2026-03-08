import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001';

test.describe('Authentication flows', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto(BASE);
    await expect(page).toHaveTitle(/Standor/i);
  });

  test('login page renders form', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('login-btn')).toBeVisible();
  });

  test('register page renders form', async ({ page }) => {
    await page.goto(`${BASE}/register`);
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('register-btn')).toBeVisible();
  });

  test('login shows error on invalid credentials', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.getByTestId('email-input').fill('nonexistent@example.com');
    await page.getByTestId('password-input').fill('wrongpassword');
    await page.getByTestId('login-btn').click();
    // Expect some error feedback
    await expect(page.locator('[role="alert"], .sonner-toast, [data-testid="error-msg"]').first()).toBeVisible({ timeout: 5000 });
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
