import { MAIN_DASHBOARD_BGM } from '../gameAudioUrls';
import { BGM_PRIORITY } from './globalAudioManager';
import { useBackgroundMusic } from './useBackgroundMusic';

/**
 * Hub / rewards / profile background music.
 * Mount only when NOT inside a game module (modules use higher priority).
 */
export function DashboardMainBgm() {
  useBackgroundMusic(MAIN_DASHBOARD_BGM, { volume: 0.18, active: true, priority: BGM_PRIORITY.hub });
  return null;
}
