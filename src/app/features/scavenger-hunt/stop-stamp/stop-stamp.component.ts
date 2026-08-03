import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { HUNT_STOPS } from '../scavenger-hunt.data';
import { HuntStoreService } from '../services/hunt-store.service';
import { Language } from '../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../ui-strings.data';

@Component({
  selector: 'app-stop-stamp',
  templateUrl: './stop-stamp.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StopStampComponent {
  private readonly store = inject(HuntStoreService);

  readonly stop = computed(() => HUNT_STOPS[this.store.progress().currentStopIndex]);
  readonly lang = computed<Language>(() => this.store.progress().language ?? 'en');

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  onContinue(): void {
    const stop = this.stop();
    this.store.markStampCollected(stop.id);
    this.store.advanceToNextStop();
  }
}
