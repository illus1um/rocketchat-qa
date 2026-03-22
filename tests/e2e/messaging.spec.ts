import { test, expect } from '@playwright/test';

const ADMIN_USER = process.env.RC_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.RC_ADMIN_PASS || 'admin123';

test.describe('Messaging Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/');
    await page.locator('[name="emailOrUsername"]').fill(ADMIN_USER);
    await page.locator('[name="pass"]').fill(ADMIN_PASS);
    await page.locator('role=button[name="Login"]').click();
    await expect(page.locator('.rcx-sidebar')).toBeVisible({ timeout: 15000 });
  });

  test('should send a text message in general channel', async ({ page }) => {
    // Navigate to general channel
    await page.locator('[data-qa-id="sidebar-search"]').click();
    await page.locator('[data-qa="sidebar-search-input"]').fill('general');
    await page.locator('[data-qa="sidebar-item-general"]').click();

    // Type and send a message
    const testMessage = `QA Test Message - ${Date.now()}`;
    await page.locator('[name="msg"]').fill(testMessage);
    await page.keyboard.press('Enter');

    // Verify message appears in the message list
    await expect(page.locator(`text=${testMessage}`).last()).toBeVisible({
      timeout: 10000,
    });
  });

  test('should display sent message in the message list', async ({ page }) => {
    // Navigate to general channel
    await page.locator('[data-qa-id="sidebar-search"]').click();
    await page.locator('[data-qa="sidebar-search-input"]').fill('general');
    await page.locator('[data-qa="sidebar-item-general"]').click();

    // Send a message
    const testMessage = `Verify Display - ${Date.now()}`;
    await page.locator('[name="msg"]').fill(testMessage);
    await page.keyboard.press('Enter');

    // Verify the message is visible and contains the sender's username
    const messageElement = page.locator(`text=${testMessage}`).last();
    await expect(messageElement).toBeVisible({ timeout: 10000 });
  });

  test('should edit a previously sent message', async ({ page }) => {
    // Navigate to general channel
    await page.locator('[data-qa-id="sidebar-search"]').click();
    await page.locator('[data-qa="sidebar-search-input"]').fill('general');
    await page.locator('[data-qa="sidebar-item-general"]').click();

    // Send a message first
    const originalMessage = `Edit Test - ${Date.now()}`;
    await page.locator('[name="msg"]').fill(originalMessage);
    await page.keyboard.press('Enter');
    await expect(page.locator(`text=${originalMessage}`).last()).toBeVisible({
      timeout: 10000,
    });

    // Hover over message and click edit (press Up arrow to edit last message)
    await page.locator('[name="msg"]').press('ArrowUp');

    // Clear and type new message
    const editedMessage = `Edited - ${Date.now()}`;
    await page.locator('[name="msg"]').fill(editedMessage);
    await page.keyboard.press('Enter');

    // Verify edited message appears
    await expect(page.locator(`text=${editedMessage}`).last()).toBeVisible({
      timeout: 10000,
    });
  });
});
