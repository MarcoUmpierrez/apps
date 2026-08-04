import { ChangeDetectionStrategy, Component, OnInit, computed, input, output, signal } from '@angular/core';
import { Language, MazeLetterMinigame } from '../../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../../ui-strings.data';

const CELL_SIZE_PX = 30;

interface MazeCell {
  north: boolean;
  south: boolean;
  east: boolean;
  west: boolean;
}

type Direction = keyof MazeCell;

/**
 * Randomized recursive-backtracker maze generation: starting from the
 * top-left cell, repeatedly knock down the wall to a random unvisited
 * neighbor and recurse (via an explicit stack), backtracking when stuck.
 * This is a classic "perfect maze" algorithm — every cell is reachable
 * through exactly one path, so the maze is always solvable by construction.
 */
function generateMaze(cols: number, rows: number): MazeCell[][] {
  const grid: MazeCell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ north: true, south: true, east: true, west: true })),
  );
  const visited: boolean[][] = Array.from({ length: rows }, () => new Array(cols).fill(false));

  const stack: [number, number][] = [[0, 0]];
  visited[0][0] = true;

  while (stack.length > 0) {
    const [cx, cy] = stack[stack.length - 1];
    const candidates: { x: number; y: number; from: Direction; to: Direction }[] = [];

    if (cy > 0 && !visited[cy - 1][cx]) candidates.push({ x: cx, y: cy - 1, from: 'north', to: 'south' });
    if (cy < rows - 1 && !visited[cy + 1][cx]) candidates.push({ x: cx, y: cy + 1, from: 'south', to: 'north' });
    if (cx > 0 && !visited[cy][cx - 1]) candidates.push({ x: cx - 1, y: cy, from: 'west', to: 'east' });
    if (cx < cols - 1 && !visited[cy][cx + 1]) candidates.push({ x: cx + 1, y: cy, from: 'east', to: 'west' });

    if (candidates.length === 0) {
      stack.pop();
      continue;
    }

    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    grid[cy][cx][pick.from] = false;
    grid[pick.y][pick.x][pick.to] = false;
    visited[pick.y][pick.x] = true;
    stack.push([pick.x, pick.y]);
  }

  return grid;
}

/**
 * The player moves one cell at a time via directional buttons; a move is
 * only allowed when the current cell has no wall in that direction. "Give
 * up" just teleports the dot straight to the goal, same "never truly stuck"
 * rule as every other letter minigame.
 */
@Component({
  selector: 'app-maze-game',
  styleUrl: './maze-game.component.css',
  template: `
    <div class="flex w-full max-w-sm flex-col items-center gap-5 text-center">
      @if (!taskComplete()) {
        <p class="text-lg font-semibold text-amber-900">{{ t('mazePrompt') }}</p>

        <div
          class="relative rounded-xl border-2 border-amber-800 bg-amber-50"
          [style.width.px]="config().cols * cellSize"
          [style.height.px]="config().rows * cellSize"
        >
          @for (row of maze; track $index; let y = $index) {
            @for (cell of row; track $index; let x = $index) {
              <div
                class="absolute box-border border-solid border-amber-800"
                [style.left.px]="x * cellSize"
                [style.top.px]="y * cellSize"
                [style.width.px]="cellSize"
                [style.height.px]="cellSize"
                [style.border-top-width.px]="cell.north ? 2 : 0"
                [style.border-bottom-width.px]="cell.south ? 2 : 0"
                [style.border-left-width.px]="cell.west ? 2 : 0"
                [style.border-right-width.px]="cell.east ? 2 : 0"
              ></div>
            }
          }

          <div
            class="absolute flex items-center justify-center text-lg"
            [style.left.px]="(config().cols - 1) * cellSize"
            [style.top.px]="(config().rows - 1) * cellSize"
            [style.width.px]="cellSize"
            [style.height.px]="cellSize"
          >
            🚩
          </div>

          <div
            class="absolute rounded-full bg-amber-700 shadow transition-[left,top] duration-150 ease-out"
            [style.left.px]="playerX() * cellSize + cellSize * 0.25"
            [style.top.px]="playerY() * cellSize + cellSize * 0.25"
            [style.width.px]="cellSize * 0.5"
            [style.height.px]="cellSize * 0.5"
          ></div>
        </div>

        <div class="grid w-36 grid-cols-3 grid-rows-3 gap-1">
          <div></div>
          <button type="button" (click)="move('north')" class="dpad-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6" style="transform-origin: 12px 12px">
              <path d="M12 5 L19 16 L5 16 Z" />
            </svg>
          </button>
          <div></div>
          <button type="button" (click)="move('west')" class="dpad-btn">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              class="h-6 w-6"
              style="transform-origin: 12px 12px; transform: rotate(-90deg)"
            >
              <path d="M12 5 L19 16 L5 16 Z" />
            </svg>
          </button>
          <div></div>
          <button type="button" (click)="move('east')" class="dpad-btn">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              class="h-6 w-6"
              style="transform-origin: 12px 12px; transform: rotate(90deg)"
            >
              <path d="M12 5 L19 16 L5 16 Z" />
            </svg>
          </button>
          <div></div>
          <button type="button" (click)="move('south')" class="dpad-btn">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              class="h-6 w-6"
              style="transform-origin: 12px 12px; transform: rotate(180deg)"
            >
              <path d="M12 5 L19 16 L5 16 Z" />
            </svg>
          </button>
          <div></div>
        </div>

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
export class MazeGameComponent implements OnInit {
  readonly config = input.required<MazeLetterMinigame>();
  readonly lang = input.required<Language>();
  readonly solved = output<void>();

  readonly cellSize = CELL_SIZE_PX;
  maze: MazeCell[][] = [];

  readonly playerX = signal(0);
  readonly playerY = signal(0);

  readonly taskComplete = computed(
    () => this.playerX() === this.config().cols - 1 && this.playerY() === this.config().rows - 1,
  );

  ngOnInit(): void {
    this.maze = generateMaze(this.config().cols, this.config().rows);
  }

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  notebookMessage(): string {
    return translateUi(this.lang(), 'writeLetterDown', { letter: this.config().letter });
  }

  move(direction: Direction): void {
    if (this.taskComplete()) return;
    const cell = this.maze[this.playerY()][this.playerX()];
    if (cell[direction]) return;

    if (direction === 'north') this.playerY.update((y) => y - 1);
    if (direction === 'south') this.playerY.update((y) => y + 1);
    if (direction === 'west') this.playerX.update((x) => x - 1);
    if (direction === 'east') this.playerX.update((x) => x + 1);
  }

  revealNow(): void {
    this.playerX.set(this.config().cols - 1);
    this.playerY.set(this.config().rows - 1);
  }
}
