import { useCallback, useState } from 'react';
import type { RunnerState } from './RunnerCharacter';

export function useRunnerFeedback(defaultScore = 20) {
  const [runnerState, setRunnerState] = useState<RunnerState>('run');
  const [coinBurstId, setCoinBurstId] = useState(0);
  const [scoreGain, setScoreGain] = useState<number | null>(null);

  const triggerCorrect = useCallback(
    (points = defaultScore) => {
      setRunnerState('jump');
      setCoinBurstId((id) => id + 1);
      setScoreGain(points);
      setTimeout(() => setScoreGain(null), 900);
      setTimeout(() => setRunnerState('run'), 600);
    },
    [defaultScore],
  );

  const triggerWrong = useCallback(() => {
    setRunnerState('stumble');
    setTimeout(() => setRunnerState('run'), 450);
  }, []);

  const laneFromIndex = useCallback((index: number) => (index % 3) as 0 | 1 | 2, []);

  return {
    runnerState,
    coinBurstId,
    scoreGain,
    triggerCorrect,
    triggerWrong,
    laneFromIndex,
  };
}
