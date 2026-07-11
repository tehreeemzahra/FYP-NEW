import { useEffect, useId } from 'react';
import { globalAudioManager, BGM_PRIORITY } from './globalAudioManager';

export type BackgroundMusicOptions = {
  /** Screen wants BGM while mounted (default true). Global mute is handled separately. */
  active?: boolean;
  volume?: number;
  /** Higher priority wins when multiple screens register (module > hub). */
  priority?: number;
};

/**
 * Subscribe to the global audio manager for one background track.
 * Do NOT create local Audio() instances — this is the only BGM hook.
 */
export function useBackgroundMusic(src: string, options: BackgroundMusicOptions = {}) {
  const reactId = useId();
  const {
    active = true,
    volume = 0.25,
    priority = BGM_PRIORITY.hub,
  } = options;

  useEffect(() => {
    return globalAudioManager.register(reactId, src, volume, active, priority);
  }, [reactId, src, volume, active, priority]);
}
