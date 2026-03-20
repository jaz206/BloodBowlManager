import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type {
    Competition,
    CompetitionTeam,
    MatchInjuryOutcome,
    MatchPlayerResult,
    MatchResolution,
    Matchup,
} from '../../types';
import { lastingInjuryResults } from '../../data/lastingInjuries';

type TeamDraft = {
    score: number;
    mvpPlayerId: number | null;
    players: MatchPlayerResult[];
};

interface CompetitionMatchResolutionModalProps {
    competition: Competition;
    roundIndex: string;
    matchIndex: number;
    matchup: Matchup;
    onClose: () => void;
    onSubmit: (resolution: MatchResolution) => void;
}

const emptyPlayerResult = (playerId: number, playerName: string): MatchPlayerResult => ({
    playerId,
    playerName,
    td: 0,
    cas: 0,
    passes: 0,
    interceptions: 0,
    mvp: false,
    injury: 'none',
    permanentInjury: '',
});

const buildDraft = (team: CompetitionTeam, existing?: MatchResolution['team1'] | MatchResolution['team2']): TeamDraft => {
    const rosterPlayers = team.teamState?.players || [];
    const playerResults = rosterPlayers.map(p => {
        const existingPlayer = existing?.players.find(ep => ep.playerId === p.id);
        return existingPlayer || emptyPlayerResult(p.id, p.customName);
    });

    return {
        score: existing?.score ?? 0,
        mvpPlayerId: existing?.mvpPlayerId ?? null,
        players: playerResults,
    };
};

const getPlayerLabel = (playerName: string, position?: string) => position ? `${playerName} · ${position}` : playerName;

const getInjuryOptions = () => lastingInjuryResults.map(item => item.permanentInjury);

const CompetitionMatchResolutionModal: React.FC<CompetitionMatchResolutionModalProps> = ({
    competition,
    roundIndex,
    matchIndex,
    matchup,
    onClose,
    onSubmit,
}) => {
    const team1 = competition.teams.find(t => t.teamName === matchup.team1);
    const team2 = competition.teams.find(t => t.teamName === matchup.team2);

    const existingResolution = matchup.resolution;

    const [team1Draft, setTeam1Draft] = useState<TeamDraft>(() => buildDraft(team1 || {
        teamName: matchup.team1,
        ownerId: '',
        ownerName: '',
    }, existingResolution?.team1));
    const [team2Draft, setTeam2Draft] = useState<TeamDraft>(() => buildDraft(team2 || {
        teamName: matchup.team2,
        ownerId: '',
        ownerName: '',
    }, existingResolution?.team2));
    const [notes, setNotes] = useState(existingResolution?.notes || '');
    const [winnerTeam, setWinnerTeam] = useState<string>(
        existingResolution
            ? (existingResolution.team1.score > existingResolution.team2.score ? existingResolution.team1.teamName : existingResolution.team2.teamName)
            : (competition.format === 'Torneo' ? matchup.team1 : '')
    );

    useEffect(() => {
        setTeam1Draft(buildDraft(team1 || { teamName: matchup.team1, ownerId: '', ownerName: '' }, existingResolution?.team1));
        setTeam2Draft(buildDraft(team2 || { teamName: matchup.team2, ownerId: '', ownerName: '' }, existingResolution?.team2));
        setNotes(existingResolution?.notes || '');
        setWinnerTeam(
            existingResolution
                ? (existingResolution.team1.score > existingResolution.team2.score ? existingResolution.team1.teamName : existingResolution.team2.teamName)
                : (competition.format === 'Torneo' ? matchup.team1 : '')
        );
    }, [competition, matchup, team1, team2, existingResolution]);

    const maxInjuryOptions = useMemo(() => getInjuryOptions(), []);

    const updatePlayer = (team: 1 | 2, playerId: number, updater: (player: MatchPlayerResult) => MatchPlayerResult) => {
        if (team === 1) {
            setTeam1Draft(prev => ({
                ...prev,
                players: prev.players.map(p => p.playerId === playerId ? updater(p) : p),
            }));
        } else {
            setTeam2Draft(prev => ({
                ...prev,
                players: prev.players.map(p => p.playerId === playerId ? updater(p) : p),
            }));
        }
    };

    const setTeamMvp = (team: 1 | 2, playerId: number) => {
        if (team === 1) {
            setTeam1Draft(prev => ({
                ...prev,
                mvpPlayerId: playerId,
                players: prev.players.map(p => ({ ...p, mvp: p.playerId === playerId })),
            }));
        } else {
            setTeam2Draft(prev => ({
                ...prev,
                mvpPlayerId: playerId,
                players: prev.players.map(p => ({ ...p, mvp: p.playerId === playerId })),
            }));
        }
    };

    const calcTeamSPP = (player: MatchPlayerResult) => (
        (player.td || 0) * 3 +
        (player.cas || 0) * 2 +
        (player.passes || 0) +
        (player.interceptions || 0) * 2 +
        (player.mvp ? 4 : 0)
    );

    const handleSubmit = () => {
        if (competition.format === 'Torneo' && team1Draft.score === team2Draft.score && !winnerTeam) {
            return;
        }

        const resolution: MatchResolution = {
            submittedBy: '',
            submittedAt: new Date().toISOString(),
            notes,
            winnerTeam: winnerTeam || undefined,
            team1: {
                teamName: team1?.teamName || matchup.team1,
                ownerId: team1?.ownerId || '',
                ownerName: team1?.ownerName || '',
                score: team1Draft.score,
                mvpPlayerId: team1Draft.mvpPlayerId,
                players: team1Draft.players,
            },
            team2: {
                teamName: team2?.teamName || matchup.team2,
                ownerId: team2?.ownerId || '',
                ownerName: team2?.ownerName || '',
                score: team2Draft.score,
                mvpPlayerId: team2Draft.mvpPlayerId,
                players: team2Draft.players,
            },
        };

        onSubmit(resolution);
    };

    const renderTeam = (teamDraft: TeamDraft, team: CompetitionTeam | undefined, label: string, teamIndex: 1 | 2) => {
        const ownerLabel = team?.ownerName || 'Sin dueño';
        const rosterName = team?.teamState?.rosterName || 'Plantilla';

        return (
            <div className="bg-black/30 border border-white/5 rounded-[2rem] p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.25em] italic">{label}</p>
                        <h4 className="text-2xl font-black text-white uppercase italic tracking-tight truncate">{teamDraft === team1Draft ? matchup.team1 : matchup.team2}</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{ownerLabel} · {rosterName}</p>
                    </div>
                    <div className="w-24">
                        <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">TDs</label>
                        <input
                            type="number"
                            min={0}
                            value={teamDraft.score}
                            onChange={e => {
                                const val = Math.max(0, Number(e.target.value) || 0);
                                teamIndex === 1 ? setTeam1Draft(prev => ({ ...prev, score: val })) : setTeam2Draft(prev => ({ ...prev, score: val }));
                            }}
                            className="w-full bg-black/60 border border-white/10 rounded-xl py-3 text-center text-white font-black text-lg"
                        />
                    </div>
                </div>

                <div className="border-t border-white/5 pt-4 space-y-3 max-h-[48vh] overflow-y-auto pr-1">
                    {teamDraft.players.length === 0 ? (
                        <p className="text-slate-500 text-[10px] uppercase italic tracking-widest text-center py-6">Sin jugadores registrados en este clon</p>
                    ) : (
                        teamDraft.players.map(player => (
                            <div key={player.playerId} className="rounded-2xl border border-white/5 bg-black/20 p-3 space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-white font-black uppercase italic text-sm truncate">{getPlayerLabel(player.playerName, undefined)}</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">#{player.playerId}</p>
                                    </div>
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={`mvp-${teamIndex}`}
                                            checked={player.mvp}
                                            onChange={() => setTeamMvp(teamIndex, player.playerId)}
                                            className="accent-amber-500"
                                        />
                                        MVP
                                    </label>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {[
                                        { key: 'td', label: 'TD' },
                                        { key: 'cas', label: 'CAS' },
                                        { key: 'passes', label: 'PASS' },
                                        { key: 'interceptions', label: 'INT' },
                                    ].map(field => (
                                        <div key={field.key}>
                                            <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">{field.label}</label>
                                            <input
                                                type="number"
                                                min={0}
                                                value={(player as any)[field.key]}
                                                onChange={e => updatePlayer(teamIndex, player.playerId, current => ({
                                                    ...current,
                                                    [field.key]: Math.max(0, Number(e.target.value) || 0),
                                                }))}
                                                className="w-full bg-black/60 border border-white/10 rounded-xl py-2 text-center text-white font-black"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Resultado físico</label>
                                        <select
                                            value={player.injury}
                                            onChange={e => updatePlayer(teamIndex, player.playerId, current => ({
                                                ...current,
                                                injury: e.target.value as MatchInjuryOutcome,
                                            }))}
                                            className="w-full bg-black/60 border border-white/10 rounded-xl py-2 px-3 text-white font-bold text-sm"
                                        >
                                            <option value="none">Sin efecto</option>
                                            <option value="stunned">Aturdido</option>
                                            <option value="ko">KO</option>
                                            <option value="mng">Se pierde el siguiente</option>
                                            <option value="casualty">Herida</option>
                                            <option value="death">Muerto</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Lesión permanente</label>
                                        <select
                                            value={player.permanentInjury || ''}
                                            onChange={e => updatePlayer(teamIndex, player.playerId, current => ({
                                                ...current,
                                                permanentInjury: e.target.value,
                                            }))}
                                            disabled={player.injury !== 'casualty' && player.injury !== 'death'}
                                            className="w-full bg-black/60 border border-white/10 rounded-xl py-2 px-3 text-white font-bold text-sm disabled:opacity-40"
                                        >
                                            <option value="">Sin lesión permanente</option>
                                            {maxInjuryOptions.map(option => <option key={option} value={option}>{option}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-500">SPP ganados</span>
                                    <span className="text-primary">{calcTeamSPP(player)} PE</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 20 }}
                className="w-full max-w-7xl max-h-[92vh] overflow-hidden bg-zinc-950 border border-primary/20 rounded-[2.5rem] shadow-2xl flex flex-col"
            >
                <div className="p-6 sm:p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">Acta de partido</p>
                        <h3 className="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tighter">
                            {matchup.team1} <span className="text-primary">vs</span> {matchup.team2}
                        </h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                            Jornada {Number.isNaN(Number(roundIndex)) ? roundIndex : Number(roundIndex) + 1} · {competition.format}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-12 rounded-2xl border border-white/10 text-slate-400 hover:text-white hover:border-primary/30 transition-all flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {renderTeam(team1Draft, team1, 'Equipo local', 1)}
                        {renderTeam(team2Draft, team2, 'Equipo visitante', 2)}
                    </div>

                    {competition.format === 'Torneo' && (
                        <div className="bg-black/30 border border-white/5 rounded-[2rem] p-5">
                            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">
                                Ganador del cruce
                            </label>
                            <select
                                value={winnerTeam}
                                onChange={e => setWinnerTeam(e.target.value)}
                                className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-3 text-white font-bold text-sm"
                            >
                                <option value="">Selecciona ganador</option>
                                <option value={matchup.team1}>{matchup.team1}</option>
                                <option value={matchup.team2}>{matchup.team2}</option>
                            </select>
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-2 italic">
                                En torneos, este campo define la siguiente ronda aunque el marcador acabe en empate.
                            </p>
                        </div>
                    )}

                    <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-5">
                        <label className="block text-[9px] font-black text-primary uppercase tracking-widest mb-2">Notas del encuentro</label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={4}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white outline-none resize-none"
                            placeholder="Incidencias, condiciones del clima, acuerdo entre coaches..."
                        />
                    </div>
                </div>

                <div className="p-4 sm:p-6 border-t border-white/5 bg-black/30 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 rounded-2xl border border-white/10 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 py-4 rounded-2xl bg-primary text-black font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/10"
                    >
                        Guardar Acta
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default CompetitionMatchResolutionModal;
