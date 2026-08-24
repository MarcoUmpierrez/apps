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
import {
  BurgerBuildLetterMinigame,
  BurgerIngredientKind,
  Language,
} from '../../scavenger-hunt.types';
import { shuffleArray } from '../../shuffle.util';
import { UiStringKey, translateUi } from '../../ui-strings.data';
import { createContinueReadySignal } from '../continue-ready.util';

const WRONG_FLASH_MS = 900;

const INGREDIENT_INFO: Record<BurgerIngredientKind, { emoji: string; color: string }> = {
  'bun-bottom': { emoji: '🍞', color: '#d9a066' },
  meat: { emoji: '🥩', color: '#8b4513' },
  cheese: { emoji: '🧀', color: '#fbbf24' },
  lettuce: { emoji: '🥬', color: '#65a30d' },
  onion: { emoji: '🧅', color: '#c084fc' },
  'bun-top': { emoji: '🍞', color: '#f2c185' },
};

/** Matches the stack container's fixed h-60 w-32 Tailwind size in px. */
const BOARD_WIDTH = 128;
const BOARD_HEIGHT = 240;
const BITE_RADIUS = 30;
const BITE_ARC_STEPS = 8;
const BITE_SHAKE_MS = 500;
const BITE_PAUSE_MS = 350;

type BiteCorner = 'tl' | 'tr' | 'bl';

/** Corners get bitten one at a time, in this order, as biteCount climbs from 0 to 3. */
const BITE_ORDER: BiteCorner[] = ['tl', 'tr', 'bl'];

/** A quarter-circle notch of `radius` traced at a rectangle corner, ordered so
 * it starts on the edge the clockwise TL→TR→BR→BL polygon traversal arrives
 * on and ends on the edge it continues along. */
function biteArcPoints(corner: BiteCorner, radius: number): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i <= BITE_ARC_STEPS; i++) {
    // TL arrives via the left edge (closing the loop) so it sweeps 90°→0°;
    // TR and BL arrive via the top/bottom edge so they sweep 0°→90°.
    const sweep = corner === 'tl' ? 1 - i / BITE_ARC_STEPS : i / BITE_ARC_STEPS;
    const theta = (Math.PI / 2) * sweep;
    const dx = radius * Math.cos(theta);
    const dy = radius * Math.sin(theta);
    switch (corner) {
      case 'tl':
        points.push([dx, dy]);
        break;
      case 'tr':
        points.push([BOARD_WIDTH - dx, dy]);
        break;
      case 'bl':
        points.push([dx, BOARD_HEIGHT - dy]);
        break;
    }
  }
  return points;
}

function buildBurgerClipPath(bittenCorners: readonly BiteCorner[]): string {
  const bitten = new Set(bittenCorners);
  const points: [number, number][] = [
    ...(bitten.has('tl') ? biteArcPoints('tl', BITE_RADIUS) : [[0, 0] as [number, number]]),
    ...(bitten.has('tr')
      ? biteArcPoints('tr', BITE_RADIUS)
      : [[BOARD_WIDTH, 0] as [number, number]]),
    [BOARD_WIDTH, BOARD_HEIGHT],
    ...(bitten.has('bl')
      ? biteArcPoints('bl', BITE_RADIUS)
      : [[0, BOARD_HEIGHT] as [number, number]]),
  ];

  return `polygon(${points.map(([x, y]) => `${x}px ${y}px`).join(', ')})`;
}

/**
 * Tap tray ingredients in the correct bottom-to-top order to stack the
 * burger — tapping the wrong next ingredient just flashes and leaves the
 * tray untouched (no punishing reset), matching every other letter minigame.
 */
@Component({
  selector: 'app-burger-build-game',
  styleUrl: './burger-build-game.component.css',
  template: `
    <div class="flex w-full max-w-sm flex-col items-center gap-5 text-center">
      @if (!taskComplete()) {
        <p class="font-['Spectral',serif] text-[15px] leading-relaxed text-[#33261a]">{{ t('burgerBuildPrompt') }}</p>
      }

      @if (!letterRevealed()) {
        <div
          class="flex h-60 w-32 flex-col-reverse items-center justify-start gap-1 rounded-2xl border-2 border-amber-300 bg-amber-100/40 p-2"
          [class.burger-shake]="isShaking()"
          [style.clip-path]="burgerClipPath()"
        >
          @for (ingredient of stack(); track $index) {
            <div
              class="flex h-7 w-full shrink-0 items-center justify-center rounded-full text-lg shadow"
              [style.background-color]="info(ingredient).color"
            >
              {{ info(ingredient).emoji }}
            </div>
          }
        </div>
      }

      @if (!taskComplete()) {
        <div class="flex flex-wrap justify-center gap-2">
          @for (ingredient of tray(); track ingredient) {
            <button
              type="button"
              (click)="onTrayTap(ingredient)"
              class="flex h-12 w-12 min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-full border-2 border-amber-300 text-2xl shadow"
              [style.background-color]="info(ingredient).color"
            >
              {{ info(ingredient).emoji }}
            </button>
          }
        </div>

        @if (wrongFlash()) {
          <p class="text-sm font-semibold text-red-700">{{ t('wrongTryAgain') }}</p>
        }

        <button
          type="button"
          (click)="revealNow()"
          class="touch-manipulation text-sm font-semibold text-amber-700 underline underline-offset-2"
        >
          {{ t('giveUp') }}
        </button>
      } @else if (!letterRevealed()) {
        <p class="font-['Caveat',cursive] text-3xl font-bold text-amber-900">
          🎉 {{ t('wellDone') }}
        </p>
        <button
          type="button"
          (click)="onTakeBites()"
          [disabled]="!continueReady() || isBiting()"
          class="min-h-14 w-full touch-manipulation rounded-2xl bg-amber-800 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-amber-900/30 transition-transform active:scale-95 disabled:opacity-40"
        >
          {{ t('continueLabel') }}
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
          class="min-h-14 w-full touch-manipulation border border-[#3a2c1c]/45 py-4 font-['Spectral',serif] text-xs tracking-[.24em] text-[#33261a] uppercase transition-transform active:scale-95"
        >
          {{ t('continueLabel') }}
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BurgerBuildGameComponent implements OnInit, OnDestroy {
  readonly config = input.required<BurgerBuildLetterMinigame>();
  readonly lang = input.required<Language>();
  readonly solved = output<void>();

  readonly stack = signal<BurgerIngredientKind[]>([]);
  readonly tray = signal<BurgerIngredientKind[]>([]);
  readonly wrongFlash = signal(false);
  readonly letterRevealed = signal(false);

  /** How many corners have been bitten off so far, 0 through BITE_ORDER.length. */
  readonly biteCount = signal(0);
  readonly isShaking = signal(false);
  readonly isBiting = signal(false);
  readonly burgerClipPath = computed(() =>
    buildBurgerClipPath(BITE_ORDER.slice(0, this.biteCount())),
  );

  readonly taskComplete = computed(
    () => this.stack().length === this.config().ingredientsInOrder.length,
  );
  readonly continueReady = createContinueReadySignal(() => this.taskComplete());

  private readonly biteTimeoutIds: ReturnType<typeof setTimeout>[] = [];

  ngOnInit(): void {
    this.tray.set(shuffleArray([...this.config().ingredientsInOrder]));
  }

  ngOnDestroy(): void {
    this.biteTimeoutIds.forEach(clearTimeout);
  }

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  notebookMessage(): string {
    return translateUi(this.lang(), 'writeLetterDown', { letter: this.config().letter });
  }

  info(ingredient: BurgerIngredientKind): { emoji: string; color: string } {
    return INGREDIENT_INFO[ingredient];
  }

  onTrayTap(ingredient: BurgerIngredientKind): void {
    if (this.taskComplete()) return;

    const expected = this.config().ingredientsInOrder[this.stack().length];
    if (ingredient !== expected) {
      this.wrongFlash.set(true);
      setTimeout(() => this.wrongFlash.set(false), WRONG_FLASH_MS);
      return;
    }

    this.stack.update((s) => [...s, ingredient]);
    this.tray.update((t) => t.filter((i) => i !== ingredient));
  }

  revealNow(): void {
    this.stack.set([...this.config().ingredientsInOrder]);
    this.tray.set([]);
  }

  onTakeBites(): void {
    if (this.isBiting()) return;
    this.isBiting.set(true);
    this.biteNextCorner();
  }

  private biteNextCorner(): void {
    if (this.biteCount() >= BITE_ORDER.length) {
      this.letterRevealed.set(true);
      return;
    }

    this.biteCount.update((n) => n + 1);
    this.isShaking.set(true);
    this.biteTimeoutIds.push(
      setTimeout(() => {
        this.isShaking.set(false);
        this.biteTimeoutIds.push(setTimeout(() => this.biteNextCorner(), BITE_PAUSE_MS));
      }, BITE_SHAKE_MS),
    );
  }
}
