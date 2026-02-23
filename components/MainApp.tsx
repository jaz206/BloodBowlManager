import React, { useState, useEffect, useMemo } from 'react';
import QuickGuide from './QuickGuide';
import TeamsAndSkills from './TeamsAndSkills';
import Plays from './Plays';
import Generators from './Generators';
import TeamManager from './TeamManager';
import GameBoard from './GameBoard';
import BookOpenIcon from './icons/BookOpenIcon';
import UsersIcon from './icons/UsersIcon';
import ClipboardListIcon from './icons/ClipboardListIcon';
import CubeIcon from './icons/CubeIcon';
import ShieldCheckIcon from './icons/ShieldCheckIcon';
import StopwatchIcon from './icons/StopwatchIcon';
import type { ManagedTeam, Competition, Play } from '../types';
import { useAuth } from '../hooks/useAuth';
import UserProfile from './UserProfile';
import TrophyIcon from './icons/TrophyIcon';
import { Leagues } from './Leagues';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, addDoc, doc, setDoc, deleteDoc, writeBatch } from "firebase/firestore";
import SyncStatusIndicator from './SyncStatusIndicator';

// FIX: Renamed 'live' view to 'game' to align with component changes (LiveGame -> GameBoard)
type View = 'guide' | 'teams' | 'plays' | 'generators' | 'manager' | 'game' | 'leagues';
type SyncStatus = 'synced' | 'syncing' | 'error';

const GuestWarningBanner = () => (
  <div className="bg-blood-red/40 backdrop-blur-md border-b border-blood-red/50 text-white text-center p-2 text-[10px] font-display uppercase tracking-[0.2em] sticky top-0 z-[60] shadow-2xl">
    <span className="opacity-80">Estás en modo Invitado. Tu progreso no se guardará al cerrar o recargar la página.</span>
  </div>
);


const MainApp: React.FC = () => {
  // FIX: Default view changed from 'live' to 'game'
  const [activeView, setActiveView] = useState<View>('game');
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
      setPlays([]);
      setDataInitiallyLoaded(true);
      setSyncState('synced');
      console.log("MainApp: No database or user/guest mode active.");
    } else {
      const teamsPath = `users/${user.id}/teams`;
      console.log("MainApp: Listening to teams path:", teamsPath);

      const teamsUnsub = onSnapshot(collection(db, 'users', user.id, 'teams'),
        (snapshot) => {
          console.log(`MainApp: Received teams update. Count: ${snapshot.docs.length}`);
          setManagedTeams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ManagedTeam[]);
          if (!dataInitiallyLoaded) setDataInitiallyLoaded(true);
          setSyncState('synced');
        },
        (error) => {
          console.error("MainApp: Error fetching teams:", error.code, error.message);
          setDataInitiallyLoaded(true);
          setSyncState('error');
          if (error.code === 'permission-denied') {
            console.error("CRITICAL: Permission denied for path:", teamsPath);
          }
        }
      );

      const playsPath = `users/${user.id}/plays`;
      const playsUnsub = onSnapshot(collection(db, 'users', user.id, 'plays'),
        (snapshot) => {
          setPlays(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Play[]);
          setSyncState('synced');
        },
        (error) => {
          console.error("MainApp: Error fetching plays:", error.code, error.message);
          setSyncState('error');
        }
      );

      return () => {
        teamsUnsub();
        playsUnsub();
      };
    }
  }, [user, isGuest]);

  useEffect(() => {
    if (!db) {
      setCompetitions([]);
      return;
    }
    console.log("MainApp: Listening to competitions");
    const compsUnsub = onSnapshot(collection(db, 'competitions'),
      (snapshot) => {
        const competitionsFromDb: Competition[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return { id: doc.id, ...data } as Competition;
        });
        setCompetitions(competitionsFromDb);
        setSyncState('synced');
      },
      (error) => {
        console.error("MainApp: Error fetching competitions:", error.code, error.message);
        setSyncState('error');
      }
    );
    return () => compsUnsub();
  }, [db]);


  const handleTeamCreate = async (newTeamData: Omit<ManagedTeam, 'id'>, index?: number) => {
    if (!user) return;
    setSyncState('syncing');
    if (isGuest) {
      setManagedTeams(prev => [...prev, { ...newTeamData, id: `temp_${Date.now()}_${index || 0}` }]);
      setTimeout(() => setSyncState('synced'), 500);
      return;
    }

    try {
      if (!db) throw new Error("Database not connected.");
      const path = `users/${user.id}/teams`;
      console.log("MainApp: Attempting to create team at path:", path, newTeamData);
      await addDoc(collection(db, 'users', user.id, 'teams'), newTeamData);
      console.log("MainApp: Team created successfully.");
    } catch (error: any) {
      console.error("MainApp: Error creating team:", error.code, error.message);
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
    } catch (error) {
      console.error("MainApp: Error updating team:", error);
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
      setTimeout(() => setSyncState('synced'), 500);
      return;
    }

    try {
      if (!db) throw new Error("Database not connected.");
      const batch = writeBatch(db);
      batch.delete(doc(db, 'users', user.id, 'teams', teamId));

      competitions.forEach(comp => {
        if (comp.id && comp.teams.some(t => t.teamName === teamToDelete.name && t.ownerId === user.id)) {
          const newComp = { ...comp, teams: comp.teams.filter(t => t.teamName !== teamToDelete.name || t.ownerId !== user.id) };
          const { id, ...compData } = newComp;
          batch.set(doc(db, 'competitions', id), compData);
        }
      });

      await batch.commit();
    } catch (error) {
      console.error("MainApp: Error deleting team:", error);
      alert(`Error al borrar el equipo de la nube: ${error instanceof Error ? error.message : String(error)}.`);
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
      await addDoc(collection(db, 'competitions'), newCompData);
    } catch (error) {
      console.error("MainApp: Error creating competition:", error);
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
      await setDoc(doc(db, 'competitions', id), compData, { merge: true });
    } catch (error) {
      console.error("MainApp: Error updating competition:", error);
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
      await deleteDoc(doc(db, 'competitions', compId));
    } catch (error) {
      console.error("MainApp: Error deleting competition:", error);
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
    } catch (error) {
      console.error("MainApp: Error saving play:", error);
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
    } catch (error) {
      console.error("MainApp: Error deleting play:", error);
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
        className={`flex-1 group flex flex-col sm:flex-row items-center justify-center gap-2 py-3.5 px-3 text-center transition-all duration-300 relative ${isActive
          ? 'text-premium-gold'
          : 'text-slate-500 hover:text-white hover:bg-white/5'
          }`}
        aria-current={isActive ? 'page' : undefined}
      >
        {React.cloneElement(icon, {
          className: `w-5 h-5 transition-all duration-300 ${isActive ? 'text-premium-gold scale-110' : 'text-slate-500 group-hover:text-white group-hover:scale-110'}`
        })}
        <span className={`hidden sm:inline font-display text-xs tracking-widest font-bold uppercase ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
          {label}
        </span>
        {isActive && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-premium-gold shadow-[0_0_10px_rgba(202,138,4,0.5)] animate-in fade-in duration-500" />
        )}
      </button>
    );
  };

  // FIX: Updated `live` to `game` to match the new view name
  const mainClasses = (activeView === 'leagues' || activeView === 'plays' || activeView === 'game') ? '' : 'container mx-auto max-w-7xl p-2 sm:p-6';

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans antialiased selection:bg-blood-red/30">
      {isGuest && <GuestWarningBanner />}
      <main className={`${mainClasses} pt-6 pb-20`}>
        <header className="text-center mb-10 relative px-4">
          <div className="inline-block relative">
            <h1 className="text-5xl sm:text-7xl font-display font-black text-white italic tracking-tighter leading-none mb-1 text-shadow-premium">
              BLOOD BOWL
              <span className="text-blood-red block sm:inline sm:ml-4 not-italic">ASSISTANT</span>
            </h1>
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-premium-gold to-transparent opacity-30 mt-2"></div>
          </div>
          <p className="font-display text-premium-gold/60 mt-3 text-sm sm:text-lg tracking-[0.4em] font-medium uppercase">Coach Digital Integration</p>

          <div className="absolute top-0 right-0 p-2 sm:p-4 flex items-center gap-3 sm:gap-6">
            {!isGuest && <SyncStatusIndicator status={syncState} />}
            <div className="glass-panel p-1 sm:p-2 border-white/5 bg-white/5 transition-premium hover:bg-white/10">
              <UserProfile />
            </div>
          </div>
        </header>

        <nav className="mb-8 glass-panel border-white/10 overflow-hidden sticky top-4 z-50 mx-2 sm:mx-0 shadow-2xl">
          <div className="flex justify-around bg-black/40 backdrop-blur-xl">
            <NavButton view="guide" label="Guía" icon={<BookOpenIcon />} />
            <NavButton view="teams" label="Equipos" icon={<UsersIcon />} />
            <NavButton view="plays" label="Pizarra" icon={<ClipboardListIcon />} />
            <NavButton view="generators" label="Tablas" icon={<CubeIcon />} />
            <NavButton view="manager" label="Gestor" icon={<ShieldCheckIcon />} />
            <NavButton view="game" label="Partida" icon={<StopwatchIcon />} />
            <NavButton view="leagues" label="Ligas" icon={<TrophyIcon />} />
          </div>
        </nav>

        <div className="glass-panel min-h-[60vh] border-white/5 shadow-2xl relative overflow-hidden group/main">
          <div className="absolute inset-0 bg-gradient-to-br from-premium-gold/5 via-transparent to-blood-red/5 pointer-events-none opacity-50"></div>
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
              {/* FIX: Changed from LiveGame to GameBoard and view from 'live' to 'game' */}
              {activeView === 'game' && <GameBoard managedTeams={managedTeams} onTeamUpdate={handleTeamUpdate} />}
              {activeView === 'leagues' && <Leagues managedTeams={managedTeams} initialCompetitions={competitions} onCompetitionCreate={handleCompetitionCreate} onCompetitionUpdate={handleCompetitionUpdate} onCompetitionDelete={handleCompetitionDelete} isGuest={isGuest} />}
            </>
          )}
        </div>

        <footer className="text-center mt-12 text-slate-600">
          <p className="font-display text-xs tracking-[0.3em] font-bold uppercase opacity-50">Drafted for the glorious Blood Bowl community worldwide.</p>
        </footer>
      </main>
    </div>
  );
};

export default MainApp;
