# Locators and GitHub CI Notes

## Locator Strategy

| Locator type | Example from project | Purpose |
|---|---|---|
| CSS | `css=#search-input` | Fast targeting of input fields and visible components |
| CSS | `css=#full-name` | Reliable form field interaction |
| XPath | `//button[@id="search-button"]` | Demonstrates XPath usage required by assignment |
| XPath | `//span[@id="route-chip"]` | Checks confirmation content after booking |

## CI Pipeline Table

| Step | GitHub Actions command / action | Purpose |
|---|---|---|
| 1 | `actions/checkout@v4` | Download repository into runner |
| 2 | `actions/setup-node@v4` | Prepare Node.js 20 environment |
| 3 | `npm ci` | Install dependencies from lockfile |
| 4 | `npx playwright install --with-deps chromium` | Install browser for headless execution |
| 5 | `npm test` | Run 18 Assignment 2 UI tests |
| 6 | `actions/upload-artifact@v4` | Save Playwright report for review |

## How To Enable GitHub CI

| Action | What to do |
|---|---|
| Push workflow | Commit and push `.github/workflows/ci.yml` to GitHub |
| Open Actions tab | Verify that the `Assignment 2 UI Tests` workflow appears |
| Trigger run | Push to `main` or create a pull request |
| Review result | Open the workflow run and inspect the uploaded `playwright-report` artifact |
