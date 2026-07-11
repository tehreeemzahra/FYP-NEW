import { motion, AnimatePresence } from 'motion/react';
import type { RunnerState } from './RunnerCharacter';
import { CoinBurst } from './CoinBurst';
import { ScoreFloater } from './ScoreFloater';
import { slideInUp } from './subwayMotion';

interface GameRunnerSceneProps {
  children: React.ReactNode;
  /** 0–1 question progress within level */
  progress?: number;
  runnerState?: RunnerState;
  lane?: 0 | 1 | 2;
  coinBurstId?: number;
  scoreGain?: number | null;
  sceneKey?: string | number;
  className?: string;
}

export function GameRunnerScene({
  children,
  coinBurstId = 0,
  scoreGain = null,
  sceneKey = 0,
  className = '',
}: GameRunnerSceneProps) {
  return (
    <div className={`relative w-full ${className}`}>
      <CoinBurst burstId={coinBurstId} y="18%" />
      <ScoreFloater value={scoreGain} popKey={coinBurstId} />

      <AnimatePresence mode="wait">
        <motion.div key={String(sceneKey)} className="relative z-10" {...slideInUp}>
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
