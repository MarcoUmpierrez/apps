import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FireworksDisplayComponent } from '../../fireworks-display/fireworks-display.component';
import { HuntStoreService } from '../../services/hunt-store.service';
import { Language } from '../../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../../ui-strings.data';

@Component({
  selector: 'app-finale-video',
  imports: [FireworksDisplayComponent],
  templateUrl: './finale-video.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinaleVideoComponent {
  private readonly store = inject(HuntStoreService);

  readonly lang = computed<Language>(() => this.store.progress().language ?? 'en');

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  onContinue(): void {
    this.store.setPhase('proposal-question');
  }
}
