# Quick Fix for MongoDB Connection Error

## Current Error: `querySrv ETIMEOUT`

This error means your computer cannot resolve the MongoDB Atlas DNS address.

## ✅ IMMEDIATE FIXES (Try in this order):

### 1. **Check if MongoDB Atlas Cluster is PAUSED** ⚠️ MOST COMMON ISSUE

Free-tier clusters auto-pause after 60 days of inactivity.

**Steps:**
1. Go to: https://cloud.mongodb.com
2. Sign in with your account
3. Select your project
4. Look for your cluster (should be named something like "Cluster0" or "qm")
5. If you see a **"Resume"** or **"Resume Cluster"** button, click it
6. Wait 1-2 minutes for the cluster to start
7. Restart your backend: `npm run dev`

### 2. **Configure Network Access** 🔒 REQUIRED

MongoDB Atlas blocks all connections by default for security.

**Steps:**
1. In MongoDB Atlas dashboard, click **"Network Access"** in the left menu
2. Click **"+ ADD IP ADDRESS"** button
3. Click **"ALLOW ACCESS FROM ANYWHERE"** (this adds `0.0.0.0/0`)
4. Click **"Confirm"**
5. Wait 1-2 minutes for changes to apply
6. Restart your backend: `npm run dev`

### 3. **Verify Database User Credentials** 👤

Make sure the username and password match what's in your `.env` file.

**Current settings:**
- Username: `bashirkashaf123`
- Password: `Kashaf12345` (as in your `.env` file)

**To check in Atlas:**
1. Go to **"Database Access"** in Atlas
2. Find user `bashirkashaf123`
3. Verify the password matches `Kashaf12345`
4. If password is different, either:
   - Update the password in Atlas to match `.env`, OR
   - Update `.env` to match Atlas password

### 4. **Test Your Connection** 🧪

Run this command to test the connection separately:

```powershell
cd c:\Users\areeb\Desktop\Fyp\Fyp\backend
npm run test-connection
```

This will give you detailed error information.

### 5. **Try Different Network** 📶

If DNS is blocked by your network/firewall:

- Try using a **mobile hotspot**
- Disable **VPN** if you're using one
- Try a different **Wi-Fi network**

## ✅ Current Connection String

Your `.env` file has:
```
MONGODB_URI=mongodb+srv://bashirkashaf123:Kashaf12345@qm.jo9zpcz.mongodb.net/cyberquest?retryWrites=true&w=majority&appName=qm
```

This looks correct! The issue is likely:
- Cluster is paused (most common)
- Network Access not configured
- DNS/firewall blocking

## 🚀 After Fixing

Once you've fixed the issues above:

```powershell
cd c:\Users\areeb\Desktop\Fyp\Fyp\backend
npm run dev
```

You should see:
```
🚀 Backend running at http://localhost:5000
✅ MongoDB connected successfully
Database: cyberquest
```

## 📞 Still Not Working?

If you've tried all the above and it still doesn't work:

1. **Check your internet connection** - Can you access other websites?
2. **Try the test connection script** - `npm run test-connection`
3. **Check MongoDB Atlas status** - Go to Atlas dashboard and verify cluster is running
4. **Contact your network administrator** - Some corporate networks block MongoDB

The backend server will still run on `http://localhost:5000` even if MongoDB isn't connected, but API endpoints won't work until MongoDB is connected.
