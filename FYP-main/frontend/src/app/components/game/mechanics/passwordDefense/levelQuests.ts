import { analyzePassword } from './strength';

export const QUESTS_PER_LEVEL = 5;

export type DictionaryQuest = {
  id: string;
  weakPassword: string;
  title: string;
  situation: string;
};

export type TimedQuest = {
  id: string;
  title: string;
  /** Short story the player invents a password for. */
  situation: string;
  /** What account / thing the password protects. */
  forLabel: string;
  seconds: number;
};

export type RaidItem = {
  id: string;
  password: string;
  isSafe: boolean;
};

export type RaidQuest = {
  id: string;
  title: string;
  situation: string;
  items: RaidItem[];
  improveFrom: string;
};

export type ChecklistQuest = {
  id: string;
  title: string;
  situation: string;
};

export type BossQuest =
  | { id: string; kind: 'classify'; title: string; situation: string; items: RaidItem[] }
  | { id: string; kind: 'improve'; title: string; situation: string; weakPassword: string };

export const LEVEL2_QUESTS: DictionaryQuest[] = [
  {
    id: 'l2q1',
    weakPassword: 'dragon',
    title: 'Dictionary word spotted',
    situation: 'Attackers loaded “dragon” from a word list. Transform it into something they cannot guess.',
  },
  {
    id: 'l2q2',
    weakPassword: 'football',
    title: 'Sports word under fire',
    situation: '“football” is in every hacker dictionary. Mix cases, numbers, and symbols to break the pattern.',
  },
  {
    id: 'l2q3',
    weakPassword: 'princess',
    title: 'Fairy-tale password leak',
    situation: '“princess” is too popular. Upgrade it before the siege breaks the gate.',
  },
  {
    id: 'l2q4',
    weakPassword: 'computer',
    title: 'Obvious tech word',
    situation: 'Hackers try “computer” early. Strengthen it with uppercase, digits, and symbols.',
  },
  {
    id: 'l2q5',
    weakPassword: 'sunshine',
    title: 'Sunny but unsafe',
    situation: '“sunshine” sounds friendly — dictionaries love it. Make it uniquely fortified.',
  },
];

export const LEVEL3_QUESTS: TimedQuest[] = [
  {
    id: 'l3q1',
    title: 'School game signup',
    forLabel: 'MathQuest classroom account',
    situation:
      'Your class just got MathQuest accounts. A guessing bot is trying simple passwords on every seat. Invent a strong login before the signup timer ends.',
    seconds: 30,
  },
  {
    id: 'l3q2',
    title: 'Family tablet lock',
    forLabel: 'Shared family tablet',
    situation:
      'Your little sibling keeps unlocking the tablet with “1234”. Create a tougher unlock password before the device auto-locks and wipes the draft.',
    seconds: 28,
  },
  {
    id: 'l3q3',
    title: 'Birthday Wi‑Fi guest',
    forLabel: 'Party guest Wi‑Fi password',
    situation:
      'Friends are arriving for a birthday party. Make a one-time guest Wi‑Fi password that strangers outside can’t guess in time.',
    seconds: 26,
  },
  {
    id: 'l3q4',
    title: 'Club chat room',
    forLabel: 'Coding club chat login',
    situation:
      'You’re joining the coding club chat. Hackers spray common passwords at the room. Forge a unique login with letters, numbers, and a symbol — fast.',
    seconds: 25,
  },
  {
    id: 'l3q5',
    title: 'Secret journal app',
    forLabel: 'Private journal vault',
    situation:
      'Your private journal app asks for a vault password. Brute-force apps try millions of guesses per second — invent your strongest mix before time runs out.',
    seconds: 24,
  },
];

/** Level 4 — five Safe / Unsafe questions only (no password rebuilding). */
export const LEVEL4_QUESTS: RaidQuest[] = [
  {
    id: 'l4q1',
    title: 'Question 1',
    situation: 'Is this password safe or unsafe? Hackers try common number chains first.',
    items: [{ id: 'a1', password: '123456', isSafe: false }],
    improveFrom: '123456',
  },
  {
    id: 'l4q2',
    title: 'Question 2',
    situation: 'Decide Safe or Unsafe — look for length, mix of characters, and uniqueness.',
    items: [{ id: 'b1', password: 'Tr!ckyFox42', isSafe: true }],
    improveFrom: 'Tr!ckyFox42',
  },
  {
    id: 'l4q3',
    title: 'Question 3',
    situation: 'Millions of people still use this word. Safe or unsafe?',
    items: [{ id: 'c1', password: 'password', isSafe: false }],
    improveFrom: 'password',
  },
  {
    id: 'l4q4',
    title: 'Question 4',
    situation: 'Keyboard patterns are famous to hackers. Safe or unsafe?',
    items: [{ id: 'd1', password: 'qwerty', isSafe: false }],
    improveFrom: 'qwerty',
  },
  {
    id: 'l4q5',
    title: 'Question 5',
    situation: 'Final check — does this password look strong enough to keep private?',
    items: [{ id: 'e1', password: 'Blue$Orbit7', isSafe: true }],
    improveFrom: 'Blue$Orbit7',
  },
];

export const LEVEL5_QUESTS: ChecklistQuest[] = [
  {
    id: 'l5q1',
    title: 'Vault gate keys',
    situation: 'The royal vault needs a password that meets every security rule on the checklist.',
  },
  {
    id: 'l5q2',
    title: 'Treasure chest lock',
    situation: 'Tick every requirement. The chest only opens when the checklist glows complete.',
  },
  {
    id: 'l5q3',
    title: 'Crown chamber seal',
    situation: 'Build from scratch and watch each rule light up as you type.',
  },
  {
    id: 'l5q4',
    title: 'Archive door code',
    situation: 'No repeated dictionary words — the archives demand a fully compliant password.',
  },
  {
    id: 'l5q5',
    title: 'Kingdom master key',
    situation: 'Final vault seal: complete every checklist item to protect the treasure.',
  },
];

export const LEVEL6_QUESTS: BossQuest[] = [
  {
    id: 'l6q1',
    kind: 'classify',
    title: 'Boss phase: Scan the raid',
    situation: 'Mark each password ✔ Safe or ❌ Unsafe. Then you’ll strengthen the unsafe ones.',
    items: [
      { id: 'b1', password: '12345678', isSafe: false },
      { id: 'b2', password: 'Nova!Climb3', isSafe: true },
      { id: 'b3', password: 'password1', isSafe: false },
    ],
  },
  {
    id: 'l6q2',
    kind: 'classify',
    title: 'Boss phase: Threat sweep',
    situation: 'Spot the weak passwords. Next, rebuild each unsafe one into something stronger.',
    items: [
      { id: 'c1', password: 'qwerty123', isSafe: false },
      { id: 'c2', password: 'Maple$Tide9', isSafe: true },
      { id: 'c3', password: 'admin', isSafe: false },
    ],
  },
  {
    id: 'l6q3',
    kind: 'classify',
    title: 'Boss phase: Dictionary trap',
    situation: 'Common words are unsafe. Flag them, then forge safer replacements.',
    items: [
      { id: 'd1', password: 'castle', isSafe: false },
      { id: 'd2', password: 'Coral!Zen84', isSafe: true },
      { id: 'd3', password: 'dragon', isSafe: false },
    ],
  },
  {
    id: 'l6q4',
    kind: 'classify',
    title: 'Boss phase: Final forge prep',
    situation: 'One more raid list — decide Safe or Unsafe, then upgrade the weak ones.',
    items: [
      { id: 'e1', password: 'kingdom', isSafe: false },
      { id: 'e2', password: 'Pine#Glow17', isSafe: true },
      { id: 'e3', password: 'letmein', isSafe: false },
    ],
  },
  {
    id: 'l6q5',
    kind: 'classify',
    title: 'Boss phase: Kingdom seal check',
    situation: 'Last scan — pick Safe or Unsafe, then strengthen every unsafe password.',
    items: [
      { id: 'f1', password: 'welcome1', isSafe: false },
      { id: 'f2', password: 'Orbit!Hive62', isSafe: true },
      { id: 'f3', password: 'abc123', isSafe: false },
    ],
  },
];

export type ChecklistRule = {
  id: string;
  label: string;
  test: (password: string) => boolean;
};

export const VAULT_CHECKLIST: ChecklistRule[] = [
  { id: 'len', label: '8+ characters', test: (p) => p.length >= 8 },
  { id: 'upper', label: 'Uppercase', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'Lowercase', test: (p) => /[a-z]/.test(p) },
  { id: 'number', label: 'Number', test: (p) => /\d/.test(p) },
  { id: 'symbol', label: 'Symbol', test: (p) => /[^A-Za-z0-9]/.test(p) },
  {
    id: 'norepeat',
    label: 'No common dictionary words',
    test: (p) => {
      const lower = p.toLowerCase();
      const banned = ['password', 'dragon', 'football', 'princess', 'computer', 'sunshine', 'castle', 'kingdom', 'admin', 'qwerty', 'welcome', 'letmein'];
      return !banned.some((w) => lower.includes(w));
    },
  },
];

export function checklistComplete(password: string): boolean {
  return VAULT_CHECKLIST.every((r) => r.test(password));
}

/** Common substitutions kids use when fortifying a dictionary word (leet-style). */
const LEET_ALTS: Record<string, string[]> = {
  a: ['a', '@', '4'],
  b: ['b', '8'],
  c: ['c', '(', '<'],
  e: ['e', '3'],
  g: ['g', '9', '6'],
  // `l` often looks like `1` in mono fonts — accept both for i
  i: ['i', '1', '!', 'l', '|'],
  l: ['l', '1', '|', '!', 'i'],
  o: ['o', '0'],
  s: ['s', '$', '5', 'z'],
  t: ['t', '7', '+'],
  z: ['z', '2'],
};

const MIN_DEFENSE_STRENGTH = 75;

function altsForLetter(ch: string): string[] {
  return LEET_ALTS[ch] ?? [ch];
}

function charMatchesLetter(letter: string, ch: string): boolean {
  return altsForLetter(letter).includes(ch);
}

/**
 * Dictionary word can be rebuilt in order using letters and/or lookalike
 * numbers/symbols (e.g. princess → Pr1nCe$$ / PrlnCe$$). Extra characters OK.
 */
export function containsAllDictionaryLetters(base: string, next: string): boolean {
  const password = next.toLowerCase();
  let pi = 0;
  for (const ch of base.toLowerCase()) {
    if (!/[a-z]/.test(ch)) continue;
    let found = false;
    while (pi < password.length) {
      const c = password[pi++];
      if (charMatchesLetter(ch, c)) {
        found = true;
        break;
      }
    }
    if (!found) return false;
  }
  return true;
}

export function isImprovedDictionaryPassword(base: string, next: string): { ok: boolean; message: string } {
  if (!containsAllDictionaryLetters(base, next)) {
    return {
      ok: false,
      message: `Rebuild “${base}” in your password — letters can stay the same or use lookalikes like 0 for o, 1 for i, $ for s.`,
    };
  }
  if (next.length < base.length) {
    return { ok: false, message: 'Make the password at least as long as the dictionary word.' };
  }
  if (next.toLowerCase() === base.toLowerCase()) {
    return { ok: false, message: 'Change the weak word — mix in numbers or symbols.' };
  }
  if (!/[A-Z]/.test(next)) return { ok: false, message: 'Add an uppercase letter.' };
  if (!/[a-z]/.test(next)) return { ok: false, message: 'Keep some lowercase letters.' };

  const hasNumber = /\d/.test(next);
  const hasSymbol = /[^A-Za-z0-9]/.test(next);
  // Count how many dictionary letters were replaced by a non-letter lookalike
  const baseLetters = base.toLowerCase().replace(/[^a-z]/g, '');
  let replaced = 0;
  let pi = 0;
  const password = next.toLowerCase();
  for (const letter of baseLetters) {
    while (pi < password.length) {
      const c = password[pi++];
      if (charMatchesLetter(letter, c)) {
        if (c !== letter) replaced += 1;
        break;
      }
    }
  }

  if (!hasNumber && !hasSymbol) {
    return { ok: false, message: 'Add numbers or symbols to harden the dictionary word.' };
  }
  if (!hasNumber && replaced < 2) {
    return { ok: false, message: 'Add at least one number (0–9), or swap more letters for symbols like $ @ !.' };
  }
  if (!hasSymbol) {
    return { ok: false, message: 'Add a symbol (!@#$…).' };
  }

  const strength = analyzePassword(next).score;
  if (strength < MIN_DEFENSE_STRENGTH) {
    return {
      ok: false,
      message: `Defense Strength is ${strength}/100 — need at least ${MIN_DEFENSE_STRENGTH}. Try again with a stronger mix!`,
    };
  }

  return { ok: true, message: '' };
}
