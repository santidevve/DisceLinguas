import React, { useMemo } from 'react';
import type { Vocabulary, Word } from '../types';
import { WordStatus } from '../types';

interface ReadingPanelProps {
  text: string;
  vocabulary: Vocabulary;
  onWordClick: (word: Word) => void;
  selectedWord: Word | null;
}

const getStatusHighlightClass = (status: WordStatus) => {
  switch (status) {
    case WordStatus.Learning:
      return 'bg-yellow-400/30';
    case WordStatus.Known:
      return 'bg-green-500/30';
    case WordStatus.New:
    default:
      return 'hover:bg-blue-400/20';
  }
};

const isWord = (text: string): boolean => /^[a-zA-ZÀ-ÿ'-]+$/.test(text);

export const ReadingPanel: React.FC<ReadingPanelProps> = ({ text, vocabulary, onWordClick, selectedWord }) => {

  const parsedText = useMemo(() => {
    // This regex splits the text into words (including apostrophes/hyphens) and non-word characters (spaces, punctuation).
    return text.split(/([\w'-]+|[^\w'-]+)/g).filter(part => part);
  }, [text]);

  const processedWords = new Set<string>();

  return (
    <div className="p-8 lg:p-12 bg-white rounded-xl shadow-lg overflow-y-auto h-full ring-1 ring-black/5">
      <p className="text-xl md:text-2xl leading-relaxed font-serif text-gray-800" style={{ whiteSpace: 'pre-wrap' }}>
        {parsedText.map((part, index) => {
          if (isWord(part)) {
            const normalized = part.toLowerCase();

            // If this word has been processed already, render it as plain text.
            if (processedWords.has(normalized)) {
                return <span key={index}>{part}</span>;
            }
            
            // Mark the word as processed for subsequent encounters in this text.
            processedWords.add(normalized);

            const status = vocabulary.get(normalized) || WordStatus.New;
            const isSelected = selectedWord?.normalized === normalized;

            let highlightClass: string;
            if (isSelected) {
                highlightClass = 'bg-primary/30';
            } else {
                highlightClass = getStatusHighlightClass(status);
            }

            return (
              <span
                key={index}
                className={`cursor-pointer transition-colors duration-150 rounded-md px-1 -mx-1 ${highlightClass}`}
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
