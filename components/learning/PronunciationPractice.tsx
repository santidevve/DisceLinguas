import React, { useState, useEffect, useRef } from 'react';
import { GlobalVocabulary } from '../../types';
import { lessonService } from '../../services/lessonService';
import { geminiService, PronunciationFeedback } from '../../services/geminiService';
import { ttsService } from '../../services/ttsService';
import { SpinnerIcon, MicrophoneIcon, SpeakerIcon, CheckCircleIcon, XCircleIcon } from '../IconComponents';

// Helper to convert Blob to Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result as string;
            // remove the prefix e.g., 'data:audio/webm;base64,'
            resolve(base64data.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

interface PronunciationPracticeProps {
    language: string;
    globalVocabulary: GlobalVocabulary;
    onExit: () => void;
}

export const PronunciationPractice: React.FC<PronunciationPracticeProps> = ({ language, globalVocabulary, onExit }) => {
    const [words, setWords] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        const practiceWords = lessonService.getPronunciationPracticeWords(globalVocabulary, language);
        setWords(practiceWords);
        setIsLoading(false);
        if (practiceWords.length === 0) {
            setError("You don't have any 'Learning' or 'Known' words to practice for this language.");
        }
    }, [language, globalVocabulary]);
    
    // Cleanup recorded audio URL
    useEffect(() => {
        return () => {
            if (recordedAudioUrl) {
                URL.revokeObjectURL(recordedAudioUrl);
            }
        };
    }, [recordedAudioUrl]);

    const currentWord = words[currentIndex];

    const handleNextWord = () => {
        if (currentIndex < words.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setFeedback(null);
            setError(null);
            if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
            setRecordedAudioUrl(null);
        } else {
            // End of practice
            onExit();
        }
    };
    
    const handleListenCorrect = () => {
        if (!currentWord) return;
        ttsService.speak(currentWord, language, {
            onStart: () => {},
            onEnd: () => {},
            onError: (e) => console.error("TTS Error", e),
        });
    };
    
    const startRecording = async () => {
        setError(null);
        setFeedback(null);
        if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
        setRecordedAudioUrl(null);
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            recorder.onstop = async () => {
                const mimeType = recorder.mimeType;
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                const audioUrl = URL.createObjectURL(audioBlob);
                setRecordedAudioUrl(audioUrl);

                // Stop all tracks to turn off the microphone indicator
                stream.getTracks().forEach(track => track.stop());

                setIsLoading(true);
                try {
                    const base64Audio = await blobToBase64(audioBlob);
                    const result = await geminiService.evaluatePronunciation(currentWord, language, base64Audio, mimeType);
                    setFeedback(result);
                } catch (e) {
                    setError("Failed to get feedback from the AI. Please try again.");
                } finally {
                    setIsLoading(false);
                }
            };
            
            recorder.start();
            setIsRecording(true);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("Microphone access was denied. Please allow microphone access in your browser settings.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleRecordClick = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    if (isLoading && words.length === 0 && !error) {
        return <div className="flex items-center justify-center h-screen"><SpinnerIcon className="w-12 h-12 text-primary"/></div>;
    }

    if (error && words.length === 0) {
         return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
                <h2 className="text-2xl font-bold text-dark-text mb-2">Could not start practice.</h2>
                <p className="text-medium-text mb-6 max-w-md">{error}</p>
                <button onClick={onExit} className="px-5 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                    Back to Hub
                </button>
            </div>
        );
    }
    
    const progressPercent = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 from-white to-gray-50 bg-gradient-to-br">
            <header className="p-4 w-full max-w-4xl mx-auto flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onExit} className="text-2xl text-gray-400 hover:text-gray-600 transition-colors">&times;</button>
                    <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                        <div 
                            className="bg-secondary h-4 rounded-full transition-all duration-300 ease-in-out" 
                            style={{ width: `${progressPercent}%`}}
                        ></div>
                    </div>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-xl text-center ring-1 ring-black/5">
                    <p className="text-lg text-medium-text mb-2">Pronounce the following word:</p>
                    <div className="flex justify-center items-center gap-4 mb-8">
                        <h1 className="text-6xl font-bold text-primary">{currentWord}</h1>
                        <button
                            onClick={handleListenCorrect}
                            className="text-gray-400 hover:text-primary transition-colors p-2 rounded-full hover:bg-indigo-100"
                            aria-label="Listen to correct pronunciation"
                        >
                            <SpeakerIcon className="w-8 h-8"/>
                        </button>
                    </div>

                    <div className="flex flex-col items-center space-y-4">
                         <button
                            onClick={handleRecordClick}
                            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
                                isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-primary hover:bg-indigo-700'
                            }`}
                            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                        >
                            <MicrophoneIcon className="w-10 h-10 text-white" />
                        </button>
                        <p className="text-sm text-gray-500 h-5">{isRecording ? "Recording..." : "Tap to record"}</p>
                    </div>

                    <div className="mt-8 min-h-[120px]">
                        {isLoading && !isRecording && <SpinnerIcon className="w-10 h-10 text-primary mx-auto" />}
                        {error && !isLoading && <p className="text-red-600">{error}</p>}
                        {feedback && !isLoading && (
                             <div className={`p-4 rounded-lg flex items-start gap-4 ${feedback.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                                {feedback.isCorrect ? <CheckCircleIcon className="w-8 h-8 text-green-600 flex-shrink-0"/> : <XCircleIcon className="w-8 h-8 text-red-600 flex-shrink-0"/>}
                                <div className="text-left">
                                    <h3 className={`text-lg font-bold ${feedback.isCorrect ? 'text-green-800' : 'text-red-800'}`}>Score: {feedback.score}/100</h3>
                                    <p className={`${feedback.isCorrect ? 'text-green-700' : 'text-red-700'}`}>{feedback.feedback}</p>
                                </div>
                            </div>
                        )}
                        {recordedAudioUrl && !isLoading && (
                            <div className="mt-4 flex items-center justify-center gap-4 bg-gray-100 p-2 rounded-lg">
                                <p className="font-semibold text-gray-700">Listen to your recording:</p>
                                <audio controls src={recordedAudioUrl} className="h-8"></audio>
                            </div>
                        )}
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={handleNextWord}
                            disabled={isRecording || isLoading}
                            className="w-full py-3 px-6 text-lg font-bold text-white bg-secondary rounded-lg shadow-md hover:bg-emerald-700 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                           {currentIndex < words.length - 1 ? 'Next Word' : 'Finish Practice'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};