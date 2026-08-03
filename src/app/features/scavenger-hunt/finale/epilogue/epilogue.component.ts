import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { HUNT_STOPS } from '../../scavenger-hunt.data';
import { HuntStoreService } from '../../services/hunt-store.service';
import { Language } from '../../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../../ui-strings.data';

@Component({
  selector: 'app-epilogue',
  templateUrl: './epilogue.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EpilogueComponent {
  private readonly store = inject(HuntStoreService);

  readonly lang = computed<Language>(() => this.store.progress().language ?? 'en');
  readonly stops = HUNT_STOPS;
  readonly confettiPieces = Array.from({ length: 40 }, (_, i) => i);

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  confettiColor(piece: number): string {
    const colors = ['#f472b6', '#fbbf24', '#f59e0b'];
    return colors[piece % colors.length];
  }
}
