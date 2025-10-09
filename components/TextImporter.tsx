
import React, { useState } from 'react';
import { SUPPORTED_LANGUAGES, INITIAL_TEXT } from '../constants';

interface TextImporterProps {
  onImport: (text: string, language: string) => void;
  onCancel?: () => void; // Optional cancel handler
}

export const TextImporter: React.FC<TextImporterProps> = ({ onImport, onCancel }) => {
  const [text, setText] = useState(INITIAL_TEXT);
  const [language, setLanguage] = useState(SUPPORTED_LANGUAGES[18]); // Default to English

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && language) {
      onImport(text, language);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary">Lingua Reader</h1>
          <p className="mt-2 text-lg text-medium-text">Import a text to start your reading journey.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-3 text-base bg-gray-50 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary/50 focus:border-primary transition-all duration-200"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
              Your Text
            </label>
            <textarea
              id="text-input"
              rows={12}
              className="mt-1 block w-full p-3 text-base bg-gray-50 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary/50 focus:border-primary transition-all duration-200"
              placeholder="Paste your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row-reverse gap-3">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-colors duration-200"
            >
              Start Reading
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
