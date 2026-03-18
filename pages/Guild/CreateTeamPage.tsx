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
    const [crestImage, setCrestImage] = useState<string | null>(null);

    // Initial Budget
    const startingTreasury = 1000000;

    const currentFaction = useMemo(() => {
        return rosterTemplates[selectedFactionIdx] || null;
    }, [rosterTemplates, selectedFactionIdx]);

    useEffect(() => {
        if (!loading && initialRosterName && rosterTemplates.length > 0) {
            const index = rosterTemplates.findIndex(tm => tm.name === initialRosterName);
            if (index !== -1) setSelectedFactionIdx(index);
        }
    }, [initialRosterName, rosterTemplates, loading]);

    // Reset draft if faction changes
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
            crestImage: crestImage || undefined
        };
        onTeamCreate(newTeam);
    };

    if (loading || !currentFaction) {
        return (
            <div className="flex flex-col items-center justify-center p-20 min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mb-4"></div>
                <p className="text-slate-400 font-display animate-pulse uppercase tracking-widest">Sincronizando con Nuffle...</p>
            </div>
        );
    }

    return (
        <div className="bg-[#0a0a0a] text-slate-100 min-h-screen flex flex-col font-sans relative overflow-x-hidden">
            {/* TOP BAR / STICKY HEADER */}
            <header className="sticky top-0 z-50 w-full bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/10 px-6 py-4 shadow-2xl">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-gold text-3xl font-bold">shield</span>
                        <h1 className="text-xl font-header font-black tracking-tight text-white uppercase italic">Fundar Equipo</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-[#171717] border border-gold/30 px-6 py-2 rounded-2xl flex flex-col items-center shadow-inner">
                            <span className="text-[10px] uppercase tracking-widest text-gold/70 font-bold">Oro Disponible</span>
                            <span className={`text-2xl font-black transition-all ${isBudgetNegative ? 'text-blood animate-pulse' : 'shimmer-text'}`}>
                                {remainingBudget.toLocaleString()} <small className="text-xs">gp</small>
                            </span>
                        </div>
                        <div className="bg-[#171717] border border-white/10 px-6 py-2 rounded-2xl flex flex-col items-center shadow-inner">
                            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Jugadores</span>
                            <span className={`text-2xl font-black ${draftedPlayers.length < 11 ? 'text-blood' : 'text-green-500'}`}>
                                {draftedPlayers.length} / 16
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto w-full p-6 space-y-20 pb-40">
                {/* STEP 1: IDENTITY */}
                <section className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold text-[#0a0a0a] font-header font-black shadow-lg shadow-gold/20 italic">1</span>
                        <h2 className="text-2xl font-header font-black text-white uppercase tracking-tight italic">Identidad de la Franquicia</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-1 space-y-5">
                            <label className="block group">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-gold transition-colors">Nombre de la Franquicia</span>
                                <input 
                                    className="mt-2 w-full bg-[#171717] border border-white/10 rounded-2xl p-4 text-white focus:ring-1 focus:ring-gold focus:border-gold transition-all font-header text-lg italic outline-none shadow-inner"
                                    placeholder="Ej: Los Segadores de Altdorf" 
                                    type="text"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                />
                            </label>
                            <p className="text-[10px] text-slate-500 italic uppercase tracking-[0.2em] px-2 opacity-60">
                                {teamName ? `"${teamName}: El miedo es temporal, la gloria es eterna."` : '"El miedo es temporal, la gloria de la liga es eterna."'}
                            </p>
                        </div>
                        <div className="lg:col-span-2 space-y-5">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Seleccionar Raza</span>
                            <div className="flex gap-8 overflow-x-auto pb-6 no-scrollbar snap-x">
                                {rosterTemplates.map((tm, idx) => {
                                    const isSelected = selectedFactionIdx === idx;
                                    return (
                                        <div 
                                            key={idx} 
                                            onClick={() => setSelectedFactionIdx(idx)}
                                            className={`flex-none w-32 group cursor-pointer snap-center text-center transition-all ${isSelected ? 'opacity-100 scale-105' : 'opacity-40 grayscale hover:opacity-80 hover:grayscale-0'}`}
                                        >
                                            <div className={`w-24 h-24 mx-auto rounded-full bg-[#171717] p-1 shadow-2xl transition-all ${isSelected ? 'border-4 border-gold ring-4 ring-gold/20' : 'border-2 border-white/10 hover:border-gold/50'}`}>
                                                <div className="w-full h-full rounded-full bg-cover bg-center bg-zinc-800" style={{ backgroundImage: tm.image ? `url(${tm.image})` : 'none' }}>
                                                    {!tm.image && <span className="flex items-center justify-center h-full text-2xl font-black text-white/20">{tm.name.charAt(0)}</span>}
                                                </div>
                                            </div>
                                            <p className={`mt-4 text-[10px] font-black uppercase tracking-widest transition-colors ${isSelected ? 'text-gold' : 'text-slate-400 group-hover:text-white'}`}>{tm.name}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* STEP 2: THE DRAFT */}
                <section className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold text-[#0a0a0a] font-header font-black shadow-lg shadow-gold/20 italic">2</span>
                        <h2 className="text-2xl font-header font-black text-white uppercase tracking-tight italic">The Draft: Reclutamiento</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Market Column */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="flex justify-between items-center px-1">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Posiciones Disponibles</h3>
                                <span className="text-[10px] font-bold text-gold/50 italic capitalize">Tier {currentFaction.tier}</span>
                            </div>
                            <div className="space-y-3">
                                {currentFaction.roster.map((pos, idx) => {
                                    const count = draftedPlayers.filter(p => p.position === pos.position).length;
                                    const limitStr = pos.qty.split('-')[1] || pos.qty;
                                    const limit = parseInt(limitStr);
                                    const isFull = count >= limit;
                                    const canAfford = remainingBudget >= pos.cost;

                                    return (
                                        <div key={idx} className={`bg-[#171717] border rounded-3xl p-6 flex items-center justify-between transition-all group ${isFull ? 'opacity-40 border-white/5' : 'border-white/10 hover:border-gold/30 hover:bg-white/[0.02] shadow-xl hover:shadow-gold/5'}`}>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-white font-header font-black text-xl italic uppercase tracking-tighter">{pos.position}</span>
                                                    {pos.skillKeys && pos.skillKeys.length > 0 && (
                                                        <div className="flex gap-1">
                                                            {pos.skillKeys.map((s, si) => (
                                                                <span key={si} className="text-[8px] px-1.5 py-0.5 bg-gold/10 text-gold rounded font-black uppercase tracking-tighter border border-gold/20">{localizeSkill(s)}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-5">
                                                    {['MA', 'ST', 'AG', 'PA', 'AV'].map(stat => (
                                                        <div key={stat} className="flex flex-col items-center">
                                                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">{stat}</span>
                                                            <span className="text-sm font-mono font-black text-white">{(pos.stats as any)[stat === 'MA' ? 'MV' : stat === 'ST' ? 'FU' : stat === 'AV' ? 'AR' : stat]}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-t border-white/5 pt-2 mt-1">{count} / {limit} RECLUTADOS</span>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <span className="text-2xl font-header font-black text-gold italic">{pos.cost / 1000}k <small className="text-[10px] opacity-50">gp</small></span>
                                                <button 
                                                    onClick={() => handleHirePlayer(pos)}
                                                    disabled={isFull || !canAfford}
                                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isFull || !canAfford ? 'bg-zinc-800 text-slate-600 cursor-not-allowed' : 'bg-gold text-[#0a0a0a] hover:scale-110 active:scale-95 shadow-lg shadow-gold/20'}`}
                                                >
                                                    <span className="material-symbols-outlined font-black">add</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Roster Column */}
                        <div className="lg:col-span-5 space-y-6">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Roster Actual ({draftedPlayers.length})</h3>
                            <div className="bg-[#171717]/50 border border-dashed border-white/20 rounded-[2.5rem] min-h-[500px] p-6 flex flex-col gap-4 overflow-y-auto no-scrollbar shadow-inner">
                                <AnimatePresence initial={false}>
                                    {draftedPlayers.length === 0 ? (
                                        <motion.div 
                                            initial={{ opacity: 0 }} animate={{ opacity: 0.2 }}
                                            className="flex flex-col items-center justify-center py-40 text-slate-400 gap-4"
                                            key="empty"
                                        >
                                            <span className="material-symbols-outlined text-6xl">group_add</span>
                                            <p className="text-xs font-black uppercase tracking-[0.2em] italic">No has reclutado jugadores todavía</p>
                                        </motion.div>
                                    ) : (
                                        draftedPlayers.map((p, idx) => (
                                            <motion.div 
                                                key={p.id}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="bg-[#0a0a0a]/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center justify-between group hover:border-white/20 transition-all shadow-lg"
                                            >
                                                <div className="flex items-center gap-5">
                                                    <span className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 text-[10px] flex items-center justify-center font-mono font-black text-gold/60 shadow-inner">
                                                        #{String(idx + 1).padStart(2, '0')}
                                                    </span>
                                                    <div className="flex flex-col">
                                                        <span className="text-md font-header font-black text-white italic uppercase tracking-tighter">{p.position}</span>
                                                        <span className="text-[8px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">{currentFaction.name}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <span className="text-xs font-mono font-black text-slate-400 italic">{(p.cost).toLocaleString()} gp</span>
                                                    <button 
                                                        onClick={() => handleFirePlayer(p.id as number)}
                                                        className="w-10 h-10 flex items-center justify-center text-blood hover:bg-blood/10 rounded-xl transition-all active:scale-90"
                                                    >
                                                        <span className="material-symbols-outlined font-black">do_not_disturb_on</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </section>

                {/* STEP 3: STAFF & INCENTIVES */}
                <section className="space-y-10 pt-16 border-t border-white/5 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold text-[#0a0a0a] font-header font-black shadow-lg shadow-gold/20 italic">3</span>
                        <h2 className="text-2xl font-header font-black text-white uppercase tracking-tight italic">Staff & Incentivos</h2>
                    </div>
                    
                    <div className="bg-blood/10 border border-blood/20 rounded-[2rem] p-6 flex items-center gap-6 group overflow-hidden relative shadow-2xl">
                        <div className="absolute inset-0 bg-blood/10 blur-[50px] -z-10 group-hover:scale-110 transition-transform"></div>
                        <div className="w-12 h-12 bg-blood/20 rounded-2xl flex items-center justify-center text-blood shadow-inner">
                            <span className="material-symbols-outlined font-black animate-pulse">warning</span>
                        </div>
                        <p className="text-sm font-medium text-red-200 leading-relaxed italic">
                            Aprovecha ahora: <span className="font-header font-black underline italic text-blood uppercase tracking-wide">¡Los Rerolls duplicarán su precio</span> una vez fundado el equipo! Nuffle no perdona la falta de previsión.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Reroll Card */}
                        <div className="bg-[#171717] border border-white/10 rounded-[2.5rem] p-8 flex flex-col gap-6 hover:border-gold/30 hover:bg-white/[0.01] transition-all shadow-2xl">
                            <div className="flex justify-between items-start">
                                <div className="p-4 bg-gold/10 rounded-2xl text-gold border border-gold/20 shadow-inner">
                                    <span className="material-symbols-outlined text-4xl font-black">refresh</span>
                                </div>
                                <span className="text-3xl font-header font-black text-white italic">{currentFaction.rerollCost / 1000}k <small className="text-xs text-slate-600 font-mono italic">ea</small></span>
                            </div>
                            <div>
                                <h4 className="font-header font-black text-xl text-white italic uppercase tracking-tighter">Rerolls de Equipo</h4>
                                <p className="text-xs text-slate-500 italic leading-relaxed mt-2 uppercase tracking-wide">Permite repetir una tirada fallida por mitad de juego. La base de toda estrategia.</p>
                            </div>
                            <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                                <button 
                                    onClick={() => setRerolls(Math.max(0, rerolls - 1))}
                                    className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 text-slate-500 hover:bg-blood/10 hover:text-blood transition-all flex items-center justify-center font-black text-xl shadow-inner">-</button>
                                <span className="font-header font-black text-3xl text-white italic border-b-2 border-gold/20 px-4">{rerolls}</span>
                                <button 
                                    onClick={() => setRerolls(rerolls + 1)}
                                    disabled={remainingBudget < currentFaction.rerollCost}
                                    className={`w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 text-gold hover:bg-gold/20 transition-all flex items-center justify-center font-black text-xl shadow-inner ${remainingBudget < currentFaction.rerollCost ? 'opacity-20 cursor-not-allowed' : ''}`}>+</button>
                            </div>
                        </div>

                        {/* Apothecary Card */}
                        <div className={`bg-[#171717] border rounded-[2.5rem] p-8 flex flex-col gap-6 transition-all shadow-2xl ${apothecary ? 'border-gold/50 bg-gold/[0.02]' : 'border-white/10 hover:border-gold/30 hover:bg-white/[0.01]'}`}>
                            <div className="flex justify-between items-start">
                                <div className={`p-4 rounded-2xl border transition-all shadow-inner ${apothecary ? 'bg-gold text-[#0a0a0a] border-gold' : 'bg-gold/10 text-gold border-gold/20'}`}>
                                    <span className="material-symbols-outlined text-4xl font-black">medical_services</span>
                                </div>
                                <span className="text-3xl font-header font-black text-white italic">50k</span>
                            </div>
                            <div>
                                <h4 className="font-header font-black text-xl text-white italic uppercase tracking-tighter">Apoticario</h4>
                                <p className="text-xs text-slate-500 italic leading-relaxed mt-2 uppercase tracking-wide">Inversión obligatoria para proteger el capital humano. Salva a tus cracks.</p>
                            </div>
                            <div className="mt-auto pt-6 border-t border-white/5">
                                <button 
                                    onClick={() => setApothecary(!apothecary)}
                                    disabled={!apothecary && remainingBudget < 50000}
                                    className={`w-full py-4 rounded-2xl border font-header font-black text-sm tracking-[0.15em] uppercase italic transition-all shadow-xl ${apothecary ? 'bg-gold text-[#0a0a0a] border-gold hover:opacity-90' : 'bg-white/5 border-white/10 text-white hover:bg-gold hover:text-[#0a0a0a] hover:border-gold hover:scale-[1.02]'}`}
                                >
                                    {apothecary ? 'CONTRATADO' : 'CONTRATAR'}
                                </button>
                            </div>
                        </div>

                        {/* Fan Factor Card */}
                        <div className="bg-[#171717] border border-white/10 rounded-[2.5rem] p-8 flex flex-col gap-6 hover:border-gold/30 hover:bg-white/[0.01] transition-all shadow-2xl">
                            <div className="flex justify-between items-start">
                                <div className="p-4 bg-gold/10 rounded-2xl text-gold border border-gold/20 shadow-inner">
                                    <span className="material-symbols-outlined text-4xl font-black">campaign</span>
                                </div>
                                <span className="text-3xl font-header font-black text-white italic">10k <small className="text-xs text-slate-600 font-mono italic">ea</small></span>
                            </div>
                            <div>
                                <h4 className="font-header font-black text-xl text-white italic uppercase tracking-tighter">Factor de Hinchas</h4>
                                <p className="text-xs text-slate-500 italic leading-relaxed mt-2 uppercase tracking-wide">Más fans, más Oro al final del partido. Una franquicia necesita público.</p>
                            </div>
                            <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                                <button 
                                    onClick={() => setDedicatedFans(Math.max(1, dedicatedFans - 1))}
                                    className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 text-slate-500 hover:bg-blood/10 hover:text-blood transition-all flex items-center justify-center font-black text-xl shadow-inner">-</button>
                                <span className="font-header font-black text-3xl text-white italic border-b-2 border-gold/20 px-4">{dedicatedFans}</span>
                                <button 
                                    onClick={() => setDedicatedFans(dedicatedFans + 1)}
                                    disabled={remainingBudget < 10000}
                                    className={`w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 text-gold hover:bg-gold/20 transition-all flex items-center justify-center font-black text-xl shadow-inner ${remainingBudget < 10000 ? 'opacity-20 cursor-not-allowed' : ''}`}>+</button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* BENTO SUMMARY & FINAL CTA */}
                <section className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-40">
                    <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="bg-[#171717] border border-white/10 rounded-3xl p-6 flex flex-col justify-center shadow-xl">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-3 italic">Valor de Equipo</span>
                            <span className="text-2xl font-header font-black text-white italic">{totalCost / 1000} TV</span>
                        </div>
                        <div className="bg-[#171717] border border-white/10 rounded-3xl p-6 flex flex-col justify-center shadow-xl">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-3 italic">Coste Actual</span>
                            <span className="text-2xl font-header font-black text-white italic">{(totalCost).toLocaleString()} gp</span>
                        </div>
                        <div className="bg-[#171717] border border-white/10 rounded-3xl p-6 flex flex-col justify-center shadow-xl">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-3 italic">Tesorería Restante</span>
                            <span className={`text-2xl font-header font-black italic ${isBudgetNegative ? 'text-blood' : 'shimmer-text'}`}>{remainingBudget.toLocaleString()} gp</span>
                        </div>
                        <div className="bg-[#171717] border border-white/10 rounded-3xl p-6 flex flex-col justify-center shadow-xl">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-3 italic">Mín. Requerido</span>
                            <span className={`text-2xl font-header font-black italic ${draftedPlayers.length < 11 ? 'text-blood' : 'text-green-500'}`}>11 Jugadores</span>
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <button 
                            disabled={!canFinalize}
                            onClick={handleSubmit}
                            className={`w-full h-full min-h-[100px] rounded-3xl font-header font-black text-2xl tracking-[0.1em] uppercase italic flex items-center justify-center gap-4 transition-all duration-500 shadow-2xl ${canFinalize ? 'bg-gradient-to-br from-gold to-yellow-700 text-[#0a0a0a] shadow-gold/30 hover:scale-[1.05] hover:brightness-110' : 'bg-white/5 border border-white/10 text-white/20 cursor-not-allowed opacity-50 grayscale'}`}
                        >
                            <span className="material-symbols-outlined text-3xl">stadium</span>
                            Fundar Equipo
                        </button>
                    </div>
                </section>
            </main>

            {/* FIXED FOOTER (MOBILE ONLY) */}
            <footer className="fixed bottom-0 left-0 w-full bg-[#171717]/90 backdrop-blur-2xl border-t border-white/10 py-5 px-8 lg:hidden z-50 shadow-2xl flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gold font-black tracking-[0.2em] uppercase italic">DISPONIBLE</span>
                    <span className={`font-header font-black text-2xl italic tracking-tighter ${isBudgetNegative ? 'text-blood animate-pulse' : 'shimmer-text'}`}>{remainingBudget.toLocaleString()}</span>
                </div>
                <button className="bg-gold text-[#0a0a0a] font-header font-black py-3 px-8 rounded-2xl text-xs uppercase tracking-tighter italic shadow-xl shadow-gold/20">ROSTER ({draftedPlayers.length})</button>
            </footer>

            {/* Skill Modal */}
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
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default TeamCreator;
