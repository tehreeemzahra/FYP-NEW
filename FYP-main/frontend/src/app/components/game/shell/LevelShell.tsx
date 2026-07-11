import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, HelpCircle, Lightbulb } from 'lucide-react';
import { playUiClick } from '../../playUiClick';
import { AnimatedProgressBar } from '../../visual/AnimatedProgressBar';
import { fadeInUp } from '../../visual/motionPresets';

interface LevelShellProps {
  title: string;
  subtitle?: string;
  mechanic?: string;
  progress: number;
  progressLabel?: string;
  hint?: string;
  onBack: () => void;
  children: ReactNode;
}

export function LevelShell({
  title,
  subtitle,
  mechanic,
  progress,
  progressLabel,
  hint,
  onBack,
  children,
}: LevelShellProps) {
  return (
    <motion.div
      className="max-w-3xl mx-auto w-full px-3 sm:px-6 pb-8 relative z-10"
      {...fadeInUp}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <motion.button
          type="button"
          onClick={() => {
            playUiClick();
            onBack();
          }}
          className="cq-btn-icon w-10 h-10 text-white/90 hover:text-white"
          aria-label="Go back"
          whileTap={{ scale: 0.92 }}
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <div className="flex-1 text-center min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-white truncate">{title}</h1>
          {subtitle && <p className="text-white/70 text-xs sm:text-sm truncate">{subtitle}</p>}
        </div>
        {mechanic && (
          <span className="hidden sm:inline-flex items-center gap-1 cq-chip text-xs font-semibold">
            <HelpCircle className="w-3 h-3" />
            {mechanic}
          </span>
        )}
      </div>

      <div className="mb-5">
        <AnimatedProgressBar
          value={progress * 100}
          label={progressLabel || 'Progress'}
          size="md"
        />
      </div>

      {hint && (
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4 flex items-start gap-2 cq-hint-box p-3 text-sm"
        >
          <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-amber-300" />
          <span>{hint}</span>
        </motion.div>
      )}

      {children}
    </motion.div>
  );
}
