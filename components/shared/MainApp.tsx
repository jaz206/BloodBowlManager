import React, { useState, useEffect, useMemo } from 'react';
// ── Pages ─────────────────────────────────────────────────────────────────────
import Home from '../../pages/Home/index';
import OraclePage from '../../pages/Oracle/index';
import GuildPage from '../../pages/Guild/index';
import TacticalBoardPage from '../../pages/Guild/TacticalBoardPage';
import MatchPage from '../../pages/Arena/MatchPage';
import { Leagues as LeaguesPage } from '../../pages/Arena/LeaguesPage';
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
import StadiumIcon from '../icons/StadiumIcon';
// ── Types & Firebase ──────────────────────────────────────────────────────────
import type { ManagedTeam, League, Play, GameEvent, MatchReport, Competition } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebaseConfig';
import { addDoc, collection, onSnapshot, setDoc, doc, updateDoc, deleteDoc, query, limit, orderBy, serverTimestamp } from "firebase/firestore";
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSelector from '../common/LanguageSelector';
import { useMasterData } from '../../hooks/useMasterData';
import { getGuestTeams } from '../../utils/testData';
import { generateJoinCode } from '../../pages/Arena/competitionUtils';

type View = 'home' | 'oracle' | 'starplayers' | 'guild' | 'tactical' | 'arena' | 'leagues' | 'guide' | 'admin';
type SyncStatus = 'synced' | 'syncing' | 'error';

const GuestWarningBanner = () => {
  const { t } = useLanguage();
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="bg-black/60 backdrop-blur-xl border border-blood-red/30 px-6 py-2 rounded-full shadow-2xl flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-blood-red animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">
          {t('guest.warning')}
        </span>
      </div>
    </div>
  );
};

const MainApp: React.FC = () => {
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState<View>('home');
  const { user, isAdmin } = useAuth();
  const isGuest = useMemo(() => user?.id.startsWith('guest-'), [user]);

  const [managedTeams, setManagedTeams] = useState<ManagedTeam[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [plays, setPlays] = useState<Play[]>([]);
  const [matchReports, setMatchReports] = useState<MatchReport[]>([]);
  const [recentEvents, setRecentEvents] = useState<GameEvent[]>([]);

  const [dataInitiallyLoaded, setDataInitiallyLoaded] = useState(false);
  const [requestedRoster, setRequestedRoster] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<SyncStatus>('synced');
  const { heroImage, isFromFirestore, error: masterDataError } = useMasterData();
  const [oracleSearchTerm, setOracleSearchTerm] = useState<string>('');
  const [arenaMatchConfig, setArenaMatchConfig] = useState<{ 
    homeTeam: ManagedTeam; 
    opponentTeam: ManagedTeam; 
    competition: Competition;
    matchup: any;
  } | null>(null);
  const localCompetitionsKey = user ? `bb-local-competitions-${user.id}` : null;

  const readLocalCompetitions = (): League[] => {
    if (!localCompetitionsKey || typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(localCompetitionsKey) || '[]') as League[];
    } catch {
      return [];
    }
  };

  const persistLocalCompetitions = (nextCompetitions: League[]) => {
    if (!localCompetitionsKey || typeof window === 'undefined') return;
    localStorage.setItem(localCompetitionsKey, JSON.stringify(nextCompetitions));
  };

  const mergeCompetitions = (remote: League[], local: League[]) => {
    const byId = new Map<string, League>();
    [...local, ...remote].forEach(comp => {
      if (comp?.id) byId.set(comp.id, comp);
    });
    return Array.from(byId.values()).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  };

  const handleNavigate = (view: View, payload?: string) => {
    if (view === 'oracle') {
      setOracleSearchTerm(payload || '');
    }
    if (view === 'guild' && payload) {
      setRequestedRoster(null); // Clear roster request if selecting existing team
      // Use a temporary state or pass directly if payload is teamId
    }
    setActiveView(view);
    if (payload && view === 'guild') {
      // We'll use requestedRoster as a proxy or add a new state. 
      // Actually, let's add a proper state for direct team opening.
      setDirectOpenTeamId(payload);
    } else {
      setDirectOpenTeamId(null);
    }
    
    // Si navegamos fuera de arena, limpiar config de partido de competición
    if (view !== 'arena') {
      setArenaMatchConfig(null);
    }
  };

  const handleNavigateToMatch = (matchup: any, competition: Competition, homeClone: ManagedTeam, opponentClone: ManagedTeam) => {
    setArenaMatchConfig({
      homeTeam: homeClone,
      opponentTeam: opponentClone,
      competition,
      matchup
    });
    setActiveView('arena');
  };

  const [directOpenTeamId, setDirectOpenTeamId] = useState<string | null>(null);

  // Combine sync states
  const displaySyncStatus = masterDataError ? 'error' : syncState;

  useEffect(() => {
    if (isGuest || !user || !db) {
      if (managedTeams.length === 0) {
        const cached = localStorage.getItem('bb-guest-teams');
        if (cached) {
          setManagedTeams(JSON.parse(cached));
        } else {
          setManagedTeams(getGuestTeams());
        }
      }
      setPlays([]);
      setDataInitiallyLoaded(true);
      setSyncState('synced');
    } else {
      const cachedCompetitions = readLocalCompetitions();
      if (cachedCompetitions.length) {
        setLeagues(prev => mergeCompetitions(prev as League[], cachedCompetitions));
      }

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

      const reportsUnsub = onSnapshot(
        query(
          collection(db, 'users', user.id, 'matchReports'),
          orderBy('createdAt', 'desc'),
          limit(50)
        ),
        (snapshot) => {
          console.log(`MainApp: Recibidos ${snapshot.docs.length} reportes de partido de Firestore`);
          const reports = snapshot.docs.map(doc => {
            const data = doc.data();
            return { id: doc.id, ...data } as MatchReport;
          });
          
          setMatchReports(reports);
          setSyncState('synced');
        },
        (error) => {
          console.error("MainApp: Error sincronizando reportes de partido:", error);
          // Si el error es por falta de índice, volvemos a la consulta simple como fallback
          if (error.message.includes('requires an index')) {
            console.warn("MainApp: El índice para 'matchReports' aún no existe. Usando consulta sin orden.");
            onSnapshot(query(collection(db, 'users', user.id, 'matchReports'), limit(50)), (fallbackSnapshot) => {
              const fallbackReports = fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MatchReport[];
              const sorted = [...fallbackReports].sort((a, b) => {
                const timeA = (a.createdAt as any)?.seconds || 0;
                const timeB = (b.createdAt as any)?.seconds || 0;
                return timeB - timeA;
              });
              setMatchReports(sorted);
            });
          } else {
            setSyncState('error');
          }
        }
      );

      return () => {
        teamsUnsub();
        playsUnsub();
        reportsUnsub();
      };
    }
  }, [user, isGuest]);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'leagues'), orderBy('createdAt', 'desc'), limit(10));
    const leaguesUnsub = onSnapshot(q, (snapshot) => {
      const remote = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as League[];
      const local = readLocalCompetitions();
      setLeagues(mergeCompetitions(remote, local));
    });
    return () => leaguesUnsub();
  }, [db, localCompetitionsKey]);

  const handleTeamCreate = async (newTeamData: Omit<ManagedTeam, 'id'>) => {
    if (!user) return;
    setSyncState('syncing');
    if (isGuest) {
      const updated = [...managedTeams, { ...newTeamData, id: `temp_${Date.now()}` } as ManagedTeam];
      setManagedTeams(updated);
      localStorage.setItem('bb-guest-teams', JSON.stringify(updated));
      setSyncState('synced');
      return;
    }
    try {
      if (!db) return;
      // Sanitizar datos para evitar errores de Firestore (eliminar undefined)
      const sanitizedTeam = JSON.parse(JSON.stringify(newTeamData));
      const teamRef = await addDoc(collection(db, 'users', user.id, 'teams'), sanitizedTeam);
      setManagedTeams(prev => {
        if (prev.some(team => team.id === teamRef.id)) return prev;
        return [...prev, { ...sanitizedTeam, id: teamRef.id } as ManagedTeam];
      });
      setSyncState('synced');
    } catch (error) {
      console.error("Error creating team in Firestore:", error);
      setSyncState('error');
      throw error; // Lanzar el error para que la UI pueda capturarlo
    }
  };

  const handleTeamUpdate = async (updatedTeam: ManagedTeam) => {
    // Si tenemos un partido de competición activo, la actualización debe ir al clon en la liga
    if (arenaMatchConfig?.competition) {
      const comp = leagues.find(l => l.id === arenaMatchConfig.competition.id) as Competition;
      if (comp) {
        const updatedTeams = comp.teams.map(t => {
          if (t.teamName === updatedTeam.name && t.ownerId === user?.id) {
            // Actualizar el clon y sus estadísticas
            const won = updatedTeam.record?.wins || 0;
            const drawn = updatedTeam.record?.draws || 0;
            const lost = updatedTeam.record?.losses || 0;
            const played = won + drawn + lost;
            const points = (won * 3) + drawn;

            return { 
              ...t, 
              teamState: updatedTeam,
              stats: {
                ...(t.stats || { tdFor: 0, tdAgainst: 0, casFor: 0, casAgainst: 0 }),
                played, won, drawn, lost, points
              }
            };
          }
          return t;
        });

        // Caso especial: si es el equipo del propietario (host), también puede ser teamState o baseTeam
        const isOwner = comp.ownerId === user?.id && comp.baseTeam?.name === updatedTeam.name;
        const finalComp = { 
          ...comp, 
          teams: updatedTeams
        };
        
        handleCompetitionUpdate(finalComp as Competition);
        return;
      }
    }

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
      setManagedTeams(prev => prev.filter(team => team.id !== teamId));
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

  const handleMatchReportCreate = async (report: Omit<MatchReport, 'id'>) => {
    if (!user || !db) return;
    setSyncState('syncing');
    console.log("MainApp: Creando nuevo reporte de partido...", report);
    
    if (isGuest) {
      const tempId = `temp_${Date.now()}`;
      setMatchReports(prev => [{ ...report, id: tempId } as MatchReport, ...prev]);
      setSyncState('synced');
      return tempId;
    }
    try {
      // Optimistic update
      const tempId = `temp_${Date.now()}`;
      const optimisticReport = { ...report, id: tempId, createdAt: { seconds: Math.floor(Date.now() / 1000) } } as unknown as MatchReport;
      setMatchReports(prev => [optimisticReport, ...prev]);

      const docRef = await addDoc(collection(db, 'users', user.id, 'matchReports'), {
        ...report,
        createdAt: serverTimestamp()
      });
      console.log("MainApp: Reporte guardado con éxito con ID:", docRef.id);
      setSyncState('synced');
      return docRef.id;
    } catch (error) {
      console.error("MainApp: Error al crear el reporte de partido:", error);
      setSyncState('error');
      return null;
    }
  };

  const handleCompetitionCreate = async (newCompData: Omit<Competition, 'id'>) => {
    if (!user) return;
    setSyncState('syncing');
    try {
      const competitionId = crypto.randomUUID ? crypto.randomUUID() : `comp_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const competitionPayload = {
        ...newCompData,
        createdBy: newCompData.createdBy || user.id,
        joinCode: newCompData.joinCode || generateJoinCode(newCompData.name),
      };
      const tempCompetition = { ...competitionPayload, id: competitionId } as League;
      if (isGuest || !db) {
        setLeagues(prev => [tempCompetition, ...prev.filter(c => c.id !== tempCompetition.id)]);
        persistLocalCompetitions([tempCompetition, ...readLocalCompetitions().filter(c => c.id !== tempCompetition.id)]);
      } else {
        setLeagues(prev => [tempCompetition, ...prev.filter(c => c.id !== tempCompetition.id)]);
        persistLocalCompetitions([tempCompetition, ...readLocalCompetitions().filter(c => c.id !== tempCompetition.id)]);
        await setDoc(doc(db, 'leagues', competitionId), {
          ...competitionPayload,
          createdAt: serverTimestamp()
        });
        setLeagues(prev => [
          {
            ...competitionPayload,
            id: competitionId,
            createdAt: { seconds: Math.floor(Date.now() / 1000) }
          } as League,
          ...prev.filter(c => c.id !== competitionId),
        ]);
        persistLocalCompetitions([
          {
            ...competitionPayload,
            id: competitionId,
            createdAt: { seconds: Math.floor(Date.now() / 1000) }
          } as League,
          ...readLocalCompetitions().filter(c => c.id !== competitionId),
        ]);
      }
      setSyncState('synced');
    } catch (error) {
      console.error("Error creating competition:", error);
      setSyncState('error');
    }
  };

  const handleCompetitionUpdate = async (updatedComp: Competition) => {
    if (!user || !updatedComp.id) return;
    setSyncState('syncing');
    try {
      if (isGuest || !db) {
        const updatedLocal = mergeCompetitions(
          [updatedComp as League],
          readLocalCompetitions().map(c => c.id === updatedComp.id ? updatedComp as League : c)
        );
        setLeagues(prev => prev.map(c => c.id === updatedComp.id ? updatedComp as League : c));
        persistLocalCompetitions(updatedLocal);
      } else {
        const compRef = doc(db, 'leagues', updatedComp.id);
        const { id, ...data } = updatedComp;
        await updateDoc(compRef, data);
        setLeagues(prev => prev.map(c => c.id === updatedComp.id ? updatedComp as League : c));
        persistLocalCompetitions(mergeCompetitions(
          readLocalCompetitions().map(c => c.id === updatedComp.id ? updatedComp as League : c),
          [updatedComp as League]
        ));
      }
      setSyncState('synced');
    } catch (error) {
      console.error("Error updating competition:", error);
      setSyncState('error');
    }
  };

  const handleCompetitionDelete = async (compId: string) => {
    if (!user) return;
    setSyncState('syncing');
    try {
      if (isGuest || !db) {
        setLeagues(prev => prev.filter(c => c.id !== compId));
        persistLocalCompetitions(readLocalCompetitions().filter(c => c.id !== compId));
      } else {
        await deleteDoc(doc(db, 'leagues', compId));
        setLeagues(prev => prev.filter(c => c.id !== compId));
        persistLocalCompetitions(readLocalCompetitions().filter(c => c.id !== compId));
      }
      setSyncState('synced');
    } catch (error) {
      console.error("Error deleting competition:", error);
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
        data-active={isActive}
        className="blood-ui-nav-button group flex items-center gap-3 px-4 h-full rounded-none border-b-0"
      >
        {React.cloneElement(icon, {
          className: `w-4 h-4 transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`
        })}
        <span className={`text-[9px] font-display font-black uppercase tracking-[0.2em] ${isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>
          {label}
        </span>
      </button>
    );
  };

  const mainClasses = (activeView === 'arena' || activeView === 'tactical' || activeView === 'admin') ? '' : 'container mx-auto max-w-7xl px-2 sm:px-6 pb-2 sm:pb-6';

  return (
    <div className="min-h-screen blood-ui-shell text-slate-200 font-sans antialiased selection:bg-premium-gold selection:text-black">
      {isGuest && <GuestWarningBanner />}
      {/* Dot Grid Background Layer */}
      <div className="fixed inset-0 pointer-events-none opacity-40 z-0 blood-ui-bg-noise" style={{ backgroundImage: 'radial-gradient(rgba(202, 138, 4, 0.15) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      <div className="w-full fixed top-0 left-0 z-[100]">
          <header className="blood-ui-header h-16 flex items-center justify-between px-10 relative group">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#CA8A04]/40 to-transparent opacity-50"></div>

            {/* Left: Logo & Admin */}
            <div className="flex items-center gap-6">
              <div 
                onClick={() => setActiveView('home')}
                className="flex items-center gap-3 cursor-pointer group/logo"
              >
                <span className="material-symbols-outlined text-[#CA8A04] text-2xl font-black transform group-hover/logo:rotate-12 transition-transform">sports_football</span>
                <h1 className="font-epilogue font-black italic text-xl tracking-tighter uppercase flex gap-1.5 leading-none">
                    <span className="text-[#CA8A04]">BB</span>
                    <span className="text-white hidden lg:inline">ASSISTANT</span>
                </h1>
              </div>

              {isAdmin && (
                <button
                  onClick={() => setActiveView('admin')}
                  className={`blood-ui-chip blood-ui-chip--gold px-3 py-1.5 transition-all ${activeView === 'admin'
                    ? 'shadow-[0_0_0_1px_rgba(255,255,255,0.14)_inset]'
                    : 'hover:shadow-[0_0_20px_rgba(202,138,4,0.15)]'
                    }`}
                >
                  {t('nav.admin')}
                </button>
              )}
            </div>

            {/* Center: Main Navigation */}
            <nav className="h-full hidden md:flex items-center">
                <NavButton view="home" label={t('nav.home')} icon={<HomeIcon />} />
                <NavButton view="oracle" label={t('nav.oracle')} icon={<BookOpenIcon />} />
                <NavButton view="guild" label={t('nav.guild')} icon={<UsersIcon />} />
                <NavButton view="leagues" label={t('nav.leagues')} icon={<TrophyIcon />} />
                <NavButton view="arena" label={t('nav.arena')} icon={<StadiumIcon />} />
                <NavButton view="tactical" label={t('nav.tactical')} icon={<ClipboardListIcon />} />
            </nav>

            {/* Right: User Actions */}
            <div className="flex items-center gap-5">
              <button className="text-[#CA8A04]/60 hover:text-[#CA8A04] transition-colors relative hidden sm:block">
                <span className="material-symbols-outlined font-black">notifications</span>
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full border border-black animate-pulse"></span>
              </button>
              
              <button className="text-[#CA8A04]/60 hover:text-[#CA8A04] transition-colors hidden sm:block">
                <span className="material-symbols-outlined font-black">settings</span>
              </button>

              <div className="h-6 w-[1px] bg-white/10 mx-1 hidden sm:block"></div>

              <UserProfile />
            </div>
          </header>
      </div>

      <main className={`${mainClasses} pt-28 pb-12 transition-all duration-700`}>
        <div className="min-h-[60vh] relative group/main">
          {!dataInitiallyLoaded ? (
            <div className="flex flex-col items-center justify-center text-white py-40">
              <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-premium-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-sm font-display uppercase tracking-widest mt-4 animate-pulse text-premium-gold/60">{t('loading.sync')}</p>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              {activeView === 'home' && (
                <Home
                  onNavigate={(v, p) => handleNavigate(v, p)}
                  onCreateTeam={() => { setRequestedRoster(""); setActiveView('guild'); }}
                  managedTeams={managedTeams}
                  competitions={leagues as any}
                  recentEvents={recentEvents}
                  heroImage={heroImage}
                  matchReports={matchReports}
                />
              )}
              {activeView === 'oracle' && (
                <OraclePage
                  managedTeams={managedTeams}
                  initialSearchTerm={oracleSearchTerm}
                  onRequestTeamCreation={(r) => { setRequestedRoster(r); setActiveView('guild'); }}
                />
              )}
              {activeView === 'guild' && (
                <GuildPage
                  teams={managedTeams}
                  competitions={leagues}
                  onTeamCreate={handleTeamCreate}
                  onTeamUpdate={handleTeamUpdate}
                  onTeamDelete={handleTeamDelete}
                  requestedRoster={requestedRoster}
                  onRosterRequestHandled={() => setRequestedRoster(null)}
                  isGuest={isGuest}
                  matchReports={matchReports}
                  initialTeamId={directOpenTeamId}
                  onInitialTeamHandled={() => setDirectOpenTeamId(null)}
                />
              )}
              {activeView === 'tactical' && <TacticalBoardPage managedTeams={managedTeams} plays={plays} onSavePlay={handlePlaySave} onDeletePlay={handlePlayDelete} />}
              {activeView === 'arena' && <MatchPage 
                managedTeams={managedTeams} 
                matchReports={matchReports} 
                onTeamUpdate={handleTeamUpdate} 
                onMatchReportCreate={handleMatchReportCreate}
                initialHomeTeam={arenaMatchConfig?.homeTeam}
                initialOpponentTeam={arenaMatchConfig?.opponentTeam}
                competition={arenaMatchConfig?.competition}
              />}
              {activeView === 'leagues' && (
              <LeaguesPage
                  managedTeams={managedTeams}
                  initialCompetitions={leagues}
                  onCompetitionCreate={handleCompetitionCreate}
                  onCompetitionUpdate={handleCompetitionUpdate}
                  onCompetitionDelete={handleCompetitionDelete}
                  onNavigateToMatch={handleNavigateToMatch}
                  isGuest={isGuest}
                />
              )}
              {activeView === 'admin' && (
                <AdminPanel
                  managedTeams={managedTeams}
                  competitions={leagues}
                  onCompetitionCreate={handleCompetitionCreate}
                  onOpenLeagues={() => setActiveView('leagues')}
                />
              )}
              {activeView === 'guide' && <QuickGuide />}
            </div>
          )}
        </div>
      </main>

      {/* Footer and mobile nav could be added here if needed */}


      <div className="fixed inset-0 pointer-events-none overflow-hidden h-screen w-screen z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-premium-gold/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blood-red/5 blur-[120px] rounded-full"></div>
      </div>
    </div>
  );
};

export default MainApp;
