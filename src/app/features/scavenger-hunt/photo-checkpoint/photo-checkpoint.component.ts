import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { phaseAfterPhoto } from '../phase-flow.util';
import { compressPhotoToDataUrl } from '../photo-compression.util';
import { HUNT_STOPS } from '../scavenger-hunt.data';
import { HuntStoreService } from '../services/hunt-store.service';
import { Language } from '../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../ui-strings.data';

/** Any photo is accepted, no validation, and skipping is always available. */
@Component({
  selector: 'app-photo-checkpoint',
  templateUrl: './photo-checkpoint.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoCheckpointComponent {
  private readonly store = inject(HuntStoreService);

  readonly stop = computed(() => HUNT_STOPS[this.store.progress().currentStopIndex]);
  readonly lang = computed<Language>(() => this.store.progress().language ?? 'en');
  readonly isProcessing = signal(false);

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isProcessing.set(true);
    const dataUrl = await compressPhotoToDataUrl(file);
    this.isProcessing.set(false);
    this.advance(dataUrl);
  }

  onSkip(): void {
    this.advance(null);
  }

  private advance(dataUrl: string | null): void {
    const stop = this.stop();
    this.store.savePhoto(stop.id, dataUrl);
    this.store.setPhase(phaseAfterPhoto(stop));
  }
}
