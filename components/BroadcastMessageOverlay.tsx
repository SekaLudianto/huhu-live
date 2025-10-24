import React from 'react';
import { User } from '../types';
import { BroadcastIcon } from './icons/BroadcastIcon';

interface BroadcastMessageOverlayProps {
  isOpen: boolean;
  user: User | null;
  message: string | null;
}

const BroadcastMessageOverlay: React.FC<BroadcastMessageOverlayProps> = ({ isOpen, user, message }) => {
  if (!isOpen || !user || !message) {
    return null;
  }

  return (
    <div 
        className={`fixed inset-0 flex items-center justify-center p-4 z-40 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div 
        className={`bg-gray-900/80 backdrop-blur-md border border-yellow-500/50 shadow-lg rounded-xl p-4 flex items-start space-x-4 w-full max-w-lg transition-all duration-300 ease-out ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
      >
        <div className="flex-shrink-0 pt-1">
            <BroadcastIcon className="w-8 h-8 text-yellow-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <img 
              className="w-8 h-8 rounded-full border-2 border-yellow-400"
              src={user.profilePictureUrl} 
              alt={user.nickname} 
            />
            <p className="text-sm font-bold text-yellow-300 truncate">
              Pesan dari {user.nickname}
            </p>
          </div>
          <p className="text-md text-white text-left break-words">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BroadcastMessageOverlay;