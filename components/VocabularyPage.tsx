import React, { useMemo } from 'react';
import type { Vocabulary } from '../types';
import { WordStatus } from '../types';

interface VocabularyPageProps {
  vocabulary: Vocabulary;
  onGoHome: () => void;
}

const WordColumn: React.FC<{ title: string; words: string[]; colorClass: string; }> = ({ title, words, colorClass }) => (
  <div className="flex flex-col bg-white rounded-xl shadow-lg p-6">
    <div className={`flex justify-between items-center pb-3 mb-4 border-b-2 ${colorClass}`}>
      <h3 className="text-xl font-bold text-dark-text">{title}</h3>
      <span className="font-bold text-lg text-medium-text">{words.length}</span>
    </div>
    <div className="flex-grow overflow-y-auto pr-2">
      {words.length > 0 ? (
        <ul className="space-y-2">
          {words.map(word => (
            <li key={word} className="text-medium-text bg-gray-100 rounded-md px-3 py-2">
              {word}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-light-text italic text-center mt-4">No words in this category.</p>
      )}
    </div>
  </div>
);

export const VocabularyPage: React.FC<VocabularyPageProps> = ({ vocabulary, onGoHome }) => {

  const { newWords, learningWords, knownWords } = useMemo(() => {
    const newWords: string[] = [];
    const learningWords: string[] = [];
    const knownWords: string[] = [];

    vocabulary.forEach((status, word) => {
      switch (status) {
        case WordStatus.New:
          newWords.push(word);
          break;
        case WordStatus.Learning:
          learningWords.push(word);
          break;
        case WordStatus.Known:
          knownWords.push(word);
          break;
      }
    });

    // Sort them alphabetically for consistent display
    return {
      newWords: newWords.sort((a,b) => a.localeCompare(b)),
      learningWords: learningWords.sort((a,b) => a.localeCompare(b)),
      knownWords: knownWords.sort((a,b) => a.localeCompare(b)),
    };
  }, [vocabulary]);


  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-primary">My Vocabulary</h1>
          <button
            onClick={onGoHome}
            className="px-5 py-2 bg-indigo-100 text-primary font-semibold rounded-lg hover:bg-indigo-200 transition-colors"
          >
            Back to Home
          </button>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8" style={{maxHeight: 'calc(100vh - 150px)', minHeight: '400px'}}>
            <WordColumn title="New" words={newWords} colorClass="border-blue-400" />
            <WordColumn title="Learning" words={learningWords} colorClass="border-yellow-400" />
            <WordColumn title="Known" words={knownWords} colorClass="border-green-500" />
        </main>
      </div>
    </div>
  );
};