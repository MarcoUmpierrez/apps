import { ChangeDetectionStrategy, Component, OnInit, input, output, signal } from '@angular/core';
import { Language, SlidingTilePuzzleMinigame } from '../../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../../ui-strings.data';
import { findHintMoveIndex } from './sliding-tile-solver.util';

export function createSolvedTiles(gridSize: number): number[] {
  const tiles = Array.from({ length: gridSize * gridSize - 1 }, (_, i) => i + 1);
  tiles.push(0);
  return tiles;
}

export function adjacentIndices(index: number, gridSize: number): number[] {
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

/**
 * Each numbered tile keeps a fixed "home" slot (its value, 1-indexed) for the
 * whole game — that's what makes solving == sorting. When a chapterImage is
 * available, that same home slot picks a background-position crop out of the
 * full photo (sliced via a gridSize-by-gridSize sprite grid), so the puzzle
 * reconstructs the actual chapter photo instead of just counting up. Stops
 * without a chapterImage fall back to plain numbered tiles.
 */
@Component({
  selector: 'app-sliding-tile-puzzle',
  template: `
    <div class="w-full max-w-sm">
      <p class="mb-3 text-lg font-semibold text-amber-900">{{ config().prompt[lang()] }}</p>
      <div
        class="grid gap-1 rounded-xl border-2 border-amber-300 bg-amber-100 p-1"
        [style.grid-template-columns]="'repeat(' + config().gridSize + ', 1fr)'"
      >
        @for (value of tiles(); track $index; let i = $index) {
          <button
            type="button"
            (click)="onTileClick(i)"
            [class.invisible]="value === 0"
            [class.ring-4]="hintTileIndex() === i"
            [class.ring-amber-500]="hintTileIndex() === i"
            [class.animate-pulse]="hintTileIndex() === i"
            [style.background-image]="chapterImage() ? 'url(' + chapterImage() + ')' : null"
            [style.background-size]="
              chapterImage() ? gridSize() * 100 + '% ' + gridSize() * 100 + '%' : null
            "
            [style.background-position]="chapterImage() ? tileBackgroundPosition(value) : null"
            class="flex aspect-square min-h-11 touch-manipulation items-center justify-center rounded-lg bg-white bg-cover text-lg font-bold text-amber-900 shadow"
          >
            @if (!chapterImage()) {
              {{ value }}
            }
          </button>
        }
      </div>
      @if (!solvedLocally()) {
        <button
          type="button"
          (click)="onNeedHint()"
          class="mt-3 block w-full touch-manipulation text-center text-sm font-semibold text-amber-700 underline underline-offset-2"
        >
          {{ t('needHint') }}
        </button>
        <button
          type="button"
          (click)="revealSolution()"
          class="mt-2 block w-full touch-manipulation text-center text-sm font-semibold text-amber-700 underline underline-offset-2"
        >
          {{ t('giveUp') }}
        </button>
      } @else {
        <button
          type="button"
          (click)="solved.emit()"
          class="mt-3 min-h-11 w-full touch-manipulation rounded-xl bg-amber-800 py-3 font-bold text-white transition-transform active:scale-95"
        >
          {{ t('continueLabel') }}
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlidingTilePuzzleComponent implements OnInit {
  readonly config = input.required<SlidingTilePuzzleMinigame>();
  readonly lang = input.required<Language>();
  readonly chapterImage = input<string | undefined>(undefined);
  readonly solved = output<void>();

  readonly tiles = signal<number[]>([]);
  readonly solvedLocally = signal(false);
  /** Board index of the tile to nudge the player toward next; cleared on every move. */
  readonly hintTileIndex = signal<number | null>(null);

  ngOnInit(): void {
    this.tiles.set(shuffleTiles(this.config().gridSize));
  }

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  onNeedHint(): void {
    this.hintTileIndex.set(findHintMoveIndex(this.tiles(), this.config().gridSize));
  }

  revealSolution(): void {
    this.tiles.set(createSolvedTiles(this.config().gridSize));
    this.solvedLocally.set(true);
    this.hintTileIndex.set(null);
  }

  gridSize(): number {
    return this.config().gridSize;
  }

  tileBackgroundPosition(value: number): string {
    const gridSize = this.config().gridSize;
    const homeIndex = value - 1;
    const homeRow = Math.floor(homeIndex / gridSize);
    const homeCol = homeIndex % gridSize;
    const step = gridSize > 1 ? 100 / (gridSize - 1) : 0;
    return `${homeCol * step}% ${homeRow * step}%`;
  }

  onTileClick(index: number): void {
    const blankIndex = this.tiles().indexOf(0);
    const neighbors = adjacentIndices(blankIndex, this.config().gridSize);
    if (!neighbors.includes(index)) return;

    const next = [...this.tiles()];
    [next[blankIndex], next[index]] = [next[index], next[blankIndex]];
    this.tiles.set(next);
    this.hintTileIndex.set(null);

    if (this.isSolved(next)) {
      this.solvedLocally.set(true);
    }
  }

  private isSolved(tiles: number[]): boolean {
    const solvedTiles = createSolvedTiles(this.config().gridSize);
    return tiles.every((v, i) => v === solvedTiles[i]);
  }
}
