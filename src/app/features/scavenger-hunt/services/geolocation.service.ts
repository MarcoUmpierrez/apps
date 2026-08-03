import { Injectable, signal } from '@angular/core';

export type GeoPermissionState = 'unknown' | 'granted' | 'denied' | 'unsupported';

export function haversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const earthRadiusMeters = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMeters * c;
}

export function initialBearingDegrees(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLng);
  const theta = Math.atan2(y, x);
  return (toDeg(theta) + 360) % 360;
}

/**
 * GPS proximity here is always advisory. Every consumer of this service
 * (GeoCheckComponent) must offer a manual "I'm here!" fallback regardless of
 * permissionState/lastError, since denial, indoor inaccuracy, or any other
 * failure can never be allowed to block progress.
 */
@Injectable({ providedIn: 'root' })
export class GeolocationService {
  readonly currentPosition = signal<GeolocationCoordinates | null>(null);
  readonly permissionState = signal<GeoPermissionState>('unknown');
  readonly lastError = signal<string | null>(null);

  private watchId: number | null = null;

  async requestPermissionAndWatch(): Promise<void> {
    if (!('geolocation' in navigator)) {
      this.permissionState.set('unsupported');
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });
      this.currentPosition.set(position.coords);
      this.permissionState.set('granted');
    } catch {
      this.permissionState.set('denied');
      this.lastError.set('Location permission denied or unavailable');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.currentPosition.set(position.coords),
      () => this.lastError.set('Lost location signal'),
      { enableHighAccuracy: true },
    );
  }

  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  distanceToMeters(target: { lat: number; lng: number }): number | null {
    const pos = this.currentPosition();
    if (!pos) return null;
    return haversineDistanceMeters(pos.latitude, pos.longitude, target.lat, target.lng);
  }

  bearingToDegrees(target: { lat: number; lng: number }): number | null {
    const pos = this.currentPosition();
    if (!pos) return null;
    return initialBearingDegrees(pos.latitude, pos.longitude, target.lat, target.lng);
  }
}
