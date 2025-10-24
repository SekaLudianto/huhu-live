import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTikTok } from './hooks/useTikTok';
import { useWordleGame } from './hooks/useWordleGame';
import Header from './components/Header';
import Stats from './components/Stats';
import WordleGame from './components/WordleGame';
import ChatBox from './components/ChatBox';
import GiftBox from './components/GiftBox';
import Leaderboard from './components/Leaderboard';
import TopGifterBox from './components/TopGifterBox';
import RankOverlay from './components/RankOverlay';
import SultanOverlay from './components/SultanOverlay';
import InfoMarquee from './components/InfoMarquee';
import FollowMeOverlay from './components/FollowMeOverlay';
import AdminPanel from './components/AdminPanel';
import ParticipationReminderOverlay from './components/ParticipationReminderOverlay';
import RankInfoOverlay from './components/RankInfoOverlay';
import { User, LeaderboardEntry, ChatMessage, GiftMessage, SocialMessage, ConnectionState, TopGifterEntry } from './types';
import { GameIcon, LeaderboardIcon, ChatIcon, GiftIcon, StatsIcon, DiamondIcon } from './components/icons/TabIcons';
import { SpinnerIcon } from './components/icons/SpinnerIcon';
import { AdminIcon } from './components/icons/AdminIcon';
import { leaderboardService } from './services/firebaseService';

const TARGET_USERNAME = '@achmadsyams';

const App: React.FC = () => {
    const { 
        isConnected, 
        isConnecting,
        connectionState, 
        errorMessage, 
        connect, 
        latestChatMessage,
        latestGiftMessage,
        latestLikeMessage,
        latestSocialMessage,
        roomUsers,
        totalDiamonds,
    } = useTikTok();
    
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [topGifters, setTopGifters] = useState<TopGifterEntry[]>([]);
    const [activeTab, setActiveTab] = useState('game');
    const [isRankOverlayVisible, setIsRankOverlayVisible] = useState(false);
    const [sultanInfo, setSultanInfo] = useState<{ user: User; gift: GiftMessage } | null>(null);
    const [validationToast, setValidationToast] = useState<{ show: boolean, content: string, type: 'info' | 'error' }>({ show: false, content: '', type: 'info' });
    const [followMeWinner, setFollowMeWinner] = useState<User | null>(null);
    const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
    const [owners] = useState<Set<string>>(new Set(['achmadsyams', 'ahmadsyams.jpg']));
    const [moderators, setModerators] = useState<Set<string>>(new Set([...owners, 'kambing.gimang']));
    const [chatQueue, setChatQueue] = useState<ChatMessage[]>([]);
    const [reminderInfo, setReminderInfo] = useState<{ user: User | null; isOpen: boolean }>({ user: null, isOpen: false });
    const [rankInfo, setRankInfo] = useState<{ user: User; wins: number; rank: number; isOpen: boolean } | null>(null);


    const rankOverlayTimeoutRef = useRef<number | null>(null);
    const sultanTimeoutRef = useRef<number | null>(null);
    const validationTimeoutRef = useRef<number | null>(null);
    const reminderTimeoutRef = useRef<number | null>(null);
    const rankInfoTimeoutRef = useRef<number | null>(null);
    const lastProcessedGiftRef = useRef<GiftMessage | null>(null);
    const lastProcessedSocialRef = useRef<SocialMessage | null>(null);
    const prevConnectionStateRef = useRef<ConnectionState | null>(null);
    
    const addModerator = (username: string) => {
        setModerators(prev => new Set(prev).add(username.toLowerCase()));
    };
    
    const removeModerator = (username: string) => {
        setModerators(prev => {
            const newMods = new Set(prev);
            newMods.delete(username.toLowerCase());
            return newMods;
        });
    };

    useEffect(() => {
        leaderboardService.initialize();
        const data = leaderboardService.getLeaderboard();
        setLeaderboard(data);
    }, []);

    useEffect(() => {
        if (connectionState && connectionState !== prevConnectionStateRef.current) {
            setTopGifters([]);
            prevConnectionStateRef.current = connectionState;
        } else if (!isConnected) {
            setTopGifters([]);
            prevConnectionStateRef.current = null;
        }
    }, [isConnected, connectionState]);

    const showValidationToast = useCallback((content: string, type: 'info' | 'error' = 'error') => {
        if(validationTimeoutRef.current) {
            clearTimeout(validationTimeoutRef.current);
        }
        setValidationToast({ show: true, content, type });
        validationTimeoutRef.current = window.setTimeout(() => {
            setValidationToast({ show: false, content: '', type: 'info' });
        }, 3000);
    }, []);

    const showParticipationReminder = useCallback((user: User) => {
        if (reminderTimeoutRef.current) {
            clearTimeout(reminderTimeoutRef.current);
        }
        setReminderInfo({ user, isOpen: true });
        reminderTimeoutRef.current = window.setTimeout(() => {
            setReminderInfo({ user: null, isOpen: false });
        }, 5000); // Show for 5 seconds
    }, []);

    const updateLeaderboard = useCallback((winner: User) => {
        const updatedLeaderboard = leaderboardService.updateWinnerScore(winner);
        setLeaderboard(updatedLeaderboard);
    }, []);
    
    const handleInstantWin = useCallback((user: User) => {
        setFollowMeWinner(user);
    }, []);

    const handleNewGameStart = useCallback(() => {
        setFollowMeWinner(null);
    }, []);

    const wordle = useWordleGame({
        isConnected,
        moderators,
        updateLeaderboard,
        showValidationToast,
        showParticipationReminder,
        onInstantWin: handleInstantWin,
        onNewGameStart: handleNewGameStart,
    });

    useEffect(() => {
        if (latestChatMessage) {
            setChatQueue(prev => [...prev, latestChatMessage]);
        }
    }, [latestChatMessage]);

    useEffect(() => {
        if (chatQueue.length > 0) {
            const batchSize = Math.min(chatQueue.length, 5);
            const messagesToProcess = chatQueue.slice(0, batchSize);
    
            messagesToProcess.forEach(messageToProcess => {
                const comment = messageToProcess.comment.trim().toLowerCase();
                const isModerator = moderators.has(messageToProcess.uniqueId.toLowerCase());
                
                if (isModerator) {
                    if (comment === '!stop') {
                        wordle.actions.revealWord();
                        return;
                    }
                    if (comment === '!skip') {
                        wordle.actions.skipWord();
                        return;
                    }
                }
                
                if (comment === '!rank') {
                    if (rankOverlayTimeoutRef.current) clearTimeout(rankOverlayTimeoutRef.current);
                    setIsRankOverlayVisible(true);
                    rankOverlayTimeoutRef.current = window.setTimeout(() => setIsRankOverlayVisible(false), 5000);
                } else if (comment === '!win') {
                    const user = messageToProcess;
                    const userIndex = leaderboard.findIndex(entry => entry.user.uniqueId === user.uniqueId);
                    
                    if (userIndex !== -1) {
                        const wins = leaderboard[userIndex].wins;
                        const rank = userIndex + 1;
                        
                        if (rankInfoTimeoutRef.current) clearTimeout(rankInfoTimeoutRef.current);
                        setRankInfo({ user, wins, rank, isOpen: true });
                        rankInfoTimeoutRef.current = window.setTimeout(() => setRankInfo(null), 7000);

                    } else {
                        showValidationToast(`<b>${user.nickname}</b>, kamu belum pernah menang. Ayo tebak kata!`, 'info');
                    }
                } else {
                    wordle.processChatMessage(messageToProcess);
                }
            });
    
            setChatQueue(prev => prev.slice(batchSize));
        }
    }, [chatQueue, wordle, leaderboard, moderators, showValidationToast]);

    useEffect(() => {
        if (latestGiftMessage && latestGiftMessage !== lastProcessedGiftRef.current) {
            wordle.processGiftMessage(latestGiftMessage);
            
            lastProcessedGiftRef.current = latestGiftMessage;

            if (sultanTimeoutRef.current) clearTimeout(sultanTimeoutRef.current);
            setSultanInfo({ user: latestGiftMessage, gift: latestGiftMessage });
            sultanTimeoutRef.current = window.setTimeout(() => setSultanInfo(null), 7000);

            setTopGifters(prevGifters => {
                const userIndex = prevGifters.findIndex(g => g.user.uniqueId === latestGiftMessage.uniqueId);
                const giftDiamonds = (latestGiftMessage.diamondCount || 0) * (latestGiftMessage.repeatCount || 1);
                
                if (giftDiamonds === 0) return prevGifters;

                let newGifters = [...prevGifters];

                if (userIndex > -1) {
                    newGifters[userIndex] = {
                        ...newGifters[userIndex],
                        user: {
                            uniqueId: latestGiftMessage.uniqueId,
                            nickname: latestGiftMessage.nickname,
                            profilePictureUrl: latestGiftMessage.profilePictureUrl,
                        },
                        totalDiamonds: newGifters[userIndex].totalDiamonds + giftDiamonds,
                    };
                } else {
                    newGifters.push({
                        user: {
                            uniqueId: latestGiftMessage.uniqueId,
                            nickname: latestGiftMessage.nickname,
                            profilePictureUrl: latestGiftMessage.profilePictureUrl,
                        },
                        totalDiamonds: giftDiamonds,
                    });
                }
                
                return newGifters.sort((a, b) => b.totalDiamonds - a.totalDiamonds);
            });
        }
    }, [latestGiftMessage, wordle]);


    useEffect(() => {
        if (!isConnected && !isConnecting) {
            connect(TARGET_USERNAME);
        }
    }, [isConnected, isConnecting, connect]);

    useEffect(() => {
        if (latestSocialMessage && latestSocialMessage !== lastProcessedSocialRef.current) {
            wordle.processSocialMessage(latestSocialMessage);
            lastProcessedSocialRef.current = latestSocialMessage;
        }
    }, [latestSocialMessage, wordle]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.shiftKey && event.key === 'A') {
                event.preventDefault();
                setIsAdminPanelOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (rankOverlayTimeoutRef.current) clearTimeout(rankOverlayTimeoutRef.current);
            if (sultanTimeoutRef.current) clearTimeout(sultanTimeoutRef.current);
            if (validationTimeoutRef.current) clearTimeout(validationTimeoutRef.current);
            if (reminderTimeoutRef.current) clearTimeout(reminderTimeoutRef.current);
            if (rankInfoTimeoutRef.current) clearTimeout(rankInfoTimeoutRef.current);
        };
    }, []);

    const tabs = [
        { name: 'game', label: 'Game', icon: <GameIcon /> },
        { name: 'stats', label: 'Statistik', icon: <StatsIcon /> },
        { name: 'leaderboard', label: 'Peringkat', icon: <LeaderboardIcon /> },
        { name: 'top_gifter', label: 'Orang Baik', icon: <DiamondIcon /> },
        { name: 'chat', label: 'Obrolan', icon: <ChatIcon /> },
        { name: 'gift', label: 'Hadiah', icon: <GiftIcon /> },
    ];
    
    if (!isConnected) {
        return (
            <div className="w-full h-screen flex items-center justify-center p-4 bg-gray-900 text-gray-200">
                <div className="w-full max-w-md mx-auto bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6 text-center">
                    <Header />
                    <div className="flex flex-col items-center justify-center gap-4 py-8">
                        <SpinnerIcon className="w-12 h-12 text-cyan-400" />
                        <p className={`text-lg font-medium ${errorMessage ? 'text-red-500' : 'text-white'}`}>
                            {errorMessage ? errorMessage : `Menyambungkan ke LIVE @${TARGET_USERNAME}...`}
                        </p>
                        <p className="text-sm text-gray-400">
                            Harap tunggu sebentar, aplikasi akan mencoba menyambung kembali secara otomatis jika terputus.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen md:min-h-screen flex items-center justify-center p-2 md:p-4">
            <div className="mx-auto bg-gray-800 md:rounded-2xl shadow-lg p-2 md:p-6 flex flex-col w-full h-full md:max-w-6xl md:h-auto md:max-h-[95vh] relative">
                
                <RankOverlay isOpen={isRankOverlayVisible} leaderboard={leaderboard} />
                <SultanOverlay 
                    isOpen={!!sultanInfo} 
                    user={sultanInfo?.user || null} 
                    gift={sultanInfo?.gift || null} 
                />
                 <FollowMeOverlay winner={followMeWinner} />
                 <ParticipationReminderOverlay isOpen={reminderInfo.isOpen} user={reminderInfo.user} />
                 <RankInfoOverlay 
                    isOpen={!!rankInfo?.isOpen}
                    user={rankInfo?.user || null}
                    wins={rankInfo?.wins || 0}
                    rank={rankInfo?.rank || 0}
                 />
                 <AdminPanel 
                    isOpen={isAdminPanelOpen} 
                    onClose={() => setIsAdminPanelOpen(false)}
                    actions={wordle.actions}
                    moderators={moderators}
                    owners={owners}
                    addModerator={addModerator}
                    removeModerator={removeModerator}
                    bannedWords={wordle.gameState.bannedWords}
                 />
                
                <div className="flex-shrink-0 space-y-2">
                    <Header />
                    <div className="hidden md:block">
                        <Stats 
                          isConnected={isConnected} 
                          connectionState={connectionState} 
                          errorMessage={errorMessage}
                          roomUsers={roomUsers}
                          latestLike={latestLikeMessage}
                          totalDiamonds={totalDiamonds}
                        />
                    </div>
                </div>
                
                <div className="hidden md:grid grid-cols-[2fr_3fr] gap-6 mt-6 flex-grow min-h-0">
                    <div className="flex flex-col gap-2">
                        <InfoMarquee />
                        <WordleGame gameState={wordle.gameState} topGifters={topGifters} />
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Leaderboard leaderboard={leaderboard} />
                            <TopGifterBox topGifters={topGifters} />
                        </div>
                        <div className="flex-grow grid grid-cols-2 gap-4 min-h-0">
                            <ChatBox latestMessage={latestChatMessage} />
                            <GiftBox latestGift={latestGiftMessage} />
                        </div>
                    </div>
                </div>

                <div className="md:hidden flex flex-col flex-grow min-h-0 mt-4">
                    {activeTab === 'game' && (
                        <div className="mb-2 flex-shrink-0">
                            <InfoMarquee />
                        </div>
                    )}
                    <div className="flex-grow overflow-y-auto">
                        {activeTab === 'game' && <WordleGame gameState={wordle.gameState} topGifters={topGifters} />}
                        {activeTab === 'stats' && (
                            <div className="space-y-4">
                                <Stats 
                                    isConnected={isConnected} 
                                    connectionState={connectionState} 
                                    errorMessage={errorMessage}
                                    roomUsers={roomUsers}
                                    latestLike={latestLikeMessage}
                                    totalDiamonds={totalDiamonds}
                                />
                            </div>
                        )}
                        {activeTab === 'leaderboard' && <Leaderboard leaderboard={leaderboard} />}
                        {activeTab === 'top_gifter' && <TopGifterBox topGifters={topGifters} />}
                        {activeTab === 'chat' && <ChatBox latestMessage={latestChatMessage} />}
                        {activeTab === 'gift' && <GiftBox latestGift={latestGiftMessage} />}
                    </div>
                    <div className="flex-shrink-0 grid grid-cols-6 gap-1 p-1 bg-gray-900/50 mt-2 rounded-lg">
                        {tabs.map(tab => (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`flex flex-col items-center justify-center p-1.5 text-xs rounded-md transition-colors duration-200 ${
                                    activeTab === tab.name
                                        ? 'bg-cyan-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                <span className="w-5 h-5 mb-0.5">{tab.icon}</span>
                                <span className="truncate">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default App;
