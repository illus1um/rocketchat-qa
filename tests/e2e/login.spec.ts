import { test, expect } from '@playwright/test';

const ADMIN_USER = process.env.RC_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.RC_ADMIN_PASS || 'admin123';

test.describe('Login Flow', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/');

    await page.locator('[name="emailOrUsername"]').fill(ADMIN_USER);
    await page.locator('[name="pass"]').fill(ADMIN_PASS);
    await page.locator('role=button[name="Login"]').click();

    // Should redirect to home/channel view
    await expect(page.locator('.rcx-sidebar')).toBeVisible({ timeout: 15000 });
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/');

    await page.locator('[name="emailOrUsername"]').fill('invaliduser');
    await page.locator('[name="pass"]').fill('wrongpassword');
    await page.locator('role=button[name="Login"]').click();

    // Should display an error message
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 10000 });
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.locator('[name="emailOrUsername"]').fill(ADMIN_USER);
    await page.locator('[name="pass"]').fill(ADMIN_PASS);
    await page.locator('role=button[name="Login"]').click();
    await expect(page.locator('.rcx-sidebar')).toBeVisible({ timeout: 15000 });

    // Open user menu and logout
    await page.locator('[data-qa-id="sidebar-avatar-button"]').click();
    await page.locator('role=menuitem[name="Logout"]').click();

    // Should return to login page
    await expect(page.locator('[name="emailOrUsername"]')).toBeVisible({ timeout: 10000 });
  });
});
