export type AttackType = 'dictionary' | 'brute_force' | 'common' | 'reuse';

export interface PasswordAnalysis {
  score: number;
  length: number;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  isCommon: boolean;
  isPredictable: boolean;
  crackTimeLabel: string;
  crackTimeSeconds: number;
}

const COMMON_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123', 'letmein',
  'welcome', 'admin', 'login', 'pass', 'hello', 'dragon',
];

export function analyzePassword(password: string): PasswordAnalysis {
  const length = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const lower = password.toLowerCase();
  const isCommon = COMMON_PASSWORDS.some((c) => lower.includes(c));
  const isPredictable = isCommon || /^[a-z]+$/.test(password) || /^\d+$/.test(password);

  let score = 0;
  score += Math.min(length * 5, 45);
  if (hasUpper) score += 12;
  if (hasLower) score += 12;
  if (hasNumber) score += 12;
  if (hasSymbol) score += 14;
  if (length >= 12) score += 10;
  if (isCommon) score -= 35;
  if (isPredictable && length < 8) score -= 20;

  score = Math.max(0, Math.min(100, score));

  const charsetSize =
    (hasLower ? 26 : 0) + (hasUpper ? 26 : 0) + (hasNumber ? 10 : 0) + (hasSymbol ? 32 : 0) || 1;
  const combinations = Math.pow(charsetSize, Math.max(length, 1));
  let crackTimeSeconds = combinations / 1_000_000_000;

  if (isCommon) crackTimeSeconds = 0.001;
  if (length < 6) crackTimeSeconds = Math.min(crackTimeSeconds, 60);

  const crackTimeLabel = formatCrackTime(crackTimeSeconds);

  return {
    score,
    length,
    hasUpper,
    hasLower,
    hasNumber,
    hasSymbol,
    isCommon,
    isPredictable,
    crackTimeLabel,
    crackTimeSeconds,
  };
}

function formatCrackTime(seconds: number): string {
  if (seconds < 1) return 'Instant';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 86400 * 365) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 86400 * 365 * 100) return `${Math.round(seconds / (86400 * 365))} years`;
  return 'Centuries+';
}

export interface AttackConfig {
  id: AttackType;
  name: string;
  description: string;
  power: number;
  icon: string;
}

export const ATTACKS: AttackConfig[] = [
  { id: 'dictionary', name: 'Dictionary Attack', description: 'Hackers try millions of common words from lists.', power: 55, icon: '📖' },
  { id: 'brute_force', name: 'Brute Force Attack', description: 'Every possible combination is tested at high speed.', power: 70, icon: '⚡' },
  { id: 'common', name: 'Common Password Attack', description: 'Top 10,000 passwords are tried first.', power: 80, icon: '🔓' },
  { id: 'reuse', name: 'Credential Reuse', description: 'A leaked password from another site is replayed here.', power: 65, icon: '♻️' },
];

export function getAttacksForWave(wave: number): AttackConfig[] {
  const pool = [...ATTACKS];
  const count = Math.min(2 + Math.floor(wave / 2), 4);
  return pool.slice(0, count);
}

export function meetsWaveRequirements(password: string, wave: number): { ok: boolean; message: string } {
  const a = analyzePassword(password);
  const minLen = 6 + Math.min(wave, 4);

  if (a.length < minLen) {
    return { ok: false, message: `Your gate password needs at least ${minLen} characters.` };
  }
  if (!a.hasUpper) return { ok: false, message: 'Add an uppercase letter to strengthen the gate.' };
  if (!a.hasLower) return { ok: false, message: 'Add a lowercase letter to strengthen the gate.' };
  if (!a.hasNumber) return { ok: false, message: 'Add a number — length alone is not enough.' };
  if (wave >= 3 && !a.hasSymbol) {
    return { ok: false, message: 'This wave requires a special symbol (!@#$).' };
  }
  if (a.isCommon) {
    return { ok: false, message: 'Predictable passwords like "password" fail instantly!' };
  }
  return { ok: true, message: '' };
}

export function calcWallDamage(analysis: PasswordAnalysis, attack: AttackConfig): number {
  const defense = analysis.score;
  const raw = attack.power - defense * 0.7;
  return Math.max(5, Math.min(40, Math.round(raw)));
}

export function calcInitialWallHp(analysis: PasswordAnalysis): number {
  return Math.min(100, 40 + analysis.score * 0.6);
}
