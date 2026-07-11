import { useState } from 'react';
import { motion } from 'motion/react';
import { Globe, Lock, AlertTriangle } from 'lucide-react';
import { playUiClick } from '../../playUiClick';

export type WebsiteOption = {
  id: string;
  url: string;
  title: string;
  details: string[];
  isLegit: boolean;
  explanation: string;
};

export type WebsiteCompareRound = {
  id: string;
  prompt: string;
  left: WebsiteOption;
  right: WebsiteOption;
};

interface WebsiteCompareGameProps {
  rounds: WebsiteCompareRound[];
  onRoundComplete: () => void;
  onAllComplete: () => void;
  onCorrect: (message: string) => void;
  onWrong: (message: string, mistakeId: string) => void;
}

function SiteCard({ site, selected, onSelect }: { site: WebsiteOption; selected: boolean; onSelect: () => void }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`text-left p-4 rounded-xl border-2 transition-all flex-1 ${
        selected ? 'border-cyan-400 bg-cyan-500/20' : 'border-white/20 bg-slate-900/40 hover:border-white/40'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {site.isLegit ? <Lock className="w-4 h-4 text-green-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
        <span className="font-mono text-xs sm:text-sm text-cyan-200 truncate">{site.url}</span>
      </div>
      <p className="font-bold text-sm mb-2">{site.title}</p>
      <ul className="text-xs text-white/70 space-y-1">
        {site.details.map((d, i) => (
          <li key={i}>• {d}</li>
        ))}
      </ul>
    </motion.button>
  );
}

export function WebsiteCompareGame({
  rounds,
  onRoundComplete,
  onAllComplete,
  onCorrect,
  onWrong,
}: WebsiteCompareGameProps) {
  const [index, setIndex] = useState(0);
  const [pick, setPick] = useState<'left' | 'right' | null>(null);
  const round = rounds[index];

  const choose = (side: 'left' | 'right') => {
    playUiClick();
    setPick(side);
    const chosen = side === 'left' ? round.left : round.right;
    const legit = chosen.isLegit;

    if (legit) {
      onCorrect(chosen.explanation);
      setTimeout(() => {
        onRoundComplete();
        if (index >= rounds.length - 1) onAllComplete();
        else {
          setIndex((i) => i + 1);
          setPick(null);
        }
      }, 1800);
    } else {
      onWrong(chosen.explanation, `${round.id}_compare`);
      setTimeout(() => setPick(null), 2000);
    }
  };

  return (
    <div className="cq-game-panel p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-3 text-cyan-200">
        <Globe className="w-5 h-5" />
        <span className="font-semibold text-sm">Round {index + 1} of {rounds.length}</span>
      </div>
      <p className="text-white mb-4 text-sm sm:text-base">{round.prompt}</p>

      <div className="flex flex-col sm:flex-row gap-3">
        <SiteCard site={round.left} selected={pick === 'left'} onSelect={() => choose('left')} />
        <SiteCard site={round.right} selected={pick === 'right'} onSelect={() => choose('right')} />
      </div>
    </div>
  );
}
