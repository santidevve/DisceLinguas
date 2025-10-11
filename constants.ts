export const SUPPORTED_LANGUAGES = [
  "Arabic",
  "Chinese (Simplified)",
  "Czech",
  "Danish",
  "Dutch",
  "English",
  "Finnish",
  "French",
  "German",
  "Greek",
  "Hebrew",
  "Hindi",
  "Hungarian",
  "Indonesian",
  "Italian",
  "Japanese",
  "Korean",
  "Norwegian",
  "Polish",
  "Portuguese",
  "Romanian",
  "Russian",
  "Spanish",
  "Swedish",
  "Thai",
  "Turkish",
  "Ukrainian",
  "Vietnamese",
];

export const INITIAL_TEXT = `A super-Earth is an extrasolar planet with a mass higher than Earth's, but substantially below those of the Solar System's ice giants, Uranus and Neptune. The term "super-Earth" refers only to the mass of the planet, and so does not imply anything about the surface conditions or habitability. The alternative term "gas dwarf" may be more accurate for those at the higher end of the mass scale, although "mini-Neptune" is a more common term.`;

export const languageCodeMap: { [key: string]: string } = {
  "Arabic": "ar-SA",
  "Chinese (Simplified)": "zh-CN",
  "Czech": "cs-CZ",
  "Danish": "da-DK",
  "Dutch": "nl-NL",
  "English": "en-US",
  "Finnish": "fi-FI",
  "French": "fr-FR",
  "German": "de-DE",
  "Greek": "el-GR",
  "Hebrew": "he-IL",
  "Hindi": "hi-IN",
  "Hungarian": "hu-HU",
  "Indonesian": "id-ID",
  "Italian": "it-IT",
  "Japanese": "ja-JP",
  "Korean": "ko-KR",
  "Norwegian": "nb-NO",
  "Polish": "pl-PL",
  "Portuguese": "pt-PT",
  "Romanian": "ro-RO",
  "Russian": "ru-RU",
  "Spanish": "es-ES",
  "Swedish": "sv-SE",
  "Thai": "th-TH",
  "Turkish": "tr-TR",
  "Ukrainian": "uk-UA",
  "Vietnamese": "vi-VN",
};

export const getLanguageCode = (languageName: string): string => {
  console.log(languageName);
  console.log(languageCodeMap[languageName] || 'en-US';)
  return languageCodeMap[languageName] || 'en-US'; // Default to English if not found
};