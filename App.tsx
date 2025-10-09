import React, { useState, useEffect, useCallback } from 'react';
import { HomePage } from './components/HomePage';
import { TextImporter } from './components/TextImporter';
import { ReadingPanel } from './components/ReadingPanel';
import { WordDetailPanel } from './components/WordDetailPanel';
import { VocabularyPage } from './components/VocabularyPage';
import { vocabularyService } from './services/vocabularyService';
import { textService } from './services/textService';
import { geminiService } from './services/geminiService';
import { WordStatus } from './types';
import type { Vocabulary, Word, TextDocument } from './types';
import { SpinnerIcon } from './components/IconComponents';

type View = 'home' | 'importer' | 'reading' | 'vocabulary';

function App() {
  const [texts, setTexts] = useState<TextDocument[]>([]);
  const [vocabulary, setVocabulary] = useState<Vocabulary>(new Map());
  const [currentView, setCurrentView] = useState<View>('home');
  const [activeText, setActiveText] = useState<TextDocument | null>(null);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [isDefinitionLoading, setIsDefinitionLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadedTexts = textService.getTexts();
    const loadedVocabulary = vocabularyService.getVocabulary();
    
    setTexts(loadedTexts);
    setVocabulary(loadedVocabulary);

    if (loadedTexts.length === 0) {
      setCurrentView('importer');
    } else {
      setCurrentView('home');
    }
  }, []);

  const handleImport = (importedText: string, importedLanguage: string) => {
    const newText = textService.saveText(importedText, importedLanguage);
    setTexts(prevTexts => [...prevTexts, newText]);
    setActiveText(newText);
    setCurrentView('reading');
    setSelectedWord(null);
  };

  const handleSelectText = (id: string) => {
    const textToRead = texts.find(t => t.id === id);
    if (textToRead) {
      setActiveText(textToRead);
      setCurrentView('reading');
      setSelectedWord(null);
    }
  };

  const handleWordClick = useCallback(async (word: Word) => {
    if (!activeText?.language) return;
    
    // Prevent re-fetching if the same word is clicked again
    if (selectedWord?.normalized === word.normalized && selectedWord?.definition) {
      setSelectedWord(selectedWord);
      return;
    }

    setSelectedWord({ ...word, definition: '...' }); // Show loading state immediately
    setIsDefinitionLoading(true);
    
    try {
      const definition = await geminiService.getWordDefinition(word.text, activeText.language);
      setSelectedWord({ ...word, definition });
    } catch (error) {
      console.error("Failed to get word definition:", error);
      setSelectedWord({ ...word, definition: "Error loading definition." });
    } finally {
      setIsDefinitionLoading(false);
    }
  }, [activeText, selectedWord]);

  const handleStatusChange = (word: Word, status: WordStatus) => {
    const newVocabulary = vocabularyService.updateWordStatus(vocabulary, word.normalized, status);
    setVocabulary(newVocabulary);
  };

  const goHome = () => {
    setActiveText(null);
    setSelectedWord(null);
    setCurrentView('home');
  };

  const handleDeleteText = (id: string) => {
    const updatedTexts = textService.deleteText(id);
    setTexts(updatedTexts);
  };

  const handleRenameText = (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    const updatedTexts = textService.updateTextTitle(id, newTitle.trim());
    setTexts(updatedTexts);
  };

  if (currentView === 'vocabulary') {
    return <VocabularyPage vocabulary={vocabulary} onGoHome={goHome} />;
  }
  
  if (currentView === 'home') {
    return (
      <HomePage
        texts={texts}
        onSelectText={handleSelectText}
        onImportNew={() => setCurrentView('importer')}
        onDeleteText={handleDeleteText}
        onRenameText={handleRenameText}
        onShowVocabulary={() => setCurrentView('vocabulary')}
      />
    );
  }

  if (currentView === 'importer') {
    return (
      <TextImporter
        onImport={handleImport}
        onCancel={texts.length > 0 ? goHome : undefined}
      />
    );
  }

  if (currentView === 'reading' && activeText) {
    return (
      <div className="h-screen w-screen bg-gray-100 p-4 lg:p-6 flex flex-col">
        <header className="flex-shrink-0 mb-4">
          <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold text-primary truncate" title={activeText.title}>
                {activeText.title}
            </h1>
            <button
              onClick={goHome}
              className="px-4 py-2 bg-indigo-100 text-primary font-semibold rounded-lg hover:bg-indigo-200 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </header>
        <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
          <div className="lg:col-span-2 min-h-0">
            <ReadingPanel 
              text={activeText.content} 
              vocabulary={vocabulary}
              onWordClick={handleWordClick}
              selectedWord={selectedWord}
            />
          </div>
          <div className="min-h-0">
            <WordDetailPanel
              word={selectedWord}
              isLoading={isDefinitionLoading}
              onStatusChange={handleStatusChange}
              language={activeText.language}
            />
          </div>
        </main>
      </div>
    );
  }

  // Fallback for initial loading or invalid state
  return <div className="flex items-center justify-center h-screen"><SpinnerIcon className="w-12 h-12 text-primary"/></div>;
}

export default App;
