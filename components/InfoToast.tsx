import React from 'react';
import { InfoIcon } from './icons/InfoIcons';

interface InfoToastProps {
  message: string;
}

const InfoToast: React.FC<InfoToastProps> = ({ message }) => {
  const animationDuration = '8s'; // Toast visible for ~6.4s
  
  const formattedMessage = message
    .replace(/<code>/g, '<code class="bg-gray-700/80 text-cyan-300 px-1.5 py-0.5 rounded-md text-xs font-mono">')
    .replace(/<\/code>/g, '</code>');

  return (
    <div
      className="fixed top-16 inset-x-0 z-40 animate-toast-in-out flex justify-center px-4 pointer-events-none"
      style={{ animationDuration }}
    >
      <div className="bg-gray-800/80 backdrop-blur-md border border-gray-600/50 shadow-lg rounded-xl py-2 px-4 flex items-center space-x-3 pointer-events-auto max-w-full md:max-w-md lg:max-w-lg">
        <InfoIcon className="w-6 h-6 text-cyan-400 flex-shrink-0" />
        <p 
          className="text-xs md:text-sm text-gray-200"
          dangerouslySetInnerHTML={{ __html: formattedMessage }}
        />
      </div>
    </div>
  );
};

export default InfoToast;