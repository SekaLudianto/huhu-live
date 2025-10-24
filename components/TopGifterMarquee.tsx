import React from 'react';
import { TopGifterEntry } from '../types';

interface TopGifterMarqueeProps {
  topGifters: TopGifterEntry[];
}

const TopGifterMarquee: React.FC<TopGifterMarqueeProps> = ({ topGifters }) => {
  const topTenGifters = topGifters.slice(0, 10);

  if (topTenGifters.length === 0) {
    return null; // Jangan tampilkan jika tidak ada gifter
  }

  const formatDiamonds = (num: number) => {
    return num.toLocaleString('id-ID');
  };

  const rankEmojis = ['🏆', '🥈', '🥉'];
  
  // Sesuaikan durasi animasi berdasarkan jumlah gifter untuk menjaga kecepatan yang konsisten
  const animationDuration = Math.max(20, topTenGifters.length * 4);

  return (
    <div className="bg-gray-900/50 rounded-lg p-2 overflow-hidden whitespace-nowrap">
      <style>
        {`
        .gifter-marquee-text {
            display: inline-block;
            padding-left: 100%;
            animation: marquee-gifter ${animationDuration}s linear infinite;
        }
        @keyframes marquee-gifter {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-100%); }
        }
        `}
      </style>
      <div className="gifter-marquee-text text-sm text-yellow-300 flex items-center">
        <span className="font-bold mr-4 flex-shrink-0">✨ TOP ORANG BAIK:</span>
        {topTenGifters.map((gifter, index) => (
          <React.Fragment key={gifter.user.uniqueId}>
            <span className="mx-4 flex items-center gap-2">
              <span className="font-bold">{rankEmojis[index] || `#${index + 1}`}</span>
              <img src={gifter.user.profilePictureUrl} alt={gifter.user.nickname} className="w-4 h-4 rounded-full" />
              <span className="text-white font-medium">{gifter.user.nickname}</span>
              <span className="font-semibold text-white bg-yellow-600/50 px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
                {formatDiamonds(gifter.totalDiamonds)}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-yellow-300">
                    <path d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l1.83 4.401 4.753.39c.845.07 1.178 1.06.557 1.658l-3.448 3.36.815 4.732c.15.868-.726 1.536-1.48.995L10 15.122l-4.224 2.22c-.754.542-1.63-.127-1.48-.995l.815-4.732-3.448-3.36c-.621-.598-.288-1.588.557-1.658l4.753-.39 1.83-4.401z" />
                </svg>
              </span>
            </span>
            {index < topTenGifters.length - 1 && <span className="text-gray-500">|</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default TopGifterMarquee;