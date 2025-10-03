import React from 'react';

const TrophyIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6.75A2.25 2.25 0 0111.25 4.5h1.5A2.25 2.25 0 0115 6.75V19M6 19h12M6 19H4.5m1.5 0V17.25m12 1.75V17.25m1.5 1.75H18" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 6.375c0-1.036.84-1.875 1.875-1.875h10.125c1.035 0 1.875.84 1.875 1.875v3.375c0 .53-.212 1.036-.586 1.41l-.707.707a1.125 1.125 0 01-1.59 0l-.707-.707a1.125 1.125 0 00-1.59 0l-.707.707a1.125 1.125 0 01-1.59 0l-.707-.707a1.125 1.125 0 00-1.59 0l-.707.707a1.125 1.125 0 01-1.59 0L7.43 11.493a1.125 1.125 0 00-1.59 0l-.707.707A1.125 1.125 0 014.5 11.493V6.375z" />
  </svg>
);

export default TrophyIcon;
