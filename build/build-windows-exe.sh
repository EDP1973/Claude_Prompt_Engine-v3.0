#!/bin/bash

################################################################################
#  WINDOWS EXE INSTALLER BUILDER
#  Creates .exe installer using NSIS (Nullsoft Scriptable Install System)
#  For systems with makensis installed
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_NAME="claude-prompt-engine"
VERSION="${1:-1.0.0}"
BUILD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="${BUILD_DIR}/dist"
TEMP_BUILD="${BUILD_DIR}/.build-windows"

log_info() { echo -e "${BLUE}[INFO]${NC} $1" >&2; }
log_success() { echo -e "${GREEN}[✓]${NC} $1" >&2; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1" >&2; }
log_error() { echo -e "${RED}[✗]${NC} $1" >&2; }

print_header() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║  $1"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
}

################################################################################
# CHECK PREREQUISITES
################################################################################

check_prerequisites() {
    print_header "CHECKING PREREQUISITES"
    
    if ! command -v makensis &> /dev/null; then
        log_error "makensis (NSIS) not found"
        log_info "Install NSIS: apt-get install nsis (Linux cross-compilation)"
        log_info "Or install on Windows: https://nsis.sourceforge.io/"
        return 1
    fi
    
    log_success "makensis found"
    return 0
}

################################################################################
# PREPARE FILES
################################################################################

prepare_windows_files() {
    print_header "PREPARING WINDOWS APPLICATION FILES"
    
    local staging="${TEMP_BUILD}/app-files"
    rm -rf "$staging"
    mkdir -p "$staging"
    
    log_info "Copying application files..."
    cp -r public "$staging/" 2>/dev/null || true
    cp -r core "$staging/" 2>/dev/null || true
    cp -r cli "$staging/" 2>/dev/null || true
    cp -r configs "$staging/" 2>/dev/null || true
    cp -r memory "$staging/" 2>/dev/null || true
    cp package.json "$staging/" || true
    cp package-lock.json "$staging/" 2>/dev/null || true
    cp server.js "$staging/" || true
    cp README.md "$staging/" 2>/dev/null || true
    
    mkdir -p "$staging/logs"
    
    log_success "Application files prepared"
    echo "$staging"
}

################################################################################
# CREATE NSIS INSTALLER SCRIPT
################################################################################

create_nsis_script() {
    print_header "CREATING NSIS INSTALLER SCRIPT"
    
    local app_dir="$1"
    local nsis_script="${TEMP_BUILD}/installer.nsi"
    
    log_info "Generating installer.nsi..."
    
    cat > "$nsis_script" << 'NSISEOF'
;------------------------------
; Claude Prompt Engine Installer
;------------------------------

!include "MUI2.nsh"
!include "x64.nsh"

; Configuration
Name "Claude Prompt Engine"
OutFile "claude-prompt-engine-1.0.0-installer.exe"
InstallDir "$PROGRAMFILES\Claude Prompt Engine"
InstallDirRegKey HKLM "Software\Claude Prompt Engine" "InstallDir"

; Variables
Var StartMenuFolder
Var NodePath

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_STARTMENU "Claude Prompt Engine" $StartMenuFolder
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_LANGUAGE "English"

;------------------------------
; Installer Section
;------------------------------

Section "Install"
    SetOutPath "$INSTDIR"
    
    ; Display status
    DetailPrint "Installing Claude Prompt Engine v1.0.0..."
    
    ; Copy application files
    File /r "..\app-files\*.*"
    
    ; Create uninstaller
    WriteUninstaller "$INSTDIR\uninstall.exe"
    
    ; Register in Add/Remove Programs
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ClaudePromptEngine" \
        "DisplayName" "Claude Prompt Engine"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ClaudePromptEngine" \
        "UninstallString" "$INSTDIR\uninstall.exe"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ClaudePromptEngine" \
        "DisplayVersion" "1.0.0"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ClaudePromptEngine" \
        "DisplayIcon" "$INSTDIR\favicon.ico"
    
    ; Install Node.js dependencies
    DetailPrint "Installing Node.js dependencies..."
    ExecWait 'cmd.exe /c "cd /d $INSTDIR && npm install --production"'
    
    ; Create shortcuts
    CreateDirectory "$SMPROGRAMS\$StartMenuFolder"
    CreateShortCut "$SMPROGRAMS\$StartMenuFolder\Claude Prompt Engine.lnk" \
        "$INSTDIR\start.bat" "" "$INSTDIR\favicon.ico"
    CreateShortCut "$SMPROGRAMS\$StartMenuFolder\Uninstall.lnk" \
        "$INSTDIR\uninstall.exe"
    
    ; Create desktop shortcut
    CreateShortCut "$DESKTOP\Claude Prompt Engine.lnk" \
        "$INSTDIR\start.bat" "" "$INSTDIR\favicon.ico"
    
    ; Create start script
    FileOpen $0 "$INSTDIR\start.bat" w
    FileWrite $0 "@echo off$\r$\n"
    FileWrite $0 "cd /d %~dp0$\r$\n"
    FileWrite $0 "set NODE_ENV=production$\r$\n"
    FileWrite $0 "set PORT=3000$\r$\n"
    FileWrite $0 "node server.js$\r$\n"
    FileClose $0
    
    ; Create launcher batch file
    FileOpen $0 "$INSTDIR\launcher.bat" w
    FileWrite $0 "@echo off$\r$\n"
    FileWrite $0 "cd /d %~dp0$\r$\n"
    FileWrite $0 "echo Claude Prompt Engine starting...$\r$\n"
    FileWrite $0 "echo Wait a moment and then open http://localhost:3000 in your browser$\r$\n"
    FileWrite $0 "start http://localhost:3000$\r$\n"
    FileWrite $0 "node server.js$\r$\n"
    FileWrite $0 "pause$\r$\n"
    FileClose $0
    
    DetailPrint "Installation complete!"
SectionEnd

;------------------------------
; Uninstaller Section
;------------------------------

Section "Uninstall"
    DetailPrint "Uninstalling Claude Prompt Engine..."
    
    ; Stop running instance
    ExecWait 'taskkill /IM node.exe /F'
    
    ; Remove installation directory
    RMDir /r "$INSTDIR"
    
    ; Remove Start Menu shortcuts
    RMDir /r "$SMPROGRAMS\$StartMenuFolder"
    
    ; Remove desktop shortcut
    Delete "$DESKTOP\Claude Prompt Engine.lnk"
    
    ; Remove registry entries
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ClaudePromptEngine"
    
    DetailPrint "Uninstallation complete!"
SectionEnd
NSISEOF
    
    log_success "NSIS script created: $nsis_script"
    echo "$nsis_script"
}

################################################################################
# BUILD EXE INSTALLER
################################################################################

build_exe_installer() {
    print_header "BUILDING EXE INSTALLER"
    
    local nsis_script="$1"
    local exe_file="${DIST_DIR}/claude-prompt-engine-${VERSION}-installer.exe"
    
    log_info "Compiling NSIS script..."
    
    if makensis "$nsis_script" 2>&1 | grep -v "^$"; then
        if [ -f "claude-prompt-engine-${VERSION}-installer.exe" ]; then
            mv "claude-prompt-engine-${VERSION}-installer.exe" "$exe_file"
            local size_mb=$(du -h "$exe_file" | cut -f1)
            log_success "EXE installer created: ${size_mb}"
            return 0
        fi
    fi
    
    log_error "Failed to create EXE installer"
    return 1
}

################################################################################
# MAIN
################################################################################

main() {
    print_header "WINDOWS EXE INSTALLER BUILDER"
    
    mkdir -p "$DIST_DIR"
    mkdir -p "$TEMP_BUILD"
    
    # Check prerequisites
    if ! check_prerequisites; then
        log_warn "NSIS not available - EXE installer skipped"
        log_info "To build on Windows, install NSIS: https://nsis.sourceforge.io/"
        return 0
    fi
    
    # Prepare files
    local app_dir=$(prepare_windows_files) || exit 1
    
    # Create NSIS script
    local nsis_script=$(create_nsis_script "$app_dir") || exit 1
    
    # Build EXE
    cd "$TEMP_BUILD"
    build_exe_installer "$nsis_script" || true
    
    # Cleanup
    log_info "Cleaning up temporary files..."
    cd "$BUILD_DIR"
    rm -rf "$TEMP_BUILD"
    
    log_success "Windows EXE builder complete"
}

main "$@"
