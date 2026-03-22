import { test, expect, type Page } from '@playwright/test';

const ADMIN_USER = process.env.RC_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.RC_ADMIN_PASS || 'admin123';
const BASE_URL = process.env.ROCKETCHAT_URL || 'http://localhost:3000';
const API = `${BASE_URL}/api/v1`;
const SMOKE_CHANNEL = `qa-smoke-${Date.now()}`;

async function login(page: Page) {
  await page.goto('/');
  await page.locator('input[name="usernameOrEmail"]').fill(ADMIN_USER);
  await page.locator('input[name="password"]').fill(ADMIN_PASS);
  await page.locator('input[name="password"]').press('Enter');
  await expect(page.locator('input[name="filterText"]')).toBeVisible({ timeout: 20000 });
}

async function ensureChannel() {
  const loginRes = await fetch(`${API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: ADMIN_USER, password: ADMIN_PASS }),
  });
  const loginData = await loginRes.json();
  const headers = {
    'Content-Type': 'application/json',
    'X-Auth-Token': loginData.data.authToken,
    'X-User-Id': loginData.data.userId,
  };
  await fetch(`${API}/channels.create`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: SMOKE_CHANNEL }),
  });
}

test.describe('Channel Smoke', () => {
  test.beforeAll(async () => {
    await ensureChannel();
  });

  test('should show created channel in sidebar', async ({ page }) => {
    await login(page);
    await page.reload();
    await expect(page.locator(`text=${SMOKE_CHANNEL}`).first()).toBeVisible({ timeout: 20000 });
  });
});

