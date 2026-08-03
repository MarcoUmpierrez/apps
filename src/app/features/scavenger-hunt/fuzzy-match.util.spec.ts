import { levenshteinDistance, isAnswerCorrect, normalizeAnswer } from './fuzzy-match.util';
import { BilingualText } from './scavenger-hunt.types';

describe('normalizeAnswer', () => {
  it('trims, lowercases, and collapses whitespace', () => {
    expect(normalizeAnswer('  Hello   World  ')).toBe('hello world');
  });

  it('strips accents', () => {
    expect(normalizeAnswer('café atardecer niño')).toBe('cafe atardecer nino');
  });

  it('strips punctuation', () => {
    expect(normalizeAnswer("It's a starfish!")).toBe('its a starfish');
  });
});

describe('levenshteinDistance', () => {
  it('is zero for identical strings', () => {
    expect(levenshteinDistance('sunset', 'sunset')).toBe(0);
  });

  it('counts a single substitution', () => {
    expect(levenshteinDistance('sunset', 'sunser')).toBe(1);
  });

  it('counts insertions and deletions', () => {
    expect(levenshteinDistance('cat', 'cats')).toBe(1);
    expect(levenshteinDistance('cats', 'cat')).toBe(1);
  });
});

describe('isAnswerCorrect', () => {
  const accepted: BilingualText[] = [{ en: 'yours', es: 'tuya' }];

  it('matches an exact answer', () => {
    expect(isAnswerCorrect('yours', accepted, 'en')).toBe(true);
  });

  it('matches case-insensitively and ignores surrounding whitespace', () => {
    expect(isAnswerCorrect('  YOURS  ', accepted, 'en')).toBe(true);
  });

  it('tolerates a minor typo', () => {
    expect(isAnswerCorrect('yorus', accepted, 'en')).toBe(true);
  });

  it('rejects an unrelated answer', () => {
    expect(isAnswerCorrect('mine', accepted, 'en')).toBe(false);
  });

  it('rejects an empty answer', () => {
    expect(isAnswerCorrect('   ', accepted, 'en')).toBe(false);
  });

  it('matches the Spanish accepted answer when lang is es', () => {
    expect(isAnswerCorrect('tuya', accepted, 'es')).toBe(true);
    expect(isAnswerCorrect('tuya', accepted, 'en')).toBe(false);
  });
});
