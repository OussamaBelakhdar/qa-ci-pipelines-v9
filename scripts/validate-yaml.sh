#!/usr/bin/env bash
# validate-yaml.sh
# Validates all YAML files in templates/ and examples/
# Usage: ./scripts/validate-yaml.sh

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
VALIDATED=0

echo "🔍 QA CI Pipelines — YAML Validator"
echo "====================================="
echo ""

# Check yamllint is available
if ! command -v yamllint &> /dev/null; then
  echo -e "${YELLOW}⚠ yamllint not found. Installing...${NC}"
  pip install yamllint --quiet
fi

# Validate templates
echo "📁 Validating templates/..."
while IFS= read -r -d '' file; do
  if yamllint -d "{extends: relaxed, rules: {line-length: {max: 200}}}" "$file" 2>/dev/null; then
    echo -e "  ${GREEN}✅ $file${NC}"
    ((VALIDATED++))
  else
    echo -e "  ${RED}❌ $file${NC}"
    yamllint -d "{extends: relaxed, rules: {line-length: {max: 200}}}" "$file" || true
    ((ERRORS++))
  fi
done < <(find templates/ -name "*.yml" -print0)

echo ""

# Validate examples
echo "📁 Validating examples/..."
while IFS= read -r -d '' file; do
  if yamllint -d relaxed "$file" 2>/dev/null; then
    echo -e "  ${GREEN}✅ $file${NC}"
    ((VALIDATED++))
  else
    echo -e "  ${RED}❌ $file${NC}"
    ((ERRORS++))
  fi
done < <(find examples/ -name "*.yml" -print0)

echo ""
echo "====================================="
echo "Validated: $VALIDATED files"
echo "Errors:    $ERRORS files"

if [ "$ERRORS" -gt 0 ]; then
  echo -e "${RED}❌ Validation FAILED with $ERRORS error(s)${NC}"
  exit 1
else
  echo -e "${GREEN}✅ All YAML files are valid${NC}"
fi
