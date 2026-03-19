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
        rules: comp.rules ? { ...comp.rules } : undefined,
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
    onNavigateToMatch?: (matchup: Matchup, comp: Competition, myTeam?: ManagedTeam, opponentTeam?: ManagedTeam) => void;
    isGuest: boolean;
}

export const Leagues: React.FC<LeaguesProps> = ({ 
    managedTeams, 
    initialCompetitions, 
    onCompetitionCreate, 
    onCompetitionUpdate, 
    onCompetitionDelete, 
    onNavigateToMatch,
    isGuest 
}) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'leagues' | 'tournaments' | 'my'>('leagues');
    const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
    const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);

    const [newCompetitionName, setNewCompetitionName] = useState('');
    const [newCompetitionFormat, setNewCompetitionFormat] = useState<'Liguilla' | 'Torneo'>('Liguilla');
    const [newCompReglamento, setNewCompReglamento] = useState<'BB2020' | 'BB2016' | 'Sevens'>('BB2020');
    const [newCompMuerteSubita, setNewCompMuerteSubita] = useState(false);
    const [newCompIncentivos, setNewCompIncentivos] = useState<'Todos' | 'Reducidos' | 'Ninguno'>('Todos');
    const [newCompTiempoTurno, setNewCompTiempoTurno] = useState(4);
    const [newCompMercenarios, setNewCompMercenarios] = useState(true);
    const [ownerTeamToJoin, setOwnerTeamToJoin] = useState<string>('');
    const [isSelectingOwnerTeam, setIsSelectingOwnerTeam] = useState(false);

    const [joinModalState, setJoinModalState] = useState<{ comp: Competition | null; teamToJoin: string }>({ comp: null, teamToJoin: '' });
    const [scoreModalState, setScoreModalState] = useState<{ isOpen: boolean; roundIndex: string; matchIndex: number; matchup: Matchup; } | null>(null);
    const [confirmation, setConfirmation] = useState<{ title: string; message: string; onConfirm: () => void; type?: 'danger' | 'info' } | null>(null);

    const leagues = useMemo(() => initialCompetitions.filter(c => c.format === 'Liguilla' && c.status === 'Open' && c.ownerId !== user?.id && !c.teams.some(t => t.ownerId === user?.id)), [initialCompetitions, user]);
    const tournaments = useMemo(() => initialCompetitions.filter(c => c.format === 'Torneo' && c.status === 'Open' && c.ownerId !== user?.id && !c.teams.some(t => t.ownerId === user?.id)), [initialCompetitions, user]);
    const myCompetitions = useMemo(() => initialCompetitions.filter(c => c.ownerId === user?.id || c.teams.some(t => t.ownerId === user?.id)), [initialCompetitions, user]);

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
        }).sort((a, b) => b.pts - a.pts || (b.tdF - b.tdA) - (a.tdF - a.tdA) || b.tdF - a.tdF);
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

        const teams: CompetitionTeam[] = [];
        if (ownerTeamToJoin) {
            const baseTeam = managedTeams.find(t => t.name === ownerTeamToJoin);
            if (baseTeam) {
                const teamState: ManagedTeam = JSON.parse(JSON.stringify(baseTeam));
                teamState.record = { wins: 0, draws: 0, losses: 0 };
                teams.push({
                    teamName: ownerTeamToJoin,
                    ownerId: user.id || '',
                    ownerName: user.name || '',
                    teamState,
                    stats: { played: 0, won: 0, drawn: 0, lost: 0, tdFor: 0, tdAgainst: 0, casFor: 0, casAgainst: 0, points: 0 }
                });
            }
        }

        const newCompetition: Omit<Competition, 'id'> = {
            name: newCompetitionName.trim(),
            format: newCompetitionFormat,
            teams,
            ownerId: user.id,
            ownerName: user.name,
            status: 'Open',
            baseTeam: managedTeams.find(t => t.name === ownerTeamToJoin),
            rules: {
                reglamento: newCompReglamento,
                muerteSubita: newCompMuerteSubita,
                incentivos: newCompIncentivos,
                tiempoTurno: newCompTiempoTurno,
                mercenarios: newCompMercenarios
            }
        };
        onCompetitionCreate(newCompetition);
        setNewCompetitionName('');
        setOwnerTeamToJoin('');
        setView('list');
        setActiveTab('my');
    };

    const handleJoinCompetition = () => {
        if (!joinModalState.comp || !user) return;
        
        let targetTeamName = joinModalState.teamToJoin;
        
        // Fallback to first managed team if none selected but available
        if (!targetTeamName && managedTeams.length > 0) {
            targetTeamName = managedTeams[0].name;
        }

        if (!targetTeamName) {
            setConfirmation({
                title: "Sin equipo",
                message: "Debes crear al menos un equipo en el Gremio para unirte a una liga.",
                onConfirm: () => setConfirmation(null),
                type: 'info'
            });
            return;
        }

        const baseTeam = managedTeams.find(t => t.name === targetTeamName);
        if (!baseTeam) return;

        const cleanComp = cloneCompetition(joinModalState.comp);
        
        // Check if team already exists in competition
        if (cleanComp.teams.some(t => t.teamName === targetTeamName)) {
            setConfirmation({
                title: "Equipo duplicado",
                message: "Este equipo ya está inscrito en la competición.",
                onConfirm: () => setConfirmation(null),
                type: 'info'
            });
            return;
        }

        // Crear el clon (Franquicia de Competición)
        const teamState: ManagedTeam = JSON.parse(JSON.stringify(baseTeam));
        teamState.record = { wins: 0, draws: 0, losses: 0 };

        const updatedComp = {
            ...cleanComp,
            teams: [...cleanComp.teams, { 
                teamName: targetTeamName, 
                ownerId: user.id, 
                ownerName: user.name,
                teamState,
                stats: { played: 0, won: 0, drawn: 0, lost: 0, tdFor: 0, tdAgainst: 0, casFor: 0, casAgainst: 0, points: 0 }
            }]
        };
        onCompetitionUpdate(updatedComp as Competition);
        
        // Update local state if we are in detail view
        if (selectedCompetition && selectedCompetition.id === updatedComp.id) {
            setSelectedCompetition(updatedComp);
        }

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
        <div className="max-w-[1200px] mx-auto w-full p-4 sm:p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">Configuración</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase italic">Nueva <span className="text-primary">Competición</span></h1>
                    <p className="text-slate-400 mt-2 font-medium italic">Crea una liga legendaria o un torneo de eliminación directa en el Viejo Mundo.</p>
                </div>
                <button
                    onClick={() => setView('list')}
                    className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] hover:underline group italic transition-all shrink-0"
                >
                    <span className="material-symbols-outlined font-bold transform group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    Volver a la lista
                </button>
            </div>

            {/* Selector Component */}
            <div className="flex mb-10">
                <div className="flex h-12 w-full max-w-md items-center justify-center rounded-xl bg-zinc-900 border border-white/10 p-1.5 shadow-xl">
                    <button
                        onClick={() => setNewCompetitionFormat('Liguilla')}
                        className={`flex h-full grow items-center justify-center rounded-lg px-4 transition-all text-[10px] font-bold uppercase tracking-widest italic gap-2 ${newCompetitionFormat === 'Liguilla' ? 'bg-primary text-black' : 'text-slate-400 hover:text-white'}`}
                    >
                        <span className="material-symbols-outlined text-sm font-bold">trophy</span> Nueva Liga
                    </button>
                    <button
                        onClick={() => setNewCompetitionFormat('Torneo')}
                        className={`flex h-full grow items-center justify-center rounded-lg px-4 transition-all text-[10px] font-bold uppercase tracking-widest italic gap-2 ${newCompetitionFormat === 'Torneo' ? 'bg-primary text-black' : 'text-slate-400 hover:text-white'}`}
                    >
                        <span className="material-symbols-outlined text-sm font-bold">bolt</span> Nuevo Torneo
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Configuration */}
                <div className="lg:col-span-7 space-y-8">
                    <section className="bg-zinc-900/40 rounded-[2rem] border border-white/5 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/10 transition-colors"></div>
                        
                        <div className="flex items-center gap-3 mb-8">
                            <span className="material-symbols-outlined text-primary font-bold">settings</span>
                            <h3 className="text-xl font-bold text-white uppercase italic tracking-tight">Configuración General</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Nombre de la Competición</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">edit_note</span>
                                    <input
                                        type="text"
                                        value={newCompetitionName}
                                        onChange={e => setNewCompetitionName(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-slate-700 font-bold"
                                        placeholder="Ej: Copa de los Reinos del Caos"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Formato</label>
                                    <div className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-slate-300 font-bold text-sm">
                                        {newCompetitionFormat === 'Liguilla' ? 'Round Robin (Todos contra todos)' : 'Eliminatoria Directa'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Reglamento</label>
                                    <div className="relative">
                                        <select 
                                            value={newCompReglamento}
                                            onChange={(e) => setNewCompReglamento(e.target.value as any)}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all font-bold appearance-none"
                                        >
                                            <option value="BB2020">BB2020 (Official)</option>
                                            <option value="BB2016">BB2016 (Classic)</option>
                                            <option value="Sevens">Sevens (Rápido)</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">expand_more</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-zinc-900/40 rounded-[2rem] border border-white/5 p-8 shadow-2xl backdrop-blur-xl group">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary font-bold">groups</span>
                                <h3 className="text-xl font-bold text-white uppercase italic tracking-tight">Gestión de Participantes</h3>
                            </div>
                            <span className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest italic">
                                {ownerTeamToJoin ? '1' : '0'} / 12 Equipos
                            </span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <button 
                                onClick={() => setIsSelectingOwnerTeam(true)}
                                className="flex-1 flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest italic transition-all shadow-lg shadow-primary/5"
                            >
                                <span className="material-symbols-outlined text-[20px] font-bold">add_circle</span>
                                Mis Equipos
                            </button>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}?join=invite_${Date.now()}`);
                                    setConfirmation({
                                        title: "Enlace Copiado",
                                        message: "¡Enlace de invitación copiado al portapapeles! Envíalo a otros coaches por WhatsApp o Discord.",
                                        onConfirm: () => setConfirmation(null),
                                        type: 'info'
                                    });
                                }}
                                className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest italic transition-all"
                            >
                                <span className="material-symbols-outlined text-[20px] font-bold">link</span>
                                Generar Invitación
                            </button>
                        </div>

                        {isSelectingOwnerTeam && (
                            <div className="mb-6 p-6 bg-black/60 rounded-3xl border border-primary/20 animate-in zoom-in-95 duration-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Selecciona tu equipo para unirlo</h4>
                                    <button onClick={() => setIsSelectingOwnerTeam(false)} className="text-slate-500 hover:text-white">
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {managedTeams.length > 0 ? (
                                        managedTeams.map(team => (
                                            <button
                                                key={team.name}
                                                onClick={() => { setOwnerTeamToJoin(team.name); setIsSelectingOwnerTeam(false); }}
                                                className="w-full text-left p-4 rounded-xl border border-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-between group"
                                            >
                                                <span className="text-white font-bold italic uppercase text-xs">{team.name}</span>
                                                <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity">add</span>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="text-center py-4 text-slate-500 text-[10px] font-bold uppercase italic">No tienes equipos en el Gremio</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {ownerTeamToJoin ? (
                                <div className="flex items-center justify-between p-5 rounded-2xl bg-black/40 border border-white/5 group/host transition-all hover:border-primary/30">
                                    <div className="flex items-center gap-4">
                                        <div className="size-14 bg-zinc-900 rounded-xl border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                                            <span className="material-symbols-outlined text-primary text-3xl font-bold">shield</span>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white uppercase italic text-sm tracking-tight">{ownerTeamToJoin}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Host: {user?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 italic">Host</span>
                                        <button onClick={() => setOwnerTeamToJoin('')} className="text-slate-600 hover:text-red-500 transition-colors p-2">
                                            <span className="material-symbols-outlined font-bold">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center bg-black/20 rounded-2xl border border-dashed border-white/5">
                                    <p className="text-slate-500 font-bold italic uppercase tracking-widest text-xs">Aún no has inscrito ninguno de tus equipos</p>
                                </div>
                            )}

                            <div className="p-8 text-center bg-black/20 rounded-2xl border border-dashed border-white/5">
                                <p className="text-slate-500 font-bold italic uppercase tracking-widest text-xs">Esperando más aspirantes...</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Summary & Actions */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-primary rounded-[2.5rem] p-10 text-zinc-900 relative overflow-hidden group shadow-2xl shadow-primary/20">
                        {/* Background Pattern Decor */}
                        <div className="absolute -right-10 -bottom-10 text-zinc-900/5 pointer-events-none">
                            <span className="material-symbols-outlined text-[240px] rotate-12 font-black">emoji_events</span>
                        </div>
                        
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-70 italic">Resumen de Élite</h4>
                            <div className="text-5xl font-black mb-8 tracking-tighter uppercase italic break-words leading-none">
                                {newCompetitionName || 'Copa sin nombre'}
                            </div>
                            
                            <ul className="space-y-4 mb-10 text-sm font-black uppercase italic tracking-tight">
                                <li className="flex items-center gap-3 pb-4 border-b border-zinc-900/10">
                                    <span className="material-symbols-outlined text-xl font-bold">check_circle</span> 
                                    Formato {newCompetitionFormat}
                                </li>
                                <li className="flex items-center gap-3 pb-4 border-b border-zinc-900/10">
                                    <span className="material-symbols-outlined text-xl font-bold">check_circle</span> 
                                    Reglamento {newCompReglamento}
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-xl font-bold">check_circle</span> 
                                    {ownerTeamToJoin ? '1' : '0'} Participante{ownerTeamToJoin !== '' ? '' : 's'}
                                </li>
                            </ul>

                            <button
                                onClick={handleCreateCompetition}
                                disabled={!newCompetitionName.trim()}
                                className="w-full bg-zinc-900 text-primary py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-black/20 disabled:opacity-50 disabled:scale-100 italic"
                            >
                                Empezar Competición
                            </button>
                            <p className="text-center text-[10px] font-black uppercase tracking-widest mt-6 opacity-60 italic">Esto guardará la liga y permitirá unirse a otros</p>
                        </div>
                    </div>

                    {/* Rule Preview Card */}
                    <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl">
                        <h4 className="text-white font-black italic uppercase tracking-widest text-sm mb-6 flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-xl font-bold">history_edu</span>
                            Detalles de Reglas
                        </h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center py-4 border-b border-white/5 group">
                                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Muerte Súbita</span>
                                <button 
                                    onClick={() => setNewCompMuerteSubita(!newCompMuerteSubita)}
                                    className={`font-black uppercase tracking-widest text-[10px] italic px-3 py-1 rounded-lg transition-all ${newCompMuerteSubita ? 'bg-primary text-black' : 'bg-primary/5 text-primary border border-primary/10'}`}
                                >
                                    {newCompMuerteSubita ? 'Habilitado' : 'Desactivado'}
                                </button>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-white/5">
                                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Incentivos</span>
                                <select 
                                    value={newCompIncentivos}
                                    onChange={(e) => setNewCompIncentivos(e.target.value as any)}
                                    className="bg-transparent text-white font-black uppercase tracking-widest text-[10px] italic outline-none text-right"
                                >
                                    <option value="Todos">Todos</option>
                                    <option value="Reducidos">Reducidos</option>
                                    <option value="Ninguno">Ninguno</option>
                                </select>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-white/5">
                                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Tiempo por Turno</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setNewCompTiempoTurno(Math.max(1, newCompTiempoTurno - 1))} className="text-primary font-bold opacity-50 hover:opacity-100 p-1">-</button>
                                    <span className="text-white font-black uppercase tracking-widest text-[10px] italic w-20 text-center">{newCompTiempoTurno} Minutos</span>
                                    <button onClick={() => setNewCompTiempoTurno(Math.min(10, newCompTiempoTurno + 1))} className="text-primary font-bold opacity-50 hover:opacity-100 p-1">+</button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center py-4">
                                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Mercenarios</span>
                                <button 
                                    onClick={() => setNewCompMercenarios(!newCompMercenarios)}
                                    className={`font-black uppercase tracking-widest text-[10px] italic underline decoration-primary/30 underline-offset-4 transition-all ${newCompMercenarios ? 'text-white' : 'text-slate-600'}`}
                                >
                                    {newCompMercenarios ? 'Habilitado' : 'Desactivado'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Info box */}
                    <div className="flex gap-4 p-6 rounded-[2rem] bg-primary/5 border border-primary/10">
                        <span className="material-symbols-outlined text-primary font-bold shrink-0">info</span>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                            Los calendarios se generan de forma equilibrada una vez iniciada la competición para asegurar la mejor experiencia competitiva.
                        </p>
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
                        <div className="flex flex-wrap items-center gap-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm font-bold text-primary">military_tech</span> {selectedCompetition.format}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm font-bold text-primary">person</span> {selectedCompetition.ownerName}</span>
                            {selectedCompetition.rules && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                    <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm font-bold text-primary">gavel</span> {selectedCompetition.rules.reglamento}</span>
                                </>
                            )}
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

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 bg-zinc-900/20 border border-white/5 p-10 rounded-[2.5rem]">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                                <h3 className="text-xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
                                    <span className="material-symbols-outlined font-bold text-primary">groups</span>
                                    Equipos Inscritos <span className="text-primary font-black ml-1">({selectedCompetition.teams.length})</span>
                                </h3>

                                {!selectedCompetition.teams.some(t => t.ownerId === user?.id) && (
                                    <button
                                        onClick={() => setJoinModalState({ comp: selectedCompetition, teamToJoin: managedTeams[0]?.name || '' })}
                                        className="bg-primary text-black font-black py-3 px-8 rounded-2xl text-[10px] uppercase tracking-widest transition-all hover:scale-105 shadow-lg shadow-primary/20"
                                    >
                                        Inscribir mi Equipo
                                    </button>
                                )}
                            </div>
                            
                            {selectedCompetition.teams.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {selectedCompetition.teams.map(t => (
                                        <div key={t.ownerId + t.teamName} className="p-5 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm italic">
                                                    {t.teamName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-white uppercase italic tracking-tight">{t.teamName}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t.ownerName}</p>
                                                </div>
                                            </div>
                                            {t.stats && (
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-primary italic uppercase">{t.stats.points} PTS</p>
                                                    <p className="text-[8px] text-slate-600 font-bold uppercase">{t.stats.played} PJ</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-slate-500 font-bold italic uppercase tracking-widest text-xs">Esperando aspirantes... ¡Únete o invita a otros coaches!</p>
                                </div>
                            )}

                            {/* Dashboard de Franquicia del Usuario */}
                            {selectedCompetition.teams.find(t => t.ownerId === user?.id) && (
                                <div className="mt-12 pt-12 border-t border-white/5">
                                    <div className="flex items-center gap-3 mb-8">
                                        <span className="material-symbols-outlined text-primary font-bold">account_balance_wallet</span>
                                        <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Estado de mi <span className="text-primary italic">Franquicia</span></h3>
                                    </div>
                                    
                                    {(() => {
                                        const myFranchise = selectedCompetition.teams.find(t => t.ownerId === user?.id);
                                        const myTeam = myFranchise?.teamState;
                                        if (!myFranchise || !myTeam) return null;

                                        const availablePlayers = myTeam.players.filter(p => p.status === 'Activo').length;
                                        const injuredPlayers = myTeam.players.filter(p => p.status === 'Lesionado' || (p.missNextGame && p.missNextGame > 0)).length;

                                        return (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                <div className="p-6 bg-zinc-900/40 border border-white/5 rounded-3xl space-y-2">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Plantilla</p>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-2xl font-black text-white italic">{availablePlayers}</span>
                                                        <span className="text-[10px] font-bold text-slate-600 uppercase">Activos</span>
                                                    </div>
                                                    {injuredPlayers > 0 && <p className="text-[9px] font-bold text-red-500 uppercase italic">+{injuredPlayers} Bajas</p>}
                                                </div>
                                                <div className="p-6 bg-zinc-900/40 border border-white/5 rounded-3xl space-y-2">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Tesorería Liga</p>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-2xl font-black text-primary italic">{(myTeam.treasury / 1000)}k</span>
                                                        <span className="text-[10px] font-bold text-slate-600 uppercase">GP</span>
                                                    </div>
                                                </div>
                                                <div className="p-6 bg-zinc-900/40 border border-white/5 rounded-3xl space-y-2">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Valor Equipo</p>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-2xl font-black text-white italic">{(myTeam.totalTV || 0) / 1000}k</span>
                                                        <span className="text-[10px] font-bold text-slate-600 uppercase">TV</span>
                                                    </div>
                                                </div>
                                                <div className="p-6 bg-primary/10 border border-primary/20 rounded-3xl flex flex-col justify-center items-center gap-2 group cursor-pointer hover:bg-primary/20 transition-all">
                                                    <span className="material-symbols-outlined text-primary font-bold">stadium</span>
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest italic">Gestionar Clon</p>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* Próximo Encuentro */}
                            {(() => {
                                if (!user || !selectedCompetition || selectedCompetition.status !== 'In Progress') return null;
                                
                                let nextMatch: Matchup | null = null;
                                let opponentName = '';
                                
                                // Buscar en Ligas
                                if (selectedCompetition.format === 'Liguilla' && selectedCompetition.schedule) {
                                    for (const round of Object.values(selectedCompetition.schedule)) {
                                        const myMatch = round.find(m => !m.played && (m.team1 === user.name || m.team2 === user.name || selectedCompetition.teams.find(t => t.ownerId === user.id)?.teamName === m.team1 || selectedCompetition.teams.find(t => t.ownerId === user.id)?.teamName === m.team2));
                                        if (myMatch) {
                                            nextMatch = myMatch;
                                            const myTeamName = selectedCompetition.teams.find(t => t.ownerId === user.id)?.teamName;
                                            opponentName = myMatch.team1 === myTeamName ? myMatch.team2 : myMatch.team1;
                                            break;
                                        }
                                    }
                                } 
                                // Buscar en Torneos
                                else if (selectedCompetition.format === 'Torneo' && selectedCompetition.bracket) {
                                    for (const round of Object.values(selectedCompetition.bracket)) {
                                        const myMatch = round.find(m => !m.played && m.team1 !== 'Por determinar' && m.team2 !== 'Por determinar' && (selectedCompetition.teams.find(t => t.ownerId === user.id)?.teamName === m.team1 || selectedCompetition.teams.find(t => t.ownerId === user.id)?.teamName === m.team2));
                                        if (myMatch) {
                                            nextMatch = myMatch;
                                            const myTeamName = selectedCompetition.teams.find(t => t.ownerId === user.id)?.teamName;
                                            opponentName = myMatch.team1 === myTeamName ? myMatch.team2 : myMatch.team1;
                                            break;
                                        }
                                    }
                                }

                                if (!nextMatch || opponentName === 'BYE') return null;

                                const opponentFranchise = selectedCompetition.teams.find(t => t.teamName === opponentName);
                                const myFranchise = selectedCompetition.teams.find(t => t.ownerId === user.id);

                                return (
                                    <div className="mt-12 pt-12 border-t border-white/5">
                                        <div className="flex items-center gap-3 mb-8">
                                            <span className="material-symbols-outlined text-primary font-bold">event_repeat</span>
                                            <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Próximo <span className="text-primary italic">Encuentro</span></h3>
                                        </div>

                                        <div className="bg-zinc-900/60 border border-white/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            
                                            <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
                                                <div className="size-20 bg-zinc-800 rounded-3xl border border-white/10 flex items-center justify-center text-4xl text-primary font-black italic">
                                                    {opponentName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 italic">Vs Rival Especial</p>
                                                    <h4 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">{opponentName}</h4>
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                        <span>{opponentFranchise?.teamState?.rosterName || 'Desconocido'}</span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                                        <span>TV {(opponentFranchise?.teamState?.totalTV || 0) / 1000}k</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => onNavigateToMatch?.(nextMatch!, selectedCompetition, myFranchise?.teamState, opponentFranchise?.teamState)}
                                                className="w-full md:w-auto relative z-10 bg-primary text-black font-black px-10 py-5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 uppercase tracking-tighter text-sm shadow-xl shadow-primary/10"
                                            >
                                                <span className="material-symbols-outlined font-bold">sports_football</span>
                                                Jugar Partido
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="lg:col-span-4 space-y-6">
                            {selectedCompetition.rules && (
                                <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl">
                                    <h4 className="text-white font-black italic uppercase tracking-widest text-sm mb-6 flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary text-xl font-bold">history_edu</span>
                                        Reglas
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Muerte Súbita</span>
                                            <span className={`font-black uppercase tracking-widest text-[10px] italic ${selectedCompetition.rules.muerteSubita ? 'text-primary' : 'text-slate-600'}`}>
                                                {selectedCompetition.rules.muerteSubita ? 'Habilitado' : 'Desactivado'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Incentivos</span>
                                            <span className="text-white font-black uppercase tracking-widest text-[10px] italic">{selectedCompetition.rules.incentivos}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Turno</span>
                                            <span className="text-white font-black uppercase tracking-widest text-[10px] italic">{selectedCompetition.rules.tiempoTurno} min</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Mercenarios</span>
                                            <span className={`font-black uppercase tracking-widest text-[10px] italic ${selectedCompetition.rules.mercenarios ? 'text-white' : 'text-slate-600'}`}>
                                                {selectedCompetition.rules.mercenarios ? 'Habilitado' : 'Desactivado'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="p-8 bg-primary/5 border border-primary/20 rounded-[2rem] text-center">
                                <span className="material-symbols-outlined text-primary text-4xl mb-3">share</span>
                                <h4 className="text-white font-black italic uppercase tracking-widest text-xs mb-4">Invita a más rivales</h4>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}?join=${selectedCompetition.id}`);
                                        setConfirmation({
                                            title: "Enlace Copiado",
                                            message: "¡Enlace de invitación copiado al portapapeles!",
                                            onConfirm: () => setConfirmation(null),
                                            type: 'info'
                                        });
                                    }}
                                    className="w-full bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary py-3 rounded-xl font-black text-[10px] uppercase tracking-widest italic transition-all"
                                >
                                    Copiar Enlace
                                </button>
                            </div>
                        </div>
                    </div>

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
                        onClick={() => setActiveTab('leagues')}
                        className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'leagues' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        Ligas
                    </button>
                    <button
                        onClick={() => setActiveTab('tournaments')}
                        className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'tournaments' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        Torneos
                    </button>
                    <button
                        onClick={() => setActiveTab('my')}
                        className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'my' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        Mis Franquicias
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
                                    className="group bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] hover:bg-zinc-800/60 transition-all flex justify-between items-center relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/10 transition-colors"></div>
                                    <div className="relative z-10 flex flex-col gap-2 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${c.status === 'Open' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : (c.status === 'In Progress' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'bg-slate-500')}`} />
                                            <h3 className="text-xl font-black text-white uppercase italic tracking-tight truncate group-hover:text-primary transition-colors">
                                                {c.name}
                                            </h3>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">military_tech</span> {c.format}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">person</span> {c.ownerId === user?.id ? 'Tu liga' : c.ownerName}</span>
                                            {c.rules && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                                    <span className="flex items-center gap-1 text-primary/60"><span className="material-symbols-outlined text-[14px]">gavel</span> {c.rules.reglamento}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 relative z-10 shrink-0">
                                        <div className="text-right hidden sm:block">
                                            <span className="block text-[10px] font-black text-white/40 uppercase tracking-widest italic">{c.teams.length} Equipos</span>
                                        </div>
                                        <button
                                            onClick={() => { setSelectedCompetition(c); setView('detail'); }}
                                            className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center hover:bg-primary hover:text-black transition-all shadow-lg hover:shadow-primary/20"
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

            {activeTab === 'leagues' && (
                <div className="space-y-8">
                    {leagues.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {leagues.map(c => (
                                <div key={c.id} className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] flex justify-between items-center group relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                                    <div className="min-w-0 relative z-10 space-y-2">
                                        <p className="text-xl font-black text-white italic uppercase truncate group-hover:text-primary transition-colors">{c.name}</p>
                                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                            <span className="flex items-center gap-1">{c.ownerName}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                            <span className="flex items-center gap-1">{c.format}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setJoinModalState({ comp: c, teamToJoin: managedTeams[0]?.name || '' })}
                                        className="relative z-10 bg-primary/10 hover:bg-primary text-primary hover:text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-primary/20"
                                    >
                                        Inscribirse
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-zinc-900/20 rounded-[2.5rem] border border-dashed border-white/5">
                            <span className="material-symbols-outlined text-6xl text-white/5 mb-4 block">search_off</span>
                            <p className="text-slate-500 font-bold italic uppercase tracking-widest text-xs">No hay ligas abiertas</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'tournaments' && (
                <div className="space-y-8">
                    {tournaments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tournaments.map(c => (
                                <div key={c.id} className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] flex justify-between items-center group relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                                    <div className="min-w-0 relative z-10 space-y-2">
                                        <p className="text-xl font-black text-white italic uppercase truncate group-hover:text-primary transition-colors">{c.name}</p>
                                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                            <span className="flex items-center gap-1">{c.ownerName}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                            <span className="flex items-center gap-1">{c.format}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setJoinModalState({ comp: c, teamToJoin: managedTeams[0]?.name || '' })}
                                        className="relative z-10 bg-primary/10 hover:bg-primary text-primary hover:text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-primary/20"
                                    >
                                        Inscribirse
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-zinc-900/20 rounded-[2.5rem] border border-dashed border-white/5">
                            <span className="material-symbols-outlined text-6xl text-white/5 mb-4 block">bolt</span>
                            <p className="text-slate-500 font-bold italic uppercase tracking-widest text-xs">No hay torneos abiertos</p>
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
                                        <option value="" disabled>Selecciona un equipo...</option>
                                        {managedTeams.length > 0 ? (
                                            managedTeams.map(t => <option key={t.id || t.name} value={t.name}>{t.name}</option>)
                                        ) : (
                                            <option disabled>No tienes equipos en el Gremio</option>
                                        )}
                                    </select>
                                    {managedTeams.length === 0 && (
                                        <p className="text-[9px] text-amber-500 italic mt-1 px-4">
                                            Primero debes forjar un equipo en el Gremio para poder inscribirlo.
                                        </p>
                                    )}
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
