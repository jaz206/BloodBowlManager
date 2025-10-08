import React from 'react';

const BlockDiceBothDownIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="#FF851B">
    <rect x="10" y="10" width="80" height="80" rx="10" fill="#222" />
    <path d="M 20 80 L 50 20 L 80 80 Z" strokeWidth="8" stroke="currentColor" fill="none" />
    <path d="M 20 20 L 50 80 L 80 20" strokeWidth="8" stroke="currentColor" fill="none" />
  </svg>
);

export default BlockDiceBothDownIcon;