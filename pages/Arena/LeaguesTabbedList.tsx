import React from 'react';
import type { Competition, User } from '../../types';
import CompetitionCard from './CompetitionCard';

interface LeaguesTabbedListProps {
    activeTab: 'my-leagues' | 'my-tournaments' | 'discover' | 'organization';
    setActiveTab: React.Dispatch<React.SetStateAction<'my-leagues' | 'my-tournaments' | 'discover' | 'organization'>>;
    myLeagues: Competition[];
    myTournaments: Competition[];
    publicLeagues: Competition[];
    publicTournaments: Competition[];
    myCompetitions: Competition[];
    user?: User | null;
    defaultTeamName: string;
    onOpenCompetition: (competition: Competition) => void;
    onJoinCompetition: (competition: Competition, teamName: string) => void;
    onCreateCompetition: () => void;
}

const EmptyState: React.FC<{ icon: string; title: string; subtitle: string; ctaLabel: string; onCta: () => void }> = ({ icon, title, subtitle, ctaLabel, onCta }) => (
    <div className="py-24 text-center bg-zinc-900/20 rounded-[2.5rem] border border-dashed border-white/5 space-y-4">
        <span className="material-symbols-outlined text-7xl text-white/5 block">{icon}</span>
        <p className="text-white font-black italic uppercase text-lg">{title}</p>
        <p className="text-slate-500 font-bold italic uppercase tracking-widest text-xs">{subtitle}</p>
        <button onClick={onCta} className="mt-4 px-8 py-3 bg-primary/20 text-primary border border-primary/30 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-black transition-all">
            {ctaLabel}
        </button>
    </div>
);

const MatchCompetitionCard: React.FC<{ competition: Competition; defaultTeamName: string; onJoinCompetition: (competition: Competition, teamName: string) => void; }> = ({ competition, defaultTeamName, onJoinCompetition }) => (
    <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] flex justify-between items-center group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="min-w-0 relative z-10 space-y-2">
            <p className="text-xl font-black text-white italic uppercase truncate group-hover:text-primary transition-colors">{competition.name}</p>
            <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                <span>{competition.ownerName}</span>
                <span className="w-1 h-1 rounded-full bg-slate-700" />
                <span>{competition.teams.length}{competition.maxTeams ? `/${competition.maxTeams}` : ''} equipos</span>
            </div>
        </div>
        <button
            onClick={() => onJoinCompetition(competition, defaultTeamName)}
            className="relative z-10 bg-primary/10 hover:bg-primary text-primary hover:text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-primary/20 shrink-0"
        >
            Inscribirse
        </button>
    </div>
);

const LeaguesTabbedList: React.FC<LeaguesTabbedListProps> = ({
    activeTab,
    setActiveTab,
    myLeagues,
    myTournaments,
    publicLeagues,
    publicTournaments,
    myCompetitions,
    user,
    defaultTeamName,
    onOpenCompetition,
    onJoinCompetition,
    onCreateCompetition,
}) => {
    return (
        <div className="p-2 sm:p-4 max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
                <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                    La <span className="text-primary italic">Arena</span>
                </h1>
                <div className="flex flex-wrap gap-1 bg-zinc-900/60 p-1 rounded-2xl border border-white/5 backdrop-blur-md">
                    {[
                        { id: 'my-leagues', label: 'Mis Ligas', icon: 'emoji_events' },
                        { id: 'my-tournaments', label: 'Mis Torneos', icon: 'bolt' },
                        { id: 'discover', label: 'Descubrir', icon: 'explore' },
                        { id: 'organization', label: 'Organización', icon: 'admin_panel_settings' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-1.5 px-4 sm:px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-white'}`}
                        >
                            <span className="material-symbols-outlined text-sm font-bold">{tab.icon}</span>
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'my-leagues' && (
                <div className="space-y-4">
                    {myLeagues.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myLeagues.map(c => (
                                <CompetitionCard
                                    key={c.id}
                                    competition={c}
                                    myTeamInComp={c.teams.find(t => t.ownerId === user?.id)}
                                    onClick={() => onOpenCompetition(c)}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon="emoji_events"
                            title="No participas en ninguna liga"
                            subtitle="Ve a la pestaña Descubrir o crea la tuya en Organización"
                            ctaLabel="Explorar Ligas Públicas"
                            onCta={() => setActiveTab('discover')}
                        />
                    )}
                </div>
            )}

            {activeTab === 'my-tournaments' && (
                <div className="space-y-4">
                    {myTournaments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myTournaments.map(c => (
                                <CompetitionCard
                                    key={c.id}
                                    competition={c}
                                    myTeamInComp={c.teams.find(t => t.ownerId === user?.id)}
                                    onClick={() => onOpenCompetition(c)}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon="bolt"
                            title="No participas en ningún torneo"
                            subtitle="Espera una invitación o únete a torneos públicos"
                            ctaLabel="Explorar Torneos Públicos"
                            onCta={() => setActiveTab('discover')}
                        />
                    )}
                </div>
            )}

            {activeTab === 'discover' && (
                <div className="space-y-8">
                    <div className="space-y-3">
                        <h2 className="text-lg font-black text-white uppercase tracking-widest italic flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">emoji_events</span>
                            Ligas Abiertas
                        </h2>
                        {publicLeagues.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {publicLeagues.map(c => (
                                    <MatchCompetitionCard
                                        key={c.id}
                                        competition={c}
                                        defaultTeamName={defaultTeamName}
                                        onJoinCompetition={onJoinCompetition}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 text-center bg-zinc-900/20 rounded-[2rem] border border-dashed border-white/5">
                                <p className="text-slate-500 font-bold italic uppercase tracking-widest text-xs">No hay ligas abiertas ahora mismo</p>
                            </div>
                        )}
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-lg font-black text-white uppercase tracking-widest italic flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">bolt</span>
                            Torneos Abiertos
                        </h2>
                        {publicTournaments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {publicTournaments.map(c => (
                                    <MatchCompetitionCard
                                        key={c.id}
                                        competition={c}
                                        defaultTeamName={defaultTeamName}
                                        onJoinCompetition={onJoinCompetition}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 text-center bg-zinc-900/20 rounded-[2rem] border border-dashed border-white/5">
                                <p className="text-slate-500 font-bold italic uppercase tracking-widest text-xs">No hay torneos abiertos ahora mismo</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'organization' && (
                <div className="space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Tu área de gestión</p>
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Organización</h2>
                        </div>
                        <button
                            onClick={onCreateCompetition}
                            className="bg-primary text-black font-black px-8 py-4 rounded-2xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 uppercase tracking-tighter text-[10px] shadow-xl shadow-primary/10"
                        >
                            <span className="material-symbols-outlined font-bold text-sm">add_circle</span>
                            Nueva Competición
                        </button>
                    </div>

                    {myCompetitions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myCompetitions.map(c => (
                                <div
                                    key={c.id}
                                    className="group bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] hover:bg-zinc-800/60 transition-all flex justify-between items-center relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/10 transition-colors" />
                                    <div className="relative z-10 flex flex-col gap-2 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${c.status === 'Open' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : (c.status === 'In Progress' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'bg-slate-500')}`} />
                                            <h3 className="text-xl font-black text-white uppercase italic tracking-tight truncate group-hover:text-primary transition-colors">{c.name}</h3>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">military_tech</span> {c.format}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">groups</span> {c.teams.length}{c.maxTeams ? `/${c.maxTeams}` : ''} participantes</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 relative z-10 shrink-0">
                                        <div className="text-right hidden sm:block">
                                            <span className={`block text-[10px] font-black uppercase italic px-2 py-1 rounded-lg ${
                                                c.status === 'Open' ? 'bg-green-500/10 text-green-400' : c.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-slate-800 text-slate-500'
                                            }`}>{c.status}</span>
                                        </div>
                                        <button
                                            onClick={() => onOpenCompetition(c)}
                                            className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center hover:bg-primary hover:text-black transition-all shadow-lg hover:shadow-primary/20"
                                        >
                                            <span className="material-symbols-outlined font-bold">settings</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-24 text-center bg-zinc-900/20 rounded-[2.5rem] border border-dashed border-white/5 space-y-4">
                            <span className="material-symbols-outlined text-7xl text-white/5 block">admin_panel_settings</span>
                            <p className="text-white font-black italic uppercase text-lg">Aún no has creado ninguna competición</p>
                            <p className="text-slate-500 font-bold italic uppercase tracking-widest text-xs">Crea tu primera liga o torneo para empezar</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LeaguesTabbedList;
