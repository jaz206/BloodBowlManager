

import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { ManagedTeam, Competition, Matchup } from '../types';
import { useAuth } from '../hooks/useAuth';
import PencilIcon from './icons/PencilIcon';
import CalendarIcon from './icons/CalendarIcon';
import QrCodeIcon from './icons/QrCodeIcon';

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
const generateSchedule = (teamNames: string[]): Record<string, Matchup[]> => {
  const teams = [...teamNames];
  if (teams.length % 2 !== 0) {
    teams.push('BYE'); // Add a bye if odd number of teams
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

    // Rotate team indices, keeping the first one fixed
    const last = teamIndices.pop()!;
    teamIndices.splice(1, 0, last);
  }
  return rounds;
};

// Helper to generate a single-elimination tournament bracket
const generateBracket = (teamNames: string[]): Record<string, Matchup[]> => {
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

    const bracket: Record<string, Matchup[]> = {};

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
    
    bracket['0'] = firstRound;

    let currentRoundSize = Math.ceil(numTeams / 2);
    let roundIndex = 1;
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
          bracket[roundIndex.toString()] = nextRound;
        }
        roundIndex++;
    }

    // Propagate winners from BYE matches in the first round to the second round
    if (bracket['1']) {
        for (let i = 0; i < bracket['0'].length; i++) {
            const winner = bracket['0'][i].winner;
            if (winner) {
                const nextMatchIndex = Math.floor(i / 2);
                const teamPosition = i % 2 === 0 ? 'team1' : 'team2';
                if (bracket['1'][nextMatchIndex]) {
                    (bracket['1'][nextMatchIndex] as any)[teamPosition] = winner;
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

export const Leagues: React.FC<LeaguesProps> = ({ managedTeams, initialCompetitions, onCompetitionCreate, onCompetitionUpdate, isGuest }) => {
    const { user } = useAuth();
    const [competitions, setCompetitions] = useState<Competition[]>(initialCompetitions);
    const [view, setView] = useState<'list' | 'create' | 'detail' | 'scan'>('list');
    const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
    
    const [newCompetitionName, setNewCompetitionName] = useState('');
    const [newCompetitionFormat, setNewCompetitionFormat] = useState<'Liguilla' | 'Torneo'>('Liguilla');
    const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
    
    const [scoreModalState, setScoreModalState] = useState<{
        isOpen: boolean;
        roundIndex: string;
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
        if (!window.google?.accounts) {
            alert("El cliente de la API de Google aún no se ha cargado. Por favor, espera un momento y vuelve a intentarlo.");
            return;
        }
    
        const clientId = document.querySelector<HTMLMetaElement>('meta[name="google-signin-client_id"]')?.content;
        if (!clientId) {
            alert("Falta el ID de cliente de Google para la configuración del calendario.");
            return;
        }
        
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'https://www.googleapis.com/auth/calendar.events',
            callback: async (tokenResponse: any) => {
                setCalendarModalState({ isOpen: false, matchup: null, competitionName: null, matchKey: null });
                if (tokenResponse && tokenResponse.access_token) {
                     try {
                        const event = {
                            'summary': `Blood Bowl: ${matchup.team1} vs ${matchup.team2}`,
                            'description': `Partido de la competición "${competitionName}".`,
                            'start': { 'date': date.toISOString().split('T')[0] },
                            'end': { 'date': date.toISOString().split('T')[0] },
                        };

                        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${tokenResponse.access_token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(event)
                        });

                        const data = await response.json();

                        if (!response.ok) {
                            console.error("Error from Calendar API:", data.error);
                            throw new Error(data.error?.message || 'Error al crear el evento.');
                        }
                        
                        setFeedback({ message: "Evento creado", matchKey, success: true });

                    } catch (error) {
                        console.error("Error creating calendar event:", error);
                        const errorMessage = error instanceof Error ? error.message : 'Error de red.';
                        setFeedback({ message: `Error: ${errorMessage}`, matchKey, success: false });
                    } finally {
                        setTimeout(() => setFeedback(null), 3000);
                    }
                } else if (tokenResponse.error) {
                    console.error('Error getting access token', tokenResponse);
                    setFeedback({ message: "Permiso denegado", matchKey, success: false });
                    setTimeout(() => setFeedback(null), 3000);
                }
            },
        });
            
        tokenClient.requestAccessToken();
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

    const handleWinnerSelect = (roundIndexStr: string, matchIndex: number, winnerTeam: string) => {
        if (!selectedCompetition || !selectedCompetition.bracket) return;
        
        const roundIndex = parseInt(roundIndexStr, 10);
        const newBracket = JSON.parse(JSON.stringify(selectedCompetition.bracket));
        const currentMatch = newBracket[roundIndexStr][matchIndex];
        const numRounds = Object.keys(newBracket).length;

        const isDeselecting = currentMatch.winner === winnerTeam;

        if (isDeselecting) {
            currentMatch.winner = null;
            let currentRoundIdx = roundIndex;
            let currentMatchIdx = matchIndex;

            while (currentRoundIdx < numRounds - 1) {
                const nextRoundIdx = currentRoundIdx + 1;
                const nextMatchIdx = Math.floor(currentMatchIdx / 2);
                const teamPosInNextMatch = currentMatchIdx % 2 === 0 ? 'team1' : 'team2';
                
                const nextMatch = newBracket[nextRoundIdx.toString()][nextMatchIdx];
                
                if ((nextMatch as any)[teamPosInNextMatch] === winnerTeam) {
                    (nextMatch as any)[teamPosInNextMatch] = 'Por determinar';
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
            if (roundIndex < numRounds - 1) {
                const nextRoundIndex = roundIndex + 1;
                const nextMatchIndex = Math.floor(matchIndex / 2);
                const teamPosition = matchIndex % 2 === 0 ? 'team1' : 'team2';
                (newBracket[nextRoundIndex.toString()][nextMatchIndex] as any)[teamPosition] = winnerTeam;
            }
        }
        
        const updatedComp = { ...selectedCompetition, bracket: newBracket };
        onCompetitionUpdate(updatedComp);
        setSelectedCompetition(updatedComp); // Optimistic update
    };

    const handleOpenScoreModal = (roundIndex: string, matchIndex: number, matchup: Matchup) => {
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

        const updatedComp = { ...selectedCompetition, ...newCompetitionData };
        onCompetitionUpdate(updatedComp);
        setSelectedCompetition(updatedComp); // Optimistic update
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
                                <span className="font-semibold text-white">{comp.name}</span>
                                <span className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded-full">{comp.format}</span>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <p className="text-slate-400 mb-6">No has creado ninguna competición.</p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => setView('create')} className="bg-amber-500 text-slate-900 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/50 transform hover:scale-105">
                    Crear Nueva Competición
                </button>
                <button
                    onClick={() => setView('scan')}
                    disabled={isGuest}
                    className="bg-sky-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/50 transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed"
                    title={isGuest ? "No disponible para invitados" : "Importar competición escaneando un código QR"}
                >
                    Importar con QR
                </button>
            </div>
        </div>
    );

    const renderCreateView = () => (
        <div className="p-4 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-amber-400 mb-4">Nueva Competición</h2>
            <div className="space-y-4">
                <div>
                    <label htmlFor="compName" className="block text-sm font-medium text-slate-300 mb-1">Nombre de la Competición</label>
                    <input id="compName" type="text" value={newCompetitionName} onChange={e => setNewCompetitionName(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Formato</label>
                    <select value={newCompetitionFormat} onChange={e => setNewCompetitionFormat(e.target.value as any)} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white">
                        <option>Liguilla</option>
                        <option>Torneo</option>
                    </select>
                     {newCompetitionFormat === 'Torneo' && !isPowerOfTwo(selectedTeams.length) && selectedTeams.length > 0 && (
                        <p className="text-xs text-yellow-400 mt-2">
                            Aviso: Los torneos funcionan mejor con un número de equipos que sea una potencia de 2 (2, 4, 8, 16...). Con {selectedTeams.length} equipos, se añadirán rondas de clasificación o "BYEs" automáticamente.
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Equipos Participantes ({selectedTeams.length})</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto bg-slate-900/50 p-2 rounded-md border border-slate-700">
                        {managedTeams.map(team => (
                            <div key={team.id} className="flex items-center bg-slate-700/50 p-2 rounded-md">
                                <input type="checkbox" id={`team-${team.id}`} checked={selectedTeams.includes(team.name)} onChange={() => handleTeamSelection(team.name)} className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"/>
                                <label htmlFor={`team-${team.id}`} className="ml-3 block text-sm font-medium text-slate-200">{team.name}</label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-between items-center pt-4">
                    <button onClick={() => setView('list')} className="text-amber-400 hover:underline">Cancelar</button>
                    <button onClick={handleCreateCompetition} className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md shadow-md hover:bg-amber-400">Crear</button>
                </div>
            </div>
        </div>
    );

    const renderDetailView = () => {
        if (!selectedCompetition) return null;

        const standings = useMemo(() => {
            if (selectedCompetition.format !== 'Liguilla' || !selectedCompetition.schedule) return [];
            return selectedCompetition.teams.map(teamName => {
                let played = 0, wins = 0, losses = 0, draws = 0, tdFor = 0, tdAgainst = 0;
                Object.values(selectedCompetition.schedule!).forEach(round => {
                    // @FIX: Cast `round` to `Matchup[]` to resolve 'unknown' type error.
                    (round as Matchup[]).forEach(match => {
                        if (match.team1 === teamName || match.team2 === teamName) {
                            if (match.score1 !== undefined && match.score2 !== undefined) {
                                played++;
                                const isTeam1 = match.team1 === teamName;
                                const scoreFor = isTeam1 ? match.score1 : match.score2;
                                const scoreAgainst = isTeam1 ? match.score2 : match.score1;
                                tdFor += scoreFor;
                                tdAgainst += scoreAgainst;
                                if (scoreFor > scoreAgainst) wins++;
                                else if (scoreFor < scoreAgainst) losses++;
                                else draws++;
                            }
                        }
                    });
                });
                return { name: teamName, p: played, w: wins, d: draws, l: losses, tdFor, tdAgainst, pts: wins * 3 + draws };
            }).sort((a, b) => b.pts - a.pts || (b.tdFor - b.tdAgainst) - (a.tdFor - a.tdAgainst) || b.tdFor - a.tdFor);
        }, [selectedCompetition]);
            
        const finalWinner = useMemo(() => {
            if (selectedCompetition.format !== 'Torneo' || !selectedCompetition.bracket) return null;
            const roundKeys = Object.keys(selectedCompetition.bracket);
            const finalRoundKey = roundKeys[roundKeys.length - 1];
            return selectedCompetition.bracket[finalRoundKey]?.[0]?.winner;
        }, [selectedCompetition]);

        return (
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setView('list')} className="text-amber-400 hover:underline">&larr; Volver a la lista</button>
                    {!isGuest && (
                        <button onClick={() => setIsQrExportModalOpen(true)} className="flex items-center gap-2 bg-slate-700 text-slate-200 font-bold py-2 px-4 rounded-lg shadow-md hover:bg-slate-600 transition-colors">
                            <QrCodeIcon /> Exportar
                        </button>
                    )}
                </div>
                <h2 className="text-2xl font-bold text-amber-400 text-center">{selectedCompetition.name}</h2>
                <p className="text-center text-slate-400 mb-6">{selectedCompetition.format}</p>

                {finalWinner && finalWinner !== 'Por determinar' && (
                     <div className="text-center p-6 mb-6 bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 rounded-lg border-2 border-amber-600 shadow-xl relative overflow-hidden">
                        <img src={trophyImageUrl} alt="Trophy" className="absolute -left-16 -top-16 w-48 h-48 opacity-10 filter grayscale" />
                        <h3 className="text-2xl font-bold text-amber-300">¡Campeón del Torneo!</h3>
                        <p className="text-4xl font-extrabold text-white mt-2">{finalWinner}</p>
                    </div>
                )}

                {selectedCompetition.format === 'Liguilla' && (
                    <>
                        <h3 className="text-xl font-semibold text-amber-300 mb-2">Clasificación</h3>
                        <div className="overflow-x-auto mb-6">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-slate-700 text-amber-300">
                                    <tr>
                                        <th className="p-2">Equipo</th>
                                        <th className="p-2 text-center">PJ</th>
                                        <th className="p-2 text-center">G</th>
                                        <th className="p-2 text-center">E</th>
                                        <th className="p-2 text-center">P</th>
                                        <th className="p-2 text-center">TD+</th>
                                        <th className="p-2 text-center">TD-</th>
                                        <th className="p-2 text-center">+/-</th>
                                        <th className="p-2 text-center">Pts</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {standings.map(team => (
                                        <tr key={team.name} className="border-b border-slate-700">
                                            <td className="p-2 font-semibold text-white">{team.name}</td>
                                            <td className="p-2 text-center">{team.p}</td>
                                            <td className="p-2 text-center">{team.w}</td>
                                            <td className="p-2 text-center">{team.d}</td>
                                            <td className="p-2 text-center">{team.l}</td>
                                            <td className="p-2 text-center">{team.tdFor}</td>
                                            <td className="p-2 text-center">{team.tdAgainst}</td>
                                            <td className="p-2 text-center">{team.tdFor - team.tdAgainst}</td>
                                            <td className="p-2 text-center font-bold">{team.pts}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <h3 className="text-xl font-semibold text-amber-300 mb-2">Partidos</h3>
                        <div className="space-y-4">
                            {selectedCompetition.schedule && Object.entries(selectedCompetition.schedule).map(([roundIndex, round]) => (
                                <div key={roundIndex}>
                                    <h4 className="font-bold text-slate-300 mb-2">Jornada {parseInt(roundIndex, 10) + 1}</h4>
                                    <div className="space-y-2">
                                        {/* @FIX: Cast `round` to `Matchup[]` to resolve 'unknown' type error. */}
                                        {(round as Matchup[]).map((match, matchIndex) => {
                                            const matchKey = `l-${roundIndex}-${matchIndex}`;
                                            return(
                                            <div key={matchIndex} className="bg-slate-700/50 p-3 rounded-md flex items-center justify-between">
                                                <span className="flex-1 text-right truncate pr-2">{match.team1}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-bold text-lg px-2 rounded ${match.score1 !== undefined ? 'bg-slate-800' : 'bg-slate-600'}`}>
                                                        {match.score1 ?? '-'}
                                                    </span>
                                                    <span>vs</span>
                                                    <span className={`font-bold text-lg px-2 rounded ${match.score2 !== undefined ? 'bg-slate-800' : 'bg-slate-600'}`}>
                                                        {match.score2 ?? '-'}
                                                    </span>
                                                    <button onClick={() => handleOpenScoreModal(roundIndex, matchIndex, match)} className="text-slate-400 hover:text-white"><PencilIcon/></button>
                                                </div>
                                                <span className="flex-1 text-left truncate pl-2">{match.team2}</span>
                                                <button onClick={() => openCalendarModal(match, selectedCompetition.name, matchKey)} className="text-slate-400 hover:text-white ml-auto" title="Añadir al Calendario de Google">
                                                    <CalendarIcon />
                                                </button>
                                                {feedback && feedback.matchKey === matchKey && (
                                                     <span className={`text-xs ml-2 ${feedback.success ? 'text-green-400' : 'text-red-400'}`}>{feedback.message}</span>
                                                )}
                                            </div>
                                        )})}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {selectedCompetition.format === 'Torneo' && selectedCompetition.bracket && (
                    <div className="flex flex-col md:flex-row gap-4 overflow-x-auto p-4 bg-slate-900/50 rounded-lg">
                        {Object.entries(selectedCompetition.bracket).map(([roundIndex, round]) => {
                            const numRounds = Object.keys(selectedCompetition.bracket!).length;
                            return (
                            <div key={roundIndex} className="flex flex-col justify-around min-w-[250px]">
                                <h3 className="text-lg font-semibold text-amber-300 text-center mb-4">
                                    {parseInt(roundIndex, 10) === 0 ? 'Primera Ronda' : parseInt(roundIndex, 10) === numRounds - 1 ? 'Final' : `Ronda ${parseInt(roundIndex, 10) + 1}`}
                                </h3>
                                <div className="space-y-4">
                                    {/* @FIX: Cast `round` to `Matchup[]` to resolve 'unknown' type error. */}
                                    {(round as Matchup[]).map((match, matchIndex) => {
                                        const matchKey = `b-${roundIndex}-${matchIndex}`;
                                        return (
                                        <div key={matchIndex} className="bg-slate-800 p-3 rounded-lg relative">
                                            <div className="flex flex-col gap-2">
                                                <button 
                                                    onClick={() => (match.team1 !== 'BYE' && match.team1 !== 'Por determinar') && handleWinnerSelect(roundIndex, matchIndex, match.team1)}
                                                    className={`w-full text-left p-2 rounded transition-colors ${match.winner === match.team1 ? 'bg-green-700 font-bold text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
                                                    disabled={match.team1 === 'BYE' || match.team1 === 'Por determinar'}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span className="truncate">{match.team1}</span>
                                                        <span className="font-mono text-sm">{match.score1 ?? ''}</span>
                                                    </div>
                                                </button>
                                                <button 
                                                    onClick={() => (match.team2 !== 'BYE' && match.team2 !== 'Por determinar') && handleWinnerSelect(roundIndex, matchIndex, match.team2)}
                                                    className={`w-full text-left p-2 rounded transition-colors ${match.winner === match.team2 ? 'bg-green-700 font-bold text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
                                                    disabled={match.team2 === 'BYE' || match.team2 === 'Por determinar'}
                                                >
                                                     <div className="flex justify-between items-center">
                                                        <span className="truncate">{match.team2}</span>
                                                        <span className="font-mono text-sm">{match.score2 ?? ''}</span>
                                                    </div>
                                                </button>
                                            </div>
                                            <div className="absolute top-1 right-1 flex gap-1">
                                                <button onClick={() => handleOpenScoreModal(roundIndex, matchIndex, match)} className="text-slate-400 hover:text-white p-1"><PencilIcon className="w-3 h-3"/></button>
                                                <button onClick={() => openCalendarModal(match, selectedCompetition.name, matchKey)} className="text-slate-400 hover:text-white p-1" title="Añadir al Calendario"><CalendarIcon className="w-3 h-3"/></button>
                                            </div>
                                            {feedback && feedback.matchKey === matchKey && (
                                                <span className={`absolute bottom-0 right-1 text-xs ${feedback.success ? 'text-green-400' : 'text-red-400'}`}>{feedback.message}</span>
                                            )}
                                        </div>
                                    )})}
                                </div>
                            </div>
                        )})}
                    </div>
                )}
            </div>
        );
    };

    const renderScanView = () => (
        <div className="p-4 text-center">
            <button onClick={() => setView('list')} className="text-amber-400 hover:underline mb-4">&larr; Volver</button>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">Importar Competición</h2>
            <p className="text-slate-400 mb-6">Escanea el código QR de una competición para añadirla a tu lista.</p>
            {scanError && <p className="text-red-400 bg-red-900/50 p-3 rounded-md mb-4">{scanError}</p>}
            <div id="comp-qr-reader" ref={scannerContainerRef} className="max-w-sm mx-auto aspect-square bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-700"></div>
        </div>
    );
    
    return (
        <div className="min-h-screen">
            {view === 'list' && renderListView()}
            {view === 'create' && renderCreateView()}
            {view === 'detail' && renderDetailView()}
            {view === 'scan' && renderScanView()}
            
            <ScoreModal />
            <CalendarModal 
                isOpen={calendarModalState.isOpen}
                onClose={() => setCalendarModalState({ isOpen: false, matchup: null, competitionName: null, matchKey: null })}
                onConfirm={(date) => calendarModalState.matchup && calendarModalState.competitionName && calendarModalState.matchKey && handleAddToCalendar(calendarModalState.matchup, calendarModalState.competitionName, calendarModalState.matchKey, date)}
                matchup={calendarModalState.matchup}
            />

            {isTrophyModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setIsTrophyModalOpen(false)}>
                    <img src={trophyImageUrl} alt="Trophy" className="max-w-full max-h-[80vh] rounded-lg shadow-2xl" />
                </div>
            )}
            
             {isQrExportModalOpen && selectedCompetition && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setIsQrExportModalOpen(false)}>
                    <div className="bg-slate-800 p-4 rounded-lg shadow-xl border border-slate-700" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-amber-400 mb-4 text-center">QR de {selectedCompetition.name}</h3>
                        <canvas ref={qrCanvasRef}></canvas>
                        <p className="text-xs text-slate-400 mt-2 text-center">Escanea para importar la competición.</p>
                    </div>
                </div>
            )}
        </div>
    );
};