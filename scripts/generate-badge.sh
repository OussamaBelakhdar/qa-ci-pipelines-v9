#!/usr/bin/env bash
# generate-badge.sh
# Generates README badge markdown for each template
# Usage: ./scripts/generate-badge.sh [owner] [repo]

set -euo pipefail

OWNER="${1:-your-org}"
REPO="${2:-qa-ci-pipelines}"
BASE_URL="https://github.com/${OWNER}/${REPO}/actions/workflows"

echo "## 🏷️ Status Badges"
echo ""
echo "Copy these badges into your project's README:"
echo ""

declare -A TEMPLATES=(
  ["templates/ui-web/cypress.yml"]="Cypress"
  ["templates/ui-web/playwright.yml"]="Playwright"
  ["templates/ui-web/selenium-java.yml"]="Selenium"
  ["templates/ui-mobile/appium-android.yml"]="Appium-Android"
  ["templates/ui-mobile/appium-ios.yml"]="Appium-iOS"
  ["templates/api/postman-newman.yml"]="Newman"
  ["templates/api/karate-maven.yml"]="Karate"
  ["templates/api/rest-assured.yml"]="REST-Assured"
  ["templates/performance/jmeter.yml"]="JMeter"
  ["templates/performance/k6.yml"]="k6"
)

for template in "${!TEMPLATES[@]}"; do
  name="${TEMPLATES[$template]}"
  filename=$(basename "$template")
  badge_url="${BASE_URL}/${filename}/badge.svg"
  link_url="${BASE_URL}/${filename}"
  
  echo "### $name"
  echo '```markdown'
  echo "[![${name}](${badge_url})](${link_url})"
  echo '```'
  echo ""
done
