import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isAnswerCorrect } from '../../fuzzy-match.util';
import { HintPanelComponent } from '../../hint-panel/hint-panel.component';
import { FreeTextQuestion, Language } from '../../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../../ui-strings.data';

@Component({
  selector: 'app-free-text-question',
  imports: [FormsModule, HintPanelComponent],
  template: `
    <div class="w-full max-w-sm">
      <p class="mb-4 text-lg font-semibold text-amber-900">{{ config().question[lang()] }}</p>
      <input
        type="text"
        [(ngModel)]="userInput"
        (keyup.enter)="onSubmit()"
        class="min-h-11 w-full touch-manipulation rounded-xl border-2 border-amber-300 px-4 py-3 text-center text-lg font-medium text-amber-900"
      />
      <button
        type="button"
        (click)="onSubmit()"
        class="mt-3 min-h-11 w-full touch-manipulation rounded-xl bg-amber-800 py-3 font-bold text-white transition-transform active:scale-95"
      >
        {{ t('submit') }}
      </button>
      @if (wrongFlash()) {
        <p class="mt-2 text-sm font-semibold text-red-700">{{ t('wrongTryAgain') }}</p>
      }
      <app-hint-panel
        [hints]="config().hints"
        [lang]="lang()"
        [attemptCount]="attemptCount()"
        (revealed)="solved.emit()"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FreeTextQuestionComponent {
  readonly config = input.required<FreeTextQuestion>();
  readonly lang = input.required<Language>();
  readonly solved = output<void>();

  readonly attemptCount = signal(0);
  readonly wrongFlash = signal(false);
  userInput = '';

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  onSubmit(): void {
    if (isAnswerCorrect(this.userInput, this.config().acceptedAnswers, this.lang())) {
      this.solved.emit();
      return;
    }
    this.attemptCount.update((n) => n + 1);
    this.wrongFlash.set(true);
    setTimeout(() => this.wrongFlash.set(false), 1200);
  }
}
