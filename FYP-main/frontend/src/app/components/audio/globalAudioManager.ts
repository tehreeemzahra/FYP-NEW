/**
 * Global background-music manager — ONE Audio element for the entire game.
 *
 * Screens register/unregister playback requests via useBackgroundMusic().
 * Only the active request with the highest priority plays; others are ignored.
 * Mute/volume changes from musicSettingsStore apply instantly to this instance.
 */

import {
  getMusicState,
  subscribeMusicSettings,
} from './musicSettingsStore';

type PlaybackRequest = {
  src: string;
  volume: number;
  active: boolean;
  priority: number;
  seq: number;
};

class GlobalAudioManager {
  private audio: HTMLAudioElement | null = null;
  private currentSrc = '';
  private currentRequestId: string | null = null;
  private requests = new Map<string, PlaybackRequest>();
  private registrationSeq = 0;
  private interactionBound = false;
  private unsubscribeSettings: (() => void) | null = null;

  constructor() {
    this.unsubscribeSettings = subscribeMusicSettings(() => this.onSettingsChanged());
  }

  /**
   * Register a screen's desire to play a track.
   * Returns unregister — call on unmount.
   */
  register(
    id: string,
    src: string,
    volume: number,
    active: boolean,
    priority = 0,
  ): () => void {
    this.requests.set(id, { src, volume, active, priority, seq: ++this.registrationSeq });
    this.reconcile();
    return () => {
      this.requests.delete(id);
      this.reconcile();
    };
  }

  /** Pick winner: active requests only, highest priority, then most recently registered. */
  private pickWinner(): { id: string; req: PlaybackRequest } | null {
    const entries = [...this.requests.entries()].filter(([, r]) => r.active);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1].priority - a[1].priority || b[1].seq - a[1].seq);
    return { id: entries[0][0], req: entries[0][1] };
  }

  private reconcile() {
    const { isMusicEnabled, volume: masterVolume } = getMusicState();

    if (!isMusicEnabled) {
      this.pause();
      return;
    }

    const winner = this.pickWinner();
    if (!winner) {
      this.pause();
      return;
    }

    const { id, req } = winner;
    const effectiveVolume = req.volume * masterVolume;
    this.playTrack(id, req.src, effectiveVolume);
  }

  private ensureAudio(): HTMLAudioElement {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.loop = true;
      this.audio.preload = 'auto';
      this.bindInteractionUnlock();
    }
    return this.audio;
  }

  private playTrack(requestId: string, src: string, volume: number) {
    const audio = this.ensureAudio();
    this.currentRequestId = requestId;

    const srcChanged = this.currentSrc !== src;
    if (srcChanged) {
      this.currentSrc = src;
      audio.src = src;
      audio.load();
    }

    audio.volume = Math.min(1, Math.max(0, volume));
    audio.muted = false;
    this.tryPlay(audio);
  }

  private pause() {
    if (this.audio) {
      this.audio.pause();
    }
    this.currentRequestId = null;
  }

  private onSettingsChanged() {
    const { isMusicEnabled } = getMusicState();
    if (!isMusicEnabled) {
      this.pause();
      return;
    }
    this.reconcile();
  }

  private tryPlay(audio: HTMLAudioElement) {
    if (!getMusicState().isMusicEnabled) return;
    void audio.play().catch(() => {
      /* Browser may block until user gesture — interaction listeners retry */
    });
  }

  private bindInteractionUnlock() {
    if (this.interactionBound) return;
    this.interactionBound = true;

    const unlock = () => {
      if (this.audio && getMusicState().isMusicEnabled) {
        this.tryPlay(this.audio);
      }
    };

    document.addEventListener('pointerdown', unlock);
    document.addEventListener('keydown', unlock);
  }
}

/** Singleton — never create Audio elements outside this manager for BGM. */
export const globalAudioManager = new GlobalAudioManager();

/** Module screens beat hub/dashboard when both are registered. */
export const BGM_PRIORITY = {
  hub: 0,
  module: 10,
} as const;
