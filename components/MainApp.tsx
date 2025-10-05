
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
import type { ManagedTeam, Competition, Play } from '../types';
import { useAuth } from '../hooks/useAuth';
import UserProfile from './UserProfile';
import TrophyIcon from './icons/TrophyIcon';
import { Leagues } from './Leagues';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, doc, setDoc, deleteDoc, writeBatch } from "firebase/firestore";

type View = 'guide' | 'teams' | 'plays' | 'generators' | 'manager' | 'live' | 'leagues';

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
  
  const [loading, setLoading] = useState(true);
  const [requestedRoster, setRequestedRoster] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    if (!user) {
        setLoading(false);
        return;
    }

    if (isGuest) {
        // Guest mode: clear all state, no persistence
        setManagedTeams([]);
        setCompetitions([]);
        setPlays([]);
        setLoading(false);
    } else {
        // Firebase user: fetch all data from Firestore
        if (!db) {
            console.error("Firestore is not initialized.");
            setLoading(false);
            return;
        }
        const fetchAllData = async () => {
            try {
                const teamsRef = collection(db, 'users', user.id, 'teams');
                const teamsSnap = await getDocs(teamsRef);
                setManagedTeams(teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ManagedTeam[]);

                const compsRef = collection(db, 'users', user.id, 'competitions');
                const compsSnap = await getDocs(compsRef);
                setCompetitions(compsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Competition[]);

                const playsRef = collection(db, 'users', user.id, 'plays');
                const playsSnap = await getDocs(playsRef);
                setPlays(playsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Play[]);

            } catch (error) {
                console.error("Error fetching data from Firestore:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }
  }, [user, isGuest]);

  // --- Data Handlers ---

  const handleTeamCreate = async (newTeamData: Omit<ManagedTeam, 'id'>) => {
    if (!user) return;
    try {
        if (isGuest) {
            const newTeam = { ...newTeamData, id: Date.now().toString() };
            setManagedTeams(prev => [...prev, newTeam]);
        } else if (db) {
            const newDocRef = doc(collection(db, 'users', user.id, 'teams'));
            await setDoc(newDocRef, newTeamData);
            const newTeam = { ...newTeamData, id: newDocRef.id };
            setManagedTeams(prev => [...prev, newTeam]);
        }
    } catch (error) {
        console.error("Error creating team:", error);
        alert(`No se pudo crear el equipo. Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleTeamUpdate = async (updatedTeam: ManagedTeam) => {
    if (!user || !updatedTeam.id) return;
    setManagedTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));
    if (!isGuest && db) {
        const { id, ...teamData } = updatedTeam;
        await setDoc(doc(db, 'users', user.id, 'teams', id), teamData);
    }
  };

  const handleTeamDelete = async (teamId: string) => {
    if (!user) return;
    const teamToDelete = managedTeams.find(t => t.id === teamId);
    if (!teamToDelete) return;
  
    setManagedTeams(prev => prev.filter(t => t.id !== teamId));
    
    const updatedCompetitions = competitions.map(comp => {
        const teamIsIncluded = comp.teams.includes(teamToDelete.name);
        if (!teamIsIncluded) return comp;
        
        const newComp = { ...comp };
        newComp.teams = newComp.teams.filter(tName => tName !== teamToDelete.name);

        if (newComp.schedule) {
            newComp.schedule = newComp.schedule.map(round => 
                round.filter(match => match.team1 !== teamToDelete.name && match.team2 !== teamToDelete.name)
            ).filter(round => round.length > 0);
        }
        if (newComp.bracket) {
            newComp.bracket = newComp.bracket.map(round => 
                round.map(match => {
                    if (match.team1 === teamToDelete.name) match.team1 = 'EQUIPO ELIMINADO';
                    if (match.team2 === teamToDelete.name) match.team2 = 'EQUIPO ELIMINADO';
                    if (match.winner === teamToDelete.name) match.winner = null;
                    return match;
                })
            );
        }
        return newComp;
    });
    setCompetitions(updatedCompetitions);


    if (!isGuest && db) {
        const batch = writeBatch(db);
        batch.delete(doc(db, 'users', user.id, 'teams', teamId));
        updatedCompetitions.forEach(comp => {
            if (comp.id) {
                const { id, ...compData } = comp;
                batch.set(doc(db, 'users', user.id, 'competitions', id), compData);
            }
        });
        await batch.commit().catch(err => console.error("Error deleting team and updating competitions:", err));
    }
  };

  const handleCompetitionCreate = async (newCompData: Omit<Competition, 'id'>) => {
    if (!user) return;
    try {
        if (isGuest) {
            const newComp = { ...newCompData, id: Date.now().toString() };
            setCompetitions(prev => [...prev, newComp]);
        } else if (db) {
            const newDocRef = doc(collection(db, 'users', user.id, 'competitions'));
            await setDoc(newDocRef, newCompData);
            const newComp = { ...newCompData, id: newDocRef.id };
            setCompetitions(prev => [...prev, newComp]);
        }
    } catch (error) {
        console.error("Error creating competition:", error);
        alert(`No se pudo crear la competición. Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleCompetitionUpdate = async (updatedComp: Competition) => {
    if (!user || !updatedComp.id) return;
    setCompetitions(prev => prev.map(c => c.id === updatedComp.id ? updatedComp : c));
    if (!isGuest && db) {
        const { id, ...compData } = updatedComp;
        await setDoc(doc(db, 'users', user.id, 'competitions', id), compData);
    }
  };
  
  const handlePlaySave = async (playToSave: Play) => {
      if (!user) return;
      try {
          if (isGuest) {
              if (playToSave.id) {
                  setPlays(prev => prev.map(p => p.id === playToSave.id ? playToSave : p));
              } else {
                  setPlays(prev => [...prev, { ...playToSave, id: Date.now().toString() }]);
              }
          } else if (db) {
              if (playToSave.id) { // Update
                  const { id, ...playData } = playToSave;
                  await setDoc(doc(db, 'users', user.id, 'plays', id), playData);
                  setPlays(prev => prev.map(p => p.id === id ? playToSave : p));
              } else { // Create
                  const newDocRef = doc(collection(db, 'users', user.id, 'plays'));
                  const { id, ...playData } = playToSave;
                  await setDoc(newDocRef, playData);
                  const newPlay = { ...playToSave, id: newDocRef.id };
                  setPlays(prev => [...prev, newPlay]);
              }
          }
      } catch (error) {
          console.error("Error saving play:", error);
          alert(`No se pudo guardar la jugada. Error: ${error instanceof Error ? error.message : String(error)}`);
      }
  };

  const handlePlayDelete = async (playId: string) => {
      if (!user) return;
      setPlays(prev => prev.filter(p => p.id !== playId));
      if (!isGuest && db) {
          await deleteDoc(doc(db, 'users', user.id, 'plays', playId));
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
          <div className="absolute top-0 right-0 p-2">
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
            {activeView === 'guide' && <QuickGuide />}
            {activeView === 'teams' && <TeamsAndSkills onRequestTeamCreation={handleRequestTeamCreation} />}
            {activeView === 'plays' && <Plays managedTeams={managedTeams} plays={plays} onSavePlay={handlePlaySave} onDeletePlay={handlePlayDelete} />}
            {activeView === 'generators' && <Generators />}
            {activeView === 'manager' && !loading && <TeamManager teams={managedTeams} onTeamCreate={handleTeamCreate} onTeamUpdate={handleTeamUpdate} onTeamDelete={handleTeamDelete} requestedRoster={requestedRoster} onRosterRequestHandled={() => setRequestedRoster(null)} isGuest={isGuest} />}
            {activeView === 'live' && !loading && <LiveGame managedTeams={managedTeams} onTeamUpdate={handleTeamUpdate} />}
            {activeView === 'leagues' && !loading && <Leagues managedTeams={managedTeams} initialCompetitions={competitions} onCompetitionCreate={handleCompetitionCreate} onCompetitionUpdate={handleCompetitionUpdate} isGuest={isGuest} />}
        </div>

        <footer className="text-center mt-12 text-slate-500 text-sm">
          <p>Hecho para entrenadores de Blood Bowl en todo el mundo.</p>
        </footer>
      </main>
    </div>
  );
};

export default MainApp;