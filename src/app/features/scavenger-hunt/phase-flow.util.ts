import { HuntPhase, Stop } from './scavenger-hunt.types';

/**
 * Centralizes "what comes next" so every phase automatically skips whichever
 * sub-phases a given Stop doesn't configure (the finale has no minigame,
 * photo checkpoint, or personal question at all).
 */
export function phaseAfterArrival(stop: Stop): HuntPhase {
  if (stop.isFinale) return 'finale-video';
  if (stop.minigame) return 'minigame';
  if (stop.photoCheckpoint) return 'photo-checkpoint';
  if (stop.personalQuestion) return 'personal-question';
  if (stop.letterMinigame) return 'letter-minigame';
  return 'stop-stamp';
}

export function phaseAfterMinigame(stop: Stop): HuntPhase {
  if (stop.photoCheckpoint) return 'photo-checkpoint';
  if (stop.personalQuestion) return 'personal-question';
  if (stop.letterMinigame) return 'letter-minigame';
  return 'stop-stamp';
}

export function phaseAfterPhoto(stop: Stop): HuntPhase {
  if (stop.personalQuestion) return 'personal-question';
  if (stop.letterMinigame) return 'letter-minigame';
  return 'stop-stamp';
}

export function phaseAfterPersonalQuestion(stop: Stop): HuntPhase {
  if (stop.letterMinigame) return 'letter-minigame';
  return 'stop-stamp';
}

/** Every screen a given Stop can reach, in flow order — drives the debug panel's per-stop screen tree. */
export function screensForStop(stop: Stop): HuntPhase[] {
  const screens: HuntPhase[] = ['stop-intro'];
  if (stop.location) screens.push('geo-check');
  if (stop.minigame) screens.push('minigame');
  if (stop.photoCheckpoint) screens.push('photo-checkpoint');
  if (stop.personalQuestion) screens.push('personal-question');
  if (stop.letterMinigame) screens.push('letter-minigame');
  if (stop.isFinale) {
    screens.push('finale-video', 'proposal-question', 'epilogue', 'finale-montage');
  } else {
    screens.push('stop-stamp');
  }
  return screens;
}
