import React from 'react';
import { TopGifterEntry } from '../types';
import { HeartIcon } from './icons/HeartIcon';

interface TopGifterBoxProps {
  topGifters: TopGifterEntry[];
}

const titles = ['💖 Dermawan Utama', '⭐ Pahlawan Kebaikan', '👍 Teladan Kebaikan'];
const titleColors = ['text-pink-400', 'text-cyan-400', 'text-green-400'];

const TopGifterBox: React.FC<TopGifterBoxProps> = ({ topGifters }) => {
  const formatDiamonds = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}Jt`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}Rb`;
    return num.toLocaleString('id-ID');
  };

  return (
    <div className="bg-gray-700/50 p-2 flex flex-col h-full">
      <h3 className="text-lg font-bold text-center text-white mb-2 flex-shrink-0 flex items-center justify-center gap-2">
        <HeartIcon className="w-6 h-6 text-pink-400"/>
        Peringkat Orang Baik
      </h3>
      <div className="flex-grow overflow-y-auto space-y-2 pr-2">
        {topGifters.length > 0 ? (
          topGifters.slice(0, 100).map((entry, index) => (
            <div key={entry.user.uniqueId} className="bg-gray-800/50 p-2 rounded-lg flex items-center text-sm">
              <span className={`text-2xl font-bold w-8 text-center ${titleColors[index] || 'text-gray-300'}`}>{index + 1}</span>
              <img className="w-10 h-10 rounded-full mx-3 border-2 border-gray-600" src={entry.user.profilePictureUrl} alt={entry.user.nickname} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white truncate">{entry.user.nickname}</div>
                {index < 3 && <div className={`text-xs font-semibold ${titleColors[index]}`}>{titles[index]}</div>}
              </div>
              <div className="text-right pl-2 flex items-center gap-1">
                <span className="font-bold text-lg text-yellow-400">{formatDiamonds(entry.totalDiamonds)}</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-400">
                    <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" />
                </svg>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-center text-gray-400">
            Belum ada Orang Baik yang muncul.
          </div>
        )}
      </div>
    </div>
  );
};

export default TopGifterBox;