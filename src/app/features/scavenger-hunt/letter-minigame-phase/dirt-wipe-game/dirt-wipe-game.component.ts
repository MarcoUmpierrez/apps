import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { DirtWipeLetterMinigame, Language } from '../../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../../ui-strings.data';

const CANVAS_SIZE = 320;
const BRUSH_RADIUS = 22;
const DIRT_IMAGE_SRC = 'scavenger-hunt/textures/dirt.jpg';

/**
 * A real scratch-card: the dirt texture is drawn onto a <canvas>, and a
 * finger drag punches actual transparent holes along its path via
 * `globalCompositeOperation: 'destination-out'` — no opacity fakery, the
 * pixels the player swipes over are truly gone. Cleared % is sampled from
 * the canvas's own alpha channel whenever a swipe ends.
 */
@Component({
  selector: 'app-dirt-wipe-game',
  template: `
    <div class="flex w-full max-w-sm flex-col items-center gap-5 text-center">
      @if (!revealed()) {
        <p class="text-lg font-semibold text-amber-900">{{ t('dirtWipePrompt') }}</p>

        <div
          class="relative h-40 w-40 touch-none overflow-hidden rounded-2xl border-2 border-amber-300 shadow-lg shadow-amber-900/20"
        >
          <div
            class="absolute inset-0 flex items-center justify-center bg-amber-50 text-7xl font-black text-amber-900"
          >
            {{ config().letter }}
          </div>
          <canvas
            #canvas
            [width]="canvasSize"
            [height]="canvasSize"
            class="absolute inset-0 h-full w-full touch-none"
            (pointerdown)="onPointerDown($event)"
            (pointermove)="onPointerMove($event)"
            (pointerup)="onPointerUp()"
            (pointercancel)="onPointerUp()"
          ></canvas>
        </div>

        <div
          class="h-4 w-full max-w-xs overflow-hidden rounded-full border-2 border-amber-300 bg-amber-100"
        >
          <div
            class="h-full rounded-full bg-amber-600 transition-[width] duration-150 ease-out"
            [style.width.%]="clearedPercent()"
          ></div>
        </div>

        <button
          type="button"
          (click)="revealNow()"
          class="touch-manipulation text-sm font-semibold text-amber-700 underline underline-offset-2"
        >
          {{ t('giveUp') }}
        </button>
      } @else {
        <div class="text-8xl font-black text-amber-900">{{ config().letter }}</div>
        <div class="max-w-xs rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 p-4">
          <p class="mb-1 text-xs font-bold uppercase tracking-widest text-amber-600">
            📓 {{ t('notebookCallout') }}
          </p>
          <p class="text-amber-900">{{ notebookMessage() }}</p>
        </div>
        <button
          type="button"
          (click)="solved.emit()"
          class="min-h-14 w-full touch-manipulation rounded-2xl bg-amber-800 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-amber-900/30 transition-transform active:scale-95"
        >
          {{ t('continueLabel') }}
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirtWipeGameComponent implements AfterViewInit {
  readonly config = input.required<DirtWipeLetterMinigame>();
  readonly lang = input.required<Language>();
  readonly solved = output<void>();

  @ViewChild('canvas') private readonly canvasRef?: ElementRef<HTMLCanvasElement>;

  readonly canvasSize = CANVAS_SIZE;
  readonly clearedPercent = signal(0);
  readonly revealed = computed(
    () => this.clearedPercent() >= this.config().clearThresholdPercent,
  );

  private ctx: CanvasRenderingContext2D | null = null;
  private isDragging = false;
  private lastPoint: { x: number; y: number } | null = null;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    this.ctx = canvas.getContext('2d');
    const image = new Image();
    image.onload = () => this.ctx?.drawImage(image, 0, 0, this.canvasSize, this.canvasSize);
    image.src = DIRT_IMAGE_SRC;
  }

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  notebookMessage(): string {
    return translateUi(this.lang(), 'writeLetterDown', { letter: this.config().letter });
  }

  onPointerDown(event: PointerEvent): void {
    if (this.revealed()) return;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    this.isDragging = true;
    const point = this.toCanvasPoint(event);
    this.lastPoint = point;
    this.erase(point, point);
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.isDragging || this.revealed()) return;
    const point = this.toCanvasPoint(event);
    this.erase(this.lastPoint ?? point, point);
    this.lastPoint = point;
  }

  onPointerUp(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.lastPoint = null;
    this.updateClearedPercent();
  }

  revealNow(): void {
    this.clearedPercent.set(this.config().clearThresholdPercent);
  }

  private toCanvasPoint(event: PointerEvent): { x: number; y: number } {
    const canvas = this.canvasRef!.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  private erase(from: { x: number; y: number }, to: { x: number; y: number }): void {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = BRUSH_RADIUS * 2;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(to.x, to.y, BRUSH_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }

  /** Samples every 4th pixel's alpha channel — plenty accurate for a percentage, far cheaper than a full scan. */
  private updateClearedPercent(): void {
    const ctx = this.ctx;
    if (!ctx) return;

    const { data } = ctx.getImageData(0, 0, this.canvasSize, this.canvasSize);
    let transparentCount = 0;
    let sampledCount = 0;
    for (let i = 3; i < data.length; i += 16) {
      sampledCount++;
      if (data[i] < 32) transparentCount++;
    }

    const percent = sampledCount > 0 ? (transparentCount / sampledCount) * 100 : 0;
    this.clearedPercent.set(Math.min(100, Math.round(percent)));
  }
}
