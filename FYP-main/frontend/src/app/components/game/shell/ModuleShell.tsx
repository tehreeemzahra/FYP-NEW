import { useState, type ComponentType } from 'react';
import Confetti from 'react-confetti';
import { BugStarfieldBackground } from '../../BugStarfieldBackground';
import { CyberBackground } from '../../visual/CyberBackground';
import { ModuleInstructions } from './ModuleInstructions';
import { LevelCompleteScreen } from './LevelCompleteScreen';
import type { GameLevel, LevelCompleteStats } from '../types';

type Screen = 'menu' | 'play' | 'done';

interface ModuleShellProps {
  showConfetti: boolean;
  screen: Screen;
  level: GameLevel;
  meta: {
    title: string;
    concept: string;
    summary: string;
    hint: string;
    tips: string[];
    ageGroup: string;
    mechanic: string;
    reward: string;
  };
  showInstructions: boolean;
  lastScore: number;
  isFinalLevel?: boolean;
  menu: React.ReactNode;
  LevelComponent: ComponentType<{ onBack: () => void; onComplete: (stats: LevelCompleteStats) => void }>;
  onInstructionsStart: () => void;
  onInstructionsBack: () => void;
  onLevelBack: () => void;
  onLevelComplete: (stats: LevelCompleteStats) => void;
  onDoneMenu: () => void;
  onDoneNext?: () => void;
}

export function ModuleShell({
  showConfetti,
  screen,
  level,
  meta,
  showInstructions,
  lastScore,
  isFinalLevel,
  menu,
  LevelComponent,
  onInstructionsStart,
  onInstructionsBack,
  onLevelBack,
  onLevelComplete,
  onDoneMenu,
  onDoneNext,
}: ModuleShellProps) {
  return (
    <div className="min-h-screen cq-bg-app text-white p-3 sm:p-6 md:p-8 relative overflow-x-hidden">
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}
      <CyberBackground />
      <BugStarfieldBackground />

      {screen === 'menu' && menu}

      {showInstructions && (
        <ModuleInstructions
          level={level}
          title={meta.title}
          conceptName={meta.concept}
          message={meta.summary}
          mechanic={meta.mechanic}
          tips={meta.tips}
          ageGroup={meta.ageGroup}
          onStart={onInstructionsStart}
          onBack={onInstructionsBack}
        />
      )}

      {screen === 'play' && <LevelComponent onBack={onLevelBack} onComplete={onLevelComplete} />}

      {screen === 'done' && (
        <LevelCompleteScreen
          title={meta.title}
          reward={meta.reward}
          summary={meta.summary}
          score={lastScore}
          isFinalLevel={isFinalLevel}
          onMenu={onDoneMenu}
          onNext={onDoneNext}
        />
      )}
    </div>
  );
}

export function useModuleFlow() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [level, setLevel] = useState<GameLevel>(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [lastScore, setLastScore] = useState(0);

  const startLevel = (l: GameLevel) => {
    setLevel(l);
    setShowInstructions(true);
  };

  const beginPlay = () => {
    setShowInstructions(false);
    setScreen('play');
  };

  const finishLevel = (stats: LevelCompleteStats) => {
    setLastScore(stats.levelScore);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);
    setScreen('done');
  };

  return {
    screen,
    setScreen,
    level,
    setLevel,
    showConfetti,
    showInstructions,
    setShowInstructions,
    lastScore,
    startLevel,
    beginPlay,
    finishLevel,
  };
}
