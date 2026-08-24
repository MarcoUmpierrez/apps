import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { HintPanelComponent } from '../../hint-panel/hint-panel.component';
import { BilingualText, Language, SequenceReorderMinigame } from '../../scavenger-hunt.types';
import { shuffleArray } from '../../shuffle.util';
import { UiStringKey, translateUi } from '../../ui-strings.data';
import { resolveDropIndex } from './resolve-drop-index.util';

const SCRAP_ROTATIONS = [-2, 1.5, -1, 2, -1.5, 1, -2.5, 1.5];

/**
 * Real pointer-drag reordering. The dragged scrap is pulled out of normal
 * flow (position: absolute, positioned from its own pre-drag slot + total
 * pointer offset) so the other scraps reflow around it via plain CSS —
 * no manual FLIP animation needed. Slot positions are measured once at
 * drag start (`resolveDropIndex` matches against those fixed slots), so
 * item height differences (two-line vs one-line text) are handled for free.
 */
@Component({
  selector: 'app-sequence-reorder',
  imports: [HintPanelComponent],
  template: `
    <div class="w-full max-w-sm">
      <p class="mb-4 font-['Spectral',serif] text-[15px] leading-relaxed text-[#33261a]">
        {{ config().prompt[lang()] }}
      </p>
      <ol #listEl class="relative mb-4 flex flex-col gap-3">
        @for (item of order(); track item; let i = $index) {
          <li
            class="hunt-scrap flex touch-none items-center gap-2 px-3 py-2.5 select-none"
            [class.cursor-grab]="!isSolved()"
            [class.shadow-xl]="item === draggingItem()"
            [style.transform]="item === draggingItem() ? 'none' : 'rotate(' + rotationFor(i) + 'deg)'"
            [style.position]="item === draggingItem() ? 'absolute' : 'static'"
            [style.top.px]="item === draggingItem() ? dragOriginTop() + dragOffsetY() : null"
            [style.left]="item === draggingItem() ? '0' : null"
            [style.right]="item === draggingItem() ? '0' : null"
            [style.zIndex]="item === draggingItem() ? 50 : null"
            (pointerdown)="onDragStart(i, $event)"
          >
            <span class="hunt-scrap-pin"></span>
            <span
              class="w-6 shrink-0 text-center font-['Spectral',serif] text-xs text-[#8a7550]"
              >{{ i + 1 }}</span
            >
            <span class="flex-1 font-['Kalam',cursive] text-[15px] text-[#33261a]">{{
              item[lang()]
            }}</span>
            <svg
              viewBox="0 0 20 20"
              class="h-5 w-5 shrink-0 text-[#6b5636]"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="7" cy="4" r="1.4" />
              <circle cx="13" cy="4" r="1.4" />
              <circle cx="7" cy="10" r="1.4" />
              <circle cx="13" cy="10" r="1.4" />
              <circle cx="7" cy="16" r="1.4" />
              <circle cx="13" cy="16" r="1.4" />
            </svg>
          </li>
        }
      </ol>

      @if (isSolved()) {
        <div class="flex flex-col items-center gap-4 text-center">
          <p class="font-['Caveat',cursive] text-3xl text-[#3a3f6b]">🎉 {{ t('wellDone') }}</p>
          <button
            type="button"
            (click)="solved.emit()"
            class="min-h-14 w-full touch-manipulation rounded-sm border border-[#3a2c1c]/45 py-4 font-['Spectral',serif] text-xs tracking-[.24em] text-[#33261a] uppercase transition-transform active:scale-95"
          >
            {{ t('continueLabel') }}
          </button>
        </div>
      } @else {
        <button
          type="button"
          (click)="onSubmit()"
          class="min-h-11 w-full touch-manipulation border border-[#3a2c1c]/45 py-3 font-['Spectral',serif] text-xs tracking-[.2em] text-[#33261a] uppercase transition-transform active:scale-95"
        >
          {{ t('submit') }}
        </button>
        @if (wrongFlash()) {
          <p class="mt-2 text-sm font-semibold text-red-700">{{ t('wrongTryAgain') }}</p>
        }
        <app-hint-panel
          [hints]="config().hints"
          [lang]="lang()"
          [attemptCount]="attemptCount()"
          (revealed)="isSolved.set(true)"
        />
      }
    </div>
  `,
  styleUrl: './sequence-reorder.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SequenceReorderComponent implements OnInit, OnDestroy {
  readonly config = input.required<SequenceReorderMinigame>();
  readonly lang = input.required<Language>();
  readonly solved = output<void>();

  readonly listEl = viewChild.required<ElementRef<HTMLOListElement>>('listEl');

  readonly order = signal<BilingualText[]>([]);
  readonly attemptCount = signal(0);
  readonly wrongFlash = signal(false);
  readonly isSolved = signal(false);

  readonly draggingItem = signal<BilingualText | null>(null);
  readonly dragOffsetY = signal(0);
  readonly dragOriginTop = signal(0);

  private slotRects: { top: number; height: number }[] = [];
  private dragOriginHeight = 0;
  private dragStartClientY = 0;

  ngOnInit(): void {
    this.order.set(shuffleArray(this.config().itemsInCorrectOrder));
  }

  ngOnDestroy(): void {
    this.stopDragListeners();
  }

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  rotationFor(index: number): number {
    return SCRAP_ROTATIONS[index % SCRAP_ROTATIONS.length];
  }

  onDragStart(index: number, event: PointerEvent): void {
    if (this.isSolved()) return;
    event.preventDefault();

    const containerRect = this.listEl().nativeElement.getBoundingClientRect();
    const children = Array.from(this.listEl().nativeElement.children) as HTMLElement[];
    this.slotRects = children.map((el) => {
      const rect = el.getBoundingClientRect();
      return { top: rect.top - containerRect.top, height: rect.height };
    });

    this.dragOriginTop.set(this.slotRects[index].top);
    this.dragOriginHeight = this.slotRects[index].height;
    this.dragStartClientY = event.clientY;
    this.dragOffsetY.set(0);
    this.draggingItem.set(this.order()[index]);

    window.addEventListener('pointermove', this.onDragMove);
    window.addEventListener('pointerup', this.onDragEnd);
    window.addEventListener('pointercancel', this.onDragEnd);
  }

  private onDragMove = (event: PointerEvent): void => {
    const dragged = this.draggingItem();
    if (!dragged) return;

    const offsetY = event.clientY - this.dragStartClientY;
    this.dragOffsetY.set(offsetY);

    const targetIndex = resolveDropIndex(
      this.slotRects,
      this.dragOriginTop(),
      this.dragOriginHeight,
      offsetY,
    );
    const currentIndex = this.order().indexOf(dragged);
    if (targetIndex !== currentIndex) {
      this.order.update((items) => {
        const copy = [...items];
        copy.splice(currentIndex, 1);
        copy.splice(targetIndex, 0, dragged);
        return copy;
      });
    }
  };

  private onDragEnd = (): void => {
    this.draggingItem.set(null);
    this.dragOffsetY.set(0);
    this.stopDragListeners();
  };

  private stopDragListeners(): void {
    window.removeEventListener('pointermove', this.onDragMove);
    window.removeEventListener('pointerup', this.onDragEnd);
    window.removeEventListener('pointercancel', this.onDragEnd);
  }

  onSubmit(): void {
    const correctOrder = this.config().itemsInCorrectOrder;
    const isCorrect = this.order().every((item, i) => item === correctOrder[i]);
    if (isCorrect) {
      this.isSolved.set(true);
      return;
    }
    this.attemptCount.update((n) => n + 1);
    this.wrongFlash.set(true);
    setTimeout(() => this.wrongFlash.set(false), 1200);
  }
}
