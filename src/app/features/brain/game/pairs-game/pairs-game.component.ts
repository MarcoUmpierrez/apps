import {
  Component,
  input,
  output,
  signal,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';

interface PairsCard {
  id: number;
  symbol: string;
  flipped: boolean;
  matched: boolean;
}

const ALL_ICONS = ['🐱', '🐶', '🐭', '🐹', '🐰', '🦊', '🐸', '🦁'];

@Component({
  selector: 'app-pairs-game',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .grid-cell { aspect-ratio: 1 / 1; perspective: 1000px; }

    .card-inner {
      position: relative;
      width: 100%;
      height: 100%;
      text-align: center;
      transition: transform 0.4s;
      transform-style: preserve-3d;
    }

    .card-flipped .card-inner {
      transform: rotateY(180deg);
    }

    .card-face {
      position: absolute;
      width: 100%;
      height: 100%;
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.75rem;
    }

    .card-back {
      background-color: #1e293b;
      color: #60a5fa;
      border: 2px solid #334155;
      font-weight: bold;
      font-size: 1.25rem;
    }

    .card-front {
      background-color: #1e293b;
      transform: rotateY(180deg);
      border: 2px solid #3b82f6;
      font-size: 1.875rem;
    }
  `],
  template: `
    <div class="grow flex flex-col items-center justify-center p-6 bg-[#0f172a]">
      <p class="text-sm text-slate-500 font-semibold mb-4 uppercase tracking-wider">
        {{ matchedCount() }} / 6 pairs found
      </p>
      <div class="grid grid-cols-3 gap-3 w-full max-w-75">
        @for (card of cards(); track card.id) {
          <div
            class="grid-cell cursor-pointer"
            [class.card-flipped]="card.flipped || card.matched"
            (click)="onCardClick(card.id)">
            <div class="card-inner">
              <div class="card-face card-back">?</div>
              <div class="card-face card-front"
                   [class.opacity-30]="card.matched"
                   [class.border-slate-700]="card.matched">
                {{ card.symbol }}
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class PairsGameComponent implements OnInit {
  public readonly active       = input.required<boolean>();
  public readonly correct      = output<void>();
  public readonly wrong        = output<void>();

  public readonly cards        = signal<PairsCard[]>([]);
  public readonly matchedCount = signal<number>(0);

  private flippedIds: number[] = [];
  private isChecking = false;

  public ngOnInit(): void {
    this.deal();
  }

  /**
   * Resets the game state and shuffles a new deck of 6 pairs.
   */
  public deal(): void {
    this.flippedIds  = [];
    this.isChecking  = false;
    this.matchedCount.set(0);

    const icons = ALL_ICONS.slice(0, 6);
    const deck = [...icons, ...icons]
      .map((symbol, id) => ({ id, symbol, flipped: false, matched: false }))
      .sort(() => Math.random() - 0.5);

    this.cards.set(deck);
  }

  /**
   * Handles card selection logic, including match checking.
   */
  public onCardClick(id: number): void {
    if (this.isChecking) return;
    const card = this.cards().find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;
    if (this.flippedIds.length >= 2) return;

    this.flipCard(id, true);
    this.flippedIds.push(id);

    if (this.flippedIds.length === 2) {
      this.isChecking = true;
      const [id1, id2] = this.flippedIds;
      const all = this.cards();
      const c1  = all.find((c) => c.id === id1)!;
      const c2  = all.find((c) => c.id === id2)!;

      if (c1.symbol === c2.symbol) {
        // Match!
        setTimeout(() => {
          this.markMatched(id1, id2);
          this.matchedCount.update((n) => n + 1);
          this.flippedIds  = [];
          this.isChecking  = false;

          if (this.matchedCount() === 6) {
            this.correct.emit();
            setTimeout(() => this.deal(), 800);
          }
        }, 300);
      } else {
        // No match
        setTimeout(() => {
          this.flipCard(id1, false);
          this.flipCard(id2, false);
          this.flippedIds = [];
          this.isChecking = false;
          this.wrong.emit();
        }, 800);
      }
    }
  }

  private flipCard(id: number, state: boolean): void {
    this.cards.update((cards) =>
      cards.map((c) => (c.id === id ? { ...c, flipped: state } : c))
    );
  }

  private markMatched(id1: number, id2: number): void {
    this.cards.update((cards) =>
      cards.map((c) =>
        c.id === id1 || c.id === id2 ? { ...c, matched: true, flipped: false } : c
      )
    );
  }
}