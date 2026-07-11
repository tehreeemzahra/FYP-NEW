import { CLICK_SOUND } from './gameAudioUrls';

let clickAudio: HTMLAudioElement | null = null;
let lastClickAt = 0;
const CLICK_GUARD_MS = 80;

export function primeUiClickAudio() {
  try {
    if (!clickAudio) {
      clickAudio = new Audio(CLICK_SOUND);
      clickAudio.preload = 'auto';
      clickAudio.load();
    }
  } catch {
    // Ignore preload errors.
  }
}

export function playUiClick(volume = 0.45) {
  const now = Date.now();
  if (now - lastClickAt < CLICK_GUARD_MS) return;
  lastClickAt = now;

  try {
    if (!clickAudio) {
      primeUiClickAudio();
    }
    if (!clickAudio) return;
    clickAudio.volume = volume;
    clickAudio.currentTime = 0;
    void clickAudio.play().catch(() => {
      // Ignore blocked playback errors.
    });
  } catch {
    // Ignore audio runtime errors.
  }
}
