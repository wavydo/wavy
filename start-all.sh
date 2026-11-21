#!/bin/bash

# Colors for output
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     🌊 Starting Wavy Full Stack      ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down all services...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Start backend
echo -e "${CYAN}[Backend]${NC} Starting Node.js server..."
cd "$(dirname "$0")"
NODE_ENV=development npx tsx server/index.ts &
BACKEND_PID=$!

# Wait for backend to be ready (check port 3001)
echo -e "${CYAN}[Backend]${NC} Waiting for server to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:3001 > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend ready!${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}⚠ Backend took too long to start, but continuing...${NC}"
    fi
done

# Give it an extra second to settle
sleep 2

# Start Expo
echo ""
echo -e "${MAGENTA}[Expo]${NC} Starting Expo development server..."
MOBILE_DIR="$HOME/Desktop/terra copy 7/tapp-mobile"

if [ -d "$MOBILE_DIR" ]; then
    cd "$MOBILE_DIR"
    npx expo start --tunnel &
    EXPO_PID=$!
    
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║         ✓ All services running!       ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}Backend:${NC}  http://localhost:3001"
    echo -e "${MAGENTA}Expo:${NC}     Tunnel URL will appear above"
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
    echo ""
    
    # Keep script running
    wait
else
    echo -e "${YELLOW}⚠ Mobile directory not found at $MOBILE_DIR${NC}"
    echo -e "${CYAN}Backend is still running on http://localhost:3001${NC}"
    wait $BACKEND_PID
fi
