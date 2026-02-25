# Changelog

All notable changes to **QA CI Pipelines** are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.0] — 2026-02-24 — Playwright Pipeline + Accuracy Sprint

### Added

- **`.github/workflows/demo-playwright-saucedemo.yml`** — Full Playwright demo pipeline
  - 5-layer architecture: setup → test (3 browsers matrix) → report → quality-gate → notify
  - Chromium, Firefox, WebKit run in parallel via `strategy.matrix`
  - Browser-specific JSON output via `PW_REPORT_FILE` env var (no file collisions)
  - Inline quality gate (95% pass rate, ≤ 5 flaky) — no external dependency
  - Optional Slack notification via `workflow_dispatch` input
  - Triggered on push to `demo/playwright/**`, schedule weekdays 07:30 UTC

- **`.github/workflows/ci-self-test.yml`** — Self-testing workflow for the quality-gate module
  - 4 fixture scenarios: 100% pass, 80% fail-rate, 10 flaky, malformed JSON
  - `verify-outcomes` job asserts expected vs actual results

- **`scripts/personalize.sh`** — One-command placeholder replacement
  - Replaces `your-org` → GitHub username, `qa-ci-pipelines` → repo name
  - Verifies no placeholders remain in critical files after replacement

### Changed

- **`demo/playwright.config.ts`** — JSON output path reads `process.env.PW_REPORT_FILE`
  - Each browser in the CI matrix now writes a distinct JSON artifact
  - Falls back to `playwright-report/results.json` for local runs
  - `baseURL` reads `process.env.BASE_URL`

- **`demo/README.md`** — Fully rewritten to match actual project state
  - Correct pipeline names: `demo-cypress-saucedemo.yml`, `demo-playwright-saucedemo.yml`
  - Correct test counts: Cypress 39, Playwright 21
  - File tree reflects files that exist

- **`README.md`** — Multiple corrections
  - Total test count: 60 (39 Cypress + 21 Playwright)
  - Badge label corrected to `Version: 3.0`
  - All workflow badge URLs corrected to real workflow file names
  - Changelog link updated to `v1 → v3.0`

- **`scripts/preflight-check.sh`** — Extended with Playwright pipeline checks
  - Verifies `demo-playwright-saucedemo.yml` presence and structure
  - Verifies `PW_REPORT_FILE` support in `playwright.config.ts`

- **`CHANGELOG.md`** — Historical entries corrected
  - `demo-cypress.yml` → `demo-cypress-saucedemo.yml`
  - `demo-playwright.yml` → `demo-playwright-saucedemo.yml`
  - Removed references to `demo-newman.yml` (never implemented)
  - Examples corrected to match `examples/` directory contents

- **`LICENSE`** — Copyright year: 2024 → 2025

- **`validate-templates.yml`** — Fixed invalid GHA expression `${{ #REQUIRED[@] }}`

- **`docs/usage.md`** — Examples table corrected to match real `examples/` directory

### Fixed

- Browser JSON collision: all 3 Playwright browsers overwrote the same `results.json`
- `PLAYWRIGHT_JSON_OUTPUT_NAME` env var was not read by `playwright.config.ts` (not a Playwright variable)
- LICENSE copyright year showing 2024

---

## [2.1.0] — 2025-11-15 — Live Demo

### Added
- **`demo/`** — Full E2E test suite against [saucedemo.com](https://www.saucedemo.com)
  - Cypress: 39 tests — auth (8), catalog (10), cart (9), checkout (12)
  - Playwright: 21 tests with Page Object Model (TypeScript) — auth (7), catalog (7), cart+checkout (7)
  - Pipelines: `demo-cypress-saucedemo.yml`, `demo-playwright-saucedemo.yml`
  - Custom Cypress commands: `cy.login()`, `cy.addToCart()`, `cy.checkout()`, `cy.cartCount()`
  - Playwright Page Objects: `LoginPage`, `InventoryPage`, `CartPage`, `CheckoutPage`
- **`CHANGELOG.md`** — This file
- **`DISTRIBUTION.md`** — Content strategy and post templates for community growth

---

## [2.0.0] — 2025-09-20 — Architecture v2: Quality + Observability

### Added — Shared Modules (4 new)

- **`templates/shared/allure-report.yml`** — Multi-tool Allure report with GitHub Pages
- **`templates/shared/quality-gate.yml`** — Configurable threshold enforcement (pass rate, p95, error rate, flaky)
- **`templates/shared/notify.yml`** — Slack Block Kit + Teams MessageCard notifications
- **`templates/shared/docker-runner.yml`** — Docker-isolated test execution

### Changed — Templates upgraded to 6-layer model

- `templates/ui-web/cypress.yml` — Added layers 4–6 (quality-gate, allure, notify)
- `templates/ui-web/playwright.yml` — Added layers 4–6
- `templates/api/postman-newman.yml` — Added layers 4–6, default gate: 100% pass rate
- `templates/performance/k6.yml` — Added performance-aware gate (p95, error rate)

### Architecture

Templates follow a **6-layer execution model**:
```
SETUP → TEST → REPORT → QUALITY GATE → ALLURE REPORT → NOTIFY
```

The `qa-metrics/metrics.json` contract decouples test execution from quality evaluation.

---

## [1.0.0] — 2025-06-01 — Initial Release

### Added — Templates (10)

- `templates/ui-web/cypress.yml` — Sharded Cypress with browser matrix
- `templates/ui-web/playwright.yml` — Sharded Playwright with shard merge
- `templates/ui-web/selenium-java.yml` — Selenium + TestNG + Maven
- `templates/ui-mobile/appium-android.yml` — Appium + Android emulator (KVM)
- `templates/ui-mobile/appium-ios.yml` — Appium + iOS simulator (macOS runner)
- `templates/api/postman-newman.yml` — Newman with htmlextra + JUnit reporters
- `templates/api/karate-maven.yml` — Karate DSL with environment targeting
- `templates/api/rest-assured.yml` — REST-Assured with TestNG groups
- `templates/performance/jmeter.yml` — JMeter with cached binary, error rate check
- `templates/performance/k6.yml` — k6 with 5 load scenarios

### Added — Shared Modules (5)

- `templates/shared/node-cache.yml`, `maven-cache.yml`, `python-cache.yml`
- `templates/shared/upload-artifacts.yml`, `parallel-matrix.yml`

### Added — Examples (2)

- `examples/node-example/` — Cypress in a Node.js project
- `examples/mono-repo-example/` — Multi-tool pipeline: API → UI → Performance

### Added — Repository tooling

- `.github/workflows/validate-templates.yml` — YAML lint + structure checks
- `scripts/validate-yaml.sh`, `generate-badge.sh`, `release.sh`
- `README.md`, `CONTRIBUTING.md`, `LICENSE` (MIT)
- `docs/architecture.md`, `docs/usage.md`, `docs/customization.md`

---

## Versioning Policy

| Version | Scope |
|---------|-------|
| `MAJOR` | Breaking change to template interface or shared module contract |
| `MINOR` | New template, new shared module, or new feature in existing template |
| `PATCH` | Bug fix, documentation update, or dependency version bump |
