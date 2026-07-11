import { motion } from 'motion/react';
import { subwaySpring } from './subwayMotion';

export type RunnerState = 'run' | 'jump' | 'stumble' | 'slide';

interface RunnerCharacterProps {
  state?: RunnerState;
  /** 0 = left lane, 1 = center, 2 = right */
  lane?: 0 | 1 | 2;
}

const LANE_X = ['-72px', '0px', '72px'] as const;

export function RunnerCharacter({ state = 'run', lane = 1 }: RunnerCharacterProps) {
  const isJump = state === 'jump';
  const isStumble = state === 'stumble';
  const isSlide = state === 'slide';

  return (
    <motion.div
      className="absolute bottom-[22%] left-1/2 z-20 -translate-x-1/2"
      animate={{
        x: LANE_X[lane],
        y: isJump ? -56 : isStumble ? 8 : isSlide ? 18 : [0, -6, 0],
        rotate: isStumble ? [-8, 8, -4, 0] : isJump ? [0, -12, 0] : 0,
        scale: isJump ? [1, 1.08, 1] : 1,
      }}
      transition={
        isStumble
          ? { duration: 0.45 }
          : isJump
          ? { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
          : { y: { duration: 0.32, repeat: Infinity, ease: 'easeInOut' }, x: subwaySpring }
      }
    >
      {/* Shadow */}
      <motion.div
        className="absolute -bottom-1 left-1/2 h-2 w-10 -translate-x-1/2 rounded-full bg-black/30 blur-sm"
        animate={{
          scaleX: isJump ? 0.6 : isSlide ? 1.3 : [1, 0.85, 1],
          opacity: isJump ? 0.2 : 0.45,
        }}
        transition={{ duration: 0.35, repeat: isJump || isSlide ? 0 : Infinity }}
      />

      {/* Character body */}
      <motion.div
        className="relative"
        animate={{
          height: isSlide ? 36 : 52,
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Head */}
        <div className="mx-auto h-7 w-7 rounded-full bg-[#FFD93D] border-2 border-[#2d1b0e] shadow-md relative z-10">
          <div className="absolute top-2 left-1.5 h-1 w-1 rounded-full bg-[#2d1b0e]" />
          <div className="absolute top-2 right-1.5 h-1 w-1 rounded-full bg-[#2d1b0e]" />
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-2 rounded-full bg-[#e07a7a]" />
        </div>

        {/* Torso */}
        <div
          className={`mx-auto -mt-0.5 w-8 rounded-lg bg-[#4a9fd8] border-2 border-[#2d1b0e] shadow-md ${
            isSlide ? 'h-4' : 'h-9'
          }`}
        />

        {/* Legs */}
        {!isSlide && (
          <div className="flex justify-center gap-1 -mt-0.5">
            <motion.div
              className="h-5 w-2.5 rounded-b-md bg-[#2d5a8a] border-x border-b border-[#2d1b0e]"
              animate={{ rotate: state === 'run' ? [20, -15, 20] : 0 }}
              transition={{ duration: 0.28, repeat: state === 'run' ? Infinity : 0 }}
            />
            <motion.div
              className="h-5 w-2.5 rounded-b-md bg-[#2d5a8a] border-x border-b border-[#2d1b0e]"
              animate={{ rotate: state === 'run' ? [-15, 20, -15] : 0 }}
              transition={{ duration: 0.28, repeat: state === 'run' ? Infinity : 0 }}
            />
          </div>
        )}

        {/* Arms */}
        {!isSlide && (
          <div className="absolute top-8 left-0 right-0 flex justify-between px-0.5">
            <motion.div
              className="h-2 w-5 rounded-full bg-[#FFD93D] border border-[#2d1b0e] origin-right"
              animate={{ rotate: state === 'run' ? [-30, 25, -30] : isJump ? -70 : 0 }}
              transition={{ duration: 0.28, repeat: state === 'run' ? Infinity : 0 }}
            />
            <motion.div
              className="h-2 w-5 rounded-full bg-[#FFD93D] border border-[#2d1b0e] origin-left"
              animate={{ rotate: state === 'run' ? [25, -30, 25] : isJump ? 70 : 0 }}
              transition={{ duration: 0.28, repeat: state === 'run' ? Infinity : 0 }}
            />
          </div>
        )}

        {/* Backpack */}
        <div className="absolute top-9 -right-1 h-5 w-4 rounded-md bg-[#e07a7a] border border-[#2d1b0e]" />
      </motion.div>
    </motion.div>
  );
}
