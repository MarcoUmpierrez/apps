import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { Language, WallBreakLetterMinigame } from '../../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../../ui-strings.data';

const CHARGE_PER_TAP = 12;
const DECAY_PER_TICK = 2;
const DECAY_INTERVAL_MS = 100;
const SHAKE_DURATION_MS = 500;

/**
 * Charge decays continuously, so only rapid tapping outpaces it — tapping too
 * slowly just watches the bar drain back down. A "give up" link still fully
 * reveals the letter on demand, same "never truly stuck" rule as every other
 * minigame in this hunt.
 */
@Component({
  selector: 'app-wall-break-game',
  styleUrl: './wall-break-game.component.css',
  template: `
    <div class="flex w-full max-w-sm flex-col items-center gap-5 text-center">
      @if (!taskComplete()) {
        <p class="text-lg font-semibold text-amber-900">{{ t('wallBreakPrompt') }}</p>

        <div
          class="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-2xl border-2 border-amber-300 shadow-lg shadow-amber-900/20"
          [class.wall-shake]="justHit()"
        >
          <div
            class="absolute inset-0 flex items-center justify-center bg-amber-50 text-7xl font-black text-amber-900"
          >
            {{ config().letter }}
          </div>
          <div class="wall-face absolute inset-0"></div>
          <div class="wall-crack-overlay absolute inset-0" [style.opacity]="crackOpacity()"></div>
        </div>

        <p class="text-sm text-amber-700">{{ hitsLanded() }} / {{ config().hitsRequired }}</p>

        <div
          class="h-4 w-full max-w-xs overflow-hidden rounded-full border-2 border-amber-300 bg-amber-100"
        >
          <div
            class="h-full rounded-full bg-amber-600 transition-[width] duration-150 ease-out"
            [style.width.%]="charge()"
          ></div>
        </div>

        @if (charge() >= 100) {
          <button
            type="button"
            (click)="onHit()"
            class="min-h-14 w-full touch-manipulation rounded-2xl bg-red-800 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-red-900/30 transition-transform active:scale-95"
          >
            {{ t('hitIt') }}
          </button>
        } @else {
          <button
            type="button"
            (click)="onCharge()"
            class="min-h-14 w-full touch-manipulation rounded-2xl bg-amber-800 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-amber-900/30 transition-transform active:scale-95"
          >
            {{ t('chargeIt') }}
          </button>
        }

        <button
          type="button"
          (click)="revealNow()"
          class="touch-manipulation text-sm font-semibold text-amber-700 underline underline-offset-2"
        >
          {{ t('giveUp') }}
        </button>
      } @else {
        <div class="text-8xl font-black text-amber-900">{{ config().letter }}</div>
        <div class="max-w-xs rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 p-4">
          <p class="mb-1 text-xs font-bold uppercase tracking-widest text-amber-600">
            📓 {{ t('notebookCallout') }}
          </p>
          <p class="text-amber-900">{{ notebookMessage() }}</p>
        </div>
        <button
          type="button"
          (click)="solved.emit()"
          class="min-h-14 w-full touch-manipulation rounded-2xl bg-amber-800 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-amber-900/30 transition-transform active:scale-95"
        >
          {{ t('continueLabel') }}
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WallBreakGameComponent implements OnDestroy {
  readonly config = input.required<WallBreakLetterMinigame>();
  readonly lang = input.required<Language>();
  readonly solved = output<void>();

  readonly charge = signal(0);
  readonly hitsLanded = signal(0);
  readonly justHit = signal(false);

  readonly taskComplete = computed(() => this.hitsLanded() >= this.config().hitsRequired);
  /** The wall itself stays fully opaque the whole time — only the crack overlay grows,
   * so the letter behind it is never visible before the wall is actually broken. */
  readonly crackOpacity = computed(() => this.hitsLanded() / this.config().hitsRequired);

  private readonly decayIntervalId = setInterval(() => {
    if (this.taskComplete()) return;
    this.charge.update((c) => Math.max(0, c - DECAY_PER_TICK));
  }, DECAY_INTERVAL_MS);
  private shakeTimeoutId: ReturnType<typeof setTimeout> | null = null;

  ngOnDestroy(): void {
    clearInterval(this.decayIntervalId);
    if (this.shakeTimeoutId) clearTimeout(this.shakeTimeoutId);
  }

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  notebookMessage(): string {
    return translateUi(this.lang(), 'writeLetterDown', { letter: this.config().letter });
  }

  onCharge(): void {
    if (this.taskComplete()) return;
    this.charge.update((c) => Math.min(100, c + CHARGE_PER_TAP));
  }

  onHit(): void {
    if (this.taskComplete() || this.charge() < 100) return;
    this.charge.set(0);
    this.hitsLanded.update((h) => h + 1);

    this.justHit.set(true);
    if (this.shakeTimeoutId) clearTimeout(this.shakeTimeoutId);
    this.shakeTimeoutId = setTimeout(() => this.justHit.set(false), SHAKE_DURATION_MS);
  }

  revealNow(): void {
    this.charge.set(0);
    this.hitsLanded.set(this.config().hitsRequired);
  }
}
