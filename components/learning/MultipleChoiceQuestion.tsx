import React, { useState, useEffect } from 'react';
import { Question } from '../../services/lessonService';

interface MultipleChoiceQuestionProps {
    question: Question;
    onAnswer: (isCorrect: boolean) => void;
    status: 'unanswered' | 'correct' | 'incorrect';
}

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({ question, onAnswer, status }) => {
    const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
    
    // Reset selection when question changes
    useEffect(() => {
        setSelectedChoice(null);
    }, [question]);

    const handleSelect = (choice: string) => {
        if (status !== 'unanswered') return;
        setSelectedChoice(choice);
    };
    
    const handleCheck = () => {
        if (!selectedChoice) return;
        onAnswer(selectedChoice === question.word.normalized);
    };

    const getButtonClass = (choice: string) => {
        if (status === 'unanswered') {
            return selectedChoice === choice 
                ? 'bg-indigo-200 border-primary text-primary ring-2 ring-primary' 
                : 'bg-white hover:bg-gray-100 hover:border-gray-300 border-gray-200 transform hover:-translate-y-1 hover:shadow-lg';
        }
        
        // After answer is checked
        if (choice === question.word.normalized) {
            return 'bg-green-200 border-green-500 text-green-800 ring-2 ring-green-500'; // Correct answer
        }
        if (choice === selectedChoice) {
            return 'bg-red-200 border-red-500 text-red-800 ring-2 ring-red-500'; // Incorrectly selected answer
        }
        return 'bg-gray-100 border-gray-200 text-gray-500 opacity-60'; // Other options
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-dark-text text-center">
                Which word means...
            </h2>
            <div className="p-6 bg-white rounded-lg shadow-md text-center min-h-[6rem] flex items-center justify-center">
                <p className="text-xl text-medium-text">{question.word.definition?.definition}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.choices?.map(choice => (
                    <button
                        key={choice}
                        onClick={() => handleSelect(choice)}
                        disabled={status !== 'unanswered'}
                        className={`w-full p-4 text-lg font-semibold text-center border-2 rounded-lg transition-all duration-200 disabled:cursor-not-allowed ${getButtonClass(choice)}`}
                    >
                        {choice}
                    </button>
                ))}
            </div>
            
            {status === 'unanswered' && (
                 <button
                    onClick={handleCheck}
                    disabled={!selectedChoice}
                    className="w-full mt-4 py-3 px-6 text-lg font-bold text-white bg-primary rounded-lg shadow-md hover:bg-indigo-700 transition-transform transform hover:scale-105 disabled:bg-indigo-300 disabled:cursor-not-allowed disabled:transform-none"
                >
                    Check
                </button>
            )}
        </div>
    );
};