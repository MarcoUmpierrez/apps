import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { HintPanelComponent } from '../../hint-panel/hint-panel.component';
import { Language, RiddleMcMinigame } from '../../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../../ui-strings.data';

@Component({
  selector: 'app-riddle-mc',
  imports: [HintPanelComponent],
  template: `
    <div class="w-full max-w-sm">
      <p class="mb-4 text-lg font-semibold text-amber-900">{{ config().prompt[lang()] }}</p>
      <div class="flex flex-col gap-2">
        @for (option of config().options; track $index) {
          <button
            type="button"
            (click)="onSelect($index)"
            [class.border-amber-800]="selectedIndex() === $index"
            [class.bg-amber-100]="selectedIndex() === $index"
            class="min-h-11 touch-manipulation rounded-xl border-2 border-amber-300 px-4 py-3 text-left font-medium text-amber-900"
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
export class RiddleMcComponent {
  readonly config = input.required<RiddleMcMinigame>();
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
