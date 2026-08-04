import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HUNT_STOPS } from '../scavenger-hunt.data';
import { HuntStoreService } from '../services/hunt-store.service';
import { HuntPhase, Language } from '../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../ui-strings.data';

/** Every phase the app can be in, in roughly the order they occur — used to build the "jump to screen" list below. */
const ALL_PHASES: HuntPhase[] = [
  'cover',
  'diary-intro',
  'stop-intro',
  'geo-check',
  'minigame',
  'photo-checkpoint',
  'personal-question',
  'letter-minigame',
  'stop-stamp',
  'finale-montage',
  'finale-video',
  'proposal-question',
  'epilogue',
];

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
  readonly phases = ALL_PHASES;
  readonly expanded = signal(false);

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  onSkip(): void {
    this.store.autoSolveCurrentPhase();
  }

  onJumpToStop(index: number): void {
    this.store.skipToStop(index);
    this.expanded.set(false);
  }

  /** Jumps to any screen without touching which stop is currently selected — combine with "jump to stop" to reach any stop+screen pair. */
  onJumpToPhase(phase: HuntPhase): void {
    this.store.setPhase(phase);
    this.expanded.set(false);
  }

  toggleExpanded(): void {
    this.expanded.update((v) => !v);
  }
}
