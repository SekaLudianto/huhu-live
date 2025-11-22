import React from 'react';
import { TileStatus } from '../types';

interface TileProps {
  letter?: string;
  status: TileStatus;
  animationDelay?: string;
}

const Tile: React.FC<TileProps> = ({ letter = '', status, animationDelay }) => {
    const isFlipped = status !== 'empty' && status !== 'pending';
    
    const frontStatus = status === 'empty' ? 'empty' : 'pending';

    const frontClasses: Record<'empty' | 'pending', string> = {
        empty: 'border-gray-600 text-white bg-gray-900/50',
        pending: 'border-gray-500 bg-gray-700 text-white',
    };

    const backClasses: Record<TileStatus, string> = {
        empty: 'bg-transparent border-gray-600',
        pending: 'bg-transparent border-gray-500',
        correct: 'bg-green-600 border-green-600 text-white',
        present: 'bg-yellow-600 border-yellow-600 text-white',
        absent: 'bg-gray-500 border-gray-500 text-white',
    };

    return (
        <div className="tile-container w-full aspect-square">
            <div
                className={`tile-flipper ${isFlipped ? 'is-flipped' : ''}`}
                style={{ transitionDelay: animationDelay || '0s' }}
            >
                <div className={`tile-face tile-front ${frontClasses[frontStatus]}`}>
                    {letter}
                </div>
                <div className={`tile-face tile-back ${backClasses[status]}`}>
                    {letter}
                </div>
            </div>
        </div>
    );
};

export default Tile;
