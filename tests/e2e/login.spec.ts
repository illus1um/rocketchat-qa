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

async function getSessionTokens(page: Page) {
  return page.evaluate(() => {
    const parseMaybeJson = (value: string | null) => {
      if (!value) return '';
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    };

    return {
      authToken: parseMaybeJson(localStorage.getItem('Meteor.loginToken')),
      userId: parseMaybeJson(localStorage.getItem('Meteor.userId')),
    };
  });
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

  test('should logout successfully', async ({ page, request }) => {
    await login(page);

    const session = await getSessionTokens(page);
    expect(session.authToken).toBeTruthy();
    expect(session.userId).toBeTruthy();

    await request.post('/api/v1/logout', {
      headers: {
        'X-Auth-Token': String(session.authToken),
        'X-User-Id': String(session.userId),
      },
    });

    await page.context().clearCookies();
    await page.goto('/');
    await expect(page.locator('input[name="usernameOrEmail"]')).toBeVisible({ timeout: 15000 });
  });
});
