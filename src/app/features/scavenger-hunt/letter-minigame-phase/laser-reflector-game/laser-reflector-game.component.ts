import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  LaserDirection,
  LaserReflectorLetterMinigame,
  Language,
  MirrorOrientation,
} from '../../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../../ui-strings.data';

const CELL_SIZE_PX = 38;

const DIR_VECTOR: Record<LaserDirection, [number, number]> = {
  north: [-1, 0],
  south: [1, 0],
  east: [0, 1],
  west: [0, -1],
};

const DIR_ARROW_DEG: Record<LaserDirection, number> = { north: 0, east: 90, south: 180, west: 270 };

/** "\" mirror: a beam entering from one arm exits the perpendicular arm on the same side. */
const REFLECT_45: Record<LaserDirection, LaserDirection> = {
  east: 'south',
  south: 'east',
  west: 'north',
  north: 'west',
};

/** "/" mirror: the other diagonal. */
const REFLECT_135: Record<LaserDirection, LaserDirection> = {
  east: 'north',
  north: 'east',
  west: 'south',
  south: 'west',
};

/**
 * Orientation doubles as the CSS `rotate()` angle drawn on the mirror bar, so
 * the physics always matches what's on screen: 0/90 are flat mirrors that
 * bounce a perpendicular beam straight back and let a parallel beam pass
 * through untouched; 45/135 redirect the beam a quarter turn.
 */
function reflect(dir: LaserDirection, orientation: MirrorOrientation): LaserDirection {
  if (orientation === 45) return REFLECT_45[dir];
  if (orientation === 135) return REFLECT_135[dir];
  if (orientation === 0) return dir === 'north' ? 'south' : dir === 'south' ? 'north' : dir;
  return dir === 'east' ? 'west' : dir === 'west' ? 'east' : dir;
}

type CellKind = 'empty' | 'mirror' | 'emitter' | 'target';
interface CellInfo {
  kind: CellKind;
  mirrorIndex?: number;
}
interface GridPoint {
  row: number;
  col: number;
}

function traceBeam(
  cfg: LaserReflectorLetterMinigame,
  orientations: MirrorOrientation[],
): { path: GridPoint[]; hitTarget: boolean } {
  const mirrorAt = new Map<string, MirrorOrientation>();
  cfg.mirrors.forEach((m, i) => mirrorAt.set(`${m.row},${m.col}`, orientations[i]));

  let { row, col } = cfg.emitter;
  let dir = cfg.emitter.direction;
  const path: GridPoint[] = [{ row, col }];
  const maxSteps = cfg.rows * cfg.cols * 4;

  for (let step = 0; step < maxSteps; step++) {
    const [dr, dc] = DIR_VECTOR[dir];
    row += dr;
    col += dc;
    if (row < 0 || row >= cfg.rows || col < 0 || col >= cfg.cols) {
      return { path, hitTarget: false };
    }
    path.push({ row, col });
    if (row === cfg.target.row && col === cfg.target.col) {
      return { path, hitTarget: true };
    }
    const orientation = mirrorAt.get(`${row},${col}`);
    if (orientation !== undefined) dir = reflect(dir, orientation);
  }
  return { path, hitTarget: false };
}

function pathPixelLength(path: GridPoint[], cellSize: number): number {
  let length = 0;
  for (let i = 1; i < path.length; i++) {
    const dx = (path[i].col - path[i - 1].col) * cellSize;
    const dy = (path[i].row - path[i - 1].row) * cellSize;
    length += Math.hypot(dx, dy);
  }
  return length;
}

/**
 * Tap-to-rotate mirrors (45° per tap, cycling 0→45→90→135→0), redirecting a
 * laser from a fixed emitter onto a fixed target. The beam is re-traced from
 * scratch on every tap so the player gets live visual feedback. Each mirror
 * always starts 90° off from its solution (guaranteed-wrong, deterministic),
 * so the puzzle data only needs to encode the solved state.
 */
@Component({
  selector: 'app-laser-reflector-game',
  template: `
    <div class="flex w-full max-w-sm flex-col items-center gap-5 text-center">
      @if (!taskComplete()) {
        <p class="text-lg font-semibold text-amber-900">{{ t('laserReflectorPrompt') }}</p>

        <div
          class="relative rounded-xl border-2 border-amber-800 bg-amber-50"
          [style.width.px]="config().cols * cellSize"
          [style.height.px]="config().rows * cellSize"
        >
          @for (row of grid; track $index; let y = $index) {
            @for (cell of row; track $index; let x = $index) {
              <div
                class="absolute box-border flex items-center justify-center border border-amber-200"
                [style.left.px]="x * cellSize"
                [style.top.px]="y * cellSize"
                [style.width.px]="cellSize"
                [style.height.px]="cellSize"
              >
                @if (cell.kind === 'mirror') {
                  <button
                    type="button"
                    (click)="onMirrorTap(cell.mirrorIndex!)"
                    class="flex h-full w-full touch-manipulation items-center justify-center"
                  >
                    <div
                      class="h-1 w-7 rounded-full bg-sky-700"
                      [style.transform]="'rotate(' + orientations()[cell.mirrorIndex!] + 'deg)'"
                    ></div>
                  </button>
                } @else if (cell.kind === 'emitter') {
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class="h-5 w-5 text-red-700"
                    [style.transform]="'rotate(' + emitterArrowDeg + 'deg)'"
                    style="transform-origin: 12px 12px"
                  >
                    <path d="M12 5 L19 16 L5 16 Z" />
                  </svg>
                } @else if (cell.kind === 'target') {
                  <span class="text-xl">🎯</span>
                }
              </div>
            }
          }

          <svg
            class="pointer-events-none absolute inset-0"
            [style.width.px]="config().cols * cellSize"
            [style.height.px]="config().rows * cellSize"
          >
            <polyline
              #beamLine
              [attr.points]="beamPoints()"
              fill="none"
              [attr.stroke]="beamColor()"
              [style.filter]="
                'drop-shadow(0 0 3px ' + beamColor() + ') drop-shadow(0 0 8px ' + beamColor() + ')'
              "
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
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
export class LaserReflectorGameComponent implements OnInit {
  readonly config = input.required<LaserReflectorLetterMinigame>();
  readonly lang = input.required<Language>();
  readonly solved = output<void>();

  readonly cellSize = CELL_SIZE_PX;
  grid: CellInfo[][] = [];
  emitterArrowDeg = 0;

  private readonly beamLine = viewChild<ElementRef<SVGPolylineElement>>('beamLine');

  readonly orientations = signal<MirrorOrientation[]>([]);

  readonly beam = computed(() => traceBeam(this.config(), this.orientations()));
  readonly taskComplete = computed(() => this.beam().hitTarget);
  readonly beamColor = computed(() => (this.beam().hitTarget ? '#16a34a' : '#dc2626'));

  constructor() {
    /** Every re-trace "draws" the beam in from the emitter via a
     * stroke-dasharray/dashoffset animation, rather than snapping instantly
     * to the new path — set the line fully hidden with transitions off,
     * force a reflow, then re-enable the transition and reveal it. */
    effect(() => {
      const length = pathPixelLength(this.beam().path, this.cellSize);
      const el = this.beamLine()?.nativeElement;
      if (!el) return;

      el.style.transition = 'none';
      el.style.strokeDasharray = `${length}`;
      el.style.strokeDashoffset = `${length}`;
      el.getBoundingClientRect();
      requestAnimationFrame(() => {
        el.style.transition = 'stroke-dashoffset 400ms ease-out';
        el.style.strokeDashoffset = '0';
      });
    });
  }

  beamPoints(): string {
    return this.beam()
      .path.map((p) => `${p.col * this.cellSize + this.cellSize / 2},${p.row * this.cellSize + this.cellSize / 2}`)
      .join(' ');
  }

  ngOnInit(): void {
    const cfg = this.config();
    const grid: CellInfo[][] = Array.from({ length: cfg.rows }, () =>
      Array.from({ length: cfg.cols }, () => ({ kind: 'empty' as CellKind })),
    );
    grid[cfg.emitter.row][cfg.emitter.col] = { kind: 'emitter' };
    grid[cfg.target.row][cfg.target.col] = { kind: 'target' };
    cfg.mirrors.forEach((m, i) => {
      grid[m.row][m.col] = { kind: 'mirror', mirrorIndex: i };
    });
    this.grid = grid;
    this.emitterArrowDeg = DIR_ARROW_DEG[cfg.emitter.direction];

    this.orientations.set(
      cfg.mirrors.map((m) => (((m.orientation + 90) % 180) as MirrorOrientation)),
    );
  }

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  notebookMessage(): string {
    return translateUi(this.lang(), 'writeLetterDown', { letter: this.config().letter });
  }

  onMirrorTap(index: number): void {
    if (this.taskComplete()) return;
    this.orientations.update((orients) => {
      const next = [...orients];
      next[index] = (((next[index] + 45) % 180) as MirrorOrientation);
      return next;
    });
  }

  revealNow(): void {
    this.orientations.set(this.config().mirrors.map((m) => m.orientation));
  }
}
