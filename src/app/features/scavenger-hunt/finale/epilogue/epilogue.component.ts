import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { HUNT_STOPS } from '../../scavenger-hunt.data';
import { HuntStoreService } from '../../services/hunt-store.service';
import { Language } from '../../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../../ui-strings.data';

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

const FIREWORK_COLORS = ['#f472b6', '#fbbf24', '#f59e0b', '#fca5a5', '#fde68a', '#fb7185'];
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

@Component({
  selector: 'app-epilogue',
  templateUrl: './epilogue.component.html',
  styleUrl: './epilogue.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EpilogueComponent {
  private readonly store = inject(HuntStoreService);

  readonly lang = computed<Language>(() => this.store.progress().language ?? 'en');
  readonly stops = HUNT_STOPS;
  readonly confettiPieces = Array.from({ length: 40 }, (_, i) => i);
  readonly fireworkBursts = createFireworkBursts();
  readonly risingFireworks = createRisingFireworks();
  readonly particleAngles = Array.from({ length: 12 }, (_, i) => (360 / 12) * i);

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  confettiColor(piece: number): string {
    const colors = ['#f472b6', '#fbbf24', '#f59e0b'];
    return colors[piece % colors.length];
  }
}
