import { Injectable, signal } from '@angular/core';

export type MotionPermissionState = 'unknown' | 'granted' | 'denied' | 'unsupported';

interface DeviceMotionEventCtorIOS {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

const SHAKE_MAGNITUDE_THRESHOLD = 15;
const SHAKE_WINDOW_MS = 1000;
const REQUIRED_SHAKES = 3;

/**
 * ShakeToRevealComponent must always also render a manual "Reveal it" button
 * regardless of permissionState — iOS 13+ gates DeviceMotion behind an
 * explicit, user-gesture-triggered permission prompt that can be denied, and
 * that can never be allowed to block progress.
 */
@Injectable({ providedIn: 'root' })
export class MotionService {
  readonly permissionState = signal<MotionPermissionState>('unknown');

  private listener: ((event: DeviceMotionEvent) => void) | null = null;
  private lastMagnitude = 0;
  private shakeCount = 0;
  private lastShakeTime = 0;

  async requestPermission(): Promise<void> {
    if (typeof DeviceMotionEvent === 'undefined') {
      this.permissionState.set('unsupported');
      return;
    }

    const ctor = DeviceMotionEvent as unknown as DeviceMotionEventCtorIOS;
    if (typeof ctor.requestPermission === 'function') {
      try {
        const result = await ctor.requestPermission();
        this.permissionState.set(result === 'granted' ? 'granted' : 'denied');
      } catch {
        this.permissionState.set('denied');
      }
      return;
    }

    // Android and other browsers without the iOS-style permission gate.
    this.permissionState.set('granted');
  }

  startListening(onShakeThresholdReached: () => void): void {
    this.stopListening();

    this.listener = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;

      const magnitude = Math.sqrt(
        (acceleration.x ?? 0) ** 2 + (acceleration.y ?? 0) ** 2 + (acceleration.z ?? 0) ** 2,
      );
      const delta = Math.abs(magnitude - this.lastMagnitude);
      this.lastMagnitude = magnitude;

      if (delta <= SHAKE_MAGNITUDE_THRESHOLD) return;

      const now = Date.now();
      if (now - this.lastShakeTime > SHAKE_WINDOW_MS) {
        this.shakeCount = 0;
      }
      this.lastShakeTime = now;
      this.shakeCount++;

      if (this.shakeCount >= REQUIRED_SHAKES) {
        this.shakeCount = 0;
        onShakeThresholdReached();
      }
    };

    window.addEventListener('devicemotion', this.listener);
  }

  stopListening(): void {
    if (this.listener) {
      window.removeEventListener('devicemotion', this.listener);
      this.listener = null;
    }
    this.shakeCount = 0;
    this.lastMagnitude = 0;
  }
}
