import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface ModeratorMessageOverlayProps {
  data: { message: string; user: User } | null;
}

const ModeratorMessageOverlay: React.FC<ModeratorMessageOverlayProps> = ({ data }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (data) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 6500);

            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [data]);

    if (!data) {
        return null;
    }

    const { message, user } = data;

    return (
        <div 
            className={`fixed inset-0 flex items-center justify-center p-4 z-50 transition-opacity duration-500 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            <div className={`transition-all duration-500 ease-in-out ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'} max-w-lg w-full flex flex-col items-center`}>
                <div className="flex items-center gap-2 mb-2 bg-gray-900/50 backdrop-blur-sm p-2 rounded-full">
                    <img src={user.profilePictureUrl} alt={user.nickname} className="w-8 h-8 rounded-full" />
                    <span className="text-white font-semibold text-sm">{user.nickname}</span>
                </div>
                <div 
                    className="relative bg-cyan-500/90 backdrop-blur-sm border-2 border-cyan-300 text-white font-bold text-2xl md:text-4xl text-center shadow-2xl rounded-2xl p-6 md:p-8 w-full"
                    style={{ textShadow: '0 2px 5px rgba(0,0,0,0.5)' }}
                >
                    {/* Bubble tail */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[15px] border-t-cyan-500/90"></div>
                    
                    <p>{message}</p>
                </div>
            </div>
        </div>
    );
};

export default ModeratorMessageOverlay;
