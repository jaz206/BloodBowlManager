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
        <div className="h-screen w-full flex flex-col bg-[#0a0a0a] text-slate-100 overflow-hidden font-sans">
            {/* TOP HEADER: Branding & Race Filter */}
            <header className="flex-none bg-[#0a0a0a] border-b border-white/10 px-6 py-3 z-50">
                <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-8">
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="material-symbols-outlined text-gold text-2xl font-black">shield</span>
                        <h1 className="text-lg font-header font-black tracking-tight text-white uppercase hidden sm:block italic leading-none">Fundar Equipo</h1>
                    </div>
                    
                    {/* Integrated Search & Carousel */}
                    <div className="flex flex-1 items-center gap-6 overflow-hidden">
                        <div className="relative w-40 shrink-0">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</span>
                            <input 
                                className="w-full bg-[#171717] border border-white/5 rounded-full py-1.5 pl-8 pr-4 text-[10px] focus:ring-gold focus:border-gold transition-all text-white outline-none" 
                                placeholder="Filtrar razas..." 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        
                        {/* Interactive Carousel */}
                        <div 
                            ref={carouselRef}
                            className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2 snap-x snap-mandatory scroll-smooth"
                        >
                            {filteredFactions.map((tm, idx) => {
                                const masterIdx = rosterTemplates.findIndex(f => f.name === tm.name);
                                const isSelected = selectedFactionIdx === masterIdx;
                                return (
                                    <div 
                                        key={tm.name}
                                        onClick={() => setSelectedFactionIdx(masterIdx)}
                                        className={`flex-none flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer snap-center transition-all duration-300 ${isSelected ? 'bg-gold/10 border-gold scale-105 shadow-[0_0_20px_rgba(202,138,4,0.2)]' : 'bg-[#171717] border-white/5 opacity-50 grayscale hover:opacity-100 hover:grayscale-0'}`}
                                    >
                                        <div className="w-6 h-6 rounded-full bg-cover bg-center bg-zinc-800 border border-white/10" style={{ backgroundImage: tm.image ? `url(${tm.image})` : 'none' }}>
                                            {!tm.image && <span className="flex items-center justify-center h-full text-[8px] font-black">{tm.name.charAt(0)}</span>}
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-gold' : 'text-slate-400'}`}>{tm.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </header>

            {/* TEAM NAME SECTION (Separator) */}
            <section className="flex-none px-6 py-4 bg-black/20 border-b border-white/5 shadow-inner">
                <div className="max-w-screen-2xl mx-auto flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Nombre de la Franquicia</label>
                    <input 
                        className="w-full bg-transparent border-none p-0 text-3xl font-header font-black text-white italic placeholder:text-white/10 outline-none uppercase tracking-tighter" 
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
                <section className="flex-1 overflow-y-auto p-6 space-y-6 custom-scroll-area">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-sm font-header font-black text-slate-400 uppercase tracking-widest flex items-center gap-3 italic">
                            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gold/20 text-gold text-[10px] border border-gold/30 italic">1</span>
                            Mercado de Fichajes
                        </h2>
                        <span className="text-[10px] text-slate-500 italic uppercase tracking-widest opacity-40">Presupuesto inicial: 1.000.000 gp</span>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
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
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`bg-[#171717] border rounded-2xl p-4 flex items-center justify-between transition-all group ${isFull ? 'opacity-30 border-white/5' : 'border-white/10 hover:border-gold/30 hover:bg-white/[0.02] shadow-xl hover:shadow-gold/5'}`}
                                >
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-white font-header font-black text-md uppercase italic tracking-tighter">{pos.position}</span>
                                            <div className="relative group/tooltip">
                                                <span className="material-symbols-outlined text-slate-600 text-[14px] cursor-help hover:text-gold transition-colors">info</span>
                                                {pos.skillKeys && pos.skillKeys.length > 0 && (
                                                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tooltip:flex flex-wrap gap-1 p-3 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 w-56 border-l-4 border-l-gold">
                                                        <p className="w-full text-[9px] font-black text-gold uppercase tracking-widest mb-1.5 opacity-60">Habilidades Base</p>
                                                        {pos.skillKeys.map(sk => (
                                                            <span key={sk} className="text-[9px] font-black px-2 py-1 rounded bg-[#171717] text-white uppercase tracking-tighter border border-white/10">{localizeSkill(sk)}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-4 text-[9px] font-mono font-black italic">
                                            {['MV', 'FU', 'AG', 'PA', 'AR'].map(s => (
                                                <div key={s} className="flex flex-col"><span className="text-slate-500">{s.replace('MV','MA').replace('FU','ST').replace('AR','AV')}</span><span className="text-white">{(pos.stats as any)[s]}</span></div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <span className="text-xl font-header font-black text-gold italic">{pos.cost / 1000}k</span>
                                            <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest mt-0.5">{count} / {limit}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleHirePlayer(pos)}
                                            disabled={isFull || !canAfford}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isFull || !canAfford ? 'bg-zinc-800 text-slate-700 cursor-not-allowed' : 'bg-gold text-black hover:scale-110 active:scale-95 shadow-lg shadow-gold/20'}`}
                                        >
                                            <span className="material-symbols-outlined font-black">add</span>
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                    <div className="h-20" /> {/* Scrolling spacer */}
                </section>

                {/* RIGHT COLUMN: Sidebar (Resumen) */}
                <aside className="w-[420px] bg-[#171717]/80 backdrop-blur-2xl border-l border-white/10 flex flex-col h-full shadow-2xl relative">
                    <div className="absolute inset-0 bg-gold/[0.02] pointer-events-none" />
                    
                    {/* Resumen Header */}
                    <div className="p-8 border-b border-white/5 bg-black/40">
                        <h2 className="text-[10px] font-black text-gold uppercase tracking-[0.4em] mb-2 italic">Resumen del Proyecto</h2>
                        <div className="flex items-baseline gap-2 overflow-hidden">
                            <span className="text-sm font-black text-white italic uppercase tracking-tighter whitespace-nowrap">Resumen:</span>
                            <span className="text-sm font-header font-black text-gold italic uppercase tracking-tighter truncate">{teamName || '[Escribe el nombre]'}</span>
                        </div>
                    </div>

                    {/* Stats Dashboard */}
                    <div className="p-8 space-y-6 flex-none bg-black/20">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <span className="text-[9px] uppercase font-black text-slate-500 tracking-widest italic">Tesorería Bruta</span>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-4xl font-header font-black italic ${isBudgetNegative ? 'text-blood animate-pulse' : 'shimmer-text'}`}>{remainingBudget.toLocaleString()}</span>
                                    <small className="text-xs font-black text-gold italic">gp</small>
                                </div>
                            </div>
                            <div className="text-right space-y-1">
                                <span className="text-[9px] uppercase font-black text-slate-500 tracking-widest italic">Activos</span>
                                <div className={`text-2xl font-header font-black italic ${draftedPlayers.length < 11 ? 'text-blood' : 'text-white'}`}>
                                    {draftedPlayers.length} <small className="text-xs text-slate-500">/ 16</small>
                                </div>
                            </div>
                        </div>

                        {/* Collapsible Staff */}
                        <details open className="group bg-[#0a0a0a]/50 rounded-2xl border border-white/5 overflow-hidden transition-all shadow-inner">
                            <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center border border-gold/20">
                                        <span className="material-symbols-outlined text-gold text-lg font-black">inventory_2</span>
                                    </div>
                                    <span className="text-xs font-black text-slate-200 uppercase tracking-widest italic">Staff & Rerolls</span>
                                </div>
                                <span className="material-symbols-outlined text-sm transition-transform group-open:rotate-180 font-black">expand_more</span>
                            </summary>
                            <div className="p-4 pt-0 space-y-1">
                                {[
                                    { name: 'Rerolls', cost: currentFaction.rerollCost, val: rerolls, set: setRerolls },
                                    { name: 'Fan Factor', cost: 10000, val: dedicatedFans, set: setDedicatedFans, min: 1, detail: 'Lector de Ventaja' },
                                ].map(staff => (
                                    <div key={staff.name} className="flex items-center justify-between py-3 border-t border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-wide text-slate-300 italic">{staff.name}</span>
                                            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">({staff.cost / 1000}k unidad)</span>
                                        </div>
                                        <div className="flex items-center gap-3 bg-black/40 rounded-xl p-1.5 border border-white/5 shadow-inner">
                                            <button onClick={() => staff.set(Math.max(staff.min || 0, staff.val - 1))} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-black flex items-center justify-center transition-colors">-</button>
                                            <span className="text-xs font-mono font-black text-white w-4 text-center italic">{staff.val}</span>
                                            <button onClick={() => staff.set(staff.val + 1)} disabled={remainingBudget < staff.cost} className={`w-7 h-7 rounded-lg border border-gold/20 flex items-center justify-center transition-all ${remainingBudget < staff.cost ? 'opacity-10 cursor-not-allowed' : 'bg-gold/10 text-gold hover:bg-gold hover:text-black font-black'}`}>+</button>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between py-4 border-t border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-wide text-slate-300 italic">Apoticario</span>
                                        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">(50k)</span>
                                    </div>
                                    <button 
                                        onClick={() => setApothecary(!apothecary)}
                                        disabled={!apothecary && remainingBudget < 50000}
                                        className={`text-[9px] font-black px-5 py-2 rounded-full border transition-all uppercase tracking-widest italic ${apothecary ? 'bg-gold text-black border-gold shadow-[0_0_20px_rgba(202,138,4,0.3)]' : 'text-gold bg-gold/5 border-gold/20 hover:bg-gold/10'}`}
                                    >
                                        {apothecary ? 'CONTRATADO' : 'CONTRATAR'}
                                    </button>
                                </div>
                            </div>
                        </details>
                    </div>

                    {/* Roster List Context */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-3 no-scrollbar custom-scroll-area bg-black/10">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Roster Actual</h3>
                            <span className="text-[8px] font-black text-slate-700 italic border px-2 py-0.5 rounded border-white/5 tracking-widest">{currentFaction.name.toUpperCase()}</span>
                        </div>
                        <AnimatePresence initial={false}>
                            {draftedPlayers.length === 0 ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} className="flex flex-col items-center justify-center py-20 text-slate-700 space-y-4">
                                    <span className="material-symbols-outlined text-6xl">stadium</span>
                                    <p className="text-[10px] font-black uppercase tracking-widest italic leading-none">Esperando Reclutas...</p>
                                </motion.div>
                            ) : (
                                draftedPlayers.map((p, idx) => (
                                    <motion.div 
                                        layout key={p.id}
                                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                        className="bg-[#0a0a0a]/80 border border-white/10 rounded-2xl p-4 flex items-center justify-between group hover:border-gold/20 transition-all shadow-xl"
                                    >
                                        <div className="flex items-center gap-5">
                                            <span className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 text-[10px] flex items-center justify-center font-mono font-black text-gold shadow-inner">#{String(idx + 1).padStart(2, '0')}</span>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-header font-black text-white italic uppercase tracking-tighter leading-none">{p.position}</span>
                                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{(p.cost / 1000)}k gp</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleFirePlayer(p.id as number)}
                                            className="w-10 h-10 flex items-center justify-center text-blood hover:bg-blood/20 rounded-xl transition-all active:scale-95"
                                        >
                                            <span className="material-symbols-outlined text-lg font-black">close</span>
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Finalize CTA */}
                    <div className="p-8 bg-black/60 border-t border-white/10 space-y-6 z-10 shadow-2xl">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">Valor Equipo final</span>
                            <span className="text-3xl font-header font-black text-white italic tracking-tighter leading-none">{totalCost / 1000} <small className="text-xs text-gold">TV</small></span>
                        </div>
                        <button 
                            disabled={!canFinalize}
                            onClick={handleSubmit}
                            className={`w-full py-5 rounded-3xl font-header font-black text-xl tracking-[0.15em] uppercase italic flex items-center justify-center gap-4 transition-all duration-500 shadow-3xl ${canFinalize ? 'bg-gradient-to-br from-gold to-yellow-600 text-black shadow-gold/40 hover:scale-[1.02] hover:brightness-110 active:scale-95' : 'bg-white/5 border border-white/10 text-white/10 cursor-not-allowed opacity-20'}`}
                        >
                            <span className="material-symbols-outlined text-2xl font-black">sports_football</span>
                            Fundar Equipo
                        </button>
                        <p className="text-[9px] text-center text-slate-600 font-black italic uppercase tracking-[0.2em] leading-relaxed">
                            {teamName.length < 3 ? '* Nombre requerido (mín. 3 caracteres)' : (draftedPlayers.length < 11 ? `* Faltan ${11 - draftedPlayers.length} jugadores obligatorios` : (isBudgetNegative ? '* Saldo excedido: No tienes suficiente oro' : '✓ Franquicia autorizada por el Comisario'))}
                        </p>
                    </div>
                </aside>
            </main>

            {/* Global Skill Description Modal */}
            {selectedSkill && (
                <SkillModal
                    skill={selectedSkill}
                    onClose={() => setSelectedSkill(null)}
                />
            )}

            {/* Custom Styles */}
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
                .custom-scroll-area::-webkit-scrollbar { width: 4px; }
                .custom-scroll-area::-webkit-scrollbar-track { background: transparent; }
                .custom-scroll-area::-webkit-scrollbar-thumb { background: rgba(202, 138, 4, 0.2); border-radius: 10px; }
                .custom-scroll-area::-webkit-scrollbar-thumb:hover { background: rgba(202, 138, 4, 0.5); }
            `}</style>
        </div>
    );
};

export default TeamCreator;
