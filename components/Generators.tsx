
import React, { useState } from 'react';
import Weather from './Weather';
import KickoffEvents from './KickoffEvents';
import Injuries from './Injuries';
import Casualties from './Casualties';

type SubView = 'weather' | 'kickoff' | 'injuries' | 'casualties';

const Generators: React.FC = () => {
    const [activeView, setActiveView] = useState<SubView>('weather');

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
                <div className="flex border-b border-slate-700 mb-4 overflow-x-auto">
                    <div className="flex flex-shrink-0">
                        <button onClick={() => setActiveView('weather')} className={getButtonClass('weather')}>Clima</button>
                        <button onClick={() => setActiveView('kickoff')} className={getButtonClass('kickoff')}>Eventos de Patada</button>
                        <button onClick={() => setActiveView('injuries')} className={getButtonClass('injuries')}>Heridas</button>
                        <button onClick={() => setActiveView('casualties')} className={getButtonClass('casualties')}>Lesiones</button>
                    </div>
                </div>

                <div>
                    {activeView === 'weather' && <Weather />}
                    {activeView === 'kickoff' && <KickoffEvents />}
                    {activeView === 'injuries' && <Injuries />}
                    {activeView === 'casualties' && <Casualties />}
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

export default Generators;