# Fix: MongoDB connection failed

Common errors: `querySrv ETIMEOUT`, `querySrv ECONNREFUSED`, `ECONNREFUSED`

These errors indicate issues connecting to MongoDB Atlas. Try these solutions in order:

---

## 1. **Resume the cluster (very common)**

Free-tier (M0) clusters **auto-pause after 60 days** of no use.

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) and sign in.
2. Open your project and select **Cluster0**.
3. If you see **"Resume"** or **"Resume cluster"**, click it and wait 1–2 minutes.
4. Restart your backend: stop it (Ctrl+C) and run `npm run dev` again.

---

## 2. **Allow access from anywhere (Network Access)**

1. In Atlas left menu: **Network Access**.
2. Click **"+ ADD IP ADDRESS"**.
3. Click **"ALLOW ACCESS FROM ANYWHERE"** (adds `0.0.0.0/0`).
4. Click **Confirm**.
5. Wait 1–2 minutes, then restart your backend.

---

## 3. **Check the database user**

1. In Atlas: **Database Access** → select user **bashirkashaf123**.
2. Ensure:
   - Password is `Kashaf` (as set in `.env`).
   - User has **"Atlas admin"** or **"Read and write to any database"**.
3. If you changed the password in Atlas, update `MONGODB_URI` in `backend/.env` to use the new password.

---

## 4. **Use a different network (Wi‑Fi / DNS / firewall)**

Some networks block MongoDB or SRV DNS:

- Try **mobile hotspot** or another Wi‑Fi.
- Try **disabling VPN** if you use one.

---

## 5. **Use the standard connection string (if SRV is blocked)**

If `mongodb+srv://` still fails, use the **standard** (non-SRV) URI from Atlas:

1. In Atlas: **Database** → **Connect** on your cluster.
2. **Connect your application** → Node.js.
3. Copy the connection string.
4. If you see **"Edit the connection string"** or an option to **use a non-SRV / standard format**, use that.
5. Or in **Connect** → **Connect using MongoDB Compass** (or **Drivers**) and check for a **"Standard connection string"** or **"Full connection string"** that uses `mongodb://` (not `mongodb+srv://`) and explicit host(s) and port `27017`.
6. Put that full URI in `backend/.env` as `MONGODB_URI=...`, making sure the password and database name (`cyberquest`) are correct.

---

## 6. **Confirm `.env` format**

In `backend/.env`, `MONGODB_URI` must be a **single line**, no spaces, and the password must **not** contain `@`, `#`, `:`, `/`. If it does, [URL-encode](https://www.w3schools.com/tags/ref_urlencode.asp) those characters (e.g. `@` → `%40`).

Example (current format):

```
MONGODB_URI=mongodb+srv://bashirkashaf123:Kashaf@qm.jo9zpcz.mongodb.net/cyberquest?retryWrites=true&w=majority&appName=qm
```

**Note:** Make sure the connection string includes:
- Database name (e.g., `/cyberquest`)
- Query parameters (`?retryWrites=true&w=majority&appName=qm`)

---

## 7. **Test the connection**

You can test the connection separately:

```bash
cd c:\Users\areeb\Desktop\Fyp\Fyp\backend
node test-connection.js
```

This will give you detailed error information.

---

After any change, restart the backend:

```bash
cd c:\Users\areeb\Desktop\Fyp\Fyp\backend
npm run dev
```

You should see: **✅ MongoDB connected successfully**.
