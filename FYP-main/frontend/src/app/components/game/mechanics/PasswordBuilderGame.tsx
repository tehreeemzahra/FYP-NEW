import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { KeyRound, Plus, Trash2 } from 'lucide-react';
import { playUiClick } from '../../playUiClick';

const DEFAULT_TILES = ['A', 'a', '3', '!', 'Z', 'z', '9', '@', 'K', 'k', '7', '#', 'M', 'm', '5', '$'];

interface PasswordBuilderGameProps {
  targetLength?: number;
  rounds?: number;
  onRoundComplete: () => void;
  onAllComplete: () => void;
  onCorrect: (message: string) => void;
  onWrong: (message: string, mistakeId: string) => void;
}

function checkStrength(password: string) {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

export function PasswordBuilderGame({
  targetLength = 8,
  rounds = 3,
  onRoundComplete,
  onAllComplete,
  onCorrect,
  onWrong,
}: PasswordBuilderGameProps) {
  const [round, setRound] = useState(0);
  const [slots, setSlots] = useState<string[]>([]);
  const [tiles] = useState(() => [...DEFAULT_TILES].sort(() => Math.random() - 0.5));

  const password = slots.join('');
  const rules = useMemo(() => checkStrength(password), [password]);
  const allMet = Object.values(rules).every(Boolean);

  const addTile = (tile: string) => {
    if (slots.length >= 12) return;
    playUiClick(0.25);
    setSlots((s) => [...s, tile]);
  };

  const removeLast = () => {
    playUiClick(0.25);
    setSlots((s) => s.slice(0, -1));
  };

  const submit = () => {
    if (!allMet) {
      onWrong('Your password needs length 8+, uppercase, lowercase, a number, and a symbol.', `builder_r${round}`);
      return;
    }
    onCorrect('Fortress-grade password built! Attackers will struggle to crack this.');
    setTimeout(() => {
      onRoundComplete();
      if (round >= rounds - 1) onAllComplete();
      else {
        setRound((r) => r + 1);
        setSlots([]);
      }
    }, 1500);
  };

  const ruleList = [
    { key: 'length', label: `At least ${targetLength} characters`, met: rules.length },
    { key: 'upper', label: 'Uppercase letter', met: rules.upper },
    { key: 'lower', label: 'Lowercase letter', met: rules.lower },
    { key: 'number', label: 'Number', met: rules.number },
    { key: 'symbol', label: 'Symbol (!@#$)', met: rules.symbol },
  ];

  return (
    <div className="cq-game-panel p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4 text-cyan-200">
        <KeyRound className="w-5 h-5" />
        <span className="font-semibold">Build Round {round + 1} of {rounds}</span>
      </div>

      <div className="bg-slate-900/60 rounded-xl p-3 sm:p-4 mb-4 min-h-[56px] flex items-center gap-1 flex-wrap font-mono text-base sm:text-xl break-all">
        {slots.length === 0 ? (
          <span className="text-white/40 text-sm">Tap tiles below to build your password...</span>
        ) : (
          slots.map((c, i) => (
            <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-yellow-300">
              {c}
            </motion.span>
          ))
        )}
      </div>

      <div className="cq-tile-grid mb-4">
        {tiles.map((tile, i) => (
          <motion.button
            key={`${tile}-${i}`}
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => addTile(tile)}
            className="cq-touch-target py-2 rounded-lg bg-white/15 hover:bg-white/25 font-mono font-bold text-base sm:text-lg"
          >
            {tile}
          </motion.button>
        ))}
      </div>

      <button
        type="button"
        onClick={removeLast}
        disabled={slots.length === 0}
        className="mb-4 text-sm text-white/70 hover:text-white flex items-center gap-1 disabled:opacity-40"
      >
        <Trash2 className="w-4 h-4" /> Remove last
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
        {ruleList.map((r) => (
          <div
            key={r.key}
            className={`text-sm px-3 py-2 rounded-lg ${r.met ? 'bg-green-500/25 text-green-200' : 'bg-white/10 text-white/70'}`}
          >
            {r.met ? '✓' : '○'} {r.label}
          </div>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={submit}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 font-bold flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Lock In Password
      </motion.button>
    </div>
  );
}
