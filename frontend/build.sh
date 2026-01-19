#!/bin/bash

# DEWANTARA Frontend Build Script
# This script builds the React app for production deployment

echo "🎨 DEWANTARA Frontend Build Script"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from the frontend directory"
    exit 1
fi

# Step 1: Clean previous build
echo "1️⃣ Cleaning previous build..."
if [ -d "build" ]; then
    rm -rf build
    echo -e "${GREEN}✅ Old build removed${NC}"
else
    echo -e "${YELLOW}⚠️  No previous build found${NC}"
fi

# Step 2: Install dependencies
echo ""
echo "2️⃣ Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Step 3: Verify config.js exists
echo ""
echo "3️⃣ Verifying configuration..."
if [ -f "src/config.js" ]; then
    echo -e "${GREEN}✅ config.js found${NC}"
    echo "   - Production WebSocket: wss://api.dewantara.cloud/ws"
    echo "   - Development WebSocket: ws://localhost:8000/ws"
else
    echo -e "${RED}❌ config.js not found!${NC}"
    echo "Please create src/config.js before building"
    exit 1
fi

# Step 4: Run production build
echo ""
echo "4️⃣ Building production bundle..."
echo "This may take 1-2 minutes..."
echo ""

npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Build successful!${NC}"
else
    echo ""
    echo -e "${RED}❌ Build failed!${NC}"
    echo "Please check the error messages above"
    exit 1
fi

# Step 5: Analyze build
echo ""
echo "5️⃣ Build Analysis:"
echo "-----------------------------------"

if [ -d "build" ]; then
    BUILD_SIZE=$(du -sh build | cut -f1)
    JS_FILES=$(find build/static/js -name "*.js" | wc -l)
    CSS_FILES=$(find build/static/css -name "*.css" | wc -l)
    
    echo "   📦 Total Size: $BUILD_SIZE"
    echo "   📄 JS Files: $JS_FILES"
    echo "   🎨 CSS Files: $CSS_FILES"
    echo ""
    
    # Check if build is too large
    BUILD_SIZE_MB=$(du -sm build | cut -f1)
    if [ $BUILD_SIZE_MB -gt 10 ]; then
        echo -e "${YELLOW}⚠️  Warning: Build size is large (${BUILD_SIZE_MB}MB)${NC}"
        echo "   Consider code splitting or lazy loading"
    else
        echo -e "${GREEN}✅ Build size is optimal${NC}"
    fi
else
    echo -e "${RED}❌ Build directory not found!${NC}"
    exit 1
fi

# Step 6: Create deployment package
echo ""
echo "6️⃣ Creating deployment package..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ARCHIVE_NAME="dewantara-frontend-${TIMESTAMP}.tar.gz"

tar -czf $ARCHIVE_NAME -C build .

if [ -f "$ARCHIVE_NAME" ]; then
    ARCHIVE_SIZE=$(du -sh $ARCHIVE_NAME | cut -f1)
    echo -e "${GREEN}✅ Deployment package created: $ARCHIVE_NAME${NC}"
    echo "   Size: $ARCHIVE_SIZE"
else
    echo -e "${YELLOW}⚠️  Could not create archive (not critical)${NC}"
fi

# Final instructions
echo ""
echo "===================================="
echo -e "${GREEN}✅ Build Complete!${NC}"
echo "===================================="
echo ""
echo "📋 Deployment Options:"
echo ""
echo "Option 1: Upload build folder directly"
echo "   Upload contents of 'build/' to:"
echo "   /www/wwwroot/dewantara.cloud/"
echo ""
echo "Option 2: Upload compressed archive"
echo "   1. Upload: $ARCHIVE_NAME"
echo "   2. SSH to server and run:"
echo "      cd /www/wwwroot/dewantara.cloud"
echo "      tar -xzf $ARCHIVE_NAME"
echo "      rm $ARCHIVE_NAME"
echo ""
echo "🔧 Next Steps:"
echo "   1. Upload files to server"
echo "   2. Configure Nginx (see DEPLOYMENT_GUIDE.md)"
echo "   3. Install SSL certificate"
echo "   4. Test the site: https://dewantara.cloud"
echo ""
echo "📖 Full deployment guide: ../DEPLOYMENT_GUIDE.md"
echo ""
