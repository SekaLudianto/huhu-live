import React from 'react';
import Tile from './Tile';
import { GuessData, TileStatus, LeaderboardEntry, TopGifterEntry } from '../types';
import { TrophyIcon, DiamondBadgeIcon } from './icons/BadgeIcons';

interface WordleGridProps {
  bestGuess: GuessData | null;
  recentGuesses: GuessData[];
  wordLength: number;
  leaderboard: LeaderboardEntry[];
  topGifters: TopGifterEntry[];
}

const trophyColors = ['text-yellow-400', 'text-gray-300', 'text-yellow-600'];
const diamondColors = ['text-pink-400', 'text-cyan-400', 'text-green-400'];

const WordleGrid: React.FC<WordleGridProps> = ({ bestGuess, recentGuesses, wordLength, leaderboard, topGifters }) => {

  const renderGuessRow = (guessData: GuessData, key: string | number, isNew?: boolean) => {
    const leaderboardRank = leaderboard.slice(0, 3).findIndex(entry => entry.user.uniqueId === guessData.user.uniqueId);
    const gifterRank = topGifters.slice(0, 3).findIndex(entry => entry.user.uniqueId === guessData.user.uniqueId);

    return (
    <div key={key} className={`guess-row ${isNew ? 'animate-slide-in-down' : ''}`}>
        <div className="flex items-center gap-1 mb-0.5">
            <img
                className="w-5 h-5 rounded-full bg-gray-700 object-cover"
                src={guessData.user.profilePictureUrl}
                alt={guessData.user.nickname}
            />
            <span className="text-xs text-gray-300 font-medium break-words">
                {guessData.user.nickname}
            </span>
            {leaderboardRank !== -1 && (
                <TrophyIcon 
                    className={`w-4 h-4 ml-1 ${trophyColors[leaderboardRank]}`}
                    title={`Peringkat #${leaderboardRank + 1}`}
                />
            )}
            {gifterRank !== -1 && (
                <DiamondBadgeIcon
                    className={`w-4 h-4 ml-1 ${diamondColors[gifterRank]}`}
                    title={`Top Gifter #${gifterRank + 1}`}
                />
            )}
        </div>
        <div
            className="wordle-grid-row grid gap-0.5"
            style={{ gridTemplateColumns: `repeat(${wordLength}, 1fr)` }}
        >
            {Array.from({ length: wordLength }).map((_, j) => {
                const letter = guessData.guess.charAt(j) || '';
                const status = guessData.statuses[j] || 'empty';
                const animationDelay = `${j * 100}ms`;
                return <Tile key={`${key}-${j}`} letter={letter} status={status} animationDelay={animationDelay} />;
            })}
        </div>
    </div>
  )};


  if (!bestGuess) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 max-w-sm mx-auto space-y-1">
            <p className="text-center">Belum ada tebakan.</p>
            <p className="text-center text-sm mb-2">Ayo tebak di kolom komentar!</p>
            {Array.from({ length: 3 }).map((_, i) => (
                <div
                    key={i}
                    className="wordle-grid-row grid gap-0.5 w-full"
                    style={{ gridTemplateColumns: `repeat(${wordLength}, 1fr)` }}
                >
                    {Array.from({ length: wordLength }).map((_, j) => (
                        <Tile key={j} letter="" status="empty" />
                    ))}
                </div>
            ))}
        </div>
    );
  }

  return (
    <div className="space-y-1 max-w-sm mx-auto">
        <div>
            <h4 className="text-sm font-bold text-yellow-400 mb-1 text-center uppercase tracking-wider">Tebakan Terbaik</h4>
            {renderGuessRow(bestGuess, 'best-guess')}
        </div>

        {recentGuesses.length > 0 && (
            <>
                <div className="relative my-0.5">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-gray-800 px-2 text-xs text-gray-400 rounded-full">Tebakan Lainnya</span>
                    </div>
                </div>

                <div className="space-y-0.5 max-h-[250px] overflow-y-auto pr-2">
                    {recentGuesses.map((guessData, i) => 
                        renderGuessRow(guessData, `${guessData.user.uniqueId}-${guessData.guess}-${i}`, i === 0)
                    )}
                </div>
            </>
        )}
    </div>
  );
};

export default WordleGrid;