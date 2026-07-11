@echo off
title CyberQuest
cd /d "%~dp0"

echo Fixing npm cache settings (helps if install failed before)...
call npm config set prefer-online true 2>nul

echo.
echo === 1/4 Installing BACKEND dependencies ===
cd backend
if not exist "node_modules" (
  call npm install
  if errorlevel 1 (
    echo.
    echo [ERROR] Backend npm install failed. Try in a NEW CMD (Start -^> cmd):
    echo   cd /d "%~dp0backend"
    echo   npm install
    echo.
    cd ..
    pause
    exit /b 1
  )
) else (
  echo Already installed.
)
cd ..

echo.
echo === 2/4 Installing FRONTEND dependencies ===
cd frontend
if not exist "node_modules" (
  call npm install
  if errorlevel 1 (
    echo.
    echo [ERROR] Frontend npm install failed. Try in a NEW CMD:
    echo   cd /d "%~dp0frontend"
    echo   npm install
    echo.
    cd ..
    pause
    exit /b 1
  )
) else (
  echo Already installed.
)
cd ..

echo.
echo === 3/4 Starting BACKEND (new window) ===
start "CyberQuest Backend" cmd /k "cd /d %~dp0backend && npm run dev"

echo Waiting 5 seconds for backend to connect to MongoDB...
timeout /t 5 /nobreak >nul

echo.
echo === 4/4 Starting FRONTEND (new window) ===
start "CyberQuest Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Done. Two CMD windows opened:
echo   - Backend: wait for "MongoDB connected" and "Backend running at http://localhost:5000"
echo   - Frontend: wait for "Local: http://localhost:5173"
echo.
echo Then open in Chrome:  http://localhost:5173
echo.
pause
