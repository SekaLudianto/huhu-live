import React from 'react';
import { User } from '../types';
import { TrophyIcon, RankIcon } from './icons/InfoIcons';

interface RankInfoOverlayProps {
  isOpen: boolean;
  user: User | null;
  wins: number;
  rank: number;
}

const RankInfoOverlay: React.FC<RankInfoOverlayProps> = ({ isOpen, user, wins, rank }) => {
  if (!isOpen || !user) {
    return null;
  }

  return (
    <div 
        className={`fixed inset-0 flex items-center justify-center p-4 z-40 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div 
        className={`bg-gray-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-xl shadow-2xl w-full max-w-xs transition-all duration-300 ease-in-out ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <div className="p-5 flex flex-col items-center">
            <img className="w-20 h-20 rounded-full border-4 border-cyan-400 shadow-lg" src={user.profilePictureUrl} alt={user.nickname} />
            <p className="mt-3 text-xl font-bold text-white truncate max-w-full">{user.nickname}</p>
            <div className="mt-4 w-full flex justify-around">
                <div className="text-center">
                    <TrophyIcon className="w-8 h-8 mx-auto text-yellow-400" />
                    <p className="text-2xl font-bold text-white mt-1">{wins}</p>
                    <p className="text-xs text-gray-400">Menang</p>
                </div>
                <div className="text-center">
                    <RankIcon className="w-8 h-8 mx-auto text-cyan-400" />
                    <p className="text-2xl font-bold text-white mt-1">#{rank}</p>
                    <p className="text-xs text-gray-400">Peringkat</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RankInfoOverlay;