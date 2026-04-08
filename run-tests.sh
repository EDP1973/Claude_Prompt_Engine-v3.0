#!/bin/bash

# Claude Prompt Engine - Comprehensive Test Script
# Tests all components and generates reports

echo "════════════════════════════════════════════════════════════"
echo "  CLAUDE PROMPT ENGINE - COMPREHENSIVE TEST SUITE"
echo "════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

test_result() {
    local name=$1
    local passed=$2
    
    TESTS_RUN=$((TESTS_RUN + 1))
    if [ "$passed" = true ]; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo -e "${GREEN}✓${NC} $name"
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo -e "${RED}✗${NC} $name"
    fi
}

echo -e "${BLUE}📦 FILE STRUCTURE TESTS${NC}"
[ -d "core" ] && test_result "core/ directory exists" true || test_result "core/ directory exists" false
[ -d "public" ] && test_result "public/ directory exists" true || test_result "public/ directory exists" false
[ -d "migrations" ] && test_result "migrations/ directory exists" true || test_result "migrations/ directory exists" false
[ -f "server.js" ] && test_result "server.js exists" true || test_result "server.js exists" false
[ -f "package.json" ] && test_result "package.json exists" true || test_result "package.json exists" false

echo ""
echo -e "${BLUE}🔧 CORE MODULES TESTS${NC}"
[ -f "core/install-config.js" ] && test_result "install-config.js exists" true || test_result "install-config.js exists" false
[ -f "core/vicidial-mapper.js" ] && test_result "vicidial-mapper.js exists" true || test_result "vicidial-mapper.js exists" false
[ -f "core/data-importer.js" ] && test_result "data-importer.js exists" true || test_result "data-importer.js exists" false
[ -f "core/data-validator.js" ] && test_result "data-validator.js exists" true || test_result "data-validator.js exists" false
[ -f "core/query-builder.js" ] && test_result "query-builder.js exists" true || test_result "query-builder.js exists" false
[ -f "core/api-handlers.js" ] && test_result "api-handlers.js exists" true || test_result "api-handlers.js exists" false

echo ""
echo -e "${BLUE}🎨 UI COMPONENTS TESTS${NC}"
[ -f "public/data-import.html" ] && test_result "data-import.html exists" true || test_result "data-import.html exists" false
[ -f "public/query-builder-form.html" ] && test_result "query-builder-form.html exists" true || test_result "query-builder-form.html exists" false
[ -f "public/query-builder-visual.html" ] && test_result "query-builder-visual.html exists" true || test_result "query-builder-visual.html exists" false
[ -f "public/settings.html" ] && test_result "settings.html exists" true || test_result "settings.html exists" false

echo ""
echo -e "${BLUE}🎯 JAVASCRIPT CONTROLLERS TESTS${NC}"
[ -f "public/js/data-import-ui.js" ] && test_result "data-import-ui.js exists" true || test_result "data-import-ui.js exists" false
[ -f "public/js/query-builder-ui.js" ] && test_result "query-builder-ui.js exists" true || test_result "query-builder-ui.js exists" false
[ -f "public/js/query-builder-visual.js" ] && test_result "query-builder-visual.js exists" true || test_result "query-builder-visual.js exists" false
[ -f "public/js/settings-ui.js" ] && test_result "settings-ui.js exists" true || test_result "settings-ui.js exists" false

echo ""
echo -e "${BLUE}📊 SYNTAX VALIDATION TESTS${NC}"

# Check for JavaScript syntax errors
if command -v node &> /dev/null; then
    node -c core/install-config.js 2>/dev/null && test_result "install-config.js syntax valid" true || test_result "install-config.js syntax valid" false
    node -c core/vicidial-mapper.js 2>/dev/null && test_result "vicidial-mapper.js syntax valid" true || test_result "vicidial-mapper.js syntax valid" false
    node -c core/data-importer.js 2>/dev/null && test_result "data-importer.js syntax valid" true || test_result "data-importer.js syntax valid" false
    node -c core/data-validator.js 2>/dev/null && test_result "data-validator.js syntax valid" true || test_result "data-validator.js syntax valid" false
    node -c core/query-builder.js 2>/dev/null && test_result "query-builder.js syntax valid" true || test_result "query-builder.js syntax valid" false
    node -c server.js 2>/dev/null && test_result "server.js syntax valid" true || test_result "server.js syntax valid" false
else
    echo -e "${YELLOW}⚠ Node.js not found, skipping syntax checks${NC}"
fi

echo ""
echo -e "${BLUE}📝 TEST DATA FILES${NC}"
[ -f "test-data/sample.csv" ] && test_result "sample.csv exists" true || test_result "sample.csv exists" false

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  TEST SUMMARY"
echo "════════════════════════════════════════════════════════════"
echo ""

PASS_RATE=$((TESTS_PASSED * 100 / TESTS_RUN))
if [ $PASS_RATE -ge 80 ]; then
    COLOR=$GREEN
elif [ $PASS_RATE -ge 50 ]; then
    COLOR=$YELLOW
else
    COLOR=$RED
fi

echo -e "${COLOR}Total: ${TESTS_RUN} | Passed: ${TESTS_PASSED} | Failed: ${TESTS_FAILED} | Pass Rate: ${PASS_RATE}%${NC}"
echo ""
echo "════════════════════════════════════════════════════════════"

[ $TESTS_FAILED -eq 0 ] && exit 0 || exit 1
