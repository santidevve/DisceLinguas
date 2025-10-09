import React, { useState, useEffect } from 'react';
import { Question } from '../../services/lessonService';

interface FillInTheBlankQuestionProps {
    question: Question;
    onAnswer: (isCorrect: boolean) => void;
    status: 'unanswered' | 'correct' | 'incorrect';
}

export const FillInTheBlankQuestion: React.FC<FillInTheBlankQuestionProps> = ({ question, onAnswer, status }) => {
    const [userAnswer, setUserAnswer] = useState('');
    
    // Reset answer when question changes
    useEffect(() => {
        setUserAnswer('');
    }, [question]);

    const sentence = question.word.definition?.exampleSentence || '';
    const wordToBlank = question.word.text; // Use original cased text for accurate replacement
    // Use a regex to blank out the word, case-insensitively
    const blankedSentence = sentence.replace(new RegExp(`\\b${wordToBlank}\\b`, 'i'), '______');
    
    const handleCheck = () => {
        if (!userAnswer.trim()) return;
        const isCorrect = userAnswer.trim().toLowerCase() === question.word.normalized;
        onAnswer(isCorrect);
    };

    const getInputClass = () => {
        if (status === 'unanswered') {
            return 'border-gray-300 focus:border-primary focus:ring-primary';
        }
        return status === 'correct' 
            ? 'border-green-500 bg-green-100 text-green-800 ring-2 ring-green-500'
            : 'border-red-500 bg-red-100 text-red-800 ring-2 ring-red-500';
    };

    return (
        <div className="space-y-6 text-center">
            <h2 className="text-2xl font-semibold text-dark-text">
                Complete the sentence
            </h2>
             <div className="p-6 bg-white rounded-lg shadow-md">
                <p className="text-xl text-medium-text font-serif mb-2">{blankedSentence}</p>
                {question.word.definition?.exampleTranslation && (
                    <p className="text-sm text-gray-500 italic">"{question.word.definition.exampleTranslation}"</p>
                )}
            </div>

            <input 
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && status === 'unanswered') handleCheck(); }}
                disabled={status !== 'unanswered'}
                placeholder="Type the missing word"
                autoFocus
                className={`w-full max-w-sm mx-auto p-4 text-lg text-center border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed ${getInputClass()}`}
            />
            
            {status === 'unanswered' && (
                 <button
                    onClick={handleCheck}
                    disabled={!userAnswer.trim()}
                    className="w-full max-w-sm mx-auto mt-4 py-3 px-6 text-lg font-bold text-white bg-primary rounded-lg shadow-md hover:bg-indigo-700 transition-transform transform hover:scale-105 disabled:bg-indigo-300 disabled:cursor-not-allowed disabled:transform-none"
                >
                    Check
                </button>
            )}
        </div>
    );
};