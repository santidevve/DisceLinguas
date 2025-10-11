import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { HomePage } from './components/HomePage';
import { TextImporter } from './components/TextImporter';
import { ReadingPanel } from './components/ReadingPanel';
import { WordDetailPanel } from './components/WordDetailPanel';
import { VocabularyPage } from './components/VocabularyPage';
import { LearningHub } from './components/learning/LearningHub';
import { LessonView } from './components/learning/LessonView';
import { PronunciationPractice } from './components/learning/PronunciationPractice';
import { vocabularyService } from './services/vocabularyService';
import { textService } from './services/textService';
import { geminiService } from './services/geminiService';
import { streakService } from './services/streakService';
import { ttsService } from './services/ttsService';
import { SUPPORTED_LANGUAGES } from './constants';
import { WordStatus } from './types';
import type { GlobalVocabulary, Word, TextDocument } from './types';
import { SpinnerIcon, PlayIcon, PauseIcon, StopIcon } from './components/IconComponents';

type View = 'home' | 'importer' | 'reading' | 'vocabulary' | 'learningHub' | 'lesson' | 'pronunciationPractice';

function App() {
  const [texts, setTexts] = useState<TextDocument[]>([]);
  const [vocabulary, setVocabulary] = useState<GlobalVocabulary>(new Map());
  const [currentView, setCurrentView] = useState<View>('home');
  const [activeText, setActiveText] = useState<TextDocument | null>(null);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [isDefinitionLoading, setIsDefinitionLoading] = useState<boolean>(false);
  const [activeLearningLanguage, setActiveLearningLanguage] = useState<string | null>(null);

  // State for text-to-speech
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [ttsGlobalLanguage, setTtsGlobalLanguage] = useState<string | null>(null);


  useEffect(() => {
    const loadedTexts = textService.getTexts();
    const loadedVocabulary = vocabularyService.getVocabulary();
    
    setTexts(loadedTexts);
    setVocabulary(loadedVocabulary);

    setCurrentView('home');
  }, []);
  
  // Cleanup speech synthesis on view change or component unmount
  useEffect(() => {
    return () => {
        ttsService.stop();
    }
  }, []);
  
  const stopReadingAloud = useCallback(() => {
    ttsService.stop();
    setIsReadingAloud(false);
    setIsPaused(false);
  }, []);

  const handleImport = (importedText: string, importedLanguage: string) => {
    const newText = textService.saveText(importedText, importedLanguage);
    setTexts(prevTexts => [...prevTexts, newText]);
    setActiveText(newText);
    setTtsGlobalLanguage(importedLanguage);
    setCurrentView('reading');
    setSelectedWord(null);
  };

  const handleSelectText = (id: string) => {
    const textToRead = texts.find(t => t.id === id);
    if (textToRead) {
      setActiveText(textToRead);
      setTtsGlobalLanguage(textToRead.language);
      setCurrentView('reading');
      setSelectedWord(null);
    }
  };

  const handleWordClick = useCallback(async (word: Word) => {
    if (!activeText?.language) return;
    
    if (selectedWord?.normalized === word.normalized && selectedWord?.definition) {
      setSelectedWord(selectedWord);
      return;
    }

    setSelectedWord({ ...word, definition: null }); 
    setIsDefinitionLoading(true);
    
    try {
      const definition = await geminiService.getWordDefinition(word.text, activeText.language);
      setSelectedWord({ ...word, definition });
    } catch (error) {
      console.error("Failed to get word definition:", error);
      setSelectedWord({ ...word, definition: { definition: "Error loading definition.", exampleSentence: "", exampleTranslation: "" } });
    } finally {
      setIsDefinitionLoading(false);
    }
  }, [activeText, selectedWord]);

  const handleStatusChange = (word: Word, status: WordStatus) => {
    if (!activeText) return;
    const newVocabulary = vocabularyService.updateWordStatus(vocabulary, activeText.language, word.normalized, status);
    setVocabulary(newVocabulary);
  };

  const goHome = () => {
    stopReadingAloud();
    setActiveText(null);
    setSelectedWord(null);
    setActiveLearningLanguage(null);
    setTtsGlobalLanguage(null);
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
  
  const handleStartLearning = (language: string) => {
    setActiveLearningLanguage(language);
    setCurrentView('learningHub');
  };

  const handleStartPronunciationPractice = (language: string) => {
    setActiveLearningLanguage(language);
    setCurrentView('pronunciationPractice');
  };

  const handleLessonComplete = () => {
    if (!activeLearningLanguage) return;
    streakService.updateStreak(activeLearningLanguage);
    setCurrentView('learningHub');
  };

  const handleTtsLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setTtsGlobalLanguage(newLang);
    if (isReadingAloud) {
        stopReadingAloud();
    }
  };

  const handlePlayPauseReading = () => {
    if (!activeText || !ttsGlobalLanguage) return;

    if (isReadingAloud && !isPaused) {
        ttsService.pause();
        setIsPaused(true);
    } else if (isReadingAloud && isPaused) {
        ttsService.resume();
        setIsPaused(false);
    } else {
        stopReadingAloud(); // Clear any previous state
        
        ttsService.speak(activeText.content, ttsGlobalLanguage, {
            onStart: () => {
                setIsReadingAloud(true);
                setIsPaused(false);
            },
            onEnd: () => {
                stopReadingAloud();
            },
            onError: (error) => {
                console.error("Speech Synthesis Error", error);
                stopReadingAloud();
            },
        });
    }
  };

  if (currentView === 'learningHub') {
    if (!activeLearningLanguage) {
      goHome();
      return null;
    }
    return (
      <LearningHub 
        language={activeLearningLanguage}
        globalVocabulary={vocabulary} 
        onStartLesson={() => setCurrentView('lesson')} 
        onStartPronunciationPractice={() => handleStartPronunciationPractice(activeLearningLanguage)}
        onGoHome={goHome} 
        onShowVocabulary={() => setCurrentView('vocabulary')}
      />
    );
  }
  
  if (currentView === 'lesson') {
    if (!activeLearningLanguage) {
      goHome();
      return null;
    }
    return (
      <LessonView 
        language={activeLearningLanguage}
        globalVocabulary={vocabulary} 
        onLessonComplete={handleLessonComplete} 
        onExit={() => setCurrentView('learningHub')} 
      />
    );
  }

  if (currentView === 'pronunciationPractice') {
    if (!activeLearningLanguage) {
        goHome();
        return null;
    }
    return (
        <PronunciationPractice
            language={activeLearningLanguage}
            globalVocabulary={vocabulary}
            onExit={() => setCurrentView('learningHub')}
        />
    );
  }

  if (currentView === 'vocabulary') {
     if (!activeLearningLanguage) {
      goHome();
      return null;
    }
    return (
      <VocabularyPage 
        language={activeLearningLanguage}
        vocabulary={vocabulary.get(activeLearningLanguage) || new Map()} 
        onGoHome={() => setCurrentView('learningHub')} 
      />
    );
  }
  
  if (currentView === 'home') {
    return (
      <HomePage
        texts={texts}
        onSelectText={handleSelectText}
        onImportNew={() => setCurrentView('importer')}
        onDeleteText={handleDeleteText}
        onRenameText={handleRenameText}
        onStartLearning={handleStartLearning}
      />
    );
  }

  if (currentView === 'importer') {
    return (
      <TextImporter
        onImport={handleImport}
        onCancel={goHome}
      />
    );
  }

  if (currentView === 'reading' && activeText) {
    return (
      <div className="h-screen w-screen bg-gray-100 from-white to-gray-50 bg-gradient-to-br p-4 lg:p-6 flex flex-col">
        <header className="flex-shrink-0 mb-4">
          <div className="flex items-center justify-between bg-white/70 backdrop-blur-sm p-3 rounded-xl shadow-sm ring-1 ring-black/5">
            <div className="flex-1 min-w-0">
                <h1 className="text-xl lg:text-2xl font-bold text-primary truncate" title={activeText.title}>
                    {activeText.title}
                </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 mx-4">
                 <div className="flex items-center gap-2">
                    <button
                        onClick={handlePlayPauseReading}
                        className="p-2 text-gray-600 hover:text-primary hover:bg-indigo-100 rounded-full transition-colors"
                        title={isReadingAloud && !isPaused ? "Pause" : "Play"}
                    >
                        {isReadingAloud && !isPaused ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                    </button>
                    {isReadingAloud && (
                        <button
                            onClick={stopReadingAloud}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                            title="Stop"
                        >
                            <StopIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>
                 <div className="flex items-center gap-2">
                    <label htmlFor="tts-global-language-select" className="text-sm font-medium text-gray-600 hidden sm:block">
                        Speech:
                    </label>
                    <select
                        id="tts-global-language-select"
                        value={ttsGlobalLanguage || ''}
                        onChange={handleTtsLanguageChange}
                        className="block w-full pl-2 pr-8 py-1 text-sm bg-gray-50 border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                        aria-label="Select speech language for the whole text"
                    >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <option key={lang} value={lang}>
                                {lang}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="flex-1 flex justify-end">
                <button
                onClick={goHome}
                className="px-4 py-2 bg-indigo-100 text-primary font-semibold rounded-lg hover:bg-indigo-200 transition-colors"
                >
                Back to Home
                </button>
            </div>
          </div>
        </header>
        <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
          <div className="lg:col-span-2 min-h-0">
            <ReadingPanel 
              text={activeText.content} 
              vocabulary={vocabulary.get(activeText.language) || new Map()}
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

  return <div className="flex items-center justify-center h-screen"><SpinnerIcon className="w-12 h-12 text-primary"/></div>;
}

export default App;
