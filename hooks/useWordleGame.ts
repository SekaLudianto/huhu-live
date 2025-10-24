import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage, GiftMessage, GuessData, TileStatus, User } from '../types';
import wordService from '../services/wordService';

const WORD_LENGTH = 5;
const TIMER_DURATION = 900; // 15 menit dalam detik
const PREPARE_TIME = 5; // 5 seconds
const RESTART_TIME = 10; // 10 seconds
const SKIP_NOTICE_DURATION = 5000; // 5 seconds

const praisePhrases = [
    "Kerja bagus!", "Luar biasa!", "Tebakan jitu!", "Hebat sekali!",
    "Kamu jenius!", "Tepat sasaran!", "Mantap betul!", "Spektakuler!"
];

export interface WordleGameState {
    bestGuess: GuessData | null;
    recentGuesses: GuessData[];
    isPreparing: boolean;
    isLoading: boolean;
    timeLeft: number | null;
    isGameOver: boolean;
    isPaused: boolean;
    gameMessage: string;
    isModalOpen: boolean;
    modalContent: {
        title: string;
        word: string;
        winner: User | null;
        praise: string;
        definitions: string[];
        examples: string[];
    };
    bannedWords: Set<string>;
    skippedWordInfo: { word: string; timestamp: number } | null;
}

export interface WordleGameActions {
    startNewGame: (word?: string) => void;
    revealWord: () => void;
    skipWord: () => void;
    togglePause: () => void;
}

interface UseWordleGameProps {
    isConnected: boolean;
    participants: Set<string>;
    updateLeaderboard: (winner: User) => void;
    showValidationToast: (content: string, type?: 'info' | 'error') => void;
    showParticipationReminder: (user: User) => void;
    onInstantWin: (user: User) => void;
    onNewGameStart: () => void;
    addParticipant: (user: User, reason: 'follow' | 'gift' | 'comment') => void;
}

const calculateStatuses = (guess: string, solution: string): TileStatus[] => {
    if (guess.toUpperCase() === solution.toUpperCase()) {
        return Array(solution.length).fill('correct');
    }

    const guessChars = guess.toUpperCase().split('');
    const solutionChars = solution.toUpperCase().split('');
    const statuses: TileStatus[] = Array(solution.length).fill('absent');
  
    // Find 'correct' matches first
    guessChars.forEach((letter, i) => {
      if (solutionChars[i] === letter) {
        statuses[i] = 'correct';
        solutionChars[i] = ''; // Mark as used to prevent re-matching
      }
    });
  
    // Find 'present' matches
    guessChars.forEach((letter, i) => {
      if (statuses[i] !== 'correct') {
        const indexInSolution = solutionChars.indexOf(letter);
        if (indexInSolution !== -1) {
          statuses[i] = 'present';
          solutionChars[indexInSolution] = ''; // Mark as used
        }
      }
    });

    return statuses;
};

export const useWordleGame = ({
    isConnected,
    participants,
    updateLeaderboard,
    showValidationToast,
    showParticipationReminder,
    onInstantWin,
    onNewGameStart,
    addParticipant,
}: UseWordleGameProps) => {
    const [solution, setSolution] = useState('');
    const [guesses, setGuesses] = useState<GuessData[]>([]);
    const [bestGuess, setBestGuess] = useState<GuessData | null>(null);
    const [recentGuesses, setRecentGuesses] = useState<GuessData[]>([]);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isPreparing, setIsPreparing] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [gameMessage, setGameMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', word: '', winner: null as User | null, praise: '', definitions: [] as string[], examples: [] as string[] });
    const [bannedWords, setBannedWords] = useState<Set<string>>(new Set());
    const [skippedWordInfo, setSkippedWordInfo] = useState<{ word: string; timestamp: number } | null>(null);

    const timerRef = useRef<number | null>(null);
    const restartTimeoutRef = useRef<number | null>(null);
    const guessedWordsRef = useRef(new Set<string>());
    const originalGameMessageRef = useRef('');

    const clearAllTimers = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
            restartTimeoutRef.current = null;
        }
    }, []);

    const showEndGameModal = useCallback((winner: User | null) => {
        const wordDef = wordService.getWordDefinition(solution);
        let definitions = wordDef ? [...wordDef.submakna] : ['Definisi tidak ditemukan.'];
        const examples = wordDef ? wordDef.contoh : [];
        const randomPraise = winner ? praisePhrases[Math.floor(Math.random() * praisePhrases.length)] : '';
        
        if (definitions[0] && definitions[0].length > 150) {
            definitions[0] = definitions[0].substring(0, 150) + '...';
        }

        setModalContent({
            title: winner ? "Selamat!" : "Waktu Habis!",
            word: solution,
            winner,
            praise: randomPraise,
            definitions,
            examples
        });
        setIsModalOpen(true);
    }, [solution]);

    const startNewGame = useCallback((specificWord?: string) => {
        clearAllTimers();
        setIsModalOpen(false);
        setSkippedWordInfo(null);
        setIsGameOver(false);
        setIsLoading(true);
        setIsPreparing(true);
        setIsPaused(false);
        setTimeLeft(null);
        setGameMessage('Mempersiapkan kata baru...');
        setGuesses([]);
        setBestGuess(null);
        setRecentGuesses([]);
        guessedWordsRef.current.clear();
        onNewGameStart();
        
        setTimeout(() => {
            let newWord = specificWord;
            if (!newWord) {
                let attempts = 0;
                do {
                    newWord = wordService.getRandomWord(WORD_LENGTH);
                    attempts++;
                } while (bannedWords.has(newWord) && attempts < 50); // Safety break
            }
            
            if(newWord) {
                setSolution(newWord);
                setIsLoading(false);
                setIsPreparing(false);
                setTimeLeft(TIMER_DURATION);
                const msg = `Kata baru: ${WORD_LENGTH} huruf. Semangat!`;
                setGameMessage(msg);
                originalGameMessageRef.current = msg;
            } else {
                setGameMessage('Gagal mengambil kata baru. Coba lagi.');
            }
        }, PREPARE_TIME * 1000);

    }, [clearAllTimers, onNewGameStart, bannedWords]);

    const endGame = useCallback((winner: User | null) => {
        if (isGameOver) return;
        clearAllTimers();
        setIsGameOver(true);
        setTimeLeft(0);
        setGameMessage(winner ? `Pemenang: ${winner.nickname}` : 'Waktu habis! Menunggu game baru...');
        if (winner) {
            updateLeaderboard(winner);
        }
        showEndGameModal(winner);

        restartTimeoutRef.current = window.setTimeout(() => {
            startNewGame();
        }, RESTART_TIME * 1000);

    }, [isGameOver, clearAllTimers, updateLeaderboard, showEndGameModal, startNewGame]);

    const skipWord = useCallback(() => {
        if (solution) {
            setBannedWords(prev => new Set(prev).add(solution));
            setSkippedWordInfo({ word: solution, timestamp: Date.now() });
            clearAllTimers();
            setIsGameOver(true); // Stop current game
            setGameMessage(`Kata '${solution}' dilewati karena terfilter.`);

            restartTimeoutRef.current = window.setTimeout(() => {
                startNewGame();
            }, SKIP_NOTICE_DURATION);
        }
    }, [solution, startNewGame, clearAllTimers]);

    const togglePause = useCallback(() => {
        if (isGameOver || isPreparing) return;
        setIsPaused(prev => {
            const isNowPaused = !prev;
            if (isNowPaused) {
                originalGameMessageRef.current = gameMessage;
                setGameMessage('Game Dijeda oleh Moderator.');
            } else {
                setGameMessage(originalGameMessageRef.current);
            }
            return isNowPaused;
        });
    }, [isGameOver, isPreparing, gameMessage]);

    useEffect(() => {
        if (isConnected) {
            wordService.initialize().then(() => {
                startNewGame();
            });
        }
         return () => clearAllTimers();
    }, [isConnected, startNewGame, clearAllTimers]);

    useEffect(() => {
        if (timeLeft === null || isGameOver || isPaused) {
             if (timerRef.current) {
                clearInterval(timerRef.current);
             }
            return;
        }

        if (timeLeft > 0) {
            timerRef.current = window.setInterval(() => {
                setTimeLeft(prev => (prev !== null ? prev - 1 : 0));
            }, 1000);
        } else if (timeLeft === 0) {
            endGame(null);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [timeLeft, isGameOver, isPaused, endGame]);
    
    const processGuess = useCallback((guess: string, user: User) => {
        if (isGameOver || isPreparing || isLoading || isPaused) return;

        guess = guess.toUpperCase();

        if (guess.length !== WORD_LENGTH) {
            return;
        }

        if (guessedWordsRef.current.has(`${user.uniqueId}-${guess}`)) {
            return; 
        }

        if (!wordService.isValidWord(guess)) {
            if (user.uniqueId === 'ahmadsyams.jpg') {
                showValidationToast(`<b>${user.nickname}</b>, kata '${guess}' tidak ada di kamus!`, 'error');
            }
            return;
        }

        guessedWordsRef.current.add(`${user.uniqueId}-${guess}`);

        const statuses = calculateStatuses(guess, solution);
        const newGuess: GuessData = { guess, user, statuses };

        setGuesses(prev => [...prev, newGuess]);

        if (guess.toUpperCase() === solution.toUpperCase()) {
            endGame(user);
            return;
        }
        
        const correctCount = statuses.filter(s => s === 'correct').length;
        
        if (!bestGuess || correctCount > bestGuess.statuses.filter(s => s === 'correct').length) {
            if(bestGuess) {
                setRecentGuesses(prev => [bestGuess, ...prev].slice(0, 3));
            }
            setBestGuess(newGuess);
        } else {
            setRecentGuesses(prev => [newGuess, ...prev].slice(0, 3));
        }

    }, [isGameOver, isPreparing, isLoading, isPaused, solution, bestGuess, endGame, showValidationToast]);

    const processChatMessage = useCallback((message: ChatMessage) => {
        const comment = message.comment.trim();
        const guess = comment.toUpperCase();

        if (comment.toLowerCase() === 'semangat') {
            addParticipant(message, 'comment');
            return;
        }
        
        if (participants.has(message.uniqueId)) {
            processGuess(comment, message);
        } else {
            if (guess.length === WORD_LENGTH && /^[A-Z]+$/.test(guess)) {
                showParticipationReminder(message);
            }
        }
    }, [processGuess, participants, addParticipant, showParticipationReminder]);
    
    const processGiftMessage = useCallback((message: GiftMessage) => {
        addParticipant(message, 'gift');
        
        if (message.diamondCount >= 30) {
            onInstantWin(message);
        } else if (message.diamondCount >= 10) {
            endGame(message);
        }
    }, [endGame, addParticipant, onInstantWin]);
    
    const revealWord = useCallback(() => {
        endGame(null);
    }, [endGame]);

    const actions: WordleGameActions = {
        startNewGame,
        revealWord,
        skipWord,
        togglePause,
    };
    
    const gameState: WordleGameState = {
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
        bannedWords,
        skippedWordInfo,
    };

    return {
        gameState,
        actions,
        processChatMessage,
        processGiftMessage,
    };
};
