import { motion } from 'motion/react';

interface AnimatedProgressBarProps {
  value: number;
  label?: string;
  showPercent?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AnimatedProgressBar({
  value,
  label,
  showPercent = true,
  size = 'md',
  className = '',
}: AnimatedProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  const heights = { sm: 'h-2', md: 'h-2.5', lg: 'h-3' };

  return (
    <div className={className}>
      {(label || showPercent) && (
        <div className="flex justify-between text-xs text-white/70 mb-1.5 font-medium">
          {label && <span>{label}</span>}
          {showPercent && <span className="text-cyan-300">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={`cq-progress-track ${heights[size]} relative`}>
        <motion.div
          className="cq-progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        />
        <motion.div
          className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          animate={{ left: ['-10%', '110%'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
          style={{ width: `${pct}%`, maxWidth: '100%' }}
        />
      </div>
    </div>
  );
}
