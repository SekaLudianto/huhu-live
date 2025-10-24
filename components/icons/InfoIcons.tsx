import React from 'react';

const IconWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        {children}
    </svg>
);

export const TrophyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconWrapper className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 01-4.874-1.972l.004-.004-.004.004a9.75 9.75 0 01-1.32-3.213C.67 11.53 1.95 9.25 4.5 7.5c2.55-1.75 5.474-1.75 8.024 0 2.55 1.75 3.83 4.03 3.155 6.287a9.75 9.75 0 01-1.32 3.213zM12 18.75v-5.25m0 5.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
    </IconWrapper>
);

export const RankIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconWrapper className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
    </IconWrapper>
);