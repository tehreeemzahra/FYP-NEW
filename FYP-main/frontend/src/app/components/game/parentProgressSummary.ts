/**
 * Derives parent-dashboard views from the same progress payload the child app saves.
 * Keeps module counts, active pathway, and scores aligned with the child dashboard.
 */

import type { ProgressReportData } from '../ProgressReportModal';
import { BULLY_META } from './modules/cyberbullyBattle/CyberbullyBattleLevels';
import { PASSWORD_META } from './modules/passwordCastle/PasswordCastleLevels';
import { PRIVACY_META } from './modules/privacyVillage/PrivacyVillageLevels';
import { SCAM_META } from './modules/scamSafari/ScamSafariLevels';
import {
  inferLastPlayedModule,
  MODULE_DISPLAY_NAMES,
  parseLastPlayed,
  type LastPlayedModule,
} from './lastPlayed';
import type { LevelMeta } from './types';

export const LEVELS_PER_MODULE = 6;
export const SUPPORTED_MODULE_VERSION = 3;

const MODULE_ORDER: LastPlayedModule[] = [
  'passwordCastle',
  'scamSafari',
  'privacyVillage',
  'cyberbullyBattle',
];

const MODULE_META: Record<LastPlayedModule, LevelMeta[]> = {
  passwordCastle: PASSWORD_META,
  scamSafari: SCAM_META,
  privacyVillage: PRIVACY_META,
  cyberbullyBattle: BULLY_META,
};

type ModuleStats = {
  completedLevels?: number[];
  version?: number;
  response_accuracy?: number;
};

export type ProgressApiPayload = {
  completedLevels?: number[];
  lastPlayed?: string;
  totalScore?: number;
  modules?: Partial<Record<'scamSafari' | 'privacyVillage' | 'cyberbullyBattle', ModuleStats>>;
};

export type ModuleProgressSummary = {
  key: LastPlayedModule;
  name: string;
  completedLevels: number[];
  completedCount: number;
  totalLevels: number;
  currentLevel: number;
  status: 'not-started' | 'in-progress' | 'completed';
};

export type ParentProgressSummary = {
  activeModule: LastPlayedModule;
  activeModuleName: string;
  activeModuleCompleted: number;
  activeModuleTotal: number;
  activeModuleCurrentLevel: number;
  activeModuleCompletedLevels: number[];
  totalScore: number;
  accuracy: number;
  modules: ModuleProgressSummary[];
  lastPlayedAt: Date | null;
  totalLevelsCompletedAllModules: number;
};

function sanitizeLevels(levels: number[] | undefined): number[] {
  return [...new Set((levels || []).filter((n) => n >= 1 && n <= LEVELS_PER_MODULE))].sort(
    (a, b) => a - b,
  );
}

function getModuleCompletedLevels(progress: ProgressApiPayload, key: LastPlayedModule): number[] {
  if (key === 'passwordCastle') {
    return sanitizeLevels(progress.completedLevels);
  }
  const mod = progress.modules?.[key];
  if (!mod) return [];
  if (mod.version !== undefined && mod.version !== SUPPORTED_MODULE_VERSION) return [];
  return sanitizeLevels(mod.completedLevels);
}

function moduleStatus(completedCount: number, total: number): ModuleProgressSummary['status'] {
  if (completedCount === 0) return 'not-started';
  if (completedCount >= total) return 'completed';
  return 'in-progress';
}

function currentLevelFor(completed: number[], total: number): number {
  if (completed.length >= total) return total;
  if (completed.length === 0) return 1;
  return completed.length + 1;
}

function resolveActiveModule(
  progress: ProgressApiPayload,
  modules: ModuleProgressSummary[],
): LastPlayedModule {
  const parsed = parseLastPlayed(progress.lastPlayed);
  if (parsed.module) return parsed.module;

  const inferred = inferLastPlayedModule(progress);
  if (inferred) return inferred;

  const inProgress = modules.find((m) => m.status === 'in-progress');
  if (inProgress) return inProgress.key;

  return 'passwordCastle';
}

function estimateAccuracy(progress: ProgressApiPayload, modules: ModuleProgressSummary[]): number {
  const totalCompleted = modules.reduce((sum, m) => sum + m.completedCount, 0);
  if (totalCompleted === 0) return 0;

  if (typeof progress.totalScore === 'number' && progress.totalScore > 0) {
    return Math.min(100, Math.round((progress.totalScore / (totalCompleted * 100)) * 100));
  }

  const accuracySamples: number[] = [];
  const bullyAccuracy = progress.modules?.cyberbullyBattle?.response_accuracy;
  if (typeof bullyAccuracy === 'number' && bullyAccuracy > 0) {
    accuracySamples.push(bullyAccuracy);
  }

  if (accuracySamples.length > 0) {
    return Math.round(accuracySamples.reduce((a, b) => a + b, 0) / accuracySamples.length);
  }

  return 85;
}

export function emptyParentProgressSummary(): ParentProgressSummary {
  return summarizeParentProgress({});
}

/** Map raw API progress into parent-dashboard fields. */
export function summarizeParentProgress(progress: ProgressApiPayload): ParentProgressSummary {
  const modules: ModuleProgressSummary[] = MODULE_ORDER.map((key) => {
    const completedLevels = getModuleCompletedLevels(progress, key);
    const completedCount = completedLevels.length;
    return {
      key,
      name: MODULE_DISPLAY_NAMES[key],
      completedLevels,
      completedCount,
      totalLevels: LEVELS_PER_MODULE,
      currentLevel: currentLevelFor(completedLevels, LEVELS_PER_MODULE),
      status: moduleStatus(completedCount, LEVELS_PER_MODULE),
    };
  });

  const activeModule = resolveActiveModule(progress, modules);
  const active = modules.find((m) => m.key === activeModule) ?? modules[0];
  const { playedAt } = parseLastPlayed(progress.lastPlayed);

  return {
    activeModule: active.key,
    activeModuleName: active.name,
    activeModuleCompleted: active.completedCount,
    activeModuleTotal: active.totalLevels,
    activeModuleCurrentLevel: active.currentLevel,
    activeModuleCompletedLevels: active.completedLevels,
    totalScore: progress.totalScore ?? 0,
    accuracy: estimateAccuracy(progress, modules),
    modules,
    lastPlayedAt: playedAt,
    totalLevelsCompletedAllModules: modules.reduce((sum, m) => sum + m.completedCount, 0),
  };
}

export function moduleProgressPercent(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, (completed / total) * 100);
}

export function buildProgressReportData(
  child: { name: string; age: number },
  summary: ParentProgressSummary,
): ProgressReportData {
  const gamesPlayed = summary.modules.map((mod) => {
    const meta = MODULE_META[mod.key];
    const levels = meta.map((m) => ({
      level: m.level,
      title: m.title,
      completed: mod.completedLevels.includes(m.level),
      score: mod.completedLevels.includes(m.level) ? 100 : 0,
      attempts: mod.completedLevels.includes(m.level) ? 1 : 0,
      timeSpent: `${5 + m.level} min`,
    }));

    return {
      gameName: mod.name,
      levels,
      totalLevels: mod.totalLevels,
      completed: mod.completedCount,
      status: mod.status,
    };
  });

  const strengths: string[] = [];
  if (summary.totalLevelsCompletedAllModules > 0) {
    strengths.push('Shows strong interest in learning cybersecurity concepts');
  }
  if (summary.totalLevelsCompletedAllModules >= 3) {
    strengths.push('Demonstrates perseverance across CyberQuest modules');
  }

  const completedModules = summary.modules.filter((m) => m.status === 'completed');
  completedModules.forEach((m) => {
    strengths.push(`Completed ${m.name} — great progress in that pathway`);
  });

  const areasForImprovement: string[] = [];
  const inProgress = summary.modules.find((m) => m.status === 'in-progress');
  if (inProgress) {
    areasForImprovement.push(`Continue ${inProgress.name} to build on current momentum`);
  } else if (completedModules.length < summary.modules.length) {
    areasForImprovement.push('Explore the next CyberQuest module to broaden cybersecurity skills');
  }

  const recommendations: string[] = [];
  if (summary.totalLevelsCompletedAllModules === 0) {
    recommendations.push(
      `Encourage ${child.name} to start with ${summary.activeModuleName} for an engaging introduction`,
    );
  } else if (inProgress) {
    recommendations.push(
      `Celebrate progress in ${inProgress.name} and aim for level ${inProgress.currentLevel} next`,
    );
  } else {
    recommendations.push('Excellent work — guide your learner toward the next module in CyberQuest');
  }
  recommendations.push('Discuss real-world online safety examples together after each session');

  return {
    childName: child.name,
    childAge: child.age,
    completedLevels: summary.modules.flatMap((mod) => mod.completedLevels),
    totalScore: summary.totalScore,
    accuracy: summary.accuracy,
    gamesPlayed,
    totalTimeSpent: summary.totalLevelsCompletedAllModules * 7,
    strengths: strengths.length > 0 ? strengths : ['Getting started on their cybersecurity learning journey!'],
    areasForImprovement,
    recommendations,
    reportDate: new Date().toISOString(),
  };
}
