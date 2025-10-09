
export const SUPPORTED_LANGUAGES = [
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Chinese (Simplified)",
  "Japanese",
  "Korean",
  "Arabic",
  "Dutch",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Polish",
  "Turkish",
  "Hindi",
  "English",
];

export const INITIAL_TEXT = `A super-Earth is an extrasolar planet with a mass higher than Earth's, but substantially below those of the Solar System's ice giants, Uranus and Neptune. The term "super-Earth" refers only to the mass of the planet, and so does not imply anything about the surface conditions or habitability. The alternative term "gas dwarf" may be more accurate for those at the higher end of the mass scale, although "mini-Neptune" is a more common term.`;

export const languageCodeMap: { [key: string]: string } = {
  "Spanish": "es-ES",
  "French": "fr-FR",
  "German": "de-DE",
  "Italian": "it-IT",
  "Portuguese": "pt-PT",
  "Russian": "ru-RU",
  "Chinese (Simplified)": "zh-CN",
  "Japanese": "ja-JP",
  "Korean": "ko-KR",
  "Arabic": "ar-SA",
  "Dutch": "nl-NL",
  "Swedish": "sv-SE",
  "Norwegian": "nb-NO",
  "Danish": "da-DK",
  "Finnish": "fi-FI",
  "Polish": "pl-PL",
  "Turkish": "tr-TR",
  "Hindi": "hi-IN",
  "English": "en-US",
};

export const getLanguageCode = (languageName: string): string => {
  return languageCodeMap[languageName] || 'en-US'; // Default to English if not found
};
