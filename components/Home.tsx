import React, { useState, useMemo } from 'react';
import DashboardBlock from './DashboardBlock';
import { useAuth } from '../hooks/useAuth';
import SearchIcon from './icons/SearchIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import UsersIcon from './icons/UsersIcon';
import TrophyIcon from './icons/TrophyIcon';
import CubeIcon from './icons/CubeIcon';
import StopwatchIcon from './icons/StopwatchIcon';
import DiceIcon from './icons/DiceIcon'; // Fallback to Cube if not found
import ProbabilityCalculator from './ProbabilityCalculator';
import InducementTable from './InducementTable';
import type { ManagedTeam, Competition, GameEvent } from '../types';

interface HomeProps {
    onNavigate: (view: any) => void;
    managedTeams: ManagedTeam[];
    competitions: Competition[];
    recentEvents: GameEvent[];
}

const Home: React.FC<HomeProps> = ({ onNavigate, managedTeams, competitions, recentEvents }) => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    const activeLeagues = useMemo(() => competitions.filter(c => c.status === 'In Progress'), [competitions]);

    return (
        <div className="space-y-6">
            {/* Top Search & Welcome */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 py-4">
                <div className="flex-1 w-full max-w-xl">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Buscador global: equipos, habilidades, reglas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-lg placeholder-slate-500 focus:border-premium-gold/50 focus:bg-white/10 outline-none transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                        />
                        <SearchIcon className="absolute left-4 top-4.5 w-5 h-5 text-slate-500 group-hover:text-premium-gold transition-colors" />
                        <div className="absolute right-3 top-3 px-3 py-1.5 bg-premium-gold/10 border border-premium-gold/20 rounded-lg text-[10px] text-premium-gold font-black uppercase tracking-tighter italic">Nuffle Search</div>
                    </div>
                </div>
                <div className="hidden lg:flex items-center gap-4 text-right">
                    <div className="flex flex-col">
                        <span className="text-xs font-display text-slate-500 uppercase tracking-widest font-black italic">Bienvenido, Coach</span>
                        <span className="text-2xl font-display font-black text-white italic tracking-tighter leading-none">{user?.name}</span>
                    </div>
                    {user?.picture && <img src={user.picture} alt="Avatar" className="w-12 h-12 rounded-xl border border-white/10 shadow-lg" />}
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-12">

                {/* Left Column (Oracle of Nuffle) - 3 cols */}
                <div className="md:col-span-3 space-y-6">
                    <DashboardBlock title="El Oráculo" icon={<BookOpenIcon className="w-5 h-5 text-premium-gold" />}>
                        <div className="space-y-2">
                            <button onClick={() => onNavigate('teams')} className="w-full text-left p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-premium-gold/30 transition-all flex items-center justify-between group">
                                <span className="text-xs font-display font-bold text-slate-300 uppercase tracking-widest group-hover:text-white">Enciclopedia</span>
                                <span className="text-premium-gold opacity-50 group-hover:opacity-100">&rarr;</span>
                            </button>
                            <button onClick={() => onNavigate('starplayers')} className="w-full text-left p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-premium-gold/30 transition-all flex items-center justify-between group">
                                <span className="text-xs font-display font-bold text-slate-300 uppercase tracking-widest group-hover:text-white">Jugadores Estrella</span>
                                <span className="text-premium-gold opacity-50 group-hover:opacity-100">&rarr;</span>
                            </button>
                        </div>
                    </DashboardBlock>

                    <DashboardBlock title="Probabilidades" icon={<DiceIcon className="w-5 h-5 text-premium-gold" />}>
                        <ProbabilityCalculator />
                    </DashboardBlock>
                </div>

                {/* Center Column (The Coaches Guild) - 6 cols */}
                <div className="md:col-span-6 space-y-6">
                    <DashboardBlock
                        title="Gremio de Entrenadores"
                        icon={<UsersIcon className="w-5 h-5 text-premium-gold" />}
                        className="flex-1"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed">Gestiona tus rosters y crea formaciones imparables.</p>
                            <button
                                onClick={() => onNavigate('manager')}
                                className="bg-premium-gold hover:bg-premium-gold/80 text-black font-display font-black px-6 py-2.5 rounded-xl uppercase text-xs italic tracking-tighter transition-all shadow-[0_4px_15px_rgba(202,138,4,0.4)]"
                            >
                                Nuevo Equipo
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {managedTeams.length > 0 ? managedTeams.map(team => (
                                <div
                                    key={team.id}
                                    onClick={() => onNavigate('manager')}
                                    className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
                                >
                                    <div className="w-12 h-12 bg-black/40 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 group-hover:scale-110 transition-transform">
                                        {team.crestImage ? <img src={team.crestImage} alt="Crest" className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-slate-700 font-black">?</div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-display font-black text-white italic truncate">{team.name}</h4>
                                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{team.rosterName}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-mono font-black text-premium-gold tracking-tighter">{team.totalTV / 1000}k MO</span>
                                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{team.players.length} Jugadores</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
                                    <UsersIcon className="w-12 h-12 mb-3 text-slate-600" />
                                    <p className="text-xs font-display font-bold uppercase tracking-widest">No has reclutado a nadie todavía...</p>
                                </div>
                            )}
                        </div>
                    </DashboardBlock>

                    <DashboardBlock title="Incentivos" icon={<CubeIcon className="w-5 h-5 text-premium-gold" />}>
                        <InducementTable />
                    </DashboardBlock>
                </div>

                {/* Right Column (The Arena of Glory) - 3 cols */}
                <div className="md:col-span-3 space-y-6">
                    <DashboardBlock
                        title="Arena de la Gloria"
                        icon={<TrophyIcon className="w-5 h-5 text-premium-gold" />}
                        className="min-h-[200px]"
                    >
                        <div className="space-y-4">
                            <button
                                onClick={() => onNavigate('game')}
                                className="w-full py-6 rounded-2xl border-2 border-blood-red/40 bg-blood-red/10 hover:bg-blood-red/20 hover:border-blood-red/60 transition-all flex flex-col items-center justify-center gap-2 group shadow-[0_10px_30px_rgba(153,27,27,0.2)]"
                            >
                                <StopwatchIcon className="w-8 h-8 text-blood-red group-hover:scale-110 transition-transform" />
                                <span className="font-display font-black text-white italic text-lg tracking-tighter uppercase">Iniciar Partido</span>
                                <span className="text-[9px] text-blood-red/60 font-black uppercase tracking-[0.2em] leading-none">Modo Mesa Activo</span>
                            </button>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <span>Ligas Activas</span>
                                    <span onClick={() => onNavigate('leagues')} className="text-premium-gold cursor-pointer hover:underline">Ver todas</span>
                                </div>
                                {activeLeagues.length > 0 ? activeLeagues.map(league => (
                                    <div key={league.id} className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                                        <h5 className="text-[11px] font-bold text-slate-200 truncate">{league.name}</h5>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{league.participants.length} Equipos</p>
                                    </div>
                                )) : (
                                    <p className="text-[10px] italic text-slate-600 text-center py-4">No hay ligas activas.</p>
                                )}
                            </div>
                        </div>
                    </DashboardBlock>

                    <DashboardBlock title="Crónicas de Nuffle" icon={<SearchIcon className="w-5 h-5 text-premium-gold" />}>
                        <div className="space-y-4">
                            <div className="p-3 bg-black/40 rounded-lg border-l-2 border-blood-red italic text-[10px] text-slate-400 leading-relaxed">
                                "En el turno 3, el blitzer orco Gorbag atravesó la línea humana..."
                            </div>
                            <p className="text-[9px] text-center text-slate-500 font-bold uppercase tracking-widest italic leading-none">Sistema de narración automática pronto disponible</p>
                        </div>
                    </DashboardBlock>
                </div>

            </div>
        </div>
    );
};

export default Home;
