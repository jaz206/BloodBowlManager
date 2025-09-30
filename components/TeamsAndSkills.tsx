
import React, { useState } from 'react';
import Teams from './Teams';
import Skills from './Skills';
import StarPlayers from './StarPlayers';

type SubView = 'teams' | 'skills' | 'star_players';

const TeamsAndSkills: React.FC = () => {
    const [activeView, setActiveView] = useState<SubView>('teams');

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
                    <button onClick={() => setActiveView('teams')} className={getButtonClass('teams')}>Equipos</button>
                    <button onClick={() => setActiveView('skills')} className={getButtonClass('skills')}>Habilidades</button>
                    <button onClick={() => setActiveView('star_players')} className={getButtonClass('star_players')}>Jugadores Estrella</button>
                </div>

                <div>
                    {activeView === 'teams' && <Teams />}
                    {activeView === 'skills' && <Skills />}
                    {activeView === 'star_players' && <StarPlayers />}
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

export default TeamsAndSkills;