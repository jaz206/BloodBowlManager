import React from 'react';
import { useMatch } from '../../../context/MatchContext';

const ConcedeModal: React.FC = () => {
    const {
        isConcedeModalOpen,
        setIsConcedeModalOpen,
        liveHomeTeam,
        liveOpponentTeam,
        logEvent,
        setGameState,
        setConcessionState
    } = useMatch();

    if (!isConcedeModalOpen || !liveHomeTeam || !liveOpponentTeam) return null;

    const handleConfirm = (team: 'home' | 'opponent') => {
        const teamName = team === 'home' ? liveHomeTeam.name : liveOpponentTeam.name;
        logEvent('INFO', `${teamName} se rinde.`);
        setConcessionState(team);
        setIsConcedeModalOpen(false);
        setGameState('post_game');
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            setIsConcedeModalOpen(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[300] p-4 animate-fade-in-fast"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
        >
            <div className="glass-panel max-w-md w-full transform animate-slide-in-up border-blood-red/30 overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.2)]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-blood-red/10 bg-blood-red/5">
                    <h2 className="text-4xl font-display font-black text-blood-red italic uppercase tracking-tighter text-center">CONCESIÓN</h2>
                    <p className="text-[10px] font-display font-bold text-red-300/60 uppercase tracking-[0.2em] mt-2 text-center">Un equipo abandona el campo de batalla</p>
                </div>
                <div className="p-8 space-y-6">
                    <p className="text-slate-300 font-display font-medium italic text-center text-sm leading-relaxed">
                        Las reglas de la Temporada 3 (2025) son estrictas. La concesión otorga beneficios adicionales al vencedor y penalizaciones severas al desertor.
                    </p>
                    
                    <div className="grid grid-cols-1 gap-4">
                        <button
                            onClick={() => handleConfirm('home')}
                            className="group bg-blood-red/10 border border-blood-red/20 p-5 rounded-2xl hover:bg-blood-red/20 hover:border-blood-red/40 transition-all text-left"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-[9px] font-display font-black text-blood-red uppercase tracking-widest mb-1">Miedo en mis filas</p>
                                    <p className="text-lg font-display font-black text-white italic uppercase tracking-tighter">{liveHomeTeam.name} Concede</p>
                                </div>
                                <span className="material-symbols-outlined text-blood-red text-2xl group-hover:scale-110 transition-transform">close</span>
                            </div>
                        </button>

                        <button
                            onClick={() => handleConfirm('opponent')}
                            className="group bg-sky-500/10 border border-sky-500/20 p-5 rounded-2xl hover:bg-sky-500/20 hover:border-sky-500/40 transition-all text-left"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-[9px] font-display font-black text-sky-400 uppercase tracking-widest mb-1">Victoria por abandono</p>
                                    <p className="text-lg font-display font-black text-white italic uppercase tracking-tighter">{liveOpponentTeam.name} Concede</p>
                                </div>
                                <span className="material-symbols-outlined text-sky-400 text-2xl group-hover:scale-110 transition-transform">check_circle</span>
                            </div>
                        </button>
                    </div>
                </div>
                
                <div className="p-4 bg-black/40 border-t border-white/5 flex justify-center">
                    <button
                        onClick={() => setIsConcedeModalOpen(false)}
                        className="text-[10px] font-display font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-premium py-2"
                    >
                        &larr; Volver al Partido
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConcedeModal;

