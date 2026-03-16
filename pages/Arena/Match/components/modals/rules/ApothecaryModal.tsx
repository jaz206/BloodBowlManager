import React from 'react';
import { useMatch } from '../../../context/MatchContext';

/**
 * ApothecaryModal — New refactored version using MatchContext.
 * Encapulates all the complex logic previously passed via props in MatchPage.tsx.
 */
const ApothecaryModal: React.FC = () => {
    const {
        isApothecaryModalOpen,
        setIsApothecaryModalOpen,
        injuryState,
        setInjuryState,
        liveHomeTeam,
        liveOpponentTeam,
        setLiveHomeTeam,
        setLiveOpponentTeam,
        updatePlayerStatus
    } = useMatch();

    if (!isApothecaryModalOpen || !injuryState.victimPlayer) return null;

    const { victimPlayer, victimTeamId } = injuryState;
    const team = victimTeamId === 'home' ? liveHomeTeam : liveOpponentTeam;
    const hasUsedOnKO = team?.apothecaryUsedOnKO || false;

    const onClose = () => {
        setIsApothecaryModalOpen(false);
        setInjuryState(prev => ({ ...prev, step: 'regeneration_check' }));
    };

    const handlePatchUp = () => {
        setIsApothecaryModalOpen(false);
        const setTeam = victimTeamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        
        setTeam(prev => prev ? ({ ...prev, apothecaryUsedOnKO: true }) : null);
        updatePlayerStatus(victimPlayer.id, victimTeamId!, 'Activo', 'Recuperado por Boticario');
        
        setInjuryState(prev => ({ 
            ...prev, 
            step: 'summary', 
            log: [...prev.log, 'Boticario lo recupera (KO -> Reservas).'] 
        }));
    };

    const handleReroll = () => {
        setIsApothecaryModalOpen(false);
        const setTeam = victimTeamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        
        if (team?.apothecary) {
            setTeam(prev => prev ? ({ ...prev, apothecary: false }) : null);
        } else if (team?.wanderingApothecaries && team.wanderingApothecaries > 0) {
            setTeam(prev => prev ? ({ ...prev, wanderingApothecaries: team.wanderingApothecaries - 1 }) : null);
        }

        if (injuryState.casualtyRoll) {
            setInjuryState(prev => ({ 
                ...prev, 
                step: 'casualty_roll', 
                casualtyRollInput: '', 
                log: [...prev.log, 'Boticario repite tirada de lesión.'], 
                casualtyRoll: { ...prev.casualtyRoll!, rerolled: true } 
            }));
        } else {
            setInjuryState(prev => ({ 
                ...prev, 
                step: 'injury_roll', 
                injuryRollInput: { die1: '', die2: '' }, 
                log: [...prev.log, 'Boticario repite tirada de herida.'] 
            }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[300] p-4" onClick={onClose}>
            <div className="glass-panel max-w-md w-full transform animate-slide-in-up border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-white/5 bg-white/5">
                    <h2 className="text-2xl font-display font-black text-white italic uppercase tracking-tighter">Usar Boticario</h2>
                    <p className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest mt-1">Intervención médica para {victimPlayer.customName}</p>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-white/70 font-display font-medium italic mb-2">Selecciona el procedimiento de emergencia:</p>

                    <button
                        onClick={handleReroll}
                        className="w-full text-left group relative overflow-hidden rounded-xl border border-sky-500/20 bg-sky-500/10 p-5 transition-premium hover:border-sky-400/50 hover:bg-sky-500/20"
                    >
                        <div className="relative z-10">
                            <p className="font-display font-black text-sky-400 uppercase tracking-tighter text-lg italic">Volver a tirar la Lesión</p>
                            <p className="text-[11px] text-sky-300/60 font-medium leading-tight mt-1">Realiza una nueva tirada médica y aplica el segundo resultado obtenido.</p>
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <span className="material-symbols-outlined text-4xl text-sky-400">medical_services</span>
                        </div>
                    </button>

                    <button
                        onClick={handlePatchUp}
                        disabled={hasUsedOnKO}
                        className="w-full text-left group relative overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5 transition-premium hover:border-emerald-400/50 hover:bg-emerald-500/20 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
                    >
                        <div className="relative z-10">
                            <p className="font-display font-black text-emerald-400 uppercase tracking-tighter text-lg italic">Remendar y a jugar</p>
                            <p className="text-[11px] text-emerald-300/60 font-medium leading-tight mt-1">Recupera a un jugador Inconsciente para la zona de Reservas. (Una vez por partido)</p>
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <span className="material-symbols-outlined text-4xl text-emerald-400">healing</span>
                        </div>
                    </button>
                </div>

                <div className="p-4 bg-black/20 border-t border-white/5 flex justify-end">
                    <button
                        onClick={onClose}
                        className="text-[10px] font-display font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-premium py-2 px-6"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApothecaryModal;
