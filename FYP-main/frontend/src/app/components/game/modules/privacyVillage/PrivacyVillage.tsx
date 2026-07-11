import { useEffect, useState } from 'react';
import { AlertTriangle, Crown, Lock, Shield, Wifi, Eye } from 'lucide-react';
import { completeModuleLevel, loadGlobalProgress } from '../../../moduleProgress';
import { GAME_BGM } from '../../../gameAudioUrls';
import { useBackgroundMusic } from '../../../audio/useBackgroundMusic';
import { BGM_PRIORITY } from '../../../audio/globalAudioManager';
import { ModuleMenu } from '../../shell/ModuleMenu';
import { ModuleShell, useModuleFlow } from '../../shell/ModuleShell';
import { unlockAchievement } from '../../achievementService';
import { PRIVACY_LEVELS, PRIVACY_META, PRIVACY_REWARDS } from './PrivacyVillageLevels';
import type { GameLevel } from '../../types';

const PRIVACY_MODULE_VERSION = 3;

interface PrivacyVillageProps {
  onClose?: () => void;
}

const MENU_CARDS = [
  { level: 1 as GameLevel, title: 'Data Breach', description: 'Order the right breach response steps', mechanic: 'Response Timeline', icon: AlertTriangle, color: 'from-red-500 to-red-600' },
  { level: 2 as GameLevel, title: 'Tracking', description: 'Control app permissions', mechanic: 'Permission Toggle', icon: Eye, color: 'from-purple-500 to-purple-600' },
  { level: 3 as GameLevel, title: 'Identity Theft', description: 'Spot fake impersonator profiles', mechanic: 'Profile Detective', icon: Shield, color: 'from-blue-500 to-blue-600' },
  { level: 4 as GameLevel, title: 'Weak Passwords', description: 'Build a fortress-grade password', mechanic: 'Password Builder', icon: Lock, color: 'from-yellow-500 to-orange-600' },
  { level: 5 as GameLevel, title: 'Oversharing', description: 'Blur private details before posting', mechanic: 'Photo Redaction', icon: Crown, color: 'from-pink-500 to-rose-600' },
  { level: 6 as GameLevel, title: 'Public WiFi', description: 'Pick the safest network', mechanic: 'Network Picker', icon: Wifi, color: 'from-cyan-500 to-teal-600' },
];

export function PrivacyVillage({ onClose }: PrivacyVillageProps) {
  useBackgroundMusic(GAME_BGM.privacyVillage, { volume: 0.2, active: true, priority: BGM_PRIORITY.module });
  const flow = useModuleFlow();
  const [completed, setCompleted] = useState<number[]>([]);
  const meta = PRIVACY_META[flow.level - 1];
  const LevelComponent = PRIVACY_LEVELS[flow.level];

  useEffect(() => {
    loadGlobalProgress().then((p) => {
      const module = p.modules?.privacyVillage;
      setCompleted(module?.version === PRIVACY_MODULE_VERSION ? module.completedLevels || [] : []);
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
      menu={<ModuleMenu moduleTitle="Privacy Village" moduleSubtitle="Protect your digital village with unique privacy adventures!" levels={MENU_CARDS} completed={completed} onBack={onClose} onStart={flow.startLevel} />}
      LevelComponent={LevelComponent}
      onInstructionsStart={flow.beginPlay}
      onInstructionsBack={() => flow.setShowInstructions(false)}
      onLevelBack={() => flow.setScreen('menu')}
      onLevelComplete={async (stats) => {
        await completeModuleLevel('privacyVillage', flow.level, {
          reward: PRIVACY_REWARDS[flow.level - 1],
          scoreDelta: stats.levelScore,
          privacy_score: stats.levelScore,
          reaction_time: stats.reactionTime,
          mistake_patterns: stats.mistakes,
          difficulty: Math.min(5, 1 + Math.floor((completed.length + 1) / 2)),
          version: PRIVACY_MODULE_VERSION,
        });
        await unlockAchievement('first_level');
        if (completed.length + 1 >= 6) await unlockAchievement('module_master');
        flow.finishLevel(stats);
        setCompleted((c) => (c.includes(flow.level) ? c : [...c, flow.level]));
      }}
      onDoneMenu={() => flow.setScreen('menu')}
      onDoneNext={flow.level < 6 ? () => { flow.setLevel((flow.level + 1) as GameLevel); flow.setScreen('play'); } : undefined}
    />
  );
}
