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
    <div className="bg-gray-700/50 rounded-lg p-4 flex flex-col h-full md:h-auto md:max-h-96">
      <h3 className="text-lg font-bold text-center text-white mb-3 flex-shrink-0 flex items-center justify-center gap-2">
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
                <HeartIcon className="w-4 h-4 text-pink-400 animate-pulse-heart" />
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-400">
            Belum ada Orang Baik yang muncul.
          </div>
        )}
      </div>
    </div>
  );
};

export default TopGifterBox;