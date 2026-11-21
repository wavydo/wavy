# 🌊 Wavy - Full Stack Startup Guide

## ⚡ Quick Start (One Command)

Run this **single command** to start both backend AND mobile app automatically:

```bash
npm run dev
```

**That's it!** You'll see both logs side by side:
- `[backend]` in cyan = Backend server
- `[expo]` in magenta = Mobile app

---

## What You Should See

When you run `npm run dev`, the output looks like this:

```
[backend] Server starting on port 5000...
[expo] Starting Metro Bundler...
[backend] ✓ Database connected
[expo] Metro waiting on exp://192.168.x.x:8081
[backend] Server ready at http://localhost:5000
[expo] 
[expo]  › Scan QR code with Expo Go
[expo]  exp://u.expo.dev/...
```

**How to tell if both are running:**
- Look for `[backend]` prefix = backend logs (cyan)
- Look for `[expo]` prefix = mobile app logs (magenta)
- You should see the Expo QR code appear in the terminal

---

## Alternative Commands

If you need to run services separately:

```bash
# Backend only (port 5000)
npm run dev:backend

# Mobile app only (Expo)
npm run dev:mobile

# Both with different config
npm run dev:all
```

---

## Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Backend API | http://localhost:5000 | Node.js + Express |
| Web App | http://localhost:5000 | Frontend (Vite) |
| Admin Panel | http://localhost:5000/admin/auth | Admin dashboard |
| Mobile App | Scan QR in terminal | Expo app |
| Production | https://wavy.onrender.com | Live deployment |

---

## Mobile App Connection

The mobile app **automatically detects** the environment:

- **Development (with Metro)**: Uses tunnel URL from Expo
- **Production (no Metro)**: Uses https://wavy.onrender.com

**To use the mobile app:**
1. Install **Expo Go** on your phone
2. Run `npm run dev`
3. Wait for the QR code to appear (look for `[expo]` logs)
4. Scan the QR code with Expo Go
5. App opens and connects to backend via tunnel

---

## Stopping Services

Press **Ctrl+C** in the terminal. Both services will stop automatically.

---

## Troubleshooting

### "I don't see the Expo app starting"

1. **Verify you're in the correct directory:**
   ```bash
   pwd
   # Should show: /Users/mignnez/Desktop/terra copy 7/tradearray-fukushima
   ```

2. **Run the diagnostic script:**
   ```bash
   ./test-dev.sh
   ```
   This will check all dependencies and paths.

3. **Look for [expo] prefix in the logs**
   Scroll through the terminal output. If you see `[backend]` but not `[expo]`, something went wrong with the mobile app startup.

### "Command not found: concurrently"

```bash
npm install
```

### Backend won't start

```bash
# Check if port 5000 is in use
lsof -ti:5000 | xargs kill -9

# Then restart
npm run dev
```

### Expo won't connect / QR not appearing

```bash
# Stop everything with Ctrl+C
# Then restart with clear cache
npm run dev:mobile -- --clear
```

### App can't reach backend

1. Verify backend is running (look for `[backend]` logs)
2. Check that tunnel mode is active in Expo logs
3. Make sure you're connected to the internet (tunnel requires connection)

### "Permission denied" for test-dev.sh

```bash
chmod +x test-dev.sh
```

---

## Environment Variables

Required in `.env` file (in `tradearray-fukushima/` directory):

```env
DATABASE_URL=your_postgresql_url
SESSION_SECRET=your_session_secret
NFC_ENCRYPTION_KEY=your_encryption_key
RESEND_API_KEY=your_resend_api_key
NODE_ENV=development
```

---

## Production Deployment

### Backend (Render)

**Build command:**
```bash
npm install && npm run build
```

**Start command:**
```bash
npm start
```

**Environment variables on Render:**
- `DATABASE_URL` - Your PostgreSQL URL
- `SESSION_SECRET` - Random string for sessions
- `NFC_ENCRYPTION_KEY` - Random string for NFC encryption
- `RESEND_API_KEY` - Your Resend API key
- `NODE_ENV` - `production`

### Mobile App (EAS Build)

```bash
cd ../tapp-mobile
eas build --platform android
eas build --platform ios
```

---

## Latest Mobile UI Fixes

Recent updates include:
- ✅ Privacy Settings card: Fixed text overlapping icon
- ✅ Rewards card: Fixed dark corner artifact in top-left
- ✅ Learn More page: Fully responsive on mobile
- ✅ Notification cards: Proper height, no extra space
- ✅ Proximity circles: Repositioned to not overlap

All fixes are live after running `npm run build` and deploying to production.

---

## Development Workflow

1. **Start development:**
   ```bash
   npm run dev
   ```

2. **Make changes** to code (auto-reloads)

3. **Test on mobile:**
   - Shake phone → Reload
   - Or: In terminal press `r` for reload

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Deploy:**
   ```bash
   git add -A
   git commit -m "Your changes"
   git push
   ```
   Render will auto-deploy from the main branch.

---

## Need Help?

Run the diagnostic:
```bash
./test-dev.sh
```

This checks:
- ✅ Concurrently installation
- ✅ Mobile app directory exists
- ✅ Expo dependencies
- ✅ Dev script syntax

If all checks pass but it still doesn't work, check the console logs carefully for error messages.
