import React from 'react';
import { AdminIcon } from './icons/AdminIcon';

interface HeaderProps {
    onAdminClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAdminClick }) => {
    return (
        <div className="relative">
            <header className="text-center border-b border-gray-300 dark:border-gray-700 pb-2">
                <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">KATLA LIVE 🇮🇩</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Game Tebak Kata dari TikTok LIVE!
                </p>
            </header>
            <button
                onClick={onAdminClick}
                title="Buka Panel Admin"
                className="absolute top-1/2 right-0 -translate-y-1/2 p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/50 transition-colors"
                aria-label="Buka Panel Admin"
            >
                <AdminIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default Header;