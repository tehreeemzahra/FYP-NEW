import { useCallback, useEffect, useState } from 'react';
import {
  getMusicState,
  initMusicSettings,
  MUSIC_SETTINGS_EVENT,
  setMusicEnabled as persistMusicEnabled,
  setMusicVolume as persistMusicVolume,
  subscribeMusicSettings,
  toggleMusicEnabled,
  type MusicState,
} from './musicSettingsStore';

/**
 * React hook — mirrors global musicSettingsStore into component state.
 * Dashboard mute button and Profile → Settings must both use this hook.
 */
export function useMusicSettings() {
  const [state, setState] = useState<MusicState>(() => getMusicState());

  useEffect(() => {
    const sync = () => setState(getMusicState());
    const unsubStore = subscribeMusicSettings(sync);

    const onEvent = (event: Event) => {
      const detail = (event as CustomEvent<MusicState>).detail;
      if (detail?.isMusicEnabled !== undefined) {
        setState(detail);
      } else {
        sync();
      }
    };

    window.addEventListener(MUSIC_SETTINGS_EVENT, onEvent);
    window.addEventListener('storage', sync);
    return () => {
      unsubStore();
      window.removeEventListener(MUSIC_SETTINGS_EVENT, onEvent);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const setMusicEnabled = useCallback((enabled: boolean) => {
    persistMusicEnabled(enabled);
  }, []);

  const setVolume = useCallback((volume: number) => {
    persistMusicVolume(volume);
  }, []);

  const toggleMusic = useCallback(() => {
    toggleMusicEnabled();
  }, []);

  return {
    ...state,
    /** Alias kept for existing components */
    musicEnabled: state.isMusicEnabled,
    setMusicEnabled,
    setVolume,
    toggleMusic,
  };
}

export {
  initMusicSettings,
  getMusicState,
  getMusicEnabled,
  loadUserSettings,
  saveUserSettings,
} from './musicSettingsStore';
