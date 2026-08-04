export type Language = 'en' | 'es';

export interface BilingualText {
  en: string;
  es: string;
}

export type HuntPhase =
  | 'cover'
  | 'diary-intro'
  | 'stop-intro'
  | 'geo-check'
  | 'minigame'
  | 'photo-checkpoint'
  | 'personal-question'
  | 'letter-minigame'
  | 'stop-stamp'
  | 'finale-montage'
  | 'finale-video'
  | 'proposal-question'
  | 'epilogue';

export interface StopLocation {
  lat: number;
  lng: number;
  /** Advisory "arrived" threshold in meters — never a hard gate, a manual override always exists. */
  radiusMeters: number;
  label: BilingualText;
}

/** Nudge -> specific -> reveals the answer outright. */
export type HintTriplet = [BilingualText, BilingualText, BilingualText];

/** A run of narrative text: 'crossed' renders struck through, 'empty' renders as an unreadable ink blot. Plain prose omits `style`. */
export interface NarrativeRun {
  text: BilingualText;
  style?: 'crossed' | 'empty';
}

export type NarrativeParagraph = NarrativeRun[];

/** A riddle woven into the stop-intro narrative, gating the Continue button behind a correct guess. */
export interface NarrativeRiddle {
  poem: BilingualText;
  acceptedAnswers: BilingualText[];
  hints: HintTriplet;
}

interface MinigameBase {
  prompt: BilingualText;
  hints: HintTriplet;
}

export interface RiddleMcMinigame extends MinigameBase {
  kind: 'riddle-mc';
  options: BilingualText[];
  correctIndex: number;
}

export interface WordScrambleMinigame extends MinigameBase {
  kind: 'word-scramble';
  answer: BilingualText;
}

export interface WordleGuessMinigame extends MinigameBase {
  kind: 'wordle-guess';
  targetWord: BilingualText;
  maxGuesses: number;
}

export interface SequenceReorderMinigame extends MinigameBase {
  kind: 'sequence-reorder';
  itemsInCorrectOrder: BilingualText[];
}

export interface SlidingTilePuzzleMinigame extends MinigameBase {
  kind: 'sliding-tile-puzzle';
  gridSize: 3 | 4;
}

/** No hints — the sand-dot reveal is its own hint system, always tappable to completion. */
export interface ShakeToRevealMinigame {
  kind: 'shake-to-reveal';
  prompt: BilingualText;
  revealedWord: BilingualText;
}

export interface JigsawPuzzleMinigame extends MinigameBase {
  kind: 'jigsaw-puzzle';
  pieceCount: 9 | 12;
}

export interface MemoryMatchMinigame extends MinigameBase {
  kind: 'memory-match';
  pairs: BilingualText[];
}

export type MinigameConfig =
  | RiddleMcMinigame
  | WordScrambleMinigame
  | WordleGuessMinigame
  | SequenceReorderMinigame
  | SlidingTilePuzzleMinigame
  | ShakeToRevealMinigame
  | JigsawPuzzleMinigame
  | MemoryMatchMinigame;

interface QuestionBase {
  question: BilingualText;
  hints: HintTriplet;
}

export interface MultipleChoiceQuestion extends QuestionBase {
  kind: 'multiple-choice';
  options: BilingualText[];
  correctIndex: number;
}

export interface FreeTextQuestion extends QuestionBase {
  kind: 'free-text';
  acceptedAnswers: BilingualText[];
}

export interface NotebookCodeQuestion extends QuestionBase {
  kind: 'notebook-code';
  /** Stop orders whose notebookInstruction letters combine into the expected code, in order. */
  referencedStopOrders: number[];
  acceptedAnswers: BilingualText[];
}

export type PersonalQuestionConfig =
  | MultipleChoiceQuestion
  | FreeTextQuestion
  | NotebookCodeQuestion;

interface LetterMinigameBase {
  /** The notebook letter this minigame reveals, e.g. 'R'. */
  letter: string;
}

/** Charge a meter via rapid taps (it decays if tapped too slowly), then hit — repeat until the wall breaks and the letter is revealed. */
export interface WallBreakLetterMinigame extends LetterMinigameBase {
  kind: 'wall-break';
  hitsRequired: number;
}

/** Swipe/drag to physically erase a dirt texture off a canvas until enough of the letter beneath is uncovered. */
export interface DirtWipeLetterMinigame extends LetterMinigameBase {
  kind: 'dirt-wipe';
  clearThresholdPercent: number;
}

/** Classic Tower of Hanoi: move every disc from the first peg to the last, never placing a bigger disc on a smaller one. */
export interface TowerOfHanoiLetterMinigame extends LetterMinigameBase {
  kind: 'tower-of-hanoi';
  discCount: number;
}

export type BurgerIngredientKind = 'bun-bottom' | 'meat' | 'cheese' | 'lettuce' | 'onion' | 'bun-top';

/** Tap ingredients from a shuffled tray, in the right order, to stack a burger bottom-to-top. */
export interface BurgerBuildLetterMinigame extends LetterMinigameBase {
  kind: 'burger-build';
  ingredientsInOrder: BurgerIngredientKind[];
}

/** Navigate a procedurally-generated maze from top-left to bottom-right using directional buttons. */
export interface MazeLetterMinigame extends LetterMinigameBase {
  kind: 'maze';
  cols: number;
  rows: number;
}

export type LetterMinigameConfig =
  | WallBreakLetterMinigame
  | DirtWipeLetterMinigame
  | TowerOfHanoiLetterMinigame
  | BurgerBuildLetterMinigame
  | MazeLetterMinigame;

export interface Stop {
  id: string;
  order: number;
  chapterImage: string;
  /** Overrides the page number printed at the bottom of the stop-intro journal page. Defaults to `order`. */
  pageNumber?: number;
  isFinale: boolean;
  title: BilingualText;
  narrative: BilingualText;
  /** Rich, tagged version of the intro narrative (crossed-out / redacted runs). Replaces `narrative` on stop-intro when present. */
  narrativeRich?: NarrativeParagraph[];
  /** Gates the stop-intro Continue button behind a riddle answer, when present. */
  narrativeRiddle?: NarrativeRiddle;
  /** Omitted on the finale stop — the journey already ended at the last regular stop, so there's nowhere new to travel to and the geo-check phase is skipped entirely. */
  location?: StopLocation;
  /** Omitted on the finale stop. */
  minigame?: MinigameConfig;
  photoCheckpoint?: { prompt: BilingualText };
  /** Omitted on the finale stop. */
  personalQuestion?: PersonalQuestionConfig;
  /** Shown as its own screen right before stop-stamp when present, revealing the notebook letter through play instead of a static callout. */
  letterMinigame?: LetterMinigameConfig;
  notebookInstruction?: BilingualText;
}

export interface StopProgress {
  arrived: boolean;
  minigameSolved: boolean;
  photoDataUrl: string | null;
  personalQuestionSolved: boolean;
  stampCollected: boolean;
}

export interface HuntProgress {
  language: Language | null;
  /** Index into the fixed, authored HUNT_STOPS array — stops are always visited in this order. */
  currentStopIndex: number;
  currentPhase: HuntPhase;
  stops: Record<string, StopProgress>;
  devModeUnlocked: boolean;
  epilogueUnlocked: boolean;
}
