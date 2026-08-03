import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { normalizeAnswer } from '../../fuzzy-match.util';
import { Language, WordleGuessMinigame } from '../../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../../ui-strings.data';

type LetterFeedback = 'correct' | 'present' | 'absent';

function computeFeedback(guess: string, target: string): LetterFeedback[] {
  const guessLetters = guess.toUpperCase().split('');
  const targetLetters = target.toUpperCase().split('');
  const feedback: LetterFeedback[] = new Array(guessLetters.length).fill('absent');
  const used = new Array(targetLetters.length).fill(false);

  for (let i = 0; i < guessLetters.length; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      feedback[i] = 'correct';
      used[i] = true;
    }
  }
  for (let i = 0; i < guessLetters.length; i++) {
    if (feedback[i] === 'correct') continue;
    const matchIndex = targetLetters.findIndex(
      (letter, j) => letter === guessLetters[i] && !used[j],
    );
    if (matchIndex !== -1) {
      feedback[i] = 'present';
      used[matchIndex] = true;
    }
  }
  return feedback;
}

/**
 * Uses its own letter-feedback as the hint system (the color feedback per
 * guess IS the hint), rather than the shared hint panel. Exhausting all
 * guesses simply reveals the word and lets her proceed — no failure state.
 */
@Component({
  selector: 'app-wordle-guess',
  imports: [FormsModule],
  template: `
    <div class="w-full max-w-sm">
      <p class="mb-4 text-lg font-semibold text-amber-900">{{ config().prompt[lang()] }}</p>

      <div class="mb-4 flex flex-col items-center gap-2">
        @for (guess of guesses(); track $index) {
          <div class="flex justify-center gap-1">
            @for (letter of guessLetters(guess); track $index; let i = $index) {
              <span
                class="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold text-white"
                [class.bg-emerald-600]="feedbackFor(guess)[i] === 'correct'"
                [class.bg-amber-500]="feedbackFor(guess)[i] === 'present'"
                [class.bg-slate-400]="feedbackFor(guess)[i] === 'absent'"
              >
                {{ letter }}
              </span>
            }
          </div>
        }
      </div>

      @if (!solvedLocally()) {
        <input
          type="text"
          [(ngModel)]="currentGuess"
          (keyup.enter)="onSubmitGuess()"
          [maxlength]="targetLength()"
          class="min-h-11 w-full touch-manipulation rounded-xl border-2 border-amber-300 px-4 py-3 text-center text-lg uppercase tracking-widest text-amber-900"
        />
        <button
          type="button"
          (click)="onSubmitGuess()"
          class="mt-3 min-h-11 w-full touch-manipulation rounded-xl bg-amber-800 py-3 font-bold text-white transition-transform active:scale-95"
        >
          {{ t('submit') }}
        </button>
        <p class="mt-2 text-center text-xs text-amber-600">
          {{ guesses().length }} / {{ config().maxGuesses }}
        </p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WordleGuessComponent {
  readonly config = input.required<WordleGuessMinigame>();
  readonly lang = input.required<Language>();
  readonly solved = output<void>();

  readonly guesses = signal<string[]>([]);
  readonly solvedLocally = signal(false);
  currentGuess = '';

  readonly targetLength = computed(
    () => this.config().targetWord[this.lang()].replace(/\s+/g, '').length,
  );

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  guessLetters(guess: string): string[] {
    return guess.toUpperCase().split('');
  }

  feedbackFor(guess: string): LetterFeedback[] {
    return computeFeedback(guess, this.config().targetWord[this.lang()]);
  }

  onSubmitGuess(): void {
    const guess = this.currentGuess.trim();
    if (!guess || guess.length !== this.targetLength()) return;

    this.guesses.update((g) => [...g, guess]);
    this.currentGuess = '';

    // Exact match only — the per-letter color feedback is the game's own
    // forgiveness mechanic, so guesses aren't fuzzy/typo-tolerant like the
    // free-text questions elsewhere.
    if (normalizeAnswer(guess) === normalizeAnswer(this.config().targetWord[this.lang()])) {
      this.solvedLocally.set(true);
      this.solved.emit();
      return;
    }

    if (this.guesses().length >= this.config().maxGuesses) {
      this.guesses.update((g) => [...g, this.config().targetWord[this.lang()]]);
      this.solvedLocally.set(true);
      this.solved.emit();
    }
  }
}
