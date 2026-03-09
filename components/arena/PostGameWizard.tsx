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
        const categories = categoriesString.split('');

        const categoryMap: { [key: string]: string } = {
            G: 'General', A: 'Agilidad', F: 'Fuerza', P: 'Pase', M: 'Mutaciones'
        };

        const skillCategories = categories.map(c => categoryMap[c]).filter(Boolean);
        const currentSkills = new Set([...(player.skills || '').split(', '), ...player.gainedSkills]);

        return skillsData.filter(skill =>
            skillCategories.includes(skill.category) && !currentSkills.has(skill.name)
        ).sort((a, b) => a.name.localeCompare(b.name));

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
            mvpPlayer = { ...randomMvp, teamName: tempTeam.name };

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

    const renderStepContent = () => {
        const improvedPlayers = updatedTeam.players.filter(p => {
            const original = initialHomeTeam.players.find(op => op.id === p.id);
            return p.spp > (original?.spp || 0);
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
                    <div className="space-y-8 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass-panel p-6 bg-green-500/5 border-green-500/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-6xl text-green-400">payments</span>
                                </div>
                                <h4 className="text-[10px] font-display font-black text-green-500 uppercase tracking-widest mb-4">Tesoro de Guerra</h4>
                                <p className="text-3xl font-display font-black text-white italic truncate">{winnings.toLocaleString()} <span className="text-xs not-italic text-green-500 ml-1 uppercase">m.o.</span></p>
                                <p className="text-[9px] font-display font-black text-slate-500 uppercase tracking-widest mt-2">{updatedTeam.name.split(' ')[0]} se enriquece</p>
                            </div>
                            <div className="glass-panel p-6 bg-premium-gold/5 border-premium-gold/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-6xl text-premium-gold">military_tech</span>
                                </div>
                                <h4 className="text-[10px] font-display font-black text-premium-gold uppercase tracking-widest mb-4">Gesta Heroica (MJP)</h4>
                                {mvp ? (
                                    <>
                                        <p className="text-xl font-display font-black text-white italic truncate uppercase">{mvp.customName}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="px-2 py-0.5 rounded bg-premium-gold/20 border border-premium-gold/30 text-[9px] font-display font-black text-premium-gold uppercase">+4 PE</span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase">{mvp.position}</span>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-slate-500 italic text-sm">Nadie fue digno</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-black/40 border border-white/5 p-6 rounded-3xl text-center">
                            <p className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest mb-1">Tesorería Actualizada</p>
                            <span className="text-2xl font-display font-black text-white italic">{updatedTeam.treasury.toLocaleString()} m.o.</span>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-sky-500/10 rounded-2xl border border-sky-500/30 flex items-center justify-center mx-auto shadow-2xl">
                                <span className="material-symbols-outlined text-3xl text-sky-400">groups</span>
                            </div>
                            <h4 className="text-[10px] font-display font-black text-sky-500 uppercase tracking-widest">Favor de la Grada</h4>
                            <p className="text-slate-400 text-xs italic max-w-xs mx-auto">"Los hinchas son volubles; la victoria los atrae, la derrota los dispersa."</p>
                        </div>

                        {!fansRoll ? (
                            <div className="flex justify-center">
                                <button
                                    onClick={handleFansRoll}
                                    className="group bg-sky-600 text-black font-display font-black py-4 px-12 rounded-2xl shadow-[0_20px_40px_rgba(14,165,233,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-4 uppercase tracking-widest text-xs"
                                >
                                    <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">casino</span>
                                    Invocar al Público (1D6)
                                </button>
                            </div>
                        ) : (
                            <div className="glass-panel p-8 bg-black/60 border-sky-500/30 text-center animate-slide-in-up">
                                <div className="flex justify-center gap-6 items-center mb-6">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
                                        <span className="text-3xl font-display font-black text-white">{fansRoll}</span>
                                    </div>
                                    <div className="h-8 w-px bg-white/10"></div>
                                    <div className="text-left">
                                        <p className="text-xs font-display font-black text-slate-500 uppercase tracking-widest">Resultado</p>
                                        <p className={`text-xl font-display font-black uppercase italic ${fansChange > 0 ? 'text-green-500' : fansChange < 0 ? 'text-blood-red' : 'text-sky-400'}`}>
                                            {fansChange > 0 ? '¡Fans Extra!' : fansChange < 0 ? 'Abandono' : 'Sin Cambios'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <span className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest">Fans Dedicados</span>
                                    <span className="text-2xl font-display font-black text-white">{updatedTeam.dedicatedFans}</span>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 animate-fade-in content-center">
                        <div className="flex items-center justify-between px-2">
                            <h4 className="text-[10px] font-display font-black text-premium-gold uppercase tracking-[0.2em]">Ascenso en el Rango</h4>
                            <span className="text-[9px] font-display font-black text-slate-500 uppercase">{improvedPlayers.length} Cosechas</span>
                        </div>
                        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                            {improvedPlayers.map(p => {
                                const original = initialHomeTeam.players.find(op => op.id === p.id);
                                const gained = p.spp - (original?.spp || 0);
                                return (
                                    <div key={p.id} className="glass-panel p-4 bg-white/5 border-white/5 flex items-center gap-4 hover:border-premium-gold/30 transition-all group">
                                        <div className="w-10 h-10 rounded-xl bg-premium-gold/10 border border-premium-gold/20 flex items-center justify-center text-premium-gold font-display font-black text-sm">
                                            #{p.id.toString().slice(-2)}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-display font-black text-white text-sm uppercase italic tracking-tighter truncate w-40">{p.customName}</p>
                                            <p className="text-[9px] font-display font-bold text-slate-500 uppercase tracking-widest">{p.position}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-display font-black text-premium-gold leading-none">+{gained}</p>
                                            <p className="text-[8px] font-display font-black text-slate-600 uppercase tracking-widest mt-1">PE Ganados</p>
                                        </div>
                                    </div>
                                );
                            })}
                            {improvedPlayers.length === 0 && (
                                <div className="py-12 bg-white/5 rounded-3xl border border-dashed border-white/10 text-center opacity-30">
                                    <p className="text-[10px] font-display font-black uppercase tracking-widest text-slate-500">Sin progreso este asalto</p>
                                </div>
                            )}
                        </div>
                        <div className="text-center">
                            <p className="text-[9px] font-display font-bold text-slate-500 uppercase italic tracking-widest">Podrás gastar los puntos en la gestión de plantilla</p>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 animate-fade-in overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
                        <div className="glass-panel p-6 bg-black/60 border-white/5 space-y-6">
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <div>
                                    <h3 className="text-xl font-display font-black text-white uppercase italic tracking-tighter">Parte de Guerra</h3>
                                    <p className="text-[9px] font-display font-black text-slate-500 uppercase tracking-widest">Estado final de la escuadra</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-display font-black text-green-400 italic">{updatedTeam.treasury.toLocaleString()} <span className="text-[10px] not-italic opacity-50 uppercase">m.o.</span></p>
                                    <p className="text-[8px] font-display font-black text-slate-600 uppercase">Tesorería Final</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h4 className="text-[9px] font-display font-black text-sky-500 uppercase tracking-widest">Hinchada</h4>
                                    <p className="text-lg font-display font-black text-white">{updatedTeam.dedicatedFans} Fans</p>
                                </div>
                                <div className="space-y-2 text-right">
                                    <h4 className="text-[9px] font-display font-black text-premium-gold uppercase tracking-widest">Veteranía</h4>
                                    <p className="text-lg font-display font-black text-white">{improvedPlayers.length} Subidas</p>
                                </div>
                            </div>

                            {(playersWithNewInjuries.length > 0 || playersWithMNG.length > 0) && (
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <h4 className="text-[9px] font-display font-black text-blood-red uppercase tracking-widest">Cicatrices del Combate</h4>
                                    <div className="space-y-2">
                                        {playersWithNewInjuries.map(p => {
                                            const originalPlayer = initialHomeTeam.players.find(op => op.id === p.id);
                                            const newInjuries = p.lastingInjuries.filter(inj => !originalPlayer?.lastingInjuries.includes(inj));
                                            return (
                                                <div key={p.id} className="flex justify-between items-center p-3 rounded-xl bg-blood-red/10 border border-blood-red/20">
                                                    <span className="text-xs font-display font-black text-slate-200 uppercase">{p.customName}</span>
                                                    <span className="text-[9px] font-display font-black text-blood-red uppercase italic tracking-tighter">{newInjuries.join(', ')}</span>
                                                </div>
                                            );
                                        })}
                                        {playersWithMNG.map(p => (
                                            <div key={p.id} className="flex justify-between items-center p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                                <span className="text-xs font-display font-black text-slate-200 uppercase">{p.customName}</span>
                                                <span className="text-[9px] font-display font-black text-orange-500 uppercase italic tracking-widest">MISS NEXT GAME</span>
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
                                disabled={step === 1 && !fansRoll}
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
