import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { Language, MazeLetterMinigame } from '../../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../../ui-strings.data';
import { createContinueReadySignal } from '../continue-ready.util';

const MAX_CELL_SIZE_PX = 30;
const MIN_CELL_SIZE_PX = 16;
// Conservative budget for the narrowest supported card (accounts for the
// hunt-page card's own padding plus the phase wrapper's outer padding) —
// cell size shrinks below MAX_CELL_SIZE_PX for wide mazes so the grid never
// overflows and gets clipped by the card's torn-edge mask.
const MAZE_WIDTH_BUDGET_PX = 300;

type TiltPermissionState = 'unknown' | 'granted' | 'denied' | 'unsupported';

interface DeviceOrientationEventCtorIOS {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

/** Degrees of tilt away from the calibrated baseline needed to fire a move. */
const TILT_ENGAGE_THRESHOLD = 12;
/** Degrees the tilt must fall back below before the same axis can fire again. */
const TILT_DISENGAGE_THRESHOLD = 6;

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
        <p class="font-['Spectral',serif] text-[15px] leading-relaxed text-[#33261a]">{{ t('mazePrompt') }}</p>

        <div
          class="relative border border-[#3a2c1c]/50 bg-[#3a2c1c]/5"
          [style.width.px]="config().cols * cellSize()"
          [style.height.px]="config().rows * cellSize()"
        >
          @for (row of maze; track $index; let y = $index) {
            @for (cell of row; track $index; let x = $index) {
              <div
                class="absolute box-border border-solid border-[#3a2c1c]"
                [style.left.px]="x * cellSize()"
                [style.top.px]="y * cellSize()"
                [style.width.px]="cellSize()"
                [style.height.px]="cellSize()"
                [style.border-top-width.px]="cell.north ? 2 : 0"
                [style.border-bottom-width.px]="cell.south ? 2 : 0"
                [style.border-left-width.px]="cell.west ? 2 : 0"
                [style.border-right-width.px]="cell.east ? 2 : 0"
              ></div>
            }
          }

          <div
            class="absolute flex items-center justify-center text-lg"
            [style.left.px]="(config().cols - 1) * cellSize()"
            [style.top.px]="(config().rows - 1) * cellSize()"
            [style.width.px]="cellSize()"
            [style.height.px]="cellSize()"
          >
            🚩
          </div>

          <div
            class="absolute rounded-full bg-[#3a3f6b] shadow-[0_2px_4px_rgba(0,0,0,0.4)] transition-[left,top] duration-150 ease-out"
            [style.left.px]="playerX() * cellSize() + cellSize() * 0.25"
            [style.top.px]="playerY() * cellSize() + cellSize() * 0.25"
            [style.width.px]="cellSize() * 0.5"
            [style.height.px]="cellSize() * 0.5"
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

        @if (tiltPermissionState() === 'unknown' || tiltPermissionState() === 'denied') {
          <button
            type="button"
            (click)="enableTilt()"
            class="min-h-11 touch-manipulation border border-[#3a2c1c]/45 px-5 py-2 font-['Spectral',serif] text-xs tracking-[.15em] text-[#33261a] uppercase"
          >
            {{ t('enableTilt') }}
          </button>
        }

        <button
          type="button"
          (click)="revealNow()"
          class="touch-manipulation font-['Kalam',cursive] text-sm text-[#8a7550] underline underline-offset-2"
        >
          {{ t('giveUp') }}
        </button>
      } @else {
        <div
          class="flex h-28 w-28 items-center justify-center rounded-full border-2 border-[#3a2c1c]/30 font-['Spectral',serif] text-6xl text-[#3a3f6b] shadow-[0_10px_20px_rgba(0,0,0,0.15)]"
          style="animation: stamp-in 0.5s ease-out both"
        >
          {{ config().letter }}
        </div>
        <div class="w-full max-w-xs border border-dashed border-[#3a2c1c]/30 bg-[#3a2c1c]/5 p-4">
          <p class="mb-1 font-['Spectral',serif] text-[10px] tracking-[.22em] text-[#8a7550] uppercase">
            📓 {{ t('notebookCallout') }}
          </p>
          <p class="font-['Kalam',cursive] text-[15px] text-[#33261a]">{{ notebookMessage() }}</p>
        </div>
        <button
          type="button"
          (click)="solved.emit()"
          [disabled]="!continueReady()"
          class="min-h-14 w-full touch-manipulation border border-[#3a2c1c]/45 py-4 font-['Spectral',serif] text-xs tracking-[.24em] text-[#33261a] uppercase transition-transform active:scale-95 disabled:opacity-40"
        >
          {{ t('continueLabel') }}
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MazeGameComponent implements OnInit, OnDestroy {
  readonly config = input.required<MazeLetterMinigame>();
  readonly lang = input.required<Language>();
  readonly solved = output<void>();

  readonly cellSize = computed(() =>
    Math.max(MIN_CELL_SIZE_PX, Math.min(MAX_CELL_SIZE_PX, Math.floor(MAZE_WIDTH_BUDGET_PX / this.config().cols))),
  );
  maze: MazeCell[][] = [];

  readonly playerX = signal(0);
  readonly playerY = signal(0);
  readonly tiltPermissionState = signal<TiltPermissionState>('unknown');

  readonly taskComplete = computed(
    () => this.playerX() === this.config().cols - 1 && this.playerY() === this.config().rows - 1,
  );
  readonly continueReady = createContinueReadySignal(() => this.taskComplete());

  private tiltListener: ((event: DeviceOrientationEvent) => void) | null = null;
  private baselineBeta: number | null = null;
  private baselineGamma: number | null = null;
  private armedNorthSouth = true;
  private armedEastWest = true;

  ngOnInit(): void {
    this.maze = generateMaze(this.config().cols, this.config().rows);
  }

  ngOnDestroy(): void {
    this.stopTiltListening();
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

  /**
   * Same iOS-gate pattern as HeadingService/MotionService: DeviceOrientation
   * needs an explicit, user-gesture-triggered permission prompt on iOS 13+
   * that can be denied — arrow buttons stay the primary control, this is
   * purely an additive way to steer by physically tilting the phone.
   */
  async enableTilt(): Promise<void> {
    if (typeof DeviceOrientationEvent === 'undefined') {
      this.tiltPermissionState.set('unsupported');
      return;
    }

    const ctor = DeviceOrientationEvent as unknown as DeviceOrientationEventCtorIOS;
    if (typeof ctor.requestPermission === 'function') {
      try {
        const result = await ctor.requestPermission();
        this.tiltPermissionState.set(result === 'granted' ? 'granted' : 'denied');
      } catch {
        this.tiltPermissionState.set('denied');
        return;
      }
    } else {
      // Android and other browsers without the iOS-style permission gate.
      this.tiltPermissionState.set('granted');
    }

    if (this.tiltPermissionState() === 'granted') {
      this.startTiltListening();
    }
  }

  private startTiltListening(): void {
    this.stopTiltListening();
    this.baselineBeta = null;
    this.baselineGamma = null;
    this.armedNorthSouth = true;
    this.armedEastWest = true;

    this.tiltListener = (event: DeviceOrientationEvent) => {
      if (event.beta === null || event.gamma === null) return;

      // Calibrate against however the phone happens to be held when tilt
      // controls are enabled, so "neutral" is whatever pose the player is
      // already in rather than a fixed "flat on a table" assumption.
      if (this.baselineBeta === null || this.baselineGamma === null) {
        this.baselineBeta = event.beta;
        this.baselineGamma = event.gamma;
        return;
      }

      const deltaBeta = event.beta - this.baselineBeta;
      const deltaGamma = event.gamma - this.baselineGamma;

      if (this.armedNorthSouth && Math.abs(deltaBeta) >= TILT_ENGAGE_THRESHOLD) {
        this.move(deltaBeta < 0 ? 'north' : 'south');
        this.armedNorthSouth = false;
      } else if (!this.armedNorthSouth && Math.abs(deltaBeta) < TILT_DISENGAGE_THRESHOLD) {
        this.armedNorthSouth = true;
      }

      if (this.armedEastWest && Math.abs(deltaGamma) >= TILT_ENGAGE_THRESHOLD) {
        this.move(deltaGamma < 0 ? 'west' : 'east');
        this.armedEastWest = false;
      } else if (!this.armedEastWest && Math.abs(deltaGamma) < TILT_DISENGAGE_THRESHOLD) {
        this.armedEastWest = true;
      }
    };

    window.addEventListener('deviceorientation', this.tiltListener);
  }

  private stopTiltListening(): void {
    if (this.tiltListener) {
      window.removeEventListener('deviceorientation', this.tiltListener);
      this.tiltListener = null;
    }
  }
}
