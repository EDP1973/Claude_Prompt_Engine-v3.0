#!/bin/bash
# RPM pre-uninstall script
# Runs before package removal

set -e

# Stop service
systemctl stop claude-prompt-engine 2>/dev/null || true

exit 0
