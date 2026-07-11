import { useState, type ComponentType } from 'react';
import { PasswordDefenseMission } from '../../mechanics/passwordDefense/PasswordDefenseMission';
import { useLevelRunner } from '../../shell/useLevelRunner';
import { unlockAchievement, getAchievementForMechanic } from '../../achievementService';
import type { GameLevel, LevelCompleteStats, LevelMeta } from '../../types';

type LevelProps = { onBack: () => void; onComplete: (stats: LevelCompleteStats) => void };

export const PASSWORD_REWARDS = [
  'Gate Guardian Badge',
  'Dictionary Defender',
  'Brute Force Blocker',
  'Vault Shield',
  'Security Commander',
  'Crown of Protection',
];

const WAVE_TITLES = [
  'First Breach',
  'Dictionary Siege',
  'Brute Force Wave',
  'Common Password Raid',
  'Vault Crackdown',
  'Final Fortress Stand',
];

export const PASSWORD_META: LevelMeta[] = WAVE_TITLES.map((title, i) => {
  const level = (i + 1) as GameLevel;
  const wave = i + 1;
  return {
    level,
    title: `Password Defense — ${title}`,
    concept: 'Strong passwords defend your digital castle from dictionary, brute-force, and reuse attacks.',
    summary:
      'Build a gate password, survive attack simulations, defend castle walls, and unlock MFA, password managers, and security shields.',
    hint:
      wave <= 2
        ? 'Mix uppercase, lowercase, and numbers — avoid common words.'
        : wave <= 4
          ? 'Add symbols and length — predictable passwords crack instantly.'
          : 'Maximum complexity: 10+ chars, symbols, and no reused patterns.',
    tips: [
      'Stage 1: Tap components to build a strong gate password',
      'Stage 2: Watch attacks — higher power needs higher password score',
      'Stage 3: Keep wall integrity above zero',
      'Stage 4: Pick 2 security upgrades (MFA, manager, shield)',
    ],
    ageGroup: wave <= 2 ? '7-9' : wave <= 4 ? '9-11' : '10-12',
    reward: PASSWORD_REWARDS[i],
    mechanic: 'Password Defense Mission',
  };
});

function makePasswordLevel(wave: number): ComponentType<LevelProps> {
  return function PasswordDefenseLevel({ onBack, onComplete }: LevelProps) {
    const [step, setStep] = useState(1);
    const meta = PASSWORD_META[wave - 1];
    const runner = useLevelRunner({
      title: meta.title,
      subtitle: `Wave ${wave} — Defend the vault`,
      mechanic: 'Password Defense Mission',
      hint: meta.hint,
      totalSteps: 4,
      currentStep: step,
      onBack,
      onComplete: async (s) => {
        const builder = getAchievementForMechanic('builder');
        if (builder) await unlockAchievement(builder);
        if (wave >= 5) {
          const threat = getAchievementForMechanic('threat');
          if (threat) await unlockAchievement(threat);
        }
        onComplete(s);
      },
    });

    return runner.wrap(
      <PasswordDefenseMission
        wave={wave}
        onStageComplete={() => setStep((s) => Math.min(4, s + 1))}
        onStageReset={() => setStep(1)}
        onAllComplete={runner.finish}
        onCorrect={(m, pts) => runner.showCorrect(m, pts ?? 15)}
        onWrong={(m, id) => runner.showWrong(m, id)}
      />,
    );
  };
}

export const PasswordLevel1 = makePasswordLevel(1);
export const PasswordLevel2 = makePasswordLevel(2);
export const PasswordLevel3 = makePasswordLevel(3);
export const PasswordLevel4 = makePasswordLevel(4);
export const PasswordLevel5 = makePasswordLevel(5);
export const PasswordLevel6 = makePasswordLevel(6);

export const PASSWORD_LEVELS: Record<GameLevel, ComponentType<LevelProps>> = {
  1: PasswordLevel1,
  2: PasswordLevel2,
  3: PasswordLevel3,
  4: PasswordLevel4,
  5: PasswordLevel5,
  6: PasswordLevel6,
};
