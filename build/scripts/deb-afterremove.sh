#!/bin/bash
# Debian after-remove script
# Runs after package removal

set -e

# Disable and remove service
systemctl disable claude-prompt-engine 2>/dev/null || true
rm -f /etc/systemd/system/claude-prompt-engine.service
systemctl daemon-reload 2>/dev/null || true

# Remove user
userdel -r claude-engine 2>/dev/null || true

echo "Claude Prompt Engine uninstalled successfully!"

exit 0
