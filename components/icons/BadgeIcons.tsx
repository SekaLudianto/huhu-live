import React from 'react';

export const TrophyIcon: React.FC<{ className?: string, title?: string }> = ({ className, title }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={className}
        style={{ filter: 'drop-shadow(0 0 3px currentColor)' }}
        aria-label={title}
    >
        <title>{title}</title>
        <path d="M12,2A3,3 0 0,1 15,5V6H9V5A3,3 0 0,1 12,2M19,6H17V11H7V6H5A2,2 0 0,0 3,8V13A2,2 0 0,0 5,15H6V20H18V15H19A2,2 0 0,0 21,13V8A2,2 0 0,0 19,6Z" />
    </svg>
);

export const DiamondBadgeIcon: React.FC<{ className?: string, title?: string }> = ({ className, title }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    style={{ filter: 'drop-shadow(0 0 3px currentColor)' }}
    aria-label={title}
  >
    <title>{title}</title>
    <path d="M12,2L2,8.5L12,22L22,8.5L12,2Z" />
  </svg>
);