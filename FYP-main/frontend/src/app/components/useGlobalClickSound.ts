import { useEffect } from 'react';
import { playUiClick, primeUiClickAudio } from './playUiClick';

function isDisabled(el: Element | null): boolean {
  if (!el) return false;
  if (el instanceof HTMLButtonElement || el instanceof HTMLInputElement) return el.disabled;
  return el.getAttribute('aria-disabled') === 'true';
}

function resolveInteractiveTarget(target: EventTarget | null): Element | null {
  if (!(target instanceof Element)) return null;
  return target.closest('button, [role="button"], a, input[type="button"], input[type="submit"], input[type="reset"], [data-click-sound]');
}

export function useGlobalClickSound(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    primeUiClickAudio();

    const playFor = (target: EventTarget | null) => {
      const interactive = resolveInteractiveTarget(target);
      if (!interactive || isDisabled(interactive)) return;
      playUiClick();
    };

    const onPointerDown = (event: PointerEvent) => playFor(event.target);
    const onClick = (event: MouseEvent) => playFor(event.target);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      playFor(document.activeElement);
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [enabled]);
}
