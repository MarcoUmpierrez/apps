import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { HUNT_STOPS } from '../../scavenger-hunt.data';
import { FallingHeartsComponent } from '../../falling-hearts/falling-hearts.component';
import { FireworksDisplayComponent } from '../../fireworks-display/fireworks-display.component';
import { HuntStoreService } from '../../services/hunt-store.service';
import { Language } from '../../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../../ui-strings.data';

@Component({
  selector: 'app-epilogue',
  imports: [FallingHeartsComponent, FireworksDisplayComponent],
  templateUrl: './epilogue.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EpilogueComponent {
  private readonly store = inject(HuntStoreService);

  readonly lang = computed<Language>(() => this.store.progress().language ?? 'en');
  readonly stops = HUNT_STOPS;

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  onContinue(): void {
    this.store.setPhase('finale-montage');
  }
}
