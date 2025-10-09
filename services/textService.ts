import type { TextDocument } from '../types';

const TEXTS_STORAGE_KEY = 'lingua_reader_texts';

// Helper to generate a simple title from the text content
const generateTitle = (content: string): string => {
  const trimmed = content.trim();
  if (!trimmed) return "Untitled Text";
  return trimmed.split(/\s+/).slice(0, 5).join(' ') + (trimmed.split(/\s+/).length > 5 ? '...' : '');
};

const getTextsFromStorage = (): TextDocument[] => {
    try {
        const storedTexts = localStorage.getItem(TEXTS_STORAGE_KEY);
        return storedTexts ? JSON.parse(storedTexts) : [];
    } catch (error) {
        console.error("Failed to load texts from localStorage:", error);
        return [];
    }
};

const saveTextsToStorage = (texts: TextDocument[]) => {
    try {
        localStorage.setItem(TEXTS_STORAGE_KEY, JSON.stringify(texts));
    } catch (error) {
        console.error("Failed to save texts to localStorage:", error);
    }
};


export const textService = {
  getTexts: (): TextDocument[] => {
    return getTextsFromStorage();
  },

  saveText: (content: string, language: string): TextDocument => {
    const existingTexts = getTextsFromStorage();
    const newText: TextDocument = {
      id: `text_${Date.now()}`,
      title: generateTitle(content),
      content,
      language,
      createdAt: Date.now(),
    };
    const updatedTexts = [...existingTexts, newText];
    saveTextsToStorage(updatedTexts);
    return newText;
  },
  
  updateTextTitle: (id: string, newTitle: string): TextDocument[] => {
    const texts = getTextsFromStorage();
    const updatedTexts = texts.map(text => 
      text.id === id ? { ...text, title: newTitle } : text
    );
    saveTextsToStorage(updatedTexts);
    return updatedTexts;
  },

  deleteText: (id: string): TextDocument[] => {
    const texts = getTextsFromStorage();
    const updatedTexts = texts.filter(text => text.id !== id);
    saveTextsToStorage(updatedTexts);
    return updatedTexts;
  }
};