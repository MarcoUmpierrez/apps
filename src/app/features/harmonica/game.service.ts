import { computed, Injectable, signal } from '@angular/core';
import {
  BASE_FREQUENCIES,
  DIFFICULTY_SPEEDS,
  DifficultyLevel,
  HarmonicaKey,
  HoleFrequency,
  KEYS,
  MIN_SPAWN_GAP,
  NoteType,
  SEMITONES_FROM_C,
} from './harmonica.data';

export interface ActiveNote {
  el: HTMLDivElement;
  cell: number;
  type: NoteType;
  progress: number;
  hit: boolean;
}

export interface PitchAction {
  cell: number;
  type: NoteType;
}

@Injectable({ providedIn: 'root' })
export class GameService {
  // ── Reactive state ────────────────────────────────────────────────────────
  readonly score = signal(0);
  readonly combo = signal(0);
  readonly speed = signal(0.5);
  readonly currentKey = signal<HarmonicaKey>('C');
  readonly currentSongKey = signal<string | null>(null);
  readonly nextNoteGuide = signal('Esperando nota...');
  readonly showResultPopup = signal(false);
  readonly isPlaying = signal(false);
  readonly difficulty = signal<DifficultyLevel>('normal');

  readonly availableKeys = KEYS;

  /** Harmonica layout recomputed whenever the selected key changes. */
  readonly harmonicaLayout = computed<Record<number, HoleFrequency>>(() => {
    const semitones = SEMITONES_FROM_C[this.currentKey()];
    const factor = Math.pow(2, semitones / 12);
    return Object.fromEntries(
      Object.entries(BASE_FREQUENCIES).map(([hole, freq]) => [
        Number(hole),
        { blow: freq.blow * factor, draw: freq.draw * factor },
      ])
    );
  });

  // ── Audio internals (not reactive – accessed only in the game loop) ────────
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private buffer: Float32Array<ArrayBuffer> | null = null;

  // ── Mutable game-loop state (mutated at 60 fps, no need for signals) ───────
  songPointer = 0;
  startTime = 0;
  lastSpawnTimeByLane = new Array(12).fill(0); // index 1-10 used

  // ── Public API ────────────────────────────────────────────────────────────

  setHarmonicaKey(key: HarmonicaKey): void {
    this.currentKey.set(key);
  }

  setDifficulty(level: DifficultyLevel): void {
    this.difficulty.set(level);
    this.speed.set(DIFFICULTY_SPEEDS[level]);
  }

  resetGame(songKey: string): void {
    this.currentSongKey.set(songKey);
    this.score.set(0);
    this.combo.set(0);
    this.showResultPopup.set(false);
    this.nextNoteGuide.set('Esperando nota...');
    this.songPointer = 0;
    this.startTime = 0;
    this.lastSpawnTimeByLane.fill(0);
  }

  addScore(points: number): void {
    this.score.update(s => s + points);
  }

  incrementCombo(): void {
    this.combo.update(c => c + 1);
  }

  resetCombo(): void {
    this.combo.set(0);
  }

  /** Initializes the AudioContext and mic stream. Throws on permission denial. */
  async initAudio(): Promise<void> {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.buffer = new Float32Array(this.analyser.fftSize) as Float32Array<ArrayBuffer>;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const micSource = this.audioCtx.createMediaStreamSource(stream);
    micSource.connect(this.analyser!);

    this.startTime = Date.now();
  }

  /**
   * Reads the current audio frame and returns the matched harmonica action,
   * or `null` if no note is detected.
   */
  detectPitch(): PitchAction | null {
    if (!this.analyser || !this.buffer || !this.audioCtx) return null;

    this.analyser.getFloatTimeDomainData(this.buffer);
    const freq = this.autoCorrelate(this.buffer, this.audioCtx.sampleRate);
    if (freq <= 0) return null;

    const layout = this.harmonicaLayout();
    const tolerance = freq * 0.03;

    for (const holeStr of Object.keys(layout)) {
      const hole = Number(holeStr);
      if (Math.abs(freq - layout[hole].blow) < tolerance) return { cell: hole, type: 'blow' };
      if (Math.abs(freq - layout[hole].draw) < tolerance) return { cell: hole, type: 'draw' };
    }

    return null;
  }

  get minSpawnGap(): number {
    return MIN_SPAWN_GAP;
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  /**
   * YIN-based autocorrelation pitch detector.
   *
   * Bug fix (original): `sampleRate / maxpos` was called without checking
   * `maxpos > 0`, causing `Infinity` to be returned when no peak was found.
   */
  private autoCorrelate(buf: Float32Array, sampleRate: number): number {
    let rms = 0;
    for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i];
    if (Math.sqrt(rms / buf.length) < 0.01) return -1;

    const c = new Float32Array(buf.length);
    for (let i = 0; i < buf.length; i++) {
      for (let j = 0; j < buf.length - i; j++) {
        c[i] += buf[j] * buf[j + i];
      }
    }

    let d = 0;
    while (d < buf.length - 1 && c[d] > c[d + 1]) d++;

    let maxVal = -1;
    let maxPos = -1;
    for (let i = d; i < buf.length; i++) {
      if (c[i] > maxVal) {
        maxVal = c[i];
        maxPos = i;
      }
    }

    // Bug fix: guard against division by zero
    if (maxPos <= 0) return -1;

    return sampleRate / maxPos;
  }
}
