import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HuntStoreService } from '../../services/hunt-store.service';
import { Language } from '../../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../../ui-strings.data';

/** Falls back to a built-in animated message if no video asset is supplied or it fails to load. */
@Component({
  selector: 'app-finale-video',
  templateUrl: './finale-video.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinaleVideoComponent {
  private readonly store = inject(HuntStoreService);

  readonly lang = computed<Language>(() => this.store.progress().language ?? 'en');
  readonly videoErrored = signal(false);
  readonly videoAsset = 'scavenger-hunt/finale-video.mp4';

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  onVideoError(): void {
    this.videoErrored.set(true);
  }

  onContinue(): void {
    this.store.setPhase('proposal-question');
  }
}
