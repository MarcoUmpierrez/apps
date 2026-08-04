import { HuntPhase, Stop } from './scavenger-hunt.types';

/**
 * Centralizes "what comes next" so every phase automatically skips whichever
 * sub-phases a given Stop doesn't configure (the finale has no minigame,
 * photo checkpoint, or personal question at all).
 */
export function phaseAfterArrival(stop: Stop): HuntPhase {
  if (stop.isFinale) return 'finale-montage';
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
