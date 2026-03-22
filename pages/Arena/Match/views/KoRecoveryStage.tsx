import React, { useMemo } from 'react';
import { useMatch } from '../context/MatchContext';

type TeamSide = 'home' | 'opponent';

const hasSecretWeapon = (player: any) => {
    const skillsBlob = [
        player?.skills,
        ...(player?.skillKeys || []),
        ...(player?.gainedSkills || [])
    ].join(' ').toLowerCase();

    return skillsBlob.includes('secret weapon') || skillsBlob.includes('arma secreta');
};

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

const SecretWeaponPanel: React.FC<{
    team: any;
    teamId: TeamSide;
    players: any[];
    onSendOff: (teamId: TeamSide, playerId: number) => void;
    onBribe: (teamId: TeamSide, playerId: number) => void;
}> = ({ team, teamId, players, onSendOff, onBribe }) => {
    if (!players.length) return null;

    return (
        <div className="rounded-[1.75rem] border border-amber-500/20 bg-amber-500/5 p-5 space-y-4">
            <div className="flex items-center justify-between gap-4 border-b border-amber-500/10 pb-3">
                <div>
                    <p className="text-[10px] font-display font-black uppercase tracking-[0.32em] text-amber-300/70">Armas secretas</p>
                    <h3 className="text-xl font-display font-black uppercase italic text-white">{team.name}</h3>
                </div>
                <div className="rounded-xl border border-amber-500/20 bg-black/30 px-3 py-2 text-right">
                    <p className="text-[9px] font-display font-black uppercase tracking-[0.22em] text-slate-500">Sobornos</p>
                    <p className="text-lg font-display font-black italic text-amber-300">{team.tempBribes || 0}</p>
                </div>
            </div>

            <div className="space-y-3">
                {players.map((player) => (
                    <div key={player.id} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-display font-black uppercase italic text-white">{player.customName}</p>
                            <p className="text-[10px] font-display font-black uppercase tracking-[0.24em] text-slate-500">{player.position} · arma secreta</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => onSendOff(teamId, player.id)}
                                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-[10px] font-display font-black uppercase tracking-[0.24em] text-red-300 transition-all hover:bg-red-500/20"
                            >
                                Expulsar
                            </button>
                            <button
                                onClick={() => onBribe(teamId, player.id)}
                                disabled={(team.tempBribes || 0) <= 0}
                                className="rounded-xl border border-premium-gold/30 bg-premium-gold/10 px-4 py-2 text-[10px] font-display font-black uppercase tracking-[0.24em] text-premium-gold transition-all hover:bg-premium-gold/20 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Usar soborno
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const KoRecoveryStage: React.FC = () => {
    const {
        driveResetTarget,
        liveHomeTeam,
        liveOpponentTeam,
        koRecoveryRolls,
        rollKoRecovery,
        handleStartNextDrive,
        setLiveHomeTeam,
        setLiveOpponentTeam,
        logEvent,
        playSound
    } = useMatch();

    if (!liveHomeTeam || !liveOpponentTeam) return <div>Cargando...</div>;

    const homeKOs = liveHomeTeam.players.filter(p => p.status === 'KO');
    const oppKOs = liveOpponentTeam.players.filter(p => p.status === 'KO');
    const homeSecretWeapons = useMemo(
        () => liveHomeTeam.players.filter((player) => player.status === 'Activo' && hasSecretWeapon(player)),
        [liveHomeTeam.players]
    );
    const oppSecretWeapons = useMemo(
        () => liveOpponentTeam.players.filter((player) => player.status === 'Activo' && hasSecretWeapon(player)),
        [liveOpponentTeam.players]
    );
    const pendingSecretWeapons = homeSecretWeapons.length + oppSecretWeapons.length;
    const shouldShowKoRecovery = driveResetTarget !== 'post_game';

    const updateTeamPlayer = (teamId: TeamSide, playerId: number, updater: (player: any) => any) => {
        const setTeam = teamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        setTeam((prev: any) => prev ? ({
            ...prev,
            players: prev.players.map((player: any) => player.id === playerId ? updater(player) : player)
        }) : prev);
    };

    const handleSendOff = (teamId: TeamSide, playerId: number) => {
        const team = teamId === 'home' ? liveHomeTeam : liveOpponentTeam;
        const player = team.players.find((item: any) => item.id === playerId);
        if (!player) return;

        updateTeamPlayer(teamId, playerId, (current) => ({
            ...current,
            status: 'Expulsado',
            statusDetail: 'Arma Secreta'
        }));
        logEvent('EXPULSION', `${player.customName} abandona el campo por Arma Secreta al final del drive.`, { team: teamId, player: player.id });
    };

    const handleSecretWeaponBribe = (teamId: TeamSide, playerId: number) => {
        const team = teamId === 'home' ? liveHomeTeam : liveOpponentTeam;
        const setTeam = teamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        const player = team.players.find((item: any) => item.id === playerId);
        if (!player || (team.tempBribes || 0) <= 0) return;

        const roll = Math.floor(Math.random() * 6) + 1;
        const success = roll >= 2;

        setTeam((prev: any) => prev ? ({
            ...prev,
            tempBribes: Math.max(0, (prev.tempBribes || 0) - 1),
            players: prev.players.map((current: any) => {
                if (current.id !== playerId) return current;
                return success
                    ? { ...current, status: 'Reserva', statusDetail: 'Salvado por soborno' }
                    : { ...current, status: 'Expulsado', statusDetail: 'Arma Secreta' };
            })
        }) : prev);

        if (success) {
            playSound('dice');
            logEvent('bribe_used', `Soborno aceptado (${roll}). ${player.customName} evita la expulsion y vuelve a reservas.`, { team: teamId, player: player.id, result: 'success' });
        } else {
            playSound('turnover');
            logEvent('EXPULSION', `Soborno fallido (${roll}). ${player.customName} es expulsado por Arma Secreta.`, { team: teamId, player: player.id, result: 'fail' });
        }
    };

    const stageCopy = {
        next_drive: {
            eyebrow: 'Fin de drive',
            title: 'Recuperacion y reinicio',
            description: 'El touchdown ya esta registrado. Resolvemos KO y cierres de banquillo antes del siguiente drive.',
            cta: 'Preparar siguiente drive',
            summary: '1. Recuperar KO  2. Resolver armas secretas  3. Despliegue express  4. Kickoff'
        },
        halftime: {
            eyebrow: 'Descanso',
            title: 'Cierre de primera parte',
            description: 'Resolvemos la salida de este drive y dejamos preparada la segunda parte sin volver al prepartido completo.',
            cta: 'Preparar segunda parte',
            summary: '1. Recuperar KO  2. Resolver armas secretas  3. Despliegue express  4. Kickoff de la segunda parte'
        },
        post_game: {
            eyebrow: 'Cierre final',
            title: 'Ultimo cierre del partido',
            description: 'No hay un nuevo drive. Solo resolvemos armas secretas pendientes y saltamos directo al postpartido.',
            cta: 'Ir al postpartido',
            summary: '1. Resolver armas secretas  2. Cerrar el partido  3. Ir al acta final'
        }
    } as const;

    const copy = stageCopy[driveResetTarget || 'next_drive'];

    return (
        <div className="max-w-6xl mx-auto py-8 animate-fade-in">
            <div className="glass-panel border-white/5 bg-black/40 p-8 shadow-2xl space-y-8">
                <div className="rounded-[2rem] border border-premium-gold/20 bg-premium-gold/5 px-6 py-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-[10px] font-display font-black uppercase tracking-[0.38em] text-premium-gold/70">{copy.eyebrow}</p>
                            <h2 className="text-4xl font-display font-black text-white uppercase italic tracking-tighter">{copy.title}</h2>
                            <p className="max-w-3xl text-sm text-slate-400">{copy.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                            <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                                <p className="text-[9px] font-display font-black uppercase tracking-[0.25em] text-slate-500">KO local</p>
                                <p className="text-2xl font-display font-black italic text-sky-300">{homeKOs.length}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                                <p className="text-[9px] font-display font-black uppercase tracking-[0.25em] text-slate-500">KO rival</p>
                                <p className="text-2xl font-display font-black italic text-red-300">{oppKOs.length}</p>
                            </div>
                            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 col-span-2 lg:col-span-1">
                                <p className="text-[9px] font-display font-black uppercase tracking-[0.25em] text-slate-500">Armas secretas</p>
                                <p className="text-2xl font-display font-black italic text-amber-300">{pendingSecretWeapons}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {shouldShowKoRecovery && (
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
                )}

                {(homeSecretWeapons.length > 0 || oppSecretWeapons.length > 0) && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <SecretWeaponPanel
                            team={liveHomeTeam}
                            teamId="home"
                            players={homeSecretWeapons}
                            onSendOff={handleSendOff}
                            onBribe={handleSecretWeaponBribe}
                        />
                        <SecretWeaponPanel
                            team={liveOpponentTeam}
                            teamId="opponent"
                            players={oppSecretWeapons}
                            onSendOff={handleSendOff}
                            onBribe={handleSecretWeaponBribe}
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 border-t border-white/5 pt-8 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div className="rounded-[1.5rem] border border-white/10 bg-black/25 px-5 py-4">
                        <p className="text-[9px] font-display font-black uppercase tracking-[0.25em] text-slate-500">Siguiente secuencia</p>
                        <p className="mt-2 text-sm font-display font-black uppercase italic text-white">{copy.summary}</p>
                        <p className="mt-2 text-xs text-slate-500">
                            {pendingSecretWeapons > 0
                                ? 'Antes de continuar hay que resolver todas las armas secretas pendientes.'
                                : 'Todo listo para seguir con el siguiente paso del partido.'}
                        </p>
                    </div>
                    <button
                        onClick={handleStartNextDrive}
                        disabled={pendingSecretWeapons > 0}
                        className="group relative overflow-hidden bg-premium-gold text-black font-display font-black py-4 px-12 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest italic disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        {copy.cta}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KoRecoveryStage;
