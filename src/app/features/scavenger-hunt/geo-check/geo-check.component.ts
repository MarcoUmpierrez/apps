import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject } from '@angular/core';
import { HUNT_STOPS } from '../scavenger-hunt.data';
import { phaseAfterArrival } from '../phase-flow.util';
import { GeolocationService } from '../services/geolocation.service';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeoCheckComponent implements OnDestroy {
  private readonly store = inject(HuntStoreService);
  protected readonly geo = inject(GeolocationService);

  readonly stop = computed(() => HUNT_STOPS[this.store.progress().currentStopIndex]);
  readonly lang = computed<Language>(() => this.store.progress().language ?? 'en');
  // stop-intro only ever routes here for stops that declare a location (the
  // finale has none and skips this phase entirely), so this is safe.
  readonly location = computed(() => this.stop().location!);

  readonly distanceMeters = computed(() => this.geo.distanceToMeters(this.location()));
  readonly bearingDegrees = computed(() => this.geo.bearingToDegrees(this.location()));
  readonly isWithinRadius = computed(() => {
    const distance = this.distanceMeters();
    return distance !== null && distance <= this.location().radiusMeters;
  });

  constructor() {
    void this.geo.requestPermissionAndWatch();
  }

  ngOnDestroy(): void {
    this.geo.stopWatching();
  }

  t(key: UiStringKey): string {
    return translateUi(this.lang(), key);
  }

  distanceLabel(): string {
    const distance = this.distanceMeters();
    if (distance === null) return '';
    return translateUi(this.lang(), 'distanceAway', { distance: Math.round(distance) });
  }

  onArrived(): void {
    const stop = this.stop();
    this.store.markArrived(stop.id);
    this.store.setPhase(phaseAfterArrival(stop));
  }
}
