import React, { useState } from 'react';
import { SUPPORTED_LANGUAGES } from '../constants';
import { geminiService } from '../services/geminiService';
import { SpinnerIcon } from './IconComponents';

interface TextImporterProps {
  onImport: (text: string, language: string) => void;
  onCancel?: () => void;
}

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-3 text-sm font-semibold focus:outline-none transition-all duration-200 w-1/2 rounded-t-lg ${
        isActive
        ? 'border-b-2 border-primary text-primary bg-indigo-50'
        : 'text-gray-500 hover:text-primary hover:bg-gray-50'
    }`}
    role="tab"
    aria-selected={isActive}
  >
    {label}
  </button>
);


export const TextImporter: React.FC<TextImporterProps> = ({ onImport, onCancel }) => {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('English'); // Default to English

  const [importerMode, setImporterMode] = useState<'paste' | 'url'>('paste');
  const [url, setUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && language) {
      onImport(text, language);
    }
  };

  const handleFetchFromUrl = async () => {
    if (!url.trim() || !url.startsWith('http')) {
        setFetchError("Please enter a valid URL (e.g., https://...).");
        return;
    }
    setFetchError(null);
    setIsFetching(true);
    try {
        const fetchedText = await geminiService.getTextFromUrl(url);
        setText(fetchedText);
        setImporterMode('paste'); // Switch back to paste tab to show the result
        setUrl('');
    } catch (err) {
        if (err instanceof Error) {
            setFetchError(err.message);
        } else {
            setFetchError("An unknown error occurred while fetching the article.");
        }
    } finally {
        setIsFetching(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 from-white to-gray-50 bg-gradient-to-br">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 space-y-6 relative">
        {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="absolute top-6 left-6 flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
              aria-label="Back to library"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" /></svg>
              <span>Back</span>
            </button>
        )}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary">Lingua Reader</h1>
          <p className="mt-2 text-lg text-medium-text">Import a text to start your reading journey.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-2">
              Language of the Text
            </label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-3 text-base bg-gray-50 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary/50 focus:border-primary transition-all duration-200"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <div className="flex border-b border-gray-200">
                <TabButton label="Paste Text" isActive={importerMode === 'paste'} onClick={() => setImporterMode('paste')} />
                <TabButton label="Import from URL" isActive={importerMode === 'url'} onClick={() => setImporterMode('url')} />
            </div>
            <div className="mt-4">
                {importerMode === 'paste' && (
                    <textarea
                      id="text-input"
                      rows={12}
                      className="block w-full p-3 font-serif text-base bg-gray-50 border-gray-200 rounded-b-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                      placeholder="Paste your text here..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                )}
                {importerMode === 'url' && (
                    <div className="p-4 bg-gray-50 rounded-b-lg border border-t-0 border-gray-200">
                        <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-2">
                          Website URL
                        </label>
                        <div className="flex gap-2">
                            <input 
                                id="url-input"
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com/article"
                                className="flex-grow p-3 text-base bg-white border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                            />
                            <button
                                type="button"
                                onClick={handleFetchFromUrl}
                                disabled={isFetching}
                                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm font-medium text-white bg-secondary hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary/50 transition-transform transform hover:scale-105 duration-200 disabled:bg-gray-400 disabled:transform-none"
                            >
                                {isFetching ? <SpinnerIcon className="w-5 h-5" /> : 'Fetch Text'}
                            </button>
                        </div>
                        {fetchError && <p className="text-red-600 text-sm mt-2">{fetchError}</p>}
                         <p className="text-xs text-gray-500 mt-3">
                            The article text will be extracted using AI and populated in the "Paste Text" tab for review. This works best for simple articles.
                        </p>
                    </div>
                )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row-reverse gap-3">
            <button
              type="submit"
              disabled={isFetching || !text.trim()}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-transform transform hover:scale-105 duration-200 disabled:bg-indigo-300 disabled:cursor-not-allowed disabled:transform-none"
            >
              Start Reading
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};