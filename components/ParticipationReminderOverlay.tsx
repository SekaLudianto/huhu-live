import React from 'react';
import { User } from '../types';
import { LockIcon } from './icons/LockIcon';

interface ParticipationReminderOverlayProps {
  isOpen: boolean;
  user: User | null;
}

const ParticipationReminderOverlay: React.FC<ParticipationReminderOverlayProps> = ({ isOpen, user }) => {
  if (!user) {
    return null;
  }

  return (
    <div 
        className={`fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-40 transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}
    >
      <div 
        className="bg-gray-900/70 backdrop-blur-md border border-blue-500/50 shadow-lg rounded-xl p-3 flex items-center space-x-3"
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
      >
        <LockIcon className="w-8 h-8 text-blue-300 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white text-left leading-tight">
            Hai, <b className="text-blue-300 truncate">{user.nickname}</b>!
          </p>
          <p className="text-xs text-gray-300 text-left mt-1">
            Untuk ikut menebak, ayo <b>Follow</b>, kirim <b>Gift</b>, atau ketik '<b>SEMANGAT</b>'
          </p>
        </div>
        <img 
            className="w-12 h-12 rounded-full border-2 border-blue-400 flex-shrink-0"
            src={user.profilePictureUrl} 
            alt={user.nickname} 
        />
      </div>
    </div>
  );
};

export default ParticipationReminderOverlay;