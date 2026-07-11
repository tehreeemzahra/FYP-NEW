import { useEffect, useState } from 'react';
import { Gift, Globe, PhoneCall, Shield, Trees, UserRound } from 'lucide-react';
import { completeModuleLevel, loadGlobalProgress } from '../../../moduleProgress';
import { GAME_BGM } from '../../../gameAudioUrls';
import { useBackgroundMusic } from '../../../audio/useBackgroundMusic';
import { BGM_PRIORITY } from '../../../audio/globalAudioManager';
import { ModuleMenu } from '../../shell/ModuleMenu';
import { ModuleShell, useModuleFlow } from '../../shell/ModuleShell';
import { unlockAchievement } from '../../achievementService';
import { SCAM_LEVELS, SCAM_META, SCAM_REWARDS } from './ScamSafariLevels';
import type { GameLevel } from '../../types';

const SCAM_MODULE_VERSION = 3;

interface ScamSafariProps {
  onClose?: () => void;
}

const MENU_CARDS = [
  { level: 1 as GameLevel, title: 'Message Scam', description: 'Investigate suspicious mass messages', mechanic: 'Cyber Investigation', icon: Gift, color: 'from-orange-500 to-orange-600' },
  { level: 2 as GameLevel, title: 'Personal Trick', description: 'Navigate a personalized phishing chat', mechanic: 'Chat Simulator', icon: UserRound, color: 'from-pink-500 to-pink-600' },
  { level: 3 as GameLevel, title: 'Authority Scam', description: 'Sort safe vs fake official actions', mechanic: 'Security Sorting', icon: Shield, color: 'from-red-500 to-red-600' },
  { level: 4 as GameLevel, title: 'Text Message Scam', description: 'Match SMS scam signs to meanings', mechanic: 'Memory Match', icon: Trees, color: 'from-green-500 to-green-600' },
  { level: 5 as GameLevel, title: 'Phone Call Scam', description: 'Handle suspicious phone calls', mechanic: 'Call Simulator', icon: PhoneCall, color: 'from-purple-500 to-purple-600' },
  { level: 6 as GameLevel, title: 'Fake Website', description: 'Spot the legitimate website', mechanic: 'Website Detective', icon: Globe, color: 'from-cyan-500 to-cyan-600' },
];

export function ScamSafari({ onClose }: ScamSafariProps) {
  useBackgroundMusic(GAME_BGM.scamSafari, { volume: 0.2, active: true, priority: BGM_PRIORITY.module });
  const flow = useModuleFlow();
  const [completed, setCompleted] = useState<number[]>([]);
  const meta = SCAM_META[flow.level - 1];
  const LevelComponent = SCAM_LEVELS[flow.level];

  useEffect(() => {
    loadGlobalProgress().then((p) => {
      const module = p.modules?.scamSafari;
      const moduleCompleted = module?.version === SCAM_MODULE_VERSION ? module.completedLevels || [] : [];
      setCompleted(moduleCompleted);
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
      menu={
        <ModuleMenu
          moduleTitle="Scam Safari"
          moduleSubtitle="Adventure through the jungle of online tricks — each level uses a different skill!"
          levels={MENU_CARDS}
          completed={completed}
          onBack={onClose}
          onStart={flow.startLevel}
        />
      }
      LevelComponent={LevelComponent}
      onInstructionsStart={flow.beginPlay}
      onInstructionsBack={() => flow.setShowInstructions(false)}
      onLevelBack={() => flow.setScreen('menu')}
      onLevelComplete={async (stats) => {
        await completeModuleLevel('scamSafari', flow.level, {
          reward: SCAM_REWARDS[flow.level - 1],
          scoreDelta: stats.levelScore,
          scam_score: stats.levelScore,
          reaction_time: stats.reactionTime,
          mistake_patterns: stats.mistakes,
          difficulty: Math.min(5, 1 + Math.floor((completed.length + 1) / 2)),
          version: SCAM_MODULE_VERSION,
        });
        await unlockAchievement('first_level');
        if (completed.length + 1 >= 6) await unlockAchievement('module_master');
        flow.finishLevel(stats);
        setCompleted((c) => (c.includes(flow.level) ? c : [...c, flow.level]));
      }}
      onDoneMenu={() => flow.setScreen('menu')}
      onDoneNext={
        flow.level < 6
          ? () => {
              flow.setLevel((flow.level + 1) as GameLevel);
              flow.setScreen('play');
            }
          : undefined
      }
    />
  );
}
