export type NoteType = 'blow' | 'draw';
export type DifficultyLevel = 'easy' | 'normal' | 'hard';
export type HarmonicaKey = 'G' | 'Ab' | 'A' | 'Bb' | 'B' | 'C' | 'Db' | 'D' | 'Eb' | 'E' | 'F' | 'F#';

export interface SongNote {
  t: number;
  h: number;
  type: NoteType;
}

export interface Song {
  name: string;
  desc: string;
  notes: SongNote[];
}

export interface HoleFrequency {
  blow: number;
  draw: number;
}

export const SONGS: Record<string, Song> = {
  oh_susanna: {
    name: 'Oh Susanna',
    desc: 'Complete melody (Alabama)',
    notes: [
      // Estrofa 1
      { t: 1000, h: 4, type: 'blow' }, { t: 1400, h: 4, type: 'draw' },
      { t: 1800, h: 5, type: 'blow' }, { t: 2200, h: 6, type: 'blow' },
      { t: 2600, h: 6, type: 'blow' }, { t: 3000, h: 6, type: 'draw' },
      { t: 3400, h: 6, type: 'blow' }, { t: 3800, h: 5, type: 'blow' },
      { t: 4400, h: 4, type: 'blow' }, { t: 4800, h: 4, type: 'draw' },
      { t: 5200, h: 5, type: 'blow' }, { t: 5600, h: 5, type: 'blow' },
      { t: 6000, h: 4, type: 'draw' }, { t: 6400, h: 4, type: 'blow' },
      { t: 6800, h: 4, type: 'draw' },
      // Estrofa 2
      { t: 7600, h: 4, type: 'blow' }, { t: 8000, h: 4, type: 'draw' },
      { t: 8400, h: 5, type: 'blow' }, { t: 8800, h: 6, type: 'blow' },
      { t: 9200, h: 6, type: 'blow' }, { t: 9600, h: 6, type: 'draw' },
      { t: 10000, h: 6, type: 'blow' }, { t: 10400, h: 5, type: 'blow' },
      { t: 11000, h: 4, type: 'blow' }, { t: 11400, h: 4, type: 'draw' },
      { t: 11800, h: 5, type: 'blow' }, { t: 12200, h: 5, type: 'blow' },
      { t: 12600, h: 4, type: 'draw' }, { t: 13000, h: 4, type: 'draw' },
      { t: 13400, h: 4, type: 'blow' },
      // Estrofa 3
      { t: 14200, h: 4, type: 'blow' }, { t: 14600, h: 4, type: 'draw' },
      { t: 15000, h: 5, type: 'blow' }, { t: 15400, h: 6, type: 'blow' },
      { t: 15800, h: 6, type: 'blow' }, { t: 16200, h: 6, type: 'draw' },
      { t: 16600, h: 6, type: 'blow' }, { t: 17000, h: 5, type: 'blow' },
      { t: 17400, h: 4, type: 'blow' },
      { t: 18000, h: 4, type: 'draw' }, { t: 18400, h: 5, type: 'blow' },
      { t: 18800, h: 5, type: 'blow' }, { t: 19200, h: 4, type: 'draw' },
      { t: 19600, h: 4, type: 'blow' }, { t: 20000, h: 4, type: 'draw' },
      // Estrofa 4
      { t: 20800, h: 4, type: 'blow' }, { t: 21200, h: 4, type: 'draw' },
      { t: 21600, h: 5, type: 'blow' }, { t: 22000, h: 6, type: 'blow' },
      { t: 22400, h: 6, type: 'blow' }, { t: 22800, h: 6, type: 'draw' },
      { t: 23200, h: 6, type: 'blow' }, { t: 23600, h: 5, type: 'blow' },
      { t: 24000, h: 4, type: 'blow' },
      { t: 24600, h: 4, type: 'draw' }, { t: 25000, h: 5, type: 'blow' },
      { t: 25400, h: 5, type: 'blow' }, { t: 25800, h: 4, type: 'draw' },
      { t: 26200, h: 4, type: 'draw' }, { t: 26600, h: 4, type: 'blow' },
      // Estribillo
      { t: 27800, h: 5, type: 'draw' }, { t: 28200, h: 5, type: 'draw' },
      { t: 28600, h: 6, type: 'draw' }, { t: 29000, h: 6, type: 'draw' },
      { t: 29400, h: 6, type: 'draw' }, { t: 29800, h: 6, type: 'blow' },
      { t: 30200, h: 6, type: 'blow' }, { t: 30600, h: 5, type: 'blow' },
      { t: 31000, h: 4, type: 'blow' }, { t: 31400, h: 4, type: 'draw' },
      // Final Alabama
      { t: 32200, h: 4, type: 'blow' }, { t: 32600, h: 4, type: 'draw' },
      { t: 33000, h: 5, type: 'blow' }, { t: 33400, h: 6, type: 'blow' },
      { t: 33800, h: 6, type: 'draw' }, { t: 34200, h: 6, type: 'blow' },
      { t: 34600, h: 5, type: 'blow' },
      { t: 35200, h: 4, type: 'blow' }, { t: 35600, h: 4, type: 'draw' },
      { t: 36000, h: 5, type: 'blow' }, { t: 36400, h: 5, type: 'blow' },
      { t: 36800, h: 4, type: 'draw' }, { t: 37200, h: 4, type: 'draw' },
      { t: 37600, h: 4, type: 'blow' },
    ],
  },
  blues_riff: {
    name: 'Shuffle Riff',
    desc: 'Typical blues',
    notes: [
      { t: 1000, h: 2, type: 'draw' }, { t: 1500, h: 3, type: 'draw' }, { t: 2000, h: 4, type: 'blow' },
      { t: 2500, h: 4, type: 'draw' }, { t: 3500, h: 2, type: 'draw' }, { t: 4000, h: 3, type: 'draw' },
      { t: 4500, h: 4, type: 'blow' }, { t: 5000, h: 4, type: 'draw' },
    ],
  },
};

export const BASE_FREQUENCIES: Record<number, HoleFrequency> = {
  1: { blow: 261.63, draw: 293.66 },
  2: { blow: 329.63, draw: 392.00 },
  3: { blow: 392.00, draw: 493.88 },
  4: { blow: 523.25, draw: 587.33 },
  5: { blow: 659.25, draw: 698.46 },
  6: { blow: 783.99, draw: 880.00 },
  7: { blow: 987.77, draw: 1046.50 },
  8: { blow: 1318.51, draw: 1174.66 },
  9: { blow: 1567.98, draw: 1396.91 },
  10: { blow: 2093.00, draw: 1760.00 },
};

export const KEYS: HarmonicaKey[] = ['G', 'Ab', 'A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'F#'];

export const SEMITONES_FROM_C: Record<HarmonicaKey, number> = {
  G: -5, Ab: -4, A: -3, Bb: -2, B: -1, C: 0,
  Db: 1, D: 2, Eb: 3, E: 4, F: 5, 'F#': 6,
};

export const SHOUTS = ['¡Genial!', '¡Increíble!', '¡Perfecto!', '¡Fuego!', '¡Imparable!', '¡Maestro!', '¡Legendario!'];

export const DIFFICULTY_SPEEDS: Record<DifficultyLevel, number> = { easy: 0.3, normal: 0.5, hard: 0.8 };

export const MIN_SPAWN_GAP = 600;
export const LANE_COUNT = 10;
export const LANES = Array.from({ length: LANE_COUNT }, (_, i) => i + 1);
