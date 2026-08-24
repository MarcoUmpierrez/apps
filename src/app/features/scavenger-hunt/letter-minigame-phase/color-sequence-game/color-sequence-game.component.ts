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
import { ColorSequenceLetterMinigame, Language } from '../../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../../ui-strings.data';
import { createContinueReadySignal } from '../continue-ready.util';

type TileColor = 'red' | 'blue' | 'green' | 'yellow';

const PALETTE: TileColor[] = ['red', 'blue', 'green', 'yellow'];
const TILE_HEX: Record<TileColor, string> = {
  red: '#dc2626',
  blue: '#2563eb',
  green: '#16a34a',
  yellow: '#eab308',
};
const TILE_HEX_LIT: Record<TileColor, string> = {
  red: '#fca5a5',
  blue: '#93c5fd',
  green: '#86efac',
  yellow: '#fde047',
};

const FLASH_ON_MS = 500;
const FLASH_GAP_MS = 250;
const PRE_SHOW_DELAY_MS = 600;
const TAP_FLASH_MS = 200;
const POST_ROUND_PAUSE_MS = 900;
const WRONG_FLASH_MS = 900;

/**
 * Simon-Says style: each round plays a random color sequence one tile at a
 * time, then the player taps it back. A wrong tap doesn't regenerate the
 * sequence or reset progress across rounds — it just replays the same
 * sequence again so the player can keep studying it, matching the "never
 * truly stuck" spirit of every other letter minigame.
 */
@Component({
  selector: 'app-color-sequence-game',
  template: `
    <div class="flex w-full max-w-sm flex-col items-center gap-5 text-center">
      @if (!taskComplete()) {
        <p class="font-['Spectral',serif] text-[15px] leading-relaxed text-[#33261a]">{{ t('colorSequencePrompt') }}</p>
        <p class="text-sm text-amber-700">{{ roundIndex() + 1 }} / {{ config().roundLengths.length }}</p>

        <div class="grid grid-cols-2 gap-3">
          @for (color of palette; track color) {
            <button
              type="button"
              (click)="onTileTap(color)"
              [disabled]="phase() !== 'input'"
              class="h-24 w-24 touch-manipulation rounded-2xl border-4 border-white shadow-lg transition-[background-color,transform] duration-150"
              [class.scale-95]="activeFlash() === color"
              [style.background-color]="activeFlash() === color ? tileHexLit(color) : tileHex(color)"
            ></button>
          }
        </div>

        @if (wrongFlash()) {
          <p class="text-sm font-semibold text-red-700">{{ t('wrongTryAgain') }}</p>
        } @else if (phase() === 'showing') {
          <p class="text-sm text-amber-700">{{ t('watchSequence') }}</p>
        } @else {
          <p class="text-sm text-amber-700">{{ t('yourTurn') }}</p>
        }

        <button
          type="button"
          (click)="revealNow()"
          class="touch-manipulation text-sm font-semibold text-amber-700 underline underline-offset-2"
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
export class ColorSequenceGameComponent implements OnInit, OnDestroy {
  readonly config = input.required<ColorSequenceLetterMinigame>();
  readonly lang = input.required<Language>();
  readonly solved = output<void>();

  readonly palette = PALETTE;

  readonly roundIndex = signal(0);
  readonly sequence = signal<TileColor[]>([]);
  readonly playerIndex = signal(0);
  readonly phase = signal<'showing' | 'input'>('showing');
  readonly activeFlash = signal<TileColor | null>(null);
  readonly wrongFlash = signal(false);

  readonly taskComplete = computed(() => this.roundIndex() >= this.config().roundLengths.length);
  readonly continueReady = createContinueReadySignal(() => this.taskComplete());

  private readonly timeoutIds: ReturnType<typeof setTimeout>[] = [];

  ngOnInit(): void {
    this.startRound(0);
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  notebookMessage(): string {
    return translateUi(this.lang(), 'writeLetterDown', { letter: this.config().letter });
  }

  tileHex(color: TileColor): string {
    return TILE_HEX[color];
  }

  tileHexLit(color: TileColor): string {
    return TILE_HEX_LIT[color];
  }

  onTileTap(color: TileColor): void {
    if (this.phase() !== 'input' || this.taskComplete()) return;

    this.flashTile(color, TAP_FLASH_MS);

    const expected = this.sequence()[this.playerIndex()];
    if (color !== expected) {
      this.wrongFlash.set(true);
      this.addTimer(() => {
        this.wrongFlash.set(false);
        this.playerIndex.set(0);
        this.playSequence(this.sequence());
      }, WRONG_FLASH_MS);
      return;
    }

    const nextIndex = this.playerIndex() + 1;
    this.playerIndex.set(nextIndex);

    if (nextIndex === this.sequence().length) {
      const nextRound = this.roundIndex() + 1;
      this.addTimer(() => {
        this.roundIndex.set(nextRound);
        if (nextRound < this.config().roundLengths.length) this.startRound(nextRound);
      }, POST_ROUND_PAUSE_MS);
    }
  }

  revealNow(): void {
    this.clearTimers();
    this.roundIndex.set(this.config().roundLengths.length);
  }

  private startRound(index: number): void {
    const length = this.config().roundLengths[index];
    const seq = Array.from(
      { length },
      () => this.palette[Math.floor(Math.random() * this.palette.length)],
    );
    this.sequence.set(seq);
    this.playerIndex.set(0);
    this.playSequence(seq);
  }

  private playSequence(seq: TileColor[]): void {
    this.clearTimers();
    this.phase.set('showing');
    let delay = PRE_SHOW_DELAY_MS;

    seq.forEach((color) => {
      this.addTimer(() => this.flashTile(color, FLASH_ON_MS), delay);
      delay += FLASH_ON_MS + FLASH_GAP_MS;
    });

    this.addTimer(() => this.phase.set('input'), delay);
  }

  private flashTile(color: TileColor, durationMs: number): void {
    this.activeFlash.set(color);
    this.addTimer(() => this.activeFlash.set(null), durationMs);
  }

  private addTimer(fn: () => void, delayMs: number): void {
    this.timeoutIds.push(setTimeout(fn, delayMs));
  }

  private clearTimers(): void {
    this.timeoutIds.forEach((id) => clearTimeout(id));
    this.timeoutIds.length = 0;
  }
}
