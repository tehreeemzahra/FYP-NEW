import { motion } from 'motion/react';
import { Bug, KeyRound, Lock, Shield, Sparkles } from 'lucide-react';

/** Floating cyber icons + twinkling particles. Place inside a `relative` full-bleed parent. */
export function BugStarfieldBackground() {
  const bugColors = [
    'text-red-400',
    'text-orange-400',
    'text-purple-400',
    'text-pink-400',
    'text-yellow-400',
    'text-cyan-400',
    'text-emerald-400',
    'text-indigo-400',
  ];

  const floatIcons = [
    { Icon: Lock, color: 'text-cyan-300/50', size: 'w-4 h-4 sm:w-5 sm:h-5' },
    { Icon: Shield, color: 'text-emerald-300/45', size: 'w-4 h-4 sm:w-5 sm:h-5' },
    { Icon: KeyRound, color: 'text-amber-300/45', size: 'w-4 h-4 sm:w-5 sm:h-5' },
    { Icon: Sparkles, color: 'text-violet-300/40', size: 'w-3.5 h-3.5 sm:w-4 sm:h-4' },
    { Icon: Lock, color: 'text-sky-300/40', size: 'w-3.5 h-3.5 sm:w-4 sm:h-4' },
    { Icon: Shield, color: 'text-teal-300/40', size: 'w-4 h-4 sm:w-5 sm:h-5' },
    { Icon: KeyRound, color: 'text-yellow-300/35', size: 'w-3.5 h-3.5 sm:w-4 sm:h-4' },
    { Icon: Sparkles, color: 'text-cyan-200/35', size: 'w-3 h-3 sm:w-3.5 sm:h-3.5' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]" aria-hidden>
      {/* Subtle scan line */}
      <motion.div
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />

      {/* Soft floating cyber icons (locks / shields / keys) */}
      {floatIcons.map(({ Icon, color, size }, i) => {
        const left = 8 + ((i * 11) % 84);
        const top = 12 + ((i * 17) % 70);
        return (
          <motion.div
            key={`float-${i}`}
            className="absolute"
            style={{ left: `${left}%`, top: `${top}%` }}
            animate={{
              y: [0, -14, 6, 0],
              x: [0, 8, -6, 0],
              opacity: [0.18, 0.42, 0.22, 0.18],
              rotate: [-8, 8, -4, -8],
            }}
            transition={{
              duration: 9 + (i % 4) * 1.5,
              repeat: Infinity,
              delay: i * 0.45,
              ease: 'easeInOut',
            }}
          >
            <Icon className={`${size} ${color}`} strokeWidth={1.75} />
          </motion.div>
        );
      })}

      {[...Array(14)].map((_, i) => {
        const randomX = 10 + ((i * 37) % 80);
        const randomY = 10 + ((i * 53) % 80);
        const duration = 4 + (i % 5);
        return (
          <motion.div
            key={`bug-${i}`}
            className="absolute"
            style={{ left: `${randomX}%`, top: `${randomY}%` }}
            animate={{
              x: [0, ((i % 3) - 1) * 40, 0],
              y: [0, ((i % 2) - 0.5) * 50, 0],
              rotate: [0, 360],
              opacity: [0.15, 0.32, 0.15],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay: (i % 5) * 0.4,
              ease: 'easeInOut',
            }}
          >
            <Bug className={`w-4 h-4 sm:w-5 sm:h-5 ${bugColors[i % bugColors.length]}`} />
          </motion.div>
        );
      })}

      {[...Array(28)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute w-1 h-1 bg-cyan-200 rounded-full"
          style={{
            left: `${(i * 17) % 100}%`,
            top: `${(i * 29) % 100}%`,
          }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.8, 0] }}
          transition={{
            duration: 2 + (i % 4),
            repeat: Infinity,
            delay: (i % 6) * 0.35,
          }}
        />
      ))}
    </div>
  );
}
