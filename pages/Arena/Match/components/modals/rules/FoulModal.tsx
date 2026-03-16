import React from 'react';
import { useMatch } from '../../../context/MatchContext';
import { PlayerButton, DoubleDiceInputStep, RollInputStep } from '../shared/ModalHelpers';
import { initialFoulState } from '../../../hooks/useMatchState';

const FoulModal: React.FC = () => {
    const {
        isFoulModalOpen,
        setIsFoulModalOpen,
        foulState,
        setFoulState,
        liveHomeTeam,
        liveOpponentTeam,
        handleFoulAction,
        playSound
    } = useMatch();

    if (!isFoulModalOpen) return null;

    const onClose = () => {
        setIsFoulModalOpen(false);
        setFoulState(initialFoulState);
    };

    if (!liveHomeTeam || !liveOpponentTeam) return null;

    const renderContent = () => {
        switch (foulState.step) {
            case 'select_fouler_team':
                return (
                    <div className="space-y-6">
                        <h3 className="text-xs font-display font-black text-slate-500 uppercase tracking-widest">¿Quién inicia la agresión?</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setFoulState(prev => ({ ...prev, foulingTeamId: 'home', step: 'select_fouler' }))} className="bg-white/5 border border-white/5 p-6 rounded-3xl hover:border-sky-500/50 hover:bg-sky-500/10 transition-all group">
                                <span className="text-xs font-display font-black text-sky-500 uppercase tracking-widest block mb-2 opacity-50">Local</span>
                                <p className="text-lg font-display font-black text-white group-hover:text-sky-400 transition-colors uppercase italic">{liveHomeTeam.name}</p>
                            </button>
                            <button onClick={() => setFoulState(prev => ({ ...prev, foulingTeamId: 'opponent', step: 'select_fouler' }))} className="bg-white/5 border border-white/5 p-6 rounded-3xl hover:border-red-500/50 hover:bg-red-500/10 transition-all group">
                                <span className="text-xs font-display font-black text-red-500 uppercase tracking-widest block mb-1 opacity-50">Rival</span>
                                <p className="text-lg font-display font-black text-white group-hover:text-red-400 transition-colors uppercase italic">{liveOpponentTeam.name}</p>
                            </button>
                        </div>
                    </div>
                );
            case 'select_fouler': {
                const team = foulState.foulingTeamId === 'home' ? liveHomeTeam : liveOpponentTeam;
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-display font-black text-slate-500 uppercase tracking-widest">El Infractor</h3>
                            <button onClick={() => setFoulState(prev => ({ ...prev, step: 'select_fouler_team' }))} className="text-[9px] font-display font-bold text-blood-red uppercase tracking-widest">&larr; Volver</button>
                        </div>
                        <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {team.players.filter(p => p.status === 'Activo').map(p => <PlayerButton key={p.id} player={p} onSelect={player => setFoulState(prev => ({ ...prev, foulingPlayer: player, step: 'select_victim' }))} />)}
                        </div>
                    </div>
                );
            }
            case 'select_victim': {
                const team = foulState.foulingTeamId === 'home' ? liveOpponentTeam : liveHomeTeam;
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-display font-black text-slate-500 uppercase tracking-widest">La Víctima</h3>
                            <button onClick={() => setFoulState(prev => ({ ...prev, step: 'select_fouler' }))} className="text-[9px] font-display font-bold text-blood-red uppercase tracking-widest">&larr; Volver</button>
                        </div>
                        <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {team.players.map(p => <PlayerButton key={p.id} player={p} onSelect={player => setFoulState(prev => ({ ...prev, victimPlayer: player, step: 'armor_roll' }))} />)}
                        </div>
                    </div>
                );
            }
            case 'armor_roll':
                return <DoubleDiceInputStep title="Tirada de Armadura" value={foulState.armorRollInput} onChange={v => setFoulState(prev => ({ ...prev, armorRollInput: v }))} onNext={() => handleFoulAction('next')} onBack={() => handleFoulAction('back')} label={`2D6 contra AR ${foulState.victimPlayer?.stats.AR}`} onPlaySound={() => playSound('dice')} />;
            case 'injury_roll':
                return <DoubleDiceInputStep title="Tirada de Heridas" value={foulState.injuryRollInput} onChange={v => setFoulState(prev => ({ ...prev, injuryRollInput: v }))} onNext={() => handleFoulAction('next')} onBack={() => handleFoulAction('back')} label="Introduce el golpe final (2D6)" onPlaySound={() => playSound('dice')} />;
            case 'casualty_roll':
                return <RollInputStep title="Tirada de Lesión" value={foulState.casualtyRollInput} onChange={v => setFoulState(prev => ({ ...prev, casualtyRollInput: v }))} onNext={() => handleFoulAction('next')} onBack={() => handleFoulAction('back')} label="Introduce el D16 de la agonía" pattern="([1-9]|1[0-6])" placeholder="1-16" onPlaySound={() => playSound('dice')} />;
            case 'lasting_injury_roll':
                return <RollInputStep title="Lesión Permanente" value={foulState.lastingInjuryRollInput} onChange={v => setFoulState(prev => ({ ...prev, lastingInjuryRollInput: v }))} onNext={() => handleFoulAction('next')} onBack={() => handleFoulAction('back')} label="Introduce D6 del destino" pattern="[1-6]" placeholder="1-6" onPlaySound={() => playSound('dice')} />;
            case 'summary':
                return (
                    <div className="space-y-8 animate-fade-in text-center">
                        <div className="space-y-4">
                            <div className="flex items-center justify-center gap-6">
                                <div className="text-center">
                                    <p className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest mb-1">Culpable</p>
                                    <p className="text-lg font-display font-black text-white italic truncate w-32">{foulState.foulingPlayer?.customName}</p>
                                </div>
                                <span className="material-symbols-outlined text-blood-red text-2xl">swords</span>
                                <div className="text-center">
                                    <p className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest mb-1">Víctima</p>
                                    <p className="text-lg font-display font-black text-white italic truncate w-32">{foulState.victimPlayer?.customName}</p>
                                </div>
                            </div>
                            <div className="glass-panel p-6 bg-black/60 border-white/5 space-y-2 mt-6">
                                {foulState.log?.map((l, i) => <p key={i} className="text-xs text-slate-400 font-display italic">"{l}"</p>)}
                                {foulState.wasExpelled && (
                                    <div className="mt-4 pt-4 border-t border-white/5">
                                        <div className="flex items-center justify-center gap-2 text-blood-red">
                                            <span className="material-symbols-outlined text-xl">person_remove</span>
                                            <p className="font-display font-black text-sm uppercase tracking-widest">{foulState.expulsionReason || '¡EXPULSADO!'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button onClick={() => handleFoulAction('next')} className="w-full bg-blood-red text-white font-display font-black py-4 rounded-2xl shadow-xl hover:bg-red-600 transition-all uppercase tracking-[0.2em] text-xs">Cerrar Crónica</button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[300] p-4" onClick={onClose}>
            <div className="glass-panel max-w-lg w-full border-blood-red/30 bg-black shadow-[0_0_100px_rgba(185,28,28,0.1)] overflow-hidden animate-slide-in-up" onClick={e => e.stopPropagation()}>
                <div className="bg-blood-red/10 p-6 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blood-red/20 rounded-xl flex items-center justify-center border border-blood-red/30">
                            <span className="material-symbols-outlined text-blood-red text-2xl">gavel</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter">Juicio de Sangre</h2>
                            <p className="text-[10px] font-display font-bold text-blood-red uppercase tracking-widest">Asistente de Falta</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-blood-red/20 text-slate-500 hover:text-blood-red transition-all flex items-center justify-center border border-white/5">
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

export default FoulModal;


