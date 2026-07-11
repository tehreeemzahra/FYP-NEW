import { ReactNode, useState } from 'react';
import { motion } from 'motion/react';
import { Castle, Star } from 'lucide-react';

export type BossPhase = {
  id: string;
  title: string;
  content: ReactNode;
};

interface BossMissionGameProps {
  title: string;
  phases: BossPhase[];
  onAllComplete: () => void;
}

export function BossMissionGame({ title, phases, onAllComplete }: BossMissionGameProps) {
  const [phase, setPhase] = useState(0);

  const advance = () => {
    if (phase >= phases.length - 1) onAllComplete();
    else setPhase((p) => p + 1);
  };

  return (
    <div className="cq-game-panel p-5 sm:p-6 border-purple-400/30 bg-gradient-to-br from-purple-900/40 to-indigo-900/40">
      <div className="flex items-center gap-2 mb-4 text-yellow-300">
        <Castle className="w-6 h-6" />
        <span className="font-bold">{title}</span>
      </div>

      <div className="flex gap-2 mb-5">
        {phases.map((p, i) => (
          <div
            key={p.id}
            className={`flex-1 h-2 rounded-full ${i <= phase ? 'bg-yellow-400' : 'bg-white/20'}`}
          />
        ))}
      </div>

      <motion.div key={phases[phase].id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          {phases[phase].title}
        </h3>
        <div onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.dataset?.bossAdvance === 'true') advance();
        }}>
          {phases[phase].content}
        </div>
      </motion.div>
    </div>
  );
}

export function BossAdvanceButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      data-boss-advance="true"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-900 font-bold"
    >
      {label}
    </motion.button>
  );
}
