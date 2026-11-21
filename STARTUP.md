# 🌊 Wavy - Full Stack Startup Guide

## Quick Start

### Option 1: Start Everything (Recommended)

**Using npm script:**
```bash
npm run dev:all
```

**Or using shell script:**
```bash
./start-all.sh
```

This will start:
- ✅ Backend server (http://localhost:3001)
- ✅ Expo mobile app (with tunnel)

---

## Individual Services

### Start Backend Only
```bash
npm run dev
```
Server runs on http://localhost:3001

### Start Mobile App Only
```bash
npm run dev:mobile
```
Or manually:
```bash
cd ../tapp-mobile
npx expo start --tunnel
```

---

## What Happens When You Run `dev:all`

1. **Backend starts first** on port 3001
2. **Script waits** for backend to be ready
3. **Expo launches** with tunnel mode
4. **QR code appears** - scan with Expo Go

---

## Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Backend API | http://localhost:3001 | Node.js + Express |
| Web App | http://localhost:3001 | Frontend (Vite) |
| Admin Panel | http://localhost:3001/admin/auth | Admin dashboard |
| Mobile App | Tunnel URL in terminal | Expo app |
| Production | https://wavy.onrender.com | Deployed backend |

---

## Mobile App Connection

The mobile app **automatically detects** the environment:

- **Development (with Metro)**: Uses your local IP (192.168.x.x:3001)
- **Production (no Metro)**: Uses https://wavy.onrender.com

To use the app:
1. Install **Expo Go** on your phone
2. Run `npm run dev:all`
3. Scan the QR code that appears
4. App opens and connects to backend

---

## Stopping Services

Press **Ctrl+C** to stop all services gracefully.

---

## Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use
lsof -ti:3001 | xargs kill -9
```

### Expo won't connect
```bash
# Restart with clear cache
cd ../tapp-mobile
npx expo start --clear --tunnel
```

### App can't reach backend
1. Check backend is running on 3001
2. Check your IP in terminal output
3. Verify CORS allows your origin

---

## Environment Variables

Required in `.env`:
```env
DATABASE_URL=your_postgresql_url
SESSION_SECRET=your_secret
NFC_ENCRYPTION_KEY=your_key
NODE_ENV=development
RESEND_API_KEY=your_resend_key
```

---

## Production Deployment

**Backend:** Automatically deployed on Render
**Mobile:** Build with EAS:
```bash
cd ../tapp-mobile
eas build --platform android
```
