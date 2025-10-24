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
import { User, LeaderboardEntry, ChatMessage, GiftMessage, SocialMessage, ConnectionState, TopGifterEntry } from './types';
import { GameIcon, ChatIcon, GiftIcon, LeaderboardIcon, DiamondIcon } from './components/icons/TabIcons';
import { SpinnerIcon } from './components/icons/SpinnerIcon';
import { leaderboardService } from './services/firebaseService';

const TARGET_USERNAME = 'achmadsyams';

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
    const [moderators, setModerators] = useState<Set<string>>(new Set(['ahmadsyams.jpg'])); // Host is always a mod
    const [chatQueue, setChatQueue] = useState<ChatMessage[]>([]);
    const [participants, setParticipants] = useState(new Set<string>());
    const [reminderInfo, setReminderInfo] = useState<{ user: User | null; isOpen: boolean }>({ user: null, isOpen: false });


    const rankOverlayTimeoutRef = useRef<number | null>(null);
    const sultanTimeoutRef = useRef<number | null>(null);
    const validationTimeoutRef = useRef<number | null>(null);
    const reminderTimeoutRef = useRef<number | null>(null);
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
            setParticipants(new Set<string>());
            prevConnectionStateRef.current = connectionState;
        } else if (!isConnected) {
            setTopGifters([]);
            setParticipants(new Set<string>());
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

    const addParticipant = useCallback((user: User, reason: 'follow' | 'gift' | 'comment') => {
        setParticipants(prev => {
            if (prev.has(user.uniqueId)) {
                return prev; // No change needed, prevent re-render
            }

            let toastContent = '';
            if (reason === 'follow') {
                toastContent = `<b>${user.nickname}</b>, terima kasih sudah follow! Kamu sekarang bisa menebak.`;
            } else if (reason === 'gift') {
                toastContent = `<b>${user.nickname}</b>, makasih giftnya! Kamu sekarang bisa menebak.`;
            } else if (reason === 'comment') {
                toastContent = `Makasih <b>${user.nickname}</b> atas semangatnya! Kamu sekarang bisa ikut menebak.`;
            }
            showValidationToast(toastContent, 'info');
            
            const newSet = new Set(prev);
            newSet.add(user.uniqueId);
            return newSet;
        });
    }, [showValidationToast]);

    const wordle = useWordleGame({
        isConnected,
        participants,
        updateLeaderboard,
        showValidationToast,
        showParticipationReminder,
        onInstantWin: handleInstantWin,
        onNewGameStart: handleNewGameStart,
        addParticipant,
    });

    useEffect(() => {
        if (latestChatMessage) {
            setChatQueue(prev => [...prev, latestChatMessage]);
        }
    }, [latestChatMessage]);

    useEffect(() => {
        if (chatQueue.length > 0) {
            const messageToProcess = chatQueue[0];
            
            const comment = messageToProcess.comment.trim().toLowerCase();
            const isModerator = moderators.has(messageToProcess.uniqueId.toLowerCase());
            
            // Moderator Commands
            if (isModerator) {
                if (comment === '!stop') {
                    wordle.actions.revealWord();
                    setChatQueue(prev => prev.slice(1));
                    return;
                }
                if (comment === '!skip') {
                    wordle.actions.skipWord();
                    setChatQueue(prev => prev.slice(1));
                    return;
                }
            }
            
            // General Commands
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
                    showValidationToast(`<b>${user.nickname}</b>, kamu telah menang ${wins} kali dan berada di peringkat #${rank}.`, 'info');
                } else {
                    showValidationToast(`<b>${user.nickname}</b>, kamu belum pernah menang. Ayo tebak kata!`, 'info');
                }
            } else {
                // Process as guess or participant entry
                wordle.processChatMessage(messageToProcess);
            }

            setChatQueue(prev => prev.slice(1));
        }
    }, [chatQueue, wordle, leaderboard, moderators, showValidationToast]);

    useEffect(() => {
        if (latestGiftMessage) {
            wordle.processGiftMessage(latestGiftMessage);
            
            if (latestGiftMessage !== lastProcessedGiftRef.current) {
                 addParticipant(latestGiftMessage, 'gift');
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
        }
    }, [latestGiftMessage, addParticipant, wordle.processGiftMessage]);


    useEffect(() => {
        if (!isConnected && !isConnecting) {
            connect(TARGET_USERNAME);
        }
    }, [isConnected, isConnecting, connect]);

    useEffect(() => {
        if (latestSocialMessage && latestSocialMessage !== lastProcessedSocialRef.current) {
            if (latestSocialMessage.displayType.includes('follow')) {
                addParticipant(latestSocialMessage, 'follow');
            }
            lastProcessedSocialRef.current = latestSocialMessage;
        }
    }, [latestSocialMessage, addParticipant]);

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
        };
    }, []);

    const mobileTabs = [
        { name: 'game', label: 'Game', icon: <GameIcon /> },
        { name: 'chat', label: 'Obrolan', icon: <ChatIcon /> },
        { name: 'gift', label: 'Hadiah', icon: <GiftIcon /> },
        { name: 'leaderboard', label: 'Peringkat', icon: <LeaderboardIcon /> },
        { name: 'top_gifter', label: 'Orang Baik', icon: <DiamondIcon /> },
    ];
    
    if (!isConnected) {
        return (
            <div className="w-full h-screen flex items-center justify-center p-4 bg-gray-900 text-gray-200">
                <div className="w-full max-w-md mx-auto bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6 text-center">
                    <Header onAdminClick={() => setIsAdminPanelOpen(true)} />
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

    const renderMobileContent = () => {
        switch (activeTab) {
            case 'game':
                return <WordleGame gameState={wordle.gameState} />;
            case 'chat':
                return <ChatBox latestMessage={latestChatMessage} />;
            case 'gift':
                return <GiftBox latestGift={latestGiftMessage} />;
            case 'leaderboard':
                return <Leaderboard leaderboard={leaderboard} />;
            case 'top_gifter':
                return <TopGifterBox topGifters={topGifters} />;
            default:
                return null;
        }
    };

    return (
        <div className="w-full h-screen md:min-h-screen flex items-center justify-center p-0 md:p-4 bg-gray-800">
            <div className="mx-auto bg-gray-800 md:rounded-2xl shadow-lg md:p-6 flex flex-col w-full h-full md:max-w-6xl md:h-auto md:max-h-[95vh] relative">
                
                <div 
                    className={`fixed top-36 md:top-24 left-1/2 -translate-x-1/2 w-full max-w-sm sm:max-w-md px-4 z-50 transition-all duration-500 ease-in-out ${
                        validationToast.show 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 -translate-y-full pointer-events-none'
                    }`}
                >
                    <div 
                        className={`backdrop-blur-md border shadow-lg rounded-xl p-3 text-center text-sm ${validationToast.type === 'info' ? 'bg-cyan-600/80 border-cyan-500 text-white' : 'bg-red-600/80 border-red-500 text-white'}`}
                        dangerouslySetInnerHTML={{ __html: validationToast.content }}
                    />
                </div>

                <RankOverlay isOpen={isRankOverlayVisible} leaderboard={leaderboard} />
                <SultanOverlay 
                    isOpen={!!sultanInfo} 
                    user={sultanInfo?.user || null} 
                    gift={sultanInfo?.gift || null} 
                />
                 <FollowMeOverlay winner={followMeWinner} />
                 <ParticipationReminderOverlay isOpen={reminderInfo.isOpen} user={reminderInfo.user} />
                 <AdminPanel 
                    isOpen={isAdminPanelOpen} 
                    onClose={() => setIsAdminPanelOpen(false)}
                    actions={wordle.actions}
                    moderators={moderators}
                    addModerator={addModerator}
                    removeModerator={removeModerator}
                    bannedWords={wordle.gameState.bannedWords}
                 />
                
                {/* DESKTOP VIEW */}
                <div className="hidden md:flex flex-col h-full">
                    <div className="flex-shrink-0 space-y-4">
                        <Header onAdminClick={() => setIsAdminPanelOpen(true)} />
                        <Stats 
                          isConnected={isConnected} 
                          connectionState={connectionState} 
                          errorMessage={errorMessage}
                          roomUsers={roomUsers}
                          latestLike={latestLikeMessage}
                          totalDiamonds={totalDiamonds}
                        />
                    </div>
                    <div className="grid grid-cols-[2fr_3fr] gap-6 mt-6 flex-grow min-h-0">
                        <div className="flex flex-col gap-2">
                            <InfoMarquee />
                            <WordleGame gameState={wordle.gameState} />
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
                </div>

                {/* MOBILE VIEW */}
                <div className="md:hidden flex flex-col h-full overflow-hidden bg-gray-800">
                    <div className="flex-shrink-0 p-2 space-y-2">
                        <Header onAdminClick={() => setIsAdminPanelOpen(true)} />
                        <Stats 
                            isConnected={isConnected} 
                            connectionState={connectionState} 
                            errorMessage={errorMessage}
                            roomUsers={roomUsers}
                            latestLike={latestLikeMessage}
                            totalDiamonds={totalDiamonds}
                        />
                         {activeTab === 'game' && <InfoMarquee />}
                    </div>
                    
                    <main className="flex-grow min-h-0">
                        {renderMobileContent()}
                    </main>

                    <footer className="flex-shrink-0 grid grid-cols-5 gap-1 p-1 border-t border-gray-700 bg-gray-900/80 backdrop-blur-sm">
                         {mobileTabs.map(tab => (
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
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default App;