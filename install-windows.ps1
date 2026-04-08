#Requires -Version 5.0

################################################################################
#                                                                              #
#     Claude Prompt Engine - Windows Installation Script                      #
#     Self-Contained Installation for Windows 10/11                           #
#     Installs: Node.js, npm, Dependencies, and Starts Server                 #
#                                                                              #
################################################################################

param(
    [string]$InstallDir = "$env:USERPROFILE\claude-prompt-engine",
    [switch]$Verbose
)

# ============================================================================
# CONFIGURATION
# ============================================================================

$script:Colors = @{
    Success = 'Green'
    Error   = 'Red'
    Warning = 'Yellow'
    Info    = 'Cyan'
    Section = 'Blue'
}

$script:MinNodeVersion = 18
$script:MinNpmVersion = 9
$script:Port = 3000

# ============================================================================
# DISPLAY FUNCTIONS
# ============================================================================

function Write-Banner {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                                                                        ║" -ForegroundColor Cyan
    Write-Host "║      Claude Prompt Engine - Windows Installation                      ║" -ForegroundColor Cyan
    Write-Host "║      Self-Contained Production Installation                           ║" -ForegroundColor Cyan
    Write-Host "║                                                                        ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    Write-Host "  $Title" -ForegroundColor Blue
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "  ✓ $Message" -ForegroundColor Green
}

function Write-Status {
    param([string]$Message)
    Write-Host "  • $Message" -ForegroundColor Cyan
}

function Write-Error {
    param([string]$Message)
    Write-Host "  ✗ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "  ⚠ $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "  ℹ $Message" -ForegroundColor Cyan
}

function Pause-Prompt {
    Write-Host ""
    Read-Host "Press Enter to continue" | Out-Null
    Write-Host ""
}

# ============================================================================
# ENVIRONMENT CHECKS
# ============================================================================

function Test-NodeJS {
    try {
        $version = Invoke-Expression "node --version" 2>$null | Select-Object -First 1
        $versionNumber = [int]($version -replace 'v|\..*', '')
        
        if ($versionNumber -lt $script:MinNodeVersion) {
            Write-Error "Node.js v$script:MinNodeVersion+ required (found $version)"
            return $false
        }
        
        Write-Success "Node.js $version found"
        return $true
    } catch {
        return $false
    }
}

function Test-NPM {
    try {
        $version = Invoke-Expression "npm --version" 2>$null
        Write-Success "npm v$version found"
        return $true
    } catch {
        return $false
    }
}

function Test-Git {
    try {
        $null = Invoke-Expression "git --version" 2>$null
        Write-Success "Git found"
        return $true
    } catch {
        Write-Warning "Git not found (optional)"
        return $false
    }
}

# ============================================================================
# INSTALLATION FUNCTIONS
# ============================================================================

function Install-NodeJS {
    Write-Section "Installing Node.js"
    
    $arch = if ([Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" }
    Write-Status "Downloading Node.js v18 ($arch)..."
    
    $nodeUrl = "https://nodejs.org/dist/v18.17.1/node-v18.17.1-win-$arch.msi"
    $installerPath = "$env:TEMP\node-installer-$([guid]::NewGuid()).msi"
    
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $nodeUrl -OutFile $installerPath -UseBasicParsing
        Write-Success "Download complete"
    } catch {
        Write-Error "Failed to download Node.js: $_"
        return $false
    }
    
    Write-Status "Running Node.js installer..."
    try {
        $process = Start-Process -FilePath $installerPath -ArgumentList "/quiet /norestart" -Wait -PassThru
        
        if ($process.ExitCode -eq 0 -or $process.ExitCode -eq 3010) {
            Write-Success "Node.js installed"
            
            # Refresh PATH
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
            
            # Verify installation
            Start-Sleep -Seconds 2
            $version = Invoke-Expression "node --version" 2>$null
            Write-Success "Verified: Node.js $version"
            
            Remove-Item $installerPath -Force -ErrorAction SilentlyContinue
            return $true
        } else {
            Write-Error "Installation failed with code: $($process.ExitCode)"
            return $false
        }
    } catch {
        Write-Error "Installation error: $_"
        return $false
    }
}

function Setup-Project {
    Write-Section "Setting Up Project Structure"
    
    if (-not (Test-Path $InstallDir)) {
        Write-Status "Creating installation directory: $InstallDir"
        New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    }
    
    $directories = @(
        "core",
        "cli",
        "public",
        "migrations",
        "test-data",
        "logs",
        "configs",
        "memory",
        "build"
    )
    
    foreach ($dir in $directories) {
        $fullPath = Join-Path $InstallDir $dir
        if (-not (Test-Path $fullPath)) {
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
            Write-Status "Created: $dir"
        }
    }
    
    Write-Success "Project structure ready"
}

function Install-Dependencies {
    Write-Section "Installing npm Dependencies"
    
    Push-Location $InstallDir
    
    Write-Status "Running: npm install"
    Write-Info "This may take 2-3 minutes..."
    Write-Host ""
    
    try {
        # Run npm install with output
        $npmOutput = & npm install 2>&1
        
        # Check for errors
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Primary installation had issues, trying alternative method..."
            $npmOutput = & npm install --legacy-peer-deps --no-optional 2>&1
            
            if ($LASTEXITCODE -ne 0) {
                Write-Error "npm install failed"
                Pop-Location
                return $false
            }
        }
        
        Write-Success "Dependencies installed"
        
        # Verify sqlite3
        $sqlite3Check = & npm list sqlite3 2>&1 | Select-String "sqlite3"
        if ($sqlite3Check) {
            Write-Success "sqlite3 verified"
        }
        
        Pop-Location
        return $true
    } catch {
        Write-Error "Installation error: $_"
        Pop-Location
        return $false
    }
}

function Create-Configs {
    Write-Section "Creating Configuration Files"
    
    # .env file
    $envPath = Join-Path $InstallDir ".env"
    if (-not (Test-Path $envPath)) {
        $envContent = @"
# Claude Prompt Engine - Configuration
PORT=3000
NODE_ENV=production
DB_PATH=./prompt_engine.db
API_KEY=dev-key-change-in-production
CORS_ORIGIN=http://localhost:3000
MAX_FILE_SIZE=104857600
"@
        Set-Content -Path $envPath -Value $envContent -Encoding UTF8
        Write-Success "Created: .env"
    }
    
    # config.json
    $configPath = Join-Path $InstallDir "config.json"
    if (-not (Test-Path $configPath)) {
        $configContent = @"
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
    "environment": "production"
  }
}
"@
        Set-Content -Path $configPath -Value $configContent -Encoding UTF8
        Write-Success "Created: config.json"
    }
}

function Create-Scripts {
    Write-Section "Creating Helper Scripts"
    
    # Start script
    $startScript = Join-Path $InstallDir "start.bat"
    if (-not (Test-Path $startScript)) {
        $startContent = @"
@echo off
title Claude Prompt Engine - Server
echo.
echo Starting Claude Prompt Engine...
echo.
npm run web
pause
"@
        Set-Content -Path $startScript -Value $startContent -Encoding ASCII
        Write-Success "Created: start.bat"
    }
    
    # Stop script
    $stopScript = Join-Path $InstallDir "stop.bat"
    if (-not (Test-Path $stopScript)) {
        $stopContent = @"
@echo off
echo.
echo Stopping Claude Prompt Engine...
taskkill /F /IM node.exe /T
echo Server stopped
pause
"@
        Set-Content -Path $stopScript -Value $stopContent -Encoding ASCII
        Write-Success "Created: stop.bat"
    }
}

function Test-Installation {
    Write-Section "Verifying Installation"
    
    Push-Location $InstallDir
    
    # Check key files
    $requiredFiles = @(
        "package.json",
        "server.js",
        "core",
        "public"
    )
    
    foreach ($file in $requiredFiles) {
        $path = Join-Path $InstallDir $file
        if (Test-Path $path) {
            Write-Success "Found: $file"
        } else {
            Write-Error "Missing: $file"
            Pop-Location
            return $false
        }
    }
    
    # Test node
    $nodeTest = & node --version 2>&1
    Write-Success "Node.js: $nodeTest"
    
    # Test npm
    $npmTest = & npm --version 2>&1
    Write-Success "npm: v$npmTest"
    
    # Test sqlite3
    $sqlite3Test = & npm list sqlite3 2>&1
    if ($sqlite3Test -match "sqlite3@") {
        Write-Success "sqlite3: installed"
    } else {
        Write-Warning "sqlite3: not verified (may be OK)"
    }
    
    Pop-Location
    return $true
}

# ============================================================================
# MAIN INSTALLATION FLOW
# ============================================================================

function Main {
    Write-Banner
    
    # Check prerequisites
    Write-Section "Checking Prerequisites"
    
    $hasNode = Test-NodeJS
    $hasNpm = Test-NPM
    $hasGit = Test-Git
    
    Write-Host ""
    
    # Install Node.js if needed
    if (-not $hasNode) {
        Write-Warning "Node.js not found"
        Write-Info "Installing Node.js v18..."
        
        if (-not (Install-NodeJS)) {
            Write-Error "Failed to install Node.js"
            Write-Info "Please install Node.js manually from https://nodejs.org/"
            Pause-Prompt
            exit 1
        }
    }
    
    # Verify npm after Node install
    if (-not (Test-NPM)) {
        Write-Error "npm not available after Node.js installation"
        exit 1
    }
    
    # Setup project
    Setup-Project
    
    # Install dependencies
    if (-not (Install-Dependencies)) {
        Write-Error "Failed to install dependencies"
        Pause-Prompt
        exit 1
    }
    
    # Create configs
    Create-Configs
    
    # Create scripts
    Create-Scripts
    
    # Test installation
    if (-not (Test-Installation)) {
        Write-Error "Installation verification failed"
        Pause-Prompt
        exit 1
    }
    
    # Success
    Write-Section "Installation Complete! 🎉"
    
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host "Quick Start:" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host ""
    Write-Host "  1. Navigate to: $InstallDir" -ForegroundColor White
    Write-Host "  2. Double-click: start.bat" -ForegroundColor White
    Write-Host "  3. Open browser: http://localhost:3000" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use PowerShell:" -ForegroundColor White
    Write-Host "  cd '$InstallDir'" -ForegroundColor Gray
    Write-Host "  npm run web" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "First Steps:" -ForegroundColor Green
    Write-Host "  • http://localhost:3000/settings.html - Configure system" -ForegroundColor White
    Write-Host "  • http://localhost:3000/data-import.html - Import data" -ForegroundColor White
    Write-Host "  • http://localhost:3000/query-builder-form.html - Build queries" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Useful Commands:" -ForegroundColor Green
    Write-Host "  npm run web    - Start server" -ForegroundColor White
    Write-Host "  npm run cli    - Use CLI interface" -ForegroundColor White
    Write-Host "  start.bat      - Quick start (double-click or run)" -ForegroundColor White
    Write-Host "  stop.bat       - Stop server" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Documentation:" -ForegroundColor Green
    Write-Host "  • COMPREHENSIVE_DOCS.md - Full guide" -ForegroundColor White
    Write-Host "  • INSTALLATION_GUIDE.md - Setup details" -ForegroundColor White
    Write-Host "  • INSTALL_TROUBLESHOOTING.md - Common issues" -ForegroundColor White
    Write-Host ""
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    
    Pause-Prompt
}

# ============================================================================
# ERROR HANDLING
# ============================================================================

$ErrorActionPreference = "Continue"

try {
    Main
} catch {
    Write-Error "Installation error: $_"
    Pause-Prompt
    exit 1
}
