import { HuntPhase, Stop } from './scavenger-hunt.types';

/**
 * A notebook-code personal question answered using a letter this same stop's
 * own letterMinigame reveals can't run before that minigame — the player
 * would be asked for a letter they haven't unlocked yet. Everywhere else,
 * personal-question runs before letter-minigame.
 */
function personalQuestionAfterLetterMinigame(stop: Stop): boolean {
  return stop.personalQuestion?.kind === 'notebook-code' && !!stop.letterMinigame;
}

/**
 * Every screen a given Stop can reach, in flow order. The single source of
 * truth for "what comes next" — every phaseAfter* helper below just looks up
 * the next entry in this list, so every phase automatically skips whichever
 * sub-phases a given Stop doesn't configure (the finale has no minigame,
 * photo checkpoint, or personal question at all). Also drives the debug
 * panel's per-stop screen tree.
 */
export function screensForStop(stop: Stop): HuntPhase[] {
  const screens: HuntPhase[] = ['stop-intro'];
  if (stop.location) screens.push('geo-check');
  if (stop.minigame) screens.push('minigame');
  if (stop.photoCheckpoint) screens.push('photo-checkpoint');

  const deferPersonalQuestion = personalQuestionAfterLetterMinigame(stop);
  if (stop.personalQuestion && !deferPersonalQuestion) screens.push('personal-question');
  if (stop.letterMinigame) screens.push('letter-minigame');
  if (stop.personalQuestion && deferPersonalQuestion) screens.push('personal-question');

  if (stop.isFinale) {
    screens.push('finale-video', 'proposal-question', 'epilogue', 'finale-montage');
  } else {
    screens.push('stop-stamp');
  }
  return screens;
}

function nextScreen(stop: Stop, current: HuntPhase): HuntPhase {
  const screens = screensForStop(stop);
  const index = screens.indexOf(current);
  return screens[index + 1] ?? 'stop-stamp';
}

export function phaseAfterArrival(stop: Stop): HuntPhase {
  return nextScreen(stop, stop.location ? 'geo-check' : 'stop-intro');
}

export function phaseAfterMinigame(stop: Stop): HuntPhase {
  return nextScreen(stop, 'minigame');
}

export function phaseAfterPhoto(stop: Stop): HuntPhase {
  return nextScreen(stop, 'photo-checkpoint');
}

export function phaseAfterPersonalQuestion(stop: Stop): HuntPhase {
  return nextScreen(stop, 'personal-question');
}

export function phaseAfterLetterMinigame(stop: Stop): HuntPhase {
  return nextScreen(stop, 'letter-minigame');
}
