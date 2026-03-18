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

    // PHASE 1: DISCOVERY (Grimdark Artifact Edition)
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
            <div className="min-h-screen w-full flex flex-col bg-bb-dark text-bb-parchment font-inter overflow-x-hidden antialiased">
                {/* Artifact Navigation Carousel */}
                <nav className="w-full bg-black border-b-2 border-bb-gold/30 py-3 px-8 relative z-50">
                    <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-8 text-center">
                        <div className="flex items-center gap-4 flex-1 overflow-hidden relative px-10">
                            <button onClick={() => scrollCarousel('left')} className="absolute left-0 text-bb-gold hover:text-white transition-all transform hover:scale-110 z-10 w-8 h-8 flex items-center justify-center">
                                <span className="material-symbols-outlined text-4xl ornate-arrow">chevron_left</span>
                            </button>
                            <div ref={carouselRef} className="flex items-center gap-8 overflow-x-auto no-scrollbar scroll-smooth snap-x">
                                {filteredFactions.map((tm, idx) => {
                                    const masterIdx = rosterTemplates.findIndex(f => f.name === tm.name);
                                    const isSelected = selectedFactionIdx === masterIdx;
                                    return (
                                        <button key={tm.name} onClick={() => setSelectedFactionIdx(masterIdx)} className={`flex-none flex flex-col items-center gap-2 group transition-opacity snap-center ${!isSelected && 'opacity-60 hover:opacity-100'}`}>
                                            <div className={`artifact-shield w-14 h-14 rounded-full overflow-hidden flex items-center justify-center p-1 transition-all duration-500 ${isSelected ? 'selected' : ''}`}>
                                                <img src={tm.image} alt={tm.name} className={`w-full h-full object-cover rounded-full transition-all duration-700 ${isSelected ? 'grayscale-0' : 'grayscale'}`} />
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-[0.15em] font-epilogue ${isSelected ? 'text-bb-gold' : 'text-gray-600'}`}>{tm.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <button onClick={() => scrollCarousel('right')} className="absolute right-0 text-bb-gold hover:text-white transition-all transform hover:scale-110 z-10 w-8 h-8 flex items-center justify-center">
                                <span className="material-symbols-outlined text-4xl ornate-arrow">chevron_right</span>
                            </button>
                        </div>
                        <div className="relative w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-bb-gold/50 text-lg">search</span>
                            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-zinc-900/80 border border-bb-gold/20 rounded-none py-2 pl-9 pr-4 text-[9px] tracking-[0.2em] text-bb-gold focus:border-bb-gold focus:ring-0 transition-all placeholder:text-zinc-700 font-bold uppercase outline-none" placeholder="RASTREAR RAZA..." type="text"/>
                        </div>
                    </div>
                </nav>

                <header className="w-full pt-8 pb-6 text-center">
                    <div className="inline-block relative">
                        <motion.h1 
                            key={currentFaction.name}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="font-epilogue text-7xl italic tracking-tighter text-white animate-glow uppercase relative z-10"
                        >
                            {currentFaction.name}
                        </motion.h1>
                        <div className="absolute -inset-x-12 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-bb-gold/30 to-transparent -translate-y-1/2 blur-[2px]"></div>
                    </div>
                    <p className="text-bb-gold mt-3 text-lg tracking-[0.2em] uppercase font-light opacity-80 font-epilogue italic">
                        {language === 'es' ? currentFaction.specialRules_es : currentFaction.specialRules_en}
                    </p>
                </header>

                <main className="max-w-[1600px] mx-auto px-8 pb-40 grid grid-cols-12 gap-8 items-stretch flex-1">
                    {/* Attributes & Lore */}
                    <section className="col-span-12 lg:col-span-3 flex flex-col gap-12">
                        <div className="panel-grimdark panel-filigree p-8 shadow-2xl">
                            <h3 className="text-sm font-black text-bb-gold mb-8 uppercase tracking-[0.2em] border-b border-bb-gold/20 pb-2 italic">Eficacia de Combate</h3>
                            <div className="relative aspect-square flex items-center justify-center">
                                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100">
                                    <polygon className="stroke-bb-gold/30 fill-none" points="50,5 95,50 50,95 5,50" strokeWidth="0.5"></polygon>
                                    <polygon className="stroke-bb-gold/30 fill-none" points="50,25 75,50 50,75 25,50" strokeWidth="0.5"></polygon>
                                    <polygon className="fill-bb-gold/20 stroke-bb-gold" points={radarPoints} strokeWidth="2"></polygon>
                                    <text className="fill-bb-parchment text-[6px] font-bold uppercase" textAnchor="middle" x="50" y="-3">Fuerza</text>
                                    <text className="fill-bb-parchment text-[6px] font-bold uppercase" textAnchor="start" x="98" y="52">Armadura</text>
                                    <text className="fill-bb-parchment text-[6px] font-bold uppercase" textAnchor="middle" x="50" y="106">Velocidad</text>
                                    <text className="fill-bb-parchment text-[6px] font-bold uppercase" textAnchor="end" x="2" y="52">Agilidad</text>
                                </svg>
                            </div>
                            <div className="mt-8 pt-4 border-t border-bb-gold/10 text-center">
                                <p className="text-[10px] text-bb-gold uppercase tracking-widest font-black italic">Riesgo Táctico: {currentFaction.tier === 1 ? 'Mínimo' : currentFaction.tier === 2 ? 'Equilibrado' : 'Crítico'}</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-bb-gold uppercase tracking-[0.2em] flex items-center gap-2 italic">
                                <span className="w-8 h-[2px] bg-bb-gold"></span>
                                Ecos del Campo
                            </h3>
                            <div className="bg-[#15120c] p-6 border-l-4 border-bb-gold shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-bb-gold/5 rounded-full blur-3xl"></div>
                                <p className="text-bb-parchment leading-relaxed text-sm italic font-medium text-justify relative z-10">
                                    {language === 'es' 
                                        ? "Su paso por la NAF está marcado por una resistencia legendaria y una falta total de sutileza. No buscan el hueco; crean el hueco a través de las costillas del oponente."
                                        : "Their path through the NAF is marked by legendary resilience and a total lack of subtlety. They don't look for the gap; they create it through their opponent's ribs."
                                    }
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Roster Table */}
                    <section className="col-span-12 lg:col-span-6">
                        <div className="panel-grimdark panel-filigree p-10 h-full">
                            <div className="flex items-center justify-between mb-10 border-b-2 border-bb-gold/40 pb-4">
                                <h3 className="text-3xl font-epilogue italic text-white uppercase tracking-tighter">Legión de Hierro</h3>
                                <span className="text-bb-gold text-[10px] font-bold tracking-[0.4em] uppercase opacity-60">Roster Oficial NAF</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-[11px] text-bb-gold uppercase tracking-widest bg-black/40">
                                            <th className="py-5 px-4 font-black italic">Guerrero</th>
                                            <th className="py-5 px-2 text-center">MA</th>
                                            <th className="py-5 px-2 text-center">ST</th>
                                            <th className="py-5 px-2 text-center">AG</th>
                                            <th className="py-5 px-2 text-center">PA</th>
                                            <th className="py-5 px-2 text-center">AV</th>
                                            <th className="py-5 px-4 font-black">Bendiciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm font-medium">
                                        {currentFaction.roster.map((pos, pidx) => (
                                            <tr key={pidx} className="border-b border-bb-gold/10 hover:bg-bb-gold/5 transition-colors group">
                                                <td className="py-5 px-4 font-bold text-white uppercase tracking-wide italic">{pos.position}</td>
                                                <td className="py-5 px-2 text-center text-bb-parchment font-mono">{pos.stats.MV}</td>
                                                <td className="py-5 px-2 text-center text-bb-parchment font-mono">{pos.stats.FU}</td>
                                                <td className="py-5 px-2 text-center text-bb-parchment font-mono">{pos.stats.AG}</td>
                                                <td className="py-5 px-2 text-center text-bb-parchment font-mono">{pos.stats.PA}</td>
                                                <td className="py-5 px-2 text-center text-bb-parchment font-mono">{pos.stats.AR}</td>
                                                <td className="py-5 px-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {pos.skillKeys.length > 0 ? pos.skillKeys.slice(0, 3).map(sk => (
                                                            <span key={sk} className="px-3 py-1 bg-bb-gold text-black text-[9px] font-black rounded-sm uppercase italic shadow-sm">{localizeSkill(sk)}</span>
                                                        )) : <span className="px-3 py-1 bg-zinc-800 text-gray-500 text-[9px] font-black rounded-sm uppercase italic">Básico</span>}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* Star Players */}
                    <section className="col-span-12 lg:col-span-3 flex flex-col h-full">
                        <h3 className="text-sm font-black text-bb-gold uppercase tracking-[0.3em] mb-6 flex items-center justify-between italic leading-none">
                            Gladiadores Eternos
                            <span className="material-symbols-outlined text-bb-gold">stars</span>
                        </h3>
                        <div className="flex-1 panel-grimdark panel-filigree p-6 overflow-hidden flex flex-col backdrop-blur-sm">
                            <div className="grid grid-cols-2 gap-6 overflow-y-auto pr-2 custom-scrollbar max-h-[600px]">
                                {factionStars.map((star, sidx) => (
                                    <button key={sidx} className="flex flex-col items-center group focus:outline-none">
                                        <div className="relative w-full aspect-[3/4] bg-zinc-900 border-2 border-bb-gold/40 p-1 mb-3 shadow-[0_5px_15px_rgba(0,0,0,0.5)] transform transition-all group-hover:-translate-y-2 group-hover:border-bb-gold">
                                            <img src={star.image} alt={star.name} className="object-cover w-full h-full spectral-filter grayscale group-hover:grayscale-0 transition-all duration-700" />
                                            <div className="absolute inset-0 border border-white/10 pointer-events-none"></div>
                                        </div>
                                        <span className="font-epilogue text-[10px] italic font-black text-bb-gold uppercase text-center leading-tight tracking-tighter opacity-60 group-hover:opacity-100">{star.name}</span>
                                    </button>
                                ))}
                                {factionStars.length < 3 && Array(3 - factionStars.length).fill(0).map((_, i) => (
                                    <div key={i} className="flex flex-col items-center group opacity-20">
                                        <div className="relative w-full aspect-[3/4] bg-zinc-900/50 border-2 border-bb-gold/10 p-1 mb-3 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-bb-gold/30 text-4xl">skull</span>
                                        </div>
                                        <span className="font-epilogue text-[10px] italic font-black text-gray-700 uppercase">Incógnito</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="fixed bottom-0 left-0 w-full bg-black/95 border-t-2 border-bb-gold/30 p-5 z-[100] backdrop-blur-md">
                    <div className="max-w-[1600px] mx-auto flex justify-center">
                        <button 
                            onClick={() => setStep('draft')}
                            className="btn-coin px-24 py-4 transition-all transform hover:scale-105 active:scale-95 group relative overflow-hidden"
                        >
                            <div className="flex flex-col items-center relative z-10">
                                <span className="font-epilogue italic font-black text-2xl text-black uppercase tracking-tighter leading-none">
                                    Fundar esta Franquicia
                                </span>
                                <span className="text-[8px] text-black/50 font-black uppercase tracking-[0.4em] mt-0.5">Sello Real de Nufflé</span>
                            </div>
                        </button>
                    </div>
                </footer>

                <style>{`
                    .animate-glow { animation: glow 4s infinite ease-in-out }
                    @keyframes glow { 0%, 100% { text-shadow: 0 0 15px rgba(202, 138, 4, 0.3); } 50% { text-shadow: 0 0 30px rgba(202, 138, 4, 0.6); } }
                    .panel-grimdark { background: linear-gradient(145deg, #121212, #080808); border: 2px solid #332b1a; position: relative; box-shadow: inset 0 0 40px rgba(0,0,0,0.8); }
                    .panel-filigree::before { content: ""; position: absolute; top: -4px; left: -4px; right: -4px; bottom: -4px; border: 1px solid #CA8A04; opacity: 0.15; pointer-events: none; mask-image: linear-gradient(45deg, black 25%, transparent 25%, transparent 50%, black 50%, black 75%, transparent 75%, transparent); mask-size: 8px 8px; }
                    .artifact-shield { border: 3px solid #3f3f3f; background: radial-gradient(circle, #2a2a2a 0%, #000 100%); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                    .artifact-shield.selected { border-color: #CA8A04; box-shadow: 0 0 25px rgba(202, 138, 4, 0.4), inset 0 0 15px rgba(202, 138, 4, 0.2); transform: scale(1.1) rotate(2deg); }
                    .btn-coin { background: radial-gradient(circle at center, #f59e0b 0%, #b45309 70%, #78350f 100%); border: 4px double #451a03; box-shadow: 0 10px 30px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.4); text-shadow: 2px 2px 2px rgba(0,0,0,0.3); }
                    .spectral-filter { filter: sepia(0.4) contrast(1.3) brightness(0.7) grayscale(0.2); }
                    .ornate-arrow { font-variation-settings: 'FILL' 1, 'wght' 700, 'GRAD' 0, 'opsz' 48; text-shadow: 0 0 12px #CA8A04; }
                    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #CA8A04; border-radius: 2px; }
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                `}</style>
            </div>
        );
    }

    // PHASE 2: DRAFT (Control Panel - S3 High Fidelity)
    return (
        <div className="h-screen w-full flex flex-col bg-[#0a0a0a] text-bb-parchment overflow-hidden font-sans select-none">
            {/* Header: Fixed top summary */}
            <header className="flex-none bg-black border-b-2 border-bb-gold/30 px-6 py-3 z-50">
                <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-8 h-12">
                    <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => setStep('selection')} className="material-symbols-outlined text-bb-gold mr-4 hover:scale-110 transition-transform font-black">arrow_back</button>
                        <span className="material-symbols-outlined text-bb-gold text-2xl font-black">sports_football</span>
                        <h1 className="text-xl font-header font-black tracking-tight text-white uppercase italic leading-none">{currentFaction.name} - Mesa de Contratación</h1>
                    </div>
                    
                    <div className="flex items-center gap-6">
                         <div className="px-5 py-2 rounded-none border border-bb-gold/30 bg-bb-gold/5 flex items-center gap-4">
                            <span className="text-[10px] font-black text-bb-gold uppercase tracking-[0.2em] italic">Estandarte:</span>
                            <div className="w-6 h-6 rounded-full bg-cover bg-center border border-bb-gold/20" style={{ backgroundImage: currentFaction.image ? `url(${currentFaction.image})` : 'none' }}></div>
                            <span className="text-[11px] font-black text-white uppercase tracking-widest italic">{currentFaction.name}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* TEAM NAME SECTION (Separator) */}
            <section className="flex-none px-6 py-4 bg-[#121212] border-b border-bb-gold/10 shadow-inner">
                <div className="max-w-screen-2xl mx-auto flex flex-col gap-1">
                    <label className="text-[10px] font-black text-bb-gold/40 uppercase tracking-[0.4em] ml-1">Bautismo de la Franquicia</label>
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
                <section className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xs font-header font-black text-bb-gold/60 uppercase tracking-widest flex items-center gap-3 italic">
                            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-bb-gold/10 text-bb-gold text-[10px] border border-bb-gold/20 italic">2</span>
                            Reclutamiento de Reos y Héroes
                        </h2>
                        <span className="text-[9px] text-zinc-600 italic uppercase tracking-widest opacity-60">"Hierro y sangre por la gloria eterna"</span>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 pb-24">
                        {currentFaction.roster.map((pos, idx) => {
                            const count = draftedPlayers.filter(p => p.position === pos.position).length;
                            const limitStr = pos.qty.split('-')[1] || pos.qty;
                            const limit = parseInt(limitStr);
                            const isFull = count >= limit;
                            const canAfford = remainingBudget >= pos.cost;

                            return (
                                <motion.div layout key={idx} className={`bg-[#0a0a0a] border-2 rounded-none p-4 flex items-center justify-between transition-all group ${isFull ? 'opacity-20 border-zinc-900' : 'border-[#1a1a1a] hover:border-bb-gold/30 hover:bg-zinc-900/40 shadow-xl'}`}>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-4">
                                            <span className="text-white font-header font-black text-lg uppercase italic tracking-tighter">{pos.position}</span>
                                            <div className="relative group/skill-tip">
                                                <span className="material-symbols-outlined text-zinc-700 text-[14px] cursor-help hover:text-bb-gold transition-colors">info</span>
                                                {pos.skillKeys && pos.skillKeys.length > 0 && (
                                                    <div className="absolute bottom-full left-0 mb-3 hidden group-hover/skill-tip:flex flex-wrap gap-1 p-3 bg-black border border-bb-gold/20 rounded-none shadow-3xl z-50 w-56 border-l-4 border-l-bb-gold backdrop-blur-xl">
                                                        <p className="w-full text-[9px] font-black text-bb-gold/40 uppercase tracking-widest mb-2 italic">Dones de Nuffle</p>
                                                        {pos.skillKeys.map(sk => <span key={sk} className="text-[9px] font-black px-2 py-1 bg-zinc-900 text-bb-parchment uppercase border border-white/5">{localizeSkill(sk)}</span>)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-4 text-[10px] font-mono font-black italic">
                                            {['MV', 'FU', 'AG', 'PA', 'AR'].map(s => <div key={s} className="flex gap-1"><span className="text-zinc-600">{s.replace('MV','MA').replace('FU','ST').replace('AR','AV')}</span><span className="text-zinc-300">{(pos.stats as any)[s]}</span></div>)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <span className="text-2xl font-header font-black text-bb-gold italic tracking-tighter">{pos.cost / 1000}k</span>
                                            <span className="block text-[8px] font-black text-zinc-700 uppercase leading-none mt-1 tracking-widest">{count} / {limit}</span>
                                        </div>
                                        <button onClick={() => handleHirePlayer(pos)} disabled={isFull || !canAfford} className={`w-11 h-11 border-2 flex items-center justify-center transition-all ${isFull || !canAfford ? 'bg-zinc-950 border-zinc-900 text-zinc-800 cursor-not-allowed' : 'bg-bb-gold border-bb-gold/50 text-black hover:scale-110 active:scale-90 shadow-[0_0_20px_rgba(202,138,4,0.2)]'}`}>
                                            <span className="material-symbols-outlined font-black">add</span>
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* RIGHT: Sidebar (Tu Plantilla - Grimdark) */}
                <aside id="squad_list" className="w-[400px] bg-black border-l-2 border-bb-gold/20 flex flex-col h-full shadow-4xl relative">
                    <div className="sticky top-0 z-20 p-8 space-y-6 bg-black border-b border-bb-gold/10">
                        <div className="flex items-center gap-3 overflow-hidden mb-2">
                             <div className="w-1 h-4 bg-bb-gold/40"></div>
                             <span className="text-[11px] font-header font-black text-bb-gold italic uppercase tracking-tighter truncate">{teamName || 'TU FRANQUICIA'}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase font-black text-zinc-600 tracking-widest italic leading-none">Cofre de la Liga</span>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-4xl font-header font-black italic ${isBudgetNegative ? 'text-bb-blood animate-pulse' : 'shimmer-text'}`}>{remainingBudget.toLocaleString()}</span>
                                    <small className="text-[10px] font-black text-bb-gold italic">gp</small>
                                </div>
                            </div>
                            <div className="text-right flex flex-col justify-end">
                                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic leading-none">Contrato</span>
                                <div className={`text-2xl font-header font-black italic ${draftedPlayers.length < 11 ? 'text-bb-blood' : 'text-white'}`}>{draftedPlayers.length} / 16</div>
                            </div>
                        </div>

                        <details open className="group bg-[#0a0a0a] border border-bb-gold/10 overflow-hidden transition-all shadow-xl">
                            <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none hover:bg-bb-gold/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-bb-gold text-lg font-black">inventory_2</span>
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">Provisiones & Staff</span>
                                </div>
                                <span className="material-symbols-outlined text-sm transition-transform group-open:rotate-180 font-black">expand_more</span>
                            </summary>
                            <div className="px-4 pb-4 pt-2 space-y-1.5 bg-black/40">
                                {[
                                    { name: 'Rerolls', cost: currentFaction.rerollCost, val: rerolls, set: setRerolls, desc: 'Segundas Oportunidades' },
                                    { name: 'Fan Factor', cost: 10000, val: dedicatedFans, set: setDedicatedFans, min: 1, desc: 'Factor de Hinchas' },
                                ].map(staff => (
                                    <div key={staff.name} className="flex items-center justify-between py-2 border-t border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black uppercase text-zinc-300 italic">{staff.name}</span>
                                            <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">{staff.cost/1000}k unidad</span>
                                        </div>
                                        <div className="flex items-center gap-3 bg-zinc-950 rounded-none p-1 border border-white/5">
                                            <button onClick={() => staff.set(Math.max(staff.min || 0, staff.val - 1))} className="w-6 h-6 rounded-none bg-zinc-900 hover:bg-zinc-800 text-[11px] font-black flex items-center justify-center">-</button>
                                            <span className="text-xs font-mono font-black text-white w-4 text-center italic">{staff.val}</span>
                                            <button onClick={() => staff.set(staff.val + 1)} disabled={remainingBudget < staff.cost} className={`w-6 h-6 rounded-none border border-bb-gold/20 text-bb-gold flex items-center justify-center transition-all ${remainingBudget < staff.cost ? 'opacity-10' : 'bg-bb-gold/10 hover:bg-bb-gold hover:text-black font-black'}`}>+</button>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between py-3 border-t border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase text-zinc-300 italic">Apoticario</span>
                                        <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">50k MO</span>
                                    </div>
                                    <button onClick={() => setApothecary(!apothecary)} disabled={!apothecary && remainingBudget < 50000} className={`text-[9px] font-black px-5 py-2 rounded-none border border-2 tracking-[0.2em] italic transition-all ${apothecary ? 'bg-bb-gold text-black border-bb-gold' : 'text-bb-gold bg-bb-gold/5 border-bb-gold/20'}`}>
                                        {apothecary ? 'SI' : 'NO'}
                                    </button>
                                </div>
                            </div>
                        </details>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-black/30">
                        <div className="flex flex-col gap-1.5">
                            <AnimatePresence initial={false}>
                                {draftedPlayers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-zinc-800 opacity-40 grayscale">
                                        <span className="material-symbols-outlined text-5xl">skull</span>
                                        <p className="text-[9px] font-black uppercase italic mt-3 tracking-[0.4em]">Sin Guerreros</p>
                                    </div>
                                ) : (
                                    draftedPlayers.map((p, idx) => (
                                        <motion.div layout key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-[#121212] border border-white/5 rounded-none px-4 py-3 flex items-center justify-between group hover:border-bb-gold/30 hover:bg-zinc-900 transition-all shadow-md">
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <span className="text-[10px] font-mono font-black text-bb-gold opacity-30 shrink-0">#{String(idx + 1).padStart(2, '0')}</span>
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-header font-black text-bb-parchment italic uppercase tracking-tighter truncate leading-none mb-0.5">{p.position}</span>
                                                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{p.cost / 1000}k MO</span>
                                                </div>
                                            </div>
                                            <button onClick={() => handleFirePlayer(p.id as number)} className="w-7 h-7 flex items-center justify-center text-bb-blood bg-bb-blood/5 hover:bg-bb-blood hover:text-white transition-all shrink-0"><span className="material-symbols-outlined text-[16px] font-black">remove</span></button>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="p-8 border-t-2 border-bb-gold/30 space-y-5 bg-black z-20 shadow-4xl">
                        <div className="flex justify-between items-end border-b border-bb-gold/5 pb-4">
                            <span className="text-[11px] font-black uppercase text-zinc-600 italic tracking-[0.3em]">VALOR DE EQUIPO (VAE)</span>
                            <span className="text-4xl font-header font-black text-white italic tracking-tighter leading-none">{totalCost / 1000} <small className="text-sm text-bb-gold">k</small></span>
                        </div>
                        <button 
                            disabled={!canFinalize}
                            onClick={handleSubmit}
                            className={`btn-coin w-full py-6 transition-all duration-500 transform ${canFinalize ? 'hover:scale-[1.03] active:scale-95' : 'grayscale opacity-20 cursor-not-allowed border-zinc-800 bg-zinc-900'}`}
                        >
                            <span className="font-epilogue italic font-black text-2xl text-black uppercase tracking-tighter leading-none block">
                                Confirmar Fundación
                            </span>
                            <span className="text-[9px] text-black/50 font-black uppercase tracking-[0.4em] mt-1 block">Regla Oficial Nuffle</span>
                        </button>
                        <p className="text-[9px] text-center text-zinc-600 font-black italic uppercase tracking-[0.3em] leading-relaxed mt-2 h-4">
                            {teamName.length < 3 ? 'Requiere Bautismo (mín. 3)' : (draftedPlayers.length < 11 ? `Faltan ${11 - draftedPlayers.length} efectivos` : (isBudgetNegative ? 'Presupuesto Agotado' : '✓ Fundación Autorizada'))}
                        </p>
                    </div>
                </aside>
            </main>

            {/* Modal for skills */}
            {selectedSkill && (
                <SkillModal
                    skill={selectedSkill}
                    onClose={() => setSelectedSkill(null)}
                />
            )}

            <style>{`
                .shimmer-text { background: linear-gradient(90deg, #CA8A04 0%, #ffe4a3 50%, #CA8A04 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 3s infinite linear; }
                @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
            `}</style>
        </div>
    );
};

export default TeamCreator;
