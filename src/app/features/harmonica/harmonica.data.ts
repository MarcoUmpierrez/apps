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
  mary_had_a_little_lamb: {
    name: 'Mary Had a Little Lamb',
    desc: 'Only holes 4-6, great for beginners',
    notes: [
      // Verse 1 — Mary had a little lamb, little lamb, little lamb
      { t: 1000, h: 5, type: 'blow' }, // E  Ma-
      { t: 1400, h: 4, type: 'draw' }, // D  -ry
      { t: 1800, h: 4, type: 'blow' }, // C  had
      { t: 2200, h: 4, type: 'draw' }, // D  a
      { t: 2600, h: 5, type: 'blow' }, // E  lit-
      { t: 3000, h: 5, type: 'blow' }, // E  -tle
      { t: 3600, h: 5, type: 'blow' }, // E  lamb, [half]
      { t: 4400, h: 4, type: 'draw' }, // D  lit-
      { t: 4800, h: 4, type: 'draw' }, // D  -tle
      { t: 5400, h: 4, type: 'draw' }, // D  lamb, [half]
      { t: 6200, h: 5, type: 'blow' }, // E  lit-
      { t: 6600, h: 6, type: 'blow' }, // G  -tle
      { t: 7200, h: 6, type: 'blow' }, // G  lamb. [half]
      // Verse 2 — Mary had a little lamb, its fleece was white as snow
      { t: 8200, h: 5, type: 'blow' }, // E  Ma-
      { t: 8600, h: 4, type: 'draw' }, // D  -ry
      { t: 9000, h: 4, type: 'blow' }, // C  had
      { t: 9400, h: 4, type: 'draw' }, // D  a
      { t: 9800, h: 5, type: 'blow' }, // E  lit-
      { t: 10200, h: 5, type: 'blow' },// E  -tle
      { t: 10600, h: 5, type: 'blow' },// E  lamb,
      { t: 11000, h: 5, type: 'blow' },// E  its
      { t: 11600, h: 4, type: 'draw' },// D  fleece
      { t: 12000, h: 4, type: 'draw' },// D  was
      { t: 12400, h: 5, type: 'blow' },// E  white
      { t: 12800, h: 4, type: 'draw' },// D  as
      { t: 13400, h: 4, type: 'blow' },// C  snow. [final]
    ],
  },

  twinkle_twinkle: {
    name: 'Twinkle Twinkle Little Star',
    desc: 'Full melody - holes 4-6',
    notes: [
      // Twinkle twinkle little star
      { t: 1000, h: 4, type: 'blow' }, // C
      { t: 1400, h: 4, type: 'blow' }, // C
      { t: 1800, h: 6, type: 'blow' }, // G
      { t: 2200, h: 6, type: 'blow' }, // G
      { t: 2600, h: 6, type: 'draw' }, // A
      { t: 3000, h: 6, type: 'draw' }, // A
      { t: 3400, h: 6, type: 'blow' }, // G [half]
      // How I wonder what you are
      { t: 4200, h: 5, type: 'draw' }, // F
      { t: 4600, h: 5, type: 'draw' }, // F
      { t: 5000, h: 5, type: 'blow' }, // E
      { t: 5400, h: 5, type: 'blow' }, // E
      { t: 5800, h: 4, type: 'draw' }, // D
      { t: 6200, h: 4, type: 'draw' }, // D
      { t: 6600, h: 4, type: 'blow' }, // C [half]
      // Up above the world so high
      { t: 7400, h: 6, type: 'blow' }, // G
      { t: 7800, h: 6, type: 'blow' }, // G
      { t: 8200, h: 5, type: 'draw' }, // F
      { t: 8600, h: 5, type: 'draw' }, // F
      { t: 9000, h: 5, type: 'blow' }, // E
      { t: 9400, h: 5, type: 'blow' }, // E
      { t: 9800, h: 4, type: 'draw' }, // D [half]
      // Like a diamond in the sky
      { t: 10600, h: 6, type: 'blow' },// G
      { t: 11000, h: 6, type: 'blow' },// G
      { t: 11400, h: 5, type: 'draw' },// F
      { t: 11800, h: 5, type: 'draw' },// F
      { t: 12200, h: 5, type: 'blow' },// E
      { t: 12600, h: 5, type: 'blow' },// E
      { t: 13000, h: 4, type: 'draw' },// D [half]
      // Twinkle twinkle little star
      { t: 13800, h: 4, type: 'blow' },// C
      { t: 14200, h: 4, type: 'blow' },// C
      { t: 14600, h: 6, type: 'blow' },// G
      { t: 15000, h: 6, type: 'blow' },// G
      { t: 15400, h: 6, type: 'draw' },// A
      { t: 15800, h: 6, type: 'draw' },// A
      { t: 16200, h: 6, type: 'blow' },// G [half]
      // How I wonder what you are
      { t: 17000, h: 5, type: 'draw' },// F
      { t: 17400, h: 5, type: 'draw' },// F
      { t: 17800, h: 5, type: 'blow' },// E
      { t: 18200, h: 5, type: 'blow' },// E
      { t: 18600, h: 4, type: 'draw' },// D
      { t: 19000, h: 4, type: 'draw' },// D
      { t: 19400, h: 4, type: 'blow' },// C [final]
    ],
  },

  ode_to_joy: {
    name: 'Ode to Joy',
    desc: 'Beethoven\'s 9th - main theme',
    notes: [
      // Line 1 — E E F G  G F E D  C C D E  E. D  D.
      { t: 1000, h: 5, type: 'blow' }, // E
      { t: 1420, h: 5, type: 'blow' }, // E
      { t: 1840, h: 5, type: 'draw' }, // F
      { t: 2260, h: 6, type: 'blow' }, // G
      { t: 2780, h: 6, type: 'blow' }, // G
      { t: 3200, h: 5, type: 'draw' }, // F
      { t: 3620, h: 5, type: 'blow' }, // E
      { t: 4040, h: 4, type: 'draw' }, // D
      { t: 4560, h: 4, type: 'blow' }, // C
      { t: 4980, h: 4, type: 'blow' }, // C
      { t: 5400, h: 4, type: 'draw' }, // D
      { t: 5820, h: 5, type: 'blow' }, // E
      { t: 6340, h: 5, type: 'blow' }, // E [dotted quarter]
      { t: 7180, h: 4, type: 'draw' }, // D
      { t: 8000, h: 4, type: 'draw' }, // D [half]
      // Line 2 — E E F G  G F E D  C C D E  D. C  C.
      { t: 9000, h: 5, type: 'blow' }, // E
      { t: 9420, h: 5, type: 'blow' }, // E
      { t: 9840, h: 5, type: 'draw' }, // F
      { t: 10260, h: 6, type: 'blow' },// G
      { t: 10780, h: 6, type: 'blow' },// G
      { t: 11200, h: 5, type: 'draw' },// F
      { t: 11620, h: 5, type: 'blow' },// E
      { t: 12040, h: 4, type: 'draw' },// D
      { t: 12560, h: 4, type: 'blow' },// C
      { t: 12980, h: 4, type: 'blow' },// C
      { t: 13400, h: 4, type: 'draw' },// D
      { t: 13820, h: 5, type: 'blow' },// E
      { t: 14340, h: 4, type: 'draw' },// D [dotted quarter]
      { t: 15180, h: 4, type: 'blow' },// C
      { t: 16000, h: 4, type: 'blow' },// C [half - final]
    ],
  },

  jingle_bells: {
    name: 'Jingle Bells',
    desc: 'Chorus - two rounds',
    notes: [
      // Chorus 1 — Jingle bells, jingle bells, jingle all the way
      { t: 1000, h: 5, type: 'blow' }, // E  jin-
      { t: 1400, h: 5, type: 'blow' }, // E  -gle
      { t: 1800, h: 5, type: 'blow' }, // E  bells, [half]
      { t: 2600, h: 5, type: 'blow' }, // E  jin-
      { t: 3000, h: 5, type: 'blow' }, // E  -gle
      { t: 3400, h: 5, type: 'blow' }, // E  bells, [half]
      { t: 4200, h: 5, type: 'blow' }, // E  jin-
      { t: 4600, h: 6, type: 'blow' }, // G  -gle
      { t: 5000, h: 4, type: 'blow' }, // C  all
      { t: 5400, h: 4, type: 'draw' }, // D  the
      { t: 5800, h: 5, type: 'blow' }, // E  way! [long]
      // Oh what fun it is to ride in a one-horse open sleigh
      { t: 7000, h: 5, type: 'draw' }, // F  Oh
      { t: 7400, h: 5, type: 'draw' }, // F  what
      { t: 7800, h: 5, type: 'draw' }, // F  fun [half]
      { t: 8600, h: 5, type: 'draw' }, // F  it
      { t: 9000, h: 5, type: 'draw' }, // F  is
      { t: 9400, h: 5, type: 'blow' }, // E  to
      { t: 9800, h: 5, type: 'blow' }, // E  ride
      { t: 10200, h: 5, type: 'blow' },// E  in
      { t: 10600, h: 5, type: 'blow' },// E  a
      { t: 11000, h: 4, type: 'draw' },// D  one-
      { t: 11400, h: 4, type: 'draw' },// D  -horse
      { t: 11800, h: 5, type: 'blow' },// E  o-
      { t: 12200, h: 4, type: 'draw' },// D  -pen
      { t: 12600, h: 6, type: 'blow' },// G  sleigh, [long]
      // Chorus 2 — Jingle bells, jingle bells, jingle all the way
      { t: 13800, h: 5, type: 'blow' },// E
      { t: 14200, h: 5, type: 'blow' },// E
      { t: 14600, h: 5, type: 'blow' },// E [half]
      { t: 15400, h: 5, type: 'blow' },// E
      { t: 15800, h: 5, type: 'blow' },// E
      { t: 16200, h: 5, type: 'blow' },// E [half]
      { t: 17000, h: 5, type: 'blow' },// E
      { t: 17400, h: 6, type: 'blow' },// G
      { t: 17800, h: 4, type: 'blow' },// C
      { t: 18200, h: 4, type: 'draw' },// D
      { t: 18600, h: 5, type: 'blow' },// E [long]
      // Oh what fun it is to ride in a one-horse open sleigh, hey!
      { t: 19800, h: 5, type: 'draw' },// F
      { t: 20200, h: 5, type: 'draw' },// F
      { t: 20600, h: 5, type: 'draw' },// F [half]
      { t: 21400, h: 5, type: 'draw' },// F
      { t: 21800, h: 5, type: 'draw' },// F
      { t: 22200, h: 5, type: 'blow' },// E
      { t: 22600, h: 5, type: 'blow' },// E
      { t: 23000, h: 5, type: 'blow' },// E
      { t: 23400, h: 5, type: 'blow' },// E
      { t: 23800, h: 4, type: 'draw' },// D
      { t: 24200, h: 4, type: 'draw' },// D
      { t: 24600, h: 5, type: 'blow' },// E
      { t: 25000, h: 4, type: 'draw' },// D
      { t: 25400, h: 4, type: 'blow' },// C [final]
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
