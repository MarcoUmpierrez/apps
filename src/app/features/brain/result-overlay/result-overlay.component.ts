import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-result-overlay',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div class="fixed inset-0 bg-slate-950/90 flex items-center justify-center p-6 z-50">
        <div class="bg-slate-800 w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl border border-slate-700">
          <div class="text-5xl mb-4">⏰</div>
          <h2 class="text-2xl font-bold text-slate-100 mb-2">Time's Up!</h2>
          <p class="text-slate-400 mb-6">
            Streak: <span class="font-bold text-blue-400">{{ score() }}</span>.
            Points added to your total!
          </p>
          <button
            (click)="tryAgain.emit()"
            type="button"
            class="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-900/40 hover:bg-blue-500 active:scale-95 transition-all">
            Try Again
          </button>
          <button
            (click)="goMenu.emit()"
            type="button"
            class="w-full mt-3 text-slate-400 font-semibold py-3 rounded-2xl hover:bg-slate-700/50 transition-colors">
            Back to Menu
          </button>
        </div>
      </div>
    }
  `,
})
export class ResultOverlayComponent {
  readonly visible  = input.required<boolean>();
  readonly score    = input.required<number>();
  readonly tryAgain = output<void>();
  readonly goMenu   = output<void>();
}
