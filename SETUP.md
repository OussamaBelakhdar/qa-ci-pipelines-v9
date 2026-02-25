# ⚡ Setup Guide — 5 Minutes to Your First Green Pipeline

> You will have a working CI pipeline with Quality Gate, Allure report,
> and Slack notification running against a live app in 5 minutes.

---

## What you need

- A GitHub account
- A repository (new or existing)
- 5 minutes

No local installation required.

---

## Step 1 — Fork or copy this repository (30 seconds)

**Option A — Fork (recommended)**
Click **Fork** at the top of this page. GitHub creates a copy in your account with all workflows ready.

**Option B — Copy a single template**
```bash
# Copy only the template you need into your own repo
curl -o .github/workflows/cypress.yml \
  https://raw.githubusercontent.com/OussamaBelakhdar/qa-ci-pipelines/main/templates/ui-web/cypress.yml

# Copy the required shared modules
mkdir -p .github/workflows/shared
for module in quality-gate allure-report notify docker-runner; do
  curl -o .github/workflows/shared/${module}.yml \
    https://raw.githubusercontent.com/OussamaBelakhdar/qa-ci-pipelines/main/.github/workflows/shared/${module}.yml
done
```

---

## Step 2 — Add secrets (1 minute)

Go to your repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret | Required | Value |
|--------|----------|-------|
| `SLACK_WEBHOOK_URL` | Optional | Your Slack incoming webhook URL |
| `TEAMS_WEBHOOK_URL` | Optional | Your Teams webhook URL |
| `GH_PAGES_TOKEN` | Optional | GitHub PAT with `pages:write` scope (for Allure publish) |

> **To get a Slack webhook:** Slack App → Incoming Webhooks → Add New Webhook

If you skip the secrets, the pipeline still runs — notifications are simply skipped.

---

## Step 3 — Configure your app URL (1 minute)

**If you forked:** The demo pipeline already targets `https://www.saucedemo.com`. Push anything to `main` and watch it run.

**If you copied a template:** Open the workflow file and set `BASE_URL`:

```yaml
# In your workflow file
env:
  BASE_URL: "https://your-app.com"   # ← change this
```

Or add it as a repository secret `BASE_URL` for sensitive environments.

---

## Step 4 — Push and watch (2 minutes)

```bash
git add .github/
git commit -m "ci: add QA pipeline"
git push origin main
```

Then go to **Actions** tab in your repository. You should see:

```
⚙️  Setup          ✅  ~30s   Node 20 cached, Cypress verified
🧪 Tests Shard 1   ✅  ~45s   8/8 tests passed
🧪 Tests Shard 2   ✅  ~45s   8/8 tests passed
🧪 Tests Shard 3   ✅  ~45s   8/8 tests passed
📊 Report          ✅  ~10s   pass_rate=100%, failed=0
🚦 Quality Gate    ✅  ~5s    All thresholds met
📣 Notify          ✅  ~3s    Slack notified
```

**Total runtime: ~3 minutes.**

---

## Step 5 — Add the badge to your README (30 seconds)

```markdown
![QA Pipeline](https://github.com/YOUR_ORG/YOUR_REPO/actions/workflows/cypress.yml/badge.svg)
```

Replace `YOUR_ORG` and `YOUR_REPO` with your values.

---

## What to configure next

| Goal | Where |
|------|-------|
| Change pass rate threshold | `quality-gate` job — `min-pass-rate` input |
| Add Allure report to GitHub Pages | `allure` job — set `publish-pages: 'true'` |
| Run on schedule (nightly) | Add `schedule: cron: '0 2 * * *'` to `on:` |
| Add a Playwright pipeline | Copy `templates/ui-web/playwright.yml` |
| Run in Docker | Set `use-docker: 'true'` in `workflow_dispatch` inputs |

Full reference: [docs/customization.md](docs/customization.md)

---

## Troubleshooting

**`npm ci` fails with "missing package-lock.json"**
Run `npm install` in your project directory first to generate the lockfile.

**Quality Gate fails immediately**
Check `qa-metrics/metrics.json` in the artifacts — if it shows `total: 0`, the test job produced no output. Verify your `spec` path matches your test file locations.

**Slack notification not sent**
Verify `SLACK_WEBHOOK_URL` is set in repository secrets and the webhook is still active in your Slack workspace.

**Allure report is empty**
The Allure module looks for artifacts matching `allure-results-*`. Make sure your test job uploads results with a name starting with `allure-results-`.

---

## Need help?

Open an issue on this repository — include the failing workflow run URL and the contents of `qa-metrics/metrics.json` from the artifacts.
