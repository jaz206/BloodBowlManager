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
import PostGameWizard from './PostGameWizard';
import { useAuth } from '../hooks/useAuth';
import UserProfile from './UserProfile';
import TrophyIcon from './icons/TrophyIcon';
import Leagues from './Leagues';
import CalendarIcon from './icons/CalendarIcon';

type View = 'guide' | 'teams' | 'plays' | 'generators' | 'manager' | 'live' | 'leagues';

const MainApp: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('guide');
  const [managedTeams, setManagedTeams] = useState<ManagedTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestedRoster, setRequestedRoster] = useState<string | null>(null);
  const { user } = useAuth();

  const TEAMS_STORAGE_KEY = useMemo(() => user ? `bb-teams-${user.id}` : 'bloodbowl-managed-teams', [user]);

  useEffect(() => {
    setLoading(true);
    try {
        const storedTeams = localStorage.getItem(TEAMS_STORAGE_KEY);
        if (storedTeams) {
            setManagedTeams(JSON.parse(storedTeams));
        } else {
            setManagedTeams([]); // Clear teams when user changes and no data is found
        }
    } catch (error) {
        console.error("Failed to load teams from localStorage", error);
        setManagedTeams([]);
    } finally {
        setLoading(false);
    }
  }, [TEAMS_STORAGE_KEY]);

  const handleTeamsUpdate = (updatedTeams: ManagedTeam[]) => {
      setManagedTeams(updatedTeams);
      localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(updatedTeams));
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
            {activeView === 'manager' && !loading && <TeamManager teams={managedTeams} onTeamsUpdate={handleTeamsUpdate} requestedRoster={requestedRoster} onRosterRequestHandled={() => setRequestedRoster(null)} />}
            {activeView === 'live' && !loading && <LiveGame managedTeams={managedTeams} onTeamsUpdate={handleTeamsUpdate} />}
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