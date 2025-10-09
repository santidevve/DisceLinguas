import { getLanguageCode } from '../constants';

let voices: SpeechSynthesisVoice[] = [];

// This function fetches and caches the list of available voices.
const loadVoices = () => {
  voices = window.speechSynthesis.getVoices();
};

// The 'voiceschanged' event is fired when the list of voices is ready.
if ('speechSynthesis' in window) {
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

// This function attempts to find the best available voice for a given language.
const findBestVoice = (languageCode: string): SpeechSynthesisVoice | null => {
  if (voices.length === 0) {
    // Voices might not have been loaded yet, which can happen on some browsers.
    loadVoices();
  }

  const langVoices = voices.filter(v => v.lang === languageCode);
  if (langVoices.length === 0) return null;

  // Preference order for finding a "better" voice.
  // We prefer voices with common high-quality provider names and non-local voices.
  const preferences = [
    (v: SpeechSynthesisVoice) => v.name.includes('Google'),
    (v: SpeechSynthesisVoice) => v.name.includes('Microsoft'),
    (v: SpeechSynthesisVoice) => !v.localService,
  ];

  for (const pref of preferences) {
    const found = langVoices.find(pref);
    if (found) return found;
  }

  // As a fallback, return the first available voice for that language.
  return langVoices[0];
};

export const ttsService = {
  speak: (text: string, language: string, callbacks: { onStart: () => void; onEnd: () => void; onError: (e: any) => void; onBoundary?: (e: SpeechSynthesisEvent) => void; }) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported.');
      callbacks.onError('Speech synthesis not supported by this browser.');
      return null;
    }

    // It's good practice to stop any currently speaking utterance before starting a new one.
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const languageCode = getLanguageCode(language);
    
    utterance.lang = languageCode;
    const bestVoice = findBestVoice(languageCode);
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onstart = callbacks.onStart;
    utterance.onend = callbacks.onEnd;
    utterance.onerror = (event) => {
        callbacks.onError(event.error);
    };

    if (callbacks.onBoundary) {
        utterance.onboundary = callbacks.onBoundary;
    }

    // On some browsers, the voice list is loaded asynchronously.
    // If no voices were ready on initial load, we speak after they have changed.
    if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
            loadVoices();
            const voice = findBestVoice(languageCode);
            if(voice) utterance.voice = voice;
            window.speechSynthesis.speak(utterance);
        };
    } else {
        window.speechSynthesis.speak(utterance);
    }
    
    return utterance;
  },

  stop: () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },

  pause: () => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.pause();
    }
  },

  resume: () => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.resume();
    }
  }
};
