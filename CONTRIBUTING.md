# Contributing to QA CI Pipelines

Thank you for contributing. This guide covers everything you need to add a new tool, fix a bug, or improve documentation.

---

## Table of Contents

- [How to add a new tool template](#how-to-add-a-new-tool-template)
- [The 6-layer architecture](#the-6-layer-architecture)
- [The metrics.json contract](#the-metricsjson-contract)
- [PR checklist](#pr-checklist)
- [Reporting issues](#reporting-issues)

---

## How to add a new tool template

This is the most common contribution. The goal is to integrate a new testing tool into the hub so it benefits from Quality Gates, Allure reporting, and Slack notifications automatically.

**Worked example: adding Robot Framework**

### Step 1 — Choose the domain and create the file

```
templates/
├── ui-web/          ← browser UI tests (Cypress, Playwright, Selenium)
├── ui-mobile/       ← mobile tests (Appium)
├── api/             ← API tests (Newman, Karate, REST-Assured)
├── performance/     ← load tests (k6, JMeter)
└── shared/          ← reusable modules (do not add tool templates here)
```

```bash
touch templates/api/robot-framework.yml
```

### Step 2 — Use `cypress.yml` as your base

```bash
cp templates/ui-web/cypress.yml templates/api/robot-framework.yml
```

Adapt the tool-specific layers (1, 2, 3). Keep layers 4, 5, 6 unchanged — they are tool-agnostic.

### Step 3 — Produce `qa-metrics/metrics.json` in Layer 3

This is the only coupling point between your tool and the shared modules.

```json
{
  "tool": "robot-framework",
  "total": 42,
  "passed": 40,
  "failed": 2,
  "skipped": 0,
  "flaky_count": 0,
  "pass_rate": 95.24
}
```

Robot Framework example — parse `output.xml`:

```yaml
- name: Parse Robot Framework results
  run: |
    python3 << 'PYEOF'
    import xml.etree.ElementTree as ET, json, os
    tree = ET.parse('output.xml')
    stats = tree.getroot().find('.//statistics/total/stat[@name="All Tests"]')
    passed = int(stats.get('pass', 0))
    failed = int(stats.get('fail', 0))
    total  = passed + failed
    rate   = round(passed / total * 100, 2) if total > 0 else 0.0
    os.makedirs('qa-metrics', exist_ok=True)
    json.dump({'tool':'robot-framework','total':total,'passed':passed,
               'failed':failed,'skipped':0,'flaky_count':0,'pass_rate':rate},
              open('qa-metrics/metrics.json','w'), indent=2)
    PYEOF
```

### Step 4 — Wire the shared modules (Layers 4, 5, 6)

```yaml
quality-gate:
  uses: ./.github/workflows/shared/quality-gate.yml
  with:
    min-pass-rate: "95"
    max-flaky-count: "5"
    block-on-failure: "true"
    metrics-artifact: "qa-metrics"

allure:
  uses: ./.github/workflows/shared/allure-report.yml
  with:
    artifact-pattern: "allure-results-robot-*"
    report-title: "Robot Framework — QA Report"
    publish-pages: "false"
  secrets:
    GH_PAGES_TOKEN: ${{ secrets.GH_PAGES_TOKEN }}

notify:
  uses: ./.github/workflows/shared/notify.yml
  with:
    status: ${{ needs.quality-gate.result }}
    tool: "Robot Framework"
    environment: ${{ inputs.environment || 'staging' }}
    pass-rate: ${{ needs.report.outputs.pass-rate }}
    test-total: ${{ needs.report.outputs.total }}
    test-failed: ${{ needs.report.outputs.failed }}
    notify-on: "always"
  secrets:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Step 5 — Update `README.md`

```markdown
| **API** | Robot Framework | `templates/api/robot-framework.yml` | v2 ✦ | Python 3.11 |
```

### Step 6 — Run preflight check and open PR

```bash
./scripts/preflight-check.sh   # must be 0 errors
```

**PR title format:** `feat(templates): add Robot Framework template`

---

## The 6-layer architecture

```
Layer 1 — SETUP        Checkout, runtime, cache
Layer 2 — TEST         Execute tests (native or Docker, matrix/shards)
Layer 3 — REPORT       Parse output → qa-metrics/metrics.json
Layer 4 — QUALITY GATE Enforce thresholds, block on violation
Layer 5 — ALLURE       Aggregate allure-results-* → unified HTML report
Layer 6 — NOTIFY       Send Slack/Teams with metrics payload
```

Layers 4, 5, 6 are identical across all tools. Only Layers 1, 2, 3 are tool-specific.

---

## The `metrics.json` contract

```json
{
  "tool":           "string  — tool name, lowercase hyphenated",
  "total":          "integer — total test count",
  "passed":         "integer — passed count",
  "failed":         "integer — failed + errored count",
  "skipped":        "integer — skipped/pending count",
  "flaky_count":    "integer — 0 if tool does not track flakiness",
  "pass_rate":      "float   — round(passed/total*100, 2)",
  "p95_ms":         "float   — OPTIONAL: p95 response time ms (performance only)",
  "error_rate_pct": "float   — OPTIONAL: HTTP error rate % (performance only)"
}
```

**Rules:**
- All fields except `p95_ms` and `error_rate_pct` are required
- `pass_rate` must be `round(passed/total*100, 2)` — never rounded to integer
- Artifact must be named exactly `qa-metrics`

---

## PR checklist

```
Template
  [ ] Correct domain folder
  [ ] 6-layer structure followed
  [ ] Layer 3 produces qa-metrics/metrics.json
  [ ] Layer 4 calls .github/workflows/shared/quality-gate.yml
  [ ] Layer 5 calls .github/workflows/shared/allure-report.yml
  [ ] Layer 6 calls .github/workflows/shared/notify.yml
  [ ] All workflow_dispatch inputs have defaults
  [ ] Secrets used for credentials (never hardcoded)
  [ ] Caching implemented
  [ ] Artifacts uploaded on failure
  [ ] GITHUB_STEP_SUMMARY populated in report job

Documentation
  [ ] README.md table updated
  [ ] CHANGELOG.md entry added under Unreleased

Validation
  [ ] ./scripts/preflight-check.sh → 0 errors
  [ ] PR title: feat(templates): add <Tool> template
```

---

## Reporting issues

Include in every issue report:
- Template name and version (v1/v2)
- Tool version (e.g. Cypress 13.6.0)
- Link to the failing Actions run
- Full error message (text, not screenshot)
- Contents of `qa-metrics/metrics.json` from artifacts (for Layer 4+ issues)

Issues without a run link will be closed after 7 days.
