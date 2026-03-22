# QA Environment Setup Report (Updated)

**Project:** Rocket.Chat QA
**Date:** 2026-03-22
**Status:** Updated to actual project state

## 1. Environment Architecture

- **App:** `registry.rocket.chat/rocketchat/rocket.chat:latest`
- **DB:** `mongo:8` (replica set `rs0`)
- **Orchestration:** Docker Compose
- **Base URL:** `http://localhost:3000`
- **Health check:** `http://localhost:3000/api/info`

## 2. Docker Setup

`docker-compose.yml` currently uses:

- `rocketchat` service on port `3000`
- `mongodb` service on `mongo:8`
- `mongo-init-replica` one-shot service

Run:

```bash
docker compose up -d
curl http://localhost:3000/api/info
docker compose ps
```

Stop:

```bash
docker compose down
```

Clean reset:

```bash
docker compose down -v
```

## 3. Initial Setup

Rocket.Chat requires first-time setup wizard.

- Create admin user in UI (password must satisfy Rocket.Chat policy, not `admin123`)
- Use credentials in test runs via env vars:

```powershell
$env:RC_ADMIN_USER="<admin_username>"
$env:RC_ADMIN_PASS="<admin_password>"
```

## 4. Installed QA Tooling

- Playwright (E2E smoke)
- Jest + Axios (API tests)
- Newman (Postman collection)
- JMeter (performance, planned)
- GitHub Actions (CI)

## 5. CI/CD Status

Workflow file: `.github/workflows/ci.yml`

Current important settings:

- Mongo service image: `mongo:8`
- Rocket.Chat readiness check: `curl -sf http://localhost:3000/api/info`
- Jobs:
  - `api-tests`: Jest + Newman
  - `e2e-tests`: Playwright

## 6. Test Execution Snapshot (Local)

Executed on 2026-03-22:

- `npx jest tests/api --runInBand` -> **13/13 passed**
- `npx playwright test` -> **10/10 passed** (smoke, chromium + firefox)
- `npx newman run ...` -> **14 assertions, 0 failed**

## 7. Known Constraints

- Rocket.Chat UI changed significantly in v8 (selectors and navigation behavior changed).
- For deadline stability, E2E coverage is intentionally reduced to smoke scenarios.
- Full JMeter baseline values are still pending (test plan exists in `tests/performance/load-test.jmx`).
- JMeter CLI is not installed on this machine (`jmeter` command unavailable).

## 8. Evidence Folder

Evidence should be saved under `screenshots/`.

Captured evidence files:

1. `docker-compose-ps.txt` and `docker-compose-ps.png`
2. `login-page.png`
3. `home-page.png`
4. `api-tests.log` and `api-tests.png`
5. `e2e-tests.log` and `e2e-tests.png`
6. `newman.log` and `newman.png`
7. `playwright-report.png`
