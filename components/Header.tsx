import React from 'react';
import { AdminIcon } from './icons/AdminIcon';

interface HeaderProps {
    onAdminClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAdminClick }) => {
    return (
        <header className="relative text-center border-b border-gray-700 pb-2">
            <h1 className="text-xl md:text-3xl font-bold text-white">KATLA LIVE 🇮🇩</h1>
            <p className="text-sm text-gray-400 mt-1">
                Game Tebak Kata dari TikTok LIVE!
            </p>
            {onAdminClick && (
                 <button 
                    onClick={onAdminClick} 
                    className="absolute top-1/2 right-0 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                    aria-label="Buka Panel Admin"
                >
                    <AdminIcon className="w-6 h-6" />
                </button>
            )}
        </header>
    );
};

export default Header;