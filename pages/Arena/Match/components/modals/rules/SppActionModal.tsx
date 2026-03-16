import React from 'react';
import { useMatch } from '../../../context/MatchContext';
import ShieldCheckIcon from '../../../../../../components/icons/ShieldCheckIcon';
import { SppActionType } from '../../../../../../types';

const SppActionModal: React.FC = () => {
    const {
        sppModalState,
        setSppModalState,
        liveHomeTeam,
        liveOpponentTeam,
        updatePlayerSppAndAction
    } = useMatch();

    if (!sppModalState.isOpen || !liveHomeTeam || !liveOpponentTeam) return null;

    const onClose = () => setSppModalState({ isOpen: false, type: null, step: 'select_team', teamId: null, selectedPlayer: null });

    const renderContent = () => {
        switch (sppModalState.step) {
            case 'select_team':
                return (
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest mb-4">¿Qué estandarte reclama el honor?</h3>
                        <button onClick={() => setSppModalState(p => ({ ...p, step: 'select_player', teamId: 'home' }))} className="w-full group flex items-center gap-4 text-left bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-sky-500/50 hover:bg-sky-500/10 transition-all">
                            <div className="w-12 h-12 bg-black/40 rounded-xl border border-white/5 flex items-center justify-center overflow-hidden">
                                {liveHomeTeam.crestImage ? <img src={liveHomeTeam.crestImage} alt="Escudo" className="w-full h-full object-cover" /> : <ShieldCheckIcon className="w-6 h-6 text-slate-700" />}
                            </div>
                            <span className="font-display font-bold text-base text-white group-hover:text-sky-400 transition-colors uppercase italic">{liveHomeTeam.name}</span>
                        </button>
                        <button onClick={() => setSppModalState(p => ({ ...p, step: 'select_player', teamId: 'opponent' }))} className="w-full group flex items-center gap-4 text-left bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-red-500/50 hover:bg-red-500/10 transition-all">
                            <div className="w-12 h-12 bg-black/40 rounded-xl border border-white/5 flex items-center justify-center overflow-hidden">
                                {liveOpponentTeam.crestImage ? <img src={liveOpponentTeam.crestImage} alt="Escudo" className="w-full h-full object-cover" /> : <ShieldCheckIcon className="w-6 h-6 text-slate-700" />}
                            </div>
                            <span className="font-display font-bold text-base text-white group-hover:text-red-400 transition-colors uppercase italic">{liveOpponentTeam.name}</span>
                        </button>
                    </div>
                );
            case 'select_player': {
                const team = sppModalState.teamId === 'home' ? liveHomeTeam : liveOpponentTeam;
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest">Héroe de la jugada</h3>
                            <button onClick={() => setSppModalState(p => ({ ...p, step: 'select_team' }))} className="text-[9px] font-display font-black text-premium-gold uppercase">&larr; Volver</button>
                        </div>
                        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                            {team.players.filter(p => p.status === 'Activo').map(p => (
                                <button key={p.id} onClick={() => {
                                    if (sppModalState.type === 'interference') setSppModalState(s => ({ ...s, selectedPlayer: p, step: 'interference_type' }));
                                    else {
                                        let points = 2; // Default for Casualty/Int
                                        if (sppModalState.type === 'pass' || sppModalState.type === 'deflect' || sppModalState.type === 'throw_team_mate') points = 1;
                                        updatePlayerSppAndAction(p, sppModalState.teamId!, points, sppModalState.type!.toUpperCase() as SppActionType, sppModalState.type!);
                                    }
                                }} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-premium-gold/50 hover:bg-premium-gold/5 transition-all group">
                                    <div className="text-left">
                                        <p className="text-sm font-display font-bold text-white group-hover:text-premium-gold transition-colors">{p.customName}</p>
                                        <p className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest">{p.position}</p>
                                    </div>
                                    <span className="text-xs font-display font-black text-premium-gold/30">#{p.id.toString().slice(-2)}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            }
            case 'interference_type':
                return (
                    <div className="space-y-6 text-center">
                        <h3 className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest">Magnitud de la Interferencia</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => updatePlayerSppAndAction(sppModalState.selectedPlayer!, sppModalState.teamId!, 2, 'INTERFERENCE' as SppActionType, 'interferencia exitosa')} className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl hover:bg-green-500 hover:text-black transition-all group">
                                <p className="text-2xl font-display font-black italic mb-1 transition-colors">ÉXITO</p>
                                <p className="text-[10px] font-display font-bold uppercase tracking-widest opacity-60">2 PE Ganados</p>
                            </button>
                            <button onClick={() => updatePlayerSppAndAction(sppModalState.selectedPlayer!, sppModalState.teamId!, 1, 'INTERFERENCE' as SppActionType, 'interferencia fallida')} className="bg-blood-red/10 border border-blood-red/20 p-6 rounded-2xl hover:bg-blood-red hover:text-white transition-all group">
                                <p className="text-2xl font-display font-black italic mb-1 transition-colors">FALLO</p>
                                <p className="text-[10px] font-display font-bold uppercase tracking-widest opacity-60">1 PE Ganado</p>
                            </button>
                        </div>
                        <button onClick={() => setSppModalState(p => ({ ...p, step: 'select_player' }))} className="text-[9px] font-display font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Regresar a selección</button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[250] p-4" onClick={onClose}>
            <div className="glass-panel max-w-md w-full border-premium-gold/30 bg-black shadow-[0_0_100px_rgba(245,159,10,0.1)] overflow-hidden animate-slide-in-up" onClick={e => e.stopPropagation()}>
                <div className="bg-premium-gold/10 p-6 border-b border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-premium-gold/20 rounded-xl flex items-center justify-center border border-premium-gold/30">
                        <span className="material-symbols-outlined text-premium-gold text-2xl">
                            {sppModalState.type === 'pass' ? 'forward' : sppModalState.type === 'interference' ? 'block' : 'personal_injury'}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter">Mérito de Guerra</h2>
                        <p className="text-[10px] font-display font-bold text-premium-gold uppercase tracking-widest">
                            {sppModalState.type === 'pass' ? 'Pase de Precisión' : 
                             sppModalState.type === 'interference' ? 'Interferencia' : 
                             sppModalState.type === 'deflect' ? 'Desvío de Pase' :
                             sppModalState.type === 'throw_team_mate' ? '¡Volar Compañero!' :
                             'Baja Causada'}
                        </p>
                    </div>
                </div>
                <div className="p-6">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default SppActionModal;


