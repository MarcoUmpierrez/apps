import { ChangeDetectionStrategy, Component, OnInit, input, output, signal } from '@angular/core';
import { HintPanelComponent } from '../../hint-panel/hint-panel.component';
import { Language, SlidingTilePuzzleMinigame } from '../../scavenger-hunt.types';

function createSolvedTiles(gridSize: number): number[] {
  const tiles = Array.from({ length: gridSize * gridSize - 1 }, (_, i) => i + 1);
  tiles.push(0);
  return tiles;
}

function adjacentIndices(index: number, gridSize: number): number[] {
  const row = Math.floor(index / gridSize);
  const col = index % gridSize;
  const neighbors: number[] = [];
  if (row > 0) neighbors.push(index - gridSize);
  if (row < gridSize - 1) neighbors.push(index + gridSize);
  if (col > 0) neighbors.push(index - 1);
  if (col < gridSize - 1) neighbors.push(index + 1);
  return neighbors;
}

/** Shuffled via random valid moves from the solved state, so it's always solvable. */
function shuffleTiles(gridSize: number): number[] {
  const tiles = createSolvedTiles(gridSize);
  let blankIndex = tiles.length - 1;
  const randomMoves = 150;

  for (let i = 0; i < randomMoves; i++) {
    const neighbors = adjacentIndices(blankIndex, gridSize);
    const swapIndex = neighbors[Math.floor(Math.random() * neighbors.length)];
    [tiles[blankIndex], tiles[swapIndex]] = [tiles[swapIndex], tiles[blankIndex]];
    blankIndex = swapIndex;
  }

  return tiles;
}

@Component({
  selector: 'app-sliding-tile-puzzle',
  imports: [HintPanelComponent],
  template: `
    <div class="w-full max-w-sm">
      <p class="mb-3 text-lg font-semibold text-amber-900">{{ config().prompt[lang()] }}</p>
      <img
        [src]="config().imageAsset"
        alt=""
        class="mb-3 h-24 w-full rounded-lg object-cover"
        (error)="onPreviewError($event)"
      />
      <div
        class="grid gap-1 rounded-xl border-2 border-amber-300 bg-amber-100 p-1"
        [style.grid-template-columns]="'repeat(' + config().gridSize + ', 1fr)'"
      >
        @for (value of tiles(); track $index; let i = $index) {
          <button
            type="button"
            (click)="onTileClick(i)"
            [class.invisible]="value === 0"
            class="flex aspect-square min-h-11 touch-manipulation items-center justify-center rounded-lg bg-white text-lg font-bold text-amber-900 shadow"
          >
            {{ value }}
          </button>
        }
      </div>
      <app-hint-panel [hints]="config().hints" [lang]="lang()" (revealed)="solved.emit()" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlidingTilePuzzleComponent implements OnInit {
  readonly config = input.required<SlidingTilePuzzleMinigame>();
  readonly lang = input.required<Language>();
  readonly solved = output<void>();

  readonly tiles = signal<number[]>([]);

  ngOnInit(): void {
    this.tiles.set(shuffleTiles(this.config().gridSize));
  }

  onPreviewError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  onTileClick(index: number): void {
    const blankIndex = this.tiles().indexOf(0);
    const neighbors = adjacentIndices(blankIndex, this.config().gridSize);
    if (!neighbors.includes(index)) return;

    const next = [...this.tiles()];
    [next[blankIndex], next[index]] = [next[index], next[blankIndex]];
    this.tiles.set(next);

    if (this.isSolved(next)) {
      this.solved.emit();
    }
  }

  private isSolved(tiles: number[]): boolean {
    const solvedTiles = createSolvedTiles(this.config().gridSize);
    return tiles.every((v, i) => v === solvedTiles[i]);
  }
}
