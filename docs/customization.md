# Customization Guide

## Override Default Inputs

All templates expose `workflow_dispatch` inputs for manual parameterization.

### Cypress
```yaml
inputs:
  node-version: '18' | '20'          # default: 20
  browser: 'chrome' | 'firefox' | 'edge' | 'electron'   # default: chrome
  spec: 'cypress/e2e/**/*.cy.js'    # default: all specs
```

### Playwright
```yaml
inputs:
  node-version: '18' | '20'          # default: 20
  browser: 'chromium' | 'firefox' | 'webkit' | 'all'   # default: chromium
  shard-total: '3'                   # default: 3
```

### JMeter
```yaml
inputs:
  test-plan: 'tests/load-test.jmx'  # default: tests/load-test.jmx
  threads: '100'                     # default: 50
  duration: '300'                    # default: 120s
  ramp-up: '60'                      # default: 30s
  environment: 'production'          # default: staging
```

### k6
```yaml
inputs:
  script: 'tests/load.js'
  vus: '100'
  duration: '5m'
  scenario: 'load' | 'stress' | 'spike' | 'soak' | 'smoke'
```

---

## Add Custom Environment Variables

In your copy of a template, add to the `env` block:

```yaml
env:
  # Existing
  NODE_VERSION: '20'
  ENVIRONMENT: staging
  
  # Your additions
  CUSTOM_FLAG: true
  TEST_DATA_PATH: ./fixtures/
  REPORT_DIR: ./reports/
```

---

## Customize Artifact Retention

Default retention is 7 days for test results, 14 days for reports, 30 days for performance.

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: my-results
    path: results/
    retention-days: 30   # ← change here
```

---

## Add Slack Notifications

Add this step at the end of any `report` job:

```yaml
- name: Notify Slack
  if: always()
  uses: slackapi/slack-github-action@v1.26.0
  with:
    payload: |
      {
        "text": "QA Pipeline: ${{ job.status }} — ${{ github.repository }}",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*QA Result:* ${{ job.status }}\n*Repo:* ${{ github.repository }}\n*Branch:* ${{ github.ref_name }}"
            }
          }
        ]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## Add Quality Gates (Fail on Threshold)

Example: fail pipeline if Playwright error rate > 0%

```yaml
- name: Quality gate check
  run: |
    FAILED=$(grep -c "failed" playwright-report/index.html 2>/dev/null || echo "0")
    if [ "$FAILED" -gt "0" ]; then
      echo "❌ Quality gate FAILED: $FAILED test(s) failed"
      exit 1
    fi
    echo "✅ Quality gate PASSED"
```

---

## Change Runner

Replace `ubuntu-latest` with any GitHub-hosted or self-hosted runner:

```yaml
# GitHub-hosted
runs-on: ubuntu-latest       # Linux (default)
runs-on: windows-latest      # Windows
runs-on: macos-latest        # macOS (required for iOS)

# Self-hosted
runs-on: [self-hosted, linux, x64]
runs-on: [self-hosted, linux, arm64]
```
