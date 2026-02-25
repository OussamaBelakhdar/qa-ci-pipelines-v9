#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# personalize.sh — Replace all your-org/qa-ci-pipelines placeholders
#
# Run ONCE after cloning or forking, before your first push.
#
# Usage:
#   ./scripts/personalize.sh <github-username> [repo-name]
#
# Examples:
#   ./scripts/personalize.sh oussama-belakhdar
#   ./scripts/personalize.sh oussama-belakhdar my-qa-hub
#
# What it replaces:
#   your-org          → your GitHub username or org
#   qa-ci-pipelines   → your repo name (default: qa-ci-pipelines)
#
# Files modified:
#   README.md, SETUP.md, DISTRIBUTION.md, CONTRIBUTING.md,
#   CHANGELOG.md, all .github/workflows/*.yml,
#   demo/.pipeline-docs/README.md
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

ORG="${1:-}"
REPO="${2:-qa-ci-pipelines}"

if [ -z "$ORG" ]; then
  echo "❌ Usage: ./scripts/personalize.sh <github-username-or-org> [repo-name]"
  echo "   Example: ./scripts/personalize.sh oussama-belakhdar"
  exit 1
fi

PLACEHOLDER_ORG="your-org"
PLACEHOLDER_REPO="qa-ci-pipelines"

echo ""
echo "════════════════════════════════════════════"
echo "  Personalizing repository"
echo "  Organization : $PLACEHOLDER_ORG → $ORG"
echo "  Repository   : $PLACEHOLDER_REPO → $REPO"
echo "════════════════════════════════════════════"
echo ""

# Files to update
FILES=(
  "README.md"
  "SETUP.md"
  "DISTRIBUTION.md"
  "CONTRIBUTING.md"
  "CHANGELOG.md"
  "demo/.pipeline-docs/README.md"
  "demo/README.md"
)

# Add all workflow files
while IFS= read -r -d '' f; do
  FILES+=("$f")
done < <(find .github/workflows templates -name "*.yml" -print0 2>/dev/null)

TOTAL_REPLACEMENTS=0
MODIFIED_FILES=0

for file in "${FILES[@]}"; do
  if [ ! -f "$file" ]; then
    continue
  fi

  # Count occurrences before
  COUNT_ORG=$(grep -c "$PLACEHOLDER_ORG" "$file" 2>/dev/null || echo 0)
  COUNT_REPO=$(grep -c "$PLACEHOLDER_REPO" "$file" 2>/dev/null || echo 0)
  TOTAL=$((COUNT_ORG + COUNT_REPO))

  if [ "$TOTAL" -eq 0 ]; then
    continue
  fi

  # Replace org first, then repo (order matters to avoid double-replacement)
  sed -i "s|${PLACEHOLDER_ORG}|${ORG}|g" "$file"
  if [ "$REPO" != "$PLACEHOLDER_REPO" ]; then
    sed -i "s|${PLACEHOLDER_REPO}|${REPO}|g" "$file"
  fi

  echo "  ✅ $file ($TOTAL replacement(s))"
  TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + TOTAL))
  MODIFIED_FILES=$((MODIFIED_FILES + 1))
done

echo ""
echo "════════════════════════════════════════════"
echo "  ✅ Done"
echo "  Modified : $MODIFIED_FILES files"
echo "  Replaced : $TOTAL_REPLACEMENTS placeholder(s)"
echo "════════════════════════════════════════════"
echo ""
echo "  Next steps:"
echo "  1. git add -A"
echo "  2. git commit -m 'chore: personalize repo for ${ORG}/${REPO}'"
echo "  3. git push origin main"
echo "  4. Watch badges turn green in your README"
echo ""

# Verify no placeholders remain in critical files
REMAINING=$(grep -rl "your-org" README.md SETUP.md .github/workflows/ 2>/dev/null | wc -l)
if [ "$REMAINING" -gt 0 ]; then
  echo "  ⚠️  Some 'your-org' references remain — check manually:"
  grep -rl "your-org" README.md SETUP.md .github/workflows/ 2>/dev/null
else
  echo "  ✅ No 'your-org' placeholders remain in critical files"
fi
