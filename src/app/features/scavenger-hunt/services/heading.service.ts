import { Injectable, signal } from '@angular/core';

export type HeadingPermissionState = 'unknown' | 'granted' | 'denied' | 'unsupported';

interface DeviceOrientationEventCtorIOS {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

interface WebkitCompassOrientationEvent extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

/**
 * The GPS bearing to a target is a fixed compass direction (e.g. "42° from
 * true north"), not a "turn this way" instruction — without knowing which
 * way the phone itself is facing, an arrow drawn straight from that bearing
 * only looks correct when the player happens to be facing true north, and
 * otherwise appears to sit at some fixed, wrong-looking angle no matter which
 * way they turn. This service reads the device's own compass heading so
 * GeoCheckComponent can subtract it from the target bearing and get a
 * heading relative to the way the phone is actually pointed.
 *
 * GeoCheckComponent must keep working with heading null (falls back to the
 * raw geographic bearing) — iOS 13+ gates DeviceOrientation behind an
 * explicit, user-gesture-triggered permission prompt that can be denied, and
 * some browsers/devices never fire a usable heading at all.
 */
@Injectable({ providedIn: 'root' })
export class HeadingService {
  readonly permissionState = signal<HeadingPermissionState>('unknown');
  readonly headingDegrees = signal<number | null>(null);

  private listener: ((event: DeviceOrientationEvent) => void) | null = null;
  private eventName: 'deviceorientationabsolute' | 'deviceorientation' = 'deviceorientation';

  async requestPermission(): Promise<void> {
    if (typeof DeviceOrientationEvent === 'undefined') {
      this.permissionState.set('unsupported');
      return;
    }

    const ctor = DeviceOrientationEvent as unknown as DeviceOrientationEventCtorIOS;
    if (typeof ctor.requestPermission === 'function') {
      try {
        const result = await ctor.requestPermission();
        this.permissionState.set(result === 'granted' ? 'granted' : 'denied');
      } catch {
        this.permissionState.set('denied');
        return;
      }
    } else {
      // Android and other browsers without the iOS-style permission gate.
      this.permissionState.set('granted');
    }

    if (this.permissionState() === 'granted') {
      this.startListening();
    }
  }

  private startListening(): void {
    this.stopListening();

    this.listener = (event: DeviceOrientationEvent) => {
      const webkitHeading = (event as WebkitCompassOrientationEvent).webkitCompassHeading;
      if (typeof webkitHeading === 'number') {
        this.headingDegrees.set(webkitHeading);
        return;
      }
      if (event.absolute && event.alpha !== null) {
        this.headingDegrees.set((360 - event.alpha) % 360);
      }
    };

    this.eventName =
      'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
    window.addEventListener(this.eventName, this.listener);
  }

  stopListening(): void {
    if (this.listener) {
      window.removeEventListener(this.eventName, this.listener);
      this.listener = null;
    }
  }
}
