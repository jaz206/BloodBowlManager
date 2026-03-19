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
                {/* 1. COMPACT RACE SELECTOR */}
                <nav className="w-full bg-black/60 backdrop-blur-xl border-b border-white/5 py-4 px-8 sticky top-16 z-[100]">
                    <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-8">
                        <div className="flex flex-col shrink-0">
                            <h2 className="text-[9px] font-black text-gold uppercase tracking-[0.4em] mb-0.5">Cátedra de Nuffle</h2>
                            <p className="text-[12px] font-header font-black text-white italic uppercase tracking-tighter">Elección de Franquicia</p>
                        </div>

                        <div className="relative flex-1 max-w-xl px-10 group">
                             <button 
                                onClick={() => scrollCarousel('left')} 
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gold hover:bg-gold/10 rounded-full transition-all z-20"
                            >
                                <span className="material-symbols-outlined font-black text-sm">chevron_left</span>
                            </button>
                            
                            <div ref={carouselRef} className="flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x py-1">
                                {filteredFactions.map((tm, idx) => {
                                    const masterIdx = rosterTemplates.findIndex(f => f.name === tm.name);
                                    const isSelected = selectedFactionIdx === masterIdx;
                                    return (
                                        <button 
                                            key={tm.name} 
                                            onClick={() => setSelectedFactionIdx(masterIdx)} 
                                            className={`flex-none flex flex-col items-center gap-2 group transition-all duration-500 snap-center outline-none ${isSelected ? 'scale-105' : 'opacity-20 grayscale hover:opacity-100 hover:grayscale-0'}`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl overflow-hidden bg-black/40 border transition-all duration-500 relative ${isSelected ? 'border-gold shadow-[0_0_15px_rgba(202,138,4,0.3)] rotate-0' : 'border-white/5 group-hover:border-white/20 -rotate-3 hover:rotate-0'}`}>
                                                <img src={tm.image} alt={tm.name} className="w-full h-full object-cover p-1" />
                                                {isSelected && (
                                                    <motion.div layoutId="active-bg" className="absolute inset-0 bg-gold/5 pointer-events-none" />
                                                )}
                                            </div>
                                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-colors ${isSelected ? 'text-gold' : 'text-gray-600'}`}>{tm.name}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <button 
                                onClick={() => scrollCarousel('right')} 
                                className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gold hover:bg-gold/10 rounded-full transition-all z-20"
                            >
                                <span className="material-symbols-outlined font-black text-sm">chevron_right</span>
                            </button>
                        </div>

                        <div className="relative w-64 shrink-0">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gold/30 text-base">search</span>
                            <input 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)} 
                                className="w-full bg-white/5 border border-white/5 rounded-lg py-2 pl-10 pr-4 text-[10px] tracking-widest text-white focus:ring-1 focus:ring-gold/50 transition-all placeholder:text-gray-700 outline-none uppercase font-bold" 
                                placeholder="RASTREAR RAZA..." 
                                type="text"
                            />
                        </div>
                    </div>
                </nav>                <main className="max-w-[1500px] mx-auto px-6 pt-12 pb-48 grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative">
                    {/* Background Illustration Glow */}
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={currentFaction.name}
                            initial={{ opacity: 0, scale: 0.8, x: 50 }}
                            animate={{ opacity: 0.08, scale: 0.9, x: 0 }}
                            exit={{ opacity: 0, scale: 1.1, x: -50 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute right-0 top-24 w-[600px] h-[600px] pointer-events-none z-0 overflow-hidden"
                        >
                            <img 
                                src={currentFaction.image} 
                                alt="" 
                                className="w-full h-full object-contain filter grayscale invert"
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* CONTENT AREA (8 COLS) */}
                    <section className="col-span-12 xl:col-span-8 flex flex-col gap-8 relative z-10">
                        <motion.div 
                            key={currentFaction.name + '-info'}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3"
                        >
                            <h1 className="text-5xl font-header font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-2xl">
                                {currentFaction.name}
                            </h1>
                            <p className="text-gold text-[10px] font-black tracking-[0.4em] uppercase italic opacity-60 border-l-2 border-gold pl-4 py-0.5">
                                {language === 'es' ? currentFaction.specialRules_es : currentFaction.specialRules_en}
                            </p>
                        </motion.div>

                        <div className="bg-white/[0.03] border border-white/10 rounded-3xl shadow-2xl backdrop-blur-md overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-header font-black italic text-white uppercase tracking-tighter">Plantilla Base</h3>
                                    <p className="text-gray-500 text-[8px] font-black tracking-[0.4em] uppercase mt-0.5">S3 Competitive Standard</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[7px] font-bold text-gray-500 uppercase tracking-widest">Reroll Cost</span>
                                        <span className="text-lg font-header font-black text-gold italic">{(currentFaction.rerollCost / 1000)}k</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 text-[8px] text-gray-600 uppercase tracking-[0.3em] font-black bg-black/20">
                                            <th className="py-3 px-6">Posición</th>
                                            <th className="py-3 px-1 text-center">MA</th>
                                            <th className="py-3 px-1 text-center">ST</th>
                                            <th className="py-3 px-1 text-center">AG</th>
                                            <th className="py-3 px-1 text-center">PA</th>
                                            <th className="py-3 px-1 text-center">AV</th>
                                            <th className="py-3 px-6 text-right">Coste</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentFaction.roster.map((pos, pidx) => (
                                            <tr key={pidx} className="border-b border-white/5 hover:bg-white/[0.02] transition-all group">
                                                <td className="py-3 px-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-base font-black text-white uppercase italic tracking-tighter group-hover:text-gold transition-colors">{pos.position}</span>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {pos.skillKeys.length > 0 ? pos.skillKeys.slice(0, 4).map(sk => {
                                                                const skillObj = allSkills.find(s => s.keyEN === sk);
                                                                return (
                                                                    <button 
                                                                        key={sk} 
                                                                        onClick={() => skillObj && setSelectedSkill(skillObj)}
                                                                        className="px-1.5 py-0 bg-white/5 hover:bg-gold hover:text-black text-[7px] font-black rounded-sm uppercase tracking-widest text-gold/80 transition-all border border-gold/10"
                                                                    >
                                                                        {localizeSkill(sk)}
                                                                    </button>
                                                                );
                                                            }) : <span className="text-[7px] font-black uppercase text-gray-700">Roster Básico</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-1 text-center text-gray-400 font-mono font-bold text-sm">{pos.stats.MV}</td>
                                                <td className="py-3 px-1 text-center text-gray-400 font-mono font-bold text-sm">{pos.stats.FU}</td>
                                                <td className="py-3 px-1 text-center text-gray-400 font-mono font-bold text-sm">{pos.stats.AG}</td>
                                                <td className="py-3 px-1 text-center text-gray-400 font-mono font-bold text-sm">{pos.stats.PA}</td>
                                                <td className="py-3 px-1 text-center text-gray-400 font-mono font-bold text-sm">{pos.stats.AR}</td>
                                                <td className="py-3 px-6 text-right">
                                                    <span className="font-header text-lg font-black text-gold italic">{(pos.cost / 1000).toLocaleString()}k</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-3">
                                <h3 className="text-[9px] font-black text-gold uppercase tracking-[0.4em]">Resiliencia Histórica</h3>
                                <p className="text-gray-500 leading-relaxed text-xs italic font-medium">
                                    {language === 'es' 
                                        ? "El éxito en los campos de Nuffle no se mide solo en touchdowns, sino en el miedo que inspiras al desplazar la línea. Esta formación prioriza el control territorial y el impacto físico." 
                                        : "Success on Nuffle's fields is measured not just in touchdowns, but in the fear you inspire."}
                                </p>
                            </div>
                            <div className="bg-gold/5 border border-gold/20 p-6 rounded-2xl flex flex-col items-center justify-center text-center group hover:bg-gold/10 transition-colors">
                                <span className="text-[8px] font-black text-gold uppercase tracking-[0.4em] mb-2 italic opacity-60">Status Tier</span>
                                <span className="text-3xl font-header font-black text-white italic tracking-tighter">Tier {currentFaction.tier}</span>
                            </div>
                        </div>
                    </section>

                    {/* SIDEBAR (4 COLS) */}
                    <aside className="col-span-12 xl:col-span-4 flex flex-col gap-8 sticky top-32 z-10 lg:pl-10">
                        {/* Radar Chart (The Diamond) - Compact */}
                        <div className="bg-[#0c0c0c] p-8 border border-white/5 rounded-3xl shadow-3xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <h3 className="text-[9px] font-black text-gold mb-8 uppercase tracking-[0.3em] flex items-center justify-between">
                                Análisis Atributivo
                            </h3>
                            
                            <div className="relative aspect-square flex items-center justify-center p-4">
                                <svg className="w-full h-full max-w-[200px] overflow-visible" viewBox="-15 -15 130 130">
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
                                        className="radar-fill fill-gold/20 stroke-gold/60" 
                                        points={radarPoints} 
                                        strokeWidth="2"
                                    ></motion.polygon>
                                    
                                    {/* Labels with fixed positions */}
                                    <text className="fill-white/40 text-[8px] font-black uppercase italic" textAnchor="middle" x="50" y="-12">ST</text>
                                    <text className="fill-white/40 text-[8px] font-black uppercase italic" textAnchor="start" x="110" y="53">AV</text>
                                    <text className="fill-white/40 text-[8px] font-black uppercase italic" textAnchor="middle" x="50" y="118">MV</text>
                                    <text className="fill-white/40 text-[8px] font-black uppercase italic" textAnchor="end" x="-10" y="53">AG</text>
                                </svg>
                            </div>
                        </div>

                        {/* Star Players - Compact Grid */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] flex items-center gap-4">
                                Staff Estelar
                                <div className="h-px flex-1 bg-white/5"></div>
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                {factionStars.slice(0, 6).map((star, sidx) => (
                                    <div key={sidx} className="bg-white/[0.02] border border-white/5 p-2 rounded-xl group cursor-pointer hover:bg-gold/5 hover:border-gold/20 transition-all">
                                        <div className="aspect-square bg-black/40 rounded-lg overflow-hidden mb-2 border border-white/5">
                                            <img src={star.image} alt={star.name} className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-opacity opacity-60 group-hover:opacity-100" />
                                        </div>
                                        <p className="text-[7px] font-black text-center text-gray-600 group-hover:text-gold uppercase tracking-tighter truncate">{star.name}</p>
                                    </div>
                                ))}
                                {factionStars.length === 0 && (
                                    <div className="col-span-3 py-8 text-center border border-dashed border-white/5 rounded-2xl opacity-20 text-[8px] uppercase font-black tracking-widest text-gray-700">
                                        Sin Contratos
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>
                </main>

                {/* ACTION FOOTER - DYNAMIC ISLAND PILL */}
                <footer className="fixed bottom-8 left-0 w-full flex justify-center z-[110] pointer-events-none">
                    <div className="pointer-events-auto">
                        <button 
                            onClick={() => setStep('draft')}
                            className="bg-gold hover:bg-white text-black font-header italic font-black text-xl px-20 py-4 tracking-tighter uppercase transition-all transform hover:scale-105 active:scale-95 shadow-[0_15px_40px_rgba(202,138,4,0.3)] relative group overflow-hidden rounded-full flex items-center gap-3 border border-black/10"
                        >
                            <span className="material-symbols-outlined text-2xl font-black">token</span>
                            <span>Fundar esta Franquicia</span>
                            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:left-full transition-all duration-1000 ease-in-out"></div>
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

    // PHASE 2: DRAFT (NUFFLE COMMISSARY)
    return (
        <div className="h-screen w-full flex flex-col bg-[#0a0a0a] text-gray-200 overflow-hidden font-inter select-none">
            {/* Header / Command Center - COMPACT */}
            <header className="flex-none bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-3 z-50">
                <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setStep('selection')} 
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gold hover:bg-gold hover:text-black transition-all group"
                        >
                            <span className="material-symbols-outlined text-sm font-black group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                        </button>
                        <div className="flex flex-col">
                            <h1 className="text-[9px] font-black text-gold uppercase tracking-[0.4em] leading-none mb-0.5">Mesa de Contratación</h1>
                            <p className="text-sm font-header font-black text-white italic uppercase tracking-tighter">{currentFaction.name}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                         <div className="px-4 py-1 rounded-xl border border-white/5 bg-white/[0.02] flex items-center gap-3">
                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest italic">Race:</span>
                            <img src={currentFaction.image} className="w-4 h-4 object-contain grayscale opacity-50" alt="" />
                            <span className="text-[8px] font-black text-white uppercase tracking-widest italic">{currentFaction.name}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* TEAM NAME HERO - REDUCED SCALE */}
            <section className="flex-none px-6 py-6 bg-[#111] border-b border-white/5">
                <div className="max-w-screen-2xl mx-auto">
                    <div className="max-w-xl">
                        <label className="text-[8px] font-black text-gold uppercase tracking-[0.5em] ml-1 mb-2 block opacity-50">Designación de la Franquicia</label>
                        <input 
                            className="w-full bg-transparent border-none p-0 text-3xl font-header font-black text-white italic placeholder:text-zinc-800 outline-none uppercase tracking-tighter selection:bg-gold selection:text-black" 
                            placeholder="ESCRIBE EL NOMBRE..." 
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            maxLength={40}
                            autoFocus
                        />
                    </div>
                </div>
            </section>

            {/* MAIN COMMAND INTERFACE */}
            <main className="flex-1 flex overflow-hidden">
                {/* MARKET: Player Recruitment - DENSER GRID */}
                <section className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
                    <div className="flex items-center gap-3">
                        <h2 className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] italic">Mercado de Jugadores</h2>
                        <div className="h-px flex-1 bg-white/5"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                        {currentFaction.roster.map((pos, idx) => {
                            const count = draftedPlayers.filter(p => p.position === pos.position).length;
                            const limitStr = pos.qty.split('-')[1] || pos.qty;
                            const limit = parseInt(limitStr);
                            const isFull = count >= limit;
                            const canAfford = remainingBudget >= pos.cost;

                            return (
                                <motion.div 
                                    layout 
                                    key={idx} 
                                    className={`relative bg-[#141414] border rounded-2xl p-4 flex flex-col justify-between transition-all group overflow-hidden ${
                                        isFull 
                                        ? 'opacity-30 border-white/5' 
                                        : 'border-white/5 hover:border-gold/30 hover:bg-[#1a1a1a] shadow-xl'
                                    }`}
                                >
                                    {isFull && <div className="absolute inset-0 bg-black/40 backdrop-grayscale pointer-events-none z-10" />}
                                    
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-header font-black text-white uppercase italic tracking-tighter group-hover:text-gold transition-colors truncate max-w-[120px]">{pos.position}</span>
                                                <div className="relative group/skill-tip">
                                                    <span className="material-symbols-outlined text-gray-700 text-[12px] cursor-help hover:text-gold transition-colors font-black">help</span>
                                                    {pos.skillKeys && pos.skillKeys.length > 0 && (
                                                        <div className="absolute bottom-full left-0 mb-3 hidden group-hover/skill-tip:flex flex-wrap gap-1 p-3 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-50 w-48 backdrop-blur-xl">
                                                            {pos.skillKeys.map(sk => {
                                                                const skillFound = allSkills.find(s => s.keyEN === sk);
                                                                return (
                                                                    <span 
                                                                        key={sk} 
                                                                        onClick={() => skillFound && setSelectedSkill(skillFound)}
                                                                        className="text-[7px] font-black px-1.5 py-0.5 rounded bg-gold/10 text-gold uppercase border border-gold/10 tracking-widest cursor-pointer hover:bg-gold hover:text-black transition-all"
                                                                    >
                                                                        {localizeSkill(sk)}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-sm font-header font-black text-gold italic">{pos.cost / 1000}k</span>
                                                <span className="text-[7px] font-black text-gold/30">MO</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleHirePlayer(pos)} 
                                            disabled={isFull || !canAfford} 
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                                isFull || !canAfford 
                                                ? 'bg-white/[0.02] text-white/5 cursor-not-allowed border border-white/5' 
                                                : 'bg-gold text-black hover:scale-110 active:scale-95 shadow-lg shadow-gold/10 font-black'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined font-black text-lg">person_add</span>
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                        <div className="flex gap-2">
                                            {['MV', 'FU', 'AG', 'PA', 'AR'].map(s => (
                                                <div key={s} className="flex flex-col items-center">
                                                    <span className="text-[6px] font-black text-gray-700 uppercase">{s.replace('MV','MA').replace('FU','ST').replace('AR','AV')}</span>
                                                    <span className="text-[10px] font-mono font-bold text-gray-500">{(pos.stats as any)[s]}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest italic">{count} / {limit}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* SIDEBAR: Command Status - COMPACT WIDTH */}
                <aside id="squad_list" className="w-[340px] bg-[#111] border-l border-white/5 flex flex-col h-full shadow-inner">
                    {/* 1. Treasury Summary - Top Fixed */}
                    <div className="p-5 bg-[#111] border-b border-white/5">
                        <span className="text-[8px] uppercase font-black text-gray-600 tracking-[0.4em] italic mb-1 block">Tesorería Inicial</span>
                        <div className="flex items-baseline gap-1.5">
                            <span className={`text-2xl font-header font-black italic tracking-tighter ${isBudgetNegative ? 'text-blood animate-pulse' : 'text-white'}`}>
                                {remainingBudget.toLocaleString()}
                            </span>
                            <small className="text-[10px] font-black text-gold italic">MO</small>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <div className="bg-white/[0.02] border border-white/5 p-2 rounded-lg">
                                <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest block">Roster</span>
                                <span className={`text-sm font-header font-black italic ${draftedPlayers.length < 11 ? 'text-blood' : 'text-gold'}`}>{draftedPlayers.length} / 16</span>
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 p-2 rounded-lg">
                                <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest block">VAE</span>
                                <span className="text-sm font-header font-black italic text-white">{(totalCost / 1000).toLocaleString()}k</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. SQUAD LIST (Scrollable priority) */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-2 no-scrollbar bg-black/10">
                         <div className="flex items-center gap-2 mb-2">
                            <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest">Contrataciones</span>
                            <div className="h-px flex-1 bg-white/5"></div>
                        </div>
                        <AnimatePresence>
                            {draftedPlayers.map((p, idx) => (
                                <motion.div 
                                    key={p.id} 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white/[0.02] border border-white/5 rounded-lg p-2 flex items-center justify-between group hover:border-gold/20 transition-all shadow-sm"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <span className="text-[8px] font-mono font-black text-gold/20 shrink-0">#{String(idx + 1).padStart(2, '0')}</span>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-header font-black text-white italic uppercase tracking-tighter truncate leading-none">{p.position}</span>
                                            <span className="text-[7px] font-black text-gold/30 uppercase">{(p.cost/1000)}k</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleFirePlayer(p.id as number)} 
                                        className="w-6 h-6 rounded flex items-center justify-center text-gray-700 hover:bg-blood hover:text-white transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[12px]">close</span>
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {draftedPlayers.length === 0 && (
                            <div className="py-6 text-center border border-dashed border-white/5 rounded-xl opacity-10">
                                <p className="text-[7px] font-black uppercase tracking-widest italic leading-none">Esperando Reclutas</p>
                            </div>
                        )}
                    </div>

                    {/* 3. INCENTIVOS (Bottom Sticky area) */}
                    <div className="p-5 border-t border-white/5 space-y-3 bg-[#111]">
                        <h3 className="text-[8px] font-black text-gray-600 uppercase tracking-[0.4em] italic">Incentivos</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { name: 'Rerolls', cost: currentFaction.rerollCost, val: rerolls, set: setRerolls, icon: 'refresh' },
                                { name: 'Fans', cost: 10000, val: dedicatedFans, set: setDedicatedFans, min: 1, icon: 'groups' },
                            ].map(staff => (
                                <div key={staff.name} className="flex items-center justify-between group bg-black/20 p-2 rounded-lg border border-white/5">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-gray-700 text-[14px]">{(staff as any).icon}</span>
                                        <p className="text-[8px] font-black uppercase text-gray-400 italic tracking-widest">{staff.name}</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/5 rounded p-1">
                                        <button onClick={() => staff.set(Math.max(staff.min || 0, staff.val - 1))} className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-[10px] flex items-center justify-center">-</button>
                                        <span className="text-[10px] font-mono font-black text-gold w-4 text-center italic">{staff.val}</span>
                                        <button onClick={() => staff.set(staff.val + 1)} disabled={remainingBudget < staff.cost} className={`w-5 h-5 rounded border border-gold/20 text-gold flex items-center justify-center transition-all ${remainingBudget < staff.cost ? 'opacity-10' : 'bg-gold/10 hover:bg-gold hover:text-black'}`}>+</button>
                                    </div>
                                </div>
                            ))}
                            <button 
                                onClick={() => setApothecary(!apothecary)} 
                                disabled={!apothecary && remainingBudget < 50000} 
                                className={`w-full py-2 rounded-lg text-[8px] font-black tracking-[0.1em] italic transition-all border ${
                                    apothecary 
                                    ? 'bg-gold text-black border-gold shadow-md' 
                                    : 'text-gray-500 bg-white/5 border-white/10 hover:border-gold/30 hover:text-gold'
                                }`}
                            >
                                {apothecary ? 'APOTICARIO ADQUIRIDO' : 'APOTICARIO (+50K)'}
                            </button>
                        </div>
                    </div>

                    {/* FINAL ACTION - COMPACT */}
                    <div className="p-5 border-t border-white/10 bg-black">
                        <button 
                            disabled={!canFinalize}
                            onClick={handleSubmit}
                            className={`w-full py-4 rounded-xl font-header font-black text-lg tracking-tighter uppercase italic flex items-center justify-center gap-3 transition-all duration-500 ${
                                canFinalize 
                                ? 'bg-gold text-black hover:scale-[1.01] active:scale-95 shadow-lg shadow-gold/20' 
                                : 'bg-white/5 text-gray-800 border border-white/5 cursor-not-allowed'
                            }`}
                        >
                            <span className="material-symbols-outlined text-lg font-black">gavel</span>
                            Sellar Franquicia
                        </button>
                    </div>
                </aside>
            </main>

            <AnimatePresence>
                {selectedSkill && <SkillModal skill={selectedSkill} onClose={() => setSelectedSkill(null)} />}
            </AnimatePresence>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .shimmer-text { background: linear-gradient(90deg, #CA8A04 0%, #ffe4a3 50%, #CA8A04 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 4s infinite linear; }
                @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
            `}</style>
        </div>
    );
};

export default TeamCreator;
