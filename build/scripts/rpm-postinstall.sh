#!/bin/bash
# RPM post-install script
# Runs after package installation

set -e

APP_DIR="/opt/claude-prompt-engine"
APP_USER="claude-engine"
APP_GROUP="claude-engine"

# Set proper ownership
chown -R "$APP_USER:$APP_GROUP" "$APP_DIR" || true
chmod -R 755 "$APP_DIR" || true
chmod -R 755 "$APP_DIR/logs" || true

# Install Node.js dependencies
cd "$APP_DIR"
if [ -f "package.json" ]; then
    sudo -u "$APP_USER" npm install --production || true
fi

# Create systemd service
if [ ! -f "/etc/systemd/system/claude-prompt-engine.service" ]; then
    cat > /etc/systemd/system/claude-prompt-engine.service << 'EOF'
[Unit]
Description=Claude Prompt Engine
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=claude-engine
Group=claude-engine
WorkingDirectory=/opt/claude-prompt-engine
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/node /opt/claude-prompt-engine/server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload || true
    systemctl enable claude-prompt-engine || true
    systemctl start claude-prompt-engine || true
fi

echo "Claude Prompt Engine installed successfully!"
echo "Access the application at: http://localhost:3000"

exit 0
