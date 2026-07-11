# Deploy CyberQuest (Web + API + Play Store)

Deploy in this order:

1. **Backend API** → Render (free)
2. **Web app** → Vercel (free)
3. **Android app** → Google Play (optional)

MongoDB Atlas is already your database — keep using it for production.

---

## Part 1 — Push code to GitHub

Render and Vercel deploy from GitHub.

```powershell
cd "c:\Users\bashi\OneDrive\Desktop\FYP-main (2)\FYP-main (1)\FYP-main"
git init
git add .
git commit -m "Prepare CyberQuest for deployment"
gh auth login
gh repo create cyberquest-app --private --source=. --push
```

Use any repo name you like. **Do not commit** `backend/.env` (already in `.gitignore`).

---

## Part 2 — Deploy backend (Render)

1. Open [dashboard.render.com](https://dashboard.render.com) and sign up (free).
2. **New +** → **Blueprint**.
3. Connect your GitHub repo → Render reads `render.yaml` automatically.
4. When prompted, set these **secret** environment variables:

| Variable | Value |
|----------|--------|
| `MONGODB_URI` | Your Atlas URI from `backend/.env` |
| `JWT_SECRET` | Long random string (e.g. 48+ characters) |
| `ADMIN_PASSWORD` | Strong admin password (not `admin123`) |

5. Click **Apply** and wait for deploy (~3–5 min).
6. Copy your live API URL, e.g. `https://cyberquest-api.onrender.com`
7. Test in browser: `https://cyberquest-api.onrender.com/health` → `{"ok":true}`

### Atlas after deploy

In [MongoDB Atlas](https://cloud.mongodb.com) → **Network Access** → ensure **0.0.0.0/0** is allowed (Render uses dynamic IPs).

---

## Part 3 — Deploy web app (Vercel)

1. Open [vercel.com](https://vercel.com) and sign up with GitHub.
2. **Add New Project** → import your GitHub repo.
3. Set **Root Directory** to `frontend`.
4. Add environment variable:

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://cyberquest-api.onrender.com` (your Render URL) |

5. Click **Deploy**.
6. Open your Vercel URL (e.g. `https://cyberquest-app.vercel.app`).

Register a parent account on the live site to confirm API + database work.

---

## Part 4 — Android / Google Play

After Part 2 is live (HTTPS API required):

```powershell
cd frontend
copy .env.production.example .env.production
```

Edit `.env.production`:

```
VITE_API_URL=https://cyberquest-api.onrender.com
```

Build and open Android Studio:

```powershell
npm run build:app:store
npx cap sync android
npm run app:android
```

In Android Studio:

1. **Build → Generate Signed Bundle / APK** → **Android App Bundle (AAB)**
2. Create a keystore (save it safely)
3. Upload the `.aab` to [Google Play Console](https://play.google.com/console) ($25 one-time)

See **README_MOBILE_APP.md** for device testing.

---

## Quick reference

| What | Where | URL |
|------|--------|-----|
| Database | MongoDB Atlas | `cyberquest` |
| API | Render | `https://cyberquest-api.onrender.com` |
| Website | Vercel | `https://your-app.vercel.app` |
| Android | Play Store | After AAB upload |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| API `/health` fails | Check Render logs; verify `MONGODB_URI` |
| Web app “Cannot connect to backend” | `VITE_API_URL` must match Render URL; redeploy Vercel |
| MongoDB timeout on Render | Atlas Network Access → allow `0.0.0.0/0` |
| Render sleeps on free tier | First request after idle may take ~30s |
| Play Store rejects app | API must use **HTTPS** (Render provides this) |

---

## Redeploy after code changes

```powershell
git add .
git commit -m "Update app"
git push
```

Render and Vercel auto-redeploy on push.

For Android: rebuild AAB, bump `versionCode` in `frontend/android/app/build.gradle`, upload new release.
