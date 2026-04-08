@echo off
REM Claude Prompt Engine - Windows PowerShell Installer
REM Self-contained installation for Windows systems
REM Supports: Windows 10/11

cls
echo.
echo ╔═══════════════════════════════════════════════════════════════════════════╗
echo ║          Claude Prompt Engine - Windows Installation                     ║
echo ║              Universal Self-Contained Installer v3.0.0                   ║
echo ╚═══════════════════════════════════════════════════════════════════════════╝
echo.

REM Color codes
setlocal enabledelayedexpansion

REM Configuration
set NODE_MIN_VERSION=18
set NPM_MIN_VERSION=9
set PORT=3000
set INSTALL_DIR=%cd%

echo [*] Checking system requirements...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] Node.js is not installed
    echo.
    echo Installation instructions:
    echo   - Download from https://nodejs.org/en/download/
    echo   - Choose Windows Installer (Recommended)
    echo   - Run the installer and follow the prompts
    echo   - Restart your computer after installation
    echo.
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] npm is not installed
    pause
    exit /b 1
)

REM Get Node.js version
for /f "tokens=1" %%i in ('node -v') do set NODE_VERSION=%%i
echo [+] Node.js %NODE_VERSION% found

REM Get npm version
for /f "tokens=1" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [+] npm %NPM_VERSION% found
echo.

echo [*] Creating project structure...
if not exist "core" mkdir core
if not exist "public\js\css" mkdir public\js\css
if not exist "migrations" mkdir migrations
if not exist "test-data" mkdir test-data
if not exist "logs" mkdir logs
if not exist "configs" mkdir configs
echo [+] Project structure created
echo.

echo [*] Installing npm dependencies...
echo     This may take 2-3 minutes...
echo.
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [X] Failed to install dependencies
    echo [*] Trying alternative installation method...
    call npm install --no-optional --legacy-peer-deps
    if %ERRORLEVEL% NEQ 0 (
        echo [X] Installation failed. Please check your internet connection.
        pause
        exit /b 1
    )
)
echo [+] Dependencies installed successfully
echo.

echo [*] Creating configuration files...

REM Create .env file
if not exist ".env" (
    (
        echo # Claude Prompt Engine - Configuration
        echo PORT=3000
        echo NODE_ENV=development
        echo DB_PATH=./prompt_engine.db
        echo API_KEY=development-key-change-in-production
        echo CORS_ORIGIN=http://localhost:3000
        echo MAX_FILE_SIZE=104857600
        echo FORCE_TIER=
    ) > .env
    echo [+] .env configuration file created
)

REM Create config.json
if not exist "config.json" (
    (
        echo {
        echo   "port": 3000,
        echo   "database": {
        echo     "path": "./prompt_engine.db",
        echo     "maxSize": 1000000000
        echo   },
        echo   "api": {
        echo     "maxBodySize": "1mb",
        echo     "corsEnabled": true
        echo   },
        echo   "hardware": {
        echo     "autoDetect": true,
        echo     "forceTier": null
        echo   },
        echo   "validation": {
        echo     "phoneMinDigits": 10,
        echo     "phoneMaxDigits": 15,
        echo     "checkDuplicates": true
        echo   }
        echo }
    ) > config.json
    echo [+] config.json created
)
echo.

echo [*] Creating convenience scripts...

REM Create start.bat
(
    echo @echo off
    echo echo.
    echo echo ^[*^] Starting Claude Prompt Engine...
    echo echo.
    echo npm run web
) > start.bat
echo [+] start.bat created

REM Create test.bat
(
    echo @echo off
    echo echo [*] Running tests...
    echo bash run-tests.sh
) > test.bat
echo [+] test.bat created

REM Create stop.bat
(
    echo @echo off
    echo echo [*] Stopping Claude Prompt Engine...
    echo taskkill /IM node.exe /F
    echo echo [+] Server stopped
) > stop.bat
echo [+] stop.bat created

echo.
echo [*] Verifying installation...

node -v >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] Node.js test failed
    pause
    exit /b 1
)
echo [+] Node.js test passed

npm -v >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] npm test failed
    pause
    exit /b 1
)
echo [+] npm test passed

if not exist "package.json" (
    echo [X] package.json not found
    pause
    exit /b 1
)
echo [+] package.json found

if not exist "server.js" (
    echo [X] server.js not found
    pause
    exit /b 1
)
echo [+] server.js found

echo.
echo ╔═══════════════════════════════════════════════════════════════════════════╗
echo ║                     Installation Complete! [SUCCESS]                     ║
echo ╚═══════════════════════════════════════════════════════════════════════════╝
echo.
echo [*] Quick Start Guide:
echo.
echo     1. Navigate to project directory:
echo        cd %INSTALL_DIR%
echo.
echo     2. Start the server:
echo        npm run web
echo        OR
echo        .\start.bat
echo.
echo     3. Open in browser:
echo        http://localhost:3000
echo.
echo [*] Useful Commands:
echo.
echo     npm run web        - Start development server
echo     npm test           - Run test suite
echo     npm run build      - Build for production
echo     .\run-tests.sh     - Quick test check (Git Bash required)
echo.
echo [*] First Steps:
echo.
echo     1. Go to http://localhost:3000/settings.html
echo        ^> Configure hardware tier and deployment mode
echo.
echo     2. Go to http://localhost:3000/data-import.html
echo        ^> Import your first data file (CSV/Excel/TXT^)
echo.
echo     3. Go to http://localhost:3000/query-builder-form.html
echo        ^> Build and test SQL queries
echo.
echo     4. Go to http://localhost:3000/query-builder-visual.html
echo        ^> Use visual query builder with drag-drop
echo.
echo [*] Documentation:
echo.
echo     - Comprehensive Guide: COMPREHENSIVE_DOCS.md
echo     - API Reference: COMPREHENSIVE_DOCS.md (API Reference section^)
echo     - Contributing: CONTRIBUTING.md
echo.
echo [*] System Information:
echo.
echo     - Node.js: %NODE_VERSION%
echo     - npm: %NPM_VERSION%
echo     - Port: %PORT%
echo     - Database: ./prompt_engine.db
echo     - Installation: %INSTALL_DIR%
echo.
echo [*] Need help? Visit:
echo     https://github.com/yourusername/claude-prompt-engine
echo.
echo ╔═══════════════════════════════════════════════════════════════════════════╗
echo ║              Ready to start? Press any key to continue...                ║
echo ╚═══════════════════════════════════════════════════════════════════════════╝
echo.
pause

REM Clean up and exit
endlocal
