import React from 'react';
import { TileStatus } from '../types';

interface TileProps {
  letter?: string;
  status: TileStatus;
  animationDelay?: string;
}

const Tile: React.FC<TileProps> = ({ letter = '', status, animationDelay }) => {
  const baseClasses = "w-full aspect-square inline-flex justify-center items-center text-2xl font-bold uppercase border-2 rounded-md transition-colors duration-300";
  
  const statusClasses: Record<TileStatus, string> = {
    empty: 'border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white',
    pending: 'border-gray-400 bg-gray-200 dark:border-gray-500 dark:bg-gray-800 text-gray-800 dark:text-white',
    correct: 'bg-green-600 border-green-600 text-white',
    present: 'bg-yellow-600 border-yellow-600 text-white',
    absent: 'bg-gray-500 border-gray-500 text-white',
  };
  
  const animationClass = letter && status !== 'empty' && status !== 'pending' ? 'animate-pop-in' : '';

  return (
    <div 
        className={`${baseClasses} ${statusClasses[status]} ${animationClass}`}
        style={{ animationDelay: animationDelay || '0s' }}
    >
        {letter}
    </div>
  );
};

export default Tile;