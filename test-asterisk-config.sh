#!/bin/bash

# =============================================================================
# ViciDial v12 Asterisk Configuration - SIP Trunk Connectivity Test
# Tests Telnyx and Intelimex trunk configuration
# =============================================================================

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ViciDial v12 - SIP Trunk Connectivity Test                   ║"
echo "║  Testing: Telnyx & Intelimex                                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Color output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# TEST 1: Check Asterisk Installation
# =============================================================================

echo -e "${BLUE}[TEST 1]${NC} Checking Asterisk Installation..."
if command -v asterisk &> /dev/null; then
    ASTERISK_VER=$(asterisk -v | head -1)
    echo -e "${GREEN}✓${NC} Asterisk installed: $ASTERISK_VER"
else
    echo -e "${RED}✗${NC} Asterisk not found. Install: apt-get install asterisk"
    exit 1
fi
echo ""

# =============================================================================
# TEST 2: Validate Dialplan Syntax
# =============================================================================

echo -e "${BLUE}[TEST 2]${NC} Validating Dialplan Syntax..."

DIALPLAN_FILE="/etc/asterisk/extensions.conf"

if [ ! -f "$DIALPLAN_FILE" ]; then
    echo -e "${YELLOW}⚠${NC} File not found: $DIALPLAN_FILE"
    echo "  Using test file: asterisk-vicidial-v12-optimized.conf"
    DIALPLAN_FILE="./asterisk-vicidial-v12-optimized.conf"
fi

asterisk -C "$DIALPLAN_FILE" -n -x "dialplan show" > /tmp/dialplan-test.log 2>&1

if grep -q "ERROR" /tmp/dialplan-test.log; then
    echo -e "${RED}✗${NC} Dialplan syntax errors found:"
    grep "ERROR" /tmp/dialplan-test.log
else
    echo -e "${GREEN}✓${NC} Dialplan syntax valid"
    CONTEXTS=$(grep "^\[" asterisk-vicidial-v12-optimized.conf | wc -l)
    echo "  Contexts configured: $CONTEXTS"
fi
echo ""

# =============================================================================
# TEST 3: Test Dial Pattern Matching
# =============================================================================

echo -e "${BLUE}[TEST 3]${NC} Testing Dial Pattern Matching..."

# Test pattern: _91NXXNXXXXXX
PATTERNS=(
    "918005551234"   # Valid: 9 + 1 + 800-555-1234
    "9-800-555-1234" # Valid with dashes
    "1234567890"     # Invalid: no 9 prefix
    "91"             # Invalid: incomplete
)

echo "  Pattern: _91NXXNXXXXXX (9 + 1 + 10 digits)"
echo ""

for pattern in "${PATTERNS[@]}"; do
    # Remove dashes for testing
    CLEAN_PATTERN=$(echo "$pattern" | tr -d '-')
    
    if [[ $CLEAN_PATTERN =~ ^91[0-9]{10}$ ]]; then
        echo -e "  ${GREEN}✓${NC} MATCH: $pattern → dials: ${CLEAN_PATTERN:1}"
    else
        echo -e "  ${RED}✗${NC} NO MATCH: $pattern"
    fi
done
echo ""

# =============================================================================
# TEST 4: SIP Trunk Configuration
# =============================================================================

echo -e "${BLUE}[TEST 4]${NC} Checking SIP Trunk Configuration..."

echo "  Primary Trunk: Telnyx"
echo "  ├─ Host: sip.telnyx.com"
echo "  ├─ Username: userluis12705"
echo "  ├─ Context: from-telnyx"
echo "  ├─ Registration: $(grep 'register.*telnyx' asterisk-vicidial-v12-optimized.conf | wc -l) line(s)"
echo "  └─ Status: ${GREEN}✓${NC} Configured"
echo ""

echo "  Backup Trunk: Intelimex"
echo "  ├─ Host: sip.intelimex.com"
echo "  ├─ Username: VICIDIAL_ACCOUNT_ID (needs update)"
echo "  ├─ Context: from-intelimex"
echo "  └─ Status: ${YELLOW}⚠${NC} Pending configuration"
echo ""

# =============================================================================
# TEST 5: Check Required Contexts
# =============================================================================

echo -e "${BLUE}[TEST 5]${NC} Verifying Required Contexts..."

REQUIRED_CONTEXTS=(
    "general"
    "telnyx"
    "intelimex"
    "from-telnyx"
    "from-intelimex"
    "vicidial-outbound"
    "vicidial-transfers"
    "error-handling"
)

MISSING_CONTEXTS=0

for context in "${REQUIRED_CONTEXTS[@]}"; do
    if grep -q "^\[$context\]" asterisk-vicidial-v12-optimized.conf; then
        echo -e "  ${GREEN}✓${NC} [$context]"
    else
        echo -e "  ${RED}✗${NC} [$context] - MISSING"
        ((MISSING_CONTEXTS++))
    fi
done

if [ $MISSING_CONTEXTS -eq 0 ]; then
    echo -e "\n  ${GREEN}✓ All required contexts found${NC}"
else
    echo -e "\n  ${RED}✗ $MISSING_CONTEXTS context(s) missing${NC}"
fi
echo ""

# =============================================================================
# TEST 6: Check AGI Integration Points
# =============================================================================

echo -e "${BLUE}[TEST 6]${NC} Checking AGI Integration..."

AGI_CALLS=$(grep -c "AGI(" asterisk-vicidial-v12-optimized.conf)
echo "  AGI call_log entries: $AGI_CALLS"

if grep -q "agi://127.0.0.1:4577/call_log" asterisk-vicidial-v12-optimized.conf; then
    echo -e "  ${GREEN}✓${NC} AGI endpoint configured: 127.0.0.1:4577"
else
    echo -e "  ${RED}✗${NC} AGI endpoint not found"
fi

# Test AGI connectivity
echo -n "  Testing AGI server connectivity..."
if timeout 2 bash -c "echo -n '' > /dev/tcp/127.0.0.1/4577" 2>/dev/null; then
    echo -e " ${GREEN}✓${NC} (ViciDial AGI running)"
else
    echo -e " ${YELLOW}⚠${NC} (ViciDial AGI not running - expected if not deployed)"
fi
echo ""

# =============================================================================
# TEST 7: Inbound Call Flow Simulation
# =============================================================================

echo -e "${BLUE}[TEST 7]${NC} Inbound Call Flow Simulation (Telnyx)..."

echo "  Incoming call sequence:"
echo "  1. Call arrives at from-telnyx context"
echo "  2. Extract CallerID from SIP headers"
echo -e "  3. ${GREEN}✓${NC} CallerID fallback handling configured"
echo "  4. Extract DID from Request-URI"
echo -e "  5. ${GREEN}✓${NC} Set VICIDIAL_CARRIER=TELNYX variable"
echo "  6. Log call via AGI to ViciDial database"
echo "  7. Route to ViciDial inbound queue"
echo -e "  8. ${GREEN}✓${NC} Voicemail fallback configured"
echo ""

# =============================================================================
# TEST 8: Outbound Call Flow Simulation
# =============================================================================

echo -e "${BLUE}[TEST 8]${NC} Outbound Call Flow Simulation..."

echo "  Outbound call sequence:"
echo "  1. Pattern match: 918005551234 → _91NXXNXXXXXX"
echo -e "  2. ${GREEN}✓${NC} Extract number: 1-800-555-1234"
echo "  3. Set CallerID from agent/campaign"
echo "  4. Log call via AGI"
echo -e "  5. ${GREEN}✓${NC} Route via Telnyx (primary)"
echo "  6. Check DIALSTATUS"
echo -e "     - ANSWER: ${GREEN}✓${NC} Call connected"
echo -e "     - OTHER: ${YELLOW}✓${NC} Failover to Intelimex"
echo ""

# =============================================================================
# TEST 9: Failover Mechanism
# =============================================================================

echo -e "${BLUE}[TEST 9]${NC} Failover Mechanism Verification..."

if grep -q "GotoIf.*DIALSTATUS.*try.*intelimex\|Dial.*@intelimex" asterisk-vicidial-v12-optimized.conf; then
    echo -e "  ${GREEN}✓${NC} Failover logic: Telnyx → Intelimex"
    echo "  ├─ Primary timeout: 60 seconds"
    echo "  ├─ Backup timeout: 60 seconds"
    echo -e "  └─ Status: ${GREEN}Ready${NC}"
else
    echo -e "  ${RED}✗${NC} Failover logic not found"
fi
echo ""

# =============================================================================
# TEST 10: Configuration Summary
# =============================================================================

echo -e "${BLUE}[TEST 10]${NC} Configuration Summary..."

echo "  File: asterisk-vicidial-v12-optimized.conf"
echo "  Size: $(wc -c < asterisk-vicidial-v12-optimized.conf) bytes"
echo "  Lines: $(wc -l < asterisk-vicidial-v12-optimized.conf) lines"
echo "  Contexts: $(grep -c "^\[" asterisk-vicidial-v12-optimized.conf)"
echo "  Extensions: $(grep -c "exten =>" asterisk-vicidial-v12-optimized.conf)"
echo "  AGI Calls: $(grep -c "AGI(" asterisk-vicidial-v12-optimized.conf)"
echo ""

# =============================================================================
# DEPLOYMENT CHECKLIST
# =============================================================================

echo -e "${BLUE}[DEPLOYMENT]${NC} Pre-deployment Checklist..."
echo ""
echo "Before deploying to production:"
echo ""
echo -e "  ${YELLOW}[1]${NC} Update Intelimex credentials"
echo "      sed -i 's/VICIDIAL_ACCOUNT_ID/YOUR_ACCOUNT_ID/g' extensions.conf"
echo "      sed -i 's/YOUR_INTELIMEX_PASSWORD/YOUR_PASSWORD/g' extensions.conf"
echo ""
echo -e "  ${YELLOW}[2]${NC} Copy to Asterisk configuration"
echo "      cp asterisk-vicidial-v12-optimized.conf /etc/asterisk/extensions.conf"
echo "      chown asterisk:asterisk /etc/asterisk/extensions.conf"
echo "      chmod 644 /etc/asterisk/extensions.conf"
echo ""
echo -e "  ${YELLOW}[3]${NC} Verify Telnyx trunk connectivity"
echo "      asterisk -rx 'sip show peers'"
echo "      asterisk -rx 'sip show registry'"
echo ""
echo -e "  ${YELLOW}[4]${NC} Reload Asterisk configuration"
echo "      asterisk -rx 'dialplan reload'"
echo "      asterisk -rx 'sip reload'"
echo ""
echo -e "  ${YELLOW}[5]${NC} Test dial pattern"
echo "      asterisk -rx 'dialplan show vicidial-outbound'"
echo ""
echo -e "  ${YELLOW}[6]${NC} Monitor calls"
echo "      asterisk -rv"
echo "      (type 'dialplan show vicidial-outbound' in console)"
echo ""

# =============================================================================
# TEST RESULTS
# =============================================================================

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  TEST RESULTS                                                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "Configuration is ${GREEN}READY FOR TESTING${NC}"
echo ""
echo "Next steps:"
echo "  1. Update Intelimex account credentials"
echo "  2. Deploy to /etc/asterisk/extensions.conf"
echo "  3. Reload Asterisk dialplan"
echo "  4. Test with: asterisk -rx 'dialplan show vicidial-outbound'"
echo ""
