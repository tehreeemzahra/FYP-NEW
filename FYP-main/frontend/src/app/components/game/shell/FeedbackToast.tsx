import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle, XCircle } from 'lucide-react';

interface FeedbackToastProps {
  message: string | null;
  tone?: 'correct' | 'wrong' | 'neutral';
}

export function FeedbackToast({ message, tone = 'neutral' }: FeedbackToastProps) {
  const styles = {
    correct: 'cq-feedback-success border text-emerald-100',
    wrong: 'cq-feedback-error border text-red-100',
    neutral: 'bg-blue-500/20 border-blue-400/30 text-blue-100 border',
  };

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          className={`mt-4 p-4 rounded-xl ${styles[tone]} flex items-start gap-2 shadow-lg`}
          role="status"
        >
          {tone === 'correct' && <CheckCircle className="w-5 h-5 shrink-0 text-green-300" />}
          {tone === 'wrong' && <XCircle className="w-5 h-5 shrink-0 text-red-300" />}
          <span className="text-sm sm:text-base">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
