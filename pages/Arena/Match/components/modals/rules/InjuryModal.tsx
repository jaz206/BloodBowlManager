import React from 'react';
import { useMatch } from '../../../context/MatchContext';
import { PlayerButton, DoubleDiceInputStep, RollInputStep } from '../shared/ModalHelpers';
import { initialInjuryState } from '../../../hooks/useMatchState';

const InjuryModal: React.FC = () => {
    const {
        isInjuryModalOpen,
        setIsInjuryModalOpen,
        injuryState,
        setInjuryState,
        liveHomeTeam,
        liveOpponentTeam,
        handleInjuryAction,
        setLiveHomeTeam,
        setLiveOpponentTeam,
        playSound
    } = useMatch();

    if (!isInjuryModalOpen) return null;

    const onClose = () => {
        setIsInjuryModalOpen(false);
        setInjuryState(initialInjuryState);
    };

    if (!liveHomeTeam || !liveOpponentTeam) return null;

    const renderContent = () => {
        switch (injuryState.step) {
            case 'select_casualty_type':
                return (
                    <div className="space-y-6">
                        <h3 className="text-xs font-display font-black text-slate-500 uppercase tracking-widest text-center">¿Cuál es el origen de la baja?</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <button 
                                onClick={() => setInjuryState(prev => ({ ...prev, isCasualty: true, step: 'select_attacker_team' }))}
                                className="group flex items-center gap-6 p-6 bg-white/5 border border-white/5 rounded-[2rem] hover:border-premium-gold/50 hover:bg-premium-gold/5 transition-all text-left"
                            >
                                <div className="w-16 h-16 bg-premium-gold/10 rounded-2xl flex items-center justify-center border border-premium-gold/20 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-premium-gold text-3xl">sports_kabaddi</span>
                                </div>
                                <div>
                                    <p className="text-xl font-display font-black text-white italic uppercase">Baja en Combate</p>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Causada por un Jugador (Otorga 2 PE)</p>
                                </div>
                            </button>
                            <button 
                                onClick={() => setInjuryState(prev => ({ ...prev, isCasualty: false, step: 'select_victim_team' }))}
                                className="group flex items-center gap-6 p-6 bg-white/5 border border-white/5 rounded-[2rem] hover:border-sky-500/50 hover:bg-sky-500/5 transition-all text-left"
                            >
                                <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center border border-sky-500/20 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-sky-500 text-3xl">psychology_alt</span>
                                </div>
                                <div>
                                    <p className="text-xl font-display font-black text-white italic uppercase">Baja Accidental</p>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Esquivas fallidas, terreno o público</p>
                                </div>
                            </button>
                        </div>
                    </div>
                );
            case 'select_attacker_team':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-display font-black text-slate-500 uppercase tracking-widest">¿Quién reclama el honor?</h3>
                            <button onClick={() => setInjuryState(prev => ({ ...prev, step: 'select_casualty_type' }))} className="text-[9px] font-display font-bold text-premium-gold uppercase tracking-widest">&larr; Volver</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setInjuryState(prev => ({ ...prev, attackerTeamId: 'home', step: 'select_attacker' }))} className="bg-white/5 border border-white/5 p-6 rounded-3xl hover:border-sky-500/50 hover:bg-sky-500/10 transition-all group">
                                <span className="text-xs font-display font-black text-sky-500 uppercase tracking-widest block mb-1 opacity-50">Local</span>
                                <p className="text-lg font-display font-black text-white group-hover:text-sky-400 transition-colors uppercase italic">{liveHomeTeam.name}</p>
                            </button>
                            <button onClick={() => setInjuryState(prev => ({ ...prev, attackerTeamId: 'opponent', step: 'select_attacker' }))} className="bg-white/5 border border-white/5 p-6 rounded-3xl hover:border-red-500/50 hover:bg-red-500/10 transition-all group">
                                <span className="text-xs font-display font-black text-red-500 uppercase tracking-widest block mb-1 opacity-50">Rival</span>
                                <p className="text-lg font-display font-black text-white group-hover:text-red-400 transition-colors uppercase italic">{liveOpponentTeam.name}</p>
                            </button>
                        </div>
                    </div>
                );
            case 'select_attacker': {
                const team = injuryState.attackerTeamId === 'home' ? liveHomeTeam : liveOpponentTeam;
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-display font-black text-slate-500 uppercase tracking-widest">El Verdugo</h3>
                            <button onClick={() => setInjuryState(prev => ({ ...prev, step: 'select_attacker_team' }))} className="text-[9px] font-display font-bold text-premium-gold uppercase tracking-widest">&larr; Volver</button>
                        </div>
                        <div className="max-h-[40vh] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {team.players.map(p => <PlayerButton key={p.id} player={p} onSelect={player => setInjuryState(prev => ({ ...prev, attackerPlayer: player, step: 'select_victim_team' }))} />)}
                        </div>
                    </div>
                );
            }
            case 'select_victim_team':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-display font-black text-slate-500 uppercase tracking-widest">¿Quién ha caído?</h3>
                            <button onClick={() => setInjuryState(prev => ({ ...prev, step: injuryState.isCasualty ? 'select_attacker' : 'select_casualty_type' }))} className="text-[9px] font-display font-bold text-premium-gold uppercase tracking-widest">&larr; Volver</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setInjuryState(prev => ({ ...prev, victimTeamId: 'home', step: 'select_victim' }))} className="bg-white/5 border border-white/5 p-6 rounded-3xl hover:border-sky-500/50 hover:bg-sky-500/10 transition-all group">
                                <span className="text-xs font-display font-black text-sky-500 uppercase tracking-widest block mb-1 opacity-50">Local</span>
                                <p className="text-lg font-display font-black text-white group-hover:text-sky-400 transition-colors uppercase italic">{liveHomeTeam.name}</p>
                            </button>
                            <button onClick={() => setInjuryState(prev => ({ ...prev, victimTeamId: 'opponent', step: 'select_victim' }))} className="bg-white/5 border border-white/5 p-6 rounded-3xl hover:border-red-500/50 hover:bg-red-500/10 transition-all group">
                                <span className="text-xs font-display font-black text-red-500 uppercase tracking-widest block mb-1 opacity-50">Rival</span>
                                <p className="text-lg font-display font-black text-white group-hover:text-red-400 transition-colors uppercase italic">{liveOpponentTeam.name}</p>
                            </button>
                        </div>
                    </div>
                );
            case 'select_victim': {
                const team = injuryState.victimTeamId === 'home' ? liveHomeTeam : liveOpponentTeam;
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-display font-black text-slate-500 uppercase tracking-widest">La Víctima en Suelo</h3>
                            <button onClick={() => setInjuryState(prev => ({ ...prev, step: 'select_victim_team' }))} className="text-[9px] font-display font-bold text-premium-gold uppercase tracking-widest">&larr; Volver</button>
                        </div>
                        <div className="max-h-[40vh] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {team.players.map(p => <PlayerButton key={p.id} player={p} onSelect={player => setInjuryState(prev => ({ ...prev, victimPlayer: player, isStunty: player.skillKeys?.includes('Stunty') || (player as any).skills?.includes('Escurridizo'), step: 'armor_roll' }))} />)}
                        </div>
                    </div>
                );
            }
            case 'armor_roll':
                return <DoubleDiceInputStep title="Tirada de Armadura" value={injuryState.armorRollInput} onChange={v => setInjuryState(prev => ({ ...prev, armorRollInput: v }))} onNext={() => handleInjuryAction('next')} onBack={() => handleInjuryAction('back')} label={`2D6 contra AR ${injuryState.victimPlayer?.stats.AR}`} onPlaySound={() => playSound('dice')} />;
            case 'injury_roll':
                return <DoubleDiceInputStep title="Tirada de Heridas" value={injuryState.injuryRollInput} onChange={v => setInjuryState(prev => ({ ...prev, injuryRollInput: v }))} onNext={() => handleInjuryAction('next')} onBack={() => handleInjuryAction('back')} label={`Introduce 2D6${injuryState.isStunty ? ' (Tabla Escurridizo)' : ''}`} onPlaySound={() => playSound('dice')} />;
            case 'casualty_roll':
                return <RollInputStep title="Tirada de Lesión" value={injuryState.casualtyRollInput} onChange={v => setInjuryState(prev => ({ ...prev, casualtyRollInput: v }))} onNext={() => handleInjuryAction('next')} onBack={() => handleInjuryAction('back')} label="Introduce el D16 de la agonía" pattern="([1-9]|1[0-6])" placeholder="1-16" onPlaySound={() => playSound('dice')} />;
            case 'lasting_injury_roll':
                return <RollInputStep title="Lesión Permanente" value={injuryState.lastingInjuryRollInput} onChange={v => setInjuryState(prev => ({ ...prev, lastingInjuryRollInput: v }))} onNext={() => handleInjuryAction('next')} onBack={() => handleInjuryAction('back')} label="Introduce D6 del destino" pattern="[1-6]" placeholder="1-6" onPlaySound={() => playSound('dice')} />;
            case 'regeneration_check':
                return (
                    <div className="text-center py-6 space-y-6">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30 mx-auto animate-premium-pulse">
                            <span className="material-symbols-outlined text-4xl text-emerald-400">restart_alt</span>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-display font-black text-white uppercase italic tracking-tighter">Comprobar Regeneración</h3>
                            <p className="text-slate-400 text-sm italic">"Los dioses pueden conceder una secundaria oportunidad."</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                            <p className="text-[10px] font-display font-black uppercase tracking-[0.2em] text-slate-500">Siguiente paso</p>
                            <p className="mt-1 text-sm font-display font-black uppercase italic text-white">Tirada de regeneración 4+</p>
                        </div>
                        <button onClick={() => handleInjuryAction('next')} className="w-full bg-emerald-600 text-white font-display font-black py-4 rounded-2xl shadow-xl hover:bg-emerald-500 transition-all uppercase tracking-[0.2em] text-xs">Ir a la tirada</button>
                    </div>
                );
            case 'regeneration_roll':
                return <RollInputStep title="Tirada de Regeneración" value={injuryState.regenerationRollInput} onChange={v => setInjuryState(prev => ({ ...prev, regenerationRollInput: v }))} onNext={() => handleInjuryAction('next')} onBack={() => handleInjuryAction('back')} label="Introduce D6 (4+ Éxito)" pattern="[1-6]" placeholder="1-6" onPlaySound={() => playSound('dice')} />;
            case 'staff_reroll_choice': {
                const victimTeam = injuryState.victimTeamId === 'home' ? liveHomeTeam : liveOpponentTeam;
                const staffType = victimTeam?.mortuaryAssistants ? 'Asistente de Necromantes' : 'Médico de la Peste';
                return (
                    <div className="space-y-8 text-center animate-fade-in">
                        <div className="w-20 h-20 bg-blood-red/10 rounded-full flex items-center justify-center border border-blood-red/30 mx-auto animate-pulse">
                            <span className="material-symbols-outlined text-4xl text-blood-red">warning</span>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-display font-black text-white uppercase italic tracking-tighter">¡Regeneración Fallida!</h3>
                            <p className="text-slate-400 text-sm">¿Deseas que tu {staffType} intente recomponer los restos? (4+ Éxito)</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => {
                                const setTeam = injuryState.victimTeamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
                                setTeam(prev => prev ? ({ ...prev, mortuaryAssistants: prev.mortuaryAssistants ? prev.mortuaryAssistants - 1 : 0, plagueDoctors: prev.plagueDoctors ? prev.plagueDoctors - 1 : 0 }) : null);
                                setInjuryState(prev => ({ ...prev, step: 'regeneration_roll', regenerationRollInput: '' }));
                            }} className="flex-1 bg-emerald-600 text-white font-display font-black py-4 rounded-2xl hover:bg-emerald-500 transition-all uppercase tracking-widest text-[10px]">Usar {staffType}</button>
                            <button onClick={() => handleInjuryAction('next')} className="flex-1 bg-white/5 border border-white/10 text-slate-500 font-display font-black py-4 rounded-2xl hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest text-[10px]">Dejar Morir</button>
                        </div>
                    </div>
                );
            }
            case 'summary':
                return (
                    <div className="space-y-8 animate-fade-in text-center">
                        <div className="space-y-4">
                            <div className="text-center">
                                <p className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest mb-1">Víctima Registrada</p>
                                <p className="text-xl font-display font-black text-white italic truncate uppercase">{injuryState.victimPlayer?.customName}</p>
                            </div>
                            {injuryState.isCasualty && injuryState.attackerPlayer && (
                                <div className="text-center">
                                    <p className="text-[10px] font-display font-black text-premium-gold uppercase tracking-widest mb-1">Honor Reclamado por</p>
                                    <p className="text-lg font-display font-black text-white italic truncate uppercase">{injuryState.attackerPlayer.customName}</p>
                                </div>
                            )}
                            <div className="glass-panel p-6 bg-black/60 border-white/5 space-y-2 mt-6 max-h-[200px] overflow-y-auto">
                                {injuryState.log?.map((l, i) => <p key={i} className="text-xs text-slate-400 font-display italic">"{l}"</p>)}
                            </div>
                        </div>
                        <button onClick={() => handleInjuryAction('next')} className="w-full bg-premium-gold text-black font-display font-black py-4 rounded-2xl shadow-xl hover:bg-white transition-all uppercase tracking-[0.2em] text-xs">Sellar Parte médico</button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[300] p-4" onClick={onClose}>
            <div className="glass-panel max-w-lg w-full border-premium-gold/30 bg-black shadow-[0_0_100px_rgba(245,159,10,0.1)] overflow-hidden animate-slide-in-up" onClick={e => e.stopPropagation()}>
                <div className="bg-premium-gold/10 p-6 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-premium-gold/20 rounded-xl flex items-center justify-center border border-premium-gold/30">
                            <span className="material-symbols-outlined text-premium-gold text-2xl">healing</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter">Santuario de Heridas</h2>
                            <p className="text-[10px] font-display font-bold text-premium-gold uppercase tracking-widest">Asistente de Lesión</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-premium-gold/20 text-slate-500 hover:text-premium-gold transition-all flex items-center justify-center border border-white/5">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="p-8">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default InjuryModal;


