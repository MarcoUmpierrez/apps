import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { MotionService } from '../../services/motion.service';
import { Language, ShakeToRevealMinigame } from '../../scavenger-hunt.types';
import { shuffleArray } from '../../shuffle.util';
import { UiStringKey, translateUi } from '../../ui-strings.data';

const GRID_COLS = 10;
const GRID_ROWS = 10;
/** >1 so adjacent circular dots overlap enough to fully hide the photo underneath, corners included. */
const DOT_SIZE_PCT = (100 / Math.max(GRID_COLS, GRID_ROWS)) * 1.45;
/** Min travel distance comfortably exceeds half the container's width, so every grain flies past its edge. */
const FALL_MIN_PX = 90;
const FALL_RANGE_PX = 60;

interface SandDot {
  id: number;
  leftPct: number;
  topPct: number;
  fallX: number;
  fallY: number;
  fallRotation: number;
}

function createSandDots(): SandDot[] {
  const dots: SandDot[] = [];
  let id = 0;
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const leftPct = (col / GRID_COLS) * 100;
      const topPct = (row / GRID_ROWS) * 100;

      // Fly outward away from the image center, with a little angular jitter
      // so the scatter looks natural rather than a perfect starburst.
      const dx = leftPct - 50;
      const dy = topPct - 50;
      const magnitude = Math.sqrt(dx * dx + dy * dy) || 1;
      const jitter = (Math.random() - 0.5) * 0.6;
      const cos = Math.cos(jitter);
      const sin = Math.sin(jitter);
      const dirX = (dx / magnitude) * cos - (dy / magnitude) * sin;
      const dirY = (dx / magnitude) * sin + (dy / magnitude) * cos;
      const distance = FALL_MIN_PX + Math.random() * FALL_RANGE_PX;

      dots.push({
        id: id++,
        leftPct,
        topPct,
        fallX: dirX * distance,
        fallY: dirY * distance,
        fallRotation: (Math.random() * 2 - 1) * 120,
      });
    }
  }
  return dots;
}

/**
 * Always renders a manual button regardless of MotionService's
 * permissionState — iOS gates DeviceMotion behind a prompt that can be
 * denied, and that can never be allowed to block progress. Each real shake
 * (or manual tap, as a stand-in for shaking) knocks a batch of sand dots off
 * the chapter photo; the puzzle is solved once every dot has fallen away.
 */
@Component({
  selector: 'app-shake-to-reveal',
  styleUrl: './shake-to-reveal.component.css',
  template: `
    <div class="w-full max-w-sm text-center">
      <p class="mb-4 font-['Spectral',serif] text-[15px] leading-relaxed text-[#33261a]">{{ config().prompt[lang()] }}</p>

      @if (chapterImage(); as image) {
        <div class="relative mx-auto mb-4 aspect-square w-40">
          <img
            [src]="image"
            alt=""
            class="absolute inset-0 h-full w-full rounded-sm border-4 border-[#e9dec0] object-cover shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
          />
          @for (dot of sandDots; track dot.id) {
            <span
              class="sand-dot absolute rounded-full bg-[#a3906c]"
              [style.left.%]="dot.leftPct"
              [style.top.%]="dot.topPct"
              [style.width.%]="dotSizePct"
              [style.height.%]="dotSizePct"
              [style.--fall-x]="dot.fallX + 'px'"
              [style.--fall-y]="dot.fallY + 'px'"
              [style.--fall-rot]="dot.fallRotation + 'deg'"
              [class.fallen]="fallenIds().has(dot.id)"
            ></span>
          }
        </div>

        @if (!allCleared()) {
          <p class="mb-4 font-['Kalam',cursive] text-[15px] text-[#8a7550] italic">
            {{ t('shakeToRevealPrompt') }}
          </p>
          @if (motion.permissionState() === 'unknown' || motion.permissionState() === 'denied') {
            <button
              type="button"
              (click)="onEnableMotion()"
              class="mb-4 min-h-11 touch-manipulation border border-[#3a2c1c]/45 px-5 py-2 font-['Spectral',serif] text-xs tracking-[.15em] text-[#33261a] uppercase"
            >
              {{ t('enableMotion') }}
            </button>
          }
          <button
            type="button"
            (click)="clearBatch()"
            class="min-h-11 touch-manipulation border border-[#3a2c1c]/45 px-6 py-3 font-['Spectral',serif] text-xs tracking-[.2em] text-[#33261a] uppercase transition-transform active:scale-95"
          >
            {{ t('simulateShake') }}
          </button>
        } @else {
          <p class="mb-4 font-['Caveat',cursive] text-3xl text-[#3a3f6b]">
            {{ config().revealedWord[lang()] }}
          </p>
          <button
            type="button"
            (click)="solved.emit()"
            class="min-h-11 touch-manipulation border border-[#3a2c1c]/45 px-6 py-3 font-['Spectral',serif] text-xs tracking-[.2em] text-[#33261a] uppercase transition-transform active:scale-95"
          >
            {{ t('continueLabel') }}
          </button>
        }
      } @else {
        @if (!revealed()) {
          <p class="mb-4 font-['Kalam',cursive] text-[15px] text-[#8a7550] italic">
            {{ t('shakeToRevealPrompt') }}
          </p>
          <div class="mb-4 text-6xl">📳</div>
          @if (motion.permissionState() === 'unknown' || motion.permissionState() === 'denied') {
            <button
              type="button"
              (click)="onEnableMotion()"
              class="mb-4 min-h-11 touch-manipulation border border-[#3a2c1c]/45 px-5 py-2 font-['Spectral',serif] text-xs tracking-[.15em] text-[#33261a] uppercase"
            >
              {{ t('enableMotion') }}
            </button>
          }
          <button
            type="button"
            (click)="revealed.set(true)"
            class="min-h-11 touch-manipulation border border-[#3a2c1c]/45 px-6 py-3 font-['Spectral',serif] text-xs tracking-[.2em] text-[#33261a] uppercase transition-transform active:scale-95"
          >
            {{ t('revealIt') }}
          </button>
        } @else {
          <div class="mb-4 text-4xl">✨</div>
          <p class="mb-4 font-['Caveat',cursive] text-3xl text-[#3a3f6b]">
            {{ config().revealedWord[lang()] }}
          </p>
          <button
            type="button"
            (click)="solved.emit()"
            class="min-h-11 touch-manipulation border border-[#3a2c1c]/45 px-6 py-3 font-['Spectral',serif] text-xs tracking-[.2em] text-[#33261a] uppercase transition-transform active:scale-95"
          >
            {{ t('continueLabel') }}
          </button>
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShakeToRevealComponent implements OnInit, OnDestroy {
  readonly config = input.required<ShakeToRevealMinigame>();
  readonly lang = input.required<Language>();
  readonly chapterImage = input<string | undefined>(undefined);
  readonly solved = output<void>();

  protected readonly motion = inject(MotionService);

  /** Only used when there's no chapterImage to decompose into sand dots. */
  readonly revealed = signal(false);

  readonly sandDots = createSandDots();
  readonly dotSizePct = DOT_SIZE_PCT;
  readonly fallenIds = signal<ReadonlySet<number>>(new Set());
  readonly allCleared = computed(() => this.fallenIds().size >= this.sandDots.length);

  private readonly fallOrder = shuffleArray(this.sandDots.map((dot) => dot.id));
  private fallCursor = 0;
  private readonly batchSize = Math.max(2, Math.ceil(this.sandDots.length / 8));

  ngOnInit(): void {
    this.motion.startListening(() => this.clearBatch());
  }

  ngOnDestroy(): void {
    this.motion.stopListening();
  }

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  async onEnableMotion(): Promise<void> {
    await this.motion.requestPermission();
  }

  clearBatch(): void {
    if (this.fallCursor >= this.fallOrder.length) return;

    const nextIds = this.fallOrder.slice(this.fallCursor, this.fallCursor + this.batchSize);
    this.fallCursor += nextIds.length;

    const next = new Set(this.fallenIds());
    for (const id of nextIds) next.add(id);
    this.fallenIds.set(next);
  }
}
