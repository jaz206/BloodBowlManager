import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Team, StarPlayer, Skill } from '../../types';
import RadarChart from '../../components/oracle/RadarChart';
import RadarChartModal from '../../components/oracle/RadarChartModal';
import SkillBadge from '../../components/shared/SkillBadge';
import SkillModal from '../../components/oracle/SkillModal';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTeamLogoUrl } from '../../utils/imageUtils';
import { getStarPlayerImageUrl } from '../../utils/imageUtils';
import { useMasterData } from '../../hooks/useMasterData';
import StatValue from '../../components/oracle/StatValue';
import { teamsData as staticTeamsData } from '../../data/teams';
import { mergeTeamWithFallback } from '../../utils/teamData';

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
    const { starPlayers, teams: masterTeams, loading: loadingStars } = useMasterData();
    const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [isFullscreenImage, setIsFullscreenImage] = useState(false);
    const [activeTab, setActiveTab] = useState<'roster' | 'stars' | 'rules'>('roster');

    const staticTeam = staticTeamsData.find(t => t.name === team.name);
    const masterTeam = masterTeams.find(t => t.name === team.name);
    const mergedTeam = mergeTeamWithFallback(team as any, (masterTeam || staticTeam) as any);
    const heroImage = mergedTeam.crestImage || mergedTeam.image || getTeamLogoUrl(team.name);

    const currentSpecialRulesStr = language === 'es'
        ? (mergedTeam.specialRules_es || mergedTeam.specialRules)
        : (mergedTeam.specialRules_en || mergedTeam.specialRules);
    
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

    const starPreview = useMemo(() => eligibleStars.slice(0, 4), [eligibleStars]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,248,231,0.96),rgba(239,214,162,0.88)_36%,rgba(214,184,126,0.6)_100%)] text-[#2b1d12] font-display p-4 md:p-0"
        >
            {/* Breadcrumbs */}
            <div className="flex gap-2 p-1 blood-ui-light-card rounded-2xl mb-6 border border-[rgba(111,87,56,0.12)] bg-[rgba(255,251,241,0.9)] shadow-[0_12px_30px_rgba(92,68,39,0.1)]">
                <button onClick={onBack} className="inline-flex items-center gap-3 rounded-2xl border border-[rgba(202,138,4,0.24)] bg-[rgba(202,138,4,0.12)] px-5 py-3 text-[#2b1d12] text-[10px] uppercase italic tracking-[0.22em] font-black shadow-[0_14px_28px_rgba(202,138,4,0.10)] hover:-translate-y-0.5 hover:border-[rgba(202,138,4,0.36)] hover:bg-[rgba(202,138,4,0.18)] transition-all">
                    <span className="material-symbols-outlined text-[#ca8a04] text-sm">arrow_back</span>
                    Volver
                </button>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-[#2b1d12] italic font-black">{team.name}</span>
            </div>

            {/* Hero Section */}
            <section className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                <div
                    onClick={() => setIsFullscreenImage(true)}
                    className="w-full md:w-[450px] aspect-video rounded-[2rem] border border-[rgba(111,87,56,0.12)] bg-[rgba(255,251,241,0.88)] flex items-center justify-center relative overflow-hidden group shadow-[0_20px_60px_rgba(92,68,39,0.12)] cursor-pointer shrink-0"
                >
                    <img
                        src={heroImage}
                        alt={team.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                            const img = e.currentTarget;
                            const fallback = getTeamLogoUrl(team.name);
                            if (img.src !== fallback) img.src = fallback;
                        }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(43,29,18,0.72)] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

                    {heroImage && (
                        <div className="absolute inset-0 z-20 bg-transparent group-hover:bg-[rgba(255,248,231,0.08)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="bg-[rgba(43,29,18,0.86)] backdrop-blur-md border border-[rgba(202,138,4,0.25)] px-6 py-3 rounded-full flex items-center gap-3 shadow-[0_14px_30px_rgba(43,29,18,0.24)]">
                                <span className="material-symbols-outlined text-[#f59f0a] text-2xl">zoom_in</span>
                                <span className="text-xs font-black uppercase tracking-widest text-[#fff6e6]">Ver completa</span>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex-1 space-y-6 pt-4 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                <span className="px-3 py-1.5 bg-primary text-black font-black text-xs rounded uppercase tracking-tighter shadow-lg shadow-primary/20">Tier {mergedTeam.tier}</span>
                        <h1 className="text-4xl md:text-7xl font-black text-[#2b1d12] tracking-tighter uppercase italic drop-shadow-[0_10px_30px_rgba(92,68,39,0.16)]">
                            {mergedTeam.name}
                        </h1>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        {specialRulesList.map((rule, idx) => (
                            <span key={idx} className="px-3 py-1 bg-[rgba(255,251,241,0.88)] border border-[rgba(202,138,4,0.22)] text-[#7b6853] text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_6px_18px_rgba(92,68,39,0.08)]">
                                {rule}
                            </span>
                        ))}
                    </div>
                    <p className="text-[#6f5738] text-sm max-w-2xl leading-relaxed italic border-l-2 border-[#ca8a04]/50 pl-6 mx-auto md:mx-0">
                        {language === 'es' 
                             ? "Esta facción legendaria destaca por su enfoque estratégico y habilidades únicas en el campo de batalla de Blood Bowl."
                            : "This legendary faction is known for its strategic approach and unique skills on the Blood Bowl battlefield."}
                    </p>
                    <div className="flex justify-center md:justify-start gap-8 pt-2">
                        <div className="flex flex-col border-l-2 border-[#ca8a04] pl-4 bg-[rgba(255,251,241,0.84)] pr-6 py-2 rounded-r-xl shadow-[0_8px_22px_rgba(92,68,39,0.08)]">
                            <span className="text-[10px] text-accent-gold uppercase font-black tracking-widest leading-none mb-1 opacity-70">Estilo</span>
                            <span className="text-[#2b1d12] font-black text-sm">
                                  {mergedTeam.tier === 1 ? 'Competitivo' : mergedTeam.tier === 2 ? 'Equilibrado' : 'Desafío'}
                            </span>
                        </div>
                        <div className="flex flex-col border-l-2 border-[#ca8a04] pl-4 bg-[rgba(255,251,241,0.84)] pr-6 py-2 rounded-r-xl shadow-[0_8px_22px_rgba(92,68,39,0.08)]">
                            <span className="text-[10px] text-accent-gold uppercase font-black tracking-widest leading-none mb-1 opacity-70">Dificultad</span>
                            <span className="text-[#2b1d12] font-black text-sm">
                                 {mergedTeam.tier === 1 ? 'Media' : mergedTeam.tier === 2 ? 'Alta' : 'Extrema'}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mb-12 blood-ui-light-card rounded-[2rem] p-6 md:p-8 shadow-[0_24px_70px_rgba(92,68,39,0.12)]">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div>
                        <p className="blood-ui-light-meta text-[9px] uppercase tracking-[0.35em] font-black">Vista de estrellas</p>
                        <h2 className="blood-ui-light-title text-3xl uppercase italic mt-2">Jugadores estrella elegibles</h2>
                        <p className="blood-ui-light-body text-sm mt-3 max-w-2xl">
                             Aquí ves de un vistazo qué leyendas, mercenarios o piezas míticas pueden vestir esta franquicia según sus reglas especiales.
                        </p>
                    </div>
                    <button
                        onClick={() => setActiveTab('stars')}
                        className="blood-ui-button-primary px-6 py-3 rounded-2xl text-[10px] w-full lg:w-auto"
                    >
                         Ver catálogo completo ({eligibleStars.length})
                    </button>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {starPreview.length > 0 ? starPreview.map((star) => (
                        <button
                            key={star.name}
                            onClick={() => setActiveTab('stars')}
                            className="text-left rounded-[1.4rem] border border-[rgba(111,87,56,0.12)] bg-[rgba(255,251,241,0.72)] p-4 hover:border-[rgba(202,138,4,0.3)] hover:shadow-[0_10px_30px_rgba(92,68,39,0.12)] transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="size-14 rounded-2xl overflow-hidden border border-[rgba(111,87,56,0.12)] bg-[rgba(255,255,255,0.45)] shrink-0">
                                    <img
                                        src={getStarPlayerImageUrl(star.name)}
                                        alt={star.name}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            const img = e.target as HTMLImageElement;
                                            if (star.image && img.src !== star.image) {
                                                img.src = star.image;
                                            } else {
                                                img.src = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop';
                                            }
                                        }}
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[8px] uppercase tracking-[0.32em] text-[#7b6853] font-black">Disponible</p>
                                    <h3 className="blood-ui-light-title text-lg uppercase italic truncate mt-1">{star.name}</h3>
                                    <p className="text-[10px] text-[#7b6853] uppercase tracking-[0.28em] font-black mt-1 truncate">{star.playsFor.join(' · ')}</p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-[9px] uppercase tracking-[0.28em] text-[#7b6853] font-black">Coste</span>
                                <span className="text-[#ca8a04] font-black italic">{star.cost.toLocaleString('es-ES')}</span>
                            </div>
                        </button>
                    )) : (
                        <div className="col-span-full rounded-[1.4rem] border border-dashed border-[rgba(111,87,56,0.16)] bg-[rgba(255,251,241,0.55)] p-6 text-center">
                            <p className="blood-ui-light-meta text-[9px] uppercase tracking-[0.35em] font-black">Sin coincidencias</p>
                            <p className="blood-ui-light-body text-sm mt-2">Esta franquicia no tiene estrellas filtradas por ahora.</p>
                        </div>
                    )}
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Stats & Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="blood-ui-light-card rounded-[1.8rem] p-8 flex flex-col items-center shadow-[0_24px_70px_rgba(92,68,39,0.12)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                        <h3 className="blood-ui-light-meta font-black uppercase tracking-[0.3em] text-[10px] mb-8 text-center italic">Atributos Promedio</h3>

                        <div className="relative w-full aspect-square max-w-[280px] mb-8 cursor-pointer hover:scale-105 transition-all duration-700 bg-[rgba(255,255,255,0.52)] rounded-full border border-[rgba(111,87,56,0.12)] p-8 shadow-inner" onClick={() => setIsRadarModalOpen(true)}>
                            <div className="relative z-10 flex justify-center items-center h-full">
                                <RadarChart ratings={[{ data: team.ratings, color: '#f59f0a' }]} size={200} />
                            </div>
                        </div>

                        <div className="w-full space-y-4 pt-8 border-t border-[rgba(111,87,56,0.12)]">
                            {[
                                { label: 'Movimiento (MA)', val: team.ratings.velocidad },
                                { label: 'Fuerza (ST)', val: team.ratings.fuerza },
                                { label: 'Agilidad (AG)', val: `${team.ratings.agilidad}+` },
                                { label: 'Pase (PA)', val: `${team.ratings.pase}+` },
                                { label: 'Armadura (AV)', val: `${team.ratings.armadura}+` }
                            ].map((stat, i) => (
                                <div key={i} className="flex justify-between items-center text-sm group/stat">
                                    <span className="text-[#7b6853] font-black uppercase tracking-wider text-[10px] italic group-hover/stat:text-[#ca8a04] transition-colors">{stat.label}</span>
                                    <StatValue value={stat.val} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="blood-ui-light-card rounded-[1.8rem] p-8 space-y-8 shadow-[0_24px_70px_rgba(92,68,39,0.12)] relative overflow-hidden">
                        <h3 className="blood-ui-light-meta font-black uppercase tracking-[0.3em] text-[10px] border-b border-[rgba(111,87,56,0.12)] pb-4 italic">Costes de Equipo</h3>
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            {[
                                { label: 'Reroll (RR)', value: team.rerollCost.toLocaleString('es-ES'), highlight: true },
                                 { label: 'Apotecario', value: mergedTeam.apothecary },
                                { label: 'Sobornos', value: '100k' },
                                { label: 'Asistentes', value: '10k' }
                            ].map((cost, idx) => (
                                <div key={idx} className="p-4 bg-[rgba(255,251,241,0.68)] rounded-2xl border border-[rgba(111,87,56,0.12)] flex flex-col justify-center group/cost hover:border-[rgba(202,138,4,0.24)] transition-all">
                                    <p className="text-[8px] text-[#7b6853] uppercase font-black tracking-widest mb-1 group-hover/cost:text-[#ca8a04] transition-colors">{cost.label}</p>
                                    <p className={`text-xl font-black italic tracking-tighter ${cost.highlight ? 'text-[#ca8a04]' : 'text-[#2b1d12]'}`}>{cost.value}</p>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => onRequestTeamCreation?.(team.name)}
                            className="blood-ui-button-primary w-full py-5 rounded-2xl text-xs"
                        >
                            {language === 'es' ? 'Crear este Equipo' : 'Create this Team'}
                        </button>
                    </div>
                </div>

                {/* Main Content Area with Tabs */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Tabs Navigation */}
                    <div className="flex gap-2 p-1 blood-ui-light-card rounded-2xl mb-6 border border-[rgba(111,87,56,0.12)] bg-[rgba(255,251,241,0.9)] shadow-[0_12px_30px_rgba(92,68,39,0.1)]">
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
                                        ? 'bg-[#ca8a04] text-[#2b1d12] shadow-lg shadow-[rgba(202,138,4,0.18)]' 
                                        : 'text-[#7b6853] hover:text-[#2b1d12] hover:bg-white/50'
                                }`}
                            >
                                <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                                {tab.label}
                                {tab.count !== undefined && <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[8px] ${activeTab === tab.id ? 'bg-[rgba(43,29,18,0.18)] text-[#2b1d12]' : 'bg-[rgba(202,138,4,0.14)] text-[#ca8a04]'}`}>{tab.count}</span>}
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
                                className="blood-ui-light-card rounded-[2rem] overflow-hidden shadow-[0_24px_70px_rgba(92,68,39,0.12)]"
                            >
                                <div className="px-8 md:px-10 py-8 border-b border-[rgba(111,87,56,0.12)] bg-[rgba(255,251,241,0.54)] flex justify-between items-center">
                                    <div>
                                        <h3 className="blood-ui-light-title text-xs uppercase tracking-[0.3em] italic">Posicionales del equipo</h3>
                                         <p className="blood-ui-light-meta text-[9px] uppercase font-bold tracking-widest mt-1">Estadísticas Oficiales S3 (BB2025)</p>
                                    </div>
                                    <span className="material-symbols-outlined text-primary opacity-20 text-4xl">shield</span>
                                </div>
                                <div className="overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-left border-collapse min-w-[700px]">
                                        <thead>
                                            <tr className="blood-ui-light-meta text-[10px] uppercase tracking-[0.3em]">
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
                                                <tr key={idx} className="border-t border-[rgba(111,87,56,0.08)] hover:bg-[rgba(255,251,241,0.64)] transition-colors group">
                                                    <td className="py-6 px-10">
                                                        <div className="flex flex-col">
                                                            <span className="blood-ui-light-title font-black uppercase tracking-tighter italic text-lg group-hover:text-[#ca8a04] transition-colors">{player.position}</span>
                                                            <span className="blood-ui-light-meta text-[9px] font-bold uppercase tracking-widest">{player.qty} x equipo</span>
                                                        </div>
                                                    </td>
                                                        <td className="py-6 px-2 text-center"><StatValue value={player.stats.MV} /></td>
                                                    <td className="py-6 px-2 text-center"><StatValue value={player.stats.FU} /></td>
                                                    <td className="py-6 px-2 text-center"><StatValue value={player.stats.AG} /></td>
                                                    <td className="py-6 px-2 text-center"><StatValue value={player.stats.PA} /></td>
                                                    <td className="py-6 px-2 text-center"><StatValue value={player.stats.AR} /></td>
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
                                                        <span className="font-display font-black text-xl italic text-[#ca8a04]">{player.cost.toLocaleString('es-ES')}</span>
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
                                className="space-y-6"
                            >
                                <div className="blood-ui-light-card rounded-[1.6rem] border border-[rgba(202,138,4,0.16)] p-8 shadow-[0_18px_40px_rgba(92,68,39,0.08)]">
                                    <div className="flex items-center justify-between gap-4 mb-6">
                                        <h3 className="text-[#ca8a04] font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">star</span>
                                            Jugadores Estrella Compatibles
                                        </h3>
                                        <span className="text-[9px] uppercase tracking-[0.28em] text-[#7b6853] font-black">
                                            {eligibleStars.length} disponibles
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {loadingStars ? (
                                            <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 text-[#6f5738]">
                                                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                                <p className="text-xs font-black uppercase tracking-widest text-[#7b6853]">Buscando Jugadores Estrella...</p>
                                            </div>
                                        ) : eligibleStars.length > 0 ? (
                                            eligibleStars.map((star, idx) => (
                                                <div key={idx} className="blood-ui-light-card border rounded-[1.4rem] p-6 hover:border-[rgba(202,138,4,0.24)] transition-all group flex gap-4 shadow-[0_18px_40px_rgba(92,68,39,0.1)]">
                                                    <div className="w-20 h-20 rounded-2xl bg-[rgba(255,255,255,0.56)] border border-[rgba(111,87,56,0.12)] shrink-0 overflow-hidden relative">
                                                        <img
                                                            src={getStarPlayerImageUrl(star.name)}
                                                            alt={star.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                            onError={(e) => {
                                                                const img = e.target as HTMLImageElement;
                                                                if (star.image && img.src !== star.image) {
                                                                    img.src = star.image;
                                                                } else {
                                                                    img.src = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop';
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className="blood-ui-light-title font-black uppercase tracking-tighter italic truncate group-hover:text-[#ca8a04] transition-colors">{star.name}</h4>
                                                            <span className="text-[#ca8a04] font-black text-xs italic shrink-0">{star.cost.toLocaleString('es-ES')}</span>
                                                        </div>
                                                        <div className="flex gap-2 text-[10px] text-[#6f5738] font-bold uppercase mb-3">
                                                            <span>MV:{star.stats?.MV}</span>
                                                            <span>FU:{star.stats?.FU}</span>
                                                            <span>AG:{star.stats?.AG}</span>
                                                            <span>AR:{star.stats?.AR}</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {(star.skillKeys || []).slice(0, 3).map(sk => (
                                                                <span key={sk} className="px-1.5 py-0.5 bg-white/60 text-[8px] text-[#4b3a28] rounded uppercase font-bold">{sk}</span>
                                                            ))}
                                                            {(star.skillKeys?.length || 0) > 3 && (
                                                                <span className="px-1.5 py-0.5 bg-white/60 text-[8px] text-[#7b6853] rounded uppercase font-bold">+{(star.skillKeys?.length || 0) - 3}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full py-20 bg-[rgba(255,251,241,0.55)] border border-dashed border-[rgba(111,87,56,0.14)] rounded-2xl flex flex-col items-center justify-center text-[#6f5738]">
                                                <span className="material-symbols-outlined text-4xl mb-2 opacity-20">sentiment_dissatisfied</span>
                                                <p className="text-xs font-black uppercase tracking-widest italic">No se encontraron estrellas elegibles</p>
                                            </div>
                                        )}
                                    </div>
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
                                <div className="blood-ui-light-card rounded-[1.6rem] border border-[rgba(202,138,4,0.16)] p-8 shadow-[0_18px_40px_rgba(92,68,39,0.08)]">
                                    <h3 className="text-[#ca8a04] font-black uppercase tracking-[0.2em] text-[10px] mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">gavel</span>
                                        Reglas Especiales de la Facción
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
                                        {specialRulesList.map((rule, idx) => (
                                            <div key={idx} className="p-6 bg-[rgba(255,251,241,0.68)] rounded-[1.2rem] border-l-4 border-[#ca8a04] group hover:bg-[rgba(255,251,241,0.9)] transition-all">
                                                <h4 className="blood-ui-light-title font-black text-xs uppercase mb-2 tracking-widest italic group-hover:text-[#ca8a04] transition-colors">{rule}</h4>
                                                <p className="blood-ui-light-body text-xs font-medium italic text-[#5f4a33]">
                                                    {rule === "Gestión de Equipo" ? "Permite el acceso a personal de apoyo estándar y gestión de tesorería avanzada." :
                                                     rule.includes("Superliga") ? "Este equipo compite en una liga de élite con acceso a Jugadores Estrella específicos." :
                                                     rule.includes("Favorito de") ? "El equipo cuenta con la bendición de un dios del Caos, permitiendo mutaciones." :
                                                     "Regla reglamentaria de la Tercera Temporada de Blood Bowl (Edición 2025)."}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="blood-ui-light-card rounded-[1.6rem] border border-[rgba(111,87,56,0.12)] p-8">
                                    <h3 className="text-[#ca8a04] font-black uppercase tracking-[0.2em] text-[10px] mb-4">Notas de la Tercera Temporada</h3>
                                    <p className="blood-ui-light-body text-xs leading-loose italic">
                                        Todos los rosters han sido actualizados según los cambios de costes y estadísticas de la Temporada 3. Los Jugadores Estrella ahora tienen sus habilidades actualizadas y reglas especiales de "Once per Game" integradas en sus perfiles.
                                    </p>
                                </div>
                            </motion.div>
                        )}

            </AnimatePresence>
                </div>
            </div>
            <div className="mt-16 flex justify-between items-center border-t border-primary/20 pt-10 pb-20">
                <button
                    onClick={onBack}
                    className="bg-[#ca8a04] text-[#2b1d12] border border-[rgba(202,138,4,0.25)] flex items-center gap-3 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] group italic shadow-[0_10px_24px_rgba(202,138,4,0.12)]"
                >
                    <span className="material-symbols-outlined font-bold group-hover:-translate-x-2 transition-transform">arrow_back</span>
                    {language === 'es' ? 'Volver a la Enciclopedia' : 'Back to Oracle'}
                </button>
                <div className="flex gap-4">
                    <button className="h-12 w-12 flex items-center justify-center rounded-2xl blood-ui-light-button-secondary group shadow-lg">
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">share</span>
                    </button>
                    <button className="h-12 w-12 flex items-center justify-center rounded-2xl blood-ui-light-button-secondary group shadow-lg">
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
                        className="fixed inset-0 z-50 bg-[rgba(255,248,231,0.72)] backdrop-blur-xl flex items-center justify-center p-4"
                    >
                        <img
                            src={heroImage}
                            alt={team.name}
                            className="max-w-full max-h-full object-contain rounded-3xl shadow-[0_24px_80px_rgba(92,68,39,0.22)]"
                            onError={(e) => {
                                const img = e.currentTarget;
                                const fallback = getTeamLogoUrl(team.name);
                                if (img.src !== fallback) img.src = fallback;
                            }}
                        />
                        <button className="absolute top-8 right-8 text-[#7b6853] hover:text-[#2b1d12] transition-colors">
                            <span className="material-symbols-outlined text-5xl">close</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default TeamDetailPage;

