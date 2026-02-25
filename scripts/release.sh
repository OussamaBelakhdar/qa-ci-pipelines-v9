#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# release.sh — Tag a new version and push to GitHub
#
# Usage:
#   ./scripts/release.sh 2.0.0         # Create and push tag v2.0.0
#   ./scripts/release.sh 2.1.0 "Live demo added"
#
# Prerequisites:
#   - git remote 'origin' pointing to your GitHub repo
#   - gh CLI installed (optional — for creating GitHub Release)
#   - Pipelines must be GREEN before tagging
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

VERSION="${1:-}"
MESSAGE="${2:-Release v${VERSION}}"

if [ -z "$VERSION" ]; then
  echo "❌ Usage: ./scripts/release.sh <version> [message]"
  echo "   Example: ./scripts/release.sh 2.0.0 'Architecture v2 — Quality Gates + Allure'"
  exit 1
fi

TAG="v${VERSION}"

# ── Preflight checks ──────────────────────────────────────────────────────────
echo "🔍 Preflight checks..."

# 0. Remote origin must point to GitHub
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REMOTE_URL" ]; then
  echo "❌ No remote 'origin' configured. Add it first:"
  echo "   git remote add origin https://github.com/your-org/qa-ci-pipelines"
  exit 1
fi
if ! echo "$REMOTE_URL" | grep -q "github.com"; then
  echo "❌ Remote 'origin' does not point to GitHub:"
  echo "   Current: $REMOTE_URL"
  echo "   Expected: https://github.com/... or git@github.com:..."
  exit 1
fi
echo "  ✅ Remote origin → $REMOTE_URL"

# 1. Must be on main
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
  echo "❌ Must be on main branch (current: $BRANCH)"
  exit 1
fi

# 2. Working tree must be clean
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "❌ Working tree is dirty. Commit or stash changes first."
  git status --short
  exit 1
fi

# 3. Must be in sync with origin/main
git fetch origin main --quiet
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)
if [ "$LOCAL" != "$REMOTE" ]; then
  echo "❌ Local main is not in sync with origin/main. Pull first."
  exit 1
fi

# 4. Tag must not already exist
if git tag | grep -q "^${TAG}$"; then
  echo "❌ Tag ${TAG} already exists."
  exit 1
fi

echo "✅ All preflight checks passed"
echo ""

# ── Update CHANGELOG with release date ───────────────────────────────────────
TODAY=$(date +%Y-%m-%d)
sed -i "s/\[${VERSION}\] — [0-9]\{4\}-[0-9]\{2\}-XX/[${VERSION}] — ${TODAY}/g" CHANGELOG.md

# ── Commit CHANGELOG update ───────────────────────────────────────────────────
if ! git diff --quiet CHANGELOG.md; then
  git add CHANGELOG.md
  git commit -m "chore: finalize CHANGELOG for ${TAG}"
  git push origin main
  echo "✅ CHANGELOG updated and pushed"
fi

# ── Create and push tag ───────────────────────────────────────────────────────
echo ""
echo "🏷️  Creating tag ${TAG}..."
git tag -a "${TAG}" -m "${MESSAGE}"
git push origin "${TAG}"
echo "✅ Tag ${TAG} pushed to origin"

# ── Create GitHub Release (requires gh CLI) ───────────────────────────────────
if command -v gh &> /dev/null; then
  echo ""
  echo "📦 Creating GitHub Release..."
  
  # Extract changelog section for this version
  NOTES=$(awk "/## \[${VERSION}\]/,/## \[/" CHANGELOG.md | head -n -1 | tail -n +2)
  
  gh release create "${TAG}" \
    --title "Release ${TAG}" \
    --notes "${NOTES}" \
    --latest
  
  echo "✅ GitHub Release created: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]//;s/\.git$//')/releases/tag/${TAG}"
else
  echo ""
  echo "ℹ️  gh CLI not found — create the GitHub Release manually:"
  echo "   https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]//;s/\.git$//')/releases/new?tag=${TAG}"
fi

echo ""
echo "═══════════════════════════════════════════"
echo "  ✅ Released: ${TAG}"
echo "  📋 Next steps:"
echo "     1. Verify badges are green in README"
echo "     2. Publish the Dev.to article (see DISTRIBUTION.md)"
echo "     3. Post on LinkedIn with repo link in comments"
echo "═══════════════════════════════════════════"
