@echo off
echo Starting Backend Server...
cd /d "%~dp0backend"
call npm run dev
pause
