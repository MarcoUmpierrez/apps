import { Component, output, ChangeDetectionStrategy } from '@angular/core';

export type NumpadKey = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 'C' | 'OK';

@Component({
  selector: 'app-numpad',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-3 gap-2 p-4 bg-slate-900 border-t border-slate-800">
      @for (key of keys; track key) {
        <button
          (click)="keyPressed.emit(key)"
          [class]="buttonClass(key)"
          type="button">
          {{ key }}
        </button>
      }
    </div>
  `,
})
export class NumpadComponent {
  readonly keyPressed = output<NumpadKey>();

  readonly keys: NumpadKey[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'OK'];

  buttonClass(key: NumpadKey): string {
    if (key === 'C')  return 'pp-4 bg-red-950/30 text-red-400 border border-red-900/50 rounded-xl shadow-sm font-bold text-xl active:bg-red-900/50 transition-colors';
    if (key === 'OK') return 'p-4 bg-blue-600 text-white rounded-xl shadow-sm font-bold text-xl active:bg-blue-500 transition-colors';
    return 'p-4 bg-slate-800 text-slate-100 border border-slate-700 rounded-xl shadow-sm font-bold text-xl active:bg-slate-700 transition-colors';
  }
}
