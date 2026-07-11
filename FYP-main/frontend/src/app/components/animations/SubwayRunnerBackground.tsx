import { motion } from 'motion/react';

interface SubwayRunnerBackgroundProps {
  /** 1 = normal, up to ~2.5 for faster scroll */
  speed?: number;
  className?: string;
}

export function SubwayRunnerBackground({ speed = 1, className = '' }: SubwayRunnerBackgroundProps) {
  const trackDuration = Math.max(0.35, 1.1 / speed);
  const buildingDuration = Math.max(0.8, 2.4 / speed);
  const showSpeedLines = speed > 1.15;

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden>
      {/* Sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#87CEEB]/30 via-transparent to-transparent" />

      {/* Parallax buildings */}
      <div className="absolute bottom-[18%] left-0 right-0 h-[42%] flex justify-between px-2 opacity-40">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={`bldg-${i}`}
            className="rounded-t-lg bg-gradient-to-t from-[#1a2f4a] to-[#2d4a6a]"
            style={{ width: `${12 + (i % 3) * 4}%`, height: `${35 + (i % 4) * 12}%` }}
            animate={{ x: ['0%', '-120%'] }}
            transition={{ duration: buildingDuration * (1 + i * 0.15), repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      {/* Speed lines */}
      {showSpeedLines && (
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`line-${i}`}
              className="absolute h-0.5 bg-white/25 rounded-full"
              style={{
                width: `${40 + (i % 3) * 20}px`,
                left: `${(i * 17) % 100}%`,
                top: `${15 + (i * 11) % 60}%`,
              }}
              animate={{ y: ['-10%', '120%'], opacity: [0, 0.6, 0] }}
              transition={{
                duration: 0.5 / speed,
                repeat: Infinity,
                delay: i * 0.04,
                ease: 'linear',
              }}
            />
          ))}
        </div>
      )}

      {/* 3-lane track */}
      <div className="absolute bottom-0 left-0 right-0 h-[28%] min-h-[140px] perspective-[600px]">
        <div
          className="absolute inset-0"
          style={{
            transform: 'rotateX(52deg)',
            transformOrigin: 'center bottom',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#3d5a80]/80 to-[#1e3a5f]" />
          {/* Lane dividers */}
          {[33.33, 66.66].map((pct) => (
            <div
              key={pct}
              className="absolute top-0 bottom-0 w-1 bg-yellow-400/50"
              style={{ left: `${pct}%` }}
            />
          ))}
          {/* Scrolling stripes */}
          {[...Array(14)].map((_, i) => (
            <motion.div
              key={`stripe-${i}`}
              className="absolute left-[8%] right-[8%] h-3 bg-white/15 rounded-full"
              style={{ top: `${i * 14}%` }}
              animate={{ y: ['0%', '200%'] }}
              transition={{
                duration: trackDuration,
                repeat: Infinity,
                ease: 'linear',
                delay: i * (trackDuration / 14),
              }}
            />
          ))}
          {/* Rail edges */}
          <div className="absolute left-[6%] top-0 bottom-0 w-1.5 bg-yellow-500/70 rounded-full" />
          <div className="absolute right-[6%] top-0 bottom-0 w-1.5 bg-yellow-500/70 rounded-full" />
        </div>
      </div>
    </div>
  );
}
