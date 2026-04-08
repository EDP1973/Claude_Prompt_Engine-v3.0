#!/usr/bin/env python3

import re
import sys

file = 'asterisk-vicidial-v12-optimized.conf'

print("╔════════════════════════════════════════════════════════════════╗")
print("║  ViciDial v12 - Dialplan Validation                           ║")
print("║  Static Analysis (No Asterisk Required)                       ║")
print("╚════════════════════════════════════════════════════════════════╝")
print()

# Read file
with open(file, 'r') as f:
    content = f.read()
    lines = content.split('\n')

# Color codes
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
NC = '\033[0m'

errors = 0
warnings = 0

# Test 1: Check contexts
print(f"{BLUE}[TEST 1]{NC} Context Validation...")
contexts = re.findall(r'^\[([^\]]+)\]', content, re.MULTILINE)
required_contexts = ['general', 'telnyx', 'intelimex', 'from-telnyx', 'from-intelimex', 'vicidial-outbound']
print(f"  Found {len(contexts)} contexts: {', '.join(contexts)}")

for ctx in required_contexts:
    if ctx in contexts:
        print(f"  {GREEN}✓{NC} [{ctx}]")
    else:
        print(f"  {RED}✗{NC} [{ctx}] - MISSING")
        errors += 1
print()

# Test 2: Dial patterns
print(f"{BLUE}[TEST 2]{NC} Dial Pattern Analysis...")
dial_patterns = re.findall(r'exten => (_[\w\.]+),', content)
if dial_patterns:
    print(f"  {GREEN}✓{NC} Found {len(dial_patterns)} dial patterns")
    for pattern in set(dial_patterns):
        print(f"    - {pattern}")
else:
    print(f"  {YELLOW}⚠{NC} No dial patterns found")
print()

# Test 3: SIP trunk config
print(f"{BLUE}[TEST 3]{NC} SIP Trunk Configuration...")
trunks = re.findall(r'^\[(telnyx|intelimex)\]', content, re.MULTILINE)
print(f"  {GREEN}✓{NC} SIP trunks configured: {', '.join(trunks)}")

if 'register =>' in content:
    registrations = re.findall(r'register => (.+)@', content)
    print(f"  {GREEN}✓{NC} SIP registrations: {len(registrations)}")
    for reg in registrations:
        print(f"    - {reg}")
print()

# Test 4: AGI integration
print(f"{BLUE}[TEST 4]{NC} AGI Integration...")
agi_calls = re.findall(r'AGI\(([^)]+)\)', content)
if agi_calls:
    print(f"  {GREEN}✓{NC} AGI calls: {len(agi_calls)}")
    for agi in set(agi_calls):
        print(f"    - {agi}")
else:
    print(f"  {RED}✗{NC} No AGI calls found")
    errors += 1
print()

# Test 5: Extension syntax
print(f"{BLUE}[TEST 5]{NC} Extension Syntax Check...")
exten_lines = [l for l in lines if 'exten =>' in l]
print(f"  Total extensions: {len(exten_lines)}")

syntax_errors = []
for i, line in enumerate(exten_lines, 1):
    # Check if line has proper syntax
    if not re.match(r'\s*exten\s*=>\s*[\w\.,]+,\d+,', line):
        syntax_errors.append((i, line))

if not syntax_errors:
    print(f"  {GREEN}✓{NC} All extension syntax valid")
else:
    print(f"  {RED}✗{NC} {len(syntax_errors)} syntax errors found")
    for line_no, line in syntax_errors[:5]:
        print(f"    Line {line_no}: {line.strip()[:60]}")
    errors += len(syntax_errors)
print()

# Test 6: Queue references
print(f"{BLUE}[TEST 6]{NC} ViciDial Queue Integration...")
if 'Queue(' in content:
    queues = re.findall(r'Queue\(([^,)]+)', content)
    print(f"  {GREEN}✓{NC} Queue calls: {len(queues)}")
    for q in set(queues):
        print(f"    - {q}")
else:
    print(f"  {RED}✗{NC} No Queue() calls found")
    errors += 1
print()

# Test 7: Variables
print(f"{BLUE}[TEST 7]{NC} Variable Usage...")
variables = re.findall(r'\$\{([^}]+)\}', content)
unique_vars = set(variables)
print(f"  Unique variables used: {len(unique_vars)}")

important_vars = [
    'EXTEN', 'DIALSTATUS', 'DIALED_NUMBER', 'CALLERID',
    'VICIDIAL_CARRIER', 'VICIDIAL_DID', 'MAILBOX'
]

for var in important_vars:
    if var in unique_vars:
        print(f"    {GREEN}✓{NC} {var}")
    else:
        print(f"    {YELLOW}⚠{NC} {var} - not used")
print()

# Test 8: Credentials check
print(f"{BLUE}[TEST 8]{NC} Credentials Security Check...")
if 'userluis12705' in content:
    print(f"  {YELLOW}⚠{NC} Telnyx username visible in config")
    warnings += 1
if 'greAt$$5355o' in content:
    print(f"  {YELLOW}⚠{NC} Telnyx password visible in config")
    warnings += 1
if 'YOUR_INTELIMEX_PASSWORD' in content:
    print(f"  {YELLOW}⚠{NC} Intelimex password needs replacement")
    warnings += 1

print(f"  Recommendation: Use separate credentials file with includes")
print()

# Test 9: Statistics
print(f"{BLUE}[TEST 9]{NC} File Statistics...")
print(f"  Total lines: {len(lines)}")
print(f"  Contexts: {len(contexts)}")
print(f"  Extensions: {len(exten_lines)}")
print(f"  Dial calls: {len(re.findall(r'Dial\(', content))}")
print(f"  AGI calls: {len(agi_calls)}")
print(f"  Queue refs: {len(queues)}")
print()

# Final result
print("╔════════════════════════════════════════════════════════════════╗")
print("║  VALIDATION RESULTS                                            ║")
print("╚════════════════════════════════════════════════════════════════╝")
print()

if errors == 0:
    print(f"{GREEN}✓ Configuration is VALID and READY FOR TESTING{NC}")
else:
    print(f"{RED}✗ {errors} error(s) found{NC}")

if warnings > 0:
    print(f"{YELLOW}⚠ {warnings} warning(s) - review credentials{NC}")

print()
print("Summary:")
print(f"  Errors: {errors}")
print(f"  Warnings: {warnings}")
print(f"  Status: {'✓ PASS' if errors == 0 else '✗ FAIL'}")
print()

sys.exit(0 if errors == 0 else 1)
