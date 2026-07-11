# How to Run This Project

## MongoDB Atlas

This project uses **MongoDB Atlas** for all data (parents, children, progress).

### First-time Atlas setup

```powershell
cd backend
npm run setup-atlas
```

Follow the prompts with your Atlas username, password, and cluster host.  
Then verify:

```powershell
npm run test-connection
```

See **[SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)** for full Atlas setup steps.

---

## Run

**Terminal 1 – Backend:**

```powershell
cd backend
npm run dev
```

**Terminal 2 – Frontend:**

```powershell
cd frontend
npm run dev
```

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

Expected backend output:

- `✅ MongoDB connected successfully`
- `🚀 Backend running at http://localhost:5000`

---

## Quick start (Windows)

After Atlas is configured, double-click `run.bat` to start both servers.
