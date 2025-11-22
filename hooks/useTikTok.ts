import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, ConnectionState, GiftMessage, LikeMessage, RoomUserMessage, SocialMessage } from '../types';

const BACKEND_URL = "https://tiktok-chat-reader.zerody.one";

export const useTikTok = () => {
  const socket = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const [latestChatMessage, setLatestChatMessage] = useState<ChatMessage | null>(null);
  const [latestGiftMessage, setLatestGiftMessage] = useState<GiftMessage | null>(null);
  const [latestLikeMessage, setLatestLikeMessage] = useState<LikeMessage | null>(null);
  const [latestSocialMessage, setLatestSocialMessage] = useState<SocialMessage | null>(null);
  const [roomUsers, setRoomUsers] = useState<RoomUserMessage | null>(null);
  const [followers, setFollowers] = useState<Set<string>>(new Set());
  const [totalDiamonds, setTotalDiamonds] = useState<number>(0);
  
  const lastUniqueIdRef = useRef<string>('');
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptRef = useRef(0);
  
  const MAX_RECONNECT_ATTEMPTS = 10;
  const INITIAL_RECONNECT_DELAY = 2000;
  const MAX_RECONNECT_DELAY = 60000;

  const clearReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    socket.current = io(BACKEND_URL);

    socket.current.on('connect', () => {
      console.log('Socket connected!');
    });
    
    socket.current.on('disconnect', () => {
        console.warn('Socket disconnected!');
        setIsConnected(false);
        setConnectionState(null);
        setIsConnecting(false);
        clearReconnect();
    });
    
    socket.current.on('streamEnd', () => {
        setIsConnected(false);
        setConnectionState(null);
        setErrorMessage('Stream ended.');
        setIsConnecting(false);
        clearReconnect();
    });

    socket.current.on('tiktokConnected', (state: any) => {
      if (state && typeof state === 'object' && state.roomId) {
          console.log('TikTok Connected:', state);
          clearReconnect();
          reconnectAttemptRef.current = 0;
          setConnectionState(state as ConnectionState);
          setIsConnected(true);
          setErrorMessage(null);
          setIsConnecting(false);
          setTotalDiamonds(0);
          setFollowers(new Set());
      } else {
           console.error('Received invalid tiktokConnected event data:', state);
      }
    });

    socket.current.on('tiktokDisconnected', (reason: any) => {
        console.warn('TikTok Disconnected:', reason);
        setIsConnected(false);
        setConnectionState(null);
        clearReconnect();
    
        const reasonString = typeof reason === 'string' ? reason : 'Koneksi terputus.';
    
        // Stop retrying on fatal errors
        if (typeof reason === 'string' && (reason.toLowerCase().includes('stream ended') || reason.toLowerCase().includes('host not found'))) {
            setErrorMessage(reasonString);
            setIsConnecting(false);
            lastUniqueIdRef.current = '';
            reconnectAttemptRef.current = 0;
            return;
        }
    
        if (lastUniqueIdRef.current) {
            const attempt = reconnectAttemptRef.current;
    
            if (attempt >= MAX_RECONNECT_ATTEMPTS) {
                setErrorMessage(`Gagal menyambung kembali setelah ${attempt} percobaan. Silakan muat ulang halaman.`);
                setIsConnecting(false);
                lastUniqueIdRef.current = '';
                reconnectAttemptRef.current = 0;
                return;
            }
    
            const delay = Math.min(INITIAL_RECONNECT_DELAY * Math.pow(2, attempt), MAX_RECONNECT_DELAY);
            
            setErrorMessage(`${reasonString} Mencoba lagi dalam ${Math.round(delay / 1000)} detik...`);
            setIsConnecting(true);
    
            reconnectTimeoutRef.current = window.setTimeout(() => {
                if (socket.current && lastUniqueIdRef.current) {
                    console.log(`Mencoba koneksi ulang ke ${lastUniqueIdRef.current} (percobaan ${attempt + 1})...`);
                    socket.current.emit('setUniqueId', lastUniqueIdRef.current, { enableExtendedGiftInfo: true });
                }
            }, delay);
    
            reconnectAttemptRef.current += 1;
        } else {
            setErrorMessage(reasonString);
            setIsConnecting(false);
        }
    });

    socket.current.on('chat', (msg: any) => {
        if (msg && typeof msg === 'object' && msg.uniqueId && typeof msg.comment === 'string') {
            setLatestChatMessage(msg as ChatMessage);
        } else {
            console.warn('Received invalid chat message:', msg);
        }
    });

    socket.current.on('gift', (msg: any) => {
        if (msg && typeof msg === 'object' && typeof msg.giftId !== 'undefined') {
            if (msg.giftType === 1 && !msg.repeatEnd) {
                // Streak gift, wait for it to end. We still update the state for UI feedback.
            } else {
                const diamonds = (msg.diamondCount || 0) * (msg.repeatCount || 1);
                if (diamonds > 0) {
                    setTotalDiamonds(prev => prev + diamonds);
                }
            }
            setLatestGiftMessage(msg as GiftMessage);
        } else {
            console.warn('Received invalid gift message:', msg);
        }
    });

    socket.current.on('like', (msg: any) => {
        if (msg && typeof msg === 'object' && typeof msg.totalLikeCount !== 'undefined') {
            setLatestLikeMessage(msg as LikeMessage);
        } else {
            console.warn('Received invalid like message:', msg);
        }
    });

    socket.current.on('social', (msg: any) => {
        if (msg && typeof msg === 'object' && typeof msg.displayType === 'string') {
            setLatestSocialMessage(msg as SocialMessage);
            if (msg.displayType.includes('follow') && msg.uniqueId) {
                setFollowers(prev => new Set(prev).add(msg.uniqueId));
            }
        } else {
            console.warn('Received invalid social message:', msg);
        }
    });
    
    socket.current.on('roomUser', (msg: any) => {
        if (msg && typeof msg === 'object' && typeof msg.viewerCount !== 'undefined') {
            setRoomUsers(msg as RoomUserMessage);
        } else {
            console.warn('Received invalid roomUser message:', msg);
        }
    });

    return () => {
      clearReconnect();
      socket.current?.disconnect();
    };
  }, [clearReconnect]);
  
  const connect = useCallback((uniqueId: string) => {
    if (socket.current && uniqueId) {
      clearReconnect();
      reconnectAttemptRef.current = 0;
      lastUniqueIdRef.current = uniqueId;
      setIsConnecting(true);
      setErrorMessage(null);
      socket.current.emit('setUniqueId', uniqueId, { enableExtendedGiftInfo: true });
    }
  }, [clearReconnect]);

  return {
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
    followers,
    totalDiamonds,
  };
};
