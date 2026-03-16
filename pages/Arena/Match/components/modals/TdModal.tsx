import React from 'react';
import { useMatch } from '../../context/MatchContext';
import TdIcon from '../../../../../components/icons/TdIcon';
import ShieldCheckIcon from '../../../../../components/icons/ShieldCheckIcon';

const TdModal: React.FC = () => {
    const {
        isTdModalOpen,
        setIsTdModalOpen,
        tdModalTeam,
        setTdModalTeam,
        liveHomeTeam,
        liveOpponentTeam,
        handleSelectTdScorer
    } = useMatch();

    if (!isTdModalOpen || !liveHomeTeam || !liveOpponentTeam) return null;

    const onClose = () => {
        setIsTdModalOpen(false);
        setTdModalTeam(null);
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={onClose}>
            <div className="glass-panel max-w-md w-full border-green-500/30 bg-black shadow-[0_0_50px_rgba(0,0,0,1)] overflow-hidden animate-slide-in-up" onClick={e => e.stopPropagation()}>
                <div className="bg-green-500/10 p-6 border-b border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/30">
                        <TdIcon className="w-8 h-8 text-green-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter">¡Gloria Inmortal!</h2>
                        <p className="text-[10px] font-display font-bold text-green-500 uppercase tracking-widest">Touchdown Anotado</p>
                    </div>
                </div>
                {!tdModalTeam ? (
                    <div className="p-6 space-y-4">
                        <h3 className="text-xs font-display font-black text-slate-500 uppercase tracking-[0.2em] mb-4">¿Quién reclama la gloria?</h3>
                        <button onClick={() => setTdModalTeam('home')} className="w-full group flex items-center gap-4 text-left bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-sky-500/50 hover:bg-sky-500/10 transition-all">
                            <div className="w-14 h-14 bg-black/40 rounded-xl border border-white/5 p-1">
                                {liveHomeTeam.crestImage ? <img src={liveHomeTeam.crestImage} alt="Escudo" className="w-full h-full object-cover rounded-lg" /> : <div className="w-full h-full flex items-center justify-center"><ShieldCheckIcon className="w-8 h-8 text-slate-700" /></div>}
                            </div>
                            <div className="flex-grow">
                                <p className="text-xs font-display font-black text-sky-500 uppercase tracking-widest mb-1">Equipo Local</p>
                                <span className="font-display font-bold text-lg text-white group-hover:text-sky-400 transition-colors uppercase italic">{liveHomeTeam.name}</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-700 group-hover:text-sky-500 transition-colors">chevron_right</span>
                        </button>
                        <button onClick={() => setTdModalTeam('opponent')} className="w-full group flex items-center gap-4 text-left bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-red-500/50 hover:bg-red-500/10 transition-all">
                            <div className="w-14 h-14 bg-black/40 rounded-xl border border-white/5 p-1">
                                {liveOpponentTeam.crestImage ? <img src={liveOpponentTeam.crestImage} alt="Escudo" className="w-full h-full object-cover rounded-lg" /> : <div className="w-full h-full flex items-center justify-center"><ShieldCheckIcon className="w-8 h-8 text-slate-700" /></div>}
                            </div>
                            <div className="flex-grow">
                                <p className="text-xs font-display font-black text-red-500 uppercase tracking-widest mb-1">Equipo Rival</p>
                                <span className="font-display font-bold text-lg text-white group-hover:text-red-400 transition-colors uppercase italic">{liveOpponentTeam.name}</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-700 group-hover:text-red-500 transition-colors">chevron_right</span>
                        </button>
                    </div>
                ) : (
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-display font-black text-slate-500 uppercase tracking-[0.2em]">El héroe del momento</h3>
                            <button onClick={() => setTdModalTeam(null)} className="text-[10px] font-display font-bold text-premium-gold uppercase">&larr; Volver</button>
                        </div>
                        <div className="grid grid-cols-1 gap-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                            {(tdModalTeam === 'home' ? liveHomeTeam : liveOpponentTeam).players.filter(p => p.status === 'Activo').map(p => (
                                <button key={p.id} onClick={() => handleSelectTdScorer(p)} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-premium-gold/50 hover:bg-premium-gold/5 transition-all group text-left">
                                    <div>
                                        <p className="text-sm font-display font-bold text-white group-hover:text-premium-gold transition-colors">{p.customName}</p>
                                        <p className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest">{p.position}</p>
                                    </div>
                                    <span className="text-xs font-display font-black text-premium-gold/40 group-hover:text-premium-gold transition-all"># {p.stats.MV}-{p.stats.FU}-{p.stats.AG}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TdModal;
