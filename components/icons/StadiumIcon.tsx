import React from 'react';

const StadiumIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5C7.02944 4.5 3 8.01472 3 12C3 15.9853 7.02944 19.5 12 19.5C16.9706 19.5 21 15.9853 21 12C21 8.01472 16.9706 4.5 12 4.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12H21" />
    </svg>
);

export default StadiumIcon;
