import React from 'react';
import { WordStatus, GlobalVocabulary, Vocabulary } from '../../types';
import { lessonService } from '../../services/lessonService';
import { streakService } from '../../services/streakService';
import { VocabularyIcon, FlameIcon, BrainIcon, LightbulbIcon, CheckCircleIcon, MicrophoneIcon } from '../IconComponents';

interface LearningHubProps {
    language: string;
    globalVocabulary: GlobalVocabulary;
    onStartLesson: () => void;
    onStartPronunciationPractice: () => void;
    onGoHome: () => void;
    onShowVocabulary: () => void;
}

const StatCard: React.FC<{ title: string; value: number; colorClass: string; icon: React.ReactNode }> = ({ title, value, colorClass, icon }) => (
    <div className={`p-4 bg-white rounded-xl shadow-sm border-l-4 ${colorClass} flex items-center`}>
        <div className="mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-dark-text">{value}</p>
        </div>
    </div>
);

export const LearningHub: React.FC<LearningHubProps> = ({ language, globalVocabulary, onStartLesson, onStartPronunciationPractice, onGoHome, onShowVocabulary }) => {
    const vocabularyForLang = globalVocabulary.get(language) || new Map();
    const learningWordsCount = Array.from(vocabularyForLang.values()).filter(s => s === WordStatus.Learning).length;
    const newWordsCount = Array.from(vocabularyForLang.values()).filter(s => s === WordStatus.New).length;
    const knownWordsCount = Array.from(vocabularyForLang.values()).filter(s => s === WordStatus.Known).length;
    const canStartLesson = lessonService.canStartLesson(globalVocabulary, language);
    const canPracticePronunciation = (learningWordsCount + knownWordsCount) > 0;
    const streak = streakService.getStreak(language);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 from-white to-gray-50 bg-gradient-to-br p-4">
            <div className="w-full max-w-2xl mx-auto text-center">
                <header className="mb-8">
                    <h1 className="text-5xl font-extrabold text-primary mb-2">Learning Hub: {language}</h1>
                    <p className="text-xl text-medium-text">Strengthen your vocabulary, one lesson at a time.</p>
                </header>
                
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center bg-white p-4 rounded-xl shadow-lg ring-1 ring-black/5">
                        <FlameIcon className={`w-16 h-16 transition-colors ${streak.count > 0 ? 'text-orange-500' : 'text-gray-300'}`} />
                        <div className="ml-4 text-left">
                            <p className="text-5xl font-bold text-dark-text">{streak.count}</p>
                            <p className="text-lg text-medium-text">Day Streak</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <StatCard title="Words Learning" value={learningWordsCount} colorClass="border-yellow-400" icon={<BrainIcon className="w-8 h-8 text-yellow-500" />} />
                    <StatCard title="Known Words" value={knownWordsCount} colorClass="border-green-400" icon={<CheckCircleIcon className="w-8 h-8 text-green-500" />} />
                    <StatCard title="New Words" value={newWordsCount} colorClass="border-blue-400" icon={<LightbulbIcon className="w-8 h-8 text-blue-500" />} />
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 ring-1 ring-black/5">
                    <button 
                        onClick={onStartLesson}
                        disabled={!canStartLesson}
                        className="w-full py-4 px-6 text-xl font-bold text-white bg-primary rounded-lg shadow-md hover:bg-indigo-700 transition-transform transform hover:scale-105 disabled:bg-indigo-300 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        Start Lesson
                    </button>
                    {!canStartLesson && (
                        <p className="text-sm text-gray-500">
                            You need at least 4 "New" or "Learning" words in {language} to start a lesson. Keep reading to build your vocabulary!
                        </p>
                    )}
                     <button
                        onClick={onStartPronunciationPractice}
                        disabled={!canPracticePronunciation}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-secondary hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary/50 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <MicrophoneIcon className="w-5 h-5"/>
                        Practice Pronunciation
                    </button>
                    {!canPracticePronunciation && (
                        <p className="text-sm text-gray-500">
                            You need at least one "Learning" or "Known" word to practice pronunciation.
                        </p>
                    )}
                     <button
                        onClick={onShowVocabulary}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                        <VocabularyIcon className="w-5 h-5"/>
                        View Full {language} Vocabulary
                    </button>
                </div>
                
                <div className="mt-8">
                    <button onClick={onGoHome} className="font-semibold text-medium-text hover:text-primary transition-colors">
                        &larr; Back to Library
                    </button>
                </div>
            </div>
        </div>
    );
};