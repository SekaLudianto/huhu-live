import React from 'react';
import { LeaderboardEntry } from '../types';

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
}

const titles = ['🏆 Master Kata', '🥈 Raja Tebak', '🥉 Jenius Aksara'];
const trophy_colors = ['text-yellow-400', 'text-gray-300', 'text-yellow-600'];

const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboard }) => {
  return (
    <div className="bg-gray-700/50 md:rounded-lg p-2 md:p-4 flex flex-col h-full md:h-auto md:max-h-96">
      <h3 className="text-md md:text-lg font-bold text-center text-white mb-2 flex-shrink-0">Papan Peringkat Teratas</h3>
      <div className="flex-grow overflow-y-auto space-y-2 pr-2">
        {leaderboard.length > 0 ? (
          leaderboard.slice(0, 100).map((entry, index) => (
            <div key={entry.user.uniqueId} className="bg-gray-800/50 p-2 rounded-lg flex items-center text-sm">
              <span className={`text-2xl font-bold w-8 text-center ${trophy_colors[index] || 'text-gray-300'}`}>{index + 1}</span>
              <img className="w-10 h-10 rounded-full mx-3" src={entry.user.profilePictureUrl} alt={entry.user.nickname} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white truncate">{entry.user.nickname}</div>
                {index < 3 && <div className="text-xs text-cyan-400">{titles[index]}</div>}
              </div>
              <div className="text-right pl-2">
                <div className="font-bold text-lg text-white">{entry.wins}</div>
                <div className="text-xs text-gray-400">Menang</div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-center text-gray-400">
            Belum ada pemenang. Jadilah yang pertama!
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;