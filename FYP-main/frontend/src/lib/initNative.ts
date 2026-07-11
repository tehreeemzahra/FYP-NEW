import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export async function initNativeApp(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#4a8bb8' });
  } catch {
    // Status bar plugin unavailable on some platforms
  }

  try {
    await SplashScreen.hide();
  } catch {
    // Splash may already be hidden
  }
}
