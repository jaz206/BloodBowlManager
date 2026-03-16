import React, { useMemo } from 'react';
import type { ManagedTeam, League as Competition, GameEvent, MatchReport } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth';

interface HomeProps {
    onNavigate: (view: any, payload?: string) => void;
    onCreateTeam?: () => void;
    managedTeams: ManagedTeam[];
    competitions: Competition[];
    recentEvents: GameEvent[];
    heroImage?: string | null;
    matchReports?: MatchReport[];
}

const Home: React.FC<HomeProps> = ({ onNavigate, onCreateTeam, managedTeams, matchReports = [], heroImage }) => {
    const { t } = useLanguage();
    const { user } = useAuth();
    
    // Logic for recent teams (last updated)
    const latestTeams = useMemo(() => {
        return [...managedTeams].sort((a, b) => {
            const dateA = a.updatedAt?.seconds || 0;
            const dateB = b.updatedAt?.seconds || 0;
            return dateB - dateA;
        }).slice(0, 2);
    }, [managedTeams]);

    // Global Stats Calculation
    const stats = useMemo(() => {
        let wins = 0;
        let totalMatches = matchReports.length;
        let casualties = 0;

        managedTeams.forEach(team => {
            wins += team.record?.wins || 0;
        });

        // Sum casualties from reports if available
        matchReports.forEach(report => {
            if (report.stats?.casualties) {
                casualties += (report.stats.casualties.home || 0);
            }
        });

        return { totalMatches: Math.max(totalMatches, wins), wins, casualties };
    }, [managedTeams, matchReports]);

    return (
        <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
             {/* Hero Header */}
             <section className="relative rounded-[2.5rem] overflow-hidden h-72 md:h-80 flex items-end p-8 md:p-12 border border-white/5 shadow-2xl group">
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[3000ms] group-hover:scale-105 pointer-events-none" 
                    style={{ backgroundImage: `url('${heroImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOnh3QMmXMj5089XASf9DHSnVLUNSPKeuU1h1YTVw0qsYy6LCTZgipMAmyGzUiOYOuSgHiCDOKZ7eeCKJzUyHPP0gDc2V0Xhr3o8292Ogd2Kf7DmAOhxa5S7FeQDLwok8sspu20LJgAVVIWfrs6t7uy-ZfGL7eHw6vHlkZgGbqe4UhukzN_tg93L9_T_bOd742JjNy7l39bpTcBND9XeLgyOudWSXIJmCsHQbetpy4bPPUPr_ssxaNyb3y3KzJMCwREbJHms-_-NeO'}')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                
                <div className="relative z-10 space-y-3">
                    <p className="text-premium-gold font-display font-black tracking-[0.4em] uppercase text-[10px] animate-pulse">
                        {t('home.welcome') || 'Bienvenido de nuevo'}, {user?.name.split(' ')[0] || 'Coach'}
                    </p>
                    <h2 className="text-5xl md:text-7xl font-display font-black text-white italic tracking-tighter uppercase leading-[0.8]">
                        TABLERO DE <br/><span className="text-premium-gold drop-shadow-[0_0_30px_rgba(245,159,10,0.5)]">ESTRATEGIA</span>
                    </h2>
                    <p className="text-slate-400 max-w-xl text-sm md:text-base font-medium leading-relaxed mt-4">
                        Nuffle observa tus dados. Prepara tu táctica, gestiona tu equipo y reclama la gloria en el emparrillado.
                    </p>
                </div>
                
                {/* Decoration Corner */}
                <div className="absolute top-8 right-8 w-20 h-20 border-t-2 border-r-2 border-premium-gold/20 rounded-tr-3xl"></div>
            </section>

            {/* Main Access Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* 1. Oráculo Card (Bento Style) */}
                <section className="glass-panel rounded-[2rem] p-8 border-l-4 border-l-premium-gold flex flex-col hover:border-premium-gold/40 transition-all duration-500 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.02] scale-150 rotate-12 transition-transform duration-1000 group-hover:scale-[1.7] group-hover:rotate-0">
                        <span className="material-symbols-outlined text-9xl">menu_book</span>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-10 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-premium-gold/10 flex items-center justify-center border border-premium-gold/20 shadow-inner">
                            <span className="material-symbols-outlined text-premium-gold text-3xl font-bold">menu_book</span>
                        </div>
                        <h3 className="text-2xl font-display font-black text-white uppercase italic tracking-tight">{t('home.cards.oracle.title') || 'El Oráculo de Nuffle'}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4 relative z-10">
                        {[
                            { icon: 'groups', title: 'Equipos', sub: 'Enciclopedia', view: 'oracle', payload: '' },
                            { icon: 'bolt', title: 'Codex', sub: 'Habilidades', view: 'oracle', payload: 'Habilidades' },
                            { icon: 'star', title: 'Estrellas', sub: 'Legendarios', view: 'oracle', payload: 'Star Player' },
                            { icon: 'calculate', title: 'Calculadora', sub: 'Probabilidades', view: 'oracle', payload: 'Calculadora' }
                        ].map(item => (
                            <button 
                                key={item.title}
                                onClick={() => onNavigate(item.view, item.payload)}
                                className="group/btn bg-white/5 hover:bg-premium-gold/10 p-5 rounded-2xl border border-white/5 transition-all flex flex-col items-start gap-2 hover:border-premium-gold/30 hover:shadow-xl"
                            >
                                <span className="material-symbols-outlined text-premium-gold transition-transform group-hover/btn:scale-110 group-hover/btn:-rotate-6">{item.icon}</span>
                                <div className="text-left">
                                    <p className="font-display font-black text-xs text-white uppercase italic group-hover/btn:text-premium-gold transition-colors">{item.title}</p>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{item.sub}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* 2. Gremio Card */}
                <section className="glass-panel rounded-[2rem] p-8 border-l-4 border-l-sky-500 flex flex-col hover:border-sky-500/40 transition-all duration-500 shadow-2xl relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 shadow-inner">
                                <span className="material-symbols-outlined text-sky-500 text-3xl font-bold">badge</span>
                            </div>
                            <h3 className="text-2xl font-display font-black text-white uppercase italic tracking-tight">{t('home.cards.guild.title') || 'Gremio de Coaches'}</h3>
                        </div>
                        <button 
                            onClick={onCreateTeam || (() => onNavigate('guild'))}
                            className="bg-sky-500 hover:bg-white text-black text-[10px] font-display font-black py-4 px-6 rounded-xl uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-sky-500/20"
                        >
                            {t('home.hero.newRoster') || 'Nuevo Equipo'}
                        </button>
                    </div>

                    <div className="space-y-4 flex-1 relative z-10">
                        <p className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest px-1 mb-2">{t('home.activeTeams.title') || 'Equipos Recientes'}</p>
                        {latestTeams.length > 0 ? latestTeams.map(team => (
                            <div 
                                key={team.id}
                                onClick={() => onNavigate('guild')}
                                className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-sky-500/50 cursor-pointer transition-all group/item hover:bg-white/[0.08]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-black/60 rounded-xl flex items-center justify-center border border-white/10 overflow-hidden shadow-inner group-hover/item:border-sky-500/30">
                                        {team.crestImage ? <img src={team.crestImage} className="w-full h-full object-cover transition-transform group-hover/item:scale-110" /> : <span className="font-black text-sky-500 text-sm italic">{team.name.substring(0,2).toUpperCase()}</span>}
                                    </div>
                                    <div>
                                        <p className="text-base font-display font-black text-white uppercase italic group-hover/item:text-sky-500 transition-colors leading-none mb-1">{team.name}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{team.rosterName} • TV {team.totalTV ? team.totalTV / 1000 : 1000}k</p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-slate-600 group-hover/item:text-sky-500 transition-transform group-hover/item:translate-x-1">chevron_right</span>
                            </div>
                        )) : (
                            <div className="flex-1 flex flex-col items-center justify-center opacity-30 gap-4 py-8 border-2 border-dashed border-white/5 rounded-2xl">
                                <span className="material-symbols-outlined text-5xl">shield</span>
                                <p className="text-[10px] font-display font-bold uppercase tracking-[0.2em] italic">{t('home.activeTeams.empty') || 'Aún no has forjado tu leyenda'}</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 3. Arena - Main Entry (Full Width on Desktop) */}
                <section 
                    onClick={() => onNavigate('arena')}
                    className="glass-panel lg:col-span-2 rounded-[3.5rem] p-10 md:p-14 flex flex-col md:flex-row items-center justify-around gap-12 relative overflow-hidden group cursor-pointer border border-premium-gold/10 hover:border-premium-gold/40 transition-all duration-700 bg-gradient-to-br from-premium-gold/5 via-transparent to-blood-red/5 shadow-3xl"
                >
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.1] transition-all rotate-12 group-hover:scale-125 duration-1000 pointer-events-none">
                        <span className="material-symbols-outlined text-[320px]">stadium</span>
                    </div>
                    
                    <div className="flex flex-col items-center text-center md:items-start md:text-left z-10 max-w-lg">
                        <div className="w-24 h-24 rounded-[2rem] bg-premium-gold/10 flex items-center justify-center mb-10 border border-premium-gold/20 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            <span className="material-symbols-outlined text-premium-gold text-6xl font-black">sports_football</span>
                        </div>
                        <h3 className="text-5xl md:text-6xl font-display font-black text-white uppercase italic mb-4 tracking-tighter leading-[0.85]">
                            LA ARENA <br/><span className="text-premium-gold drop-shadow-[0_0_20px_rgba(245,159,10,0.3)]">DE LA GLORIA</span>
                        </h3>
                        <p className="text-slate-400 text-base md:text-lg font-medium leading-relaxed max-w-sm">
                            ¿Listo para el saque inicial? Controla turnos, bajas y puntuaciones en tiempo real con el asistente táctico definitivo de Nuffle.
                        </p>
                    </div>

                    <div className="z-10 w-full md:w-auto flex flex-col gap-6 items-center">
                         <button className="w-full md:w-auto bg-premium-gold hover:bg-white text-black font-display font-black py-6 px-16 rounded-[2.5rem] uppercase text-2xl shadow-[0_25px_50px_rgba(245,159,10,0.4)] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-5 group/btn-arena">
                            <span className="material-symbols-outlined text-3xl font-black group-hover/btn-arena:rotate-12 transition-transform">play_circle</span>
                            {t('home.cards.arena.btn') || 'Iniciar Partido'}
                        </button>
                        <p className="text-xs font-display font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3">
                            <span className="w-8 h-px bg-white/10"></span>
                            O continúa tu <span className="text-premium-gold animate-pulse italic">partido guardado</span>
                            <span className="w-8 h-px bg-white/10"></span>
                        </p>
                    </div>
                </section>
            </div>

            {/* Global Statistics Section */}
            <footer className="pt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-12 pb-16">
                <div className="flex flex-wrap justify-center gap-14 md:gap-24 relative">
                    <div className="absolute inset-0 bg-white/5 blur-[100px] rounded-full -z-10"></div>
                    
                    <div className="text-center md:text-left space-y-2 group">
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em] group-hover:text-slate-300 transition-colors uppercase">{t('home.stats.totalMatches') || 'Partidos Totales'}</p>
                        <p className="text-5xl font-display font-black text-white italic tracking-tighter group-hover:scale-110 transition-transform origin-left">{stats.totalMatches}</p>
                    </div>
                    <div className="text-center md:text-left space-y-2 group">
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em] group-hover:text-premium-gold/60 transition-colors uppercase">{t('home.stats.wins') || 'Victorias'}</p>
                        <p className="text-5xl font-display font-black text-premium-gold italic tracking-tighter group-hover:scale-110 transition-transform origin-left drop-shadow-[0_0_15px_rgba(245,159,10,0.2)]">{stats.wins}</p>
                    </div>
                    <div className="text-center md:text-left space-y-2 group">
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em] group-hover:text-blood-red/60 transition-colors uppercase">{t('home.stats.casualties') || 'Bajas Causadas'}</p>
                        <p className="text-5xl font-display font-black text-blood-red italic tracking-tighter group-hover:scale-110 transition-transform origin-left drop-shadow-[0_0_15px_rgba(220,38,38,0.2)]">{stats.casualties}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-10 bg-black/60 p-5 px-10 rounded-[2rem] border border-white/10 shadow-2xl backdrop-blur-xl">
                    <button className="text-slate-500 hover:text-white transition-all flex items-center gap-3 group relative">
                        <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform duration-500">settings</span>
                        <span className="text-[10px] font-display font-black uppercase tracking-widest hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity">Ajustes</span>
                    </button>
                    <div className="w-px h-6 bg-white/10"></div>
                    <button className="text-slate-500 hover:text-sky-400 transition-all flex items-center gap-3 group relative">
                        <span className="material-symbols-outlined text-xl">help_center</span>
                        <span className="text-[10px] font-display font-black uppercase tracking-widest hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity">Soporte</span>
                    </button>
                    <div className="w-px h-6 bg-white/10"></div>
                    <button className="text-blood-red/60 hover:text-blood-red transition-all flex items-center gap-3 group">
                        <span className="material-symbols-outlined text-xl">logout</span>
                        <span className="text-[10px] font-display font-black uppercase tracking-widest hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity">Salir</span>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default Home;
