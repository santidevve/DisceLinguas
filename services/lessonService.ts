import { GlobalVocabulary, WordStatus, Word } from '../types';
import { geminiService } from './geminiService';

const LESSON_SIZE = 10;
const MIN_WORDS_FOR_LESSON = 4; // Need at least 4 for multiple choice distractors

export enum QuestionType {
  MultipleChoice,
  FillInTheBlank,
}

export interface Question {
  word: Word;
  type: QuestionType;
  choices?: string[]; // For multiple choice
}

export interface Lesson {
  questions: Question[];
}

// Fisher-Yates shuffle algorithm
function shuffle<T>(array: T[]): T[] {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}


export const lessonService = {
  canStartLesson: (globalVocabulary: GlobalVocabulary, language: string): boolean => {
    const vocabulary = globalVocabulary.get(language);
    if (!vocabulary) return false;

    const learningWords = Array.from(vocabulary.entries())
      .filter(([, status]) => status === WordStatus.Learning || status === WordStatus.New);
    return learningWords.length >= MIN_WORDS_FOR_LESSON;
  },

  generateLesson: async (globalVocabulary: GlobalVocabulary, language: string): Promise<Lesson | null> => {
    const vocabulary = globalVocabulary.get(language);
    if (!vocabulary) {
        return null;
    }
    
    const allEligibleWords = Array.from(vocabulary.keys()).filter(key => {
        const status = vocabulary.get(key);
        return status === WordStatus.Learning || status === WordStatus.New;
    });

    if (allEligibleWords.length < MIN_WORDS_FOR_LESSON) {
      return null;
    }

    // Prioritize 'Learning' words, then fill with 'New' words
    const learning = allEligibleWords.filter(key => vocabulary.get(key) === WordStatus.Learning);
    const newest = allEligibleWords.filter(key => vocabulary.get(key) === WordStatus.New);
    
    const shuffledPool = shuffle([...learning, ...newest]);

    // Select words for the lesson, ensuring we don't pick more than available
    const lessonWordStrings = shuffledPool.slice(0, LESSON_SIZE);
    
    // Fetch full word details for the lesson
    const wordPromises = lessonWordStrings.map(async (wordStr) => {
        const definition = await geminiService.getWordDefinition(wordStr, language); 
        return {
            text: wordStr, // In a real app, you'd store the original cased text
            normalized: wordStr.toLowerCase(),
            definition: definition
        } as Word;
    });

    const lessonWords = await Promise.all(wordPromises);

    const questions: Question[] = [];
    for (const word of lessonWords) {
      // Determine question type. Only create fill-in-the-blank if an example sentence exists.
      const hasExample = word.definition && word.definition.exampleSentence;
      const questionType = hasExample && Math.random() > 0.5 
        ? QuestionType.FillInTheBlank 
        : QuestionType.MultipleChoice;

      if (questionType === QuestionType.MultipleChoice) {
        const distractors = shuffle(allEligibleWords.filter(w => w !== word.normalized))
            .slice(0, 3);
        const choices = shuffle([word.normalized, ...distractors]);
        questions.push({ word, type: QuestionType.MultipleChoice, choices });
      } else if (questionType === QuestionType.FillInTheBlank) {
        questions.push({ word, type: QuestionType.FillInTheBlank });
      }
    }

    return { questions: shuffle(questions) };
  },

  getPronunciationPracticeWords: (globalVocabulary: GlobalVocabulary, language: string): string[] => {
    const vocabulary = globalVocabulary.get(language);
    if (!vocabulary) return [];

    // Practice with words they are learning or already know
    const practiceWords = Array.from(vocabulary.entries())
      .filter(([, status]) => status === WordStatus.Learning || status === WordStatus.Known)
      .map(([word]) => word);
      
    return shuffle(practiceWords);
  },
};