import { ChangeDetectionStrategy, Component, input } from '@angular/core';

interface FallingHeart {
  id: number;
  leftPct: number;
  delaySec: number;
  durationSec: number;
  sizePx: number;
}

interface FallingLeaf {
  id: number;
  leftPct: number;
  delaySec: number;
  durationSec: number;
  driftPx: number;
  sizePx: number;
}

function createFallingHearts(count: number): FallingHeart[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    leftPct: Math.random() * 100,
    delaySec: Math.random() * 4,
    durationSec: 5 + Math.random() * 3,
    sizePx: 16 + Math.random() * 10,
  }));
}

function createFallingLeaves(count: number): FallingLeaf[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    leftPct: Math.random() * 100,
    delaySec: Math.random() * 5,
    durationSec: 6 + Math.random() * 4,
    driftPx: 20 + Math.random() * 40,
    sizePx: 18 + Math.random() * 10,
  }));
}

/**
 * Ambient background layer: yellow hearts drift straight down, leaves sway
 * side to side on the way down for a more natural falling-leaf feel. Purely
 * decorative (pointer-events-none) — mount as a child of a `relative`
 * container, before the real content, so it sits behind it by default.
 */
@Component({
  selector: 'app-falling-hearts',
  styleUrl: './falling-hearts.component.css',
  template: `
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      @for (heart of fallingHearts; track heart.id) {
        <span
          class="heart-fall absolute top-[-10%]"
          [style.left.%]="heart.leftPct"
          [style.font-size.px]="heart.sizePx"
          [style.animation-duration.s]="heart.durationSec"
          [style.animation-delay.s]="heart.delaySec"
          >💛</span
        >
      }
      @if (showLeaves()) {
        @for (leaf of fallingLeaves; track leaf.id) {
          <span
            class="leaf-fall absolute top-[-10%]"
            [style.left.%]="leaf.leftPct"
            [style.font-size.px]="leaf.sizePx"
            [style.animation-duration.s]="leaf.durationSec"
            [style.animation-delay.s]="leaf.delaySec"
            [style.--leaf-drift]="leaf.driftPx + 'px'"
            >🍃</span
          >
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FallingHeartsComponent {
  readonly showLeaves = input(true);

  readonly fallingHearts = createFallingHearts(14);
  readonly fallingLeaves = createFallingLeaves(10);
}
