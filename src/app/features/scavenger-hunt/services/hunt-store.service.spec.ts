import { TestBed } from '@angular/core/testing';
import { HUNT_STOPS } from '../scavenger-hunt.data';
import { HuntStoreService } from './hunt-store.service';

describe('HuntStoreService', () => {
  let service: HuntStoreService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(HuntStoreService);
  });

  it('starts on the cover phase with no language selected', () => {
    expect(service.progress().currentPhase).toBe('cover');
    expect(service.progress().language).toBeNull();
  });

  it('beginHunt sets the language and moves to diary-intro at stop 0', () => {
    service.beginHunt('es');
    expect(service.progress().language).toBe('es');
    expect(service.progress().currentStopIndex).toBe(0);
    expect(service.progress().currentPhase).toBe('diary-intro');
  });

  it('markArrived updates only the targeted stop', () => {
    const stopId = HUNT_STOPS[0].id;
    service.markArrived(stopId);
    expect(service.progress().stops[stopId].arrived).toBe(true);
    expect(service.progress().stops[HUNT_STOPS[1].id].arrived).toBe(false);
  });

  it('advanceToNextStop increments the stop index and clamps at the last stop', () => {
    for (let i = 0; i < HUNT_STOPS.length + 3; i++) {
      service.advanceToNextStop();
    }
    expect(service.progress().currentStopIndex).toBe(HUNT_STOPS.length - 1);
  });

  it('persists progress to localStorage on every change', () => {
    service.beginHunt('en');
    TestBed.flushEffects();

    const raw = localStorage.getItem('ourJourneyProgress');
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!).language).toBe('en');
  });

  it('resumes from localStorage on a fresh injection', () => {
    service.beginHunt('es');
    service.markArrived(HUNT_STOPS[0].id);
    TestBed.flushEffects();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const resumed = TestBed.inject(HuntStoreService);

    expect(resumed.progress().language).toBe('es');
    expect(resumed.progress().stops[HUNT_STOPS[0].id].arrived).toBe(true);
  });

  it('resetHunt clears devModeUnlocked and all progress', () => {
    service.unlockDevMode();
    service.beginHunt('en');
    service.resetHunt();

    expect(service.progress().devModeUnlocked).toBe(false);
    expect(service.progress().language).toBeNull();
    expect(service.progress().currentPhase).toBe('cover');
  });

  it('autoSolveCurrentPhase on geo-check marks arrived and advances to the next present phase', () => {
    service.beginHunt('en');
    service.setPhase('geo-check');
    service.autoSolveCurrentPhase();

    const stop = HUNT_STOPS[0];
    expect(service.progress().stops[stop.id].arrived).toBe(true);
    expect(service.progress().currentPhase).toBe('minigame');
  });
});
