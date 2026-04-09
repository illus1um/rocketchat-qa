# Assignment 2 UI Automation Suite

Practice assignment repository for browser automation scenarios:

1. Search functionality
2. Login and logout functionality
3. Flight booking with a title checkpoint

The project uses Playwright and local demo web pages stored in this repository so the tests stay stable and pass both locally and in GitHub Actions.

## Project Structure

```text
demo-apps/
  search/           Local search demo page
  auth/             Local login/logout demo page
  flights/          Local flight booking demo page
docs/
  assignment2-report.md
  test-cases.md
  locators-and-ci.md
tests/assignment2/
  assignment2.spec.ts
.github/workflows/ci.yml
playwright.config.ts
package.json
```

## Run Locally

```bash
npm ci
npx playwright install --with-deps chromium
npm test
```

To open the HTML report after a local run:

```bash
npx playwright show-report
```

## What Is Covered

| Requirement | Status |
|---|---|
| Search functionality automation | Implemented |
| Login and logout automation | Implemented |
| Flight booking automation | Implemented |
| CSS selectors | Implemented |
| XPath selectors | Implemented |
| GitHub CI | Implemented |

## CI

GitHub Actions workflow is available in `.github/workflows/ci.yml`.

Current CI improvements:

- Runs on `push`, `pull_request`, and manual `workflow_dispatch`
- Cancels outdated in-progress runs for the same branch
- Uploads Playwright HTML report
- Uploads raw `test-results` artifacts with screenshots and traces
- Uploads JUnit XML report for machine-readable test results
