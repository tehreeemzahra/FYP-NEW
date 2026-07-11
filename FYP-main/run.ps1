# CyberQuest - Install deps and run backend + frontend
# Run in PowerShell: .\run.ps1
# Or: powershell -ExecutionPolicy Bypass -File run.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host "=== Installing backend dependencies ===" -ForegroundColor Cyan
Set-Location "$root\backend"
npm install
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n=== Installing frontend dependencies ===" -ForegroundColor Cyan
Set-Location "$root\frontend"
npm install
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n=== Starting backend (new window) ===" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; npm run dev"

Start-Sleep -Seconds 3

Write-Host "=== Starting frontend (new window) ===" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

Write-Host "`nBackend and frontend are starting in separate windows." -ForegroundColor Yellow
Write-Host "Wait for 'MongoDB connected' and 'Local: http://localhost:5173' then open: http://localhost:5173" -ForegroundColor Yellow
