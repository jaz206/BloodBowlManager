import React, { useState, useMemo, useEffect } from 'react';
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
    const { teams: rosterTemplates, loading } = useMasterData();

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
    const [editingPlayerNameId, setEditingPlayerNameId] = useState<number | null>(null);

    // Initial Budget
    const startingTreasury = 1000000;

    const currentFaction = useMemo(() => {
        return rosterTemplates[selectedFactionIdx] || null;
    }, [rosterTemplates, selectedFactionIdx]);

    useEffect(() => {
        if (!loading && initialRosterName && rosterTemplates.length > 0) {
            const index = rosterTemplates.findIndex(t => t.name === initialRosterName);
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
        setCrestImage(null);
    }, [selectedFactionIdx]);

    const handleCrestUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 200;
                const MAX_HEIGHT = 200;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                setCrestImage(canvas.toDataURL('image/png'));
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
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

    const handleHirePlayer = (pos: Player) => {
        if (draftedPlayers.length >= 16) return;
        if (remainingBudget < pos.cost) return;

        // Check positional limit
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

    const handlePlayerNameUpdate = (id: number, newName: string) => {
        setDraftedPlayers(draftedPlayers.map(p => p.id === id ? { ...p, customName: newName } : p));
    };

    const { skills: allSkills } = useMasterData();

    /** Resolve a canonical English key to the localized skill name */
    const localizeSkill = (keyEN: string): string => {
        const found = allSkills.find(s => s.keyEN === keyEN);
        return found?.name ?? keyEN;
    };

    const handleSkillClick = (keyEN: string) => {
        const cleanKey = keyEN.replace(/\(\+\d\)/g, '').trim();
        const found = allSkills.find(s => s.keyEN === keyEN || s.keyEN === cleanKey);
        if (found) setSelectedSkill(found);
    };

    const handleSubmit = () => {
        if (!teamName.trim() || !currentFaction) return;
        if (draftedPlayers.length < 11) {
            alert("Un equipo debe tener al menos 11 jugadores.");
            return;
        }

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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-premium-gold mb-4"></div>
                <p className="text-slate-400 font-display animate-pulse uppercase tracking-widest">{t('loading.sync')}</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-700 bg-background-dark/50 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
            {/* Header Area */}
            <div className="p-6 lg:px-12 border-b border-white/5 bg-black/40 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="text-premium-gold bg-premium-gold/10 p-3 rounded-2xl border border-premium-gold/20 shadow-inner">
                        <span className="material-symbols-outlined text-4xl font-bold">shield</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic leading-none">{t('team.create.title')}</h1>
                        <p className="text-[10px] text-premium-gold/80 font-black tracking-[0.3em] uppercase mt-1">{t('team.create.draft')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center rounded-xl h-12 w-12 bg-zinc-800 border border-white/5 text-slate-300 hover:bg-premium-gold/10 hover:text-premium-gold transition-all duration-300">
                        <span className="material-symbols-outlined font-bold">settings</span>
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-3 rounded-xl bg-premium-gold text-black font-black hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(202,138,4,0.3)] uppercase tracking-tighter text-sm italic"
                    >
                        <span className="material-symbols-outlined font-bold">save</span>
                        <span>{t('team.create.save')}</span>
                    </button>
                </div>
            </div>

            <div className="p-6 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Main Content */}
                <section className="lg:col-span-8 space-y-12">
                    {/* Club Data */}
                    <div className="bg-zinc-900/40 p-8 rounded-3xl border border-white/5 shadow-inner">
                        <h3 className="text-premium-gold text-xs font-black mb-8 flex items-center gap-3 uppercase tracking-[0.2em] italic">
                            <span className="material-symbols-outlined text-sm">info</span> {t('team.create.data')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">{t('team.create.name')}</label>
                                <input
                                    className="w-full bg-black/60 border border-white/5 rounded-2xl text-white focus:ring-2 focus:ring-premium-gold/50 focus:border-transparent p-4 outline-none transition-all placeholder:text-slate-700 shadow-inner"
                                    placeholder="Ej: Los Segadores de Altdorf"
                                    type="text"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">{t('team.create.faction')}</label>
                                <div className="relative group">
                                    <select
                                        className="w-full bg-black/60 border border-white/5 rounded-2xl text-white focus:ring-2 focus:ring-premium-gold/50 focus:border-transparent p-4 outline-none appearance-none cursor-pointer transition-all shadow-inner"
                                        value={selectedFactionIdx}
                                        onChange={(e) => setSelectedFactionIdx(parseInt(e.target.value))}
                                    >
                                        {rosterTemplates.map((t, idx) => (
                                            <option key={idx} value={idx}>{t.name}</option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-premium-gold transition-colors font-bold">expand_more</span>
                                </div>
                            </div>
                            <div className="space-y-3 md:col-span-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Escudo del Club</label>
                                <div className="flex items-center gap-4">
                                    <div 
                                        onClick={() => document.getElementById('crest-upload')?.click()}
                                        className="size-24 bg-black/60 border-2 border-white/10 rounded-2xl flex items-center justify-center cursor-pointer hover:border-premium-gold/50 hover:bg-premium-gold/5 transition-all overflow-hidden relative group shadow-2xl"
                                    >
                                        {crestImage ? (
                                            <img src={crestImage} alt="Crest" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="material-symbols-outlined text-slate-700 group-hover:text-premium-gold transition-colors text-4xl">add_photo_alternate</span>
                                                <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest group-hover:text-premium-gold">Subir Escudo</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity border-2 border-premium-gold">
                                            <span className="material-symbols-outlined text-white text-2xl font-bold">upload_file</span>
                                        </div>
                                    </div>
                                    <input id="crest-upload" type="file" accept="image/*" className="hidden" onChange={handleCrestUpload} />
                                    <p className="text-[10px] text-slate-500 italic max-w-[180px] leading-relaxed">Personaliza el blasón de tu equipo. <span className="text-premium-gold">Sube una imagen</span> para que tus guerreros la porten con orgullo.</p>
                                </div>

                            </div>
                            <div className="space-y-3 md:col-span-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">{t('team.create.coach')}</label>
                                <input
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl text-slate-500 p-4 shadow-inner cursor-not-allowed italic font-medium"
                                    readOnly
                                    type="text"
                                    value={user?.name || 'Coach Unknown'}
                                />
                            </div>
                        </div>
                    </div>

                    {/* hiring Table */}
                    <div className="bg-zinc-900/20 p-8 rounded-3xl border border-white/5">
                        <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
                            <h3 className="text-premium-gold text-xs font-black flex items-center gap-3 uppercase tracking-[0.2em] italic">
                                <span className="material-symbols-outlined">group_add</span> {t('team.create.hire')}
                            </h3>
                            <span className="text-[10px] text-slate-500 italic font-medium uppercase tracking-widest">{t('team.create.hire.limit')}</span>
                        </div>
                        <div className="overflow-x-visible lg:mx-0 lg:px-0">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-black">
                                        <th className="pb-4 px-4">{t('oracle.tabs.teams')}</th>
                                        <th className="pb-4 px-2 text-center">MA</th>
                                        <th className="pb-4 px-2 text-center">ST</th>
                                        <th className="pb-4 px-2 text-center">AG</th>
                                        <th className="pb-4 px-2 text-center">PA</th>
                                        <th className="pb-4 px-2 text-center">AV</th>
                                        <th className="pb-4 px-4">Habilidades</th>
                                        <th className="pb-4 px-4 text-right">Coste</th>
                                        <th className="pb-4 px-4 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {currentFaction.roster.map((pos, idx) => {
                                        const count = draftedPlayers.filter(p => p.position === pos.position).length;
                                        const limitStr = pos.qty.split('-')[1] || pos.qty;
                                        const limit = parseInt(limitStr);
                                        const isFull = count >= limit;
                                        const canAfford = remainingBudget >= pos.cost;

                                        return (
                                            <tr key={idx} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors group">
                                                <td className="py-5 px-4">
                                                    <p className="font-black text-white group-hover:text-premium-gold transition-colors italic">{pos.position}</p>
                                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{count} / {limit}</p>
                                                </td>
                                                <td className="py-5 px-2 text-center font-mono font-black text-slate-400">{pos.stats.MV}</td>
                                                <td className="py-5 px-2 text-center font-mono font-black text-slate-400">{pos.stats.FU}</td>
                                                <td className="py-5 px-2 text-center font-mono font-black text-slate-400">{pos.stats.AG}</td>
                                                <td className="py-5 px-2 text-center font-mono font-black text-slate-400">{pos.stats.PS}</td>
                                                <td className="py-5 px-2 text-center font-mono font-black text-slate-400">{pos.stats.AR}</td>
                                                <td className="py-5 px-4 text-[11px] text-slate-500 leading-relaxed font-medium italic group-hover:text-slate-300 transition-colors">
                                                    {pos.skillKeys && pos.skillKeys.length > 0 ? (
                                                        <div className="flex flex-wrap gap-x-2 gap-y-1">
                                                            {pos.skillKeys.map((keyEN, sIdx) => (
                                                                <button
                                                                    key={sIdx}
                                                                    onClick={() => handleSkillClick(keyEN)}
                                                                    className="hover:text-premium-gold transition-colors cursor-pointer text-left underline-offset-2 hover:underline"
                                                                    title="Ver descripción"
                                                                >
                                                                    {localizeSkill(keyEN)}{sIdx < pos.skillKeys.length - 1 ? ',' : ''}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : '-'}
                                                </td>
                                                <td className="py-5 px-4 text-right font-mono font-black text-premium-gold italic">{(pos.cost / 1000)}k</td>
                                                <td className="py-5 px-4 text-center">
                                                    <button
                                                        onClick={() => handleHirePlayer(pos)}
                                                        disabled={isFull || !canAfford}
                                                        className={`size-10 rounded-xl flex items-center justify-center transition-all ${isFull || !canAfford ? 'opacity-20 cursor-not-allowed bg-zinc-800' : 'bg-premium-gold/10 text-premium-gold hover:bg-premium-gold hover:text-black hover:scale-110 shadow-lg shadow-premium-gold/5 border border-premium-gold/20'}`}
                                                    >
                                                        <span className="material-symbols-outlined font-bold">add</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Team Goods */}
                    <div className="bg-zinc-900/20 p-8 rounded-3xl border border-white/5">
                        <h3 className="text-premium-gold text-xs font-black mb-8 flex items-center gap-3 uppercase tracking-[0.2em] italic">
                            <span className="material-symbols-outlined">shopping_cart</span> {t('team.create.goods')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Rerolls */}
                            <div className="bg-black/40 border border-white/5 p-6 rounded-2xl flex flex-col justify-between group hover:border-premium-gold/30 transition-all shadow-inner">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1">
                                        <p className="font-black text-white italic leading-none">{t('team.create.rerolls')}</p>
                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Re-rolls</p>
                                    </div>
                                    <span className="text-premium-gold font-mono font-black italic">{(currentFaction.rerollCost / 1000)}k</span>
                                </div>
                                <div className="flex items-center gap-4 bg-zinc-800/50 p-2 rounded-xl border border-white/5">
                                    <button
                                        onClick={() => setRerolls(Math.max(0, rerolls - 1))}
                                        className="size-10 rounded-lg bg-zinc-700 text-slate-400 hover:bg-red-900/40 hover:text-red-400 transition-colors flex items-center justify-center"
                                    >
                                        <span className="material-symbols-outlined font-bold">remove</span>
                                    </button>
                                    <span className="flex-1 text-center font-mono text-2xl font-black text-white italic">{rerolls}</span>
                                    <button
                                        onClick={() => setRerolls(rerolls + 1)}
                                        disabled={remainingBudget < currentFaction.rerollCost}
                                        className={`size-10 rounded-lg bg-zinc-700 text-slate-400 hover:bg-premium-gold/20 hover:text-premium-gold transition-colors flex items-center justify-center ${remainingBudget < currentFaction.rerollCost ? 'opacity-20' : ''}`}
                                    >
                                        <span className="material-symbols-outlined font-bold">add</span>
                                    </button>
                                </div>
                            </div>

                            {/* Apothecary */}
                            <div className="bg-black/40 border border-white/5 p-6 rounded-2xl flex flex-col justify-between group hover:border-premium-gold/30 transition-all shadow-inner">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1">
                                        <p className="font-black text-white italic leading-none">{t('team.create.apothecary')}</p>
                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Apothecary</p>
                                    </div>
                                    <span className="text-premium-gold font-mono font-black italic">50k</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] text-slate-500 italic font-black uppercase tracking-[0.1em]">Límite 1</span>
                                    <button
                                        onClick={() => setApothecary(!apothecary)}
                                        disabled={!apothecary && remainingBudget < 50000}
                                        className={`px-5 py-2 text-[10px] rounded-xl border font-black uppercase tracking-widest transition-all italic ${apothecary ? 'bg-premium-gold text-black border-premium-gold' : 'border-premium-gold/40 text-premium-gold hover:bg-premium-gold/10'}`}
                                    >
                                        {apothecary ? 'CONTRATADO' : 'CONTRATAR'}
                                    </button>
                                </div>
                            </div>

                            {/* Fans */}
                            <div className="bg-black/40 border border-white/5 p-6 rounded-2xl flex flex-col justify-between group hover:border-premium-gold/30 transition-all shadow-inner">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1">
                                        <p className="font-black text-white italic leading-none">{t('team.create.fans')}</p>
                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Dedicated Fans</p>
                                    </div>
                                    <span className="text-premium-gold font-mono font-black italic">10k</span>
                                </div>
                                <div className="flex items-center gap-4 bg-zinc-800/50 p-2 rounded-xl border border-white/5">
                                    <button
                                        onClick={() => setDedicatedFans(Math.max(1, dedicatedFans - 1))}
                                        className="size-10 rounded-lg bg-zinc-700 text-slate-400 hover:bg-red-900/40 hover:text-red-400 transition-colors flex items-center justify-center"
                                    >
                                        <span className="material-symbols-outlined font-bold">remove</span>
                                    </button>
                                    <span className="flex-1 text-center font-mono text-2xl font-black text-white italic">{dedicatedFans}</span>
                                    <button
                                        onClick={() => setDedicatedFans(Math.min(6, dedicatedFans + 1))}
                                        disabled={remainingBudget < 10000 || dedicatedFans >= 6}
                                        className={`size-10 rounded-lg bg-zinc-700 text-slate-400 hover:bg-premium-gold/20 hover:text-premium-gold transition-colors flex items-center justify-center ${(remainingBudget < 10000 || dedicatedFans >= 6) ? 'opacity-20' : ''}`}
                                    >
                                        <span className="material-symbols-outlined font-bold">add</span>
                                    </button>
                                </div>
                            </div>

                            {/* Staff helpers */}
                            {[{
                                key: 'assistants',
                                label: t('team.create.assistants'),
                                detail: 'Assistant Coaches',
                                val: assistantCoaches,
                                set: setAssistantCoaches
                            },
                            {
                                key: 'cheerleaders',
                                label: t('team.create.cheerleaders'),
                                detail: 'Cheerleaders',
                                val: cheerleaders,
                                set: setCheerleaders
                            }].map(staff => (
                                <div key={staff.key} className="bg-black/40 border border-white/5 p-6 rounded-2xl flex flex-col justify-between group hover:border-premium-gold/30 transition-all shadow-inner">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="space-y-1">
                                            <p className="font-black text-white italic leading-none">{staff.label}</p>
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">{staff.detail}</p>
                                        </div>
                                        <span className="text-premium-gold font-mono font-black italic">10k</span>
                                    </div>
                                    <div className="flex items-center gap-4 bg-zinc-800/50 p-2 rounded-xl border border-white/5">
                                        <button
                                            onClick={() => staff.set(Math.max(0, staff.val - 1))}
                                            className="size-10 rounded-lg bg-zinc-700 text-slate-400 hover:bg-red-900/40 hover:text-red-400 transition-colors flex items-center justify-center"
                                        >
                                            <span className="material-symbols-outlined font-bold">remove</span>
                                        </button>
                                        <span className="flex-1 text-center font-mono text-2xl font-black text-white italic">{staff.val}</span>
                                        <button
                                            onClick={() => staff.set(staff.val + 1)}
                                            disabled={remainingBudget < 10000}
                                            className={`size-10 rounded-lg bg-zinc-700 text-slate-400 hover:bg-premium-gold/20 hover:text-premium-gold transition-colors flex items-center justify-center ${remainingBudget < 10000 ? 'opacity-20' : ''}`}
                                        >
                                            <span className="material-symbols-outlined font-bold">add</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Sidebar Summary */}
                <aside className="lg:col-span-4 flex flex-col gap-8">
                    <div className="bg-premium-gold p-8 rounded-[2.5rem] text-black shadow-2xl shadow-premium-gold/10 sticky top-24 border-4 border-black/10">
                        <h3 className="font-black text-2xl uppercase tracking-tighter mb-8 flex items-center gap-3 italic leading-none">
                            <span className="material-symbols-outlined font-bold text-3xl">analytics</span> {t('team.create.summary')}
                        </h3>
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] opacity-60 italic">
                                    <span>{t('team.create.budget')}</span>
                                    <span className="font-mono">{remainingBudget.toLocaleString()} MO</span>
                                </div>
                                <div className="h-4 w-full bg-black/10 rounded-full overflow-hidden p-1 shadow-inner border border-black/5">
                                    <div
                                        className="h-full bg-black rounded-full transition-all duration-500 shadow-lg"
                                        style={{ width: `${Math.max(0, Math.min(100, (totalCost / startingTreasury) * 100))}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black p-5 rounded-2xl shadow-xl border border-white/5">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-premium-gold italic">{t('team.create.tv')}</p>
                                    <p className="text-3xl font-black text-white italic tracking-tighter leading-none mt-2">{totalCost / 1000}k</p>
                                </div>
                                <div className="bg-black p-5 rounded-2xl shadow-xl border border-white/5">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-premium-gold italic">{t('team.create.players')}</p>
                                    <p className="text-3xl font-black text-white italic tracking-tighter leading-none mt-2">{draftedPlayers.length} / 16</p>
                                </div>
                            </div>
                            <div className="border-t-2 border-black/5 pt-8">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 opacity-60 italic">{t('team.create.currentRoster')}</h4>
                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-2 space-y-4">
                                    {draftedPlayers.length > 0 ? (
                                        Array.from(new Set(draftedPlayers.map(p => p.position))).map(posName => {
                                            const playersOfPos = draftedPlayers.filter(p => p.position === posName);
                                            const totalPosCost = playersOfPos.reduce((s, p) => s + p.cost, 0);
                                            return (
                                                <div key={posName} className="flex flex-col gap-1">
                                                    <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg border border-white/5 mb-1">
                                                        <span className="text-sm font-black italic uppercase leading-none">{playersOfPos.length}x {posName}</span>
                                                        <span className="font-mono font-black text-sm italic">{totalPosCost / 1000}k</span>
                                                    </div>
                                                    <div className="flex flex-col gap-2 pl-2">
                                                        {playersOfPos.map((p, pIdx) => (
                                                            <div key={p.id} className="flex items-center gap-2 group/player">
                                                                <span className="text-[10px] font-bold text-black/40">#{pIdx + 1}</span>
                                                                {editingPlayerNameId === p.id ? (
                                                                    <input 
                                                                        autoFocus
                                                                        className="flex-1 bg-black/40 border border-premium-gold/30 rounded px-2 py-0.5 text-xs text-white outline-none"
                                                                        value={p.customName}
                                                                        onChange={(e) => handlePlayerNameUpdate(p.id, e.target.value)}
                                                                        onBlur={() => setEditingPlayerNameId(null)}
                                                                        onKeyDown={(e) => e.key === 'Enter' && setEditingPlayerNameId(null)}
                                                                    />
                                                                ) : (
                                                                    <div 
                                                                        onClick={() => setEditingPlayerNameId(p.id)}
                                                                        className="flex-1 flex items-center gap-2 group/name cursor-pointer"
                                                                    >
                                                                        <span className="text-[11px] font-bold text-black/70 italic group-hover/name:text-black transition-colors truncate">
                                                                            {p.customName}
                                                                        </span>
                                                                        <span className="material-symbols-outlined text-[10px] text-black/20 group-hover/name:text-black/60 transition-colors">edit</span>
                                                                    </div>
                                                                )}

                                                                <button
                                                                    onClick={() => handleFirePlayer(p.id)}
                                                                    className="opacity-0 group-hover/player:opacity-100 size-6 bg-red-900/10 rounded flex items-center justify-center text-red-900 hover:bg-red-900 hover:text-white transition-all"
                                                                >
                                                                    <span className="material-symbols-outlined text-xs">close</span>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-sm font-black italic opacity-40 uppercase tracking-widest">{t('team.create.noStaff')}</p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={handleSubmit}
                                className="w-full mt-10 py-5 rounded-3xl bg-black text-premium-gold font-black uppercase tracking-[0.2em] italic text-sm hover:scale-[1.03] active:scale-95 transition-all shadow-2xl shadow-black/30 border border-white/5"
                            >
                                {t('team.create.finalize')}
                            </button>
                        </div>
                    </div>

                    {/* Race Rules Brief */}
                    <div className="bg-zinc-900 border border-white/5 p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-premium-gold/5 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                        <h4 className="text-[10px] font-black text-premium-gold uppercase tracking-[0.4em] mb-6 italic leading-none">{t('team.create.rules')}: {currentFaction.name}</h4>
                        <div className="flex items-center gap-6 mb-8 relative">
                            <div className="size-16 rounded-2xl bg-black/60 flex items-center justify-center text-premium-gold border border-white/5 shadow-inner">
                                <span className="material-symbols-outlined text-4xl font-bold">sports_kabaddi</span>
                            </div>
                            <div>
                                <p className="text-xl font-black text-white italic tracking-tighter leading-none">Tier {currentFaction.tier}</p>
                                <p className="text-xs text-slate-500 font-medium mt-2">{currentFaction.specialRules || 'Reglas estándar aplicadas.'}</p>
                            </div>
                        </div>
                        <div className="space-y-4 text-sm leading-relaxed text-slate-400 font-medium italic relative">
                            <p>Los equipos de {currentFaction.name} rinden gloria a Nuffle bajo sus propias leyes. Estudia su flexibilidad y coste de reroll antes de saltar al césped.</p>
                            <div className="p-4 bg-black/40 rounded-2xl border border-white/5 italic text-xs leading-relaxed group-hover:border-premium-gold/30 transition-colors">
                                "La victoria no es solo sangre, sino saber qué sacrificios merece Nuffle."
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Skill Modal */}
            {selectedSkill && (
                <SkillModal
                    skill={selectedSkill}
                    onClose={() => setSelectedSkill(null)}
                />
            )}

            {/* Custom Scrollbar Styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(202, 138, 4, 0.2); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(202, 138, 4, 0.5); }
            `}</style>
        </div>
    );
};

export default TeamCreator;