import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { HUNT_STOPS } from '../scavenger-hunt.data';
import { HuntStoreService } from '../services/hunt-store.service';
import { Language } from '../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../ui-strings.data';

@Component({
  selector: 'app-stop-intro',
  templateUrl: './stop-intro.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StopIntroComponent {
  private readonly store = inject(HuntStoreService);

  readonly stop = computed(() => HUNT_STOPS[this.store.progress().currentStopIndex]);
  readonly lang = computed<Language>(() => this.store.progress().language ?? 'en');
  readonly totalStops = HUNT_STOPS.length;

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  chapterLabel(): string {
    return translateUi(this.lang(), 'chapterOf', {
      current: this.stop().order,
      total: this.totalStops,
    });
  }

  onContinue(): void {
    this.store.setPhase('geo-check');
  }
}
