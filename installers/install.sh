#!/bin/bash

################################################################################
#                                                                              #
#     Claude Prompt Engine - Universal Installation Script                    #
#     Supports: Linux, macOS, WSL                                             #
#     Created with GitHub Copilot                                             #
#                                                                              #
################################################################################

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Directories
INSTALL_DIR="${INSTALL_DIR:-.}"
PROJECT_NAME="claude-prompt-engine"
APP_DIR="$INSTALL_DIR/$PROJECT_NAME"

# Configuration
NODE_VERSION_REQUIRED="18"
NPM_VERSION_REQUIRED="9"
PYTHON_VERSION_REQUIRED="3.8"

################################################################################
# UTILITY FUNCTIONS
################################################################################

print_banner() {
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║  Claude Prompt Engine - Installation Script               ║"
    echo "║  GitHub Copilot CLI Integration                           ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_section() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}✓ $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

################################################################################
# SYSTEM DETECTION
################################################################################

detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if grep -q "microsoft\|WSL" /proc/version 2>/dev/null; then
            OS="wsl"
        else
            OS="linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    else
        OS="unknown"
    fi
    echo "$OS"
}

detect_package_manager() {
    if command -v apt-get &> /dev/null; then
        echo "apt"
    elif command -v yum &> /dev/null; then
        echo "yum"
    elif command -v brew &> /dev/null; then
        echo "brew"
    else
        echo "none"
    fi
}

################################################################################
# VERSION CHECKING
################################################################################

check_version() {
    local current=$1
    local required=$2
    
    # Compare versions (simple numeric comparison)
    if [[ $(echo "$current" | cut -d. -f1) -ge $(echo "$required" | cut -d. -f1) ]]; then
        return 0
    fi
    return 1
}

check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        return 1
    fi
    
    local version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if ! check_version "$version" "$NODE_VERSION_REQUIRED"; then
        print_error "Node.js version $version is below required $NODE_VERSION_REQUIRED"
        return 1
    fi
    
    print_success "Node.js v$(node -v | cut -d'v' -f2) installed"
    return 0
}

check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        return 1
    fi
    
    local version=$(npm -v | cut -d'.' -f1)
    if ! check_version "$version" "$NPM_VERSION_REQUIRED"; then
        print_error "npm version $version is below required $NPM_VERSION_REQUIRED"
        return 1
    fi
    
    print_success "npm v$(npm -v) installed"
    return 0
}

check_git() {
    if ! command -v git &> /dev/null; then
        print_warning "Git is not installed (optional)"
        return 1
    fi
    
    print_success "Git v$(git --version | awk '{print $3}') installed"
    return 0
}

################################################################################
# DEPENDENCY INSTALLATION
################################################################################

install_node_npm() {
    local os=$(detect_os)
    local pkg_mgr=$(detect_package_manager)
    
    print_section "Installing Node.js and npm"
    
    case "$pkg_mgr" in
        apt)
            print_info "Using apt package manager"
            sudo apt-get update
            sudo apt-get install -y nodejs npm
            ;;
        yum)
            print_info "Using yum package manager"
            sudo yum install -y nodejs npm
            ;;
        brew)
            print_info "Using Homebrew"
            brew install node
            ;;
        *)
            print_error "No supported package manager found"
            print_info "Please install Node.js manually from https://nodejs.org/"
            return 1
            ;;
    esac
    
    if check_node && check_npm; then
        print_success "Node.js and npm installed successfully"
        return 0
    else
        return 1
    fi
}

install_optional_tools() {
    print_section "Installing Optional Tools"
    
    local os=$(detect_os)
    local pkg_mgr=$(detect_package_manager)
    
    # Try to install git if not present
    if ! check_git; then
        case "$pkg_mgr" in
            apt)
                sudo apt-get install -y git
                ;;
            yum)
                sudo yum install -y git
                ;;
            brew)
                brew install git
                ;;
        esac
    fi
    
    # Install GitHub CLI
    case "$os" in
        linux)
            case "$pkg_mgr" in
                apt)
                    sudo apt-get install -y gh
                    ;;
                yum)
                    sudo yum install -y gh
                    ;;
            esac
            ;;
        macos)
            brew install gh
            ;;
    esac
    
    # Try to install GitHub Copilot CLI extension
    if command -v gh &> /dev/null; then
        print_info "GitHub CLI installed. Installing Copilot extension..."
        gh extension install github/gh-copilot 2>/dev/null || print_warning "Could not install gh-copilot extension (may already be installed)"
    fi
}

################################################################################
# PROJECT SETUP
################################################################################

setup_project_structure() {
    print_section "Setting Up Project Structure"
    
    # Create necessary directories
    mkdir -p "$APP_DIR/core"
    mkdir -p "$APP_DIR/memory/iai/episodes"
    mkdir -p "$APP_DIR/cli"
    mkdir -p "$APP_DIR/configs"
    mkdir -p "$APP_DIR/public"
    mkdir -p "$APP_DIR/logs"
    mkdir -p "$APP_DIR/.github/workflows"
    
    print_success "Project directories created"
}

setup_permissions() {
    print_section "Setting Up File Permissions"
    
    # Make scripts executable
    chmod +x "$APP_DIR/run-comprehensive-test.sh" 2>/dev/null || true
    chmod +x "$APP_DIR/test-asterisk-config.sh" 2>/dev/null || true
    chmod +x "$APP_DIR/test-sip-connectivity.sh" 2>/dev/null || true
    chmod +x "$APP_DIR/installers/install.sh" 2>/dev/null || true
    chmod +x "$APP_DIR/installers/"*.sh 2>/dev/null || true
    
    # Set proper ownership
    chown -R "$USER:$USER" "$APP_DIR" 2>/dev/null || true
    
    # Set logs directory permissions
    if [ -d "$APP_DIR/logs" ]; then
        chmod 755 "$APP_DIR/logs"
    fi
    
    print_success "Permissions configured"
}

################################################################################
# ENVIRONMENT SETUP
################################################################################

setup_environment() {
    print_section "Setting Up Environment"
    
    if [ ! -f "$APP_DIR/.env" ]; then
        print_info "Creating .env file..."
        cat > "$APP_DIR/.env" << 'ENVEOF'
# Claude Prompt Engine Configuration

# Server Configuration
PORT=3000
NODE_ENV=production
HOST=localhost

# API Configuration
MAX_BODY_SIZE=1048576
REQUEST_TIMEOUT=30000

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Optional: External Services
# iAI — Intelligent Assistant (GitHub Copilot API)
# Get a token at: https://github.com/settings/tokens (needs "Copilot Requests" scope)
GH_TOKEN=
# OpenAI API key — enables TTS voice output in iAI (optional)
# OPENAI_API_KEY=your_openai_key
# ANTHROPIC_API_KEY=your_anthropic_key

# Database (if using future versions)
# DATABASE_URL=sqlite:./data/app.db

# Security
SESSION_SECRET=change_me_in_production
CORS_ORIGIN=http://localhost:3000

# Feature Flags
ENABLE_TELEPHONY=true
ENABLE_AI_CONFIG=true
ENABLE_COPILOT_CLI=true
ENABLE_EXTENSIONS=true

ENVEOF
        print_success ".env file created"
    else
        print_warning ".env file already exists (skipping)"
    fi
}

setup_gitignore() {
    print_section "Setting Up Git Configuration"
    
    if [ ! -f "$APP_DIR/.gitignore" ]; then
        cat > "$APP_DIR/.gitignore" << 'GITEOF'
# Dependencies
node_modules/
package-lock.json
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.env.local
.env.*.local

# Logs
logs/
*.log

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Temporary
tmp/
temp/
*.tmp

# Build
dist/
build/

# Test coverage
coverage/

# Node modules lock (use npm ci instead)
package-lock.json
GITEOF
        print_success ".gitignore created"
    fi
}

################################################################################
# DEPENDENCIES INSTALLATION
################################################################################

install_npm_dependencies() {
    print_section "Installing npm Dependencies"
    
    if [ ! -f "$APP_DIR/package.json" ]; then
        print_error "package.json not found in $APP_DIR"
        return 1
    fi
    
    cd "$APP_DIR"
    print_info "Installing packages from package.json..."
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "npm dependencies installed"
        return 0
    else
        print_error "Failed to install npm dependencies"
        return 1
    fi
}

################################################################################
# SERVER SETUP
################################################################################

setup_systemd_service() {
    print_section "Setting Up Systemd Service (Linux)"
    
    local os=$(detect_os)
    if [[ "$os" != "linux" && "$os" != "wsl" ]]; then
        print_info "Systemd service setup only available on Linux/WSL"
        return 0
    fi
    
    local service_file="/etc/systemd/system/claude-prompt-engine.service"
    local node_path=$(which node)
    
    if [ -f "$service_file" ]; then
        print_warning "Service file already exists at $service_file"
        return 0
    fi
    
    print_info "Creating systemd service file..."
    sudo tee "$service_file" > /dev/null << SERVICEEOF
[Unit]
Description=Claude Prompt Engine with GitHub Copilot CLI Integration
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR
ExecStart=$node_path $APP_DIR/server.js
Restart=always
RestartSec=10
StandardOutput=append:$APP_DIR/logs/stdout.log
StandardError=append:$APP_DIR/logs/stderr.log
Environment="NODE_ENV=production"
Environment="PORT=3000"

[Install]
WantedBy=multi-user.target
SERVICEEOF
    
    sudo systemctl daemon-reload
    print_success "Systemd service created"
    print_info "Enable with: sudo systemctl enable claude-prompt-engine"
    print_info "Start with: sudo systemctl start claude-prompt-engine"
}

setup_launchd_service() {
    print_section "Setting Up LaunchD Service (macOS)"
    
    local os=$(detect_os)
    if [[ "$os" != "macos" ]]; then
        print_info "LaunchD service setup only available on macOS"
        return 0
    fi
    
    local plist_file="$HOME/Library/LaunchAgents/com.claude-prompt-engine.plist"
    
    if [ -f "$plist_file" ]; then
        print_warning "LaunchAgent already exists at $plist_file"
        return 0
    fi
    
    mkdir -p "$HOME/Library/LaunchAgents"
    
    print_info "Creating LaunchAgent plist file..."
    cat > "$plist_file" << 'PLISTEOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.claude-prompt-engine</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>APP_DIR_PLACEHOLDER/server.js</string>
    </array>
    <key>WorkingDirectory</key>
    <string>APP_DIR_PLACEHOLDER</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>APP_DIR_PLACEHOLDER/logs/stdout.log</string>
    <key>StandardErrorPath</key>
    <string>APP_DIR_PLACEHOLDER/logs/stderr.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>NODE_ENV</key>
        <string>production</string>
        <key>PORT</key>
        <string>3000</string>
    </dict>
</dict>
</plist>
PLISTEOF
    
    # Replace placeholders
    sed -i '' "s|APP_DIR_PLACEHOLDER|$APP_DIR|g" "$plist_file"
    
    print_success "LaunchAgent created"
    print_info "Load with: launchctl load $plist_file"
}

################################################################################
# VERIFICATION
################################################################################

verify_installation() {
    print_section "Verifying Installation"
    
    local all_good=true
    
    # Check Node.js
    if check_node; then
        :
    else
        all_good=false
    fi
    
    # Check npm
    if check_npm; then
        :
    else
        all_good=false
    fi
    
    # Check project directory
    if [ -d "$APP_DIR" ]; then
        print_success "Project directory exists"
    else
        print_error "Project directory not found"
        all_good=false
    fi
    
    # Check package.json
    if [ -f "$APP_DIR/package.json" ]; then
        print_success "package.json found"
    else
        print_error "package.json not found"
        all_good=false
    fi
    
    # Check main server file
    if [ -f "$APP_DIR/server.js" ]; then
        print_success "server.js found"
    else
        print_error "server.js not found"
        all_good=false
    fi
    
    # Check core directories
    for dir in core memory cli configs public; do
        if [ -d "$APP_DIR/$dir" ]; then
            print_success "$dir directory exists"
        else
            print_warning "$dir directory not found"
        fi
    done
    
    if [ "$all_good" = true ]; then
        return 0
    else
        return 1
    fi
}

################################################################################
# INTERACTIVE SETUP
################################################################################

interactive_menu() {
    echo ""
    echo -e "${CYAN}Select installation type:${NC}"
    echo "1) Full Installation (All components)"
    echo "2) Development Setup (Includes dev tools)"
    echo "3) Production Setup (Minimal, optimized)"
    echo "4) Custom Installation"
    echo ""
    read -p "Enter choice [1-4]: " choice
    
    case $choice in
        1)
            INSTALL_TYPE="full"
            ;;
        2)
            INSTALL_TYPE="development"
            ;;
        3)
            INSTALL_TYPE="production"
            ;;
        4)
            INSTALL_TYPE="custom"
            ;;
        *)
            print_error "Invalid choice. Using full installation."
            INSTALL_TYPE="full"
            ;;
    esac
}

################################################################################
# MAIN INSTALLATION
################################################################################

main() {
    print_banner
    
    # Check if running with appropriate permissions
    if [[ "$EUID" -eq 0 ]]; then
        print_warning "Running as root. This is not recommended."
    fi
    
    # Ask for installation directory if not set
    if [ "$INSTALL_DIR" = "." ]; then
        read -p "Enter installation directory (default: current directory): " user_dir
        if [ -n "$user_dir" ]; then
            INSTALL_DIR="$user_dir"
        fi
    fi
    
    APP_DIR="$INSTALL_DIR/$PROJECT_NAME"
    
    print_info "Installation directory: $APP_DIR"
    print_info "Detected OS: $(detect_os)"
    
    # Interactive menu if not in automated mode
    if [ -z "$INSTALL_TYPE" ]; then
        interactive_menu
    fi
    
    echo ""
    print_section "Starting Installation ($INSTALL_TYPE mode)"
    
    # Check system requirements
    print_section "Checking System Requirements"
    if ! check_node; then
        print_warning "Node.js not found or version too old"
        read -p "Install Node.js now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_node_npm || exit 1
        else
            print_error "Node.js is required for installation"
            exit 1
        fi
    fi
    
    if ! check_npm; then
        print_error "npm is required"
        exit 1
    fi
    
    check_git || print_warning "Git is recommended but not required"
    
    # Setup phase
    if [ ! -d "$APP_DIR" ]; then
        mkdir -p "$APP_DIR"
        print_success "Project directory created"
    fi
    
    setup_project_structure
    setup_permissions
    setup_environment
    setup_gitignore
    
    # Installation phase
    if [ "$INSTALL_TYPE" = "full" ] || [ "$INSTALL_TYPE" = "development" ]; then
        install_optional_tools
    fi
    
    install_npm_dependencies || {
        print_error "Failed to install npm dependencies"
        exit 1
    }
    
    # Service setup
    case "$(detect_os)" in
        linux|wsl)
            read -p "Setup systemd service? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                setup_systemd_service
            fi
            ;;
        macos)
            read -p "Setup launchd service? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                setup_launchd_service
            fi
            ;;
    esac
    
    # Verification
    echo ""
    if verify_installation; then
        print_success "Installation completed successfully!"
    else
        print_warning "Installation completed with some issues"
    fi
    
    # Post-installation info
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}Installation Summary:${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "📁 Installation directory: $APP_DIR"
    echo "🚀 To start the server:"
    echo "   cd $APP_DIR"
    echo "   npm start"
    echo ""
    echo "🌐 Access the web interface:"
    echo "   http://localhost:3000"
    echo ""
    echo "📚 Documentation:"
    echo "   $(ls $APP_DIR/*.md 2>/dev/null | head -5 | xargs -I {} basename {})"
    echo ""
    echo "🔧 Copilot CLI Integration:"
    echo "   Click '🚀 Copilot CLI' tab in web interface"
    echo ""
    echo "📖 Read more:"
    echo "   cd $APP_DIR"
    echo "   cat QUICK_START.md"
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
}

# Run main installation
main "$@"
exit $?
