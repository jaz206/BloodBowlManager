import React, { useState } from 'react';
import { useMatch } from '../context/MatchContext';
import GameLog from '../log/GameLog';
import { S3ActionType } from '../types/match.types';
import { ManagedPlayer } from '../../../../types';

/**
 * MatchInProgress — Arena Console V3 "Elite Assistant & Chronicle"
 * Integramos modificadores climáticos, gestión de activaciones y narrativa dinámica.
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
        handleNextTurn, handleUpdatePlayerCondition, handleSkillClick,
        logEvent, useReroll, interactionState, setInteractionState, handleS3Action, playSound,
        gameStatus, handleBribe, handleWizard
    } = useMatch();

    if (!liveHomeTeam || !liveOpponentTeam) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-midnight font-display">
                <div className="text-primary font-black text-center animate-pulse tracking-[0.5em] uppercase">
                    Invocando escuadras de Nuffle...
                </div>
            </div>
        );
    }

    const { mode, pending } = interactionState;
    const activeTeam = activeTeamId === 'home' ? liveHomeTeam : liveOpponentTeam;
    const idleTeam = activeTeamId === 'home' ? liveOpponentTeam : liveHomeTeam;

    // Lógica de Modificadores Climáticos (S3)
    const currentWeather = gameStatus.weather?.title || 'Perfecto';
    const isRainy = currentWeather === 'Lluvioso';
    const isSunny = currentWeather === 'Muy Soleado';
    const isBlizzard = currentWeather === 'Ventisca';

    const handleTriggerAction = (type: S3ActionType | string) => {
        if (!selectedPlayerForAction) {
            logEvent('WARNING', 'El Oráculo exige que selecciones un jugador primero.');
            return;
        }

        if (type === 'TD' || type === 'TOUCHDOWN') { setIsTdModalOpen(true); return; }
        if (type === 'CAS') { setIsInjuryModalOpen(true); return; }

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

    const [manualRollVal, setManualRollVal] = useState('');

    const handleDiceResultInternal = (result: any) => {
        let finalResult = result;
        if (typeof result === 'undefined') {
            const diceMap: Record<string, number> = {
                'BLOCK': 6, 'PASS': 6, 'RUSH': 6, 'DODGE': 6, 'HANDOFF': 6, 'SECURE_BALL': 6,
                'CAS': 16, 'FOUL': 6, 'DAUNTLESS': 6, 'REGEN': 6, 'KO_RECOVERY': 6, 'SCATTER': 8, 'FANS': 3,
                'INJURY': 16, 'CHARACTERISTIC': 16
            };
            const sides = diceMap[pending.actionType || ''] || 6;
            finalResult = Math.floor(Math.random() * sides) + 1;
        }
        
        handleS3Action(pending, finalResult);
        playSound('dice');
        setInteractionState({
            mode: 'idle',
            pending: { actorId: null, actionType: null, objectiveId: null, diceResult: null, manualMode: true }
        });
        setSelectedPlayerForAction(null);
        setManualRollVal('');
    };

    return (
        <div className="font-display min-h-screen overflow-hidden flex flex-col bg-midnight text-diente-orco selection:bg-primary selection:text-midnight">
            
            {/* ── 1. CABECERA GLOBAL Y ESTADO DE CAMPO ── */}
            <header className="w-full border-b border-white/5 glass px-6 py-2 flex flex-col gap-2 z-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-4">
                            {/* Local Team */}
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1.5">
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-black border uppercase tracking-tighter ${activeTeamId === 'home' ? 'bg-gold/20 text-gold border-gold/40 shadow-[0_0_8px_rgba(212,175,55,0.2)]' : 'bg-slate-800 text-slate-500 border-white/5'}`}>
                                        {activeTeamId === 'home' ? 'ACTIVO' : 'RECEPTOR'}
                                    </span>
                                    <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Local</span>
                                </div>
                                <span className="text-xl font-black text-diente-orco uppercase truncate max-w-[150px]">{liveHomeTeam.name}</span>
                            </div>
                            <div className={`p-2 rounded-lg border transition-all ${activeTeamId === 'home' ? 'bg-gold/10 border-gold/40 shadow-lg' : 'bg-primary/5 border-primary/20'}`}>
                                {liveHomeTeam.crestImage ? <img src={liveHomeTeam.crestImage} className="w-10 h-10 object-contain" alt="Logo Local" /> : <div className="w-10 h-10 flex items-center justify-center text-primary font-black italic">BB</div>}
                            </div>

                            {/* Score Display (Central) */}
                            <div className="flex items-center gap-3 px-6 py-1 bg-black/60 rounded-full border border-gold/20 shadow-inner">
                                <span className="text-3xl font-black text-gold">{score.home}</span>
                                <span className="text-slate-600 font-bold">-</span>
                                <span className="text-3xl font-black text-slate-400">{score.opponent}</span>
                            </div>

                            {/* Opponent Team */}
                            <div className={`p-2 rounded-lg border transition-all ${activeTeamId === 'opponent' ? 'bg-gold/10 border-gold/40 shadow-lg' : 'bg-slate-900/50 border-white/5'}`}>
                                {liveOpponentTeam.crestImage ? <img src={liveOpponentTeam.crestImage} className="w-10 h-10 object-contain" alt="Logo Rival" /> : <div className="w-10 h-10 flex items-center justify-center text-slate-500 font-black italic">??</div>}
                            </div>
                            <div className="flex flex-col items-start">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Rival</span>
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-black border uppercase tracking-tighter ${activeTeamId === 'opponent' ? 'bg-gold/20 text-gold border-gold/40 shadow-[0_0_8px_rgba(212,175,55,0.2)]' : 'bg-slate-800 text-slate-500 border-white/5'}`}>
                                        {activeTeamId === 'opponent' ? 'ACTIVO' : 'PATEADOR'}
                                    </span>
                                </div>
                                <span className="text-xl font-black text-slate-500 uppercase truncate max-w-[150px]">{liveOpponentTeam.name}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Team Toggle (Plantilla View) */}
                        <div className="flex bg-black/40 rounded-xl p-1 border border-white/5 ring-1 ring-white/5">
                            <button onClick={() => setRosterViewId('home')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${rosterViewId === 'home' ? 'bg-primary text-midnight shadow-lg' : 'text-slate-500 hover:text-white'}`}>LOCAL</button>
                            <button onClick={() => setRosterViewId('opponent')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${rosterViewId === 'opponent' ? 'bg-primary text-midnight shadow-lg' : 'text-slate-500 hover:text-white'}`}>RIVAL</button>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] uppercase text-slate-500 font-bold">Turno</span>
                            <span className="text-xl font-black italic tabular-nums text-slate-100">{turn} / 8</span>
                        </div>
                        <button onClick={() => setIsMatchSummaryOpen(true)} className="size-10 rounded-full glass flex items-center justify-center hover:bg-gold hover:text-midnight transition-all group">
                             <span className="material-symbols-outlined text-sm group-hover:rotate-90 transition-transform">settings</span>
                        </button>
                    </div>
                </div>

                {/* ── Field Status Pill ── */}
                <div className="flex items-center justify-center -mt-1">
                    <div className="glass-dark px-6 py-1.5 rounded-full flex items-center gap-6 border border-gold/10 shadow-lg text-[10px] font-bold uppercase tracking-wider animate-in slide-in-from-top-4 duration-500">
                        {/* Clima Dinámico */}
                        <button onClick={() => setIsWeatherModalOpen(true)} className={`flex items-center gap-2 transition-colors hover:brightness-125 ${isRainy ? 'text-blue-400' : isSunny ? 'text-amber-400' : isBlizzard ? 'text-slate-200' : 'text-primary'}`}>
                            <span className="material-symbols-outlined text-sm">{isRainy ? 'umbrella' : isSunny ? 'light_mode' : isBlizzard ? 'ac_unit' : 'wb_sunny'}</span>
                            <span>{currentWeather} {isRainy ? '(-1 Recoger)' : isSunny ? '(-1 Pase)' : isBlizzard ? '(-1 Rush)' : ''}</span>
                        </button>
                        <div className="w-px h-3 bg-white/10"></div>
                        {/* Afluencia Dinámica (S3) */}
                        <div className="flex items-center gap-2 text-slate-400">
                            <span className="material-symbols-outlined text-sm">groups</span>
                            <span>Afluencia: <span className="text-diente-orco">{(activeTeam.fanAttendance || 12500).toLocaleString()}</span></span>
                        </div>
                        <div className="w-px h-3 bg-white/10"></div>
                        {/* Recursos S3 (Mago y Sobornos) */}
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 transition-all ${activeTeam.tempWizard ? 'text-purple-400 opacity-100' : 'text-slate-600 opacity-40'}`}>
                                <span className="material-symbols-outlined text-sm">magic_button</span>
                                <span>Mago: {activeTeam.tempWizard ? 'SÍ' : 'NO'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gold">
                                <span className="material-symbols-outlined text-sm tracking-tighter">payments</span>
                                <span>Sobornos: {activeTeam.tempBribes || 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-primary">RR:</span>
                                <div className="flex items-center gap-1.5 font-black">
                                    <span className="text-gold">{liveHomeTeam.liveRerolls}</span>
                                    <span className="text-white/10">|</span>
                                    <span className="text-slate-500">{liveOpponentTeam.liveRerolls}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── 2. CUERPO: GESTIÓN DE PLANTILLA Y DETALLE (THE HUB) ── */}
            <main className="flex-1 flex overflow-hidden p-6 gap-6">
                
                {/* ── Roster de Jugadores (Bento Grid) ── */}
                <section className="flex-1 flex flex-col gap-6 overflow-hidden">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-slate-500 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">view_quilt</span>
                            Panel de Plantilla: <span className="text-diente-orco">{(rosterViewId === 'home' ? liveHomeTeam : liveOpponentTeam).name}</span>
                        </h2>
                        <div className="flex gap-4 text-[10px] font-bold uppercase text-slate-500">
                            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary shadow-lg shadow-primary/40"></span> Listos</span>
                            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-slate-700"></span> Agotados</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 scrollbar-hide pb-4">
                        {(rosterViewId === 'home' ? liveHomeTeam : liveOpponentTeam).players.map((p) => {
                            const isExhausted = ['KO', 'Lesionado', 'Muerto', 'Expulsado'].includes(p.status);
                            const isActivated = p.isActivated;
                            const isSelected = selectedPlayerForAction?.id === p.id;
                            const isStar = p.isStarPlayer;

                            return (
                                <div 
                                    key={p.id}
                                    onClick={() => { setSelectedPlayerForAction(p); setActiveTeamId(rosterViewId); }}
                                    className={`glass-dark p-4 rounded-xl border-l-4 transition-all cursor-pointer group relative overflow-hidden ring-1 ring-white/5
                                        ${isExhausted ? 'opacity-30 border-l-slate-800 grayscale scale-[0.98] pointer-events-none' : isActivated ? 'opacity-40 border-l-slate-500 grayscale-[0.8]' : 'border-l-primary hover:bg-white/5 hover:translate-y-[-2px]'}
                                        ${isSelected ? 'ring-2 ring-gold/50 bg-gold/5 shadow-[0_0_20px_rgba(212,175,55,0.1)]' : ''}
                                        ${p.isDistracted ? 'grayscale bg-white/5 ring-1 ring-red-500/10' : ''}
                                        ${isStar ? 'ring-1 ring-gold/20' : ''}
                                    `}
                                >
                                    <div className="absolute top-1 right-1 flex gap-1">
                                        {isStar && <span className="material-symbols-outlined text-gold text-xs">workspace_premium</span>}
                                        {(p.gainedSkills || []).some(s => ['Coraje de Hierro', 'Iron Resolve', 'Stand Firm', 'Dodge'].includes(s)) && (
                                            <span className="material-symbols-outlined text-blue-400 text-xs animate-pulse">shield</span>
                                        )}
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-black border border-white/10 shadow-inner flex items-center justify-center relative">
                                            <span className="text-xl font-black text-white/5">#{p.id.toString().slice(-2)}</span>
                                            {isActivated && !isExhausted && <div className="absolute inset-0 bg-primary/20 flex items-center justify-center"><span className="material-symbols-outlined text-midnight text-xs font-black">check</span></div>}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[10px] font-bold text-primary">#{p.id.toString().slice(-2)}</span>
                                            <span className="text-sm font-black leading-tight uppercase truncate text-diente-orco">{p.customName}</span>
                                            <span className="text-[9px] font-medium italic uppercase tracking-wider truncate text-slate-500">{p.position}</span>
                                        </div>
                                    </div>
                                    {p.isDistracted && <div className="absolute bottom-2 right-2 text-red-500"><span className="material-symbols-outlined text-sm">psychology_alt</span></div>}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── Panel de Detalle (The Hub) ── */}
                <aside className="w-[380px] flex flex-col gap-6 animate-in fade-in slide-in-from-right-8 duration-700">
                    <div className="glass-dark rounded-2xl p-6 border border-gold/20 shadow-2xl relative h-full flex flex-col">
                        {selectedPlayerForAction ? (
                            <>
                                <div className="absolute top-0 right-0 px-4 py-1 bg-gold text-midnight text-[10px] font-black uppercase rounded-bl-xl tracking-widest shadow-lg">DETALLE HUB</div>
                                
                                <div className="flex flex-col items-center text-center mb-6 pt-6">
                                    <div className={`w-36 h-36 rounded-2xl bg-black border-4 shadow-2xl mb-4 flex items-center justify-center relative overflow-hidden ${selectedPlayerForAction.isDistracted ? 'grayscale border-slate-600' : 'border-gold/30'}`}>
                                        <span className="text-6xl font-black text-white/5">#{selectedPlayerForAction.id.toString().slice(-2)}</span>
                                        {selectedPlayerForAction.isDistracted && <div className="absolute inset-0 bg-white/10 flex items-center justify-center"><span className="material-symbols-outlined text-6xl text-white/40">question_mark</span></div>}
                                    </div>
                                    <h3 className="text-2xl font-black uppercase italic text-diente-orco tracking-tight">{selectedPlayerForAction.customName}</h3>
                                    <p className="text-primary text-[10px] font-black uppercase tracking-[0.4em]">{selectedPlayerForAction.position}</p>
                                </div>

                                {/* Atributos S3 */}
                                <div className="grid grid-cols-5 gap-2 mb-8">
                                    {[
                                        { l: 'MA', v: selectedPlayerForAction.stats.MV, bad: selectedPlayerForAction.hasIndigestion },
                                        { l: 'ST', v: selectedPlayerForAction.stats.FU },
                                        { l: 'AG', v: selectedPlayerForAction.stats.AG + '+', bad: false },
                                        { l: 'PA', v: selectedPlayerForAction.stats.PA === '-' ? '-' : selectedPlayerForAction.stats.PA + '+', bad: false },
                                        { l: 'AV', v: selectedPlayerForAction.stats.AR + '+', bad: selectedPlayerForAction.hasIndigestion }
                                    ].map(attr => (
                                        <div key={attr.l} className="flex flex-col items-center bg-black/40 p-2 rounded-xl border border-white/5 relative">
                                            <span className="text-[9px] font-bold text-slate-500">{attr.l}</span>
                                            <span className={`text-xl font-black ${attr.bad ? 'text-red-500 underline decoration-double' : 'text-gold-gradient'}`}>{attr.v}</span>
                                            {attr.bad && <div className="absolute -top-1 -right-1 bg-red-600 size-4 rounded-full flex items-center justify-center text-[8px] font-black shadow-lg">-1</div>}
                                        </div>
                                    ))}
                                </div>

                                {/* Habilidades Interactivas */}
                                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                                    <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-sm">auto_fix_high</span> CODEX SKILLS
                                    </h4>
                                    <div className="space-y-2">
                                        {[...(selectedPlayerForAction.skillKeys || []), ...(selectedPlayerForAction.gainedSkills || [])].map((s, i) => (
                                            <button key={i} onClick={() => handleSkillClick(s)} className={`w-full flex items-center gap-3 p-3 glass border-white/5 rounded-xl hover:bg-white/10 transition-all text-left group ${selectedPlayerForAction.isDistracted ? 'opacity-30' : ''}`}>
                                                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20"><span className="material-symbols-outlined text-primary text-sm">menu_book</span></div>
                                                <div>
                                                    <p className={`text-[11px] font-black uppercase text-diente-orco ${selectedPlayerForAction.isDistracted ? 'line-through decoration-red-500' : ''}`}>{s}</p>
                                                    <p className="text-[8px] text-slate-600 font-bold tracking-tight uppercase">Click para Detalles</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Toggles S3 & Soborno */}
                                <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => handleUpdatePlayerCondition(selectedPlayerForAction.id, activeTeamId, 'isDistracted')} className={`py-2 rounded-xl border flex flex-col items-center transition-all ${selectedPlayerForAction.isDistracted ? 'bg-red-600 border-red-600 text-midnight' : 'border-red-600/30 text-red-500/60 hover:border-red-600 hover:text-red-600'}`}>
                                            <span className="material-symbols-outlined text-sm">psychology_alt</span>
                                            <span className="text-[8px] font-black uppercase mt-0.5 tracking-tighter">BONE HEAD</span>
                                        </button>
                                        <button onClick={() => handleUpdatePlayerCondition(selectedPlayerForAction.id, activeTeamId, 'hasIndigestion')} className={`py-2 rounded-xl border flex flex-col items-center transition-all ${selectedPlayerForAction.hasIndigestion ? 'bg-amber-500 border-amber-500 text-midnight' : 'border-amber-500/30 text-amber-500/60 hover:border-amber-500 hover:text-amber-500'}`}>
                                            <span className="material-symbols-outlined text-sm">sick</span>
                                            <span className="text-[8px] font-black uppercase mt-0.5 tracking-tighter">INDIGESTIÓN</span>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {activeTeam.tempBribes && rosterViewId === activeTeamId && (
                                            <button onClick={() => handleBribe(activeTeamId)} className="w-full py-2 bg-green-900/40 border border-green-500/30 rounded-xl text-green-400 text-[9px] font-black uppercase hover:bg-green-500 hover:text-midnight transition-all flex items-center justify-center gap-2">
                                                <span className="material-symbols-outlined text-xs">payments</span> SOBORNO
                                            </button>
                                        )}
                                        {activeTeam.tempWizard && rosterViewId === activeTeamId && (
                                            <button onClick={() => handleWizard(activeTeamId)} className="w-full py-2 bg-purple-900/40 border border-purple-500/30 rounded-xl text-purple-400 text-[9px] font-black uppercase hover:bg-purple-500 hover:text-midnight transition-all flex items-center justify-center gap-2">
                                                <span className="material-symbols-outlined text-xs">magic_button</span> MAGO
                                            </button>
                                        )}
                                    </div>

                                    {/* Advertencia de Solitario (Loner) */}
                                    {(selectedPlayerForAction.skillKeys?.includes('Loner') || selectedPlayerForAction.skillKeys?.includes('Solitario')) && (
                                        <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2 animate-pulse">
                                            <span className="material-symbols-outlined text-amber-500 text-sm">warning</span>
                                            <span className="text-[8px] font-black text-amber-500 uppercase leading-none">Riesgo Solitario: Reroll exige 4+</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                                <span className="material-symbols-outlined text-7xl mb-4 animate-bounce">hand_gesture</span>
                                <p className="text-sm font-black uppercase tracking-[0.4em]">Selecciona <br/> una pieza</p>
                            </div>
                        )}
                    </div>
                </aside>
            </main>

            {/* ── 3. EL ACTION DOCK (OPERATIVA) ── */}
            <footer className="w-full glass border-t border-white/10 p-4 flex flex-col gap-4 mt-auto">
                <div className="grid grid-cols-12 gap-4">
                    {/* Acciones PE con Modificadores */}
                    <div className="col-span-12 lg:col-span-5 flex flex-col gap-2">
                        <h3 className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                            <span className="material-symbols-outlined text-sm">stars</span> PUNTOS DE EXPERIENCIA (PE)
                        </h3>
                        <div className="grid grid-cols-5 gap-2">
                            <PEDockButton label="TD" pe="+3" icon="sports_score" onClick={() => handleTriggerAction('TOUCHDOWN')} warning={false} />
                            <PEDockButton label="BAJA" pe="+2" icon="skull" onClick={() => handleTriggerAction('CAS')} warning={false} />
                            <PEDockButton label="PASE" pe="+1" icon="near_me" onClick={() => handleTriggerAction('PASS')} warning={isSunny} />
                            <PEDockButton label="HAND" pe="+1" icon="rocket_launch" onClick={() => handleTriggerAction('HANDOFF')} warning={isRainy} />
                            <PEDockButton label="INT" pe="+2" icon="front_hand" onClick={() => logEvent('INFO', 'Intercepción S3')} warning={isRainy} />
                        </div>
                    </div>

                    {/* Operativa de Turno */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-2">
                        <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                            <span className="material-symbols-outlined text-sm">stadium</span> ACCIONES DE CAMPO (S3)
                        </h3>
                        <div className="grid grid-cols-2 gap-2 h-full">
                            <div className="flex flex-col gap-2">
                                <button onClick={() => logEvent('TURNOVER', 'Manual: Balón fuera.')} className="bg-red-950/40 border border-red-900/50 hover:bg-red-900 text-red-400 py-2 rounded-xl flex items-center justify-center gap-2 transition-all">
                                    <span className="material-symbols-outlined text-sm">cancel</span>
                                    <span className="text-[10px] font-black uppercase tracking-tighter">Turnover</span>
                                </button>
                                <button onClick={() => handleTriggerAction('SECURE_BALL')} className="bg-slate-800/40 border border-white/10 hover:bg-primary hover:text-midnight py-2 rounded-xl flex items-center justify-center gap-2 transition-all group relative">
                                    <span className="material-symbols-outlined text-sm group-hover:scale-110">inventory_2</span>
                                    <span className="text-[10px] font-black uppercase tracking-tighter">Asegurar</span>
                                    {isRainy && <div className="warning-badge">-1</div>}
                                </button>
                            </div>
                            <button onClick={handleNextTurn} className="bg-primary hover:brightness-110 text-midnight py-2 rounded-xl flex flex-col items-center justify-center gap-1 shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02]">
                                <span className="material-symbols-outlined text-2xl font-black">event_repeat</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">Fin Activación</span>
                            </button>
                        </div>
                    </div>

                    {/* El Oráculo */}
                    <div className="col-span-12 lg:col-span-3 flex flex-col gap-2">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-1">EL ORÁCULO</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <OracleButton label="Rush (GFI)" icon="speed" onClick={() => handleTriggerAction('RUSH')} warning={isBlizzard} />
                            <OracleButton label="Concede" icon="flag" onClick={() => setIsConcedeModalOpen(true)} warning={false} />
                            <OracleButton label="Clima" icon="wb_sunny" onClick={() => setIsWeatherModalOpen(true)} warning={false} />
                            <OracleButton label="Reglas" icon="menu_book" onClick={() => setIsSequenceGuideOpen(true)} warning={false} />
                        </div>
                    </div>
                </div>

                {/* ── 5. EL CRONISTA NARRATIVO (DOCK TICKER) ── */}
                <div className="bg-black/80 rounded-xl p-4 border border-gold/20 font-mono text-xs h-32 overflow-hidden relative shadow-2xl flex flex-col backdrop-blur-md">
                    <div className="flex items-center justify-between mb-2 border-b border-white/10 pb-2">
                        <span className="text-gold flex items-center gap-2 font-black tracking-[0.2em]"><span className="size-2 rounded-full bg-gold animate-pulse"></span> CRONISTA</span>
                        <span className="text-slate-500 font-bold">BB-OS LIVE NARRATION</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <GameLog hideHeader />
                    </div>
                </div>
            </footer>

            {/* ── INTERACTIVE OVERLAYS ── */}
            {mode !== 'idle' && (
                <div className="absolute inset-0 z-[100] bg-midnight/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="max-w-xl w-full glass-dark rounded-3xl border-2 border-gold/20 p-8 shadow-2xl relative shadow-[0_0_50px_rgba(212,175,55,0.1)]">
                        <div className="text-center mb-8">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 block">CRONISTA DE NUFFLE</span>
                            <h2 className="text-4xl font-display font-black text-diente-orco italic uppercase tracking-tighter">
                                {mode === 'selecting_objective' && "¿VÍCTIMA DEL DESTINO?"}
                                {mode === 'awaiting_dice' && "SENTENCIA DE DADOS"}
                            </h2>
                        </div>

                        {mode === 'selecting_objective' && (
                            <div className="grid grid-cols-4 gap-4">
                                {idleTeam.players.filter(p => p.status === 'Activo').map(p => (
                                    <button key={p.id} onClick={() => setInteractionState(prev => ({ ...prev, mode: 'awaiting_dice', pending: { ...prev.pending, objectiveId: p.id } }))} className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-gold hover:text-midnight transition-all group scale-100 hover:scale-110 shadow-lg">
                                        <span className="text-2xl font-black mb-1">#{p.id.toString().slice(-2)}</span>
                                        <span className="text-[8px] font-bold uppercase opacity-60 text-center">{p.position}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {mode === 'awaiting_dice' && (
                            <div className="flex flex-col items-center gap-6">
                                <span className="text-gold font-mono text-[9px] uppercase tracking-[0.2em] bg-gold/10 px-3 py-1 rounded-full border border-gold/20">
                                    Contexto: {pending.actionType}
                                </span>

                                <div className="flex flex-wrap justify-center gap-3">
                                    {pending.actionType === 'BLOCK' ? (
                                        ['Calavera', 'Ambos', 'Empuje', 'Zaca!', 'Flecha'].map(d => (
                                            <button key={d} onClick={() => handleDiceResultInternal(d)} className="size-20 rounded-full glass border-white/10 flex flex-col items-center justify-center hover:bg-gold hover:text-midnight transition-all shadow-xl font-black text-[9px] uppercase tracking-tighter group"><span className="material-symbols-outlined text-lg mb-1">casino</span>{d}</button>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center gap-4">
                                            {/* D6 Grid for quick access */}
                                            {['PASS', 'RUSH', 'DODGE', 'HANDOFF', 'SECURE_BALL', 'FOUL', 'REGEN', 'KO_RECOVERY'].includes(pending.actionType || '') ? (
                                                <div className="grid grid-cols-6 gap-3">
                                                    {[1, 2, 3, 4, 5, 6].map(n => (
                                                        <button key={n} onClick={() => handleDiceResultInternal(n)} className="size-16 rounded-2xl glass border-white/10 text-3xl font-black hover:bg-gold hover:text-midnight transition-all shadow-xl">{n}</button>
                                                    ))}
                                                </div>
                                            ) : pending.actionType === 'SCATTER' ? (
                                                <div className="grid grid-cols-4 gap-3">
                                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                                        <button key={n} onClick={() => handleDiceResultInternal(n)} className="size-16 rounded-2xl glass border-white/10 text-3xl font-black hover:bg-gold hover:text-midnight transition-all shadow-xl">{n}</button>
                                                    ))}
                                                </div>
                                            ) : pending.actionType === 'FANS' ? (
                                                <div className="grid grid-cols-3 gap-3">
                                                    {[1, 2, 3].map(n => (
                                                        <button key={n} onClick={() => handleDiceResultInternal(n)} className="size-20 rounded-2xl glass border-white/10 text-4xl font-black hover:bg-gold hover:text-midnight transition-all shadow-xl">{n}</button>
                                                    ))}
                                                </div>
                                            ) : ['CAS', 'INJURY', 'CHARACTERISTIC'].includes(pending.actionType || '') ? (
                                                <div className="grid grid-cols-4 gap-2">
                                                    {Array.from({length: 16}, (_, i) => i + 1).map(n => (
                                                        <button key={n} onClick={() => handleDiceResultInternal(n)} className="size-12 rounded-xl glass border-white/10 text-xl font-black hover:bg-gold hover:text-midnight transition-all shadow-lg">{n}</button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <input 
                                                        type="number" 
                                                        placeholder="Resultado"
                                                        value={manualRollVal}
                                                        onChange={(e) => setManualRollVal(e.target.value)}
                                                        className="w-32 bg-black/60 border border-gold/30 rounded-xl px-4 py-3 text-center text-2xl font-black text-white focus:outline-none focus:border-gold"
                                                    />
                                                    <button 
                                                        onClick={() => manualRollVal && handleDiceResultInternal(Number(manualRollVal))}
                                                        className="h-14 bg-gold text-midnight px-8 rounded-xl font-black uppercase tracking-widest text-xs"
                                                    >
                                                        Confirmar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => handleDiceResultInternal(undefined)} className="w-full py-4 bg-primary text-midnight font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                                    <span className="material-symbols-outlined">casino</span> Lanzar Dados Digitales
                                </button>
                            </div>
                        )}

                        <button onClick={() => setInteractionState({ mode: 'idle', pending: { actorId: null, actionType: null, objectiveId: null, diceResult: null, manualMode: true } })} className="mt-8 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all block mx-auto">&larr; ABORTAR SECUENCIA</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── SUB-COMPONENTES DE SOPORTE ─────────────────────────────────────

const PEDockButton: React.FC<{ label: string, pe: string, icon: string, onClick: () => void, warning: boolean }> = ({ label, pe, icon, onClick, warning }) => (
    <button onClick={onClick} className="btn-pe flex flex-col items-center justify-center py-2.5 rounded-xl transition-all group relative overflow-hidden active:scale-95">
        <span className="material-symbols-outlined text-midnight text-xl group-hover:scale-110 transition-transform">{icon}</span>
        <span className="text-[9px] font-black text-midnight uppercase mt-1 leading-none">{label}</span>
        <span className="text-[8px] font-bold text-midnight/40">{pe} PE</span>
        {warning && <div className="warning-badge shadow-lg">-1</div>}
    </button>
);

const OracleButton: React.FC<{ label: string, icon: string, onClick: () => void, warning?: boolean }> = ({ label, icon, onClick, warning }) => (
    <button onClick={onClick} className="glass border-white/10 hover:border-gold/40 flex items-center gap-2 px-3 py-2 rounded-xl transition-all group relative active:scale-95">
        <span className="material-symbols-outlined text-gold text-sm group-hover:rotate-12 transition-transform">{icon}</span>
        <span className="text-[9px] font-bold text-slate-400 group-hover:text-diente-orco uppercase leading-tight text-left">{label}</span>
        {warning && <div className="warning-badge shadow-lg">-1</div>}
    </button>
);

export default MatchInProgress;
