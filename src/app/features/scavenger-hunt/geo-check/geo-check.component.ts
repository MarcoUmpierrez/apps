import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  effect,
  inject,
} from '@angular/core';
import { HUNT_STOPS } from '../scavenger-hunt.data';
import { phaseAfterArrival } from '../phase-flow.util';
import { GeolocationService, relativeBearingDegrees } from '../services/geolocation.service';
import { HeadingService } from '../services/heading.service';
import { HuntStoreService } from '../services/hunt-store.service';
import { Language } from '../scavenger-hunt.types';
import { UiStringKey, translateUi } from '../ui-strings.data';
import { CompassArrowComponent } from './compass-arrow/compass-arrow.component';

/**
 * GPS proximity is advisory only. Both "I'm here!" and "Skip the GPS check"
 * are always rendered and both call the same onArrived() path — permission
 * denial, indoor inaccuracy, or any other GPS failure can never block her.
 */
@Component({
  selector: 'app-geo-check',
  imports: [CompassArrowComponent],
  templateUrl: './geo-check.component.html',
  styleUrl: './geo-check.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeoCheckComponent implements OnDestroy {
  private readonly store = inject(HuntStoreService);
  protected readonly geo = inject(GeolocationService);
  protected readonly heading = inject(HeadingService);

  readonly stop = computed(() => HUNT_STOPS[this.store.progress().currentStopIndex]);
  readonly lang = computed<Language>(() => this.store.progress().language ?? 'en');
  // stop-intro only ever routes here for stops that declare a location (the
  // finale has none and skips this phase entirely), so this is safe.
  readonly location = computed(() => this.stop().location!);

  readonly distanceMeters = computed(() => this.geo.distanceToMeters(this.location()));
  readonly bearingDegrees = computed(() => this.geo.bearingToDegrees(this.location()));
  // Falls back to the raw geographic bearing whenever the device heading is
  // unavailable (permission denied/unsupported), same as before this existed.
  readonly compassRotationDegrees = computed(() => {
    const bearing = this.bearingDegrees();
    if (bearing === null) return null;
    const deviceHeading = this.heading.headingDegrees();
    return deviceHeading === null ? bearing : relativeBearingDegrees(bearing, deviceHeading);
  });
  readonly isWithinRadius = computed(() => {
    const distance = this.distanceMeters();
    return distance !== null && distance <= this.location().radiusMeters;
  });

  constructor() {
    void this.geo.requestPermissionAndWatch();
    void this.heading.requestPermission();
  }

  ngOnDestroy(): void {
    this.geo.stopWatching();
    this.heading.stopListening();
  }

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  distanceLabel(): string {
    const distance = this.distanceMeters();
    if (distance === null) return '';
    return translateUi(this.lang(), 'distanceAway', { distance: Math.round(distance) });
  }

  async onEnableCompass(): Promise<void> {
    await this.heading.requestPermission();
  }

  onArrived(): void {
    const stop = this.stop();
    this.store.markArrived(stop.id);
    this.store.setPhase(phaseAfterArrival(stop));
  }
}
