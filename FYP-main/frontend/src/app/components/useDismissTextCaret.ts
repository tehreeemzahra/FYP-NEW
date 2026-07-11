import { useEffect } from 'react';

const TEXT_FIELD_SELECTOR = 'input, textarea, select, [contenteditable="true"]';
const INTERACTIVE_SELECTOR =
  'button, a, [role="button"], input, textarea, select, [contenteditable="true"], label';

function isTextField(el: Element | null): boolean {
  return Boolean(el?.closest(TEXT_FIELD_SELECTOR));
}

function isInteractive(el: Element | null): boolean {
  return Boolean(el?.closest(INTERACTIVE_SELECTOR));
}

/** Blur focused elements when clicking empty space — never while tapping buttons/links. */
export function useDismissTextCaret(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const dismiss = (event: Event) => {
      const target = event.target as Element | null;
      if (isTextField(target) || isInteractive(target)) return;

      const active = document.activeElement;
      if (!(active instanceof HTMLElement)) return;
      if (active === document.body || active.id === 'root') return;
      if (isTextField(active)) return;

      active.blur();
    };

    document.addEventListener('pointerdown', dismiss, true);
    return () => document.removeEventListener('pointerdown', dismiss, true);
  }, [enabled]);
}
