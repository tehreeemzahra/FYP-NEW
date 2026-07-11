import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowDown, Shield, ShieldOff } from 'lucide-react';
import { playUiClick } from '../../playUiClick';

export type SortItem = {
  id: string;
  label: string;
  bucket: 'safe' | 'unsafe';
  explanation: string;
};

interface DragSortGameProps {
  items: SortItem[];
  safeLabel?: string;
  unsafeLabel?: string;
  onAllComplete: () => void;
  onCorrect: (message: string) => void;
  onWrong: (message: string, mistakeId: string) => void;
}

export function DragSortGame({
  items,
  safeLabel = 'Safe',
  unsafeLabel = 'Unsafe',
  onAllComplete,
  onCorrect,
  onWrong,
}: DragSortGameProps) {
  const [pool, setPool] = useState(items.map((i) => i.id));
  const [safe, setSafe] = useState<string[]>([]);
  const [unsafe, setUnsafe] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const itemMap = Object.fromEntries(items.map((i) => [i.id, i]));

  const select = (id: string) => {
    if (done) return;
    playUiClick(0.25);
    setSelected((s) => (s === id ? null : id));
  };

  const place = (bucket: 'safe' | 'unsafe') => {
    if (!selected || done) return;
    playUiClick();

    const newPool = pool.filter((id) => id !== selected);
    const newSafe = bucket === 'safe' ? [...safe, selected] : safe;
    const newUnsafe = bucket === 'unsafe' ? [...unsafe, selected] : unsafe;

    setPool(newPool);
    setSafe(newSafe);
    setUnsafe(newUnsafe);
    setSelected(null);

    if (newPool.length === 0) {
      setDone(true);
      const allCorrect = items.every((item) =>
        item.bucket === 'safe' ? newSafe.includes(item.id) : newUnsafe.includes(item.id),
      );

      if (allCorrect) {
        onCorrect('Perfect sorting! You know safe from risky behaviors.');
        setTimeout(onAllComplete, 1500);
      } else {
        const wrongItem = items.find(
          (item) =>
            (item.bucket === 'safe' && !newSafe.includes(item.id)) ||
            (item.bucket === 'unsafe' && !newUnsafe.includes(item.id)),
        );
        onWrong(wrongItem?.explanation || 'Think about what attackers could exploit.', `sort_${wrongItem?.id}`);
        setTimeout(() => {
          setPool(items.map((i) => i.id));
          setSafe([]);
          setUnsafe([]);
          setDone(false);
        }, 2200);
      }
    }
  };

  const renderCard = (id: string, inBucket?: 'safe' | 'unsafe') => (
    <motion.button
      key={id}
      type="button"
      layout
      onClick={() => select(id)}
      className={`p-3 rounded-xl text-sm font-medium text-left w-full transition-all ${
        selected === id
          ? 'ring-2 ring-yellow-400 bg-yellow-400/20'
          : inBucket === 'safe'
          ? 'bg-green-500/25'
          : inBucket === 'unsafe'
          ? 'bg-red-500/25'
          : 'bg-white/15 hover:bg-white/25'
      }`}
    >
      {itemMap[id]?.label}
    </motion.button>
  );

  return (
    <div className="cq-game-panel p-5 sm:p-6">
      <p className="text-white/90 text-sm mb-4">
        Tap a card, then tap the correct bucket. Sort all behaviors to finish.
      </p>

      {pool.length > 0 && (
        <div className="grid gap-2 mb-4">
          {pool.map((id) => renderCard(id))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => place('safe')}
          className="min-h-[120px] rounded-xl border-2 border-dashed border-green-400/50 bg-green-500/10 p-3 flex flex-col"
        >
          <span className="flex items-center gap-2 text-green-300 font-bold mb-2">
            <Shield className="w-4 h-4" /> {safeLabel}
          </span>
          <div className="grid gap-2 flex-1">{safe.map((id) => renderCard(id, 'safe'))}</div>
        </button>
        <button
          type="button"
          onClick={() => place('unsafe')}
          className="min-h-[120px] rounded-xl border-2 border-dashed border-red-400/50 bg-red-500/10 p-3 flex flex-col"
        >
          <span className="flex items-center gap-2 text-red-300 font-bold mb-2">
            <ShieldOff className="w-4 h-4" /> {unsafeLabel}
          </span>
          <div className="grid gap-2 flex-1">{unsafe.map((id) => renderCard(id, 'unsafe'))}</div>
        </button>
      </div>

      {selected && (
        <p className="mt-3 text-center text-yellow-200 text-sm flex items-center justify-center gap-1">
          <ArrowDown className="w-4 h-4" /> Now choose a bucket
        </p>
      )}
    </div>
  );
}
