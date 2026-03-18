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
    }

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

    // PHASE 1: DISCOVERY (Original Clean Design)
    if (step === 'selection') {
        const ratings = currentFaction.ratings || { fuerza: 50, agilidad: 50, velocidad: 50, armadura: 50, pase: 50 };
        const getPoint = (val: number, angle: number) => {
            const r = (val / 100) * 45;
            const x = 50 + r * Math.cos((angle * Math.PI) / 180);
            const y = 50 + r * Math.sin((angle * Math.PI) / 180);
            return `${x},${y}`;
        };
        const radarPoints = [
            getPoint(ratings.fuerza || 50, 270),
            getPoint(ratings.armadura || 50, 0),
            getPoint(ratings.velocidad || 50, 90),
            getPoint(ratings.agilidad || 50, 180)
        ].join(' ');

        return (
            <div className="min-h-screen w-full flex flex-col bg-bb-dark text-white font-inter overflow-x-hidden antialiased">
                {/* Top Navigation Carousel */}
                <nav className="w-full bg-bb-dark border-b border-bb-gold/20 py-3 px-8 relative z-50">
                    <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-8 h-12">
                        <div className="flex items-center gap-6 flex-1 overflow-hidden relative px-10">
                            <button onClick={() => scrollCarousel('left')} className="absolute left-0 text-bb-gold hover:text-white transition-all transform hover:scale-110 z-10 w-8 h-8 flex items-center justify-center">
                                <span className="material-symbols-outlined text-4xl font-bold">chevron_left</span>
                            </button>
                            <div ref={carouselRef} className="flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x">
                                {filteredFactions.map((tm, idx) => {
                                    const masterIdx = rosterTemplates.findIndex(f => f.name === tm.name);
                                    const isSelected = selectedFactionIdx === masterIdx;
                                    return (
                                        <button key={tm.name} onClick={() => setSelectedFactionIdx(masterIdx)} className={`flex-none flex flex-col items-center gap-2 group transition-opacity snap-center ${!isSelected && 'opacity-60 hover:opacity-100'}`}>
                                            <div className={`race-shield w-14 h-14 rounded-full overflow-hidden bg-zinc-900 border-2 transition-all duration-300 ${isSelected ? 'border-bb-gold shadow-[0_0_20px_rgba(202,138,4,0.5)] scale-110' : 'border-bb-gold/20'}`}>
                                                <img src={tm.image} alt={tm.name} className="w-full h-full object-cover" />
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-bb-gold' : 'text-gray-400'}`}>{tm.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <button onClick={() => scrollCarousel('right')} className="absolute right-0 text-bb-gold hover:text-white transition-all transform hover:scale-110 z-10 w-8 h-8 flex items-center justify-center">
                                <span className="material-symbols-outlined text-4xl font-bold">chevron_right</span>
                            </button>
                        </div>
                        <div className="relative w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-bb-gold/50 text-xl">search</span>
                            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-bb-gray border-none rounded-none py-2 pl-10 pr-4 text-[10px] tracking-widest text-white focus:ring-0 transition-all placeholder:text-gray-600 outline-none uppercase" placeholder="BUSCAR RAZA..." type="text"/>
                        </div>
                    </div>
                </nav>

                <header className="w-full pt-8 pb-6 text-center">
                    <motion.h1 
                        key={currentFaction.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-epilogue text-7xl italic tracking-tighter text-white animate-glow uppercase"
                    >
                        {currentFaction.name}
                    </motion.h1>
                    <p className="text-bb-gold mt-2 text-lg tracking-widest uppercase font-light opacity-90 italic">
                        {language === 'es' ? currentFaction.specialRules_es : currentFaction.specialRules_en}
                    </p>
                    <div className="mt-6 max-w-4xl mx-auto h-[1px] bg-gradient-to-r from-transparent via-bb-gold/30 to-transparent"></div>
                </header>

                <main className="max-w-[1600px] mx-auto px-8 pb-40 grid grid-cols-12 gap-8 items-stretch flex-1">
                    {/* Left: Attributes & Lore */}
                    <section className="col-span-12 lg:col-span-3 flex flex-col gap-8">
                        <div className="bg-bb-gray p-6 rounded-sm border border-bb-gold/10">
                            <h3 className="text-sm font-bold text-bb-gold mb-6 uppercase tracking-widest italic">Atributos de Raza</h3>
                            <div className="relative aspect-square flex items-center justify-center">
                                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100">
                                    <polygon className="stroke-bb-gold/20 fill-none" points="50,5 95,50 50,95 5,50" strokeWidth="1"></polygon>
                                    <polygon className="stroke-bb-gold/20 fill-none" points="50,25 75,50 50,75 25,50" strokeWidth="1"></polygon>
                                    <polygon className="fill-bb-gold/30 stroke-bb-gold" points={radarPoints} strokeWidth="2"></polygon>
                                    <text className="fill-white text-[6px] font-bold uppercase" textAnchor="middle" x="50" y="-2">Fuerza</text>
                                    <text className="fill-white text-[6px] font-bold uppercase" textAnchor="start" x="100" y="52">Armadura</text>
                                    <text className="fill-white text-[6px] font-bold uppercase" textAnchor="middle" x="50" y="105">Velocidad</text>
                                    <text className="fill-white text-[6px] font-bold uppercase" textAnchor="end" x="0" y="52">Agilidad</text>
                                </svg>
                            </div>
                            <p className="text-[10px] text-center mt-6 text-gray-400 uppercase tracking-tighter italic">Dificultad de Manejo: {currentFaction.tier === 1 ? 'Baja' : currentFaction.tier === 2 ? 'Media' : 'Alta'}</p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-bb-gold uppercase tracking-widest italic">Historia de Sangre</h3>
                            <div className="h-[1px] w-12 bg-bb-gold mb-4"></div>
                            <p className="text-gray-400 leading-relaxed text-sm italic">
                                {language === 'es' ? "Su paso por la NAF está marcado por una resistencia legendaria y una falta total de sutileza. No buscan el hueco; crean el hueco a través de las costillas del oponente." : "Their journey through the NAF is marked by legendary resilience and a complete lack of subtlety."}
                            </p>
                        </div>
                    </section>

                    {/* Center: Base Roster */}
                    <section className="col-span-12 lg:col-span-6">
                        <div className="bg-bb-gray/50 border border-bb-gold/10 p-8 h-full">
                            <h3 className="text-xl font-header italic text-white mb-8 uppercase">Plantilla Base</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-bb-gold/30 text-[10px] text-bb-gold uppercase tracking-widest">
                                            <th className="py-4 font-semibold">Posición</th>
                                            <th className="py-4 px-2 text-center">MA</th>
                                            <th className="py-4 px-2 text-center">ST</th>
                                            <th className="py-4 px-2 text-center">AG</th>
                                            <th className="py-4 px-2 text-center">PA</th>
                                            <th className="py-4 px-2 text-center">AV</th>
                                            <th className="py-4 pl-4">Habilidades</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {currentFaction.roster.map((pos, pidx) => (
                                            <tr key={pidx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-4 font-bold text-gray-200">{pos.position}</td>
                                                <td className="py-4 px-2 text-center">{pos.stats.MV}</td>
                                                <td className="py-4 px-2 text-center">{pos.stats.FU}</td>
                                                <td className="py-4 px-2 text-center">{pos.stats.AG}</td>
                                                <td className="py-4 px-2 text-center">{pos.stats.PA}</td>
                                                <td className="py-4 px-2 text-center">{pos.stats.AR}</td>
                                                <td className="py-4 pl-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {pos.skillKeys.length > 0 ? pos.skillKeys.slice(0, 3).map(sk => (
                                                            <span key={sk} className="px-2 py-0.5 bg-bb-gold text-black text-[9px] font-bold rounded-sm uppercase tracking-tighter">{localizeSkill(sk)}</span>
                                                        )) : <span className="px-2 py-0.5 bg-zinc-800 text-gray-500 text-[9px] rounded-sm uppercase tracking-tighter">Ninguna</span>}
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
                        <h3 className="text-sm font-bold text-bb-gold uppercase tracking-widest mb-6">Jugadores Estrella</h3>
                        <div className="flex-1 bg-bb-gray/30 border border-bb-gold/10 p-6 overflow-hidden flex flex-col">
                            <div className="grid grid-cols-2 gap-4 overflow-y-auto no-scrollbar max-h-[500px]">
                                {factionStars.map((star, sidx) => (
                                    <button key={sidx} className="flex flex-col items-center group focus:outline-none">
                                        <div className="w-full aspect-square bg-zinc-900 border border-bb-gold/20 p-1 mb-2 transition-all group-hover:border-bb-gold">
                                            <img src={star.image} alt={star.name} className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-opacity opacity-60 group-hover:opacity-100" />
                                        </div>
                                        <span className="text-[8px] font-black text-bb-gold uppercase text-center leading-tight tracking-tighter">{star.name}</span>
                                    </button>
                                ))}
                                {factionStars.length === 0 && Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="w-full aspect-square bg-zinc-900/50 border border-bb-gold/5 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-bb-gold/10 text-3xl">skull</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="fixed bottom-0 left-0 w-full bg-bb-dark border-t border-bb-gold/30 p-8 z-[100] backdrop-blur-md">
                    <div className="max-w-[1600px] mx-auto flex justify-center">
                        <button 
                            onClick={() => setStep('draft')}
                            className="bg-bb-gold hover:bg-white text-black font-epilogue italic font-black text-3xl px-24 py-5 tracking-tighter uppercase transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(202,138,4,0.3)]"
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

    // PHASE 2: DRAFT (The S3 Control Panel)
    return (
        <div className="h-screen w-full flex flex-col bg-[#0a0a0a] text-slate-100 overflow-hidden font-sans select-none">
            {/* Header */}
            <header className="flex-none bg-black border-b border-bb-gold/20 px-6 py-3 z-50">
                <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-8 h-10">
                    <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => setStep('selection')} className="material-symbols-outlined text-bb-gold mr-3 hover:scale-110 transition-transform font-bold">arrow_back</button>
                        <span className="material-symbols-outlined text-bb-gold text-2xl font-black">sports_football</span>
                        <h1 className="text-lg font-header font-black tracking-tight text-white uppercase italic leading-none">{currentFaction.name} - Mesa de Contratación</h1>
                    </div>
                    
                    <div className="flex items-center gap-6">
                         <div className="px-4 py-1.5 rounded-full border border-bb-gold/30 bg-bb-gold/5 flex items-center gap-3">
                            <span className="text-[10px] font-black text-bb-gold uppercase tracking-widest italic">Race:</span>
                            <div className="w-5 h-5 rounded-full bg-cover bg-center border border-white/10" style={{ backgroundImage: currentFaction.image ? `url(${currentFaction.image})` : 'none' }}></div>
                            <span className="text-[10px] font-black text-white uppercase tracking-widest italic">{currentFaction.name}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* TEAM NAME SECTION */}
            <section className="flex-none px-6 py-3 bg-[#111111] border-b border-white/5">
                <div className="max-w-screen-2xl mx-auto flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-bb-gold/60 uppercase tracking-[0.4em] ml-1">Nombre de la Franquicia</label>
                    <input 
                        className="w-full bg-transparent border-none p-0 text-3xl font-header font-black text-white italic placeholder:text-zinc-800 outline-none uppercase tracking-tighter" 
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
                <section className="flex-1 overflow-y-auto p-6 space-y-4 pt-10 no-scrollbar">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-header font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 italic">
                            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-bb-gold/20 text-bb-gold text-[9px] border border-bb-gold/20 italic">2</span>
                            Reclutamiento de Jugadores
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 pb-32">
                        {currentFaction.roster.map((pos, idx) => {
                            const count = draftedPlayers.filter(p => p.position === pos.position).length;
                            const limitStr = pos.qty.split('-')[1] || pos.qty;
                            const limit = parseInt(limitStr);
                            const isFull = count >= limit;
                            const canAfford = remainingBudget >= pos.cost;

                            return (
                                <motion.div layout key={idx} className={`bg-[#171717] border rounded-none p-3 flex items-center justify-between transition-all group ${isFull ? 'opacity-20 border-white/5' : 'border-white/5 hover:border-bb-gold/30 hover:bg-zinc-900 shadow-xl'}`}>
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-header font-black text-sm uppercase italic tracking-tighter">{pos.position}</span>
                                            <div className="relative group/skill-tip">
                                                <span className="material-symbols-outlined text-slate-700 text-[12px] cursor-help hover:text-bb-gold transition-colors">info</span>
                                                {pos.skillKeys && pos.skillKeys.length > 0 && (
                                                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover/skill-tip:flex flex-wrap gap-1 p-2 bg-black border border-white/10 rounded shadow-2xl z-50 w-48 border-l-2 border-l-bb-gold backdrop-blur-md">
                                                        {pos.skillKeys.map(sk => <span key={sk} className="text-[8px] font-black px-1.5 py-0.5 rounded bg-bb-gold/10 text-bb-gold uppercase border border-bb-gold/20">{localizeSkill(sk)}</span>)}
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
                                            <span className="text-md font-header font-black text-bb-gold italic">{pos.cost / 1000}k</span>
                                            <span className="block text-[7px] font-black text-slate-700 uppercase leading-none mt-0.5 italic">{count} / {limit}</span>
                                        </div>
                                        <button onClick={() => handleHirePlayer(pos)} disabled={isFull || !canAfford} className={`w-8 h-8 flex items-center justify-center transition-all ${isFull || !canAfford ? 'bg-zinc-900 text-zinc-800 cursor-not-allowed' : 'bg-bb-gold text-black hover:scale-110 active:scale-90 shadow-lg'}`}>
                                            <span className="material-symbols-outlined font-black text-sm">add</span>
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* RIGHT: Sidebar (Tu Plantilla) */}
                <aside id="squad_list" className="w-[380px] bg-[#1a1a1a] border-l border-white/5 flex flex-col h-full shadow-2xl">
                    <div className="sticky top-0 z-20 p-6 space-y-5 bg-[#1a1a1a] border-b border-white/5">
                        <h2 className="text-[10px] font-black text-bb-gold uppercase tracking-[0.2em] italic mb-2">RESUMEN: {teamName || 'TU FRANQUICIA'}</h2>
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <span className="text-[9px] uppercase font-black text-slate-500 tracking-widest italic leading-none">Tesorería Inicial</span>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-3xl font-header font-black italic ${isBudgetNegative ? 'text-blood animate-pulse' : 'shimmer-text'}`}>{remainingBudget.toLocaleString()}</span>
                                    <small className="text-[10px] font-black text-bb-gold italic">gp</small>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Roster</span>
                                <div className={`text-2xl font-header font-black italic ${draftedPlayers.length < 11 ? 'text-blood' : 'text-white'}`}>{draftedPlayers.length} / 16</div>
                            </div>
                        </div>

                        <details className="group bg-black/40 rounded border border-white/5 overflow-hidden transition-all">
                            <summary className="flex items-center justify-between px-3 py-2 cursor-pointer list-none hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-bb-gold text-sm font-black">inventory_2</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Staff & Incentivos</span>
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
                                        <div className="flex items-center gap-2 bg-black/60 rounded p-0.5 border border-white/5">
                                            <button onClick={() => staff.set(Math.max(staff.min || 0, staff.val - 1))} className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-[10px] flex items-center justify-center font-black">-</button>
                                            <span className="text-[10px] font-mono font-black text-white w-3 text-center italic">{staff.val}</span>
                                            <button onClick={() => staff.set(staff.val + 1)} disabled={remainingBudget < staff.cost} className={`w-5 h-5 rounded border border-gold/20 text-gold flex items-center justify-center transition-all ${remainingBudget < staff.cost ? 'opacity-10' : 'bg-gold/10 hover:bg-gold hover:text-black font-black'}`}>+</button>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between py-2 border-t border-white/5">
                                    <span className="text-[8px] font-black uppercase text-slate-500 italic">Apoticario (50k)</span>
                                    <button onClick={() => setApothecary(!apothecary)} disabled={!apothecary && remainingBudget < 50000} className={`text-[8px] font-black px-4 py-1.5 rounded-full border tracking-widest italic transition-all ${apothecary ? 'bg-bb-gold text-black border-bb-gold' : 'text-gold bg-gold/5 border-gold/20'}`}>
                                        {apothecary ? 'SI' : 'NO'}
                                    </button>
                                </div>
                            </div>
                        </details>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scroll-area bg-black/10 no-scrollbar">
                        <div className="flex flex-col gap-1">
                            {draftedPlayers.map((p, idx) => (
                                <motion.div key={p.id} layout className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded px-3 py-1.5 flex items-center justify-between group hover:border-bb-gold/30 hover:bg-black/40 transition-all">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <span className="text-[9px] font-mono font-black text-bb-gold/30 shrink-0">#{String(idx + 1).padStart(2, '0')}</span>
                                        <span className="text-[10px] font-header font-black text-slate-300 italic uppercase tracking-tighter truncate leading-none">{p.position}</span>
                                    </div>
                                    <button onClick={() => handleFirePlayer(p.id as number)} className="w-5 h-5 flex items-center justify-center text-blood bg-blood/5 hover:bg-blood hover:text-white rounded transition-all shrink-0"><span className="material-symbols-outlined text-[14px] font-black">remove</span></button>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 border-t border-white/10 space-y-4 bg-[#1a1a1a]">
                        <div className="flex justify-between items-end border-b border-bb-gold/10 pb-4">
                            <span className="text-[10px] font-black uppercase text-slate-600 italic tracking-[0.2em]">VALOR EQUIPO</span>
                            <span className="text-3xl font-header font-black text-white italic tracking-tighter">{totalCost / 1000} <small className="text-xs text-bb-gold">TV</small></span>
                        </div>
                        <button 
                            disabled={!canFinalize}
                            onClick={handleSubmit}
                            className={`w-full py-5 rounded font-header font-black text-2xl tracking-tighter uppercase italic flex items-center justify-center gap-4 transition-all duration-300 shadow-xl ${canFinalize ? 'bg-bb-gold text-black hover:scale-[1.03] active:scale-95' : 'bg-white/5 text-white/10 border border-white/5 cursor-not-allowed opacity-20'}`}
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
            `}</style>
        </div>
    );
};

export default TeamCreator;
