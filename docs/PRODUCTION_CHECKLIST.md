# ✅ DEWANTARA Production Deployment Checklist

Use this checklist to ensure successful deployment to production.

---

## 📋 Pre-Deployment

### Code Review

- [ ] All console.log() statements reviewed (keep only essential logs)
- [ ] No hardcoded API URLs (using `config.js`)
- [ ] Error handling implemented in all API calls
- [ ] Loading states implemented for async operations
- [ ] All features tested locally with `npm start` and `python main.py`

### Configuration Files

- [ ] `frontend/src/config.js` created and tested
- [ ] `frontend/public/manifest.json` updated with app details
- [ ] `backend/main.py` CORS middleware configured
- [ ] `backend/requirements.txt` includes all dependencies

### Security

- [ ] CORS origins restricted to specific domains (not `*`)
- [ ] No sensitive data in frontend code
- [ ] Environment variables reviewed
- [ ] SSL certificates ready for HTTPS

---

## 🚀 Deployment Steps

### Backend (FastAPI)

- [ ] VPS access configured
- [ ] Python 3.9+ installed on server
- [ ] Virtual environment created: `python3.9 -m venv venv`
- [ ] Dependencies installed: `pip install -r requirements.txt`
- [ ] Backend files uploaded to `/www/wwwroot/api.dewantara.cloud/backend/`
- [ ] Model files (.pkl) uploaded to `backend/models/`
- [ ] Systemd service created: `/etc/systemd/system/dewantara-api.service`
- [ ] Service enabled: `systemctl enable dewantara-api`
- [ ] Service started: `systemctl start dewantara-api`
- [ ] Service status verified: `systemctl status dewantara-api`
- [ ] Backend accessible at `http://localhost:8000` on server

### Nginx - Backend (api.dewantara.cloud)

- [ ] Domain `api.dewantara.cloud` added in aaPanel
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] Nginx config updated with WebSocket support
- [ ] Nginx config tested: `nginx -t`
- [ ] Nginx reloaded: `systemctl reload nginx`
- [ ] WebSocket endpoint accessible: `wss://api.dewantara.cloud/ws`

### Frontend (React)

- [ ] Production build created: `npm run build`
- [ ] Build folder size checked (should be ~2-5 MB)
- [ ] Build files uploaded to `/www/wwwroot/dewantara.cloud/`
- [ ] All static assets (images, videos) uploaded

### Nginx - Frontend (dewantara.cloud)

- [ ] Domain `dewantara.cloud` added in aaPanel
- [ ] Domain `www.dewantara.cloud` redirects to main domain
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] Nginx config includes SPA routing support
- [ ] Gzip compression enabled
- [ ] Static asset caching configured
- [ ] Security headers added

---

## 🧪 Testing

### Backend Testing

- [ ] Backend service running: `systemctl status dewantara-api`
- [ ] Backend logs clean: `journalctl -u dewantara-api -n 50`
- [ ] No error messages in logs
- [ ] Port 8000 listening: `netstat -tulpn | grep 8000`

### Frontend Testing

- [ ] Site loads: `https://dewantara.cloud`
- [ ] No console errors in browser DevTools
- [ ] All pages accessible (/, /belajar, /artikel, etc.)
- [ ] React Router navigation works
- [ ] Images and videos load correctly

### Integration Testing

- [ ] WebSocket connects successfully (check browser console)
- [ ] Camera permission prompt appears
- [ ] Camera feed displays correctly
- [ ] AI predictions working (hand detection)
- [ ] Gamification features functional:
    - [ ] Adventure Map displays
    - [ ] Level selection works
    - [ ] Level progression saves (localStorage)
    - [ ] XP and stars update correctly
    - [ ] Feedback overlays show

### Mobile Testing

- [ ] Site loads on mobile browser
- [ ] Responsive design works (all breakpoints)
- [ ] Camera works on mobile
- [ ] Touch interactions functional
- [ ] PWA prompt appears (optional)

---

## 🔍 Post-Deployment Monitoring

### First 24 Hours

- [ ] Check backend logs every 2 hours: `journalctl -u dewantara-api -f`
- [ ] Monitor Nginx access logs: `tail -f /www/wwwlogs/dewantara.cloud.log`
- [ ] Check server resources: `htop`
- [ ] Verify disk space: `df -h`
- [ ] Test from multiple devices/browsers

### Performance Checks

- [ ] Page load time < 3 seconds
- [ ] WebSocket latency acceptable
- [ ] No memory leaks in backend
- [ ] CPU usage normal (< 50% average)

### Security Audit

- [ ] SSL certificate valid (check with browser)
- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] CORS headers correct in browser Network tab
- [ ] No mixed content warnings
- [ ] Security headers present (X-Frame-Options, etc.)

---

## 🐛 Common Issues & Fixes

### Issue: WebSocket Connection Failed

**Symptoms:** "WebSocket error" in console, camera detection not working

**Fix:**

1. Check backend service: `systemctl status dewantara-api`
2. Verify Nginx WebSocket config (see DEPLOYMENT_GUIDE.md)
3. Check CORS origins in `backend/main.py`
4. Restart services: `systemctl restart dewantara-api nginx`

---

### Issue: 502 Bad Gateway

**Symptoms:** Nginx shows 502 error page

**Fix:**

1. Backend not running: `systemctl start dewantara-api`
2. Check backend logs: `journalctl -u dewantara-api -n 50`
3. Verify port 8000 open: `netstat -tulpn | grep 8000`
4. Check Nginx error log: `tail -f /www/wwwlogs/api.dewantara.cloud.error.log`

---

### Issue: Camera Not Working

**Symptoms:** Permission denied or black screen

**Fix:**

1. Ensure site uses HTTPS (browsers require SSL for camera)
2. Check browser permissions (Settings → Site Settings)
3. Test on different browser
4. Verify `getUserMedia` API supported

---

### Issue: Routes Return 404 on Refresh

**Symptoms:** `/belajar` works when navigating from home, but 404 on direct access

**Fix:**

- Add to Nginx config:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

### Issue: Static Assets Not Loading

**Symptoms:** Images/CSS missing, console shows 404 errors

**Fix:**

1. Verify files uploaded to correct directory
2. Check file permissions: `chmod -R 755 /www/wwwroot/dewantara.cloud/`
3. Clear browser cache
4. Check Nginx root path in config

---

## 📊 Performance Optimization Checklist

- [ ] Enable Gzip compression (Nginx)
- [ ] Set cache headers for static assets
- [ ] Minify JS/CSS (done by `npm run build`)
- [ ] Optimize images (WebP format recommended)
- [ ] Enable HTTP/2 (Nginx)
- [ ] Consider CDN (Cloudflare)
- [ ] Lazy load images/components
- [ ] Reduce bundle size if > 5MB

---

## 🔄 Update Procedure

### To Update Backend:

```bash
# 1. Upload new main.py or model files
# 2. Restart service
systemctl restart dewantara-api
# 3. Check logs
journalctl -u dewantara-api -n 20
```

### To Update Frontend:

```bash
# 1. On local machine:
npm run build

# 2. Upload build/* to server
# 3. Clear CDN cache (if using)
# 4. Test site
```

---

## 🎯 Go-Live Criteria

Site is ready for production when:

- ✅ All checklist items completed
- ✅ SSL certificate valid
- ✅ All features tested and working
- ✅ No console errors
- ✅ Mobile responsive
- ✅ WebSocket stable for 10+ minutes
- ✅ Logs clean (no critical errors)
- ✅ Performance acceptable (< 3s page load)

---

## 📝 Final Notes

**Before announcing to users:**

1. Test from 3+ different devices
2. Have rollback plan ready
3. Monitor for first hour actively
4. Prepare support channels

**After go-live:**

1. Monitor logs daily for first week
2. Collect user feedback
3. Fix critical bugs immediately
4. Plan next iteration

---

**Deployment Date:** ********\_********  
**Deployed By:** ********\_********  
**Production URL:** https://dewantara.cloud  
**Backend URL:** https://api.dewantara.cloud

---

🎉 **Good luck with your deployment!**
