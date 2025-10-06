
import React, { useState, useMemo } from 'react';
import type { ManagedTeam, Competition, Matchup, CompetitionTeam } from '../types';
import { useAuth } from '../hooks/useAuth';
import PencilIcon from './icons/PencilIcon';

const trophyImageUrl = 'https://i.pinimg.com/736x/95/dc/9a/95dc9a37df924d550e9922dbf37b9089.jpg';

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

  const myCompetitions = useMemo(() => initialCompetitions.filter(c => c.ownerId === user?.id || c.teams.some(t => t.ownerId === user?.id)), [initialCompetitions, user]);
  const joinableCompetitions = useMemo(() => initialCompetitions.filter(c => c.status === 'Open' && c.ownerId !== user?.id && !c.teams.some(t => t.ownerId === user?.id)), [initialCompetitions, user]);

  const standings = useMemo(() => {
    if (!selectedCompetition || selectedCompetition.format !== 'Liguilla' || !selectedCompetition.schedule) return [];
    return selectedCompetition.teams.map(({teamName}) => {
        let p=0, w=0, l=0, d=0, tdF=0, tdA=0;
        Object.values(selectedCompetition.schedule!).forEach(round => {
            (round as Matchup[]).forEach(match => {
                if ((match.team1 === teamName || match.team2 === teamName) && match.score1 !== undefined && match.score2 !== undefined) {
                    p++;
                    const isTeam1 = match.team1 === teamName;
                    const sF = isTeam1 ? match.score1 : match.score2;
                    const sA = isTeam1 ? match.score2 : match.score1;
                    tdF += sF; tdA += sA;
                    if (sF > sA) w++; else if (sA > sF) l++; else d++;
                }
            });
        });
        return { name: teamName, p, w, d, l, tdF, tdA, pts: w*3+d };
    }).sort((a,b) => b.pts - a.pts || (b.tdF-b.tdA) - (a.tdF-a.tdA) || b.tdF-a.tdF);
  }, [selectedCompetition]);

  const finalWinner = useMemo(() => {
      if (!selectedCompetition || selectedCompetition.format !== 'Torneo' || !selectedCompetition.bracket) return null;
      const finalRoundKey = Math.max(...Object.keys(selectedCompetition.bracket).map(Number)).toString();
      return selectedCompetition.bracket[finalRoundKey]?.[0]?.winner;
  }, [selectedCompetition]);

  const handleCreateCompetition = () => {
    if (!newCompetitionName.trim() || !user) {
      alert("Por favor, introduce un nombre para la competición.");
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
    const updatedComp = {
      ...joinModalState.comp,
      teams: [...joinModalState.comp.teams, { teamName: joinModalState.teamToJoin, ownerId: user.id, ownerName: user.name }]
    };
    onCompetitionUpdate(updatedComp);
    setJoinModalState({ comp: null, teamToJoin: '' });
  };

  const handleStartCompetition = (comp: Competition) => {
    if (comp.teams.length < 2) {
        alert("Se necesitan al menos 2 equipos para iniciar la competición.");
        return;
    }
    const teamNames = comp.teams.map(t => t.teamName);
    const updatedComp: Competition = {
        ...comp,
        status: 'In Progress',
        schedule: comp.format === 'Liguilla' ? generateSchedule(teamNames) : comp.schedule,
        bracket: comp.format === 'Torneo' ? generateBracket(teamNames) : comp.bracket,
    };
    
    // Ensure schedule/bracket are not undefined
    if (comp.format === 'Liguilla' && !updatedComp.schedule) {
      updatedComp.schedule = {};
    }
    if (comp.format === 'Torneo' && !updatedComp.bracket) {
      updatedComp.bracket = {};
    }

    onCompetitionUpdate(updatedComp);
    setSelectedCompetition(updatedComp);
  };

  const handleSaveScore = (score1: string, score2: string) => {
    if (!selectedCompetition || !scoreModalState) return;
    let updatedComp = { ...selectedCompetition };
    const s1 = score1 === '' ? undefined : parseInt(score1, 10);
    const s2 = score2 === '' ? undefined : parseInt(score2, 10);
    if (updatedComp.format === 'Liguilla' && updatedComp.schedule) {
        const newSchedule = { ...updatedComp.schedule };
        newSchedule[scoreModalState.roundIndex][scoreModalState.matchIndex] = { ...scoreModalState.matchup, score1: s1, score2: s2 };
        updatedComp.schedule = newSchedule;
    } else if (updatedComp.format === 'Torneo' && updatedComp.bracket) {
        const newBracket = { ...updatedComp.bracket };
        newBracket[scoreModalState.roundIndex][scoreModalState.matchIndex] = { ...scoreModalState.matchup, score1: s1, score2: s2 };
        updatedComp.bracket = newBracket;
    }
    onCompetitionUpdate(updatedComp);
    setSelectedCompetition(updatedComp);
    setScoreModalState(null);
  };
  
    const handleWinnerSelect = (roundIndexStr: string, matchIndex: number, winnerTeam: string) => {
        if (!selectedCompetition || !selectedCompetition.bracket) return;
        
        let newBracket = JSON.parse(JSON.stringify(selectedCompetition.bracket));
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
                nextRound[j].team1 = currentRound[j*2]?.winner || 'Por determinar';
                nextRound[j].team2 = currentRound[j*2 + 1]?.winner || 'Por determinar';
                
                if (nextRound[j].team1 === 'BYE') nextRound[j].winner = nextRound[j].team2;
                else if (nextRound[j].team2 === 'BYE') nextRound[j].winner = nextRound[j].team1;
                else if(nextRound[j].team1 !== 'Por determinar' && nextRound[j].team2 !== 'Por determinar') {
                    // if both teams are now set, but a winner was previously selected that is no longer valid, clear winner.
                    if (nextRound[j].winner && nextRound[j].winner !== nextRound[j].team1 && nextRound[j].winner !== nextRound[j].team2) {
                        nextRound[j].winner = null;
                    }
                }
            }
        }

        const updatedComp = { ...selectedCompetition, bracket: newBracket };
        onCompetitionUpdate(updatedComp);
        setSelectedCompetition(updatedComp);
    };

  const renderCreateView = () => (
    <div className="p-4 sm:p-8 max-w-lg mx-auto">
        <button onClick={() => setView('list')} className="text-amber-400 hover:underline mb-6">&larr; Volver a la lista</button>
        <h2 className="text-3xl font-bold text-amber-400 mb-6">Nueva Competición</h2>
        <div className="space-y-6">
            <div>
                <label htmlFor="compName" className="block text-sm font-medium text-slate-300 mb-2">Nombre</label>
                <input id="compName" type="text" value={newCompetitionName} onChange={e => setNewCompetitionName(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Formato</label>
                <select value={newCompetitionFormat} onChange={e => setNewCompetitionFormat(e.target.value as any)} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white">
                    <option>Liguilla</option>
                    <option>Torneo</option>
                </select>
            </div>
            <div className="flex justify-end">
                <button onClick={handleCreateCompetition} className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md shadow-md hover:bg-amber-400">Crear Competición</button>
            </div>
        </div>
    </div>
  );

  const renderDetailView = () => {
    if (!selectedCompetition) return null;

    return (
      <div className="p-2 sm:p-4">
        <button onClick={() => { setView('list'); setSelectedCompetition(null); }} className="text-amber-400 hover:underline mb-4">&larr; Volver a la lista</button>
        <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
            <div>
                <h2 className="text-3xl font-bold text-amber-400">{selectedCompetition.name}</h2>
                <p className="text-slate-400">{selectedCompetition.format} - <span className={selectedCompetition.status === 'Open' ? 'text-green-400' : 'text-yellow-400'}>{selectedCompetition.status}</span></p>
            </div>
            {user?.id === selectedCompetition.ownerId && (
                <div className="flex gap-2">
                    {selectedCompetition.status === 'Open' && <button onClick={() => handleStartCompetition(selectedCompetition)} className="bg-green-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-green-500">Iniciar Competición</button>}
                    <button onClick={() => onCompetitionDelete(selectedCompetition.id)} className="bg-red-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-red-500">Eliminar</button>
                </div>
            )}
        </div>

        {selectedCompetition.status === 'Open' && (
            <div className="bg-slate-900/50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-amber-300 mb-3">Equipos Inscritos ({selectedCompetition.teams.length})</h3>
                <ul className="space-y-2">
                    {selectedCompetition.teams.map(t => <li key={t.ownerId+t.teamName} className="p-2 bg-slate-700/50 rounded">{t.teamName} <span className="text-xs text-slate-400">({t.ownerName})</span></li>)}
                </ul>
                {selectedCompetition.teams.length === 0 && <p className="text-slate-400">Nadie se ha unido todavía. ¡Comparte el nombre de la competición!</p>}
            </div>
        )}
        
        {selectedCompetition.status !== 'Open' && (
             <>
                {finalWinner && finalWinner !== 'Por determinar' && (
                     <div className="text-center p-6 mb-6 bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 rounded-lg border-2 border-amber-600 shadow-xl relative overflow-hidden">
                        <img src={trophyImageUrl} alt="Trophy" className="absolute -left-16 -top-16 w-48 h-48 opacity-10 filter grayscale" />
                        <h3 className="text-2xl font-bold text-amber-300">¡Campeón del Torneo!</h3>
                        <p className="text-4xl font-extrabold text-white mt-2">{finalWinner}</p>
                    </div>
                )}
                {selectedCompetition.format === 'Liguilla' && (
                    <>
                        <div className="overflow-x-auto mb-6"><table className="w-full text-left text-sm whitespace-nowrap"><thead className="bg-slate-700 text-amber-300"><tr><th className="p-2">Equipo</th><th className="p-2 text-center">PJ</th><th className="p-2 text-center">G</th><th className="p-2 text-center">E</th><th className="p-2 text-center">P</th><th className="p-2 text-center">TD+</th><th className="p-2 text-center">TD-</th><th className="p-2 text-center">+/-</th><th className="p-2 text-center">Pts</th></tr></thead><tbody>{standings.map(t => <tr key={t.name} className="border-b border-slate-700"><td className="p-2 font-semibold text-white">{t.name}</td><td className="p-2 text-center">{t.p}</td><td className="p-2 text-center">{t.w}</td><td className="p-2 text-center">{t.d}</td><td className="p-2 text-center">{t.l}</td><td className="p-2 text-center">{t.tdF}</td><td className="p-2 text-center">{t.tdA}</td><td className="p-2 text-center">{t.tdF - t.tdA}</td><td className="p-2 text-center font-bold">{t.pts}</td></tr>)}</tbody></table></div>
                        <div className="space-y-4">{Object.entries(selectedCompetition.schedule!).map(([roundIdx, round]) => <div key={roundIdx}><h4 className="font-bold text-slate-300 mb-2">Jornada {parseInt(roundIdx) + 1}</h4><div className="space-y-2">{(round as Matchup[]).map((match, matchIdx) => <div key={matchIdx} className="bg-slate-700/50 p-3 rounded-md flex items-center justify-between gap-2"><span className="flex-1 text-right truncate">{match.team1}</span><div className="flex items-center gap-2"><span className={`font-bold text-lg px-2 rounded ${match.score1!==undefined?'bg-slate-800':'bg-slate-600'}`}>{match.score1??'-'}</span><span>vs</span><span className={`font-bold text-lg px-2 rounded ${match.score2!==undefined?'bg-slate-800':'bg-slate-600'}`}>{match.score2??'-'}</span><button onClick={()=>setScoreModalState({isOpen:true, roundIndex:roundIdx, matchIndex:matchIdx, matchup:match})} className="text-slate-400 hover:text-white"><PencilIcon/></button></div><span className="flex-1 text-left truncate">{match.team2}</span></div>)}</div></div>)}</div>
                    </>
                )}
                {selectedCompetition.format === 'Torneo' && selectedCompetition.bracket && (
                    <div className="flex gap-4 overflow-x-auto p-4 bg-slate-900/50 rounded-lg">{Object.entries(selectedCompetition.bracket).map(([roundIdx, round]) => <div key={roundIdx} className="flex flex-col justify-around min-w-[250px]"><h3 className="text-lg font-semibold text-amber-300 text-center mb-4">{parseInt(roundIdx)===0?'Ronda Inicial':Object.keys(selectedCompetition.bracket!).length-1 === parseInt(roundIdx)?'Final':`Ronda ${parseInt(roundIdx)+1}`}</h3><div className="space-y-4">{(round as Matchup[]).map((match,matchIdx)=><div key={matchIdx} className="bg-slate-800 p-3 rounded-lg relative"><div className="flex flex-col gap-2"><button onClick={()=>handleWinnerSelect(roundIdx,matchIdx,match.team1)} className={`w-full text-left p-2 rounded transition-colors ${match.winner===match.team1?'bg-green-700 font-bold text-white':'bg-slate-700 hover:bg-slate-600'}`} disabled={match.team1==='BYE'||match.team1==='Por determinar'}><div className="flex justify-between items-center"><span className="truncate">{match.team1}</span><span className="font-mono text-sm">{match.score1??''}</span></div></button><button onClick={()=>handleWinnerSelect(roundIdx,matchIdx,match.team2)} className={`w-full text-left p-2 rounded transition-colors ${match.winner===match.team2?'bg-green-700 font-bold text-white':'bg-slate-700 hover:bg-slate-600'}`} disabled={match.team2==='BYE'||match.team2==='Por determinar'}><div className="flex justify-between items-center"><span className="truncate">{match.team2}</span><span className="font-mono text-sm">{match.score2??''}</span></div></button></div><button onClick={()=>setScoreModalState({isOpen:true,roundIndex:roundIdx,matchIndex:matchIdx,matchup:match})} className="absolute top-1 right-1 text-slate-400 hover:text-white p-1"><PencilIcon className="w-3 h-3"/></button></div>)}</div></div>)}</div>
                )}
             </>
        )}
      </div>
    );
  };

  const renderTabbedList = () => (
    <div className="p-2 sm:p-4">
        <div className="flex border-b border-slate-700 mb-4">
            <button onClick={() => setActiveTab('my')} className={`flex-1 py-3 text-center font-bold rounded-t-lg ${activeTab==='my'?'bg-slate-800 text-amber-400':'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'}`}>Mis Competiciones</button>
            <button onClick={() => setActiveTab('join')} className={`flex-1 py-3 text-center font-bold rounded-t-lg ${activeTab==='join'?'bg-slate-800 text-amber-400':'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'}`}>Unirse a Competición</button>
        </div>
        {activeTab === 'my' && (
            <div className="text-center">
                <button onClick={() => setView('create')} className="bg-amber-500 text-slate-900 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-amber-400 mb-6">Crear Competición</button>
                {myCompetitions.length > 0 ? (
                    <div className="space-y-3 max-w-lg mx-auto">{myCompetitions.map(c => (
                        <div key={c.id} className="w-full bg-slate-700/50 p-4 rounded-lg shadow-md flex justify-between items-center gap-4">
                            <button onClick={() => { setSelectedCompetition(c); setView('detail');}} className="flex-grow text-left min-w-0 group">
                                <span className="font-semibold text-white truncate block group-hover:underline">{c.name}</span>
                                <span className="text-xs text-slate-400">{c.ownerId === user?.id ? 'Organizador: Tú' : `Organizador: ${c.ownerName}`}</span>
                            </button>
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${c.status === 'Open' ? 'bg-green-800 text-green-300' : (c.status === 'In Progress' ? 'bg-yellow-800 text-yellow-300' : 'bg-slate-600 text-slate-300')}`}>{c.status}</span>
                                {c.status === 'Open' && !c.teams.some(t => t.ownerId === user?.id) && managedTeams.length > 0 && (
                                    <button
                                        onClick={() => setJoinModalState({ comp: c, teamToJoin: managedTeams[0]?.name || '' })}
                                        className="bg-sky-600 text-white font-bold py-1 px-3 rounded-md text-xs shadow-md hover:bg-sky-500"
                                    >
                                        Unirse
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}</div>
                ) : <p className="text-slate-400">No estás en ninguna competición.</p>}
            </div>
        )}
        {activeTab === 'join' && (
            <div className="text-center">
                {joinableCompetitions.length > 0 ? (
                    <div className="space-y-3 max-w-lg mx-auto">{joinableCompetitions.map(c => <div key={c.id} className="w-full bg-slate-700/50 p-4 rounded-lg shadow-md text-left flex justify-between items-center"><div className="flex-grow"><p className="font-semibold text-white">{c.name}</p><p className="text-xs text-slate-400">{c.ownerName}</p></div><button onClick={() => setJoinModalState({comp: c, teamToJoin: managedTeams[0]?.name || ''})} className="bg-sky-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-sky-500">Unirse</button></div>)}</div>
                ) : <p className="text-slate-400">No hay competiciones abiertas para unirse.</p>}
            </div>
        )}
    </div>
  );

  return (
    <div className="min-h-screen">
      {view === 'list' && renderTabbedList()}
      {view === 'create' && renderCreateView()}
      {view === 'detail' && renderDetailView()}
      
      {joinModalState.comp && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setJoinModalState({comp: null, teamToJoin: ''})}>
              <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-sm w-full" onClick={e => e.stopPropagation()}>
                  <h3 className="text-xl font-bold text-amber-400 p-4 border-b border-slate-700">Unirse a "{joinModalState.comp.name}"</h3>
                  <div className="p-5 space-y-4">
                      <label htmlFor="teamSelect" className="block text-sm font-medium text-slate-300">Elige tu equipo para unirte</label>
                      <select id="teamSelect" value={joinModalState.teamToJoin} onChange={e => setJoinModalState(s => ({...s, teamToJoin: e.target.value}))} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white">
                          {managedTeams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                      </select>
                  </div>
                  <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end gap-3">
                      <button onClick={() => setJoinModalState({comp: null, teamToJoin: ''})} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-md">Cancelar</button>
                      <button onClick={handleJoinCompetition} className="bg-amber-500 text-slate-900 font-bold py-2 px-4 rounded-md">Confirmar</button>
                  </div>
              </div>
          </div>
      )}

        {scoreModalState?.isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setScoreModalState(null)}>
                <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-sm w-full" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-bold text-amber-400 p-4 border-b border-slate-700">Editar Resultado</h3>
                    <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <label htmlFor="score1" className="flex-1 text-slate-300 text-right truncate">{scoreModalState.matchup.team1}</label>
                            <input id="score1" type="number" defaultValue={scoreModalState.matchup.score1} onBlur={e => setScoreModalState(s => s ? {...s, matchup: {...s.matchup, score1: parseInt(e.target.value) || undefined}} : null)} className="w-20 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white text-center"/>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <label htmlFor="score2" className="flex-1 text-slate-300 text-right truncate">{scoreModalState.matchup.team2}</label>
                             <input id="score2" type="number" defaultValue={scoreModalState.matchup.score2} onBlur={e => setScoreModalState(s => s ? {...s, matchup: {...s.matchup, score2: parseInt(e.target.value) || undefined}} : null)} className="w-20 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white text-center" />
                        </div>
                    </div>
                    <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end gap-3">
                        <button onClick={() => setScoreModalState(null)} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-md">Cancelar</button>
                        <button onClick={() => { const form = document.querySelector('form'); const s1 = (document.getElementById('score1') as HTMLInputElement).value; const s2 = (document.getElementById('score2') as HTMLInputElement).value; handleSaveScore(s1,s2); }} className="bg-amber-500 text-slate-900 font-bold py-2 px-4 rounded-md">Guardar</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
