import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { GameService } from '../game.service';
import { LANES, MIN_SPAWN_GAP, NoteType, SHOUTS, SONGS } from '../harmonica.data';
import { ResultPopupComponent } from './result-popup/result-popup.component';

// ── Local types ───────────────────────────────────────────────────────────────

interface ActiveNote {
  id: number;
  cell: number;
  type: NoteType;
  progress: number;
  hit: boolean;
}

interface HitEffect {
  id: number;
  laneIndex: number; // 0-based lane
  depthT: number;    // depth at moment of hit (0..1)
  color: string;
  age: number;       // frames elapsed, 0 → DURATION
  sparks: { angle: number; speed: number; size: number }[];
}

interface ComboShout {
  id: number;
  text: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-game-screen',
  templateUrl: './game-screen.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResultPopupComponent],
  styles: [`
    @keyframes shout-pop {
      0%   { transform: scale(0.5); opacity: 0; }
      20%  { transform: scale(1.1); opacity: 1; }
      80%  { transform: scale(1);   opacity: 1; }
      100% { transform: scale(1.5); opacity: 0; }
    }
    @keyframes particle-fade {
      0%   { transform: translate(0, 0) scale(1); opacity: 1; }
      100% { transform: translate(var(--tw-x), var(--tw-y)) scale(0); opacity: 0; }
    }
  `],
})
export class GameScreenComponent {
  private readonly gameService = inject(GameService);
  private readonly destroyRef  = inject(DestroyRef);

  private readonly highwayEl     = viewChild.required<ElementRef<HTMLDivElement>>('highwayEl');
  private readonly highwayCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('highwayCanvas');

  // ── Inputs / Outputs ──────────────────────────────────────────────────────
  readonly songKey = input.required<string>();
  readonly exit    = output<void>();

  // ── Template data (from service) ──────────────────────────────────────────
  readonly lanes           = LANES;
  readonly score           = this.gameService.score;
  readonly combo           = this.gameService.combo;
  readonly currentKey      = this.gameService.currentKey;
  readonly nextNoteGuide   = this.gameService.nextNoteGuide;
  readonly showResultPopup = this.gameService.showResultPopup;
  readonly currentSongKey  = this.gameService.currentSongKey;

  // ── Reactive game-state signals ───────────────────────────────────────────
  protected readonly activeNotes      = signal<ActiveNote[]>([]);
  protected readonly highlightedLanes = signal<Set<number>>(new Set());
  protected readonly activeCellStates = signal<Map<number, NoteType>>(new Map());
  protected readonly hitEffects       = signal<HitEffect[]>([]);
  protected readonly comboShouts      = signal<ComboShout[]>([]);

  protected readonly notesByLane = computed(() => {
    const map = new Map<number, ActiveNote[]>();
    for (const note of this.activeNotes()) {
      const bucket = map.get(note.cell) ?? [];
      bucket.push(note);
      map.set(note.cell, bucket);
    }
    return map;
  });

  // ── Private counters ──────────────────────────────────────────────────────
  private noteIdCounter     = 0;
  private particleIdCounter = 0;
  private shoutIdCounter    = 0;
  private animFrameId       = 0;

  // ── Perspective constants ─────────────────────────────────────────────────
  // Vanishing point Y as fraction of canvas height
  private readonly VP_Y_FRACTION          = 0.05;
  // Highway width
  private readonly HORIZON_WIDTH_FRACTION = 0.45;
  // Hit zone depth range in progress units (0 = far, 100 = bottom)
  private readonly HIT_ZONE_TOP_T = 0.745;
  private readonly HIT_ZONE_BOT_T = 0.86;
  // Note thickness in progress units
  private readonly NOTE_THICKNESS         = 4;
  private readonly HIT_EFFECT_DURATION = 60; // frames (1s at 60fps)

  private resizeObserver!: ResizeObserver;

  // ── Constructor ───────────────────────────────────────────────────────────

  constructor() {
    afterNextRender(() => {
      this.initCanvas();
      void this.startGame();

      this.destroyRef.onDestroy(() => {
        this.stopLoop();
        this.resizeObserver?.disconnect();
      });
    });
  }

  // ── Template helpers ──────────────────────────────────────────────────────

  get formattedScore(): string {
    return this.score().toString().padStart(6, '0');
  }

  onRestart(): void { void this.startGame(); }

  onExit(): void {
    this.stopLoop();
    this.exit.emit();
  }

  // ── Private: canvas setup ─────────────────────────────────────────────────

  private initCanvas(): void {
    this.syncCanvasSize();

    this.resizeObserver = new ResizeObserver(() => {
      this.syncCanvasSize();
    });
    this.resizeObserver.observe(this.highwayEl().nativeElement);
  }

  private syncCanvasSize(): void {
    const canvas        = this.highwayCanvas().nativeElement;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width        = width  * devicePixelRatio;
    canvas.height       = height * devicePixelRatio;
    const ctx           = canvas.getContext('2d')!;
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  // ── Private: perspective projection ──────────────────────────────────────

  /**
   * Projects a point in highway-space to canvas pixels.
   * @param laneT  0..1 horizontal position across the highway width
   * @param depthT 0..1 depth (0 = horizon/far, 1 = bottom/near)
   */
  private project(
    W: number, H: number,
    laneT: number, depthT: number,
  ): { x: number; y: number } {
    const vpX       = W / 2;
    const vpY       = H * this.VP_Y_FRACTION;
    const horizLeft  = vpX - (W * this.HORIZON_WIDTH_FRACTION) / 2;
    const horizRight = vpX + (W * this.HORIZON_WIDTH_FRACTION) / 2;

    const leftEdge  = horizLeft  + depthT * (0 - horizLeft);
    const rightEdge = horizRight + depthT * (W - horizRight);

    return {
      x: leftEdge + laneT * (rightEdge - leftEdge),
      y: vpY + depthT * (H - vpY),
    };
  }

  // ── Private: rendering ────────────────────────────────────────────────────

  private renderFrame(): void {
    const canvas = this.highwayCanvas().nativeElement;
    const ctx    = canvas.getContext('2d')!;
    const rect   = canvas.getBoundingClientRect();
    const W      = rect.width;
    const H      = rect.height;
    const N      = this.lanes.length;

    ctx.save();
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    ctx.clearRect(0, 0, W, H);

    this.drawGrid(ctx, W, H, N);
    this.drawHitZone(ctx, W, H, N);
    this.drawNotes(ctx, W, H, N);
    this.drawHitEffects(ctx, W, H, N);  // ← add this

    ctx.restore();
  }

  private drawGrid(ctx: CanvasRenderingContext2D, W: number, H: number, N: number): void {
    const vpX        = W / 2;
    const vpY        = H * this.VP_Y_FRACTION;
    const horizLeft  = vpX - (W * this.HORIZON_WIDTH_FRACTION) / 2;
    const horizRight = vpX + (W * this.HORIZON_WIDTH_FRACTION) / 2;

    // ── Lane dividers ──────────────────────────────────────────────────────
    ctx.lineWidth   = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';

    for (let i = 1; i < N; i++) {
      const t  = i / N;
      const bx = t * W;
      const hx = horizLeft + t * (horizRight - horizLeft);

      ctx.beginPath();
      ctx.moveTo(hx, vpY);
      ctx.lineTo(bx, H);
      ctx.stroke();
    }

    // ── Outer edges with subtle glow ──────────────────────────────────────
    ctx.lineWidth   = 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.shadowColor = 'rgba(255,255,255,0.2)';
    ctx.shadowBlur  = 8;

    ctx.beginPath();
    ctx.moveTo(horizLeft, vpY);
    ctx.lineTo(0, H);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(horizRight, vpY);
    ctx.lineTo(W, H);
    ctx.stroke();

    ctx.shadowBlur = 0;

    // ── Fret lines (quadratic bunching toward horizon) ─────────────────────
    const FRET_COUNT = 14;

    for (let j = 1; j <= FRET_COUNT; j++) {
      const t      = (j / FRET_COUNT) ** 2;
      const y      = vpY + t * (H - vpY);
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

    // ── Solid yellow fill for the entire hit zone ─────────────────────────
    ctx.beginPath();
    ctx.moveTo(topLeft.x,  topLeft.y);
    ctx.lineTo(topRight.x, topRight.y);
    ctx.lineTo(botRight.x, botRight.y);
    ctx.lineTo(botLeft.x,  botLeft.y);
    ctx.closePath();
    ctx.fillStyle   = 'rgba(250,204,21,0.18)';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur  = 20;
    ctx.fill();
    ctx.shadowBlur  = 0;

    // ── Top glowing border ────────────────────────────────────────────────
    ctx.beginPath();
    ctx.moveTo(topLeft.x, topLeft.y);
    ctx.lineTo(topRight.x, topRight.y);

    // Bloom pass
    ctx.lineWidth   = 10;
    ctx.strokeStyle = 'rgba(250,204,21,0.20)';
    ctx.stroke();

    // Sharp pass
    ctx.lineWidth   = 3;
    ctx.strokeStyle = '#facc15';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur  = 18;
    ctx.stroke();
    ctx.shadowBlur  = 0;

    // ── Bottom border ─────────────────────────────────────────────────────
    ctx.beginPath();
    ctx.moveTo(botLeft.x, botLeft.y);
    ctx.lineTo(botRight.x, botRight.y);
    ctx.lineWidth   = 2;
    ctx.strokeStyle = 'rgba(250,204,21,0.55)';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur  = 10;
    ctx.stroke();
    ctx.shadowBlur  = 0;

    // ── Per-lane active glows inside the zone ────────────────────────────
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
        ctx.shadowBlur  = 30;
      } else if (cellType === 'blow') {
        ctx.fillStyle   = 'rgba(16,185,129,0.45)';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur  = 20;
      } else {
        ctx.fillStyle   = 'rgba(139,92,246,0.45)';
        ctx.shadowColor = '#8b5cf6';
        ctx.shadowBlur  = 20;
      }

      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  private drawNotes(ctx: CanvasRenderingContext2D, W: number, H: number, N: number): void {
    const thickness = this.NOTE_THICKNESS;
    const INSET     = 0.04; // fraction of lane width to pad on each side

    for (const note of this.activeNotes()) {
      if (note.progress < -thickness || note.progress > 105) continue;

      const laneIndex = note.cell - 1;
      const tL        = laneIndex / N + INSET / N;
      const tR        = (laneIndex + 1) / N - INSET / N;

      const depthTop = Math.max(0.001, note.progress / 100);
      const depthBot = Math.min(0.999, (note.progress + thickness) / 100);

      const topLeft  = this.project(W, H, tL, depthTop);
      const topRight = this.project(W, H, tR, depthTop);
      const botLeft  = this.project(W, H, tL, depthBot);
      const botRight = this.project(W, H, tR, depthBot);

      const color = note.type === 'blow'
        ? getComputedStyle(this.highwayEl().nativeElement).getPropertyValue('--color-blow').trim() || '#10b981'
        : getComputedStyle(this.highwayEl().nativeElement).getPropertyValue('--color-draw').trim() || '#8b5cf6';

      ctx.beginPath();
      ctx.moveTo(topLeft.x,  topLeft.y);
      ctx.lineTo(topRight.x, topRight.y);
      ctx.lineTo(botRight.x, botRight.y);
      ctx.lineTo(botLeft.x,  botLeft.y);
      ctx.closePath();

      ctx.fillStyle   = color;
      ctx.shadowColor = color;
      ctx.shadowBlur  = 16;
      ctx.fill();
      ctx.shadowBlur  = 0;

      // Slightly brighter top edge highlight
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
      const t = effect.age / this.HIT_EFFECT_DURATION; // 0 → 1
      if (t >= 1) continue;
      surviving.push({ ...effect, age: effect.age + 1 });

      const laneT  = (effect.laneIndex + 0.5) / N;
      const laneL  = effect.laneIndex / N;
      const laneR  = (effect.laneIndex + 1) / N;
      const center = this.project(W, H, laneT, effect.depthT);
      const left   = this.project(W, H, laneL, effect.depthT);
      const right  = this.project(W, H, laneR, effect.depthT);
      const noteW  = right.x - left.x;

      // ── Phase 1 (t < 0.25): note flashes yellow ───────────────────────
      if (t < 0.25) {
        const flashT    = t / 0.25;             // 0 → 1 within flash phase
        const noteThick = this.NOTE_THICKNESS;
        const topDepth  = Math.max(0.001, effect.depthT - noteThick / 100 / 2);
        const botDepth  = Math.min(0.999, effect.depthT + noteThick / 100 / 2);
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
        ctx.shadowBlur  = 20 * (1 - flashT);
        ctx.fill();
        ctx.shadowBlur  = 0;
      }

      // ── Phase 2 (t >= 0.15): sparks radiate outward ───────────────────
      if (t >= 0.15) {
        const sparkT = (t - 0.15) / 0.85; // 0 → 1 within spark phase
        const eased  = 1 - (1 - sparkT) ** 2; // ease-out

        for (const spark of effect.sparks) {
          const dist = spark.speed * eased * (noteW * 0.25); // was 0.6
          const alpha = 1 - sparkT;
          const sx    = center.x + Math.cos(spark.angle) * dist;
          const sy    = center.y + Math.sin(spark.angle) * dist * 0.45; // flatten Y for perspective feel

          ctx.beginPath();
          ctx.arc(sx, sy, spark.size * (1 - sparkT * 0.5), 0, Math.PI * 2);
          ctx.fillStyle   = sparkT < 0.4 ? `rgba(255,255,255,${alpha})` : `rgba(250,204,21,${alpha})`;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur  = 8 * alpha;
          ctx.fill();
          ctx.shadowBlur  = 0;
        }
      }
    }

    // Advance ages and prune finished effects
    this.hitEffects.set(surviving);
  }

  // ── Private: game lifecycle ───────────────────────────────────────────────

  private async startGame(): Promise<void> {
    this.stopLoop();
    this.activeNotes.set([]);
    this.hitEffects.set([]);
    this.comboShouts.set([]);
    this.highlightedLanes.set(new Set());
    this.activeCellStates.set(new Map());

    this.gameService.resetGame(this.songKey());

    try {
      await this.gameService.initAudio();
      this.gameService.isPlaying.set(true);
      this.animFrameId = requestAnimationFrame(() => this.gameLoop());
    } catch (err) {
      console.error('Microphone access denied:', err);
      this.exit.emit();
    }
  }

  private stopLoop(): void {
    this.gameService.isPlaying.set(false);
    cancelAnimationFrame(this.animFrameId);
  }

  private finishSong(): void {
    this.stopLoop();
    this.gameService.showResultPopup.set(true);
  }

  // ── Private: game loop ────────────────────────────────────────────────────

  private gameLoop(): void {
    if (!this.gameService.isPlaying()) return;

    const now = Date.now() - this.gameService.startTime;
    const key = this.songKey();

    // ── Song-end check ──────────────────────────────────────────────────────
    if (key !== 'free') {
      const song = SONGS[key];
      if (
        this.gameService.songPointer >= song.notes.length &&
        this.activeNotes().length === 0
      ) {
        setTimeout(() => this.finishSong(), 1500);
        return;
      }
    }

    // ── Spawn notes ─────────────────────────────────────────────────────────
    if (key === 'free') {
      if (Math.random() < 0.03) {
        const cell = Math.floor(Math.random() * 10) + 1;
        if (now - this.gameService.lastSpawnTimeByLane[cell] > MIN_SPAWN_GAP) {
          this.spawnNote(cell, Math.random() > 0.5 ? 'blow' : 'draw');
          this.gameService.lastSpawnTimeByLane[cell] = now;
        }
      }
    } else if (this.gameService.songPointer < SONGS[key].notes.length) {
      const n = SONGS[key].notes[this.gameService.songPointer];
      if (now >= n.t - 2000) {
        this.spawnNote(n.h, n.type);
        this.gameService.songPointer++;
      }
    }

    // ── Pitch detection ─────────────────────────────────────────────────────
    const action = this.gameService.detectPitch();

    // ── Active-cell visual feedback ─────────────────────────────────────────
    const newCellStates = new Map<number, NoteType>();
    if (action) newCellStates.set(action.cell - 1, action.type);
    this.activeCellStates.set(newCellStates);

    // ── Move notes, detect hits ─────────────────────────────────────────────
    let closestNote: ActiveNote | null = null;
    let maxProgress = -Infinity;
    const newHighlights = new Set<number>();

    this.activeNotes.update(notes => {
      const surviving: ActiveNote[] = [];

      for (const n of notes) {
        const updated: ActiveNote = { ...n, progress: n.progress + this.gameService.speed() };

        if (updated.progress > maxProgress && updated.progress < 100) {
          maxProgress = updated.progress;
          closestNote = updated;
        }

        const inHitWindow =
          !updated.hit &&
          updated.progress > 75 &&
          updated.progress < 95 &&
          action?.cell === updated.cell &&
          action?.type === updated.type;

        if (inHitWindow) {
          this.handleHit(updated, newHighlights);
        } else if (updated.progress > 105) {
          if (!updated.hit) this.gameService.resetCombo();
        } else {
          surviving.push(updated);
        }
      }

      return surviving;
    });

    this.highlightedLanes.set(newHighlights);

    // ── Guide text ──────────────────────────────────────────────────────────
    this.gameService.nextNoteGuide.set(
      closestNote
        ? `${(closestNote as ActiveNote).type === 'blow' ? 'BLOW' : 'DRAW'} ${(closestNote as ActiveNote).cell}`
        : 'Waiting note...',
    );

    // ── Render frame ────────────────────────────────────────────────────────
    this.renderFrame();

    this.animFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  // ── Private: note management ──────────────────────────────────────────────

  private spawnNote(cell: number, type: NoteType): void {
    this.activeNotes.update(notes => [
      ...notes,
      { id: this.noteIdCounter++, cell, type, progress: -5, hit: false },
    ]);
  }

  private handleHit(note: ActiveNote, highlights: Set<number>): void {
    this.createHitEffect(note);
    this.gameService.addScore(100);
    this.gameService.incrementCombo();
    if (this.gameService.combo() % 5 === 0) this.triggerComboShout();
    highlights.add(note.cell - 1);
  }

  // ── Private: visual effects ───────────────────────────────────────────────

  private triggerComboShout(): void {
    const shout: ComboShout = {
      id:   this.shoutIdCounter++,
      text: SHOUTS[Math.floor(Math.random() * SHOUTS.length)],
    };
    this.comboShouts.update(s => [...s, shout]);
    setTimeout(() => {
      this.comboShouts.update(s => s.filter(c => c.id !== shout.id));
    }, 1000);
  }

  private createHitEffect(note: ActiveNote): void {
    const effect: HitEffect = {
      id:        this.particleIdCounter++,
      laneIndex: note.cell - 1,
      depthT:    Math.min(0.999, note.progress / 100),
      color:     note.type === 'blow' ? '#10b981' : '#8b5cf6',
      age:       0,
      sparks: Array.from({ length: 18 }, () => ({
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 8 + 4,   // was 28 + 12
        size:  Math.random() * 2.5 + 1, // slightly smaller to feel denser
      })),
    };

    this.hitEffects.update(e => [...e, effect]);
  }
}