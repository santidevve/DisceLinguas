import type { WordDefinition } from './services/geminiService';

export enum WordStatus {
  New = 1,
  Learning = 2,
  Known = 3,
}

export interface Word {
  text: string;
  normalized: string;
  definition: WordDefinition | null;
}

export type Vocabulary = Map<string, WordStatus>;
export type GlobalVocabulary = Map<string, Vocabulary>; // Key is language string

export interface TextDocument {
  id: string;
  title: string;
  content: string;
  language: string;
  createdAt: number;
}
