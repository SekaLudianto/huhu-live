import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="text-center border-b border-gray-300 dark:border-gray-700 pb-2">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">KATLA LIVE 🇮🇩</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Game Tebak Kata dari TikTok LIVE!
            </p>
        </header>
    );
};

export default Header;