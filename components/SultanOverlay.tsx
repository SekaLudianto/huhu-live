import React from 'react';
import { User, GiftMessage } from '../types';
import { HeartIcon } from './icons/HeartIcon';

interface SultanOverlayProps {
  isOpen: boolean;
  user: User | null;
  gift: GiftMessage | null;
}

const SultanOverlay: React.FC<SultanOverlayProps> = ({ isOpen, user, gift }) => {
  if (!user || !gift) {
    return null;
  }

  return (
    <div 
        className={`fixed inset-0 flex items-center justify-center p-4 z-50 transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div 
        className={`bg-gray-900/80 backdrop-blur-md border-2 border-pink-500/50 shadow-2xl rounded-2xl w-full max-w-sm transition-all duration-500 ease-in-out ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} p-6 flex flex-col items-center`}
        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
      >
        <div className="relative mb-3">
            <HeartIcon className="w-12 h-12 text-pink-400 absolute -top-8 left-1/2 -translate-x-1/2" />
            <img 
                className="w-24 h-24 rounded-full border-4 border-pink-400 shadow-lg"
                src={user.profilePictureUrl} 
                alt={user.nickname} 
            />
        </div>
        <p className="text-lg text-white text-center">
            Makasih <b className="text-pink-300 text-xl">{user.nickname}</b>!
        </p>
        <p className="text-sm text-gray-300 text-center mt-2">Telah mengirim:</p>
        
        <img 
            className="w-20 h-20 my-2"
            src={gift.giftPictureUrl} 
            alt={gift.giftName} 
        />
        
        <p className="text-md font-semibold text-white text-center">{gift.giftName}</p>
        
        <p className="text-sm text-gray-300 mt-3 italic">
            Semoga lancar rezekinya! 🙏
        </p>
      </div>
    </div>
  );
};

export default SultanOverlay;