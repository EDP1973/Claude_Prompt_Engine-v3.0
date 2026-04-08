@echo off
echo Claude Prompt Engine - Portable Edition
echo.
call npm install --production
if errorlevel 1 (
  echo ERROR: npm install failed!
  pause
  exit /b 1
)
echo.
echo Starting application...
set NODE_ENV=production
set PORT=3000
start http://localhost:3000
node server.js
