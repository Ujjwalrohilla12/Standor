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

test.describe('Interview Creation and Execution', () => {
    test('should create a room, type code, and execute it', async ({ page }) => {
        await seedAuth(page);

        const meetingCode = 'e2e-interview';
        const roomId = 'room-e2e-interview';

        await page.route('**/api/meetings/e2e-interview', async (route) => {
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

        await page.route('**/api/problems/Two%20Sum/run', async (route) => {
            await route.fulfill({
                json: {
                    passed: 2,
                    total: 2,
                    results: [
                        { input: '[2,7,11,15], 9', expected: '[0,1]', passed: true, hidden: false, stdout: 'ok', stderr: null },
                        { input: '[3,2,4], 6', expected: '[1,2]', passed: true, hidden: false, stdout: 'ok', stderr: null },
                    ],
                },
            });
        });

        await page.goto(`${BASE}/meeting/${meetingCode}`);

        await page.getByRole('button', { name: /code off/i }).click();
        await expect(page.getByRole('button', { name: /run code/i }).first()).toBeVisible({ timeout: 15000 });
        await page.getByRole('button', { name: /run code/i }).first().click();

        await expect(page.getByText(/Exit: 0/i)).toBeVisible({ timeout: 15000 });
    });
});
