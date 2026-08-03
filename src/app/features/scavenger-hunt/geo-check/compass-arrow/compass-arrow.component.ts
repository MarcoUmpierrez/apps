import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-compass-arrow',
  template: `
    <svg
      viewBox="0 0 100 100"
      class="h-28 w-28 transition-transform duration-300"
      [style.transform]="'rotate(' + (bearingDegrees() ?? 0) + 'deg)'"
    >
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        class="text-amber-300"
      />
      <polygon points="50,10 62,58 50,48 38,58" fill="currentColor" class="text-amber-800" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompassArrowComponent {
  readonly bearingDegrees = input<number | null>(null);
}
