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
            const scrollAmount = 400;
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
            <div className="flex flex-col items-center justify-center p-20 min-h-[60vh] bg-[#0a0a0a]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CA8A04] mb-4"></div>
                <p className="text-slate-400 font-display animate-pulse uppercase tracking-widest italic">Invocando al Comisario...</p>
            </div>
        );
    }

    // PHASE 1: DISCOVERY (NUFFLE GRIMDARK)
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
            <div className="min-h-screen w-full flex flex-col bg-[#0a0a0a] text-white font-inter overflow-x-hidden antialiased selection:bg-gold selection:text-black">
                {/* 1. FLUID RACE SELECTOR */}
                <nav className="w-full bg-black/40 backdrop-blur-md border-b border-white/5 py-4 px-8 sticky top-0 z-[100]">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-12">
                        <div className="flex flex-col">
                            <h2 className="text-[10px] font-black text-gold uppercase tracking-[0.4em] mb-1">Cátedra de Nuffle</h2>
                            <p className="text-[14px] font-header font-black text-white italic uppercase tracking-tighter">Elección de Franquicia</p>
                        </div>

                        <div className="relative flex-1 max-w-2xl px-12 group">
                             <button 
                                onClick={() => scrollCarousel('left')} 
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gold hover:bg-gold/10 rounded-full transition-all z-20"
                            >
                                <span className="material-symbols-outlined font-black">chevron_left</span>
                            </button>
                            
                            <div ref={carouselRef} className="flex items-center gap-8 overflow-x-auto no-scrollbar scroll-smooth snap-x py-2">
                                {filteredFactions.map((tm, idx) => {
                                    const masterIdx = rosterTemplates.findIndex(f => f.name === tm.name);
                                    const isSelected = selectedFactionIdx === masterIdx;
                                    return (
                                        <button 
                                            key={tm.name} 
                                            onClick={() => setSelectedFactionIdx(masterIdx)} 
                                            className={`flex-none flex flex-col items-center gap-3 group transition-all duration-500 snap-center outline-none ${isSelected ? 'scale-110' : 'opacity-30 grayscale hover:opacity-100 hover:grayscale-0'}`}
                                        >
                                            <div className={`w-16 h-16 rounded-2xl overflow-hidden bg-black/40 border transition-all duration-500 relative ${isSelected ? 'border-gold shadow-[0_0_25px_rgba(202,138,4,0.3)] rotate-0' : 'border-white/5 group-hover:border-white/20 -rotate-3 hover:rotate-0'}`}>
                                                <img src={tm.image} alt={tm.name} className="w-full h-full object-cover p-1" />
                                                {isSelected && (
                                                    <motion.div layoutId="active-bg" className="absolute inset-0 bg-gold/5 pointer-events-none" />
                                                )}
                                            </div>
                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${isSelected ? 'text-gold' : 'text-gray-600'}`}>{tm.name}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <button 
                                onClick={() => scrollCarousel('right')} 
                                className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gold hover:bg-gold/10 rounded-full transition-all z-20"
                            >
                                <span className="material-symbols-outlined font-black">chevron_right</span>
                            </button>
                        </div>

                        <div className="relative w-72 shrink-0">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gold/40 text-lg">search</span>
                            <input 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)} 
                                className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-[11px] tracking-widest text-white focus:ring-1 focus:ring-gold/50 transition-all placeholder:text-gray-700 outline-none uppercase font-bold" 
                                placeholder="RASTREAR RAZA..." 
                                type="text"
                            />
                        </div>
                    </div>
                </nav>

                <main className="max-w-[1600px] mx-auto px-10 pt-16 pb-64 grid grid-cols-1 md:grid-cols-12 gap-16 items-start relative">
                    {/* Background Illustration Glow */}
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={currentFaction.name}
                            initial={{ opacity: 0, scale: 0.8, x: 50 }}
                            animate={{ opacity: 0.1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 1.1, x: -50 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute right-0 top-32 w-[800px] h-[800px] pointer-events-none z-0 overflow-hidden"
                        >
                            <img 
                                src={currentFaction.image} 
                                alt="" 
                                className="w-full h-full object-contain filter grayscale invert"
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* CONTENT AREA (8 COLS) */}
                    <section className="col-span-12 lg:col-span-8 flex flex-col gap-12 relative z-10">
                        <motion.div 
                            key={currentFaction.name + '-info'}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <h1 className="text-7xl font-header font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-2xl">
                                {currentFaction.name}
                            </h1>
                            <p className="text-gold text-sm font-black tracking-[0.4em] uppercase italic opacity-70 border-l-2 border-gold pl-6 py-1">
                                {language === 'es' ? currentFaction.specialRules_es : currentFaction.specialRules_en}
                            </p>
                        </motion.div>

                        <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-1 shadow-2xl backdrop-blur-md overflow-hidden">
                            <div className="px-10 py-8 border-b border-white/5 bg-white/[0.01]">
                                <h3 className="text-2xl font-header font-black italic text-white uppercase tracking-tighter">Plantilla Base</h3>
                                <p className="text-gray-500 text-[9px] font-black tracking-[0.4em] uppercase mt-1">S3 Competitive Standard</p>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 text-[9px] text-gray-500 uppercase tracking-[0.3em] font-black">
                                            <th className="py-6 px-10">Posición / Jugador</th>
                                            <th className="py-6 px-2 text-center">MA</th>
                                            <th className="py-6 px-2 text-center">ST</th>
                                            <th className="py-6 px-2 text-center">AG</th>
                                            <th className="py-6 px-2 text-center">PA</th>
                                            <th className="py-6 px-2 text-center">AV</th>
                                            <th className="py-6 px-10 text-right">Coste Base</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentFaction.roster.map((pos, pidx) => (
                                            <tr key={pidx} className="border-b border-white/5 hover:bg-white/[0.02] transition-all group">
                                                <td className="py-6 px-10">
                                                    <div className="flex flex-col">
                                                        <span className="text-lg font-black text-white uppercase italic tracking-tighter group-hover:text-gold transition-colors">{pos.position}</span>
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {pos.skillKeys.length > 0 ? pos.skillKeys.slice(0, 5).map(sk => {
                                                                const skillObj = allSkills.find(s => s.keyEN === sk);
                                                                return (
                                                                    <button 
                                                                        key={sk} 
                                                                        onClick={() => skillObj && setSelectedSkill(skillObj)}
                                                                        className="px-2 py-0.5 bg-white/5 hover:bg-gold hover:text-black text-[8px] font-black rounded-sm uppercase tracking-widest text-gold transition-all"
                                                                    >
                                                                        {localizeSkill(sk)}
                                                                    </button>
                                                                );
                                                            }) : <span className="text-[8px] font-black uppercase text-gray-700">Roster Básico</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-2 text-center text-gray-400 font-mono font-bold text-base">{pos.stats.MV}</td>
                                                <td className="py-6 px-2 text-center text-gray-400 font-mono font-bold text-base">{pos.stats.FU}</td>
                                                <td className="py-6 px-2 text-center text-gray-400 font-mono font-bold text-base">{pos.stats.AG}</td>
                                                <td className="py-6 px-2 text-center text-gray-400 font-mono font-bold text-base">{pos.stats.PA}</td>
                                                <td className="py-6 px-2 text-center text-gray-400 font-mono font-bold text-base">{pos.stats.AR}</td>
                                                <td className="py-6 px-10 text-right">
                                                    <span className="font-header text-xl font-black text-gold italic">{(pos.cost / 1000).toLocaleString()}k</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] space-y-4">
                                <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.4em]">Resiliencia Histórica</h3>
                                <p className="text-gray-500 leading-relaxed text-sm italic font-medium">
                                    {language === 'es' 
                                        ? "El éxito en los campos de Nuffle no se mide solo en touchdowns, sino en el miedo que inspiras al desplazar la línea. Esta formación prioriza el control territorial y el impacto físico." 
                                        : "Success on Nuffle's fields is measured not just in touchdowns, but in the fear you inspire."}
                                </p>
                            </div>
                            <div className="bg-[#CA8A04]/10 border border-[#CA8A04]/20 p-8 rounded-[2rem] flex flex-col items-center justify-center text-center">
                                <span className="text-[10px] font-black text-gold uppercase tracking-[0.4em] mb-4 italic">Coste de Reroll</span>
                                <span className="text-5xl font-header font-black text-white italic tracking-tighter">{(currentFaction.rerollCost / 1000)}k <small className="text-xs text-gold ml-1">MO</small></span>
                            </div>
                        </div>
                    </section>

                    {/* SIDEBAR (4 COLS) */}
                    <aside className="col-span-12 lg:col-span-4 flex flex-col gap-10 sticky top-32 z-10">
                        {/* Radar Chart (The Diamond) */}
                        <div className="bg-[#111] p-10 border border-white/5 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <h3 className="text-[10px] font-black text-gold mb-12 uppercase tracking-[0.3em] flex items-center justify-between">
                                Perfil de Combate
                                <span className="px-3 py-1 bg-gold/10 rounded-full text-gold text-[8px] font-black uppercase italic">Tier {currentFaction.tier}</span>
                            </h3>
                            
                            <div className="relative aspect-square flex items-center justify-center p-8">
                                <svg className="w-full h-full overflow-visible" viewBox="-15 -15 130 130">
                                    {/* Grids */}
                                    <polygon className="stroke-white/5 fill-none" points="50,0 100,50 50,100 0,50" strokeWidth="0.5"></polygon>
                                    <polygon className="stroke-white/5 fill-none" points="50,25 75,50 50,75 25,50" strokeWidth="0.5"></polygon>
                                    <line x1="50" y1="0" x2="50" y2="100" className="stroke-white/5" strokeWidth="0.5"></line>
                                    <line x1="0" y1="50" x2="100" y2="50" className="stroke-white/5" strokeWidth="0.5"></line>
                                    
                                    {/* The Polygon */}
                                    <motion.polygon 
                                        key={currentFaction.name}
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="radar-fill fill-gold/30 stroke-gold" 
                                        points={radarPoints} 
                                        strokeWidth="2.5"
                                    ></motion.polygon>
                                    
                                    {/* Labels with fixed positions */}
                                    <text className="fill-white/60 text-[9px] font-black uppercase italic" textAnchor="middle" x="50" y="-12">ST (Fuerza)</text>
                                    <text className="fill-white/60 text-[9px] font-black uppercase italic" textAnchor="start" x="110" y="53">AV (Armadura)</text>
                                    <text className="fill-white/60 text-[9px] font-black uppercase italic" textAnchor="middle" x="50" y="118">MV (Vel)</text>
                                    <text className="fill-white/60 text-[9px] font-black uppercase italic" textAnchor="end" x="-10" y="53">AG (Agil)</text>
                                </svg>
                            </div>
                        </div>

                        {/* Star Players */}
                        <div className="flex flex-col gap-6">
                            <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em] flex items-center gap-4">
                                Jugadores Estrella
                                <div className="h-px flex-1 bg-white/5"></div>
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {factionStars.slice(0, 4).map((star, sidx) => (
                                    <div key={sidx} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl group cursor-pointer hover:bg-gold/5 hover:border-gold/20 transition-all">
                                        <div className="aspect-square bg-black/40 rounded-xl overflow-hidden mb-4 border border-white/5 ring-4 ring-black">
                                            <img src={star.image} alt={star.name} className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700" />
                                        </div>
                                        <p className="text-[9px] font-black text-center text-gray-500 group-hover:text-gold uppercase tracking-widest truncate">{star.name}</p>
                                    </div>
                                ))}
                                {factionStars.length === 0 && (
                                    <div className="col-span-2 py-12 text-center border border-dashed border-white/5 rounded-[2rem] opacity-30 text-[10px] uppercase font-black tracking-widest text-gray-700">
                                        Sin Contratos Estelares
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>
                </main>

                {/* ACTION FOOTER */}
                <footer className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/95 to-transparent p-10 pt-24 z-[50] pointer-events-none">
                    <div className="max-w-7xl mx-auto flex justify-center pointer-events-auto">
                        <button 
                            onClick={() => setStep('draft')}
                            className="bg-gold hover:bg-white text-black font-header italic font-black text-3xl px-32 py-6 tracking-tighter uppercase transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_60px_rgba(202,138,4,0.4)] relative group overflow-hidden rounded-[2.5rem]"
                        >
                            <span className="relative z-10 flex items-center gap-4">
                                <span className="material-symbols-outlined text-3xl font-black">token</span>
                                Fundar esta Franquicia
                            </span>
                            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:left-full transition-all duration-1000 ease-in-out"></div>
                        </button>
                    </div>
                </footer>

                <AnimatePresence>
                    {selectedSkill && <SkillModal skill={selectedSkill} onClose={() => setSelectedSkill(null)} />}
                </AnimatePresence>
                
                <style>{`
                    .radar-fill { filter: drop-shadow(0 0 8px #CA8A04); transition: all 1s ease; }
                    .custom-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                `}</style>
            </div>
        );
    }

    // PHASE 2: DRAFT
    return (
        <div className="h-screen w-full flex flex-col bg-[#0a0a0a] text-slate-100 overflow-hidden font-sans select-none">
            {/* Header */}
            <header className="flex-none bg-black border-b border-[#CA8A04]/20 px-6 py-3 z-50">
                <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-8 h-10">
                    <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => setStep('selection')} className="material-symbols-outlined text-[#CA8A04] mr-3 hover:scale-110 transition-transform font-black">arrow_back</button>
                        <span className="material-symbols-outlined text-[#CA8A04] text-2xl font-black">sports_football</span>
                        <h1 className="text-lg font-header font-black tracking-tight text-white uppercase italic leading-none">{currentFaction.name} - Mesa de Contratación</h1>
                    </div>
                    
                    <div className="flex items-center gap-6">
                         <div className="px-4 py-1.5 rounded-full border border-[#CA8A04]/30 bg-[#CA8A04]/5 flex items-center gap-3">
                            <span className="text-[10px] font-black text-[#CA8A04] uppercase tracking-widest italic">Race:</span>
                            <div className="w-5 h-5 rounded-full bg-cover bg-center border border-white/10" style={{ backgroundImage: currentFaction.image ? `url(${currentFaction.image})` : 'none' }}></div>
                            <span className="text-[10px] font-black text-white uppercase tracking-widest italic">{currentFaction.name}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* TEAM NAME SECTION */}
            <section className="flex-none px-6 py-3 bg-[#111111] border-b border-white/5">
                <div className="max-w-screen-2xl mx-auto flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-[#CA8A04]/60 uppercase tracking-[0.4em] ml-1">Nombre de la Franquicia</label>
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
                            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#CA8A04]/20 text-[#CA8A04] text-[9px] border border-[#CA8A04]/20 italic">2</span>
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
                                <motion.div layout key={idx} className={`bg-[#171717] border rounded-none p-4 flex items-center justify-between transition-all group ${isFull ? 'opacity-20 border-white/5' : 'border-white/5 hover:border-[#CA8A04]/30 hover:bg-zinc-900 shadow-xl'}`}>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-header font-black text-base uppercase italic tracking-tighter">{pos.position}</span>
                                            <div className="relative group/skill-tip">
                                                <span className="material-symbols-outlined text-slate-700 text-[12px] cursor-help hover:text-[#CA8A04] transition-colors font-black">info</span>
                                                {pos.skillKeys && pos.skillKeys.length > 0 && (
                                                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover/skill-tip:flex flex-wrap gap-1 p-2 bg-black border border-white/10 rounded shadow-2xl z-50 w-48 border-l-2 border-l-[#CA8A04] backdrop-blur-md">
                                                        {pos.skillKeys.map(sk => <span key={sk} className="text-[8px] font-black px-1.5 py-0.5 rounded bg-[#CA8A04]/10 text-[#CA8A04] uppercase border border-[#CA8A04]/20">{localizeSkill(sk)}</span>)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-4 text-[9px] font-mono font-bold italic">
                                            {['MV', 'FU', 'AG', 'PA', 'AR'].map(s => <div key={s} className="flex gap-1"><span className="text-slate-600">{s.replace('MV','MA').replace('FU','ST').replace('AR','AV')}</span><span className="text-slate-300">{(pos.stats as any)[s]}</span></div>)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <span className="text-lg font-header font-black text-[#CA8A04] italic">{pos.cost / 1000}k</span>
                                            <span className="block text-[8px] font-black text-slate-700 uppercase leading-none mt-1 italic">{count} / {limit}</span>
                                        </div>
                                        <button onClick={() => handleHirePlayer(pos)} disabled={isFull || !canAfford} className={`w-10 h-10 flex items-center justify-center transition-all ${isFull || !canAfford ? 'bg-zinc-900 text-zinc-800 cursor-not-allowed border border-white/5' : 'bg-[#CA8A04] text-black hover:scale-110 active:scale-90 shadow-lg font-black'}`}>
                                            <span className="material-symbols-outlined font-black text-lg">add</span>
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* RIGHT: Sidebar (Tu Plantilla) */}
                <aside id="squad_list" className="w-[400px] bg-[#1a1a1a] border-l border-white/5 flex flex-col h-full shadow-2xl">
                    <div className="sticky top-0 z-20 p-8 space-y-6 bg-[#1a1a1a] border-b border-white/5">
                        <h2 className="text-[11px] font-black text-[#CA8A04] uppercase tracking-[0.2em] italic mb-2">RESUMEN: {teamName || 'TU FRANQUICIA'}</h2>
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest italic leading-none">Tesorería Inicial</span>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-4xl font-header font-black italic ${isBudgetNegative ? 'text-red-600 animate-pulse' : 'shimmer-text'}`}>{remainingBudget.toLocaleString()}</span>
                                    <small className="text-[11px] font-black text-[#CA8A04] italic">gp</small>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Roster</span>
                                <div className={`text-3xl font-header font-black italic ${draftedPlayers.length < 11 ? 'text-red-700' : 'text-white'}`}>{draftedPlayers.length} / 16</div>
                            </div>
                        </div>

                        <details className="group bg-black/40 rounded-none border border-white/5 overflow-hidden transition-all">
                            <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[#CA8A04] text-base font-black">inventory_2</span>
                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">Staff & Incentivos</span>
                                </div>
                                <span className="material-symbols-outlined text-sm transition-transform group-open:rotate-180 font-black">expand_more</span>
                            </summary>
                            <div className="px-4 pb-4 pt-2 space-y-2">
                                {[
                                    { name: 'Rerolls', cost: currentFaction.rerollCost, val: rerolls, set: setRerolls },
                                    { name: 'Fan Factor', cost: 10000, val: dedicatedFans, set: setDedicatedFans, min: 1 },
                                ].map(staff => (
                                    <div key={staff.name} className="flex items-center justify-between py-2 border-t border-white/5">
                                        <span className="text-[9px] font-black uppercase text-slate-500 italic">{staff.name} ({staff.cost/1000}k)</span>
                                        <div className="flex items-center gap-3 bg-black/60 rounded-none p-1 border border-white/5">
                                            <button onClick={() => staff.set(Math.max(staff.min || 0, staff.val - 1))} className="w-6 h-6 bg-white/5 hover:bg-white/10 text-[12px] flex items-center justify-center font-black">-</button>
                                            <span className="text-[12px] font-mono font-black text-white w-4 text-center italic">{staff.val}</span>
                                            <button onClick={() => staff.set(staff.val + 1)} disabled={remainingBudget < staff.cost} className={`w-6 h-6 border border-[#CA8A04]/20 text-[#CA8A04] flex items-center justify-center transition-all ${remainingBudget < staff.cost ? 'opacity-10' : 'bg-[#CA8A04]/10 hover:bg-[#CA8A04] hover:text-black font-black'}`}>+</button>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between py-3 border-t border-white/5">
                                    <span className="text-[9px] font-black uppercase text-slate-500 italic">Apoticario (50k)</span>
                                    <button onClick={() => setApothecary(!apothecary)} disabled={!apothecary && remainingBudget < 50000} className={`text-[9px] font-black px-6 py-2 border tracking-widest italic transition-all ${apothecary ? 'bg-[#CA8A04] text-black border-[#CA8A04]' : 'text-[#CA8A04] bg-[#CA8A04]/5 border-[#CA8A04]/20'}`}>
                                        {apothecary ? 'SI' : 'NO'}
                                    </button>
                                </div>
                            </div>
                        </details>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scroll-area bg-black/10 no-scrollbar">
                        <div className="flex flex-col gap-2">
                            {draftedPlayers.map((p, idx) => (
                                <motion.div key={p.id} layout className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-none px-4 py-2.5 flex items-center justify-between group hover:border-[#CA8A04]/30 hover:bg-black/40 transition-all">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <span className="text-[10px] font-mono font-black text-[#CA8A04]/30 shrink-0">#{String(idx + 1).padStart(2, '0')}</span>
                                        <span className="text-[11px] font-header font-black text-slate-300 italic uppercase tracking-tighter truncate leading-none">{p.position}</span>
                                    </div>
                                    <button onClick={() => handleFirePlayer(p.id as number)} className="w-6 h-6 flex items-center justify-center text-red-600 bg-red-600/5 hover:bg-red-600 hover:text-white transition-all shrink-0"><span className="material-symbols-outlined text-base font-black">remove</span></button>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="p-10 border-t border-white/10 space-y-6 bg-[#1a1a1a]">
                        <div className="flex justify-between items-end border-b border-[#CA8A04]/10 pb-6">
                            <span className="text-[11px] font-black uppercase text-slate-600 italic tracking-[0.2em]">VALOR EQUIPO</span>
                            <span className="text-4xl font-header font-black text-white italic tracking-tighter">{totalCost / 1000} <small className="text-sm text-[#CA8A04]">TV</small></span>
                        </div>
                        <button 
                            disabled={!canFinalize}
                            onClick={handleSubmit}
                            className={`w-full py-6 font-header font-black text-3xl tracking-tighter uppercase italic flex items-center justify-center gap-5 transition-all duration-500 shadow-2xl ${canFinalize ? 'bg-[#CA8A04] text-black hover:scale-[1.02] active:scale-95 shimmer-btn' : 'bg-white/5 text-white/10 border border-white/5 cursor-not-allowed opacity-20'}`}
                        >
                            <span className="material-symbols-outlined text-3xl font-black">stadium</span>
                            CONFIRMAR FUNDACIÓN
                        </button>
                    </div>
                </aside>
            </main>

            <style>{`
                .shimmer-text { background: linear-gradient(90deg, #CA8A04 0%, #ffe4a3 50%, #CA8A04 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 4s infinite linear; }
                @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
                .shimmer-btn { position: relative; overflow: hidden; }
                .shimmer-btn::after { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent); transform: rotate(45deg); animation: shimmer-btn-anim 6s infinite linear; }
                @keyframes shimmer-btn-anim { 0% { transform: translate(-100%, -100%) rotate(45deg); } 100% { transform: translate(100%, 100%) rotate(45deg); } }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
};

export default TeamCreator;
