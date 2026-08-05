import { DestroyRef, Signal, effect, inject, signal } from '@angular/core';

/** Players are usually tapping furiously right up until a minigame completes —
 * without this delay, the next reflexive tap lands on the Continue button the
 * instant it appears and skips the reveal before anyone reads it. */
const CONTINUE_READY_DELAY_MS = 700;

/**
 * Returns a signal that flips true a beat after `taskComplete` first becomes
 * true. Must be called from a component's field initializer or constructor
 * (an injection context), since it registers an `effect()` and a `DestroyRef`
 * cleanup for the timer.
 */
export function createContinueReadySignal(taskComplete: () => boolean): Signal<boolean> {
  const ready = signal(false);
  const destroyRef = inject(DestroyRef);
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  effect(() => {
    if (!taskComplete()) return;
    timeoutId = setTimeout(() => ready.set(true), CONTINUE_READY_DELAY_MS);
  });

  destroyRef.onDestroy(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });

  return ready.asReadonly();
}
