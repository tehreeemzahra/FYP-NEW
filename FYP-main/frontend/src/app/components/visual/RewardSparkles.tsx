import { motion } from 'motion/react';

/** Lightweight celebration particles — decorative only. */
export function RewardSparkles() {
  const sparks = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: 20 + (i * 7) % 60,
    delay: i * 0.08,
    color: ['#fbbf24', '#22d3ee', '#a78bfa', '#34d399'][i % 4],
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {sparks.map((s) => (
        <motion.div
          key={s.id}
          className="absolute w-2 h-2 rounded-full"
          style={{ left: `${s.x}%`, bottom: '30%', backgroundColor: s.color }}
          initial={{ opacity: 0, y: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], y: -80 - s.id * 8, scale: [0, 1.2, 0] }}
          transition={{ duration: 1.2, delay: s.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}
