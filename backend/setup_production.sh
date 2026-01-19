#!/bin/bash

# DEWANTARA Production Setup Script for Backend
# This script sets up the FastAPI backend on a VPS with aaPanel

echo "🚀 DEWANTARA Backend Setup Script"
echo "=================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Configuration
PROJECT_DIR="/www/wwwroot/api.dewantara.cloud"
BACKEND_DIR="$PROJECT_DIR/backend"
VENV_DIR="$PROJECT_DIR/venv"
SERVICE_FILE="/etc/systemd/system/dewantara-api.service"

echo "📍 Project Directory: $PROJECT_DIR"
echo "📍 Backend Directory: $BACKEND_DIR"
echo ""

# Step 1: Check Python version
echo "1️⃣ Checking Python version..."
python3 --version

if ! command -v python3.9 &> /dev/null; then
    echo "⚠️  Python 3.9+ not found. Installing..."
    apt update
    apt install -y python3.9 python3.9-venv python3-pip
else
    echo "✅ Python 3.9+ installed"
fi

# Step 2: Create virtual environment
echo ""
echo "2️⃣ Creating virtual environment..."
if [ -d "$VENV_DIR" ]; then
    echo "⚠️  Virtual environment already exists. Skipping..."
else
    python3.9 -m venv $VENV_DIR
    echo "✅ Virtual environment created"
fi

# Step 3: Activate and install dependencies
echo ""
echo "3️⃣ Installing Python dependencies..."
source $VENV_DIR/bin/activate

if [ -f "$BACKEND_DIR/requirements.txt" ]; then
    pip install --upgrade pip
    pip install -r $BACKEND_DIR/requirements.txt
    echo "✅ Dependencies installed"
else
    echo "❌ requirements.txt not found in $BACKEND_DIR"
    echo "Please upload backend files first!"
    exit 1
fi

# Step 4: Create systemd service
echo ""
echo "4️⃣ Creating systemd service..."
cat > $SERVICE_FILE << 'EOF'
[Unit]
Description=DEWANTARA FastAPI Backend
After=network.target

[Service]
Type=simple
User=www
WorkingDirectory=/www/wwwroot/api.dewantara.cloud/backend
Environment="PATH=/www/wwwroot/api.dewantara.cloud/venv/bin"
ExecStart=/www/wwwroot/api.dewantara.cloud/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

echo "✅ Service file created: $SERVICE_FILE"

# Step 5: Set permissions
echo ""
echo "5️⃣ Setting permissions..."
chown -R www:www $PROJECT_DIR
chmod -R 755 $PROJECT_DIR
echo "✅ Permissions set"

# Step 6: Enable and start service
echo ""
echo "6️⃣ Enabling and starting service..."
systemctl daemon-reload
systemctl enable dewantara-api
systemctl start dewantara-api

sleep 2

# Check service status
if systemctl is-active --quiet dewantara-api; then
    echo "✅ Service is running!"
else
    echo "❌ Service failed to start. Checking logs..."
    journalctl -u dewantara-api -n 20 --no-pager
    exit 1
fi

# Step 7: Test backend
echo ""
echo "7️⃣ Testing backend..."
sleep 1

if curl -s http://localhost:8000 > /dev/null; then
    echo "✅ Backend is responding on port 8000"
else
    echo "⚠️  Backend not responding. Check logs with:"
    echo "   journalctl -u dewantara-api -f"
fi

# Final summary
echo ""
echo "=================================="
echo "✅ Backend Setup Complete!"
echo "=================================="
echo ""
echo "📋 Service Management:"
echo "   Start:   systemctl start dewantara-api"
echo "   Stop:    systemctl stop dewantara-api"
echo "   Restart: systemctl restart dewantara-api"
echo "   Status:  systemctl status dewantara-api"
echo "   Logs:    journalctl -u dewantara-api -f"
echo ""
echo "🔧 Next Steps:"
echo "   1. Configure Nginx for api.dewantara.cloud"
echo "   2. Install SSL certificate"
echo "   3. Test WebSocket connection"
echo "   4. Deploy frontend to dewantara.cloud"
echo ""
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""
