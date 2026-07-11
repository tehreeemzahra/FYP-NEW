import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

type HoverHintTriggerProps = {
  hint: string;
  /** Optional second line (e.g. action hint in Cyberbully Battle). */
  subtitle?: string;
};

/**
 * Same pattern as Password Castle Level 1: “Need a Hint?” / “Hide Hint” button; hint panel only after click.
 */
export function HoverHintTrigger({ hint, subtitle }: HoverHintTriggerProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="w-full">
      <div className="mb-6 flex justify-center">
        <motion.button
          type="button"
          onClick={() => setOpen(!open)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 rounded-lg bg-yellow-500/20 px-4 py-2 text-sm font-semibold text-yellow-300 transition-all hover:bg-yellow-500/30"
          aria-expanded={open}
          aria-controls={panelId}
        >
          <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
          {open ? 'Hide Hint' : 'Need a Hint?'}
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="mb-6 overflow-hidden"
          >
            <div className="rounded border-l-4 border-yellow-400 bg-yellow-500/10 p-4">
              <p className="text-sm italic text-yellow-300">💡 {hint}</p>
              {subtitle ? <p className="mt-3 text-sm font-medium not-italic text-yellow-200/95">{subtitle}</p> : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
