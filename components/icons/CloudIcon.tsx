import React from 'react';

const CloudIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-2-9.75V10a3 3 0 00-3-3h-1a4 4 0 00-4 4v.111" />
  </svg>
);

export default CloudIcon;