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

  const shellProps = {
    title,
    subtitle,
    mechanic,
    hint,
    progress: currentStep / totalSteps,
    progressLabel: `Step ${currentStep} of ${totalSteps}`,
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
