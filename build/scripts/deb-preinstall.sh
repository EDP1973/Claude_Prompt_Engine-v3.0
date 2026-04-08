#!/bin/bash
# Debian pre-install script
# Runs before package installation

set -e

# Create application user if it doesn't exist
if ! id "claude-engine" &>/dev/null 2>&1; then
    useradd -r -s /bin/bash -m -d /var/lib/claude-engine claude-engine
fi

# Stop service if already running
if systemctl is-active --quiet claude-prompt-engine 2>/dev/null; then
    systemctl stop claude-prompt-engine || true
fi

exit 0
