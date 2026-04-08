#!/bin/bash

################################################################################
#                                                                              #
#     Claude Prompt Engine - macOS Installation Script                        #
#     Supports: macOS 10.13+                                                  #
#     Created with GitHub Copilot                                             #
#                                                                              #
################################################################################

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
INSTALL_DIR="${INSTALL_DIR:-$HOME/claude-prompt-engine}"
PROJECT_NAME="claude-prompt-engine"
APP_DIR="$INSTALL_DIR/$PROJECT_NAME"

################################################################################
# UTILITY FUNCTIONS
################################################################################

print_banner() {
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║  Claude Prompt Engine - macOS Installation Script         ║"
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
# REQUIREMENT CHECKS
################################################################################

check_homebrew() {
    if ! command -v brew &> /dev/null; then
        print_error "Homebrew is not installed"
        print_info "Install from: https://brew.sh"
        return 1
    fi
    
    print_success "Homebrew $(brew --version | head -1)"
    return 0
}

check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        return 1
    fi
    
    print_success "Node.js v$(node -v | cut -d'v' -f2)"
    return 0
}

check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        return 1
    fi
    
    print_success "npm v$(npm -v)"
    return 0
}

################################################################################
# INSTALLATION FUNCTIONS
################################################################################

install_dependencies() {
    print_section "Installing Dependencies"
    
    if ! check_homebrew; then
        print_error "Homebrew is required"
        return 1
    fi
    
    # Install Node.js if not present
    if ! check_node; then
        print_info "Installing Node.js..."
        brew install node
        check_node
    fi
    
    # Ensure npm is available
    check_npm || return 1
    
    # Install Git if not present
    if ! command -v git &> /dev/null; then
        print_info "Installing Git..."
        brew install git
    fi
    
    # Install GitHub CLI
    if ! command -v gh &> /dev/null; then
        print_info "Installing GitHub CLI..."
        brew install gh
    fi
    
    # Install Copilot extension
    if command -v gh &> /dev/null; then
        print_info "Installing Copilot extension..."
        gh extension install github/gh-copilot 2>/dev/null || print_warning "Copilot extension may already be installed"
    fi
    
    print_success "All dependencies installed"
}

setup_project_structure() {
    print_section "Setting Up Project Structure"
    
    mkdir -p "$APP_DIR/core"
    mkdir -p "$APP_DIR/memory"
    mkdir -p "$APP_DIR/cli"
    mkdir -p "$APP_DIR/configs"
    mkdir -p "$APP_DIR/public"
    mkdir -p "$APP_DIR/logs"
    mkdir -p "$APP_DIR/.github/workflows"
    
    print_success "Project directories created"
}

setup_permissions() {
    print_section "Setting Up Permissions"
    
    chmod +x "$APP_DIR/"*.sh 2>/dev/null || true
    chmod +x "$APP_DIR/installers/"*.sh 2>/dev/null || true
    chmod 755 "$APP_DIR/logs" 2>/dev/null || true
    
    print_success "Permissions configured"
}

setup_environment() {
    print_section "Setting Up Environment"
    
    if [ ! -f "$APP_DIR/.env" ]; then
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
# GITHUB_TOKEN=your_github_token

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

install_npm_dependencies() {
    print_section "Installing npm Dependencies"
    
    if [ ! -f "$APP_DIR/package.json" ]; then
        print_error "package.json not found"
        return 1
    fi
    
    cd "$APP_DIR"
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "npm dependencies installed"
        return 0
    else
        print_error "Failed to install npm dependencies"
        return 1
    fi
}

setup_launchd() {
    print_section "Setting Up LaunchAgent (Optional)"
    
    read -p "Setup automatic startup with LaunchAgent? (y/n) " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Skipping LaunchAgent setup"
        return 0
    fi
    
    local plist_file="$HOME/Library/LaunchAgents/com.claude-prompt-engine.plist"
    local node_path=$(which node)
    
    mkdir -p "$HOME/Library/LaunchAgents"
    
    cat > "$plist_file" << PLISTEOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.claude-prompt-engine</string>
    <key>ProgramArguments</key>
    <array>
        <string>$node_path</string>
        <string>$APP_DIR/server.js</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$APP_DIR</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$APP_DIR/logs/stdout.log</string>
    <key>StandardErrorPath</key>
    <string>$APP_DIR/logs/stderr.log</string>
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
    
    print_success "LaunchAgent created"
    print_info "Load with: launchctl load $plist_file"
    print_info "Unload with: launchctl unload $plist_file"
}

create_zsh_aliases() {
    print_section "Setting Up Shell Aliases"
    
    local zshrc="$HOME/.zshrc"
    local bashrc="$HOME/.bashrc"
    
    # Create aliases snippet
    local aliases_content="
# Claude Prompt Engine aliases
alias claude-start='cd $APP_DIR && npm start'
alias claude-logs='tail -f $APP_DIR/logs/app.log'
alias claude-edit='code $APP_DIR'
alias claude-dir='cd $APP_DIR'
"
    
    # Add to zsh if available
    if [ -f "$zshrc" ]; then
        if ! grep -q "claude-start" "$zshrc"; then
            echo "$aliases_content" >> "$zshrc"
            print_success "Added aliases to ~/.zshrc"
        fi
    fi
    
    # Add to bash if available
    if [ -f "$bashrc" ]; then
        if ! grep -q "claude-start" "$bashrc"; then
            echo "$aliases_content" >> "$bashrc"
            print_success "Added aliases to ~/.bashrc"
        fi
    fi
}

create_app_bundle() {
    print_section "Creating App Bundle (Optional)"
    
    read -p "Create macOS app bundle? (y/n) " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        return 0
    fi
    
    local app_bundle="$HOME/Applications/Claude Prompt Engine.app"
    local node_path=$(which node)
    
    # Create bundle structure
    mkdir -p "$app_bundle/Contents/MacOS"
    mkdir -p "$app_bundle/Contents/Resources"
    
    # Create launcher script
    cat > "$app_bundle/Contents/MacOS/launcher.sh" << 'LAUNCHEREOF'
#!/bin/bash
cd "$APP_DIR"
npm start
LAUNCHEREOF
    
    chmod +x "$app_bundle/Contents/MacOS/launcher.sh"
    
    # Create plist
    cat > "$app_bundle/Contents/Info.plist" << 'PLISTEOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>launcher.sh</string>
    <key>CFBundleName</key>
    <string>Claude Prompt Engine</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
    <key>CFBundleIdentifier</key>
    <string>com.claude-prompt-engine</string>
</dict>
</plist>
PLISTEOF
    
    print_success "App bundle created at $app_bundle"
}

verify_installation() {
    print_section "Verifying Installation"
    
    local all_good=true
    
    check_node || all_good=false
    check_npm || all_good=false
    
    if [ -d "$APP_DIR" ]; then
        print_success "Project directory exists"
    else
        print_error "Project directory not found"
        all_good=false
    fi
    
    if [ -f "$APP_DIR/package.json" ]; then
        print_success "package.json found"
    else
        print_error "package.json not found"
        all_good=false
    fi
    
    if [ $all_good = true ]; then
        return 0
    else
        return 1
    fi
}

################################################################################
# MAIN INSTALLATION
################################################################################

main() {
    print_banner
    
    print_info "Installation directory: $APP_DIR"
    
    # Check and install dependencies
    if ! check_homebrew; then
        print_error "Homebrew is required for installation"
        exit 1
    fi
    
    install_dependencies
    
    # Create project structure
    if [ ! -d "$APP_DIR" ]; then
        mkdir -p "$APP_DIR"
        print_success "Installation directory created"
    fi
    
    setup_project_structure
    setup_permissions
    setup_environment
    install_npm_dependencies || exit 1
    
    # Optional setup
    setup_launchd
    create_zsh_aliases
    create_app_bundle
    
    # Verify
    if verify_installation; then
        print_success "Installation completed successfully!"
    else
        print_warning "Installation completed with some issues"
    fi
    
    # Summary
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
    echo "⚡ Quick commands:"
    echo "   claude-start  : Start the server"
    echo "   claude-logs   : View logs"
    echo "   claude-edit   : Open in VS Code"
    echo ""
    echo "🔗 Link GitHub Copilot:"
    echo "   Click '🔗 Link Copilot Account' in web interface"
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
}

main "$@"
exit $?
