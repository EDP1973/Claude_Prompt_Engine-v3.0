# Register Claude Prompt Engine as Windows Service
# Run this with Administrator privileges

$AppDir = Split-Path -Parent $PSCommandPath
$AppName = "ClaudePromptEngine"

Write-Host "Creating Windows Service..."

# Create service
New-Service -Name $AppName `
  -DisplayName "Claude Prompt Engine" `
  -Description "Claude Prompt Engine - AI Prompt Generator" `
  -BinaryPathName "node.exe \"$AppDir\server.js\"" `
  -StartupType Automatic

# Start service
Start-Service -Name $AppName

Write-Host "Service created and started!"
Write-Host "Access at: http://localhost:3000"
