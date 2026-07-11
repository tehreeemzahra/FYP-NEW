# Build CyberQuest debug APK
# Requires: JDK 17+, Android SDK (Android Studio), backend running on same Wi-Fi

$ErrorActionPreference = "Stop"
$frontend = $PSScriptRoot
$android = Join-Path $frontend "android"
$sdk = "$env:LOCALAPPDATA\Android\Sdk"

if (-not (Test-Path $sdk)) {
  Write-Host "Android SDK not found. Install Android Studio first:" -ForegroundColor Red
  Write-Host "  https://developer.android.com/studio" -ForegroundColor Yellow
  exit 1
}

$javaHome = "C:\Program Files\Android\Android Studio\jbr"
if (-not (Test-Path $javaHome)) {
  $javaHome = "C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot"
}
if (-not (Test-Path $javaHome)) {
  $javaHome = $env:JAVA_HOME
}
$env:JAVA_HOME = $javaHome
$env:ANDROID_HOME = $sdk
$env:Path = "$javaHome\bin;$sdk\platform-tools;" + $env:Path

@"
sdk.dir=$($sdk -replace '\\','\\')
"@ | Set-Content -Path (Join-Path $android "local.properties") -Encoding ASCII

Write-Host "Building web app..." -ForegroundColor Cyan
Set-Location $frontend
npm run build:app:store
npx cap sync android

Write-Host "Building APK (first run may take several minutes)..." -ForegroundColor Cyan
Set-Location $android
.\gradlew.bat assembleDebug

$apk = Join-Path $android "app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apk) {
  Write-Host ""
  Write-Host "APK ready:" -ForegroundColor Green
  Write-Host $apk
  Write-Host ""
  Write-Host "Install: copy APK to phone, or run: adb install `"$apk`"" -ForegroundColor Yellow
  Write-Host "API: https://cyberquest-api-jd5l.onrender.com (no local backend needed)" -ForegroundColor Yellow
} else {
  Write-Host "Build finished but APK not found." -ForegroundColor Red
  exit 1
}
