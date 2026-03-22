import {
  Component,
  input,
  output,
  signal,
  OnInit,
  ChangeDetectionStrategy,
  effect,
} from '@angular/core';

type CellState = 'idle' | 'highlighted' | 'selected-correct' | 'selected-wrong';

interface MemoryCell {
  index: number;
  state: CellState;
}

@Component({
  selector: 'app-memory-game',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .grid-cell { aspect-ratio: 1 / 1; }
  `],
  template: `
    <div class="grow flex flex-col items-center justify-center p-6 bg-[#0f172a]">
      @if (phase() === 'watching') {
        <p class="text-sm text-slate-500 font-semibold mb-4 uppercase tracking-wider animate-pulse">
          Watch the sequence…
        </p>
      } @else {
        <p class="text-sm text-blue-400 font-semibold mb-4 uppercase tracking-wider">
          Tap the highlighted cells!
        </p>
      }

      <div class="grid grid-cols-3 gap-2 w-full max-w-70">
        @for (cell of cells(); track cell.index) {
          <div
            class="grid-cell rounded-xl cursor-pointer transition-colors duration-150"
            [class]="cellClass(cell)"
            (click)="onCellClick(cell.index)">
          </div>
        }
      </div>
    </div>
  `,
})
export class MemoryGameComponent implements OnInit {
  public readonly active       = input.required<boolean>();
  public readonly memoryLevel  = input.required<number>();
  public readonly correct      = output<void>();
  public readonly wrong        = output<void>();

  public readonly cells        = signal<MemoryCell[]>(
    Array.from({ length: 9 }, (_, i) => ({ index: i, state: 'idle' }))
  );
  public readonly phase      = signal<'watching' | 'input'>('watching');

  private pattern   : number[]  = [];
  private userInput : number[]  = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;

  public ngOnInit(): void {
    this.startRound();
  }

  /**
   * Starts a new round by generating a pattern and flashing cells.
   */
  public startRound(): void {
    this.pattern   = [];
    this.userInput = [];
    this.phase.set('watching');
    this.resetCells();

    // Build unique random pattern
    while (this.pattern.length < this.memoryLevel()) {
      const r = Math.floor(Math.random() * 9);
      if (!this.pattern.includes(r)) this.pattern.push(r);
    }

    // Flash pattern one by one
    let i = 0;
    this.intervalId = setInterval(() => {
      if (i < this.pattern.length) {
        const idx = this.pattern[i];
        this.setCellState(idx, 'highlighted');
        setTimeout(() => this.setCellState(idx, 'idle'), 400);
        i++;
      } else {
        clearInterval(this.intervalId!);
        this.intervalId = null;
        this.phase.set('input');
      }
    }, 600);
  }

  /**
   * Handles cell interaction logic.
   */
  public onCellClick(index: number): void {
    if (this.phase() !== 'input') return;
    if (this.userInput.includes(index)) return;

    this.userInput.push(index);
    const position = this.userInput.indexOf(index);

    if (this.pattern.length > position && this.pattern[position] === index) {
      this.setCellState(index, 'selected-correct');
      if (this.userInput.length === this.pattern.length) {
        this.correct.emit();
        setTimeout(() => this.startRound(), 500);
      }
    } else {
      this.phase.set('watching');
      this.setCellState(index, 'selected-wrong');
      this.wrong.emit();
      setTimeout(() => this.startRound(), 500);
    }
  }

  /**
   * Returns Tailwind classes for the cells in dark mode.
   */
  public cellClass(cell: MemoryCell): string {
    switch (cell.state) {
      case 'highlighted':      return 'bg-purple-500 shadow-lg shadow-purple-500/20';
      case 'selected-correct': return 'bg-blue-500 shadow-lg shadow-blue-500/20';
      case 'selected-wrong':   return 'bg-red-500 shadow-lg shadow-red-500/20';
      default:                 return 'bg-slate-800 border border-slate-700 hover:bg-slate-700';
    }
  }

  private setCellState(index: number, state: CellState): void {
    this.cells.update((cells) =>
      cells.map((c) => (c.index === index ? { ...c, state } : c))
    );
  }

  private resetCells(): void {
    this.cells.set(
      Array.from({ length: 9 }, (_, i) => ({ index: i, state: 'idle' }))
    );
  }
}