# 🧪 QA CI Pipelines — Central Hub

> **One repository. All major QA automation CI pipelines.**  
> Modular, standardized, production-ready GitHub Actions templates for QA teams.

![Validate Templates](https://github.com/OussamaBelakhdar/qa-ci-pipelines/actions/workflows/validate-templates.yml/badge.svg)
![Demo Cypress](https://github.com/OussamaBelakhdar/qa-ci-pipelines/actions/workflows/demo-cypress-saucedemo.yml/badge.svg)
![Demo Playwright](https://github.com/OussamaBelakhdar/qa-ci-pipelines/actions/workflows/demo-playwright-saucedemo.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Tools: 10+](https://img.shields.io/badge/Tools-10%2B-brightgreen)
![Shared Modules: 9](https://img.shields.io/badge/Shared%20Modules-9-orange)
![Version: 3.0](https://img.shields.io/badge/Version-3.0-purple)

---

## ✅ These pipelines run. Right now. Against a real app.

The `demo/` folder contains **60 real E2E tests** running against [saucedemo.com](https://www.saucedemo.com) — auth flows, product catalog, cart, and full checkout — using both Cypress and Playwright connected to the complete 6-layer CI architecture. Pipelines trigger on every push and on a daily schedule. The badges above are live.

**[→ See the demo project](demo/README.md)** · **[→ Setup in 5 minutes](SETUP.md)** · **[→ Changelog](CHANGELOG.md)**

---

## 🎯 What this is

This repository is **not a framework**. It is a **normalized CI infrastructure** for QA automation.

Every template follows the same 6-layer execution model connecting your tests to:

- 📊 **Allure reporting** — multi-tool, with trend history and GitHub Pages publishing
- 🚦 **Quality Gates** — configurable thresholds: pass rate, p95 latency, error rate, flaky count
- 📣 **Notifications** — Slack Block Kit + Microsoft Teams with rich metrics payload
- 🐳 **Docker execution** — total environment reproducibility, same image locally and in CI

---

## 🗂️ Supported Tools

| Domain | Tool | Template | Model | Runtime |
|--------|------|----------|-------|---------|
| **UI Web** | Cypress | `templates/ui-web/cypress.yml` | v2 ✦ | Node 18/20 |
| **UI Web** | Playwright | `templates/ui-web/playwright.yml` | v2 ✦ | Node 18/20 |
| **UI Web** | Selenium + Java | `templates/ui-web/selenium-java.yml` | v1 | Java 17 |
| **UI Mobile** | Appium + Android | `templates/ui-mobile/appium-android.yml` | v1 | Node + JDK |
| **UI Mobile** | Appium + iOS | `templates/ui-mobile/appium-ios.yml` | v1 | macOS |
| **API** | Postman / Newman | `templates/api/postman-newman.yml` | v2 ✦ | Node 18/20 |
| **API** | Karate + Maven | `templates/api/karate-maven.yml` | v1 | Java 17 |
| **API** | REST-Assured | `templates/api/rest-assured.yml` | v1 | Java 17 |
| **Performance** | JMeter | `templates/performance/jmeter.yml` | v1 | Java 17 |
| **Performance** | k6 | `templates/performance/k6.yml` | v2 ✦ | k6 binary |

✦ = upgraded to 6-layer model with Quality Gate + Allure + Notify

---

## 🏗️ 6-Layer Execution Model

Every v2 template follows the same pipeline structure:

```
SETUP → TEST → REPORT → QUALITY GATE → ALLURE REPORT → NOTIFY
  1       2      3            4               5            6
```

| Layer | Job | Purpose |
|-------|-----|---------|
| 1 | `setup` | Checkout, runtime installation, dependency caching |
| 2 | `test` | Execute tests (native or Docker, matrix/sharding) |
| 3 | `report` | Merge results → produce `qa-metrics/metrics.json` |
| 4 | `quality-gate` | Enforce pass rate / p95 / error rate thresholds |
| 5 | `allure` | Generate unified Allure report with trend history |
| 6 | `notify` | Send Slack/Teams with metrics + links |

---

## 📦 Shared Modules (9)

Located in `.github/workflows/shared/` — plug into any pipeline via `uses:`.

| Module | Purpose | Since |
|--------|---------|-------|
| `node-cache.yml` | npm/yarn dependency caching | v1 |
| `maven-cache.yml` | Maven `.m2` caching | v1 |
| `python-cache.yml` | pip caching | v1 |
| `upload-artifacts.yml` | Standardized artifact upload | v1 |
| `parallel-matrix.yml` | Multi-browser/version matrix | v1 |
| `allure-report.yml` | Multi-tool Allure report + GitHub Pages | v2 |
| `quality-gate.yml` | Configurable threshold enforcement | v2 |
| `notify.yml` | Slack + Teams rich notifications | v2 |
| `docker-runner.yml` | Docker-based test isolation | v2 |

---

## ⚡ Quick Start

### 1 — Copy a template

```bash
mkdir -p .github/workflows
curl -o .github/workflows/playwright.yml \
  https://raw.githubusercontent.com/OussamaBelakhdar/qa-ci-pipelines/main/templates/ui-web/playwright.yml
```

Also copy the shared modules your template depends on:

```bash
mkdir -p .github/workflows/shared
for module in quality-gate allure-report notify docker-runner; do
  curl -o .github/workflows/shared/${module}.yml \
    https://raw.githubusercontent.com/OussamaBelakhdar/qa-ci-pipelines/main/.github/workflows/shared/${module}.yml
done
```

### 2 — Add secrets

In your repo → **Settings → Secrets and variables → Actions**:

```
BASE_URL              → https://your-app.com
SLACK_WEBHOOK_URL     → https://hooks.slack.com/...     (optional)
GH_PAGES_TOKEN        → your-github-token               (optional, for Pages)
```

### 3 — Configure thresholds (optional)

```yaml
quality-gate:
  uses: ./.github/workflows/shared/quality-gate.yml
  with:
    min-pass-rate: "98"       # default: 95
    max-flaky-count: "2"      # default: 5
    max-p95-ms: "1500"        # performance tests only
    block-on-failure: "true"
```

### 4 — Push and watch

```bash
git add .github/
git commit -m "ci: add QA pipeline"
git push origin main
# → Go to Actions tab and watch the 6 layers run
```

---

## 🐳 Docker Execution

Run any tool in an isolated container — same image locally and in CI:

```yaml
test:
  uses: ./.github/workflows/shared/docker-runner.yml
  with:
    image: "cypress/included:13.6.0"
    test-command: "npx cypress run --browser chrome"
    tool: "cypress"
    environment: "staging"
  secrets:
    BASE_URL: ${{ secrets.BASE_URL }}
```

---

## 📣 Notifications

### Slack
```yaml
notify:
  uses: ./.github/workflows/shared/notify.yml
  with:
    status: ${{ needs.quality-gate.result }}
    tool: "Playwright"
    pass-rate: ${{ needs.report.outputs.pass-rate }}
    notify-slack: "true"
    notify-on: "failure-only"
    mention-on-failure: "@qa-team"
  secrets:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Teams
```yaml
  with:
    notify-teams: "true"
  secrets:
    TEAMS_WEBHOOK_URL: ${{ secrets.TEAMS_WEBHOOK_URL }}
```

---

## 📊 Quality Gate — Default Thresholds

| Template | Pass Rate | Error Rate | p95 | Flaky |
|----------|:---------:|:----------:|:---:|:-----:|
| Cypress | ≥ 95% | — | — | ≤ 5 |
| Playwright | ≥ 95% | — | — | ≤ 5 |
| Newman | ≥ 100% | — | — | 0 |
| k6 | ≥ 95% | ≤ 5% | ≤ 2000ms | — |
| JMeter | ≥ 95% | ≤ 5% | ≤ 2000ms | — |

All thresholds are overridable per run via `workflow_dispatch`.

---

## 🛒 Live Demo — Saucedemo

Real tests. Real pipelines. Real results.  
The `demo/` project runs **60 E2E tests** against [saucedemo.com](https://www.saucedemo.com) on every push.

| Suite | Tests | Execution | Pipeline |
|-------|-------|-----------|----------|
| Cypress | 39 tests | Chrome · 3 parallel shards | ![Demo Cypress](https://github.com/OussamaBelakhdar/qa-ci-pipelines/actions/workflows/demo-cypress-saucedemo.yml/badge.svg) |
| Playwright | 21 tests | Chromium · Firefox · WebKit | ![Demo Playwright](https://github.com/OussamaBelakhdar/qa-ci-pipelines/actions/workflows/demo-playwright-saucedemo.yml/badge.svg) |

Coverage: login flows, locked user, product sorting, cart add/remove/persist, checkout price validation, complete order.

### What a passing Cypress run looks like

```
⚙️  Setup           ✅  29s   Node 20 · Cypress 13.6 cached
🧪 Shard 1/3        ✅  41s   18/18 passed · auth + catalog  · chrome
🧪 Shard 2/3        ✅  44s   9/9 passed   · cart            · chrome
🧪 Shard 3/3        ✅  38s   12/12 passed · checkout        · chrome
📊 Report           ✅   8s   pass_rate=100% · failed=0 · total=39
🚦 Quality Gate     ✅   5s   ✅ pass_rate 100% ≥ 95%  ✅ flaky 0 ≤ 5
📣 Notify           ✅   3s   Slack · ✅ Cypress — Pipeline success
──────────────────────────────────────────────────────
   Total runtime: ~3m  ·  7 jobs green
```

> **After your first push:** run `./scripts/personalize.sh your-github-username` to replace all `OussamaBelakhdar` placeholders with your real username. The badges will show live status automatically.

**[→ View demo project](demo/README.md)** · **[→ See pipeline runs](https://github.com/OussamaBelakhdar/qa-ci-pipelines/actions)** · **[→ Setup in 5 min](SETUP.md)**

---

## 🗺️ Architecture

```
                    QA CI PIPELINES HUB — v3
                              │
         ┌────────────────────┼─────────────────────┐
         │                    │                     │
      UI Web              API Testing          Performance
   ┌──────────┐         ┌──────────┐          ┌──────────┐
   │ Cypress  │         │  Newman  │          │  JMeter  │
   │Playwright│         │  Karate  │          │    k6    │
   │Selenium  │         │REST-Assrd│          └──────────┘
   └──────────┘         └──────────┘
         │                UI Mobile
         │            ┌──────────────┐
         │            │Appium Android│
         │            │  Appium iOS  │
         │            └──────────────┘
         │
         └──────────────────────────────────────────────
                    SHARED MODULES (9)
         ┌──────────────────┬───────────────────────────┐
         │  Infrastructure  │   Quality & Observability  │
         │  node-cache      │   quality-gate             │
         │  maven-cache     │   allure-report            │
         │  python-cache    │   notify                   │
         │  upload-artifacts│   docker-runner            │
         │  parallel-matrix │                            │
         └──────────────────┴───────────────────────────┘
                              │
                    EXAMPLES (4)
           Node.js · Java/Maven · Python/RF · Mono-repo
```

---

## 🗂️ Repository Structure

```
qa-ci-pipelines/
│
├── .github/
│   └── workflows/
│       ├── shared/                        ← Active reusable modules
│       │   ├── quality-gate.yml           ← workflow_call: threshold enforcement
│       │   ├── allure-report.yml          ← workflow_call: Allure + GitHub Pages
│       │   ├── notify.yml                 ← workflow_call: Slack + Teams
│       │   └── docker-runner.yml          ← workflow_call: Docker isolation
│       ├── demo-cypress-saucedemo.yml     ← Live Cypress demo (39 tests, 3 shards)
│       ├── demo-playwright-saucedemo.yml  ← Live Playwright demo (21 tests, 3 browsers)
│       ├── validate-templates.yml         ← Internal: YAML lint + structure check
│       └── ci-self-test.yml               ← Internal: tests the quality-gate itself
│
├── templates/                             ← Copy these into your project
│   ├── ui-web/
│   │   ├── cypress.yml                    ← Sharded Cypress + 6-layer model
│   │   ├── playwright.yml                 ← Sharded Playwright + 6-layer model
│   │   └── selenium-java.yml             ← Selenium + TestNG + Maven
│   ├── ui-mobile/
│   │   ├── appium-android.yml            ← Android emulator (KVM)
│   │   └── appium-ios.yml               ← iOS simulator (macOS runner)
│   ├── api/
│   │   ├── postman-newman.yml            ← Newman + htmlextra + Allure
│   │   ├── karate-maven.yml              ← Karate DSL + Maven
│   │   └── rest-assured.yml             ← REST-Assured + TestNG
│   ├── performance/
│   │   ├── jmeter.yml                   ← JMeter + error rate gate
│   │   └── k6.yml                       ← k6 + p95 + error rate gate
│   └── shared/                          ← Documentation copies of active modules
│       ├── quality-gate.yml
│       ├── allure-report.yml
│       ├── notify.yml
│       ├── docker-runner.yml
│       ├── node-cache.yml
│       ├── maven-cache.yml
│       ├── python-cache.yml
│       ├── upload-artifacts.yml
│       └── parallel-matrix.yml
│
├── demo/                                  ← Live demo against saucedemo.com
│   ├── cypress/
│   │   ├── e2e/
│   │   │   ├── auth/login.cy.js           ← 8 tests
│   │   │   ├── catalog/products.cy.js     ← 10 tests
│   │   │   ├── cart/cart.cy.js            ← 9 tests
│   │   │   └── checkout/checkout.cy.js    ← 12 tests
│   │   ├── fixtures/users.json
│   │   └── support/
│   │       ├── commands.js                ← cy.login() cy.addToCart() cy.checkout()
│   │       └── e2e.js
│   ├── playwright/
│   │   ├── tests/
│   │   │   ├── auth.spec.ts               ← 7 tests
│   │   │   ├── catalog.spec.ts            ← 7 tests
│   │   │   └── checkout.spec.ts           ← 7 tests
│   │   └── pages/
│   │       ├── LoginPage.ts
│   │       ├── InventoryPage.ts
│   │       ├── CartPage.ts
│   │       └── CheckoutPage.ts
│   ├── cypress.config.js
│   ├── playwright.config.ts               ← PW_REPORT_FILE + BASE_URL support
│   ├── tsconfig.json
│   └── package.json
│
├── examples/
│   ├── node-example/                      ← Cypress in a Node.js project
│   ├── java-maven-example/                ← Selenium + Karate in Maven
│   ├── python-example/                    ← Robot Framework
│   └── mono-repo-example/                 ← Multi-tool: API → UI → Performance
│
├── docs/
│   ├── architecture.md                    ← 6-layer model, contracts, secrets
│   ├── usage.md                           ← Step-by-step integration guide
│   └── customization.md                   ← Override inputs and thresholds
│
├── scripts/
│   ├── preflight-check.sh                 ← 101-check local validation
│   ├── personalize.sh                     ← Replace OussamaBelakhdar placeholders
│   ├── release.sh                         ← Tag + GitHub Release
│   ├── generate-badge.sh                  ← Badge markdown generator
│   └── validate-yaml.sh                   ← Local YAML syntax check
│
├── CHANGELOG.md                           ← Full history v1 → v3.0
├── CONTRIBUTING.md                        ← How to add a new tool template
├── DISTRIBUTION.md                        ← Community growth strategy
├── SETUP.md                               ← 5-minute onboarding
└── LICENSE                                ← MIT
```

---

## 🚀 Roadmap

### v3.0 — Released ✅
- [x] Playwright demo pipeline (21 tests, Chromium + Firefox + WebKit)
- [x] `playwright.config.ts` — per-browser JSON output via `PW_REPORT_FILE`
- [x] `ci-self-test.yml` — the quality-gate tests itself
- [x] `personalize.sh` — one-command placeholder replacement
- [x] 4 examples: Node, Java/Maven, Python/Robot, Mono-repo
- [x] 101-check preflight validation script

### v4 — Planned 🔲
- [ ] Security scanning (OWASP ZAP) — `shared/security-scan.yml`
- [ ] Accessibility testing (axe-core) — `shared/a11y.yml`
- [ ] Test intelligence (change-based test selection) — `shared/smart-select.yml`
- [ ] Grafana / Datadog metrics push — `shared/metrics-push.yml`
- [ ] Self-hosted runner configuration guide

---

## 📚 Documentation

- [Architecture Guide](docs/architecture.md) — 6-layer model, `metrics.json` contract, secrets reference
- [Usage Guide](docs/usage.md) — Step-by-step integration for each tool
- [Customization Guide](docs/customization.md) — Override inputs and thresholds
- [Changelog](CHANGELOG.md) — Full version history v1 → v3.0
- [Contributing](CONTRIBUTING.md) — How to add a new tool template
- [Distribution](DISTRIBUTION.md) — Community posts and growth strategy

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines, including:
- How to add a new tool template (worked example: Robot Framework)
- The `metrics.json` contract every template must produce
- PR checklist

---

## 📄 License

MIT — Free to use, modify, and distribute.

---

> Built by [Oussama Belakhdar](https://automationdatacamp.com) · QA Orchestration Architect  
> Part of the **AutomationDataCamp** infrastructure.
