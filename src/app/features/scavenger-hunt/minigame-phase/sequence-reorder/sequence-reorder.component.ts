import { ChangeDetectionStrategy, Component, OnInit, input, output, signal } from '@angular/core';
import { HintPanelComponent } from '../../hint-panel/hint-panel.component';
import { BilingualText, Language, SequenceReorderMinigame } from '../../scavenger-hunt.types';
import { shuffleArray } from '../../shuffle.util';
import { UiStringKey, translateUi } from '../../ui-strings.data';

function swap<T>(items: T[], i: number, j: number): T[] {
  const copy = [...items];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}

/**
 * Up/down reorder buttons instead of true drag-and-drop — a deliberate
 * mobile-reliability trade-off, chosen the same way as the sliding-tile
 * puzzle's tap-based interaction: pointer-drag hit-testing is one more thing
 * that can go wrong at the actual location, and this achieves the same
 * puzzle goal without that risk.
 */
@Component({
  selector: 'app-sequence-reorder',
  imports: [HintPanelComponent],
  template: `
    <div class="w-full max-w-sm">
      <p class="mb-4 text-lg font-semibold text-amber-900">{{ config().prompt[lang()] }}</p>
      <ol class="mb-4 flex flex-col gap-2">
        @for (item of order(); track item; let i = $index) {
          <li
            class="flex items-center gap-2 rounded-xl border-2 border-amber-300 bg-white px-3 py-2"
          >
            <span class="flex-1 text-sm font-medium text-amber-900">{{ item[lang()] }}</span>
            <button
              type="button"
              (click)="moveUp(i)"
              [disabled]="i === 0 || isSolved()"
              class="min-h-11 min-w-11 touch-manipulation rounded-lg bg-amber-100 font-bold text-amber-800 disabled:opacity-30"
            >
              ↑
            </button>
            <button
              type="button"
              (click)="moveDown(i)"
              [disabled]="i === order().length - 1 || isSolved()"
              class="min-h-11 min-w-11 touch-manipulation rounded-lg bg-amber-100 font-bold text-amber-800 disabled:opacity-30"
            >
              ↓
            </button>
          </li>
        }
      </ol>

      @if (isSolved()) {
        <div class="flex flex-col items-center gap-4 text-center">
          <p class="font-['Caveat',cursive] text-3xl font-bold text-amber-900">
            🎉 {{ t('wellDone') }}
          </p>
          <button
            type="button"
            (click)="solved.emit()"
            class="min-h-14 w-full touch-manipulation rounded-2xl bg-amber-800 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-amber-900/30 transition-transform active:scale-95"
          >
            {{ t('continueLabel') }}
          </button>
        </div>
      } @else {
        <button
          type="button"
          (click)="onSubmit()"
          class="min-h-11 w-full touch-manipulation rounded-xl bg-amber-800 py-3 font-bold text-white transition-transform active:scale-95"
        >
          {{ t('submit') }}
        </button>
        @if (wrongFlash()) {
          <p class="mt-2 text-sm font-semibold text-red-700">{{ t('wrongTryAgain') }}</p>
        }
        <app-hint-panel
          [hints]="config().hints"
          [lang]="lang()"
          [attemptCount]="attemptCount()"
          (revealed)="isSolved.set(true)"
        />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SequenceReorderComponent implements OnInit {
  readonly config = input.required<SequenceReorderMinigame>();
  readonly lang = input.required<Language>();
  readonly solved = output<void>();

  readonly order = signal<BilingualText[]>([]);
  readonly attemptCount = signal(0);
  readonly wrongFlash = signal(false);
  readonly isSolved = signal(false);

  ngOnInit(): void {
    this.order.set(shuffleArray(this.config().itemsInCorrectOrder));
  }

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  moveUp(index: number): void {
    if (index === 0) return;
    this.order.update((items) => swap(items, index, index - 1));
  }

  moveDown(index: number): void {
    if (index === this.order().length - 1) return;
    this.order.update((items) => swap(items, index, index + 1));
  }

  onSubmit(): void {
    const correctOrder = this.config().itemsInCorrectOrder;
    const isCorrect = this.order().every((item, i) => item === correctOrder[i]);
    if (isCorrect) {
      this.isSolved.set(true);
      return;
    }
    this.attemptCount.update((n) => n + 1);
    this.wrongFlash.set(true);
    setTimeout(() => this.wrongFlash.set(false), 1200);
  }
}
