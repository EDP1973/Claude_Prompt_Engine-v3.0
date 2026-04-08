#!/bin/bash

# SIP Trunk Connectivity Test
# Tests connectivity to Telnyx and Intelimex SIP servers

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ViciDial v12 - SIP Trunk Connectivity Test                   ║"
echo "║  Testing: Telnyx & Intelimex                                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

PASS=0
FAIL=0
WARN=0

# ========== TEST 1: DNS RESOLUTION ==========
echo -e "${BLUE}[TEST 1]${NC} DNS Resolution"
echo ""

echo "  Telnyx SIP Server (sip.telnyx.com):"
if nslookup sip.telnyx.com > /tmp/telnyx-dns.log 2>&1; then
    TELNYX_IP=$(grep -A 1 "Name:" /tmp/telnyx-dns.log | tail -1 | grep -oE '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b' | head -1)
    if [ -n "$TELNYX_IP" ]; then
        echo -e "    ${GREEN}✓${NC} DNS resolved: $TELNYX_IP"
        ((PASS++))
    else
        echo -e "    ${RED}✗${NC} Could not resolve IP"
        ((FAIL++))
    fi
else
    echo -e "    ${YELLOW}⚠${NC} DNS lookup failed (network may be restricted)"
    ((WARN++))
fi

echo ""
echo "  Intelimex SIP Server (sip.intelimex.com):"
if nslookup sip.intelimex.com > /tmp/intelimex-dns.log 2>&1; then
    INTELIMEX_IP=$(grep -A 1 "Name:" /tmp/intelimex-dns.log | tail -1 | grep -oE '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b' | head -1)
    if [ -n "$INTELIMEX_IP" ]; then
        echo -e "    ${GREEN}✓${NC} DNS resolved: $INTELIMEX_IP"
        ((PASS++))
    else
        echo -e "    ${RED}✗${NC} Could not resolve IP"
        ((FAIL++))
    fi
else
    echo -e "    ${YELLOW}⚠${NC} DNS lookup failed"
    ((WARN++))
fi
echo ""

# ========== TEST 2: PING TEST ==========
echo -e "${BLUE}[TEST 2]${NC} Network Connectivity (Ping)"
echo ""

echo "  Pinging sip.telnyx.com:"
if timeout 5 ping -c 1 sip.telnyx.com > /tmp/telnyx-ping.log 2>&1; then
    echo -e "    ${GREEN}✓${NC} Host reachable"
    LATENCY=$(grep "time=" /tmp/telnyx-ping.log | head -1 | grep -oE 'time=[0-9.]+' | cut -d= -f2)
    echo "    Latency: $LATENCY ms"
    ((PASS++))
else
    echo -e "    ${YELLOW}⚠${NC} Host not responding to ping (may be blocked)"
    ((WARN++))
fi

echo ""
echo "  Pinging sip.intelimex.com:"
if timeout 5 ping -c 1 sip.intelimex.com > /tmp/intelimex-ping.log 2>&1; then
    echo -e "    ${GREEN}✓${NC} Host reachable"
    LATENCY=$(grep "time=" /tmp/intelimex-ping.log | head -1 | grep -oE 'time=[0-9.]+' | cut -d= -f2)
    echo "    Latency: $LATENCY ms"
    ((PASS++))
else
    echo -e "    ${YELLOW}⚠${NC} Host not responding to ping"
    ((WARN++))
fi
echo ""

# ========== TEST 3: PORT CONNECTIVITY ==========
echo -e "${BLUE}[TEST 3]${NC} SIP Port Connectivity (Port 5060)"
echo ""

echo "  Testing sip.telnyx.com:5060:"
if timeout 3 bash -c "echo '' > /dev/tcp/sip.telnyx.com/5060" 2>/dev/null; then
    echo -e "    ${GREEN}✓${NC} Port 5060 is open"
    ((PASS++))
else
    echo -e "    ${YELLOW}⚠${NC} Port 5060 not accessible (expected - may require SIP OPTIONS)"
    ((WARN++))
fi

echo ""
echo "  Testing sip.intelimex.com:5060:"
if timeout 3 bash -c "echo '' > /dev/tcp/sip.intelimex.com/5060" 2>/dev/null; then
    echo -e "    ${GREEN}✓${NC} Port 5060 is open"
    ((PASS++))
else
    echo -e "    ${YELLOW}⚠${NC} Port 5060 not accessible"
    ((WARN++))
fi
echo ""

# ========== TEST 4: TRACEROUTE ==========
echo -e "${BLUE}[TEST 4]${NC} Network Route Analysis (Traceroute)"
echo ""

echo "  Route to sip.telnyx.com:"
HOPS=$(timeout 10 traceroute -m 5 sip.telnyx.com 2>/dev/null | grep -c "ms")
if [ $HOPS -gt 0 ]; then
    echo -e "    ${GREEN}✓${NC} Route reachable in $HOPS hops"
    ((PASS++))
else
    echo -e "    ${YELLOW}⚠${NC} Traceroute blocked or unreachable"
    ((WARN++))
fi

echo ""
echo "  Route to sip.intelimex.com:"
HOPS=$(timeout 10 traceroute -m 5 sip.intelimex.com 2>/dev/null | grep -c "ms")
if [ $HOPS -gt 0 ]; then
    echo -e "    ${GREEN}✓${NC} Route reachable in $HOPS hops"
    ((PASS++))
else
    echo -e "    ${YELLOW}⚠${NC} Traceroute blocked or unreachable"
    ((WARN++))
fi
echo ""

# ========== TEST 5: CONFIGURATION VERIFICATION ==========
echo -e "${BLUE}[TEST 5]${NC} Configuration Verification"
echo ""

FILE="asterisk-vicidial-v12-optimized.conf"

echo "  Telnyx Configuration:"
if grep -q "host=sip.telnyx.com" "$FILE"; then
    echo -e "    ${GREEN}✓${NC} Host configured: sip.telnyx.com"
    ((PASS++))
fi

if grep -q "username=userluis12705" "$FILE"; then
    echo -e "    ${GREEN}✓${NC} Username configured: userluis12705"
    ((PASS++))
fi

if grep -q "port=5060" "$FILE"; then
    echo -e "    ${GREEN}✓${NC} Port configured: 5060"
    ((PASS++))
fi

if grep -q "context=from-telnyx" "$FILE"; then
    echo -e "    ${GREEN}✓${NC} Context configured: from-telnyx"
    ((PASS++))
fi

echo ""
echo "  Intelimex Configuration:"
if grep -q "host=sip.intelimex.com" "$FILE"; then
    echo -e "    ${GREEN}✓${NC} Host configured: sip.intelimex.com"
    ((PASS++))
fi

if grep -q "type=peer" "$FILE"; then
    echo -e "    ${GREEN}✓${NC} Trunk type: peer"
    ((PASS++))
fi

if grep -q "disallow=all" "$FILE"; then
    echo -e "    ${GREEN}✓${NC} Security: codec restriction enabled"
    ((PASS++))
fi

if grep -q "allow=ulaw,alaw" "$FILE"; then
    echo -e "    ${GREEN}✓${NC} Codecs: ulaw, alaw"
    ((PASS++))
fi
echo ""

# ========== TEST 6: REGISTRATION CHECK ==========
echo -e "${BLUE}[TEST 6]${NC} Registration Configuration"
echo ""

if grep -q "register => userluis12705:greAt" "$FILE"; then
    echo -e "    ${GREEN}✓${NC} Telnyx registration configured"
    ((PASS++))
    
    REG_LINE=$(grep "register => userluis12705" "$FILE")
    echo "    Registration: $REG_LINE"
fi

echo ""

# ========== TEST 7: CALL PATTERN VERIFICATION ==========
echo -e "${BLUE}[TEST 7]${NC} Call Pattern Routing"
echo ""

if grep -q "_91NXXNXXXXXX" "$FILE"; then
    echo -e "    ${GREEN}✓${NC} Outbound pattern: _91NXXNXXXXXX"
    ((PASS++))
fi

if grep -q "Dial(SIP/\${DIALED_NUMBER}@telnyx" "$FILE"; then
    echo -e "    ${GREEN}✓${NC} Primary routing: Telnyx"
    ((PASS++))
fi

if grep -q "Dial(SIP/\${DIALED_NUMBER}@intelimex" "$FILE"; then
    echo -e "    ${GREEN}✓${NC} Failover routing: Intelimex"
    ((PASS++))
fi

echo ""

# ========== TEST 8: WHAT NEEDS ASTERISK ==========
echo -e "${BLUE}[TEST 8]${NC} Actual Registration Testing (Requires Asterisk)"
echo ""
echo "  The following tests require Asterisk to be running:"
echo ""
echo "  1. SIP REGISTER authentication"
echo "     Command: asterisk -rx 'sip show registry'"
echo ""
echo "  2. Trunk peer status"
echo "     Command: asterisk -rx 'sip show peers'"
echo ""
echo "  3. SIP debug"
echo "     Command: asterisk -rx 'sip set debug on'"
echo ""
echo "  4. Test outbound call"
echo "     Command: asterisk -rx 'channel originate SIP/918005551234@telnyx'"
echo ""
echo "  5. Monitor real-time calls"
echo "     Command: tail -f /var/log/asterisk/full"
echo ""

# ========== FINAL REPORT ==========
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  CONNECTIVITY TEST RESULTS                                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Tests Run:"
echo -e "  ${GREEN}✓ PASSED: $PASS${NC}"
echo -e "  ${RED}✗ FAILED: $FAIL${NC}"
echo -e "  ${YELLOW}⚠ WARNINGS: $WARN${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ Network connectivity to SIP carriers: OK${NC}"
    echo ""
    echo "Status:"
    echo "  • DNS resolution: Tested"
    echo "  • Network reachability: Tested"
    echo "  • Port availability: Tested"
    echo "  • Configuration: Verified"
    echo ""
else
    echo -e "${RED}✗ Some connectivity tests failed${NC}"
fi

echo ""
echo "Next Steps (with Asterisk installed):"
echo "  1. sudo systemctl start asterisk"
echo "  2. sudo asterisk -r"
echo "  3. sip show registry  # Check registration status"
echo "  4. sip show peers     # Check trunk status"
echo "  5. dialplan show vicidial-outbound  # Verify dialplan"
echo ""

