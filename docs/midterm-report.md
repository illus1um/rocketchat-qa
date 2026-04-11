# Midterm Report: QA Implementation & Empirical Analysis

**Project:** Rocket.Chat — Open-Source Team Communications Platform  
**Course:** Advanced QA  
**Date:** 2026-04-11  
**Repository:** https://github.com/illus1um/rocketchat-qa  
**CI/CD:** https://github.com/illus1um/rocketchat-qa/actions

---

## 1. System Description

### 1.1 Architecture

Rocket.Chat is an open-source team communications platform (self-hosted alternative to Slack). It follows a **monolithic architecture** built on the Meteor full-stack reactive framework.

| Layer            | Technology                                |
|------------------|-------------------------------------------|
| Language         | TypeScript / JavaScript                   |
| Framework        | Meteor (full-stack reactive)              |
| Runtime          | Node.js                                   |
| Database         | MongoDB (single-node replica set)         |
| Real-time Layer  | WebSocket / DDP (Distributed Data Protocol) |
| Deployment       | Docker Compose                            |
| API              | REST API (150+ endpoints)                 |

### 1.2 Key Functionalities

- Real-time messaging across channels, groups, and direct messages
- REST API for integrations, bots, and automation
- User authentication (local credentials, OAuth, LDAP, SAML, 2FA)
- Role-based access control (RBAC)
- File upload and sharing
- End-to-end encryption
- Omnichannel / Livechat for customer support

### 1.3 Deployment Under Test

- **Edition:** Community (open-source, self-hosted)
- **Deployment:** Docker Compose (`docker-compose.yml`)
- **Services:** Rocket.Chat (latest) + MongoDB 8 (replica set `rs0`)
- **Base URL:** `http://localhost:3000`
- **Admin auto-setup:** via environment variables (no manual Setup Wizard)

---

## 2. Methodology

### 2.1 Risk-Based Testing Approach

Testing was prioritized using a quantitative risk model from Assignment 1:

```
Risk Score = Probability of Failure (P) × Impact of Failure (I)
```

Both P and I are rated 1–5. Modules scoring 12+ were prioritized for automation.

**Top 3 high-risk modules targeted for midterm testing:**

| Module                     | Risk Score | Priority |
|----------------------------|:----------:|:--------:|
| Real-time Messaging        | 20         | P0       |
| REST API                   | 16         | P0       |
| Authentication & Authorization | 15     | P0       |

### 2.2 Test Design Strategy

Tests were designed to cover **four mandatory categories** required by the midterm:

1. **Failure Scenarios** — how the system behaves when things go wrong (invalid credentials, expired tokens, error codes)
2. **Edge Cases** — boundary conditions (empty input, 50KB payloads, special characters, injection-like input)
3. **Concurrency / Race Conditions** — simultaneous requests, parallel operations, rapid sequential actions
4. **Invalid User Behavior** — unauthorized access, restricted endpoints, skipping required steps

### 2.3 Automation Tools

| Tool    | Purpose                        | Tests |
|---------|--------------------------------|:-----:|
| Jest    | Test runner and assertions     | 37    |
| Axios   | HTTP client for API calls      | —     |
| Docker Compose | Environment orchestration | —  |
| GitHub Actions | CI/CD pipeline            | —  |

---

## 3. Automation Implementation

### 3.1 Test Structure

```
tests/api/
├── auth.test.js           # 5 tests — basic authentication CRUD
├── auth-edge.test.js      # 8 tests — failure, edge, injection, RBAC
├── channels.test.js       # 4 tests — basic channel CRUD
├── channels-edge.test.js  # 7 tests — edge cases, duplicates, concurrency
├── messaging.test.js      # 4 tests — basic messaging CRUD
└── messaging-edge.test.js # 9 tests — edge, failure, concurrency
```

**Total: 37 tests across 6 test suites.**

### 3.2 Test Case Inventory

#### Authentication Tests (13 tests)

| Test ID | Scenario Type | Description |
|---------|---------------|-------------|
| AUTH-01 | Happy path | Login with valid credentials |
| AUTH-02 | Failure | Reject invalid password |
| AUTH-03 | Failure | Reject non-existent user |
| AUTH-04 | Happy path | GET /me with valid token |
| AUTH-05 | Happy path | Logout invalidates session |
| TC-AUTH-FAIL-01 | Failure | Reject expired/invalid token |
| TC-AUTH-FAIL-02 | Failure | Reject missing auth headers |
| TC-AUTH-FAIL-03 | Edge case | Reject empty password |
| TC-AUTH-FAIL-04 | Edge case | Reject empty username |
| TC-AUTH-EDGE-01 | Edge case | Reject NoSQL injection-like input |
| TC-AUTH-EDGE-02 | Edge case | Reject extremely long username (10000 chars) |
| TC-AUTH-EDGE-03 | Edge case | XSS-like input not reflected in response |
| TC-AUTH-INVALID-01 | Invalid behavior | Regular user cannot access admin endpoints |

#### Channel Tests (11 tests)

| Test ID | Scenario Type | Description |
|---------|---------------|-------------|
| CHAN-01 | Happy path | Create public channel |
| CHAN-02 | Happy path | List channels |
| CHAN-03 | Happy path | Get channel info |
| CHAN-04 | Happy path | Delete channel |
| TC-CHAN-EDGE-01 | Edge case | Reject special characters in channel name |
| TC-CHAN-EDGE-02 | Edge case | Reject empty channel name |
| TC-CHAN-EDGE-03 | Edge case | Reject duplicate channel creation |
| TC-CHAN-FAIL-01 | Failure | Reject unauthenticated channel creation |
| TC-CHAN-FAIL-02 | Failure | Error for non-existent channel info |
| TC-CHAN-FAIL-03 | Failure | Reject deleting already deleted channel |
| TC-CHAN-CONC-01 | Concurrency | 5 simultaneous channel creations succeed |

#### Messaging Tests (13 tests)

| Test ID | Scenario Type | Description |
|---------|---------------|-------------|
| MSG-01 | Happy path | Send message to channel |
| MSG-02 | Happy path | Retrieve message history |
| MSG-03 | Happy path | Edit existing message |
| MSG-04 | Happy path | Delete message |
| TC-MSG-EDGE-01 | Edge case | Handle empty message |
| TC-MSG-EDGE-02 | Edge case | Special characters & unicode (emoji, CJK, Arabic) |
| TC-MSG-EDGE-03 | Edge case | Very large message (50KB payload) |
| TC-MSG-FAIL-01 | Failure | Reject message to non-existent room |
| TC-MSG-FAIL-02 | Failure | Reject unauthenticated message send |
| TC-MSG-FAIL-03 | Failure | Reject updating non-existent message |
| TC-MSG-FAIL-04 | Failure | Reject deleting non-existent message |
| TC-MSG-CONC-01 | Concurrency | 10 simultaneous messages — no data loss |
| TC-MSG-CONC-02 | Concurrency | Rapid send-then-delete consistency |

### 3.3 CI/CD Setup

**Pipeline:** GitHub Actions (`.github/workflows/ci.yml`)  
**Trigger:** Every push to `main`, pull requests, manual dispatch

**Pipeline flow:**

```
Push → Checkout → Install deps → Docker Compose up →
  Wait MongoDB healthy → Wait RC ready →
  Verify admin login → Run 37 tests with coverage →
  Quality Gates evaluation → Upload artifacts → Docker Compose down
```

**Key CI features:**
- MongoDB health check auto-initializes replica set
- Rocket.Chat waits for `condition: service_healthy` on MongoDB
- Up to 360 seconds wait for RC startup with progress logging
- Full diagnostic logs on failure (container status + RC logs)
- Artifacts: coverage report (14-day retention)

### 3.4 Quality Gates Definition

Three quality gates are evaluated automatically after every pipeline run:

| Gate | Threshold | Rationale |
|------|-----------|-----------|
| Gate 1: Test Pass Rate | ≥ 90% | Ensures overall test health |
| Gate 2: Zero Critical Failures | 0 failures in auth/security tests | Security tests must never fail |
| Gate 3: All Test Suites Pass | 0 failed suites | No entire module can be broken |

**Pipeline fails if any gate is not met.**

---

## 4. Results

### 4.1 Test Execution Summary

| Metric | Value |
|--------|-------|
| Total tests | 37 |
| Passed | 37 |
| Failed | 0 |
| Test suites | 6 |
| Execution time (local) | ~2.5 seconds |
| Execution time (CI) | ~1 min 32 sec (incl. Docker startup) |
| CI Run | [#9 — Success](https://github.com/illus1um/rocketchat-qa/actions/runs/24275931004) |

### 4.2 Quality Gate Results

```
=========================================
       QUALITY GATE EVALUATION
=========================================

Results: 37/37 passed, 0 failed

Gate 1 — Pass Rate >= 90%: PASSED (100%)
Gate 2 — Zero critical failures: PASSED (0 failures)
Gate 3 — All test suites pass: PASSED

=========================================
  QUALITY GATES: ALL PASSED
=========================================
```

### 4.3 Test Results by Module

| Module | Tests | Passed | Failed | Pass Rate |
|--------|:-----:|:------:|:------:|:---------:|
| Authentication & Authorization | 13 | 13 | 0 | 100% |
| REST API — Channels | 11 | 11 | 0 | 100% |
| REST API — Messaging | 13 | 13 | 0 | 100% |
| **Total** | **37** | **37** | **0** | **100%** |

### 4.4 Test Results by Category

| Category | Tests | Passed | Failed |
|----------|:-----:|:------:|:------:|
| Happy path (CRUD) | 13 | 13 | 0 |
| Failure scenarios | 10 | 10 | 0 |
| Edge cases | 9 | 9 | 0 |
| Concurrency | 3 | 3 | 0 |
| Invalid user behavior | 2 | 2 | 0 |

### 4.5 Defect Detection

| # | Test | Finding | Severity | Module |
|---|------|---------|----------|--------|
| 1 | TC-MSG-EDGE-01 | Rocket.Chat accepts empty messages (empty string `""`) without error — could lead to UI clutter | Low | Messaging |
| 2 | TC-MSG-EDGE-03 | 50KB message is accepted and stored without any server-side size limit — potential for abuse | Medium | Messaging / Database |
| 3 | TC-AUTH-INVALID-01 | Regular users can register freely via API even though no open-registration policy was intended | Low | Authentication |

**Defect mapping to risk levels:**

| Defect | Risk Module | Original Risk Score | Impact |
|--------|-------------|:-------------------:|--------|
| Empty messages accepted | Real-time Messaging | 20 (P0) | Low — cosmetic but affects P0 module |
| No message size limit | REST API + Database | 16 / 15 (P0/P1) | Medium — DoS potential |
| Open user registration | Authentication | 15 (P0) | Low — default config concern |

### 4.6 Coverage Analysis

Since our tests are **integration tests** hitting a running Rocket.Chat instance via HTTP, traditional code coverage (Istanbul/JaCoCo) does not apply — we don't own the Rocket.Chat source code. Instead, we measure **API endpoint coverage**:

| API Area | Total Key Endpoints | Tested Endpoints | Coverage |
|----------|:-------------------:|:----------------:|:--------:|
| Authentication (`/login`, `/logout`, `/me`) | 3 | 3 | 100% |
| Channels (`create`, `list`, `info`, `delete`) | 4 | 4 | 100% |
| Messaging (`sendMessage`, `history`, `update`, `delete`) | 4 | 4 | 100% |
| User management (`register`, `users.list`, `users.delete`) | 3 | 2 | 67% |
| **High-risk modules total** | **14** | **13** | **93%** |

**Coverage gaps:**
- File upload endpoints — not tested (P1 module, deferred)
- E2E encryption API — not tested (requires browser-side crypto)
- Omnichannel/Livechat API — not tested (P2 module, out of scope)

### 4.7 Flaky Test Analysis

| Metric | Value |
|--------|-------|
| Total CI runs analyzed | 2 (runs #8 and #9) |
| Flaky tests detected | 0 |
| Flaky test rate | 0% |

No tests exhibited inconsistent pass/fail behavior. All 37 tests passed deterministically across both CI runs and multiple local executions.

### 4.8 Efficiency Metrics

| Metric | Assignment 1 | Midterm | Change |
|--------|:------------:|:-------:|:------:|
| Total tests | 13 | 37 | +185% |
| Test execution time | ~1.1 sec | ~2.5 sec | +127% |
| Tests per second | 11.8 | 14.8 | +25% improvement |
| CI pipeline time | N/A | 92 sec | New |
| Defects found | 0 | 3 | +3 |

---

## 5. Task 1: Refined Risk-Based Testing Strategy

### 5.1 Re-evaluation of High-Risk Components

| Module | Original Score (A1) | Observed Issues (Midterm) | Updated Score | Justification |
|--------|:-------------------:|---------------------------|:-------------:|---------------|
| Real-time Messaging | P=4, I=5, **Score=20** | Empty messages accepted; 50KB messages stored without limit; 10 concurrent messages handled correctly | P=4, I=5, **Score=20** | Risk remains Critical. While concurrency worked, the lack of message validation and size limits confirms high defect probability in edge cases. |
| REST API | P=4, I=4, **Score=16** | All CRUD operations stable; error handling consistent (proper 400/401 codes); 5 concurrent channel creations succeeded | P=3, I=4, **Score=12** | Probability reduced from 4→3. API demonstrated consistent behavior under normal and edge-case conditions. Error responses are well-structured. Moved from P0 to P1. |
| Authentication | P=3, I=5, **Score=15** | NoSQL injection rejected; XSS not reflected; expired tokens rejected; RBAC partially enforced; open registration is a config concern | P=3, I=5, **Score=15** | Score unchanged. Security tests passed (injection, XSS, token invalidation), but open registration without explicit policy and untested 2FA keep probability at 3. Impact remains Critical. |

### 5.2 Evidence from Automation Runs

#### A. Failed Test Cases
No test failures were observed across all runs. All 37 tests passed consistently.

#### B. Flaky Tests
No flaky tests detected. 0% flaky rate across all CI and local executions.

#### C. Coverage Gaps

| Module | Endpoint Coverage | Gap |
|--------|:-----------------:|-----|
| Authentication | 100% (3/3) | 2FA, OAuth, LDAP not tested |
| REST API — Channels | 100% (4/4) | Private groups, DMs not tested |
| REST API — Messaging | 100% (4/4) | Threads, reactions, attachments not tested |
| File Upload | 0% (0/4) | Entire module untested |
| E2E Encryption | 0% (0/3) | Requires browser-side crypto |

#### D. Unexpected System Behavior

1. **Empty messages accepted** — `POST /chat.sendMessage` with `msg: ""` returns 200 OK and stores the message. Expected: validation error.
2. **50KB message stored** — No server-side message size limit observed. A 50,000-character message was accepted and returned in full. Potential DoS vector.
3. **Open user registration** — `POST /users.register` is available without authentication, allowing anyone to create accounts on the instance.

### 5.3 Risk Dimension Mapping

| Module | Likelihood | Impact | Detectability |
|--------|:----------:|:------:|:-------------:|
| Real-time Messaging | ↔ (unchanged — edge cases confirmed) | ↔ (Critical — core feature) | ↑ (improved — 13 tests now cover messaging) |
| REST API | ↓ (reduced — consistent error handling observed) | ↔ (Major — integrations depend on it) | ↑ (improved — 11 tests including concurrency) |
| Authentication | ↔ (unchanged — injection safe but gaps remain) | ↔ (Critical — security module) | ↑ (improved — 13 tests including RBAC and injection) |

---

## 6. Task 4: Comparative Analysis

### 6.1 Planned vs Actual

| Aspect | Planned (A1) | Actual (Midterm) | Gap |
|--------|--------------|------------------|-----|
| API tests | 13 (auth, channels, messaging) | 37 (+24 edge/failure/concurrency) | Exceeded plan by 185% |
| UI E2E tests | 5 smoke tests (Playwright) | 0 (dropped — focused on API depth) | UI tests deferred; API tests provide more value for risk modules |
| Newman/Postman | 7 requests, 14 assertions | Not included in midterm | Redundant — Jest API tests cover same endpoints more thoroughly |
| Performance (JMeter) | Planned, not executed | Not executed | JMeter CLI unavailable; concurrency tests partially cover this gap |
| CI/CD pipeline | Not operational (A2 demo-app only) | Fully operational with Docker Compose + quality gates | Major improvement — real CI on real Rocket.Chat |
| Quality gates | Not defined | 3 gates defined and automated | New deliverable |
| Defects found | 0 | 3 | Improved detection through edge case testing |

### 6.2 Key Insights

#### Incorrect Assumptions in Planning

1. **UI E2E was overvalued in A1.** The original plan allocated significant effort to Playwright smoke tests, but Rocket.Chat's UI is volatile across versions. API-level testing proved far more stable and provided better coverage of high-risk modules (Authentication, REST API, Messaging).

2. **Newman was redundant.** The Postman collection tested the same endpoints as Jest API tests but with less flexibility. Jest allows programmatic test setup/teardown, concurrent assertions, and JSON output for quality gates — Newman does not.

3. **Performance testing required dedicated infrastructure.** The A1 plan included JMeter load testing, but the local Docker environment and CI runners are insufficient for meaningful performance benchmarks. However, concurrency tests (10 parallel messages, 5 parallel channel creations) partially validated behavior under load.

#### Missing Test Scenarios (Identified During Midterm)

- **Token expiration/rotation** — we tested invalid tokens but not naturally expired ones
- **Rate limiting** — no tests verify that the API enforces rate limits
- **File upload security** — P1 module remains completely untested
- **WebSocket/DDP real-time protocol** — P0 module tested only through REST API, not through the real-time layer

#### Automation Design Improvements

- **Docker health checks** were essential for CI reliability. The initial approach (separate `mongo-init-replica` container with `sleep 10`) failed in CI due to timing sensitivity. The health-check-based approach is deterministic.
- **JSON test output** enables automated quality gate evaluation — this was not planned in A1 but proved critical for CI/CD pipeline.

---

## 7. Discussion

### 7.1 What Worked

1. **Risk-based test prioritization was effective.** By focusing on P0 modules (Authentication, REST API, Messaging), we achieved 93% endpoint coverage on high-risk areas with 37 tests. The risk assessment from A1 directly guided test case design for the midterm.

2. **API integration testing is highly stable.** All 37 tests pass deterministically with 0% flaky rate. Unlike UI tests which depend on CSS selectors and rendering timing, API tests hit stable REST endpoints and produce consistent results.

3. **Docker Compose auto-setup eliminated manual intervention.** The `OVERWRITE_SETTING_Show_Setup_Wizard: completed` and `ADMIN_USERNAME`/`ADMIN_PASS` environment variables allow fully automated environment provisioning — both locally and in CI.

4. **Quality gates provide objective go/no-go criteria.** The three automated gates (pass rate, zero critical failures, all suites pass) turn the CI pipeline into a decision-making tool rather than just a test runner.

### 7.2 What Didn't Work

1. **Assignment 2 work was unusable.** The previous assignment created demo HTML applications and Playwright tests against them — completely disconnected from the actual Rocket.Chat system under test. This work had to be discarded entirely for the midterm.

2. **Traditional code coverage is not applicable.** Since we test a running Rocket.Chat instance via HTTP (black-box), we cannot measure line/branch coverage with Istanbul or similar tools. API endpoint coverage is the closest meaningful metric.

3. **Performance testing gap persists.** JMeter was planned in A1 but never executed. While concurrency tests provide some load validation, proper performance benchmarking requires dedicated infrastructure and longer test durations.

### 7.3 Unexpected Findings

1. **Rocket.Chat accepts empty messages** — this is a minor UI/UX defect but was not predicted in the risk assessment. The messaging module's risk score (20) was justified by concurrency and delivery concerns, not input validation gaps.

2. **No server-side message size limit** — a 50KB message was accepted without error. This could be exploited for database bloat or denial-of-service attacks. This finding validates the P0 classification of both REST API and Database modules.

3. **MongoDB health check can self-initialize replica sets** — using `rs.initiate()` inside the health check command eliminates the need for a separate init container. This made the Docker setup more robust and CI-friendly.

### 7.4 Improvements for Next Phase

1. **Add WebSocket/DDP tests** for the Real-time Messaging module (current P0, score 20) — REST API tests alone don't cover the real-time data flow
2. **Add file upload security tests** for the File Upload module (P1, score 12) — completely untested
3. **Implement rate limiting tests** to verify API abuse protection
4. **Add performance benchmarks** using k6 or Artillery (lighter than JMeter, CI-friendly)
5. **Test 2FA enforcement** and OAuth flows for Authentication module

---

## Appendix A: Repository Structure

```
rocketchat-qa/
├── .github/workflows/ci.yml      # CI/CD pipeline
├── docker-compose.yml             # Rocket.Chat + MongoDB
├── jest.config.js                 # Jest configuration
├── package.json                   # Dependencies and scripts
├── docs/
│   ├── risk-assessment.md         # Assignment 1 risk analysis
│   ├── test-strategy.md           # QA test strategy
│   ├── baseline-metrics.md        # A1 baseline metrics
│   └── midterm-report.md          # This report
├── tests/api/
│   ├── auth.test.js               # Authentication CRUD (5)
│   ├── auth-edge.test.js          # Auth edge cases (8)
│   ├── channels.test.js           # Channels CRUD (4)
│   ├── channels-edge.test.js      # Channels edge cases (7)
│   ├── messaging.test.js          # Messaging CRUD (4)
│   └── messaging-edge.test.js     # Messaging edge cases (9)
└── screenshots/                   # Evidence artifacts
```

## Appendix B: CI/CD Pipeline Evidence

- **Successful run:** https://github.com/illus1um/rocketchat-qa/actions/runs/24275931004
- **Pipeline duration:** 1 min 32 sec
- **Artifacts:** coverage-report (14.7 KB)

## Appendix C: How to Run

```bash
# Start Rocket.Chat
docker compose up -d

# Wait for ready
curl http://localhost:3000/api/info  # should return 200

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```
