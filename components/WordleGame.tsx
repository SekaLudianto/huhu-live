import React from 'react';
import WordleGrid from './WordleGrid';
import Modal from './Modal';
import { User, TopGifterEntry } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { WordleGameState } from '../hooks/useWordleGame';
import TopGifterMarquee from './TopGifterMarquee';

interface WordleGameProps {
    gameState: WordleGameState;
    topGifters: TopGifterEntry[];
}

const WordleGame: React.FC<WordleGameProps> = ({ gameState, topGifters }) => {
    const {
        bestGuess,
        recentGuesses,
        isPreparing,
        isLoading,
        timeLeft,
        isGameOver,
        isPaused,
        gameMessage,
        isModalOpen,
        modalContent,
    } = gameState;

    const WORD_LENGTH = 5;

    const formatTime = (seconds: number | null) => {
        if (seconds === null) return null;
        return seconds.toString();
    };

    return (
        <>
            <div className="bg-gray-900/50 p-2 md:p-6 rounded-lg flex flex-col h-full overflow-hidden">
                {isPreparing ? (
                     <div className="text-center text-base md:text-lg font-bold mb-1 text-yellow-400 animate-pulse h-[28px] flex items-center justify-center">
                        Bersiap...
                    </div>
                ) : timeLeft !== null ? (
                    <div className={`text-center text-base md:text-lg font-bold mb-1 h-[28px] flex items-center justify-center ${timeLeft <= 30 && !isPaused ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                        {isPaused && <span className="mr-2 px-2 py-0.5 bg-yellow-500 text-white text-sm rounded">DIJEDA</span>}
                        {formatTime(timeLeft)}
                    </div>
                ) : (
                    <div className="h-[28px] mb-1"></div> 
                )}
                
                <p className="text-center text-gray-400 text-xs md:text-sm mb-1 flex items-center justify-center">
                    {isPreparing ? 'Game baru akan segera dimulai!' : `Kirim gift, follow, atau komen 'SEMANGAT' untuk ikut menebak!`}
                </p>
                <div className="relative w-full mx-auto flex-grow overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <SpinnerIcon className="w-10 h-10" />
                        </div>
                    ) : (
                        <div className="h-full overflow-y-auto pr-2 pb-12">
                            <WordleGrid 
                                bestGuess={bestGuess}
                                recentGuesses={recentGuesses}
                                wordLength={WORD_LENGTH} 
                            />
                        </div>
                    )}
                     <div className="absolute bottom-0 left-0 right-0">
                         <TopGifterMarquee topGifters={topGifters} />
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center mt-1">
                    <div className="text-center text-sm md:text-base font-medium text-cyan-400 h-6">
                        {isPreparing ? 'Kata baru sedang disiapkan...' : gameMessage}
                    </div>
                </div>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                title={modalContent.title}
            >
                 {modalContent.winner ? (
                    <div className="text-center">
                        {modalContent.praise && (
                            <p className="text-xl md:text-2xl italic text-green-500 dark:text-green-300 mb-3 font-serif">
                                "{modalContent.praise}"
                            </p>
                        )}
                        <img 
                            src={modalContent.winner.profilePictureUrl} 
                            alt={modalContent.winner.nickname} 
                            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-cyan-400 shadow-lg ring-2 ring-cyan-300 ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-800"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pemenang:</p>
                        <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white break-words">{modalContent.winner.nickname}</p>
                        
                        <p className="mt-4 text-gray-600 dark:text-gray-300">Berhasil menebak kata:</p>
                        <div className="my-2 bg-gray-200 dark:bg-black/30 p-3 rounded-lg">
                             <p className="text-cyan-600 dark:text-cyan-300 text-2xl md:text-3xl font-bold tracking-[0.2em] uppercase">{modalContent.word}</p>
                        </div>
                        
                         {modalContent.definitions.length > 0 && modalContent.definitions[0] !== 'Definisi tidak ditemukan.' && (
                             <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-700 text-left">
                                 <p className="font-semibold text-gray-800 dark:text-gray-200">Definisi:</p>
                                 <ul className="text-sm list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                                    {modalContent.definitions.map((def, i) => <li key={i}>{def}</li>)}
                                 </ul>
                                  {modalContent.examples.length > 0 && (
                                    <>
                                     <p className="font-semibold mt-2 text-gray-800 dark:text-gray-200">Contoh:</p>
                                     <ul className="text-sm list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                                        {modalContent.examples.map((ex, i) => <li key={i} className="italic">"{ex}"</li>)}
                                     </ul>
                                    </>
                                  )}
                             </div>
                         )}
                    </div>
                 ) : (
                    <>
                         <p>Kata rahasianya adalah: <b className="text-cyan-500 dark:text-cyan-400 text-xl">{modalContent.word}</b></p>
                         {modalContent.definitions.length > 0 && modalContent.definitions[0] !== 'Definisi tidak ditemukan.' && (
                             <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-700 text-left">
                                 <p className="font-semibold text-gray-800 dark:text-gray-200">Definisi:</p>
                                 <ul className="text-sm list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                                    {modalContent.definitions.map((def, i) => <li key={i}>{def}</li>)}
                                 </ul>
                                  {modalContent.examples.length > 0 && (
                                    <>
                                     <p className="font-semibold mt-2 text-gray-800 dark:text-gray-200">Contoh:</p>
                                     <ul className="text-sm list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                                        {modalContent.examples.map((ex, i) => <li key={i} className="italic">"{ex}"</li>)}
                                     </ul>
                                    </>
                                  )}
                             </div>
                         )}
                    </>
                 )}
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">Game baru akan dimulai dalam 10 detik...</p>
            </Modal>
        </>
    );
};

export default WordleGame;