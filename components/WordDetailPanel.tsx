
import React, { useState, useEffect } from 'react';
import { WordStatus } from '../types';
import type { Word } from '../types';
import { SpinnerIcon, BookOpenIcon, SpeakerIcon } from './IconComponents';
import { getLanguageCode } from '../constants';

interface WordDetailPanelProps {
  word: Word | null;
  isLoading: boolean;
  onStatusChange: (word: Word, status: WordStatus) => void;
  language: string;
}

const StatusButton: React.FC<{
  onClick: () => void;
  currentStatus: WordStatus;
  buttonStatus: WordStatus;
  label: string;
  colorClass: string;
}> = ({ onClick, currentStatus, buttonStatus, label, colorClass }) => {
  const isActive = currentStatus === buttonStatus;
  return (
    <button
      onClick={onClick}
      className={`flex-1 p-2 text-sm font-semibold rounded-md transition-all duration-200 ${
        isActive
          ? `${colorClass} text-white shadow-md`
          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
      }`}
    >
      {label}
    </button>
  );
};

export const WordDetailPanel: React.FC<WordDetailPanelProps> = ({ word, isLoading, onStatusChange, language }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Cleanup: stop any speech when the word changes or component unmounts.
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    };
  }, [word]);

  const handleSpeak = () => {
    if (!word || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported or no word selected.');
      return;
    }

    // Cancel any ongoing speech before starting a new one
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word.text);
    utterance.lang = getLanguageCode(language);
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  if (!word) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white p-6 rounded-lg shadow-lg text-center">
        <BookOpenIcon className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-medium-text">Select a word</h3>
        <p className="text-light-text mt-1">Click on any word in the text to see its definition and track your progress.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-4xl font-bold text-primary break-words">{word.text}</h2>
        <button
          onClick={handleSpeak}
          disabled={isSpeaking}
          className="text-gray-400 hover:text-primary disabled:text-gray-300 disabled:cursor-not-allowed transition-colors p-2 rounded-full hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50"
          aria-label="Listen to pronunciation"
          title="Listen to pronunciation"
        >
          <SpeakerIcon className={`w-7 h-7 ${isSpeaking ? 'text-primary animate-pulse' : ''}`} />
        </button>
      </div>
      <div className="flex-grow overflow-y-auto mb-4 pr-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <SpinnerIcon className="w-12 h-12 text-primary" />
          </div>
        ) : (
          <p className="text-medium-text whitespace-pre-wrap">{word.definition || 'No definition found.'}</p>
        )}
      </div>
      <div className="mt-auto pt-4 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-600 mb-2">Mark as:</p>
        <div className="flex space-x-2">
          <StatusButton
            onClick={() => onStatusChange(word, WordStatus.New)}
            currentStatus={WordStatus.New}
            buttonStatus={WordStatus.New}
            label="New"
            colorClass="bg-blue-500"
          />
          <StatusButton
            onClick={() => onStatusChange(word, WordStatus.Learning)}
            currentStatus={WordStatus.Learning}
            buttonStatus={WordStatus.Learning}
            label="Learning"
            colorClass="bg-yellow-500"
          />
          <StatusButton
            onClick={() => onStatusChange(word, WordStatus.Known)}
            currentStatus={WordStatus.Known}
            buttonStatus={WordStatus.Known}
            label="Known"
            colorClass="bg-green-500"
          />
        </div>
      </div>
    </div>
  );
};
