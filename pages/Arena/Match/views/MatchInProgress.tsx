import React, { useState } from 'react';
import { useMatch } from '../context/MatchContext';
import GameLog from '../log/GameLog';
import { S3ActionType } from '../types/match.types';
import { ManagedPlayer } from '../../../../types';

/**
 * MatchInProgress — Arena Console V2 "Midnight & Gold"
 * Implementación premium basada en el mockup de la consola de motor de partido.
 */
const MatchInProgress: React.FC = () => {
    const {
        liveHomeTeam, liveOpponentTeam,
        score, turn, half, activeTeamId, setActiveTeamId,
        selectedPlayerForAction, setSelectedPlayerForAction,
        rosterViewId, setRosterViewId,
        setIsTdModalOpen, setIsInjuryModalOpen, setIsPrayersModalOpen,
        setIsWeatherModalOpen, setIsSequenceGuideOpen,
        setIsMatchSummaryOpen, setIsConcedeModalOpen, 
        handleNextTurn, handleUpdatePlayerCondition, 
        logEvent, useReroll, interactionState, setInteractionState, handleS3Action, playSound
    } = useMatch();

    if (!liveHomeTeam || !liveOpponentTeam) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-midnight">
                <div className="text-primary font-display font-black text-center animate-pulse tracking-[0.5em] uppercase">
                    Invocando escuadras...
                </div>
            </div>
        );
    }

    const { mode, pending } = interactionState;
    const activeTeam = activeTeamId === 'home' ? liveHomeTeam : liveOpponentTeam;
    // El equipo que NO es el activo
    const idleTeam = activeTeamId === 'home' ? liveOpponentTeam : liveHomeTeam;

    // Determinar quién recibe y quién patea (simplificado para UI)
    const receivingTeam = liveHomeTeam; // Por defecto
    const kickingTeam = liveOpponentTeam;

    const handleTriggerAction = (type: S3ActionType | string) => {
        if (!selectedPlayerForAction) {
            logEvent('WARNING', 'Selecciona primero un jugador en la plantilla.');
            return;
        }

        // Acciones que abren modales específicos
        if (type === 'TD') { setIsTdModalOpen(true); return; }
        if (type === 'CAS') { setIsInjuryModalOpen(true); return; }

        // Acciones S3 con orquestación
        const needsObjective = ['BLOCK', 'PASS', 'HANDOFF', 'FOUL'].includes(type);
        
        if (needsObjective) {
            setInteractionState(prev => ({
                ...prev,
                mode: 'selecting_objective',
                pending: { ...prev.pending, actorId: selectedPlayerForAction.id, actionType: type as S3ActionType }
            }));
        } else {
            setInteractionState(prev => ({
                ...prev,
                mode: 'awaiting_dice',
                pending: { ...prev.pending, actorId: selectedPlayerForAction.id, actionType: type as S3ActionType }
            }));
        }
    };

    const handleDiceResultInternal = (result: any) => {
        handleS3Action(pending, result);
        playSound('dice');
        setInteractionState({
            mode: 'idle',
            pending: { actorId: null, actionType: null, objectiveId: null, diceResult: null, manualMode: true }
        });
        setSelectedPlayerForAction(null);
    };

    return (
        <div className="font-display min-h-screen overflow-hidden flex flex-col bg-midnight text-diente-orco selection:bg-primary selection:text-midnight">
            
            {/* ── HEADER: Global Scoreboard & Field Status Pill ── */}
            <header className="w-full border-b border-white/5 glass px-6 py-2 flex flex-col gap-2 z-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-4">
                            {/* Home Team Display */}
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[8px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded-sm font-black border border-green-500/30 uppercase tracking-tighter">Receptor</span>
                                    <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Local</span>
                                </div>
                                <span className="text-xl font-black text-diente-orco uppercase truncate max-w-[150px]">{liveHomeTeam.name}</span>
                            </div>
                            <div className="bg-primary/10 p-2 rounded-lg border border-primary/30">
                                {liveHomeTeam.crestImage ? (
                                    <img src={liveHomeTeam.crestImage} className="w-10 h-10 object-contain" alt="Logo Local" />
                                ) : (
                                    <div className="w-10 h-10 flex items-center justify-center text-primary font-black">BB</div>
                                )}
                            </div>

                            {/* Score Display */}
                            <div className="flex items-center gap-3 px-6 py-1 bg-black/60 rounded-full border border-gold/20">
                                <span className="text-3xl font-black text-gold">{score.home}</span>
                                <span className="text-slate-600 font-bold">-</span>
                                <span className="text-3xl font-black text-slate-400">{score.opponent}</span>
                            </div>

                            {/* Opponent Display */}
                            <div className="bg-slate-900/50 p-2 rounded-lg border border-white/5">
                                {liveOpponentTeam.crestImage ? (
                                    <img src={liveOpponentTeam.crestImage} className="w-10 h-10 object-contain" alt="Logo Rival" />
                                ) : (
                                    <div className="w-10 h-10 flex items-center justify-center text-slate-500 font-black">??</div>
                                )}
                            </div>
                            <div className="flex flex-col items-start">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Rival</span>
                                    <span className="text-[8px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-sm font-black border border-red-500/30 uppercase tracking-tighter">Pateador</span>
                                </div>
                                <span className="text-xl font-black text-slate-500 uppercase truncate max-w-[150px]">{liveOpponentTeam.name}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Roster Switcher (Plantilla A / B) */}
                        <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                            <button 
                                onClick={() => setRosterViewId('home')}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${rosterViewId === 'home' ? 'gold-glow bg-white/5 text-gold tracking-wide' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                PLANTILLA A
                            </button>
                            <button 
                                onClick={() => setRosterViewId('opponent')}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${rosterViewId === 'opponent' ? 'gold-glow bg-white/5 text-gold tracking-wide' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                PLANTILLA B
                            </button>
                        </div>
                        <div className="h-10 w-px bg-white/5 mx-2"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">TURNO</span>
                            <span className="text-xl font-black italic tracking-tighter text-diente-orco">{turn} / 8</span>
                        </div>
                        <button onClick={() => setIsMatchSummaryOpen(true)} className="size-10 rounded-full glass flex items-center justify-center hover:bg-white/10 text-slate-400">
                             <span className="material-symbols-outlined text-sm">settings</span>
                        </button>
                    </div>
                </div>

                {/* ── Status Pill ── */}
                <div className="flex items-center justify-center -mt-1">
                    <div className="glass-dark px-4 py-1.5 rounded-full flex items-center gap-6 border border-gold/10 shadow-lg text-[10px] font-bold uppercase tracking-wider animate-in slide-in-from-top-4 duration-500">
                        {/* Weather */}
                        <div className="flex items-center gap-2 text-blue-400">
                            <span className="material-symbols-outlined text-sm">water_drop</span>
                            <span>Clima: <span className="text-blue-300">Despejado</span></span>
                        </div>
                        <div className="w-px h-3 bg-white/10"></div>
                        {/* Period */}
                        <div className="flex items-center gap-2 text-slate-400">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            <span>Periodo: <span className="text-diente-orco">{half === 1 ? '1ª Parte' : '2ª Parte'}</span></span>
                        </div>
                        <div className="w-px h-3 bg-white/10"></div>
                        {/* Inducements */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-primary tracking-tighter">Recursos:</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/5" title="Rerolls">
                                        <span className="material-symbols-outlined text-[12px] text-gold">replay</span>
                                        <span className="text-gold">{activeTeam.liveRerolls}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── MAIN AREA ── */}
            <main className="flex flex-1 overflow-hidden p-6 gap-6">
                
                {/* ── Left: Roster Grid ── */}
                <section className="flex-1 flex flex-col gap-6 overflow-hidden">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-slate-500 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">groups</span>
                            Gestión de Plantilla
                        </h2>
                        <div className="flex gap-4 text-[10px] font-bold uppercase text-slate-500">
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(245,159,10,0.5)]"></span> Activos</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-700"></span> Agotados / Bajas</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 scrollbar-hide">
                        {(rosterViewId === 'home' ? liveHomeTeam : liveOpponentTeam).players.map((p: ManagedPlayer) => {
                            const isExhausted = ['KO', 'Lesionado', 'Muerto', 'Expulsado'].includes(p.status);
                            return (
                                <div 
                                    key={p.id}
                                    onClick={() => { setSelectedPlayerForAction(p); setActiveTeamId(rosterViewId); }}
                                    className={`glass-dark p-4 rounded-xl border-l-4 transition-all cursor-pointer group relative overflow-hidden ring-1 ring-white/5
                                        ${isExhausted ? 'opacity-30 border-l-slate-800 grayscale cursor-not-allowed' : 'border-l-primary hover:bg-white/5'}
                                        ${selectedPlayerForAction?.id === p.id ? 'ring-2 ring-gold/40 bg-gold/5' : ''}
                                    `}
                                >
                                    {(p.skillKeys?.length > 0) && (
                                        <div className="absolute top-0 right-0 p-2 opacity-30 group-hover:opacity-100 transition-opacity">
                                            <span className="material-symbols-outlined text-gold text-lg">stars</span>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-lg bg-cover bg-center border border-white/10 shadow-lg bg-black flex items-center justify-center">
                                            <span className="text-2xl font-black text-white/20">#{p.id.toString().slice(-2)}</span>
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[10px] font-bold text-primary">#{p.id.toString().slice(-2)}</span>
                                            <span className={`text-lg font-black leading-tight uppercase truncate ${isExhausted ? 'text-slate-500' : 'text-diente-orco'}`}>
                                                {p.customName}
                                            </span>
                                            <span className={`text-[10px] font-medium italic uppercase tracking-wider truncate ${isExhausted ? 'text-slate-600' : 'text-slate-500'}`}>
                                                {p.position}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── Right: Player Hub (Detail Panel) ── */}
                <aside className="w-[380px] flex flex-col gap-6 animate-in fade-in slide-in-from-right-8 duration-700">
                    <div className="glass-dark rounded-2xl p-6 border border-gold/20 shadow-2xl relative ring-1 ring-white/5 h-full flex flex-col">
                        {selectedPlayerForAction ? (
                            <>
                                <div className="absolute top-0 right-0 px-4 py-1 bg-gold text-midnight text-[10px] font-black uppercase rounded-bl-xl tracking-widest shadow-lg shadow-gold/20">Seleccionado</div>
                                
                                {/* Status Icons (Nuffle Prayers / States) */}
                                <div className="absolute top-2 left-2 flex gap-1">
                                    {selectedPlayerForAction.isDistracted && (
                                        <div className="bg-red-500/20 border border-red-500/30 p-1 rounded-md" title="Distraído (Sin ZD)">
                                            <span className="material-symbols-outlined text-red-400 text-sm">block</span>
                                        </div>
                                    )}
                                    {selectedPlayerForAction.hasIndigestion && (
                                        <div className="bg-amber-500/20 border border-amber-500/30 p-1 rounded-md" title="Indigestión (-1 MA/AR)">
                                            <span className="material-symbols-outlined text-amber-400 text-sm">sick</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col items-center text-center mb-6 pt-4">
                                    <div className="w-32 h-32 rounded-2xl bg-black border-2 border-gold/40 shadow-2xl shadow-gold/10 mb-4 ring-4 ring-black/40 flex items-center justify-center overflow-hidden">
                                        <span className="text-5xl font-black text-white/5">#{selectedPlayerForAction.id.toString().slice(-2)}</span>
                                    </div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight italic text-diente-orco">
                                        {selectedPlayerForAction.customName} <span className="text-primary">#{selectedPlayerForAction.id.toString().slice(-2)}</span>
                                    </h3>
                                    <p className="text-gold text-[10px] font-bold uppercase tracking-[0.3em]">{selectedPlayerForAction.position}</p>
                                </div>

                                {/* Attributes Grid */}
                                <div className="grid grid-cols-5 gap-2 mb-8">
                                    {[
                                        { l: 'MA', v: selectedPlayerForAction.stats.MV, bad: selectedPlayerForAction.hasIndigestion },
                                        { l: 'ST', v: selectedPlayerForAction.stats.FU },
                                        { l: 'AG', v: selectedPlayerForAction.stats.AG + '+', bad: false },
                                        { l: 'PA', v: selectedPlayerForAction.stats.PA === '-' ? '-' : selectedPlayerForAction.stats.PA + '+' },
                                        { l: 'AV', v: selectedPlayerForAction.stats.AR + '+', bad: selectedPlayerForAction.hasIndigestion }
                                    ].map(attr => (
                                        <div key={attr.l} className="flex flex-col items-center bg-black/60 p-2 rounded-lg border border-white/5 relative">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">{attr.l}</span>
                                            <span className={`text-xl font-black ${attr.bad ? 'text-red-500 underline decoration-2' : 'text-gold'}`}>{attr.v}</span>
                                            {attr.bad && <div className="warning-badge">-1</div>}
                                        </div>
                                    ))}
                                </div>

                                {/* Skills */}
                                <div className="flex-grow overflow-y-auto scrollbar-hide">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-sm">bolt</span>
                                        HABILIDADES
                                    </h4>
                                    <div className="space-y-2">
                                        {[...(selectedPlayerForAction.skillKeys || []), ...(selectedPlayerForAction.gainedSkills || [])].map((s, i) => (
                                            <div key={i} className={`flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 transition-all hover:bg-white/10 ${selectedPlayerForAction.isDistracted ? 'opacity-30' : ''}`}>
                                                <span className="material-symbols-outlined text-primary text-lg">auto_fix_high</span>
                                                <div>
                                                    <p className={`text-xs font-bold uppercase text-diente-orco ${selectedPlayerForAction.isDistracted ? 'line-through' : ''}`}>{s}</p>
                                                    <p className="text-[9px] text-slate-500 uppercase tracking-tighter">Habilidad de Clase</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* S3 Toggles in Panel */}
                                <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => handleUpdatePlayerCondition(selectedPlayerForAction.id, activeTeamId, 'isDistracted')}
                                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${selectedPlayerForAction.isDistracted ? 'bg-red-500 text-midnight border-red-500' : 'bg-transparent border-red-500/20 text-red-500/60'}`}
                                    >
                                        <span className="material-symbols-outlined text-sm">block</span>
                                        <span className="text-[8px] font-black uppercase">Distraído</span>
                                    </button>
                                    <button 
                                        onClick={() => handleUpdatePlayerCondition(selectedPlayerForAction.id, activeTeamId, 'hasIndigestion')}
                                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${selectedPlayerForAction.hasIndigestion ? 'bg-amber-500 text-midnight border-amber-500' : 'bg-transparent border-amber-500/20 text-amber-500/60'}`}
                                    >
                                        <span className="material-symbols-outlined text-sm">sick</span>
                                        <span className="text-[8px] font-black uppercase">Indigestión</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-30">
                                <span className="material-symbols-outlined text-6xl mb-4">touch_app</span>
                                <p className="text-sm font-black uppercase tracking-widest leading-loose">
                                    Elige un Guerrero<br/>de la Plantilla
                                </p>
                            </div>
                        )}
                    </div>
                </aside>
            </main>

            {/* ── Interactive Sequences (Overlay) ── */}
            {mode !== 'idle' && (
                <div className="absolute inset-0 z-[100] bg-midnight/90 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-300 px-6">
                    <div className="max-w-xl w-full glass-dark rounded-3xl border-2 border-gold/20 p-8 shadow-2xl relative">
                        <div className="text-center mb-10">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.5em] mb-2 font-display block">Vínculo de Nuffle</span>
                            <h2 className="text-4xl font-display font-black text-diente-orco italic uppercase tracking-tighter">
                                {mode === 'selecting_objective' && "¿A quién golpear?"}
                                {mode === 'awaiting_dice' && "Entrada de Resultados"}
                            </h2>
                        </div>

                        {mode === 'selecting_objective' && (
                            <div className="grid grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto pr-2 scrollbar-hide p-2">
                                {idleTeam.players.filter(p => p.status === 'Activo').map(p => (
                                    <button 
                                        key={p.id} 
                                        onClick={() => setInteractionState(prev => ({ ...prev, mode: 'awaiting_dice', pending: { ...prev.pending, objectiveId: p.id } }))}
                                        className="flex flex-col items-center justify-center p-4 bg-red-600/5 border border-red-600/20 rounded-2xl hover:bg-red-500 hover:text-midnight transition-all group scale-100 hover:scale-110 shadow-lg"
                                    >
                                        <span className="text-2xl font-black mb-1">#{p.id.toString().slice(-2)}</span>
                                        <span className="text-[8px] font-bold uppercase opacity-60 truncate w-full text-center">{p.position}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {mode === 'awaiting_dice' && (
                            <div className="space-y-8 flex flex-col items-center">
                                <div className="flex flex-wrap justify-center gap-4">
                                    {pending.actionType === 'BLOCK' ? (
                                        ['Calavera', 'Ambos', 'Empujón', 'Zaca!', 'Flecha'].map(d => (
                                            <button 
                                                key={d} 
                                                onClick={() => handleDiceResultInternal(d)}
                                                className="size-20 rounded-full glass border-white/20 flex flex-col items-center justify-center hover:bg-gold hover:text-midnight transition-all group shadow-2xl ring-offset-4 ring-offset-midnight hover:ring-2 ring-gold"
                                            >
                                                <span className="material-symbols-outlined text-lg mb-1">casino</span>
                                                <span className="text-[8px] font-black uppercase tracking-widest">{d}</span>
                                            </button>
                                        ))
                                    ) : ['FOUL'].includes(pending.actionType as string) ? (
                                        <div className="grid grid-cols-4 lg:grid-cols-6 gap-3">
                                            {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                                                <button key={n} onClick={() => handleDiceResultInternal(n)} className="size-14 rounded-2xl bg-white/5 border border-white/10 text-xl font-black hover:bg-primary hover:text-midnight transition-all shadow-xl">{n}</button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex gap-4">
                                            {[1, 2, 3, 4, 5, 6].map(n => (
                                                <button key={n} onClick={() => handleDiceResultInternal(n)} className="size-16 rounded-2xl glass border-white/20 text-3xl font-black hover:bg-primary hover:text-midnight transition-all shadow-2xl">{n}</button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={() => handleDiceResultInternal(Math.floor(Math.random() * 6) + 1)}
                                    className="w-full py-4 rounded-2xl btn-pe text-midnight font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] transition-all"
                                >
                                    Digital Dice Roll
                                </button>
                            </div>
                        )}

                        <button 
                            onClick={() => setInteractionState({ mode: 'idle', pending: { actorId: null, actionType: null, objectiveId: null, diceResult: null, manualMode: true } })}
                            className="mt-8 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors block mx-auto text-center"
                        >
                            &larr; Abortar Secuencia
                        </button>
                    </div>
                </div>
            )}

            {/* ── BOTTOM DOCK ── */}
            <footer className="w-full glass border-t border-white/10 p-4 flex flex-col gap-4 mt-auto">
                <div className="grid grid-cols-12 gap-4">
                    {/* 1. Acciones de Puntos (PE) */}
                    <div className="col-span-12 lg:col-span-4 xl:col-span-5 flex flex-col gap-2">
                        <h3 className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                            <span className="material-symbols-outlined text-sm">stars</span>
                            Acciones de Puntos (PE)
                        </h3>
                        <div className="grid grid-cols-5 gap-2">
                            <PEDockButton label="TD" pe="+3" icon="sports_score" onClick={() => handleTriggerAction('TD')} warning={false} />
                            <PEDockButton label="CAS" pe="+2" icon="skull" onClick={() => handleTriggerAction('CAS')} warning={false} />
                            <PEDockButton label="PASE" pe="+1" icon="near_me" onClick={() => handleTriggerAction('PASS')} warning={true} />
                            <PEDockButton label="LANZAR" pe="+1" icon="rocket_launch" onClick={() => handleTriggerAction('HANDOFF')} warning={false} />
                            <PEDockButton label="INTERCEP." pe="+2" icon="front_hand" onClick={() => logEvent('INFO', 'Intercepción pendiente...')} warning={true} />
                        </div>
                    </div>

                    {/* 2. Control de Turno */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-2">
                        <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                            <span className="material-symbols-outlined text-sm">settings_input_component</span>
                            Control de Turno
                        </h3>
                        <div className="grid grid-cols-2 gap-2 h-full">
                            <div className="flex flex-col gap-2">
                                <button onClick={() => logEvent('WARNING', 'TURNOVER MANUAL EJECUTADO')} className="bg-red-950/40 border border-red-900/50 hover:bg-red-900/40 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors">
                                    <span className="material-symbols-outlined text-red-500 text-sm">cancel</span>
                                    <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">Turnover</span>
                                </button>
                                <button onClick={() => handleTriggerAction('SECURE_BALL')} className="bg-slate-800/40 border border-white/5 hover:bg-slate-700/40 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors group relative">
                                    <span className="material-symbols-outlined text-slate-400 text-sm group-hover:text-primary">inventory_2</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-primary">Balón</span>
                                    <div className="warning-badge">-1</div>
                                </button>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button onClick={handleNextTurn} className="bg-primary hover:brightness-110 py-2 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 h-full flex-col">
                                    <span className="material-symbols-outlined text-midnight text-xl">event_repeat</span>
                                    <span className="text-[10px] font-black text-midnight uppercase tracking-widest">Finalizar Turno</span>
                                </button>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => logEvent('INFO', 'Chequeando Stalling S3...')} className="bg-slate-900/60 border border-white/5 py-1.5 rounded-lg text-[9px] font-bold text-slate-400 hover:text-white transition-colors">STALLING</button>
                                    <button onClick={() => setIsPrayersModalOpen(true)} className="bg-slate-900/60 border border-white/5 py-1.5 rounded-lg text-[9px] font-bold text-slate-400 hover:text-white transition-colors">RECURSOS</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. El Oráculo */}
                    <div className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col gap-2">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                            <span className="material-symbols-outlined text-sm">auto_stories</span>
                            El Oráculo
                        </h3>
                        <div className="grid grid-cols-2 gap-2 h-full">
                            <OracleButton label="Dodge Calc" icon="calculate" onClick={() => handleTriggerAction('DODGE')} />
                            <OracleButton label="Weather" icon="wb_sunny" onClick={() => setIsWeatherModalOpen(true)} />
                            <OracleButton label="Kickoff" icon="sports_cricket" onClick={() => setIsSequenceGuideOpen(true)} />
                            <OracleButton label="Concede" icon="flag" onClick={() => setIsConcedeModalOpen(true)} />
                        </div>
                    </div>
                </div>

                {/* Live Narrative Log Overlay */}
                <div className="bg-black/60 rounded-xl p-3 border border-white/5 font-mono text-[11px] h-20 overflow-y-auto scrollbar-hide ring-1 ring-white/5">
                    <GameLog />
                </div>
            </footer>
        </div>
    );
};

// ── SUB-COMPONENTS ───────────────────────────────────────────────────

const PEDockButton: React.FC<{ label: string, pe: string, icon: string, onClick: () => void, warning: boolean }> = ({ label, pe, icon, onClick, warning }) => (
    <button 
        onClick={onClick}
        className="btn-pe flex flex-col items-center justify-center py-2 rounded-xl transition-all group relative overflow-hidden"
    >
        <span className="material-symbols-outlined text-midnight text-xl group-hover:scale-110 transition-transform">{icon}</span>
        <span className="text-[9px] font-black text-midnight uppercase mt-1 leading-none">{label}</span>
        <span className="text-[8px] font-bold text-midnight/60">{pe} PE</span>
        {warning && <div className="warning-badge">-1</div>}
    </button>
);

const OracleButton: React.FC<{ label: string, icon: string, onClick: () => void }> = ({ label, icon, onClick }) => (
    <button 
        onClick={onClick}
        className="glass border-white/10 hover:border-gold/40 flex items-center gap-2 px-3 rounded-xl transition-all group"
    >
        <span className="material-symbols-outlined text-gold text-lg group-hover:rotate-12 transition-transform">{icon}</span>
        <span className="text-[9px] font-bold text-diente-orco uppercase leading-tight text-left">{label}</span>
    </button>
);

export default MatchInProgress;
