# 🛒 Demo Project — Saucedemo QA Suite

> **Live demo of the QA CI Pipelines hub** — real E2E tests running against
> [saucedemo.com](https://www.saucedemo.com), the official Sauce Labs test application.

[![Cypress](https://github.com/your-org/qa-ci-pipelines/actions/workflows/demo-cypress-saucedemo.yml/badge.svg)](https://github.com/your-org/qa-ci-pipelines/actions/workflows/demo-cypress-saucedemo.yml)
[![Playwright](https://github.com/your-org/qa-ci-pipelines/actions/workflows/demo-playwright-saucedemo.yml/badge.svg)](https://github.com/your-org/qa-ci-pipelines/actions/workflows/demo-playwright-saucedemo.yml)

---

## 🎯 Purpose

This demo proves the CI templates work against a real application.

Coverage:
- **Login flows** — valid user, locked user, wrong password, empty fields, error dismiss
- **Product catalog** — 6 products, 4 sort modes (A-Z, Z-A, price asc/desc), product detail
- **Shopping cart** — add, remove, badge count, persistence across navigation
- **Checkout flow** — form validation, price math (subtotal + tax = total), order completion

---

## 🧪 Test Matrix

| Suite | Tool | Tests | Browsers/Shards | Pipeline |
|-------|------|-------|-----------------|----------|
| E2E | Cypress | 39 tests | Chrome · 3 shards | [![Cypress](https://github.com/your-org/qa-ci-pipelines/actions/workflows/demo-cypress-saucedemo.yml/badge.svg)](https://github.com/your-org/qa-ci-pipelines/actions/workflows/demo-cypress-saucedemo.yml) |
| E2E | Playwright | 21 tests | Chromium · Firefox · WebKit | [![Playwright](https://github.com/your-org/qa-ci-pipelines/actions/workflows/demo-playwright-saucedemo.yml/badge.svg)](https://github.com/your-org/qa-ci-pipelines/actions/workflows/demo-playwright-saucedemo.yml) |

> Cypress runs as 3 parallel shards. Playwright runs 3 browsers in parallel.

---

## 🚀 Run Locally

### Prerequisites

```bash
node -v   # >= 18 required
npm -v    # >= 9 required
```

### Install

```bash
cd demo/
npm install
```

### Cypress

```bash
# Interactive mode
npx cypress open

# Headless (all specs)
npx cypress run --browser chrome

# Single shard (same split as CI)
npx cypress run --spec "cypress/e2e/auth/**/*.cy.js"
npx cypress run --spec "cypress/e2e/catalog/**/*.cy.js" --spec "cypress/e2e/cart/**/*.cy.js"
npx cypress run --spec "cypress/e2e/checkout/**/*.cy.js"
```

### Playwright

```bash
# Install browsers (first time only)
npx playwright install

# All browsers
npx playwright test

# Single browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# UI mode (debug)
npx playwright test --ui

# View HTML report
npx playwright show-report
```

---

## 📁 Project Structure

```
demo/
├── cypress/
│   ├── e2e/
│   │   ├── auth/
│   │   │   └── login.cy.js          ← Login happy/sad paths (8 tests)
│   │   ├── catalog/
│   │   │   └── products.cy.js       ← Sort, listing, product detail (8 tests)
│   │   ├── cart/
│   │   │   └── cart.cy.js           ← Add/remove/badge (7 tests)
│   │   └── checkout/
│   │       └── checkout.cy.js       ← Full checkout + price validation (10 tests)  ← shard 3
│   ├── fixtures/
│   │   └── users.json               ← Test user credentials
│   └── support/
│       ├── commands.js              ← cy.login() cy.addToCart() cy.checkout() cy.cartCount()
│       └── e2e.js                   ← Global error suppression
│
├── playwright/
│   ├── tests/
│   │   ├── auth.spec.ts             ← Login tests (7 tests)
│   │   ├── catalog.spec.ts          ← Catalog + sort (7 tests)
│   │   └── checkout.spec.ts         ← Cart + full checkout (7 tests)
│   └── pages/
│       ├── LoginPage.ts             ← Page Object — login form
│       ├── InventoryPage.ts         ← Page Object — product catalog
│       ├── CartPage.ts              ← Page Object — cart
│       └── CheckoutPage.ts          ← Page Object — checkout flow
│
├── cypress.config.js                ← baseUrl, retries, reporters
├── playwright.config.ts             ← browsers, reporters, PW_REPORT_FILE support
├── tsconfig.json                    ← strict TypeScript config
└── package.json                     ← Cypress 13 + Playwright + Allure + Mochawesome
```

---

## 🔑 Test Credentials

Saucedemo ships with built-in test users — no account creation needed:

| User | Password | Behavior |
|------|----------|----------|
| `standard_user` | `secret_sauce` | Normal user ✅ |
| `locked_out_user` | `secret_sauce` | Account locked ❌ |
| `problem_user` | `secret_sauce` | Intentional UI bugs 🐛 |
| `performance_glitch_user` | `secret_sauce` | Slow page loads ⏳ |
| `error_user` | `secret_sauce` | Random runtime errors 💥 |
| `visual_user` | `secret_sauce` | Visual display defects 👁️ |

All suites use `standard_user` except the "locked user" test cases.

---

## 📊 What a passing run looks like

### Cypress (3 shards)

```
⚙️  Setup         ✅  ~29s   Node 20 · Cypress 13.6 cached
🧪 Shard 1/3      ✅  ~41s   8+10/18 tests · auth+catalog   · chrome
🧪 Shard 2/3      ✅  ~47s   9/9 tests · cart               · chrome
🧪 Shard 3/3      ✅  ~44s   12/12 tests · checkout         · chrome
📊 Report         ✅  ~8s    pass_rate=100% · failed=0 · total=39
🚦 Quality Gate   ✅  ~5s    ✅ pass_rate 100% ≥ 95%
📣 Notify         ✅  ~3s    Slack · ✅ Cypress — Pipeline success
─────────────────────────────────────────────────
   Total: 2m 48s  ·  7 jobs green
```

### Playwright (3 browsers)

```
⚙️  Setup         ✅  ~35s   Node 20 · Playwright browsers cached
🧪 chromium       ✅  ~52s   21/21 tests  · Desktop Chrome
🧪 firefox        ✅  ~58s   21/21 tests  · Desktop Firefox
🧪 webkit         ✅  ~63s   21/21 tests  · Desktop Safari
📊 Report         ✅  ~8s    pass_rate=100% · failed=0 · total=63
🚦 Quality Gate   ✅  ~5s    ✅ pass_rate 100% ≥ 95%
───────────────────────────────────────────────────
   Total: 3m 01s  ·  6 jobs green
```

---

## 🔗 Related

- [Pipeline — Cypress](.github/workflows/demo-cypress-saucedemo.yml) — Sharded Cypress with Quality Gate
- [Pipeline — Playwright](.github/workflows/demo-playwright-saucedemo.yml) — Multi-browser Playwright
- [CI Hub architecture](../docs/architecture.md) — 6-layer execution model
- [Template: Cypress](../templates/ui-web/cypress.yml) — Production template
- [Template: Playwright](../templates/ui-web/playwright.yml) — Production template
