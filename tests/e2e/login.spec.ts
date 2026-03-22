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

test.describe('Login Flow', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/\/home|\/channel\//);
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/');
    await page.locator('input[name="usernameOrEmail"]').fill('invaliduser');
    await page.locator('input[name="password"]').fill('wrongpassword');
    await page.locator('input[name="password"]').press('Enter');
    await expect(page.locator('input[name="usernameOrEmail"]')).toBeVisible({ timeout: 15000 });
  });

  test('should logout successfully', async ({ page }) => {
    await login(page);
    await page
      .locator('button[aria-label="User menu"], button[aria-label*="меню"], button[title="User menu"]')
      .first()
      .click();
    await page.getByText(/Logout|Выйти/i).first().click();
    await expect(page.locator('input[name="usernameOrEmail"]')).toBeVisible({ timeout: 15000 });
  });
});
