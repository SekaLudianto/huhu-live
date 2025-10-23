import React from 'react';

const InfoMarquee: React.FC = () => {
    return (
        <div className="bg-gray-200 dark:bg-gray-900/50 rounded-lg p-2 overflow-hidden whitespace-nowrap">
            <style>
                {`
                .marquee-text {
                    display: inline-block;
                    padding-left: 100%;
                    animation: marquee 22s linear infinite;
                }
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-100%); }
                }
                `}
            </style>
            <div className="marquee-text text-sm text-cyan-700 dark:text-cyan-300">
                <span className="mx-4">❤️ Jangan lupa <b>Follow</b> untuk ikutan main!</span>
                <span className="mx-4">|</span>
                <span className="mx-4">👆 <b>Tap-tap layar</b> biar makin semangat!</span>
                <span className="mx-4">|</span>
                <span className="mx-4">🔗 <b>Share & Repost</b> LIVE ini ke teman-temanmu!</span>
                <span className="mx-4">|</span>
                <span className="mx-4">🎁 Kirim <b>Gift</b> untuk support (jika berkenan, tidak maksa 😊)</span>
            </div>
        </div>
    );
};

export default InfoMarquee;