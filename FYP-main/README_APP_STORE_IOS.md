# CyberQuest – iPhone / App Store

The iOS project lives at `frontend/ios/`. Building and submitting to the App Store **requires a Mac** with **Xcode** and an **Apple Developer account** ($99/year).

> **Windows note:** You can develop the React app on Windows. Copy the project to a Mac (or use a Mac cloud service) to build and upload to the App Store.

## Prerequisites

| Requirement | Details |
|-------------|---------|
| Mac | macOS with Xcode 15+ |
| Apple Developer | [developer.apple.com](https://developer.apple.com) – enroll in Apple Developer Program |
| Production API | **HTTPS** backend (App Store rejects plain HTTP to remote servers) |
| App icon | 1024×1024 PNG – replace `frontend/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png` |

## Local development (Simulator)

1. Start the backend on your Mac:

   ```bash
   cd backend && npm run dev
   ```

2. Open the iOS project:

   ```bash
   npm run app:ios
   ```

   Or from `frontend/`: `npm run cap:ios`

3. In Xcode, select an **iPhone Simulator** and press **Run** (⌘R).

The Simulator uses `http://127.0.0.1:5000` automatically.

**Physical iPhone on the same Wi‑Fi** (testing only):

```bash
# frontend/.env
VITE_API_URL=http://YOUR_MAC_LAN_IP:5000
```

Then `npm run cap:sync` and run again from Xcode.

## Production build for App Store

### 1. Deploy your API with HTTPS

Host the Express backend (e.g. Railway, Render, AWS, Azure) and note the URL:

```
https://api.your-domain.com
```

### 2. Set production environment

```bash
cd frontend
cp .env.production.example .env.production
```

Edit `.env.production`:

```
VITE_API_URL=https://api.your-domain.com
```

### 3. Build and sync

```bash
npm run build:app:store
npx cap sync ios
```

### 4. Configure signing in Xcode

1. Open `frontend/ios/App/App.xcworkspace` (or run `npm run cap:ios`)
2. Select the **App** target → **Signing & Capabilities**
3. Set your **Team** (Apple Developer account)
4. Confirm **Bundle Identifier**: `com.cyberquest.app` (must match App Store Connect)

### 5. Archive and upload

1. Xcode menu: **Product → Destination → Any iOS Device**
2. **Product → Archive**
3. In the Organizer: **Distribute App → App Store Connect → Upload**

## App Store Connect checklist

Create the app at [appstoreconnect.apple.com](https://appstoreconnect.apple.com):

| Field | Suggested value |
|-------|-----------------|
| Name | CyberQuest |
| Bundle ID | `com.cyberquest.app` |
| Primary category | Education |
| Age rating | Complete the questionnaire (kids’ educational content) |
| Privacy Policy URL | **Required** – host a privacy policy page |
| Support URL | Your support or project page |
| Screenshots | 6.7", 6.5", 5.5" iPhone sizes (use Simulator → screenshot) |
| Description | Educational cybersecurity games for children with parent dashboard |
| Keywords | cybersecurity, kids, education, safety, privacy |
| Copyright | Your name / institution |
| Export compliance | App uses only standard encryption → **No** (already set in `Info.plist`) |

### Kids / family apps

Because CyberQuest targets children:

- Consider **Kids Category** or mark as suitable for ages 4+ in the age rating
- Provide a clear **privacy policy** (no third-party ads, what data is collected: parent email, child name, progress)
- Parent registration and dashboard align with Apple’s expectations for child-directed apps

## Scripts

| Command | Description |
|---------|-------------|
| `npm run app:ios` | Build, sync, open Xcode (from project root) |
| `npm run app:run:ios` | Build, sync, run on simulator/device via CLI |
| `npm run build:app:store --prefix frontend` | Production web build with `.env.production` |
| `npm run cap:sync --prefix frontend` | Rebuild and copy assets into `ios/` and `android/` |

## App identity

| Setting | Value |
|---------|-------|
| Bundle ID | `com.cyberquest.app` |
| Display name | CyberQuest |
| Version | 1.0 (update in Xcode → App target → General) |
| Min iOS | 15.0 |

Change the bundle ID in `frontend/capacitor.config.ts` **before** first App Store upload if `com.cyberquest.app` is unavailable.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| “Cannot connect to backend” on device | Set `VITE_API_URL` to your Mac’s LAN IP; ensure backend listens on `0.0.0.0` |
| App Store rejection (ATS / HTTP) | Use **HTTPS** in `.env.production` for release builds |
| Signing errors | Xcode → Settings → Accounts → add Apple ID; select Team on target |
| Missing icon | Add 1024×1024 PNG to AppIcon asset catalog |
| Archive greyed out | Select “Any iOS Device” as destination, not a Simulator |

## Project files

```
frontend/ios/
├── App/App.xcodeproj      # Xcode project
├── App/App/Info.plist     # ATS, orientations, export compliance
├── App/App/PrivacyInfo.xcprivacy
└── App/App/Assets.xcassets/AppIcon.appiconset/
```
