import React from 'react';

const BlockDiceSkullIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="#FF4136">
    <rect x="10" y="10" width="80" height="80" rx="10" fill="#222" />
    <circle cx="50" cy="45" r="20" />
    <rect x="35" y="60" width="30" height="10" />
    <rect x="30" y="70" width="40" height="5" />
    <circle cx="40" cy="40" r="5" fill="black" />
    <circle cx="60" cy="40" r="5" fill="black" />
  </svg>
);

export default BlockDiceSkullIcon;