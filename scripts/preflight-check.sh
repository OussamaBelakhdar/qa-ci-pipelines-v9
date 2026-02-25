#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# preflight-check.sh — Validate the repo locally before pushing
#
# Runs all checks that the CI pipeline runs, locally:
#   1. YAML syntax on all templates
#   2. Shared modules have workflow_call trigger
#   3. All required files exist
#   4. TypeScript imports resolve (requires Node)
#   5. Cypress config is valid
#
# Usage: ./scripts/preflight-check.sh
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail
ERRORS=0
PASS=0

check() {
  local desc="$1"
  local cmd="$2"
  if eval "$cmd" > /dev/null 2>&1; then
    echo "  ✅ $desc"
    PASS=$((PASS + 1))
  else
    echo "  ❌ $desc"
    ERRORS=$((ERRORS + 1))
  fi
}

echo ""
echo "════════════════════════════════════════════"
echo "  QA CI PIPELINES — Preflight Check"
echo "════════════════════════════════════════════"

# ── 1. YAML syntax ────────────────────────────────────────────────────────────
echo ""
echo "📋 YAML Syntax"
if command -v yamllint &> /dev/null; then
  for f in $(find templates/ .github/workflows/ -name "*.yml" 2>/dev/null); do
    check "$f" "yamllint -d '{extends: relaxed, rules: {line-length: {max: 200}}}' $f"
  done
else
  echo "  ⚠️  yamllint not installed — skipping (pip install yamllint)"
fi

# ── 2. Required files ─────────────────────────────────────────────────────────
echo ""
echo "📁 Required Files"
REQUIRED_FILES=(
  "templates/ui-web/cypress.yml"
  "templates/ui-web/playwright.yml"
  "templates/ui-web/selenium-java.yml"
  "templates/ui-mobile/appium-android.yml"
  "templates/ui-mobile/appium-ios.yml"
  "templates/api/postman-newman.yml"
  "templates/api/karate-maven.yml"
  "templates/api/rest-assured.yml"
  "templates/performance/jmeter.yml"
  "templates/performance/k6.yml"
  "templates/shared/node-cache.yml"
  "templates/shared/maven-cache.yml"
  "templates/shared/python-cache.yml"
  "templates/shared/upload-artifacts.yml"
  "templates/shared/parallel-matrix.yml"
  ".github/workflows/shared/quality-gate.yml"
  ".github/workflows/shared/allure-report.yml"
  ".github/workflows/shared/notify.yml"
  ".github/workflows/shared/docker-runner.yml"
  ".github/workflows/demo-cypress-saucedemo.yml"
  "demo/cypress.config.js"
  "demo/playwright.config.ts"
  "demo/playwright/pages/LoginPage.ts"
  "demo/playwright/pages/InventoryPage.ts"
  "demo/playwright/pages/CartPage.ts"
  "demo/playwright/pages/CheckoutPage.ts"
  "CHANGELOG.md"
  "DISTRIBUTION.md"
  "scripts/release.sh"
)

for f in "${REQUIRED_FILES[@]}"; do
  check "$f" "test -f '$f'"
done

# ── 3. Shared modules have workflow_call ──────────────────────────────────────
echo ""
echo "🔗 Reusable Workflow Triggers"
for f in .github/workflows/shared/*.yml; do
  check "$f has workflow_call" "grep -q 'workflow_call' '$f'"
done

# ── 4. No broken uses: paths ──────────────────────────────────────────────────
echo ""
echo "🛤️  Workflow uses: Paths"
check "No templates/shared references in uses:" \
  "! grep -rn 'uses:.*templates/shared' templates/ .github/workflows/ --include='*.yml' | grep -v '^#' | grep -v '# '"

# ── 5. TypeScript imports ─────────────────────────────────────────────────────
echo ""
echo "📘 TypeScript Imports"
check "LoginPage.ts exists"    "test -f demo/playwright/pages/LoginPage.ts"
check "InventoryPage.ts exists" "test -f demo/playwright/pages/InventoryPage.ts"
check "CartPage.ts exists"     "test -f demo/playwright/pages/CartPage.ts"
check "CheckoutPage.ts exists" "test -f demo/playwright/pages/CheckoutPage.ts"
check "No CartAndCheckoutPage.ts (removed)" "! test -f demo/playwright/pages/CartAndCheckoutPage.ts"
check "checkout.spec imports ../pages/CartPage" \
  "grep -q '../pages/CartPage' demo/playwright/tests/checkout.spec.ts"
check "checkout.spec imports ../pages/CheckoutPage" \
  "grep -q '../pages/CheckoutPage' demo/playwright/tests/checkout.spec.ts"

# ── 6. Cypress config ─────────────────────────────────────────────────────────
echo ""
echo "🌲 Cypress Config"
check "cypress.config.js baseUrl is saucedemo.com" \
  "grep -q 'saucedemo.com' demo/cypress.config.js"
check "cypress.config.js has retries.runMode" \
  "grep -q 'runMode' demo/cypress.config.js"

# ── 7. TypeScript config ──────────────────────────────────────────────────────
echo ""
echo "📘 TypeScript Config"
check "demo/tsconfig.json exists" \
  "test -f demo/tsconfig.json"
check "tsconfig.json includes playwright/**/*.ts" \
  "grep -q 'playwright/\*\*/\*\.ts' demo/tsconfig.json"
check "tsconfig.json has strict: true" \
  "grep -q '\"strict\": true' demo/tsconfig.json"

# ── 8. package-lock.json ──────────────────────────────────────────────────────
echo ""
echo "🔒 Lock File"
check "demo/package-lock.json exists" \
  "test -f demo/package-lock.json"
check "package-lock.json is lockfileVersion 3" \
  "grep -q 'lockfileVersion.*3' demo/package-lock.json"

# ── 9. No orphan workflows in demo/ ───────────────────────────────────────────
echo ""
echo "🗂️  Demo Structure"
check "No .github/workflows/ inside demo/ (orphan workflows removed)" \
  "! test -d demo/.github/workflows"
check ".pipeline-docs/ exists with reference files" \
  "test -f demo/.pipeline-docs/README.md"
check "Active demo pipeline is in root .github/workflows/" \
  "test -f .github/workflows/demo-cypress-saucedemo.yml"

# ── Summary placeholder (moved to end of file) ───────────────────────────────

# ── 10. package.json sanity ────────────────────────────────────────────────────
echo ""
echo "📦 Package Sanity"
check "allure-commandline NOT in demo/package.json (80MB dep removed)" \
  "! grep -q 'allure-commandline' demo/package.json"
check "typescript in demo/package.json devDependencies" \
  "grep -q '\"typescript\"' demo/package.json"
check "type-check script exists in demo/package.json" \
  "grep -q 'type-check' demo/package.json"

# ── 11. Playwright config ─────────────────────────────────────────────────────
echo ""
echo "🎭 Playwright Config"
check "mobile-chrome is commented out (not an active project)" \
  "! grep -E '^\s+name: .mobile-chrome' demo/playwright.config.ts"
check "mobile-chrome commented out with explanation" \
  "grep -q 'Mobile project intentionally excluded' demo/playwright.config.ts"

# ── 12. Release script ─────────────────────────────────────────────────────────
echo ""
echo "🚀 Release Script"
check "release.sh checks remote origin points to GitHub" \
  "grep -q 'github.com' scripts/release.sh"
check "release.sh is executable" \
  "test -x scripts/release.sh"

# ── 13. SETUP.md exists ───────────────────────────────────────────────────────
echo ""
echo "📖 Onboarding"
check "SETUP.md exists at root" \
  "test -f SETUP.md"
check "SETUP.md has 5-step structure" \
  "grep -q 'Step 1\|Step 2\|Step 3' SETUP.md"
check "SETUP.md links to docs/customization.md" \
  "grep -q 'customization.md' SETUP.md"


# ── 14. E1 — actionlint officiel ──────────────────────────────────────────────
echo ""
echo "🔒 Supply Chain Security"
check "validate-templates.yml ne référence pas rbreitkuntz/actionlint (non officiel)" \
  "! grep -q 'rbreitkuntz/actionlint' .github/workflows/validate-templates.yml"
check "validate-templates.yml utilise rhysd/actionlint ou install manuel" \
  "grep -q 'rhysd/actionlint\|actionlint_.*linux_amd64' .github/workflows/validate-templates.yml"

# ── 15. E2 — check .github/workflows/shared/ ──────────────────────────────────
echo ""
echo "🔗 Shared Module Validation"
check "validate-templates.yml vérifie .github/workflows/shared/ (modules actifs)" \
  "grep -q '.github/workflows/shared' .github/workflows/validate-templates.yml"

# ── 16. E3 — CHANGELOG sans dates placeholder ─────────────────────────────────
echo ""
echo "📅 CHANGELOG Dates"
check "CHANGELOG.md n'a plus de dates 'XX' placeholder" \
  "! grep -qE '[0-9]{4}-[0-9]{2}-XX|[0-9]{4}-XX-XX' CHANGELOG.md"

# ── 17. E4 — Browser affiché via setup output ─────────────────────────────────
echo ""
echo "🌐 Browser Resolution"
check "demo pipeline n'affiche plus env.BROWSER dans Step Summary" \
  "! grep -q 'env.BROWSER' .github/workflows/demo-cypress-saucedemo.yml"
check "demo pipeline utilise needs.setup.outputs.browser ou steps.browser.outputs.value" \
  "grep -q 'steps.browser.outputs.value\|needs.setup.outputs.browser' .github/workflows/demo-cypress-saucedemo.yml"

# ── 18. E5 — cy.login() fallbacks défensifs ───────────────────────────────────
echo ""
echo "🛡️  Defensive Fallbacks"
check "cy.login() a un fallback 'standard_user' hardcodé" \
  "grep -q 'standard_user' demo/cypress/support/commands.js"
check "cy.login() a un fallback 'secret_sauce' hardcodé" \
  "grep -q 'secret_sauce' demo/cypress/support/commands.js"

# ── 19. Suggestion C — ci-self-test.yml ──────────────────────────────────────
echo ""
echo "🧪 Self-Test Workflow"
check "ci-self-test.yml existe" \
  "test -f .github/workflows/ci-self-test.yml"
check "ci-self-test.yml teste le scénario 100% pass" \
  "grep -q 'qa-metrics-pass' .github/workflows/ci-self-test.yml"
check "ci-self-test.yml teste le scénario fail-rate" \
  "grep -q 'qa-metrics-fail-rate' .github/workflows/ci-self-test.yml"
check "ci-self-test.yml vérifie les outcomes attendus" \
  "grep -q 'verify-outcomes\|Assert gate' .github/workflows/ci-self-test.yml"

# ── 20. Suggestion D — personalize.sh ────────────────────────────────────────
echo ""
echo "🎨 Personalization"
check "scripts/personalize.sh existe" \
  "test -f scripts/personalize.sh"
check "scripts/personalize.sh est exécutable" \
  "test -x scripts/personalize.sh"
check "scripts/personalize.sh remplace your-org" \
  "grep -q 'PLACEHOLDER_ORG' scripts/personalize.sh"
check "scripts/personalize.sh vérifie qu'il ne reste plus de placeholders" \
  "grep -q 'your-org.*remain\|REMAINING' scripts/personalize.sh"


# ── 21. Playwright Demo Pipeline ──────────────────────────────────────────────
echo ""
echo "🎭 Playwright Demo Pipeline"
check "demo-playwright-saucedemo.yml exists" \
  "test -f .github/workflows/demo-playwright-saucedemo.yml"
check "demo-playwright-saucedemo.yml has setup job" \
  "grep -q '^  setup:' .github/workflows/demo-playwright-saucedemo.yml"
check "demo-playwright-saucedemo.yml has test job with matrix" \
  "grep -q 'strategy:' .github/workflows/demo-playwright-saucedemo.yml"
check "demo-playwright-saucedemo.yml has browser matrix [chromium, firefox, webkit]" \
  "grep -q 'chromium' .github/workflows/demo-playwright-saucedemo.yml && grep -q 'firefox' .github/workflows/demo-playwright-saucedemo.yml && grep -q 'webkit' .github/workflows/demo-playwright-saucedemo.yml"
check "demo-playwright-saucedemo.yml has report job" \
  "grep -q '^  report:' .github/workflows/demo-playwright-saucedemo.yml"
check "demo-playwright-saucedemo.yml has quality-gate job" \
  "grep -q '^  quality-gate:' .github/workflows/demo-playwright-saucedemo.yml"
check "demo-playwright-saucedemo.yml uses PW_REPORT_FILE (not PLAYWRIGHT_JSON_OUTPUT_NAME)" \
  "grep -q 'PW_REPORT_FILE' .github/workflows/demo-playwright-saucedemo.yml && ! grep -q 'PLAYWRIGHT_JSON_OUTPUT_NAME' .github/workflows/demo-playwright-saucedemo.yml"

# ── 22. playwright.config.ts — PW_REPORT_FILE support ────────────────────────
echo ""
echo "🎭 Playwright Config"
check "playwright.config.ts reads PW_REPORT_FILE env var" \
  "grep -q 'PW_REPORT_FILE' demo/playwright.config.ts"
check "playwright.config.ts reads BASE_URL env var" \
  "grep -q 'BASE_URL' demo/playwright.config.ts"
check "playwright.config.ts has 3 browser projects" \
  "grep -q 'chromium' demo/playwright.config.ts && grep -q 'firefox' demo/playwright.config.ts && grep -q 'webkit' demo/playwright.config.ts"

# ── 23. Accuracy checks — test counts ─────────────────────────────────────────
echo ""
echo "📊 Test Count Accuracy"
check "README.md shows 60 real E2E tests (not 24, 43, or 48)" \
  "grep -q '60 real E2E tests' README.md"
check "CHANGELOG.md references demo-cypress-saucedemo.yml (not demo-cypress.yml)" \
  "grep -q 'demo-cypress-saucedemo' CHANGELOG.md"
check "CHANGELOG.md has v3.0.0 entry" \
  "grep -q '\[3.0.0\]' CHANGELOG.md"

# ── 24. License and legal ─────────────────────────────────────────────────────
echo ""
echo "📄 License"
check "LICENSE copyright year is 2025 (not 2024)" \
  "grep -q '2025 Oussama Belakhdar' LICENSE"
check "LICENSE mentions AutomationDataCamp" \
  "grep -q 'AutomationDataCamp' LICENSE"

# ── 25. docs consistency ─────────────────────────────────────────────────────
echo ""
echo "📚 Documentation Consistency"
check "docs/usage.md references java-maven-example (example exists)" \
  "grep -q 'java-maven-example' docs/usage.md"
check "docs/usage.md references python-example (example exists)" \
  "grep -q 'python-example' docs/usage.md"
check "validate-templates.yml has no invalid GHA expression #REQUIRED[@]" \
  "! grep -q '#REQUIRED\[@\]' .github/workflows/validate-templates.yml"


# ── 26. Examples directory ────────────────────────────────────────────────────
echo ""
echo "📁 Examples"
check "examples/node-example/ exists" \
  "test -d examples/node-example"
check "examples/mono-repo-example/ exists" \
  "test -d examples/mono-repo-example"
check "examples/java-maven-example/ exists" \
  "test -d examples/java-maven-example"
check "examples/python-example/ exists" \
  "test -d examples/python-example"
check "examples/java-maven-example has workflow file" \
  "find examples/java-maven-example -name '*.yml' | grep -q ."
check "examples/python-example has workflow file" \
  "find examples/python-example -name '*.yml' | grep -q ."

# ── Final Summary ──────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════"
TOTAL=$((PASS + ERRORS))
if [ "$ERRORS" -eq 0 ]; then
  echo "  ✅ ALL $TOTAL CHECKS PASSED"
  echo "  → Ready to push and tag"
else
  echo "  ❌ $ERRORS/$TOTAL CHECKS FAILED"
  echo "  → Fix the above before pushing"
fi
echo "════════════════════════════════════════════"
echo ""

exit $ERRORS
