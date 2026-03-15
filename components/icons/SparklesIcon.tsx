
import React from 'react';

const SparklesIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M19 3v4M17 5h4M14 11l-1.5-1.5L11 11l-1.5-1.5L8 11l-1.5-1.5L5 11l1.5 1.5L5 14l1.5 1.5L8 14l1.5 1.5L11 14l1.5 1.5L14 14l1.5-1.5L14 11zm-2.5 7.5L10 20l-1.5-1.5L7 20l-1.5-1.5L4 20" />
  </svg>
);

export default SparklesIcon;
