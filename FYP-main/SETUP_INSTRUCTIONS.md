# Project Setup Instructions

## MongoDB Atlas (required)

CyberQuest stores all accounts, children, and game progress in **MongoDB Atlas** (cloud database).

### Quick setup

1. Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. **Database Access** → Add Database User (username + password)
3. **Network Access** → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`)
4. **Connect** → **Drivers** → copy the Node.js connection string
5. Run the setup script from the `backend` folder:

```powershell
cd backend
powershell -ExecutionPolicy Bypass -File setup-atlas.ps1
```

Or manually copy `backend/.env.example` to `backend/.env` and paste your Atlas URI.  
Make sure the URI includes the database name: `/cyberquest`

Example:

```
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/cyberquest?retryWrites=true&w=majority&appName=CyberQuest
```

6. Test the connection:

```powershell
npm run test-connection
```

You should see `✅ Connection successful!`

### If connection fails with `querySrv` errors

Some networks block Atlas SRV DNS lookups. In Atlas:

- **Connect** → choose **Connect your application** or **Drivers**
- If SRV fails, use the **standard connection string** (`mongodb://...` with host list) instead of `mongodb+srv://`
- Paste that full string into `MONGODB_URI` in `backend/.env`

### Collections created automatically

When users register and play, Mongoose creates:

- `parents` – parent accounts
- `children` – child profiles and login codes
- `gameprogresses` – level completion data
- `admins` – admin accounts
- `adminsettings` – platform settings

No manual schema migration is needed.

---

## Run the project

**Terminal 1 – Backend:**

```powershell
cd backend
npm run dev
```

Wait for `✅ MongoDB connected successfully`

**Terminal 2 – Frontend:**

```powershell
cd frontend
npm run dev
```

Open **http://localhost:5173**

---

## Prerequisites

- Node.js 18+ ([nodejs.org](https://nodejs.org/))
- MongoDB Atlas cluster (free tier is fine)

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `npm` not recognized | Install Node.js and restart the terminal |
| `MONGODB_URI not found` | Create `backend/.env` from `backend/.env.example` |
| `querySrv ECONNREFUSED` | Cluster deleted/paused, or use standard connection string |
| `Authentication failed` | Wrong username/password in `.env` |
| API errors in browser | Backend not running or MongoDB not connected |
