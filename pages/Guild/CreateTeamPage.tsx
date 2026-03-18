import React, { useState, useMemo, useEffect } from 'react';
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

    // Reset draft ONLY if race definitely changes (not for small UI filters)
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
    const canFinalize = draftedPlayers.length >= 11 && !isBudgetNegative && teamName.trim().length > 0;

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

    const handleSkillClick = (keyEN: string) => {
        const cleanKey = keyEN.replace(/\(\+\d\)/g, '').trim();
        const found = allSkills.find(s => s.keyEN === keyEN || s.keyEN === cleanKey);
        if (found) setSelectedSkill(found);
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
            {/* HEADER & SHIELD SELECTOR */}
            <header className="flex-none bg-[#0a0a0a] border-b border-white/10 px-6 py-3 z-50">
                <div className="max-w-screen-2xl mx-auto flex items-center gap-8">
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="material-symbols-outlined text-gold text-2xl">shield</span>
                        <h1 className="text-lg font-header font-black tracking-tight text-white uppercase hidden sm:block italic">Fundar Equipo</h1>
                    </div>
                    
                    {/* Shield Carousel & Search */}
                    <div className="flex flex-1 items-center gap-4">
                        <div className="relative w-48 shrink-0">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</span>
                            <input 
                                className="w-full bg-[#171717] border border-white/5 rounded-full py-1.5 pl-8 pr-4 text-[10px] focus:ring-gold focus:border-gold transition-all text-white outline-none" 
                                placeholder="Filtrar razas..." 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                            {filteredFactions.map((tm, idx) => {
                                const masterIdx = rosterTemplates.findIndex(f => f.name === tm.name);
                                const isSelected = selectedFactionIdx === masterIdx;
                                return (
                                    <div 
                                        key={tm.name}
                                        onClick={() => setSelectedFactionIdx(masterIdx)}
                                        className={`flex-none flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-all ${isSelected ? 'bg-gold/10 border-gold/50' : 'bg-[#171717] border-white/5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'}`}
                                    >
                                        <div className="w-6 h-6 rounded-full bg-cover bg-center bg-zinc-800" style={{ backgroundImage: tm.image ? `url(${tm.image})` : 'none' }}>
                                            {!tm.image && <span className="flex items-center justify-center h-full text-[8px] font-black">{tm.name.charAt(0)}</span>}
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? 'text-gold' : 'text-slate-400'}`}>{tm.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-3">
                        <input 
                            className="bg-[#171717]/50 border border-white/5 rounded-lg py-1.5 px-3 text-xs w-48 focus:ring-gold focus:border-gold transition-all outline-none italic font-header font-black uppercase tracking-tighter" 
                            placeholder="Nombre de la Franquicia..." 
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            {/* MAIN VIEWPORT */}
            <main className="flex-1 flex overflow-hidden">
                {/* LEFT COLUMN: Market */}
                <section className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar custom-scroll-area">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-header font-black text-slate-400 uppercase tracking-widest flex items-center gap-3 italic">
                            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gold/20 text-gold text-[10px] border border-gold/30 shadow-lg italic">1</span>
                            Reclutamiento de Jugadores
                        </h2>
                        <span className="text-[10px] text-slate-500 italic uppercase tracking-widest opacity-60">"Los mejores se pagan en oro y sangre"</span>
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
                                    key={idx} 
                                    className={`bg-[#171717] border rounded-2xl p-4 flex items-center justify-between transition-all group ${isFull ? 'opacity-30 border-white/5' : 'border-white/10 hover:border-gold/20 hover:bg-white/[0.02]'}`}
                                >
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-white font-header font-black text-md uppercase italic tracking-tighter">{pos.position}</span>
                                            <div className="relative group/tooltip">
                                                <span className="material-symbols-outlined text-slate-600 text-[14px] cursor-help hover:text-gold transition-colors">info</span>
                                                {pos.skillKeys && pos.skillKeys.length > 0 && (
                                                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tooltip:flex flex-wrap gap-1 p-2 bg-black border border-white/10 rounded-lg shadow-2xl z-50 w-48">
                                                        {pos.skillKeys.map(sk => (
                                                            <span key={sk} className="text-[8px] font-black px-1.5 py-0.5 rounded bg-gold text-black uppercase tracking-tighter">{localizeSkill(sk)}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-4 text-[9px] font-mono font-black italic">
                                            <div className="flex flex-col"><span className="text-slate-500">MA</span><span className="text-white">{pos.stats.MV}</span></div>
                                            <div className="flex flex-col"><span className="text-slate-500">ST</span><span className="text-white">{pos.stats.FU}</span></div>
                                            <div className="flex flex-col"><span className="text-slate-500">AG</span><span className="text-white">{pos.stats.AG}</span></div>
                                            <div className="flex flex-col"><span className="text-slate-500">PA</span><span className="text-white">{pos.stats.PA}</span></div>
                                            <div className="flex flex-col"><span className="text-slate-500">AV</span><span className="text-white">{pos.stats.AR}</span></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <div className="text-right">
                                            <span className="text-lg font-header font-black text-gold italic">{pos.cost / 1000}k</span>
                                            <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest mt-0.5">{count} / {limit}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleHirePlayer(pos)}
                                            disabled={isFull || !canAfford}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isFull || !canAfford ? 'bg-zinc-800 text-slate-700 cursor-not-allowed' : 'bg-gold text-[#0a0a0a] hover:scale-105 active:scale-95 shadow-lg shadow-gold/20'}`}
                                        >
                                            <span className="material-symbols-outlined font-black">add</span>
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* RIGHT COLUMN: Sidebar */}
                <aside className="w-[400px] bg-[#171717]/70 backdrop-blur-xl border-l border-white/10 flex flex-col h-full shadow-2xl z-40">
                    {/* Status Dashboard */}
                    <div className="p-8 space-y-6 flex-none border-b border-white/5 bg-black/20">
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase font-black text-gold/70 tracking-widest italic">Tesorería</span>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-3xl font-header font-black italic ${isBudgetNegative ? 'text-blood animate-pulse' : 'shimmer-text'}`}>{remainingBudget.toLocaleString()}</span>
                                    <small className="text-xs font-black text-gold italic">gp</small>
                                </div>
                            </div>
                            <div className="text-right space-y-1">
                                <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest italic">Jugadores</span>
                                <div className={`text-xl font-header font-black italic ${draftedPlayers.length < 11 ? 'text-blood' : 'text-white'}`}>
                                    {draftedPlayers.length} <small className="text-xs text-slate-500">/ 16</small>
                                </div>
                            </div>
                        </div>

                        {/* Collapsible Staff */}
                        <details className="group bg-[#0a0a0a]/50 rounded-2xl border border-white/5 overflow-hidden transition-all shadow-inner">
                            <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-gold text-lg font-black">medical_services</span>
                                    <span className="text-xs font-black text-slate-200 uppercase tracking-widest italic">Staff & Incentivos</span>
                                </div>
                                <span className="material-symbols-outlined text-sm transition-transform group-open:rotate-180 font-black">expand_more</span>
                            </summary>
                            <div className="p-4 pt-0 space-y-1">
                                {[
                                    { name: 'Rerolls', cost: currentFaction.rerollCost, val: rerolls, set: setRerolls },
                                    { name: 'Fan Factor', cost: 10000, val: dedicatedFans, set: setDedicatedFans, min: 1 },
                                    { name: 'Asistentes', cost: 10000, val: assistantCoaches, set: setAssistantCoaches },
                                    { name: 'Animadoras', cost: 10000, val: cheerleaders, set: setCheerleaders }
                                ].map(staff => (
                                    <div key={staff.name} className="flex items-center justify-between py-2.5 border-t border-white/5">
                                        <div className="text-[10px] font-black uppercase tracking-wide text-slate-400 italic">{staff.name} <span className="text-gold/50 ml-1">({staff.cost / 1000}k)</span></div>
                                        <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1 border border-white/5">
                                            <button 
                                                onClick={() => staff.set(Math.max(staff.min || 0, staff.val - 1))}
                                                className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 text-xs font-black flex items-center justify-center transition-colors">-</button>
                                            <span className="text-xs font-mono font-black text-white w-4 text-center italic">{staff.val}</span>
                                            <button 
                                                onClick={() => staff.set(staff.val + 1)}
                                                disabled={remainingBudget < staff.cost}
                                                className={`w-7 h-7 rounded border border-gold/20 flex items-center justify-center transition-all ${remainingBudget < staff.cost ? 'opacity-10 cursor-not-allowed' : 'bg-gold/10 text-gold hover:bg-gold hover:text-black font-black'}`}>+</button>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between py-3 border-t border-white/5">
                                    <div className="text-[10px] font-black uppercase tracking-wide text-slate-400 italic">Apoticario <span className="text-gold/50 ml-1">(50k)</span></div>
                                    <button 
                                        onClick={() => setApothecary(!apothecary)}
                                        disabled={!apothecary && remainingBudget < 50000}
                                        className={`text-[9px] font-black px-4 py-1.5 rounded-full border transition-all uppercase tracking-[0.1em] italic ${apothecary ? 'bg-gold text-black border-gold' : 'text-gold bg-gold/5 border-gold/20 hover:bg-gold/10 shadow-lg'}`}
                                    >
                                        {apothecary ? 'CONTRATADO' : 'CONTRATAR'}
                                    </button>
                                </div>
                            </div>
                        </details>
                    </div>

                    {/* Roster List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-3 no-scrollbar custom-scroll-area bg-black/10">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Roster Actual</h3>
                            <span className="text-[9px] font-black text-gold/30 italic uppercase">#{currentFaction.name}</span>
                        </div>
                        <AnimatePresence initial={false}>
                            {draftedPlayers.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 0.3 }}
                                    className="flex flex-col items-center justify-center py-24 text-slate-600 space-y-3"
                                >
                                    <span className="material-symbols-outlined text-5xl">stadium</span>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">Sin jugadores activos</p>
                                </motion.div>
                            ) : (
                                draftedPlayers.map((p, idx) => (
                                    <motion.div 
                                        layout
                                        key={p.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="bg-[#0a0a0a]/80 border border-white/5 rounded-xl p-3 flex items-center justify-between group hover:border-white/20 transition-all shadow-xl"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 text-[10px] flex items-center justify-center font-mono font-black text-gold/40 shadow-inner">#{String(idx + 1).padStart(2, '0')}</span>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-header font-black text-white italic uppercase tracking-tighter leading-none">{p.position}</span>
                                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{(p.cost).toLocaleString()} gp</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleFirePlayer(p.id as number)}
                                            className="w-8 h-8 flex items-center justify-center text-blood hover:bg-blood/10 rounded-lg transition-all active:scale-90"
                                        >
                                            <span className="material-symbols-outlined text-lg font-black">close</span>
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Action */}
                    <div className="p-8 bg-black/40 border-t border-white/10 space-y-6 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                        <div className="flex justify-between items-end border-b border-white/5 pb-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Valor Equipo (TV)</span>
                            <span className="text-2xl font-header font-black text-white italic tracking-tighter">{totalCost / 1000} <small className="text-xs text-gold">k</small></span>
                        </div>
                        <button 
                            disabled={!canFinalize}
                            onClick={handleSubmit}
                            className={`w-full py-5 rounded-2xl font-header font-black text-lg tracking-[0.2em] uppercase italic flex items-center justify-center gap-3 transition-all duration-500 shadow-2xl ${canFinalize ? 'bg-gradient-to-br from-gold to-yellow-700 text-black shadow-gold/30 hover:scale-[1.02] hover:brightness-110' : 'bg-white/5 border border-white/10 text-white/20 cursor-not-allowed opacity-30 grayscale'}`}
                        >
                            <span className="material-symbols-outlined text-2xl">sports_football</span>
                            Fundar Equipo
                        </button>
                        <p className="text-[10px] text-center text-slate-600 font-bold italic uppercase tracking-widest leading-relaxed">
                            {draftedPlayers.length < 11 
                                ? `* Faltan ${11 - draftedPlayers.length} jugadores para registrar`
                                : isBudgetNegative 
                                    ? '* Saldo excedido: No tienes suficiente oro'
                                    : !teamName.trim()
                                        ? '* Introduce un nombre para tu franquicia'
                                        : '✓ Equipo listo para saltar al césped'
                            }
                        </p>
                    </div>
                </aside>
            </main>

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
