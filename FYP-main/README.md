# CyberQuest

Educational cybersecurity game with parent and child flows.  
Frontend (React + Vite) and Backend (Express + MongoDB).

## Structure

```
Fyp/
├── frontend/     # React + Vite + Tailwind
├── backend/      # Express + Mongoose + MongoDB
├── package.json  # Root scripts (run frontend + backend)
└── .env.example
```

## Prerequisites

- Node.js 18+
- **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)** cluster (free tier works)

## Setup

### 1. Backend (MongoDB + API)

```bash
cd backend
npm install
```

Create `backend/.env` from the example:

```bash
cp .env.example .env
```

Configure Atlas (see **[SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)**):

```powershell
cd backend
powershell -ExecutionPolicy Bypass -File setup-atlas.ps1
```

Or edit `backend/.env` manually:

- `MONGODB_URI` – Atlas URI, e.g. `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/cyberquest?retryWrites=true&w=majority`
- `JWT_SECRET` – any long random string for production

### 2. Frontend

```bash
cd frontend
npm install
```

Optional: create `frontend/.env` and set `VITE_API_URL=http://localhost:5000` if your API runs elsewhere.

### 3. Root (optional)

From the project root:

```bash
npm install
```

## Run

**Option A – Both from root**

```bash
npm run dev
```

**Option B – Separate terminals**

```bash
# Terminal 1 – Backend (must run first so frontend can call API)
cd backend && npm run dev

# Terminal 2 – Frontend
cd frontend && npm run dev
```

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173` (or next free port)

## API (Backend)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/parent/register` | - | Register parent + child |
| POST | `/api/auth/parent/login` | - | Parent login |
| POST | `/api/auth/child/login` | - | Child login (name + code) |
| GET | `/api/progress` | Child | Get game progress |
| PUT | `/api/progress` | Child | Save game progress |
| GET | `/api/parent/children` | Parent | List children |
| GET | `/api/parent/child/:id/progress` | Parent | Child’s progress |
| GET | `/api/child/parent` | Child | Parent info (profile) |

## Mobile apps (Android & iPhone)

The website runs as native apps via Capacitor:

- **Android:** `npm run app:android` (Windows, Mac, Linux)
- **iPhone / App Store:** `npm run app:ios` (Mac + Xcode only)

See **[README_MOBILE_APP.md](./README_MOBILE_APP.md)** for device setup and **[README_APP_STORE_IOS.md](./README_APP_STORE_IOS.md)** for App Store submission.

## MongoDB

Collections used:

- `parents` – email, hashed password, name
- `children` – name, age, 2‑digit `loginCode`, `parentId`
- `gameprogresses` – `childId`, `completedLevels[]`, `lastPlayed`
