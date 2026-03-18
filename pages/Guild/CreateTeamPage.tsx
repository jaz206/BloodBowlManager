import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ManagedTeam, Team, Player, ManagedPlayer, Skill } from '../../types';
import { useMasterData } from '../../hooks/useMasterData';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import SkillModal from '../../components/oracle/SkillModal';

interface TeamCreatorProps {
    onTeamCreate: (team: Omit<ManagedTeam, 'id'>) => void;
    initialRosterName?: string | null;
}

const TeamCreator: React.FC<TeamCreatorProps> = ({ onTeamCreate, initialRosterName }) => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const { teams: rosterTemplates, loading, skills: allSkills } = useMasterData();
    const carouselRef = useRef<HTMLDivElement>(null);

    // Form State
    const [teamName, setTeamName] = useState('');
    const [selectedFactionIdx, setSelectedFactionIdx] = useState(0);
    const [draftedPlayers, setDraftedPlayers] = useState<ManagedPlayer[]>([]);
    const [rerolls, setRerolls] = useState(0);
    const [dedicatedFans, setDedicatedFans] = useState(1);
    const [assistantCoaches, setAssistantCoaches] = useState(0);
    const [cheerleaders, setCheerleaders] = useState(0);
    const [apothecary, setApothecary] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Initial Budget
    const startingTreasury = 1000000;

    const filteredFactions = useMemo(() => {
        return rosterTemplates.filter(rt => rt.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [rosterTemplates, searchQuery]);

    const currentFaction = useMemo(() => {
        return rosterTemplates[selectedFactionIdx] || null;
    }, [rosterTemplates, selectedFactionIdx]);

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

    // Carousel Scroll Logic
    const scrollCarousel = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const scrollAmount = carouselRef.current.clientWidth * 0.8;
            carouselRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    // Calculations
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
            <div className="flex flex-col items-center justify-center p-20 min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mb-4"></div>
                <p className="text-slate-400 font-display animate-pulse uppercase tracking-widest">Invocando al Comisario...</p>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex flex-col bg-[#0a0a0a] text-slate-100 overflow-hidden font-sans select-none">
            {/* TOP HEADER: Branding & Race Filter */}
            <header className="flex-none bg-[#0a0a0a] border-b border-white/10 px-6 py-3 z-50">
                <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-8 h-12">
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="material-symbols-outlined text-gold text-2xl font-black">shield</span>
                        <h1 className="text-lg font-header font-black tracking-tight text-white uppercase hidden sm:block italic leading-none">Fundar Equipo</h1>
                    </div>
                    
                    {/* Integrated Search & Carousel */}
                    <div className="flex flex-1 items-center gap-4 overflow-hidden relative px-10">
                        {/* Carousel Arrows */}
                        <button 
                            onClick={() => scrollCarousel('left')}
                            className="absolute left-0 z-10 w-8 h-8 rounded-full bg-gold/10 text-gold border border-gold/30 flex items-center justify-center hover:bg-gold hover:text-black transition-all"
                        >
                            <span className="material-symbols-outlined font-black">chevron_left</span>
                        </button>
                        
                        <div className="relative w-40 shrink-0">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</span>
                            <input 
                                className="w-full bg-[#171717] border border-white/5 rounded-full py-1 pl-8 pr-4 text-[10px] focus:ring-gold focus:border-gold transition-all text-white outline-none" 
                                placeholder="Filtrar razas..." 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        
                        {/* Hybrid Carousel */}
                        <div 
                            ref={carouselRef}
                            id="race_selector"
                            className="flex-1 flex items-center gap-3 overflow-x-auto no-scrollbar py-2 snap-x snap-mandatory scroll-smooth"
                        >
                            {filteredFactions.map((tm, idx) => {
                                const masterIdx = rosterTemplates.findIndex(f => f.name === tm.name);
                                const isSelected = selectedFactionIdx === masterIdx;
                                return (
                                    <div 
                                        key={tm.name}
                                        onClick={() => setSelectedFactionIdx(masterIdx)}
                                        className={`flex-none flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer snap-center transition-all duration-300 ${isSelected ? 'bg-gold/10 border-gold scale-105 shadow-[0_0_20px_rgba(202,138,4,0.3)]' : 'bg-[#171717] border-white/5 opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}
                                    >
                                        <div className="w-5 h-5 rounded-full bg-cover bg-center bg-zinc-800 border border-white/10" style={{ backgroundImage: tm.image ? `url(${tm.image})` : 'none' }}>
                                            {!tm.image && <span className="flex items-center justify-center h-full text-[7px] font-black">{tm.name.charAt(0)}</span>}
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? 'text-gold' : 'text-slate-400'}`}>{tm.name}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <button 
                            onClick={() => scrollCarousel('right')}
                            className="absolute right-0 z-10 w-8 h-8 rounded-full bg-gold/10 text-gold border border-gold/30 flex items-center justify-center hover:bg-gold hover:text-black transition-all"
                        >
                            <span className="material-symbols-outlined font-black">chevron_right</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* TEAM NAME SECTION (Separator) */}
            <section className="flex-none px-6 py-3 bg-black/40 border-b border-white/5 shadow-inner">
                <div className="max-w-screen-2xl mx-auto flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] ml-1">Nombre de la Franquicia</label>
                    <input 
                        className="w-full bg-transparent border-none p-0 text-2xl font-header font-black text-white italic placeholder:text-white/5 outline-none uppercase tracking-tighter" 
                        placeholder="Escribe el nombre de tu equipo..." 
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        maxLength={40}
                    />
                </div>
            </section>

            {/* MAIN VIEWPORT */}
            <main className="flex-1 flex overflow-hidden">
                {/* LEFT COLUMN: Market */}
                <section className="flex-1 overflow-y-auto p-6 space-y-4 custom-scroll-area">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-header font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 italic">
                            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-gold/20 text-gold text-[9px] border border-gold/20 italic">1</span>
                            Mercado de Fichajes
                        </h2>
                        <span className="text-[9px] text-slate-600 italic uppercase tracking-widest opacity-60">"Hierro y determinación por 1M de oro"</span>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                        {currentFaction.roster.map((pos, idx) => {
                            const count = draftedPlayers.filter(p => p.position === pos.position).length;
                            const limitStr = pos.qty.split('-')[1] || pos.qty;
                            const limit = parseInt(limitStr);
                            const isFull = count >= limit;
                            const canAfford = remainingBudget >= pos.cost;

                            return (
                                <motion.div 
                                    layout
                                    key={`${currentFaction.name}-${pos.position}-${idx}`} 
                                    className={`bg-[#171717] border rounded-xl p-3 flex items-center justify-between transition-all group ${isFull ? 'opacity-20 border-white/5' : 'border-white/10 hover:border-gold/20 hover:bg-white/[0.01]'}`}
                                >
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-header font-black text-sm uppercase italic tracking-tighter">{pos.position}</span>
                                            <div className="relative group/tooltip">
                                                <span className="material-symbols-outlined text-slate-700 text-[12px] cursor-help hover:text-gold transition-colors">info</span>
                                                {pos.skillKeys && pos.skillKeys.length > 0 && (
                                                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tooltip:flex flex-wrap gap-1 p-2 bg-black border border-white/10 rounded-lg shadow-2xl z-50 w-48 border-l-2 border-l-gold backdrop-blur-md">
                                                        {pos.skillKeys.map(sk => (
                                                            <span key={sk} className="text-[8px] font-black px-1.5 py-0.5 rounded bg-gold/10 text-gold uppercase tracking-tighter border border-gold/20">{localizeSkill(sk)}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-3 text-[8px] font-mono font-black italic">
                                            {['MV', 'FU', 'AG', 'PA', 'AR'].map(s => (
                                                <div key={s} className="flex items-baseline gap-0.5">
                                                    <span className="text-slate-600">{s.replace('MV','MA').replace('FU','ST').replace('AR','AV')}</span>
                                                    <span className="text-slate-300">{(pos.stats as any)[s]}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <span className="text-md font-header font-black text-gold italic">{pos.cost / 1000}k</span>
                                            <span className="block text-[7px] font-black text-slate-700 uppercase tracking-widest leading-none mt-0.5">{count} / {limit}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleHirePlayer(pos)}
                                            disabled={isFull || !canAfford}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isFull || !canAfford ? 'bg-zinc-800 text-zinc-900 cursor-not-allowed' : 'bg-gold text-black hover:scale-110 active:scale-90 shadow-lg shadow-gold/10'}`}
                                        >
                                            <span className="material-symbols-outlined font-black text-sm">add</span>
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* RIGHT COLUMN: Sidebar (Tu Plantilla) */}
                <aside id="squad_list" className="w-[360px] bg-[#171717] border-l border-white/10 flex flex-col h-full shadow-3xl">
                    {/* Sticky Status Header */}
                    <div className="sticky top-0 z-20 p-6 space-y-5 bg-[#171717] border-b border-white/5">
                        <div className="flex items-center gap-2 overflow-hidden mb-2">
                            <span className="text-[9px] font-black text-slate-600 italic uppercase shrink-0">Resumen:</span>
                            <span className="text-[10px] font-header font-black text-gold italic uppercase tracking-tighter truncate leading-none">{teamName || 'Sin Nombre'}</span>
                        </div>
                        
                        <div className="space-y-1">
                            <span className="text-[9px] uppercase font-black text-slate-500 tracking-widest italic leading-none">Tesorería</span>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-3xl font-header font-black italic ${isBudgetNegative ? 'text-blood animate-pulse' : 'shimmer-text'}`}>{remainingBudget.toLocaleString()}</span>
                                <small className="text-[10px] font-black text-gold italic">gp</small>
                            </div>
                        </div>

                        {/* Ultra-Compact Staff Selector */}
                        <details className="group bg-black/40 rounded-xl border border-white/5 overflow-hidden transition-all">
                            <summary className="flex items-center justify-between px-3 py-2 cursor-pointer list-none hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-gold text-sm font-black">inventory_2</span>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Staff & Rerolls</span>
                                </div>
                                <span className="material-symbols-outlined text-xs transition-transform group-open:rotate-180 font-black">expand_more</span>
                            </summary>
                            <div className="px-3 pb-3 pt-1 space-y-1">
                                {[
                                    { name: 'Rerolls', cost: currentFaction.rerollCost, val: rerolls, set: setRerolls },
                                    { name: 'Fan Factor', cost: 10000, val: dedicatedFans, set: setDedicatedFans, min: 1 },
                                ].map(staff => (
                                    <div key={staff.name} className="flex items-center justify-between py-1.5 border-t border-white/5">
                                        <span className="text-[8px] font-black uppercase text-slate-500 italic">{staff.name}</span>
                                        <div className="flex items-center gap-2 bg-black/60 rounded-lg p-0.5 border border-white/5">
                                            <button onClick={() => staff.set(Math.max(staff.min || 0, staff.val - 1))} className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-[10px] font-black flex items-center justify-center">-</button>
                                            <span className="text-[10px] font-mono font-black text-white w-3 text-center italic">{staff.val}</span>
                                            <button onClick={() => staff.set(staff.val + 1)} disabled={remainingBudget < staff.cost} className={`w-5 h-5 rounded border border-gold/20 text-gold flex items-center justify-center transition-all ${remainingBudget < staff.cost ? 'opacity-10' : 'bg-gold/10 hover:bg-gold hover:text-black font-black'}`}>+</button>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between py-2 border-t border-white/5">
                                    <span className="text-[8px] font-black uppercase text-slate-500 italic">Apoticario</span>
                                    <button 
                                        onClick={() => setApothecary(!apothecary)}
                                        disabled={!apothecary && remainingBudget < 50000}
                                        className={`text-[8px] font-black px-3 py-1 rounded-full border transition-all uppercase tracking-widest italic ${apothecary ? 'bg-gold text-black border-gold' : 'text-gold bg-gold/5 border-gold/20'}`}
                                    >
                                        {apothecary ? 'SI' : 'NO'}
                                    </button>
                                </div>
                            </div>
                        </details>
                    </div>

                    {/* Hyper-Compact Roster List */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scroll-area bg-black/5">
                        <div className="flex justify-between items-center mb-3 px-1">
                            <h3 className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Tu Plantilla ({draftedPlayers.length})</h3>
                        </div>
                        <div className="flex flex-col gap-1">
                            <AnimatePresence initial={false}>
                                {draftedPlayers.length === 0 ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} className="flex flex-col items-center justify-center py-20 text-slate-700 gap-2 grayscale">
                                        <span className="material-symbols-outlined text-4xl">stadium</span>
                                        <p className="text-[8px] font-black uppercase italic">Vacío</p>
                                    </motion.div>
                                ) : (
                                    draftedPlayers.map((p, idx) => (
                                        <motion.div 
                                            layout key={p.id}
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded px-3 py-1.5 flex items-center justify-between group hover:border-gold/30 hover:bg-black/40 transition-all"
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <span className="text-[9px] font-mono font-black text-gold/30 shrink-0">#{String(idx + 1).padStart(2, '0')}</span>
                                                <span className="text-[10px] font-header font-black text-slate-300 italic uppercase tracking-tighter truncate">{p.position}</span>
                                            </div>
                                            <button 
                                                onClick={() => handleFirePlayer(p.id as number)}
                                                className="w-5 h-5 flex items-center justify-center text-blood bg-blood/5 hover:bg-blood hover:text-white rounded transition-all shrink-0"
                                            >
                                                <span className="material-symbols-outlined text-[14px] font-black">remove</span>
                                            </button>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Finalize Footer */}
                    <div className="flex-none p-6 border-t border-white/10 space-y-4 bg-[#171717] z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
                        <div className="flex justify-between items-end">
                            <span className="text-[9px] font-black uppercase text-slate-600 italic">Valor Equipo</span>
                            <span className="text-2xl font-header font-black text-white italic tracking-tighter leading-none">{totalCost / 1000} <small className="text-xs text-gold">TV</small></span>
                        </div>
                        <button 
                            disabled={!canFinalize}
                            onClick={handleSubmit}
                            className={`w-full py-4 rounded-xl font-header font-black text-md tracking-[0.2em] uppercase italic flex items-center justify-center gap-3 transition-all duration-300 shadow-2xl ${canFinalize ? 'bg-gradient-to-br from-gold to-yellow-700 text-black shadow-gold/30 hover:scale-[1.02] active:scale-95' : 'bg-white/5 border border-white/10 text-white/5 cursor-not-allowed opacity-20'}`}
                        >
                            <span className="material-symbols-outlined text-xl">sports_football</span>
                            Fundar Equipo
                        </button>
                        <p className="text-[8px] text-center text-slate-700 font-black italic uppercase leading-none mt-2">
                            {teamName.length < 3 ? 'Añade un Nombre (mín. 3)' : (draftedPlayers.length < 11 ? `Faltan ${11 - draftedPlayers.length} Reclutas` : (isBudgetNegative ? 'Presupuesto Excedido' : 'Validación Superada'))}
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

            {/* Custom Animations & Styles */}
            <style>{`
                .shimmer-text {
                    background: linear-gradient(90deg, #CA8A04 0%, #ffe4a3 50%, #CA8A04 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: shimmer 3s infinite linear;
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .custom-scroll-area::-webkit-scrollbar { width: 3px; }
                .custom-scroll-area::-webkit-scrollbar-track { background: transparent; }
                .custom-scroll-area::-webkit-scrollbar-thumb { background: rgba(202, 138, 4, 0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default TeamCreator;
