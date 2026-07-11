import { useState } from 'react';
import { motion } from 'motion/react';
import { Brain } from 'lucide-react';
import { playUiClick } from '../../playUiClick';

export type MemoryPair = {
  id: string;
  term: string;
  definition: string;
};

interface MemoryMatchGameProps {
  pairs: MemoryPair[];
  onAllComplete: () => void;
  onCorrect: (message: string) => void;
  onWrong: (message: string, mistakeId: string) => void;
}

type Card = { uid: string; pairId: string; text: string; type: 'term' | 'def' };

export function MemoryMatchGame({ pairs, onAllComplete, onCorrect, onWrong }: MemoryMatchGameProps) {
  const buildDeck = (): Card[] => {
    const cards: Card[] = [];
    pairs.forEach((p) => {
      cards.push({ uid: `${p.id}-t`, pairId: p.id, text: p.term, type: 'term' });
      cards.push({ uid: `${p.id}-d`, pairId: p.id, text: p.definition, type: 'def' });
    });
    return cards.sort(() => Math.random() - 0.5);
  };

  const [deck, setDeck] = useState(buildDeck);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [lock, setLock] = useState(false);

  const flip = (uid: string) => {
    if (lock || flipped.includes(uid) || matched.has(deck.find((c) => c.uid === uid)!.pairId)) return;
    playUiClick(0.25);

    const next = [...flipped, uid];
    setFlipped(next);

    if (next.length === 2) {
      setLock(true);
      const [a, b] = next.map((id) => deck.find((c) => c.uid === id)!);
      if (a.pairId === b.pairId && a.type !== b.type) {
        onCorrect('Match found! You connected the concept to its meaning.');
        const nextMatched = new Set(matched);
        nextMatched.add(a.pairId);
        setMatched(nextMatched);
        setFlipped([]);
        setLock(false);
        if (nextMatched.size === pairs.length) {
          setTimeout(onAllComplete, 1200);
        }
      } else {
        onWrong('Not a match — try again and think about what each term means.', `memory_${a.pairId}`);
        setTimeout(() => {
          setFlipped([]);
          setLock(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="cq-game-panel p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4 text-cyan-200">
        <Brain className="w-5 h-5" />
        <span className="font-semibold">Match concepts to meanings ({matched.size}/{pairs.length})</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        {deck.map((card) => {
          const isFlipped = flipped.includes(card.uid) || matched.has(card.pairId);
          return (
            <motion.button
              key={card.uid}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => flip(card.uid)}
              className={`min-h-[72px] p-3 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                matched.has(card.pairId)
                  ? 'bg-green-500/30 border border-green-400/50'
                  : isFlipped
                  ? 'bg-cyan-500/30 border border-cyan-400/50'
                  : 'bg-slate-800/80 hover:bg-slate-700/80'
              }`}
            >
              {isFlipped ? card.text : '?'}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
