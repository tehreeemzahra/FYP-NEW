import { api } from '@/lib/api';
import { loadGlobalProgress } from '../moduleProgress';
import { ACHIEVEMENTS } from './achievements';

export async function unlockAchievement(achievementId: string) {
  const badgeName = ACHIEVEMENTS.find((a) => a.id === achievementId)?.title;
  if (!badgeName) return;

  const progress = await loadGlobalProgress();
  const inventory = progress.inventory || [];
  if (inventory.includes(badgeName)) return;

  await api.saveProgress({
    ...progress,
    inventory: [...inventory, badgeName],
    lastPlayed: new Date().toISOString(),
  });
}

export function getAchievementForMechanic(mechanic: string): string | null {
  const map: Record<string, string> = {
    investigation: 'investigator',
    builder: 'builder',
    sort: 'sorter',
    maze: 'maze_runner',
    memory: 'memory_master',
    chat: 'chat_hero',
    threat: 'threat_responder',
    boss: 'boss_slayer',
  };
  return map[mechanic] || null;
}

export { ACHIEVEMENTS } from './achievements';
