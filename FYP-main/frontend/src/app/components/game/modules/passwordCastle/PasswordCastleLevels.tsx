import { useCallback, useState, type ComponentType } from 'react';
import { PasswordDefenseMission } from '../../mechanics/passwordDefense/PasswordDefenseMission';
import { QUESTS_PER_LEVEL } from '../../mechanics/passwordDefense/levelQuests';
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

/** Unique instruction popup content per Password Castle level. */
export const PASSWORD_META: LevelMeta[] = [
  {
    level: 1,
    title: 'First Breach',
    concept: 'First Breach — each strong password is paired with a quick security checkup.',
    summary:
      'Complete 5 mini-challenges. For each one: build a strong password, then answer a unique cybersecurity question. No long wait — learn as you go!',
    hint: 'Mix A–Z, a–z, and numbers. Avoid common words.',
    tips: [
      'Each challenge has 2 parts: build a password, then answer a security question',
      'Part 1: Pick a category, tap characters, then Lock Password',
      'Part 2: Choose the best answer — wrong answers give a hint, then try again',
      'Finish all 5 challenges to complete First Breach',
    ],
    ageGroup: '7-9',
    reward: PASSWORD_REWARDS[0],
    mechanic: 'Password Defense',
  },
  {
    level: 2,
    title: 'Dictionary Siege',
    concept:
      'Hackers often try thousands of common words from dictionaries to guess passwords. Strengthen weak passwords by making them unique.',
    summary:
      'A weak dictionary word appears each quest. Improve it with uppercase letters, numbers, and symbols while your defense strength meter rises.',
    hint: 'Upgrade the weak word — do not leave it unchanged.',
    tips: [
      'Stage 1: A weak dictionary password will appear',
      'Stage 2: Improve it using uppercase letters, numbers, and symbols',
      'Stage 3: Watch the password strength meter increase',
      'Stage 4: Defend the castle by creating a strong password before the attackers break through',
    ],
    ageGroup: '9-11',
    reward: PASSWORD_REWARDS[1],
    mechanic: 'Password Defense',
  },
  {
    level: 3,
    title: 'Brute Force Wave',
    concept:
      'Brute-force attacks try every possible password combination. Longer and more complex passwords take much longer to crack.',
    summary:
      'Build the strongest password you can before time runs out. Castle walls crack as the countdown ticks — finish fast!',
    hint: 'Use uppercase, lowercase, numbers, and symbols before the timer ends.',
    tips: [
      'Stage 1: Build your password before time expires',
      'Stage 2: Use uppercase, lowercase, numbers, and symbols',
      'Stage 3: Watch your password strength meter',
      'Stage 4: Finish before the castle walls are destroyed',
    ],
    ageGroup: '9-11',
    reward: PASSWORD_REWARDS[2],
    mechanic: 'Password Defense',
  },
  {
    level: 4,
    title: 'Common Password Raid',
    concept: 'Millions of people use predictable passwords. Hackers try these first.',
    summary:
      'Answer 5 Safe or Unsafe questions. Spot common and predictable passwords that hackers try first — no typing required.',
    hint: 'Common passwords like 123456 and password are always unsafe.',
    tips: [
      'Stage 1: Read each password carefully',
      'Stage 2: Tap ✔ Safe or ❌ Unsafe',
      'Stage 3: Common passwords and simple patterns are unsafe',
      'Stage 4: Finish all 5 questions to complete the raid',
    ],
    ageGroup: '9-11',
    reward: PASSWORD_REWARDS[3],
    mechanic: 'Password Defense',
  },
  {
    level: 5,
    title: 'Vault Crackdown',
    concept:
      'Strong passwords follow several important rules. Meeting all of them keeps valuable information safe.',
    summary:
      'Build passwords from scratch and complete every checklist rule — length, cases, numbers, symbols, and no dictionary words.',
    hint: 'Watch each checklist item light up as you type.',
    tips: [
      'Stage 1: Build your password from scratch',
      'Stage 2: Complete every security requirement',
      'Stage 3: Watch each checklist item unlock',
      'Stage 4: Open the royal vault once every requirement is satisfied',
    ],
    ageGroup: '10-12',
    reward: PASSWORD_REWARDS[4],
    mechanic: 'Password Defense',
  },
  {
    level: 6,
    title: 'Final Fortress Stand',
    concept: "Use everything you've learned to defend the kingdom against the strongest cyber attack.",
    summary:
      'Each challenge has two parts: mark passwords Safe or Unsafe, then strengthen every unsafe password with a strong new one.',
    hint: 'Combine spotting weak passwords with building stronger ones.',
    tips: [
      'Stage 1: Tap ✔ Safe or ❌ Unsafe on each password',
      'Stage 2: Strengthen the passwords you marked Unsafe',
      'Stage 3: Use uppercase, lowercase, numbers, and symbols',
      'Stage 4: Finish all 5 challenges to secure the kingdom',
    ],
    ageGroup: '10-12',
    reward: PASSWORD_REWARDS[5],
    mechanic: 'Password Defense',
  },
];

function makePasswordLevel(wave: number): ComponentType<LevelProps> {
  return function PasswordDefenseLevel({ onBack, onComplete }: LevelProps) {
    const [step, setStep] = useState(1);
    const meta = PASSWORD_META[wave - 1];
    const totalSteps = QUESTS_PER_LEVEL;
    const syncQuestStep = useCallback((questNumber: number) => {
      setStep(questNumber);
    }, []);
    const runner = useLevelRunner({
      title: meta.title,
      subtitle: `Level ${wave} · ${WAVE_TITLES[wave - 1]}`,
      mechanic: 'Password Defense',
      hint: meta.hint,
      totalSteps,
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
        onStageComplete={() => setStep((s) => Math.min(totalSteps + 1, s + 1))}
        onQuestProgress={syncQuestStep}
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
