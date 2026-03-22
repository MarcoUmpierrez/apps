import {
  Component,
  signal,
  computed,
  effect,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameMode, GameStoreService } from '../services/game-store.service';
import { TimerBarComponent } from '../timer-bar/timer-bar.component';
import { ResultOverlayComponent } from '../result-overlay/result-overlay.component';
import { FeedbackComponent } from '../feedback/feedback.component';
import { MathGameComponent } from './math-game/math-game.component';
import { MemoryGameComponent } from './memory-game/memory-game.component';
import { PairsGameComponent } from './pairs-game/pairs-game.component';

const MATH_MODES: GameMode[] = ['math', 'multiply', 'divide'];

const GAME_TITLES: Record<GameMode, string> = {
  math: 'ARITHMETIC',
  multiply: 'MULTIPLICATION',
  divide: 'DIVISION',
  memory: 'MEMORY GRID',
  pairs: 'FIND PAIRS',
};

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    TimerBarComponent,
    ResultOverlayComponent,
    FeedbackComponent,
    MathGameComponent,
    MemoryGameComponent,
    PairsGameComponent,
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent implements OnInit, OnDestroy {
  private readonly route  = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store  = inject(GameStoreService);

  // Game state
  readonly mode         = signal<GameMode>('math');
  readonly streak       = signal<number>(0);
  readonly memoryLevel  = signal<number>(3);
  readonly gameActive   = signal<boolean>(false);

  // Timer
  readonly timeLeft     = signal<number>(0);
  readonly maxTime      = signal<number>(0);

  // UI flags
  readonly showResult      = signal<boolean>(false);
  readonly showFeedback    = signal<boolean>(false);
  readonly feedbackCorrect = signal<boolean>(true);
  readonly isShaking       = signal<boolean>(false);

  readonly gameTitle = computed(() => GAME_TITLES[this.mode()]);

  private intervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    const m = this.route.snapshot.paramMap.get('mode') as GameMode;
    this.mode.set(m ?? 'math');
    this.startGame();
  }

  ngOnDestroy(): void {
    this.clearCountdown();
  }

  startGame(): void {
    const timer = this.store.timerFor(this.mode());
    this.streak.set(0);
    this.memoryLevel.set(3);
    this.showResult.set(false);
    this.maxTime.set(timer);
    this.timeLeft.set(timer);
    this.gameActive.set(true);
    this.startCountdown();
  }

  tryAgain(): void {
    this.startGame();
  }

  exitToMenu(): void {
    this.clearCountdown();
    this.gameActive.set(false);
    this.router.navigate(['/brain']);
  }

  onCorrect(): void {
    this.streak.update((s) => s + 1);
    this.showFeedbackFor(true);
    this.resetTimer();
  }

  onWrong(): void {
    this.showFeedbackFor(false);
    this.triggerShake();
  }

  onMemoryCorrect(): void {
    this.streak.update((s) => s + 1);
    this.memoryLevel.update((l) => Math.min(l + 1, 8));
    this.showFeedbackFor(true);
    this.resetTimer();
  }

  onMemoryWrong(): void {
    this.memoryLevel.update((l) => Math.max(l - 1, 3));
    this.showFeedbackFor(false);
    this.triggerShake();
  }

  private resetTimer(): void {
    const timer = this.store.timerFor(this.mode());
    this.maxTime.set(timer);
    this.timeLeft.set(timer);
  }

  private startCountdown(): void {
    this.clearCountdown();
    this.intervalId = setInterval(() => {
      if (!this.gameActive()) return;
      this.timeLeft.update((t) => {
        const next = +(t - 0.1).toFixed(1);
        if (next <= 0) {
          this.endGame();
          return 0;
        }
        return next;
      });
    }, 100);
  }

  private clearCountdown(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private endGame(): void {
    this.clearCountdown();
    this.gameActive.set(false);
    this.store.addScore(this.streak());
    this.showResult.set(true);
  }

  private showFeedbackFor(correct: boolean): void {
    this.feedbackCorrect.set(correct);
    this.showFeedback.set(true);
    setTimeout(() => this.showFeedback.set(false), 400);
  }

  private triggerShake(): void {
    this.isShaking.set(true);
    setTimeout(() => this.isShaking.set(false), 400);
  }
}
