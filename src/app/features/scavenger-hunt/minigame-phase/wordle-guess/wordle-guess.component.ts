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
      <p class="mb-2 font-['Spectral',serif] text-[15px] leading-relaxed text-[#33261a]">
        {{ config().prompt[lang()] }}
      </p>
      <p class="mb-4 font-['Kalam',cursive] text-sm text-[#8a7550]">{{ lengthHint() }}</p>

      <div class="mb-4 flex flex-col items-center gap-2">
        @for (guess of guesses(); track $index) {
          <div class="flex justify-center gap-1.5">
            @for (letter of guessLetters(guess); track $index; let i = $index) {
              <span
                class="flex h-10 w-10 items-center justify-center rounded-sm font-['Spectral',serif] text-lg text-[#e9dec5]"
                [class.bg-[#4a7a54]]="feedbackFor(guess)[i] === 'correct'"
                [class.bg-[#c9a86a]]="feedbackFor(guess)[i] === 'present'"
                [class.bg-[#3a2c1c]]="feedbackFor(guess)[i] === 'absent'"
                [class.opacity-70]="feedbackFor(guess)[i] === 'absent'"
              >
                {{ letter }}
              </span>
            }
          </div>
        }
      </div>

      @if (solvedLocally()) {
        <div class="flex flex-col items-center gap-4 text-center">
          <p class="font-['Caveat',cursive] text-3xl text-[#3a3f6b]">🎉 {{ t('wellDone') }}</p>
          <button
            type="button"
            (click)="solved.emit()"
            class="min-h-14 w-full touch-manipulation border border-[#3a2c1c]/45 py-4 font-['Spectral',serif] text-xs tracking-[.24em] text-[#33261a] uppercase transition-transform active:scale-95"
          >
            {{ t('continueLabel') }}
          </button>
        </div>
      } @else {
        <input
          type="text"
          [(ngModel)]="currentGuess"
          (keyup.enter)="onSubmitGuess()"
          [maxlength]="targetLength()"
          [placeholder]="t('writeItHere')"
          class="min-h-11 w-full touch-manipulation border-0 border-b border-[#3a2c1c]/40 bg-transparent px-1 py-3 text-center font-['Spectral',serif] text-lg tracking-[.3em] text-[#3a2c1c] uppercase outline-none placeholder:normal-case focus:border-[#3a3f6b]"
        />
        <button
          type="button"
          (click)="onSubmitGuess()"
          class="mt-4 min-h-11 w-full touch-manipulation border border-[#3a2c1c]/45 py-3 font-['Spectral',serif] text-xs tracking-[.2em] text-[#33261a] uppercase transition-transform active:scale-95"
        >
          {{ t('submit') }}
        </button>
        <p class="mt-2 text-center font-['Spectral',serif] text-xs tracking-[.15em] text-[#8a7550] uppercase">
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
  readonly lengthHint = computed(() =>
    translateUi(this.lang(), 'wordleLengthHint', { length: this.targetLength() }),
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
      return;
    }

    if (this.guesses().length >= this.config().maxGuesses) {
      this.guesses.update((g) => [...g, this.config().targetWord[this.lang()]]);
      this.solvedLocally.set(true);
    }
  }
}
