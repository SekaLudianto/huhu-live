import React, { useState } from 'react';
import { WordleGameActions, WordleGameState } from '../hooks/useWordleGame';
import { AdminIcon } from './icons/AdminIcon';

interface AdminPanelProps {
    isOpen: boolean;
    onClose: () => void;
    actions: WordleGameActions;
    isPaused: boolean;
    moderators: Set<string>;
    addModerator: (username: string) => void;
    removeModerator: (username: string) => void;
    bannedWords: Set<string>;
    isModeratorMode: boolean;
    setIsModeratorMode: (value: boolean) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, actions, isPaused, moderators, addModerator, removeModerator, bannedWords, isModeratorMode, setIsModeratorMode }) => {
    const [nextWord, setNextWord] = useState('');
    const [newMod, setNewMod] = useState('');
    const [activeTab, setActiveTab] = useState('game');

    if (!isOpen) return null;

    const handleSetNextWord = () => {
        const word = nextWord.trim().toUpperCase();
        if (word.length === 5 && /^[A-Z]+$/.test(word)) {
            actions.startNewGame(word);
            setNextWord('');
            onClose();
        } else {
            alert('Kata harus terdiri dari 5 huruf alfabet.');
        }
    };
    
    const handleStartNewGame = () => {
        actions.startNewGame();
        onClose();
    };

    const handleRevealWord = () => {
        actions.revealWord();
        onClose();
    };

    const handleTogglePause = () => {
        actions.togglePause();
        onClose();
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if(activeTab === 'game') handleSetNextWord();
            if(activeTab === 'mods') handleAddModerator();
        }
    };
    
    const handleAddModerator = () => {
        const modUsername = newMod.trim().replace(/^@/, '');
        if (modUsername) {
            addModerator(modUsername);
            setNewMod('');
        }
    }

    const tabs = [
        { id: 'game', label: 'Kontrol Game' },
        { id: 'mods', label: 'Moderator' },
        { id: 'filter', label: 'Filter Kata' },
    ];

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-cyan-500/30 rounded-lg shadow-2xl w-full max-w-sm text-gray-900 dark:text-white"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <AdminIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                            Panel Kontrol Admin
                        </h2>
                        <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white text-2xl font-bold">&times;</button>
                    </div>

                    <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`${
                                        activeTab === tab.id
                                            ? 'border-cyan-500 text-cyan-600 dark:border-cyan-400 dark:text-cyan-300'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="space-y-4">
                        {activeTab === 'game' && (
                            <div className="space-y-3">
                                <button
                                    onClick={handleStartNewGame}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                >
                                    Mulai Game Baru (Acak)
                                </button>
                                <button
                                    onClick={handleTogglePause}
                                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                >
                                    {isPaused ? 'Lanjutkan Game' : 'Jeda Game'}
                                </button>
                                <button
                                    onClick={handleRevealWord}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                >
                                    Buka Kata Sekarang
                                </button>

                                <div className="relative flex items-start pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex h-6 items-center">
                                        <input
                                            id="moderator-mode"
                                            aria-describedby="moderator-mode-description"
                                            name="moderator-mode"
                                            type="checkbox"
                                            checked={isModeratorMode}
                                            onChange={() => setIsModeratorMode(!isModeratorMode)}
                                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-cyan-600 focus:ring-cyan-600 bg-gray-100 dark:bg-gray-900 dark:ring-offset-gray-800"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm leading-6">
                                        <label htmlFor="moderator-mode" className="font-medium text-gray-900 dark:text-gray-100">
                                            Mode Moderator
                                        </label>
                                        <p id="moderator-mode-description" className="text-gray-500 dark:text-gray-400">
                                            Jika aktif, hanya moderator/owner yang bisa skip/pause/start game.
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="space-y-2 pt-2">
                                    <label htmlFor="nextWordInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Atur Kata Berikutnya (5 Huruf):
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            id="nextWordInput"
                                            value={nextWord}
                                            onChange={(e) => setNextWord(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            maxLength={5}
                                            className="flex-grow w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none uppercase"
                                            placeholder="Contoh: DUNIA"
                                        />
                                        <button
                                            onClick={handleSetNextWord}
                                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                        >
                                            Mulai
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'mods' && (
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <label htmlFor="modUsernameInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Tambah Moderator:
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            id="modUsernameInput"
                                            value={newMod}
                                            onChange={(e) => setNewMod(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            className="flex-grow w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                                            placeholder="@username"
                                        />
                                        <button onClick={handleAddModerator} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                            Tambah
                                        </button>
                                    </div>
                                </div>
                                <div className="max-h-40 overflow-y-auto pr-2 space-y-2">
                                    <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mt-2">Daftar Moderator:</h4>
                                    {[...moderators].map(mod => (
                                        <div key={mod} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
                                            <span className="font-mono text-sm">@{mod}</span>
                                            {mod !== 'ahmadsyams.jpg' && (
                                                <button onClick={() => removeModerator(mod)} className="text-xs text-red-500 hover:text-red-700">Hapus</button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'filter' && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Kata yang difilter (via `!skip`):</h4>
                                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md max-h-48 overflow-y-auto">
                                    {bannedWords.size > 0 ? (
                                        <p className="text-sm text-gray-800 dark:text-gray-200 break-words">
                                            {[...bannedWords].join(', ')}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada kata yang difilter.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 px-6 py-2 rounded-b-lg">
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                        Shortcut: Ctrl + Shift + A
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;