import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-result-popup',
  templateUrl: './result-popup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultPopupComponent {
  readonly finalScore = input.required<number>();

  readonly restart = output<void>();
  readonly exit = output<void>();

  get formattedScore(): string {
    return this.finalScore().toString().padStart(6, '0');
  }
}
