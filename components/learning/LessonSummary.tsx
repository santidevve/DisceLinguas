import React from 'react';

interface LessonSummaryProps {
    score: number;
    total: number;
    onRestart: () => void;
    onExit: () => void;
}

export const LessonSummary: React.FC<LessonSummaryProps> = ({ score, total, onRestart, onExit }) => {
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    
    let message = "Great job!";
    if (percentage < 50) {
        message = "Keep practicing!";
    } else if (percentage >= 90) {
        message = "Excellent work!";
    }
    
    const circumference = 2 * Math.PI * 55; // 2 * pi * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 from-white to-gray-50 bg-gradient-to-br p-4 text-center">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md ring-1 ring-black/5">
                <h1 className="text-4xl font-bold text-primary mb-4">{message}</h1>
                <p className="text-lg text-medium-text mb-6">You completed the lesson.</p>

                <div className="mb-8 flex justify-center">
                    <div className="relative w-40 h-40">
                        <svg className="w-full h-full" viewBox="0 0 120 120">
                            <circle
                                className="text-gray-200"
                                strokeWidth="10"
                                stroke="currentColor"
                                fill="transparent"
                                r="55"
                                cx="60"
                                cy="60"
                            />
                            <circle
                                className="text-secondary"
                                strokeWidth="10"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="55"
                                cx="60"
                                cy="60"
                                transform="rotate(-90 60 60)"
                                style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-secondary">{percentage}%</span>
                            <span className="text-sm text-medium-text">{score} / {total}</span>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-3">
                    <button
                        onClick={onRestart}
                        className="w-full py-3 px-6 text-lg font-bold text-white bg-primary rounded-lg shadow-md hover:bg-indigo-700 transition-transform transform hover:scale-105"
                    >
                        Practice Again
                    </button>
                     <button
                        onClick={onExit}
                        className="w-full py-3 px-6 text-lg font-bold text-primary bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors"
                    >
                        Return to Hub
                    </button>
                </div>
            </div>
        </div>
    );
};