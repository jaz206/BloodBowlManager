import React, { useState } from 'react';
import { useMatch } from '../context/MatchContext';
import { S3ActionType, InteractionMode } from '../types/match.types';
import { ManagedPlayer, ELITE_SKILLS } from '../../../../types';

const ACTIONS: { type: S3ActionType; label: string; icon: string; needsObjective: boolean; color: string; attribute?: 'AG' | 'FU' | 'PA'; diceType: '1d6' | '2d6' | 'block' }[] = [
    { type: 'BLOCK', label: 'Bloqueo', icon: 'back_hand', needsObjective: true, color: 'bg-orange-600', attribute: 'FU', diceType: 'block' },
    { type: 'PASS', label: 'Pase', icon: 'shortcut', needsObjective: true, color: 'bg-sky-600', attribute: 'PA', diceType: '1d6' },
    { type: 'HANDOFF', label: 'Entrega', icon: 'front_hand', needsObjective: true, color: 'bg-green-600', attribute: 'AG', diceType: '1d6' },
    { type: 'FOUL', label: 'Falta', icon: 'gavel', needsObjective: true, color: 'bg-red-700', attribute: 'FU', diceType: '2d6' },
    { type: 'TOUCHDOWN', label: 'Touchdown', icon: 'sports_score', needsObjective: false, color: 'bg-yellow-500', diceType: '1d6' },
    { type: 'SECURE_BALL', label: 'Asegurar Balón', icon: 'inventory_2', needsObjective: false, color: 'bg-emerald-600', diceType: '1d6' },
    { type: 'DODGE', label: 'Esquivar', icon: 'directions_run', needsObjective: false, color: 'bg-indigo-600', attribute: 'AG', diceType: '1d6' },
    { type: 'RUSH', label: 'A por ellos', icon: 'speed', needsObjective: false, color: 'bg-rose-600', diceType: '1d6' },
    { type: 'MOVE', label: 'Mover', icon: 'footprint', needsObjective: false, color: 'bg-blue-600', diceType: '1d6' },
    { type: 'BONE_HEAD', label: 'Cabeza Dura', icon: 'psychology', needsObjective: false, color: 'bg-stone-600', diceType: '1d6' },
];

const BLOCK_FACES = ['Calavera', 'Ambos', 'Empujón', 'Empujón', 'Flecha', 'Zaca!'];

const S3ActionOrchestrator: React.FC = () => {
    const { 
        interactionState, setInteractionState, 
        activeTeamId, liveHomeTeam, liveOpponentTeam,
        setSelectedPlayerForAction, selectedPlayerForAction,
        logEvent, playSound, handleS3Action
    } = useMatch();

    const { mode, pending } = interactionState;

    const activeTeam = activeTeamId === 'home' ? liveHomeTeam : liveOpponentTeam;
    const opponentTeam = activeTeamId === 'home' ? liveOpponentTeam : liveHomeTeam;

    const handleSelectActor = (player: ManagedPlayer) => {
        setInteractionState(prev => ({
            ...prev,
            mode: 'selecting_action',
            pending: { ...prev.pending, actorId: player.id }
        }));
        setSelectedPlayerForAction(player);
    };

    const handleSelectAction = (action: S3ActionType) => {
        const actionData = ACTIONS.find(a => a.type === action);
        const actor = activeTeam?.players.find(p => p.id === pending.actorId);

        // Lógica S3: Validar PA "-"
        if (action === 'PASS' && actor?.stats.PA === '-') {
            logEvent('WARNING', `¡ACCIÓN BLOQUEADA! ${actor.customName} tiene PA "-" y no puede lanzar pases.`);
            return;
        }

        if (actionData?.needsObjective) {
            setInteractionState(prev => ({
                ...prev,
                mode: 'selecting_objective',
                pending: { ...prev.pending, actionType: action }
            }));
        } else {
            setInteractionState(prev => ({
                ...prev,
                mode: 'awaiting_dice',
                pending: { ...prev.pending, actionType: action }
            }));
        }
    };

    const handleSelectObjective = (player: ManagedPlayer) => {
        setInteractionState(prev => ({
            ...prev,
            mode: 'awaiting_dice',
            pending: { ...prev.pending, objectiveId: player.id }
        }));
    };

    const handleDiceResult = (result: any) => {
        handleS3Action(pending, result);
        playSound('dice');

        // Reset
        setInteractionState({
            mode: 'idle',
            pending: { actorId: null, actionType: null, objectiveId: null, diceResult: null, manualMode: true }
        });
        setSelectedPlayerForAction(null);
    };

    if (mode === 'idle') {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-zinc-900/40 border-2 border-dashed border-white/5 rounded-3xl h-full text-center">
                <span className="material-symbols-outlined text-4xl text-white/10 mb-2">touch_app</span>
                <p className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest">Selecciona un protagonista para empezar</p>
                <div className="mt-4 grid grid-cols-4 gap-2">
                    {activeTeam?.players.filter(p => !['Lesionado', 'KO', 'Muerto', 'Expulsado'].includes(p.status)).map(p => (
                        <button 
                            key={p.id} 
                            onClick={() => handleSelectActor(p)}
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white hover:bg-primary/20 hover:border-primary/40 transition-all"
                        >
                            #{p.id.toString().slice(-2)}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
            {/* Header de la secuencia */}
            <div className="flex items-center justify-between mb-4 bg-black/40 p-3 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-black text-xs">
                        {mode === 'selecting_action' ? '1' : mode === 'selecting_objective' ? '2' : '3'}
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">S3: Vínculo de Nuffle</p>
                        <h4 className="text-xs font-black text-white uppercase italic">
                            {mode === 'selecting_action' && "Confirmar Acción"}
                            {mode === 'selecting_objective' && "¿Contra quién?"}
                            {mode === 'awaiting_dice' && "Entrada de Resultados"}
                        </h4>
                    </div>
                </div>
                <button 
                    onClick={() => setInteractionState({ mode: 'idle', pending: { actorId: null, actionType: null, objectiveId: null, diceResult: null, manualMode: true } })}
                    className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-500"
                >
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>
            </div>

            <div className="flex-grow">
                {mode === 'selecting_action' && (
                    <div className="grid grid-cols-3 gap-3">
                        {ACTIONS.map(a => {
                            const actor = activeTeam?.players.find(p => p.id === pending.actorId);
                            const isBlocked = a.type === 'PASS' && actor?.stats.PA === '-';
                            const hasEliteSkill = (actor?.skillKeys || []).some(k => ELITE_SKILLS.includes(k)) || 
                                                (actor?.gainedSkills || []).some(k => ELITE_SKILLS.includes(k));

                            return (
                                <button
                                    key={a.type}
                                    onClick={() => handleSelectAction(a.type)}
                                    disabled={isBlocked}
                                    className={`flex flex-col items-center justify-center p-4 rounded-3xl border transition-all relative group
                                        ${isBlocked ? 'opacity-20 cursor-not-allowed bg-zinc-800' : `${a.color} bg-opacity-10 hover:bg-opacity-20 border-white/5 hover:border-white/20`}
                                        ${hasEliteSkill ? 'ring-2 ring-premium-gold/40 shadow-[0_0_15px_rgba(245,159,10,0.1)]' : ''}
                                    `}
                                >
                                    {hasEliteSkill && (
                                        <div className="absolute top-1 right-1">
                                            <span className="material-symbols-outlined text-[10px] text-premium-gold animate-pulse">stars</span>
                                        </div>
                                    )}
                                    <span className={`material-symbols-outlined text-2xl mb-2 transition-transform group-hover:scale-110 ${isBlocked ? 'text-slate-600' : ''}`}>{a.icon}</span>
                                    <span className="text-[9px] font-black uppercase tracking-tighter text-white">{a.label}</span>
                                    {a.attribute && !isBlocked && actor && (
                                        <span className="text-[7px] font-black text-premium-gold/60 mt-1">
                                            {a.attribute}: {actor.stats[a.attribute as keyof typeof actor.stats]}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                {mode === 'selecting_objective' && (
                    <div className="grid grid-cols-4 gap-2">
                         {opponentTeam?.players.filter(p => !['Lesionado', 'KO', 'Muerto', 'Expulsado', 'Reserva'].includes(p.status)).map(p => (
                            <button 
                                key={p.id} 
                                onClick={() => handleSelectObjective(p)}
                                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-red-600/5 border border-red-600/20 hover:bg-red-600/20 transition-all group"
                            >
                                <span className="text-xs font-black text-white mb-1">#{p.id.toString().slice(-2)}</span>
                                <span className="text-[7px] text-slate-500 uppercase truncate w-full text-center">{p.position}</span>
                            </button>
                        ))}
                    </div>
                )}

                {mode === 'awaiting_dice' && (
                    <div className="space-y-6 flex flex-col items-center py-6">
                        {pending.actionType === 'BLOCK' ? (
                            <div className="grid grid-cols-3 gap-4">
                                {['Calavera', 'Ambos', 'Empujón', 'Zaca!', 'Flecha'].map(d => (
                                    <button 
                                        key={d} 
                                        onClick={() => handleDiceResult(d)}
                                        className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center hover:bg-primary/20 hover:border-primary/40 transition-all"
                                    >
                                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mb-1">
                                            <span className="material-symbols-outlined text-xs">casino</span>
                                        </div>
                                        <span className="text-[8px] font-black text-white uppercase">{d}</span>
                                    </button>
                                ))}
                            </div>
                        ) : ACTIONS.find(a => a.type === pending.actionType)?.diceType === '2d6' ? (
                            <div className="grid grid-cols-4 gap-3 max-w-sm">
                                {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                                    <button 
                                        key={n} 
                                        onClick={() => handleDiceResult(n)}
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black transition-all border
                                            ${n >= 9 ? 'bg-red-600/20 border-red-600/40 text-red-500 hover:bg-red-600/40' : 'bg-white/5 border-white/10 text-white hover:bg-primary/20 hover:border-primary/40'}
                                        `}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-3">
                                {[1, 2, 3, 4, 5, 6].map(n => (
                                    <button 
                                        key={n} 
                                        onClick={() => handleDiceResult(n)}
                                        className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-black text-white hover:bg-primary/20 hover:border-primary/40 transition-all"
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        )}
                        
                        <div className="w-full h-px bg-white/5 my-4"></div>
                        
                        <button 
                            onClick={() => {
                                const actionData = ACTIONS.find(a => a.type === pending.actionType);
                                if (actionData?.diceType === 'block') {
                                    const face = BLOCK_FACES[Math.floor(Math.random() * 6)];
                                    handleDiceResult(face);
                                } else if (actionData?.diceType === '2d6') {
                                    handleDiceResult((Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1));
                                } else {
                                    handleDiceResult(Math.floor(Math.random() * 6) + 1);
                                }
                            }}
                            className="w-full bg-primary text-black font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                        >
                            Lanzamiento Digital (App)
                        </button>
                    </div>
                )}
            </div>
            
            {/* Footer con resumen de la secuencia */}
            <div className="mt-auto pt-4 border-t border-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                         <span className="text-xs font-black text-primary">#{selectedPlayerForAction?.id.toString().slice(-2)}</span>
                    </div>
                    {pending.actionType && (
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-500 text-sm">arrow_forward</span>
                            <span className="text-[9px] font-black text-white uppercase px-2 py-1 bg-white/5 rounded-md">{ACTIONS.find(a => a.type === pending.actionType)?.label}</span>
                        </div>
                    )}
                    {pending.objectiveId && (
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-500 text-sm">arrow_forward</span>
                            <span className="text-[9px] font-black text-red-500 uppercase px-2 py-1 bg-red-500/10 rounded-md">#{pending.objectiveId.toString().slice(-2)}</span>
                        </div>
                    )}
                </div>
        </div>
    );
};

export default S3ActionOrchestrator;
