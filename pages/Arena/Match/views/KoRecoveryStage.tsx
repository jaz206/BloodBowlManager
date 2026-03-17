import React from 'react';
import { useMatch } from '../context/MatchContext';
import { DiceRollButton } from '../components/MatchUIComponents';

/**
 * KoRecoveryStage — gestiona la recuperación de jugadores inconscientes (KO).
 */
const KoRecoveryStage: React.FC = () => {
    const {
        liveHomeTeam,
        liveOpponentTeam,
        koRecoveryRolls,
        rollKoRecovery,
        handleStartNextDrive
    } = useMatch();

    if (!liveHomeTeam || !liveOpponentTeam) return <div>Cargando...</div>;

    const homeKOs = liveHomeTeam.players.filter(p => p.status === 'KO');
    const oppKOs = liveOpponentTeam.players.filter(p => p.status === 'KO');

    return (
        <div className="max-w-4xl mx-auto py-10 animate-fade-in">
            <div className="glass-panel border-white/5 bg-black/40 p-8 shadow-2xl space-y-8">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-display font-black text-premium-gold uppercase italic tracking-tighter">Recuperación de Inconscientes</h2>
                    <p className="text-slate-400 text-sm max-w-lg mx-auto italic">
                        "Tira 1D6 por cada jugador KO. Con 4+, se recupera y vuelve al banquillo para la siguiente patada."
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Home Team KOs */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 border-b border-sky-500/20 pb-3">
                            {liveHomeTeam.crestImage && <img src={liveHomeTeam.crestImage} className="w-8 h-8 rounded-full object-cover" />}
                            <h3 className="text-lg font-display font-black text-sky-400 uppercase italic">{liveHomeTeam.name}</h3>
                        </div>
                        <div className="space-y-2">
                            {homeKOs.length > 0 ? homeKOs.map(p => (
                                <div key={p.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                    <span className="text-sm font-display font-bold text-white uppercase">{p.customName}</span>
                                    {koRecoveryRolls[p.id] ? (
                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${koRecoveryRolls[p.id].success ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                                            <span className="text-xs font-black">Tirada: {koRecoveryRolls[p.id].roll}</span>
                                            <span className="material-symbols-outlined text-sm">{koRecoveryRolls[p.id].success ? 'check_circle' : 'cancel'}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" min="1" max="6" placeholder="D6"
                                                className="w-12 bg-black/60 border border-white/10 rounded-lg px-1 py-1 text-center text-xs font-black text-white focus:border-premium-gold outline-none"
                                                id={`ko-manual-${p.id}`}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const val = (e.target as HTMLInputElement).value;
                                                        if (val) rollKoRecovery(p, Number(val));
                                                    }
                                                }}
                                            />
                                            <button 
                                                onClick={() => {
                                                    const input = document.getElementById(`ko-manual-${p.id}`) as HTMLInputElement;
                                                    rollKoRecovery(p, input?.value ? Number(input.value) : undefined);
                                                }} 
                                                className="bg-premium-gold text-black font-display font-black py-1.5 px-3 rounded-xl text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-lg active:scale-95"
                                            >
                                                OK
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )) : (
                                <div className="py-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                                    <p className="text-[10px] font-display font-bold text-slate-600 uppercase tracking-widest">Sin jugadores KO</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Opponent Team KOs */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 border-b border-red-500/20 pb-3 text-right justify-end">
                            <h3 className="text-lg font-display font-black text-red-400 uppercase italic">{liveOpponentTeam.name}</h3>
                            {liveOpponentTeam.crestImage && <img src={liveOpponentTeam.crestImage} className="w-8 h-8 rounded-full object-cover" />}
                        </div>
                        <div className="space-y-2">
                            {oppKOs.length > 0 ? oppKOs.map(p => (
                                <div key={p.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                    <span className="text-sm font-display font-bold text-white uppercase">{p.customName}</span>
                                    {koRecoveryRolls[p.id] ? (
                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${koRecoveryRolls[p.id].success ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                                            <span className="text-xs font-black">Tirada: {koRecoveryRolls[p.id].roll}</span>
                                            <span className="material-symbols-outlined text-sm">{koRecoveryRolls[p.id].success ? 'check_circle' : 'cancel'}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" min="1" max="6" placeholder="D6"
                                                className="w-12 bg-black/60 border border-white/10 rounded-lg px-1 py-1 text-center text-xs font-black text-white focus:border-premium-gold outline-none"
                                                id={`ko-manual-${p.id}`}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const val = (e.target as HTMLInputElement).value;
                                                        if (val) rollKoRecovery(p, Number(val));
                                                    }
                                                }}
                                            />
                                            <button 
                                                onClick={() => {
                                                    const input = document.getElementById(`ko-manual-${p.id}`) as HTMLInputElement;
                                                    rollKoRecovery(p, input?.value ? Number(input.value) : undefined);
                                                }} 
                                                className="bg-premium-gold text-black font-display font-black py-1.5 px-3 rounded-xl text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-lg active:scale-95"
                                            >
                                                OK
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )) : (
                                <div className="py-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                                    <p className="text-[10px] font-display font-bold text-slate-600 uppercase tracking-widest">Sin jugadores KO</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex justify-center">
                    <button 
                        onClick={handleStartNextDrive} 
                        className="group relative overflow-hidden bg-premium-gold text-black font-display font-black py-4 px-12 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest italic"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        Continuar al Despliegue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KoRecoveryStage;
