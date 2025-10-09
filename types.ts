
export enum WordStatus {
  New = 1,
  Learning = 2,
  Known = 3,
}

export interface Word {
  text: string;
  normalized: string;
  definition: string | null;
}

export type Vocabulary = Map<string, WordStatus>;

export interface TextDocument {
  id: string;
  title: string;
  content: string;
  language: string;
  createdAt: number;
}
