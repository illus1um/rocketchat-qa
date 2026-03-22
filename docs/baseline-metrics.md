# Baseline Metrics

## 1. High-Risk Module Count

| Priority | Count | Modules |
|----------|-------|---------|
| P0 (Critical) | 3 | Real-time Messaging, REST API, Authentication |
| P1 (High) | 3 | E2E Encryption, Database/Data Integrity, File Upload |
| P2 (Medium) | 2 | Omnichannel/Livechat, Administration Panel |
| P3 (Low) | 2 | Video/Audio Conferencing, Push Notifications |
| **Total** | **10** | |

### Risk Score Distribution

| Risk Level | Score Range | Module Count | Percentage |
|------------|-------------|-------------|------------|
| Critical | 20-25 | 1 | 10% |
| High | 12-19 | 5 | 50% |
| Medium | 6-11 | 2 | 20% |
| Low | 1-5 | 0 | 0% |
| Not assessed | — | 2 (P3) | 20% |

## 2. Initial Coverage Plan

### Test Cases by Module and Type

| Module | API Tests | E2E Tests | Perf Tests | Total | Status |
|--------|-----------|-----------|------------|-------|--------|
| Authentication | 5 | 3 | 1 | 9 | Implemented |
| Channels | 4 | 2 | 0 | 6 | Implemented |
| Messaging | 4 | 3 | 1 | 8 | Implemented |
| File Upload | 0 | 0 | 0 | 0 | Planned |
| E2E Encryption | 0 | 0 | 0 | 0 | Planned |
| Admin Panel | 0 | 0 | 0 | 0 | Planned |
| **Total** | **13** | **8** | **2** | **23** | |

### Test Cases by Priority

| Priority | Planned Tests | Implemented Tests | Coverage |
|----------|--------------|-------------------|----------|
| P0 (Critical) | 23 | 23 | 100% |
| P1 (High) | 10 | 0 | 0% |
| P2 (Medium) | 5 | 0 | 0% |
| P3 (Low) | 2 | 0 | 0% |
| **Total** | **40** | **23** | **57.5%** |

## 3. API Endpoint Coverage

### Rocket.Chat REST API Coverage

| Category | Total Endpoints (est.) | Tested | Coverage |
|----------|----------------------|--------|----------|
| Authentication | ~10 | 4 | 40% |
| Channels | ~25 | 4 | 16% |
| Chat/Messaging | ~15 | 4 | 27% |
| Users | ~20 | 1 | 5% |
| Groups | ~20 | 0 | 0% |
| Files | ~10 | 0 | 0% |
| Settings | ~15 | 0 | 0% |
| Other | ~235 | 0 | 0% |
| **Total** | **~350** | **13** | **~3.7%** |

### Postman Collection Coverage

| Folder | Requests | With Tests | Coverage |
|--------|----------|------------|----------|
| Authentication | 3 | 3 | 100% |
| Channels | 3 | 3 | 100% |
| Messaging | 2 | 2 | 100% |
| **Total** | **8** | **8** | **100%** |

## 4. E2E User Journey Coverage

| User Journey | Tests | Status |
|-------------|-------|--------|
| Login with valid credentials | 1 | Implemented |
| Login with invalid credentials | 1 | Implemented |
| Logout | 1 | Implemented |
| Send message in channel | 1 | Implemented |
| Verify message display | 1 | Implemented |
| Edit sent message | 1 | Implemented |
| Create new channel | 1 | Implemented |
| Search and join channel | 1 | Implemented |
| Upload file | 0 | Planned |
| Direct message | 0 | Planned |
| **Total** | **8/10** | **80% planned** |

## 5. Performance Test Baseline

### Planned Scenarios

| Scenario | Concurrent Users | Ramp-up | Duration | Target Metric |
|----------|-----------------|---------|----------|---------------|
| Login Load | 50 | 30s | 60s | Avg response < 2s |
| Messaging Load | 20 | 10s | 60s | Avg response < 1s |

### Metrics to Collect

| Metric | Target | Tool |
|--------|--------|------|
| Average Response Time | < 2s (login), < 1s (messaging) | JMeter |
| 95th Percentile (p95) | < 5s | JMeter |
| 99th Percentile (p99) | < 10s | JMeter |
| Throughput (req/sec) | > 10 req/s | JMeter |
| Error Rate | < 5% | JMeter |

*Note: Actual baseline values will be recorded after running performance tests against the Docker environment.*

## 6. Estimated Testing Effort

### By Activity

| Activity | Person-Hours | Week | Assignee |
|----------|-------------|------|----------|
| Environment setup (Docker, tools) | 6 | 1 | Person A |
| Risk assessment research & writing | 4 | 1 | Person B |
| Test strategy writing | 4 | 1 | Person C |
| Playwright E2E test development | 10 | 1-2 | Person A |
| API test development (Jest) | 8 | 1-2 | Person B |
| Postman collection creation | 4 | 1 | Person B |
| JMeter test plan creation | 4 | 1-2 | Person C |
| CI/CD pipeline setup | 4 | 1 | Person A |
| Metrics collection & screenshots | 3 | 2 | Person C |
| Documentation finalization | 5 | 2 | All |
| **Total** | **52 hrs** | | |
| **Per person (3-person team)** | **~17 hrs** | | |

### By Week

| Week | Focus | Effort |
|------|-------|--------|
| Week 1 | Setup, risk assessment, initial tests, CI/CD | ~30 hrs |
| Week 2 | Complete tests, performance, metrics, documentation | ~22 hrs |

## 7. Defect Baseline

| Metric | Value |
|--------|-------|
| Defects found during setup | 0 |
| Known RC issues (GitHub) | Refer to https://github.com/RocketChat/Rocket.Chat/issues |
| Starting defect count (from our testing) | 0 |
| Defect categories tracked | Critical, High, Medium, Low |

## 8. Tool Versions

| Tool | Version | Purpose |
|------|---------|---------|
| Rocket.Chat | latest (Docker) | System under test |
| MongoDB | 6.x | Database |
| Node.js | 20.x | Runtime |
| Playwright | ^1.42.0 | E2E testing |
| Jest | ^29.7.0 | API test runner |
| Axios | ^1.6.7 | HTTP client |
| Newman | ^6.1.0 | Postman CLI runner |
| JMeter | 5.6.3 | Performance testing |
| Docker Compose | 3.8 | Environment orchestration |

## 9. Screenshots Checklist

| Screenshot | Description | Status |
|-----------|-------------|--------|
| Docker containers running | `docker ps` output showing RC + MongoDB | Pending |
| Rocket.Chat login page | Browser screenshot of login screen | Pending |
| Rocket.Chat home screen | After successful login | Pending |
| Jest API test output | Terminal showing all 13 tests passing | Pending |
| Playwright test output | Terminal showing all 8 tests passing | Pending |
| Playwright HTML report | Browser screenshot of report | Pending |
| JMeter test plan | JMeter GUI showing test plan tree | Pending |
| Postman collection | Postman app showing request collection | Pending |
| GitHub Actions - pipeline | Successful CI run showing both jobs | Pending |
| GitHub Actions - artifacts | Uploaded test reports | Pending |

*Screenshots will be captured and saved to the `screenshots/` directory after running all tests against the live environment.*
