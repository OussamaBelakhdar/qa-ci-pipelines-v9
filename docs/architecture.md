# Architecture Guide — v2

## Design Philosophy

This repository follows a **layered hub-and-spoke** model for CI templates.
Each template is self-contained but delegates cross-cutting concerns to shared modules.

```
                       QA CI PIPELINES HUB — v2
                                │
            ┌───────────────────┼──────────────────────┐
            │                  │                       │
         UI Web            API Testing            Performance
      (3 templates)       (3 templates)           (2 templates)
            │
         UI Mobile
      (2 templates)
            │
            └─────────────── SHARED MODULES (9 modules)
                                  │
                    ┌─────────────┼──────────────┐
                    │             │              │
              Infrastructure   Quality        Observability
              node-cache       quality-gate   allure-report
              maven-cache      notify         docker-runner
              python-cache
              upload-artifacts
              parallel-matrix
```

---

## Template Execution Model — v2 (6 Layers)

```
Layer 1 ─ SETUP
  └─ Checkout, runtime installation, dependency caching

Layer 2 ─ TEST
  └─ Execution (native or Docker, matrix/sharding)
  └─ Exports: allure-results artifacts + raw results

Layer 3 ─ REPORT
  └─ Merge shards/results → qa-metrics/metrics.json artifact
  └─ GitHub Step Summary with key numbers

Layer 4 ─ QUALITY GATE        ← NEW in v2
  └─ uses: shared/quality-gate.yml
  └─ Reads qa-metrics artifact, enforces thresholds
  └─ Blocks pipeline if thresholds exceeded

Layer 5 ─ ALLURE REPORT       ← NEW in v2
  └─ uses: shared/allure-report.yml
  └─ Downloads allure-results-* artifacts
  └─ Generates unified report, saves history for trends
  └─ Optional: publishes to GitHub Pages

Layer 6 ─ NOTIFICATION        ← NEW in v2
  └─ uses: shared/notify.yml
  └─ Sends Slack + Teams with metrics payload
  └─ Configurable: always | failure-only | success-only
```

---

## The qa-metrics Contract

All v2 templates produce a standardized `qa-metrics` artifact containing `metrics.json`:

```json
{
  "tool":          "cypress",
  "total":         120,
  "passed":        115,
  "failed":        5,
  "skipped":       0,
  "flaky_count":   2,
  "pass_rate":     95.83,
  "p95_ms":        1200,         ← performance tests only
  "error_rate_pct": 4.16         ← performance tests only
}
```

This contract enables the quality-gate module to work uniformly across all tools.

---

## Quality Gate Thresholds

| Template | min-pass-rate | max-error-rate | max-p95-ms | max-flaky |
|----------|:---:|:---:|:---:|:---:|
| Cypress | 95% | — | — | 5 |
| Playwright | 95% | — | — | 3 |
| Newman | 100% | — | — | 0 |
| Karate | 100% | — | — | 0 |
| JMeter | 95% | 5% | 2000ms | — |
| k6 | 95% | 5% | 2000ms | — |

All thresholds are **overridable per run** via `workflow_dispatch` inputs.

---

## Allure Multi-Tool Aggregation

The `allure-report.yml` module can aggregate results from all tools in a single report:

```yaml
# In a master pipeline:
jobs:
  allure-global:
    uses: ./.github/workflows/templates/shared/allure-report.yml
    with:
      artifact-pattern: "allure-results-*"   # matches ALL tools
      report-title: "Full QA Report"
      publish-pages: "true"
```

Each tool must upload its results as `allure-results-{tool}-*` artifacts.

---

## Docker Execution Mode

The `docker-runner.yml` module provides full environment isolation:

```
Host Runner (ubuntu-latest)
    └─ docker run --rm
           ├─ Mount: workspace → /app
           ├─ Mount: results → host ./docker-results
           └─ Run: test-command inside container
```

Supported registries: Docker Hub (default), GHCR, ECR, any private registry.

---

## Notification Payload Structure

### Slack
- Attachment with color coding (green/red/yellow)
- Header with emoji + tool name + status
- Fields: repo, branch, commit, environment, pass rate, total, failed
- Action buttons: View Run, Open Report

### Teams
- MessageCard format (legacy connector compatible)
- ThemeColor matching status
- Facts table (key-value rows)
- PotentialAction links

---

## Cache Strategy

### Node.js
```
key: node-{os}-node{version}-{hash(package-lock.json)}
```

### Maven
```
key: maven-{os}-java{version}-{hash(pom.xml)}
```

### Cypress binary
```
key: cypress-{os}-node{version}-{hash(package-lock.json)}
path: ~/.cache/Cypress
```

### Playwright browsers
```
key: playwright-{os}-{playwright-version}
path: ~/.cache/ms-playwright
```

### Allure CLI
```
key: allure-{version}-{os}
path: ~/.allure
```

---

## Secrets Reference

| Secret | Used by | Purpose |
|--------|---------|---------|
| `BASE_URL` | All UI/perf templates | Application URL |
| `CYPRESS_BASE_URL` | Cypress | Cypress-specific override |
| `API_BASE_URL` | Newman, Karate | API base endpoint |
| `API_KEY` | API templates | Auth key |
| `AUTH_TOKEN` | API templates | Bearer token |
| `SLACK_WEBHOOK_URL` | notify.yml | Slack incoming webhook |
| `TEAMS_WEBHOOK_URL` | notify.yml | Teams webhook |
| `GH_PAGES_TOKEN` | allure-report.yml | GitHub Pages deploy |
| `REGISTRY_USERNAME` | docker-runner.yml | Private registry auth |
| `REGISTRY_TOKEN` | docker-runner.yml | Private registry token |

---

## Future Architecture (Roadmap)

| Feature | Module | Status |
|---------|--------|--------|
| Allure reporting | `shared/allure-report.yml` | ✅ v2 |
| Quality Gates | `shared/quality-gate.yml` | ✅ v2 |
| Slack + Teams | `shared/notify.yml` | ✅ v2 |
| Docker execution | `shared/docker-runner.yml` | ✅ v2 |
| Security scanning (OWASP ZAP) | `shared/security-scan.yml` | 🔲 v3 |
| Accessibility testing (axe-core) | `shared/a11y.yml` | 🔲 v3 |
| Test intelligence (change-based) | `shared/smart-select.yml` | 🔲 v3 |
| Grafana/Datadog metrics push | `shared/metrics-push.yml` | 🔲 v3 |
