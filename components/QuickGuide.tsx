
import React, { useState } from 'react';
import GameSequence from './GameSequence';
import PassChart from './PassChart';
import Prayers from './Prayers';
import CheatSheet from './CheatSheet';

type SubView = 'sequence' | 'pass' | 'prayers' | 'reference';

const QuickGuide: React.FC = () => {
    const [activeView, setActiveView] = useState<SubView>('reference');

    const getButtonClass = (view: SubView) => {
        return `flex-1 py-3 px-2 text-center transition-all duration-300 relative font-display uppercase tracking-widest text-[10px] sm:text-xs font-bold ${activeView === view
            ? 'text-premium-gold'
            : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`;
    };

    return (
        <div className="animate-fade-in-slow">
            <div className="p-2 sm:p-4">
                <div className="flex border-b border-white/10 mb-6 bg-black/20 rounded-t-xl overflow-hidden">
                    <button onClick={() => setActiveView('reference')} className={getButtonClass('reference')}>
                        Chuleta 3.3
                        {activeView === 'reference' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-premium-gold shadow-[0_0_10px_rgba(202,138,4,0.5)]" />}
                    </button>
                    <button onClick={() => setActiveView('sequence')} className={getButtonClass('sequence')}>
                        Secuencia
                        {activeView === 'sequence' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-premium-gold shadow-[0_0_10px_rgba(202,138,4,0.5)]" />}
                    </button>
                    <button onClick={() => setActiveView('pass')} className={getButtonClass('pass')}>
                        Pases
                        {activeView === 'pass' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-premium-gold shadow-[0_0_10px_rgba(202,138,4,0.5)]" />}
                    </button>
                    <button onClick={() => setActiveView('prayers')} className={getButtonClass('prayers')}>
                        Nuffle
                        {activeView === 'prayers' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-premium-gold shadow-[0_0_10px_rgba(202,138,4,0.5)]" />}
                    </button>
                </div>

                <div>
                    {activeView === 'reference' && <CheatSheet />}
                    {activeView === 'sequence' && <GameSequence />}
                    {activeView === 'pass' && <PassChart />}
                    {activeView === 'prayers' && <Prayers />}
                </div>
            </div>
            <style>{`
                @keyframes fade-in-slow {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in-slow {
                    animation: fade-in-slow 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default QuickGuide;