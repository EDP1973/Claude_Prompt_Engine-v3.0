@echo off
REM ============================================================================
REM Claude Prompt Engine - Stop Script
REM Double-click this to stop the running server
REM ============================================================================

setlocal enabledelayedexpansion

cls
echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                                                                        ║
echo ║         Claude Prompt Engine - Stopping Server...                     ║
echo ║                                                                        ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.

REM Check if Node processes are running
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [INFO] Found running Node.js processes...
    echo [INFO] Stopping server gracefully...
    timeout /t 2 /nobreak >nul
    
    echo.
    taskkill /F /IM node.exe /T
    
    if %ERRORLEVEL% EQU 0 (
        echo [SUCCESS] Server stopped successfully
    ) else (
        echo [WARNING] Could not stop server cleanly
    )
) else (
    echo [INFO] No running server found
)

echo.
pause
