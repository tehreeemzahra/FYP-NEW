import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, ShieldAlert } from 'lucide-react';
import { playUiClick } from '../../playUiClick';

export type InvestigationSegment = {
  id: string;
  text: string;
  isSuspicious: boolean;
  explanation: string;
};

export type InvestigationRound = {
  id: string;
  title: string;
  context: string;
  segments: InvestigationSegment[];
};

interface InvestigationGameProps {
  rounds: InvestigationRound[];
  onRoundComplete: (roundId: string) => void;
  onAllComplete: () => void;
  onCorrect: (message: string) => void;
  onWrong: (message: string, mistakeId: string) => void;
}

export function InvestigationGame({
  rounds,
  onRoundComplete,
  onAllComplete,
  onCorrect,
  onWrong,
}: InvestigationGameProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const round = rounds[roundIndex];
  const suspiciousIds = new Set(round.segments.filter((s) => s.isSuspicious).map((s) => s.id));

  const toggle = (id: string) => {
    if (submitted) return;
    playUiClick(0.3);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const check = () => {
    setSubmitted(true);
    const correct =
      selected.size === suspiciousIds.size && [...selected].every((id) => suspiciousIds.has(id));

    if (correct) {
      onCorrect('Great detective work! You spotted all the red flags.');
      setTimeout(() => {
        onRoundComplete(round.id);
        if (roundIndex >= rounds.length - 1) {
          onAllComplete();
        } else {
          setRoundIndex((i) => i + 1);
          setSelected(new Set());
          setSubmitted(false);
        }
      }, 1800);
    } else {
      const missed = [...suspiciousIds].filter((id) => !selected.has(id));
      const wrongPick = [...selected].find((id) => !suspiciousIds.has(id));
      const explanation =
        round.segments.find((s) => s.id === wrongPick)?.explanation ||
        round.segments.find((s) => s.id === missed[0])?.explanation ||
        'Look for urgency, unknown senders, and requests for secrets.';
      onWrong(explanation, `${round.id}_investigation`);
      setTimeout(() => setSubmitted(false), 2000);
    }
  };

  return (
    <div className="cq-game-panel p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-3 text-cyan-200">
        <Search className="w-5 h-5" />
        <span className="font-semibold text-sm">{round.title}</span>
      </div>
      <p className="text-white/80 text-sm mb-4">{round.context}</p>
      <p className="text-white font-medium mb-3 text-sm sm:text-base">
        Tap every suspicious part you find:
      </p>

      <div className="bg-slate-900/50 rounded-xl p-4 sm:p-5 leading-relaxed text-base sm:text-lg">
        {round.segments.map((seg) => {
          const isSelected = selected.has(seg.id);
          const showResult = submitted && seg.isSuspicious;
          const showWrong = submitted && isSelected && !seg.isSuspicious;

          return (
            <motion.button
              key={seg.id}
              type="button"
              onClick={() => toggle(seg.id)}
              whileTap={{ scale: 0.98 }}
              className={`inline rounded px-1 mx-0.5 transition-colors ${
                showResult
                  ? 'bg-red-500/40 ring-2 ring-red-400'
                  : showWrong
                  ? 'bg-orange-500/40 ring-2 ring-orange-400'
                  : isSelected
                  ? 'bg-yellow-400/30 ring-2 ring-yellow-400'
                  : 'hover:bg-white/10'
              }`}
            >
              {seg.text}
            </motion.button>
          );
        })}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={check}
        disabled={selected.size === 0 || submitted}
        className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <ShieldAlert className="w-5 h-5" />
        Submit Investigation
      </motion.button>
    </div>
  );
}
