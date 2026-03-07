import React, { useState } from 'react';
// Sub-páginas del Oráculo
import Teams from './TeamsPage';
import Skills from './SkillsPage';
import StarPlayers from './StarPlayersPage';
import ProbabilityCalculator from './ProbabilitiesPage';
import InducementTable from './InducementsPage';

type SubView = 'teams' | 'skills' | 'star_players' | 'calculator' | 'inducements';

interface TeamsAndSkillsProps {
    onRequestTeamCreation?: (rosterName: string) => void;
}

const TeamsAndSkills: React.FC<TeamsAndSkillsProps> = ({ onRequestTeamCreation = () => { } }) => {
    const [activeView, setActiveView] = useState<SubView>('teams');

    const getButtonClass = (view: SubView) => {
        return `flex-1 py-3 px-2 text-center transition-all duration-300 relative font-display uppercase tracking-widest text-[10px] sm:text-xs font-black ${activeView === view
            ? 'text-premium-gold'
            : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`;
    };

    return (
        <div className="animate-fade-in-slow">
            <div className="p-2 sm:p-4">
                <div className="flex border-b border-white/5 mb-8 bg-black/40 rounded-2xl overflow-hidden shadow-xl">
                    <button onClick={() => setActiveView('teams')} className={getButtonClass('teams')}>
                        Equipos
                        {activeView === 'teams' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-premium-gold" />}
                    </button>
                    <button onClick={() => setActiveView('skills')} className={getButtonClass('skills')}>
                        Habilidades
                        {activeView === 'skills' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-premium-gold" />}
                    </button>
                    <button onClick={() => setActiveView('star_players')} className={getButtonClass('star_players')}>
                        Estrellas
                        {activeView === 'star_players' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-premium-gold" />}
                    </button>
                    <button onClick={() => setActiveView('calculator')} className={getButtonClass('calculator')}>
                        Oráculo
                        {activeView === 'calculator' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-premium-gold" />}
                    </button>
                    <button onClick={() => setActiveView('inducements')} className={getButtonClass('inducements')}>
                        Incentivos
                        {activeView === 'inducements' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-premium-gold" />}
                    </button>
                </div>

                <div className="max-w-6xl mx-auto">
                    {activeView === 'teams' && <Teams onRequestTeamCreation={onRequestTeamCreation} />}
                    {activeView === 'skills' && <Skills />}
                    {activeView === 'star_players' && <StarPlayers />}
                    {activeView === 'calculator' && (
                        <div className="max-w-md mx-auto py-10">
                            <h3 className="text-xl font-display font-black text-white italic tracking-tighter uppercase mb-6 text-center">Calculadora de Nuffle</h3>
                            <ProbabilityCalculator />
                        </div>
                    )}
                    {activeView === 'inducements' && (
                        <div className="max-w-2xl mx-auto py-10">
                            <h3 className="text-xl font-display font-black text-white italic tracking-tighter uppercase mb-6 text-center">Tabla de Incentivos</h3>
                            <InducementTable />
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes fade-in-slow {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-slow {
                    animation: fade-in-slow 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
};

export default TeamsAndSkills;