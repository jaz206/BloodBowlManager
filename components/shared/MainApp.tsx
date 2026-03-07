import React, { useState, useEffect, useMemo } from 'react';
// ── Pages ─────────────────────────────────────────────────────────────────────
import Home from '../../pages/Home/index';
import OraclePage from '../../pages/Oracle/index';
import GuildPage from '../../pages/Guild/index';
import TacticalBoardPage from '../../pages/Guild/TacticalBoardPage';
import MatchPage from '../../pages/Arena/MatchPage';
// ── Components / Common ───────────────────────────────────────────────────────
import UserProfile from '../common/UserProfile';
import SyncStatusIndicator from '../common/SyncStatusIndicator';
// ── Components / Oracle ───────────────────────────────────────────────────────
import QuickGuide from '../oracle/QuickGuide';
// ── Components / Shared ───────────────────────────────────────────────────────
import AdminPanel from './AdminPanel';
// ── Icons ─────────────────────────────────────────────────────────────────────
import BookOpenIcon from '../icons/BookOpenIcon';
import UsersIcon from '../icons/UsersIcon';
import ClipboardListIcon from '../icons/ClipboardListIcon';
import TrophyIcon from '../icons/TrophyIcon';
import HomeIcon from '../icons/HomeIcon';
// ── Types & Firebase ──────────────────────────────────────────────────────────
import type { ManagedTeam, League, Play, GameEvent } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, limit, orderBy } from "firebase/firestore";

type View = 'home' | 'oracle' | 'starplayers' | 'guild' | 'tactical' | 'arena' | 'leagues' | 'guide' | 'admin';
type SyncStatus = 'synced' | 'syncing' | 'error';

const GuestWarningBanner = () => (
  <div className="bg-blood-red/40 backdrop-blur-md border-b border-blood-red/50 text-white text-center p-2 text-[10px] font-display uppercase tracking-[0.2em] sticky top-0 z-[60] shadow-2xl">
    <span className="opacity-80">Estás en modo Invitado. Tu progreso no se guardará al cerrar o recargar la página.</span>
  </div>
);

const MainApp: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('home');
  const { user, isAdmin } = useAuth();
  const isGuest = useMemo(() => user?.id.startsWith('guest-'), [user]);

  const [managedTeams, setManagedTeams] = useState<ManagedTeam[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [plays, setPlays] = useState<Play[]>([]);
  const [recentEvents, setRecentEvents] = useState<GameEvent[]>([]);

  const [dataInitiallyLoaded, setDataInitiallyLoaded] = useState(false);
  const [requestedRoster, setRequestedRoster] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<SyncStatus>('synced');

  useEffect(() => {
    if (isGuest || !user || !db) {
      setManagedTeams([]);
      setPlays([]);
      setDataInitiallyLoaded(true);
      setSyncState('synced');
    } else {
      const teamsUnsub = onSnapshot(collection(db, 'users', user.id, 'teams'),
        (snapshot) => {
          setManagedTeams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ManagedTeam[]);
          if (!dataInitiallyLoaded) setDataInitiallyLoaded(true);
          setSyncState('synced');
        },
        (error) => {
          console.error("MainApp: Error fetching teams:", error);
          setDataInitiallyLoaded(true);
          setSyncState('error');
        }
      );

      const playsUnsub = onSnapshot(collection(db, 'users', user.id, 'plays'),
        (snapshot) => {
          setPlays(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Play[]);
        }
      );

      return () => {
        teamsUnsub();
        playsUnsub();
      };
    }
  }, [user, isGuest]);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'leagues'), orderBy('createdAt', 'desc'), limit(10));
    const leaguesUnsub = onSnapshot(q, (snapshot) => {
      setLeagues(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as League[]);
    });
    return () => leaguesUnsub();
  }, [db]);

  const handleTeamCreate = async (newTeamData: Omit<ManagedTeam, 'id'>) => {
    if (!user) return;
    setSyncState('syncing');
    if (isGuest) {
      setManagedTeams(prev => [...prev, { ...newTeamData, id: `temp_${Date.now()}` } as ManagedTeam]);
      setSyncState('synced');
      return;
    }
    try {
      if (!db) return;
      await addDoc(collection(db, 'users', user.id, 'teams'), newTeamData);
      setSyncState('synced');
    } catch (error) {
      console.error("Error creating team:", error);
      setSyncState('error');
    }
  };

  const handleTeamUpdate = async (updatedTeam: ManagedTeam) => {
    if (!user || isGuest || !db || !updatedTeam.id) return;
    setSyncState('syncing');
    try {
      const teamRef = doc(db, 'users', user.id, 'teams', updatedTeam.id);
      const { id, ...data } = updatedTeam;
      await updateDoc(teamRef, data);
      setSyncState('synced');
    } catch (error) {
      console.error("Error updating team:", error);
      setSyncState('error');
    }
  };

  const handleTeamDelete = async (teamId: string) => {
    if (!user || isGuest || !db) return;
    setSyncState('syncing');
    try {
      await deleteDoc(doc(db, 'users', user.id, 'teams', teamId));
      setSyncState('synced');
    } catch (error) {
      console.error("Error deleting team:", error);
      setSyncState('error');
    }
  };

  const handlePlaySave = async (play: Play) => {
    if (!user || !db) return;
    setSyncState('syncing');
    if (isGuest) {
      if (play.id) {
        setPlays(prev => prev.map(p => p.id === play.id ? play : p));
      } else {
        setPlays(prev => [...prev, { ...play, id: `temp_${Date.now()}` }]);
      }
      setSyncState('synced');
      return;
    }
    try {
      if (play.id) {
        const playRef = doc(db, 'users', user.id, 'plays', play.id);
        const { id, ...data } = play;
        await updateDoc(playRef, data);
      } else {
        await addDoc(collection(db, 'users', user.id, 'plays'), play);
      }
      setSyncState('synced');
    } catch (error) {
      console.error("Error saving play:", error);
      setSyncState('error');
    }
  };

  const handlePlayDelete = async (playId: string) => {
    if (!user || !db) return;
    setSyncState('syncing');
    if (isGuest) {
      setPlays(prev => prev.filter(p => p.id !== playId));
      setSyncState('synced');
      return;
    }
    try {
      await deleteDoc(doc(db, 'users', user.id, 'plays', playId));
      setSyncState('synced');
    } catch (error) {
      console.error("Error deleting play:", error);
      setSyncState('error');
    }
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
        className={`flex-1 group flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-3 text-center transition-all duration-300 relative ${isActive
          ? 'text-premium-gold'
          : 'text-slate-500 hover:text-white hover:bg-white/5'
          }`}
      >
        {React.cloneElement(icon, {
          className: `w-5 h-5 transition-all duration-300 ${isActive ? 'text-premium-gold scale-110' : 'text-slate-500 group-hover:text-white group-hover:scale-110'}`
        })}
        <span className={`hidden sm:inline font-display text-[10px] tracking-widest font-bold uppercase ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
          {label}
        </span>
        {isActive && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-premium-gold shadow-[0_0_10px_rgba(202,138,4,0.5)]" />
        )}
      </button>
    );
  };

  const mainClasses = (activeView === 'arena' || activeView === 'tactical' || activeView === 'admin') ? '' : 'container mx-auto max-w-7xl p-2 sm:p-6';

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans antialiased selection:bg-premium-gold selection:text-black">
      {isGuest && <GuestWarningBanner />}
      <header className="p-4 flex justify-between items-center glass-panel border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-[100]">
        <div className="flex items-center gap-4">
          <h1
            onClick={() => setActiveView('home')}
            className="text-2xl font-display font-black text-white italic tracking-tighter leading-none cursor-pointer group"
          >
            BLOOD BOWL <span className="text-blood-red group-hover:text-white transition-colors">ASSISTANT</span>
          </h1>
          {isAdmin && (
            <button
              onClick={() => setActiveView('admin')}
              className={`hidden md:block px-3 py-1 rounded border text-[10px] font-display font-black uppercase tracking-widest transition-all ${activeView === 'admin'
                ? 'bg-premium-gold text-black border-premium-gold'
                : 'border-white/20 text-slate-500 hover:border-premium-gold hover:text-premium-gold'
                }`}
            >
              ADMIN
            </button>
          )}
        </div>

        <div className="flex items-center gap-6">
          <SyncStatusIndicator status={syncState} />
          <UserProfile />
        </div>
      </header>

      <main className={`${mainClasses} pt-8 pb-40`}>
        {/* Navigation - Modern Bento Nav (Bottom or Top) */}
        <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl glass-panel border-white/10 overflow-hidden z-[100] shadow-[0_30px_60px_rgba(0,0,0,0.9)] rounded-3xl bg-black/80 backdrop-blur-2xl">
          <div className="flex justify-around items-center h-16">
            <NavButton view="home" label="Inicio" icon={<HomeIcon />} />
            <NavButton view="oracle" label="Oráculo" icon={<BookOpenIcon />} />
            <NavButton view="guild" label="Gremio" icon={<UsersIcon />} />
            <NavButton view="tactical" label="Pizarra" icon={<ClipboardListIcon />} />
            <NavButton view="arena" label="Arena" icon={<TrophyIcon />} />
          </div>
        </nav>

        <div className="min-h-[60vh] relative group/main">
          {!dataInitiallyLoaded ? (
            <div className="flex flex-col items-center justify-center text-white py-40">
              <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-premium-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-sm font-display uppercase tracking-widest mt-4 animate-pulse text-premium-gold/60">Sincronizando con Nuffle...</p>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              {activeView === 'home' && <Home onNavigate={(v) => setActiveView(v)} managedTeams={managedTeams} competitions={leagues as any} recentEvents={recentEvents} />}
              {activeView === 'oracle' && <OraclePage onRequestTeamCreation={(r) => { setRequestedRoster(r); setActiveView('guild'); }} />}
              {activeView === 'guild' && (
                <GuildPage
                  teams={managedTeams}
                  onTeamCreate={handleTeamCreate}
                  onTeamUpdate={handleTeamUpdate}
                  onTeamDelete={handleTeamDelete}
                  requestedRoster={requestedRoster}
                  onRosterRequestHandled={() => setRequestedRoster(null)}
                  isGuest={isGuest}
                />
              )}
              {activeView === 'tactical' && <TacticalBoardPage managedTeams={managedTeams} plays={plays} onSavePlay={handlePlaySave} onDeletePlay={handlePlayDelete} />}
              {activeView === 'arena' && <MatchPage managedTeams={managedTeams} onTeamUpdate={handleTeamUpdate} />}
              {activeView === 'admin' && <AdminPanel />}
              {activeView === 'guide' && <QuickGuide />
              }
            </div>
          )}
        </div>
      </main>

      <div className="fixed inset-0 pointer-events-none overflow-hidden h-screen w-screen z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-premium-gold/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blood-red/5 blur-[120px] rounded-full"></div>
      </div>
    </div>
  );
};

export default MainApp;
