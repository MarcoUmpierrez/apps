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

/**
 * Tap-to-select then tap-to-place instead of true drag-and-drop, for the
 * same mobile-reliability reasons as the sliding-tile puzzle. Pieces are
 * background-position-sliced CSS squares — no canvas slicing needed.
 */
@Component({
  selector: 'app-jigsaw-puzzle',
  imports: [HintPanelComponent],
  template: `
    <div class="w-full max-w-sm">
      <p class="mb-3 text-lg font-semibold text-amber-900">{{ config().prompt[lang()] }}</p>

      <div
        class="mb-3 grid gap-1 rounded-xl border-2 border-amber-300 bg-amber-100 p-1"
        [style.grid-template-columns]="'repeat(' + gridCols() + ', 1fr)'"
      >
        @for (piece of slots(); track $index; let i = $index) {
          <button
            type="button"
            (click)="onSlotClick(i)"
            class="aspect-square min-h-11 touch-manipulation overflow-hidden rounded border border-amber-300 bg-white"
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

      <app-hint-panel [hints]="config().hints" [lang]="lang()" (revealed)="solved.emit()" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JigsawPuzzleComponent implements OnInit {
  readonly config = input.required<JigsawPuzzleMinigame>();
  readonly lang = input.required<Language>();
  readonly solved = output<void>();

  readonly slots = signal<(number | null)[]>([]);
  readonly tray = signal<number[]>([]);
  readonly selectedPieceId = signal<number | null>(null);

  readonly gridCols = computed(() => (this.config().pieceCount === 12 ? 4 : 3));
  readonly gridRows = computed(() => (this.config().pieceCount === 12 ? 3 : 3));

  ngOnInit(): void {
    const count = this.config().pieceCount;
    this.slots.set(new Array(count).fill(null));
    this.tray.set(shuffleArray(Array.from({ length: count }, (_, i) => i)));
  }

  pieceBackgroundImage(): string {
    return `url(${this.config().imageAsset})`;
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
    this.selectedPieceId.set(pieceId);
  }

  onSlotClick(slotIndex: number): void {
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

  private checkSolved(): void {
    const slots = this.slots();
    if (slots.length > 0 && slots.every((p, i) => p === i)) {
      this.solved.emit();
    }
  }
}
