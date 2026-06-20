# ScholarPath — start Expo on Android emulator or connected device.
# Usage (PowerShell): .\scripts\start-android.ps1

$ErrorActionPreference = "Stop"

$sdkRoot = Join-Path $env:LOCALAPPDATA "Android\Sdk"
$adb = Join-Path $sdkRoot "platform-tools\adb.exe"
$emulator = Join-Path $sdkRoot "emulator\emulator.exe"

if (-not (Test-Path $adb)) {
  Write-Host "Android SDK not found at $sdkRoot" -ForegroundColor Red
  Write-Host "Install Android Studio and SDK Platform-Tools first."
  exit 1
}

$env:ANDROID_HOME = $sdkRoot
$env:ANDROID_SDK_ROOT = $sdkRoot
$env:Path = "$(Join-Path $sdkRoot 'platform-tools');$(Join-Path $sdkRoot 'emulator');$env:Path"

$devices = & $adb devices | Select-String "device$"
if (-not $devices) {
  Write-Host "No Android device/emulator detected. Starting Pixel_10_Pro_XL..." -ForegroundColor Yellow
  if (-not (Test-Path $emulator)) {
    Write-Host "Emulator binary not found." -ForegroundColor Red
    exit 1
  }
  Start-Process -FilePath $emulator -ArgumentList "-avd", "Pixel_10_Pro_XL"
  Write-Host "Waiting for emulator to boot (up to 2 minutes)..."
  & $adb wait-for-device
  $attempts = 0
  while ($attempts -lt 60) {
    $booted = & $adb shell getprop sys.boot_completed 2>$null
    if ($booted -match "1") { break }
    Start-Sleep -Seconds 2
    $attempts++
  }
}

Set-Location (Split-Path $PSScriptRoot -Parent)
Write-Host "Starting Expo for Android..." -ForegroundColor Green
npx expo start --android --clear
