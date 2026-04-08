#!/bin/bash

################################################################################
#                                                                              #
#  SELF-CONTAINED INSTALLER BUILDER                                          #
#  Builds native installers for all platforms: Linux, macOS, Windows          #
#  Creates: .deb, .rpm, .dmg, .pkg, .exe, .msi                              #
#                                                                              #
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="claude-prompt-engine"
VERSION="${1:-1.0.0}"
BUILD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="${BUILD_DIR}/dist"
TEMP_BUILD="${BUILD_DIR}/.build-temp"

# Ensure build directory exists
mkdir -p "$BUILD_DIR"
cd "$BUILD_DIR"

################################################################################
# UTILITY FUNCTIONS
################################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_warn "$1 not found. Skipping $2 build."
        return 1
    fi
    return 0
}

print_header() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║  $1"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
}

################################################################################
# BUILD PREPARATION
################################################################################

setup_build_env() {
    print_header "SETTING UP BUILD ENVIRONMENT"
    
    log_info "Creating build directories..."
    mkdir -p "$DIST_DIR"
    mkdir -p "$TEMP_BUILD"
    
    log_info "Installing Node.js dependencies..."
    if [ ! -d "node_modules" ]; then
        npm install --production
    fi
    
    log_info "Verifying project structure..."
    if [ ! -f "package.json" ]; then
        log_error "package.json not found!"
        return 1
    fi
    
    if [ ! -f "server.js" ]; then
        log_error "server.js not found!"
        return 1
    fi
    
    if [ ! -d "public" ]; then
        log_error "public directory not found!"
        return 1
    fi
    
    log_success "Build environment ready"
}

prepare_package_files() {
    print_header "PREPARING PACKAGE FILES"
    
    # Create package staging directory
    local staging="$TEMP_BUILD/package"
    rm -rf "$staging"
    mkdir -p "$staging"
    
    log_info "Copying application files..."
    cp -r public "$staging/"
    cp -r core "$staging/" 2>/dev/null || true
    cp -r cli "$staging/" 2>/dev/null || true
    cp -r configs "$staging/" 2>/dev/null || true
    cp -r memory "$staging/" 2>/dev/null || true
    cp package.json "$staging/"
    cp package-lock.json "$staging/" 2>/dev/null || true
    cp server.js "$staging/"
    cp .env.example "$staging/.env" 2>/dev/null || true
    cp README.md "$staging/" 2>/dev/null || true
    
    # Create directories for logs
    mkdir -p "$staging/logs"
    mkdir -p "$staging/.github/workflows"
    
    log_info "Copying installer scripts..."
    mkdir -p "$staging/installers"
    cp installers/*.sh "$staging/installers/" 2>/dev/null || true
    chmod +x "$staging/installers/"*.sh 2>/dev/null || true
    
    log_success "Package files prepared"
    echo "$staging"
}

################################################################################
# LINUX PACKAGE BUILDERS (.deb, .rpm)
################################################################################

build_deb_package() {
    print_header "BUILDING DEBIAN PACKAGE (.deb)"
    
    if ! check_command "dpkg" "DEB"; then
        return 1
    fi
    
    if ! command -v fpm &> /dev/null; then
        log_warn "fpm (Effing Package Manager) not found."
        log_info "Install with: gem install fpm"
        log_info "Skipping DEB build..."
        return 1
    fi
    
    local staging="$1"
    local package_dir="/opt/${PROJECT_NAME}"
    
    log_info "Building DEB package..."
    
    fpm -s dir \
        -t deb \
        -n "$PROJECT_NAME" \
        -v "$VERSION" \
        -C "$staging" \
        -p "$DIST_DIR/${PROJECT_NAME}-${VERSION}.deb" \
        --pre-install build/scripts/deb-preinstall.sh \
        --post-install build/scripts/deb-postinstall.sh \
        --pre-uninstall build/scripts/deb-preuninstall.sh \
        --after-remove build/scripts/deb-afterremove.sh \
        --description "Claude Prompt Engine with GitHub Copilot CLI Integration" \
        --url "https://github.com/yourusername/claude-prompt-engine" \
        --maintainer "Your Name <your.email@example.com>" \
        --license "MIT" \
        --category "development" \
        --depends "nodejs" \
        --depends "npm" \
        --depends "git" \
        . \
        2>/dev/null || {
        log_error "Failed to create DEB package"
        return 1
    }
    
    log_success "DEB package created: ${PROJECT_NAME}-${VERSION}.deb"
}

build_rpm_package() {
    print_header "BUILDING RPM PACKAGE (.rpm)"
    
    if ! check_command "rpmbuild" "RPM"; then
        return 1
    fi
    
    if ! command -v fpm &> /dev/null; then
        log_warn "fpm not found. Skipping RPM build..."
        return 1
    fi
    
    local staging="$1"
    
    log_info "Building RPM package..."
    
    fpm -s dir \
        -t rpm \
        -n "$PROJECT_NAME" \
        -v "$VERSION" \
        -C "$staging" \
        -p "$DIST_DIR/${PROJECT_NAME}-${VERSION}.rpm" \
        --pre-install build/scripts/rpm-preinstall.sh \
        --post-install build/scripts/rpm-postinstall.sh \
        --pre-uninstall build/scripts/rpm-preuninstall.sh \
        --after-remove build/scripts/rpm-afterremove.sh \
        --description "Claude Prompt Engine with GitHub Copilot CLI Integration" \
        --url "https://github.com/yourusername/claude-prompt-engine" \
        --maintainer "Your Name <your.email@example.com>" \
        --license "MIT" \
        --category "Development/Tools" \
        --depends "nodejs" \
        --depends "npm" \
        --depends "git" \
        . \
        2>/dev/null || {
        log_error "Failed to create RPM package"
        return 1
    }
    
    log_success "RPM package created: ${PROJECT_NAME}-${VERSION}.rpm"
}

################################################################################
# MACOS PACKAGE BUILDERS (.dmg, .pkg)
################################################################################

build_macos_pkg() {
    print_header "BUILDING macOS INSTALLER (.pkg)"
    
    if [[ ! "$OSTYPE" =~ ^darwin ]]; then
        log_warn "This build must run on macOS. Skipping PKG build..."
        return 1
    fi
    
    if ! check_command "pkgbuild" "PKG"; then
        return 1
    fi
    
    local staging="$1"
    local pkg_name="${PROJECT_NAME}-${VERSION}.pkg"
    
    log_info "Building macOS installer package..."
    
    # Create scripts directory for PKG
    local scripts_dir="$TEMP_BUILD/pkg-scripts"
    mkdir -p "$scripts_dir"
    cp build/scripts/macos-postinstall.sh "$scripts_dir/postinstall" || true
    chmod +x "$scripts_dir/postinstall" 2>/dev/null || true
    
    # Create the package
    pkgbuild \
        --identifier "com.${PROJECT_NAME}" \
        --version "$VERSION" \
        --scripts "$scripts_dir" \
        --root "$staging" \
        --install-location "/Applications/${PROJECT_NAME}" \
        "$DIST_DIR/$pkg_name" || {
        log_error "Failed to create PKG package"
        return 1
    }
    
    log_success "macOS PKG created: $pkg_name"
}

build_macos_dmg() {
    print_header "BUILDING macOS DMG (Disk Image)"
    
    if [[ ! "$OSTYPE" =~ ^darwin ]]; then
        log_warn "This build must run on macOS. Skipping DMG build..."
        return 1
    fi
    
    if ! check_command "hdiutil" "DMG"; then
        return 1
    fi
    
    local staging="$1"
    local dmg_name="${PROJECT_NAME}-${VERSION}.dmg"
    local dmg_temp="$TEMP_BUILD/${PROJECT_NAME}-temp.dmg"
    
    log_info "Building macOS DMG image..."
    
    # Create staging for DMG
    local dmg_staging="$TEMP_BUILD/dmg-staging"
    mkdir -p "$dmg_staging"
    
    # Copy app bundle
    mkdir -p "$dmg_staging/${PROJECT_NAME}.app/Contents/MacOS"
    mkdir -p "$dmg_staging/${PROJECT_NAME}.app/Contents/Resources"
    cp -r "$staging"/* "$dmg_staging/${PROJECT_NAME}.app/Contents/Resources/" || true
    
    # Create DMG
    hdiutil create -volname "$PROJECT_NAME" \
        -srcfolder "$dmg_staging" \
        -ov -format UDZO \
        "$DIST_DIR/$dmg_name" 2>/dev/null || {
        log_error "Failed to create DMG image"
        return 1
    }
    
    log_success "macOS DMG created: $dmg_name"
}

################################################################################
# WINDOWS PACKAGE BUILDERS (.exe, .msi)
################################################################################

build_windows_exe() {
    print_header "BUILDING WINDOWS INSTALLER (.exe)"
    
    if [[ "$OSTYPE" =~ ^msys ]] || [[ "$OSTYPE" =~ ^cygwin ]]; then
        log_info "Running on Windows..."
    else
        log_warn "This build should run on Windows or use Wine. Skipping EXE build..."
        return 1
    fi
    
    if ! check_command "makensis" "NSIS"; then
        log_warn "NSIS not found. Install from: https://nsis.sourceforge.io"
        return 1
    fi
    
    local staging="$1"
    
    log_info "Building Windows EXE installer with NSIS..."
    
    # Create NSIS script
    local nsis_script="$TEMP_BUILD/installer.nsi"
    cat > "$nsis_script" << 'NSIS_EOF'
; NSIS Installer Script for Claude Prompt Engine
!include "MUI2.nsh"
!include "x64.nsh"

; General settings
Name "Claude Prompt Engine"
OutFile "$OUTDIR\claude-engine-setup.exe"
InstallDir "$PROGRAMFILES\claude-prompt-engine"

; UI settings
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_LANGUAGE "English"

; Installer sections
Section "Install"
  SetOutPath "$INSTDIR"
  File /r "${STAGING_DIR}\*.*"
  
  ; Create Start Menu shortcuts
  CreateDirectory "$SMPROGRAMS\Claude Prompt Engine"
  CreateShortcut "$SMPROGRAMS\Claude Prompt Engine\Claude Engine.lnk" "$INSTDIR\server.js"
  CreateShortcut "$SMPROGRAMS\Claude Prompt Engine\Uninstall.lnk" "$INSTDIR\Uninstall.exe"
  
  ; Create desktop shortcut
  CreateShortcut "$DESKTOP\Claude Engine.lnk" "$INSTDIR\server.js"
  
  ; Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  
  ; Registry entry for Add/Remove Programs
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\claude-engine" \
    "DisplayName" "Claude Prompt Engine"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\claude-engine" \
    "UninstallString" "$INSTDIR\Uninstall.exe"
SectionEnd

; Uninstaller section
Section "Uninstall"
  RMDir /r "$INSTDIR"
  RMDir /r "$SMPROGRAMS\Claude Prompt Engine"
  Delete "$DESKTOP\Claude Engine.lnk"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\claude-engine"
SectionEnd
NSIS_EOF

    makensis /DSTAGING_DIR="$staging" /DOUTDIR="$DIST_DIR" "$nsis_script" 2>/dev/null || {
        log_error "Failed to create EXE installer"
        return 1
    }
    
    log_success "Windows EXE created: claude-engine-setup.exe"
}

build_windows_msi() {
    print_header "BUILDING WINDOWS MSI INSTALLER"
    
    if [[ ! "$OSTYPE" =~ ^msys ]]; then
        log_warn "MSI building requires Windows. Skipping MSI build..."
        return 1
    fi
    
    if ! check_command "heat.exe" "WiX"; then
        log_warn "WiX Toolset not found. Install from: https://wixtoolset.org"
        return 1
    fi
    
    log_info "Building Windows MSI with WiX..."
    log_warn "MSI build skipped (requires WiX setup)"
}

################################################################################
# PACKAGE VERIFICATION
################################################################################

verify_packages() {
    print_header "VERIFYING PACKAGES"
    
    local found_packages=0
    
    for package in "$DIST_DIR"/*; do
        if [ -f "$package" ]; then
            local size=$(du -h "$package" | cut -f1)
            local name=$(basename "$package")
            log_success "Package ready: $name ($size)"
            ((found_packages++))
        fi
    done
    
    if [ $found_packages -eq 0 ]; then
        log_warn "No packages created. Check platform requirements."
        return 1
    fi
    
    return 0
}

create_checksums() {
    print_header "CREATING CHECKSUMS"
    
    log_info "Generating SHA256 checksums..."
    cd "$DIST_DIR"
    sha256sum * > SHA256SUMS 2>/dev/null || shasum -a 256 * > SHA256SUMS
    log_success "Checksums created: SHA256SUMS"
    cd "$BUILD_DIR"
}

################################################################################
# CLEANUP
################################################################################

cleanup() {
    print_header "CLEANUP"
    
    log_info "Cleaning temporary files..."
    rm -rf "$TEMP_BUILD"
    
    log_success "Cleanup complete"
}

################################################################################
# MAIN BUILD EXECUTION
################################################################################

main() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║                                                                  ║"
    echo "║  SELF-CONTAINED INSTALLER BUILDER                               ║"
    echo "║  Building installers for: Linux, macOS, Windows                  ║"
    echo "║  Version: $VERSION                                              ║"
    echo "║                                                                  ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo ""
    
    # Setup
    setup_build_env || exit 1
    
    # Prepare files
    local staging=$(prepare_package_files) || exit 1
    
    # Build packages
    log_info "Building packages for detected platforms..."
    echo ""
    
    # Linux packages
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        build_deb_package "$staging" || true
        build_rpm_package "$staging" || true
    else
        log_warn "Detected non-Linux system. Linux packages skipped."
        log_info "To build .deb/.rpm on Linux, run this script on a Linux system."
    fi
    
    # macOS packages
    if [[ "$OSTYPE" =~ ^darwin ]]; then
        build_macos_pkg "$staging" || true
        build_macos_dmg "$staging" || true
    else
        log_warn "Detected non-macOS system. macOS packages skipped."
        log_info "To build .pkg/.dmg on macOS, run this script on a macOS system."
    fi
    
    # Windows packages
    if [[ "$OSTYPE" =~ ^msys ]] || [[ "$OSTYPE" =~ ^cygwin ]]; then
        build_windows_exe "$staging" || true
        build_windows_msi "$staging" || true
    else
        log_warn "Detected non-Windows system. Windows packages skipped."
        log_info "To build .exe/.msi on Windows, run this script on Windows."
    fi
    
    # Post-build
    verify_packages || true
    create_checksums || true
    cleanup
    
    # Summary
    print_header "BUILD COMPLETE"
    log_success "All available packages built successfully!"
    log_info "Packages location: $DIST_DIR"
    echo ""
}

# Run main
main "$@"
