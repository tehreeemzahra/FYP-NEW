export type LastPlayedModule =
  | 'passwordCastle'
  | 'scamSafari'
  | 'privacyVillage'
  | 'cyberbullyBattle';

export const MODULE_DISPLAY_NAMES: Record<LastPlayedModule, string> = {
  passwordCastle: 'Password Castle',
  scamSafari: 'Scam Safari',
  privacyVillage: 'Privacy Village',
  cyberbullyBattle: 'Cyberbully Battle',
};

const MODULE_KEYS = new Set<string>(Object.keys(MODULE_DISPLAY_NAMES));

export function encodeLastPlayed(module: LastPlayedModule): string {
  return `${module}|${new Date().toISOString()}`;
}

export function parseLastPlayed(lastPlayed: string | undefined | null): {
  module: LastPlayedModule | null;
  label: string;
  playedAt: Date | null;
} {
  if (!lastPlayed?.trim()) {
    return { module: null, label: '', playedAt: null };
  }

  const pipe = lastPlayed.indexOf('|');
  if (pipe > 0) {
    const key = lastPlayed.slice(0, pipe);
    const playedAt = new Date(lastPlayed.slice(pipe + 1));
    if (MODULE_KEYS.has(key)) {
      const module = key as LastPlayedModule;
      return {
        module,
        label: MODULE_DISPLAY_NAMES[module],
        playedAt: Number.isNaN(playedAt.getTime()) ? null : playedAt,
      };
    }
  }

  const playedAt = new Date(lastPlayed);
  if (!Number.isNaN(playedAt.getTime())) {
    return { module: null, label: '', playedAt };
  }

  return { module: null, label: '', playedAt: null };
}

/** Guess last module from saved progress when legacy timestamp-only data exists */
export function inferLastPlayedModule(progress: {
  completedLevels?: number[];
  modules?: {
    scamSafari?: { completedLevels?: number[] };
    privacyVillage?: { completedLevels?: number[] };
    cyberbullyBattle?: { completedLevels?: number[] };
  };
}): LastPlayedModule | null {
  const scores: { module: LastPlayedModule; count: number }[] = [
    { module: 'passwordCastle', count: progress.completedLevels?.length ?? 0 },
    { module: 'scamSafari', count: progress.modules?.scamSafari?.completedLevels?.length ?? 0 },
    { module: 'privacyVillage', count: progress.modules?.privacyVillage?.completedLevels?.length ?? 0 },
    { module: 'cyberbullyBattle', count: progress.modules?.cyberbullyBattle?.completedLevels?.length ?? 0 },
  ];

  const best = scores.reduce((a, b) => (b.count > a.count ? b : a), scores[0]);
  return best.count > 0 ? best.module : null;
}
