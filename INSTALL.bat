@echo off
REM ============================================================================
REM Claude Prompt Engine - Windows Installer Launcher
REM Simply double-click this file to start installation
REM ============================================================================

setlocal enabledelayedexpansion

cls
echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                                                                        ║
echo ║      Claude Prompt Engine - Windows Installation                      ║
echo ║      Self-Contained Production Installation                           ║
echo ║                                                                        ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.

REM Check if PowerShell is available
where powershell >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PowerShell is not available on this system
    echo Please install PowerShell 5.0+ from Microsoft
    pause
    exit /b 1
)

REM Check execution policy and set if needed
for /f "tokens=*" %%A in ('powershell -Command "Get-ExecutionPolicy"') do set "POLICY=%%A"

if "%POLICY%"=="Restricted" (
    echo [INFO] Setting PowerShell execution policy for current user...
    powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force" >nul 2>nul
)

REM Run the PowerShell installation script
echo.
echo [INFO] Starting PowerShell installation script...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "& '%~dp0install-windows.ps1'" -InstallDir "%cd%"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Installation failed
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Installation completed!
pause
