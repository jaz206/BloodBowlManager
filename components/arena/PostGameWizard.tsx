import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { ManagedTeam, ManagedPlayer, Skill } from '../../types';
import { skillsData } from '../../data/skills';
import { teamsData } from '../../data/teams';

interface SkillSelectionModalProps {
    player: ManagedPlayer;
    rosterName: string;
    skillType: 'Primary' | 'Secondary';
    onSelect: (skillName: string) => void;
    onClose: () => void;
}

const SkillSelectionModal: React.FC<SkillSelectionModalProps> = ({ player, rosterName, skillType, onSelect, onClose }) => {
    const baseTeam = useMemo(() => teamsData.find(t => t.name === rosterName), [rosterName]);
    const basePlayer = useMemo(() => baseTeam?.roster.find(p => p.position === player.position), [baseTeam, player.position]);

    const availableSkills = useMemo(() => {
        if (!basePlayer) return [];
        const categoriesString = skillType === 'Primary' ? basePlayer.primary : basePlayer.secondary;
        const categories = (categoriesString || '').split('');

        const categoryMap: { [key: string]: string } = {
            G: 'General', A: 'Agilidad', F: 'Fuerza', P: 'Pase', M: 'Mutaciones'
        };

        const skillCategories = categories.map(c => categoryMap[c]).filter(Boolean);
        const currentSkills = new Set([...(player.skills || '').split(', ').filter(Boolean), ...(player.gainedSkills || [])]);

        return skillsData.filter(skill => {
            const skillName = skill.name_es || skill.name || '';
            return skillCategories.includes(skill.category) && !currentSkills.has(skillName);
        }).sort((a, b) => (a.name_es || a.name || '').localeCompare(b.name_es || b.name || ''));

    }, [basePlayer, skillType, player.gainedSkills, player.skills]);

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="glass-panel border-premium-gold/30 bg-black/80 max-w-lg w-full max-h-[80vh] flex flex-col shadow-[0_0_100px_rgba(245,159,10,0.1)] overflow-hidden animate-slide-in-up" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-white/5 bg-premium-gold/5 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-display font-black text-white uppercase italic tracking-tighter">Ascensión de Talentos</h3>
                        <p className="text-[10px] font-display font-black text-premium-gold uppercase tracking-widest">Habilidad {skillType === 'Primary' ? 'Primaria' : 'Secundaria'}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-blood-red/20 text-slate-500 hover:text-blood-red transition-all flex items-center justify-center border border-white/5">
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto space-y-3 custom-scrollbar">
                    {availableSkills.map(skill => (
                        <button key={skill.name} onClick={() => onSelect(skill.name)} className="w-full text-left bg-white/5 border border-white/5 p-4 rounded-2xl hover:bg-premium-gold/10 hover:border-premium-gold/30 group transition-all">
                            <div className="flex justify-between items-center mb-1">
                                <p className="font-display font-bold text-white group-hover:text-premium-gold transition-colors">{skill.name}</p>
                                <span className="text-[9px] font-display font-black text-slate-500 uppercase tracking-widest group-hover:text-premium-gold/50">{skill.category}</span>
                            </div>
                            <p className="text-xs text-slate-400 group-hover:text-slate-300 leading-relaxed font-display">{skill.description}</p>
                        </button>
                    ))}
                    {availableSkills.length === 0 && (
                        <div className="py-20 text-center opacity-30">
                            <span className="material-symbols-outlined text-5xl mb-4">search_off</span>
                            <p className="font-display font-black uppercase tracking-widest text-sm">No hay sabiduría disponible</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface PostGameWizardProps {
    initialHomeTeam: ManagedTeam;
    finalHomeTeam: ManagedTeam;
    opponentTeam: ManagedTeam;
    score: { home: number; opponent: number };
    fame: number;
    playersMNG: { playerId: number }[];
    onConfirm: (finalTeam: ManagedTeam) => void;
}

interface PostGameState {
    winnings: number;
    mvp: (ManagedPlayer & { teamName: string }) | null;
    team: ManagedTeam;
}

const PostGameWizard: React.FC<PostGameWizardProps> = ({ initialHomeTeam, finalHomeTeam, opponentTeam, score, fame, playersMNG, onConfirm }) => {
    const [step, setStep] = useState(0);
    const [fansChange, setFansChange] = useState<number>(0);
    const [fansRoll, setFansRoll] = useState<number | null>(null);
    const [postGameState, setPostGameState] = useState<PostGameState | null>(null);
    const [skillSelection, setSkillSelection] = useState<{ player: ManagedPlayer, type: 'Primary' | 'Secondary', cost: number } | null>(null);

    const cloneTeamForPostGame = useCallback((team: ManagedTeam): ManagedTeam => {
        const clonedPlayers = team.players.map(p => {
            const clonedPlayer = { ...p };
            if (p.stats) clonedPlayer.stats = { ...p.stats };
            clonedPlayer.gainedSkills = [...(p.gainedSkills || [])];
            clonedPlayer.lastingInjuries = [...(p.lastingInjuries || [])];
            if (p.sppActions) clonedPlayer.sppActions = { ...p.sppActions };
            return clonedPlayer;
        });

        return {
            ...team,
            players: clonedPlayers,
        };
    }, []);

    useEffect(() => {
        if (!finalHomeTeam || !opponentTeam) return;
        let winningsRoll = 0;
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;

        if (score.home > score.opponent) {
            winningsRoll = Math.max(d1, d2);
        } else if (score.home < score.opponent) {
            winningsRoll = Math.min(d1, d2);
        } else {
            winningsRoll = d1;
        }

        const calculatedWinnings = (winningsRoll + finalHomeTeam.dedicatedFans + score.home) * 10000;
        const tempTeam = cloneTeamForPostGame(finalHomeTeam);

        const isEligibleForMvp = (p: ManagedPlayer) => !p.isStarPlayer && !p.isJourneyman;
        const homeEligible = tempTeam.players.filter(isEligibleForMvp);

        let mvpPlayer: (ManagedPlayer & { teamName: string }) | null = null;
        if (homeEligible.length > 0) {
            const randomMvp = homeEligible[Math.floor(Math.random() * homeEligible.length)];
            mvpPlayer = { ...randomMvp, teamName: tempTeam?.name || 'Local' };

            const pIndex = tempTeam.players.findIndex(p => p.id === randomMvp.id);
            if (pIndex !== -1) {
                tempTeam.players[pIndex].spp += 4;
            }
        }

        tempTeam.treasury += calculatedWinnings;

        const mngPlayerIds = new Set(playersMNG.map(p => p.playerId));
        tempTeam.players.forEach(player => {
            if (mngPlayerIds.has(player.id)) {
                player.missNextGame = (player.missNextGame || 0) + 1;
            } else if (player.missNextGame && player.missNextGame > 0) {
                player.missNextGame -= 1;
            }
        });

        setPostGameState({
            winnings: calculatedWinnings,
            mvp: mvpPlayer,
            team: tempTeam,
        });
    }, [finalHomeTeam, opponentTeam, score, fame, playersMNG]);

    const handleConfirm = () => {
        if (!postGameState) return;
        const finalTeam = {
            ...postGameState.team,
            players: postGameState.team.players.filter(p => !p.isStarPlayer && !p.isJourneyman)
        };
        onConfirm(finalTeam);
    };

    const handleFansRoll = () => {
        const roll = Math.floor(Math.random() * 6) + 1;
        setFansRoll(roll);
        let change = 0;

        if (score.home > score.opponent) {
            if (roll > postGameState!.team.dedicatedFans) change = 1;
        } else if (score.home < score.opponent) {
            if (roll < postGameState!.team.dedicatedFans) change = -1;
        }

        setFansChange(change);
        setPostGameState(prev => {
            if (!prev) return null;
            return {
                ...prev,
                team: { ...prev.team, dedicatedFans: Math.max(1, prev.team.dedicatedFans + change) }
            };
        });
    };

    const handleSkillSelectionUpdate = (playerId: number, skillName: string, cost: number) => {
        setPostGameState(prev => {
            if (!prev) return null;
            return {
                ...prev,
                team: {
                    ...prev.team,
                    players: prev.team.players.map(p => {
                        if (p.id === playerId) {
                            return { ...p, spp: p.spp - cost, gainedSkills: [...p.gainedSkills, skillName] };
                        }
                        return p;
                    })
                }
            };
        });
        setSkillSelection(null);
    };

    if (!postGameState) {
        return (
            <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-premium-gold/10 rounded-full border border-premium-gold/30 animate-spin flex items-center justify-center">
                        <span className="material-symbols-outlined text-premium-gold text-4xl">cyclone</span>
                    </div>
                    <p className="text-white font-display font-black uppercase tracking-[0.4em] animate-pulse italic">Codificando Crónica Final...</p>
                </div>
            </div>
        );
    }

    const { winnings, mvp, team: updatedTeam } = postGameState;

    const getSppCosts = (advancements: number) => {
        const costs = [
            { rp: 3, cp: 6, rs: 6, cs: 12, ch: 18 },
            { rp: 4, cp: 8, rs: 8, cs: 14, ch: 20 },
            { rp: 6, cp: 12, rs: 12, cs: 18, ch: 24 },
            { rp: 8, cp: 16, rs: 16, cs: 22, ch: 28 },
            { rp: 10, cp: 20, rs: 20, cs: 26, ch: 32 },
            { rp: 15, cp: 30, rs: 30, cs: 40, ch: 50 },
        ];
        return costs[Math.min(advancements, 5)];
    };

    const isDraw = score.home === score.opponent;

    const renderStepContent = () => {
        // Only show players who GAINED spp this match (compare to initialHomeTeam by id)
        // For Journeymen (no match in initialHomeTeam), show if spp > 0
        const improvedPlayers = updatedTeam.players.filter(p => {
            if (p.isJourneyman || p.isStarPlayer) return false;
            const original = initialHomeTeam.players.find(op => op.id === p.id);
            const originalSpp = original?.spp ?? 0;
            return p.spp > originalSpp;
        });

        const playersWithMNG = updatedTeam.players.filter(p => (p.missNextGame || 0) > 0);

        const playersWithNewInjuries = updatedTeam.players.filter(p => {
            const originalPlayer = initialHomeTeam.players.find(op => op.id === p.id);
            if (!originalPlayer) return (p.lastingInjuries || []).length > 0;
            return (p.lastingInjuries || []).length > (originalPlayer.lastingInjuries || []).length;
        });

        switch (step) {
            case 0:
                return (
                    <div className="flex flex-col gap-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="glass-panel p-5 bg-green-500/5 border-green-500/20 relative overflow-hidden group">
                                <span className="material-symbols-outlined absolute top-2 right-2 text-4xl text-green-500/10 group-hover:scale-110 transition-transform">database</span>
                                <p className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest mb-3 text-shadow-sm">Recaudación de Guerra</p>
                                <p className="text-2xl font-display font-black text-white italic truncate tracking-tight">{winnings.toLocaleString()} <span className="text-xs not-italic text-green-500 ml-1 uppercase font-bold">m.o.</span></p>
                                <p className="text-[8px] font-display font-black text-slate-500 uppercase tracking-widest mt-2 opacity-60">El gremio reclama su parte</p>
                            </div>
                            <div className="glass-panel p-5 bg-premium-gold/5 border-premium-gold/20 relative overflow-hidden group">
                                <span className="material-symbols-outlined absolute top-2 right-2 text-4xl text-premium-gold/10 group-hover:scale-110 transition-transform">military_tech</span>
                                <h4 className="text-[10px] font-display font-black text-premium-gold uppercase tracking-widest mb-3 text-shadow-sm">Título Honorífico (MJP)</h4>
                                {mvp ? (
                                    <>
                                        <p className="text-lg font-display font-black text-white italic truncate uppercase tracking-tighter">{mvp.customName}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="px-1.5 py-0.5 rounded bg-premium-gold/20 border border-premium-gold/30 text-[8px] font-display font-black text-premium-gold uppercase tracking-tighter shadow-sm">+4 PE</span>
                                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">{mvp.position}</span>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-slate-500 italic text-sm py-2">Nadie fue digno del laurel</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-black/40 border border-white/5 p-5 rounded-3xl text-center shadow-inner mt-2 backdrop-blur-sm">
                            <p className="text-[9px] font-display font-black text-slate-500 uppercase tracking-widest mb-1.5 opacity-60 tracking-[0.2em]">Tesorería de la Hermandad</p>
                            <span className="text-xl font-display font-black text-white italic tracking-tighter">{updatedTeam.treasury.toLocaleString()} <span className="text-xs opacity-50 ml-1 uppercase font-bold">m.o.</span></span>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="flex flex-col gap-6 animate-fade-in content-center">
                        <div className="text-center space-y-3">
                            <div className="w-14 h-14 bg-sky-500/10 rounded-2xl border border-sky-500/30 flex items-center justify-center mx-auto shadow-2xl relative">
                                <div className="absolute inset-0 bg-sky-500/5 blur-xl rounded-full animate-pulse-slow"></div>
                                <span className="material-symbols-outlined text-2xl text-sky-400 relative z-10">groups</span>
                            </div>
                            <h4 className="text-[9px] font-display font-black text-sky-500 uppercase tracking-[0.3em] opacity-80">El Veredicto de las Gradas</h4>
                            <p className="text-slate-500 text-[10px] italic max-w-[280px] mx-auto leading-relaxed border-t border-white/5 pt-2">"La lealtad se compra con sangre y se mantiene con trofeos."</p>
                        </div>

                        {isDraw ? (
                            <div className="glass-panel p-6 bg-black/60 border-sky-500/30 text-center animate-slide-in-up relative overflow-hidden mt-2 shadow-2xl">
                                <p className="text-[10px] font-display font-black text-sky-400 uppercase tracking-widest mb-3">Empate — Sin Tirada</p>
                                <p className="text-slate-500 text-xs italic mb-4">Un empate no altera la lealtad de las masas. Los hinchas permanecen fieles... por ahora.</p>
                                <div className="flex justify-between items-center bg-white/5 p-3.5 rounded-xl border border-white/5 shadow-inner">
                                    <span className="text-[9px] font-display font-black text-slate-500 uppercase tracking-widest">Hinchas Consagrados</span>
                                    <span className="text-2xl font-display font-black text-white tracking-tighter">{updatedTeam.dedicatedFans}</span>
                                </div>
                            </div>
                        ) : !fansRoll ? (
                            <div className="flex justify-center pt-2">
                                <button
                                    onClick={handleFansRoll}
                                    className="group relative bg-sky-600 text-black font-display font-black py-4 px-12 rounded-2xl shadow-[0_15px_30px_rgba(14,165,233,0.3)] hover:shadow-[0_20px_40px_rgba(14,165,233,0.4)] hover:-translate-y-1 active:translate-y-0 transition-all flex items-center gap-4 uppercase tracking-[0.25em] text-[10px] overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                                    <span className="material-symbols-outlined text-lg transition-transform group-hover:rotate-180 duration-[800ms] relative z-10">casino</span>
                                    <span className="relative z-10">Invocar a la Masa (1D6)</span>
                                </button>
                            </div>
                        ) : (
                            <div className="glass-panel p-6 bg-black/60 border-sky-500/30 text-center animate-slide-in-up relative overflow-hidden mt-2 shadow-2xl">
                                <div className="absolute top-0 right-0 p-2 opacity-[0.03] scale-150 rotate-12">
                                    <span className="material-symbols-outlined text-8xl text-white">group</span>
                                </div>
                                <div className="flex justify-center gap-6 items-center mb-6 relative z-10">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl border-2 border-sky-500/30 flex flex-col items-center justify-center shadow-inner">
                                        <span className="text-[8px] font-display font-black text-sky-500 uppercase tracking-widest mb-0.5">Dado</span>
                                        <span className="text-2xl font-display font-black text-white">{fansRoll}</span>
                                    </div>
                                    <div className="h-10 w-px bg-white/10"></div>
                                    <div className="text-left">
                                        <p className="text-[9px] font-display font-black text-slate-500 uppercase tracking-widest mb-0.5">Resultado</p>
                                        <p className={`text-xl font-display font-black uppercase italic tracking-tighter leading-none ${fansChange > 0 ? 'text-green-500' : fansChange < 0 ? 'text-blood-red' : 'text-sky-400'}`}>
                                            {fansChange > 0 ? '¡Nuevos Adeptos!' : fansChange < 0 ? 'Deserción en Masa' : 'Vínculo Estable'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center bg-white/5 p-3.5 rounded-xl border border-white/5 mt-2 shadow-inner relative z-10">
                                    <span className="text-[9px] font-display font-black text-slate-500 uppercase tracking-widest">Hinchas Consagrados Finales</span>
                                    <span className="text-2xl font-display font-black text-white tracking-tighter">{updatedTeam.dedicatedFans}</span>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 animate-fade-in h-full flex flex-col">
                        <div className="flex items-center justify-between px-2">
                            <h4 className="text-[10px] font-display font-black text-premium-gold uppercase tracking-[0.2em]">Registro de Ascensión</h4>
                            <span className="text-[9px] font-display font-black text-slate-500 uppercase">{improvedPlayers.length} Marcados</span>
                        </div>
                        <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[350px]">
                            {improvedPlayers.map(p => {
                                const original = initialHomeTeam.players.find(op => op.id === p.id);
                                const gained = p.spp - (original?.spp || 0);
                                const advancements = p.gainedSkills.length;
                                const costs = getSppCosts(advancements);

                                return (
                                    <div key={p.id} className="glass-panel p-5 bg-white/5 border-white/5 flex flex-col gap-4 hover:border-premium-gold/30 transition-all group shadow-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-premium-gold/10 border border-premium-gold/20 flex items-center justify-center text-premium-gold font-display font-black text-base shadow-inner">
                                                #{p.id.toString().slice(-2)}
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <p className="font-display font-black text-white text-base uppercase italic tracking-tighter truncate w-48 leading-none mb-1">{p.customName}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest leading-none">{p.position}</p>
                                                    <span className="text-[10px] text-premium-gold font-black bg-premium-gold/5 px-2 py-0.5 rounded border border-premium-gold/20">SPP: {p.spp}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-display font-black text-premium-gold leading-none tracking-tighter">+{gained}</p>
                                                <p className="text-[8px] font-display font-black text-slate-600 uppercase tracking-widest mt-1">PE de Sangre</p>
                                            </div>
                                        </div>

                                        {/* Advancement Controls */}
                                        <div className="flex gap-2 border-t border-white/5 pt-3.5 mt-1.5">
                                            <button
                                                onClick={() => setSkillSelection({ player: p, type: 'Primary', cost: costs.cp })}
                                                disabled={p.spp < costs.cp}
                                                className="flex-1 py-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-[9px] font-display font-black text-sky-400 uppercase tracking-widest hover:bg-sky-500 hover:text-black disabled:opacity-20 transition-all shadow-lg"
                                            >
                                                Primaria ({costs.cp})
                                            </button>
                                            <button
                                                onClick={() => setSkillSelection({ player: p, type: 'Secondary', cost: costs.cs })}
                                                disabled={p.spp < costs.cs}
                                                className="flex-1 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-[9px] font-display font-black text-purple-400 uppercase tracking-widest hover:bg-purple-500 hover:text-black disabled:opacity-20 transition-all shadow-lg"
                                            >
                                                Secund. ({costs.cs})
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                            {improvedPlayers.length === 0 && (
                                <div className="py-16 bg-white/5 rounded-3xl border border-dashed border-white/10 text-center flex flex-col items-center justify-center opacity-40">
                                    <span className="material-symbols-outlined text-4xl mb-3 text-slate-500">history_edu</span>
                                    <p className="text-[10px] font-display font-black uppercase tracking-widest text-slate-500">Ninguna alma fue tocada por el destino</p>
                                </div>
                            )}
                        </div>
                        <div className="text-center pt-2">
                            <p className="text-[10px] font-display font-bold text-slate-500 uppercase italic tracking-widest opacity-60">Gasta tus puntos ahora o consérvalos para el mañana</p>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="flex flex-col gap-6 animate-fade-in overflow-y-auto max-h-[420px] pr-1.5 custom-scrollbar">
                        <div className="glass-panel p-6 bg-black/60 border-white/5 space-y-8 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 p-4 opacity-[0.02]">
                                <span className="material-symbols-outlined text-[140px] text-white">receipt_long</span>
                            </div>

                            <div className="flex justify-between items-start border-b border-white/10 pb-5 relative z-10">
                                <div>
                                    <h3 className="text-xl font-display font-black text-white uppercase italic tracking-tighter">Crónica Final</h3>
                                    <p className="text-[9px] font-display font-black text-slate-500 uppercase tracking-[0.25em] mt-0.5">Resumen de la Jornada</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-display font-black text-green-400 italic tracking-tighter leading-none mb-1">{updatedTeam.treasury.toLocaleString()} <span className="text-[10px] not-italic opacity-40 ml-0.5 uppercase tracking-normal font-bold">m.o.</span></p>
                                    <p className="text-[8px] font-display font-black text-slate-600 uppercase tracking-widest">Cofres en la Bóveda</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 shadow-inner">
                                    <h4 className="text-[8px] font-display font-black text-sky-500 uppercase tracking-[0.2em] mb-2 opacity-80">Séquito Vital</h4>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl font-display font-black text-white">{updatedTeam.dedicatedFans}</span>
                                        <span className="text-[8px] font-display font-black text-slate-500 uppercase leading-tight tracking-wider font-bold">Hinchas<br />Fieles</span>
                                    </div>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-right flex flex-col items-end shadow-inner">
                                    <h4 className="text-[8px] font-display font-black text-premium-gold uppercase tracking-[0.2em] mb-2 opacity-80">Rango Grupal</h4>
                                    <div className="flex items-center gap-3 justify-end">
                                        <span className="text-[8px] font-display font-black text-slate-500 uppercase leading-tight tracking-wider text-right font-bold">Hitos de<br />Ascensión</span>
                                        <span className="text-xl font-display font-black text-white">{updatedTeam.players.reduce((acc, p) => acc + (p.gainedSkills?.length || 0), 0)}</span>
                                    </div>
                                </div>
                            </div>

                            {(playersWithNewInjuries.length > 0 || playersWithMNG.length > 0) && (
                                <div className="space-y-4 pt-6 border-t border-white/10 relative z-10">
                                    <h4 className="text-[10px] font-display font-black text-blood-red uppercase tracking-[0.4em] flex items-center gap-2 mb-3">
                                        <span className="material-symbols-outlined text-sm">skull</span>
                                        El Precio de la Arena
                                    </h4>
                                    <div className="flex flex-col gap-2">
                                        {playersWithNewInjuries.map(p => {
                                            const originalPlayer = initialHomeTeam.players?.find(op => op.id === p.id);
                                            const newInjuries = (p.lastingInjuries || []).filter(inj => !(originalPlayer?.lastingInjuries || []).includes(inj));
                                            return (
                                                <div key={p.id} className="flex justify-between items-center p-3.5 rounded-xl bg-blood-red/5 border border-blood-red/10 group hover:bg-blood-red/10 transition-colors shadow-inner">
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-display font-black text-white uppercase italic tracking-tighter leading-none mb-0.5">{p.customName}</span>
                                                        <span className="text-[8px] font-display font-bold text-slate-500 uppercase tracking-widest">{p.position}</span>
                                                    </div>
                                                    <span className="px-2.5 py-0.5 rounded-md bg-blood-red/20 text-[8px] font-display font-black text-blood-red uppercase italic tracking-widest animate-pulse border border-blood-red/20">{newInjuries.join(', ') || 'Lesión'}</span>
                                                </div>
                                            );
                                        })}
                                        {playersWithMNG.map(p => (
                                            <div key={p.id} className="flex justify-between items-center p-3.5 rounded-xl bg-amber-600/5 border border-amber-600/10 group hover:bg-amber-600/10 transition-colors shadow-inner">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-display font-black text-white uppercase italic tracking-tighter leading-none mb-0.5">{p.customName}</span>
                                                    <span className="text-[8px] font-display font-bold text-slate-500 uppercase tracking-widest">{p.position}</span>
                                                </div>
                                                <span className="px-2.5 py-0.5 rounded-md bg-amber-600/20 text-[8px] font-display font-black text-amber-500 uppercase italic tracking-widest border border-amber-600/20">EN ENFERMERÍA</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    const steps = ["Recaudación", "Audiencia", "Evolución", "Veredicto"];

    return (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-premium-gold/5 blur-[150px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blood-red/5 blur-[150px] rounded-full animate-pulse delay-700"></div>
            </div>

            <div className="w-full max-w-2xl flex flex-col gap-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="text-premium-gold text-[10px] font-display font-black uppercase tracking-[0.5em] opacity-60">Consilio de Posguerra</div>
                    <h2 className="text-4xl font-display font-black text-white italic tracking-tighter uppercase leading-none">
                        Crónica de <span className="text-blood-red">Sangre</span> & Oro
                    </h2>
                    <div className="flex justify-center gap-1 mt-6">
                        {steps.map((s, i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div className={`h-1.5 rounded-full transition-all duration-700 ${i === step ? 'w-16 bg-premium-gold shadow-[0_0_15px_rgba(245,159,10,0.5)]' : i < step ? 'w-8 bg-premium-gold/30' : 'w-8 bg-white/5'}`}></div>
                                <span className={`text-[8px] font-display font-black uppercase tracking-widest transition-opacity duration-500 ${i === step ? 'opacity-100 text-white' : 'opacity-30 text-slate-500'}`}>{s}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="glass-panel border-white/5 bg-black/40 p-10 shadow-4xl relative overflow-hidden min-h-[420px] flex flex-col">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-premium-gold/5 blur-[100px] -z-10"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blood-red/5 blur-[100px] -z-10"></div>

                    <div className="flex-1 flex flex-col justify-center">
                        {renderStepContent()}
                    </div>

                    {/* Footer Controls */}
                    <div className="mt-10 pt-10 border-t border-white/5 flex gap-4">
                        <button
                            onClick={() => setStep(s => Math.max(0, s - 1))}
                            disabled={step === 0}
                            className="flex-1 bg-white/5 border border-white/10 text-slate-500 font-display font-black py-4 rounded-2xl hover:bg-white/10 hover:text-white disabled:opacity-10 disabled:grayscale transition-all uppercase tracking-widest text-[10px]"
                        >
                            Antiguo
                        </button>
                        {step < 3 ? (
                            <button
                                onClick={() => setStep(s => s + 1)}
                                disabled={step === 1 && !fansRoll && !isDraw}
                                className="flex-[2] bg-premium-gold text-black font-display font-black py-4 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-[10px] disabled:opacity-30 disabled:hover:scale-100"
                            >
                                Siguiente Sello
                            </button>
                        ) : (
                            <button
                                onClick={handleConfirm}
                                className="flex-[2] bg-green-600 text-black font-display font-black py-4 rounded-2xl shadow-[0_20px_40px_rgba(34,197,94,0.3)] hover:bg-green-500 hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.2em] text-[10px]"
                            >
                                Sellar Destino Final
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {skillSelection && (
                <SkillSelectionModal
                    player={skillSelection.player}
                    rosterName={updatedTeam.rosterName}
                    skillType={skillSelection.type}
                    onClose={() => setSkillSelection(null)}
                    onSelect={(skillName) => handleSkillSelectionUpdate(skillSelection.player.id, skillName, skillSelection.cost)}
                />
            )}
        </div>
    );
};

export default PostGameWizard;
