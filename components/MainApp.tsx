


import React, { useState, useEffect, useMemo } from 'react';
import QuickGuide from './QuickGuide';
import TeamsAndSkills from './TeamsAndSkills';
import Plays from './Plays';
import Generators from './Generators';
import TeamManager from './TeamManager';
// FIX: Changed import to a named import as LiveGame is not a default export.
import { LiveGame } from './LiveGame';
import BookOpenIcon from './icons/BookOpenIcon';
import UsersIcon from './icons/UsersIcon';
import ClipboardListIcon from './icons/ClipboardListIcon';
import CubeIcon from './icons/CubeIcon';
import ShieldCheckIcon from './icons/ShieldCheckIcon';
import StopwatchIcon from './icons/StopwatchIcon';
import type { ManagedTeam } from '../types';
import { useAuth } from '../hooks/useAuth';
import UserProfile from './UserProfile';
import TrophyIcon from './icons/TrophyIcon';
// FIX: Changed import to a named import as Leagues is not a default export.
import { Leagues } from './Leagues';
import { db } from '../App';
import { collection, getDocs, addDoc, doc, setDoc, deleteDoc } from "firebase/firestore";

type View = 'guide' | 'teams' | 'plays' | 'generators' | 'manager' | 'live' | 'leagues';

const MainApp: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('guide');
  const [managedTeams, setManagedTeams] = useState<ManagedTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestedRoster, setRequestedRoster] = useState<string | null>(null);
  const { user } = useAuth();

  const TEAMS_STORAGE_KEY = useMemo(() => user ? `bb-teams-${user.id}` : null, [user]);

  useEffect(() => {
    setLoading(true);
    if (!user || !TEAMS_STORAGE_KEY) {
        setManagedTeams([]);
        setLoading(false);
        return;
    }

    if (user.id.startsWith('guest-')) {
        // Guest mode - use localStorage
        try {
            const storedTeams = localStorage.getItem(TEAMS_STORAGE_KEY);
            setManagedTeams(storedTeams ? JSON.parse(storedTeams) : []);
        } catch (error) {
            console.error("Failed to load guest teams from localStorage", error);
            setManagedTeams([]);
        } finally {
            setLoading(false);
        }
    } else {
        // Firebase user - fetch from Firestore
        if (!db) {
            console.error("Firestore is not initialized, cannot fetch teams.");
            setManagedTeams([]);
            setLoading(false);
            return;
        }
        const fetchTeams = async () => {
            try {
                const teamsCollectionRef = collection(db, 'users', user.id, 'teams');
                const querySnapshot = await getDocs(teamsCollectionRef);
                const teamsFromFirestore = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as ManagedTeam[];
                setManagedTeams(teamsFromFirestore);
            } catch (error) {
                console.error("Error fetching teams from Firestore:", error);
                setManagedTeams([]);
            } finally {
                setLoading(false);
            }
        };
        fetchTeams();
    }
  }, [user, TEAMS_STORAGE_KEY]);

  const handleTeamCreate = async (newTeamData: Omit<ManagedTeam, 'id'>) => {
    if (!user || !TEAMS_STORAGE_KEY) return;
    
    if (user.id.startsWith('guest-')) {
        const teamWithId = { ...newTeamData, id: Date.now().toString() };
        const updatedTeams = [...managedTeams, teamWithId];
        setManagedTeams(updatedTeams);
        localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(updatedTeams));
    } else {
        if (!db) {
            console.error("Firestore is not initialized. Cannot create team.");
            return;
        }
        try {
            const teamsCollectionRef = collection(db, 'users', user.id, 'teams');
            const docRef = await addDoc(teamsCollectionRef, newTeamData);
            setManagedTeams(prev => [...prev, { ...newTeamData, id: docRef.id }]);
        } catch (error) {
            console.error("Error creating team in Firestore:", error);
        }
    }
  };

  const handleTeamUpdate = async (updatedTeam: ManagedTeam) => {
    if (!user || !updatedTeam.id || !TEAMS_STORAGE_KEY) return;
    
    setManagedTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));

    if (user.id.startsWith('guest-')) {
        const updatedTeams = managedTeams.map(t => t.id === updatedTeam.id ? updatedTeam : t);
        localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(updatedTeams));
    } else {
        if (!db) {
            console.error("Firestore is not initialized. Cannot update team.");
            return;
        }
        try {
            const teamDocRef = doc(db, 'users', user.id, 'teams', updatedTeam.id);
            const { id, ...teamData } = updatedTeam;
            await setDoc(teamDocRef, teamData);
        } catch (error) {
            console.error("Error updating team in Firestore:", error);
        }
    }
  };

  const handleTeamDelete = async (teamId: string) => {
    if (!user || !TEAMS_STORAGE_KEY) return;
    
    setManagedTeams(prev => prev.filter(t => t.id !== teamId));

    if (user.id.startsWith('guest-')) {
        const updatedTeams = managedTeams.filter(t => t.id !== teamId);
        localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(updatedTeams));
    } else {
        if (!db) {
            console.error("Firestore is not initialized. Cannot delete team.");
            return;
        }
        try {
            const teamDocRef = doc(db, 'users', user.id, 'teams', teamId);
            await deleteDoc(teamDocRef);
        } catch (error) {
            console.error("Error deleting team from Firestore:", error);
        }
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
            {activeView === 'plays' && <Plays managedTeams={managedTeams} />}
            {activeView === 'generators' && <Generators />}
            {activeView === 'manager' && !loading && <TeamManager teams={managedTeams} onTeamCreate={handleTeamCreate} onTeamUpdate={handleTeamUpdate} onTeamDelete={handleTeamDelete} requestedRoster={requestedRoster} onRosterRequestHandled={() => setRequestedRoster(null)} />}
            {activeView === 'live' && !loading && <LiveGame managedTeams={managedTeams} onTeamsUpdate={() => { /* This needs refactoring if live game edits teams */ }} />}
            {activeView === 'leagues' && !loading && <Leagues managedTeams={managedTeams} />}
        </div>

        <footer className="text-center mt-12 text-slate-500 text-sm">
          <p>Hecho para entrenadores de Blood Bowl en todo el mundo.</p>
        </footer>
      </main>
    </div>
  );
};

export default MainApp;
