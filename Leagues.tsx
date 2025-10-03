import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { ManagedTeam, Competition, Matchup } from '../types';
import PencilIcon from './icons/PencilIcon';
import CalendarIcon from './icons/CalendarIcon';
import QrCodeIcon from './icons/QrCodeIcon';

// FIX: Declare gapi and google on the window object for TypeScript.
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}
declare const QRCode: any;
declare const Html5Qrcode: any;

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
    initialCompetitions: Competition[];
    onCompetitionCreate: (comp: Omit<Competition, 'id'>) => void;
    onCompetitionUpdate: (comp: Competition) => void;
    isGuest: boolean;
}

const Leagues: React.FC<LeaguesProps> = ({ managedTeams, initialCompetitions, onCompetitionCreate, onCompetitionUpdate, isGuest }) => {
    const { user } = useAuth();
    const [competitions, setCompetitions] = useState<Competition[]>(initialCompetitions);
    const [view, setView] = useState<'list' | 'create' | 'detail' | 'scan'>('list');
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
    const [isQrExportModalOpen, setIsQrExportModalOpen] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const qrCanvasRef = useRef<HTMLCanvasElement>(null);
    const scannerContainerRef = useRef<HTMLDivElement>(null);
    const scannerRef = useRef<any>(null);

    useEffect(() => {
        setCompetitions(initialCompetitions);
    }, [initialCompetitions]);
    
    useEffect(() => {
        if (isQrExportModalOpen && qrCanvasRef.current && selectedCompetition) {
            const compJson = JSON.stringify(selectedCompetition);
            QRCode.toCanvas(qrCanvasRef.current, compJson, { width: 256, margin: 2, errorCorrectionLevel: 'L' }, function (error: any) {
              if (error) {
                  console.error(error);
                  alert('Error al generar el QR: los datos de la competición son demasiado grandes.');
                  setIsQrExportModalOpen(false);
              }
            })
        }
    }, [isQrExportModalOpen, selectedCompetition]);
    
    useEffect(() => {
        if (view === 'scan' && scannerContainerRef.current) {
            scannerRef.current = new Html5Qrcode(scannerContainerRef.current.id);
            scannerRef.current.start(
                { facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText: string) => {
                    scannerRef.current.stop();
                    try {
                        const importedComp = JSON.parse(decodedText) as Competition;
                        if (!importedComp.id || !importedComp.name || !importedComp.format || !importedComp.teams) {
                            throw new Error("El código QR no contiene una competición válida.");
                        }

                        const existingIndex = competitions.findIndex(c => c.id === importedComp.id);
                        if (existingIndex > -1) {
                            if (window.confirm(`Ya existe una competición llamada "${importedComp.name}". ¿Quieres sobrescribirla con los datos importados?`)) {
                                onCompetitionUpdate(importedComp);
                            }
                        } else {
                            onCompetitionCreate(importedComp);
                        }
                        setView('list');

                    } catch (e: any) {
                        setScanError(`Error al procesar el código QR: ${e.message}`);
                    }
                }, () => {} 
            ).catch((err: any) => {
                console.error("Error al iniciar escáner", err);
                setScanError(`Error al iniciar la cámara: ${err}. Es posible que necesites dar permisos en tu navegador.`);
            });
        }
        return () => { if (scannerRef.current && scannerRef.current.isScanning) { scannerRef.current.stop().catch((e:any) => console.warn("Error al detener escáner.", e)); }};
    }, [view, competitions, onCompetitionCreate, onCompetitionUpdate]);

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
        
        window.gapi.load('client', () => {
            const tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: 'https://www.googleapis.com/auth/calendar.events',
                callback: (tokenResponse: any) => {
                    setCalendarModalState({ isOpen: false, matchup: null, competitionName: null, matchKey: null });
                    if (tokenResponse && tokenResponse.access_token) {
                        window.gapi.client.setToken(tokenResponse);
                        
                        window.gapi.client.load('calendar', 'v3', () => {
                            const event = {
                                'summary': `Blood Bowl: ${matchup.team1} vs ${matchup.team2}`,
                                'description': `Partido de la competición "${competitionName}".`,
                                'start': {
                                    'date': date.toISOString().split('T')[0],
                                },
                                'end': {
                                    'date': date.toISOString().split('T')[0],
                                },
                            };
    
                            const request = window.gapi.client.calendar.events.insert({
                                'calendarId': 'primary',
                                'resource': event,
                            });
    
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
                        console.error('Error getting access token', tokenResponse);
                        setFeedback({ message: "Permiso denegado", matchKey, success: false });
                        setTimeout(() => setFeedback(null), 3000);
                    }
                },
            });
            
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

        const newCompetition: Omit<Competition, 'id'> = {
            name: newCompetitionName.trim(),
            format: newCompetitionFormat,
            teams: selectedTeams,
        };

        if (newCompetitionFormat === 'Liguilla') {
            newCompetition.schedule = generateSchedule(selectedTeams);
        } else {
            newCompetition.bracket = generateBracket(selectedTeams);
        }

        onCompetitionCreate(newCompetition);
        
        setNewCompetitionName('');
        setSelectedTeams([]);
        // The view will be updated by the parent component, but we can optimistically switch
        setView('detail');
        // We set the selected competition based on the newly created one, but we need to find it
        // This is a bit tricky without the ID. We'll rely on the parent updating the props.
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
        
        onCompetitionUpdate({ ...selectedCompetition, bracket: newBracket });
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

        onCompetitionUpdate({ ...selectedCompetition, ...newCompetitionData });
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
                            <div className="flex justify-between items-center