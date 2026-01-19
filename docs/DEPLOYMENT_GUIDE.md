# 🚀 DEWANTARA Production Deployment Guide

This guide explains how to deploy the DEWANTARA app on a VPS using aaPanel with separate frontend and backend domains.

---

## 📋 Prerequisites

- VPS with Ubuntu 20.04+ (Recommended: 2GB RAM, 2 CPU cores)
- aaPanel installed ([installation guide](https://www.aapanel.com/new/download.html))
- Domain names configured:
    - `dewantara.cloud` → Frontend
    - `api.dewantara.cloud` → Backend
- SSL certificates (Let's Encrypt via aaPanel)

---

## 🎯 Deployment Architecture

```
Frontend (React)    →  https://dewantara.cloud (Nginx)
Backend (FastAPI)   →  https://api.dewantara.cloud (Uvicorn + Nginx)
Communication       →  WebSocket (wss://)
```

---

## 📦 Part 1: Backend Deployment (FastAPI)

### 1.1 Install Python Dependencies on Server

```bash
# SSH into your VPS
ssh root@your-server-ip

# Navigate to your project directory
cd /www/wwwroot/api.dewantara.cloud

# Install Python 3.9+ (if not already installed)
apt update
apt install python3.9 python3.9-venv python3-pip

# Create virtual environment
python3.9 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

### 1.2 Create `requirements.txt` (if not exists)

Create `/backend/requirements.txt`:

```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-multipart==0.0.6
opencv-python-headless==4.9.0.80
mediapipe==0.10.9
scikit-learn==1.4.0
joblib==1.3.2
numpy==1.26.3
```

### 1.3 Upload Backend Files

Upload the following to `/www/wwwroot/api.dewantara.cloud/`:

- `backend/main.py`
- `backend/models/` (folder with .pkl files)
- `backend/requirements.txt`

### 1.4 Create Systemd Service for Auto-Restart

Create `/etc/systemd/system/dewantara-api.service`:

```ini
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
```

Enable and start the service:

```bash
systemctl daemon-reload
systemctl enable dewantara-api
systemctl start dewantara-api
systemctl status dewantara-api
```

### 1.5 Configure Nginx for Backend (in aaPanel)

1. Open aaPanel → Website → Add Site
2. Domain: `api.dewantara.cloud`
3. Create site, then click **Settings** → **SSL** → Install Let's Encrypt
4. Go to **Config Files**, replace with:

```nginx
server {
    listen 80;
    server_name api.dewantara.cloud;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.dewantara.cloud;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # WebSocket configuration
    location /ws {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # Regular API endpoints
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🎨 Part 2: Frontend Deployment (React)

### 2.1 Build React App Locally

On your **local machine** (not the server):

```bash
cd /path/to/dewantara-beta/frontend

# Install dependencies (if not already done)
npm install

# Build production version
npm run build
```

This creates an optimized `build/` folder with static files.

### 2.2 Upload Build Files to Server

Upload the entire `build/` folder to:

```
/www/wwwroot/dewantara.cloud/
```

You can use:

- **SCP**: `scp -r build/* root@your-server:/www/wwwroot/dewantara.cloud/`
- **FileZilla** or **WinSCP** (GUI option)
- **aaPanel File Manager** (upload via browser)

### 2.3 Configure Nginx for Frontend (in aaPanel)

1. aaPanel → Website → Add Site
2. Domain: `dewantara.cloud`
3. Create site, install SSL (Let's Encrypt)
4. Go to **Settings** → **Config Files**, replace with:

```nginx
server {
    listen 80;
    server_name dewantara.cloud www.dewantara.cloud;
    return 301 https://dewantara.cloud$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.dewantara.cloud;
    return 301 https://dewantara.cloud$request_uri;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
}

server {
    listen 443 ssl http2;
    server_name dewantara.cloud;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /www/wwwroot/dewantara.cloud;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # React Router support (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## ✅ Part 3: Verification & Testing

### 3.1 Test Backend API

```bash
# Test WebSocket connection
curl -i -N -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: test" \
  https://api.dewantara.cloud/ws

# Check service status
systemctl status dewantara-api
```

### 3.2 Test Frontend

1. Open browser: `https://dewantara.cloud`
2. Check browser console for WebSocket connection
3. Test gamification features
4. Verify camera permissions work

### 3.3 Check Logs

**Backend logs:**

```bash
journalctl -u dewantara-api -f
```

**Nginx logs:**

```bash
tail -f /www/wwwlogs/api.dewantara.cloud.log
tail -f /www/wwwlogs/dewantara.cloud.log
```

---

## 🔄 Part 4: Update Workflow

### Update Backend:

```bash
cd /www/wwwroot/api.dewantara.cloud/backend
# Upload new main.py or models
systemctl restart dewantara-api
```

### Update Frontend:

```bash
# On local machine:
npm run build

# Upload build/* to /www/wwwroot/dewantara.cloud/
# No restart needed (static files)
```

---

## 🛠️ Troubleshooting

### Issue: WebSocket Connection Failed

**Check:**

1. Backend service running: `systemctl status dewantara-api`
2. Port 8000 open: `netstat -tulpn | grep 8000`
3. Nginx config has WebSocket headers
4. CORS origins include production domain

### Issue: Camera Not Working

**Fix:**

- Ensure site uses HTTPS (browsers require HTTPS for camera access)
- Check SSL certificate is valid
- Verify browser permissions

### Issue: 502 Bad Gateway

**Fix:**

```bash
# Check if backend is running
systemctl status dewantara-api

# Check backend logs
journalctl -u dewantara-api -n 50

# Restart services
systemctl restart dewantara-api
systemctl restart nginx
```

---

## 📊 Performance Optimization

### 1. Enable HTTP/2

Already configured in Nginx (see config above)

### 2. Add CDN (Optional)

Use Cloudflare for:

- DDoS protection
- Global CDN caching
- Free SSL

### 3. Monitor Resources

```bash
# Check CPU/RAM usage
htop

# Monitor disk space
df -h
```

---

## 🔒 Security Checklist

- ✅ SSL certificates installed (HTTPS)
- ✅ CORS configured with specific origins (not `*`)
- ✅ Firewall enabled (UFW or aaPanel Firewall)
- ✅ Only ports 80, 443, 22 open
- ✅ Regular system updates: `apt update && apt upgrade`
- ✅ Strong SSH password or key-based auth

---

## 📝 Quick Command Reference

```bash
# Backend Management
systemctl start dewantara-api      # Start backend
systemctl stop dewantara-api       # Stop backend
systemctl restart dewantara-api    # Restart backend
systemctl status dewantara-api     # Check status

# Nginx Management
nginx -t                           # Test config
systemctl reload nginx             # Reload config
systemctl restart nginx            # Restart Nginx

# Logs
journalctl -u dewantara-api -f     # Follow backend logs
tail -f /www/wwwlogs/*.log         # Follow Nginx logs
```

---

## 🎉 Deployment Complete!

Your DEWANTARA app is now live:

- Frontend: **https://dewantara.cloud**
- Backend API: **https://api.dewantara.cloud**

**Next Steps:**

1. Test all features on production
2. Monitor logs for errors
3. Set up automated backups
4. Configure domain email (optional)

---

## 📞 Support

For issues or questions:

- Check logs first
- Review this guide
- Verify all config files match examples

**Made with ❤️ by DEWANTARA Team**
