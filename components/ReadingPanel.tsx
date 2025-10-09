
import React, { useMemo } from 'react';
import type { Vocabulary, Word } from '../types';
import { WordStatus } from '../types';

interface ReadingPanelProps {
  text: string;
  vocabulary: Vocabulary;
  onWordClick: (word: Word) => void;
  selectedWord: Word | null;
}

const getStatusColorClass = (status: WordStatus) => {
  switch (status) {
    case WordStatus.Learning:
      return 'border-b-2 border-yellow-400';
    case WordStatus.Known:
      return 'border-b-2 border-green-500';
    case WordStatus.New:
    default:
      return 'border-b-2 border-transparent hover:border-blue-400';
  }
};

const isWord = (text: string): boolean => /^[a-zA-ZÀ-ÿ'-]+$/.test(text);

export const ReadingPanel: React.FC<ReadingPanelProps> = ({ text, vocabulary, onWordClick, selectedWord }) => {

  const parsedText = useMemo(() => {
    // This regex splits the text into words (including apostrophes/hyphens) and non-word characters (spaces, punctuation).
    return text.split(/([\w'-]+|[^\w'-]+)/g).filter(part => part);
  }, [text]);

  return (
    <div className="p-8 lg:p-12 bg-white rounded-lg shadow-lg overflow-y-auto h-full">
      <p className="text-xl md:text-2xl leading-relaxed font-serif text-gray-800" style={{ whiteSpace: 'pre-wrap' }}>
        {parsedText.map((part, index) => {
          if (isWord(part)) {
            const normalized = part.toLowerCase();
            const status = vocabulary.get(normalized) || WordStatus.New;
            const isSelected = selectedWord?.normalized === normalized;
            return (
              <span
                key={index}
                className={`cursor-pointer transition-colors duration-150 ${getStatusColorClass(status)} ${isSelected ? 'bg-blue-200' : ''}`}
                onClick={() => onWordClick({ text: part, normalized, definition: null })}
              >
                {part}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </p>
    </div>
  );
};
