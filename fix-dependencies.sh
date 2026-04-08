#!/bin/bash

################################################################################
# Claude Prompt Engine - Dependency Fix Script
# Resolves "Cannot find module 'sqlite3'" and permission issues
################################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════════════════════╗
║           Claude Prompt Engine - Dependency Fix Script                      ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found - are you in the project directory?"
    echo "  cd claude-prompt-engine"
    exit 1
fi

print_info "Starting dependency fix process..."
echo ""

# Step 1: Check Node.js
print_info "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js v18+ required (found v$NODE_VERSION)"
    exit 1
fi
print_status "Node.js $(node -v) installed"
echo ""

# Step 2: Remove problematic dependencies
print_info "Removing old node_modules and cache..."
if [ -d "node_modules" ]; then
    rm -rf node_modules && print_status "Removed node_modules" || print_warning "Could not remove node_modules (permission issue)"
fi
if [ -f "package-lock.json" ]; then
    rm -f package-lock.json && print_status "Removed package-lock.json"
fi
echo ""

# Step 3: Clean npm cache
print_info "Cleaning npm cache..."
npm cache clean --force > /dev/null 2>&1
print_status "npm cache cleaned"
echo ""

# Step 4: Fresh install
print_info "Installing fresh dependencies..."
if npm install --verbose 2>&1 | tail -5; then
    print_status "Dependencies installed successfully"
else
    print_error "Installation failed - trying with legacy peer deps..."
    npm install --no-optional --legacy-peer-deps
    print_status "Dependencies installed (compatibility mode)"
fi
echo ""

# Step 5: Verify installation
print_info "Verifying installation..."
if [ -d "node_modules" ]; then
    print_status "node_modules directory created"
else
    print_error "node_modules directory not found"
    exit 1
fi

if npm list sqlite3 > /dev/null 2>&1; then
    print_status "sqlite3 module verified"
else
    print_error "sqlite3 module not found"
    exit 1
fi

echo ""
print_status "All dependencies fixed successfully!"
echo ""
echo -e "${BLUE}You can now start the server:${NC}"
echo "  npm run web"
echo "  or"
echo "  ./start.sh"
echo ""
