import React from 'react';

interface DashboardBlockProps {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

const DashboardBlock: React.FC<DashboardBlockProps> = ({ title, icon, children, className = '', onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`glass-panel border-white/10 p-4 flex flex-col relative overflow-hidden transition-all duration-300 ${onClick ? 'cursor-pointer hover:border-premium-gold/50 hover:bg-white/5 group' : ''} ${className}`}
        >
            <div className="flex items-center gap-2 mb-4">
                {icon && <div className="text-premium-gold group-hover:scale-110 transition-transform">{icon}</div>}
                <h3 className="font-display text-sm tracking-[0.2em] font-bold uppercase text-white/80 group-hover:text-premium-gold transition-colors">{title}</h3>
            </div>
            <div className="flex-1">
                {children}
            </div>
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20px] right-[-20px] w-10 h-10 bg-premium-gold/10 rotate-45 transform"></div>
            </div>
        </div>
    );
};

export default DashboardBlock;
