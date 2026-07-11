/**
 * Global music preferences — single source of truth for the entire app.
 *
 * Persisted in localStorage (`userSettings`):
 * - musicEnabled → isMusicEnabled (default true)
 * - musicVolume  → master volume 0–1 (default 0.8)
 *
 * isMuted is derived as !isMusicEnabled.
 * All UI (dashboard mute, profile toggle) must call setMusicEnabled / toggleMusic here.
 */

const SETTINGS_KEY = 'userSettings';
export const MUSIC_SETTINGS_EVENT = 'cyberquest:music-settings-changed';

export type UserSettings = {
  notifications?: boolean;
  soundEffects?: boolean;
  musicEnabled?: boolean;
  musicVolume?: number;
  parentalReports?: boolean;
};

export type MusicState = {
  isMusicEnabled: boolean;
  isMuted: boolean;
  volume: number;
};

const DEFAULT_VOLUME = 0.8;
const settingsListeners = new Set<() => void>();

function readSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? (JSON.parse(raw) as UserSettings) : {};
  } catch {
    return {};
  }
}

function writeSettings(patch: Partial<UserSettings>): UserSettings {
  const next = { ...readSettings(), ...patch };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  return next;
}

function notifyListeners() {
  const state = getMusicState();
  settingsListeners.forEach((cb) => cb());
  window.dispatchEvent(new CustomEvent(MUSIC_SETTINGS_EVENT, { detail: state }));
}

/** Call once at app startup (main.tsx) before any music hooks run. */
export function initMusicSettings(): MusicState {
  return getMusicState();
}

export function getMusicState(): MusicState {
  const s = readSettings();
  const isMusicEnabled = s.musicEnabled !== false;
  const volume =
    typeof s.musicVolume === 'number' && s.musicVolume >= 0 && s.musicVolume <= 1
      ? s.musicVolume
      : DEFAULT_VOLUME;
  return { isMusicEnabled, isMuted: !isMusicEnabled, volume };
}

/** @deprecated Use getMusicState().isMusicEnabled */
export function getMusicEnabled(): boolean {
  return getMusicState().isMusicEnabled;
}

export function getMusicVolume(): number {
  return getMusicState().volume;
}

export function setMusicEnabled(enabled: boolean) {
  writeSettings({ musicEnabled: enabled });
  notifyListeners();
}

export function setMusicVolume(volume: number) {
  writeSettings({ musicVolume: Math.min(1, Math.max(0, volume)) });
  notifyListeners();
}

export function toggleMusicEnabled(): boolean {
  const next = !getMusicEnabled();
  setMusicEnabled(next);
  return next;
}

export function subscribeMusicSettings(listener: () => void): () => void {
  settingsListeners.add(listener);
  return () => settingsListeners.delete(listener);
}

export function loadUserSettings(): Required<Omit<UserSettings, 'musicVolume'>> & { musicVolume: number } {
  const s = readSettings();
  const state = getMusicState();
  return {
    notifications: s.notifications !== false,
    soundEffects: s.soundEffects !== false,
    musicEnabled: state.isMusicEnabled,
    musicVolume: state.volume,
    parentalReports: s.parentalReports !== false,
  };
}

export function saveUserSettings(settings: UserSettings) {
  writeSettings(settings);
  notifyListeners();
}
