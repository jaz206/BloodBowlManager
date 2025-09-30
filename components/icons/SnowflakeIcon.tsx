
import React from 'react';

const SnowflakeIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m-4.24-4.24L12 12l4.24 4.24M3.51 9.51L12 12l8.49-2.49M3.51 14.49L12 12l8.49 2.49m-8.49-9.98L7.76 7.76M16.24 16.24L12 12" />
  </svg>
);

export default SnowflakeIcon;
