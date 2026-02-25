# Usage Guide

## Quick Integration

### Step 1 — Choose your template

| I need to test... | Template |
|-------------------|----------|
| Web UI with Cypress | `templates/ui-web/cypress.yml` |
| Web UI with Playwright | `templates/ui-web/playwright.yml` |
| Web UI with Selenium + Java | `templates/ui-web/selenium-java.yml` |
| Android app | `templates/ui-mobile/appium-android.yml` |
| iOS app | `templates/ui-mobile/appium-ios.yml` |
| REST API with Postman | `templates/api/postman-newman.yml` |
| REST API with Karate | `templates/api/karate-maven.yml` |
| REST API with REST-Assured | `templates/api/rest-assured.yml` |
| Load performance | `templates/performance/jmeter.yml` |
| Performance scripting | `templates/performance/k6.yml` |

---

### Step 2 — Copy the template

```bash
# Create the GitHub Actions folder in your project
mkdir -p .github/workflows

# Copy template (example with Cypress)
cp templates/ui-web/cypress.yml /your-project/.github/workflows/cypress.yml
```

Or directly with curl:
```bash
curl -L \
  https://raw.githubusercontent.com/your-org/qa-ci-pipelines/main/templates/ui-web/cypress.yml \
  -o .github/workflows/cypress.yml
```

---

### Step 3 — Configure secrets

In your GitHub repository settings → **Secrets and variables → Actions**, add:

```
BASE_URL         → https://your-app.com
API_KEY          → your-api-key
AUTH_TOKEN       → your-auth-token
```

---

### Step 4 — Customize inputs

Each template supports `workflow_dispatch` inputs. Example for Cypress:

```yaml
# Trigger manually with parameters
on:
  workflow_dispatch:
    inputs:
      browser: chrome        # or firefox, edge, electron
      node-version: '20'     # or '18'
      spec: cypress/e2e/**   # pattern for test files
```

---

## Using Shared Modules

### Node cache
```yaml
jobs:
  setup:
    uses: your-org/qa-ci-pipelines/.github/workflows/templates/shared/node-cache.yml@main
    with:
      node-version: '20'
```

### Maven cache
```yaml
jobs:
  setup:
    uses: your-org/qa-ci-pipelines/.github/workflows/templates/shared/maven-cache.yml@main
    with:
      java-version: '17'
```

### Upload artifacts
```yaml
jobs:
  report:
    uses: your-org/qa-ci-pipelines/.github/workflows/templates/shared/upload-artifacts.yml@main
    with:
      artifact-name: my-test-results
      artifact-path: test-results/
      retention-days: '14'
```

### Parallel matrix
```yaml
jobs:
  test:
    uses: your-org/qa-ci-pipelines/.github/workflows/templates/shared/parallel-matrix.yml@main
    with:
      browsers: '["chrome","firefox","webkit"]'
      node-versions: '["18","20"]'
      tool: playwright
```

---

## Environment Variables

All templates support these standard environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `BASE_URL` | Application URL | `http://localhost:3000` |
| `NODE_VERSION` | Node.js version | `20` |
| `JAVA_VERSION` | Java version | `17` |
| `ENVIRONMENT` | Target env | `staging` |
| `BROWSER` | Browser for UI tests | `chrome` |

---

## Examples

See the `examples/` folder:

| Example | What it shows |
|---------|---------------|
| `node-example/` | Cypress in a Node.js project with full 6-layer pipeline |
| `java-maven-example/` | Selenium + Karate in a Maven project (JUnit XML parsing) |
| `python-example/` | Robot Framework with `output.xml` → `metrics.json` parsing |
| `mono-repo-example/` | Multi-tool pipeline: API smoke → UI E2E → Performance |
