import React, { useState, useMemo, useEffect } from 'react';
import type { ManagedTeam, ManagedPlayer, Skill } from '../types';
import { skillsData } from '../data/skills';
import { teamsData } from '../data/teams';

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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="bg-slate-900 rounded-lg shadow-xl border border-slate-700 max-w-lg w-full max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-amber-400 p-4 border-b border-slate-700">Elige una Habilidad {skillType === 'Primary' ? 'Primaria' : 'Secundaria'}</h3>
                <div className="p-5 overflow-y-auto space-y-2">
                    {availableSkills.map(skill => (
                        <button key={skill.name} onClick={() => onSelect(skill.name)} className="w-full text-left bg-slate-700/50 p-3 rounded-md hover:bg-slate-700 transition-colors">
                            <p className="font-semibold text-white">{skill.name}</p>
                            <p className="text-xs text-slate-400 mt-1">{skill.description}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

interface PostGameWizardProps {
    initialHomeTeam: ManagedTeam;
    opponentTeam: ManagedTeam;
    score: { home: number; opponent: number };
    fame: number;
    onConfirm: (finalTeam: ManagedTeam) => void;
}

interface PostGameState {
    winnings: number;
    mvp: (ManagedPlayer & { teamName: string }) | null;
    team: ManagedTeam;
}

const sppLevels = [
    { threshold: 3, name: 'Experimentado', cost: 3 },
    { threshold: 6, name: 'Veterano', cost: 6 },
    { threshold: 8, name: 'Emergente', cost: 8 },
    { threshold: 10, name: 'Estrella', cost: 10 },
    { threshold: 15, name: 'Superestrella', cost: 15 },
    { threshold: 20, name: 'Leyenda', cost: 20 },
].reverse(); // Reverse to check from highest to lowest

const getLevelFromSpp = (spp: number) => {
    return sppLevels.find(level => spp >= level.threshold);
};

const cloneTeamForPostGame = (team: ManagedTeam): ManagedTeam => ({
    ...team,
    players: team.players.map(p => ({
        ...p,
        stats: { ...p.stats },
        gainedSkills: [...(p.gainedSkills || [])],
        lastingInjuries: [...(p.lastingInjuries || [])],
        sppActions: p.sppActions ? { ...p.sppActions } : {},
    })),
});

const PostGameWizard: React.FC<PostGameWizardProps> = ({ initialHomeTeam, opponentTeam, score, fame, onConfirm }) => {
    const [step, setStep] = useState(0);
    const [fansChange, setFansChange] = useState<number>(0);
    const [fansRoll, setFansRoll] = useState<number | null>(null);
    const [postGameState, setPostGameState] = useState<PostGameState | null>(null);
    const [skillSelection, setSkillSelection] = useState<{ player: ManagedPlayer, type: 'Primary' | 'Secondary', cost: number } | null>(null);

    useEffect(() => {
        const winningsRoll = Math.floor(Math.random() * 6) + 1;
        const calculatedWinnings = (winningsRoll + fame) * 10000;

        const tempTeam = cloneTeamForPostGame(initialHomeTeam);
        let mvpPlayer: (ManagedPlayer & { teamName: string }) | null = null;
        
        const isEligibleForMvp = (p: ManagedPlayer) => !p.isStarPlayer && !p.isJourneyman;

        const homeEligible = tempTeam.players.filter(isEligibleForMvp);
        const oppEligible = opponentTeam.players.filter(isEligibleForMvp);

        let mvpPool: (ManagedPlayer & { teamName: string })[] = [];
        if (score.home > score.opponent) { // Home wins
            mvpPool = homeEligible.map(p => ({ ...p, teamName: tempTeam.name }));
        } else if (score.opponent > score.home) { // Opponent wins
            mvpPool = oppEligible.map(p => ({ ...p, teamName: opponentTeam.name }));
        } else { // Draw
            mvpPool = [
                ...homeEligible.map(p => ({ ...p, teamName: tempTeam.name })),
                ...oppEligible.map(p => ({ ...p, teamName: opponentTeam.name }))
            ];
        }
        
        if (mvpPool.length > 0) {
            const randomMvp = mvpPool[Math.floor(Math.random() * mvpPool.length)];
            mvpPlayer = randomMvp;

            const mvpInHomeTeam = tempTeam.players.find((p: ManagedPlayer) => p.id === randomMvp.id);
            if (mvpInHomeTeam) {
                mvpInHomeTeam.spp += 4;
            }
        }
        
        tempTeam.treasury += calculatedWinnings;

        setPostGameState({
            winnings: calculatedWinnings,
            mvp: mvpPlayer,
            team: tempTeam,
        });
    }, [initialHomeTeam, opponentTeam, score, fame]);

    const handleConfirm = () => {
        if (!postGameState) return;
        const finalTeam = {
            ...postGameState.team,
            players: postGameState.team.players.filter(p => !p.isStarPlayer && !p.isJourneyman)
        };
        onConfirm(finalTeam);
    };

    const setUpdatedTeam = (updater: React.SetStateAction<ManagedTeam>) => {
        setPostGameState(prevState => {
            if (!prevState) return null;
            const newTeam = typeof updater === 'function' ? updater(prevState.team) : updater;
            return { ...prevState, team: newTeam };
        });
    };

    const handleFansRoll = () => {
        const roll = Math.floor(Math.random() * 6) + 1;
        setFansRoll(roll);
        let change = 0;
        if (score.home > score.opponent && roll >= 4) change = 1; // Win
        if (score.home < score.opponent && roll === 1) change = -1; // Loss
        setFansChange(change);
        setUpdatedTeam(prev => ({ ...prev, dedicatedFans: Math.max(1, Math.min(6, prev.dedicatedFans + change)) }));
    };

    const handleSkillSelection = (playerId: number, skillName: string, cost: number) => {
        setUpdatedTeam(prev => ({
            ...prev,
            players: prev.players.map(p => {
                if (p.id === playerId) {
                    return { ...p, spp: p.spp - cost, gainedSkills: [...p.gainedSkills, skillName] };
                }
                return p;
            })
        }));
        setSkillSelection(null);
    };

    if (!postGameState) {
        return <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"><div className="bg-slate-800 p-8 rounded-lg"><p className="text-white">Calculando resultados del partido...</p></div></div>;
    }

    const { winnings, mvp, team: updatedTeam } = postGameState;

    const renderStepContent = () => {
        switch (step) {
            case 0:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-amber-400">Paso 1: Ganancias y MJP</h3>
                        <p>El equipo <span className="font-bold text-white">{initialHomeTeam.name}</span> ha ganado <span className="font-bold text-green-400">{winnings.toLocaleString()} M.O.</span> de la recaudación.</p>
                        {mvp ? (
                            <p>¡<span className="font-bold text-white">{mvp.customName}</span> de {mvp.teamName} ha sido elegido Mejor Jugador del Partido y gana 4 PE!</p>
                        ) : <p>No había jugadores elegibles para ser MJP.</p>}
                        <p>Nueva tesorería: <span className="font-bold text-green-400">{updatedTeam.treasury.toLocaleString()} M.O.</span></p>
                    </div>
                );
            case 1:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-amber-400">Paso 2: Actualizar Hinchas</h3>
                        {!fansRoll ? <button onClick={handleFansRoll} className="bg-sky-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-sky-500">Tirar 1D6 por los Hinchas</button>
                        : <div>
                            <p>Tirada: <span className="font-bold text-white">{fansRoll}</span>.</p>
                            {fansChange > 0 && <p className="text-green-400">¡Ganas 1 Hincha!</p>}
                            {fansChange < 0 && <p className="text-red-400">¡Pierdes 1 Hincha!</p>}
                            {fansChange === 0 && <p className="text-slate-300">Tu número de Hinchas no cambia.</p>}
                            <p>Hinchas actuales: <span className="font-bold text-white">{updatedTeam.dedicatedFans}</span>.</p>
                        </div>}
                    </div>
                );
            case 2:
                const playersToLevelUp = updatedTeam.players.filter(p => !p.isStarPlayer && getLevelFromSpp(p.spp));
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-amber-400">Paso 3: Progresión de Jugadores</h3>
                        {playersToLevelUp.length > 0 ? playersToLevelUp.map(player => {
                            const levelInfo = getLevelFromSpp(player.spp);
                            if (!levelInfo) return null;
                            const secondaryCost = levelInfo.cost * 2;
                            return (
                                <div key={player.id} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                                    <p className="font-bold text-white">{player.customName} ({player.spp} PE) ha alcanzado el nivel: <span className="text-amber-300">{levelInfo.name}</span>.</p>
                                    <div className="text-sm mt-2">
                                        <p className="text-slate-300">Elige una mejora:</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <button onClick={() => setSkillSelection({ player, type: 'Primary', cost: levelInfo.cost })} className="bg-emerald-600 text-white text-xs font-bold py-1 px-2 rounded hover:bg-emerald-500">Habilidad Primaria ({levelInfo.cost} PE)</button>
                                            {player.spp >= secondaryCost && <button onClick={() => setSkillSelection({ player, type: 'Secondary', cost: secondaryCost })} className="bg-sky-600 text-white text-xs font-bold py-1 px-2 rounded hover:bg-sky-500">Habilidad Secundaria ({secondaryCost} PE)</button>}
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : <p className="text-slate-400">Ningún jugador tiene suficientes PE para subir de nivel.</p>}
                    </div>
                );
             case 3:
                return (
                     <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-amber-400">Paso 4: Resumen Final</h3>
                        <p>Tesorería Final: <span className="font-bold text-green-400">{updatedTeam.treasury.toLocaleString()} M.O.</span></p>
                        <p>Hinchas Finales: <span className="font-bold text-white">{updatedTeam.dedicatedFans}</span></p>
                        <p className="font-semibold text-slate-300 mt-2">Jugadores actualizados:</p>
                        <ul className="list-disc list-inside text-slate-400 text-sm">
                            {updatedTeam.players.filter(p => !p.isStarPlayer).map(p => {
                                const originalPlayer = initialHomeTeam.players.find(op => op.id === p.id);
                                if (!originalPlayer || (p.spp < originalPlayer.spp) || (p.gainedSkills.length > originalPlayer.gainedSkills.length)) {
                                    return <li key={p.id}>{p.customName}: {p.spp} PE, Habilidades: {p.gainedSkills.join(', ') || 'Ninguna'}</li>;
                                }
                                return null;
                            })}
                        </ul>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in-fast">
                <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-2xl w-full transform animate-slide-in-up">
                    <div className="p-4 border-b border-slate-700 text-center"><h2 className="text-2xl font-bold text-amber-400">Secuencia Post-Partido</h2></div>
                    <div className="p-5 max-h-[70vh] overflow-y-auto">{renderStepContent()}</div>
                    <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-between">
                        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="bg-slate-600 text-white font-bold py-2 px-6 rounded-md shadow-md hover:bg-slate-500 disabled:bg-slate-700 disabled:cursor-not-allowed">&larr; Anterior</button>
                        {step < 3 ? <button onClick={() => setStep(s => s + 1)} className="bg-sky-600 text-white font-bold py-2 px-6 rounded-md shadow-md hover:bg-sky-500">Siguiente &rarr;</button>
                        : <button onClick={handleConfirm} className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md shadow-md hover:bg-amber-400 transition-colors">Confirmar y Actualizar Plantilla</button>}
                    </div>
                </div>
            </div>
            {skillSelection && (
                <SkillSelectionModal
                    player={skillSelection.player}
                    rosterName={updatedTeam.rosterName}
                    skillType={skillSelection.type}
                    onClose={() => setSkillSelection(null)}
                    onSelect={(skillName) => handleSkillSelection(skillSelection.player.id, skillName, skillSelection.cost)}
                />
            )}
            <style>{`
                @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-in-up { from { transform: translateY(20px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
                .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
                .animate-slide-in-up { animation: slide-in-up 0.3s ease-out forwards; }
            `}</style>
        </>
    );
};

export default PostGameWizard;