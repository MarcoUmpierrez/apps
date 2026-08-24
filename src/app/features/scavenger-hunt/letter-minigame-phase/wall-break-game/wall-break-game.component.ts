import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { Language, WallBreakLetterMinigame } from '../../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../../ui-strings.data';
import { createContinueReadySignal } from '../continue-ready.util';

const CHARGE_PER_TAP = 12;
const DECAY_PER_TICK = 2;
const DECAY_INTERVAL_MS = 100;
const SHAKE_DURATION_MS = 500;

interface Brick {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

const ROW_HEIGHT = 20;
const BRICK_COLORS = ['#8c8378', '#7d7468', '#968c7e'];
/** Running-bond brick courses (viewBox 0 0 100 100): full-width bricks on one
 * row, half-bricks at each edge on the next, so the seams stagger like a real
 * wall instead of lining up in a grid. */
const OFFSET_ROW_BRICKS: ReadonlyArray<readonly [x: number, width: number]> = [
  [0, 12.5],
  [12.5, 25],
  [37.5, 25],
  [62.5, 25],
  [87.5, 12.5],
];
const ALIGNED_ROW_BRICKS: ReadonlyArray<readonly [x: number, width: number]> = [
  [0, 25],
  [25, 25],
  [50, 25],
  [75, 25],
];

function buildBricks(): Brick[] {
  const rows = [
    OFFSET_ROW_BRICKS,
    ALIGNED_ROW_BRICKS,
    OFFSET_ROW_BRICKS,
    ALIGNED_ROW_BRICKS,
    OFFSET_ROW_BRICKS,
  ];
  const bricks: Brick[] = [];
  let id = 0;
  for (const [rowIndex, row] of rows.entries()) {
    const y = rowIndex * ROW_HEIGHT;
    for (const [x, width] of row) {
      const color = BRICK_COLORS[id % BRICK_COLORS.length];
      bricks.push({ id, x, y, width, height: ROW_HEIGHT, color });
      id++;
    }
  }
  return bricks;
}

const BRICKS = buildBricks();

interface BrickFall {
  rotateDeg: number;
  driftPx: number;
  delayMs: number;
}

/**
 * Charge decays continuously, so only rapid tapping outpaces it — tapping too
 * slowly just watches the bar drain back down. A "give up" link still fully
 * reveals the letter on demand, same "never truly stuck" rule as every other
 * minigame in this hunt.
 */
@Component({
  selector: 'app-wall-break-game',
  styleUrl: './wall-break-game.component.css',
  template: `
    <div class="flex w-full max-w-sm flex-col items-center gap-5 text-center">
      @if (!taskComplete()) {
        <p class="font-['Spectral',serif] text-[15px] leading-relaxed text-[#33261a]">{{ t('wallBreakPrompt') }}</p>
      }

      <div
        class="wall-frame relative flex h-40 w-40 items-center justify-center rounded-2xl border-2 border-amber-300 shadow-lg shadow-amber-900/20"
        [class.wall-shake]="justHit()"
      >
        <div
          class="absolute inset-0 flex items-center justify-center text-7xl font-black text-amber-900"
          [class.letter-reveal]="taskComplete()"
        >
          {{ config().letter }}
        </div>

        <svg class="brick-wall absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden="true">
          @for (brick of bricks; track brick.id) {
            <rect
              [attr.x]="brick.x + 0.6"
              [attr.y]="brick.y + 0.6"
              [attr.width]="brick.width - 1.2"
              [attr.height]="brick.height - 1.2"
              [attr.fill]="brick.color"
              class="brick"
              [class.brick-fallen]="isFallen(brick.id)"
              [style.--brick-rotate]="(fallOf(brick.id)?.rotateDeg ?? 0) + 'deg'"
              [style.--brick-drift]="(fallOf(brick.id)?.driftPx ?? 0) + 'px'"
              [style.animation-delay.ms]="fallOf(brick.id)?.delayMs ?? 0"
            />
          }
        </svg>
      </div>

      @if (!taskComplete()) {
        <p class="text-sm text-amber-700">{{ hitsLanded() }} / {{ config().hitsRequired }}</p>

        <div
          class="h-4 w-full max-w-xs overflow-hidden rounded-full border-2 border-amber-300 bg-amber-100"
        >
          <div
            class="h-full rounded-full bg-amber-600 transition-[width] duration-150 ease-out"
            [style.width.%]="charge()"
          ></div>
        </div>

        @if (charge() >= 100) {
          <button
            type="button"
            (click)="onHit()"
            class="min-h-14 w-full touch-manipulation rounded-2xl bg-red-800 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-red-900/30 transition-transform active:scale-95"
          >
            {{ t('hitIt') }}
          </button>
        } @else {
          <button
            type="button"
            (click)="onCharge()"
            class="min-h-14 w-full touch-manipulation rounded-2xl bg-amber-800 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-amber-900/30 transition-transform active:scale-95"
          >
            {{ t('chargeIt') }}
          </button>
        }

        <button
          type="button"
          (click)="revealNow()"
          class="touch-manipulation text-sm font-semibold text-amber-700 underline underline-offset-2"
        >
          {{ t('giveUp') }}
        </button>
      } @else {
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
export class WallBreakGameComponent implements OnDestroy {
  readonly config = input.required<WallBreakLetterMinigame>();
  readonly lang = input.required<Language>();
  readonly solved = output<void>();

  readonly charge = signal(0);
  readonly hitsLanded = signal(0);
  readonly justHit = signal(false);

  readonly taskComplete = computed(() => this.hitsLanded() >= this.config().hitsRequired);
  readonly bricks = BRICKS;

  /** Bricks that have fallen so far, each with its own randomized tumble —
   * the letter behind the wall shows through wherever a brick is missing. */
  readonly fallenBricks = signal<ReadonlyMap<number, BrickFall>>(new Map());

  /** Stays disabled for a beat after the wall breaks so a furious last tap can't skip the reveal. */
  readonly continueReady = createContinueReadySignal(() => this.taskComplete());

  private readonly decayIntervalId = setInterval(() => {
    if (this.taskComplete()) return;
    this.charge.update((c) => Math.max(0, c - DECAY_PER_TICK));
  }, DECAY_INTERVAL_MS);
  private shakeTimeoutId: ReturnType<typeof setTimeout> | null = null;

  ngOnDestroy(): void {
    clearInterval(this.decayIntervalId);
    if (this.shakeTimeoutId) clearTimeout(this.shakeTimeoutId);
  }

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  notebookMessage(): string {
    return translateUi(this.lang(), 'writeLetterDown', { letter: this.config().letter });
  }

  isFallen(brickId: number): boolean {
    return this.fallenBricks().has(brickId);
  }

  fallOf(brickId: number): BrickFall | undefined {
    return this.fallenBricks().get(brickId);
  }

  onCharge(): void {
    if (this.taskComplete()) return;
    this.charge.update((c) => Math.min(100, c + CHARGE_PER_TAP));
  }

  onHit(): void {
    if (this.taskComplete() || this.charge() < 100) return;
    this.charge.set(0);
    this.hitsLanded.update((h) => h + 1);
    this.dropBricksForStage(this.hitsLanded());

    this.justHit.set(true);
    if (this.shakeTimeoutId) clearTimeout(this.shakeTimeoutId);
    this.shakeTimeoutId = setTimeout(() => this.justHit.set(false), SHAKE_DURATION_MS);
  }

  revealNow(): void {
    this.charge.set(0);
    this.hitsLanded.set(this.config().hitsRequired);
    this.dropBricksForStage(this.config().hitsRequired);
  }

  /**
   * Drops a random subset of whatever bricks are still standing. Earlier
   * stages leave enough behind for future stages to have something to drop;
   * the final stage always clears whatever remains, guaranteeing an empty
   * wall once the task is complete.
   */
  private dropBricksForStage(stage: number): void {
    const hitsRequired = this.config().hitsRequired;
    const fallen = this.fallenBricks();
    const remainingIds = this.bricks.map((b) => b.id).filter((id) => !fallen.has(id));
    if (remainingIds.length === 0) return;

    const stagesLeftAfterThis = hitsRequired - stage;
    let count: number;
    if (stagesLeftAfterThis <= 0) {
      count = remainingIds.length;
    } else {
      const avg = remainingIds.length / (stagesLeftAfterThis + 1);
      const min = Math.max(1, Math.floor(avg * 0.5));
      const maxLeavingEnoughForLaterStages = remainingIds.length - stagesLeftAfterThis;
      const max = Math.max(min, Math.min(maxLeavingEnoughForLaterStages, Math.ceil(avg * 1.5)));
      count = min + Math.floor(Math.random() * (max - min + 1));
    }

    const shuffled = [...remainingIds].sort(() => Math.random() - 0.5);
    const toDrop = shuffled.slice(0, count);

    const next = new Map(fallen);
    toDrop.forEach((id, i) => {
      next.set(id, {
        rotateDeg: (Math.random() - 0.5) * 140,
        driftPx: (Math.random() - 0.5) * 60,
        delayMs: i * 35,
      });
    });
    this.fallenBricks.set(next);
  }
}
