import { motion } from 'motion/react';

interface CyberBackgroundProps {
  variant?: 'app' | 'auth';
  className?: string;
}

/** Animated cybersecurity-themed background layer. Decorative only. */
export function CyberBackground({ variant = 'app', className = '' }: CyberBackgroundProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`} aria-hidden>
      <div className={variant === 'auth' ? 'cq-bg-auth absolute inset-0' : 'cq-bg-app absolute inset-0'} />

      {/* Floating orbs */}
      <motion.div
        className="absolute w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-cyan-500/20 blur-3xl"
        style={{ top: '-10%', left: '-5%' }}
        animate={{ x: [0, 30, 0], y: [0, 20, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-56 h-56 sm:w-80 sm:h-80 rounded-full bg-purple-500/15 blur-3xl"
        style={{ bottom: '10%', right: '-5%' }}
        animate={{ x: [0, -25, 0], y: [0, -15, 0], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl"
        style={{ top: '40%', right: '20%' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(34,211,238,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.8) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
}
