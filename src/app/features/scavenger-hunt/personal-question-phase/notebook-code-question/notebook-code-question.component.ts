import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isAnswerCorrect } from '../../fuzzy-match.util';
import { HintPanelComponent } from '../../hint-panel/hint-panel.component';
import { Language, NotebookCodeQuestion } from '../../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../../ui-strings.data';

@Component({
  selector: 'app-notebook-code-question',
  imports: [FormsModule, HintPanelComponent],
  template: `
    <div class="w-full max-w-sm">
      <p class="mb-2 font-['Spectral',serif] text-[15px] leading-relaxed text-[#33261a]">
        {{ config().question[lang()] }}
      </p>
      <p class="mb-4 font-['Kalam',cursive] text-sm text-[#8a7550]">📓 {{ referencedStopsLabel() }}</p>
      <input
        type="text"
        [(ngModel)]="userInput"
        (keyup.enter)="onSubmit()"
        [placeholder]="t('writeItHere')"
        class="min-h-11 w-full touch-manipulation border-0 border-b border-[#3a2c1c]/40 bg-transparent px-1 py-3 text-center font-['Spectral',serif] text-lg tracking-[.2em] text-[#3a2c1c] uppercase outline-none placeholder:normal-case focus:border-[#3a3f6b]"
      />
      <button
        type="button"
        (click)="onSubmit()"
        class="mt-4 min-h-11 w-full touch-manipulation border border-[#3a2c1c]/45 py-3 font-['Spectral',serif] text-xs tracking-[.2em] text-[#33261a] uppercase transition-transform active:scale-95"
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
export class NotebookCodeQuestionComponent {
  readonly config = input.required<NotebookCodeQuestion>();
  readonly lang = input.required<Language>();
  readonly solved = output<void>();

  readonly attemptCount = signal(0);
  readonly wrongFlash = signal(false);
  userInput = '';

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  referencedStopsLabel(): string {
    const orders = this.config().referencedStopOrders.join(', ');
    return this.lang() === 'es' ? `Paradas: ${orders}` : `Stops: ${orders}`;
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
