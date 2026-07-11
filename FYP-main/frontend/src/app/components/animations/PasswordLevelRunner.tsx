import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { GameRunnerScene } from './GameRunnerScene';
import type { RunnerState } from './RunnerCharacter';

interface PasswordLevelRunnerProps {
  children: React.ReactNode;
  onBack: () => void;
  sceneKey: number;
  progress: number;
  runnerState: RunnerState;
  coinBurstId: number;
  scoreGain: number | null;
  lane: 0 | 1 | 2;
  wide?: boolean;
}

export function PasswordLevelRunner({
  children,
  onBack,
  sceneKey,
  progress,
  runnerState,
  coinBurstId,
  scoreGain,
  lane,
  wide = false,
}: PasswordLevelRunnerProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-x-hidden">
      <button
        type="button"
        onClick={onBack}
        className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors p-2 z-20"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <GameRunnerScene
        progress={progress}
        runnerState={runnerState}
        lane={lane}
        coinBurstId={coinBurstId}
        scoreGain={scoreGain}
        sceneKey={sceneKey}
        className="w-full"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full ${wide ? 'max-w-3xl' : 'max-w-2xl'} mx-auto`}
        >
          {children}
        </motion.div>
      </GameRunnerScene>
    </div>
  );
}
