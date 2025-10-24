import React from 'react';

const MedicalCrossIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 001.414 1.414l3-3zM8.293 9.707a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414-1.414l-3-3z" clipRule="evenodd" />
    <path d="M11 5h-2v2H7v2h2v2h2v-2h2V7h-2V5z" />
  </svg>
);

export default MedicalCrossIcon;
