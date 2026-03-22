import { test, expect } from '@playwright/test';

const ADMIN_USER = process.env.RC_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.RC_ADMIN_PASS || 'admin123';

test.describe('Channel Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/');
    await page.locator('[name="emailOrUsername"]').fill(ADMIN_USER);
    await page.locator('[name="pass"]').fill(ADMIN_PASS);
    await page.locator('role=button[name="Login"]').click();
    await expect(page.locator('.rcx-sidebar')).toBeVisible({ timeout: 15000 });
  });

  test('should create a new public channel', async ({ page }) => {
    const channelName = `e2e-test-${Date.now()}`;

    // Click create channel button in sidebar
    await page.locator('[data-qa-id="sidebar-create-channel"]').click();

    // Fill in channel name
    await page.locator('[data-qa="channel-name-input"]').fill(channelName);

    // Submit creation
    await page.locator('role=button[name="Create"]').click();

    // Should navigate to the new channel
    await expect(page.locator(`[data-qa="room-header"] >> text=${channelName}`)).toBeVisible({
      timeout: 10000,
    });
  });

  test('should search for and join an existing channel', async ({ page }) => {
    // Use sidebar search to find general channel
    await page.locator('[data-qa-id="sidebar-search"]').click();
    await page.locator('[data-qa="sidebar-search-input"]').fill('general');

    // Click on the general channel result
    await page.locator('[data-qa="sidebar-item-general"]').click();

    // Verify we are in the general channel
    await expect(page.locator('[data-qa="room-header"]')).toContainText('general', {
      timeout: 10000,
    });

    // Verify the message input is available (meaning we're in the channel)
    await expect(page.locator('[name="msg"]')).toBeVisible({ timeout: 10000 });
  });
});
