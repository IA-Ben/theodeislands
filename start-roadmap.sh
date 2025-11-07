#!/bin/bash

# 🗺️ Start Roadmap System
# Quick start script for AI Collaborative Development

echo "🗺️ Starting AI Collaborative Roadmap System..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Kill any process on port 3000
echo "${YELLOW}Step 1: Cleaning up port 3000...${NC}"
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
echo "${GREEN}✓ Port 3000 is clean${NC}"
echo ""

# Step 2: Start dev server
echo "${YELLOW}Step 2: Starting development server...${NC}"
echo "${BLUE}Running: npm run dev${NC}"
echo ""
echo "${GREEN}✓ Server will start on http://localhost:3000${NC}"
echo ""

# Step 3: Instructions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "${GREEN}🎉 Ready to start!${NC}"
echo ""
echo "📍 Open in your browser:"
echo "   ${BLUE}http://localhost:3000/roadmap${NC}"
echo ""
echo "⌨️  Keyboard Shortcuts:"
echo "   ${BLUE}Shift + A${NC} - Toggle AI Collaboration Panel"
echo "   ${BLUE}Shift + D${NC} - Toggle Presenter Mode"
echo ""
echo "📚 Documentation:"
echo "   ${BLUE}QUICK_START.md${NC} - 5-minute quick start"
echo "   ${BLUE}AI_COLLABORATIVE_WORKFLOW.md${NC} - Full workflow guide"
echo "   ${BLUE}ROADMAP_SYSTEM.md${NC} - System documentation"
echo ""
echo "🚀 Quick Start:"
echo "   1. Click '+ New Feature Card'"
echo "   2. Fill in details & assign AIs"
echo "   3. Click '📝 Build Spec'"
echo "   4. Request AI help"
echo "   5. Drag card to Build Panel"
echo "   6. Watch the magic happen! ✨"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start the server
npm run dev

