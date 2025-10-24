import React, { useState, useEffect } from 'react';
import { InfoIcon } from './icons/InfoIcon';

interface SkipNotificationProps {
  word: string | null;
  timestamp: number;
}

const SkipNotification: React.FC<SkipNotificationProps> = ({ word, timestamp }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (word) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 4500); // Must be slightly less than SKIP_NOTICE_DURATION in useWordleGame

      return () => clearTimeout(timer);
    } else {
        setIsVisible(false);
    }
  }, [word, timestamp]); // Use timestamp to re-trigger effect for same word

  if (!isVisible) {
    return null;
  }

  return (
    <div 
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm px-4 z-50 transition-all duration-300 ease-in-out`}
    >
      <div 
        className="bg-gray-800/80 backdrop-blur-md border border-yellow-500/50 shadow-lg rounded-xl p-4 flex items-center space-x-4"
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
      >
        <InfoIcon className="w-10 h-10 text-yellow-300 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white text-left">
            Mohon maaf, kata sebelumnya: <b className="text-yellow-300 text-lg uppercase tracking-widest">{word}</b>
          </p>
          <p className="text-xs text-gray-300 text-left mt-1">
            terfilter oleh sistem. Game akan dimulai ulang.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SkipNotification;
