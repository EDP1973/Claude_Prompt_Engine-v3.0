#Requires -Version 5.1
<#
.SYNOPSIS
    iAI Key Setup Wizard for Windows — Claude Prompt Engine
.DESCRIPTION
    Opens the correct websites to generate API keys, collects them,
    validates them, installs missing dependencies, and writes .env.
    Requests administrator privileges when needed.
.NOTES
    Run from PowerShell:  .\setup-keys.ps1
    Or double-click:      setup-keys.bat
#>

# ── UAC Elevation ─────────────────────────────────────────────────────────────
function Request-AdminRights {
    if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        Write-Host ""
        Write-Host "  [!] Some steps require Administrator rights (Node.js install, PATH update)." -ForegroundColor Yellow
        Write-Host "  Re-launching as Administrator..." -ForegroundColor Cyan
        $args = "-NoProfile -ExecutionPolicy Bypass -File `"$($MyInvocation.MyCommand.Path)`""
        Start-Process powershell -Verb RunAs -ArgumentList $args -Wait
        exit
    }
}
Request-AdminRights

# ── UI Helpers ────────────────────────────────────────────────────────────────
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvFile   = Join-Path $ScriptDir ".env"

function Write-Header {
    Clear-Host
    Write-Host ""
    Write-Host "  ╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "  ║    iAI Key Setup Wizard — Claude Prompt Engine       ║" -ForegroundColor Cyan
    Write-Host "  ╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host "  Running as Administrator: $([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole('Administrator')" -ForegroundColor Green
    Write-Host ""
}

function Write-Section($title) {
    Write-Host ""
    Write-Host "  ── $title " -ForegroundColor Cyan -NoNewline
    Write-Host ("─" * [Math]::Max(0, 50 - $title.Length)) -ForegroundColor Cyan
    Write-Host ""
}

function Write-Ok($msg)   { Write-Host "  ✅ $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "  ⚠  $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "  ❌ $msg" -ForegroundColor Red }
function Write-Info($msg) { Write-Host "  ℹ  $msg" -ForegroundColor Cyan }

function Open-Browser($url) {
    Write-Host "  → Opening: $url" -ForegroundColor Yellow
    Start-Process $url
}

function Read-SecureKey($prompt, $current = "") {
    if ($current -ne "") {
        Write-Host "  Current: $($current.Substring(0, [Math]::Min(20, $current.Length)))… (Enter to keep)" -ForegroundColor Yellow
    }
    $secure = Read-Host "  $prompt" -AsSecureString
    $plain  = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
                  [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
    if ($plain -eq "" -and $current -ne "") { return $current }
    return $plain
}

# ── Load existing .env ────────────────────────────────────────────────────────
$EnvVars = @{
    OPENAI_API_KEY = ""
    GH_TOKEN       = ""
    TELNYX_API_KEY = ""
    MYSQL_HOST     = "localhost"
    MYSQL_USER     = "root"
    MYSQL_PASS     = ""
    MYSQL_DB       = "vicidial"
    PORT           = "3000"
    NODE_ENV       = "development"
}

if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match '^([A-Z_][A-Z0-9_]*)=(.*)$') {
            if ($EnvVars.ContainsKey($Matches[1])) {
                $EnvVars[$Matches[1]] = $Matches[2].Trim()
            }
        }
    }
}

Write-Header

# ── Step 1: Check Dependencies ────────────────────────────────────────────────
Write-Section "Checking System Dependencies"

function Test-Command($name) {
    return (Get-Command $name -ErrorAction SilentlyContinue) -ne $null
}

$NeedsNode = -not (Test-Command "node")
$NeedsNpm  = -not (Test-Command "npm")
$NeedsGit  = -not (Test-Command "git")
$NeedsGH   = -not (Test-Command "gh")

if (-not $NeedsNode) {
    $nodeVer = & node --version 2>$null
    Write-Ok "Node.js $nodeVer found"
} else {
    Write-Err "Node.js not found — REQUIRED"
    Write-Host ""
    Write-Info "Choose installation method:"
    Write-Host "  [1] Download installer from nodejs.org (recommended)"
    Write-Host "  [2] Install via winget (Windows Package Manager)"
    Write-Host "  [3] Install via Chocolatey"
    Write-Host "  [4] Skip Node.js install"
    $choice = Read-Host "  Choice [1-4]"
    switch ($choice) {
        "1" {
            Open-Browser "https://nodejs.org/en/download/"
            Write-Warn "Installer opening in browser. Install Node.js then re-run this script."
            Read-Host "  Press Enter when Node.js is installed"
        }
        "2" {
            if (Test-Command "winget") {
                Write-Info "Installing Node.js LTS via winget..."
                winget install OpenJS.NodeJS.LTS --silent --accept-source-agreements --accept-package-agreements
                Write-Ok "Node.js installed via winget"
                $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
            } else {
                Write-Err "winget not available. Install from Microsoft Store or use option 1."
                Open-Browser "https://nodejs.org/en/download/"
            }
        }
        "3" {
            if (Test-Command "choco") {
                Write-Info "Installing Node.js via Chocolatey..."
                choco install nodejs-lts -y
                Write-Ok "Node.js installed via Chocolatey"
            } else {
                Write-Warn "Chocolatey not found. Installing Chocolatey first..."
                Open-Browser "https://chocolatey.org/install"
                Write-Warn "Install Chocolatey first, then re-run this script."
            }
        }
        default { Write-Warn "Skipping Node.js install — app may not run" }
    }
}

if (-not $NeedsGit) {
    Write-Ok "git found"
} else {
    Write-Warn "git not found"
    $installGit = Read-Host "  Install git for Windows? (y/N)"
    if ($installGit -eq "y") { Open-Browser "https://git-scm.com/download/win" }
}

if (-not $NeedsGH) {
    Write-Ok "GitHub CLI (gh) found"
} else {
    Write-Warn "GitHub CLI not found (optional)"
    $installGH = Read-Host "  Install GitHub CLI? (y/N)"
    if ($installGH -eq "y") { Open-Browser "https://cli.github.com/" }
}

# Install npm packages
if (Test-Command "npm") {
    Write-Info "Installing npm dependencies..."
    Push-Location $ScriptDir
    & npm install --silent
    Pop-Location
    Write-Ok "npm packages installed"
}

# ── Step 2: OpenAI API Key ────────────────────────────────────────────────────
Write-Section "Step 1 — OpenAI API Key (PRIMARY AI ENGINE)"

Write-Host "  OpenAI powers iAI's chat intelligence." -ForegroundColor White
Write-Host "  You need a paid account with billing credit." -ForegroundColor White
Write-Host ""

$skipOpenAI = $false
if ($EnvVars.OPENAI_API_KEY -ne "") {
    Write-Ok "Key already set: $($EnvVars.OPENAI_API_KEY.Substring(0, [Math]::Min(20, $EnvVars.OPENAI_API_KEY.Length)))…"
    $replace = Read-Host "  Replace it? (y/N)"
    if ($replace -ne "y") { $skipOpenAI = $true }
}

if (-not $skipOpenAI) {
    Write-Host ""
    Write-Info "Opening: https://platform.openai.com/api-keys"
    Write-Host "  Instructions:" -ForegroundColor White
    Write-Host "   1. Sign in (or create account)" -ForegroundColor Gray
    Write-Host "   2. Click [+ Create new secret key]" -ForegroundColor Gray
    Write-Host "   3. Name it: claude-prompt-engine-iai" -ForegroundColor Gray
    Write-Host "   4. Copy the key and paste below" -ForegroundColor Gray
    Write-Host ""
    Open-Browser "https://platform.openai.com/api-keys"
    Start-Sleep -Seconds 2

    $newKey = Read-SecureKey "Paste OpenAI API key (sk-proj-…)" $EnvVars.OPENAI_API_KEY
    if ($newKey -ne "") {
        $EnvVars.OPENAI_API_KEY = $newKey
        Write-Info "Validating key..."
        try {
            $resp = Invoke-WebRequest -Uri "https://api.openai.com/v1/models" `
                -Headers @{ Authorization = "Bearer $newKey" } `
                -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
            Write-Ok "OpenAI key valid! ($($resp.StatusCode))"
            # Check quota
            try {
                $body = '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"ok"}],"max_tokens":3}'
                $chat = Invoke-WebRequest -Uri "https://api.openai.com/v1/chat/completions" `
                    -Method POST -Body $body `
                    -Headers @{ Authorization = "Bearer $newKey"; "Content-Type" = "application/json" } `
                    -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
                Write-Ok "Chat completions: working!"
            } catch {
                if ($_.Exception.Response.StatusCode -eq 429) {
                    Write-Warn "Key valid but billing quota exceeded."
                    Write-Host "  → Add billing: https://platform.openai.com/settings/organization/billing/overview" -ForegroundColor Yellow
                    Open-Browser "https://platform.openai.com/settings/organization/billing/overview"
                }
            }
        } catch {
            Write-Warn "Could not validate key: $($_.Exception.Message)"
        }
    }
}

# ── Step 3: GitHub Token ──────────────────────────────────────────────────────
Write-Section "Step 2 — GitHub Personal Access Token"

Write-Host "  Used for: repo access, GitHub API, Copilot (if subscribed)." -ForegroundColor White
Write-Host ""

$skipGH = $false
if ($EnvVars.GH_TOKEN -ne "") {
    Write-Ok "Token already set: $($EnvVars.GH_TOKEN.Substring(0, [Math]::Min(20, $EnvVars.GH_TOKEN.Length)))…"
    $replace = Read-Host "  Replace it? (y/N)"
    if ($replace -ne "y") { $skipGH = $true }
}

if (-not $skipGH) {
    Write-Host ""
    Write-Info "Opening: https://github.com/settings/tokens/new"
    Write-Host "  Instructions:" -ForegroundColor White
    Write-Host "   1. Name: claude-prompt-engine" -ForegroundColor Gray
    Write-Host "   2. Expiration: 90 days" -ForegroundColor Gray
    Write-Host "   3. Scopes: repo, read:user, read:org" -ForegroundColor Gray
    Write-Host "   4. For Copilot: also check copilot" -ForegroundColor Gray
    Write-Host "   5. Click Generate token → Copy" -ForegroundColor Gray
    Write-Host ""
    Open-Browser "https://github.com/settings/tokens/new"
    Start-Sleep -Seconds 2

    $newToken = Read-SecureKey "Paste GitHub token (ghp_…)" $EnvVars.GH_TOKEN
    if ($newToken -ne "") {
        $EnvVars.GH_TOKEN = $newToken
        Write-Info "Validating token..."
        try {
            $resp = Invoke-WebRequest -Uri "https://api.github.com/user" `
                -Headers @{ Authorization = "token $newToken" } `
                -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
            $user = ($resp.Content | ConvertFrom-Json).login
            Write-Ok "Authenticated as: $user"
        } catch {
            Write-Warn "Could not validate GitHub token."
        }
    }
}

# ── Step 4: Telnyx ────────────────────────────────────────────────────────────
Write-Section "Step 3 — Telnyx API Key (Optional — Telephony)"
$doTelnyx = Read-Host "  Configure Telnyx for VoIP/SIP? (y/N)"
if ($doTelnyx -eq "y") {
    Open-Browser "https://portal.telnyx.com/#/app/api-keys"
    $newTelnyx = Read-SecureKey "Paste Telnyx API key (KEY_…)" $EnvVars.TELNYX_API_KEY
    if ($newTelnyx -ne "") { $EnvVars.TELNYX_API_KEY = $newTelnyx }
}

# ── Step 5: MySQL ─────────────────────────────────────────────────────────────
Write-Section "Step 4 — MySQL / Vicidial Database"

$h = Read-Host "  MySQL Host [$($EnvVars.MYSQL_HOST)]"
if ($h -ne "") { $EnvVars.MYSQL_HOST = $h }

$u = Read-Host "  MySQL User [$($EnvVars.MYSQL_USER)]"
if ($u -ne "") { $EnvVars.MYSQL_USER = $u }

$p = Read-Host "  MySQL Password" -AsSecureString
$pPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($p))
if ($pPlain -ne "") { $EnvVars.MYSQL_PASS = $pPlain }

$d = Read-Host "  MySQL Database [$($EnvVars.MYSQL_DB)]"
if ($d -ne "") { $EnvVars.MYSQL_DB = $d }

# ── Write .env ────────────────────────────────────────────────────────────────
Write-Section "Writing .env"

$envContent = @"
# Claude Prompt Engine - Environment Variables
# Generated by setup-keys.ps1 on $(Get-Date -Format 'yyyy-MM-dd HH:mm')
# WARNING: NEVER commit this file to version control

# AI Engine
# OpenAI API (primary iAI engine - requires billing credit)
# Generate: https://platform.openai.com/api-keys
OPENAI_API_KEY=$($EnvVars.OPENAI_API_KEY)

# GitHub Token (Copilot API fallback + GitHub API access)
# Generate: https://github.com/settings/tokens/new
GH_TOKEN=$($EnvVars.GH_TOKEN)

# Telephony (Optional)
# Telnyx SIP/VoIP integration
# Generate: https://portal.telnyx.com/#/app/api-keys
TELNYX_API_KEY=$($EnvVars.TELNYX_API_KEY)

# Database
MYSQL_HOST=$($EnvVars.MYSQL_HOST)
MYSQL_USER=$($EnvVars.MYSQL_USER)
MYSQL_PASS=$($EnvVars.MYSQL_PASS)
MYSQL_DB=$($EnvVars.MYSQL_DB)

# App
PORT=$($EnvVars.PORT)
NODE_ENV=$($EnvVars.NODE_ENV)
"@

$envContent | Out-File -FilePath $EnvFile -Encoding UTF8
Write-Ok ".env written to: $EnvFile"

# Add .env to .gitignore
$gitignore = Join-Path $ScriptDir ".gitignore"
if (Test-Path $gitignore) {
    if (-not (Select-String -Path $gitignore -Pattern "^\.env$" -Quiet)) {
        Add-Content $gitignore "`n.env"
        Write-Ok ".env added to .gitignore"
    }
}

# ── Windows Firewall ──────────────────────────────────────────────────────────
Write-Section "Step 5 — Windows Firewall (Optional)"
$doFirewall = Read-Host "  Allow port 3000 through Windows Firewall? (y/N)"
if ($doFirewall -eq "y") {
    try {
        $existing = Get-NetFirewallRule -DisplayName "Claude Prompt Engine" -ErrorAction SilentlyContinue
        if (-not $existing) {
            New-NetFirewallRule -DisplayName "Claude Prompt Engine" `
                -Direction Inbound -Protocol TCP -LocalPort 3000 `
                -Action Allow -Profile Any -ErrorAction Stop
            Write-Ok "Firewall rule added: TCP 3000 inbound"
        } else {
            Write-Ok "Firewall rule already exists"
        }
    } catch {
        Write-Warn "Could not add firewall rule: $($_.Exception.Message)"
    }
}

# ── Windows Service (Optional) ────────────────────────────────────────────────
Write-Section "Step 6 — Install as Windows Service (Optional)"
Write-Host "  Run Claude Prompt Engine as a background Windows service." -ForegroundColor White
$doService = Read-Host "  Install as Windows service? (y/N)"
if ($doService -eq "y") {
    if (Test-Command "npm") {
        Write-Info "Installing pm2 for Windows service..."
        & npm install -g pm2 --silent
        & npm install -g pm2-windows-startup --silent
        Push-Location $ScriptDir
        & pm2 start server.js --name "claude-prompt-engine"
        & pm2 save
        & pm2-startup install
        Pop-Location
        Write-Ok "Service installed! Starts automatically with Windows."
    } else {
        Write-Warn "npm not found — cannot install service"
    }
}

# ── Done ──────────────────────────────────────────────────────────────────────
Write-Section "Setup Complete!"
Write-Ok "Keys saved to .env"
Write-Ok "iAI engine priority: OpenAI → Copilot API → gh CLI"
Write-Host ""
Write-Host "  Next steps:" -ForegroundColor White
Write-Host "   • Start server:  npm start" -ForegroundColor Cyan
Write-Host "   • Open iAI:      http://localhost:3000/iai.html" -ForegroundColor Cyan
Write-Host "   • Key wizard:    http://localhost:3000/setup.html" -ForegroundColor Cyan
Write-Host ""

$startNow = Read-Host "  Start the server now? (y/N)"
if ($startNow -eq "y") {
    Push-Location $ScriptDir
    & npm start
}
