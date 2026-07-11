import { AnimatePresence, motion } from 'motion/react';

interface ScoreFloaterProps {
  value: number | null;
  popKey?: number;
}

export function ScoreFloater({ value, popKey = 0 }: ScoreFloaterProps) {
  return (
    <AnimatePresence>
      {value !== null && value > 0 && (
        <motion.div
          key={popKey}
          className="absolute left-1/2 top-[8%] z-30 -translate-x-1/2 pointer-events-none"
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: [0, 1, 1, 0], y: -80, scale: [0.5, 1.3, 1.1, 0.8] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-3xl font-black text-yellow-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] stroke-black">
            +{value}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
