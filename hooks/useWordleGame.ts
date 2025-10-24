import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage, GiftMessage, GuessData, TileStatus, User, SocialMessage } from '../types';
import wordService from '../services/wordService';
import { participationService } from '../services/participationService';

const WORD_LENGTH = 5;
const TIMER_DURATION = 500; // Durasi game diubah menjadi 500 detik
const PREPARE_TIME = 5; // 5 seconds
const GAME_START_COOLDOWN = 3; // Cooldown 3 detik sebelum tebakan diterima
// FIX: Define COOLDOWN_SECONDS to control user guess frequency.
const COOLDOWN_SECONDS = 2; // Cooldown 2 detik per tebakan user

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
    gameMessage: string;
    isModalOpen: boolean;
    modalContent: {
        title: string;
        word: string;
        winner: User | null;
        praise: string;
        definitions: string[];
        examples: string[];
        bahasa?: string;
    };
    autoRestartGame: () => void;
    bannedWords: Set<string>;
}

export interface WordleGameActions {
    startNewGame: (word?: string) => void;
    revealWord: () => void;
    skipWord: () => void;
}

interface UseWordleGameProps {
    isConnected: boolean;
    moderators: Set<string>;
    updateLeaderboard: (winner: User) => void;
    showValidationToast: (content: string, type?: 'info' | 'error') => void;
    showParticipationReminder: (user: User) => void;
    onInstantWin: (user: User) => void;
    onNewGameStart: () => void;
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
    moderators,
    updateLeaderboard,
    showValidationToast,
    showParticipationReminder,
    onInstantWin,
    onNewGameStart,
}: UseWordleGameProps) => {
    const [solution, setSolution] = useState('');
    const [guesses, setGuesses] = useState<GuessData[]>([]);
    const [bestGuess, setBestGuess] = useState<GuessData | null>(null);
    const [recentGuesses, setRecentGuesses] = useState<GuessData[]>([]);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isPreparing, setIsPreparing] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [gameMessage, setGameMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', word: '', winner: null as User | null, praise: '', definitions: [] as string[], examples: [] as string[], bahasa: undefined as string | undefined });
    const [isAcceptingGuesses, setIsAcceptingGuesses] = useState(false);
    const [bannedWords, setBannedWords] = useState<Set<string>>(new Set());
    const [userCooldowns, setUserCooldowns] = useState(new Map<string, number>());
    const [participants, setParticipants] = useState(() => participationService.getParticipants());


    const timerRef = useRef<number | null>(null);
    const guessedWordsRef = useRef(new Set<string>());

    const addParticipant = useCallback((user: User, reason: 'follow' | 'gift' | 'comment') => {
        if (participants.has(user.uniqueId)) {
            return;
        }

        participationService.addParticipant(user.uniqueId);
        setParticipants(prev => new Set(prev).add(user.uniqueId));

        let toastContent = '';
        if (reason === 'follow') {
            toastContent = `<b>${user.nickname}</b>, terima kasih sudah follow! Kamu sekarang bisa menebak.`;
        } else if (reason === 'gift') {
            toastContent = `<b>${user.nickname}</b>, makasih giftnya! Kamu sekarang bisa menebak.`;
        } else if (reason === 'comment') {
            toastContent = `Makasih <b>${user.nickname}</b> atas semangatnya! Kamu sekarang bisa ikut menebak.`;
        }
        showValidationToast(toastContent, 'info');
    }, [participants, showValidationToast]);


    const clearAllTimers = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const showEndGameModal = useCallback((winner: User | null) => {
        const wordDef = wordService.getWordDefinition(solution);
        let definitions = wordDef?.submakna.length ? [...wordDef.submakna] : ['Definisi tidak ditemukan.'];
        const examples = wordDef?.contoh || [];
        const randomPraise = winner ? praisePhrases[Math.floor(Math.random() * praisePhrases.length)] : '';
        
        setModalContent({
            title: winner ? "Selamat!" : "Waktu Habis!",
            word: solution,
            winner,
            praise: randomPraise,
            definitions,
            examples,
            bahasa: wordDef?.bahasa
        });
        setIsModalOpen(true);

    }, [solution]);

    const endGame = useCallback((winner: User | null) => {
        if (isGameOver) return;
        clearAllTimers();
        setIsGameOver(true);
        setIsAcceptingGuesses(false);
        setTimeLeft(0);
        setGameMessage(winner ? `Pemenang: ${winner.nickname}` : 'Waktu habis! Menunggu game baru...');
        if (winner) {
            updateLeaderboard(winner);
        }
        showEndGameModal(winner);
    }, [isGameOver, clearAllTimers, updateLeaderboard, showEndGameModal]);

    const startNewGame = useCallback((specificWord?: string) => {
        clearAllTimers();
        setIsModalOpen(false);
        setIsGameOver(false);
        setIsLoading(true);
        setIsPreparing(true);
        setIsAcceptingGuesses(false);
        setTimeLeft(null);
        setGameMessage('Mempersiapkan kata baru...');
        setGuesses([]);
        setBestGuess(null);
        setRecentGuesses([]);
        guessedWordsRef.current.clear();
        setUserCooldowns(new Map());
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
                setGameMessage(`Game dimulai dalam ${GAME_START_COOLDOWN} detik...`);
                
                setTimeout(() => {
                    setIsAcceptingGuesses(true);
                    setGameMessage(`Kata baru: ${WORD_LENGTH} huruf. Semangat!`);
                }, GAME_START_COOLDOWN * 1000);

            } else {
                setGameMessage('Gagal mengambil kata baru. Coba lagi.');
            }
        }, PREPARE_TIME * 1000);

    }, [clearAllTimers, onNewGameStart, bannedWords]);

    const skipWord = useCallback(() => {
        if (solution) {
            setBannedWords(prev => new Set(prev).add(solution));
        }
        startNewGame();
    }, [solution, startNewGame]);

    const autoRestartGame = useCallback(() => {
        setIsModalOpen(false);
        startNewGame();
    }, [startNewGame]);

    useEffect(() => {
        if (isConnected) {
            wordService.initialize().then(() => {
                startNewGame();
            });
        }
         return () => clearAllTimers();
    }, [isConnected, startNewGame, clearAllTimers]);

    useEffect(() => {
        if (timeLeft === null || isGameOver) return;

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
    }, [timeLeft, isGameOver, endGame]);
    
    const processGuess = useCallback((guess: string, user: User) => {
        if (isGameOver || isPreparing || isLoading || !isAcceptingGuesses) return;

        const now = Date.now();
        const lastGuessTime = userCooldowns.get(user.uniqueId);
        if (lastGuessTime && (now - lastGuessTime) < COOLDOWN_SECONDS * 1000) {
            return; // Cooldown aktif, abaikan tebakan
        }

        guess = guess.toUpperCase();

        if (guess.length !== WORD_LENGTH) {
            return;
        }

        if (guessedWordsRef.current.has(`${user.uniqueId}-${guess}`)) {
            return; 
        }

        if (!wordService.isValidWord(guess)) {
            showValidationToast(`<b>${user.nickname}</b>, kata '<b>${guess}</b>' tidak ada di kamus!`, 'error');
            return;
        }

        guessedWordsRef.current.add(`${user.uniqueId}-${guess}`);
        setUserCooldowns(prev => new Map(prev).set(user.uniqueId, now));

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

    }, [isGameOver, isPreparing, isLoading, isAcceptingGuesses, solution, bestGuess, endGame, showValidationToast, userCooldowns]);

    const processChatMessage = useCallback((message: ChatMessage) => {
        const comment = message.comment.trim();
        const guess = comment.toUpperCase();
        const isModerator = moderators.has(message.uniqueId.toLowerCase());

        if (comment.toLowerCase() === 'semangat') {
            addParticipant(message, 'comment');
            return;
        }
        
        if (participants.has(message.uniqueId) || isModerator) {
            processGuess(comment, message);
        } else {
            // Check if it's a guess attempt
            if (guess.length === WORD_LENGTH && /^[A-Z]+$/.test(guess)) {
                showParticipationReminder(message);
            }
        }
    }, [processGuess, participants, moderators, addParticipant, showParticipationReminder]);
    
    const processGiftMessage = useCallback((message: GiftMessage) => {
        addParticipant(message, 'gift');
        
        if (message.diamondCount >= 30) {
            onInstantWin(message);
        } else if (message.diamondCount >= 10) {
            endGame(message);
        }
    }, [endGame, addParticipant, onInstantWin]);

    const processSocialMessage = useCallback((message: SocialMessage) => {
        if (message.displayType.includes('follow')) {
            addParticipant(message, 'follow');
        }
    }, [addParticipant]);
    
    const revealWord = useCallback(() => {
        endGame(null);
    }, [endGame]);

    const actions: WordleGameActions = {
        startNewGame,
        revealWord,
        skipWord,
    };
    
    const gameState: WordleGameState = {
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
        bannedWords,
    };

    return {
        gameState,
        actions,
        processChatMessage,
        processGiftMessage,
        processSocialMessage,
    };
};