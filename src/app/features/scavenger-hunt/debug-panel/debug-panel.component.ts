import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HUNT_STOPS } from '../scavenger-hunt.data';
import { HuntStoreService } from '../services/hunt-store.service';
import { Language } from '../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../ui-strings.data';

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

  toggleExpanded(): void {
    this.expanded.update((v) => !v);
  }
}
