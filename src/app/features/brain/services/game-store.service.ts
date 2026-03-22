import { Injectable, signal, effect } from '@angular/core';

export type GameMode = 'math' | 'multiply' | 'divide' | 'memory' | 'pairs';

export interface GameMenuItem {
  mode: GameMode;
  label: string;
  emoji: string;
  subtitle: string;
  borderColor: string;
  bgHover: string;
  iconBg: string;
}

export const GAME_MENU_ITEMS: GameMenuItem[] = [
  { mode: 'math',     label: 'Arithmetic',     emoji: '➕', subtitle: 'Fast Add / Sub.',  borderColor: 'border-blue-900',   bgHover: 'hover:bg-blue-900/30',   iconBg: 'bg-blue-900/50'   },
  { mode: 'multiply', label: 'Multiplication', emoji: '✖️', subtitle: 'Times tables.',     borderColor: 'border-emerald-900',bgHover: 'hover:bg-emerald-900/30',iconBg: 'bg-emerald-900/50'},
  { mode: 'divide',   label: 'Division',       emoji: '➗', subtitle: 'Whole quotients.',  borderColor: 'border-cyan-900',    bgHover: 'hover:bg-cyan-900/30',    iconBg: 'bg-cyan-900/50'    },
  { mode: 'memory',   label: 'Memory Grid',    emoji: '🧠', subtitle: 'Sequence recall.',  borderColor: 'border-purple-900',  bgHover: 'hover:bg-purple-900/30',  iconBg: 'bg-purple-900/50'  },
  { mode: 'pairs',    label: 'Find Pairs',     emoji: '🎴', subtitle: 'Clear the board.',  borderColor: 'border-orange-900',  bgHover: 'hover:bg-orange-900/30',  iconBg: 'bg-orange-900/50'  },
];

export const DEFAULT_TIMERS: Record<GameMode, number> = {
  math: 5,
  multiply: 8,
  divide: 10,
  memory: 12,
  pairs: 20,
};

@Injectable({ providedIn: 'root' })
export class GameStoreService {
  readonly globalScore = signal<number>(
    parseInt(localStorage.getItem('brainScore') ?? '0', 10)
  );

  readonly userTimers = signal<Record<GameMode, number>>(
    (JSON.parse(localStorage.getItem('brainTimers') ?? 'null') as Record<GameMode, number>) ??
      { ...DEFAULT_TIMERS }
  );

  constructor() {
    // Persist score changes automatically
    effect(() => {
      localStorage.setItem('brainScore', this.globalScore().toString());
    });
    // Persist timer changes automatically
    effect(() => {
      localStorage.setItem('brainTimers', JSON.stringify(this.userTimers()));
    });
  }

  addScore(points: number): void {
    this.globalScore.update((s) => s + points);
  }

  updateTimer(mode: GameMode, value: number): void {
    this.userTimers.update((t) => ({ ...t, [mode]: value }));
  }

  timerFor(mode: GameMode): number {
    return this.userTimers()[mode];
  }
}
