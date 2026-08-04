import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { HintPanelComponent } from '../../hint-panel/hint-panel.component';
import { JigsawPuzzleMinigame, Language } from '../../scavenger-hunt.types';
import { shuffleArray } from '../../shuffle.util';
import { UiStringKey, translateUi } from '../../ui-strings.data';

/**
 * Tap-to-select then tap-to-place instead of true drag-and-drop, for the
 * same mobile-reliability reasons as the sliding-tile puzzle. Pieces are
 * background-position-sliced crops of the stop's chapterImage — no canvas
 * slicing needed.
 */
@Component({
  selector: 'app-jigsaw-puzzle',
  // The host is a flex item in minigame-phase's non-stretching flex container, so
  // without an explicit width it sizes via fit-content over its own descendants —
  // including the tray below, whose width shrinks as pieces move out of it. Pinning
  // width here (not just on the inner wrapper div) stops the tray from ever being
  // able to drag the whole puzzle's box down with it as it drains.
  host: { class: 'block w-full' },
  imports: [HintPanelComponent],
  template: `
    <div class="w-full max-w-sm">
      <p class="mb-3 text-lg font-semibold text-amber-900">{{ config().prompt[lang()] }}</p>

      <div class="mb-3 flex justify-center">
        <div
          class="inline-grid gap-1 rounded-xl border-2 border-amber-300 bg-amber-100 p-1"
          [style.grid-template-columns]="'repeat(' + gridCols() + ', ' + cellSizeRem() + 'rem)'"
        >
          @for (piece of slots(); track $index; let i = $index) {
            <button
              type="button"
              (click)="onSlotClick(i)"
              [style.width.rem]="cellSizeRem()"
              [style.height.rem]="cellSizeRem()"
              class="touch-manipulation overflow-hidden rounded border border-amber-300 bg-white"
            >
              @if (piece !== null) {
                <div
                  class="h-full w-full"
                  [style.background-image]="pieceBackgroundImage()"
                  [style.background-size]="pieceBackgroundSize()"
                  [style.background-position]="pieceBackgroundPosition(piece)"
                ></div>
              }
            </button>
          }
        </div>
      </div>

      @if (!solvedLocally()) {
        <div class="flex flex-wrap gap-1 rounded-xl border-2 border-amber-200 bg-white p-2">
          @for (pieceId of tray(); track pieceId) {
            <button
              type="button"
              (click)="onTrayPieceClick(pieceId)"
              [class.ring-4]="selectedPieceId() === pieceId"
              [class.ring-amber-600]="selectedPieceId() === pieceId"
              class="h-12 w-12 min-h-11 min-w-11 touch-manipulation overflow-hidden rounded border border-amber-300"
              [style.background-image]="pieceBackgroundImage()"
              [style.background-size]="pieceBackgroundSize()"
              [style.background-position]="pieceBackgroundPosition(pieceId)"
            ></button>
          }
        </div>

        <button
          type="button"
          (click)="revealSolution()"
          class="mt-3 block w-full touch-manipulation text-center text-sm font-semibold text-amber-700 underline underline-offset-2"
        >
          {{ t('giveUp') }}
        </button>
        <app-hint-panel [hints]="config().hints" [lang]="lang()" (revealed)="revealSolution()" />
      } @else {
        <button
          type="button"
          (click)="solved.emit()"
          class="min-h-11 w-full touch-manipulation rounded-xl bg-amber-800 py-3 font-bold text-white transition-transform active:scale-95"
        >
          {{ t('continueLabel') }}
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JigsawPuzzleComponent implements OnInit {
  readonly config = input.required<JigsawPuzzleMinigame>();
  readonly lang = input.required<Language>();
  readonly chapterImage = input<string | undefined>(undefined);
  readonly solved = output<void>();

  readonly slots = signal<(number | null)[]>([]);
  readonly tray = signal<number[]>([]);
  readonly selectedPieceId = signal<number | null>(null);
  readonly solvedLocally = signal(false);

  readonly gridCols = computed(() => (this.config().pieceCount === 12 ? 4 : 3));
  readonly gridRows = computed(() => (this.config().pieceCount === 12 ? 3 : 3));
  /** Fixed cell size (not 1fr/percentage) so the grid can never be pulled around by a shrinking sibling. */
  readonly cellSizeRem = computed(() => (this.config().pieceCount === 12 ? 5.25 : 7));

  ngOnInit(): void {
    const count = this.config().pieceCount;
    this.slots.set(new Array(count).fill(null));
    this.tray.set(shuffleArray(Array.from({ length: count }, (_, i) => i)));
  }

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  pieceBackgroundImage(): string {
    const image = this.chapterImage();
    return image ? `url(${image})` : 'none';
  }

  pieceBackgroundSize(): string {
    return `${this.gridCols() * 100}% ${this.gridRows() * 100}%`;
  }

  pieceBackgroundPosition(pieceId: number): string {
    const cols = this.gridCols();
    const rows = this.gridRows();
    const row = Math.floor(pieceId / cols);
    const col = pieceId % cols;
    const x = cols > 1 ? (col / (cols - 1)) * 100 : 0;
    const y = rows > 1 ? (row / (rows - 1)) * 100 : 0;
    return `${x}% ${y}%`;
  }

  onTrayPieceClick(pieceId: number): void {
    if (this.solvedLocally()) return;
    this.selectedPieceId.set(pieceId);
  }

  onSlotClick(slotIndex: number): void {
    if (this.solvedLocally()) return;

    const selected = this.selectedPieceId();
    const currentSlots = this.slots();

    if (selected !== null) {
      const displaced = currentSlots[slotIndex];
      const nextSlots = [...currentSlots];
      nextSlots[slotIndex] = selected;
      this.slots.set(nextSlots);
      this.tray.update((tray) => {
        const withoutSelected = tray.filter((p) => p !== selected);
        return displaced !== null ? [...withoutSelected, displaced] : withoutSelected;
      });
      this.selectedPieceId.set(null);
    } else if (currentSlots[slotIndex] !== null) {
      const piece = currentSlots[slotIndex] as number;
      const nextSlots = [...currentSlots];
      nextSlots[slotIndex] = null;
      this.slots.set(nextSlots);
      this.tray.update((tray) => [...tray, piece]);
    }

    this.checkSolved();
  }

  revealSolution(): void {
    const count = this.config().pieceCount;
    this.slots.set(Array.from({ length: count }, (_, i) => i));
    this.tray.set([]);
    this.selectedPieceId.set(null);
    this.solvedLocally.set(true);
  }

  private checkSolved(): void {
    const slots = this.slots();
    if (slots.length > 0 && slots.every((p, i) => p === i)) {
      this.solvedLocally.set(true);
    }
  }
}
