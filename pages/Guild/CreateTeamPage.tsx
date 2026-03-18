import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ManagedTeam, Team, Player, ManagedPlayer, Skill, StarPlayer } from '../../types';
import { useMasterData } from '../../hooks/useMasterData';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import SkillModal from '../../components/oracle/SkillModal';

interface TeamCreatorProps {
    onTeamCreate: (team: Omit<ManagedTeam, 'id'>) => void;
    initialRosterName?: string | null;
}

type CreatorStep = 'selection' | 'draft';

const TeamCreator: React.FC<TeamCreatorProps> = ({ onTeamCreate, initialRosterName }) => {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const { teams: rosterTemplates, loading, skills: allSkills, starPlayers } = useMasterData();
    
    // Flow State
    const [step, setStep] = useState<CreatorStep>('selection');
    const [selectedFactionIdx, setSelectedFactionIdx] = useState(0);
    
    // Draft State
    const [teamName, setTeamName] = useState('');
    const [draftedPlayers, setDraftedPlayers] = useState<ManagedPlayer[]>([]);
    const [rerolls, setRerolls] = useState(0);
    const [dedicatedFans, setDedicatedFans] = useState(1);
    const [assistantCoaches, setAssistantCoaches] = useState(0);
    const [cheerleaders, setCheerleaders] = useState(0);
    const [apothecary, setApothecary] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const carouselRef = useRef<HTMLDivElement>(null);

    // Initial Budget
    const startingTreasury = 1000000;

    const filteredFactions = useMemo(() => {
        return rosterTemplates.filter(rt => rt.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [rosterTemplates, searchQuery]);

    const currentFaction = useMemo(() => {
        return rosterTemplates[selectedFactionIdx] || null;
    }, [rosterTemplates, selectedFactionIdx]);

    // Filter Star Players for the current faction
    const factionStars = useMemo(() => {
        if (!currentFaction) return [];
        return starPlayers.filter(star => 
            star.playsFor?.some(p => p.toLowerCase() === currentFaction.name.toLowerCase()) ||
            star.playsFor?.includes('Any') ||
            star.playsFor?.includes('Global')
        );
    }, [starPlayers, currentFaction]);

    useEffect(() => {
        if (!loading && initialRosterName && rosterTemplates.length > 0) {
            const index = rosterTemplates.findIndex(tm => tm.name === initialRosterName);
            if (index !== -1) setSelectedFactionIdx(index);
        }
    }, [initialRosterName, rosterTemplates, loading]);

    // Reset draft ONLY if race definitely changes
    useEffect(() => {
        setDraftedPlayers([]);
        setRerolls(0);
        setDedicatedFans(1);
        setAssistantCoaches(0);
        setCheerleaders(0);
        setApothecary(false);
    }, [selectedFactionIdx]);

    const scrollCarousel = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const scrollAmount = carouselRef.current.clientWidth * 0.8;
            carouselRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    const totalCost = useMemo(() => {
        const playersCost = draftedPlayers.reduce((sum, p) => sum + p.cost, 0);
        const rerollCost = rerolls * (currentFaction?.rerollCost || 0);
        const fansCost = (dedicatedFans - 1) * 10000;
        const staffCost = (assistantCoaches + cheerleaders) * 10000;
        const apoCost = apothecary ? 50000 : 0;
        return playersCost + rerollCost + fansCost + staffCost + apoCost;
    }, [draftedPlayers, rerolls, dedicatedFans, assistantCoaches, cheerleaders, apothecary, currentFaction]);

    const remainingBudget = startingTreasury - totalCost;
    const isBudgetNegative = remainingBudget < 0;
    const canFinalize = teamName.trim().length >= 3 && draftedPlayers.length >= 11 && !isBudgetNegative;

    const handleHirePlayer = (pos: Player) => {
        if (draftedPlayers.length >= 16) return;
        const count = draftedPlayers.filter(p => p.position === pos.position).length;
        const limitStr = pos.qty.split('-')[1] || pos.qty;
        if (count >= parseInt(limitStr)) return;

        const newPlayer: ManagedPlayer = {
            ...pos,
            id: Date.now() + Math.random(),
            customName: `${pos.position} #${draftedPlayers.length + 1}`,
            spp: 0,
            gainedSkills: [],
            lastingInjuries: [],
            status: 'Activo',
        };
        setDraftedPlayers([...draftedPlayers, newPlayer]);
    };

    const handleFirePlayer = (id: number) => {
        setDraftedPlayers(draftedPlayers.filter(p => p.id !== id));
    };

    const localizeSkill = (keyEN: string): string => {
        const found = allSkills.find(s => s.keyEN === keyEN);
        return found?.name_es ?? found?.name ?? keyEN;
    };

    const handleSubmit = () => {
        if (!canFinalize || !currentFaction) return;
        const newTeam: Omit<ManagedTeam, 'id'> = {
            name: teamName.trim(),
            rosterName: currentFaction.name,
            treasury: remainingBudget,
            rerolls,
            dedicatedFans,
            assistantCoaches,
            cheerleaders,
            apothecary,
            players: draftedPlayers,
            crestImage: undefined
        };
        onTeamCreate(newTeam);
    };

    if (loading || !currentFaction) {
        return (
            <div className="flex flex-col items-center justify-center p-20 min-h-[60vh] bg-bb-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bb-gold mb-4"></div>
                <p className="text-slate-400 font-display animate-pulse uppercase tracking-widest italic">Invocando al Comisario...</p>
            </div>
        );
    }

    // PHASE 1: RACE DISCOVERY
    if (step === 'selection') {
        const ratings = currentFaction.ratings || { fuerza: 50, agilidad: 50, velocidad: 50, armadura: 50, pase: 50 };
        
        // Radar Chart Points calculation (Polygon)
        // Order: Fuerza (Top), Armadura (Right-Top), Velocidad (Right-Bottom), Agilidad (Left-Bottom)
        // We'll use 4 points for a simplified diamond as per design
        const getPoint = (val: number, angle: number) => {
            const r = (val / 100) * 45;
            const x = 50 + r * Math.cos((angle * Math.PI) / 180);
            const y = 50 + r * Math.sin((angle * Math.PI) / 180);
            return `${x},${y}`;
        };
        const radarPoints = [
            getPoint(ratings.fuerza || 50, 270),  // Fuerza: Top
            getPoint(ratings.armadura || 50, 0),    // Armadura: Right
            getPoint(ratings.velocidad || 50, 90),  // Velocidad: Bottom
            getPoint(ratings.agilidad || 50, 180)   // Agilidad: Left
        ].join(' ');

        return (
            <div className="min-h-screen w-full flex flex-col bg-bb-dark text-white font-inter overflow-x-hidden">
                {/* Top Navigation Carousel */}
                <nav className="w-full bg-bb-dark border-b border-bb-gold/20 py-6 px-8 relative z-50">
                    <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-12">
                        <div className="flex items-center gap-4 flex-1 overflow-hidden relative px-10">
                            <button onClick={() => scrollCarousel('left')} className="absolute left-0 text-bb-gold hover:text-white transition-all"><span className="material-symbols-outlined text-4xl font-bold">chevron_left</span></button>
                            <div ref={carouselRef} className="flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x">
                                {filteredFactions.map((tm, idx) => {
                                    const masterIdx = rosterTemplates.findIndex(f => f.name === tm.name);
                                    const isSelected = selectedFactionIdx === masterIdx;
                                    return (
                                        <button key={tm.name} onClick={() => setSelectedFactionIdx(masterIdx)} className={`flex-none flex flex-col items-center gap-2 group transition-all snap-center ${!isSelected && 'opacity-50 hover:opacity-100'}`}>
                                            <div className={`race-shield w-16 h-16 rounded-full overflow-hidden bg-zinc-900 flex items-center justify-center border-2 transition-all ${isSelected ? 'border-bb-gold shadow-[0_0_20px_rgba(202,138,4,0.5)] scale-110' : 'border-bb-gold/30'}`}>
                                                <img src={tm.image} alt={tm.name} className="w-full h-full object-cover" />
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-bb-gold' : 'text-gray-400'}`}>{tm.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <button onClick={() => scrollCarousel('right')} className="absolute right-0 text-bb-gold hover:text-white transition-all"><span className="material-symbols-outlined text-4xl font-bold">chevron_right</span></button>
                        </div>
                        <div className="relative w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-bb-gold/50 text-xl">search</span>
                            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-bb-gray border border-bb-gold/20 rounded-none py-2 pl-10 pr-4 text-xs tracking-widest text-white focus:border-bb-gold focus:ring-0 transition-all placeholder:text-gray-600 outline-none uppercase" placeholder="BUSCAR RAZA..." type="text"/>
                        </div>
                    </div>
                </nav>

                <header className="w-full pt-12 pb-8 text-center bg-gradient-to-b from-bb-gold/5 to-transparent">
                    <motion.h1 
                        key={currentFaction.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-epilogue text-8xl italic tracking-tighter text-white animate-glow uppercase"
                    >
                        {currentFaction.name}
                    </motion.h1>
                    <p className="text-bb-gold mt-4 text-xl tracking-widest uppercase font-light opacity-90 italic">
                        {language === 'es' ? currentFaction.specialRules_es : currentFaction.specialRules_en}
                    </p>
                    <div className="gold-divider mt-8 max-w-4xl mx-auto opacity-40 h-[1px] bg-gradient-to-r from-transparent via-bb-gold to-transparent"></div>
                </header>

                <main className="max-w-[1600px] mx-auto px-8 pb-48 grid grid-cols-12 gap-12 items-stretch flex-1">
                    {/* Left: Radar & Lore */}
                    <section className="col-span-12 lg:col-span-3 flex flex-col gap-12">
                        <div className="bg-bb-gray p-8 rounded-sm border border-bb-gold/20 shadow-2xl">
                            <h3 className="text-sm font-bold text-bb-gold mb-8 uppercase tracking-widest italic leading-none border-l-2 border-bb-gold pl-3">Atributos de Raza</h3>
                            <div className="relative aspect-square flex items-center justify-center">
                                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100">
                                    <polygon className="stroke-bb-gold/20 fill-none" points="50,5 95,50 50,95 5,50" strokeWidth="1"></polygon>
                                    <polygon className="stroke-bb-gold/20 fill-none" points="50,25 75,50 50,75 25,50" strokeWidth="1"></polygon>
                                    <polygon className="fill-bb-gold/30 stroke-bb-gold" points={radarPoints} strokeWidth="2"></polygon>
                                    <text className="fill-white text-[6px] font-black uppercase tracking-tighter" textAnchor="middle" x="50" y="-2">Fuerza</text>
                                    <text className="fill-white text-[6px] font-black uppercase tracking-tighter" textAnchor="start" x="100" y="52">Armadura</text>
                                    <text className="fill-white text-[6px] font-black uppercase tracking-tighter" textAnchor="middle" x="50" y="105">Velocidad</text>
                                    <text className="fill-white text-[6px] font-black uppercase tracking-tighter" textAnchor="end" x="0" y="52">Agilidad</text>
                                </svg>
                            </div>
                            <p className="text-[10px] text-center mt-8 text-gray-500 uppercase tracking-[0.2em] font-black italic">Dificultad de Manejo: {currentFaction.tier === 1 ? 'Baja' : currentFaction.tier === 2 ? 'Media' : 'Alta'}</p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-bb-gold uppercase tracking-widest italic">Historia de Sangre</h3>
                            <div className="h-[2px] w-16 bg-gradient-to-r from-bb-gold to-transparent mb-6"></div>
                            <p className="text-gray-400 leading-relaxed text-sm italic tracking-tight text-justify">
                                {currentFaction.specialRules_es || 'Los anales de la NAF registran a esta raza como una fuerza imparable en el campo. Sus métodos varían, pero el resultado es siempre el mismo: espectáculo, violencia y gloria.'}
                            </p>
                        </div>
                    </section>

                    {/* Center: Base Roster */}
                    <section className="col-span-12 lg:col-span-6">
                        <div className="bg-bb-gray/50 border-x border-bb-gold/10 p-10 h-full backdrop-blur-sm">
                            <h3 className="text-2xl font-epilogue italic text-white mb-10 uppercase leading-none border-b border-bb-gold/10 pb-4">Plantilla Base</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-bb-gold/30 text-[10px] text-bb-gold uppercase tracking-[0.2em]">
                                            <th className="py-5 font-black">Posición</th>
                                            <th className="py-5 px-2 text-center">MA</th>
                                            <th className="py-5 px-2 text-center">ST</th>
                                            <th className="py-5 px-2 text-center">AG</th>
                                            <th className="py-5 px-2 text-center">PA</th>
                                            <th className="py-5 px-2 text-center">AV</th>
                                            <th className="py-5 pl-6 font-black">Habilidades</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {currentFaction.roster.map((pos, pidx) => (
                                            <tr key={pidx} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                                                <td className="py-5 font-black text-gray-200 uppercase italic tracking-tighter">{pos.position}</td>
                                                <td className="py-5 px-2 text-center font-mono opacity-60 group-hover:opacity-100">{pos.stats.MV}</td>
                                                <td className="py-5 px-2 text-center font-mono opacity-60 group-hover:opacity-100">{pos.stats.FU}</td>
                                                <td className="py-5 px-2 text-center font-mono opacity-60 group-hover:opacity-100">{pos.stats.AG}</td>
                                                <td className="py-5 px-2 text-center font-mono opacity-60 group-hover:opacity-100">{pos.stats.PA}</td>
                                                <td className="py-5 px-2 text-center font-mono opacity-60 group-hover:opacity-100">{pos.stats.AR}</td>
                                                <td className="py-5 pl-6">
                                                    <div className="flex flex-wrap gap-1.5 focus:outline-none">
                                                        {pos.skillKeys.length > 0 ? pos.skillKeys.slice(0, 3).map(sk => (
                                                            <span key={sk} className="px-2 py-0.5 bg-bb-gold/10 border border-bb-gold/30 text-bb-gold text-[9px] font-black rounded-sm uppercase tracking-tighter transition-all hover:bg-bb-gold hover:text-black">{localizeSkill(sk)}</span>
                                                        )) : <span className="text-[9px] text-slate-700 font-black uppercase italic tracking-widest">Básico</span>}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* Right: Star Players */}
                    <section className="col-span-12 lg:col-span-3 flex flex-col h-full">
                        <h3 className="text-sm font-bold text-bb-gold uppercase tracking-widest mb-8 italic">Jugadores Estrella</h3>
                        <div className="flex-1 bg-bb-gray/30 border border-bb-gold/10 p-8 overflow-hidden flex flex-col backdrop-blur-md">
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto no-scrollbar max-h-[600px] pr-2 custom-scroll-area">
                                {factionStars.map((star, sidx) => (
                                    <button key={sidx} className="flex flex-col items-center group focus:outline-none">
                                        <div className="w-full aspect-square bg-zinc-900 border border-bb-gold/20 p-1 mb-3 transition-all group-hover:border-bb-gold group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(202,138,4,0.3)] relative group-hover:-translate-y-1">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <img src={star.image} alt={star.name} className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all opacity-60 group-hover:opacity-100" />
                                        </div>
                                        <span className="font-epilogue text-[8px] italic font-black text-bb-gold uppercase text-center leading-none tracking-tighter opacity-60 group-hover:opacity-100">{star.name}</span>
                                    </button>
                                ))}
                                {factionStars.length === 0 && <p className="col-span-3 text-center py-20 text-[9px] text-slate-600 font-black uppercase tracking-widest italic opacity-30">No hay estrellas filtradas</p>}
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="fixed bottom-0 left-0 w-full bg-bb-dark/95 border-t border-bb-gold/30 p-10 z-[100] backdrop-blur-md shadow-[0_-20px_50px_rgba(0,0,0,0.8)]">
                    <div className="max-w-[1600px] mx-auto flex justify-center">
                        <button 
                            onClick={() => setStep('draft')}
                            className="bg-bb-gold hover:bg-white text-black font-epilogue italic font-black text-3xl px-32 py-6 tracking-tighter uppercase transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(202,138,4,0.4)]"
                        >
                            Fundar esta Franquicia
                        </button>
                    </div>
                </footer>
                
                <style>{`
                    .animate-glow { animation: glow 4s infinite ease-in-out }
                    @keyframes glow { 0%, 100% { text-shadow: 0 0 10px rgba(202, 138, 4, 0.2); } 50% { text-shadow: 0 0 20px rgba(202, 138, 4, 0.5); } }
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                `}</style>
            </div>
        );
    }

    // PHASE 2: TEAM DRAFT (The Control Panel from before)
    return (
        <div className="h-screen w-full flex flex-col bg-[#0a0a0a] text-slate-100 overflow-hidden font-sans select-none">
            {/* Header: Fixed top summary */}
            <header className="flex-none bg-[#0a0a0a] border-b border-white/10 px-6 py-3 z-50">
                <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-8 h-12">
                    <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => setStep('selection')} className="material-symbols-outlined text-gold mr-2 hover:scale-110 transition-transform">arrow_back</button>
                        <span className="material-symbols-outlined text-gold text-2xl font-black">sports_football</span>
                        <h1 className="text-lg font-header font-black tracking-tight text-white uppercase italic leading-none">{currentFaction.name} - La Mesa de Contratación</h1>
                    </div>
                    
                    <div className="flex items-center gap-6">
                         <div className="px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 flex items-center gap-3">
                            <span className="text-[10px] font-black text-gold uppercase tracking-widest italic">Race:</span>
                            <div className="w-5 h-5 rounded-full bg-cover bg-center border border-white/10" style={{ backgroundImage: currentFaction.image ? `url(${currentFaction.image})` : 'none' }}></div>
                            <span className="text-[10px] font-black text-white uppercase tracking-widest italic">{currentFaction.name}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* TEAM NAME SECTION (Separator) */}
            <section className="flex-none px-6 py-3 bg-black/40 border-b border-white/5 shadow-inner">
                <div className="max-w-screen-2xl mx-auto flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] ml-1 tracking-widest">Nombre de la Franquicia</label>
                    <input 
                        className="w-full bg-transparent border-none p-0 text-3xl font-header font-black text-white italic placeholder:text-white/5 outline-none uppercase tracking-tighter" 
                        placeholder="Escribe el nombre de tu equipo..." 
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        maxLength={40}
                        autoFocus
                    />
                </div>
            </section>

            {/* MAIN VIEWPORT */}
            <main className="flex-1 flex overflow-hidden">
                {/* LEFT: Market */}
                <section className="flex-1 overflow-y-auto p-6 space-y-4 custom-scroll-area">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-header font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 italic">
                            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-gold/20 text-gold text-[9px] border border-gold/20 italic">2</span>
                            Reclutamiento de Jugadores
                        </h2>
                        <span className="text-[9px] text-slate-600 italic uppercase tracking-widest opacity-60 italic">"Los mejores se pagan en oro y sangre"</span>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 pb-20">
                        {currentFaction.roster.map((pos, idx) => {
                            const count = draftedPlayers.filter(p => p.position === pos.position).length;
                            const limitStr = pos.qty.split('-')[1] || pos.qty;
                            const limit = parseInt(limitStr);
                            const isFull = count >= limit;
                            const canAfford = remainingBudget >= pos.cost;

                            return (
                                <motion.div layout key={idx} className={`bg-[#171717] border rounded-xl p-3 flex items-center justify-between transition-all group ${isFull ? 'opacity-20 border-white/5' : 'border-white/10 hover:border-gold/20 hover:bg-white/[0.01]'}`}>
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-header font-black text-sm uppercase italic tracking-tighter">{pos.position}</span>
                                            <div className="relative group/skill-tip">
                                                <span className="material-symbols-outlined text-slate-700 text-[12px] cursor-help hover:text-gold transition-colors">info</span>
                                                {pos.skillKeys && pos.skillKeys.length > 0 && (
                                                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover/skill-tip:flex flex-wrap gap-1 p-2 bg-black border border-white/10 rounded-lg shadow-2xl z-50 w-48 border-l-2 border-l-gold backdrop-blur-md">
                                                        {pos.skillKeys.map(sk => <span key={sk} className="text-[8px] font-black px-1.5 py-0.5 rounded bg-gold/10 text-gold uppercase border border-gold/20">{localizeSkill(sk)}</span>)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-3 text-[8px] font-mono font-black italic">
                                            {['MV', 'FU', 'AG', 'PA', 'AR'].map(s => <div key={s} className="flex gap-0.5"><span className="text-slate-600">{s.replace('MV','MA').replace('FU','ST').replace('AR','AV')}</span><span className="text-slate-300">{(pos.stats as any)[s]}</span></div>)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <span className="text-md font-header font-black text-gold italic">{pos.cost / 1000}k</span>
                                            <span className="block text-[7px] font-black text-slate-700 uppercase leading-none mt-0.5 italic">{count} / {limit}</span>
                                        </div>
                                        <button onClick={() => handleHirePlayer(pos)} disabled={isFull || !canAfford} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isFull || !canAfford ? 'bg-zinc-800 text-zinc-900 cursor-not-allowed' : 'bg-gold text-black hover:scale-110 active:scale-90 shadow-lg'}`}>
                                            <span className="material-symbols-outlined font-black text-sm">add</span>
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* RIGHT: Sidebar (Tu Plantilla) */}
                <aside id="squad_list" className="w-[380px] bg-[#1a1a1a] border-l border-white/10 flex flex-col h-full shadow-3xl">
                    <div className="sticky top-0 z-20 p-6 space-y-5 bg-[#1a1a1a] border-b border-white/5">
                        <h2 className="text-[10px] font-black text-gold uppercase tracking-[0.4em] italic mb-2">RESUMEN: {teamName || 'TU FRANQUICIA'}</h2>
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <span className="text-[9px] uppercase font-black text-slate-500 tracking-widest italic leading-none">Tesorería Inicial</span>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-3xl font-header font-black italic ${isBudgetNegative ? 'text-blood animate-pulse' : 'shimmer-text'}`}>{remainingBudget.toLocaleString()}</span>
                                    <small className="text-[10px] font-black text-gold italic">gp</small>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Roster</span>
                                <div className={`text-2xl font-header font-black italic ${draftedPlayers.length < 11 ? 'text-blood' : 'text-white'}`}>{draftedPlayers.length} / 16</div>
                            </div>
                        </div>

                        <details className="group bg-black/40 rounded-xl border border-white/5 overflow-hidden transition-all">
                            <summary className="flex items-center justify-between px-3 py-2 cursor-pointer list-none hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-gold text-sm font-black">inventory_2</span>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Staff & Incentivos</span>
                                </div>
                                <span className="material-symbols-outlined text-xs transition-transform group-open:rotate-180 font-black">expand_more</span>
                            </summary>
                            <div className="px-3 pb-3 pt-1 space-y-1">
                                {[
                                    { name: 'Rerolls', cost: currentFaction.rerollCost, val: rerolls, set: setRerolls },
                                    { name: 'Fan Factor', cost: 10000, val: dedicatedFans, set: setDedicatedFans, min: 1 },
                                ].map(staff => (
                                    <div key={staff.name} className="flex items-center justify-between py-1.5 border-t border-white/5">
                                        <span className="text-[8px] font-black uppercase text-slate-500 italic">{staff.name} ({staff.cost/1000}k)</span>
                                        <div className="flex items-center gap-2 bg-black/60 rounded-lg p-0.5 border border-white/5">
                                            <button onClick={() => staff.set(Math.max(staff.min || 0, staff.val - 1))} className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-[10px] flex items-center justify-center font-black">-</button>
                                            <span className="text-[10px] font-mono font-black text-white w-3 text-center italic">{staff.val}</span>
                                            <button onClick={() => staff.set(staff.val + 1)} disabled={remainingBudget < staff.cost} className={`w-5 h-5 rounded border border-gold/20 text-gold flex items-center justify-center transition-all ${remainingBudget < staff.cost ? 'opacity-10' : 'bg-gold/10 hover:bg-gold hover:text-black font-black'}`}>+</button>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between py-2 border-t border-white/5">
                                    <span className="text-[8px] font-black uppercase text-slate-500 italic">Apoticario (50k)</span>
                                    <button onClick={() => setApothecary(!apothecary)} disabled={!apothecary && remainingBudget < 50000} className={`text-[8px] font-black px-4 py-1.5 rounded-full border tracking-widest italic transition-all ${apothecary ? 'bg-gold text-black border-gold' : 'text-gold bg-gold/5 border-gold/20'}`}>
                                        {apothecary ? 'SI' : 'NO'}
                                    </button>
                                </div>
                            </div>
                        </details>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scroll-area bg-black/10">
                        <div className="flex flex-col gap-1">
                            <AnimatePresence initial={false}>
                                {draftedPlayers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-700 opacity-20 grayscale"><span className="material-symbols-outlined text-4xl">stadium</span><p className="text-[8px] font-black uppercase italic mt-2">Mesa vacía</p></div>
                                ) : (
                                    draftedPlayers.map((p, idx) => (
                                        <motion.div layout key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded px-3 py-1.5 flex items-center justify-between group hover:border-gold/30 hover:bg-black/40 transition-all">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <span className="text-[9px] font-mono font-black text-gold/30 shrink-0">#{String(idx + 1).padStart(2, '0')}</span>
                                                <span className="text-[10px] font-header font-black text-slate-300 italic uppercase tracking-tighter truncate leading-none">{p.position}</span>
                                            </div>
                                            <button onClick={() => handleFirePlayer(p.id as number)} className="w-5 h-5 flex items-center justify-center text-blood bg-blood/5 hover:bg-blood hover:text-white rounded transition-all shrink-0"><span className="material-symbols-outlined text-[14px] font-black">remove</span></button>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="p-8 border-t border-white/10 space-y-4 bg-[#1a1a1a] shadow-3xl">
                        <div className="flex justify-between items-end border-b border-gold/10 pb-4">
                            <span className="text-[10px] font-black uppercase text-slate-600 italic tracking-[0.2em]">VALOR EQUIPO</span>
                            <span className="text-3xl font-header font-black text-white italic tracking-tighter">{totalCost / 1000} <small className="text-xs text-gold">TV</small></span>
                        </div>
                        <button 
                            disabled={!canFinalize}
                            onClick={handleSubmit}
                            className={`w-full py-5 rounded-2xl font-header font-black text-xl tracking-[0.2em] uppercase italic flex items-center justify-center gap-4 transition-all duration-300 shadow-3xl ${canFinalize ? 'bg-gradient-to-br from-bb-gold to-yellow-600 text-black shadow-gold/40 hover:scale-[1.03] active:scale-95' : 'bg-white/5 border border-white/10 text-white/5 cursor-not-allowed opacity-20'}`}
                        >
                            <span className="material-symbols-outlined text-2xl font-black">stadium</span>
                            CONFIRMAR FUNDACIÓN
                        </button>
                    </div>
                </aside>
            </main>

            <style>{`
                .shimmer-text { background: linear-gradient(90deg, #CA8A04 0%, #ffe4a3 50%, #CA8A04 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 3s infinite linear; }
                @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .custom-scroll-area::-webkit-scrollbar { width: 3px; }
                .custom-scroll-area::-webkit-scrollbar-thumb { background: rgba(202, 138, 4, 0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default TeamCreator;
