import React, { useState } from 'react';
import { useMatch } from '../context/MatchContext';
import { skillsData } from '../../../../data/skills';
import TdIcon from '../../../../components/icons/TdIcon';
import PassIcon from '../../../../components/icons/PassIcon';
import CasualtyIcon from '../../../../components/icons/CasualtyIcon';
import GameLog from '../log/GameLog';
import { S3ActionType, InteractionMode } from '../types/match.types';
import { ManagedPlayer, ELITE_SKILLS } from '../../../../types';

/**
 * MatchInProgress — Elite Match Console Edition.
 * Diseño premium basado en el mockup solicitado por el usuario.
 */
const MatchInProgress: React.FC = () => {
    const {
        liveHomeTeam, liveOpponentTeam,
        score, turn, half, activeTeamId, setActiveTeamId,
        selectedPlayerForAction, setSelectedPlayerForAction,
        turnActions, rosterViewId, setRosterViewId,
        setIsTdModalOpen, setIsInjuryModalOpen, setIsPrayersModalOpen,
        setIsWeatherModalOpen, setIsSequenceGuideOpen,
        setIsMatchSummaryOpen, setIsConcedeModalOpen, setGameState,
        handleStrategicAction, handleNextTurn, handleUpdatePlayerCondition, 
        logEvent, useReroll, interactionState, setInteractionState, handleS3Action, playSound
    } = useMatch();

    const [distance, setDistance] = useState<number | null>(4); // Placeholder para lógica de distancia futura

    if (!liveHomeTeam || !liveOpponentTeam) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="text-primary font-display font-black text-center animate-pulse tracking-[0.5em] uppercase">
                    Invocando escuadras...
                </div>
            </div>
        );
    }

    const { mode, pending } = interactionState;
    const activeTeam = activeTeamId === 'home' ? liveHomeTeam : liveOpponentTeam;
    const opponentTeam = activeTeamId === 'home' ? liveOpponentTeam : liveHomeTeam;

    // Helper para disparar acciones S3
    const handleTriggerAction = (type: S3ActionType) => {
        if (!selectedPlayerForAction) {
            logEvent('WARNING', 'Selecciona primero un jugador en la plantilla.');
            return;
        }
        
        // Mapeo similar a S3ActionOrchestrator
        if (type === 'PASS' && selectedPlayerForAction.stats.PA === '-') {
            logEvent('WARNING', `¡BLOCKED! ${selectedPlayerForAction.customName} no puede pasar.`);
            return;
        }

        const needsObjective = ['BLOCK', 'PASS', 'HANDOFF', 'FOUL'].includes(type);
        
        if (needsObjective) {
            setInteractionState(prev => ({
                ...prev,
                mode: 'selecting_objective',
                pending: { ...prev.pending, actorId: selectedPlayerForAction.id, actionType: type }
            }));
        } else {
            setInteractionState(prev => ({
                ...prev,
                mode: 'awaiting_dice',
                pending: { ...prev.pending, actorId: selectedPlayerForAction.id, actionType: type }
            }));
        }
    };

    const handleSelectObjectiveInternal = (player: ManagedPlayer) => {
        setInteractionState(prev => ({
            ...prev,
            mode: 'awaiting_dice',
            pending: { ...prev.pending, objectiveId: player.id }
        }));
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
        <div className="flex flex-col h-screen max-w-[1600px] mx-auto overflow-hidden text-slate-100 font-display selection:bg-primary selection:text-black">
            
            {/* ── HEADER: Scoreboard y Reloj ── */}
            <header className="flex items-center justify-between border-b border-primary/20 bg-background-dark px-6 py-3 shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-3xl">sports_football</span>
                        <h1 className="text-xl font-black uppercase tracking-tighter text-slate-100">
                            Elite Match <span className="text-primary">Console</span>
                        </h1>
                    </div>
                    <div className="h-8 w-[1px] bg-primary/20"></div>
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-slate-500 font-bold">Marcador</span>
                            <span className="text-xl font-black tabular-nums tracking-widest text-primary">
                                {score.home.toString().padStart(2, '0')} - {score.opponent.toString().padStart(2, '0')}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-slate-500 font-bold">Turno</span>
                            <span className="text-xl font-black tabular-nums text-slate-100">{turn} / 8</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-slate-500 font-bold">Periodo</span>
                            <span className="text-sm font-bold text-primary uppercase">{half === 1 ? '1ª Parte' : '2ª Parte'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-red-900/30 border border-red-500/50 px-3 py-1.5 rounded text-red-500 transition-all">
                        <div className="size-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-xs font-black uppercase tracking-widest">Reloj Activo</span>
                    </div>
                    
                    <button 
                        onClick={() => setActiveTeamId(activeTeamId === 'home' ? 'opponent' : 'home')}
                        className={`flex items-center gap-3 p-1 pr-4 rounded-full border transition-all ${activeTeamId === 'home' ? 'bg-sky-500/10 border-sky-500/30' : 'bg-red-500/10 border-red-500/30'}`}
                    >
                        <div className="size-8 rounded-full bg-black/60 flex items-center justify-center border border-white/10 overflow-hidden">
                           {activeTeam.crestImage ? <img src={activeTeam.crestImage} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-xs text-white/40 italic">shield</span>}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-tighter truncate max-w-[120px]">
                            {activeTeam.name}
                        </span>
                    </button>
                    
                    <button onClick={() => setIsMatchSummaryOpen(true)} className="size-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors" title="Ajustes">
                        <span className="material-symbols-outlined text-sm">settings</span>
                    </button>
                </div>
            </header>

            {/* ── MAIN CONTENT ── */}
            <main className="flex flex-1 overflow-hidden bg-[#050505]">
                
                {/* Aside Izquierdo: Match Log */}
                <aside className="w-80 border-r border-primary/10 bg-black/20 overflow-hidden flex flex-col p-4 gap-4">
                    <div className="flex items-center justify-between border-b border-primary/20 pb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary font-display">Match Log</h3>
                        <span className="text-[10px] text-slate-500 uppercase font-display">Crónica del encuentro</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                        <GameLog hideHeader />
                    </div>
                    <button 
                        onClick={handleNextTurn}
                        className="w-full py-4 rounded bg-primary text-black font-black uppercase tracking-widest text-xs hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,159,10,0.2)]"
                    >
                        Finalizar Turno
                    </button>
                </aside>

                {/* Central: Control Grid and Pitch */}
                <section className="flex-1 flex flex-col overflow-y-auto p-6 gap-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 to-transparent">
                    
                    {/* Action Panel: Categorizado S3 */}
                    <div className="grid grid-cols-4 gap-4 shrink-0">
                        {/* Movimiento */}
                        <ActionCategory title="Movimiento">
                            <ActionButton 
                                label="Mover / Esquiva" icon="directions_run" 
                                onClick={() => handleTriggerAction('MOVE')} 
                                isActive={pending.actionType === 'MOVE'} 
                            />
                            <ActionButton 
                                label="Rush" icon="bolt" 
                                onClick={() => handleTriggerAction('RUSH')} 
                                isActive={pending.actionType === 'RUSH'} 
                            />
                        </ActionCategory>

                        {/* Combate */}
                        <ActionCategory title="Combate">
                            <ActionButton 
                                label="Placaje (Block)" icon="casino" 
                                onClick={() => handleTriggerAction('BLOCK')} 
                                isActive={pending.actionType === 'BLOCK'} 
                                hasExtraDice
                            />
                            <ActionButton 
                                label="Falta" icon="gavel" 
                                onClick={() => handleTriggerAction('FOUL')} 
                                isActive={pending.actionType === 'FOUL'} 
                                isDanger
                            />
                        </ActionCategory>

                        {/* Balón */}
                        <ActionCategory title="Balón">
                            <ActionButton 
                                label="Recoger / Pase" icon="sports_rugby" 
                                onClick={() => handleTriggerAction('PASS')} 
                                isActive={pending.actionType === 'PASS'} 
                            />
                            <ActionButton 
                                label="Asegurador" icon="verified_user" 
                                onClick={() => handleTriggerAction('SECURE_BALL')} 
                                isActive={pending.actionType === 'SECURE_BALL'} 
                                subtext="Éxito 2+"
                                highlight
                            />
                        </ActionCategory>

                        {/* Objetivo */}
                        <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Objetivo</span>
                            <button 
                                onClick={() => handleTriggerAction('TOUCHDOWN')}
                                className="w-full h-[104px] bento-card rounded-lg border-2 border-primary border-dashed flex flex-col items-center justify-center gap-2 group transition-all"
                            >
                                <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">workspace_premium</span>
                                <span className="text-sm font-black uppercase italic text-primary">Touchdown</span>
                            </button>
                        </div>
                    </div>

                    {/* Ficha y Mapa Táctico */}
                    <div className="flex gap-6 flex-1 min-h-0">
                        
                        {/* Player Card (Detallado) */}
                        <div className="w-64 glass rounded-2xl p-5 flex flex-col gap-4 animate-slide-in-up shrink-0">
                            {selectedPlayerForAction ? (
                                <>
                                    <div className="flex items-center gap-3 border-b border-primary/20 pb-4">
                                        <div className="size-12 rounded bg-primary flex items-center justify-center text-xl font-black text-black shadow-lg">
                                            #{selectedPlayerForAction.id.toString().slice(-2)}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-black text-slate-100 uppercase tracking-tighter text-base truncate">{selectedPlayerForAction.customName}</h4>
                                            <p className="text-[9px] text-primary font-bold uppercase truncate">{selectedPlayerForAction.position}</p>
                                        </div>
                                    </div>

                                    {/* Attributes Grid */}
                                    <div className="grid grid-cols-5 gap-1 text-center">
                                        {[
                                            { l: 'MA', v: selectedPlayerForAction.stats.MV, red: selectedPlayerForAction.hasIndigestion },
                                            { l: 'ST', v: selectedPlayerForAction.stats.FU },
                                            { l: 'AG', v: selectedPlayerForAction.stats.AG + '+' },
                                            { l: 'PA', v: selectedPlayerForAction.stats.PA === '-' ? '-' : selectedPlayerForAction.stats.PA + '+' },
                                            { l: 'AR', v: selectedPlayerForAction.stats.AR + '+', red: selectedPlayerForAction.hasIndigestion }
                                        ].map(s => (
                                            <div key={s.l} className="bg-slate-900/60 rounded p-1.5 border border-white/5">
                                                <p className="text-[8px] text-slate-500 font-bold uppercase">{s.l}</p>
                                                <p className={`font-black text-xs ${s.red ? 'text-amber-500 underline' : 'text-slate-100'}`}>{s.v}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Skills Section */}
                                    <div className="space-y-2 flex-grow overflow-y-auto custom-scrollbar pr-1">
                                        <p className="text-[10px] font-black uppercase text-primary tracking-widest">Habilidades</p>
                                        <div className="grid grid-cols-1 gap-1.5">
                                            {[...(selectedPlayerForAction.skillKeys || []), ...(selectedPlayerForAction.gainedSkills || [])].map((s, i) => (
                                                <div key={i} className={`flex items-center gap-2 p-2 bg-slate-900/40 border border-white/5 rounded hover:border-primary/50 transition-colors group ${selectedPlayerForAction.isDistracted ? 'opacity-30 grayscale' : ''}`}>
                                                    <span className="material-symbols-outlined text-primary text-sm group-hover:rotate-12 transition-transform">auto_fix_high</span>
                                                    <span className={`text-[10px] font-bold text-slate-300 uppercase tracking-tighter ${selectedPlayerForAction.isDistracted ? 'line-through' : ''}`}>{s}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* S3 States (Toggleable in Console) */}
                                    <div className="flex flex-col gap-1.5 mt-auto pt-4 border-t border-white/5">
                                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Estados S3</p>
                                        <div className="flex flex-col gap-1.5">
                                            <button 
                                                onClick={() => handleUpdatePlayerCondition(selectedPlayerForAction.id, activeTeamId, 'isDistracted')}
                                                className={`flex items-center justify-between p-2.5 rounded transition-all ${selectedPlayerForAction.isDistracted ? 'bg-red-500 text-black font-black' : 'bg-red-900/10 border border-red-500/20 text-red-500/60'}`}
                                            >
                                                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                                                    <span className="material-symbols-outlined text-sm">block</span> DISTRAÍDO
                                                </span>
                                                <span className="text-[8px] opacity-70">{selectedPlayerForAction.isDistracted ? 'ACTIVO' : 'NO'}</span>
                                            </button>
                                            <button 
                                                onClick={() => handleUpdatePlayerCondition(selectedPlayerForAction.id, activeTeamId, 'hasIndigestion')}
                                                className={`flex items-center justify-between p-2.5 rounded transition-all ${selectedPlayerForAction.hasIndigestion ? 'bg-amber-500 text-black font-black' : 'bg-amber-900/10 border border-amber-500/20 text-amber-500/50'}`}
                                            >
                                                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                                                    <span className="material-symbols-outlined text-sm">sick</span> INDIGESTIÓN
                                                </span>
                                                <span className="text-[8px] opacity-70">-1 MA/AR</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 opacity-40">
                                    <span className="material-symbols-outlined text-4xl text-slate-600">group_off</span>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Selecciona un Guerrero para analizar sus datos</p>
                                </div>
                            )}
                        </div>

                        {/* MiniField & Roster Overlay */}
                        <div className="flex-1 flex flex-col gap-4">
                            <div className="flex-1 glass rounded-2xl relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] group">
                                
                                {/* Secuencia de Acciones (Overlay) */}
                                {mode !== 'idle' && (
                                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-8 animate-fade-in text-center">
                                        <div className="max-w-md w-full space-y-8">
                                            <div>
                                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 font-display">Vínculo de Nuffle</p>
                                                <h2 className="text-4xl font-display font-black text-white italic uppercase tracking-tighter">
                                                    {mode === 'selecting_objective' && "¿A quién golpear?"}
                                                    {mode === 'awaiting_dice' && "Entrada de Resultados"}
                                                </h2>
                                            </div>

                                            {mode === 'selecting_objective' && (
                                                <div className="grid grid-cols-4 gap-3 overflow-y-auto max-h-[50vh] p-2 custom-scrollbar">
                                                    {opponentTeam.players.filter(p => p.status === 'Activo').map(p => (
                                                        <button 
                                                            key={p.id} 
                                                            onClick={() => handleSelectObjectiveInternal(p)}
                                                            className="flex flex-col items-center justify-center p-4 bg-red-600/5 border border-red-600/20 rounded-2xl hover:bg-red-500 hover:text-black transition-all group scale-100 hover:scale-105"
                                                        >
                                                            <span className="text-xl font-black mb-1">#{p.id.toString().slice(-2)}</span>
                                                            <span className="text-[8px] font-bold uppercase opacity-60 truncate w-full">{p.position}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {mode === 'awaiting_dice' && (
                                                <div className="space-y-6">
                                                    {/* Dice Entry */}
                                                    <div className="flex flex-wrap justify-center gap-3">
                                                        {pending.actionType === 'BLOCK' ? (
                                                            ['Calavera', 'Ambos', 'Empujón', 'Zaca!', 'Flecha'].map(d => (
                                                                <DiceInputCircle key={d} label={d} onClick={() => handleDiceResultInternal(d)} icon="casino" />
                                                            ))
                                                        ) : ['FOUL'].includes(pending.actionType as string) ? (
                                                            [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                                                                <button key={n} onClick={() => handleDiceResultInternal(n)} className="size-12 rounded-xl bg-white/5 border border-white/10 text-xl font-black hover:bg-primary hover:text-black transition-all">{n}</button>
                                                            ))
                                                        ) : (
                                                            [1, 2, 3, 4, 5, 6].map(n => (
                                                                <button key={n} onClick={() => handleDiceResultInternal(n)} className="size-14 rounded-2xl bg-white/5 border border-white/10 text-2xl font-black hover:bg-primary hover:text-black transition-all">{n}</button>
                                                            ))
                                                        )}
                                                    </div>
                                                    
                                                    <div className="h-px bg-white/10 w-full"></div>
                                                    
                                                    <button 
                                                        onClick={() => {
                                                            const res = Math.floor(Math.random() * 6) + 1;
                                                            handleDiceResultInternal(res);
                                                        }}
                                                        className="w-full py-4 rounded-2xl bg-primary text-black font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all"
                                                    >
                                                        Digital Dice Roll
                                                    </button>
                                                </div>
                                            )}

                                            <button 
                                                onClick={() => setInteractionState({ mode: 'idle', pending: { actorId: null, actionType: null, objectiveId: null, diceResult: null, manualMode: true } })}
                                                className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                                            >
                                                &larr; Abortar Secuencia
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Pitch Visualization */}
                                <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-30 pointer-events-none">
                                    {Array.from({length: 72}).map((_, i) => (
                                        <div key={i} className="border-r border-b border-primary/20"></div>
                                    ))}
                                </div>
                                
                                <div className="absolute inset-0 flex items-center justify-center gap-12 font-display">
                                    {selectedPlayerForAction && (
                                        <div className="relative animate-pulse">
                                            <div className="size-16 rounded-full bg-primary border-4 border-white shadow-[0_0_40px_rgba(245,159,10,0.5)] flex items-center justify-center font-black text-black text-xl z-10 relative">
                                                #{selectedPlayerForAction.id.toString().slice(-2)}
                                            </div>
                                            <div className="absolute -inset-6 border-2 border-dashed border-primary/40 rounded-full animate-spin-slow"></div>
                                        </div>
                                    )}
                                    <div className="size-12 rounded-full bg-slate-800 border-4 border-slate-600 flex items-center justify-center font-bold text-slate-300 opacity-60">?</div>
                                </div>

                                {/* Distance indicator */}
                                {selectedPlayerForAction && (
                                    <div className="absolute bottom-4 right-4 flex gap-2">
                                        <div className="bg-background-dark/90 px-4 py-2 rounded-xl border border-primary/20 flex items-center gap-3 backdrop-blur-md">
                                            <span className="material-symbols-outlined text-primary text-sm">straighten</span>
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">
                                                Movimiento Restante: {selectedPlayerForAction.stats.MV - (selectedPlayerForAction.hasIndigestion ? 1 : 0)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Token Grid Overlay / Replacement */}
                            <div className="h-48 glass rounded-2xl p-4 flex flex-col gap-3">
                                <div className="flex bg-black/40 rounded-full p-1 max-w-[280px] border border-white/5">
                                    <button
                                        onClick={() => setRosterViewId('home')}
                                        className={`flex-1 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${rosterViewId === 'home' ? 'bg-primary text-black' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        Local
                                    </button>
                                    <button
                                        onClick={() => setRosterViewId('opponent')}
                                        className={`flex-1 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${rosterViewId === 'opponent' ? 'bg-red-600 text-white' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        Rival
                                    </button>
                                </div>
                                <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar pb-2">
                                   <div className="flex gap-2 min-w-max">
                                       {(rosterViewId === 'home' ? liveHomeTeam : liveOpponentTeam).players.map((p: any) => (
                                           <button 
                                                key={p.id}
                                                onClick={() => { setSelectedPlayerForAction(p); setActiveTeamId(rosterViewId); }}
                                                className={`w-12 h-12 rounded-xl border flex-shrink-0 flex items-center justify-center transition-all ${selectedPlayerForAction?.id === p.id ? 'bg-primary border-white text-black font-black scale-110 shadow-lg' : 'bg-white/5 border-white/10 text-slate-400 opacity-70 hover:opacity-100 hover:border-primary/50'}`}
                                           >
                                               {p.id.toString().slice(-2)}
                                           </button>
                                       ))}
                                   </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sidebar Derecha: Special Assistance */}
                <aside className="w-24 glass border-l border-primary/10 flex flex-col items-center py-6 gap-6 shrink-0">
                    <SpecialActionButton icon="timer_off" title="Alerta Stalling" color="red" onClick={() => logEvent('INFO', 'Chequeando Stalling S3...')} />
                    <SpecialActionButton icon="medical_services" title="Hospital" onClick={() => setIsInjuryModalOpen(true)} />
                    
                    <div className="w-10 h-px bg-primary/20"></div>
                    
                    <SpecialActionButton icon="auto_awesome" title="Plegarias" onClick={() => setIsPrayersModalOpen(true)} />
                    <SpecialActionButton icon="cyclone" title="Vientos de Nuffle" onClick={() => setIsWeatherModalOpen(true)} />
                    <SpecialActionButton icon="paid" title="Soborno" onClick={() => logEvent('INFO', 'Pago de soborno procesado.')} />
                    
                    <div className="flex-grow"></div>
                    
                    <button 
                        onClick={() => useReroll(activeTeamId)}
                        disabled={activeTeam.liveRerolls === 0}
                        className="size-16 rounded-2xl bg-primary text-black shadow-[0_0_25px_rgba(245,159,10,0.4)] flex flex-col items-center justify-center leading-none hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale" 
                        title="Gastar Segundas Oportunidades"
                    >
                        <span className="material-symbols-outlined text-2xl font-black">replay</span>
                        <p className="text-[10px] font-black mt-1">{activeTeam.liveRerolls}</p>
                        <span className="text-[8px] font-black uppercase opacity-60">RR</span>
                    </button>
                </aside>
            </main>

            {/* ── FOOTER: Connection & Info Bar ── */}
            <footer className="bg-background-dark border-t border-primary/10 px-6 py-2 flex items-center justify-between shrink-0 font-display">
                <div className="flex gap-8">
                    <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-primary shadow-[0_0_8px_#f59f0a]"></div>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest font-display">Consola de Red Lista</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Protocolo S3 Blood Bowl V3.3</span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <button className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-sm">settings</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Config</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-sm">help</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Ayuda</span>
                    </button>
                    <button onClick={() => setIsConcedeModalOpen(true)} className="flex items-center gap-2 text-blood-red/40 hover:text-blood-red transition-colors">
                        <span className="material-symbols-outlined text-sm">flag</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Conceder</span>
                    </button>
                </div>
            </footer>
        </div>
    );
};

// ── UTILITIES ────────────────────────────────────────────────────────

const ActionCategory: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-2">
        <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] px-1 font-display">{title}</span>
        <div className="grid grid-cols-1 gap-2">
            {children}
        </div>
    </div>
);

const ActionButton: React.FC<{ 
    label: string; 
    icon: string; 
    onClick: () => void; 
    isActive?: boolean; 
    isDanger?: boolean;
    hasExtraDice?: boolean;
    highlight?: boolean;
    subtext?: string;
}> = ({ label, icon, onClick, isActive, isDanger, hasExtraDice, highlight, subtext }) => (
    <button 
        onClick={onClick}
        className={`bento-card h-[50px] rounded flex items-center justify-between px-4 transition-all relative overflow-hidden group
            ${isActive ? 'border-primary bg-primary/20 shadow-[0_0_15px_rgba(245,159,10,0.2)]' : ''}
            ${isDanger ? 'bg-red-900/10 border-red-500/30' : ''}
            ${highlight ? 'border-primary/50 bg-primary/10' : ''}
        `}
    >
        <div className="flex flex-col items-start leading-none min-w-0">
            <span className={`text-[10px] font-black uppercase tracking-tighter truncate ${isDanger ? 'text-red-500' : isActive || highlight ? 'text-primary' : 'text-slate-300'}`}>{label}</span>
            {subtext && <span className="text-[8px] text-slate-500 mt-1 font-bold">{subtext}</span>}
        </div>
        <div className="flex items-center gap-1">
            {hasExtraDice && (
                <div className="flex gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-primary text-[10px]">casino</span>
                    <span className="material-symbols-outlined text-primary text-[10px]">casino</span>
                </div>
            ) || <span className={`material-symbols-outlined text-sm ${isDanger ? 'text-red-500' : 'text-primary'}`}>{icon}</span>}
        </div>
    </button>
);

const SpecialActionButton: React.FC<{ icon: string; title: string; onClick: () => void; color?: 'red' | 'gold' }> = ({ icon, title, onClick, color }) => (
    <button 
        onClick={onClick}
        className={`size-12 rounded bg-slate-900 border transition-all flex items-center justify-center group
            ${color === 'red' ? 'border-red-500/30 text-red-500 hover:bg-red-500' : 'border-primary/20 text-primary hover:bg-primary'}
            hover:text-black hover:scale-105 active:scale-95
        `} 
        title={title}
    >
        <span className="material-symbols-outlined">{icon}</span>
    </button>
);

const DiceInputCircle: React.FC<{ label: string; onClick: () => void; icon: string }> = ({ label, onClick, icon }) => (
    <button 
        onClick={onClick}
        className="size-20 rounded-full bg-white/5 border border-white/10 flex flex-col items-center justify-center hover:bg-primary hover:text-black transition-all group shadow-xl"
    >
        <span className="material-symbols-outlined text-lg mb-1 group-hover:scale-110 transition-transform">{icon}</span>
        <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    </button>
);

export default MatchInProgress;
