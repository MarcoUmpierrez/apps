import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { Language, TowerOfHanoiLetterMinigame } from '../../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../../ui-strings.data';
import { createContinueReadySignal } from '../continue-ready.util';

const DISC_COLORS = ['#f59e0b', '#fb7185', '#34d399', '#60a5fa', '#a78bfa'];
const WRONG_FLASH_MS = 900;

/**
 * Tap-to-select then tap-to-place, same mobile-reliability reasoning as the
 * sliding-tile and jigsaw puzzles. Discs are stored bottom-to-top per pole
 * (index 0 = bottom/largest), so a pole "wins" once it holds every disc.
 */
@Component({
  selector: 'app-tower-of-hanoi-game',
  template: `
    <div class="flex w-full max-w-sm flex-col items-center gap-5 text-center">
      @if (!taskComplete()) {
        <p class="text-lg font-semibold text-amber-900">{{ t('hanoiPrompt') }}</p>

        <div class="flex w-full items-end justify-around gap-2">
          @for (pole of poles(); track $index; let i = $index) {
            <button
              type="button"
              (click)="onPoleClick(i)"
              [class.ring-4]="selectedPole() === i"
              [class.ring-amber-600]="selectedPole() === i"
              class="relative flex h-40 w-24 touch-manipulation flex-col-reverse items-center justify-start gap-1 rounded-lg border-2 border-amber-300 bg-amber-100/40 pb-2"
            >
              <div
                class="pointer-events-none absolute top-2 bottom-2 left-1/2 w-1.5 -translate-x-1/2 rounded-full bg-amber-800/30"
              ></div>
              @for (disc of pole; track $index) {
                <div
                  class="relative z-10 h-5 rounded-full shadow"
                  [style.width.%]="discWidthPercent(disc)"
                  [style.background-color]="discColor(disc)"
                ></div>
              }
            </button>
          }
        </div>

        @if (wrongFlash()) {
          <p class="text-sm font-semibold text-red-700">{{ t('wrongTryAgain') }}</p>
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
          [disabled]="!continueReady()"
          class="min-h-14 w-full touch-manipulation rounded-2xl bg-amber-800 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-amber-900/30 transition-transform active:scale-95 disabled:opacity-40"
        >
          {{ t('continueLabel') }}
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TowerOfHanoiGameComponent implements OnInit {
  readonly config = input.required<TowerOfHanoiLetterMinigame>();
  readonly lang = input.required<Language>();
  readonly solved = output<void>();

  readonly poles = signal<number[][]>([[], [], []]);
  readonly selectedPole = signal<number | null>(null);
  readonly wrongFlash = signal(false);

  readonly taskComplete = computed(() => this.poles()[2].length === this.config().discCount);
  readonly continueReady = createContinueReadySignal(() => this.taskComplete());

  ngOnInit(): void {
    const count = this.config().discCount;
    const startPole = Array.from({ length: count }, (_, i) => count - i);
    this.poles.set([startPole, [], []]);
  }

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  notebookMessage(): string {
    return translateUi(this.lang(), 'writeLetterDown', { letter: this.config().letter });
  }

  discWidthPercent(disc: number): number {
    return 35 + (disc / this.config().discCount) * 55;
  }

  discColor(disc: number): string {
    return DISC_COLORS[(disc - 1) % DISC_COLORS.length];
  }

  onPoleClick(poleIndex: number): void {
    if (this.taskComplete()) return;

    const selected = this.selectedPole();
    const poles = this.poles();

    if (selected === null) {
      if (poles[poleIndex].length > 0) this.selectedPole.set(poleIndex);
      return;
    }

    if (selected === poleIndex) {
      this.selectedPole.set(null);
      return;
    }

    const sourcePole = poles[selected];
    const movingDisc = sourcePole[sourcePole.length - 1];
    const destPole = poles[poleIndex];
    const destTopDisc = destPole[destPole.length - 1];

    if (destTopDisc !== undefined && movingDisc > destTopDisc) {
      this.selectedPole.set(null);
      this.wrongFlash.set(true);
      setTimeout(() => this.wrongFlash.set(false), WRONG_FLASH_MS);
      return;
    }

    const nextPoles = poles.map((p) => [...p]);
    nextPoles[selected].pop();
    nextPoles[poleIndex].push(movingDisc);
    this.poles.set(nextPoles);
    this.selectedPole.set(null);
  }

  revealNow(): void {
    const count = this.config().discCount;
    this.poles.set([[], [], Array.from({ length: count }, (_, i) => count - i)]);
    this.selectedPole.set(null);
  }
}
