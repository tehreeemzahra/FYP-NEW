import { motion } from 'motion/react';
import { ArrowRight, CheckCircle, Crown, Sparkles, Trophy } from 'lucide-react';
import { playUiClick } from '../../playUiClick';
import { playMilestoneSound } from './gameSounds';
import { useEffect } from 'react';
import { RewardSparkles } from '../../visual/RewardSparkles';
import { GlowButton } from '../../visual/GlowButton';
import { fadeInScale } from '../../visual/motionPresets';

interface LevelCompleteScreenProps {
  title: string;
  reward: string;
  summary: string;
  score: number;
  isFinalLevel?: boolean;
  onMenu: () => void;
  onNext?: () => void;
}

export function LevelCompleteScreen({
  title,
  reward,
  summary,
  score,
  isFinalLevel,
  onMenu,
  onNext,
}: LevelCompleteScreenProps) {
  useEffect(() => {
    playMilestoneSound();
  }, []);

  return (
    <motion.div
      className="min-h-[70vh] flex flex-col items-center justify-center p-4 sm:p-8 relative z-10 text-center"
      {...fadeInScale}
    >
      <RewardSparkles />

      <motion.div
        animate={{ rotate: [0, 8, -8, 0], y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
        className="mb-6 relative"
      >
        {isFinalLevel ? (
          <Crown className="w-24 h-24 sm:w-32 sm:h-32 text-yellow-400 mx-auto drop-shadow-[0_0_24px_rgba(251,191,36,0.6)]" />
        ) : (
          <Trophy className="w-24 h-24 sm:w-32 sm:h-32 text-yellow-400 mx-auto drop-shadow-[0_0_24px_rgba(251,191,36,0.6)]" />
        )}
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-3xl sm:text-4xl font-extrabold text-white mb-2"
      >
        Level Complete!
      </motion.h2>
      <p className="text-xl text-cyan-200 mb-1">{title}</p>
      <p className="cq-text-gradient-gold font-bold mb-4 flex items-center justify-center gap-2 text-lg">
        <Sparkles className="w-5 h-5 text-yellow-400" />
        {reward} unlocked!
      </p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="cq-game-panel p-5 sm:p-6 max-w-lg w-full mb-6 text-left"
      >
        <h3 className="font-bold text-white mb-2 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          What you learned
        </h3>
        <p className="text-white/90 text-sm sm:text-base leading-relaxed">{summary}</p>
        <motion.p
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="mt-3 cq-chip-gold inline-flex font-bold px-3 py-1"
        >
          Score: {score}
        </motion.p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        {onNext && !isFinalLevel && (
          <GlowButton
            onClick={() => {
              playUiClick();
              onNext();
            }}
            className="flex-1 flex items-center justify-center gap-2"
          >
            Next Level
            <ArrowRight className="w-5 h-5" />
          </GlowButton>
        )}
        <GlowButton
          variant="secondary"
          onClick={() => {
            playUiClick();
            onMenu();
          }}
          className="flex-1"
        >
          Back to Menu
        </GlowButton>
      </div>
    </motion.div>
  );
}
