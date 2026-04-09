import { chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const searchUrl = `file://${path.join(rootDir, 'demo-apps/search/index.html')}`;
const authUrl = `file://${path.join(rootDir, 'demo-apps/auth/index.html')}`;
const flightsUrl = `file://${path.join(rootDir, 'demo-apps/flights/index.html')}`;
const reportUrl = `file://${path.join(rootDir, 'playwright-report/index.html')}`;

const screenshotDir = path.join(rootDir, 'screenshots');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });

await page.goto(searchUrl);
await page.locator('#search-input').fill('selenium');
await page.locator('#search-button').click();
await page.screenshot({ path: path.join(screenshotDir, 'assignment2-search.png'), fullPage: true });

await page.goto(authUrl);
await page.locator('#username').fill('student');
await page.locator('#password').fill('qa123');
await page.locator('#login-button').click();
await page.screenshot({ path: path.join(screenshotDir, 'assignment2-login-dashboard.png'), fullPage: true });

await page.goto(flightsUrl);
await page.locator('#from-city').selectOption('Almaty');
await page.locator('#to-city').selectOption('London');
await page.locator('#travel-date').fill('2026-05-10');
await page.locator('#passengers').selectOption('2');
await page.locator('#full-name').fill('Aldiyar Sagidolla');
await page.locator('#book-flight').click();
await page.screenshot({ path: path.join(screenshotDir, 'assignment2-flight-booking.png'), fullPage: true });

await page.goto(reportUrl);
await page.screenshot({ path: path.join(screenshotDir, 'assignment2-playwright-report.png'), fullPage: true });

await browser.close();
