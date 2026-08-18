import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { phaseAfterPhoto } from '../phase-flow.util';
import { compressPhotoToDataUrl } from '../photo-compression.util';
import { HUNT_STOPS } from '../scavenger-hunt.data';
import { HuntStoreService } from '../services/hunt-store.service';
import { Language } from '../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../ui-strings.data';

/**
 * Any photo is accepted, no validation, and skipping is always available
 * before a photo is taken. Once taken, it's shown back for review with a
 * chance to retake before advancing.
 */
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
  readonly previewDataUrl = signal<string | null>(null);

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.isProcessing.set(true);
    const dataUrl = await compressPhotoToDataUrl(file);
    this.isProcessing.set(false);
    this.previewDataUrl.set(dataUrl);
  }

  onRetake(): void {
    this.previewDataUrl.set(null);
  }

  onContinue(): void {
    this.advance(this.previewDataUrl());
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
