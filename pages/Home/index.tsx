import React, { useState, useMemo } from 'react';
import type { ManagedTeam, League as Competition, GameEvent } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface HomeProps {
    onNavigate: (view: any, payload?: string) => void;
    onCreateTeam?: () => void;
    managedTeams: ManagedTeam[];
    competitions: Competition[];
    recentEvents: GameEvent[];
    heroImage?: string | null;
}

const Home: React.FC<HomeProps> = ({ onNavigate, onCreateTeam, managedTeams, heroImage }) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = () => {
        if (searchTerm.trim()) {
            onNavigate('oracle', searchTerm.trim());
        }
    };

    const latestTeams = useMemo(() => {
        return [...managedTeams].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, 3);
    }, [managedTeams]);

    return (
        <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-3xl bg-zinc-900/50 border border-white/5 shadow-2xl group">
                <div
                    className="absolute inset-0 opacity-15 grayscale hover:grayscale-0 transition-all duration-1000 pointer-events-none"
                    style={{
                        backgroundImage: `linear-gradient(to right, #000 30%, transparent), url('${heroImage || 'https://images.unsplash.com/photo-1551817311-d7734187f543?q=80&w=2070&auto=format&fit=crop'}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                ></div>

                <div className="relative p-8 md:p-16 flex flex-col items-start gap-8 max-w-3xl">
                    <div className="space-y-3">
                        <h2 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase italic">
                            {t('home.welcome')}<br />
                            <span className="text-premium-gold drop-shadow-[0_0_15px_rgba(202,138,4,0.3)]">{t('home.coach')}</span>
                        </h2>
                        <p className="text-slate-400 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                            {t('home.hero.subtitle')}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={onCreateTeam || (() => onNavigate('guild'))}
                            className="bg-premium-gold hover:bg-white hover:scale-105 text-black font-black px-10 py-4 rounded-xl flex items-center gap-3 transition-all active:scale-95 uppercase tracking-tighter text-sm shadow-[0_10px_30px_rgba(202,138,4,0.2)]"
                        >
                            <span className="material-symbols-outlined font-bold">add_circle</span>
                            {t('home.hero.newRoster')}
                        </button>
                        <button
                            onClick={() => onNavigate('arena')}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-10 py-4 rounded-xl flex items-center gap-3 transition-all active:scale-95 uppercase tracking-tighter text-sm backdrop-blur-md"
                        >
                            <span className="material-symbols-outlined font-bold">history_edu</span>
                            {t('home.hero.matchReports')}
                        </button>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-8 right-8 w-24 h-24 border-t-2 border-r-2 border-premium-gold/20 rounded-tr-3xl"></div>
                <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-white/10 rounded-bl-2xl"></div>
            </section>

            {/* Main Access Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Oracle Card */}
                <div className="group bg-zinc-900/40 border border-white/5 p-8 rounded-2xl hover:bg-zinc-800/60 transition-all flex flex-col justify-between h-full hover:border-premium-gold/30 hover:shadow-2xl hover:shadow-premium-gold/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-premium-gold/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div>
                        <div className="w-16 h-16 bg-premium-gold/10 rounded-2xl flex items-center justify-center mb-8 text-premium-gold group-hover:scale-110 transition-transform border border-premium-gold/20 shadow-inner">
                            <span className="material-symbols-outlined text-4xl font-bold">menu_book</span>
                        </div>
                        <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight italic leading-none">{t('home.cards.oracle.title')}</h3>
                        <p className="text-slate-400 text-sm mb-10 leading-relaxed font-medium">
                            {t('home.cards.oracle.desc')}
                        </p>
                    </div>
                    <button
                        onClick={() => onNavigate('oracle')}
                        className="w-full py-4 border border-premium-gold/50 text-premium-gold font-black rounded-xl hover:bg-premium-gold hover:text-black transition-all uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-black/20"
                    >
                        {t('home.cards.oracle.btn')}
                    </button>
                </div>

                {/* Guild Card */}
                <div className="group bg-zinc-900/40 border border-white/5 p-8 rounded-2xl hover:bg-zinc-800/60 transition-all flex flex-col justify-between h-full hover:border-premium-gold/30 hover:shadow-2xl hover:shadow-premium-gold/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-premium-gold/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div>
                        <div className="w-16 h-16 bg-premium-gold/10 rounded-2xl flex items-center justify-center mb-8 text-premium-gold group-hover:scale-110 transition-transform border border-premium-gold/20 shadow-inner">
                            <span className="material-symbols-outlined text-4xl font-bold">shield</span>
                        </div>
                        <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight italic leading-none">{t('home.cards.guild.title')}</h3>
                        <p className="text-slate-400 text-sm mb-10 leading-relaxed font-medium">
                            {t('home.cards.guild.desc')}
                        </p>
                    </div>
                    <button
                        onClick={() => onNavigate('guild')}
                        className="w-full py-4 border border-premium-gold/50 text-premium-gold font-black rounded-xl hover:bg-premium-gold hover:text-black transition-all uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-black/20"
                    >
                        {t('home.cards.guild.btn')}
                    </button>
                </div>

                {/* Arena Card */}
                <div className="group bg-zinc-900/40 border border-white/5 p-8 rounded-2xl hover:bg-zinc-800/60 transition-all flex flex-col justify-between h-full hover:border-premium-gold/30 hover:shadow-2xl hover:shadow-premium-gold/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-premium-gold/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div>
                        <div className="w-16 h-16 bg-premium-gold/10 rounded-2xl flex items-center justify-center mb-8 text-premium-gold group-hover:scale-110 transition-transform border border-premium-gold/20 shadow-inner">
                            <span className="material-symbols-outlined text-4xl font-bold">sports_score</span>
                        </div>
                        <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight italic leading-none">{t('home.cards.arena.title')}</h3>
                        <p className="text-slate-400 text-sm mb-10 leading-relaxed font-medium">
                            {t('home.cards.arena.desc')}
                        </p>
                    </div>
                    <button
                        onClick={() => onNavigate('arena')}
                        className="w-full py-4 border border-premium-gold/50 text-premium-gold font-black rounded-xl hover:bg-premium-gold hover:text-black transition-all uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-black/20"
                    >
                        {t('home.cards.arena.btn')}
                    </button>
                </div>
            </section>

            {/* Secondary Row */}
            <section className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                {/* Active Teams */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3 italic">
                            <span className="material-symbols-outlined text-premium-gold">groups</span>
                            {t('home.activeTeams.title')}
                        </h3>
                        <button
                            onClick={() => onNavigate('guild')}
                            className="text-[10px] font-black text-slate-500 hover:text-premium-gold uppercase tracking-[0.2em] transition-colors"
                        >
                            {t('home.activeTeams.viewAll')}
                        </button>
                    </div>

                    <div className="bg-zinc-900/40 border border-white/5 rounded-3xl divide-y divide-white/5 overflow-hidden shadow-xl">
                        {latestTeams.length > 0 ? latestTeams.map(team => (
                            <div
                                key={team.id}
                                onClick={() => onNavigate('guild')}
                                className="p-6 flex items-center justify-between hover:bg-white/[0.03] transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-xl bg-black/40 flex items-center justify-center border border-white/5 group-hover:border-premium-gold/30 transition-all overflow-hidden relative shadow-inner">
                                        {team.crestImage ? (
                                            <img src={team.crestImage} alt={team.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <span className="text-premium-gold font-black text-xl italic">{team.name.substring(0, 2).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-base font-black text-white group-hover:text-premium-gold transition-colors">{team.name}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{team.rosterName} • TV {team.totalTV / 1000}k</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-mono font-black text-premium-gold italic leading-none">
                                        {team.record?.wins || 0} - {team.record?.draws || 0} - {team.record?.losses || 0}
                                    </p>
                                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] mt-1">W - D - L</p>
                                </div>
                            </div>
                        )) : (
                            <div className="p-12 text-center text-slate-600 italic font-medium uppercase tracking-widest text-xs opacity-50">
                                No hay equipos activos todavía
                            </div>
                        )}
                    </div>
                </div>

                {/* Search Area */}
                <div className="lg:col-span-3 space-y-6">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3 italic px-2">
                        <span className="material-symbols-outlined text-premium-gold">search</span>
                        {t('home.search.title')}
                    </h3>
                    <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-10 flex flex-col gap-8 shadow-xl relative overflow-hidden group">
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-premium-gold/5 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000"></div>

                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-premium-gold transition-colors font-bold">search</span>
                            <input
                                className="w-full bg-black/60 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white focus:ring-2 focus:ring-premium-gold/50 focus:border-transparent outline-none transition-all placeholder:text-slate-600 text-lg shadow-inner"
                                placeholder={t('home.search.frequent')}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>

                        <div className="space-y-5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-display">{t('home.search.frequent')}</p>
                            <div className="flex flex-wrap gap-2">
                                {['Golpe Mortífero', 'Interferencia', 'Esquivar', 'Forcejeo', 'Reglas 2024'].map(tag => (
                                    <span
                                        key={tag}
                                        onClick={() => onNavigate('oracle', tag)}
                                        className="px-5 py-2 bg-white/5 border border-white/10 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-full cursor-pointer hover:bg-premium-gold/10 hover:border-premium-gold/30 hover:text-premium-gold transition-all"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
