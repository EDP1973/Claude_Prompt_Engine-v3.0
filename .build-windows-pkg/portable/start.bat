@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
set NODE_ENV=production
set PORT=3000

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  Claude Prompt Engine                                          ║
echo ║  Starting on http://localhost:3000                             ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Launching browser in 3 seconds...
timeout /t 3 /nobreak

start http://localhost:3000

node server.js
