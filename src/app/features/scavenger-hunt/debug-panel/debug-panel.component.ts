import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { screensForStop } from '../phase-flow.util';
import { HUNT_STOPS } from '../scavenger-hunt.data';
import { HuntStoreService } from '../services/hunt-store.service';
import { HuntPhase, Language, LetterMinigameConfig, MinigameConfig, Stop } from '../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../ui-strings.data';

/** Screens reachable outside any stop's flow — shown flat, above the per-stop tree. */
const GENERAL_SCREENS: HuntPhase[] = ['cover', 'diary-intro'];

const PHASE_LABELS: Partial<Record<HuntPhase, string>> = {
  cover: 'Cover',
  'diary-intro': 'Diary Intro',
  'stop-intro': 'Stop Intro',
  'geo-check': 'Geo Check',
  'photo-checkpoint': 'Photo Checkpoint',
  'personal-question': 'Personal Question',
  'letter-minigame': 'Letter Minigame',
  'stop-stamp': 'Stamp',
  'finale-video': 'Finale Video',
  'proposal-question': 'Proposal',
  epilogue: 'Epilogue',
  'finale-montage': 'Photo Montage',
};

/** Short, human-friendly names for each minigame kind, shown instead of the generic "Minigame" label. */
const MINIGAME_LABELS: Record<MinigameConfig['kind'], string> = {
  'riddle-mc': 'Riddle',
  'word-scramble': 'Word Scramble',
  'wordle-guess': 'Wordle',
  'sequence-reorder': 'Sequence',
  'sliding-tile-puzzle': 'Sliding Tile',
  'shake-to-reveal': 'Shake to Reveal',
  'jigsaw-puzzle': 'Jigsaw',
  'memory-match': 'Memory Match',
};

/** Short, human-friendly names for each letter-minigame kind, shown instead of the generic "Letter Minigame" label. */
const LETTER_MINIGAME_LABELS: Record<LetterMinigameConfig['kind'], string> = {
  'wall-break': 'Wall Break',
  'dirt-wipe': 'Dirt Wipe',
  'tower-of-hanoi': 'Tower of Hanoi',
  'burger-build': 'Burger Build',
  maze: 'Maze',
  'laser-reflector': 'Laser Reflector',
  'color-sequence': 'Color Sequence',
};

interface ScreenNode {
  phase: HuntPhase;
  label: string;
}

/** Only rendered by the root shell when devModeUnlocked is true. */
@Component({
  selector: 'app-debug-panel',
  templateUrl: './debug-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebugPanelComponent {
  private readonly store = inject(HuntStoreService);

  readonly lang = computed<Language>(() => this.store.progress().language ?? 'en');
  readonly stops = HUNT_STOPS;
  readonly generalScreens: ScreenNode[] = GENERAL_SCREENS.map((phase) => ({
    phase,
    label: PHASE_LABELS[phase]!,
  }));

  readonly expanded = signal(false);
  private readonly expandedStopIds = signal<ReadonlySet<string>>(new Set());

  readonly currentStopIndex = computed(() => this.store.progress().currentStopIndex);
  readonly currentPhase = computed(() => this.store.progress().currentPhase);

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  screensFor(stop: Stop): ScreenNode[] {
    return screensForStop(stop).map((phase) => ({ phase, label: this.labelFor(phase, stop) }));
  }

  private labelFor(phase: HuntPhase, stop: Stop): string {
    if (phase === 'minigame' && stop.minigame) return MINIGAME_LABELS[stop.minigame.kind];
    if (phase === 'letter-minigame' && stop.letterMinigame) {
      return LETTER_MINIGAME_LABELS[stop.letterMinigame.kind];
    }
    return PHASE_LABELS[phase]!;
  }

  isStopExpanded(stopId: string): boolean {
    return this.expandedStopIds().has(stopId);
  }

  toggleStop(stopId: string): void {
    this.expandedStopIds.update((ids) => {
      const next = new Set(ids);
      if (next.has(stopId)) next.delete(stopId);
      else next.add(stopId);
      return next;
    });
  }

  isCurrentScreen(stopIndex: number, phase: HuntPhase): boolean {
    return this.currentStopIndex() === stopIndex && this.currentPhase() === phase;
  }

  onSkip(): void {
    this.store.autoSolveCurrentPhase();
  }

  /** Jumps to any general (non-stop) screen. */
  onJumpToPhase(phase: HuntPhase): void {
    this.store.setPhase(phase);
    this.expanded.set(false);
  }

  /** Jumps straight to a specific stop + screen pair, no separate "pick a stop" step needed. */
  onJumpToStopScreen(stopIndex: number, phase: HuntPhase): void {
    this.store.skipToStopPhase(stopIndex, phase);
    this.expanded.set(false);
  }

  toggleExpanded(): void {
    this.expanded.update((v) => !v);
  }
}
