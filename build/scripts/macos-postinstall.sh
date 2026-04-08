#!/bin/bash
# macOS post-install script
# Runs after PKG installation

set -e

APP_DIR="/Applications/claude-prompt-engine"
PLIST_DIR="$HOME/Library/LaunchAgents"
PLIST_FILE="$PLIST_DIR/com.claude-prompt-engine.plist"

# Create LaunchAgent for auto-start
mkdir -p "$PLIST_DIR"

cat > "$PLIST_FILE" << 'PLIST_EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.claude-prompt-engine</string>
    <key>Program</key>
    <string>/usr/bin/node</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Applications/claude-prompt-engine/server.js</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/var/log/claude-engine.log</string>
    <key>StandardErrorPath</key>
    <string>/var/log/claude-engine-error.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>NODE_ENV</key>
        <string>production</string>
        <key>PORT</key>
        <string>3000</string>
    </dict>
</dict>
</plist>
PLIST_EOF

# Install dependencies
cd "$APP_DIR"
if [ -f "package.json" ]; then
    npm install --production || true
fi

# Load LaunchAgent
launchctl load "$PLIST_FILE" 2>/dev/null || true

echo "Claude Prompt Engine installed successfully!"
echo "Access the application at: http://localhost:3000"

exit 0
