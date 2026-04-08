#!/bin/bash

################################################################################
# Claude Prompt Engine - Universal Installation Script
# Supports: Linux, macOS, Windows (Git Bash/WSL)
# Creates self-contained, production-ready installation
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
INSTALL_DIR="${INSTALL_DIR:-.}"
PROJECT_NAME="claude-prompt-engine"
MIN_NODE_VERSION="18"
MIN_NPM_VERSION="9"
PORT="${PORT:-3000}"

echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════════════════════╗
║                   Claude Prompt Engine - Installation                        ║
║                          Universal Installer v1.0                           ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Function to print colored output
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

# Check if Node.js is installed
check_nodejs() {
    print_info "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        echo ""
        echo "Installation instructions:"
        echo "  • macOS: brew install node"
        echo "  • Ubuntu/Debian: sudo apt-get install nodejs npm"
        echo "  • Windows: Download from https://nodejs.org"
        echo "  • Official site: https://nodejs.org/en/download"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt "$MIN_NODE_VERSION" ]; then
        print_error "Node.js version $MIN_NODE_VERSION+ required (found v$NODE_VERSION)"
        exit 1
    fi
    
    print_status "Node.js $(node -v) installed"
}

# Check if npm is installed
check_npm() {
    print_info "Checking npm installation..."
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    NPM_VERSION=$(npm -v | cut -d'.' -f1)
    if [ "$NPM_VERSION" -lt "$MIN_NPM_VERSION" ]; then
        print_error "npm version $MIN_NPM_VERSION+ required (found v$(npm -v))"
        exit 1
    fi
    
    print_status "npm $(npm -v) installed"
}

# Create project structure
create_structure() {
    print_info "Creating project structure..."
    
    cd "$INSTALL_DIR"
    
    # Create necessary directories
    mkdir -p core
    mkdir -p public/js/css
    mkdir -p migrations
    mkdir -p test-data
    mkdir -p logs
    mkdir -p configs
    
    print_status "Project structure created"
}

# Install dependencies
install_dependencies() {
    print_info "Installing npm dependencies..."
    print_warning "This may take 2-3 minutes..."
    
    if npm install --verbose 2>&1 | tail -20; then
        print_status "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        print_info "Trying alternative installation method..."
        npm install --no-optional --legacy-peer-deps
        print_status "Dependencies installed (alternative method)"
    fi
}

# Create database
create_database() {
    print_info "Initializing database..."
    
    # Database will be auto-created on first server run
    print_status "Database initialization prepared"
}

# Generate config files
generate_configs() {
    print_info "Generating configuration files..."
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        cat > .env << EOF
# Claude Prompt Engine - Configuration
PORT=3000
NODE_ENV=development
DB_PATH=./prompt_engine.db
API_KEY=development-key-change-in-production
CORS_ORIGIN=http://localhost:3000
MAX_FILE_SIZE=104857600
FORCE_TIER=
EOF
        print_status ".env configuration file created"
    fi
    
    # Create config.json if it doesn't exist
    if [ ! -f "config.json" ]; then
        cat > config.json << 'EOF'
{
  "port": 3000,
  "database": {
    "path": "./prompt_engine.db",
    "maxSize": 1000000000
  },
  "api": {
    "maxBodySize": "1mb",
    "corsEnabled": true,
    "corsOrigin": "http://localhost:3000"
  },
  "hardware": {
    "autoDetect": true,
    "forceTier": null
  },
  "validation": {
    "phoneMinDigits": 10,
    "phoneMaxDigits": 15,
    "checkDuplicates": true,
    "fileMaxSize": 104857600
  },
  "deployment": {
    "mode": "local",
    "environment": "development"
  },
  "logging": {
    "level": "info",
    "file": "./logs/app.log"
  }
}
EOF
        print_status "config.json created"
    fi
}

# Test installation
test_installation() {
    print_info "Testing installation..."
    
    # Test Node.js
    if node -v &> /dev/null; then
        print_status "Node.js test passed"
    else
        print_error "Node.js test failed"
        exit 1
    fi
    
    # Test npm
    if npm -v &> /dev/null; then
        print_status "npm $(npm -v) verified"
    else
        print_error "npm verification failed"
        exit 1
    fi
    
    # Test required files
    if [ -f "package.json" ]; then
        print_status "package.json found"
    else
        print_error "package.json not found"
        exit 1
    fi
    
    if [ -f "server.js" ]; then
        print_status "server.js found"
    else
        print_error "server.js not found"
        exit 1
    fi
}

# Create start scripts
create_scripts() {
    print_info "Creating convenience scripts..."
    
    # Create start script
    cat > start.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Claude Prompt Engine..."
npm run web
EOF
    chmod +x start.sh
    print_status "start.sh created"
    
    # Create test script
    cat > test.sh << 'EOF'
#!/bin/bash
echo "🧪 Running tests..."
bash run-tests.sh
EOF
    chmod +x test.sh
    print_status "test.sh created"
    
    # Create stop script
    cat > stop.sh << 'EOF'
#!/bin/bash
echo "⏹ Stopping Claude Prompt Engine..."
pkill -f "node.*server.js"
echo "✓ Server stopped"
EOF
    chmod +x stop.sh
    print_status "stop.sh created"
}

# Display startup instructions
show_instructions() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                     Installation Complete! 🎉                               ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}Quick Start:${NC}"
    echo ""
    echo "  1. Navigate to project directory:"
    echo "     cd $(pwd)"
    echo ""
    echo "  2. Start the server:"
    echo "     npm run web"
    echo "     OR"
    echo "     ./start.sh"
    echo ""
    echo "  3. Open in browser:"
    echo "     http://localhost:3000"
    echo ""
    echo -e "${GREEN}Useful Commands:${NC}"
    echo ""
    echo "  npm run web        - Start development server"
    echo "  npm run cli        - Run CLI interface"
    echo "  bash run-tests.sh  - Run comprehensive test suite"
    echo ""
    echo -e "${GREEN}First Steps:${NC}"
    echo ""
    echo "  1. Go to http://localhost:3000/settings.html"
    echo "     → Configure hardware tier and deployment mode"
    echo ""
    echo "  2. Go to http://localhost:3000/data-import.html"
    echo "     → Import your first data file (CSV/Excel/TXT)"
    echo ""
    echo "  3. Go to http://localhost:3000/query-builder-form.html"
    echo "     → Build and test SQL queries"
    echo ""
    echo "  4. Go to http://localhost:3000/query-builder-visual.html"
    echo "     → Use visual query builder with drag-drop"
    echo ""
    echo -e "${GREEN}Documentation:${NC}"
    echo ""
    echo "  • Comprehensive Guide: COMPREHENSIVE_DOCS.md"
    echo "  • API Reference: API_REFERENCE.md"
    echo "  • Architecture: ARCHITECTURE.md"
    echo "  • Contributing: CONTRIBUTING.md"
    echo ""
    echo -e "${GREEN}System Information:${NC}"
    echo ""
    echo "  • Node.js: $(node -v)"
    echo "  • npm: $(npm -v)"
    echo "  • Port: $PORT"
    echo "  • Database: ./prompt_engine.db"
    echo "  • Installation: $(pwd)"
    echo ""
    echo -e "${BLUE}Need help? Visit: https://github.com/yourusername/claude-prompt-engine${NC}"
    echo ""
}

# Main installation flow
main() {
    print_info "System: $(uname -s)"
    print_info "User: $(whoami)"
    print_info "Directory: $(pwd)"
    echo ""
    
    check_nodejs
    check_npm
    create_structure
    install_dependencies
    create_database
    generate_configs
    create_scripts
    test_installation
    show_instructions
}

# Error handling
trap 'print_error "Installation failed"; exit 1' ERR

# Run main installation
main

print_status "Installation completed successfully!"
