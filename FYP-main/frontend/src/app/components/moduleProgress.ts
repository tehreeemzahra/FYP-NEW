import { api } from '@/lib/api';
import { encodeLastPlayed, type LastPlayedModule } from './game/lastPlayed';

export type ModuleKey = 'privacyVillage' | 'cyberbullyBattle' | 'scamSafari';

type ModuleStats = {
  completedLevels: number[];
  version?: number;
  scam_score?: number;
  privacy_score?: number;
  behavior_score?: number;
  mistake_patterns?: string[];
  response_accuracy?: number;
  reaction_time?: number;
  decision_speed?: number;
  rewards?: string[];
  difficulty?: number;
};

type GlobalProgress = {
  completedLevels: number[];
  lastPlayed: string;
  inventory?: string[];
  totalScore?: number;
  modules?: Record<ModuleKey, ModuleStats>;
};

const defaultModule = (): ModuleStats => ({
  completedLevels: [],
  rewards: [],
  mistake_patterns: [],
  difficulty: 1,
});

const defaultProgress = (): GlobalProgress => ({
  completedLevels: [],
  lastPlayed: '',
  inventory: [],
  totalScore: 0,
  modules: {
    scamSafari: defaultModule(),
    privacyVillage: defaultModule(),
    cyberbullyBattle: defaultModule(),
  },
});

export async function loadGlobalProgress(): Promise<GlobalProgress> {
  try {
    const p = (await api.getProgress()) as GlobalProgress;
    const base = defaultProgress();
    return {
      ...base,
      ...p,
      modules: {
        scamSafari: { ...base.modules!.scamSafari, ...(p.modules?.scamSafari || {}) },
        privacyVillage: { ...base.modules!.privacyVillage, ...(p.modules?.privacyVillage || {}) },
        cyberbullyBattle: { ...base.modules!.cyberbullyBattle, ...(p.modules?.cyberbullyBattle || {}) },
      },
    };
  } catch {
    return defaultProgress();
  }
}

export async function completeModuleLevel(
  moduleKey: ModuleKey,
  level: number,
  updates: Partial<ModuleStats> & { reward?: string; scoreDelta?: number },
) {
  const progress = await loadGlobalProgress();
  const module = progress.modules?.[moduleKey] || defaultModule();

  const nextCompleted = module.completedLevels.includes(level)
    ? module.completedLevels
    : [...module.completedLevels, level];

  const inventory = progress.inventory || [];
  const nextInventory = updates.reward && !inventory.includes(updates.reward) ? [...inventory, updates.reward] : inventory;

  const moduleRewards = module.rewards || [];
  const nextModuleRewards = updates.reward && !moduleRewards.includes(updates.reward) ? [...moduleRewards, updates.reward] : moduleRewards;

  const payload: GlobalProgress = {
    ...progress,
    lastPlayed: encodeLastPlayed(moduleKey as LastPlayedModule),
    totalScore: (progress.totalScore || 0) + (updates.scoreDelta || 0),
    inventory: nextInventory,
    modules: {
      ...(progress.modules || {}),
      [moduleKey]: {
        ...module,
        ...updates,
        rewards: nextModuleRewards,
        completedLevels: nextCompleted,
        difficulty: Math.min(5, Math.max(1, updates.difficulty || module.difficulty || 1)),
      },
    } as Record<ModuleKey, ModuleStats>,
  };

  await api.saveProgress(payload);
  return payload;
}
