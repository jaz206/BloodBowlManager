import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ManagedTeam, Competition, Matchup, CompetitionTeam } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import PencilIcon from '../../components/icons/PencilIcon';
import CalendarIcon from '../../components/icons/CalendarIcon';
import QrCodeIcon from '../../components/icons/QrCodeIcon';

declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}
declare const QRCode: any;
declare const Html5Qrcode: any;

const trophyImageUrl = 'https://i.pinimg.com/736x/95/dc/9a/95dc9a37df924d550e9922dbf37b9089.jpg';

const cloneCompetition = (comp: Competition): Competition => {
    const newComp: Competition = {
        id: comp.id,
        name: comp.name,
        format: comp.format,
        teams: comp.teams.map(t => ({ ...t })),
        ownerId: comp.ownerId,
        ownerName: comp.ownerName,
        status: comp.status,
    };
    if (comp.schedule) {
        newComp.schedule = {};
        for (const round in comp.schedule) {
            if (Object.prototype.hasOwnProperty.call(comp.schedule, round)) {
                newComp.schedule[round] = comp.schedule[round].map(matchup => ({ ...matchup }));
            }
        }
    } else {
        newComp.schedule = null;
    }
    if (comp.bracket) {
        newComp.bracket = {};
        for (const round in comp.bracket) {
            if (Object.prototype.hasOwnProperty.call(comp.bracket, round)) {
                newComp.bracket[round] = comp.bracket[round].map(matchup => ({ ...matchup }));
            }
        }
    } else {
        newComp.bracket = null;
    }
    return newComp;
};

const generateSchedule = (teamNames: string[]): Record<string, Matchup[]> => {
    const teams = [...teamNames];
    if (teams.length % 2 !== 0) {
        teams.push('BYE');
    }
    const numTeams = teams.length;
    const rounds: Record<string, Matchup[]> = {};
    const teamIndices = teams.map((_, i) => i);
    for (let r = 0; r < numTeams - 1; r++) {
        const round: Matchup[] = [];
        for (let i = 0; i < numTeams / 2; i++) {
            const team1Index = teamIndices[i];
            const team2Index = teamIndices[numTeams - 1 - i];
            if (teams[team1Index] !== 'BYE' && teams[team2Index] !== 'BYE') {
                round.push({ team1: teams[team1Index], team2: teams[team2Index] });
            }
        }
        rounds[r.toString()] = round;
        const last = teamIndices.pop()!;
        teamIndices.splice(1, 0, last);
    }
    return rounds;
};

const generateBracket = (teamNames: string[]): Record<string, Matchup[]> => {
    const shuffledTeams = [...teamNames].sort(() => 0.5 - Math.random());
    let numTeams = shuffledTeams.length;
    const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(numTeams)));
    const byesToAdd = nextPowerOfTwo - numTeams;
    for (let i = 0; i < byesToAdd; i++) {
        shuffledTeams.push('BYE');
    }
    numTeams = nextPowerOfTwo;
    const bracket: Record<string, Matchup[]> = {};
    const firstRound: Matchup[] = [];
    for (let i = 0; i < numTeams; i += 2) {
        const match: Matchup = { team1: shuffledTeams[i], team2: shuffledTeams[i + 1] || 'BYE' };
        if (match.team1 === 'BYE') match.winner = match.team2;
        if (match.team2 === 'BYE') match.winner = match.team1;
        firstRound.push(match);
    }
    bracket['0'] = firstRound;
    let currentRound = firstRound;
    let roundIndex = 1;
    while (currentRound.length > 1) {
        const nextRound: Matchup[] = [];
        for (let i = 0; i < currentRound.length; i += 2) {
            nextRound.push({
                team1: currentRound[i].winner || 'Por determinar',
                team2: currentRound[i + 1]?.winner || 'Por determinar',
            });
        }
        bracket[roundIndex.toString()] = nextRound;
        currentRound = nextRound;
        roundIndex++;
    }
    return bracket;
};

interface LeaguesProps {
    managedTeams: ManagedTeam[];
    initialCompetitions: Competition[];
    onCompetitionCreate: (comp: Omit<Competition, 'id'>) => void;
    onCompetitionUpdate: (comp: Competition) => void;
    onCompetitionDelete: (id: string) => void;
    isGuest: boolean;
}

export const Leagues: React.FC<LeaguesProps> = ({ managedTeams, initialCompetitions, onCompetitionCreate, onCompetitionUpdate, onCompetitionDelete, isGuest }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'my' | 'join'>('my');
    const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
    const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);

    const [newCompetitionName, setNewCompetitionName] = useState('');
    const [newCompetitionFormat, setNewCompetitionFormat] = useState<'Liguilla' | 'Torneo'>('Liguilla');
    const [joinModalState, setJoinModalState] = useState<{ comp: Competition | null; teamToJoin: string }>({ comp: null, teamToJoin: '' });
    const [scoreModalState, setScoreModalState] = useState<{ isOpen: boolean; roundIndex: string; matchIndex: number; matchup: Matchup; } | null>(null);
    const [confirmation, setConfirmation] = useState<{ title: string; message: string; onConfirm: () => void; type?: 'danger' | 'info' } | null>(null);

    const myCompetitions = useMemo(() => initialCompetitions.filter(c => c.ownerId === user?.id || c.teams.some(t => t.ownerId === user?.id)), [initialCompetitions, user]);
    const joinableCompetitions = useMemo(() => initialCompetitions.filter(c => c.status === 'Open' && c.ownerId !== user?.id && !c.teams.some(t => t.ownerId === user?.id)), [initialCompetitions, user]);

    const standings = useMemo(() => {
        if (!selectedCompetition || selectedCompetition.format !== 'Liguilla' || !selectedCompetition.schedule) return [];
        return selectedCompetition.teams.map(({ teamName }) => {
            let p = 0, w = 0, l = 0, d = 0, tdF = 0, tdA = 0;
            Object.values(selectedCompetition.schedule!).forEach(round => {
                (round as Matchup[]).forEach(match => {
                    if ((match.team1 === teamName || match.team2 === teamName) && match.score1 != null && match.score2 != null) {
                        p++;
                        const isTeam1 = match.team1 === teamName;
                        const sF = isTeam1 ? match.score1 : match.score2;
                        const sA = isTeam1 ? match.score2 : match.score1;
                        tdF += sF!;
                        tdA += sA!;
                        if (sF! > sA!) w++; else if (sA! > sF!) l++; else d++;
                    }
                });
            });
            return { name: teamName, p, w, d, l, tdF, tdA, pts: w * 3 + d };
        }).sort((a, b) => b.pts - a.pts || (b.tdF - b.tdA) - (a.tdF - a.tdF) || b.tdF - a.tdF);
    }, [selectedCompetition]);

    const finalWinner = useMemo(() => {
        if (!selectedCompetition || selectedCompetition.format !== 'Torneo' || !selectedCompetition.bracket) return null;
        const finalRoundKey = Math.max(...Object.keys(selectedCompetition.bracket).map(Number)).toString();
        return selectedCompetition.bracket[finalRoundKey]?.[0]?.winner;
    }, [selectedCompetition]);

    const handleCreateCompetition = () => {
        if (!newCompetitionName.trim() || !user) {
            setConfirmation({
                title: "Campo requerido",
                message: "Por favor, introduce un nombre para la competición.",
                onConfirm: () => setConfirmation(null),
                type: 'info'
            });
            return;
        }
        const newCompetition: Omit<Competition, 'id'> = {
            name: newCompetitionName.trim(),
            format: newCompetitionFormat,
            teams: [],
            ownerId: user.id,
            ownerName: user.name,
            status: 'Open',
        };
        onCompetitionCreate(newCompetition);
        setNewCompetitionName('');
        setView('list');
        setActiveTab('my');
    };

    const handleJoinCompetition = () => {
        if (!joinModalState.comp || !joinModalState.teamToJoin || !user) return;
        const cleanComp = cloneCompetition(joinModalState.comp);
        const updatedComp = {
            ...cleanComp,
            teams: [...cleanComp.teams, { teamName: joinModalState.teamToJoin, ownerId: user.id, ownerName: user.name }]
        };
        onCompetitionUpdate(updatedComp);
        setJoinModalState({ comp: null, teamToJoin: '' });
    };

    const handleStartCompetition = (comp: Competition) => {
        if (comp.teams.length < 2) {
            setConfirmation({
                title: "Equipos insuficientes",
                message: "Se necesitan al menos 2 equipos para iniciar la competición.",
                onConfirm: () => setConfirmation(null),
                type: 'info'
            });
            return;
        }
        const teamNames = comp.teams.map(t => t.teamName);
        const cleanComp = cloneCompetition(comp);

        let updatedComp: Competition;

        if (comp.format === 'Liguilla') {
            updatedComp = {
                ...cleanComp,
                status: 'In Progress',
                schedule: generateSchedule(teamNames),
                bracket: null,
            };
        } else { // Torneo
            updatedComp = {
                ...cleanComp,
                status: 'In Progress',
                bracket: generateBracket(teamNames),
                schedule: null,
            };
        }

        onCompetitionUpdate(updatedComp);
        setSelectedCompetition(updatedComp);
    };

    const handleSaveScore = (score1: string, score2: string) => {
        if (!selectedCompetition || !scoreModalState) return;
        const updatedComp = cloneCompetition(selectedCompetition);
        const s1_val = parseInt(score1, 10);
        const s2_val = parseInt(score2, 10);
        const s1 = isNaN(s1_val) ? null : s1_val;
        const s2 = isNaN(s2_val) ? null : s2_val;

        if (updatedComp.format === 'Liguilla' && updatedComp.schedule) {
            const match = updatedComp.schedule[scoreModalState.roundIndex][scoreModalState.matchIndex];
            match.score1 = s1;
            match.score2 = s2;
        } else if (updatedComp.format === 'Torneo' && updatedComp.bracket) {
            const match = updatedComp.bracket[scoreModalState.roundIndex][scoreModalState.matchIndex];
            match.score1 = s1;
            match.score2 = s2;
        }
        onCompetitionUpdate(updatedComp);
        setSelectedCompetition(updatedComp);
        setScoreModalState(null);
    };

    const handleWinnerSelect = (roundIndexStr: string, matchIndex: number, winnerTeam: string) => {
        if (!selectedCompetition || !selectedCompetition.bracket) return;

        const cleanComp = cloneCompetition(selectedCompetition);
        let newBracket = cleanComp.bracket!;
        const currentMatch = newBracket[roundIndexStr][matchIndex];

        if (currentMatch.winner === winnerTeam) { // Deselecting
            currentMatch.winner = null;
        } else {
            currentMatch.winner = winnerTeam;
        }

        // Recalculate subsequent rounds
        for (let i = parseInt(roundIndexStr); i < Object.keys(newBracket).length - 1; i++) {
            const currentRound = newBracket[i.toString()];
            const nextRound = newBracket[(i + 1).toString()];
            for (let j = 0; j < nextRound.length; j++) {
                nextRound[j].team1 = currentRound[j * 2]?.winner || 'Por determinar';
                nextRound[j].team2 = currentRound[j * 2 + 1]?.winner || 'Por determinar';

                if (nextRound[j].team1 === 'BYE') nextRound[j].winner = nextRound[j].team2;
                else if (nextRound[j].team2 === 'BYE') nextRound[j].winner = nextRound[j].team1;
                else if (nextRound[j].team1 !== 'Por determinar' && nextRound[j].team2 !== 'Por determinar') {
                    // if both teams are now set, but a winner was previously selected that is no longer valid, clear winner.
                    if (nextRound[j].winner && nextRound[j].winner !== nextRound[j].team1 && nextRound[j].winner !== nextRound[j].team2) {
                        nextRound[j].winner = null;
                    }
                }
            }
        }

        const updatedComp = { ...cleanComp, bracket: newBracket };
        onCompetitionUpdate(updatedComp);
        setSelectedCompetition(updatedComp);
    };

    const renderCreateView = () => (
        <div className="p-4 sm:p-8 max-w-lg mx-auto">
            <button
                onClick={() => setView('list')}
                className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] mb-8 hover:underline group italic transition-all"
            >
                <span className="material-symbols-outlined font-bold transform group-hover:-translate-x-1 transition-transform">arrow_back</span>
                Volver a la lista
            </button>

            <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>

                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-8">
                    Nueva <span className="text-primary italic">Competición</span>
                </h2>

                <div className="space-y-8">
                    <div className="space-y-3">
                        <label htmlFor="compName" className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Nombre de la liga</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">trophy</span>
                            <input
                                id="compName"
                                type="text"
                                value={newCompetitionName}
                                onChange={e => setNewCompetitionName(e.target.value)}
                                placeholder="P. Ej: Copa del Caos 2024"
                                className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-slate-700 font-bold"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Formato de juego</label>
                        <div className="grid grid-cols-2 gap-4">
                            {['Liguilla', 'Torneo'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setNewCompetitionFormat(f as any)}
                                    className={`py-4 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-widest italic ${newCompetitionFormat === f
                                        ? 'bg-primary text-black border-primary shadow-lg shadow-primary/20'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleCreateCompetition}
                            className="w-full py-5 bg-primary text-black font-black rounded-2xl shadow-xl shadow-primary/10 hover:scale-[1.02] active:scale-95 transition-all uppercase italic tracking-tighter text-sm flex items-center justify-center gap-3"
                        >
                            <span className="material-symbols-outlined font-bold">add_circle</span>
                            Crear Competición
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDetailView = () => {
        if (!selectedCompetition) return null;

        return (
            <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-10">
                <button
                    onClick={() => { setView('list'); setSelectedCompetition(null); }}
                    className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] mb-4 hover:underline group italic transition-all"
                >
                    <span className="material-symbols-outlined font-bold transform group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    Volver a la lista
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start gap-8 bg-zinc-900/40 border border-white/5 p-10 rounded-[2.5rem] relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3"></div>

                    <div className="relative z-10 space-y-2">
                        <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] italic border ${selectedCompetition.status === 'Open' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-primary/10 text-primary border-primary/20'
                            }`}>
                            {selectedCompetition.status}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-white italic truncate tracking-tighter uppercase pt-2">
                            {selectedCompetition.name}
                        </h2>
                        <div className="flex items-center gap-3 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                            <span className="material-symbols-outlined text-sm font-bold">military_tech</span>
                            {selectedCompetition.format} • Org: {selectedCompetition.ownerName}
                        </div>
                    </div>

                    {user?.id === selectedCompetition.ownerId && (
                        <div className="relative z-10 flex flex-wrap gap-3">
                            {selectedCompetition.status === 'Open' && (
                                <button
                                    onClick={() => handleStartCompetition(selectedCompetition)}
                                    className="bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600 hover:text-white font-black py-3 px-8 rounded-2xl text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-green-900/10"
                                >
                                    Iniciar Competición
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setConfirmation({
                                        title: "¿Eliminar competición?",
                                        message: "Esta acción es irreversible. Se perderán todos los datos de la liga.",
                                        onConfirm: () => {
                                            onCompetitionDelete(selectedCompetition.id);
                                            setView('list');
                                            setSelectedCompetition(null);
                                            setConfirmation(null);
                                        },
                                        type: 'danger'
                                    });
                                }}
                                className="bg-red-600/20 text-red-500 border border-red-500/30 hover:bg-red-600 hover:text-white font-black py-3 px-8 rounded-2xl text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-red-900/10"
                            >
                                Eliminar
                            </button>
                        </div>
                    )}
                </div>

                {selectedCompetition.status === 'Open' && (
                    <div className="bg-zinc-900/20 border border-white/5 p-10 rounded-[2.5rem]">
                        <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-8 flex items-center gap-3">
                            <span className="material-symbols-outlined font-bold text-primary">groups</span>
                            Equipos Inscritos <span className="text-primary font-black ml-1">({selectedCompetition.teams.length})</span>
                        </h3>
                        {selectedCompetition.teams.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {selectedCompetition.teams.map(t => (
                                    <div key={t.ownerId + t.teamName} className="p-5 bg-black/40 border border-white/5 rounded-2xl flex items-center gap-4 group hover:border-primary/30 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm italic">
                                            {t.teamName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-white uppercase italic tracking-tight">{t.teamName}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t.ownerName}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-slate-500 font-bold italic uppercase tracking-widest text-xs">Esperando aspirantes... ¡Comparte el nombre de la liga!</p>
                            </div>
                        )}
                    </div>
                )}

                {selectedCompetition.status !== 'Open' && (
                    <div className="space-y-12">
                        {finalWinner && finalWinner !== 'Por determinar' && (
                            <div className="text-center p-10 bg-zinc-900/60 border-2 border-primary/30 rounded-[3rem] relative overflow-hidden shadow-2xl">
                                <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full"></div>
                                <span className="material-symbols-outlined text-6xl text-primary font-bold mb-4 block animate-bounce">emoji_events</span>
                                <h3 className="text-sm font-black text-primary italic uppercase tracking-[0.3em] mb-2">Gran Campeón</h3>
                                <p className="text-5xl md:text-7xl font-black text-white uppercase italic truncate tracking-tighter drop-shadow-lg">{finalWinner}</p>
                            </div>
                        )}

                        {selectedCompetition.format === 'Liguilla' && (
                            <div className="space-y-12">
                                {/* Clasificación */}
                                <div className="bg-zinc-900/20 border border-white/5 rounded-[2.5rem] overflow-hidden">
                                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                        <h3 className="text-xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
                                            <span className="material-symbols-outlined font-bold text-primary">format_list_numbered</span>
                                            Clasificación
                                        </h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-black/40 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                    <th className="p-6">Pos</th>
                                                    <th className="p-6">Equipo</th>
                                                    <th className="p-6 text-center">PJ</th>
                                                    <th className="p-6 text-center">G</th>
                                                    <th className="p-6 text-center">E/P</th>
                                                    <th className="p-6 text-center">TD +/-</th>
                                                    <th className="p-6 text-center text-primary">Pts</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {standings.map((t, idx) => (
                                                    <tr key={t.name} className="hover:bg-white/5 transition-all">
                                                        <td className="p-6 font-black italic text-slate-500">{idx + 1}</td>
                                                        <td className="p-6 font-black text-white italic uppercase">{t.name}</td>
                                                        <td className="p-6 text-center font-bold">{t.p}</td>
                                                        <td className="p-6 text-center font-bold text-green-500">{t.w}</td>
                                                        <td className="p-6 text-center font-bold text-slate-400">{t.d}/{t.l}</td>
                                                        <td className="p-6 text-center font-bold text-slate-400">{t.tdF - t.tdA}</td>
                                                        <td className="p-6 text-center font-black text-primary text-lg">{t.pts}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Jornadas */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {Object.entries(selectedCompetition.schedule!).map(([roundIdx, round]) => (
                                        <div key={roundIdx} className="bg-zinc-900/20 border border-white/5 rounded-[2.5rem] p-8">
                                            <h4 className="text-sm font-black text-primary italic tracking-[0.2em] uppercase mb-6 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm font-bold">calendar_month</span>
                                                Jornada {parseInt(roundIdx) + 1}
                                            </h4>
                                            <div className="space-y-4">
                                                {(round as Matchup[]).map((match, matchIdx) => (
                                                    <div key={matchIdx} className="bg-black/40 p-4 rounded-3xl border border-white/5 flex items-center justify-between gap-4 group">
                                                        <span className="flex-1 text-right font-black text-[11px] uppercase italic truncate text-slate-300">{match.team1}</span>
                                                        <div className="flex items-center gap-4 px-4 py-2 bg-zinc-900 rounded-2xl border border-white/10 shrink-0 relative overflow-hidden">
                                                            <div className="font-black text-xl text-white w-8 text-center">{match.score1 ?? '-'}</div>
                                                            <div className="text-[10px] font-black text-slate-600">VS</div>
                                                            <div className="font-black text-xl text-white w-8 text-center">{match.score2 ?? '-'}</div>
                                                            <button
                                                                onClick={() => setScoreModalState({ isOpen: true, roundIndex: roundIdx, matchIndex: matchIdx, matchup: match })}
                                                                className="absolute inset-0 bg-primary/90 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-black"
                                                            >
                                                                <span className="material-symbols-outlined font-black">edit</span>
                                                            </button>
                                                        </div>
                                                        <span className="flex-1 text-left font-black text-[11px] uppercase italic truncate text-slate-300">{match.team2}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedCompetition.format === 'Torneo' && selectedCompetition.bracket && (
                            <div className="flex gap-10 overflow-x-auto pb-10 scrollbar-premium">
                                {Object.entries(selectedCompetition.bracket).map(([roundIdx, round]) => (
                                    <div key={roundIdx} className="flex flex-col justify-around min-w-[280px] gap-8">
                                        <div className="text-center space-y-1">
                                            <h3 className="text-[10px] font-black text-primary italic uppercase tracking-[0.3em]">
                                                {parseInt(roundIdx) === 0 ? 'Primera Fase' : Object.keys(selectedCompetition.bracket!).length - 1 === parseInt(roundIdx) ? 'Finalísima' : `Fase ${parseInt(roundIdx) + 1}`}
                                            </h3>
                                            <div className="h-0.5 w-12 bg-primary/30 mx-auto rounded-full"></div>
                                        </div>
                                        <div className="space-y-12">
                                            {(round as Matchup[]).map((match, matchIdx) => (
                                                <div key={matchIdx} className="relative group">
                                                    <div className="bg-zinc-900 border border-white/10 p-4 rounded-[2rem] shadow-2xl relative z-10 space-y-3">
                                                        <button
                                                            onClick={() => handleWinnerSelect(roundIdx, matchIdx, match.team1)}
                                                            disabled={match.team1 === 'BYE' || match.team1 === 'Por determinar'}
                                                            className={`w-full flex justify-between items-center p-3 rounded-2xl transition-all ${match.winner === match.team1 ? 'bg-primary text-black font-black italic' : 'bg-black/40 text-slate-400 font-bold hover:bg-white/5'}`}
                                                        >
                                                            <span className="truncate text-[10px] uppercase tracking-tighter">{match.team1}</span>
                                                            <span className="font-black text-sm">{match.score1 ?? ''}</span>
                                                        </button>
                                                        <div className="h-px bg-white/5 w-full mx-auto"></div>
                                                        <button
                                                            onClick={() => handleWinnerSelect(roundIdx, matchIdx, match.team2)}
                                                            disabled={match.team2 === 'BYE' || match.team2 === 'Por determinar'}
                                                            className={`w-full flex justify-between items-center p-3 rounded-2xl transition-all ${match.winner === match.team2 ? 'bg-primary text-black font-black italic' : 'bg-black/40 text-slate-400 font-bold hover:bg-white/5'}`}
                                                        >
                                                            <span className="truncate text-[10px] uppercase tracking-tighter">{match.team2}</span>
                                                            <span className="font-black text-sm">{match.score2 ?? ''}</span>
                                                        </button>

                                                        {/* Edit Result Small Button */}
                                                        <button
                                                            onClick={() => setScoreModalState({ isOpen: true, roundIndex: roundIdx, matchIndex: matchIdx, matchup: match })}
                                                            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary/40 transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <span className="material-symbols-outlined text-sm font-bold">edit</span>
                                                        </button>
                                                    </div>

                                                    {/* Connector lines (simplified) */}
                                                    {parseInt(roundIdx) < Object.keys(selectedCompetition.bracket!).length - 1 && (
                                                        <div className="absolute top-1/2 -right-10 w-10 h-px bg-white/20 -z-0"></div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderTabbedList = () => (
        <div className="p-2 sm:p-4 max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
                <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                    La <span className="text-primary italic">Arena</span>
                </h1>
                <div className="flex bg-zinc-900/60 p-1 rounded-2xl border border-white/5 backdrop-blur-md">
                    <button
                        onClick={() => setActiveTab('my')}
                        className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'my' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        Mis Competiciones
                    </button>
                    <button
                        onClick={() => setActiveTab('join')}
                        className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'join' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        Unirse
                    </button>
                </div>
            </div>

            {activeTab === 'my' && (
                <div className="space-y-8 text-center sm:text-left">
                    <div className="flex justify-center sm:justify-start">
                        <button
                            onClick={() => setView('create')}
                            className="bg-primary text-black font-black px-10 py-5 rounded-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 uppercase tracking-tighter text-sm shadow-xl shadow-primary/10"
                        >
                            <span className="material-symbols-outlined font-bold">add_circle</span>
                            Organizar Nueva Liga
                        </button>
                    </div>

                    {myCompetitions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myCompetitions.map(c => (
                                <div
                                    key={c.id}
                                    className="group bg-zinc-900/40 border border-white/5 p-6 rounded-3xl hover:bg-zinc-800/60 transition-all flex justify-between items-center relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                                    <div className="relative z-10 flex flex-col gap-1 min-w-0">
                                        <h3 className="text-lg font-black text-white uppercase italic tracking-tight truncate group-hover:text-primary transition-colors">
                                            {c.name}
                                        </h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                            {c.ownerId === user?.id ? 'Tu liga' : `Org: ${c.ownerName}`} • {c.format}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 relative z-10 shrink-0">
                                        <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${c.status === 'Open' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                            (c.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-white/5 text-slate-400')
                                            }`}>
                                            {c.status}
                                        </span>
                                        <button
                                            onClick={() => { setSelectedCompetition(c); setView('detail'); }}
                                            className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center hover:bg-primary hover:text-black transition-all"
                                        >
                                            <span className="material-symbols-outlined font-bold">arrow_forward</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-zinc-900/20 rounded-[2.5rem] border border-dashed border-white/5">
                            <span className="material-symbols-outlined text-6xl text-white/5 mb-4 block">stadium</span>
                            <p className="text-slate-500 font-bold italic uppercase tracking-widest text-xs">No estás en ninguna competición activa</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'join' && (
                <div className="space-y-8">
                    {joinableCompetitions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {joinableCompetitions.map(c => (
                                <div key={c.id} className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl flex justify-between items-center group">
                                    <div className="min-w-0">
                                        <p className="text-lg font-black text-white italic uppercase truncate group-hover:text-primary transition-colors">{c.name}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">{c.ownerName} • {c.format}</p>
                                    </div>
                                    <button
                                        onClick={() => setJoinModalState({ comp: c, teamToJoin: managedTeams[0]?.name || '' })}
                                        className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-black font-black py-2 px-6 rounded-xl text-[10px] uppercase tracking-widest transition-all"
                                    >
                                        Unirse
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-zinc-900/20 rounded-[2.5rem] border border-dashed border-white/5">
                            <span className="material-symbols-outlined text-6xl text-white/5 mb-4 block">search_off</span>
                            <p className="text-slate-500 font-bold italic uppercase tracking-widest text-xs">No hay competiciones abiertas en este momento</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen pb-20">
            <AnimatePresence mode="wait">
                {view === 'list' && <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderTabbedList()}</motion.div>}
                {view === 'create' && <motion.div key="create" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>{renderCreateView()}</motion.div>}
                {view === 'detail' && <motion.div key="detail" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>{renderDetailView()}</motion.div>}
            </AnimatePresence>

            {/* Modal: Unirse */}
            <AnimatePresence>
                {joinModalState.comp && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setJoinModalState({ comp: null, teamToJoin: '' })}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-zinc-900 border border-white/5 rounded-[2.5rem] shadow-2xl max-w-sm w-full overflow-hidden relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8 border-b border-white/5">
                                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Inscripción</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Unirse a "{joinModalState.comp.name}"</p>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-3">
                                    <label htmlFor="teamSelect" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Selecciona tu equipo</label>
                                    <select
                                        id="teamSelect"
                                        value={joinModalState.teamToJoin}
                                        onChange={e => setJoinModalState(s => ({ ...s, teamToJoin: e.target.value }))}
                                        className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 px-4 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all font-bold"
                                    >
                                        {managedTeams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="p-8 bg-black/40 flex gap-4">
                                <button onClick={() => setJoinModalState({ comp: null, teamToJoin: '' })} className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors">Cancelar</button>
                                <button onClick={handleJoinCompetition} className="flex-1 py-4 bg-primary text-black font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10">Confirmar</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal: Resultado */}
            <AnimatePresence>
                {scoreModalState?.isOpen && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setScoreModalState(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-zinc-900 border border-white/5 rounded-[2.5rem] shadow-2xl max-w-sm w-full overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8 border-b border-white/5">
                                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Marcador Final</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Registrar Touchdowns</p>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); const s1 = (document.getElementById('score1') as HTMLInputElement).value; const s2 = (document.getElementById('score2') as HTMLInputElement).value; handleSaveScore(s1, s2); }}>
                                <div className="p-8 space-y-6 text-center">
                                    <div className="flex items-center justify-center gap-6">
                                        <div className="flex-1 space-y-3">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate">{scoreModalState.matchup.team1}</p>
                                            <input id="score1" type="number" defaultValue={scoreModalState.matchup.score1 ?? ''} className="w-full bg-black/60 border border-white/10 rounded-2xl py-6 text-2xl font-black text-white text-center focus:ring-2 focus:ring-primary/50 outline-none" />
                                        </div>
                                        <div className="text-slate-700 font-black italic pt-6">VS</div>
                                        <div className="flex-1 space-y-3">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate">{scoreModalState.matchup.team2}</p>
                                            <input id="score2" type="number" defaultValue={scoreModalState.matchup.score2 ?? ''} className="w-full bg-black/60 border border-white/10 rounded-2xl py-6 text-2xl font-black text-white text-center focus:ring-2 focus:ring-primary/50 outline-none" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 bg-black/40 flex gap-4">
                                    <button type="button" onClick={() => setScoreModalState(null)} className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors">Cancelar</button>
                                    <button type="submit" className="flex-1 py-4 bg-primary text-black font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10">Guardar Acta</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal: Confirmación Personalizado */}
            <AnimatePresence>
                {confirmation && (
                    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 backdrop-blur-md" onClick={() => setConfirmation(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center space-y-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center ${confirmation.type === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                                <span className="material-symbols-outlined text-3xl font-bold">
                                    {confirmation.type === 'danger' ? 'warning' : 'info'}
                                </span>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">{confirmation.title}</h3>
                                <p className="text-sm text-slate-400 font-medium leading-relaxed">{confirmation.message}</p>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setConfirmation(null)} className="flex-1 py-4 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors">Cerrar</button>
                                {confirmation.type === 'danger' && (
                                    <button onClick={confirmation.onConfirm} className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-lg shadow-red-900/20">Confirmar</button>
                                )}
                                {confirmation.type !== 'danger' && confirmation.onConfirm !== (() => setConfirmation(null)) && (
                                    <button onClick={confirmation.onConfirm} className="flex-1 py-4 bg-primary text-black font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">Entendido</button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
