import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
const HOST_USER = {
    id: 'e2e-host-1',
    email: 'host@example.com',
    name: 'E2E Host',
    role: 'USER' as const,
};

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ3MjUzNjgwMDB9.signature';
const EXPIRATION = Date.now() + 60 * 60 * 1000;

async function seedAuth(page: any) {
    await page.addInitScript(({ user, token, expiration }) => {
        localStorage.setItem('standor_user', JSON.stringify(user));
        localStorage.setItem('standor_token', token);
        localStorage.setItem('standor_token_expiration', String(expiration));
    }, { user: HOST_USER, token: TOKEN, expiration: EXPIRATION });
}

test.describe('AI Analysis Flow', () => {
    test('should request AI analysis and display results', async ({ page }) => {
        await seedAuth(page);

        const meetingCode = 'e2e-ai-analysis';
        const roomId = 'room-e2e-ai-analysis';

        await page.route('**/api/problems', async (route) => {
            await route.fulfill({ json: [] });
        });

        await page.route('**/api/meetings', async (route) => {
            if (route.request().method() !== 'POST') {
                await route.continue();
                return;
            }

            await route.fulfill({
                json: {
                    _id: roomId,
                    id: roomId,
                    callId: meetingCode,
                    roomId,
                    hostId: HOST_USER.id,
                    status: 'ACTIVE',
                    problem: 'Two Sum',
                    difficulty: 'MEDIUM',
                    language: 'javascript',
                    maxParticipants: 2,
                    meetingLink: `${BASE}/meeting/${meetingCode}`,
                },
            });
        });

        await page.route(`**/api/meetings/${meetingCode}`, async (route) => {
            await route.fulfill({
                json: {
                    id: roomId,
                    callId: meetingCode,
                    roomId,
                    hostId: HOST_USER.id,
                    status: 'ACTIVE',
                    problem: 'Two Sum',
                    difficulty: 'MEDIUM',
                    language: 'javascript',
                },
            });
        });

        await page.route('**/api/problems/Two%20Sum', async (route) => {
            await route.fulfill({
                json: {
                    title: 'Two Sum',
                    difficulty: 'EASY',
                    category: 'Array',
                    tags: ['array', 'hash-map'],
                    description: 'Find two numbers that add up to the target.',
                    examples: [],
                    starterCode: {},
                    testCases: [],
                },
            });
        });

        await page.route(`**/api/sessions/${roomId}/analyze`, async (route) => {
            await route.fulfill({
                json: {
                    aiAnalysis: {
                        timeComplexity: 'O(n)',
                        spaceComplexity: 'O(n)',
                        correctness: 'Correct',
                        bugs: [],
                        suggestions: ['Consider documenting the hash map approach.'],
                        testCases: ['Example passes'],
                        codeStyle: 'Clean',
                        overallScore: 9,
                        summary: 'Solid solution with the expected hash map pattern.',
                        analyzedAt: new Date().toISOString(),
                    },
                },
            });
        });

        await page.goto(`${BASE}/create-session`);
        await expect(page.getByRole('heading', { name: /new interview session/i })).toBeVisible();

        await page.getByPlaceholder(/e\.g\. Two Sum, LRU Cache, Valid Parentheses/i).fill('Two Sum');
        await page.getByRole('button', { name: /create interview room/i }).click();

        await expect(page.getByText('Meeting Created', { exact: true })).toBeVisible({ timeout: 15000 });
        await page.getByRole('button', { name: /enter meeting room/i }).click();

        await expect(page).toHaveURL(new RegExp(`/meeting/${meetingCode}$`), { timeout: 15000 });
        await page.getByRole('button', { name: /code off/i }).click();
        await expect(page.getByRole('button', { name: /analyze/i })).toBeVisible({ timeout: 15000 });

        await page.getByRole('button', { name: /^analyze$/i }).click();

        await expect(page.getByText(/Executive Summary/i)).toBeVisible({ timeout: 15000 });
        await expect(page.getByText(/Solid solution with the expected hash map pattern/i)).toBeVisible();
    });
});
