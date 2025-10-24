import React from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon } from './icons/FeedbackIcons';

interface ValidationToastProps {
  show: boolean;
  content: string;
  type: 'info' | 'error';
}

const ValidationToast: React.FC<ValidationToastProps> = ({ show, content, type }) => {
  const baseClasses = "absolute top-2 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50 transition-all duration-300 ease-in-out";
  const showClasses = "opacity-100 translate-y-0";
  const hideClasses = "opacity-0 -translate-y-full pointer-events-none";

  const typeClasses = {
    info: {
      bg: 'bg-blue-900/80',
      border: 'border-blue-500/50',
      icon: <CheckCircleIcon className="w-6 h-6 text-blue-300" />
    },
    error: {
      bg: 'bg-red-900/80',
      border: 'border-red-500/50',
      icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-300" />
    }
  };

  const currentType = typeClasses[type] || typeClasses.info;

  return (
    <div className={`${baseClasses} ${show ? showClasses : hideClasses}`}>
      <div 
        className={`${currentType.bg} ${currentType.border} backdrop-blur-md border shadow-lg rounded-xl p-3 flex items-center space-x-3`}
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
      >
        <div className="flex-shrink-0">{currentType.icon}</div>
        <div 
          className="flex-1 min-w-0 text-sm text-white"
          dangerouslySetInnerHTML={{ __html: content }} // To allow <b> tags from the hook
        />
      </div>
    </div>
  );
};

export default ValidationToast;