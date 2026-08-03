import { BilingualText, Language } from './scavenger-hunt.types';

const COMBINING_DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g');

export function normalizeAnswer(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS, '')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ');
}

export function levenshteinDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const table: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));

  for (let i = 0; i < rows; i++) table[i][0] = i;
  for (let j = 0; j < cols; j++) table[0][j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      table[i][j] = Math.min(table[i - 1][j] + 1, table[i][j - 1] + 1, table[i - 1][j - 1] + cost);
    }
  }

  return table[rows - 1][cols - 1];
}

/**
 * A single-letter transposition ("yorus" vs "yours") costs 2 in Levenshtein
 * distance, not 1 — and is exactly the kind of typo a phone keyboard
 * produces constantly, so tolerance needs to comfortably cover it rather
 * than just single insert/delete/substitute typos.
 */
function toleranceFor(length: number): number {
  if (length <= 4) return 1;
  if (length <= 8) return 2;
  return 3;
}

export function isAnswerCorrect(
  userInput: string,
  acceptedAnswers: BilingualText[],
  lang: Language,
): boolean {
  const normalized = normalizeAnswer(userInput);
  if (!normalized) return false;

  const candidates = acceptedAnswers.map((answer) => normalizeAnswer(answer[lang]));
  if (candidates.includes(normalized)) return true;

  return candidates.some(
    (candidate) => levenshteinDistance(normalized, candidate) <= toleranceFor(candidate.length),
  );
}
