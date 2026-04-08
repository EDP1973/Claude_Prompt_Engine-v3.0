#!/bin/bash

################################################################################
# Claude Prompt Engine - Stop Script
# Gracefully stops the running server
################################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════════════════════╗
║               Claude Prompt Engine - Stopping Server                        ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Find and kill Node.js server processes
PIDS=$(pgrep -f "node.*server.js")

if [ -z "$PIDS" ]; then
    echo -e "${GREEN}✓${NC} No running server found"
    exit 0
fi

echo -e "${GREEN}Found running server process(es): $PIDS${NC}"

# Kill gracefully first
for PID in $PIDS; do
    echo -e "${GREEN}Stopping process $PID...${NC}"
    kill -TERM $PID 2>/dev/null || true
done

# Wait a moment
sleep 2

# Force kill if still running
for PID in $PIDS; do
    if kill -0 $PID 2>/dev/null; then
        echo -e "${RED}Force killing process $PID...${NC}"
        kill -KILL $PID 2>/dev/null || true
    fi
done

echo -e "${GREEN}✓ Server stopped${NC}"
