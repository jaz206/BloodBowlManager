
import React, { useState, useEffect, useMemo } from 'react';
import QuickGuide from './QuickGuide';
import TeamsAndSkills from './TeamsAndSkills';
import Plays from './Plays';
import Generators from './Generators';
import TeamManager from './TeamManager';
import { LiveGame } from './LiveGame';
import BookOpenIcon from './icons/BookOpenIcon';
import UsersIcon from './icons/UsersIcon';
import ClipboardListIcon from './icons/ClipboardListIcon';
import CubeIcon from './icons/CubeIcon';
import ShieldCheckIcon from './icons/ShieldCheckIcon';
import StopwatchIcon from './icons/StopwatchIcon';
import type { ManagedTeam, Competition, Play, Matchup } from '../types';
import { useAuth } from '../hooks/useAuth';
import UserProfile from './UserProfile';
import TrophyIcon from './icons/TrophyIcon';
import { Leagues } from './Leagues';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, addDoc, doc, setDoc, deleteDoc, writeBatch } from "firebase/firestore";
import SyncStatusIndicator from './SyncStatusIndicator';

type View = 'guide' | 'teams' | 'plays' | 'generators' | 'manager' | 'live' | 'leagues';
type SyncStatus = 'synced' | 'syncing' | 'error';

const GuestWarningBanner = () => (
    <div className="bg-yellow-900/50 border-b-2 border-yellow-700 text-yellow-300 text-center p-2 text-sm sticky top-0 z-20">
        Estás en modo Invitado. Tu progreso no se guardará al cerrar o recargar la página.
    </div>
);


const MainApp: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('guide');
  const { user } = useAuth();
  const isGuest = useMemo(() => user?.id.startsWith('guest-'), [user]);

  const [managedTeams, setManagedTeams] = useState<ManagedTeam[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [plays, setPlays] = useState<Play[]>([]);
  
  const [dataInitiallyLoaded, setDataInitiallyLoaded] = useState(false);
  const [requestedRoster, setRequestedRoster] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<SyncStatus>('synced');

  useEffect(() => {
    if (isGuest || !user || !db) {
        setManagedTeams([]);
        setCompetitions([]);
        setPlays([]);
        setDataInitiallyLoaded(true);
        setSyncState('synced');
        return;
    }

    setDataInitiallyLoaded(false);

    const teamsUnsub = onSnapshot(collection(db, 'users', user.id, 'teams'), 
        (snapshot) => {
            setManagedTeams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ManagedTeam[]);
            setDataInitiallyLoaded(true);
            setSyncState('synced');
        }, 
        (error) => {
            console.error("Error fetching teams:", error);
            setDataInitiallyLoaded(true);
            setSyncState('error');
        }
    );

    const compsUnsub = onSnapshot(collection(db, 'users', user.id, 'competitions'),
      (snapshot) => {
          const competitionsFromDb: Competition[] = snapshot.docs.map(doc => {
              const data = doc.data();
              
              const newComp: Competition = { 
                  id: doc.id, 
                  name: data.name || 'Sin Nombre',
                  format: data.format === 'Liguilla' || data.format === 'Torneo' ? data.format : 'Liguilla',
                  teams: Array.isArray(data.teams) ? data.teams : [],
              };
  
              if (data.schedule) {
                  const scheduleObject: Record<string, Matchup[]> = {};
                  if (Array.isArray(data.schedule)) {
                      data.schedule.forEach((round, index) => {
                          if (Array.isArray(round)) {
                              scheduleObject[index.toString()] = round;
                          }
                      });
                  } else if (typeof data.schedule === 'object' && data.schedule !== null) {
                      Object.entries(data.schedule).forEach(([key, value]) => {
                          if (Array.isArray(value)) {
                              scheduleObject[key] = value;
                          }
                      });
                  }
                  newComp.schedule = scheduleObject;
              }
  
              if (data.bracket) {
                  const bracketObject: Record<string, Matchup[]> = {};
                  if (Array.isArray(data.bracket)) {
                      data.bracket.forEach((round, index) => {
                          if (Array.isArray(round)) {
                              bracketObject[index.toString()] = round;
                          }
                      });
                  } else if (typeof data.bracket === 'object' && data.bracket !== null) {
                      Object.entries(data.bracket).forEach(([key, value]) => {
                          if (Array.isArray(value)) {
                              bracketObject[key] = value;
                          }
                      });
                  }
                  newComp.bracket = bracketObject;
              }
              
              return newComp;
          });
          setCompetitions(competitionsFromDb);
          setSyncState('synced');
      },
      (error) => {
          console.error("Error fetching competitions:", error);
          setSyncState('error');
      }
    );

    const playsUnsub = onSnapshot(collection(db, 'users', user.id, 'plays'), 
        (snapshot) => {
            setPlays(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Play[]);
            setSyncState('synced');
        },
        (error) => {
             console.error("Error fetching plays:", error);
             setSyncState('error');
        }
    );

    return () => {
        teamsUnsub();
        compsUnsub();
        playsUnsub();
    };
  }, [user, isGuest]);

  // --- Data Handlers with Robust Sync State ---

  const handleTeamCreate = async (newTeamData: Omit<ManagedTeam, 'id'>) => {
    if (!user) return;
    setSyncState('syncing');
    if (isGuest) {
        setManagedTeams(prev => [...prev, { ...newTeamData, id: `temp_${Date.now()}` }]);
        setTimeout(() => setSyncState('synced'), 500);
        return;
    }
    
    try {
        if (!db) throw new Error("Database not connected.");
        await addDoc(collection(db, 'users', user.id, 'teams'), newTeamData);
        // onSnapshot will set state to 'synced' upon confirmation
    } catch (error) {
        console.error("Error creating team:", error);
        alert(`Error al sincronizar el equipo con la nube: ${error instanceof Error ? error.message : String(error)}. El equipo no se ha guardado.`);
        setSyncState('error');
    }
  };

  const handleTeamUpdate = async (updatedTeam: ManagedTeam) => {
    if (!user || !updatedTeam.id) return;
    setSyncState('syncing');
    if (isGuest) {
        setManagedTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));
        setTimeout(() => setSyncState('synced'), 500);
        return;
    }
    
    try {
        if (!db) throw new Error("Database not connected.");
        const { id, ...teamData } = updatedTeam;
        await setDoc(doc(db, 'users', user.id, 'teams', id), teamData, { merge: true });
        // onSnapshot will set state to 'synced'
    } catch (error) {
        console.error("Error updating team:", error);
        alert(`Error al actualizar el equipo en la nube: ${error instanceof Error ? error.message : String(error)}. Los cambios no se han guardado.`);
        setSyncState('error');
    }
  };

  const handleTeamDelete = async (teamId: string) => {
    if (!user) return;
    const teamToDelete = managedTeams.find(t => t.id === teamId);
    if (!teamToDelete) return;
    setSyncState('syncing');

    if (isGuest) {
        setManagedTeams(prev => prev.filter(t => t.id !== teamId));
        const updatedCompetitions = competitions.map(comp => {
            if (!comp.teams.includes(teamToDelete.name)) return comp;
            const newComp = { ...comp, teams: comp.teams.filter(tName => tName !== teamToDelete.name) };
            if (newComp.schedule) {
                const newSchedule: Record<string, Matchup[]> = {};
                Object.entries(newComp.schedule).forEach(([roundKey, round]) => {
                    const newRound = (round as Matchup[]).filter(match => match.team1 !== teamToDelete.name && match.team2 !== teamToDelete.name);
                    if (newRound.length > 0) {
                        newSchedule[roundKey] = newRound;
                    }
                });
                newComp.schedule = newSchedule;
            }
            if (newComp.bracket) {
                const newBracket: Record<string, Matchup[]> = {};
                Object.entries(newComp.bracket).forEach(([roundKey, round]) => {
                    newBracket[roundKey] = (round as Matchup[]).map(match => ({
                        ...match,
                        team1: match.team1 === teamToDelete.name ? 'EQUIPO ELIMINADO' : match.team1,
                        team2: match.team2 === teamToDelete.name ? 'EQUIPO ELIMINADO' : match.team2,
                        winner: match.winner === teamToDelete.name ? null : match.winner,
                    }));
                });
                newComp.bracket = newBracket;
            }
            return newComp;
        });
        setCompetitions(updatedCompetitions);
        setTimeout(() => setSyncState('synced'), 500);
        return;
    }

    try {
        if (!db) throw new Error("Database not connected.");
        const batch = writeBatch(db);
        batch.delete(doc(db, 'users', user.id, 'teams', teamId));
        
        competitions.forEach(comp => {
            if (comp.id && comp.teams.includes(teamToDelete.name)) {
                const newComp = { ...comp, teams: comp.teams.filter(tName => tName !== teamToDelete.name) };
                if (newComp.schedule) {
                    const newSchedule: Record<string, Matchup[]> = {};
                    Object.entries(newComp.schedule).forEach(([roundKey, round]) => {
                        const newRound = (round as Matchup[]).filter(match => match.team1 !== teamToDelete.name && match.team2 !== teamToDelete.name);
                        if (newRound.length > 0) {
                            newSchedule[roundKey] = newRound;
                        }
                    });
                    newComp.schedule = newSchedule;
                }
                if (newComp.bracket) {
                    const newBracket: Record<string, Matchup[]> = {};
                    Object.entries(newComp.bracket).forEach(([roundKey, round]) => {
                        newBracket[roundKey] = (round as Matchup[]).map(match => ({
                            ...match,
                            team1: match.team1 === teamToDelete.name ? 'EQUIPO ELIMINADO' : match.team1,
                            team2: match.team2 === teamToDelete.name ? 'EQUIPO ELIMINADO' : match.team2,
                            winner: match.winner === teamToDelete.name ? null : match.winner,
                        }));
                    });
                    newComp.bracket = newBracket;
                }
                const { id, ...compData } = newComp;
                batch.set(doc(db, 'users', user.id, 'competitions', id), compData);
            }
        });

        await batch.commit();
        // onSnapshot will set state to 'synced'
    } catch (error) {
        console.error("Error deleting team and updating competitions:", error);
        alert(`Error al borrar el equipo de la nube: ${error instanceof Error ? error.message : String(error)}. Es posible que deba actualizar las competiciones manualmente.`);
        setSyncState('error');
    }
  };

  const handleCompetitionCreate = async (newCompData: Omit<Competition, 'id'>) => {
    if (!user) return;
    setSyncState('syncing');
    if (isGuest) {
        setCompetitions(prev => [...prev, { ...newCompData, id: `temp_${Date.now()}` }]);
        setTimeout(() => setSyncState('synced'), 500);
        return;
    }
    try {
        if (!db) throw new Error("Database not connected.");
        await addDoc(collection(db, 'users', user.id, 'competitions'), newCompData);
        // onSnapshot will set state to 'synced'
    } catch (error) {
        console.error("Error creating competition:", error);
        alert(`Error al crear la competición en la nube: ${error instanceof Error ? error.message : String(error)}.`);
        setSyncState('error');
    }
  };

  const handleCompetitionUpdate = async (updatedComp: Competition) => {
    if (!user || !updatedComp.id) return;
    setSyncState('syncing');
    if (isGuest) {
        setCompetitions(prev => prev.map(c => c.id === updatedComp.id ? updatedComp : c));
        setTimeout(() => setSyncState('synced'), 500);
        return;
    }
    try {
        if (!db) throw new Error("Database not connected.");
        const { id, ...compData } = updatedComp;
        await setDoc(doc(db, 'users', user.id, 'competitions', id), compData, { merge: true });
        // onSnapshot will set state to 'synced'
    } catch (error) {
        console.error("Error updating competition:", error);
        alert(`Error al actualizar la competición en la nube: ${error instanceof Error ? error.message : String(error)}.`);
        setSyncState('error');
    }
  };

  const handleCompetitionDelete = async (compId: string) => {
    if (!user) return;
    setSyncState('syncing');
    if (isGuest) {
      setCompetitions(prev => prev.filter(c => c.id !== compId));
      setTimeout(() => setSyncState('synced'), 500);
      return;
    }
    try {
      if (!db) throw new Error("Database not connected.");
      await deleteDoc(doc(db, 'users', user.id, 'competitions', compId));
    } catch (error) {
      console.error("Error deleting competition:", error);
      alert(`Error al eliminar la competición: ${error instanceof Error ? error.message : String(error)}`);
      setSyncState('error');
    }
  };
  
  const handlePlaySave = async (playToSave: Play) => {
    if (!user) return;
    setSyncState('syncing');
    if (isGuest) {
        if (playToSave.id) {
             setPlays(prev => prev.map(p => p.id === playToSave.id ? playToSave : p));
        } else {
             setPlays(prev => [...prev.filter(p => p.name.toLowerCase() !== playToSave.name.toLowerCase()), { ...playToSave, id: `temp_${Date.now()}` }]);
        }
        setTimeout(() => setSyncState('synced'), 500);
        return;
    }
    
    try {
        if (!db) throw new Error("Database not connected.");
        if (playToSave.id && !playToSave.id.startsWith('temp_')) {
            const { id, ...playData } = playToSave;
            await setDoc(doc(db, 'users', user.id, 'plays', id), playData);
        } else {
            const { id, ...playData } = playToSave;
            await addDoc(collection(db, 'users', user.id, 'plays'), playData);
        }
        // onSnapshot will set state to 'synced'
    } catch (error) {
        console.error("Error saving play:", error);
        alert(`Error al guardar la jugada en la nube: ${error instanceof Error ? error.message : String(error)}.`);
        setSyncState('error');
    }
  };

  const handlePlayDelete = async (playId: string) => {
    if (!user) return;
    setSyncState('syncing');
    if (isGuest) {
        setPlays(prev => prev.filter(p => p.id !== playId));
        setTimeout(() => setSyncState('synced'), 500);
        return;
    }
    try {
        if (!db) throw new Error("Database not connected.");
        await deleteDoc(doc(db, 'users', user.id, 'plays', playId));
        // onSnapshot will set state to 'synced'
    } catch (error) {
        console.error("Error deleting play:", error);
        alert(`Error al borrar la jugada de la nube: ${error instanceof Error ? error.message : String(error)}.`);
        setSyncState('error');
    }
  };


  const handleRequestTeamCreation = (rosterName: string) => {
    setRequestedRoster(rosterName);
    setActiveView('manager');
  };

  const NavButton: React.FC<{
    view: View;
    label: string;
    icon: React.ReactElement<{ className?: string }>;
  }> = ({ view, label, icon }) => {
    const isActive = activeView === view;
    return (
      <button
        onClick={() => setActiveView(view)}
        className={`flex-1 group flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-2 text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-amber-400 transition-all duration-200 whitespace-nowrap border-b-4 ${
          isActive
            ? 'border-amber-400 text-amber-400'
            : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
        }`}
        aria-current={isActive ? 'page' : undefined}
      >
        {React.cloneElement(icon, { className: `w-5 h-5 transition-colors ${isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-white'}`})}
        <span className="hidden sm:inline">{label}</span>
      </button>
    );
  };

  const mainClasses = activeView === 'leagues' ? '' : 'container mx-auto max-w-7xl p-2 sm:p-6';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans antialiased">
      {isGuest && <GuestWarningBanner />}
      <main className={mainClasses}>
        <header className="text-center mb-6 relative">
          <h1 className="text-4xl sm:text-5xl font-bold text-amber-400 tracking-wider" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            Asistente de Blood Bowl
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Tu Asistente de Entrenador</p>
          <div className="absolute top-0 right-0 p-2 flex items-center gap-4">
            {!isGuest && <SyncStatusIndicator status={syncState} />}
            <UserProfile />
          </div>
        </header>

        <nav className="mb-4 bg-slate-800 rounded-lg shadow-md overflow-hidden">
          <div className="flex justify-around border-b border-slate-700">
            <NavButton view="guide" label="Guía Rápida" icon={<BookOpenIcon />} />
            <NavButton view="teams" label="Equipos y Habilidades" icon={<UsersIcon />} />
            <NavButton view="plays" label="Pizarra Táctica" icon={<ClipboardListIcon />} />
            <NavButton view="generators" label="Tablas y Generadores" icon={<CubeIcon />} />
            <NavButton view="manager" label="Gestor de Equipo" icon={<ShieldCheckIcon />} />
            <NavButton view="live" label="Directo" icon={<StopwatchIcon />} />
            <NavButton view="leagues" label="Ligas y Torneos" icon={<TrophyIcon />} />
          </div>
        </nav>
        
        <div className="bg-slate-800/50 rounded-lg">
            {!dataInitiallyLoaded ? (
                 <div className="flex flex-col items-center justify-center text-white p-10">
                    <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-lg mt-4">Sincronizando datos...</p>
                </div>
            ) : (
                <>
                    {activeView === 'guide' && <QuickGuide />}
                    {activeView === 'teams' && <TeamsAndSkills onRequestTeamCreation={handleRequestTeamCreation} />}
                    {activeView === 'plays' && <Plays managedTeams={managedTeams} plays={plays} onSavePlay={handlePlaySave} onDeletePlay={handlePlayDelete} />}
                    {activeView === 'generators' && <Generators />}
                    {activeView === 'manager' && <TeamManager teams={managedTeams} onTeamCreate={handleTeamCreate} onTeamUpdate={handleTeamUpdate} onTeamDelete={handleTeamDelete} requestedRoster={requestedRoster} onRosterRequestHandled={() => setRequestedRoster(null)} isGuest={isGuest} />}
                    {activeView === 'live' && <LiveGame managedTeams={managedTeams} onTeamUpdate={handleTeamUpdate} />}
                    {activeView === 'leagues' && <Leagues managedTeams={managedTeams} initialCompetitions={competitions} onCompetitionCreate={handleCompetitionCreate} onCompetitionUpdate={handleCompetitionUpdate} onCompetitionDelete={handleCompetitionDelete} isGuest={isGuest} />}
                </>
            )}
        </div>

        <footer className="text-center mt-12 text-slate-500 text-sm">
          <p>Hecho para entrenadores de Blood Bowl en todo el mundo.</p>
        </footer>
      </main>
    </div>
  );
};

export default MainApp;
