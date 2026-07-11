import { useCallback, useRef, useState } from 'react';
import { playUiClick } from '../../playUiClick';

export function useGameFeedback() {
  const [feedback, setFeedback] = useState<{ message: string; tone: 'correct' | 'wrong' | 'neutral' } | null>(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const startedAt = useRef(Date.now());

  const showCorrect = useCallback((message: string, points = 15) => {
    playUiClick(0.35);
    setScore((s) => s + points);
    setFeedback({ message, tone: 'correct' });
  }, []);

  const showWrong = useCallback((message: string, mistakeId?: string) => {
    playUiClick(0.55);
    if (mistakeId) setMistakes((m) => [...m, mistakeId]);
    setFeedback({ message, tone: 'wrong' });
  }, []);

  const showNeutral = useCallback((message: string) => {
    setFeedback({ message, tone: 'neutral' });
  }, []);

  const clearFeedback = useCallback(() => setFeedback(null), []);

  const getStats = useCallback(
    (minScore = 40) => ({
      levelScore: Math.max(minScore, score),
      reactionTime: Math.round((Date.now() - startedAt.current) / 1000),
      mistakes,
    }),
    [score, mistakes],
  );

  return {
    feedback,
    score,
    mistakes,
    showCorrect,
    showWrong,
    showNeutral,
    clearFeedback,
    getStats,
  };
}
