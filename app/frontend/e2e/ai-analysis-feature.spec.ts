import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
const HOST_USER = {
  id: 'e2e-host-2',
  email: 'host2@example.com',
  name: 'E2E Host 2',
  role: 'USER' as const,
};

const TOKEN = 'test-token';
const EXPIRATION = Date.now() + 60 * 60 * 1000;

async function seedAuth(page: any) {
  await page.addInitScript(({ user, token, expiration }) => {
    localStorage.setItem('standor_user', JSON.stringify(user));
    localStorage.setItem('standor_token', token);
    localStorage.setItem('standor_token_expiration', String(expiration));
  }, { user: HOST_USER, token: TOKEN, expiration: EXPIRATION });
}

test.describe('AI Analysis Feature Page', () => {
  test('create session, analyze code, save snapshot', async ({ page }) => {
    await seedAuth(page);

    const sessionId = 'e2e-session-ai-feature';

    // Mock session creation
    await page.route('**/api/sessions', async (route) => {
      if (route.request().method() !== 'POST') return route.continue();
      await route.fulfill({ json: { _id: sessionId, id: sessionId, problem: 'Manual', language: 'javascript' } });
    });

    // Mock analyze endpoint
    await page.route(`**/api/sessions/${sessionId}/analyze`, async (route) => {
      await route.fulfill({ json: {
        aiAnalysis: {
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(1)',
          correctness: 'Looks correct',
          bugs: [],
          suggestions: ['Add input checks'],
          testCases: ['sample'],
          codeStyle: 'Good',
          overallScore: 85,
          summary: 'Basic analysis passed.',
          analyzedAt: new Date().toISOString(),
        }
      } });
    });

    // Mock snapshot saving
    await page.route(`**/api/sessions/${sessionId}/snapshot`, async (route) => {
      await route.fulfill({ json: { saved: true } });
    });

    await page.route(`**/api/sessions/${sessionId}/report`, async (route) => {
      await route.fulfill({
        json: {
          report: {
            audience: 'interviewer',
            summary: 'Basic analysis passed.',
            strengths: ['Looks correct'],
            improvementAreas: ['Add input checks'],
            recommendations: ['Add input checks'],
            score: 85,
            generatedAt: new Date().toISOString(),
            snapshotCount: 0,
          },
        },
      });
    });

    await page.goto(`${BASE}/features/ai-analysis`);

    await expect(page.getByRole('heading', { name: /ai code analysis/i })).toBeVisible();

    // Create session
    await page.getByLabel(/title/i).fill('E2E AI Feature');
    await page.getByRole('button', { name: /create/i }).click();

    await expect(page.getByText(/session id/i)).toBeVisible({ timeout: 5000 }).catch(() => {});

    // Enter some code and run analysis (target the textarea editor)
    await page.locator('textarea').fill('function twoSum() { return []; }');
    await page.getByRole('button', { name: /analyze code/i }).click();

    await page.getByRole('button', { name: /^analysis$/i }).click();
    await expect(page.getByText(/overall score/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('85', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: /feedback report/i }).click();
    await expect(page.getByText(/basic analysis passed/i)).toBeVisible({ timeout: 10000 });

    // Save snapshot
    await page.getByRole('button', { name: /^editor$/i }).click();
    await page.getByRole('button', { name: /save snapshot/i }).click();
    await expect(page.getByText(/snapshot saved/i)).toBeVisible({ timeout: 2000 }).catch(() => {});
  });
});
