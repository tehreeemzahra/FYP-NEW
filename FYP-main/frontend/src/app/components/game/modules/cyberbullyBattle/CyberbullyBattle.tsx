import { useEffect, useState } from 'react';
import { Castle, MessageCircle, Search, Shield, Swords, UserX } from 'lucide-react';
import { completeModuleLevel, loadGlobalProgress } from '../../../moduleProgress';
import { GAME_BGM } from '../../../gameAudioUrls';
import { useBackgroundMusic } from '../../../audio/useBackgroundMusic';
import { BGM_PRIORITY } from '../../../audio/globalAudioManager';
import { ModuleMenu } from '../../shell/ModuleMenu';
import { ModuleShell, useModuleFlow } from '../../shell/ModuleShell';
import { unlockAchievement } from '../../achievementService';
import { BULLY_LEVELS, BULLY_META, BULLY_REWARDS } from './CyberbullyBattleLevels';
import type { GameLevel } from '../../types';

const CYBERBULLY_MODULE_VERSION = 3;

interface CyberbullyBattleProps {
  onClose?: () => void;
}

const MENU_CARDS = [
  { level: 1 as GameLevel, title: 'Harassment', description: 'Navigate hurtful group chats safely', mechanic: 'Chat Navigator', icon: MessageCircle, color: 'from-rose-500 to-red-600' },
  { level: 2 as GameLevel, title: 'Impersonation', description: 'Compare real vs fake profiles', mechanic: 'Profile Compare', icon: UserX, color: 'from-purple-500 to-fuchsia-600' },
  { level: 3 as GameLevel, title: 'Denigration', description: 'Investigate harmful rumors', mechanic: 'Rumor Investigation', icon: Search, color: 'from-indigo-500 to-purple-600' },
  { level: 4 as GameLevel, title: 'Outing', description: 'Sort private vs shareable content', mechanic: 'Privacy Sort', icon: Shield, color: 'from-blue-500 to-cyan-600' },
  { level: 5 as GameLevel, title: 'Cyberstalking', description: 'Respond to timed stalking threats', mechanic: 'Threat Response', icon: Swords, color: 'from-orange-500 to-red-600' },
  { level: 6 as GameLevel, title: 'Cyber City Rescue', description: 'Boss mission — save the city!', mechanic: 'Boss Mission', icon: Castle, color: 'from-pink-500 to-rose-600' },
];

export function CyberbullyBattle({ onClose }: CyberbullyBattleProps) {
  useBackgroundMusic(GAME_BGM.cyberbullyBattle, { volume: 0.2, active: true, priority: BGM_PRIORITY.module });
  const flow = useModuleFlow();
  const [completed, setCompleted] = useState<number[]>([]);
  const meta = BULLY_META[flow.level - 1];
  const LevelComponent = BULLY_LEVELS[flow.level];

  useEffect(() => {
    loadGlobalProgress().then((p) => {
      const module = p.modules?.cyberbullyBattle;
      setCompleted(module?.version === CYBERBULLY_MODULE_VERSION ? module.completedLevels || [] : []);
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
      menu={<ModuleMenu moduleTitle="Cyberbully Battle" moduleSubtitle="Defend friends and fight cyberbullying with unique battle mechanics!" levels={MENU_CARDS} completed={completed} onBack={onClose} onStart={flow.startLevel} />}
      LevelComponent={LevelComponent}
      onInstructionsStart={flow.beginPlay}
      onInstructionsBack={() => flow.setShowInstructions(false)}
      onLevelBack={() => flow.setScreen('menu')}
      onLevelComplete={async (stats) => {
        await completeModuleLevel('cyberbullyBattle', flow.level, {
          reward: BULLY_REWARDS[flow.level - 1],
          scoreDelta: stats.levelScore,
          behavior_score: stats.levelScore,
          response_accuracy: Math.max(0, 100 - stats.mistakes.length * 5),
          decision_speed: stats.reactionTime,
          mistake_patterns: stats.mistakes,
          difficulty: Math.min(5, 1 + Math.floor((completed.length + 1) / 2)),
          version: CYBERBULLY_MODULE_VERSION,
        });
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
