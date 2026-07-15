import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CaseLower,
  CaseUpper,
  Castle,
  Delete,
  Hash,
  Keyboard,
  Sparkles,
  Trash2,
  Vault,
  Zap,
} from 'lucide-react';
import { playUiClick } from '../../../playUiClick';
import { analyzePassword, type PasswordAnalysis } from './strength';

export type CharCategory = 'upper' | 'lower' | 'numbers' | 'symbols';

export const CHARSETS: Record<CharCategory, string[]> = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  lower: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  numbers: '0123456789'.split(''),
  symbols: '!@#$%&*?+_-=.'.split(''),
};

export const CATEGORIES: {
  id: CharCategory;
  label: string;
  shortLabel: string;
  sample: string;
  Icon: typeof CaseUpper;
}[] = [
  { id: 'upper', label: 'Uppercase', shortLabel: 'A–Z', sample: 'ABC', Icon: CaseUpper },
  { id: 'lower', label: 'Lowercase', shortLabel: 'a–z', sample: 'abc', Icon: CaseLower },
  { id: 'numbers', label: 'Numbers', shortLabel: '0–9', sample: '123', Icon: Hash },
  { id: 'symbols', label: 'Symbols', shortLabel: '!@#', sample: '!@#', Icon: Sparkles },
];

export const MAX_PASSWORD_LEN = 16;

export function CastleScene({
  wallHp,
  maxHp,
  shieldActive,
  underAttack,
  gateOpen,
  projectileKey,
  cracking,
}: {
  wallHp: number;
  maxHp: number;
  shieldActive?: boolean;
  underAttack?: boolean;
  gateOpen?: boolean;
  projectileKey?: number;
  cracking?: boolean;
}) {
  const hpPct = Math.max(0, Math.min(100, (wallHp / Math.max(maxHp, 1)) * 100));

  return (
    <div className="relative h-28 min-[380px]:h-32 sm:h-40 mb-3 sm:mb-4 rounded-xl overflow-hidden bg-gradient-to-b from-indigo-950/80 to-slate-900/90 border border-cyan-500/20">
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 to-transparent" />
      {cracking && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.1, 0.35, 0.15] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          style={{
            backgroundImage:
              'repeating-linear-gradient(115deg, transparent, transparent 10px, rgba(239,68,68,0.12) 10px, rgba(239,68,68,0.12) 12px)',
          }}
        />
      )}

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 min-[380px]:w-40 sm:w-52">
        <div className="flex justify-center gap-1 mb-0">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-7 h-8 sm:w-10 sm:h-12 bg-slate-600 border border-slate-500 rounded-t-lg relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[9px] border-r-[9px] border-b-[7px] border-l-transparent border-r-transparent border-b-slate-500" />
            </div>
          ))}
        </div>
        <div
          className="h-12 sm:h-16 bg-gradient-to-b from-slate-500 to-slate-700 border-x-4 border-slate-600 rounded-sm relative transition-all duration-500"
          style={{
            boxShadow: shieldActive ? '0 0 24px rgba(34,211,238,0.5)' : undefined,
            opacity: 0.5 + hpPct / 200,
          }}
        >
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-9 h-10 sm:w-12 sm:h-14 bg-amber-900/80 border-2 border-amber-600 rounded-t-full"
            animate={{ scaleY: gateOpen ? 0.3 : 1 }}
            style={{ transformOrigin: 'bottom' }}
          />
        </div>
      </div>

      <div className="absolute top-2 left-2 right-2">
        <div className="flex justify-between text-[10px] sm:text-xs text-white/70 mb-0.5">
          <span className="flex items-center gap-1"><Castle className="w-3 h-3" /> Wall Integrity</span>
          <span>{Math.round(hpPct)}%</span>
        </div>
        <div className="h-2 bg-black/40 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${hpPct > 50 ? 'bg-emerald-500' : hpPct > 25 ? 'bg-amber-500' : 'bg-red-500'}`}
            animate={{ width: `${hpPct}%` }}
            transition={{ duration: 0.35 }}
          />
        </div>
      </div>

      <AnimatePresence>
        {underAttack && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
            className="absolute inset-0 bg-red-500/30 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {projectileKey !== undefined && projectileKey > 0 && (
          <motion.div
            key={projectileKey}
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)] z-20"
            initial={{ left: '100%', opacity: 1 }}
            animate={{ left: '42%', opacity: [1, 1, 0] }}
            transition={{ duration: 0.55, ease: 'easeIn' }}
          />
        )}
      </AnimatePresence>

      <Vault className="absolute bottom-2 right-3 w-5 h-5 sm:w-6 sm:h-6 text-yellow-400/80" />
    </div>
  );
}

export function PowerMeter({ analysis, label = 'Password Power' }: { analysis: PasswordAnalysis | null; label?: string }) {
  const score = analysis?.score ?? 0;
  const color = score >= 70 ? 'from-emerald-400 to-cyan-400' : score >= 40 ? 'from-amber-400 to-orange-400' : 'from-red-500 to-rose-500';

  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs sm:text-sm text-white/75 mb-1.5">
        <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-300" /> {label}</span>
        <span className="font-semibold tabular-nums">{score}/100</span>
      </div>
      <div className="h-2.5 sm:h-3 bg-black/35 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${color}`}
          animate={{ width: `${score}%` }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        />
      </div>
      {analysis && analysis.length > 0 && (
        <p className="text-[11px] sm:text-xs text-cyan-300/90 mt-1.5">Crack time: {analysis.crackTimeLabel}</p>
      )}
    </div>
  );
}

function BlinkingCursor() {
  return (
    <motion.span
      aria-hidden
      className="inline-block w-0.5 h-5 sm:h-6 bg-cyan-300 rounded-full ml-0.5 align-middle"
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
}

function CategoryKeyboard({
  category,
  onPick,
}: {
  category: CharCategory;
  onPick: (ch: string) => void;
}) {
  const chars = CHARSETS[category];
  const cols =
    category === 'numbers'
      ? 'grid-cols-5'
      : category === 'symbols'
        ? 'grid-cols-5 sm:grid-cols-7'
        : 'grid-cols-6 sm:grid-cols-7';

  return (
    <motion.div
      key={category}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="rounded-2xl border border-cyan-400/25 bg-slate-950/70 p-3 sm:p-4"
    >
      <p className="text-[11px] sm:text-xs uppercase tracking-wider text-cyan-200/70 mb-2.5 font-semibold">
        Tap a character
      </p>
      <div className={`grid ${cols} gap-2`}>
        {chars.map((ch) => (
          <motion.button
            key={`${category}-${ch}`}
            type="button"
            whileTap={{ scale: 0.88 }}
            onClick={() => onPick(ch)}
            className="cq-touch-target min-h-12 sm:min-h-11 rounded-xl bg-white/12 hover:bg-cyan-500/35 font-mono font-bold text-base sm:text-lg text-white border border-white/15"
            aria-label={`Add ${ch}`}
          >
            {ch}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

export function usePasswordSlots(initial = '') {
  const [slots, setSlots] = useState<string[]>(() => (initial ? initial.split('') : []));
  const [activeCategory, setActiveCategory] = useState<CharCategory | null>(null);
  const [lastAddedIndex, setLastAddedIndex] = useState<number | null>(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (lastAddedIndex === null) return;
    const t = window.setTimeout(() => setLastAddedIndex(null), 280);
    return () => window.clearTimeout(t);
  }, [lastAddedIndex]);

  const password = slots.join('');
  const analysis = password ? analyzePassword(password) : null;

  const pulseShake = () => {
    setShake(true);
    window.setTimeout(() => setShake(false), 400);
  };

  const addChar = (ch: string) => {
    if (slots.length >= MAX_PASSWORD_LEN) {
      playUiClick(0.12);
      pulseShake();
      return;
    }
    playUiClick(0.2);
    setSlots((s) => {
      const next = [...s, ch];
      setLastAddedIndex(next.length - 1);
      return next;
    });
  };

  const backspace = () => {
    if (!slots.length) {
      pulseShake();
      return;
    }
    playUiClick(0.2);
    setSlots((s) => s.slice(0, -1));
  };

  const clear = () => {
    playUiClick(0.2);
    setSlots([]);
    setActiveCategory(null);
  };

  const resetTo = (value: string) => {
    setSlots(value ? value.split('') : []);
    setActiveCategory(null);
    setLastAddedIndex(null);
  };

  /** Replace the full password (for real keyboard typing). */
  const setPassword = (value: string) => {
    const trimmed = value.slice(0, MAX_PASSWORD_LEN);
    setSlots(trimmed ? trimmed.split('') : []);
    setLastAddedIndex(trimmed.length ? trimmed.length - 1 : null);
  };

  const selectCategory = (id: CharCategory) => {
    playUiClick(0.22);
    setActiveCategory((prev) => (prev === id ? null : id));
  };

  return {
    slots,
    password,
    analysis,
    activeCategory,
    lastAddedIndex,
    shake,
    pulseShake,
    addChar,
    backspace,
    clear,
    resetTo,
    setPassword,
    selectCategory,
  };
}

export function MissionPanel({
  wave,
  challengeLabel,
  stageTitle,
  children,
}: {
  wave: number;
  challengeLabel: string;
  stageTitle: string;
  children: ReactNode;
}) {
  return (
    <div className="cq-game-panel p-3.5 sm:p-5 md:p-6">
      <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3">
        <div className="flex items-center gap-2 text-cyan-200 min-w-0">
          <Castle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span className="font-bold text-sm sm:text-base truncate">Password Castle</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="cq-chip text-[10px] sm:text-xs px-2 py-0.5">Wave {wave}</span>
          <span className="text-[10px] sm:text-xs text-white/55 font-medium">{challengeLabel}</span>
        </div>
      </div>
      <p className="text-white/70 text-xs sm:text-sm mb-3">{stageTitle}</p>
      {children}
    </div>
  );
}

export function PasswordBuilderPanel({
  slots,
  lastAddedIndex,
  shake,
  success,
  activeCategory,
  onSelectCategory,
  onAddChar,
  onBackspace,
  onClear,
  onSubmit,
  submitLabel,
  placeholder = 'Tap a category below',
  placeholderEmphasis = false,
}: {
  slots: string[];
  lastAddedIndex: number | null;
  shake: boolean;
  success?: boolean;
  activeCategory: CharCategory | null;
  onSelectCategory: (id: CharCategory) => void;
  onAddChar: (ch: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSubmit: () => void;
  submitLabel: string;
  placeholder?: string;
  /** Larger mono placeholder (e.g. Level 2 dictionary word). */
  placeholderEmphasis?: boolean;
}) {
  return (
    <div className="space-y-3.5 sm:space-y-4">
      <motion.div
        animate={
          shake
            ? { x: [0, -8, 8, -6, 6, 0] }
            : success
              ? { scale: [1, 1.03, 1] }
              : { x: 0, scale: 1 }
        }
        className={`rounded-2xl border px-3 py-3 sm:px-4 sm:py-3.5 ${
          success ? 'bg-emerald-500/15 border-emerald-400/50' : 'bg-slate-950/80 border-cyan-400/35'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] sm:text-xs uppercase tracking-wider text-cyan-200/80 font-semibold">
            Your password
          </span>
          <span className="text-[11px] sm:text-xs text-white/45 tabular-nums">
            {slots.length}/{MAX_PASSWORD_LEN}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 min-h-12 sm:min-h-14 rounded-xl bg-black/35 border border-white/10 px-3 py-2.5 flex items-center overflow-x-auto">
            {slots.length === 0 ? (
              <span
                className={`flex items-center gap-1 ${
                  placeholderEmphasis
                    ? 'text-yellow-300/45 text-xl sm:text-2xl font-mono font-bold tracking-wide'
                    : 'text-white/40 text-sm sm:text-base'
                }`}
              >
                {placeholder}
                <BlinkingCursor />
              </span>
            ) : (
              <div className="flex items-center flex-wrap gap-y-1 font-mono text-xl sm:text-2xl tracking-wide">
                {slots.map((c, i) => (
                  <motion.span
                    key={`${i}-${c}`}
                    initial={i === lastAddedIndex ? { scale: 0, y: 8, opacity: 0 } : false}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    className="text-yellow-300"
                  >
                    {c}
                  </motion.span>
                ))}
                <BlinkingCursor />
              </div>
            )}
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={onBackspace}
            className="cq-touch-target shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center"
            aria-label="Delete last character"
          >
            <Delete className="w-5 h-5 text-white/90" />
          </motion.button>
        </div>
      </motion.div>

      <div>
        <p className="text-[11px] sm:text-xs uppercase tracking-wider text-white/50 mb-2 font-semibold">
          Choose characters
        </p>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {CATEGORIES.map(({ id, label, shortLabel, sample, Icon }) => {
            const active = activeCategory === id;
            return (
              <motion.button
                key={id}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => onSelectCategory(id)}
                className={`cq-touch-target min-h-[3.25rem] rounded-2xl border px-3 py-2.5 text-left ${
                  active
                    ? 'bg-cyan-500/25 border-cyan-300/60 ring-2 ring-cyan-400/35'
                    : 'bg-white/8 border-white/15 hover:bg-white/12'
                }`}
                aria-pressed={active}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    active ? 'bg-cyan-400/25 text-cyan-200' : 'bg-white/10 text-white/70'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-white leading-tight">{label}</p>
                    <p className="text-[11px] text-white/55 mt-0.5">
                      <span className="font-mono text-white/70">{sample}</span>
                      <span className="mx-1">·</span>
                      {shortLabel}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeCategory && (
          <CategoryKeyboard key={activeCategory} category={activeCategory} onPick={onAddChar} />
        )}
      </AnimatePresence>

      <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-1">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onClear}
          className="cq-btn-secondary min-h-12 px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2 sm:w-auto w-full"
        >
          <Trash2 className="w-4 h-4" /> Clear
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onSubmit}
          className="cq-btn-primary flex-1 min-h-12 py-3 text-sm sm:text-base font-bold"
        >
          {submitLabel}
        </motion.button>
      </div>
    </div>
  );
}

/** Real typing field for timed challenges (physical / OS keyboard). */
export function PasswordTypingPanel({
  value,
  shake,
  success,
  onChange,
  onClear,
  onSubmit,
  submitLabel,
  placeholder = 'Type a strong password…',
  focusKey,
}: {
  value: string;
  shake: boolean;
  success?: boolean;
  onChange: (next: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  submitLabel: string;
  placeholder?: string;
  /** Change this (e.g. quest index) to refocus the field. */
  focusKey?: string | number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(id);
  }, [focusKey]);

  return (
    <div className="space-y-3.5 sm:space-y-4">
      <motion.div
        animate={
          shake
            ? { x: [0, -8, 8, -6, 6, 0] }
            : success
              ? { scale: [1, 1.03, 1] }
              : { x: 0, scale: 1 }
        }
        className={`rounded-2xl border px-3 py-3 sm:px-4 sm:py-3.5 ${
          success ? 'bg-emerald-500/15 border-emerald-400/50' : 'bg-slate-950/80 border-cyan-400/35'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] sm:text-xs uppercase tracking-wider text-cyan-200/80 font-semibold">
            Your password
          </span>
          <span className="text-[11px] sm:text-xs text-white/45 tabular-nums">
            {value.length}/{MAX_PASSWORD_LEN}
          </span>
        </div>
        <input
          ref={inputRef}
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={MAX_PASSWORD_LEN}
          value={value}
          disabled={success}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_PASSWORD_LEN))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (!success) onSubmit();
            }
          }}
          className="w-full min-h-12 sm:min-h-14 rounded-xl bg-black/35 border border-white/10 px-3 py-2.5 font-mono text-xl sm:text-2xl tracking-wide text-yellow-300 placeholder:text-white/35 placeholder:font-sans placeholder:text-sm sm:placeholder:text-base outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/25 disabled:opacity-70"
          aria-label="Type your password with the keyboard"
        />
        <p className="mt-2.5 flex items-center gap-1.5 text-[11px] sm:text-xs text-white/50">
          <Keyboard className="w-3.5 h-3.5 shrink-0 text-cyan-300/80" />
          Type on your keyboard — press Enter to lock
        </p>
      </motion.div>

      <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-1">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onClear}
          disabled={success}
          className="cq-btn-secondary min-h-12 px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2 sm:w-auto w-full disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" /> Clear
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onSubmit}
          disabled={success}
          className="cq-btn-primary flex-1 min-h-12 py-3 text-sm sm:text-base font-bold disabled:opacity-50"
        >
          {submitLabel}
        </motion.button>
      </div>
    </div>
  );
}
