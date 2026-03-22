import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-feedback',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .feedback-pop {
      animation: pop 0.4s ease-out forwards;
    }
    @keyframes pop {
      0%   { transform: scale(0.5); opacity: 0; }
      50%  { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(1);   opacity: 0; }
    }
  `],
  template: `
    @if (visible()) {
      <div class="fixed inset-0 pointer-events-none flex items-center justify-center z-40">
        <div class="text-9xl feedback-pop">{{ correct() ? '✅' : '❌' }}</div>
      </div>
    }
  `,
})
export class FeedbackComponent {
  readonly visible = input.required<boolean>();
  readonly correct = input.required<boolean>();
}
