import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-timer-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-2 bg-slate-800 overflow-hidden">
      <div
        class="h-full ease-linear transition-colors duration-300"
        [class]="barColor()"
        [style.width.%]="percentage()">
      </div>
    </div>
  `,
})
export class TimerBarComponent {
  readonly timeLeft = input.required<number>();
  readonly maxTime  = input.required<number>();

  readonly percentage = computed(() =>
    Math.max(0, (this.timeLeft() / this.maxTime()) * 100)
  );

  readonly barColor = computed(() =>
    this.percentage() < 30 ? 'bg-red-500' : 'bg-blue-500'
  );
}
