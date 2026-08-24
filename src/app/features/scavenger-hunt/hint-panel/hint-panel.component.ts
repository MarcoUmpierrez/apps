import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { HintTriplet, Language } from '../scavenger-hunt.types';
import { translateUi } from '../ui-strings.data';

const LEVEL_1_ATTEMPTS = 2;
const LEVEL_1_SECONDS = 45;
const LEVEL_2_ATTEMPTS = 4;
const LEVEL_2_SECONDS = 120;
const LEVEL_3_ATTEMPTS = 6;
const LEVEL_3_SECONDS = 240;

/**
 * Escalating hint system shared by every minigame and personal question.
 * The "Need a hint?" button is always enabled — never disabled/greyed — and
 * level 3 hands over the literal answer alongside a "Got it!" button that
 * completes the phase, so nothing here can ever leave her truly stuck.
 */
@Component({
  selector: 'app-hint-panel',
  template: `
    <div class="mt-4">
      <button
        type="button"
        (click)="showHint.set(true)"
        class="block w-full touch-manipulation font-['Kalam',cursive] text-sm text-[#8a7550] underline underline-offset-2"
        [class]="align() === 'center' ? 'text-center' : align() === 'right' ? 'text-right' : 'text-left'"
      >
        {{ needHintLabel() }}
      </button>
      @if (showHint()) {
        <div
          class="mt-2 border border-dashed border-[#3a2c1c]/25 p-3 font-['Kalam',cursive] text-sm text-[#7d6a4a]"
        >
          <p>{{ hintLevel() === 0 ? comingSoonLabel() : currentHintText() }}</p>
          @if (hintLevel() === 3) {
            <button
              type="button"
              (click)="revealed.emit()"
              class="mt-3 w-full touch-manipulation rounded-sm bg-[#3a3f6b] py-2 font-['Spectral',serif] text-xs tracking-[.15em] text-[#e9dec5] uppercase transition-transform active:scale-95"
            >
              {{ gotItLabel() }}
            </button>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HintPanelComponent implements OnDestroy {
  readonly hints = input.required<HintTriplet>();
  readonly lang = input.required<Language>();
  readonly attemptCount = input<number>(0);
  readonly align = input<'left' | 'center' | 'right'>('center');
  readonly revealed = output<void>();

  readonly showHint = signal(false);
  readonly elapsedSeconds = signal(0);

  private readonly intervalId: ReturnType<typeof setInterval>;

  readonly hintLevel = computed(() => {
    const attempts = this.attemptCount();
    const seconds = this.elapsedSeconds();
    if (attempts >= LEVEL_3_ATTEMPTS || seconds >= LEVEL_3_SECONDS) return 3;
    if (attempts >= LEVEL_2_ATTEMPTS || seconds >= LEVEL_2_SECONDS) return 2;
    if (attempts >= LEVEL_1_ATTEMPTS || seconds >= LEVEL_1_SECONDS) return 1;
    return 0;
  });

  readonly currentHintText = computed(() => {
    const level = this.hintLevel();
    if (level === 0) return '';
    return this.hints()[level - 1][this.lang()];
  });

  readonly needHintLabel = computed(() => translateUi(this.lang(), 'needHint'));
  readonly comingSoonLabel = computed(() => translateUi(this.lang(), 'hintComingSoon'));
  readonly gotItLabel = computed(() => translateUi(this.lang(), 'gotIt'));

  constructor() {
    this.intervalId = setInterval(() => this.elapsedSeconds.update((s) => s + 1), 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
