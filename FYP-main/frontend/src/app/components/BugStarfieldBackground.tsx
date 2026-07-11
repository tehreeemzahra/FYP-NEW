import { motion } from 'motion/react';
import { Bug } from 'lucide-react';

/** Floating bugs + twinkling stars (matches game module menus). Place inside a `relative` full-bleed parent. */
export function BugStarfieldBackground() {
  const bugColors = ['text-red-400', 'text-orange-400', 'text-purple-400', 'text-pink-400', 'text-yellow-400', 'text-cyan-400', 'text-emerald-400', 'text-indigo-400'];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]" aria-hidden>
      {/* Subtle scan line */}
      <motion.div
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
      {[...Array(20)].map((_, i) => {
        const randomX = Math.random() * 80 + 10;
        const randomY = Math.random() * 80 + 10;
        const duration = 3 + Math.random() * 4;
        return (
          <motion.div
            key={`bug-${i}`}
            className="absolute"
            style={{ left: `${randomX}%`, top: `${randomY}%` }}
            animate={{
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
              rotate: [0, 360],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeInOut',
            }}
          >
            <Bug className={`w-5 h-5 sm:w-6 sm:h-6 ${bugColors[i % bugColors.length]}`} />
          </motion.div>
        );
      })}
      {[...Array(30)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-cyan-200 rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.8, 0] }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}
