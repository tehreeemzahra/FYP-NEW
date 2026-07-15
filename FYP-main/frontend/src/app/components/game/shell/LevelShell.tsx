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
      <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
        <motion.button
          type="button"
          onClick={() => {
            playUiClick();
            onBack();
          }}
          className="cq-btn-icon cq-touch-target w-11 h-11 sm:w-10 sm:h-10 text-white/90 hover:text-white shrink-0"
          aria-label="Go back"
          whileTap={{ scale: 0.92 }}
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <div className="flex-1 text-center min-w-0 px-1">
          <h1 className="text-base sm:text-xl font-bold text-white leading-snug line-clamp-2">{title}</h1>
          {subtitle && (
            <p className="text-white/70 text-xs sm:text-sm mt-0.5 leading-snug line-clamp-2">{subtitle}</p>
          )}
        </div>
        {mechanic && (
          <span className="hidden md:inline-flex items-center gap-1 cq-chip text-xs font-semibold shrink-0 max-w-[9rem]">
            <HelpCircle className="w-3 h-3 shrink-0" />
            <span className="truncate">{mechanic}</span>
          </span>
        )}
      </div>

      <div className="mb-3 sm:mb-4">
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
          className="mb-3 sm:mb-4 flex items-start gap-2 cq-hint-box p-2.5 sm:p-3 text-xs sm:text-sm leading-snug"
        >
          <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-amber-300" />
          <span>{hint}</span>
        </motion.div>
      )}

      {children}
    </motion.div>
  );
}
