import React from 'react';

const StadiumIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.006 8.994A8.502 8.502 0 0012 4.5a8.502 8.502 0 00-7.006 4.494M4.994 15.006A8.502 8.502 0 0012 19.5a8.502 8.502 0 007.006-4.494M2 12h20M12 4.5v15" />
  </svg>
);

export default StadiumIcon;