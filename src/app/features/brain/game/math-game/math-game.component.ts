import {
  Component,
  input,
  output,
  signal,
  OnInit,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';
import { GameMode } from '../../services/game-store.service';
import { NumpadComponent, NumpadKey } from '../../numpad/numpad.component';

interface MathQuestion {
  a: number;
  op: string;
  b: number;
  answer: number;
}

function generateQuestion(mode: GameMode): MathQuestion {
  switch (mode) {
    case 'multiply': {
      const a = Math.floor(Math.random() * 11) + 2;
      const b = Math.floor(Math.random() * 11) + 2;
      return { a, op: '×', b, answer: a * b };
    }
    case 'divide': {
      const b       = Math.floor(Math.random() * 9) + 2;
      const quotient = Math.floor(Math.random() * 10) + 1;
      const a        = b * quotient;
      return { a, op: '÷', b, answer: quotient };
    }
    default: {
      let a = Math.floor(Math.random() * 20) + 1;
      let b = Math.floor(Math.random() * 20) + 1;
      const addSub = Math.random() > 0.5 ? '+' : '-';
      if (addSub === '-' && b > a) [a, b] = [b, a];
      return { a, op: addSub, b, answer: addSub === '+' ? a + b : a - b };
    }
  }
}

@Component({
  selector: 'app-math-game',
  standalone: true,
  imports: [NumpadComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grow flex flex-col items-center justify-center p-6 text-center bg-[#0f172a]">
      <div class="text-6xl font-bold text-slate-100 mb-6 tabular-nums tracking-tight">
        {{ question().a }} {{ question().op }} {{ question().b }}
      </div>
      <div class="text-4xl font-mono border-b-4 border-blue-500 min-w-30 h-16
                  flex items-center justify-center font-bold"
           [class]="currentAnswer() ? 'text-blue-400' : 'text-slate-700'">
        {{ currentAnswer() || '?' }}
      </div>
    </div>

    <app-numpad (keyPressed)="onKey($event)" />
  `,
})
export class MathGameComponent implements OnInit {
  readonly mode    = input.required<GameMode>();
  readonly active  = input.required<boolean>();
  readonly correct = output<void>();
  readonly wrong   = output<void>();

  readonly question     = signal<MathQuestion>({ a: 0, op: '+', b: 0, answer: 0 });
  readonly currentAnswer = signal<string>('');

  ngOnInit(): void {
    this.newQuestion();
  }

  newQuestion(): void {
    this.question.set(generateQuestion(this.mode()));
    this.currentAnswer.set('');
  }

  onKey(key: NumpadKey): void {
    if (!this.active()) return;
    if (key === 'C') {
      this.currentAnswer.set('');
      return;
    }
    if (key === 'OK') {
      this.checkAnswer();
      return;
    }
    // Digit
    const next = this.currentAnswer() + key.toString();
    if (next.length > 4) return;
    this.currentAnswer.set(next);

    // Auto-submit when length matches expected answer length
    const target = this.question().answer;
    if (next.length >= target.toString().length && parseInt(next, 10) === target) {
      this.checkAnswer();
    }
  }

  private checkAnswer(): void {
    if (parseInt(this.currentAnswer(), 10) === this.question().answer) {
      this.correct.emit();
      this.newQuestion();
    } else {
      this.wrong.emit();
      this.currentAnswer.set('');
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyboard(e: KeyboardEvent): void {
    if (!this.active()) return;
    if (e.key >= '0' && e.key <= '9') this.onKey(parseInt(e.key, 10) as NumpadKey);
    if (e.key === 'Backspace')         this.onKey('C');
    if (e.key === 'Enter')             this.onKey('OK');
  }
}
