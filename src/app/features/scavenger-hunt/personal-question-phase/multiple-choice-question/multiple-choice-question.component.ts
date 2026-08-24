import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { HintPanelComponent } from '../../hint-panel/hint-panel.component';
import { Language, MultipleChoiceQuestion } from '../../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../../ui-strings.data';

@Component({
  selector: 'app-multiple-choice-question',
  imports: [HintPanelComponent],
  template: `
    <div class="w-full max-w-sm">
      <p class="mb-4 font-['Spectral',serif] text-[15px] leading-relaxed text-[#33261a]">
        {{ config().question[lang()] }}
      </p>
      <div class="flex flex-col gap-2">
        @for (option of config().options; track $index) {
          <button
            type="button"
            (click)="onSelect($index)"
            class="min-h-11 touch-manipulation rounded-sm border px-4 py-3 text-left font-['Spectral',serif] text-[15px] transition-colors"
            [class]="
              selectedIndex() === $index
                ? 'border-[#3a3f6b] bg-[#3a3f6b]/10 text-[#3a3f6b]'
                : 'border-[#3a2c1c]/25 text-[#33261a]'
            "
          >
            {{ option[lang()] }}
          </button>
        }
      </div>
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
export class MultipleChoiceQuestionComponent {
  readonly config = input.required<MultipleChoiceQuestion>();
  readonly lang = input.required<Language>();
  readonly solved = output<void>();

  readonly selectedIndex = signal<number | null>(null);
  readonly attemptCount = signal(0);
  readonly wrongFlash = signal(false);

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  onSelect(index: number): void {
    this.selectedIndex.set(index);
    if (index === this.config().correctIndex) {
      this.solved.emit();
      return;
    }
    this.attemptCount.update((n) => n + 1);
    this.wrongFlash.set(true);
    setTimeout(() => this.wrongFlash.set(false), 1200);
  }
}
