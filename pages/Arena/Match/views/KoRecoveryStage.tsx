import React from 'react';
import { useMatch } from '../context/MatchContext';

const TeamKoColumn: React.FC<{
    team: any;
    players: any[];
    koRecoveryRolls: Record<number, { roll: number; success: boolean } | null>;
    borderTone: string;
    titleTone: string;
    align?: 'left' | 'right';
    rollKoRecovery: (player: any, manualVal?: number) => void;
}> = ({ team, players, koRecoveryRolls, borderTone, titleTone, align = 'left', rollKoRecovery }) => {
    const isRight = align === 'right';

    return (
        <div className="space-y-4">
            <div className={`flex items-center gap-3 border-b ${borderTone} pb-3 ${isRight ? 'justify-end text-right' : ''}`}>
                {!isRight && team.crestImage && <img src={team.crestImage} className="w-8 h-8 rounded-full object-cover" alt={team.name} />}
                <h3 className={`text-lg font-display font-black uppercase italic ${titleTone}`}>{team.name}</h3>
                {isRight && team.crestImage && <img src={team.crestImage} className="w-8 h-8 rounded-full object-cover" alt={team.name} />}
            </div>

            <div className="space-y-2">
                {players.length > 0 ? players.map(player => (
                    <div key={player.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all gap-3">
                        <div className={isRight ? 'text-right ml-auto' : ''}>
                            <span className="text-sm font-display font-bold text-white uppercase block">{player.customName}</span>
                            <span className="text-[10px] font-display font-black uppercase tracking-[0.2em] text-slate-500">{player.position}</span>
                        </div>
                        {koRecoveryRolls[player.id] ? (
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${koRecoveryRolls[player.id]?.success ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                                <span className="text-xs font-black">Tirada: {koRecoveryRolls[player.id]?.roll}</span>
                                <span className="material-symbols-outlined text-sm">{koRecoveryRolls[player.id]?.success ? 'check_circle' : 'cancel'}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 shrink-0">
                                <input
                                    type="number"
                                    min="1"
                                    max="6"
                                    placeholder="D6"
                                    className="w-12 bg-black/60 border border-white/10 rounded-lg px-1 py-1 text-center text-xs font-black text-white focus:border-premium-gold outline-none"
                                    id={`ko-manual-${player.id}`}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const val = (e.target as HTMLInputElement).value;
                                            if (val) rollKoRecovery(player, Number(val));
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        const input = document.getElementById(`ko-manual-${player.id}`) as HTMLInputElement;
                                        rollKoRecovery(player, input?.value ? Number(input.value) : undefined);
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
    );
};

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
        <div className="max-w-6xl mx-auto py-8 animate-fade-in">
            <div className="glass-panel border-white/5 bg-black/40 p-8 shadow-2xl space-y-8">
                <div className="rounded-[2rem] border border-premium-gold/20 bg-premium-gold/5 px-6 py-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-[10px] font-display font-black uppercase tracking-[0.38em] text-premium-gold/70">Fin de drive</p>
                            <h2 className="text-4xl font-display font-black text-white uppercase italic tracking-tighter">Recuperacion y reinicio</h2>
                            <p className="max-w-3xl text-sm text-slate-400">
                                El touchdown ya esta registrado. Ahora resolvemos los KO y pasamos directo al siguiente drive
                                con despliegue express y un nuevo kickoff.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                                <p className="text-[9px] font-display font-black uppercase tracking-[0.25em] text-slate-500">KO local</p>
                                <p className="text-2xl font-display font-black italic text-sky-300">{homeKOs.length}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                                <p className="text-[9px] font-display font-black uppercase tracking-[0.25em] text-slate-500">KO rival</p>
                                <p className="text-2xl font-display font-black italic text-red-300">{oppKOs.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <TeamKoColumn
                        team={liveHomeTeam}
                        players={homeKOs}
                        koRecoveryRolls={koRecoveryRolls}
                        borderTone="border-sky-500/20"
                        titleTone="text-sky-400"
                        rollKoRecovery={rollKoRecovery}
                    />
                    <TeamKoColumn
                        team={liveOpponentTeam}
                        players={oppKOs}
                        koRecoveryRolls={koRecoveryRolls}
                        borderTone="border-red-500/20"
                        titleTone="text-red-400"
                        align="right"
                        rollKoRecovery={rollKoRecovery}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 border-t border-white/5 pt-8 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div className="rounded-[1.5rem] border border-white/10 bg-black/25 px-5 py-4">
                        <p className="text-[9px] font-display font-black uppercase tracking-[0.25em] text-slate-500">Siguiente secuencia</p>
                        <p className="mt-2 text-sm font-display font-black uppercase italic text-white">1. Recuperar KO  2. Despliegue express  3. Kickoff</p>
                        <p className="mt-2 text-xs text-slate-500">No repetimos clima, FAMA ni moneda. Solo lo necesario para arrancar la siguiente entrada.</p>
                    </div>
                    <button
                        onClick={handleStartNextDrive}
                        className="group relative overflow-hidden bg-premium-gold text-black font-display font-black py-4 px-12 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest italic"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        Preparar siguiente drive
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KoRecoveryStage;
