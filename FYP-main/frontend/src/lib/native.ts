import { Capacitor } from '@capacitor/core';

/** True when running inside the Capacitor native shell (Android / iOS). */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * API base URL for native builds. Web dev uses Vite proxy (empty string).
 * Android emulator: 10.0.2.2. iOS Simulator: localhost.
 * Physical devices and App Store builds must set VITE_API_URL (HTTPS for production).
 */
export function getNativeApiBase(): string {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (envUrl) return envUrl.replace(/\/$/, '');

  if (!isNativeApp()) return '';

  const platform = Capacitor.getPlatform();
  if (platform === 'android') return 'http://10.0.2.2:5000';
  if (platform === 'ios') return 'http://127.0.0.1:5000';
  return '';
}
