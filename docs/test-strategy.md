# QA Test Strategy: Rocket.Chat

**Project:** Advanced QA — Rocket.Chat Test Strategy
**Document:** Deliverable 2 — QA Test Strategy
**Version:** 1.0
**Date:** 2026-03-19
**Status:** Final

---

## Table of Contents

1. [Project Scope and Objectives](#1-project-scope-and-objectives)
2. [Risk Assessment Summary](#2-risk-assessment-summary)
3. [Test Approach](#3-test-approach)
4. [Tool Selection and Justification](#4-tool-selection-and-justification)
5. [Test Environment](#5-test-environment)
6. [Test Cases Overview](#6-test-cases-overview)
7. [Planned Metrics](#7-planned-metrics)
8. [Test Schedule](#8-test-schedule-2-week-plan)
9. [Entry and Exit Criteria](#9-entry-and-exit-criteria)
10. [Risks and Mitigations](#10-risks-and-mitigations)

---

## 1. Project Scope and Objectives

### 1.1 System Under Test

| Attribute        | Detail                                              |
|------------------|------------------------------------------------------|
| **System**       | Rocket.Chat — open-source team communication platform |
| **Deployment**   | Self-hosted via Docker Compose                       |
| **Version**      | Latest stable release                                |
| **Repository**   | https://github.com/RocketChat/Rocket.Chat            |

### 1.2 Scope Definition

| Category     | Modules / Features                                                                 |
|--------------|------------------------------------------------------------------------------------|
| **In Scope** | Authentication (login, logout, session management), Real-time messaging (send, edit, delete, history), REST API endpoints, Channels (create, list, join, invite, delete), File upload and retrieval |
| **Out of Scope** | Enterprise-only features (audit log, compliance), Mobile applications (iOS, Android), Marketplace apps and integrations, Email integration (IMAP/SMTP), LDAP/SAML/OAuth federation providers |

### 1.3 Test Objectives

1. **Risk-based coverage** — Establish automated test coverage for all critical (P0) and high-priority (P1) modules identified in the risk assessment.
2. **Automated regression suite** — Build a maintainable, CI-integrated regression suite covering API, E2E, and performance dimensions.
3. **Baseline quality metrics** — Measure and document pass rates, execution times, API coverage, and performance baselines to enable trend analysis in future iterations.

---

## 2. Risk Assessment Summary

This section summarizes findings from the detailed risk assessment (see [`docs/risk-assessment.md`](risk-assessment.md)).

### 2.1 Risk Priority Matrix

| Priority | Module               | Risk Score | Likelihood | Impact |
|----------|----------------------|:----------:|:----------:|:------:|
| **P0 — Critical** | Real-time Messaging  | 20 | 4 | 5 |
| **P0 — Critical** | REST API             | 16 | 4 | 4 |
| **P0 — Critical** | Authentication       | 15 | 3 | 5 |
| **P1 — High**     | E2E Encryption       | 15 | 3 | 5 |
| **P1 — High**     | Database Layer       | 15 | 3 | 5 |
| **P1 — High**     | File Upload          | 12 | 3 | 4 |
| **P2 — Medium**   | Omnichannel          | 12 | 4 | 3 |
| **P2 — Medium**   | Admin Panel          | 9  | 3 | 3 |
| **P3 — Low**      | Video/Audio Calls    | 8  | 2 | 4 |
| **P3 — Low**      | Push Notifications   | 6  | 2 | 3 |

### 2.2 Risk-to-Test Mapping

Test effort allocation is directly proportional to risk score. P0 modules receive the highest density of automated tests, while P3 modules are addressed through exploratory and manual sessions only where practical.

---

## 3. Test Approach

### 3.1 Test Levels

| Test Level            | Technique                      | Tooling           | Target Modules                        |
|-----------------------|--------------------------------|--------------------|---------------------------------------|
| **Integration / API** | REST API endpoint validation   | Jest + Axios       | Authentication, Channels, Messaging   |
| **E2E / UI**          | Critical user journey testing  | Playwright         | Login, Messaging, Channel management  |
| **Performance**       | Load and stress testing        | Apache JMeter      | Login endpoint, Messaging throughput  |

### 3.2 Manual vs. Automated Split

| Area            | Manual % | Automated % | Rationale                                                        |
|-----------------|:--------:|:-----------:|------------------------------------------------------------------|
| Authentication  | 20       | 80          | Login/logout flows are highly repeatable and regression-prone    |
| Messaging       | 10       | 90          | High-frequency regression area; real-time validation essential   |
| REST API        | 5        | 95          | Stateless request/response pairs are fully automatable           |
| File Upload     | 40       | 60          | Edge cases (corrupt files, oversized uploads) need manual review |
| Admin Panel     | 70       | 30          | Exploratory testing yields higher defect discovery               |
| Video/Audio     | 90       | 10          | WebRTC interactions are difficult to automate reliably           |

**Overall target:** ≥ 70% automated coverage across all in-scope modules.

### 3.3 Test Types

| Test Type              | Description                                                                                     |
|------------------------|-------------------------------------------------------------------------------------------------|
| **Functional Testing** | Validate that each feature behaves according to documented API contracts and UI expectations     |
| **Security Testing**   | Authentication bypass attempts, input injection (XSS, NoSQL injection), file upload validation (MIME type spoofing, path traversal) |
| **Performance Testing**| Concurrent user simulation, response-time measurement, throughput analysis under sustained load  |
| **Regression Testing** | Automated suite executed on every push via CI/CD pipeline to catch regressions early            |

---

## 4. Tool Selection and Justification

| Tool               | Purpose               | Justification                                                                                      |
|--------------------|-----------------------|----------------------------------------------------------------------------------------------------|
| **Playwright**     | E2E UI testing        | Modern framework with auto-wait, TypeScript-native, multi-browser support (Chromium, Firefox, WebKit), built-in test runner and assertions |
| **Jest + Axios**   | API testing           | Jest is already used in the Rocket.Chat codebase; Axios provides clean HTTP abstractions with native TypeScript support |
| **Postman/Newman** | API collection        | Visual interface for rapid collection building and debugging; Newman CLI enables headless execution in CI pipelines |
| **Apache JMeter**  | Performance testing   | Industry-standard load-testing tool; free and open-source; supports WebSocket protocol via plugin for real-time messaging tests |
| **Docker Compose** | Test environment      | Official Rocket.Chat Docker images ensure reproducibility; single `docker-compose up` brings the entire stack online |
| **GitHub Actions**  | CI/CD pipeline        | Free for public repositories; tight integration with the project repository; supports matrix builds and artifact storage |

---

## 5. Test Environment

### 5.1 Infrastructure

| Component          | Configuration                                                    |
|--------------------|------------------------------------------------------------------|
| **Rocket.Chat**    | Official Docker image (`rocket.chat:latest`), exposed on port 3000 |
| **MongoDB**        | Official Docker image (`mongo:6`), configured as a 3-node replica set for oplog tailing |
| **Orchestration**  | Docker Compose file managing both services with health checks     |
| **Base URL**       | `http://localhost:3000`                                          |

### 5.2 Test Data Strategy

| Data Element      | Provisioning Method                                              |
|-------------------|------------------------------------------------------------------|
| Admin user        | Created during Rocket.Chat setup wizard (seeded via REST API)    |
| Test users        | Created via `POST /api/v1/users.create` in test setup hooks     |
| Test channels     | Created via `POST /api/v1/channels.create` in test setup hooks  |
| Test messages     | Sent via `POST /api/v1/chat.sendMessage` during test execution  |
| Cleanup           | `afterAll` hooks delete created resources to maintain isolation  |

### 5.3 Browser and OS Matrix

| Dimension   | Values                                              |
|-------------|-----------------------------------------------------|
| **Browsers**| Chromium, Firefox (via Playwright)                   |
| **CI OS**   | Ubuntu 22.04 (GitHub Actions runner)                 |
| **Local OS**| Windows 11 (developer workstations)                  |

---

## 6. Test Cases Overview

### 6.1 API Tests — 13 Test Cases

#### `auth.test.js` — 5 tests

| # | Test Case                    | Method | Endpoint             | Expected Result          |
|---|------------------------------|--------|----------------------|--------------------------|
| 1 | Login with valid credentials | POST   | `/api/v1/login`      | 200 OK, returns authToken and userId |
| 2 | Login with invalid password  | POST   | `/api/v1/login`      | 401 Unauthorized         |
| 3 | Login with nonexistent user  | POST   | `/api/v1/login`      | 401 Unauthorized         |
| 4 | Get current user profile     | GET    | `/api/v1/me`         | 200 OK, returns user object |
| 5 | Logout                       | POST   | `/api/v1/logout`     | 200 OK, session invalidated |

#### `channels.test.js` — 4 tests

| # | Test Case                    | Method | Endpoint                    | Expected Result              |
|---|------------------------------|--------|-----------------------------|------------------------------|
| 1 | Create a public channel      | POST   | `/api/v1/channels.create`   | 200 OK, channel object returned |
| 2 | List all channels            | GET    | `/api/v1/channels.list`     | 200 OK, array of channels    |
| 3 | Invite user to channel       | POST   | `/api/v1/channels.invite`   | 200 OK, user added           |
| 4 | Delete channel               | POST   | `/api/v1/channels.delete`   | 200 OK, channel removed      |

#### `messaging.test.js` — 4 tests

| # | Test Case                    | Method | Endpoint                      | Expected Result               |
|---|------------------------------|--------|-------------------------------|-------------------------------|
| 1 | Send a message               | POST   | `/api/v1/chat.sendMessage`    | 200 OK, message object returned |
| 2 | Get message history          | GET    | `/api/v1/channels.history`    | 200 OK, array of messages     |
| 3 | Edit a message               | POST   | `/api/v1/chat.update`         | 200 OK, updated message       |
| 4 | Delete a message             | POST   | `/api/v1/chat.delete`         | 200 OK, message removed       |

### 6.2 E2E Tests — 8 Test Cases

#### `login.spec.ts` — 3 tests

| # | Test Case                        | Steps                                              | Expected Result                     |
|---|----------------------------------|-----------------------------------------------------|-------------------------------------|
| 1 | Login with valid credentials     | Navigate to `/`, enter username/password, click Login | Redirected to home, sidebar visible |
| 2 | Login with invalid credentials   | Navigate to `/`, enter wrong password, click Login    | Error toast displayed               |
| 3 | Logout                           | Click avatar, click Logout                            | Redirected to login page            |

#### `messaging.spec.ts` — 3 tests

| # | Test Case                        | Steps                                                    | Expected Result                     |
|---|----------------------------------|----------------------------------------------------------|-------------------------------------|
| 1 | Send a message in a channel      | Open channel, type message, press Enter                  | Message appears in timeline         |
| 2 | Message visible to other users   | Send message as User A, verify as User B                 | Message appears for both users      |
| 3 | Edit an existing message          | Hover message, click edit, modify text, confirm          | Message text updated in timeline    |

#### `channel.spec.ts` — 2 tests

| # | Test Case                        | Steps                                                    | Expected Result                     |
|---|----------------------------------|----------------------------------------------------------|-------------------------------------|
| 1 | Create a new channel             | Click create channel button, enter name, submit          | Channel appears in sidebar          |
| 2 | Search and join a channel        | Use search bar, find channel, click Join                 | User added to channel, chat loads   |

### 6.3 Performance Tests — 2 Scenarios

| # | Scenario              | Protocol | Concurrent Users | Ramp-up | Duration | Target                        |
|---|-----------------------|----------|:----------------:|:-------:|:--------:|-------------------------------|
| 1 | Login load test       | HTTP     | 50               | 30 s    | 60 s     | Avg response < 2 s, error < 5% |
| 2 | Messaging stress test | HTTP     | 20               | 10 s    | 60 s     | Avg response < 1 s, error < 2% |

---

## 7. Planned Metrics

| Metric                          | How to Measure                                | Tool / Source   |
|---------------------------------|-----------------------------------------------|-----------------|
| Test case count by module       | Count of `test()` / `it()` blocks per file    | Manual / Script |
| Test pass rate                  | `(passed / total) * 100` from CI results      | GitHub Actions  |
| API endpoint coverage           | Tested endpoints / total documented endpoints | Manual audit    |
| E2E scenario coverage           | Covered journeys / total identified journeys  | Manual audit    |
| Test execution time             | CI job duration (setup + run + teardown)       | GitHub Actions  |
| Defects found                   | Issues logged during test execution            | GitHub Issues   |
| Response time (avg, p95, p99)   | Aggregate report from load test results        | JMeter          |
| Throughput (requests/sec)       | Summary report from load test results          | JMeter          |
| Error rate under load           | `(errors / total requests) * 100`              | JMeter          |

---

## 8. Test Schedule (2-Week Plan)

### 8.1 Weekly Overview

| Week   | Focus Areas                                                                             |
|--------|-----------------------------------------------------------------------------------------|
| Week 1 | Environment setup, tool installation, risk assessment completion, initial test development |
| Week 2 | Complete test development, CI/CD pipeline tuning, performance tests, metrics collection, final documentation |

### 8.2 Day-by-Day Plan (3-Person Team)

**Person A** — Environment & E2E Testing
**Person B** — API Testing & Risk Assessment
**Person C** — Performance Testing & Metrics

#### Week 1

| Day       | Person A (Environment & E2E)          | Person B (API & Risk Assessment)       | Person C (Performance & Metrics)       |
|-----------|---------------------------------------|----------------------------------------|----------------------------------------|
| Day 1     | Set up Docker Compose environment     | Clone repo, install Node.js + Jest     | Install JMeter, review RC API docs     |
| Day 2     | Install Playwright, verify browsers   | Complete risk assessment document      | Design login load-test scenario        |
| Day 3     | Write `login.spec.ts` (3 tests)       | Write `auth.test.js` (5 tests)         | Design messaging stress-test scenario  |
| Day 4     | Write `messaging.spec.ts` (3 tests)   | Write `channels.test.js` (4 tests)     | Build JMeter test plans (.jmx files)   |
| Day 5     | Write `channel.spec.ts` (2 tests)     | Write `messaging.test.js` (4 tests)    | Dry-run performance tests, tune params |

#### Week 2

| Day       | Person A (Environment & E2E)          | Person B (API & Risk Assessment)       | Person C (Performance & Metrics)       |
|-----------|---------------------------------------|----------------------------------------|----------------------------------------|
| Day 6     | Debug and stabilize E2E tests         | Debug and stabilize API tests          | Execute login load test (final run)    |
| Day 7     | Set up GitHub Actions for E2E         | Set up GitHub Actions for API tests    | Execute messaging stress test          |
| Day 8     | Cross-browser testing (Firefox)       | API edge-case tests and cleanup        | Collect and analyze JMeter reports     |
| Day 9     | Fix flaky tests, add retries          | Finalize test strategy document        | Compile metrics dashboard              |
| Day 10    | Final regression run, review results  | Peer review all documents              | Final documentation and handoff        |

---

## 9. Entry and Exit Criteria

### 9.1 Entry Criteria

| # | Criterion                                                              | Verification                         |
|---|------------------------------------------------------------------------|--------------------------------------|
| 1 | Rocket.Chat Docker instance is running and accessible at `localhost:3000` | `curl http://localhost:3000/api/info` returns 200 |
| 2 | All testing tools are installed (Playwright, Jest, Axios, JMeter)       | Version check commands succeed       |
| 3 | Project repository is created with standard directory structure          | `git status` returns clean state     |
| 4 | Admin user credentials are configured and verified                      | Successful login via REST API        |

### 9.2 Exit Criteria

| # | Criterion                                                              | Verification                         |
|---|------------------------------------------------------------------------|--------------------------------------|
| 1 | All P0 modules have at least 3 automated tests each                    | Test count audit per module          |
| 2 | All four deliverable documents are complete and peer-reviewed           | Document checklist sign-off          |
| 3 | CI/CD pipeline executes all tests and reports green                     | GitHub Actions workflow passes       |
| 4 | Baseline quality metrics are documented in the metrics report           | Metrics report deliverable complete  |
| 5 | Test pass rate is at or above 90%                                       | CI pipeline summary                  |

---

## 10. Risks and Mitigations

| # | Risk                                         | Likelihood | Impact | Mitigation Strategy                                                         |
|---|----------------------------------------------|:----------:|:------:|-----------------------------------------------------------------------------|
| 1 | Rocket.Chat Docker boot time (60–90 seconds) | High       | Medium | Implement health-check wait loops (`wait-for-it.sh` or custom polling script) before test execution |
| 2 | Flaky E2E tests due to timing issues         | High       | High   | Use Playwright's built-in auto-wait; configure retry mechanism (`retries: 2` in config); avoid hard-coded sleeps |
| 3 | REST API changes between Rocket.Chat versions | Medium     | High   | Pin the Rocket.Chat image version in `docker-compose.yml` (e.g., `rocket.chat:6.x.y`); run API tests against pinned version |
| 4 | MongoDB replica set initialization failures  | Medium     | High   | Add `depends_on` with health-check conditions in Docker Compose; include replica set init script |
| 5 | CI runner resource constraints               | Low        | Medium | Optimize Docker layer caching; run API and E2E tests in parallel jobs; limit JMeter thread count in CI |
| 6 | Test data pollution across test runs         | Medium     | Medium | Use unique identifiers (timestamps/UUIDs) for test artifacts; implement thorough `afterAll` cleanup hooks |

---

## References

- [Risk Assessment (Deliverable 1)](risk-assessment.md)
- [Rocket.Chat REST API Documentation](https://developer.rocket.chat/reference/api/rest-api)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Apache JMeter User Manual](https://jmeter.apache.org/usermanual/index.html)
