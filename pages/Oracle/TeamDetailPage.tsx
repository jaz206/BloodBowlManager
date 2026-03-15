import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Team, StarPlayer, Skill } from '../../types';
import RadarChart from '../../components/oracle/RadarChart';
import RadarChartModal from '../../components/oracle/RadarChartModal';
import SkillBadge from '../../components/shared/SkillBadge';
import SkillModal from '../../components/oracle/SkillModal';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMasterData } from '../../hooks/useMasterData';

interface TeamDetailPageProps {
    team: Team;
    onBack: () => void;
    onRequestTeamCreation?: (name: string) => void;
}

const LEAGUE_MAP: Record<string, string> = {
    "Superliga Lustria": "Lustrian Superleague",
    "Pelea de Badlands": "Badlands Brawl",
    "Clásico del Viejo Mundo": "Old World Classic",
    "Superliga del Borde del Mundo": "Worlds Edge Superleague",
    "Favorito de...": "Favoured of",
    "Copa Halfling Thimble": "Halfling Thimble Cup",
    "Liga de los Reinos Élficos": "Elven Kingdoms League",
    "Desafío del Inframundo": "Underworld Challenge",
    "Foco de Sylvana": "Sylvanian Spotlight",
    "Liga de Woodland": "Woodland League",
    "Choque del Caos": "Chaos Clash",
    "Favorito de Hashut": "Favoured of Hashut",
    "Favorito de Khorne": "Favoured of Khorne",
    "Favorito de Nurgle": "Favoured of Nurgle",
    "Favorito de Slaanesh": "Favoured of Slaanesh",
    "Favorito de Tzeentch": "Favoured of Tzeentch",
    "Copa de la Jungla": "Jungle Cup"
};

const TeamDetailPage: React.FC<TeamDetailPageProps> = ({ team, onBack, onRequestTeamCreation }) => {
    const { language } = useLanguage();
    const { starPlayers, loading: loadingStars } = useMasterData();
    const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [isFullscreenImage, setIsFullscreenImage] = useState(false);
    const [activeTab, setActiveTab] = useState<'roster' | 'stars' | 'rules'>('roster');

    const currentSpecialRulesStr = language === 'es' ? (team.specialRules_es || team.specialRules) : (team.specialRules_en || team.specialRules);
    
    // Parse special rules into a list
    const specialRulesList = useMemo(() => {
        if (!currentSpecialRulesStr) return [];
        return currentSpecialRulesStr.split(',').map(s => s.trim());
    }, [currentSpecialRulesStr]);

    // Calculate eligible star players
    const eligibleStars = useMemo(() => {
        if (!starPlayers || !specialRulesList.length) return [];
        
        return starPlayers.filter(star => {
            // "Any Team" always eligible
            if (star.playsFor.includes("Any Team")) return true;
            
            // Match against team name
            if (star.playsFor.includes(team.name)) return true;

            // Match against mapped superleagues
            return specialRulesList.some(rule => {
                const englishLeague = LEAGUE_MAP[rule];
                if (!englishLeague) return false;
                
                // Partial match for "Favoured of"
                if (englishLeague === "Favoured of") {
                    return star.playsFor.some(p => p.startsWith("Favoured of"));
                }
                
                return star.playsFor.includes(englishLeague);
            });
        }).sort((a, b) => a.cost - b.cost);
    }, [starPlayers, specialRulesList, team.name]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen bg-background-dark text-slate-100 font-display p-4 md:p-0"
        >
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-accent-gold text-xs font-bold uppercase tracking-widest mb-8">
                <button onClick={onBack} className="hover:text-primary transition-colors">Enciclopedia</button>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-slate-100 italic">{team.name}</span>
            </nav>

            {/* Hero Section */}
            <section className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                <div
                    onClick={() => team.image && setIsFullscreenImage(true)}
                    className="w-full md:w-[450px] aspect-video bg-surface-dark rounded-3xl border-2 border-primary/20 flex items-center justify-center relative overflow-hidden group shadow-[0_20px_60px_rgba(0,0,0,0.5)] cursor-pointer shrink-0"
                >
                    {team.image ? (
                        <img src={team.image} alt={team.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                        <span className="material-symbols-outlined text-primary text-8xl relative z-10 opacity-30">landscape</span>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

                    {team.image && (
                        <div className="absolute inset-0 z-20 bg-primary/0 group-hover:bg-primary/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="bg-black/40 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-2xl">zoom_in</span>
                                <span className="text-xs font-black uppercase tracking-widest">Ver Completa</span>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex-1 space-y-6 pt-4 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <span className="px-3 py-1.5 bg-primary text-black font-black text-xs rounded uppercase tracking-tighter shadow-lg shadow-primary/20">Tier {team.tier}</span>
                        <h1 className="text-4xl md:text-7xl font-black text-slate-100 tracking-tighter uppercase italic drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                            {team.name}
                        </h1>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        {specialRulesList.map((rule, idx) => (
                            <span key={idx} className="px-3 py-1 bg-surface-dark border border-primary/30 text-accent-gold text-[10px] font-black uppercase tracking-widest rounded-full">
                                {rule}
                            </span>
                        ))}
                    </div>
                    <p className="text-slate-400 text-sm max-w-2xl leading-relaxed italic border-l-2 border-primary/40 pl-6 mx-auto md:mx-0">
                        {language === 'es' 
                            ? "Esta facción legendaria destaca por su enfoque estratégico y habilidades únicas en el campo de batalla de Blood Bowl."
                            : "This legendary faction is known for its strategic approach and unique skills on the Blood Bowl battlefield."}
                    </p>
                    <div className="flex justify-center md:justify-start gap-8 pt-2">
                        <div className="flex flex-col border-l-2 border-primary pl-4 bg-primary/5 pr-6 py-2 rounded-r-xl">
                            <span className="text-[10px] text-accent-gold uppercase font-black tracking-widest leading-none mb-1 opacity-70">Estilo</span>
                            <span className="text-slate-100 font-bold italic text-sm">
                                {team.tier === 1 ? 'Competitivo' : team.tier === 2 ? 'Equilibrado' : 'Desafío'}
                            </span>
                        </div>
                        <div className="flex flex-col border-l-2 border-primary pl-4 bg-primary/5 pr-6 py-2 rounded-r-xl">
                            <span className="text-[10px] text-accent-gold uppercase font-black tracking-widest leading-none mb-1 opacity-70">Dificultad</span>
                            <span className="text-slate-100 font-bold italic text-sm">
                                {team.tier === 1 ? 'Media' : team.tier === 2 ? 'Alta' : 'Extrema'}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Stats & Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-surface-dark rounded-2xl border border-white/5 p-8 flex flex-col items-center shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                        <h3 className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] mb-8 text-center italic">Atributos Promedio</h3>

                        <div className="relative w-full aspect-square max-w-[280px] mb-8 cursor-pointer hover:scale-105 transition-all duration-700 bg-black/40 rounded-full border border-white/5 p-8 shadow-inner" onClick={() => setIsRadarModalOpen(true)}>
                            <div className="relative z-10 flex justify-center items-center h-full">
                                <RadarChart ratings={[{ data: team.ratings, color: '#f59f0a' }]} size={200} />
                            </div>
                        </div>

                        <div className="w-full space-y-4 pt-8 border-t border-white/5">
                            {[
                                { label: 'Movimiento (MA)', val: team.ratings.velocidad },
                                { label: 'Fuerza (ST)', val: team.ratings.fuerza },
                                { label: 'Agilidad (AG)', val: team.ratings.agilidad + '+' },
                                { label: 'Pase (PA)', val: team.ratings.pase + '+' },
                                { label: 'Armadura (AV)', val: team.ratings.armadura + '+' }
                            ].map((stat, i) => (
                                <div key={i} className="flex justify-between items-center text-sm group/stat">
                                    <span className="text-slate-400 font-black uppercase tracking-wider text-[10px] italic group-hover/stat:text-primary transition-colors">{stat.label}</span>
                                    <span className="text-white font-black font-display text-lg italic">{stat.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-surface-dark rounded-2xl border border-white/5 p-8 space-y-8 shadow-2xl relative overflow-hidden">
                        <h3 className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] border-b border-white/5 pb-4 italic">Costes de Equipo</h3>
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            {[
                                { label: 'Reroll (RR)', value: team.rerollCost.toLocaleString('es-ES'), highlight: true },
                                { label: 'Apoticario', value: team.apothecary },
                                { label: 'Sobornos', value: '100k' },
                                { label: 'Asistentes', value: '10k' }
                            ].map((cost, idx) => (
                                <div key={idx} className="p-4 bg-background-dark/80 rounded-xl border border-white/5 flex flex-col justify-center group/cost hover:border-primary/30 transition-all">
                                    <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1 group-hover/cost:text-accent-gold transition-colors">{cost.label}</p>
                                    <p className={`text-xl font-black italic tracking-tighter ${cost.highlight ? 'text-primary' : 'text-slate-100'}`}>{cost.value}</p>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => onRequestTeamCreation?.(team.name)}
                            className="w-full py-5 bg-gradient-to-r from-primary to-accent-gold hover:from-white hover:to-white text-black font-black uppercase tracking-[0.2em] text-xs italic rounded-2xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-[0_15px_40px_rgba(245,159,10,0.3)]"
                        >
                            {language === 'es' ? 'Crear este Equipo' : 'Create this Team'}
                        </button>
                    </div>
                </div>

                {/* Main Content Area with Tabs */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Tabs Navigation */}
                    <div className="flex gap-2 p-1 bg-surface-dark/50 rounded-2xl border border-white/5 mb-6 sticky top-4 z-30 backdrop-blur-md">
                        {[
                            { id: 'roster', label: language === 'es' ? 'Roster' : 'Roster', icon: 'groups' },
                            { id: 'stars', label: language === 'es' ? 'Estrellas' : 'Star Players', icon: 'star', count: eligibleStars.length },
                            { id: 'rules', label: language === 'es' ? 'Reglas' : 'Rules', icon: 'gavel' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                    activeTab === tab.id 
                                        ? 'bg-primary text-black shadow-lg shadow-primary/20' 
                                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                                }`}
                            >
                                <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                                {tab.label}
                                {tab.count !== undefined && <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[8px] ${activeTab === tab.id ? 'bg-black/20' : 'bg-primary/20 text-primary'}`}>{tab.count}</span>}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'roster' && (
                            <motion.div
                                key="roster"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-surface-dark rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl"
                            >
                                <div className="px-10 py-8 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                                    <div>
                                        <h3 className="text-slate-100 font-black uppercase tracking-[0.3em] text-xs italic">Posicionales del Equipo</h3>
                                        <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-1">Estadísticas Oficiales S3 (BB2025)</p>
                                    </div>
                                    <span className="material-symbols-outlined text-primary opacity-20 text-4xl">shield</span>
                                </div>
                                <div className="overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-left border-collapse min-w-[700px]">
                                        <thead>
                                            <tr className="text-slate-500 text-[10px] uppercase tracking-[0.3em]">
                                                <th className="py-6 px-10 font-black">Posición</th>
                                                <th className="py-6 px-2 font-black text-center">MA</th>
                                                <th className="py-6 px-2 font-black text-center">FU</th>
                                                <th className="py-6 px-2 font-black text-center">AG</th>
                                                <th className="py-6 px-2 font-black text-center">PA</th>
                                                <th className="py-6 px-2 font-black text-center">AR</th>
                                                <th className="py-6 px-10 font-black">Habilidades</th>
                                                <th className="py-6 px-10 font-black text-right">Coste</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {team.roster.map((player, idx) => (
                                                <tr key={idx} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors group">
                                                    <td className="py-6 px-10">
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-slate-100 uppercase tracking-tighter italic text-lg group-hover:text-primary transition-colors">{player.position}</span>
                                                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{player.qty} x equipo</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-2 text-center text-slate-400 font-display font-bold text-lg">{player.stats.MV}</td>
                                                    <td className="py-6 px-2 text-center text-slate-100 font-display font-black text-lg italic">{player.stats.FU}</td>
                                                    <td className="py-6 px-2 text-center text-slate-400 font-mono italic">{player.stats.AG}</td>
                                                    <td className="py-6 px-2 text-center text-slate-400 font-mono italic">{player.stats.PA}</td>
                                                    <td className="py-6 px-2 text-center text-slate-400 font-mono italic">{player.stats.AR}</td>
                                                    <td className="py-6 px-10">
                                                        <div className="flex flex-wrap gap-2">
                                                            {(player.skillKeys || []).map(skillKey => (
                                                                <SkillBadge
                                                                    key={skillKey}
                                                                    skillKey={skillKey}
                                                                    onClick={setSelectedSkill}
                                                                />
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-10 text-right">
                                                        <span className="font-display font-black text-xl italic text-premium-gold">{player.cost.toLocaleString('es-ES')}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'stars' && (
                            <motion.div
                                key="stars"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {loadingStars ? (
                                        <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 text-slate-500">
                                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                            <p className="text-xs font-black uppercase tracking-widest">Buscando Jugadores Estrella...</p>
                                        </div>
                                    ) : eligibleStars.length > 0 ? (
                                        eligibleStars.map((star, idx) => (
                                            <div key={idx} className="bg-surface-dark border border-white/5 rounded-2xl p-6 hover:border-primary/40 transition-all group flex gap-4 shadow-xl">
                                                <div className="w-20 h-20 rounded-xl bg-background-dark border border-white/10 shrink-0 overflow-hidden relative">
                                                    {star.image ? (
                                                        <img src={star.image} alt={star.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                    ) : (
                                                        <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-primary/20 text-3xl">person</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="font-black text-slate-100 uppercase tracking-tighter italic truncate group-hover:text-primary transition-colors">{star.name}</h4>
                                                        <span className="text-accent-gold font-black text-xs italic shrink-0">{star.cost.toLocaleString('es-ES')}</span>
                                                    </div>
                                                    <div className="flex gap-2 text-[10px] text-slate-500 font-bold uppercase mb-3">
                                                        <span>MV:{star.stats?.MV}</span>
                                                        <span>FU:{star.stats?.FU}</span>
                                                        <span>AG:{star.stats?.AG}</span>
                                                        <span>AR:{star.stats?.AR}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {(star.skillKeys || []).slice(0, 3).map(sk => (
                                                            <span key={sk} className="px-1.5 py-0.5 bg-white/5 text-[8px] text-slate-300 rounded uppercase font-bold">{sk}</span>
                                                        ))}
                                                        {(star.skillKeys?.length || 0) > 3 && (
                                                            <span className="px-1.5 py-0.5 bg-white/5 text-[8px] text-slate-500 rounded uppercase font-bold">+{(star.skillKeys?.length || 0) - 3}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-20 bg-surface-dark/30 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-slate-500">
                                            <span className="material-symbols-outlined text-4xl mb-2 opacity-20">sentiment_dissatisfied</span>
                                            <p className="text-xs font-black uppercase tracking-widest italic">No se encontraron Estrellas elegibles</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'rules' && (
                            <motion.div
                                key="rules"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="bg-surface-dark rounded-2xl border border-primary/20 p-8 shadow-inner">
                                    <h3 className="text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">gavel</span>
                                        Reglas Especiales de la Facción
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
                                        {specialRulesList.map((rule, idx) => (
                                            <div key={idx} className="p-6 bg-background-dark/40 rounded-xl border-l-4 border-primary group hover:bg-background-dark transition-all">
                                                <h4 className="text-slate-100 font-black text-xs uppercase mb-2 tracking-widest italic group-hover:text-primary transition-colors">{rule}</h4>
                                                <p className="text-xs text-slate-400 font-medium italic">
                                                    {rule === "Gestión de Equipo" ? "Permite el acceso a personal de apoyo estándar y gestión de tesorería avanzada." :
                                                     rule.includes("Superliga") ? "Este equipo compite en una liga de élite con acceso a Jugadores Estrella específicos." :
                                                     rule.includes("Favorito de") ? "El equipo cuenta con la bendición de un dios del Caos, permitiendo mutaciones." :
                                                     "Regla reglamentaria de la Tercera Temporada de Blood Bowl (Edición 2025)."}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-surface-dark/50 rounded-2xl border border-white/5 p-8">
                                    <h3 className="text-accent-gold font-black uppercase tracking-[0.2em] text-[10px] mb-4">Notas de la Tercera Temporada</h3>
                                    <p className="text-xs text-slate-400 leading-loose italic">
                                        Todos los rosters han sido actualizados según los cambios de costes y estadísticas de la Temporada 3. Los Jugadores Estrella ahora tienen sus habilidades actualizadas y reglas especiales de "Once per Game" integradas en sus perfiles.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-16 flex justify-between items-center border-t border-primary/20 pt-10 pb-20">
                <button
                    onClick={onBack}
                    className="flex items-center gap-3 text-accent-gold hover:text-primary transition-all font-black uppercase tracking-[0.2em] text-[10px] group italic"
                >
                    <span className="material-symbols-outlined font-bold group-hover:-translate-x-2 transition-transform">arrow_back</span>
                    {language === 'es' ? 'Volver a la Enciclopedia' : 'Back to Oracle'}
                </button>
                <div className="flex gap-4">
                    <button className="h-12 w-12 flex items-center justify-center rounded-xl bg-surface-dark text-accent-gold hover:text-primary transition-all border border-primary/10 hover:border-primary/40 group shadow-lg">
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">share</span>
                    </button>
                    <button className="h-12 w-12 flex items-center justify-center rounded-xl bg-surface-dark text-accent-gold hover:text-primary transition-all border border-primary/10 hover:border-primary/40 group shadow-lg">
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">bookmark</span>
                    </button>
                </div>
            </div>

            {isRadarModalOpen && <RadarChartModal team={team} onClose={() => setIsRadarModalOpen(false)} />}
            {selectedSkill && <SkillModal skill={selectedSkill} onClose={() => setSelectedSkill(null)} />}
            
            <AnimatePresence>
                {isFullscreenImage && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsFullscreenImage(false)}
                        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
                    >
                        <img src={team.image} alt={team.name} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
                        <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-5xl">close</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default TeamDetailPage;

