import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { MotionService } from '../../services/motion.service';
import { Language, ShakeToRevealMinigame } from '../../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../../ui-strings.data';

/**
 * Always renders a manual "Reveal it" button regardless of MotionService's
 * permissionState — iOS gates DeviceMotion behind a prompt that can be
 * denied, and that can never be allowed to block progress.
 */
@Component({
  selector: 'app-shake-to-reveal',
  template: `
    <div class="w-full max-w-sm text-center">
      <p class="mb-4 text-lg font-semibold text-amber-900">{{ config().prompt[lang()] }}</p>

      @if (!revealed()) {
        <p class="mb-4 text-amber-700">{{ t('shakeToRevealPrompt') }}</p>
        <div class="mb-4 text-6xl">📳</div>
        @if (motion.permissionState() === 'unknown' || motion.permissionState() === 'denied') {
          <button
            type="button"
            (click)="onEnableMotion()"
            class="mb-4 min-h-11 touch-manipulation rounded-xl border-2 border-amber-700 px-5 py-2 font-semibold text-amber-800"
          >
            {{ t('enableMotion') }}
          </button>
        }
        <div>
          <button
            type="button"
            (click)="revealed.set(true)"
            class="min-h-11 touch-manipulation rounded-xl bg-amber-800 px-6 py-3 font-bold text-white transition-transform active:scale-95"
          >
            {{ t('revealIt') }}
          </button>
        </div>
      } @else {
        <div class="mb-4 text-4xl">✨</div>
        <p class="mb-4 text-2xl font-black text-amber-900">{{ config().revealedWord[lang()] }}</p>
        <button
          type="button"
          (click)="solved.emit()"
          class="min-h-11 touch-manipulation rounded-xl bg-amber-800 px-6 py-3 font-bold text-white transition-transform active:scale-95"
        >
          {{ t('continueLabel') }}
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShakeToRevealComponent implements OnInit, OnDestroy {
  readonly config = input.required<ShakeToRevealMinigame>();
  readonly lang = input.required<Language>();
  readonly solved = output<void>();

  protected readonly motion = inject(MotionService);
  readonly revealed = signal(false);

  ngOnInit(): void {
    this.motion.startListening(() => this.revealed.set(true));
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
}
