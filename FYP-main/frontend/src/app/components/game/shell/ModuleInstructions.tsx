import { motion } from 'motion/react';
import { CheckCircle, Sparkles } from 'lucide-react';
import { playUiClick } from '../../playUiClick';
import type { GameLevel } from '../types';
import { GlowButton } from '../../visual/GlowButton';
import { fadeInScale } from '../../visual/motionPresets';

interface ModuleInstructionsProps {
  level: GameLevel;
  title: string;
  conceptName: string;
  message: string;
  mechanic: string;
  tips: string[];
  ageGroup?: string;
  onStart: () => void;
  onBack: () => void;
}

export function ModuleInstructions({
  level,
  title,
  conceptName,
  message,
  mechanic,
  tips,
  ageGroup = '7-11 years',
  onStart,
  onBack,
}: ModuleInstructionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div
        className="max-w-2xl w-full cq-panel cq-panel-glow rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl my-auto"
        {...fadeInScale}
      >
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <span className="cq-chip-gold text-xs font-bold">
            Age {ageGroup}
          </span>
          <span className="cq-chip text-xs font-bold">
            {mechanic}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-white text-center mb-4">
          Level {level}: {title}
        </h2>

        <div className="bg-cyan-500/15 border border-cyan-400/30 rounded-xl p-4 mb-3">
          <p className="text-cyan-100 font-semibold text-sm sm:text-base">{conceptName}</p>
        </div>

        <div className="cq-panel rounded-xl p-4 mb-4 border-white/10">
          <p className="text-white/95 text-sm sm:text-base leading-relaxed">{message}</p>
        </div>

        <div className="cq-hint-box rounded-xl p-4 mb-6">
          <h3 className="text-amber-200 font-bold text-sm mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            How to play
          </h3>
          <ul className="space-y-2">
            {tips.map((tip, i) => (
              <li key={i} className="text-white/90 text-sm flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <GlowButton
            onClick={() => {
              playUiClick();
              onStart();
            }}
            className="flex-1"
          >
            Start Adventure
          </GlowButton>
          <GlowButton
            variant="secondary"
            onClick={() => {
              playUiClick();
              onBack();
            }}
            className="px-6"
          >
            Back
          </GlowButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
