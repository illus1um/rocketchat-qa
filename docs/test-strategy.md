# QA Test Strategy: Rocket.Chat (Fast-Track)

**Project:** Advanced QA Assignment 1
**System Under Test:** Rocket.Chat (self-hosted)
**Date:** 2026-03-22
**Version:** 1.1 (deadline fast-track)

## 1. Scope and Objectives

### In Scope (current implementation)

- Authentication API
- Channels API
- Messaging API
- UI smoke: login, logout, channel visibility, room search input
- API collection smoke (Newman)

### Out of Scope (for this fast-track iteration)

- Deep UI interaction flows (complex composer/edit edge cases)
- Enterprise-only features
- Mobile clients
- Full performance execution report (JMeter plan is prepared)

### Objectives

1. Keep critical regression checks stable and fast.
2. Ensure CI-ready automated checks for core flows.
3. Produce reproducible baseline metrics for Assignment 1.

## 2. Risk-Based Priority Mapping

Based on `docs/risk-assessment.md`:

- **P0 focus:** Authentication, REST API, Messaging
- **P1/P2:** Covered partially or planned for next iteration

Current test implementation prioritizes P0 stability over breadth.

## 3. Test Approach

### API Regression (Jest)

- Runner: Jest
- HTTP client: Axios
- Suites:
  - `auth.test.js` (5 tests)
  - `channels.test.js` (4 tests)
  - `messaging.test.js` (4 tests)

### UI Smoke (Playwright)

- Browsers: Chromium + Firefox
- Suites:
  - `login.spec.ts` (3 logical tests)
  - `channel.spec.ts` (1 logical test)
  - `messaging.spec.ts` (1 logical test)
- Total logical UI tests: 5
- Cross-browser executions per run: 10

### API Collection Smoke (Postman/Newman)

- Collection: `tests/postman/rocketchat-collection.json`
- Requests executed: 7
- Assertions: 14

### Performance

- Tool: JMeter
- Plan file: `tests/performance/load-test.jmx`
- Status: planned, not yet executed for final numeric baseline

## 4. Environment and Configuration

- Docker Compose stack (`docker-compose.yml`)
- Rocket.Chat image: `latest`
- MongoDB image: `mongo:8`
- Health endpoint: `/api/info`

Admin credentials are provided via env vars during test execution:

- `RC_ADMIN_USER`
- `RC_ADMIN_PASS`

## 5. Entry / Exit Criteria

### Entry

1. `docker compose up -d` completed
2. `curl http://localhost:3000/api/info` returns 200
3. Admin user exists and credentials are valid

### Exit (Assignment 1 target)

1. API suite passes (13/13)
2. E2E smoke suite passes (10/10 cross-browser)
3. Newman assertions pass (14/14)
4. Baseline metrics document updated

## 6. Limitations and Mitigations

- **Limitation:** Rocket.Chat v8 UI is volatile for deep E2E selectors.
- **Mitigation:** Smoke-only E2E for deadline stability.
- **Limitation:** JMeter numeric baseline not finalized.
- **Mitigation:** Test plan is prepared and can be run in next iteration.

## 7. Deliverable Alignment

This strategy supports Assignment 1 deliverables:

1. Risk-based planning (via linked risk assessment)
2. QA environment setup (Docker + tools + CI)
3. Initial strategy document (this file)
4. Baseline metrics (see `docs/baseline-metrics.md`)
