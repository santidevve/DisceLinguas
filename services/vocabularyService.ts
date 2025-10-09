import { WordStatus } from '../types';
import type { Vocabulary, GlobalVocabulary } from '../types';

const VOCAB_STORAGE_KEY = 'lingua_reader_vocabulary_v2'; // New key for the new data structure

export const vocabularyService = {
  getVocabulary: (): GlobalVocabulary => {
    try {
      const storedVocab = localStorage.getItem(VOCAB_STORAGE_KEY);
      if (storedVocab) {
        const parsed = JSON.parse(storedVocab);
        // Convert array of [lang, vocabArray] back into a nested Map structure
        const globalVocab = new Map<string, Vocabulary>();
        for (const [language, vocabArray] of parsed) {
          globalVocab.set(language, new Map(vocabArray));
        }
        return globalVocab;
      }
    } catch (error) {
      console.error("Failed to load vocabulary from localStorage:", error);
    }
    return new Map<string, Vocabulary>();
  },

  updateWordStatus: (globalVocabulary: GlobalVocabulary, language: string, normalizedWord: string, status: WordStatus): GlobalVocabulary => {
    const newGlobalVocabulary = new Map(globalVocabulary);
    // Get the vocabulary for the specific language, or create a new one if it doesn't exist.
    const languageVocabulary = new Map(newGlobalVocabulary.get(language) || []);
    
    languageVocabulary.set(normalizedWord, status);
    newGlobalVocabulary.set(language, languageVocabulary);

    try {
      // To store, convert the nested Map into a JSON-compatible array structure
      const serializable = Array.from(newGlobalVocabulary.entries()).map(([lang, vocabMap]) => {
        return [lang, Array.from(vocabMap.entries())];
      });
      localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify(serializable));
    } catch (error) {
      console.error("Failed to save vocabulary to localStorage:", error);
    }
    return newGlobalVocabulary;
  },
};
