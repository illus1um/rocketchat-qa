# Assignment 2 Report

**Course:** Advanced QA  
**Assignment:** Assignment 2 - Practice with Web UI Automation  
**Student:** Aldiyar Sagidolla  
**Repository:** `rocketchat-qa`

## Submission Summary

| Requirement from assignment | Implementation status | Evidence |
|---|---|---|
| Automate search functionality | Completed | `tests/assignment2/assignment2.spec.ts` |
| Automate login and logout | Completed | `tests/assignment2/assignment2.spec.ts` |
| Book a flight with title checkpoint | Completed | `tests/assignment2/assignment2.spec.ts` |
| Use CSS selectors | Completed | Search, login, and flight tests |
| Use XPath selectors | Completed | Search, login, and flight tests |
| Configure GitHub CI | Completed | `.github/workflows/ci.yml` |

## Chosen Test Applications

| Scenario | Application used | URL path in repo | Why it was chosen |
|---|---|---|---|
| Search | Local Search Demo Portal | `demo-apps/search/index.html` | Stable search page with deterministic results |
| Login / Logout | Local Login Demo Workspace | `demo-apps/auth/index.html` | Reliable auth flow without external dependencies |
| Flight booking | Local SkyRoute Reservation Demo | `demo-apps/flights/index.html` | Supports a full booking flow and title checkpoint |

## Execution Overview

| Test case ID | Scenario | Expected result |
|---|---|---|
| TC-01 | Search for `selenium` | Matching result card is displayed |
| TC-02 | Login with valid credentials and logout | Dashboard opens, then login screen returns |
| TC-03 | Book flight from Almaty to London | Confirmation section opens and page title changes |

## Expanded Coverage Summary

| Area | Number of automated tests | Coverage focus |
|---|---:|---|
| Search | 6 | Positive, negative, Enter key, empty input, clear state, case-insensitive search |
| Login / Logout | 6 | Valid login, invalid login, required fields, error clearing, logout, relogin |
| Flight booking | 6 | Confirmation title, defaults, validation, alternate route, booking reference, error recovery |
| **Total** | **18** | Full Assignment 2 demo coverage |

## Why Local Demo Pages Were Used

| Reason | Benefit |
|---|---|
| No dependency on public websites | Tests do not break if third-party sites change |
| Predictable DOM structure | CSS and XPath selectors stay stable |
| Easy CI execution | GitHub Actions can run the same way as local machine |
| Faster grading demo | Instructor can run everything with one command |
