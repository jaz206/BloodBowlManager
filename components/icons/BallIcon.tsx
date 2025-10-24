import React from 'react';

const BallIcon: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <radialGradient id="ballIconGradient" cx="0.3" cy="0.3" r="0.7">
        <stop offset="0%" stopColor="#8B4513" />
        <stop offset="100%" stopColor="#4A2511" />
      </radialGradient>
    </defs>
    <circle cx="16" cy="16" r="14" fill="url(#ballIconGradient)" stroke="#2D160A" strokeWidth="1.5"/>
    <path d="M 16 2 A 14 14 0 0 0 16 30" fill="none" stroke="#D2B48C" strokeWidth="2"/>
    <path d="M 2 16 A 14 14 0 0 0 30 16" fill="none" stroke="#D2B48C" strokeWidth="2" transform="rotate(90 16 16)"/>
  </svg>
);

export default BallIcon;
