import React from 'react';
import { User } from '../types';
import { TrophyIcon, RankIcon } from './icons/InfoIcons';

interface MyRankToastProps {
  user: User;
  wins: number;
  rank: number;
}

const MyRankToast: React.FC<MyRankToastProps> = ({ user, wins, rank }) => {
  return (
    <div
      key={user.uniqueId + Date.now()} // Kunci unik untuk memicu ulang animasi
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-toast-in-out"
    >
      <div className="bg-gray-900/80 backdrop-blur-md border border-cyan-500/30 shadow-lg rounded-xl p-3 flex items-center space-x-4 min-w-[300px]">
        <img
          className="w-12 h-12 rounded-full border-2 border-cyan-400"
          src={user.profilePictureUrl}
          alt={user.nickname}
        />
        <div className="flex-1">
            <p className="text-md font-bold text-white truncate">{user.nickname}</p>
            <div className="mt-1 flex justify-start items-center space-x-4">
                <div className="flex items-center gap-1.5" title="Total Menang">
                    <TrophyIcon className="w-5 h-5 text-yellow-400" />
                    <p className="text-lg font-bold text-white">{wins}</p>
                </div>
                <div className="flex items-center gap-1.5" title="Peringkat Saat Ini">
                    <RankIcon className="w-5 h-5 text-cyan-400" />
                    <p className="text-lg font-bold text-white">#{rank}</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MyRankToast;
