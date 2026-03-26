import { test, expect, type Page } from '@playwright/test';

const ADMIN_USER = process.env.RC_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.RC_ADMIN_PASS || 'admin123';

async function login(page: Page) {
  await page.goto('/');
  await page.locator('input[name="usernameOrEmail"]').fill(ADMIN_USER);
  await page.locator('input[name="password"]').fill(ADMIN_PASS);
  await page.locator('input[name="password"]').press('Enter');
  await expect(page.locator('input[name="filterText"]')).toBeVisible({ timeout: 20000 });
}

test.describe('Messaging Smoke', () => {
  test('should show room search input for authenticated user', async ({ page }) => {
    await login(page);
    await expect(page.locator('input[name="filterText"]')).toBeVisible();
  });
});
