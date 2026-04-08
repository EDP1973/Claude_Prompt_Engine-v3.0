#!/bin/bash

################################################################################
# Claude Prompt Engine - Start Script
# Starts the server on port 3000
################################################################################

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════════════════════╗
║                 Claude Prompt Engine - Starting Server                      ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${GREEN}Installing dependencies...${NC}"
    npm install
fi

# Start the server
echo -e "${GREEN}🚀 Starting Claude Prompt Engine server...${NC}"
echo ""
npm run web
