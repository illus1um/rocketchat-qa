# Rocket.Chat QA Test Suite

Advanced QA — Assignment 1: Risk Assessment & QA Environment Setup

## System Under Test

[Rocket.Chat](https://rocket.chat) — Open-source communications platform (self-hosted via Docker).

## Quick Start

### 1. Start Rocket.Chat

```bash
docker compose up -d
```

Wait ~90-180 seconds for Rocket.Chat to fully boot, then access it at http://localhost:3000.

Health-check endpoint:

```bash
curl http://localhost:3000/api/info
```

If `localhost:3000` is not opening:

```bash
docker compose ps
docker compose logs --tail=200 rocketchat
```

### 2. Install Dependencies

```bash
npm install
npx playwright install --with-deps chromium firefox
```

### 3. Run Tests

```bash
# API tests
npm run test:api

# E2E tests
npm run test:e2e

# Postman collection
npm run test:postman
```

## Project Structure

```
├── docs/                        # Deliverable documents
│   ├── risk-assessment.md       # Risk assessment (Deliverable 1)
│   ├── test-strategy.md         # Test strategy (Deliverable 2)
│   ├── environment-setup-report.md  # Setup report (Deliverable 3)
│   └── baseline-metrics.md      # Baseline metrics (Deliverable 4)
├── tests/
│   ├── api/                     # Jest API tests
│   ├── e2e/                     # Playwright E2E tests
│   ├── performance/             # JMeter load tests
│   └── postman/                 # Postman collection
├── screenshots/                 # Evidence screenshots
├── docker-compose.yml           # Rocket.Chat + MongoDB
├── playwright.config.ts         # Playwright configuration
├── jest.config.js               # Jest configuration
└── .github/workflows/ci.yml    # CI/CD pipeline
```

## Tools

| Tool | Purpose |
|------|---------|
| Playwright | E2E browser testing |
| Jest + Axios | REST API testing |
| Postman / Newman | API collection testing |
| JMeter | Performance / load testing |
| Docker Compose | Test environment |
| GitHub Actions | CI/CD pipeline |
