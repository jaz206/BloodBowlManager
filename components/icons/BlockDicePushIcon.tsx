import React from 'react';

const BlockDicePushIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="#0074D9">
    <rect x="10" y="10" width="80" height="80" rx="10" fill="#222" />
    <path d="M 50 20 L 75 50 L 50 80 L 25 50 Z" />
  </svg>
);

export default BlockDicePushIcon;
