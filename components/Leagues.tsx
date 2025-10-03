import React, { useState, useEffect, useMemo } from 'react';
import type { ManagedTeam, Competition, Matchup } from '../types';
import { useAuth } from '../hooks/useAuth';
import PencilIcon from './icons/PencilIcon';
import CalendarIcon from './icons/CalendarIcon';

// FIX: Declare gapi and google on the window object for TypeScript.
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

const trophyImageUrl = 'https://i.pinimg.com/736x/95/dc/9a/95dc9a37df924d550e9922dbf37b9089.jpg';

// Helper to generate a round-robin schedule
const generateSchedule = (teamNames: string[]): Matchup[][] => {
  const teams = [...teamNames];
  if (teams.length % 2 !== 0) {
    teams.push('BYE'); // Add a bye if odd number of teams
  }

  const numTeams = teams.length;
  const rounds: Matchup[][] = [];
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
    rounds.push(round);

    // Rotate team indices, keeping the first one fixed
    const last = teamIndices.pop()!;
    teamIndices.splice(1, 0, last);
  }
  return rounds;
};

// Helper to generate a single-elimination tournament bracket
const generateBracket = (teamNames: string[]): Matchup[][] => {
    const shuffledTeams = [...teamNames].sort(() => 0.5 - Math.random());
    let numTeams = shuffledTeams.length;
    
    // If not a power of two, pad with BYEs to the next power of two
    if (numTeams > 2 && (numTeams & (numTeams - 1)) !== 0) {
        const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(numTeams)));
        const byesToAdd = nextPowerOfTwo - numTeams;
        for (let i = 0; i < byesToAdd; i++) {
            shuffledTeams.push('BYE');
        }
        numTeams = nextPowerOfTwo;
    }

    const bracket: Matchup[][] = [];

    const firstRound: Matchup[] = [];
    for (let i = 0; i < numTeams; i += 2) {
        firstRound.push({
            team1: shuffledTeams[i],
            team2: shuffledTeams[i + 1] || 'BYE',
            winner: null,
        });
    }

    // Automatically set winner for BYE matches
    firstRound.forEach(match => {
        if (match.team1 === 'BYE') {
            match.winner = match.team2;
        } else if (match.team2 === 'BYE') {
            match.winner = match.team1;
        }
    });
    
    bracket.push(firstRound);

    let currentRoundSize = Math.ceil(numTeams / 2);
    while (currentRoundSize > 1) {
        currentRoundSize /= 2;
        const nextRound: Matchup[] = [];
        for (let i = 0; i < currentRoundSize; i++) {
            nextRound.push({
                team1: 'Por determinar',
                team2: 'Por determinar',
                winner: null,
            });
        }
        if (nextRound.length > 0) {
          bracket.push(nextRound);
        }
    }

    // Propagate winners from BYE matches in the first round to the second round
    if (bracket.length > 1) {
        for (let i = 0; i < bracket[0].length; i++) {
            const winner = bracket[0][i].winner;
            if (winner) {
                const nextMatchIndex = Math.floor(i / 2);
                const teamPosition = i % 2 === 0 ? 'team1' : 'team2';
                if (bracket[1][nextMatchIndex]) {
                    bracket[1][nextMatchIndex][teamPosition] = winner;
                }
            }
        }
    }
    
    return bracket;
};

interface LeaguesProps {
    managedTeams: ManagedTeam[];
}

const Leagues: React.FC<LeaguesProps> = ({ managedTeams }) => {
    const { user } = useAuth();
    const COMPETITIONS_STORAGE_KEY = useMemo(() => user ? `bb-competitions-${user.id}` : 'bloodbowl-competitions', [user]);

    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
    const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
    
    const [newCompetitionName, setNewCompetitionName] = useState('');
    const [newCompetitionFormat, setNewCompetitionFormat] = useState<'Liguilla' | 'Torneo'>('Liguilla');
    const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
    
    const [scoreModalState, setScoreModalState] = useState<{
        isOpen: boolean;
        roundIndex: number;
        matchIndex: number;
        matchup: Matchup;
    } | null>(null);
    const [isTrophyModalOpen, setIsTrophyModalOpen] = useState(false);
    const [feedback, setFeedback] = useState<{ message: string; matchKey: string; success: boolean } | null>(null);
    const [calendarModalState, setCalendarModalState] = useState<{
        isOpen: boolean;
        matchup: Matchup | null;
        competitionName: string | null;
        matchKey: string | null;
    }>({ isOpen: false, matchup: null, competitionName: null, matchKey: null });


    useEffect(() => {
        try {
            const stored = localStorage.getItem(COMPETITIONS_STORAGE_KEY);
            if (stored) setCompetitions(JSON.parse(stored));
        } catch (error) {
            console.error("Failed to load competitions from localStorage", error);
        }
    }, [COMPETITIONS_STORAGE_KEY]);

    const updateCompetition = (updatedCompetition: Competition) => {
        const updatedCompetitions = competitions.map(c => c.id === updatedCompetition.id ? updatedCompetition : c);
        setCompetitions(updatedCompetitions);
        localStorage.setItem(COMPETITIONS_STORAGE_KEY, JSON.stringify(updatedCompetitions));
        setSelectedCompetition(updatedCompetition);
    };
    
    const handleAddToCalendar = (matchup: Matchup, competitionName: string, matchKey: string, date: Date) => {
        if (!window.gapi || !window.google?.accounts) {
            alert("El cliente de la API de Google aún no se ha cargado. Por favor, espera un momento y vuelve a intentarlo.");
            return;
        }
    
        const clientId = document.querySelector<HTMLMetaElement>('meta[name="google-signin-client_id"]')?.content;
        if (!clientId) {
            alert("Falta el ID de cliente de Google para la configuración del calendario.");
            return;
        }
        
        // Ensure the GAPI client library is loaded before proceeding.
        window.gapi.load('client', () => {
            // Now that gapi.client is available, initialize the token client to get user consent and an access token.
            const tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: 'https://www.googleapis.com/auth/calendar.events',
                callback: (tokenResponse: any) => {
                    setCalendarModalState({ isOpen: false, matchup: null, competitionName: null, matchKey: null });
                    // This callback is executed after the user interacts with the OAuth consent screen.
                    if (tokenResponse && tokenResponse.access_token) {
                        window.gapi.client.setToken(tokenResponse);
                        
                        // Load the specific API (Calendar API) and its discovery document.
                        window.gapi.client.load('calendar', 'v3', () => {
                            const event = {
                                'summary': `Blood Bowl: ${matchup.team1} vs ${matchup.team2}`,
                                'description': `Partido de la competición "${competitionName}".`,
                                'start': {
                                    'date': date.toISOString().split('T')[0], // All-day event for today
                                },
                                'end': {
                                    'date': date.toISOString().split('T')[0],
                                },
                            };
    
                            const request = window.gapi.client.calendar.events.insert({
                                'calendarId': 'primary',
                                'resource': event,
                            });
    
                            // Execute the request and handle the single response object.
                            request.execute((response: any) => {
                                if (response.error) {
                                     console.error("Error from Calendar API:", response.error);
                                     setFeedback({ message: `Error: ${response.error.message}`, matchKey, success: false });
                                } else {
                                     setFeedback({ message: "Evento creado", matchKey, success: true });
                                }
                                setTimeout(() => setFeedback(null), 3000);
                            });
                        });
                    } else if (tokenResponse.error) {
                        // Handle cases where the user denies consent or another OAuth error occurs.
                        console.error('Error getting access token', tokenResponse);
                        setFeedback({ message: "Permiso denegado", matchKey, success: false });
                        setTimeout(() => setFeedback(null), 3000);
                    }
                },
            });
            
            // Trigger the OAuth flow.
            tokenClient.requestAccessToken();
        });
    };
    
    const openCalendarModal = (matchup: Matchup, competitionName: string, matchKey: string) => {
        setCalendarModalState({
            isOpen: true,
            matchup,
            competitionName,
            matchKey
        });
    };


    const handleTeamSelection = (teamName: string) => {
        setSelectedTeams(prev => prev.includes(teamName) ? prev.filter(name => name !== teamName) : [...prev, teamName]);
    };

    const handleCreateCompetition = () => {
        if (!newCompetitionName.trim() || selectedTeams.length < 2) {
            alert("Por favor, pon un nombre a la competición y selecciona al menos 2 equipos.");
            return;
        }

        const newCompetition: Competition = {
            id: Date.now().toString(),
            name: newCompetitionName.trim(),
            format: newCompetitionFormat,
            teams: selectedTeams,
        };

        if (newCompetitionFormat === 'Liguilla') {
            newCompetition.schedule = generateSchedule(selectedTeams);
        } else {
            newCompetition.bracket = generateBracket(selectedTeams);
        }

        const updatedCompetitions = [...competitions, newCompetition];
        setCompetitions(updatedCompetitions);
        localStorage.setItem(COMPETITIONS_STORAGE_KEY, JSON.stringify(updatedCompetitions));
        
        setNewCompetitionName('');
        setSelectedTeams([]);
        setSelectedCompetition(newCompetition);
        setView('detail');
    };

    const isPowerOfTwo = (n: number) => n > 0 && (n & (n - 1)) === 0;

    const handleWinnerSelect = (roundIndex: number, matchIndex: number, winnerTeam: string) => {
        if (!selectedCompetition || !selectedCompetition.bracket) return;

        const newBracket = JSON.parse(JSON.stringify(selectedCompetition.bracket));
        const currentMatch = newBracket[roundIndex][matchIndex];

        const isDeselecting = currentMatch.winner === winnerTeam;

        if (isDeselecting) {
            currentMatch.winner = null;
            let currentRoundIdx = roundIndex;
            let currentMatchIdx = matchIndex;

            while (currentRoundIdx < newBracket.length - 1) {
                const nextRoundIdx = currentRoundIdx + 1;
                const nextMatchIdx = Math.floor(currentMatchIdx / 2);
                const teamPosInNextMatch = currentMatchIdx % 2 === 0 ? 'team1' : 'team2';
                
                const nextMatch = newBracket[nextRoundIdx][nextMatchIdx];
                
                if (nextMatch[teamPosInNextMatch] === winnerTeam) {
                    nextMatch[teamPosInNextMatch] = 'Por determinar';
                    if (nextMatch.winner === winnerTeam) {
                        nextMatch.winner = null;
                    }
                } else {
                    break;
                }
                
                currentRoundIdx = nextRoundIdx;
                currentMatchIdx = nextMatchIdx;
            }
        } else {
            currentMatch.winner = winnerTeam;
            if (roundIndex < newBracket.length - 1) {
                const nextRoundIndex = roundIndex + 1;
                const nextMatchIndex = Math.floor(matchIndex / 2);
                const teamPosition = matchIndex % 2 === 0 ? 'team1' : 'team2';
                newBracket[nextRoundIndex][nextMatchIndex][teamPosition] = winnerTeam;
            }
        }
        
        updateCompetition({ ...selectedCompetition, bracket: newBracket });
    };

    const handleOpenScoreModal = (roundIndex: number, matchIndex: number, matchup: Matchup) => {
        setScoreModalState({ isOpen: true, roundIndex, matchIndex, matchup });
    };

    const handleSaveScore = (score1: string, score2: string) => {
        if (!selectedCompetition || !scoreModalState) return;
        
        let newCompetitionData: Partial<Competition> = {};
        if (selectedCompetition.format === 'Torneo' && selectedCompetition.bracket) {
            const newBracket = JSON.parse(JSON.stringify(selectedCompetition.bracket));
            const matchToUpdate = newBracket[scoreModalState.roundIndex][scoreModalState.matchIndex];
            matchToUpdate.score1 = score1 === '' ? undefined : parseInt(score1, 10);
            matchToUpdate.score2 = score2 === '' ? undefined : parseInt(score2, 10);
            newCompetitionData.bracket = newBracket;
        } else if (selectedCompetition.format === 'Liguilla' && selectedCompetition.schedule) {
            const newSchedule = JSON.parse(JSON.stringify(selectedCompetition.schedule));
            const matchToUpdate = newSchedule[scoreModalState.roundIndex][scoreModalState.matchIndex];
            matchToUpdate.score1 = score1 === '' ? undefined : parseInt(score1, 10);
            matchToUpdate.score2 = score2 === '' ? undefined : parseInt(score2, 10);
            newCompetitionData.schedule = newSchedule;
        }

        updateCompetition({ ...selectedCompetition, ...newCompetitionData });
        setScoreModalState(null);
    };

    const ScoreModal = () => {
        if (!scoreModalState?.isOpen) return null;

        const [scores, setScores] = useState({
            s1: scoreModalState.matchup.score1?.toString() ?? '',
            s2: scoreModalState.matchup.score2?.toString() ?? ''
        });

        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setScoreModalState(null)}>
                <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-sm w-full" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-bold text-amber-400 p-4 border-b border-slate-700">Editar Resultado</h3>
                    <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <label htmlFor="score1" className="flex-1 text-slate-300 text-right truncate">{scoreModalState.matchup.team1}</label>
                            <input id="score1" type="number" value={scores.s1} onChange={e => setScores(s => ({...s, s1: e.target.value}))} className="w-20 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white text-center" autoFocus/>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <label htmlFor="score2" className="flex-1 text-slate-300 text-right truncate">{scoreModalState.matchup.team2}</label>
                            <input id="score2" type="number" value={scores.s2} onChange={e => setScores(s => ({...s, s2: e.target.value}))} className="w-20 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white text-center" />
                        </div>
                    </div>
                    <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end gap-3">
                        <button onClick={() => setScoreModalState(null)} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-md">Cancelar</button>
                        <button onClick={() => handleSaveScore(scores.s1, scores.s2)} className="bg-amber-500 text-slate-900 font-bold py-2 px-4 rounded-md">Guardar</button>
                    </div>
                </div>
            </div>
        );
    }
    
    const CalendarModal = ({ isOpen, onClose, onConfirm, matchup }: { isOpen: boolean, onClose: () => void, onConfirm: (date: Date) => void, matchup: Matchup | null }) => {
        if (!isOpen || !matchup) return null;

        const [currentDate, setCurrentDate] = useState(new Date());
        const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

        const changeMonth = (offset: number) => {
            setCurrentDate(prev => {
                const newDate = new Date(prev);
                newDate.setMonth(newDate.getMonth() + offset);
                return newDate;
            });
        };

        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0=Sun, 1=Mon...
        const startingDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // 0=Mon, 1=Tue...

        const monthDays: (number | null)[] = [];
        for (let i = 0; i < startingDayIndex; i++) {
            monthDays.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            monthDays.push(i);
        }

        const handleDateSelect = (day: number) => {
            const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            setSelectedDate(newSelectedDate);
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4" onClick={onClose}>
                <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-sm w-full" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-bold text-amber-400 p-4 border-b border-slate-700">Seleccionar Fecha del Partido</h3>
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-700">&lt;</button>
                            <span className="font-semibold text-white capitalize">
                                {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                            </span>
                            <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-700">&gt;</button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 mb-2">
                            <span>Lu</span><span>Ma</span><span>Mi</span><span>Ju</span><span>Vi</span><span>Sá</span><span>Do</span>
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {monthDays.map((day, index) => {
                                if (!day) return <div key={`empty-${index}`}></div>;
                                
                                const isSelected = selectedDate &&
                                    selectedDate.getDate() === day &&
                                    selectedDate.getMonth() === currentDate.getMonth() &&
                                    selectedDate.getFullYear() === currentDate.getFullYear();
                                
                                return (
                                    <button
                                        key={day}
                                        onClick={() => handleDateSelect(day)}
                                        className={`py-2 rounded-md transition-colors text-sm ${
                                            isSelected ? 'bg-amber-500 text-slate-900 font-bold' : 'hover:bg-slate-700 text-white'
                                        }`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end gap-3">
                        <button onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-md">Cancelar</button>
                        <button 
                            onClick={() => selectedDate && onConfirm(selectedDate)}
                            disabled={!selectedDate}
                            className="bg-green-600 text-white font-bold py-2 px-4 rounded-md disabled:bg-slate-500 disabled:cursor-not-allowed"
                        >
                            Añadir al Calendario
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderListView = () => (
        <div className="text-center p-4">
            <h2 className="text-3xl font-bold text-amber-400 mb-6">Competiciones</h2>
            {competitions.length > 0 ? (
                <div className="space-y-3 mb-6">
                    {competitions.map(comp => (
                        <button key={comp.id} onClick={() => { setSelectedCompetition(comp); setView('detail'); }} className="w-full max-w-md mx-auto bg-slate-700/50 p-4 rounded-lg shadow-md hover:bg-slate-700 transition-colors">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold text-white">{comp.name}</p>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${comp.format === 'Liguilla' ? 'bg-sky-700 text-sky-200' : 'bg-purple-700 text-purple-200'}`}>{comp.format}</span>
                            </div>
                            <p className="text-xs text-slate-400 text-left mt-1">{comp.teams.length} equipos</p>
                        </button>
                    ))}
                </div>
            ) : (
                <p className="text-slate-400 mb-6">Aún no has creado ninguna competición.</p>
            )}
            <button onClick={() => setView('create')} className="bg-amber-500 text-slate-900 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-amber-400 transform hover:scale-105">
                Crear Competición
            </button>
        </div>
    );

    const renderCreateView = () => (
        <div className="max-w-3xl mx-auto p-4">
            <button onClick={() => setView('list')} className="text-amber-400 hover:underline mb-4 text-sm">&larr; Volver</button>
            <h2 className="text-3xl font-bold text-amber-400 mb-6 text-center">Crear Nueva Competición</h2>
            <div className="space-y-6 bg-slate-900/50 p-6 rounded-lg border border-slate-700">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Nombre de la Competición</label>
                    <input type="text" value={newCompetitionName} onChange={e => setNewCompetitionName(e.target.value)} className="w-full bg-slate-900 border-2 border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-amber-500 focus:border-amber-500" placeholder="Ej: Torneo del Cráneo Roto" />
                </div>
                 <div>
                    <p className="text-sm font-medium text-slate-300 mb-2">Formato</p>
                    <div className="flex gap-4 p-2 bg-slate-900 rounded-lg">
                        {(['Liguilla', 'Torneo'] as const).map(format => (
                             <button key={format} onClick={() => setNewCompetitionFormat(format)} className={`flex-1 py-2 rounded-md text-sm font-bold transition-colors ${newCompetitionFormat === format ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                                {format === 'Torneo' ? 'Torneo (Eliminatoria)' : format}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-slate-300">Selecciona los Equipos ({selectedTeams.length})</label>
                        {managedTeams.length > 0 && (
                            <button
                                onClick={() => {
                                    if (selectedTeams.length === managedTeams.length) {
                                        setSelectedTeams([]);
                                    } else {
                                        setSelectedTeams(managedTeams.map(t => t.name));
                                    }
                                }}
                                className="text-xs text-amber-400 hover:underline"
                            >
                                {selectedTeams.length === managedTeams.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                            </button>
                        )}
                    </div>
                    {newCompetitionFormat === 'Torneo' && !isPowerOfTwo(selectedTeams.length) && selectedTeams.length > 1 && (
                         <p className="text-xs text-yellow-400 mb-2">Consejo: Los torneos funcionan mejor con un número de equipos que sea potencia de 2 (2, 4, 8...).</p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 bg-slate-900 rounded-lg">
                        {managedTeams.length > 0 ? managedTeams.map(team => (
                            <div key={team.name} className={`p-3 rounded-md cursor-pointer transition-colors ${selectedTeams.includes(team.name) ? 'bg-amber-600/80 text-white' : 'bg-slate-700/50 hover:bg-slate-700 text-slate-200'}`} onClick={() => handleTeamSelection(team.name)}>
                                <span className="font-semibold">{team.name}</span>
                            </div>
                        )) : <p className="text-slate-500 p-2">No hay equipos creados en el Gestor.</p>}
                    </div>
                </div>
                <div className="text-center pt-4">
                    <button onClick={handleCreateCompetition} className="bg-green-600 text-white font-bold py-3 px-12 rounded-lg shadow-lg hover:bg-green-500">
                        Generar Competición
                    </button>
                </div>
            </div>
        </div>
    );
    
    const renderDetailView = () => {
        if (!selectedCompetition) return null;
        const isGoogleUser = user && !user.id.startsWith('guest-');
        
        const renderSchedule = (schedule: Matchup[][]) => (
             <div className="space-y-6">
                {schedule.map((round, index) => (
                    <div key={index} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-xl font-semibold text-amber-300 mb-3">Ronda {index + 1}</h3>
                        <div className="space-y-2">
                            {round.map((matchup, matchIndex) => {
                                const matchKey = `${index}-${matchIndex}`;
                                return (
                                <div key={matchIndex} className="flex justify-center items-center gap-2 p-2 bg-slate-800/70 rounded-md">
                                    <span className="font-semibold text-white text-right w-2/5 truncate">{matchup.team1}</span>
                                    <span className="text-slate-400 font-bold">vs</span>
                                    <span className="font-semibold text-white text-left w-2/5 truncate">{matchup.team2}</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleOpenScoreModal(index, matchIndex, matchup)} className="p-1 rounded-full hover:bg-slate-700"><PencilIcon className="w-4 h-4 text-slate-400" /></button>
                                        {isGoogleUser && (
                                            <div className="relative">
                                                <button onClick={() => openCalendarModal(matchup, selectedCompetition.name, matchKey)} className="p-1 rounded-full hover:bg-slate-700"><CalendarIcon className="w-4 h-4 text-slate-400" /></button>
                                                {feedback?.matchKey === matchKey && <span className={`absolute -top-6 right-0 text-xs px-2 py-1 rounded-md ${feedback.success ? 'bg-green-600' : 'bg-red-600'} text-white`}>{feedback.message}</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>
                ))}
            </div>
        );

        const renderBracket = (bracket: Matchup[][]) => {
            if (!bracket || bracket.length === 0) return null;
        
            const allRounds = JSON.parse(JSON.stringify(bracket));
            const finalRound = allRounds.length > 1 ? allRounds.pop() : null;
            const finalMatchup = finalRound ? finalRound[0] : allRounds[0][0];
            const semifinalRounds = finalRound ? allRounds : [];
        
            const midPointOfFirstRound = semifinalRounds.length > 0 ? Math.ceil(semifinalRounds[0].length / 2) : 0;
        
            const leftRounds = semifinalRounds.map(round => round.slice(0, midPointOfFirstRound));
            const rightRounds = semifinalRounds.map(round => round.slice(midPointOfFirstRound));
            const rightSideMatchIndexOffset = leftRounds.length > 0 ? leftRounds[0].length : 0;
        
            const TrophyModal = () => (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4 animate-fade-in-fast"
                    onClick={() => setIsTrophyModalOpen(false)}
                >
                    <img src={trophyImageUrl} alt="Trofeo del Torneo Ampliado" className="w-64 h-64 sm:w-96 sm:h-96 object-contain trophy-modal-icon" />
                </div>
            );
        
            const MatchupComponent = ({ matchup, roundIndex, matchIndex, isFinal = false }: { matchup: Matchup, roundIndex: number, matchIndex: number, isFinal?: boolean }) => {
                const isTeam1Winner = matchup.winner === matchup.team1 && matchup.team1 !== 'Por determinar' && matchup.team1 !== 'BYE';
                const isTeam2Winner = matchup.winner === matchup.team2 && matchup.team2 !== 'Por determinar' && matchup.team2 !== 'BYE';
                const matchKey = `${roundIndex}-${matchIndex}`;
            
                return (
                    <div className={`bracket-matchup ${isFinal ? 'final' : ''}`}>
                        <button 
                            onClick={() => handleWinnerSelect(roundIndex, matchIndex, matchup.team1)} 
                            disabled={matchup.team1 === 'Por determinar' || matchup.team1 === 'BYE'} 
                            className={`bracket-team ${matchup.team1 === 'Por determinar' || matchup.team1 === 'BYE' ? 'bracket-team-placeholder' : 'hover:bg-slate-700'}`}
                        >
                            <span className={`truncate ${isTeam1Winner ? 'text-amber-400 font-semibold' : ''}`}>{matchup.team1}</span>
                            <span className={`bracket-score ${isTeam1Winner ? 'text-amber-400' : 'text-white'}`}>{matchup.score1 ?? ''}</span>
                        </button>
                        <div className="bracket-vs-section">
                            {feedback?.matchKey === matchKey ? <span className={`text-xs px-1 rounded ${feedback.success ? 'bg-green-600' : 'bg-red-600'} text-white`}>{feedback.message}</span> : <button onClick={() => handleOpenScoreModal(roundIndex, matchIndex, matchup)} className="score-edit-btn"><PencilIcon className="w-3 h-3 text-slate-400 hover:text-white" /></button>}
                            {isGoogleUser && matchup.team1 !== 'Por determinar' && matchup.team1 !== 'BYE' && matchup.team2 !== 'Por determinar' && matchup.team2 !== 'BYE' &&
                              <button onClick={() => openCalendarModal(matchup, selectedCompetition.name, matchKey)} className="score-edit-btn ml-2"><CalendarIcon className="w-3.5 h-3.5 text-slate-400 hover:text-white"/></button>
                            }
                        </div>
                        <button 
                            onClick={() => handleWinnerSelect(roundIndex, matchIndex, matchup.team2)} 
                            disabled={matchup.team2 === 'Por determinar' || matchup.team2 === 'BYE'} 
                            className={`bracket-team ${matchup.team2 === 'Por determinar' || matchup.team2 === 'BYE' ? 'bracket-team-placeholder' : 'hover:bg-slate-700'}`}
                        >
                            <span className={`truncate ${isTeam2Winner ? 'text-amber-400 font-semibold' : ''}`}>{matchup.team2}</span>
                            <span className={`bracket-score ${isTeam2Winner ? 'text-amber-400' : 'text-white'}`}>{matchup.score2 ?? ''}</span>
                        </button>
                    </div>
                );
            };
        
            return (
                <div className="bracket-container">
                    {isTrophyModalOpen && <TrophyModal />}
                     <style>{`
                        .bracket-container { overflow-x: auto; padding: 2rem 0.5rem; scrollbar-width: thin; scrollbar-color: #475569 #1e293b; }
                        .bracket-main { display: flex; justify-content: center; align-items: stretch; min-width: max-content; }
                        .bracket-side { display: flex; flex-direction: row; flex: 1; }
                        .bracket-side.right { flex-direction: row-reverse; }
                        .bracket-round { display: flex; flex-direction: column; justify-content: space-around; flex-grow: 1; min-width: 14rem; padding: 0 1rem; }
                        .bracket-matchup { position: relative; background-color: #1e293b; border: 1px solid #334155; border-radius: 0.375rem; margin: 1.5rem 0; display: flex; flex-direction: column; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); }
                        .bracket-round > div:first-child .bracket-matchup { margin-top: 0; }
                        .bracket-round > div:last-child .bracket-matchup { margin-bottom: 0; }
                        .bracket-team { padding: 0.5rem 0.75rem; color: #cbd5e1; font-size: 0.875rem; min-height: 2.5rem; display: flex; align-items: center; justify-content: space-between; line-height: 1.2; width: 100%; text-align: left; cursor: pointer; transition: background-color 0.2s; }
                        .bracket-team:disabled { cursor: not-allowed; }
                        .bracket-team-placeholder { color: #64748b; font-style: italic; }
                        .bracket-vs-section { display: flex; justify-content: center; align-items: center; border-top: 1px solid #475569; border-bottom: 1px solid #475569; padding: 2px 0.75rem; min-height: 24px; }
                        .bracket-score { font-weight: bold; min-width: 1.5rem; text-align: right; }
                        .score-edit-btn { padding: 0.25rem; border-radius: 9999px; line-height: 0; transition: background-color 0.2s; }
                        .score-edit-btn:hover { background-color: #334155; }
                        .bracket-matchup:not(.final)::after { content: ''; position: absolute; top: 50%; width: 1rem; height: 2px; background-color: #475569; }
                        .bracket-side.left .bracket-matchup:not(.final)::after { right: -1rem; }
                        .bracket-side.right .bracket-matchup:not(.final)::after { left: -1rem; }
                        .bracket-round > div:nth-of-type(2n-1) .bracket-matchup::before { content: ''; position: absolute; top: 50%; height: calc(100% + 3rem); width: 2px; background-color: #475569; z-index: -1; }
                        .bracket-side.left .bracket-round > div:nth-of-type(2n-1) .bracket-matchup::before { right: -1rem; border-top-right-radius: 0.375rem; border-bottom-right-radius: 0.375rem;}
                        .bracket-side.right .bracket-round > div:nth-of-type(2n-1) .bracket-matchup::before { left: -1rem; border-top-left-radius: 0.375rem; border-bottom-left-radius: 0.375rem;}
                        .bracket-final-column { display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 0 1rem; }
                        .bracket-final-column .bracket-matchup { margin: 0; min-width: 14rem; }
                        .bracket-final-column .bracket-matchup::before, .bracket-final-column .bracket-matchup::after { content: ''; position: absolute; top: 50%; width: 1rem; height: 2px; background-color: #475569; }
                        .bracket-final-column .bracket-matchup::before { left: -1rem; }
                        .bracket-final-column .bracket-matchup::after { display: none; }
                        .champion-display { text-align: center; margin-top: 1.5rem; }
                        .champion-title { font-size: 0.875rem; color: #94a3b8; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }
                        .champion-name { font-size: 1.875rem; font-weight: 800; color: #f59e0b; line-height: 1; }
                        @keyframes trophy-glow-animation { 0%, 100% { filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.4)); } 50% { filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.8)); } }
                        .trophy-display-icon { animation: trophy-glow-animation 3s infinite ease-in-out; }
                        .trophy-modal-icon { filter: drop-shadow(0 0 25px rgba(251, 191, 36, 0.8)); }
                    `}</style>
                    <div className="bracket-main">
                        <div className="bracket-side left">
                            {leftRounds.map((round, i) => (
                                <div key={`left-round-${i}`} className="bracket-round">
                                    {round.map((matchup, j) => (<div key={`left-match-${i}-${j}`}><MatchupComponent matchup={matchup} roundIndex={i} matchIndex={j} /></div>))}
                                </div>
                            ))}
                        </div>
                        <div className="bracket-final-column">
                            <button onClick={() => setIsTrophyModalOpen(true)} className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-amber-400 rounded-full mb-6">
                                <img src={trophyImageUrl} alt="Trofeo del Torneo" className="w-24 h-24 sm:w-32 sm:h-32 object-contain trophy-display-icon"/>
                            </button>
                            {finalMatchup && <MatchupComponent matchup={finalMatchup} roundIndex={semifinalRounds.length} matchIndex={0} isFinal={true} />}
                            {finalMatchup?.winner && finalMatchup.winner !== 'Por determinar' && (
                                <div className="champion-display">
                                    <p className="champion-title">Campeón</p>
                                    <p className="champion-name">{finalMatchup.winner}</p>
                                </div>
                            )}
                        </div>
                        <div className="bracket-side right">
                            {rightRounds.map((round, i) => (
                                <div key={`right-round-${i}`} className="bracket-round">
                                    {round.map((matchup, j) => (<div key={`right-match-${i}-${j}`}><MatchupComponent matchup={matchup} roundIndex={i} matchIndex={rightSideMatchIndexOffset + j} /></div>))}
                                </div>
                            )).reverse()}
                        </div>
                    </div>
                </div>
            );
        };
        
        return (
            <div>
                <button onClick={() => { setSelectedCompetition(null); setView('list'); }} className="text-amber-400 hover:underline mb-4 text-sm px-4 sm:px-0">&larr; Volver a Competiciones</button>
                <h2 className="text-3xl font-bold text-amber-400 mb-2 text-center">{selectedCompetition.name}</h2>
                <p className="text-slate-400 text-center mb-6">{selectedCompetition.format === 'Liguilla' ? 'Calendario de Partidos' : 'Cuadro del Torneo'}</p>
                {selectedCompetition.format === 'Liguilla' && selectedCompetition.schedule && <div className="p-4">{renderSchedule(selectedCompetition.schedule)}</div>}
                {selectedCompetition.format === 'Torneo' && selectedCompetition.bracket && renderBracket(selectedCompetition.bracket)}
            </div>
        );
    };

    return (
        <div className="animate-fade-in-slow">
            {view === 'list' && renderListView()}
            {view === 'create' && renderCreateView()}
            {view === 'detail' && renderDetailView()}
            <ScoreModal />
            <CalendarModal 
                isOpen={calendarModalState.isOpen}
                onClose={() => setCalendarModalState({ isOpen: false, matchup: null, competitionName: null, matchKey: null })}
                onConfirm={(date) => {
                    if (calendarModalState.matchup && calendarModalState.competitionName && calendarModalState.matchKey) {
                        handleAddToCalendar(calendarModalState.matchup, calendarModalState.competitionName, calendarModalState.matchKey, date);
                    }
                }}
                matchup={calendarModalState.matchup}
            />
        </div>
    );
};

export default Leagues;