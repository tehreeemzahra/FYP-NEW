# CyberQuest Mobile Apps (Android & iOS)

The React website runs as native apps via [Capacitor](https://capacitorjs.com/) — same UI, games, and API on both platforms.

| Platform | Build on | Open with |
|----------|----------|-----------|
| **Android** | Windows, Mac, Linux | Android Studio |
| **iOS / App Store** | **Mac only** | Xcode |

## Prerequisites

- Node.js 18+
- MongoDB + backend running
- **Android:** [Android Studio](https://developer.android.com/studio)
- **iOS:** Mac with [Xcode](https://developer.apple.com/xcode/) + [Apple Developer](https://developer.apple.com) account for App Store

## Quick start

### 1. Start the backend

```bash
cd backend
npm run dev
```

The API listens on `0.0.0.0:5000` for phones and emulators.

### 2. Run on Android (Windows OK)

```bash
npm run app:android
```

In Android Studio, click **Run**.

- **Emulator:** uses `http://10.0.2.2:5000` automatically
- **Physical phone:** set `frontend/.env` → `VITE_API_URL=http://YOUR_PC_IP:5000`, then `npm run cap:sync`

### 3. Run on iPhone (Mac required)

```bash
npm run app:ios
```

In Xcode, pick a simulator or device and press **Run** (⌘R).

- **Simulator:** uses `http://127.0.0.1:5000` automatically
- **Physical iPhone:** set `VITE_API_URL=http://YOUR_MAC_IP:5000` in `frontend/.env`, then sync

## App Store (iPhone)

Full submission guide: **[README_APP_STORE_IOS.md](./README_APP_STORE_IOS.md)**

Summary:

1. Deploy backend with **HTTPS**
2. Set `frontend/.env.production` with `VITE_API_URL=https://your-api.com`
3. `npm run build:app:store --prefix frontend` then `npx cap sync ios`
4. Archive in Xcode → upload to App Store Connect

## Scripts

| Command | Description |
|---------|-------------|
| `npm run app:android` | Build + sync + open Android Studio |
| `npm run app:ios` | Build + sync + open Xcode |
| `npm run app:run:android` | Build + sync + run Android via CLI |
| `npm run app:run:ios` | Build + sync + run iOS via CLI |
| `npm run cap:sync --prefix frontend` | Rebuild web app into native projects |

## After frontend changes

```bash
cd frontend
npm run cap:sync
```

Re-run from Android Studio or Xcode.

## Project layout

```
frontend/
├── capacitor.config.ts
├── android/                 # Google Play / Android Studio
├── ios/                     # App Store / Xcode
├── src/lib/native.ts        # API URL per platform
└── src/lib/initNative.ts    # Status bar & splash
```

## App identity

- **Bundle / package:** `com.cyberquest.app`
- **Name:** CyberQuest

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Cannot connect to backend | Backend running? Set `VITE_API_URL` for physical devices |
| Blank screen | Run `npm run cap:sync` after code changes |
| iOS build on Windows | Use a Mac — iOS cannot be built on Windows |
| App Store HTTP rejection | Use HTTPS in `.env.production` for release builds |
