import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { GameService } from '../game.service';
import { LANES, MIN_SPAWN_GAP, NoteType, SHOUTS, SONGS } from '../harmonica.data';
import { ResultPopupComponent } from './result-popup/result-popup.component';
import { GameHudComponent } from './game-hud/game-hud.component';
import { HighwayCanvasComponent, ActiveNote } from './highway-canvas/highway-canvas.component';

@Component({
  selector: 'app-game-screen',
  templateUrl: './game-screen.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResultPopupComponent, GameHudComponent, HighwayCanvasComponent],
})
export class GameScreenComponent {
  private readonly gameService = inject(GameService);
  private readonly destroyRef  = inject(DestroyRef);

  private readonly hudEl    = viewChild.required(GameHudComponent);
  private readonly highwayEl = viewChild.required(HighwayCanvasComponent);

  // ── Inputs / Outputs ──────────────────────────────────────────────────────
  readonly songKey = input.required<string>();
  readonly exit    = output<void>();

  // ── Template data (from service) ──────────────────────────────────────────
  readonly lanes           = LANES;
  readonly score           = this.gameService.score;
  readonly combo           = this.gameService.combo;
  readonly currentKey      = this.gameService.currentKey;
  readonly nextNoteGuide   = this.gameService.nextNoteGuide;
  readonly showResultPopup = this.gameService.showResultPopup;
  readonly currentSongKey  = this.gameService.currentSongKey;

  // ── Game state signals ────────────────────────────────────────────────────
  protected readonly activeNotes      = signal<ActiveNote[]>([]);
  protected readonly highlightedLanes = signal<Set<number>>(new Set());
  protected readonly activeCellStates = signal<Map<number, NoteType>>(new Map());

  // ── Private counters ──────────────────────────────────────────────────────
  private noteIdCounter = 0;
  private animFrameId   = 0;

  constructor() {
    afterNextRender(() => {
      void this.startGame();
      this.destroyRef.onDestroy(() => this.stopLoop());
    });
  }

  // ── Template helpers ──────────────────────────────────────────────────────

  get songTitle(): string {
    const songKey = this.currentSongKey();
    if (songKey) {
      return songKey === 'free' ? 'Free practice' : songKey;
    }

    return 'Song title';
  }

  onRestart(): void { void this.startGame(); }

  onExit(): void {
    this.stopLoop();
    this.exit.emit();
  }

  // ── Private: game lifecycle ───────────────────────────────────────────────

  private async startGame(): Promise<void> {
    this.stopLoop();
    this.activeNotes.set([]);
    this.highlightedLanes.set(new Set());
    this.activeCellStates.set(new Map());

    this.gameService.resetGame(this.songKey());

    try {
      await this.gameService.initAudio();
      this.gameService.isPlaying.set(true);
      this.animFrameId = requestAnimationFrame(() => this.gameLoop());
    } catch (err) {
      console.error('Microphone access denied:', err);
      this.exit.emit();
    }
  }

  private stopLoop(): void {
    this.gameService.isPlaying.set(false);
    cancelAnimationFrame(this.animFrameId);
  }

  private finishSong(): void {
    this.stopLoop();
    this.gameService.showResultPopup.set(true);
  }

  // ── Private: game loop ────────────────────────────────────────────────────

  private gameLoop(): void {
    if (!this.gameService.isPlaying()) return;

    const now = Date.now() - this.gameService.startTime;
    const key = this.songKey();

    // ── Song-end check ──────────────────────────────────────────────────────
    if (key !== 'free') {
      const song = SONGS[key];
      if (this.gameService.songPointer >= song.notes.length && this.activeNotes().length === 0) {
        setTimeout(() => this.finishSong(), 1500);
        return;
      }
    }

    // ── Spawn notes ─────────────────────────────────────────────────────────
    if (key === 'free') {
      if (Math.random() < 0.03) {
        const cell = Math.floor(Math.random() * 10) + 1;
        if (now - this.gameService.lastSpawnTimeByLane[cell] > MIN_SPAWN_GAP) {
          this.spawnNote(cell, Math.random() > 0.5 ? 'blow' : 'draw');
          this.gameService.lastSpawnTimeByLane[cell] = now;
        }
      }
    } else if (this.gameService.songPointer < SONGS[key].notes.length) {
      const n = SONGS[key].notes[this.gameService.songPointer];
      if (now >= n.t - 2000) {
        this.spawnNote(n.h, n.type);
        this.gameService.songPointer++;
      }
    }

    // ── Pitch detection ─────────────────────────────────────────────────────
    const action = this.gameService.detectPitch();

    const newCellStates = new Map<number, NoteType>();
    if (action) newCellStates.set(action.cell - 1, action.type);
    this.activeCellStates.set(newCellStates);

    // ── Move notes + hit detection ──────────────────────────────────────────
    const highway        = this.highwayEl();
    const hitZoneTop     = highway.HIT_ZONE_TOP_T * 100;
    const hitZoneBot     = highway.HIT_ZONE_BOT_T * 100;
    let closestNote: ActiveNote | null = null;
    let maxProgress      = -Infinity;
    const newHighlights  = new Set<number>();

    this.activeNotes.update(notes => {
      const surviving: ActiveNote[] = [];

      for (const n of notes) {
        const updated: ActiveNote = { ...n, progress: n.progress + this.gameService.speed() };

        if (updated.progress > maxProgress && updated.progress < 100) {
          maxProgress = updated.progress;
          closestNote = updated;
        }

        const inHitWindow =
          !updated.hit &&
          updated.progress > hitZoneTop &&
          updated.progress < hitZoneBot &&
          action?.cell === updated.cell &&
          action?.type === updated.type;

        if (inHitWindow) {
          this.handleHit(updated, newHighlights);
        } else if (updated.progress > 105) {
          if (!updated.hit) this.gameService.resetCombo();
        } else {
          surviving.push(updated);
        }
      }

      return surviving;
    });

    this.highlightedLanes.set(newHighlights);

    // ── Guide text ──────────────────────────────────────────────────────────
    this.gameService.nextNoteGuide.set(
      closestNote
        ? `${(closestNote as ActiveNote).type === 'blow' ? 'BLOW' : 'DRAW'} ${(closestNote as ActiveNote).cell}`
        : 'Waiting note...',
    );

    // ── Render ──────────────────────────────────────────────────────────────
    highway.render();

    this.animFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  // ── Private: note management ──────────────────────────────────────────────

  private spawnNote(cell: number, type: NoteType): void {
    this.activeNotes.update(notes => [
      ...notes,
      { id: this.noteIdCounter++, cell, type, progress: -5, hit: false },
    ]);
  }

  private handleHit(note: ActiveNote, highlights: Set<number>): void {
    this.highwayEl().triggerHitEffect(note);
    this.gameService.addScore(100);
    this.gameService.incrementCombo();

    if (this.gameService.combo() % 5 === 0) {
      this.hudEl().triggerShout(SHOUTS[Math.floor(Math.random() * SHOUTS.length)]);
    }

    highlights.add(note.cell - 1);
  }
}