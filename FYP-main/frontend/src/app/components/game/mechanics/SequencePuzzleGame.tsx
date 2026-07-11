import { useState } from 'react';
import { motion } from 'motion/react';
import { ListOrdered, ChevronUp, ChevronDown } from 'lucide-react';
import { playUiClick } from '../../playUiClick';

export type SequenceStep = {
  id: string;
  label: string;
  order: number;
};

interface SequencePuzzleGameProps {
  steps: SequenceStep[];
  title: string;
  onAllComplete: () => void;
  onCorrect: (message: string) => void;
  onWrong: (message: string, mistakeId: string) => void;
}

export function SequencePuzzleGame({
  steps,
  title,
  onAllComplete,
  onCorrect,
  onWrong,
}: SequencePuzzleGameProps) {
  const [order, setOrder] = useState(() => [...steps].sort(() => Math.random() - 0.5).map((s) => s.id));

  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= order.length) return;
    playUiClick(0.25);
    const copy = [...order];
    [copy[index], copy[next]] = [copy[next], copy[index]];
    setOrder(copy);
  };

  const submit = () => {
    const correct = order.every((id, i) => {
      const step = steps.find((s) => s.id === id)!;
      return step.order === i + 1;
    });

    if (correct) {
      onCorrect('Perfect order! You know the right steps to stay safe.');
      setTimeout(onAllComplete, 1500);
    } else {
      onWrong('Some steps are out of order. Think: what should you do first in a real emergency?', 'sequence_wrong');
    }
  };

  const stepMap = Object.fromEntries(steps.map((s) => [s.id, s]));

  return (
    <div className="cq-game-panel p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-3 text-cyan-200">
        <ListOrdered className="w-5 h-5" />
        <span className="font-semibold text-sm">{title}</span>
      </div>
      <p className="text-white/80 text-sm mb-4">Put these steps in the correct order (first at top).</p>

      <div className="space-y-2 mb-5">
        {order.map((id, index) => (
          <div key={id} className="flex items-center gap-2 bg-white/10 rounded-xl p-3">
            <span className="w-6 h-6 rounded-full bg-cyan-500/30 flex items-center justify-center text-xs font-bold">{index + 1}</span>
            <span className="flex-1 text-sm">{stepMap[id].label}</span>
            <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="p-1 rounded hover:bg-white/10 disabled:opacity-30">
              <ChevronUp className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => move(index, 1)} disabled={index === order.length - 1} className="p-1 rounded hover:bg-white/10 disabled:opacity-30">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <motion.button whileTap={{ scale: 0.97 }} onClick={submit} className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 font-bold">
        Confirm Order
      </motion.button>
    </div>
  );
}
