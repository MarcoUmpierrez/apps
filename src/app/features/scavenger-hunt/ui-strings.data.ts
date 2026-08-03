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
  | 'skipVideo'
  | 'proposalQuestion'
  | 'yesButton'
  | 'sheSaidYes'
  | 'ourJourney'
  | 'devModeUnlockedToast'
  | 'skipDev'
  | 'jumpToStop'
  | 'diaryClosing';

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
    skipVideo: 'Skip',
    proposalQuestion: 'Will you be my girlfriend?',
    yesButton: 'Yes!',
    sheSaidYes: 'She said YES!',
    ourJourney: 'Our journey',
    devModeUnlockedToast: 'Debug mode unlocked',
    skipDev: 'Skip (dev)',
    jumpToStop: 'Jump to stop',
    diaryClosing: 'More on the next page...',
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
    skipVideo: 'Omitir',
    proposalQuestion: '¿Quieres ser mi novia?',
    yesButton: '¡Sí!',
    sheSaidYes: '¡Ella dijo SÍ!',
    ourJourney: 'Nuestro viaje',
    devModeUnlockedToast: 'Modo de depuración desbloqueado',
    skipDev: 'Omitir (dev)',
    jumpToStop: 'Ir a parada',
    diaryClosing: 'Más en la siguiente página...',
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
