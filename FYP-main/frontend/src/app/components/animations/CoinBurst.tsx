import { motion, AnimatePresence } from 'motion/react';

interface CoinBurstProps {
  /** Increment to replay the burst animation */
  burstId?: number;
  x?: string;
  y?: string;
}

const COINS = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  angle: (i / 10) * 360,
  dist: 40 + (i % 3) * 18,
}));

export function CoinBurst({ burstId = 0, x = '50%', y = '72%' }: CoinBurstProps) {
  if (burstId <= 0) return null;

  return (
    <AnimatePresence>
      {COINS.map((coin) => {
          const rad = (coin.angle * Math.PI) / 180;
          const tx = Math.cos(rad) * coin.dist;
          const ty = Math.sin(rad) * coin.dist - 30;
          return (
            <motion.div
              key={`${burstId}-${coin.id}`}
              className="absolute z-30 pointer-events-none"
              style={{ left: x, top: y }}
              initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
              animate={{ opacity: [1, 1, 0], scale: [0, 1.2, 0.6], x: tx, y: ty }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: coin.id * 0.02 }}
            >
              <div className="h-4 w-4 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 border-2 border-yellow-600 shadow-lg flex items-center justify-center text-[8px] font-bold text-amber-900">
                ★
              </div>
            </motion.div>
          );
      })}
    </AnimatePresence>
  );
}
