import React from 'react';
import { TopGifterEntry } from '../types';
import { HeartIcon } from './icons/HeartIcon';

interface TopGifterMarqueeProps {
  topGifters: TopGifterEntry[];
}

const TopGifterMarquee: React.FC<TopGifterMarqueeProps> = ({ topGifters }) => {
    if (topGifters.length === 0) {
        return null;
    }
  
    return (
        <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm overflow-hidden whitespace-nowrap z-10">
            <style>
                {`
                @keyframes marquee-gifters {
                    0% { transform: translateX(50%); }
                    100% { transform: translateX(-100%); }
                }
                .marquee-gifters-text {
                    display: inline-block;
                    padding-left: 100%;
                    animation: marquee-gifters 40s linear infinite;
                }
                `}
            </style>
            <div className="flex items-center">
                 <div className="text-pink-400 font-bold text-lg px-3 py-1.5 flex-shrink-0">
                    💖
                </div>
                <div className="marquee-gifters-text text-sm text-gray-200 py-1.5">
                    {topGifters.slice(0, 15).map((entry, index) => (
                        <React.Fragment key={entry.user.uniqueId}>
                             {index > 0 && <span className="mx-4 text-gray-500">•</span>}
                            <span className="inline-flex items-center gap-1">
                                <b className="text-pink-300">{entry.user.nickname}</b>
                                <span className="text-yellow-400 font-semibold">{entry.totalDiamonds.toLocaleString('id-ID')}</span>
                                <HeartIcon className="w-4 h-4 text-pink-400 animate-pulse-heart" />
                            </span>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TopGifterMarquee;