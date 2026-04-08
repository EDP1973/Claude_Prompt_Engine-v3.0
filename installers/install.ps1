#Requires -Version 5.0

################################################################################
#                                                                              #
#     Claude Prompt Engine - Windows PowerShell Installation Script           #
#     Supports: Windows 10+, Windows Server 2016+                             #
#     Created with GitHub Copilot                                             #
#                                                                              #
################################################################################

param(
    [string]$InstallDir = "$env:USERPROFILE\claude-prompt-engine",
    [string]$InstallType = "full"
)

# Color codes
$Colors = @{
    'Green'  = 10
    'Red'    = 12
    'Yellow' = 14
    'Cyan'   = 11
    'Blue'   = 9
}

################################################################################
# UTILITY FUNCTIONS
################################################################################

function Write-Banner {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                                                            ║" -ForegroundColor Cyan
    Write-Host "║  Claude Prompt Engine - Windows Installation Script       ║" -ForegroundColor Cyan
    Write-Host "║  GitHub Copilot CLI Integration                           ║" -ForegroundColor Cyan
    Write-Host "║                                                            ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    Write-Host "✓ $Title" -ForegroundColor Blue
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Cyan
}

################################################################################
# REQUIREMENT CHECKS
################################################################################

function Test-NodeInstalled {
    try {
        $version = node --version
        Write-Success "Node.js $version installed"
        return $true
    } catch {
        Write-Error "Node.js is not installed"
        return $false
    }
}

function Test-NPMInstalled {
    try {
        $version = npm --version
        Write-Success "npm v$version installed"
        return $true
    } catch {
        Write-Error "npm is not installed"
        return $false
    }
}

function Test-GitInstalled {
    try {
        $version = git --version
        Write-Success "Git installed ($version)"
        return $true
    } catch {
        Write-Warning "Git is not installed (optional)"
        return $false
    }
}

################################################################################
# INSTALLATION FUNCTIONS
################################################################################

function Install-Node {
    Write-Section "Installing Node.js"
    
    Write-Info "Downloading Node.js installer..."
    
    # Determine Windows architecture
    $arch = if ([Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" }
    $nodeUrl = "https://nodejs.org/dist/v18.16.0/node-v18.16.0-win-$arch.msi"
    
    $installerPath = "$env:TEMP\node-installer.msi"
    
    # Download
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        (New-Object System.Net.WebClient).DownloadFile($nodeUrl, $installerPath)
        Write-Success "Downloaded Node.js installer"
    } catch {
        Write-Error "Failed to download Node.js: $_"
        return $false
    }
    
    # Install
    Write-Info "Running Node.js installer..."
    $process = Start-Process -FilePath $installerPath -ArgumentList "/quiet" -Wait -PassThru
    
    if ($process.ExitCode -eq 0) {
        Write-Success "Node.js installed successfully"
        Remove-Item $installerPath -Force
        return $true
    } else {
        Write-Error "Node.js installation failed"
        return $false
    }
}

function Setup-ProjectStructure {
    Write-Section "Setting Up Project Structure"
    
    # Create directories
    $dirs = @(
        "$InstallDir\core",
        "$InstallDir\memory",
        "$InstallDir\cli",
        "$InstallDir\configs",
        "$InstallDir\public",
        "$InstallDir\logs",
        "$InstallDir\.github\workflows"
    )
    
    foreach ($dir in $dirs) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
    }
    
    Write-Success "Project directories created"
}

function Setup-Environment {
    Write-Section "Setting Up Environment"
    
    $envFile = "$InstallDir\.env"
    
    if (-not (Test-Path $envFile)) {
        Write-Info "Creating .env file..."
        
        $envContent = @"
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
# OPENAI_API_KEY=your_openai_key
# ANTHROPIC_API_KEY=your_anthropic_key

# Security
SESSION_SECRET=change_me_in_production
CORS_ORIGIN=http://localhost:3000

# Feature Flags
ENABLE_TELEPHONY=true
ENABLE_AI_CONFIG=true
ENABLE_COPILOT_CLI=true
ENABLE_EXTENSIONS=true
"@
        
        Set-Content -Path $envFile -Value $envContent -Encoding UTF8
        Write-Success ".env file created"
    } else {
        Write-Warning ".env file already exists (skipping)"
    }
}

function Setup-Gitignore {
    Write-Section "Setting Up Git Configuration"
    
    $gitignoreFile = "$InstallDir\.gitignore"
    
    if (-not (Test-Path $gitignoreFile)) {
        $gitignoreContent = @"
# Dependencies
node_modules/
package-lock.json
npm-debug.log*

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

# Temporary
tmp/
temp/
*.tmp

# Build
dist/
build/

# Test coverage
coverage/
"@
        
        Set-Content -Path $gitignoreFile -Value $gitignoreContent -Encoding UTF8
        Write-Success ".gitignore created"
    }
}

function Install-Dependencies {
    Write-Section "Installing npm Dependencies"
    
    if (-not (Test-Path "$InstallDir\package.json")) {
        Write-Error "package.json not found"
        return $false
    }
    
    Push-Location $InstallDir
    
    Write-Info "Installing npm packages..."
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "npm dependencies installed"
        Pop-Location
        return $true
    } else {
        Write-Error "Failed to install npm dependencies"
        Pop-Location
        return $false
    }
}

function Create-DesktopShortcut {
    Write-Section "Creating Desktop Shortcuts"
    
    try {
        $WshShell = New-Object -ComObject WScript.Shell
        $DesktopPath = [System.IO.Path]::Combine($env:USERPROFILE, "Desktop")
        
        # Start Server shortcut
        $startShortcutPath = Join-Path $DesktopPath "Claude Prompt Engine.lnk"
        $startTarget = "cmd.exe"
        $startArgs = "/k cd /d $InstallDir && npm start"
        
        $shortcut = $WshShell.CreateShortcut($startShortcutPath)
        $shortcut.TargetPath = $startTarget
        $shortcut.Arguments = $startArgs
        $shortcut.WorkingDirectory = $InstallDir
        $shortcut.Description = "Start Claude Prompt Engine server"
        $shortcut.IconLocation = "C:\Windows\System32\cmd.exe,0"
        $shortcut.Save()
        
        Write-Success "Desktop shortcut created"
    } catch {
        Write-Warning "Could not create desktop shortcut: $_"
    }
}

function Create-StartMenuShortcut {
    Write-Section "Creating Start Menu Shortcut"
    
    try {
        $WshShell = New-Object -ComObject WScript.Shell
        $StartMenuPath = [System.IO.Path]::Combine($env:APPDATA, "Microsoft\Windows\Start Menu\Programs")
        
        $shortcutPath = Join-Path $StartMenuPath "Claude Prompt Engine.lnk"
        $target = "cmd.exe"
        $args = "/k cd /d $InstallDir && npm start"
        
        $shortcut = $WshShell.CreateShortcut($shortcutPath)
        $shortcut.TargetPath = $target
        $shortcut.Arguments = $args
        $shortcut.WorkingDirectory = $InstallDir
        $shortcut.Description = "Claude Prompt Engine Server"
        $shortcut.Save()
        
        Write-Success "Start Menu shortcut created"
    } catch {
        Write-Warning "Could not create Start Menu shortcut: $_"
    }
}

function Create-PowerShellProfile {
    Write-Section "Setting Up PowerShell Profile"
    
    $profileDir = Split-Path $profile
    if (-not (Test-Path $profileDir)) {
        New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
    }
    
    $profileContent = @"
# Claude Prompt Engine shortcuts
function Start-ClaudeEngine {
    Push-Location '$InstallDir'
    npm start
    Pop-Location
}

function Edit-ClaudeEngine {
    code '$InstallDir'
}

function View-ClaudeLogs {
    Get-Content '$InstallDir\logs\app.log' -Tail 50 -Wait
}

Set-Alias -Name claude-start -Value Start-ClaudeEngine
Set-Alias -Name claude-edit -Value Edit-ClaudeEngine
Set-Alias -Name claude-logs -Value View-ClaudeLogs

Write-Host "Claude Prompt Engine shortcuts available:" -ForegroundColor Green
Write-Host "  claude-start  : Start the server"
Write-Host "  claude-edit   : Open in VS Code"
Write-Host "  claude-logs   : View recent logs"
"@
    
    if (-not (Test-Path $profile)) {
        Set-Content -Path $profile -Value $profileContent -Encoding UTF8
        Write-Success "PowerShell profile created"
    } else {
        Write-Warning "PowerShell profile already exists (not overwriting)"
    }
}

################################################################################
# MAIN INSTALLATION
################################################################################

function Start-Installation {
    Write-Banner
    
    # Check requirements
    Write-Section "Checking System Requirements"
    
    if (-not (Test-NodeInstalled)) {
        Write-Info "Node.js is required for installation"
        $response = Read-Host "Install Node.js now? (y/n)"
        
        if ($response -eq 'y') {
            if (-not (Install-Node)) {
                Write-Error "Installation requires Node.js"
                exit 1
            }
        } else {
            Write-Error "Node.js is required"
            exit 1
        }
    }
    
    if (-not (Test-NPMInstalled)) {
        Write-Error "npm is required"
        exit 1
    }
    
    Test-GitInstalled | Out-Null
    
    # Create install directory
    if (-not (Test-Path $InstallDir)) {
        New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
        Write-Success "Installation directory created: $InstallDir"
    }
    
    # Setup
    Setup-ProjectStructure
    Setup-Environment
    Setup-Gitignore
    Install-Dependencies
    
    # Create shortcuts
    Create-DesktopShortcut
    Create-StartMenuShortcut
    Create-PowerShellProfile
    
    # Summary
    Write-Host ""
    Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "Installation Summary" -ForegroundColor Green
    Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📁 Installation directory: $InstallDir"
    Write-Host "🚀 To start the server:"
    Write-Host "   cd $InstallDir"
    Write-Host "   npm start"
    Write-Host ""
    Write-Host "🌐 Access the web interface:"
    Write-Host "   http://localhost:3000"
    Write-Host ""
    Write-Host "🔗 Link GitHub Copilot:"
    Write-Host "   Click '🔗 Link Copilot Account' button in web interface"
    Write-Host ""
    Write-Host "📖 Read documentation:"
    Write-Host "   cat $InstallDir\QUICK_START.md"
    Write-Host ""
    Write-Host "⚡ Quick commands in PowerShell:"
    Write-Host "   claude-start  : Start the server"
    Write-Host "   claude-edit   : Open in VS Code"
    Write-Host "   claude-logs   : View logs"
    Write-Host ""
    Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Success "Installation completed successfully!"
}

# Run installation
Start-Installation
