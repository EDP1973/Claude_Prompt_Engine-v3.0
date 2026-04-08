@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
echo Installing dependencies...
call npm install --production
if errorlevel 1 (
  echo.
  echo ERROR: npm install failed!
  pause
  exit /b 1
)
echo.
echo Installation complete!
pause
