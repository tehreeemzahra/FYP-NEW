import type { LucideIcon } from 'lucide-react';
import { Fingerprint, KeyRound, ShieldCheck } from 'lucide-react';

/** Max scenario questions allowed in a Password Castle level. */
export const MAX_LEVEL_QUESTIONS = 5;

export type SecurityMcqChoice = {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
};

export type SecurityMcq = {
  id: string;
  prompt: string;
  topic: string;
  choices: SecurityMcqChoice[];
};

export type PasswordScenario = {
  id: string;
  title: string;
  situation: string;
  objective: string;
  tip: string;
  successMessage: string;
  /** Unique cybersecurity question shown after this password is built (Level 1). */
  mcq?: SecurityMcq;
};

export type PasswordUpgradeOption = {
  id: string;
  label: string;
  tip: string;
  bonus: number;
  icon: LucideIcon;
};

/** Level 1 — First Breach: password build + paired unique MCQ per challenge. */
export const LEVEL1_SCENARIOS: PasswordScenario[] = [
  {
    id: 'vault-gate',
    title: 'Protect the castle vault',
    situation:
      'Cyber criminals are probing the castle vault gates. Your gate password is the only barrier between them and the treasure.',
    objective: 'Build a strong gate password to lock them out.',
    tip: 'Mix uppercase, lowercase, and numbers — avoid common words like “password”.',
    successMessage: 'Vault gate locked! The first barrier is up.',
    mcq: {
      id: 'mcq-strong-weak',
      topic: 'Strong vs Weak Passwords',
      prompt: 'Which password is the strongest choice for the vault gate?',
      choices: [
        {
          id: 'a',
          text: 'vault123',
          isCorrect: false,
          feedback: 'Too short and predictable — hackers try words like “vault” first.',
        },
        {
          id: 'b',
          text: 'A long mix of upper, lower, and numbers (like you just built)',
          isCorrect: true,
          feedback: 'Yes! Length plus mixed character types makes cracking much harder.',
        },
        {
          id: 'c',
          text: 'password',
          isCorrect: false,
          feedback: '“password” is one of the most common passwords — never use it.',
        },
      ],
    },
  },
  {
    id: 'school-laptop',
    title: 'Secure the school laptop',
    situation:
      'You got a school laptop login. Classmates sometimes peek at keyboards during break — a short or obvious password is easy to steal.',
    objective: 'Create a login password that is hard to guess from watching you type.',
    tip: 'Make it longer and mix letter cases so shoulder-surfers cannot copy it.',
    successMessage: 'School laptop password ready — no easy peeking!',
    mcq: {
      id: 'mcq-length',
      topic: 'Password Length',
      prompt: 'Why does a longer password protect your school laptop better?',
      choices: [
        {
          id: 'a',
          text: 'Longer passwords take much longer for computers to guess',
          isCorrect: true,
          feedback: 'Correct! Extra characters explode the number of guesses attackers must try.',
        },
        {
          id: 'b',
          text: 'Length does not matter if you use your birthday',
          isCorrect: false,
          feedback: 'Birthdays are easy to guess. Length and uniqueness both matter.',
        },
        {
          id: 'c',
          text: 'Short passwords are safer because they are harder to type wrong',
          isCorrect: false,
          feedback: 'Short passwords are easier to brute-force. Aim for longer, mixed passwords.',
        },
      ],
    },
  },
  {
    id: 'game-account',
    title: 'Guard your game account',
    situation:
      'A new online game wants an account. Someone claiming to be a “friend” asks for your password so they can “gift” you skins.',
    objective: 'Build a password you will keep private — never share it, even with friends.',
    tip: 'Do not use your name, birthday, or the game title in the password.',
    successMessage: 'Game account password sealed. Real friends never need your password.',
    mcq: {
      id: 'mcq-sharing',
      topic: 'Sharing Passwords',
      prompt: 'A classmate says, “Send me your game password so I can gift you items.” What should you do?',
      choices: [
        {
          id: 'a',
          text: 'Share it this once — friends can be trusted',
          isCorrect: false,
          feedback: 'Never share passwords. Even friends’ accounts can be hijacked or misused.',
        },
        {
          id: 'b',
          text: 'Keep it private and refuse — real gifts never need your password',
          isCorrect: true,
          feedback: 'Perfect. Password sharing is a common trick for account theft.',
        },
        {
          id: 'c',
          text: 'Share only the first half of the password',
          isCorrect: false,
          feedback: 'Any part of a password can help an attacker. Keep the whole secret private.',
        },
      ],
    },
  },
  {
    id: 'family-tablet',
    title: 'Upgrade the family tablet',
    situation:
      'The family tablet still uses a simple code like 1234. App stores and chats on that tablet need something stronger.',
    objective: 'Replace the weak code with a mixed password for tablet protection.',
    tip: 'Numbers alone are weak — combine letters and numbers for a real upgrade.',
    successMessage: 'Family tablet leveled up! Weak PIN habits defeated.',
    mcq: {
      id: 'mcq-reuse',
      topic: 'Password Reuse',
      prompt: 'You made a strong tablet password. Should you reuse that exact password for email and games too?',
      choices: [
        {
          id: 'a',
          text: 'Yes — one strong password should work everywhere',
          isCorrect: false,
          feedback: 'If one site leaks, reused passwords open every other account too.',
        },
        {
          id: 'b',
          text: 'No — each account needs its own unique password',
          isCorrect: true,
          feedback: 'Yes! Unique passwords stop one leak from unlocking your whole kingdom.',
        },
        {
          id: 'c',
          text: 'Reuse it, but add “1” at the end for each site',
          isCorrect: false,
          feedback: 'Tiny changes are still easy to predict. Use truly different passwords.',
        },
      ],
    },
  },
  {
    id: 'club-email',
    title: 'Lock the club email',
    situation:
      'Your after-school club email is used for shared plans. Hackers love guessing emails with words like “club” or “hello123”.',
    objective: 'Invent a unique club-email password that is not a common word list hit.',
    tip: 'Avoid dictionary words and simple number trails. Unique beats “easy to remember”.',
    successMessage: 'Club email fortified! Common-password lists bounce off.',
    mcq: {
      id: 'mcq-mfa',
      topic: 'Multi-Factor Authentication',
      prompt: 'What is Multi-Factor Authentication (MFA)?',
      choices: [
        {
          id: 'a',
          text: 'Using the same password on two websites',
          isCorrect: false,
          feedback: 'That is password reuse — it makes accounts weaker, not stronger.',
        },
        {
          id: 'b',
          text: 'A second check (like a phone code) after your password',
          isCorrect: true,
          feedback: 'Correct! MFA adds another lock so a stolen password alone is not enough.',
        },
        {
          id: 'c',
          text: 'Writing your password on a sticky note for backup',
          isCorrect: false,
          feedback: 'Sticky notes can be stolen. Store secrets safely — ideally with a manager + parent help.',
        },
      ],
    },
  },
];

/** Default upgrades for classic waves (2–6). */
export const DEFAULT_UPGRADES: PasswordUpgradeOption[] = [
  {
    id: 'mfa',
    label: 'Multi-Factor Auth',
    tip: 'Adds a second lock — even if password leaks, vault stays safe.',
    bonus: 15,
    icon: Fingerprint,
  },
  {
    id: 'manager',
    label: 'Password Manager',
    tip: 'Unique passwords for every account — reuse attacks fail.',
    bonus: 12,
    icon: KeyRound,
  },
  {
    id: 'shield',
    label: 'Security Shield',
    tip: 'Blocks automated guessing bots at the gate.',
    bonus: 10,
    icon: ShieldCheck,
  },
];

export function getScenariosForWave(wave: number): PasswordScenario[] {
  if (wave === 1) return LEVEL1_SCENARIOS.slice(0, MAX_LEVEL_QUESTIONS);
  return [
    {
      id: `wave-${wave}-default`,
      title: 'Build a strong gate password',
      situation: 'Cyber criminals are attacking the vault! Build a gate password to defend the kingdom.',
      objective: 'Build a strong gate password.',
      tip: 'Pick a category, then tap characters to create your password.',
      successMessage: 'Gate password armed!',
    },
  ];
}

export function getUpgradesForWave(wave: number): PasswordUpgradeOption[] {
  return DEFAULT_UPGRADES;
}

export function isPairedQuizLevel(wave: number): boolean {
  return wave === 1;
}
