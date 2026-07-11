import { CLICK_SOUND } from '../../gameAudioUrls';

let correctAudio: HTMLAudioElement | null = null;
let wrongAudio: HTMLAudioElement | null = null;

function playTone(audio: HTMLAudioElement | null, volume: number) {
  if (!audio) return;
  audio.volume = volume;
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}

export function primeGameSounds() {
  try {
    if (!correctAudio) {
      correctAudio = new Audio(CLICK_SOUND);
      correctAudio.preload = 'auto';
    }
    if (!wrongAudio) {
      wrongAudio = new Audio(CLICK_SOUND);
      wrongAudio.preload = 'auto';
    }
  } catch {
    // Ignore preload errors.
  }
}

export function playCorrectSound() {
  primeGameSounds();
  playTone(correctAudio, 0.3);
}

export function playWrongSound() {
  primeGameSounds();
  playTone(wrongAudio, 0.5);
}

export function playMilestoneSound() {
  primeGameSounds();
  playTone(correctAudio, 0.4);
}
