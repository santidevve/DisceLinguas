import React, { useState, useEffect, useRef } from 'react';
import type { TextDocument } from '../types';
import { geminiService } from '../services/geminiService';
import { SpinnerIcon, BookOpenIcon, PencilIcon, TrashIcon, VocabularyIcon } from './IconComponents';

interface HomePageProps {
  texts: TextDocument[];
  onSelectText: (id: string) => void;
  onImportNew: () => void;
  onDeleteText: (id: string) => void;
  onRenameText: (id: string, newTitle: string) => void;
  onShowVocabulary: () => void;
}

const DeleteConfirmationModal: React.FC<{
    text: TextDocument;
    onConfirm: () => void;
    onCancel: () => void;
}> = ({ text, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-dark-text">Confirm Deletion</h3>
            <p className="mt-2 text-medium-text">
                Are you sure you want to delete the text "{text.title}"? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
);


export const HomePage: React.FC<HomePageProps> = ({ texts, onSelectText, onImportNew, onDeleteText, onRenameText, onShowVocabulary }) => {
  const [quote, setQuote] = useState<string | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState<boolean>(true);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [textToDelete, setTextToDelete] = useState<TextDocument | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchQuote = async () => {
      setIsLoadingQuote(true);
      const fetchedQuote = await geminiService.getRandomQuote();
      setQuote(fetchedQuote);
      setIsLoadingQuote(false);
    };
    fetchQuote();
  }, []);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);


  const handleStartEditing = (text: TextDocument) => {
    setEditingId(text.id);
    setEditingTitle(text.title);
  };

  const handleCancelEditing = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const handleSaveRename = () => {
    if (editingId && editingTitle.trim()) {
      onRenameText(editingId, editingTitle);
    }
    handleCancelEditing();
  };
  
  const handleDeleteClick = (text: TextDocument) => {
    setTextToDelete(text);
  };

  const handleConfirmDelete = () => {
    if (textToDelete) {
      onDeleteText(textToDelete.id);
      setTextToDelete(null);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      {textToDelete && (
        <DeleteConfirmationModal 
            text={textToDelete}
            onConfirm={handleConfirmDelete}
            onCancel={() => setTextToDelete(null)}
        />
      )}
      <div className="w-full max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-bold text-primary mb-2">Lingua Reader</h1>
          <p className="text-xl text-medium-text">Your personal language reading library.</p>
        </header>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 min-h-[8rem] flex items-center justify-center">
          {isLoadingQuote ? (
            <SpinnerIcon className="w-8 h-8 text-primary" />
          ) : (
            <blockquote className="text-center">
              <p className="text-lg italic text-gray-700">"{quote?.split(' - ')[0]}"</p>
              {quote?.includes(' - ') && <footer className="mt-2 text-md text-gray-500">- {quote.split(' - ')[1]}</footer>}
            </blockquote>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-dark-text">My Texts</h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={onShowVocabulary}
                className="px-4 py-2 flex items-center gap-2 bg-indigo-100 text-primary font-semibold rounded-lg hover:bg-indigo-200 transition-colors shadow-sm"
              >
                <VocabularyIcon className="w-5 h-5" />
                <span>My Vocabulary</span>
              </button>
              <button
                onClick={onImportNew}
                className="px-5 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                + Import New Text
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            {texts.length > 0 ? (
              texts.sort((a, b) => b.createdAt - a.createdAt).map(text => (
                <div
                  key={text.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-100/70 transition-all duration-200 flex items-center justify-between group"
                >
                    {editingId === text.id ? (
                        <div className="flex-grow mr-4">
                            <input
                                ref={inputRef}
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onBlur={handleSaveRename}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveRename();
                                    if (e.key === 'Escape') handleCancelEditing();
                                }}
                                className="w-full font-semibold text-lg text-primary bg-gray-100 border-primary border-2 rounded-md p-1 -m-1 focus:outline-none"
                            />
                        </div>
                    ) : (
                        <div onClick={() => onSelectText(text.id)} className="flex-grow cursor-pointer truncate mr-4">
                            <h3 className="font-semibold text-lg text-primary truncate">{text.title}</h3>
                            <p className="text-sm text-gray-500">{text.language} &middot; {new Date(text.createdAt).toLocaleDateString()}</p>
                        </div>
                    )}
                  
                  <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); handleStartEditing(text); }} className="text-gray-500 hover:text-primary p-1 rounded-full hover:bg-indigo-100">
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(text); }} className="text-gray-500 hover:text-red-600 p-1 rounded-full hover:bg-red-100">
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 px-4 border-2 border-dashed border-gray-200 rounded-lg">
                <BookOpenIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <h3 className="text-lg font-semibold text-medium-text">No texts yet.</h3>
                <p className="text-gray-500">Click "Import New Text" to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};