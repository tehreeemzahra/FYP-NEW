# Install and run CyberQuest

**Do this in a normal Command Prompt or PowerShell (Start → type `cmd` or `PowerShell`), not only in Cursor.**

---

## Step 1: Install backend

```cmd
cd c:\Users\Shifu\Downloads\Fyp\backend
npm install
```

Wait until it finishes without errors.

---

## Step 2: Install frontend

```cmd
cd c:\Users\Shifu\Downloads\Fyp\frontend
npm install
```

Wait until it finishes without errors.

---

## Step 3: Start backend

In the **same** or a **new** CMD window:

```cmd
cd c:\Users\Shifu\Downloads\Fyp\backend
npm run dev
```

Leave this window open. You should see:
- `Backend running at http://localhost:5000`
- `MongoDB connected` (or an error if Atlas is wrong)

---

## Step 4: Start frontend

Open a **second** CMD window:

```cmd
cd c:\Users\Shifu\Downloads\Fyp\frontend
npm run dev
```

You should see:
- `Local: http://localhost:5173` (or 5174, 5175)

---

## Step 5: Open the game

In Chrome (or any browser) go to: **http://localhost:5173**

---

## Or use the script

After Step 1 and 2 are done once, you can use:

**Double‑click:** `c:\Users\Shifu\Downloads\Fyp\run.bat`

It will start backend and frontend in two new windows.

---

## If `npm install` fails

- Check internet.
- In CMD run: `npm config set prefer-online true` then try again.
- If you see `only-if-cached`: run the commands in a **new** CMD from the Windows Start menu, not from Cursor.
