import { Injectable, effect, signal } from '@angular/core';
import { HUNT_STOPS } from '../scavenger-hunt.data';
import {
  phaseAfterArrival,
  phaseAfterLetterMinigame,
  phaseAfterMinigame,
  phaseAfterPersonalQuestion,
  phaseAfterPhoto,
} from '../phase-flow.util';
import { HuntPhase, HuntProgress, Language, StopProgress } from '../scavenger-hunt.types';

const STORAGE_KEY = 'ourJourneyProgress';

function defaultStopProgress(): StopProgress {
  return {
    arrived: false,
    minigameSolved: false,
    photoDataUrl: null,
    personalQuestionSolved: false,
    stampCollected: false,
  };
}

function defaultProgress(): HuntProgress {
  const stops: Record<string, StopProgress> = {};
  for (const stop of HUNT_STOPS) stops[stop.id] = defaultStopProgress();
  return {
    language: null,
    currentStopIndex: 0,
    currentPhase: 'cover',
    stops,
    devModeUnlocked: false,
    epilogueUnlocked: false,
  };
}

function loadInitialProgress(): HuntProgress {
  const fallback = defaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<HuntProgress>;
    return {
      ...fallback,
      ...parsed,
      stops: { ...fallback.stops, ...(parsed.stops ?? {}) },
    };
  } catch {
    return fallback;
  }
}

/**
 * A single combined signal / single localStorage key, unlike the brain
 * app's one-signal-per-field pattern — HuntProgress is one cohesive,
 * order-sensitive record, and splitting it risks a torn write mid-update
 * outdoors, which is exactly the failure mode this hunt is designed to avoid.
 */
@Injectable({ providedIn: 'root' })
export class HuntStoreService {
  readonly progress = signal<HuntProgress>(loadInitialProgress());

  constructor() {
    effect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress()));
    });
  }

  beginHunt(lang: Language): void {
    this.progress.update((p) => ({
      ...p,
      language: lang,
      currentStopIndex: 0,
      currentPhase: 'diary-intro',
    }));
  }

  setPhase(phase: HuntPhase): void {
    this.progress.update((p) => ({ ...p, currentPhase: phase }));
  }

  markArrived(stopId: string): void {
    this.updateStop(stopId, { arrived: true });
  }

  markMinigameSolved(stopId: string): void {
    this.updateStop(stopId, { minigameSolved: true });
  }

  savePhoto(stopId: string, dataUrl: string | null): void {
    this.updateStop(stopId, { photoDataUrl: dataUrl });
  }

  markPersonalQuestionSolved(stopId: string): void {
    this.updateStop(stopId, { personalQuestionSolved: true });
  }

  markStampCollected(stopId: string): void {
    this.updateStop(stopId, { stampCollected: true });
  }

  advanceToNextStop(): void {
    this.progress.update((p) => ({
      ...p,
      currentStopIndex: Math.min(p.currentStopIndex + 1, HUNT_STOPS.length - 1),
      currentPhase: 'stop-intro',
    }));
  }

  unlockEpilogue(): void {
    this.progress.update((p) => ({ ...p, epilogueUnlocked: true }));
  }

  /** Clears everything, including devModeUnlocked — run before the real day. */
  resetHunt(): void {
    this.progress.set(defaultProgress());
  }

  unlockDevMode(): void {
    this.progress.update((p) => ({ ...p, devModeUnlocked: true }));
  }

  /** Jumps straight to a specific screen within a given stop. */
  skipToStopPhase(stopIndex: number, phase: HuntPhase): void {
    const clamped = Math.max(0, Math.min(stopIndex, HUNT_STOPS.length - 1));
    this.progress.update((p) => ({ ...p, currentStopIndex: clamped, currentPhase: phase }));
  }

  /**
   * Debug-only one-tap skip: marks whatever the current phase requires as
   * solved without checking the answer, and advances straight to the next
   * phase — so testing doesn't require solving every puzzle by hand.
   */
  autoSolveCurrentPhase(): void {
    const p = this.progress();
    const stop = HUNT_STOPS[p.currentStopIndex];
    if (!stop) return;

    switch (p.currentPhase) {
      case 'geo-check':
        this.markArrived(stop.id);
        this.setPhase(phaseAfterArrival(stop));
        break;
      case 'minigame':
        this.markMinigameSolved(stop.id);
        this.setPhase(phaseAfterMinigame(stop));
        break;
      case 'photo-checkpoint':
        this.savePhoto(stop.id, null);
        this.setPhase(phaseAfterPhoto(stop));
        break;
      case 'personal-question':
        this.markPersonalQuestionSolved(stop.id);
        this.setPhase(phaseAfterPersonalQuestion(stop));
        break;
      case 'letter-minigame':
        this.setPhase(phaseAfterLetterMinigame(stop));
        break;
      default:
        break;
    }
  }

  private updateStop(stopId: string, patch: Partial<StopProgress>): void {
    this.progress.update((p) => ({
      ...p,
      stops: { ...p.stops, [stopId]: { ...p.stops[stopId], ...patch } },
    }));
  }
}
