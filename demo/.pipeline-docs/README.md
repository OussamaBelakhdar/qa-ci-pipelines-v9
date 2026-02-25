# .pipeline-docs — Reference Pipelines (Not Active)

> ⚠️ These files are **documentation only** — they are NOT executed by GitHub Actions.
>
> GitHub Actions only picks up workflows from the **root** `.github/workflows/` directory.
> The active demo pipeline is located at:
>
> → [`/.github/workflows/demo-cypress-saucedemo.yml`](https://github.com/your-org/qa-ci-pipelines/blob/main/.github/workflows/demo-cypress-saucedemo.yml)

---

## What's in here

| File | Purpose |
|------|---------|
| `demo-cypress.reference.yml` | Full Cypress pipeline example showing how to wire this demo project with all 6 layers using the shared modules from `templates/shared/`. Use this as a reference when integrating into your own repo. |
| `demo-playwright.reference.yml` | Same for Playwright. Shows multi-browser matrix, shard merge, and Allure integration. |

---

## How to use these as references

If you want to replicate this pipeline in your own repository:

1. Copy the shared modules to your repo's `.github/workflows/shared/`
2. Copy the reference pipeline to your `.github/workflows/`
3. Adjust `BASE_URL`, shard count, and quality gate thresholds
4. Add the required secrets (`SLACK_WEBHOOK_URL`, `GH_PAGES_TOKEN`)

See [`/docs/usage.md`](../../docs/usage.md) for a step-by-step guide.
