import React, { useState, useEffect } from 'react';
import { GlobalVocabulary } from '../../types';
import { lessonService, Lesson, Question, QuestionType } from '../../services/lessonService';
import { ttsService } from '../../services/ttsService';
import { SpinnerIcon, CheckCircleIcon, XCircleIcon, SpeakerIcon } from '../IconComponents';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { FillInTheBlankQuestion } from './FillInTheBlankQuestion';
import { LessonSummary } from './LessonSummary';

interface LessonViewProps {
    language: string;
    globalVocabulary: GlobalVocabulary;
    onLessonComplete: () => void;
    onExit: () => void;
}

type AnswerStatus = 'unanswered' | 'correct' | 'incorrect';

export const LessonView: React.FC<LessonViewProps> = ({ language, globalVocabulary, onLessonComplete, onExit }) => {
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answerStatus, setAnswerStatus] = useState<AnswerStatus>('unanswered');
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [showSummary, setShowSummary] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        const createLesson = async () => {
            setIsLoading(true);
            const generatedLesson = await lessonService.generateLesson(globalVocabulary, language);
            setLesson(generatedLesson);
            setIsLoading(false);
        };
        createLesson();
    }, [globalVocabulary, language]);

    useEffect(() => {
        // Cleanup: stop any speech when the component unmounts.
        return () => {
          ttsService.stop();
          setIsSpeaking(false);
        };
      }, []);

    const handleAnswer = (isCorrect: boolean) => {
        if (isCorrect) {
            setAnswerStatus('correct');
            setCorrectAnswers(prev => prev + 1);
        } else {
            setAnswerStatus('incorrect');
        }
    };

    const handleContinue = () => {
        setAnswerStatus('unanswered');
        if (lesson!.questions.length - 1 > currentQuestionIndex) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            onLessonComplete();
            setShowSummary(true);
        }
    };
    
    const handleRestart = () => {
        setShowSummary(false);
        setCurrentQuestionIndex(0);
        setCorrectAnswers(0);
        setAnswerStatus('unanswered');
        // Re-fetch a new lesson
        const createLesson = async () => {
            setIsLoading(true);
            const generatedLesson = await lessonService.generateLesson(globalVocabulary, language);
            setLesson(generatedLesson);
            setIsLoading(false);
        };
        createLesson();
    };

    const handleSpeak = (text: string) => {
        if (!text) return;
    
        ttsService.speak(text, language, {
            onStart: () => setIsSpeaking(true),
            onEnd: () => setIsSpeaking(false),
            onError: (error) => {
                console.error('Speech synthesis error:', error);
                setIsSpeaking(false);
            }
        });
      };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <SpinnerIcon className="w-12 h-12 text-primary" />
                <p className="mt-4 text-lg text-medium-text">Building your lesson...</p>
            </div>
        );
    }
    
    if (showSummary) {
        return <LessonSummary score={correctAnswers} total={lesson?.questions.length || 0} onRestart={handleRestart} onExit={onExit} />
    }

    if (!lesson || lesson.questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
                <h2 className="text-2xl font-bold text-dark-text mb-2">Lesson could not be created.</h2>
                <p className="text-medium-text mb-6">There might not be enough words in your 'New' or 'Learning' lists.</p>
                <button onClick={onExit} className="px-5 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                    Back to Hub
                </button>
            </div>
        );
    }

    const currentQuestion = lesson.questions[currentQuestionIndex];
    const progressPercent = ((currentQuestionIndex) / lesson.questions.length) * 100;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Header */}
            <header className="p-4 w-full max-w-4xl mx-auto">
                <div className="flex items-center gap-4">
                    <button onClick={onExit} className="text-2xl text-gray-400 hover:text-gray-600 transition-colors">&times;</button>
                    <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                        <div 
                            className="bg-green-500 h-4 rounded-full transition-all duration-300 ease-in-out" 
                            style={{ width: `${progressPercent}%`}}
                        ></div>
                    </div>
                </div>
            </header>
            
            {/* Question Area */}
            <main className="flex-grow flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                    {currentQuestion.type === QuestionType.MultipleChoice ? (
                        <MultipleChoiceQuestion question={currentQuestion} onAnswer={handleAnswer} status={answerStatus} />
                    ) : (
                        <FillInTheBlankQuestion question={currentQuestion} onAnswer={handleAnswer} status={answerStatus} />
                    )}
                </div>
            </main>

            {/* Footer / Feedback */}
            <footer className={`h-36 transition-colors duration-300 ${answerStatus === 'correct' ? 'bg-green-100/60' : ''} ${answerStatus === 'incorrect' ? 'bg-red-100/60' : ''}`}>
               {answerStatus !== 'unanswered' && (
                   <div className="w-full max-w-4xl mx-auto p-4 flex items-center justify-between h-full">
                       <div className="flex items-center gap-4">
                           {answerStatus === 'correct' ? 
                                <CheckCircleIcon className="w-10 h-10 text-green-500 flex-shrink-0" /> : 
                                <XCircleIcon className="w-10 h-10 text-red-500 flex-shrink-0" />
                            }
                           <div>
                                <h3 className={`text-2xl font-bold ${answerStatus === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
                                    {answerStatus === 'correct' ? 'Correct!' : 'Incorrect!'}
                               </h3>
                               <div className="flex items-center gap-2 mt-1">
                                    <p className="text-gray-700 font-medium">
                                        The correct answer: <strong className="text-lg text-dark-text">{currentQuestion.word.text}</strong>
                                    </p>
                                    <button
                                        onClick={() => handleSpeak(currentQuestion.word.text)}
                                        disabled={isSpeaking}
                                        className="text-gray-500 hover:text-primary disabled:text-gray-300 disabled:cursor-not-allowed transition-colors p-1 rounded-full hover:bg-indigo-100"
                                        aria-label="Listen to pronunciation"
                                        title="Listen to pronunciation"
                                    >
                                        <SpeakerIcon className={`w-6 h-6 ${isSpeaking ? 'text-primary animate-pulse' : ''}`} />
                                    </button>
                                </div>
                           </div>
                       </div>
                       <button
                           onClick={handleContinue}
                           className={`px-10 py-3 text-lg font-bold text-white rounded-lg shadow-md transition-transform transform hover:scale-105 ${answerStatus === 'correct' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                       >
                           Continue
                       </button>
                   </div>
               )}
            </footer>
        </div>
    );
};
