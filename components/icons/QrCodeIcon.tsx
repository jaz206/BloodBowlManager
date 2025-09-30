
import React from 'react';

const QrCodeIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6.5 2.5l-2.5 2.5M12 18.5V21M4 12H2m11-6.5L9.5 3M18.5 12V6a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6v12.75c0 1.242 1.008 2.25 2.25 2.25h4.912M18.5 12h-5.25v5.25h5.25V12z" />
  </svg>
);

export default QrCodeIcon;