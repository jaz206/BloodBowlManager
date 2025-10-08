import React from 'react';
import BlockDicePushIcon from './BlockDicePushIcon'; // Re-use push icon

const BlockDiceStumbleIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="#FFDC00">
        <rect x="10" y="10" width="80" height="80" rx="10" fill="#222" />
        <g transform="translate(10, 0)">
            <path d="M 40 20 L 65 50 L 40 80 L 15 50 Z" />
        </g>
        <path d="M 75 20 L 75 80" stroke="#FFDC00" strokeWidth="8"/>
    </svg>
);

export default BlockDiceStumbleIcon;