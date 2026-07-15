import { ReactNode, useCallback } from 'react';
import { LevelShell } from './LevelShell';
import { FeedbackToast } from './FeedbackToast';
import { useGameFeedback } from './useGameFeedback';
import type { LevelCompleteStats } from '../types';

interface UseLevelRunnerOptions {
  title: string;
  subtitle?: string;
  mechanic: string;
  hint?: string;
  totalSteps: number;
  currentStep: number;
  onBack: () => void;
  onComplete: (stats: LevelCompleteStats) => void;
}

export function useLevelRunner({
  title,
  subtitle,
  mechanic,
  hint,
  totalSteps,
  currentStep,
  onBack,
  onComplete,
}: UseLevelRunnerOptions) {
  const feedback = useGameFeedback();

  const finish = useCallback(() => {
    onComplete(feedback.getStats());
  }, [feedback, onComplete]);

  // Fill by completed challenges so Step 5/5 is not already 100% while still playing.
  const safeTotal = Math.max(totalSteps, 1);
  const displayStep = Math.min(Math.max(currentStep, 1), safeTotal);
  const completed = Math.max(0, currentStep - 1);
  const shellProps = {
    title,
    subtitle,
    mechanic,
    hint,
    progress: Math.min(1, completed / safeTotal),
    progressLabel: `Step ${displayStep} of ${safeTotal}`,
    onBack,
  };

  const wrap = (children: ReactNode) => (
    <>
      <LevelShell {...shellProps}>{children}</LevelShell>
      <FeedbackToast message={feedback.feedback?.message ?? null} tone={feedback.feedback?.tone} />
    </>
  );

  return { ...feedback, finish, wrap, shellProps };
}
