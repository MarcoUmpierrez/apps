import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { isAnswerCorrect } from '../../fuzzy-match.util';
import { HintPanelComponent } from '../../hint-panel/hint-panel.component';
import { Language, WordScrambleMinigame } from '../../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../../ui-strings.data';

interface LetterTile {
  id: number;
  char: string;
}

function scrambleLetters(word: string): LetterTile[] {
  const chars = word.replace(/\s+/g, '').split('');
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.map((char, id) => ({ id, char }));
}

/** Tile size (and gap) comfortably fits BASE_TILE_COUNT tiles across a phone
 * screen at BASE_TILE_REM each. Longer words shrink their tiles to keep the
 * whole answer on a single line instead of wrapping. */
const BASE_TILE_COUNT = 6;
const BASE_TILE_REM = 2.75;
const TILE_GAP_REM = 0.5;
const MAX_ROW_WIDTH_REM = BASE_TILE_COUNT * BASE_TILE_REM + (BASE_TILE_COUNT - 1) * TILE_GAP_REM;

function computeTileSizeRem(tileCount: number): number {
  if (tileCount <= BASE_TILE_COUNT) return BASE_TILE_REM;
  return (MAX_ROW_WIDTH_REM - (tileCount - 1) * TILE_GAP_REM) / tileCount;
}

/**
 * Tap-to-place instead of typing: tapping a bank letter appends it to the
 * answer, tapping a placed letter returns it to the bank. The answer
 * auto-checks itself the moment every slot is filled, so there's no
 * separate submit step to interact with.
 */
@Component({
  selector: 'app-word-scramble',
  imports: [HintPanelComponent],
  template: `
    <div class="w-full max-w-sm">
      <p class="mb-4 text-lg font-semibold text-amber-900">{{ config().prompt[lang()] }}</p>

      <div
        class="transition-opacity"
        [class.pointer-events-none]="isSolved()"
        [class.opacity-60]="isSolved()"
      >
        <div
          class="mb-4 grid justify-center gap-2"
          [style.grid-template-columns]="
            'repeat(' + letterTiles().length + ', ' + tileSizeRem() + 'rem)'
          "
        >
          @for (slot of answerSlots(); track $index) {
            @if (slot) {
              <button
                type="button"
                (click)="removeFromAnswer(slot.id)"
                [disabled]="isSolved()"
                [style.width.rem]="tileSizeRem()"
                [style.height.rem]="tileSizeRem()"
                class="flex touch-manipulation items-center justify-center rounded-lg bg-amber-800 text-xl font-black text-white shadow-md transition-transform active:scale-95"
              >
                {{ slot.char }}
              </button>
            } @else {
              <div
                [style.width.rem]="tileSizeRem()"
                [style.height.rem]="tileSizeRem()"
                class="rounded-lg border-2 border-dashed border-amber-300"
              ></div>
            }
          }
        </div>

        <div
          class="grid justify-center gap-2"
          [style.grid-template-columns]="
            'repeat(' + letterTiles().length + ', ' + tileSizeRem() + 'rem)'
          "
        >
          @for (tile of bankTiles(); track tile.id) {
            <button
              type="button"
              (click)="addToAnswer(tile.id)"
              [disabled]="isSolved()"
              [style.width.rem]="tileSizeRem()"
              [style.height.rem]="tileSizeRem()"
              class="flex touch-manipulation items-center justify-center rounded-lg border-2 border-amber-300 bg-white text-xl font-black text-amber-800 shadow-sm transition-transform active:scale-95"
            >
              {{ tile.char }}
            </button>
          }
        </div>
      </div>

      @if (isSolved()) {
        <div class="mt-4 flex flex-col items-center gap-4 text-center">
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
        @if (wrongFlash()) {
          <p class="mt-3 text-center text-sm font-semibold text-red-700">
            {{ t('wrongTryAgain') }}
          </p>
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
export class WordScrambleComponent {
  readonly config = input.required<WordScrambleMinigame>();
  readonly lang = input.required<Language>();
  readonly solved = output<void>();

  readonly letterTiles = computed(() => scrambleLetters(this.config().answer[this.lang()]));
  readonly tileSizeRem = computed(() => computeTileSizeRem(this.letterTiles().length));
  readonly answerOrder = signal<number[]>([]);
  readonly attemptCount = signal(0);
  readonly wrongFlash = signal(false);
  readonly isSolved = signal(false);

  readonly answerTiles = computed(() => {
    const tiles = this.letterTiles();
    return this.answerOrder().map((id) => tiles.find((tile) => tile.id === id)!);
  });

  readonly answerSlots = computed<(LetterTile | null)[]>(() => {
    const placed = this.answerTiles();
    const total = this.letterTiles().length;
    return Array.from({ length: total }, (_, i) => placed[i] ?? null);
  });

  readonly bankTiles = computed(() => {
    const placedIds = new Set(this.answerOrder());
    return this.letterTiles().filter((tile) => !placedIds.has(tile.id));
  });

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  addToAnswer(id: number): void {
    const nextOrder = [...this.answerOrder(), id];
    this.answerOrder.set(nextOrder);
    if (nextOrder.length === this.letterTiles().length) {
      this.checkAnswer();
    }
  }

  removeFromAnswer(id: number): void {
    this.answerOrder.update((order) => order.filter((tileId) => tileId !== id));
  }

  private checkAnswer(): void {
    const answer = this.answerTiles()
      .map((tile) => tile.char)
      .join('');
    if (isAnswerCorrect(answer, [this.config().answer], this.lang())) {
      this.isSolved.set(true);
      return;
    }
    this.attemptCount.update((n) => n + 1);
    this.wrongFlash.set(true);
    setTimeout(() => {
      this.wrongFlash.set(false);
      this.answerOrder.set([]);
    }, 900);
  }
}
