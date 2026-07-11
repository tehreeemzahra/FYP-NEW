# Configure MongoDB Atlas for CyberQuest
# Run in PowerShell from the backend folder:
#   powershell -ExecutionPolicy Bypass -File setup-atlas.ps1

$ErrorActionPreference = "Stop"
$backendDir = $PSScriptRoot
$envFile = Join-Path $backendDir ".env"

Write-Host "=== CyberQuest MongoDB Atlas Setup ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "You need a MongoDB Atlas cluster first:"
Write-Host "  1. https://cloud.mongodb.com → Create free cluster"
Write-Host "  2. Database Access → Add user (remember username + password)"
Write-Host "  3. Network Access → Allow Access from Anywhere (0.0.0.0/0)"
Write-Host "  4. Connect → Drivers → copy the Node.js connection string"
Write-Host ""

$username = Read-Host "Atlas database username"
$password = Read-Host "Atlas database password" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
  [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
)
$clusterHost = Read-Host "Cluster host (e.g. cluster0.xxxxx.mongodb.net)"
$dbName = Read-Host "Database name [cyberquest]"
if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "cyberquest" }

$encodedUser = [uri]::EscapeDataString($username)
$encodedPass = [uri]::EscapeDataString($passwordPlain)
$mongoUri = "mongodb+srv://${encodedUser}:${encodedPass}@${clusterHost}/${dbName}?retryWrites=true&w=majority&appName=CyberQuest"

$jwt = Read-Host "JWT secret (press Enter for auto-generated)"
if ([string]::IsNullOrWhiteSpace($jwt)) {
  $jwt = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 48 | ForEach-Object { [char]$_ })
}

$envContent = @"
PORT=5000
MONGODB_URI=$mongoUri
MONGODB_DB_NAME=$dbName
JWT_SECRET=$jwt
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
"@

Set-Content -Path $envFile -Value $envContent -Encoding UTF8
Write-Host ""
Write-Host "Wrote $envFile" -ForegroundColor Green
Write-Host "Testing connection..." -ForegroundColor Yellow

Set-Location $backendDir
npm run test-connection
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "Connection failed. If you see querySrv errors, open Atlas → Connect and use the standard connection string instead of mongodb+srv." -ForegroundColor Yellow
  exit 1
}

Write-Host ""
Write-Host "Atlas is configured. Start the backend with: npm run dev" -ForegroundColor Green
