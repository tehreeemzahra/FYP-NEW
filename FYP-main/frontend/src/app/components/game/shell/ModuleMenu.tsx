import { motion } from 'motion/react';
import { ArrowLeft, Lock, LucideIcon, Sparkles } from 'lucide-react';
import type { GameLevel } from '../types';
import { playUiClick } from '../../playUiClick';
import { staggerContainer, staggerItem, cardHover } from '../../visual/motionPresets';

export type LevelCard = {
  level: GameLevel;
  title: string;
  description: string;
  mechanic: string;
  icon: LucideIcon;
  color: string;
};

interface ModuleMenuProps {
  moduleTitle: string;
  moduleSubtitle: string;
  levels: LevelCard[];
  completed: number[];
  onBack?: () => void;
  onStart: (level: GameLevel) => void;
}

/** Dev/testing: set to true to make every level playable without prerequisites. */
const UNLOCK_ALL_LEVELS = true;

export function ModuleMenu({ moduleTitle, moduleSubtitle, levels, completed, onBack, onStart }: ModuleMenuProps) {
  const isUnlocked = (level: number) =>
    UNLOCK_ALL_LEVELS || level === 1 || completed.includes(level - 1);

  return (
    <motion.div
      className="max-w-4xl mx-auto relative z-10"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {onBack && (
        <motion.button
          type="button"
          onClick={onBack}
          className="cq-btn-icon w-10 h-10 text-white/90 hover:text-white mb-4"
          whileTap={{ scale: 0.92 }}
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
      )}

      <div className="text-center mb-8">
        <motion.div variants={staggerItem} className="inline-flex items-center gap-2 cq-chip mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Adventure Module
        </motion.div>
        <motion.h1 variants={staggerItem} className="text-3xl sm:text-4xl font-extrabold cq-title-display mb-2">
          {moduleTitle}
        </motion.h1>
        <motion.p variants={staggerItem} className="text-white/80 text-sm sm:text-base">{moduleSubtitle}</motion.p>
        <motion.div variants={staggerItem} className="mt-4 max-w-xs mx-auto">
          <div className="cq-progress-track h-2">
            <motion.div
              className="cq-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${(completed.length / 6) * 100}%` }}
              transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
            />
          </div>
          <p className="text-cyan-300 text-xs sm:text-sm mt-2 font-semibold">{completed.length}/6 levels completed</p>
        </motion.div>
      </div>

      <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {levels.map((card, i) => {
          const unlocked = isUnlocked(card.level);
          const done = completed.includes(card.level);
          const Icon = card.icon;

          return (
            <motion.button
              key={card.level}
              type="button"
              disabled={!unlocked}
              variants={staggerItem}
              custom={i}
              {...(unlocked ? cardHover : {})}
              onClick={() => {
                if (!unlocked) return;
                playUiClick();
                onStart(card.level);
              }}
              className={`cq-level-card text-left p-5 bg-gradient-to-br ${card.color} relative disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {!unlocked && (
                <div className="absolute inset-0 bg-black/55 flex items-center justify-center z-10 backdrop-blur-[2px]">
                  <Lock className="w-8 h-8 text-white/80" />
                </div>
              )}
              <div className="flex items-center gap-3 mb-2 relative z-[1]">
                <div className="p-2 rounded-xl bg-white/15 backdrop-blur-sm">
                  <Icon className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold bg-white/25 px-2.5 py-0.5 rounded-full">Level {card.level}</span>
                {done && <span className="cq-chip-success text-xs font-bold px-2.5 py-0.5 rounded-full">✓ Done</span>}
              </div>
              <h3 className="font-bold text-lg mb-1 relative z-[1]">{card.title}</h3>
              <p className="text-white/90 text-sm mb-2 relative z-[1]">{card.description}</p>
              <p className="text-white/70 text-xs relative z-[1]">{card.mechanic}</p>
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
