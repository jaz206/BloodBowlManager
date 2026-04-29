import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useArenaConfig } from '../../hooks/useArenaConfig';
import { useMasterData } from '../../hooks/useMasterData';
import { createPortal } from 'react-dom';
import type { ManagedTeam, ManagedPlayer, Skill } from '../../types';
import { getSkillDescription, getSkillDisplayName, skillCategoryMatches } from '../../utils/skillUtils';

interface SkillSelectionModalProps {
    player: ManagedPlayer;
    rosterName: string;
    skillType: 'Primary' | 'Secondary';
    onSelect: (skillName: string) => void;
    onClose: () => void;
}

const SkillSelectionModal: React.FC<SkillSelectionModalProps> = ({ player, rosterName, skillType, onSelect, onClose }) => {
    const { teams, skills } = useMasterData();
    const baseTeam = useMemo(() => teams.find(t => t.name === rosterName), [teams, rosterName]);
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

        return skills.filter(skill => {
            if (!skill) return false;
            const skillName = getSkillDisplayName(skill);
            return skillCategoryMatches(skill, skillCategories) && !currentSkills.has(skillName) && !currentSkills.has(skill.keyEN);
        }).sort((a, b) => {
            const nameA = getSkillDisplayName(a);
            const nameB = getSkillDisplayName(b);
            return nameA.localeCompare(nameB);
        });

    }, [basePlayer, skillType, player.gainedSkills, player.skills, skills]);

    return createPortal(
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[500] p-4" onClick={onClose}>
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
                    {availableSkills.map(skill => {
                        const sName = getSkillDisplayName(skill);
                        return (
                            <button key={sName} onClick={() => onSelect(sName)} className="w-full text-left bg-white/5 border border-white/5 p-4 rounded-2xl hover:bg-premium-gold/10 hover:border-premium-gold/30 group transition-all">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="font-display font-bold text-white group-hover:text-premium-gold transition-colors">{sName}</p>
                                    <span className="text-[9px] font-display font-black text-slate-500 uppercase tracking-widest group-hover:text-premium-gold/50">{skill.category}</span>
                                </div>
                                <p className="text-xs text-slate-400 group-hover:text-slate-300 leading-relaxed font-display">{getSkillDescription(skill)}</p>
                            </button>
                        );
                    })}
                    {availableSkills.length === 0 && (
                        <div className="py-20 text-center opacity-30">
                            <span className="material-symbols-outlined text-5xl mb-4">search_off</span>
                            <p className="font-display font-black uppercase tracking-widest text-sm">No hay sabiduría disponible</p>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
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
    initialConcession?: 'none' | 'home' | 'opponent';
}



interface PostGameState {
    winnings: number;
    mvp: (ManagedPlayer & { teamName: string }) | null;
    team: ManagedTeam;
}

const PostGameWizard: React.FC<PostGameWizardProps> = ({ initialHomeTeam, finalHomeTeam, opponentTeam, score, fame, playersMNG, onConfirm, initialConcession }) => {
    const { config: arenaConfig } = useArenaConfig();
    const { teams, skills } = useMasterData();
    const diceConfig = arenaConfig?.dice || { winnings: '1D3', mvp: '1D3', fans: '1D6' };

    const [step, setStep] = useState(0);
    const [fansChange, setFansChange] = useState<number>(0);
    const [fansRoll, setFansRoll] = useState<number | null>(null);
    const [postGameState, setPostGameState] = useState<PostGameState | null>(null);
    const [skillSelection, setSkillSelection] = useState<{ player: ManagedPlayer, type: 'Primary' | 'Secondary', cost: number } | null>(null);
    const [mvpNominations, setMvpNominations] = useState<number[]>([]);
    const [mvpRoll, setMvpRoll] = useState<number | null>(null);
    const [noStalling, setNoStalling] = useState(true);
    const [winningsRolls, setWinningsRolls] = useState({ home: 0, opponent: 0 });
    const [concession, setConcession] = useState<'none' | 'home' | 'opponent'>(initialConcession || 'none');
    const [improvementResult, setImprovementResult] = useState<{ player: ManagedPlayer, roll: number, result: string } | null>(null);
    const [expensiveMistakes, setExpensiveMistakes] = useState<{ roll: number, loss: number } | null>(null);

    const [mvpCount, setMvpCount] = useState(1);
    const [mvpsAwarded, setMvpsAwarded] = useState(0);


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

    // Initialize team state once
    useEffect(() => {
        if (!finalHomeTeam) return;
        const initialTeam = cloneTeamForPostGame(finalHomeTeam);
        
        // Apply MNG logic once on initialization
        const mngPlayerIds = new Set(playersMNG.map(p => p.playerId));
        initialTeam.players.forEach(player => {
            if (mngPlayerIds.has(player.id)) {
                player.missNextGame = (player.missNextGame || 0) + 1;
                player.status = 'Reserva';
            } else if (player.missNextGame && player.missNextGame > 0) {
                player.missNextGame -= 1;
            }
        });

        setPostGameState({
            winnings: 0,
            mvp: null,
            team: initialTeam,
        });
    }, [finalHomeTeam, cloneTeamForPostGame, playersMNG]);

    // Handle winnings and MVP count changes separately without resetting everything
    useEffect(() => {
        if (!postGameState || !finalHomeTeam) return;

        const rollHome = winningsRolls.home;
        let calculatedWinnings = 0;
        if (rollHome !== 0) {
            const popHome = rollHome + finalHomeTeam.dedicatedFans;
            const stallBonus = noStalling ? arenaConfig.economics.no_stalling_bonus : 0;
            calculatedWinnings = (popHome + score.home + stallBonus + arenaConfig.economics.win_bonus) * arenaConfig.economics.multiplier;
            if (concession === 'home') calculatedWinnings = 0;
        }

        setPostGameState(prev => {
            if (!prev) return prev;
            // Solo actualizamos las ganancias y el tesoro calculado, mantenemos los jugadores (con sus mejoras)
            const newTeam = { 
                ...prev.team, 
                // El tesoro es el original + ganancias actualizadas
                treasury: finalHomeTeam.treasury + calculatedWinnings 
            };
            
            return {
                ...prev,
                winnings: calculatedWinnings,
                team: newTeam
            };
        });

        if (concession === 'opponent') setMvpCount(2);
        else if (concession === 'home') setMvpCount(0);
        else setMvpCount(1);
    }, [winningsRolls.home, noStalling, concession, score.home]);

    const handleWinningsRoll = (manualVal?: number) => {
        const rollLimit = diceConfig.winnings.toLowerCase().includes('d3') ? 3 : 6;
        const rollHome = manualVal || (Math.floor(Math.random() * rollLimit) + 1);
        const rollOpp = (Math.floor(Math.random() * rollLimit) + 1);
        setWinningsRolls({ home: rollHome, opponent: rollOpp });
    };


    const handleConfirm = () => {
        if (!postGameState) return;
        const finalTeam = {
            ...postGameState.team,
            players: postGameState.team.players.filter(p => !p.isStarPlayer && !p.isJourneyman)
        };
        onConfirm(finalTeam);
    };

    const handleToggleNomination = (playerId: number) => {
        setMvpNominations(prev => {
            const isAlreadyNominated = prev.includes(playerId);
            if (isAlreadyNominated) {
                return prev.filter(id => id !== playerId);
            }
            // BB2025 / S3: máximo 3 candidatos nominados
            if (prev.length >= 3) {
                return prev;
            }
            return [...prev, playerId];
        });
    };

    const handleMvpRoll = (manualVal?: number) => {
        if (mvpNominations.length === 0) return;
        
        const rollLimit = diceConfig.mvp.toLowerCase().includes('d3') ? 3 : 6;
        const roll = manualVal || (Math.floor(Math.random() * rollLimit) + 1);
        setMvpRoll(roll);
        
        // Map roll to nominated player.
        const index = (roll - 1) % mvpNominations.length; 
        const selectedId = mvpNominations[index];
        
        setPostGameState(prev => {
            if (!prev) return null;
            const updatedPlayers = prev.team.players.map(p => {
                if (p.id === selectedId) {
                    return { ...p, spp: p.spp + arenaConfig.spp.mvp };
                }
                return p;
            });
            
            const mvpPlayer = updatedPlayers.find(p => p.id === selectedId);
            
            return {
                ...prev,
                mvp: mvpPlayer ? { ...mvpPlayer, teamName: prev.team.name } : null,
                team: { ...prev.team, players: updatedPlayers }
            };
        });

        setMvpsAwarded(prev => prev + 1);
    };


    const handleFansRoll = (manualVal?: number) => {
        const rollLimit = (concession === 'home' || diceConfig.fans.toLowerCase().includes('d3')) ? 3 : 6;
        const roll = manualVal || (Math.floor(Math.random() * rollLimit) + 1);
        setFansRoll(roll);
        let change = 0;

        if (concession === 'home') {
            // BB2025: Conceding team loses 1D3 Dedicated Fans
            change = -(Math.floor(Math.random() * 3) + 1);
        } else if (score.home > score.opponent) {
            // WIN: Roll >= DF to increase
            if (roll >= postGameState!.team.dedicatedFans) change = 1;
        } else if (score.home < score.opponent) {
            // LOSS: Roll < DF to decrease
            if (roll < postGameState!.team.dedicatedFans) change = -1;
        } else {
            // DRAW: Roll >= DF to increase, never decrease
            if (roll >= postGameState!.team.dedicatedFans) change = 1;
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

    const handleRandomSkill = (player: ManagedPlayer, type: 'Primary' | 'Secondary', cost: number) => {
        const baseTeam = teams.find(t => t.name === initialHomeTeam.rosterName);
        const basePlayer = baseTeam?.roster.find(p => p.position === player.position);
        if (!basePlayer) return;

        const categoriesString = type === 'Primary' ? basePlayer.primary : basePlayer.secondary;
        const categories = (categoriesString || '').split('');
        const categoryMap: { [key: string]: string } = { G: 'General', A: 'Agilidad', F: 'Fuerza', P: 'Pase', M: 'Mutaciones' };
        const skillCategories = categories.map(c => categoryMap[c]).filter(Boolean);
        const currentSkills = new Set([...(player.skills || '').split(', ').filter(Boolean), ...(player.gainedSkills || [])]);

        const available = skills.filter((s) => {
            const skillName = getSkillDisplayName(s);
            return skillCategoryMatches(s, skillCategories) && !currentSkills.has(skillName) && !currentSkills.has(s.keyEN);
        });
        if (available.length === 0) return;

        const randomSkill = available[Math.floor(Math.random() * available.length)];
        const skillName = getSkillDisplayName(randomSkill);

        handleSkillSelectionUpdate(player.id, skillName, cost);
    };

    const handleCharacteristicImprovement = (player: ManagedPlayer, cost: number, manualVal?: number) => {
        const roll = manualVal || (Math.floor(Math.random() * 16) + 1); // 1D16 for characteristic table
        let result = "";
        
        if (roll <= 7) result = "Hab. Primaria";
        else if (roll <= 12) result = "Hab. Secundaria";
        else if (roll <= 13) result = "Movimiento (+1 MV) o Armadura (+1 AR)";
        else if (roll <= 14) result = "Pase (+PA) o Agilidad (+AG)";
        else if (roll <= 15) result = "Fuerza (+1 FU)";
        else result = "¡Cualquiera! (+1 Atributo o Hab. Secundaria)";

        setImprovementResult({ player, roll, result });
        
        setPostGameState(prev => {
            if (!prev) return null;
            return {
                ...prev,
                team: {
                    ...prev.team,
                    players: prev.team.players.map(p => p.id === player.id ? { ...p, spp: p.spp - cost } : p)
                }
            };
        });
    };

    const handleExpensiveMistakesRoll = (manualVal?: number) => {
        const roll = manualVal || (Math.floor(Math.random() * 6) + 1);
        let loss = 0;
        const treasury = postGameState?.team.treasury || 0;
        
        // Tabla de Errores Costosos BB2020/S3
        if (roll >= 4) {
            if (treasury >= 100000 && treasury <= 190000) {
                if (roll === 4) loss = 10000;
                else if (roll === 5) loss = 20000;
                else if (roll === 6) loss = 50000;
            } else if (treasury >= 200000 && treasury <= 290000) {
                if (roll === 4) loss = 20000;
                else if (roll === 5) loss = 50000;
                else if (roll === 6) loss = 100000;
            } else if (treasury >= 300000 && treasury <= 390000) {
                if (roll === 4) loss = 50000;
                else if (roll === 5) loss = 100000;
                else if (roll === 6) loss = treasury - 100000;
            } else if (treasury >= 400000 && treasury <= 490000) {
                if (roll === 4) loss = 100000;
                else if (roll === 5) loss = treasury - 100000;
                else if (roll === 6) loss = treasury - 50000;
            } else if (treasury >= 500000) {
                if (roll === 4) loss = treasury - 100000;
                else if (roll === 5) loss = treasury - 50000;
                else if (roll === 6) loss = treasury;
            }
        }

        setExpensiveMistakes({ roll, loss });
        setPostGameState(prev => {
            if (!prev) return null;
            return {
                ...prev,
                team: { ...prev.team, treasury: Math.max(0, prev.team.treasury - loss) }
            };
        });
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
                        <div className="grid grid-cols-1 gap-4">
                            <div className="glass-panel p-8 bg-black/40 border-white/5 relative overflow-hidden group">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="text-[10px] font-display font-black text-premium-gold uppercase tracking-[0.3em]">Cálculo de Ganancias</h4>
                                    <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        <span className="text-[9px] font-black text-green-400 uppercase tracking-widest">Procedimiento BB2025</span>
                                    </div>
                                </div>
                                
                                 <div className="space-y-4">
                                    {!winningsRolls.home ? (
                                        <div className="flex flex-col items-center gap-4 py-6 border-b border-white/5">
                                            <div className="flex gap-2">
                                                <input 
                                                    type="number" min="1" max={diceConfig.winnings.toLowerCase().includes('d3') ? 3 : 6} placeholder={diceConfig.winnings}
                                                    className="w-20 bg-black/60 border border-premium-gold/30 rounded-xl px-2 py-2 text-center text-xl font-black text-white focus:border-premium-gold outline-none"
                                                    id="winnings-manual-input"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            const val = (e.currentTarget as HTMLInputElement).value;
                                                            if (val) handleWinningsRoll(Number(val));
                                                        }
                                                    }}
                                                />
                                                <button
                                                    onClick={() => {
                                                        const input = document.getElementById('winnings-manual-input') as HTMLInputElement;
                                                        if (input?.value) handleWinningsRoll(Number(input.value));
                                                    }}
                                                    className="bg-premium-gold text-black font-display font-black px-6 rounded-xl text-xs uppercase hover:bg-white transition-all shadow-lg active:scale-95"
                                                >
                                                    Aplicar
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-4 w-full max-w-[200px]">
                                                <div className="h-px bg-white/5 flex-1"></div>
                                                <span className="text-[8px] font-bold text-slate-600 uppercase">O bien</span>
                                                <div className="h-px bg-white/5 flex-1"></div>
                                            </div>
                                            <button
                                                onClick={() => handleWinningsRoll()}
                                                className="group relative bg-white/5 border border-white/10 text-white font-display font-black py-3 px-10 rounded-2xl hover:bg-white/10 active:scale-95 transition-all flex items-center gap-3 uppercase tracking-widest text-[9px]"
                                            >
                                                <span className="material-symbols-outlined text-sm">casino</span>
                                                Consultar Impuestos
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500 font-display">Popularidad Local ({winningsRolls.home} + {finalHomeTeam.dedicatedFans})</span>
                                                <span className="text-white font-black">{winningsRolls.home + finalHomeTeam.dedicatedFans}k</span>
                                            </div>
                                            <div className="flex justify-between text-sm py-2 border-y border-white/5">
                                                <span className="text-slate-500 font-display">Touchdowns Anotados ({score.home})</span>
                                                <span className="text-white font-black">{score.home * 10}k</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2">
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="checkbox" 
                                                        id="noStalling" 
                                                        checked={noStalling} 
                                                        onChange={(e) => setNoStalling(e.target.checked)}
                                                        className="w-4 h-4 rounded border-white/10 bg-black text-premium-gold focus:ring-premium-gold/30"
                                                    />
                                                    <label htmlFor="noStalling" className="text-slate-500 font-display text-xs cursor-pointer select-none">Bono por Fair Play (No-Stalling)</label>
                                                </div>
                                                <span className="text-green-500 font-black">+{noStalling ? 50 : 0}k</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {winningsRolls.home > 0 && (
                                    <div className="mt-8 pt-6 border-t border-premium-gold/20 text-center">
                                        <p className={`text-4xl font-display font-black italic tracking-tight ${concession === 'home' ? 'text-blood-red line-through opacity-50' : 'text-white'}`}>
                                            {winnings.toLocaleString()} <span className="text-sm not-italic text-green-500 ml-1 uppercase font-bold">m.o.</span>
                                        </p>
                                        {concession === 'home' && (
                                            <p className="text-blood-red font-display font-black text-[10px] uppercase tracking-widest mt-2 animate-pulse">
                                                Penalización por Concesión (0 m.o.)
                                            </p>
                                        )}
                                        <p className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest mt-2">Tesoro Actualizado</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Concession Selector */}
                        <div className="glass-panel p-8 bg-blood-red/5 border-blood-red/20 relative overflow-hidden group">
                           <div className="flex justify-between items-center mb-6">
                                <h4 className="text-[10px] font-display font-black text-blood-red uppercase tracking-[0.3em]">Estado de Finalización</h4>
                                <div className="flex items-center gap-2 bg-blood-red/10 px-3 py-1 rounded-full border border-blood-red/20">
                                    <span className="material-symbols-outlined text-[10px] text-blood-red">front_hand</span>
                                    <span className="text-[9px] font-black text-blood-red uppercase tracking-widest">Procedimiento Especial</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => setConcession('none')}
                                    className={`py-3 px-4 rounded-xl border font-display font-black uppercase text-[10px] tracking-widest transition-all ${concession === 'none' ? 'bg-zinc-800 border-white/20 text-white' : 'bg-transparent border-white/5 text-slate-500 hover:border-white/20'}`}
                                >
                                    Final Normal
                                </button>
                                <button
                                    onClick={() => setConcession('home')}
                                    className={`py-3 px-4 rounded-xl border font-display font-black uppercase text-[10px] tracking-widest transition-all ${concession === 'home' ? 'bg-blood-red text-white border-blood-red shadow-[0_0_15px_rgba(153,27,27,0.4)]' : 'bg-transparent border-white/5 text-slate-500 hover:border-blood-red/50 hover:text-blood-red'}`}
                                >
                                    Hemos Concedido
                                </button>
                                <button
                                    onClick={() => setConcession('opponent')}
                                    className={`py-3 px-4 rounded-xl border font-display font-black uppercase text-[10px] tracking-widest transition-all ${concession === 'opponent' ? 'bg-green-600 text-white border-green-600 shadow-[0_0_15px_rgba(22,163,74,0.4)]' : 'bg-transparent border-white/5 text-slate-500 hover:border-green-600/50 hover:text-green-600'}`}
                                >
                                    Rival ha Concedido
                                </button>
                            </div>
                            {concession !== 'none' && (
                                <p className="mt-4 text-[10px] text-slate-500 italic text-center animate-pulse">
                                    {concession === 'home' ? '⚠️ Sin MVP para nosotros. El rival recibe +1 MVP.' : '🏆 ¡Victoria por Concesión! Recibimos un segundo MVP (+1 MVP total).'}
                                </p>
                            )}
                        </div>
                    </div>
                );

            case 1:
                if (mvpCount === 0) {
                    return (
                        <div className="flex flex-col items-center justify-center p-12 text-center gap-6 animate-fade-in">
                            <div className="w-24 h-24 rounded-full bg-blood-red/10 border-2 border-blood-red/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-blood-red text-5xl">block</span>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xl font-display font-black text-white uppercase italic">Sin MVP Galardonado</h4>
                                <p className="text-slate-500 text-xs italic">Al conceder el partido, el equipo renuncia a cualquier reconocimiento oficial.</p>
                            </div>
                            <button onClick={() => setStep(step + 1)} className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-display font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white/10 transition-all">
                                Continuar a Fans
                            </button>
                        </div>
                    );
                }
                const eligibleMvp = updatedTeam.players.filter(p => !p.isStarPlayer && !p.isJourneyman);
                return (
                    <div className="flex flex-col gap-6 animate-fade-in">
                         <div className="text-center space-y-2">
                            <h4 className="text-[10px] font-display font-black text-premium-gold uppercase tracking-[0.3em]">
                                Cónclave de MVP: Galardón {mvpsAwarded + 1} de {mvpCount}
                            </h4>
                            <div className="flex flex-col items-center gap-1 border-t border-white/5 pt-2">
                                <p className="text-slate-500 text-[10px] italic">Nomina hasta 3 guerreros ({diceConfig.mvp} elegirá al azar)</p>
                                <p className="text-white text-[12px] font-display font-black">
                                    Candidatos: <span className={mvpNominations.length === Math.min(3, eligibleMvp.length) ? "text-green-500" : "text-premium-gold animate-pulse"}>{mvpNominations.length} / {Math.min(3, eligibleMvp.length)}</span>
                                </p>
                            </div>
                        </div>

                        {!mvpRoll ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {eligibleMvp.map(p => {
                                        const isNominated = mvpNominations.includes(p.id);
                                        const nominationIndex = mvpNominations.indexOf(p.id);
                                        return (
                                            <button 
                                                key={p.id} 
                                                onClick={() => handleToggleNomination(p.id)}
                                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                                                    isNominated ? 'bg-premium-gold/20 border-premium-gold shadow-[0_0_15px_rgba(245,159,10,0.2)]' : 'bg-white/5 border-white/5 hover:border-white/20'
                                                }`}
                                            >
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${isNominated ? 'bg-premium-gold text-black' : 'bg-white/10 text-slate-500'}`}>
                                                    {isNominated ? nominationIndex + 1 : '#'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`text-[11px] font-display font-black uppercase italic truncate ${isNominated ? 'text-white' : 'text-slate-400'}`}>{p.customName}</p>
                                                    <p className="text-[8px] font-bold text-slate-600 uppercase truncate">{p.position}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="flex flex-col items-center gap-4 pt-4">
                                    <div className="flex gap-2">
                                        <input 
                                            type="number" min="1" max={diceConfig.mvp.toLowerCase().includes('d3') ? 3 : 6} placeholder={diceConfig.mvp}
                                            className="w-20 bg-black/60 border border-premium-gold/30 rounded-xl px-2 py-2 text-center text-xl font-black text-white focus:border-premium-gold outline-none"
                                            id="mvp-manual-input"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const val = (e.currentTarget as HTMLInputElement).value;
                                                    if (val) handleMvpRoll(Number(val));
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={() => {
                                                const input = document.getElementById('mvp-manual-input') as HTMLInputElement;
                                                if (input?.value) handleMvpRoll(Number(input.value));
                                            }}
                                            disabled={mvpNominations.length < 1}
                                            className="bg-premium-gold text-black font-display font-black px-6 rounded-xl text-xs uppercase hover:bg-white transition-all shadow-lg active:scale-95 disabled:opacity-30"
                                        >
                                            Aplicar
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-4 w-full max-w-[200px]">
                                        <div className="h-px bg-white/5 flex-1"></div>
                                        <span className="text-[8px] font-bold text-slate-600 uppercase">O bien</span>
                                        <div className="h-px bg-white/5 flex-1"></div>
                                    </div>
                                    <button
                                        onClick={() => handleMvpRoll()}
                                        disabled={mvpNominations.length < 1}
                                        className="group relative bg-white/5 border border-white/10 text-white font-display font-black py-3 px-10 rounded-2xl hover:bg-white/10 active:scale-95 disabled:opacity-30 transition-all flex items-center gap-3 uppercase tracking-widest text-[9px]"
                                    >
                                        <span className="material-symbols-outlined text-sm">casino</span>
                                        {mvpNominations.length < 1 
                                            ? 'Nomina al menos 1 candidato' 
                                            : `Tirar ${diceConfig.mvp} para MVP ${mvpsAwarded + 1}`}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="glass-panel p-8 bg-black/60 border-premium-gold/30 text-center animate-slide-in-up relative overflow-hidden shadow-2xl">
                                 <div className="absolute top-0 right-0 p-4 opacity-[0.05] scale-150 rotate-12">
                                    <span className="material-symbols-outlined text-8xl text-white">military_tech</span>
                                </div>
                                <div className="flex justify-center gap-8 items-center mb-8 relative z-10">
                                    <div className="w-20 h-20 bg-premium-gold/10 rounded-3xl border-2 border-premium-gold/30 flex flex-col items-center justify-center shadow-inner">
                                        <span className="text-[10px] font-display font-black text-premium-gold uppercase tracking-widest mb-1">Dado</span>
                                        <span className="text-4xl font-display font-black text-white">{mvpRoll}</span>
                                    </div>
                                    <div className="h-16 w-px bg-white/10"></div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest mb-1">El Elegido de Nuffle</p>
                                        <p className="text-3xl font-display font-black text-white uppercase italic tracking-tighter leading-none mb-2">
                                            {mvp?.customName}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded bg-premium-gold/20 border border-premium-gold/30 text-[9px] font-display font-black text-premium-gold uppercase">+4 PE DE ESTRELLATO</span>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => {
                                        setMvpNominations([]); 
                                        if (mvpsAwarded < mvpCount) {
                                            setMvpRoll(null);
                                        } else {
                                            setStep(step + 1);
                                        }
                                    }} 
                                    className="w-full bg-premium-gold text-black font-display font-black py-4 rounded-xl shadow-xl hover:scale-[1.02] transition-all uppercase tracking-widest text-[10px]"
                                >
                                    {mvpsAwarded < mvpCount ? 'Nominar Siguiente MVP' : 'Siguiente Paso (Fans)'}
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 2:
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
                            <div className="flex flex-col items-center gap-4 pt-4">
                                <div className="flex gap-2">
                                    <input 
                                        type="number" min="1" max={(concession === 'home' || diceConfig.fans.toLowerCase().includes('d3')) ? 3 : 6} placeholder={concession === 'home' ? 'D3' : diceConfig.fans}
                                        className="w-20 bg-black/60 border border-sky-500/30 rounded-xl px-2 py-2 text-center text-xl font-black text-white focus:border-sky-500 outline-none"
                                        id="fans-manual-input"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const val = (e.currentTarget as HTMLInputElement).value;
                                                if (val) handleFansRoll(Number(val));
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => {
                                            const input = document.getElementById('fans-manual-input') as HTMLInputElement;
                                            if (input?.value) handleFansRoll(Number(input.value));
                                        }}
                                        className="bg-sky-600 text-black font-display font-black px-6 rounded-xl text-xs uppercase hover:bg-white transition-all shadow-lg active:scale-95"
                                    >
                                        Aplicar
                                    </button>
                                </div>
                                <div className="flex items-center gap-4 w-full max-w-[200px]">
                                    <div className="h-px bg-white/5 flex-1"></div>
                                    <span className="text-[8px] font-bold text-slate-600 uppercase">O bien</span>
                                    <div className="h-px bg-white/5 flex-1"></div>
                                </div>
                                <button
                                    onClick={() => handleFansRoll()}
                                    className="group relative bg-white/5 border border-white/10 text-white font-display font-black py-3 px-10 rounded-2xl hover:bg-white/10 active:scale-95 transition-all flex items-center gap-3 uppercase tracking-widest text-[9px]"
                                >
                                    <span className="material-symbols-outlined text-sm">casino</span>
                                    Invocar a la Masa
                                </button>
                            </div>
                        ) : (
                            <div className="glass-panel p-6 bg-black/60 border-sky-500/30 text-center animate-slide-in-up relative overflow-hidden mt-2 shadow-2xl">
                                <div className="absolute top-0 right-0 p-2 opacity-[0.03] scale-150 rotate-12">
                                    <span className="material-symbols-outlined text-8xl text-white">group</span>
                                </div>
                                <div className="flex justify-center gap-6 items-center mb-6 relative z-10">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl border-2 border-sky-500/30 flex flex-col items-center justify-center shadow-inner">
                                        <span className="text-[8px] font-display font-black text-sky-500 uppercase tracking-widest mb-0.5">{concession === 'home' ? 'D3' : diceConfig.fans}</span>
                                        <span className="text-2xl font-display font-black text-white">{fansRoll}</span>
                                    </div>
                                    <div className="h-10 w-px bg-white/10"></div>
                                    <div className="text-left">
                                        <p className="text-[9px] font-display font-black text-slate-500 uppercase tracking-widest mb-0.5">Resultado</p>
                                        <p className={`text-xl font-display font-black uppercase italic tracking-tighter leading-none ${fansChange > 0 ? 'text-green-500' : (fansChange < 0 || concession === 'home') ? 'text-blood-red' : 'text-sky-400'}`}>
                                            {concession === 'home' ? 'Deserción por Abandono' : (fansChange > 0 ? '¡Nuevos Adeptos!' : fansChange < 0 ? 'Deserción en Masa' : 'Vínculo Estable')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center bg-white/5 p-3.5 rounded-xl border border-white/5 mt-2 shadow-inner relative z-10">
                                    <span className="text-[9px] font-display font-black text-slate-500 uppercase tracking-widest">Hinchas Consagrados Finales</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-display font-black text-white tracking-tighter">{updatedTeam.dedicatedFans}</span>
                                        {fansChange !== 0 && (
                                            <span className={`text-xs font-bold ${fansChange > 0 ? 'text-green-500' : 'text-blood-red'}`}>
                                                ({fansChange > 0 ? '+' : ''}{fansChange})
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 animate-fade-in h-full flex flex-col">
                        <div className="flex items-center justify-between px-2">
                            <div>
                                <h4 className="text-[10px] font-display font-black text-premium-gold uppercase tracking-[0.4em]">Ascensión y Destino</h4>
                                <p className="text-[8px] font-display font-medium text-slate-500 uppercase tracking-widest mt-0.5">Gestión de PE y Atributos</p>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                <span className="text-[9px] font-display font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{improvedPlayers.length} Jugadores con PE</span>
                            </div>
                        </div>

                        {improvementResult && (
                            <div className="glass-panel p-6 bg-premium-gold/5 border-premium-gold/30 animate-bounce-in relative overflow-hidden mb-4">
                                <button onClick={() => setImprovementResult(null)} className="absolute top-2 right-2 p-1 text-slate-500 hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-premium-gold/10 rounded-xl border border-premium-gold/30 flex flex-col items-center justify-center">
                                        <span className="text-[8px] font-black text-premium-gold uppercase">Dado</span>
                                        <span className="text-xl font-black text-white">{improvementResult.roll}</span>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">¡Mejora para {improvementResult.player.customName}!</p>
                                        <p className="text-sm font-display font-black text-white uppercase italic">{improvementResult.result}</p>
                                        <p className="text-[8px] italic text-premium-gold/60 mt-1">Aplica este cambio manualmente en la ficha tras confirmar.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar pb-10">
                            <h4 className="text-[10px] font-display font-black text-premium-gold uppercase tracking-[0.2em]">Registro de Ascensión</h4>
                            <span className="text-[9px] font-display font-black text-slate-500 uppercase">{improvedPlayers.length} Marcados</span>
                        </div>
                        <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[300px]">
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
                                        <div className="flex flex-col gap-2 border-t border-white/5 pt-3.5 mt-1.5">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleRandomSkill(p, 'Primary', costs.rp)}
                                                    disabled={p.spp < costs.rp}
                                                    className="flex-1 py-1.5 rounded-xl bg-sky-500/5 border border-sky-500/20 text-[8px] font-display font-black text-sky-400 hover:bg-sky-500 hover:text-black disabled:opacity-10 transition-all uppercase tracking-widest"
                                                >
                                                    Azar P. ({costs.rp})
                                                </button>
                                                <button
                                                    onClick={() => setSkillSelection({ player: p, type: 'Primary', cost: costs.cp })}
                                                    disabled={p.spp < costs.cp}
                                                    className="flex-1 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/40 text-[8px] font-display font-black text-sky-400 hover:bg-sky-500 hover:text-black disabled:opacity-10 transition-all uppercase tracking-widest"
                                                >
                                                    Elegir P. ({costs.cp})
                                                </button>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleRandomSkill(p, 'Secondary', costs.rs)}
                                                    disabled={p.spp < costs.rs}
                                                    className="flex-1 py-1.5 rounded-xl bg-purple-500/5 border border-purple-500/20 text-[8px] font-display font-black text-purple-400 hover:bg-purple-500 hover:text-black disabled:opacity-10 transition-all uppercase tracking-widest"
                                                >
                                                    Azar S. ({costs.rs})
                                                </button>
                                                <button
                                                    onClick={() => setSkillSelection({ player: p, type: 'Secondary', cost: costs.cs })}
                                                    disabled={p.spp < costs.cs}
                                                    className="flex-1 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/40 text-[8px] font-display font-black text-purple-400 hover:bg-purple-500 hover:text-black disabled:opacity-10 transition-all uppercase tracking-widest"
                                                >
                                                    Elegir S. ({costs.cs})
                                                </button>
                                            </div>
                                            <div className="flex flex-col gap-2 bg-black/40 p-3 rounded-xl border border-white/5 shadow-inner">
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="number" min="1" max="16" placeholder="D16"
                                                        className="w-16 bg-black/60 border border-premium-gold/30 rounded-lg px-1 py-1 text-center text-xs font-black text-white focus:border-premium-gold outline-none"
                                                        id={`char-manual-${p.id}`}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                const val = (e.currentTarget as HTMLInputElement).value;
                                                                if (val) handleCharacteristicImprovement(p, costs.ch, Number(val));
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const input = document.getElementById(`char-manual-${p.id}`) as HTMLInputElement;
                                                            if (input?.value) handleCharacteristicImprovement(p, costs.ch, Number(input.value));
                                                        }}
                                                        disabled={p.spp < costs.ch}
                                                        className="bg-premium-gold text-black font-display font-black px-3 py-1 rounded-lg text-[8px] uppercase hover:bg-white transition-all shadow-lg active:scale-95 disabled:opacity-30"
                                                    >
                                                        Aplicar
                                                    </button>
                                                    <div className="h-4 w-px bg-white/10 mx-1"></div>
                                                    <button
                                                        onClick={() => handleCharacteristicImprovement(p, costs.ch)}
                                                        disabled={p.spp < costs.ch}
                                                        className="flex-1 py-1 rounded-lg bg-premium-gold/5 border border-premium-gold/20 text-[8px] font-display font-black text-premium-gold hover:bg-premium-gold hover:text-black disabled:opacity-30 transition-all uppercase tracking-widest shadow-lg"
                                                    >
                                                        🎲 Tirar {costs.ch}
                                                    </button>
                                                </div>
                                            </div>
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
                    </div>
                );
            case 4: {
                const needsExpensiveMistakes = updatedTeam.treasury >= 100000 && !expensiveMistakes;
                
                if (needsExpensiveMistakes) {
                    return (
                        <div className="flex flex-col gap-6 animate-fade-in">
                            <div className="text-center space-y-3">
                                <div className="w-16 h-16 bg-blood-red/10 rounded-2xl border border-blood-red/30 flex items-center justify-center mx-auto shadow-2xl">
                                    <span className="material-symbols-outlined text-3xl text-blood-red animate-pulse">account_balance_wallet</span>
                                </div>
                                <h4 className="text-[10px] font-display font-black text-blood-red uppercase tracking-[0.3em]">Errores Costosos</h4>
                                <p className="text-slate-500 text-[10px] italic max-w-[300px] mx-auto">"La boveda está demasiado llena... los accidentes ocurren."</p>
                                <p className="text-white font-black text-sm">Tesorería: {updatedTeam.treasury.toLocaleString()} m.o.</p>
                            </div>

                            <div className="flex flex-col items-center gap-4 pt-4">
                                <div className="flex gap-2">
                                    <input 
                                        type="number" min="1" max="6" placeholder="D6"
                                        className="w-20 bg-black/60 border border-blood-red/30 rounded-xl px-2 py-2 text-center text-xl font-black text-white focus:border-blood-red outline-none"
                                        id="expensive-manual-input"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const val = (e.currentTarget as HTMLInputElement).value;
                                                if (val) handleExpensiveMistakesRoll(Number(val));
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => {
                                            const input = document.getElementById('expensive-manual-input') as HTMLInputElement;
                                            if (input?.value) handleExpensiveMistakesRoll(Number(input.value));
                                        }}
                                        className="bg-blood-red text-white font-display font-black px-6 rounded-xl text-xs uppercase hover:bg-white hover:text-black transition-all shadow-lg active:scale-95"
                                    >
                                        Aplicar
                                    </button>
                                </div>
                                <div className="flex items-center gap-4 w-full max-w-[200px]">
                                    <div className="h-px bg-white/5 flex-1"></div>
                                    <span className="text-[8px] font-bold text-slate-600 uppercase">O bien</span>
                                    <div className="h-px bg-white/5 flex-1"></div>
                                </div>
                                <button
                                    onClick={() => handleExpensiveMistakesRoll()}
                                    className="group relative bg-white/5 border border-white/10 text-white font-display font-black py-3 px-10 rounded-2xl hover:bg-white/10 active:scale-95 transition-all flex items-center gap-3 uppercase tracking-widest text-[9px]"
                                >
                                    <span className="material-symbols-outlined text-sm">casino</span>
                                    Tentar al Destino
                                </button>
                                <div className="mt-2 p-3 bg-black/40 rounded-xl border border-white/5">
                                    <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-2 font-bold">Resumen de Riesgo (Tesorería: {updatedTeam.treasury/1000}k)</p>
                                    <div className="grid grid-cols-3 gap-2 text-[7px] font-display font-black uppercase text-center">
                                        <div className="p-1 rounded bg-white/5 border border-white/5">
                                            <p className="text-slate-500 mb-0.5">Resultado 4</p>
                                            <p className="text-blood-red">-{
                                                updatedTeam.treasury >= 500000 ? (updatedTeam.treasury - 100000)/1000 :
                                                updatedTeam.treasury >= 400000 ? 100 :
                                                updatedTeam.treasury >= 300000 ? 50 :
                                                updatedTeam.treasury >= 200000 ? 20 : 10
                                            }k</p>
                                        </div>
                                        <div className="p-1 rounded bg-white/5 border border-white/5">
                                            <p className="text-slate-500 mb-0.5">Resultado 5</p>
                                            <p className="text-blood-red">-{
                                                updatedTeam.treasury >= 500000 ? (updatedTeam.treasury - 50000)/1000 :
                                                updatedTeam.treasury >= 400000 ? (updatedTeam.treasury - 100000)/1000 :
                                                updatedTeam.treasury >= 300000 ? 100 :
                                                updatedTeam.treasury >= 200000 ? 50 : 20
                                            }k</p>
                                        </div>
                                        <div className="p-1 rounded bg-white/5 border border-white/5">
                                            <p className="text-slate-500 mb-0.5">Resultado 6</p>
                                            <p className="text-blood-red">-{
                                                updatedTeam.treasury >= 500000 ? (updatedTeam.treasury)/1000 :
                                                updatedTeam.treasury >= 400000 ? (updatedTeam.treasury - 50000)/1000 :
                                                updatedTeam.treasury >= 300000 ? (updatedTeam.treasury - 100000)/1000 :
                                                updatedTeam.treasury >= 200000 ? 100 : 50
                                            }k</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }

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
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 shadow-inner text-center">
                                    <h4 className="text-[8px] font-display font-black text-sky-500 uppercase tracking-[0.2em] mb-2 opacity-80">Séquito Vital</h4>
                                    <div className="flex items-center justify-center gap-3">
                                        <span className="text-xl font-display font-black text-white">{updatedTeam.dedicatedFans}</span>
                                        <span className="text-[8px] font-display font-black text-slate-500 uppercase leading-tight tracking-wider font-bold text-left">Hinchas<br />Fieles</span>
                                    </div>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center flex flex-col items-center shadow-inner">
                                    <h4 className="text-[8px] font-display font-black text-premium-gold uppercase tracking-[0.2em] mb-2 opacity-80">M.V.P.</h4>
                                    <div className="flex items-center gap-3 justify-center">
                                         <span className="text-sm font-display font-black text-white italic">{mvp?.customName || 'Pendiente'}</span>
                                    </div>
                                </div>
                            </div>

                            {expensiveMistakes && expensiveMistakes.loss > 0 && (
                                <div className="bg-blood-red/10 border border-blood-red/30 p-4 rounded-2xl flex justify-between items-center relative z-10 animate-pulse">
                                    <div>
                                        <p className="text-[10px] font-black text-blood-red uppercase tracking-widest">Errores Costosos (Dado: {expensiveMistakes.roll})</p>
                                        <p className="text-xs text-white/80 font-display italic">Pérdidas por mala gestión de la bóveda.</p>
                                    </div>
                                    <p className="text-lg font-black text-blood-red">-{expensiveMistakes.loss.toLocaleString()} <span className="text-[10px] uppercase">m.o.</span></p>
                                </div>
                            )}

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
            }
            default: return null;
        }
    };

    const steps = ["Recaudación", "MVP", "Audiencia", "Evolución", "Veredicto"];

    return createPortal(
        <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-premium-gold/5 blur-[150px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blood-red/5 blur-[150px] rounded-full animate-pulse delay-700"></div>
            </div>

            <div className="w-full max-w-lg flex flex-col max-h-[92vh] gap-3 p-2">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-2xl font-display font-black text-white italic tracking-tighter uppercase leading-none">
                        Crónica de <span className="text-blood-red">Sangre</span> & Oro
                    </h2>
                    <div className="flex justify-center gap-1 mt-4">
                        {steps.map((s, i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                                <div className={`h-1 rounded-full transition-all duration-700 ${i === step ? 'w-10 bg-premium-gold shadow-[0_0_10px_rgba(245,159,10,0.5)]' : i < step ? 'w-5 bg-premium-gold/30' : 'w-5 bg-white/5'}`}></div>
                                <span className={`text-[7px] font-display font-black uppercase tracking-widest transition-opacity duration-500 ${i === step ? 'opacity-100 text-white' : 'opacity-30 text-slate-500'}`}>{s}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="glass-panel border-white/5 bg-black/40 p-5 sm:p-6 shadow-4xl relative overflow-hidden flex flex-col min-h-0 flex-1">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-premium-gold/5 blur-[100px] -z-10"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blood-red/5 blur-[100px] -z-10"></div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                        {renderStepContent()}
                    </div>

                    {/* Footer Controls */}
                    <div className="mt-4 pt-4 border-t border-white/5 flex gap-3 flex-shrink-0">
                        <button
                            onClick={() => setStep(s => Math.max(0, s - 1))}
                            disabled={step === 0}
                            className="flex-1 bg-white/5 border border-white/10 text-slate-500 font-display font-black py-3 rounded-xl hover:bg-white/10 hover:text-white disabled:opacity-10 disabled:grayscale transition-all uppercase tracking-widest text-[10px]"
                        >
                            Antiguo
                        </button>
                        {step < 4 ? (
                            <button
                                onClick={() => setStep(s => s + 1)}
                                disabled={
                                    (step === 0 && !winningsRolls.home && concession !== 'home') ||
                                    (step === 1 && mvpsAwarded < mvpCount) || 
                                    (step === 2 && !fansRoll && !isDraw)
                                }
                                className="flex-[2] bg-premium-gold text-black font-display font-black py-3 rounded-xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-[10px] disabled:opacity-20"
                            >
                                Siguiente Sello
                            </button>
                        ) : (
                            <button
                                onClick={handleConfirm}
                                disabled={updatedTeam.treasury >= 100000 && !expensiveMistakes}
                                className="flex-[2] bg-green-600 text-black font-display font-black py-3 rounded-xl shadow-[0_10px_20px_rgba(34,197,94,0.3)] hover:bg-green-500 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-[10px] disabled:opacity-30 disabled:grayscale"
                            >
                                {updatedTeam.treasury >= 100000 && !expensiveMistakes ? 'Pendiente: Gastos' : 'Sellar Destino Final'}
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
        </div>,
        document.body
    );
};

export default PostGameWizard;
