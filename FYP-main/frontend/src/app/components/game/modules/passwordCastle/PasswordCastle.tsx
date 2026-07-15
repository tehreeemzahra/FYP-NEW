import { useEffect, useState } from 'react';
import { Castle, Shield, Sparkles, Swords, Vault, Zap } from 'lucide-react';
import { api } from '@/lib/api';
import { loadGlobalProgress } from '../../../moduleProgress';
import { GAME_BGM } from '../../../gameAudioUrls';
import { useBackgroundMusic } from '../../../audio/useBackgroundMusic';
import { BGM_PRIORITY } from '../../../audio/globalAudioManager';
import { ModuleMenu } from '../../shell/ModuleMenu';
import { ModuleShell, useModuleFlow } from '../../shell/ModuleShell';
import { unlockAchievement } from '../../achievementService';
import { encodeLastPlayed } from '../../lastPlayed';
import { PASSWORD_LEVELS, PASSWORD_META } from './PasswordCastleLevels';
import type { GameLevel } from '../../types';

type Level = GameLevel;

async function completePasswordLevel(level: number) {
  const progress = await loadGlobalProgress();
  const completed = progress.completedLevels || [];
  if (completed.includes(level)) return;
  await api.saveProgress({
    ...progress,
    completedLevels: [...completed, level],
    lastPlayed: encodeLastPlayed('passwordCastle'),
  });
}

interface PasswordCastleProps {
  onClose?: () => void;
}

const MENU_CARDS = [
  { level: 1 as Level, title: 'First Breach', description: 'Cyber criminals probe the castle gates', mechanic: 'Password Defense', icon: Castle, color: 'from-blue-500 to-cyan-600' },
  { level: 2 as Level, title: 'Dictionary Siege', description: 'Survive dictionary word attacks', mechanic: 'Password Defense', icon: Shield, color: 'from-indigo-500 to-blue-600' },
  { level: 3 as Level, title: 'Brute Force Wave', description: 'Block millions of guess attempts', mechanic: 'Password Defense', icon: Zap, color: 'from-purple-500 to-violet-600' },
  { level: 4 as Level, title: 'Common Password Raid', description: 'Stop top-10,000 password lists', mechanic: 'Password Defense', icon: Swords, color: 'from-red-500 to-orange-600' },
  { level: 5 as Level, title: 'Vault Crackdown', description: 'Defend the kingdom treasury', mechanic: 'Password Defense', icon: Vault, color: 'from-emerald-500 to-teal-600' },
  { level: 6 as Level, title: 'Final Fortress Stand', description: 'Ultimate castle defense mission', mechanic: 'Password Defense', icon: Sparkles, color: 'from-amber-500 to-yellow-600' },
];

export function PasswordCastle({ onClose }: PasswordCastleProps) {
  useBackgroundMusic(GAME_BGM.passwordCastle, { volume: 0.2, active: true, priority: BGM_PRIORITY.module });
  const flow = useModuleFlow();
  const [completed, setCompleted] = useState<number[]>([]);
  const meta = PASSWORD_META[flow.level - 1];
  const LevelComponent = PASSWORD_LEVELS[flow.level];

  useEffect(() => {
    loadGlobalProgress().then((p) => {
      setCompleted(p.completedLevels || []);
    });
  }, [flow.screen]);

  return (
    <ModuleShell
      showConfetti={flow.showConfetti}
      screen={flow.screen}
      level={flow.level}
      meta={meta}
      showInstructions={flow.showInstructions}
      lastScore={flow.lastScore}
      isFinalLevel={flow.level === 6}
      menu={<ModuleMenu moduleTitle="Password Castle" moduleSubtitle="Defend the digital kingdom in Password Defense Missions!" levels={MENU_CARDS} completed={completed} onBack={onClose} onStart={flow.startLevel} />}
      LevelComponent={LevelComponent}
      onInstructionsStart={flow.beginPlay}
      onInstructionsBack={() => flow.setShowInstructions(false)}
      onLevelBack={() => flow.setScreen('menu')}
      onLevelComplete={async (stats) => {
        await completePasswordLevel(flow.level);
        await unlockAchievement('first_level');
        if (completed.length + 1 >= 6) await unlockAchievement('module_master');
        flow.finishLevel(stats);
        setCompleted((c) => (c.includes(flow.level) ? c : [...c, flow.level]));
      }}
      onDoneMenu={() => flow.setScreen('menu')}
      onDoneNext={flow.level < 6 ? () => flow.startNextLevel() : undefined}
    />
  );
}
