
import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage, GiftMessage, GuessData, TileStatus, User, SocialMessage } from '../types';
import wordService from '../services/wordService';

const WORD_LENGTH = 5;
const TIMER_DURATION = 500; // Durasi game diubah menjadi 500 detik
const PREPARE_TIME = 5; // 5 seconds
const GAME_START_COOLDOWN = 3; // Cooldown 3 detik sebelum tebakan diterima
const COOLDOWN_SECONDS = 2; // Cooldown 2 detik per tebakan user
const INACTIVITY_DURATION = 120 * 1000; // 2 menit

const praisePhrases = [
    "Kerja bagus!", "Luar biasa!", "Tebakan jitu!", "Hebat sekali!",
    "Kamu jenius!", "Tepat sasaran!", "Mantap betul!", "Spektakuler!"
];

const GENERIC_AVATAR_URL = 'https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg';
const fakeUsers: User[] = [
    { uniqueId: 'bot_galon', nickname: 'Tukang Galon', profilePictureUrl: GENERIC_AVATAR_URL },
    { uniqueId: 'bot_bakso', nickname: 'Tukang Bakso', profilePictureUrl: GENERIC_AVATAR_URL },
    { uniqueId: 'bot_ibu_rt', nickname: 'Ibu RT', profilePictureUrl: GENERIC_AVATAR_URL },
    { uniqueId: 'bot_ojol', nickname: 'Driver Ojol', profilePictureUrl: GENERIC_AVATAR_URL },
    { uniqueId: 'bot_ronda', nickname: 'Bapak Hansip', profilePictureUrl: GENERIC_AVATAR_URL },
    { uniqueId: 'bot_wibu', nickname: 'Wibu Akut', profilePictureUrl: GENERIC_AVATAR_URL },
    { uniqueId: 'bot_emak', nickname: 'Emak-emak Sen', profilePictureUrl: GENERIC_AVATAR_URL },
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
    gameMode: 'random' | 'selected';
}

export interface WordleGameActions {
    startNewGame: (word?: string) => void;
    revealWord: () => void;
    skipWord: () => void;
    setGameModeAndRestart: (mode: 'random' | 'selected') => void;
}

interface UseWordleGameProps {
    isConnected: boolean;
    moderators: Set<string>;
    updateLeaderboard: (winner: User) => void;
    showValidationToast: (content: string, type?: 'info' | 'error') => void;
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
    const [gameMode, setGameMode] = useState<'random' | 'selected'>('random');
    
    const timerRef = useRef<number | null>(null);
    const guessedWordsRef = useRef(new Set<string>());
    const inactivityTimerRef = useRef<number | null>(null);

    const clearAllTimers = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
            inactivityTimerRef.current = null;
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

    // Forward declaration for resetInactivityTimer
    const resetInactivityTimer = useRef(() => {});

    const processGuess = useCallback((guess: string, user: User) => {
        if (isGameOver || isPreparing || isLoading || !isAcceptingGuesses) return;
    
        const now = Date.now();
        const lastGuessTime = userCooldowns.get(user.uniqueId);
        // Bot guesses ignore user cooldowns but not global ones
        if (!user.uniqueId.startsWith('bot_') && lastGuessTime && (now - lastGuessTime) < COOLDOWN_SECONDS * 1000) {
            return;
        }
    
        const guessUpper = guess.toUpperCase();
    
        if (guessUpper.length !== WORD_LENGTH) return;
        if (guessedWordsRef.current.has(`${user.uniqueId}-${guessUpper}`)) return;
    
        // Validasi kata tebakan selalu menggunakan kamus utama, tidak peduli mode permainan.
        if (!wordService.isValidWord(guessUpper)) {
            if (!user.uniqueId.startsWith('bot_')) {
                showValidationToast(`<b>${user.nickname}</b>, kata '<b>${guessUpper}</b>' tidak ada di kamus!`, 'error');
            }
            return;
        }
    
        resetInactivityTimer.current();

        guessedWordsRef.current.add(`${user.uniqueId}-${guessUpper}`);
        setUserCooldowns(prev => new Map(prev).set(user.uniqueId, now));
    
        const pendingGuess: GuessData = {
            guess: guessUpper,
            user,
            statuses: Array(WORD_LENGTH).fill('pending')
        };
    
        const tempStatuses = calculateStatuses(guessUpper, solution);
        const correctCount = tempStatuses.filter(s => s === 'correct').length;
        
        let isNewBest = false;
        if (!bestGuess || correctCount > bestGuess.statuses.filter(s => s === 'correct').length) {
            isNewBest = true;
        }

        if (isNewBest) {
            if (bestGuess) setRecentGuesses(prev => [bestGuess, ...prev].slice(0, 3));
            setBestGuess(pendingGuess);
        } else {
            setRecentGuesses(prev => [pendingGuess, ...prev].slice(0, 3));
        }
        
        setGuesses(prev => [...prev, pendingGuess]);
    
        setTimeout(() => {
            const finalGuess: GuessData = { ...pendingGuess, statuses: tempStatuses };
            setGuesses(prev => prev.map(g => (g.user.uniqueId === user.uniqueId && g.guess === guessUpper && g.statuses[0] === 'pending') ? finalGuess : g));
            if (isNewBest) setBestGuess(finalGuess);
            else setRecentGuesses(prev => prev.map(g => (g.user.uniqueId === user.uniqueId && g.guess === guessUpper && g.statuses[0] === 'pending') ? finalGuess : g));
    
            if (guessUpper === solution.toUpperCase()) {
                endGame(user);
            }
        }, 100);
    
    }, [isGameOver, isPreparing, isLoading, isAcceptingGuesses, solution, bestGuess, showValidationToast, userCooldowns, /*endGame is now a dependency*/]);


    const makeBotGuess = useCallback(() => {
        if (isGameOver || !isAcceptingGuesses || !solution) return;
        
        const botUser = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
        const botWord = wordService.getBotGuess(solution);
        
        if (botWord) {
            processGuess(botWord, botUser);
        }
    }, [isGameOver, isAcceptingGuesses, solution, processGuess]);

    resetInactivityTimer.current = useCallback(() => {
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = window.setTimeout(makeBotGuess, INACTIVITY_DURATION);
    }, [makeBotGuess]);

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
    
    useEffect(() => {
        // This is to update the processGuess function inside the closures of makeBotGuess and resetInactivityTimer
    }, [processGuess, endGame]);


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
                    newWord = wordService.getNewWord(gameMode, WORD_LENGTH);
                    attempts++;
                } while (bannedWords.has(newWord) && attempts < 50);
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
                    resetInactivityTimer.current();
                }, GAME_START_COOLDOWN * 1000);

            } else {
                setGameMessage('Gagal mengambil kata baru. Coba lagi.');
            }
        }, PREPARE_TIME * 1000);

    }, [clearAllTimers, onNewGameStart, bannedWords, gameMode]);

    const skipWord = useCallback(() => {
        if (solution) {
            setBannedWords(prev => new Set(prev).add(solution));
        }
        startNewGame();
    }, [solution, startNewGame]);

    const setGameModeAndRestart = useCallback((mode: 'random' | 'selected') => {
        setGameMode(mode);
        startNewGame();
    }, [startNewGame]);

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
    
    const processChatMessage = useCallback((message: ChatMessage) => {
        const comment = message.comment.trim();
        const spacelessGuess = comment.replace(/\s+/g, '').toUpperCase();
        if (spacelessGuess.length === WORD_LENGTH && /^[A-Z]+$/.test(spacelessGuess)) {
            processGuess(spacelessGuess, message);
            return; 
        }

        const matches = comment.match(/\b[a-zA-Z]{5}\b/g);
        if (matches && matches.length > 0) {
            const lastMatch = matches[matches.length - 1].toUpperCase();
            processGuess(lastMatch, message);
            return;
        }
    }, [processGuess]);
    
    const processGiftMessage = useCallback((message: GiftMessage) => {
        if (message.diamondCount >= 30) {
            onInstantWin(message);
        } else if (message.diamondCount >= 10) {
            endGame(message);
        }
    }, [endGame, onInstantWin]);

    const processSocialMessage = useCallback((message: SocialMessage) => {
        if (message.displayType.includes('follow')) {
            showValidationToast(`Makasih sudah follow, <b>${message.nickname}</b>!`, 'info');
        }
    }, [showValidationToast]);
    
    const revealWord = useCallback(() => {
        endGame(null);
    }, [endGame]);

    const actions: WordleGameActions = {
        startNewGame,
        revealWord,
        skipWord,
        setGameModeAndRestart,
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
        gameMode,
    };

    return {
        gameState,
        actions,
        processChatMessage,
        processGiftMessage,
        processSocialMessage,
    };
};