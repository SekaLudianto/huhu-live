import React, { useState, useEffect } from 'react';
import { ConnectionState, LikeMessage, RoomUserMessage } from '../types';

interface StatsProps {
    isConnected: boolean;
    connectionState: ConnectionState | null;
    errorMessage: string | null;
    roomUsers: RoomUserMessage | null;
    latestLike: LikeMessage | null;
    totalDiamonds: number;
}

const Stats: React.FC<StatsProps> = ({ isConnected, connectionState, errorMessage, roomUsers, latestLike, totalDiamonds }) => {
    
    const [viewerCount, setViewerCount] = useState(0);
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {
        if(roomUsers?.viewerCount){
            setViewerCount(roomUsers.viewerCount);
        }
    }, [roomUsers]);

    useEffect(() => {
        if(latestLike?.totalLikeCount) {
            setLikeCount(latestLike.totalLikeCount);
        }
    }, [latestLike]);

    useEffect(() => {
        if (!isConnected) {
            setViewerCount(0);
            setLikeCount(0);
        }
    }, [isConnected]);

    const formatNumber = (num: number) => new Intl.NumberFormat('id-ID').format(num);

    return (
        <div className="bg-gray-200/50 dark:bg-gray-700/50 rounded-lg p-2 flex justify-between items-center text-xs md:text-sm text-gray-600 dark:text-gray-300">
            <div className="flex-shrink-0">
                {isConnected && connectionState ? (
                    <span className="flex items-center gap-1.5 font-medium text-green-600 dark:text-green-400">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Terhubung
                    </span>
                ) : errorMessage ? (
                    <span className="flex items-center gap-1.5 font-medium text-yellow-500 dark:text-yellow-400">
                         <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                        {errorMessage.split('.')[0]}
                    </span>
                ) : (
                    <span className="flex items-center gap-1.5 font-medium text-gray-500 dark:text-gray-400">
                         <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                        Menyambung...
                    </span>
                )}
            </div>

            <div className="flex items-center gap-3 md:gap-5 whitespace-nowrap">
                <span>Penonton: <b className="font-semibold text-gray-900 dark:text-white">{formatNumber(viewerCount)}</b></span>
                <span>Suka: <b className="font-semibold text-gray-900 dark:text-white">{formatNumber(likeCount)}</b></span>
                <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-yellow-400">
                      <path d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l1.83 4.401 4.753.39c.845.07 1.178 1.06.557 1.658l-3.448 3.36.815 4.732c.15.868-.726 1.536-1.48.995L10 15.122l-4.224 2.22c-.754.542-1.63-.127-1.48-.995l.815-4.732-3.448-3.36c-.621-.598-.288-1.588.557-1.658l4.753-.39 1.83-4.401z" />
                    </svg>
                    <b className="font-semibold text-gray-900 dark:text-white">{formatNumber(totalDiamonds)}</b>
                </span>
            </div>
        </div>
    );
};

export default Stats;