import { ChangeDetectionStrategy, Component } from '@angular/core';

interface FireworkBurst {
  id: number;
  xPct: number;
  yPct: number;
  color: string;
  delay: string;
}

interface RisingFirework {
  id: number;
  xPct: number;
  burstYPct: number;
  riseBottomPct: number;
  color: string;
  delay: string;
}

const FIREWORK_COLORS = ['#e9d9c4', '#3a3f6b', '#c9a86a', '#9c3b32', '#a3906c', '#6b7bb0'];
const FIREWORK_POSITIONS = [
  { x: 20, y: 20 },
  { x: 75, y: 15 },
  { x: 50, y: 35 },
  { x: 15, y: 60 },
  { x: 82, y: 55 },
  { x: 45, y: 78 },
  { x: 68, y: 82 },
];

function createFireworkBursts(): FireworkBurst[] {
  return FIREWORK_POSITIONS.map((pos, i) => ({
    id: i,
    xPct: pos.x,
    yPct: pos.y,
    color: FIREWORK_COLORS[i % FIREWORK_COLORS.length],
    delay: `${i * 0.3}s`,
  }));
}

/** Launch column (x) and how high each rocket climbs before it bursts (burstY, from the top). */
const RISING_FIREWORK_POSITIONS = [
  { x: 30, burstY: 22 },
  { x: 62, burstY: 30 },
  { x: 12, burstY: 18 },
  { x: 88, burstY: 26 },
  { x: 45, burstY: 34 },
];

function createRisingFireworks(): RisingFirework[] {
  return RISING_FIREWORK_POSITIONS.map((pos, i) => ({
    id: i,
    xPct: pos.x,
    burstYPct: pos.burstY,
    riseBottomPct: 100 - pos.burstY,
    color: FIREWORK_COLORS[(i + 2) % FIREWORK_COLORS.length],
    delay: `${i * 0.45}s`,
  }));
}

/**
 * Purely decorative confetti + fireworks overlay, coded (not a video asset)
 * so it stays crisp and lightweight. Renders as absolutely-positioned layers
 * that fill the nearest positioned ancestor — mount it as a child of a
 * `relative` container. Do NOT add `position`/sizing classes to the
 * `<app-fireworks-display>` tag itself: this host has no in-flow content (all
 * of it is `position: absolute`), so under any flex/grid parent that doesn't
 * `stretch` it, the host collapses to 0×0 and would drag its own children's
 * `inset-0` sizing down with it. The layers carry their own `z-20` so they
 * paint above sibling content without the host needing to be a positioned
 * containing block at all. Shared by the epilogue and finale celebration screen.
 */
@Component({
  selector: 'app-fireworks-display',
  styleUrl: './fireworks-display.component.css',
  template: `
    <div class="pointer-events-none absolute inset-0 z-20">
      @for (piece of confettiPieces; track piece) {
        <span
          class="absolute top-[-10%] block h-2 w-2 rounded-sm animate-[confetti-fall_2.8s_linear_infinite]"
          [style.left.%]="(piece * 37) % 100"
          [style.animation-delay.s]="(piece % 10) * 0.3"
          [style.background-color]="confettiColor(piece)"
        ></span>
      }
    </div>

    <div class="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      @for (burst of fireworkBursts; track burst.id) {
        <div class="absolute" [style.left.%]="burst.xPct" [style.top.%]="burst.yPct">
          @for (angle of particleAngles; track angle) {
            <span
              class="firework-particle absolute block h-1.5 w-1.5 rounded-full"
              [style.background-color]="burst.color"
              [style.color]="burst.color"
              [style.--angle]="angle + 'deg'"
              [style.animation-delay]="burst.delay"
            ></span>
          }
        </div>
      }

      @for (fw of risingFireworks; track fw.id) {
        <span
          class="firework-trail absolute block h-2.5 w-1.5 rounded-full"
          [style.left.%]="fw.xPct"
          [style.background-color]="fw.color"
          [style.color]="fw.color"
          [style.--rise-bottom]="fw.riseBottomPct + '%'"
          [style.animation-delay]="fw.delay"
        ></span>
        <div class="absolute" [style.left.%]="fw.xPct" [style.top.%]="fw.burstYPct">
          @for (angle of particleAngles; track angle) {
            <span
              class="firework-rise-particle absolute block h-1.5 w-1.5 rounded-full"
              [style.background-color]="fw.color"
              [style.color]="fw.color"
              [style.--angle]="angle + 'deg'"
              [style.animation-delay]="fw.delay"
            ></span>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FireworksDisplayComponent {
  readonly confettiPieces = Array.from({ length: 40 }, (_, i) => i);
  readonly fireworkBursts = createFireworkBursts();
  readonly risingFireworks = createRisingFireworks();
  readonly particleAngles = Array.from({ length: 12 }, (_, i) => (360 / 12) * i);

  confettiColor(piece: number): string {
    const colors = ['#e9d9c4', '#3a3f6b', '#c9a86a', '#9c3b32'];
    return colors[piece % colors.length];
  }
}
