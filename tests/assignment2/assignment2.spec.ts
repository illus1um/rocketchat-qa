import { expect, test, type Page } from '@playwright/test';

async function openSearch(page: Page) {
  await page.goto('/demo-apps/search/');
}

async function openAuth(page: Page) {
  await page.goto('/demo-apps/auth/');
}

async function login(page: Page) {
  await page.locator('css=input[name="username"]').fill('student');
  await page.locator('//input[@name="password"]').fill('qa123');
  await page.locator('css=#login-button').click();
}

async function openFlights(page: Page) {
  await page.goto('/demo-apps/flights/');
}

async function fillFlightBookingForm(
  page: Page,
  values?: {
    from?: string;
    to?: string;
    date?: string;
    passengers?: string;
    fullName?: string;
  }
) {
  await page.locator('css=#from-city').selectOption(values?.from ?? 'Almaty');
  await page.locator('//select[@id="to-city"]').selectOption(values?.to ?? 'London');
  await page.locator('css=#travel-date').fill(values?.date ?? '2026-05-10');
  await page.locator('//select[@id="passengers"]').selectOption(values?.passengers ?? '2');
  await page.locator('css=#full-name').fill(values?.fullName ?? 'Aldiyar Sagidolla');
}

test.describe('Assignment 2 UI automation', () => {
  test.describe('Search functionality', () => {
    test('returns matching result when search is triggered by button', async ({ page }) => {
      await openSearch(page);

      await page.locator('css=#search-input').fill('selenium');
      await page.locator('//button[@id="search-button"]').click();

      await expect(page.locator('css=#summary')).toContainText('Found 1 result(s)');
      await expect(page.locator('//article[contains(@class,"result-card")]//h2')).toContainText(
        'Selenium Locator Handbook'
      );
    });

    test('supports Enter key search', async ({ page }) => {
      await openSearch(page);

      await page.locator('css=#search-input').fill('playwright');
      await page.locator('//input[@id="search-input"]').press('Enter');

      await expect(page.locator('css=#summary')).toContainText('"playwright"');
      await expect(page.locator('css=.result-card h2')).toContainText('Playwright Browser Guide');
    });

    test('search is case-insensitive', async ({ page }) => {
      await openSearch(page);

      await page.locator('css=#search-input').fill('TRAVEL');
      await page.locator('//button[@id="search-button"]').click();

      await expect(page.locator('css=#summary')).toContainText('Found 1 result(s)');
      await expect(page.locator('//span[contains(@class,"tag")]')).toContainText('Travel');
    });

    test('shows a no-results message for unknown keyword', async ({ page }) => {
      await openSearch(page);

      await page.locator('css=#search-input').fill('mobile-app');
      await page.locator('//button[@id="search-button"]').click();

      await expect(page.locator('css=#summary')).toContainText('No results found');
      await expect(page.locator('css=.result-card')).toHaveCount(0);
    });

    test('validates empty search request', async ({ page }) => {
      await openSearch(page);

      await page.locator('//button[@id="search-button"]').click();

      await expect(page.locator('css=#summary')).toHaveText('Please enter a search keyword.');
      await expect(page.locator('css=.result-card')).toHaveCount(0);
    });

    test('clear button resets search state', async ({ page }) => {
      await openSearch(page);

      await page.locator('css=#search-input').fill('selenium');
      await page.locator('//button[@id="search-button"]').click();
      await page.locator('css=#clear-button').click();

      await expect(page.locator('css=#search-input')).toHaveValue('');
      await expect(page.locator('//div[@id="summary"]')).toHaveText('Type a keyword and press Search.');
      await expect(page.locator('css=.result-card')).toHaveCount(0);
    });
  });

  test.describe('Login and logout functionality', () => {
    test('logs in successfully with valid credentials', async ({ page }) => {
      await openAuth(page);

      await login(page);

      await expect(page).toHaveTitle(/Dashboard/);
      await expect(page.locator('//h2[@id="welcome-title"]')).toContainText('Welcome, student');
      await expect(page.locator('css=#dashboard')).toBeVisible();
    });

    test('shows validation message when fields are empty', async ({ page }) => {
      await openAuth(page);

      await page.locator('css=#login-button').click();

      await expect(page.locator('//div[@id="error-message"]')).toHaveText(
        'Username and password are required.'
      );
      await expect(page.locator('css=#login-view')).toBeVisible();
    });

    test('rejects invalid password', async ({ page }) => {
      await openAuth(page);

      await page.locator('css=input[name="username"]').fill('student');
      await page.locator('//input[@name="password"]').fill('wrongpass');
      await page.locator('css=#login-button').click();

      await expect(page.locator('css=#error-message')).toHaveText('Invalid username or password.');
      await expect(page.locator('//div[@id="dashboard"]')).toBeHidden();
    });

    test('clears error message after user edits fields', async ({ page }) => {
      await openAuth(page);

      await page.locator('css=#login-button').click();
      await expect(page.locator('css=#error-message')).toHaveText('Username and password are required.');

      await page.locator('//input[@id="username"]').fill('student');

      await expect(page.locator('css=#error-message')).toHaveText('');
    });

    test('logout returns user to login page', async ({ page }) => {
      await openAuth(page);

      await login(page);
      await page.locator('//button[@id="logout-button"]').click();

      await expect(page).toHaveTitle('Login Demo Workspace');
      await expect(page.locator('css=#login-view')).toBeVisible();
      await expect(page.locator('//input[@id="username"]')).toHaveValue('');
    });

    test('supports relogin after logout', async ({ page }) => {
      await openAuth(page);

      await login(page);
      await page.locator('//button[@id="logout-button"]').click();
      await login(page);

      await expect(page.locator('css=#dashboard')).toBeVisible();
      await expect(page.locator('//span[contains(@class,"pill")]')).toContainText('Authenticated session');
    });
  });

  test.describe('Flight booking functionality', () => {
    test('completes reservation and shows confirmation title', async ({ page }) => {
      await openFlights(page);

      await fillFlightBookingForm(page);
      await page.locator('//button[@id="book-flight"]').click();

      await expect(page).toHaveTitle('Booking Confirmed | SkyRoute Reservation Demo');
      await expect(page.locator('css=#confirmation')).toBeVisible();
      await expect(page.locator('//span[@id="route-chip"]')).toContainText('Almaty -> London');
      await expect(page.locator('css=#confirmation-text')).toContainText('2 seat(s)');
    });

    test('keeps default booking values visible before submit', async ({ page }) => {
      await openFlights(page);

      await expect(page.locator('css=#from-city')).toHaveValue('Almaty');
      await expect(page.locator('//select[@id="to-city"]')).toHaveValue('Dubai');
      await expect(page.locator('css=#travel-date')).toHaveValue('2026-05-10');
      await expect(page.locator('//select[@id="passengers"]')).toHaveValue('1');
    });

    test('shows validation error when passenger name is missing', async ({ page }) => {
      await openFlights(page);

      await fillFlightBookingForm(page, { fullName: '' });
      await page.locator('//button[@id="book-flight"]').click();

      await expect(page.locator('css=#flight-error')).toHaveText('Passenger full name is required.');
      await expect(page.locator('//section[@id="confirmation"]')).toBeHidden();
    });

    test('creates confirmation for another route and passenger count', async ({ page }) => {
      await openFlights(page);

      await fillFlightBookingForm(page, {
        from: 'Istanbul',
        to: 'Seoul',
        passengers: '3',
        fullName: 'Ainur Testova',
        date: '2026-06-15',
      });
      await page.locator('css=#book-flight').click();

      await expect(page.locator('//span[@id="route-chip"]')).toContainText('Istanbul -> Seoul');
      await expect(page.locator('css=#confirmation-text')).toContainText(
        'Ainur Testova successfully booked 3 seat(s) for 2026-06-15.'
      );
    });

    test('shows generated booking reference after successful booking', async ({ page }) => {
      await openFlights(page);

      await fillFlightBookingForm(page, {
        from: 'Astana',
        to: 'Dubai',
        passengers: '1',
        fullName: 'Dana QA',
      });
      await page.locator('//button[@id="book-flight"]').click();

      await expect(page.locator('css=#booking-reference')).toHaveText('Reference: SKY-ASDU-2026');
      await expect(page.locator('//h2[@id="confirmation-title"]')).toHaveText('Booking Confirmed');
    });

    test('hides previous validation error after successful booking', async ({ page }) => {
      await openFlights(page);

      await fillFlightBookingForm(page, { fullName: '' });
      await page.locator('//button[@id="book-flight"]').click();
      await expect(page.locator('css=#flight-error')).toHaveText('Passenger full name is required.');

      await fillFlightBookingForm(page, { fullName: 'Aldiyar Sagidolla' });
      await page.locator('//button[@id="book-flight"]').click();

      await expect(page.locator('css=#flight-error')).toHaveText('');
      await expect(page.locator('//section[@id="confirmation"]')).toBeVisible();
    });
  });
});
