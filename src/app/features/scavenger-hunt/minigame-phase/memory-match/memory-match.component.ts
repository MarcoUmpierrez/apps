import { ChangeDetectionStrategy, Component, OnInit, input, output, signal } from '@angular/core';
import { HintPanelComponent } from '../../hint-panel/hint-panel.component';
import { Language, MemoryMatchMinigame } from '../../scavenger-hunt.types';
import { shuffleArray } from '../../shuffle.util';

interface MemoryCard {
  id: number;
  pairIndex: number;
  matched: boolean;
}

@Component({
  selector: 'app-memory-match',
  imports: [HintPanelComponent],
  template: `
    <div class="w-full max-w-sm">
      <p class="mb-3 text-lg font-semibold text-amber-900">{{ config().prompt[lang()] }}</p>
      <div class="grid grid-cols-4 gap-2">
        @for (card of cards(); track card.id) {
          <button
            type="button"
            (click)="onCardClick(card)"
            [disabled]="card.matched"
            class="flex aspect-square min-h-11 touch-manipulation items-center justify-center rounded-lg border-2 border-amber-300 bg-amber-800 p-1 text-center text-xs font-bold text-white"
            [class.bg-white]="isFaceUp(card) || card.matched"
            [class.text-amber-900]="isFaceUp(card) || card.matched"
            [class.opacity-50]="card.matched"
          >
            @if (isFaceUp(card) || card.matched) {
              {{ config().pairs[card.pairIndex][lang()] }}
            } @else {
              ❓
            }
          </button>
        }
      </div>
      <app-hint-panel [hints]="config().hints" [lang]="lang()" (revealed)="solved.emit()" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemoryMatchComponent implements OnInit {
  readonly config = input.required<MemoryMatchMinigame>();
  readonly lang = input.required<Language>();
  readonly solved = output<void>();

  readonly cards = signal<MemoryCard[]>([]);
  readonly flippedIds = signal<number[]>([]);
  private busy = false;

  ngOnInit(): void {
    const pairCount = this.config().pairs.length;
    const deck: MemoryCard[] = [];
    for (let pairIndex = 0; pairIndex < pairCount; pairIndex++) {
      deck.push({ id: pairIndex * 2, pairIndex, matched: false });
      deck.push({ id: pairIndex * 2 + 1, pairIndex, matched: false });
    }
    this.cards.set(shuffleArray(deck));
  }

  isFaceUp(card: MemoryCard): boolean {
    return this.flippedIds().includes(card.id);
  }

  onCardClick(card: MemoryCard): void {
    if (this.busy || card.matched || this.isFaceUp(card)) return;

    const flipped = [...this.flippedIds(), card.id];
    this.flippedIds.set(flipped);

    if (flipped.length < 2) return;

    this.busy = true;
    const [firstId, secondId] = flipped;
    const first = this.cards().find((c) => c.id === firstId);
    const second = this.cards().find((c) => c.id === secondId);

    if (first && second && first.pairIndex === second.pairIndex) {
      this.cards.update((cards) =>
        cards.map((c) => (c.id === firstId || c.id === secondId ? { ...c, matched: true } : c)),
      );
      this.flippedIds.set([]);
      this.busy = false;
      if (this.cards().every((c) => c.matched)) {
        this.solved.emit();
      }
    } else {
      setTimeout(() => {
        this.flippedIds.set([]);
        this.busy = false;
      }, 900);
    }
  }
}
