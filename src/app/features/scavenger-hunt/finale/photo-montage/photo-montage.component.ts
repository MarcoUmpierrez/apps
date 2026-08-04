import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { buildCollage, downloadDataUrl } from '../../photo-collage.util';
import { HUNT_STOPS } from '../../scavenger-hunt.data';
import { HuntStoreService } from '../../services/hunt-store.service';
import { Language } from '../../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../../ui-strings.data';

const CAROUSEL_INTERVAL_MS = 2500;

@Component({
  selector: 'app-photo-montage',
  templateUrl: './photo-montage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoMontageComponent implements OnInit, OnDestroy {
  private readonly store = inject(HuntStoreService);

  readonly lang = computed<Language>(() => this.store.progress().language ?? 'en');
  readonly photos = computed(() => {
    const progress = this.store.progress();
    return HUNT_STOPS.map((stop) => progress.stops[stop.id]?.photoDataUrl).filter(
      (url): url is string => !!url,
    );
  });

  readonly activeIndex = signal(0);
  readonly collageDataUrl = signal<string | null>(null);
  readonly isBuildingCollage = signal(false);

  private carouselIntervalId: ReturnType<typeof setInterval> | null = null;

  async ngOnInit(): Promise<void> {
    const photos = this.photos();

    if (photos.length > 1) {
      this.carouselIntervalId = setInterval(() => {
        this.activeIndex.update((i) => (i + 1) % this.photos().length);
      }, CAROUSEL_INTERVAL_MS);
    }

    if (photos.length > 0) {
      this.isBuildingCollage.set(true);
      const title = this.lang() === 'es' ? 'Nuestro viaje' : 'Our journey';
      this.collageDataUrl.set(await buildCollage(photos, title));
      this.isBuildingCollage.set(false);
    }
  }

  ngOnDestroy(): void {
    if (this.carouselIntervalId !== null) clearInterval(this.carouselIntervalId);
  }

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  onDownload(): void {
    const dataUrl = this.collageDataUrl();
    if (dataUrl) downloadDataUrl(dataUrl, 'our-journey.jpg');
  }

  onContinue(): void {
    this.store.setPhase('finale-video');
  }
}
