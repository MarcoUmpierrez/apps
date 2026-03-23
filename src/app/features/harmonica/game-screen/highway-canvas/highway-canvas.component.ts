import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { NoteType } from '../../harmonica.data';

// ── Types (re-exported so game screen can import them from one place) ─────────

export interface ActiveNote {
  id: number;
  cell: number;
  type: NoteType;
  progress: number;
  hit: boolean;
}

interface HitEffect {
  id: number;
  laneIndex: number;
  depthT: number;
  color: string;
  age: number;
  sparks: { angle: number; speed: number; size: number }[];
}

// ── Component ─────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-highway-canvas',
  template: `
    <div #containerEl class="relative w-full h-full overflow-hidden">
      <!-- Horizon fade -->
      <div
        class="absolute inset-0 z-10 pointer-events-none"
        style="background: linear-gradient(to bottom, var(--highway-bg) 0%, transparent 18%)"
      ></div>
      <canvas #canvasEl class="absolute inset-0 w-full h-full z-1"></canvas>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HighwayCanvasComponent {
  private readonly destroyRef = inject(DestroyRef);

  private readonly containerEl = viewChild.required<ElementRef<HTMLDivElement>>('containerEl');
  private readonly canvasEl    = viewChild.required<ElementRef<HTMLCanvasElement>>('canvasEl');

  // ── Inputs ────────────────────────────────────────────────────────────────
  readonly activeNotes      = input.required<ActiveNote[]>();
  readonly highlightedLanes = input.required<Set<number>>();
  readonly activeCellStates = input.required<Map<number, NoteType>>();
  readonly laneCount        = input.required<number>();

  // ── Hit effects are purely a rendering concern — owned here ───────────────
  private readonly hitEffects   = signal<HitEffect[]>([]);
  private effectIdCounter       = 0;

  // ── Perspective constants ─────────────────────────────────────────────────
  private readonly VP_Y_FRACTION          = 0.05;
  private readonly HORIZON_WIDTH_FRACTION = 0.45;
  private readonly NOTE_THICKNESS         = 4;
  private readonly HIT_EFFECT_DURATION    = 60;

  // ── Cached rendering values (recomputed on resize, not per-frame) ─────────
  /**
   * Cap DPR at 2. Modern phones report 3–4×, which means 9–16× more pixels
   * to fill per frame. 2× is visually indistinguishable and dramatically faster.
   */
  private dpr             = Math.min(devicePixelRatio, 2);
  private cachedColorBlow = '#10b981';
  private cachedColorDraw = '#8b5cf6';
  /**
   * Effective height used for ALL perspective math.
   * On portrait screens H can be 2–3× W, which makes the highway extremely
   * tall and the notes fly across it very fast. We clamp the perspective height
   * to at most 2.2× the width so the highway depth looks consistent across
   * orientations. The canvas is still drawn at its real size; only the
   * vanishing-point projection uses this clamped value.
   */
  private perspH          = 0;
  /** Y offset to re-centre the clamped perspective inside the real canvas. */
  private perspOffsetY    = 0;

  // Exposed as getters so the parent can derive the hit window from the
  // same source of truth — no risk of the visual zone and logic drifting apart.
  readonly HIT_ZONE_TOP_T = 0.745;
  readonly HIT_ZONE_BOT_T = 0.86;

  private resizeObserver!: ResizeObserver;

  constructor() {
    afterNextRender(() => {
      this.syncCanvasSize();

      this.resizeObserver = new ResizeObserver(() => this.syncCanvasSize());
      this.resizeObserver.observe(this.containerEl().nativeElement);

      this.destroyRef.onDestroy(() => this.resizeObserver?.disconnect());
    });
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /** Called by the parent game loop once per frame. */
  render(): void {
    const canvas = this.canvasEl().nativeElement;
    const ctx    = canvas.getContext('2d')!;
    const rect   = canvas.getBoundingClientRect();
    const W      = rect.width;
    const H      = rect.height;
    const N      = this.laneCount();

    ctx.save();
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    this.drawGrid(ctx, W, H, N);
    this.drawHitZone(ctx, W, H, N);
    this.drawNotes(ctx, W, H, N);
    this.drawHitEffects(ctx, W, H, N);

    ctx.restore();
  }

  /** Called by the parent when a note is successfully hit. */
  triggerHitEffect(note: ActiveNote): void {
    const effect: HitEffect = {
      id:        this.effectIdCounter++,
      laneIndex: note.cell - 1,
      depthT:    Math.min(0.999, note.progress / 100),
      color:     note.type === 'blow' ? '#10b981' : '#8b5cf6',
      age:       0,
      sparks:    Array.from({ length: 18 }, () => ({
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 8 + 4,
        size:  Math.random() * 2.5 + 1,
      })),
    };
    this.hitEffects.update(e => [...e, effect]);
  }

  // ── Private: canvas setup ─────────────────────────────────────────────────

  private syncCanvasSize(): void {
    const canvas            = this.canvasEl().nativeElement;
    const container         = this.containerEl().nativeElement;
    const { width, height } = canvas.getBoundingClientRect();

    // Re-evaluate DPR each resize (user may have moved to a different display).
    this.dpr        = Math.min(devicePixelRatio, 2);
    canvas.width    = width  * this.dpr;
    canvas.height   = height * this.dpr;

    const ctx       = canvas.getContext('2d')!;
    ctx.scale(this.dpr, this.dpr);

    // ── Responsive perspective ───────────────────────────────────────────
    // Clamp the highway depth to a portrait-safe maximum so the playfield
    // doesn't balloon on tall/narrow screens.
    const maxPerspH  = width * 2.2;
    this.perspH      = Math.min(height, maxPerspH);
    this.perspOffsetY = (height - this.perspH) / 2;

    // Cache CSS custom-property colours (getComputedStyle is slow per-frame).
    const style           = getComputedStyle(container);
    const blow            = style.getPropertyValue('--color-blow').trim();
    const draw            = style.getPropertyValue('--color-draw').trim();
    this.cachedColorBlow  = blow || '#10b981';
    this.cachedColorDraw  = draw || '#8b5cf6';
  }

  // ── Private: perspective projection ──────────────────────────────────────

  /**
   * All projection uses `this.perspH` (clamped) and shifts the result by
   * `this.perspOffsetY` so that on portrait screens the highway is centred
   * and sized consistently rather than stretching to fill the full height.
   */
  private project(W: number, _H: number, laneT: number, depthT: number): { x: number; y: number } {
    const H          = this.perspH;
    const yOff       = this.perspOffsetY;
    const vpX        = W / 2;
    const vpY        = H * this.VP_Y_FRACTION;
    const horizLeft  = vpX - (W * this.HORIZON_WIDTH_FRACTION) / 2;
    const horizRight = vpX + (W * this.HORIZON_WIDTH_FRACTION) / 2;
    const leftEdge   = horizLeft  + depthT * (0 - horizLeft);
    const rightEdge  = horizRight + depthT * (W - horizRight);
    return {
      x: leftEdge + laneT * (rightEdge - leftEdge),
      y: yOff + vpY + depthT * (H - vpY),
    };
  }

  // ── Private: draw methods ─────────────────────────────────────────────────

  private drawGrid(ctx: CanvasRenderingContext2D, W: number, H: number, N: number): void {
    const pH         = this.perspH;
    const yOff       = this.perspOffsetY;
    const vpX        = W / 2;
    const vpY        = yOff + pH * this.VP_Y_FRACTION;
    const horizLeft  = vpX - (W * this.HORIZON_WIDTH_FRACTION) / 2;
    const horizRight = vpX + (W * this.HORIZON_WIDTH_FRACTION) / 2;
    // Bottom Y is the bottom of the perspective area, not the full canvas H.
    const botY       = yOff + pH;

    ctx.lineWidth   = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';

    for (let i = 1; i < N; i++) {
      const t  = i / N;
      const bx = t * W;
      const hx = horizLeft + t * (horizRight - horizLeft);
      ctx.beginPath();
      ctx.moveTo(hx, vpY);
      ctx.lineTo(bx, botY);
      ctx.stroke();
    }

    ctx.lineWidth   = 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    // Reduce bloom cost: halve shadowBlur (invisible difference at small sizes).
    ctx.shadowColor = 'rgba(255,255,255,0.2)';
    ctx.shadowBlur  = 4;

    ctx.beginPath();
    ctx.moveTo(horizLeft, vpY);
    ctx.lineTo(0, botY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(horizRight, vpY);
    ctx.lineTo(W, botY);
    ctx.stroke();

    ctx.shadowBlur = 0;

    const FRET_COUNT = 14;
    for (let j = 1; j <= FRET_COUNT; j++) {
      const t      = (j / FRET_COUNT) ** 2;
      const y      = vpY + t * (botY - vpY);
      const leftX  = horizLeft  + t * (0 - horizLeft);
      const rightX = horizRight + t * (W - horizRight);

      ctx.globalAlpha = Math.min(t * 0.5, 0.4);
      ctx.strokeStyle = 'rgba(255,255,255,1)';
      ctx.lineWidth   = 0.75;
      ctx.beginPath();
      ctx.moveTo(leftX, y);
      ctx.lineTo(rightX, y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }

  private drawHitZone(ctx: CanvasRenderingContext2D, W: number, H: number, N: number): void {
    const tTop = this.HIT_ZONE_TOP_T;
    const tBot = this.HIT_ZONE_BOT_T;

    const topLeft  = this.project(W, H, 0, tTop);
    const topRight = this.project(W, H, 1, tTop);
    const botLeft  = this.project(W, H, 0, tBot);
    const botRight = this.project(W, H, 1, tBot);

    ctx.beginPath();
    ctx.moveTo(topLeft.x,  topLeft.y);
    ctx.lineTo(topRight.x, topRight.y);
    ctx.lineTo(botRight.x, botRight.y);
    ctx.lineTo(botLeft.x,  botLeft.y);
    ctx.closePath();
    ctx.fillStyle   = 'rgba(250,204,21,0.18)';
    // shadowBlur is the single most expensive canvas operation on mobile.
    // Use a tight blur on the fill and skip the bloom pass on the top border.
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur  = 10;
    ctx.fill();
    ctx.shadowBlur  = 0;

    // Top border — single sharp pass (bloom pass removed for mobile perf)
    ctx.beginPath();
    ctx.moveTo(topLeft.x, topLeft.y);
    ctx.lineTo(topRight.x, topRight.y);
    ctx.lineWidth   = 3;
    ctx.strokeStyle = '#facc15';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur  = 10;
    ctx.stroke();
    ctx.shadowBlur  = 0;

    // Bottom border
    ctx.beginPath();
    ctx.moveTo(botLeft.x, botLeft.y);
    ctx.lineTo(botRight.x, botRight.y);
    ctx.lineWidth   = 2;
    ctx.strokeStyle = 'rgba(250,204,21,0.55)';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur  = 6;
    ctx.stroke();
    ctx.shadowBlur  = 0;

    // Per-lane active glows
    const activeCells = this.activeCellStates();
    const highlighted = this.highlightedLanes();

    for (let i = 0; i < N; i++) {
      const isHighlighted = highlighted.has(i);
      const cellType      = activeCells.get(i);
      if (!isHighlighted && !cellType) continue;

      const tL = i / N;
      const tR = (i + 1) / N;
      const tl = this.project(W, H, tL, tTop);
      const tr = this.project(W, H, tR, tTop);
      const bl = this.project(W, H, tL, tBot);
      const br = this.project(W, H, tR, tBot);

      ctx.beginPath();
      ctx.moveTo(tl.x, tl.y);
      ctx.lineTo(tr.x, tr.y);
      ctx.lineTo(br.x, br.y);
      ctx.lineTo(bl.x, bl.y);
      ctx.closePath();

      if (isHighlighted) {
        ctx.fillStyle   = 'rgba(250,204,21,0.55)';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur  = 15;
      } else if (cellType === 'blow') {
        ctx.fillStyle   = 'rgba(16,185,129,0.45)';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur  = 10;
      } else {
        ctx.fillStyle   = 'rgba(139,92,246,0.45)';
        ctx.shadowColor = '#8b5cf6';
        ctx.shadowBlur  = 10;
      }

      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  private drawNotes(ctx: CanvasRenderingContext2D, W: number, H: number, N: number): void {
    const thickness = this.NOTE_THICKNESS;
    const INSET     = 0.04;
    // Use cached colours — getComputedStyle must NOT be called per-note per-frame.
    const blowColor = this.cachedColorBlow;
    const drawColor = this.cachedColorDraw;

    for (const note of this.activeNotes()) {
      if (note.progress < -thickness || note.progress > 105) continue;

      const laneIndex = note.cell - 1;
      const tL        = laneIndex / N + INSET / N;
      const tR        = (laneIndex + 1) / N - INSET / N;
      const depthTop  = Math.max(0.001, note.progress / 100);
      const depthBot  = Math.min(0.999, (note.progress + thickness) / 100);

      const topLeft  = this.project(W, H, tL, depthTop);
      const topRight = this.project(W, H, tR, depthTop);
      const botLeft  = this.project(W, H, tL, depthBot);
      const botRight = this.project(W, H, tR, depthBot);

      const color = note.type === 'blow' ? blowColor : drawColor;

      ctx.beginPath();
      ctx.moveTo(topLeft.x,  topLeft.y);
      ctx.lineTo(topRight.x, topRight.y);
      ctx.lineTo(botRight.x, botRight.y);
      ctx.lineTo(botLeft.x,  botLeft.y);
      ctx.closePath();

      ctx.fillStyle   = color;
      ctx.shadowColor = color;
      ctx.shadowBlur  = 8;   // was 16 — halved; saves significant GPU time
      ctx.fill();
      ctx.shadowBlur  = 0;

      // Top-edge highlight
      ctx.beginPath();
      ctx.moveTo(topLeft.x,  topLeft.y);
      ctx.lineTo(topRight.x, topRight.y);
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth   = 1;
      ctx.stroke();
    }
  }

  private drawHitEffects(ctx: CanvasRenderingContext2D, W: number, H: number, N: number): void {
    const surviving: HitEffect[] = [];

    for (const effect of this.hitEffects()) {
      const t = effect.age / this.HIT_EFFECT_DURATION;
      if (t >= 1) continue;
      surviving.push({ ...effect, age: effect.age + 1 });

      const laneT  = (effect.laneIndex + 0.5) / N;
      const laneL  = effect.laneIndex / N;
      const laneR  = (effect.laneIndex + 1) / N;
      const center = this.project(W, H, laneT, effect.depthT);
      const left   = this.project(W, H, laneL, effect.depthT);
      const right  = this.project(W, H, laneR, effect.depthT);
      const noteW  = right.x - left.x;

      // Phase 1 (t < 0.25): note flashes yellow
      if (t < 0.25) {
        const flashT   = t / 0.25;
        const topDepth = Math.max(0.001, effect.depthT - this.NOTE_THICKNESS / 100 / 2);
        const botDepth = Math.min(0.999, effect.depthT + this.NOTE_THICKNESS / 100 / 2);
        const tl = this.project(W, H, laneL + 0.004 / N, topDepth);
        const tr = this.project(W, H, laneR - 0.004 / N, topDepth);
        const bl = this.project(W, H, laneL + 0.004 / N, botDepth);
        const br = this.project(W, H, laneR - 0.004 / N, botDepth);

        ctx.beginPath();
        ctx.moveTo(tl.x, tl.y);
        ctx.lineTo(tr.x, tr.y);
        ctx.lineTo(br.x, br.y);
        ctx.lineTo(bl.x, bl.y);
        ctx.closePath();
        ctx.fillStyle   = `rgba(250,204,21,${1 - flashT * 0.3})`;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur  = 12 * (1 - flashT);  // was 20
        ctx.fill();
        ctx.shadowBlur  = 0;
      }

      // Phase 2 (t >= 0.15): sparks radiate outward
      if (t >= 0.15) {
        const sparkT = (t - 0.15) / 0.85;
        const eased  = 1 - (1 - sparkT) ** 2;

        for (const spark of effect.sparks) {
          const dist  = spark.speed * eased * (noteW * 0.25);
          const alpha = 1 - sparkT;
          const sx    = center.x + Math.cos(spark.angle) * dist;
          const sy    = center.y + Math.sin(spark.angle) * dist * 0.45;

          ctx.beginPath();
          ctx.arc(sx, sy, spark.size * (1 - sparkT * 0.5), 0, Math.PI * 2);
          ctx.fillStyle   = sparkT < 0.4 ? `rgba(255,255,255,${alpha})` : `rgba(250,204,21,${alpha})`;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur  = 5 * alpha;   // was 8
          ctx.fill();
          ctx.shadowBlur  = 0;
        }
      }
    }

    this.hitEffects.set(surviving);
  }
}