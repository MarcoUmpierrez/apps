import { ChangeDetectionStrategy, Component, OnDestroy, computed, input, signal } from '@angular/core';

const JITTER_MIN_DELAY_MS = 350;
const JITTER_MAX_DELAY_MS = 900;
const JITTER_MIN_DURATION_MS = 300;
const JITTER_MAX_DURATION_MS = 600;
const JITTER_AMPLITUDE_DEGREES = 9;

/**
 * A real compass needle never sits perfectly still — magnetic interference
 * and its own inertia keep it swinging a few degrees around true bearing.
 * That's faked here with a small random offset re-rolled on an irregular
 * timer, animated via CSS transition rather than the target bearing itself
 * changing, so the needle always settles back toward the real direction.
 */
@Component({
  selector: 'app-compass-arrow',
  template: `
    <svg
      viewBox="0 0 100 100"
      class="h-28 w-28 ease-in-out"
      [style.transition]="'transform ' + jitterDurationMs() + 'ms ease-in-out'"
      [style.transform]="'rotate(' + rotationDegrees() + 'deg)'"
    >
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        class="text-[#6b5636]"
      />
      <polygon points="50,10 62,58 50,48 38,58" fill="currentColor" class="text-[#e3d5b8]" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompassArrowComponent implements OnDestroy {
  readonly bearingDegrees = input<number | null>(null);

  private readonly jitterDegrees = signal(0);
  readonly jitterDurationMs = signal(JITTER_MIN_DURATION_MS);

  readonly rotationDegrees = computed(() => (this.bearingDegrees() ?? 0) + this.jitterDegrees());

  private timeoutId: ReturnType<typeof setTimeout>;

  constructor() {
    this.timeoutId = this.scheduleNextJitter();
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeoutId);
  }

  private scheduleNextJitter(): ReturnType<typeof setTimeout> {
    const delay = JITTER_MIN_DELAY_MS + Math.random() * (JITTER_MAX_DELAY_MS - JITTER_MIN_DELAY_MS);
    return setTimeout(() => {
      this.jitterDegrees.set((Math.random() * 2 - 1) * JITTER_AMPLITUDE_DEGREES);
      this.jitterDurationMs.set(
        JITTER_MIN_DURATION_MS + Math.random() * (JITTER_MAX_DURATION_MS - JITTER_MIN_DURATION_MS),
      );
      this.timeoutId = this.scheduleNextJitter();
    }, delay);
  }
}
