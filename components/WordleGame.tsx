import React from 'react';
import WordleGrid from './WordleGrid';
import Modal from './Modal';
import { User, TopGifterEntry } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { WordleGameState } from '../hooks/useWordleGame';
import TopGifterMarquee from './TopGifterMarquee';
import ValidationToast from './ValidationToast';

interface WordleGameProps {
    gameState: WordleGameState;
    topGifters: TopGifterEntry[];
    validationToast: { show: boolean, content: string, type: 'info' | 'error' };
}

const WordleGame: React.FC<WordleGameProps> = ({ gameState, topGifters, validationToast }) => {
    const {
        bestGuess,
        recentGuesses,
        isPreparing,
        isLoading,
        timeLeft,
        isGameOver,
        gameMessage,
        isModalOpen,
        modalContent,
        autoRestartGame,
    } = gameState;

    const WORD_LENGTH = 5;

    const formatTime = (seconds: number | null) => {
        if (seconds === null) return null;
        return seconds.toString();
    };

    const MAX_DEF_LENGTH = 120;
    const truncateDefinition = (def: string) => {
        if (def.length > MAX_DEF_LENGTH) {
            const lastSpace = def.substring(0, MAX_DEF_LENGTH).lastIndexOf(' ');
            const cutoff = lastSpace > 0 ? lastSpace : MAX_DEF_LENGTH;
            return def.substring(0, cutoff) + '...';
        }
        return def;
    };

    return (
        <>
            <div className="bg-gray-900/50 p-2 md:p-6 rounded-lg flex flex-col h-full relative overflow-hidden">
                <ValidationToast 
                    show={validationToast.show}
                    content={validationToast.content}
                    type={validationToast.type}
                />
                {isPreparing ? (
                     <div className="text-center text-base md:text-lg font-bold mb-1 text-yellow-400 animate-pulse h-[28px] flex items-center justify-center">
                        Bersiap...
                    </div>
                ) : timeLeft !== null ? (
                    <div className={`text-center text-base md:text-lg font-bold mb-1 h-[28px] flex items-center justify-center ${timeLeft <= 30 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                        {formatTime(timeLeft)}
                    </div>
                ) : (
                    <div className="h-[28px] mb-1"></div> 
                )}
                
                <p className="text-center text-gray-400 text-xs md:text-sm mb-1 flex items-center justify-center">
                    {isPreparing ? 'Game baru akan segera dimulai!' : `Kirim gift, follow, atau komen SEMANGAT untuk ikut menebak!`}
                </p>
                <div className="w-full mx-auto flex-grow overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <SpinnerIcon className="w-10 h-10" />
                        </div>
                    ) : (
                        <div className="h-full overflow-y-auto pr-2 pb-10">
                            <WordleGrid 
                                bestGuess={bestGuess}
                                recentGuesses={recentGuesses}
                                wordLength={WORD_LENGTH} 
                            />
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-center justify-center mt-1">
                    <div className="text-center text-sm md:text-base font-medium text-cyan-400 h-6">
                        {isPreparing ? 'Kata baru sedang disiapkan...' : gameMessage}
                    </div>
                </div>
                <TopGifterMarquee topGifters={topGifters} />
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={autoRestartGame} 
                title={modalContent.title}
                actionDelay={10}
            >
                 {modalContent.winner ? (
                    <div className="text-center">
                        {modalContent.praise && (
                            <p className="text-lg italic text-green-400 mb-2">
                                "{modalContent.praise}"
                            </p>
                        )}
                        <img src={modalContent.winner.profilePictureUrl} alt={modalContent.winner.nickname} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-cyan-400"/>
                        <p className="text-xl font-bold text-white">{modalContent.winner.nickname}</p>
                        <p>Berhasil menebak kata:</p>
                        <p className="text-cyan-400 text-2xl font-bold my-2">{modalContent.word}</p>
                         {modalContent.definitions.length > 0 && modalContent.definitions[0] !== 'Definisi tidak ditemukan.' && (
                             <div className="mt-2 pt-2 border-t border-gray-700 text-left">
                                 <p className="font-semibold">Definisi:</p>
                                 <ul className="text-sm list-disc list-inside space-y-1">
                                    {modalContent.definitions.map((def, i) => <li key={i}>{truncateDefinition(def)}</li>)}
                                 </ul>
                                 {modalContent.bahasa && <p className="text-xs text-gray-400 mt-1">Asal Bahasa: {modalContent.bahasa}</p>}
                                  {modalContent.examples.length > 0 && (
                                    <>
                                     <p className="font-semibold mt-2">Contoh:</p>
                                     <ul className="text-sm list-disc list-inside space-y-1">
                                        {modalContent.examples.map((ex, i) => <li key={i} className="italic">"{ex}"</li>)}
                                     </ul>
                                    </>
                                  )}
                             </div>
                         )}
                    </div>
                 ) : (
                    <>
                         <p>Kata rahasianya adalah: <b className="text-cyan-400 text-xl">{modalContent.word}</b></p>
                         {modalContent.definitions.length > 0 && modalContent.definitions[0] !== 'Definisi tidak ditemukan.' && (
                             <div className="mt-2 pt-2 border-t border-gray-700 text-left">
                                 <p className="font-semibold">Definisi:</p>
                                 <ul className="text-sm list-disc list-inside space-y-1">
                                    {modalContent.definitions.map((def, i) => <li key={i}>{truncateDefinition(def)}</li>)}
                                 </ul>
                                 {modalContent.bahasa && <p className="text-xs text-gray-400 mt-1">Asal Bahasa: {modalContent.bahasa}</p>}
                                  {modalContent.examples.length > 0 && (
                                    <>
                                     <p className="font-semibold mt-2">Contoh:</p>
                                     <ul className="text-sm list-disc list-inside space-y-1">
                                        {modalContent.examples.map((ex, i) => <li key={i} className="italic">"{ex}"</li>)}
                                     </ul>
                                    </>
                                  )}
                             </div>
                         )}
                    </>
                 )}
                 <p className="text-xs text-gray-400 mt-4">Game baru akan dimulai secara otomatis...</p>
            </Modal>
        </>
    );
};

export default WordleGame;