import React from 'react';

const BlockDicePowIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="#2ECC40">
    <rect x="10" y="10" width="80" height="80" rx="10" fill="#222" />
    <path d="M 30 20 L 70 20 L 60 40 L 80 40 L 40 80 L 50 60 L 30 60 Z" />
  </svg>
);

export default BlockDicePowIcon;