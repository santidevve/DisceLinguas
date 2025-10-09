
import { WordStatus } from '../types';
import type { Vocabulary } from '../types';

const VOCAB_STORAGE_KEY = 'lingua_reader_vocabulary';

export const vocabularyService = {
  getVocabulary: (): Vocabulary => {
    try {
      const storedVocab = localStorage.getItem(VOCAB_STORAGE_KEY);
      if (storedVocab) {
        const parsed = JSON.parse(storedVocab);
        // JSON.parse doesn't handle Maps, so we need to convert the array of pairs back to a Map.
        return new Map(parsed);
      }
    } catch (error) {
      console.error("Failed to load vocabulary from localStorage:", error);
    }
    return new Map<string, WordStatus>();
  },

  updateWordStatus: (vocabulary: Vocabulary, normalizedWord: string, status: WordStatus): Vocabulary => {
    const newVocabulary = new Map(vocabulary);
    newVocabulary.set(normalizedWord, status);
    try {
        // To store a Map in localStorage, we convert it to an array of [key, value] pairs.
      localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify(Array.from(newVocabulary.entries())));
    } catch (error) {
      console.error("Failed to save vocabulary to localStorage:", error);
    }
    return newVocabulary;
  },
};
