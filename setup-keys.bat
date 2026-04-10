@echo off
:: ============================================================
::  iAI Key Setup Wizard — Windows Launcher
::  Elevates to Administrator and runs setup-keys.ps1
:: ============================================================
title iAI Setup Wizard — Claude Prompt Engine

:: Check for admin rights
net session >nul 2>&1
if %errorlevel% == 0 (
    goto :RUN
) else (
    echo.
    echo  [!] Requesting Administrator privileges...
    echo.
    goto :ELEVATE
)

:ELEVATE
:: Re-launch as admin via PowerShell
powershell -NoProfile -Command ^
  "Start-Process -FilePath 'cmd.exe' -ArgumentList '/c \"%~f0\"' -Verb RunAs -Wait"
exit /b

:RUN
echo.
echo  ============================================================
echo   iAI Key Setup Wizard — Claude Prompt Engine
echo  ============================================================
echo.
echo  Running as Administrator: OK
echo.

:: Check PowerShell availability
where powershell >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] PowerShell not found. Please install PowerShell.
    echo  Download: https://github.com/PowerShell/PowerShell/releases
    pause
    exit /b 1
)

:: Set execution policy for this session and run wizard
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-keys.ps1"

if %errorlevel% neq 0 (
    echo.
    echo  [!] Setup encountered an error. Check the output above.
    echo.
)

pause
