# Baseline Metrics (Updated)

**Date:** 2026-03-22
**Context:** Fast-track baseline for Assignment 1 deadline

## 1. High-Risk Module Count

| Priority | Count | Modules |
|---|---:|---|
| P0 (Critical) | 3 | Real-time Messaging, REST API, Authentication |
| P1 (High) | 3 | E2E Encryption, Database Integrity, File Upload |
| P2 (Medium) | 2 | Omnichannel, Admin Panel |
| P3 (Low) | 2 | Video/Audio, Push Notifications |
| **Total** | **10** | |

## 2. Implemented Coverage Snapshot

| Suite | Implemented | Result |
|---|---:|---|
| API (Jest) | 13 tests | 13/13 passed |
| E2E Smoke (Playwright) | 5 logical tests | 10/10 passed (2 browsers) |
| Postman/Newman | 7 requests / 14 assertions | 14/14 assertions passed |
| Performance (JMeter) | 2 scenarios planned | Not executed yet |

## 3. API Coverage Baseline (Current)

| Area | Tests |
|---|---:|
| Authentication | 5 |
| Channels | 4 |
| Messaging | 4 |
| **Total API tests** | **13** |

Covered endpoints include:

- `/api/v1/login`, `/api/v1/me`, `/api/v1/logout`
- `/api/v1/channels.create`, `/api/v1/channels.list`, `/api/v1/channels.info`, `/api/v1/channels.delete`
- `/api/v1/chat.sendMessage`, `/api/v1/channels.history`, `/api/v1/chat.update`, `/api/v1/chat.delete`

## 4. E2E Baseline (Smoke)

Logical scenarios:

1. Successful login
2. Invalid login
3. Logout
4. Created channel visible in sidebar
5. Room search input interaction

Execution profile:

- Chromium + Firefox
- 10 total executed tests per run

## 5. Performance Baseline Plan

Planned scenarios (`tests/performance/load-test.jmx`):

1. Login load test
2. Messaging load test

Status: scenario design completed, numeric baseline pending execution.
Note: local machine currently does not have JMeter CLI installed (`jmeter` command not found).

## 6. Actual Run Results (2026-03-22)

| Command | Outcome |
|---|---|
| `npx jest tests/api --runInBand` | PASS (13/13) |
| `npx playwright test` | PASS (10/10) |
| `npx newman run tests/postman/rocketchat-collection.json ...` | PASS (14 assertions, 0 failed) |

## 7. Estimated Effort (Assignment 1)

| Activity | Person-hours |
|---|---:|
| Environment setup and fixes | 8 |
| Risk + strategy documentation | 8 |
| API automation | 8 |
| E2E smoke automation stabilization | 10 |
| Postman/Newman collection | 4 |
| CI/CD alignment | 4 |
| Metrics + reporting | 4 |
| **Total** | **46** |

## 8. Evidence Checklist

Status as of 2026-03-22:

- Docker and app running evidence: captured
- Login page and home page: captured
- API pass evidence (log + screenshot): captured
- E2E pass evidence (log + screenshot): captured
- Newman pass evidence (log + screenshot): captured
- Playwright HTML report screenshot: captured
- CI pipeline screenshot: pending (not captured in this local run)

Target folder: `screenshots/`
