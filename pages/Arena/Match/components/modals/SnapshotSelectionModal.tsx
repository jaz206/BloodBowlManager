import React from 'react';
import { useMatch } from '../../context/MatchContext';
import { ManagedTeam, ManagedTeamSnapshot, ManagedPlayer, PlayerStatus } from '../../../../../types';

const SnapshotSelectionModal: React.FC = () => {
    const {
        selectingSnapshotFor,
        setSelectingSnapshotFor,
        setHomeTeam,
        setOpponentTeam
    } = useMatch();

    if (!selectingSnapshotFor) return null;

    const { team, side } = selectingSnapshotFor;

    const onClose = () => setSelectingSnapshotFor(null);

    const handleSelect = (snapshot: ManagedTeamSnapshot | 'current') => {
        let finalTeamState: ManagedTeam;
        if (snapshot === 'current') {
            finalTeamState = team;
        } else {
            // We reconstruct the team using the snapshot's state
            // But we preserve the original object's non-state properties if any (like snapshots array)
            finalTeamState = { 
                ...snapshot.teamState, 
                snapshots: team.snapshots 
            } as ManagedTeam;
        }

        if (side === 'home') {
            setHomeTeam(finalTeamState);
        } else {
            const fullPlayers: ManagedPlayer[] = finalTeamState.players.map(p => ({ 
                ...p, 
                status: 'Reserva' as PlayerStatus 
            }));
            setOpponentTeam({ ...finalTeamState, players: fullPlayers });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[600] p-4" onClick={onClose}>
            <div className="glass-panel max-w-lg w-full p-8 border-sky-500/30 bg-black/60 animate-bounce-in" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter">Seleccionar <span className="text-sky-400">Estado</span></h3>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Modo Amistoso: Elige una versión del equipo</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 text-slate-500 hover:text-white flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>

                <div className="space-y-3">
                    <button 
                        onClick={() => handleSelect('current')}
                        className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-sky-500/50 hover:bg-sky-500/5 transition-all group"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-display font-black text-white uppercase group-hover:text-sky-400">Estado Actual</p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">El roster tal como está ahora</p>
                            </div>
                            <span className="material-symbols-outlined text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity">radio_button_checked</span>
                        </div>
                    </button>

                    <div className="pt-4 border-t border-white/5">
                        <p className="text-[9px] font-display font-black text-slate-600 uppercase tracking-widest mb-3">Snapshots Disponibles</p>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {team.snapshots?.map(snapshot => (
                                <button 
                                    key={snapshot.id}
                                    onClick={() => handleSelect(snapshot)}
                                    className="w-full text-left p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-sky-500/30 hover:bg-sky-500/5 transition-all group"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-display font-black text-white uppercase italic">Snapshot {new Date(snapshot.timestamp).toLocaleDateString()}</p>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                                Versión guardada el {new Date(snapshot.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <span className="material-symbols-outlined text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity">restore</span>
                                    </div>
                                </button>
                            ))}
                            {(!team.snapshots || team.snapshots.length === 0) && (
                                <p className="text-[10px] text-slate-600 italic text-center py-4">No hay versiones anteriores guardadas</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SnapshotSelectionModal;
