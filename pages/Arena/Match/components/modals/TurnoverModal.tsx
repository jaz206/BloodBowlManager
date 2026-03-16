import React from 'react';
import { useMatch } from '../../context/MatchContext';

const TurnoverModal: React.FC = () => {
    const {
        isTurnoverModalOpen,
        setIsTurnoverModalOpen,
        handleTurnover,
        playSound
    } = useMatch();

    if (!isTurnoverModalOpen) return null;

    const onClose = () => setIsTurnoverModalOpen(false);

    const turnoverReasons = [
        { id: 'failed_action', label: 'Acción Fallida', icon: 'cancel', desc: 'Un jugador falló una tirada de Agilidad, Pase o Armadura.' },
        { id: 'knocked_down', label: 'Jugador Derribado', icon: 'back_hand', desc: 'Un jugador de tu equipo ha sido derribado.' },
        { id: 'out_of_bounds', label: 'Fuera de Banda', icon: 'output', desc: 'El balón o un jugador han salido de los límites del campo.' },
        { id: 'foul_expulsion', label: 'Expulsión por Falta', icon: 'gavel', desc: 'El árbitro ha pillado a tu jugador cometiendo una falta.' },
        { id: 'touchdown', label: 'Touchdown Anotado', icon: 'sports_football', desc: '¡Has anotado! El turno termina para reorganizar filas.' },
    ];

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[300] p-4" onClick={onClose}>
            <div className="glass-panel max-w-md w-full border-blood-red/30 bg-black shadow-[0_0_80px_rgba(220,38,38,0.15)] overflow-hidden animate-slide-in-up" onClick={e => e.stopPropagation()}>
                <div className="bg-blood-red/10 p-6 border-b border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blood-red/20 rounded-xl flex items-center justify-center border border-blood-red/30">
                        <span className="material-symbols-outlined text-blood-red text-2xl font-black">error</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter">¡TURNOVER!</h2>
                        <p className="text-[10px] font-display font-bold text-blood-red uppercase tracking-widest text-shadow-glow">Nuffle ha dictado sentencia</p>
                    </div>
                </div>
                
                <div className="p-6 space-y-4">
                    <p className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Causa del cambio de turno</p>
                    <div className="grid grid-cols-1 gap-2">
                        {turnoverReasons.map(reason => (
                            <button
                                key={reason.id}
                                onClick={() => {
                                    playSound('turnover');
                                    handleTurnover(reason.label);
                                }}
                                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blood-red/50 hover:bg-blood-red/10 transition-all group text-left"
                            >
                                <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-blood-red transition-colors">
                                    <span className="material-symbols-outlined text-xl">{reason.icon}</span>
                                </div>
                                <div>
                                    <p className="text-[11px] font-display font-black text-white uppercase tracking-wider group-hover:text-blood-red transition-colors">{reason.label}</p>
                                    <p className="text-[9px] text-slate-500 italic mt-0.5 line-clamp-1">{reason.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 bg-black/40 border-t border-white/5 flex justify-center">
                    <button
                        onClick={onClose}
                        className="text-[10px] font-display font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-all py-2"
                    >
                        Descartar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TurnoverModal;
