import { Language } from './scavenger-hunt.types';

export type UiStringKey =
  | 'begin'
  | 'chooseLanguage'
  | 'continueLabel'
  | 'back'
  | 'imHere'
  | 'skipGpsCheck'
  | 'locationUnavailable'
  | 'distanceAway'
  | 'arrivedBadge'
  | 'needHint'
  | 'hintComingSoon'
  | 'gotIt'
  | 'submit'
  | 'wrongTryAgain'
  | 'takePhoto'
  | 'skipPhoto'
  | 'photoTakenBadge'
  | 'revealIt'
  | 'shakeToRevealPrompt'
  | 'enableMotion'
  | 'stampCollected'
  | 'notebookCallout'
  | 'downloadMemory'
  | 'proposalQuestion'
  | 'yesButton'
  | 'sheSaidYes'
  | 'ourJourney'
  | 'devModeUnlockedToast'
  | 'skipDev'
  | 'jumpToStop'
  | 'diaryClosing'
  | 'giveUp'
  | 'simulateShake'
  | 'finaleCongrats'
  | 'oneLastQuestion'
  | 'wordleLengthHint'
  | 'wallBreakPrompt'
  | 'chargeIt'
  | 'hitIt'
  | 'writeLetterDown'
  | 'dirtWipePrompt'
  | 'hanoiPrompt'
  | 'burgerBuildPrompt'
  | 'mazePrompt';

export const UI_STRINGS: Record<Language, Record<UiStringKey, string>> = {
  en: {
    begin: 'Begin the Adventure',
    chooseLanguage: 'Choose your language',
    continueLabel: 'Continue',
    back: 'Back',
    imHere: "I'm here!",
    skipGpsCheck: 'Skip the GPS check',
    locationUnavailable: 'Location unavailable — just tap "I\'m here!" when you arrive.',
    distanceAway: '{distance}m away',
    arrivedBadge: "You've arrived!",
    needHint: 'Need a hint?',
    hintComingSoon: 'Keep trying — a hint unlocks soon!',
    gotIt: 'Got it!',
    submit: 'Submit',
    wrongTryAgain: 'Not quite — try again!',
    takePhoto: 'Take a photo of you and your partner in front of the secret spot',
    skipPhoto: 'Skip this step',
    photoTakenBadge: 'Memory captured',
    revealIt: 'Reveal it',
    shakeToRevealPrompt: 'Shake your phone to reveal it!',
    enableMotion: 'Enable motion',
    stampCollected: 'Stamp collected!',
    notebookCallout: 'Write this in your notebook',
    downloadMemory: 'Download memory',
    proposalQuestion: 'Will you be my girlfriend?',
    yesButton: 'Yes!',
    sheSaidYes: 'She said YES!',
    ourJourney: 'Our journey',
    devModeUnlockedToast: 'Debug mode unlocked',
    skipDev: 'Skip (dev)',
    jumpToStop: 'Jump to stop',
    diaryClosing: 'More on the next page...',
    giveUp: 'I give up',
    simulateShake: 'Shake! (tap again if needed)',
    finaleCongrats: "Congratulations! You've completed every challenge!",
    oneLastQuestion: 'Just one last question remains...',
    wordleLengthHint: 'The word is {length} letters long — write them all on every guess.',
    wallBreakPrompt: 'A wall is hiding a letter. Charge up, then hit it!',
    chargeIt: 'Charge!',
    hitIt: 'Hit it!',
    writeLetterDown: "Write the letter {letter} in your notebook — you'll need it later.",
    dirtWipePrompt: 'Dirt is hiding a letter. Swipe to wipe it clean!',
    hanoiPrompt: 'Move every disc to the last pole. Never place a bigger disc on a smaller one!',
    burgerBuildPrompt: 'Stack the burger in the right order, from the bottom up!',
    mazePrompt: 'Guide the dot through the maze to the flag!',
  },
  es: {
    begin: 'Comenzar la Aventura',
    chooseLanguage: 'Elige tu idioma',
    continueLabel: 'Continuar',
    back: 'Atrás',
    imHere: '¡Aquí estoy!',
    skipGpsCheck: 'Omitir la verificación GPS',
    locationUnavailable: 'Ubicación no disponible — solo toca "¡Aquí estoy!" al llegar.',
    distanceAway: 'a {distance}m',
    arrivedBadge: '¡Has llegado!',
    needHint: '¿Necesitas una pista?',
    hintComingSoon: '¡Sigue intentando — pronto se desbloquea una pista!',
    gotIt: '¡Lo tengo!',
    submit: 'Enviar',
    wrongTryAgain: 'No es correcto — ¡inténtalo de nuevo!',
    takePhoto: 'Tomar una foto de tu compañero y tú en frente del lugar secreto',
    skipPhoto: 'Omitir este paso',
    photoTakenBadge: 'Recuerdo capturado',
    revealIt: 'Revelarlo',
    shakeToRevealPrompt: '¡Agita tu teléfono para revelarlo!',
    enableMotion: 'Activar movimiento',
    stampCollected: '¡Sello coleccionado!',
    notebookCallout: 'Escribe esto en tu cuaderno',
    downloadMemory: 'Descargar recuerdo',
    proposalQuestion: '¿Quieres ser mi novia?',
    yesButton: '¡Sí!',
    sheSaidYes: '¡Ella dijo SÍ!',
    ourJourney: 'Nuestro viaje',
    devModeUnlockedToast: 'Modo de depuración desbloqueado',
    skipDev: 'Omitir (dev)',
    jumpToStop: 'Ir a parada',
    diaryClosing: 'Más en la siguiente página...',
    giveUp: 'Me rindo',
    simulateShake: '¡Agita! (toca de nuevo si hace falta)',
    finaleCongrats: '¡Enhorabuena! ¡Has completado todos los desafíos!',
    oneLastQuestion: 'Solo queda una última pregunta...',
    wordleLengthHint: 'La palabra tiene {length} letras — escríbelas todas en cada intento.',
    wallBreakPrompt: 'Un muro esconde una letra. ¡Carga y golpéalo!',
    chargeIt: '¡Cargar!',
    hitIt: '¡Golpear!',
    writeLetterDown: 'Escribe la letra {letter} en tu cuaderno — la necesitarás más tarde.',
    dirtWipePrompt: 'La tierra esconde una letra. ¡Desliza el dedo para limpiarla!',
    hanoiPrompt:
      'Mueve todos los discos a la última torre. ¡Nunca pongas un disco grande sobre uno más pequeño!',
    burgerBuildPrompt: '¡Apila la hamburguesa en el orden correcto, de abajo hacia arriba!',
    mazePrompt: '¡Guía el punto por el laberinto hasta la bandera!',
  },
};

export function translateUi(
  lang: Language,
  key: UiStringKey,
  params?: Record<string, string | number>,
): string {
  let text = UI_STRINGS[lang][key];
  if (params) {
    for (const [paramKey, value] of Object.entries(params)) {
      text = text.replace(`{${paramKey}}`, String(value));
    }
  }
  return text;
}
