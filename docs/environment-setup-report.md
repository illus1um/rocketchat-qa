# QA Environment Setup Report

## 1. Test Environment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Developer Machine                      │
│                                                          │
│  ┌──────────────┐    ┌──────────────────────────────┐   │
│  │  Test Runner  │    │     Docker Compose            │   │
│  │              │    │                                │   │
│  │  • Playwright │───▶│  ┌────────────┐  ┌────────┐  │   │
│  │  • Jest       │    │  │ Rocket.Chat│  │MongoDB │  │   │
│  │  • Newman     │    │  │ :3000      │──│:27017  │  │   │
│  │  • JMeter     │    │  └────────────┘  └────────┘  │   │
│  └──────────────┘    └──────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              GitHub Actions CI/CD                  │   │
│  │  • api-tests job  → Jest + Newman                 │   │
│  │  • e2e-tests job  → Playwright (Chromium)         │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 2. Docker Compose Setup

### Configuration

The test environment uses Docker Compose to run Rocket.Chat with MongoDB:

- **Rocket.Chat**: `registry.rocket.chat/rocketchat/rocket.chat:latest`
- **MongoDB**: `mongo:6` with replica set (`rs0`) — required for Rocket.Chat's oplog tailing
- **Mongo Init**: One-shot container that initializes the MongoDB replica set

### Key Environment Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `MONGO_URL` | `mongodb://mongodb:27017/rocketchat?replicaSet=rs0` | Main database connection |
| `MONGO_OPLOG_URL` | `mongodb://mongodb:27017/local?replicaSet=rs0` | Oplog for real-time updates |
| `ROOT_URL` | `http://localhost:3000` | Application base URL |
| `PORT` | `3000` | HTTP port |

### How to Start

```bash
# Start all services
docker-compose up -d

# Wait for Rocket.Chat to be ready (~60-90 seconds)
# Check readiness:
curl http://localhost:3000/api/v1/info

# Stop all services
docker-compose down

# Stop and remove volumes (clean start)
docker-compose down -v
```

### First-Time Setup

On first boot, Rocket.Chat requires completing a setup wizard:
1. Navigate to `http://localhost:3000`
2. Create admin user (username: `admin`, password: `admin123`)
3. Configure organization info
4. Register or skip cloud registration

Alternatively, use the REST API to automate admin setup:
```bash
curl -X POST http://localhost:3000/api/v1/setup.admin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@test.com","pass":"admin123","name":"Admin"}'
```

## 3. Testing Tools Installed

### 3.1 Playwright (E2E Testing)

- **Version**: ^1.42.0
- **Configuration file**: `playwright.config.ts`
- **Browsers**: Chromium, Firefox
- **Base URL**: `http://localhost:3000`
- **Features**: Auto-wait, HTML reporter, screenshot on failure, trace on retry

**Installation:**
```bash
npm install
npx playwright install --with-deps chromium firefox
```

**Configuration highlights:**
- `fullyParallel: false` — tests run sequentially to avoid state conflicts
- `workers: 1` — single worker for predictable execution
- `retries: 2` in CI — handles flaky network conditions
- `trace: 'on-first-retry'` — captures detailed trace for debugging failures

### 3.2 Jest + Axios (API Testing)

- **Jest version**: ^29.7.0
- **Axios version**: ^1.6.7
- **Configuration file**: `jest.config.js`
- **Test timeout**: 30 seconds (accounts for Rocket.Chat response time)

**Configuration highlights:**
- Test match pattern: `**/tests/api/**/*.test.js`
- Verbose output enabled for detailed test results

### 3.3 Postman / Newman (API Collection Testing)

- **Newman version**: ^6.1.0
- **Collection file**: `tests/postman/rocketchat-collection.json`
- **Variables**: `base_url`, `auth_token`, `user_id`, `channel_id`, `message_id`

**Features:**
- Collection-level variables for authentication token reuse
- Test scripts for response validation
- Exportable for team sharing via Postman app

**Run via CLI:**
```bash
npx newman run tests/postman/rocketchat-collection.json
```

### 3.4 JMeter (Performance Testing)

- **Version**: 5.6.3 (recommended)
- **Test plan**: `tests/performance/load-test.jmx`
- **Scenarios**:
  1. Login Load Test: 50 threads, 30s ramp-up, 60s duration
  2. Messaging Load Test: 20 threads, 10s ramp-up, 60s duration

**Installation:**
1. Download from https://jmeter.apache.org/download_jmeter.cgi
2. Extract and add `bin/` to PATH
3. Open test plan: `jmeter -t tests/performance/load-test.jmx`

**Run headless:**
```bash
jmeter -n -t tests/performance/load-test.jmx -l results.jtl -e -o report/
```

## 4. Repository Structure

```
rocketchat-qa/
├── .github/
│   └── workflows/
│       └── ci.yml                        # GitHub Actions CI/CD pipeline
├── docs/
│   ├── risk-assessment.md                # Deliverable 1: Risk Assessment
│   ├── test-strategy.md                  # Deliverable 2: Test Strategy
│   ├── environment-setup-report.md       # Deliverable 3: This document
│   └── baseline-metrics.md               # Deliverable 4: Baseline Metrics
├── tests/
│   ├── api/
│   │   ├── auth.test.js                  # Authentication API tests (5 tests)
│   │   ├── channels.test.js              # Channel CRUD API tests (4 tests)
│   │   └── messaging.test.js             # Messaging API tests (4 tests)
│   ├── e2e/
│   │   ├── login.spec.ts                 # Login E2E tests (3 tests)
│   │   ├── messaging.spec.ts             # Messaging E2E tests (3 tests)
│   │   └── channel.spec.ts               # Channel E2E tests (2 tests)
│   ├── performance/
│   │   └── load-test.jmx                 # JMeter load test plan (2 scenarios)
│   └── postman/
│       └── rocketchat-collection.json    # Postman API collection
├── screenshots/                           # Evidence screenshots
├── docker-compose.yml                     # Test environment configuration
├── playwright.config.ts                   # Playwright E2E configuration
├── jest.config.js                         # Jest API test configuration
├── package.json                           # Node.js dependencies
├── .gitignore                             # Git ignore rules
└── README.md                              # Project documentation
```

## 5. CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline (`.github/workflows/ci.yml`) triggers on:
- Push to `main` branch
- Pull requests to `main` branch

### Pipeline Jobs

| Job | Runner | Purpose | Duration (est.) |
|-----|--------|---------|-----------------|
| `api-tests` | ubuntu-latest | Jest API tests + Newman collection | ~4-5 min |
| `e2e-tests` | ubuntu-latest | Playwright browser tests | ~5-7 min |

### Job Details

**Both jobs share these steps:**
1. Checkout code
2. Setup Node.js 20 with npm caching
3. Start MongoDB service (via GitHub Actions `services`)
4. Initialize MongoDB replica set
5. Start Rocket.Chat in Docker (host networking)
6. Health-check wait loop (up to 180s timeout)
7. Install npm dependencies

**api-tests additionally:**
- Runs `npx jest tests/api/ --verbose`
- Runs `npx newman run tests/postman/rocketchat-collection.json`
- Uploads Newman results as artifact

**e2e-tests additionally:**
- Installs Playwright Chromium browser
- Runs `npx playwright test`
- Uploads Playwright HTML report as artifact (30-day retention)

## 6. Test Data Seeding

### Initial Setup
- **Admin user**: Created during first-time setup wizard (or via API)
  - Username: `admin`
  - Password: `admin123`
  - Email: `admin@test.com`

### Per-Test Data
- API tests create their own test data (channels, messages) in `beforeAll` hooks
- Test data is cleaned up in `afterAll` hooks
- Channel names include timestamps to avoid conflicts: `test-channel-${Date.now()}`

### Data Management Strategy
- Each test suite is self-contained (creates and cleans up its own data)
- No shared state between test files
- Tests are ordered within files but independent across files

## 7. Known Issues and Workarounds

| Issue | Workaround |
|-------|------------|
| Rocket.Chat takes 60-90s to boot | Health-check wait loop with `curl` polling |
| MongoDB requires replica set for RC | `mongo-init-replica` container in docker-compose |
| First boot requires setup wizard | Automate via `POST /api/v1/setup.admin` |
| E2E selectors may change between RC versions | Pin RC version in docker-compose for stability |
| Newman cannot chain auth across folders automatically | Collection-level variables set in login test script |
| JMeter needs Java runtime | Ensure JDK 8+ is installed before running JMeter |
