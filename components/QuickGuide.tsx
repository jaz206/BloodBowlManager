
import React, { useState } from 'react';
import GameSequence from './GameSequence';
import PassChart from './PassChart';
import Prayers from './Prayers';

type SubView = 'sequence' | 'pass' | 'prayers';

const QuickGuide: React.FC = () => {
    const [activeView, setActiveView] = useState<SubView>('sequence');

    const getButtonClass = (view: SubView) => {
        return `flex-1 py-3 px-2 text-center text-xs sm:text-sm font-bold rounded-t-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-amber-400 transition-colors duration-200 whitespace-nowrap ${
          activeView === view
            ? 'bg-slate-800 text-amber-400'
            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
        }`;
    };

    return (
        <div className="animate-fade-in-slow">
            <div className="p-2 sm:p-4">
                <div className="flex border-b border-slate-700 mb-4">
                    <button onClick={() => setActiveView('sequence')} className={getButtonClass('sequence')}>Secuencia de Juego</button>
                    <button onClick={() => setActiveView('pass')} className={getButtonClass('pass')}>Tabla de Pases</button>
                    <button onClick={() => setActiveView('prayers')} className={getButtonClass('prayers')}>Plegarias a Nuffle</button>
                </div>

                <div>
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