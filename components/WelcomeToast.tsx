import React from 'react';
import { User } from '../types';

interface WelcomeToastProps {
  user: User | null;
}

const WelcomeToast: React.FC<WelcomeToastProps> = ({ user }) => {
  if (!user) {
    return null;
  }

  return (
    <div
      key={user.uniqueId} // Kunci unik untuk memicu ulang animasi pada pengguna baru
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-toast-in-out"
    >
      <div className="bg-gray-900/80 backdrop-blur-md border border-cyan-500/30 shadow-lg rounded-full p-2 flex items-center space-x-3">
        <img
          className="w-10 h-10 rounded-full border-2 border-cyan-400"
          src={user.profilePictureUrl}
          alt={user.nickname}
        />
        <p className="text-sm text-white pr-4">
          Selamat datang, <b className="text-cyan-300">{user.nickname}</b>!
        </p>
      </div>
    </div>
  );
};

export default WelcomeToast;