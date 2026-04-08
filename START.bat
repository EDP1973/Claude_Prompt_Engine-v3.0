@echo off
REM ============================================================================
REM Claude Prompt Engine - Quick Start Script
REM Double-click this to start the server on port 3000
REM ============================================================================

setlocal enabledelayedexpansion

REM Check if Node.js is available
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please run INSTALL.bat first
    pause
    exit /b 1
)

REM Check if npm is available
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed or not in PATH
    echo Please run INSTALL.bat first
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] Installing dependencies...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Set console title
title Claude Prompt Engine - Server

cls
echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                                                                        ║
echo ║         Claude Prompt Engine - Starting Server...                     ║
echo ║                                                                        ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.
echo Starting server on port 3000...
echo Access the application at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
echo ────────────────────────────────────────────────────────────────────────
echo.

REM Start server
npm run web

REM If we get here, server stopped
echo.
echo ────────────────────────────────────────────────────────────────────────
echo Server stopped
pause
