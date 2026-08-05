import { ChangeDetectionStrategy, Component, OnInit, computed, input, output, signal } from '@angular/core';
import { BurgerBuildLetterMinigame, BurgerIngredientKind, Language } from '../../scavenger-hunt.types';
import { shuffleArray } from '../../shuffle.util';
import { UiStringKey, translateUi } from '../../ui-strings.data';
import { createContinueReadySignal } from '../continue-ready.util';

const WRONG_FLASH_MS = 900;

const INGREDIENT_INFO: Record<BurgerIngredientKind, { emoji: string; color: string }> = {
  'bun-bottom': { emoji: '🍞', color: '#d9a066' },
  meat: { emoji: '🥩', color: '#8b4513' },
  cheese: { emoji: '🧀', color: '#fbbf24' },
  lettuce: { emoji: '🥬', color: '#65a30d' },
  onion: { emoji: '🧅', color: '#c084fc' },
  'bun-top': { emoji: '🍞', color: '#f2c185' },
};

/**
 * Tap tray ingredients in the correct bottom-to-top order to stack the
 * burger — tapping the wrong next ingredient just flashes and leaves the
 * tray untouched (no punishing reset), matching every other letter minigame.
 */
@Component({
  selector: 'app-burger-build-game',
  template: `
    <div class="flex w-full max-w-sm flex-col items-center gap-5 text-center">
      @if (!taskComplete()) {
        <p class="text-lg font-semibold text-amber-900">{{ t('burgerBuildPrompt') }}</p>

        <div
          class="flex h-60 w-32 flex-col-reverse items-center justify-start gap-1 rounded-2xl border-2 border-amber-300 bg-amber-100/40 p-2"
        >
          @for (ingredient of stack(); track $index) {
            <div
              class="flex h-7 w-full shrink-0 items-center justify-center rounded-full text-lg shadow"
              [style.background-color]="info(ingredient).color"
            >
              {{ info(ingredient).emoji }}
            </div>
          }
        </div>

        <div class="flex flex-wrap justify-center gap-2">
          @for (ingredient of tray(); track ingredient) {
            <button
              type="button"
              (click)="onTrayTap(ingredient)"
              class="flex h-12 w-12 min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-full border-2 border-amber-300 text-2xl shadow"
              [style.background-color]="info(ingredient).color"
            >
              {{ info(ingredient).emoji }}
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
export class BurgerBuildGameComponent implements OnInit {
  readonly config = input.required<BurgerBuildLetterMinigame>();
  readonly lang = input.required<Language>();
  readonly solved = output<void>();

  readonly stack = signal<BurgerIngredientKind[]>([]);
  readonly tray = signal<BurgerIngredientKind[]>([]);
  readonly wrongFlash = signal(false);

  readonly taskComplete = computed(
    () => this.stack().length === this.config().ingredientsInOrder.length,
  );
  readonly continueReady = createContinueReadySignal(() => this.taskComplete());

  ngOnInit(): void {
    this.tray.set(shuffleArray([...this.config().ingredientsInOrder]));
  }

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  notebookMessage(): string {
    return translateUi(this.lang(), 'writeLetterDown', { letter: this.config().letter });
  }

  info(ingredient: BurgerIngredientKind): { emoji: string; color: string } {
    return INGREDIENT_INFO[ingredient];
  }

  onTrayTap(ingredient: BurgerIngredientKind): void {
    if (this.taskComplete()) return;

    const expected = this.config().ingredientsInOrder[this.stack().length];
    if (ingredient !== expected) {
      this.wrongFlash.set(true);
      setTimeout(() => this.wrongFlash.set(false), WRONG_FLASH_MS);
      return;
    }

    this.stack.update((s) => [...s, ingredient]);
    this.tray.update((t) => t.filter((i) => i !== ingredient));
  }

  revealNow(): void {
    this.stack.set([...this.config().ingredientsInOrder]);
    this.tray.set([]);
  }
}
