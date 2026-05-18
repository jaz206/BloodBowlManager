import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ManagedTeam, Competition, Matchup, CompetitionTeam, MatchResolution, ManagedPlayer, Team, CompetitionAvailability, CompetitionCadence, CompetitionSchedulingPreferences } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import PencilIcon from '../../components/icons/PencilIcon';
import CalendarIcon from '../../components/icons/CalendarIcon';
import QrCodeIcon from '../../components/icons/QrCodeIcon';
import { cloneCompetition, formatScheduledMatchDate, generateBracket, generateJoinCode, generateSchedule } from './competitionUtils';
import CompetitionMatchResolutionModal from './CompetitionMatchResolutionModal';
import { buildMatchReadyTeamSummary, calculateTeamValue } from '../../utils/teamUtils';
import LeaguesTabbedList from './LeaguesTabbedList';
import { useMasterData } from '../../hooks/useMasterData';

declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}
declare const QRCode: any;
declare const Html5Qrcode: any;

const TeamDashboard = React.lazy(() => import('../../components/guild/TeamDashboard').then(module => ({ default: module.TeamDashboard })));

const trophyImageUrl = 'https://i.pinimg.com/736x/95/dc/9a/95dc9a37df924d550e9922dbf37b9089.jpg';

interface LeaguesProps {
    managedTeams: ManagedTeam[];
    initialCompetitions: Competition[];
    onCompetitionCreate: (comp: Omit<Competition, 'id'>) => Promise<string | null> | string | null;
    onCompetitionUpdate: (comp: Competition) => void;
    onCompetitionDelete: (id: string) => void;
    onNavigateToMatch?: (matchup: Matchup, comp: Competition, myTeam?: ManagedTeam, opponentTeam?: ManagedTeam) => void;
    isGuest: boolean;
}

export const Leagues: React.FC<LeaguesProps> = ({
    managedTeams, 
    initialCompetitions, 
    onCompetitionCreate, 
    onCompetitionUpdate, 
    onCompetitionDelete, 
    onNavigateToMatch,
    isGuest 
}) => {
    const MANUAL_TEAM_BUDGET = 1_000_000;
    const SPP_LEVELS = [6, 16, 31, 51, 76, 126, 176];
    const getDefaultStartDate = () => {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        return nextWeek.toISOString().slice(0, 10);
    };
    const { user } = useAuth();
    const { teams: baseTeams, skills } = useMasterData();
    const [activeTab, setActiveTab] = useState<'my-leagues' | 'my-tournaments' | 'discover' | 'organization'>('my-leagues');
    const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
    const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
    const [detailTab, setDetailTab] = useState<'summary' | 'standings' | 'calendar' | 'news' | 'stats'>('summary');
    const [statsModalTeam, setStatsModalTeam] = useState<import('../../types').ManagedTeam | null>(null);
    const [statsModalEntryId, setStatsModalEntryId] = useState<string | null>(null);
    const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (view === 'detail') setDetailTab('summary');
    }, [view]);

    useEffect(() => {
        if (!selectedCompetition?.teams?.length) {
            setSelectedEntryId(null);
            return;
        }
        if (selectedEntryId && selectedCompetition.teams.some(team => team.entryId === selectedEntryId)) {
            return;
        }
        setSelectedEntryId(selectedCompetition.teams[0]?.entryId || null);
    }, [selectedCompetition, selectedEntryId]);

    const [newCompetitionName, setNewCompetitionName] = useState('');
    const [newCompetitionFormat, setNewCompetitionFormat] = useState<'Liguilla' | 'Torneo'>('Liguilla');
    const [newCompReglamento, setNewCompReglamento] = useState<'BB2025' | 'BB2020' | 'BB2016' | 'Sevens'>('BB2025');
    const [newCompMuerteSubita, setNewCompMuerteSubita] = useState(false);
    const [newCompVisibility, setNewCompVisibility] = useState<'Public' | 'Private'>('Public');
    const [newCompMaxTeams, setNewCompMaxTeams] = useState<number>(8);
    const [newCompIncentivos, setNewCompIncentivos] = useState<'Todos' | 'Reducidos' | 'Ninguno'>('Todos');
    const [newCompTiempoTurno, setNewCompTiempoTurno] = useState(4);
    const [newCompMercenarios, setNewCompMercenarios] = useState(true);
    const [newCompPettyCash, setNewCompPettyCash] = useState(true);
    const [newCompPrayers, setNewCompPrayers] = useState(true);
    const [newCompExpensiveMistakes, setNewCompExpensiveMistakes] = useState(true);
    const [newCompRedraftBase, setNewCompRedraftBase] = useState(0);
    const [newCompAvailability, setNewCompAvailability] = useState<CompetitionAvailability>('both');
    const [newCompCadence, setNewCompCadence] = useState<CompetitionCadence>('weekly');
    const [newCompPreferredTime, setNewCompPreferredTime] = useState('20:30');
    const [newCompDurationMinutes, setNewCompDurationMinutes] = useState(180);
    const [newCompStartDate, setNewCompStartDate] = useState(getDefaultStartDate());
    const [ownerTeamToJoin, setOwnerTeamToJoin] = useState<string>('');
    const [isSelectingOwnerTeam, setIsSelectingOwnerTeam] = useState(false);
    const [pendingCreatedCompetitionId, setPendingCreatedCompetitionId] = useState<string | null>(null);
    const [manualAddState, setManualAddState] = useState<{ isOpen: boolean; editEntryId?: string | null; coachName: string; franchiseName: string; baseRosterName: string; treasury: number; rerolls: number; dedicatedFans: number; apothecary: boolean }>({ isOpen: false, editEntryId: null, coachName: '', franchiseName: '', baseRosterName: '', treasury: 0, rerolls: 0, dedicatedFans: 1, apothecary: false });
    const [manualRosterCounts, setManualRosterCounts] = useState<Record<string, number>>({});

    const [joinModalState, setJoinModalState] = useState<{ comp: Competition | null; teamToJoin: string }>({ comp: null, teamToJoin: '' });
    const [scoreModalState, setScoreModalState] = useState<{ isOpen: boolean; roundIndex: string; matchIndex: number; matchup: Matchup; } | null>(null);
    const [scheduleEditState, setScheduleEditState] = useState<{
        isOpen: boolean;
        source: 'schedule' | 'bracket';
        roundIndex: string;
        matchIndex: number;
        scheduledDate: string;
        durationMinutes: number;
    } | null>(null);
    const [confirmation, setConfirmation] = useState<{ title: string; message: string; onConfirm: () => void; type?: 'danger' | 'info' } | null>(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportForm, setReportForm] = useState({ headline: '', subHeadline: '', article: '', homeTeam: '', opponentTeam: '', score1: 0, score2: 0 });

    const buildTeamReadySummary = (teamState?: ManagedTeam | null) => {
        if (!teamState) return null;
        const baseRoster = baseTeams.find(team => team.name === teamState.rosterName);
        return buildMatchReadyTeamSummary(teamState, baseRoster, skills);
    };

    const getPendingLevelUps = (teamState?: ManagedTeam | null) => {
        if (!teamState?.players?.length) return 0;
        return teamState.players.filter(player => {
            const advances = player.advancements?.length || 0;
            const nextLevel = SPP_LEVELS[advances] || Number.POSITIVE_INFINITY;
            return (player.spp || 0) >= nextLevel;
        }).length;
    };

    const openCloneDashboard = (entry: CompetitionTeam) => {
        if (!entry.teamState) return;
        setStatsModalTeam(entry.teamState);
        setStatsModalEntryId(entry.entryId || null);
    };

    const createCompetitionEntry = (baseTeam: ManagedTeam, ownerId: string, ownerName: string, ownerEmail = '', isManual = false): CompetitionTeam => {
        const teamState: ManagedTeam = JSON.parse(JSON.stringify(baseTeam));
        teamState.record = { wins: 0, draws: 0, losses: 0 };

        return {
            entryId: crypto.randomUUID ? crypto.randomUUID() : `entry_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
            teamName: baseTeam.name,
            ownerId,
            ownerName,
            ownerEmail,
            isManual,
            teamState,
            stats: { played: 0, won: 0, drawn: 0, lost: 0, tdFor: 0, tdAgainst: 0, casFor: 0, casAgainst: 0, points: 0 }
        };
    };

    const parseQtyMax = (qty?: string): number => {
        const match = String(qty || '').match(/(\d+)\s*-\s*(\d+)/);
        if (match) return Number(match[2]);
        const single = Number(String(qty || '').trim());
        return Number.isFinite(single) ? single : 16;
    };

    const buildManualPlayers = (baseRoster: Team, counts: Record<string, number>): ManagedPlayer[] => {
        const players: ManagedPlayer[] = [];
        let nextId = 1;
        let nextJersey = 1;

        baseRoster.roster.forEach(position => {
            const count = Math.max(0, Math.min(parseQtyMax(position.qty), Number(counts[position.position] || 0)));
            for (let i = 0; i < count; i++) {
                players.push({
                    ...position,
                    id: nextId++,
                    jerseyNumber: nextJersey++,
                    customName: `${position.position} #${i + 1}`,
                    spp: 0,
                    gainedSkills: [],
                    lastingInjuries: [],
                    status: 'Reserva',
                    sppActions: {}
                });
            }
        });

        return players;
    };

    const buildManualTeamFromRoster = (baseRoster: Team, franchiseName: string, config: { treasury: number; rerolls: number; dedicatedFans: number; apothecary: boolean }, counts: Record<string, number>): ManagedTeam => ({
        name: franchiseName.trim(),
        rosterName: baseRoster.name,
        treasury: Math.max(0, Number(config.treasury || 0)),
        rerolls: Math.max(0, Number(config.rerolls || 0)),
        dedicatedFans: Math.max(0, Number(config.dedicatedFans || 0)),
        cheerleaders: 0,
        assistantCoaches: 0,
        apothecary: !!config.apothecary,
        players: buildManualPlayers(baseRoster, counts),
        crestImage: baseRoster.image,
        record: { wins: 0, draws: 0, losses: 0 }
    });

    const resetManualParticipantState = () => {
        setManualAddState({ isOpen: false, editEntryId: null, coachName: '', franchiseName: '', baseRosterName: '', treasury: 0, rerolls: 0, dedicatedFans: 1, apothecary: false });
        setManualRosterCounts({});
    };

    const openManualParticipantModal = (team?: CompetitionTeam) => {
        if (!team?.isManual || !team.teamState) {
            setManualAddState({
                isOpen: true,
                editEntryId: null,
                coachName: '',
                franchiseName: '',
                baseRosterName: baseTeams[0]?.name || '',
                treasury: 0,
                rerolls: 0,
                dedicatedFans: 1,
                apothecary: false
            });
            setManualRosterCounts({});
            return;
        }

        const counts = team.teamState.players.reduce<Record<string, number>>((acc, player) => {
            acc[player.position] = (acc[player.position] || 0) + 1;
            return acc;
        }, {});

        setManualAddState({
            isOpen: true,
            editEntryId: team.entryId || null,
            coachName: team.ownerName,
            franchiseName: team.teamName,
            baseRosterName: team.teamState.rosterName,
            treasury: team.teamState.treasury || 0,
            rerolls: team.teamState.rerolls || 0,
            dedicatedFans: team.teamState.dedicatedFans || 0,
            apothecary: !!team.teamState.apothecary
        });
        setManualRosterCounts(counts);
    };

    const calculateManualTeamSpend = (baseRoster: Team, config: { treasury: number; rerolls: number; dedicatedFans: number; apothecary: boolean }, counts: Record<string, number>) => {
        const playersCost = baseRoster.roster.reduce((sum, position) => {
            const count = Math.max(0, Math.min(parseQtyMax(position.qty), Number(counts[position.position] || 0)));
            return sum + (position.cost * count);
        }, 0);
        const rerollsCost = Math.max(0, Number(config.rerolls || 0)) * Number(baseRoster.rerollCost || 0);
        const fansCost = Math.max(0, Number(config.dedicatedFans || 0)) * 10_000;
        const apothecaryCost = config.apothecary ? 50_000 : 0;
        const treasuryReserved = Math.max(0, Number(config.treasury || 0));
        const totalSpend = playersCost + rerollsCost + fansCost + apothecaryCost + treasuryReserved;

        return {
            playersCost,
            rerollsCost,
            fansCost,
            apothecaryCost,
            treasuryReserved,
            totalSpend,
            remainingBudget: MANUAL_TEAM_BUDGET - totalSpend,
            overBudget: totalSpend > MANUAL_TEAM_BUDGET,
        };
    };

    const isAllowedLeagueDay = (date: Date, availability: CompetitionAvailability) => {
        const day = date.getDay();
        const isWeekend = day === 0 || day === 6;
        if (availability === 'weekends') return isWeekend;
        if (availability === 'weekdays') return !isWeekend;
        return true;
    };

    const buildScheduledDate = (baseDate: string, preferredTime: string, availability: CompetitionAvailability) => {
        const [year, month, day] = baseDate.split('-').map(Number);
        const [hours, minutes] = preferredTime.split(':').map(Number);
        const candidate = new Date(year, (month || 1) - 1, day || 1, hours || 20, minutes || 0, 0, 0);
        while (!isAllowedLeagueDay(candidate, availability)) {
            candidate.setDate(candidate.getDate() + 1);
        }
        return candidate;
    };

    const addCadenceToDate = (date: Date, cadence: CompetitionCadence) => {
        const next = new Date(date);
        next.setDate(next.getDate() + (cadence === 'biweekly' ? 14 : 7));
        return next;
    };

    const getMatchDateStatusLabel = (match: Matchup) => {
        if (match.dateStatus === 'played' || match.played) return 'Acta registrada';
        if (match.dateStatus === 'confirmed') return 'Fecha confirmada';
        if (match.dateStatus === 'postponed') return 'Partido aplazado';
        return 'Fecha propuesta';
    };

    const toLocalDateTimeInputValue = (isoDate?: string) => {
        const date = isoDate ? new Date(isoDate) : new Date();
        if (Number.isNaN(date.getTime())) return '';
        const offsetMs = date.getTimezoneOffset() * 60_000;
        return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
    };

    const getMatchDurationMinutes = (match: Matchup) => {
        if (match.scheduledDate && match.scheduledEndDate) {
            const start = new Date(match.scheduledDate).getTime();
            const end = new Date(match.scheduledEndDate).getTime();
            const diff = Math.round((end - start) / 60_000);
            if (Number.isFinite(diff) && diff > 0) return diff;
        }
        return selectedCompetition?.scheduling?.durationMinutes || 180;
    };

    const updateCompetitionMatch = (
        source: 'schedule' | 'bracket',
        roundIndex: string,
        matchIndex: number,
        updater: (match: Matchup) => void
    ) => {
        if (!selectedCompetition) return;
        const updatedComp = cloneCompetition(selectedCompetition);
        const collection = source === 'schedule' ? updatedComp.schedule : updatedComp.bracket;
        const match = collection?.[roundIndex]?.[matchIndex];
        if (!match) return;
        updater(match);
        onCompetitionUpdate(updatedComp);
        setSelectedCompetition(updatedComp);
    };

    const openScheduleEditor = (source: 'schedule' | 'bracket', roundIndex: string, matchIndex: number, match: Matchup) => {
        setScheduleEditState({
            isOpen: true,
            source,
            roundIndex,
            matchIndex,
            scheduledDate: toLocalDateTimeInputValue(match.scheduledDate),
            durationMinutes: getMatchDurationMinutes(match),
        });
    };

    const handleConfirmMatchDate = (source: 'schedule' | 'bracket', roundIndex: string, matchIndex: number) => {
        updateCompetitionMatch(source, roundIndex, matchIndex, match => {
            match.dateStatus = 'confirmed';
        });
    };

    const handlePostponeMatch = (source: 'schedule' | 'bracket', roundIndex: string, matchIndex: number) => {
        updateCompetitionMatch(source, roundIndex, matchIndex, match => {
            match.dateStatus = 'postponed';
        });
    };

    const handleSaveMatchDate = () => {
        if (!scheduleEditState) return;
        const start = new Date(scheduleEditState.scheduledDate);
        if (Number.isNaN(start.getTime())) {
            setConfirmation({
                title: 'Fecha no valida',
                message: 'Necesitas indicar una fecha y una hora validas para guardar este partido.',
                onConfirm: () => setConfirmation(null),
                type: 'info'
            });
            return;
        }

        const end = new Date(start.getTime() + (scheduleEditState.durationMinutes * 60_000));
        updateCompetitionMatch(scheduleEditState.source, scheduleEditState.roundIndex, scheduleEditState.matchIndex, match => {
            match.scheduledDate = start.toISOString();
            match.scheduledEndDate = end.toISOString();
            match.dateStatus = 'confirmed';
        });
        setScheduleEditState(null);
    };

    const applySchedulingToRounds = (
        rounds: Record<string, Matchup[]>,
        scheduling: CompetitionSchedulingPreferences | undefined,
        competitionName: string,
        competitionTeams: CompetitionTeam[],
        format: Competition['format']
    ) => {
        if (!scheduling) return rounds;

        const emailByTeam = new Map(
            competitionTeams
                .filter(team => team.ownerEmail?.trim())
                .map(team => [team.teamName, team.ownerEmail!.trim()])
        );

        const sortedRoundEntries = Object.entries(rounds).sort((a, b) => Number(a[0]) - Number(b[0]));
        let roundDate = buildScheduledDate(scheduling.startDate, scheduling.preferredTime, scheduling.availability);

        const scheduledRounds: Record<string, Matchup[]> = {};
        sortedRoundEntries.forEach(([roundIdx, matches]) => {
            const roundNumber = Number(roundIdx) + 1;
            scheduledRounds[roundIdx] = matches.map(match => {
                const scheduledDate = new Date(roundDate);
                const scheduledEndDate = new Date(scheduledDate.getTime() + scheduling.durationMinutes * 60_000);
                const invitedEmails = [emailByTeam.get(match.team1), emailByTeam.get(match.team2)].filter(Boolean) as string[];
                const labelPrefix = format === 'Liguilla' ? `J${roundNumber}` : `R${roundNumber}`;
                return {
                    ...match,
                    scheduledDate: scheduledDate.toISOString(),
                    scheduledEndDate: scheduledEndDate.toISOString(),
                    dateStatus: 'proposed' as const,
                    calendarTitle: `[${competitionName}] ${labelPrefix} · ${match.team1} vs ${match.team2}`,
                    invitedEmails,
                };
            });
            roundDate = addCadenceToDate(roundDate, scheduling.cadence);
            while (!isAllowedLeagueDay(roundDate, scheduling.availability)) {
                roundDate.setDate(roundDate.getDate() + 1);
            }
        });

        return scheduledRounds;
    };

    const isCompetitionOwnedByMe = (competition: Competition) => (
        competition.ownerId === user?.id || competition.createdBy === user?.id
    );

    // Ligas donde el usuario es un participante activo (como jugador)
    const myLeagues = useMemo(() => initialCompetitions.filter(c => c.format === 'Liguilla' && (c.teams.some(t => t.ownerId === user?.id) || isCompetitionOwnedByMe(c))), [initialCompetitions, user]);
    // Torneos donde el usuario participa activamente
    const myTournaments = useMemo(() => initialCompetitions.filter(c => c.format === 'Torneo' && (c.teams.some(t => t.ownerId === user?.id) || isCompetitionOwnedByMe(c))), [initialCompetitions, user]);
    // Ligas/Torneos públicos donde el usuario NO participa aún
    const publicLeagues = useMemo(() => initialCompetitions.filter(c => c.format === 'Liguilla' && c.status === 'Open' && c.visibility !== 'Private' && !c.teams.some(t => t.ownerId === user?.id)), [initialCompetitions, user]);
    const publicTournaments = useMemo(() => initialCompetitions.filter(c => c.format === 'Torneo' && c.status === 'Open' && c.visibility !== 'Private' && !c.teams.some(t => t.ownerId === user?.id)), [initialCompetitions, user]);
    // Competiciones que el usuario ha CREADO (para gestionar)
    const myCompetitions = useMemo(() => initialCompetitions.filter(c => isCompetitionOwnedByMe(c)), [initialCompetitions, user]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const joinId = params.get('join');
        if (joinId && initialCompetitions.length > 0 && managedTeams.length > 0 && !joinModalState.comp) {
            const compToJoin = initialCompetitions.find((c: Competition) => c.id === joinId || c.joinCode === joinId);
            if (compToJoin) {
                setJoinModalState({ comp: compToJoin, teamToJoin: managedTeams[0]?.name || '' });
                window.history.replaceState({}, '', window.location.pathname);
            }
        }
    }, [initialCompetitions, managedTeams, joinModalState.comp]);

    useEffect(() => {
        if (!pendingCreatedCompetitionId) return;
        const createdCompetition = initialCompetitions.find(c => c.id === pendingCreatedCompetitionId);
        if (!createdCompetition) return;

        setSelectedCompetition(createdCompetition);
        setView('detail');
        setActiveTab('organization');
        setPendingCreatedCompetitionId(null);
    }, [pendingCreatedCompetitionId, initialCompetitions]);

    useEffect(() => {
        if (!manualAddState.isOpen) return;
        const selectedRoster = baseTeams.find(team => team.name === manualAddState.baseRosterName) || baseTeams[0];
        if (!selectedRoster) return;

        setManualAddState(prev => {
            if (prev.baseRosterName === selectedRoster.name && prev.franchiseName) return prev;
            return {
                ...prev,
                baseRosterName: selectedRoster.name,
                franchiseName: prev.franchiseName || selectedRoster.name,
                rerolls: prev.rerolls || 0,
                dedicatedFans: prev.dedicatedFans || 1,
            };
        });

        setManualRosterCounts(prev => {
            const next: Record<string, number> = {};
            selectedRoster.roster.forEach(position => {
                next[position.position] = prev[position.position] ?? 0;
            });
            return next;
        });
    }, [manualAddState.isOpen, manualAddState.baseRosterName, manualAddState.franchiseName, manualAddState.rerolls, manualAddState.dedicatedFans, baseTeams]);

    const isMatchCompleted = (match: Matchup) => Boolean(match.played || (match.score1 != null && match.score2 != null));

    const standings = useMemo(() => {
        if (!selectedCompetition || selectedCompetition.format !== 'Liguilla' || !selectedCompetition.schedule) return [];
        return selectedCompetition.teams.map(({ teamName }) => {
            let p = 0, w = 0, l = 0, d = 0, tdF = 0, tdA = 0;
            Object.values(selectedCompetition.schedule!).forEach(round => {
                (round as Matchup[]).forEach(match => {
                    if ((match.team1 === teamName || match.team2 === teamName) && isMatchCompleted(match)) {
                        p++;
                        const isTeam1 = match.team1 === teamName;
                        const sF = isTeam1 ? match.score1 : match.score2;
                        const sA = isTeam1 ? match.score2 : match.score1;
                        tdF += sF!;
                        tdA += sA!;
                        if (sF! > sA!) w++; else if (sA! > sF!) l++; else d++;
                    }
                });
            });
            return { name: teamName, p, w, d, l, tdF, tdA, pts: w * 3 + d };
        }).sort((a, b) => b.pts - a.pts || (b.tdF - b.tdA) - (a.tdF - a.tdA) || b.tdF - a.tdF);
    }, [selectedCompetition]);

    const finalWinner = useMemo(() => {
        if (!selectedCompetition || selectedCompetition.format !== 'Torneo' || !selectedCompetition.bracket) return null;
        const finalRoundKey = Math.max(...Object.keys(selectedCompetition.bracket).map(Number)).toString();
        return selectedCompetition.bracket[finalRoundKey]?.[0]?.winner;
    }, [selectedCompetition]);

    const rebuildBracketProgression = (bracket: Record<string, Matchup[]>, fromRoundIndex: number) => {
        for (let i = fromRoundIndex; i < Object.keys(bracket).length - 1; i++) {
            const currentRound = bracket[i.toString()];
            const nextRound = bracket[(i + 1).toString()];
            for (let j = 0; j < nextRound.length; j++) {
                nextRound[j].team1 = currentRound[j * 2]?.winner || 'Por determinar';
                nextRound[j].team2 = currentRound[j * 2 + 1]?.winner || 'Por determinar';

                if (nextRound[j].team1 === 'BYE') {
                    nextRound[j].winner = nextRound[j].team2;
                    nextRound[j].played = true;
                } else if (nextRound[j].team2 === 'BYE') {
                    nextRound[j].winner = nextRound[j].team1;
                    nextRound[j].played = true;
                } else if (nextRound[j].team1 !== 'Por determinar' && nextRound[j].team2 !== 'Por determinar') {
                    if (nextRound[j].winner && nextRound[j].winner !== nextRound[j].team1 && nextRound[j].winner !== nextRound[j].team2) {
                        nextRound[j].winner = null;
                        nextRound[j].played = false;
                    }
                }
            }
        }
    };

    const buildPlayerMatchSummary = (team: CompetitionTeam | undefined, opponentTeam: CompetitionTeam | undefined, teamResolution: any, opponentResolution: any, scoreFor: number, scoreAgainst: number) => {
        const teamState = team?.teamState ? JSON.parse(JSON.stringify(team.teamState)) as ManagedTeam : undefined;
        if (!teamState) return team;

        teamState.players = teamState.players.map(player => {
            const playerResult = teamResolution?.players?.find((p: any) => p.playerId === player.id);
            if (!playerResult) return player;

            const sppGain = (playerResult.td || 0) * 3 +
                (playerResult.cas || 0) * 2 +
                (playerResult.passes || 0) +
                (playerResult.interceptions || 0) * 2 +
                (playerResult.mvp ? 4 : 0);

            const nextActions = { ...(player.sppActions || {}) };
            if (playerResult.td) nextActions.TD = (nextActions.TD || 0) + playerResult.td;
            if (playerResult.cas) nextActions.CASUALTY = (nextActions.CASUALTY || 0) + playerResult.cas;
            if (playerResult.passes) nextActions.PASS = (nextActions.PASS || 0) + playerResult.passes;
            if (playerResult.interceptions) nextActions.INT = (nextActions.INT || 0) + playerResult.interceptions;
            if (playerResult.mvp) nextActions.MVP = (nextActions.MVP || 0) + 1;

            const updatedPlayer: any = {
                ...player,
                spp: (player.spp || 0) + sppGain,
                sppActions: nextActions,
                missNextGame: playerResult.injury === 'mng' || playerResult.injury === 'casualty' || playerResult.injury === 'death'
                    ? Math.max(player.missNextGame || 0, 1)
                    : player.missNextGame,
                lastingInjuries: [...(player.lastingInjuries || [])],
                status: player.status,
            };

            if (playerResult.injury === 'stunned') {
                updatedPlayer.status = 'Activo';
            } else if (playerResult.injury === 'ko') {
                updatedPlayer.status = 'KO';
            } else if (playerResult.injury === 'mng' || playerResult.injury === 'casualty') {
                updatedPlayer.status = 'Lesionado';
            } else if (playerResult.injury === 'death') {
                updatedPlayer.status = 'Muerto';
            }

            if ((playerResult.injury === 'casualty' || playerResult.injury === 'death') && playerResult.permanentInjury) {
                if (!updatedPlayer.lastingInjuries.includes(playerResult.permanentInjury)) {
                    updatedPlayer.lastingInjuries = [...updatedPlayer.lastingInjuries, playerResult.permanentInjury];
                }
            }

            return updatedPlayer;
        });

        const previousRecord = teamState.record || { wins: 0, draws: 0, losses: 0 };
        const result = scoreFor > scoreAgainst ? 'W' : scoreFor < scoreAgainst ? 'L' : 'D';
        teamState.record = {
            wins: previousRecord.wins + (result === 'W' ? 1 : 0),
            draws: previousRecord.draws + (result === 'D' ? 1 : 0),
            losses: previousRecord.losses + (result === 'L' ? 1 : 0),
        };

        const treasuryImpact =
            teamResolution?.treasuryDelta ??
            ((teamResolution?.winnings || 0) - (teamResolution?.expenses || 0) - (teamResolution?.pettyCashUsed || 0));
        teamState.treasury = Math.max(0, (teamState.treasury || 0) + treasuryImpact);
        teamState.dedicatedFans = Math.max(0, (teamState.dedicatedFans || 0) + (teamResolution?.dedicatedFansDelta || 0));

        teamState.history = [
            ...(teamState.history || []),
            {
                id: crypto.randomUUID ? crypto.randomUUID() : `hist_${Date.now()}`,
                opponentName: opponentTeam?.teamName || '',
                score: `${scoreFor}-${scoreAgainst}`,
                date: new Date().toLocaleDateString('es-ES'),
                result,
            }
        ];
        teamState.totalTV = calculateTeamValue(teamState);
        teamState.updatedAt = new Date().toISOString();

        const previousStats = team?.stats || { played: 0, won: 0, drawn: 0, lost: 0, tdFor: 0, tdAgainst: 0, casFor: 0, casAgainst: 0, points: 0 };
        const updatedStats = {
            played: previousStats.played + 1,
            won: previousStats.won + (result === 'W' ? 1 : 0),
            drawn: previousStats.drawn + (result === 'D' ? 1 : 0),
            lost: previousStats.lost + (result === 'L' ? 1 : 0),
            tdFor: previousStats.tdFor + scoreFor,
            tdAgainst: previousStats.tdAgainst + scoreAgainst,
            casFor: previousStats.casFor + ((teamResolution?.players || []).reduce((sum: number, p: any) => sum + (p.cas || 0), 0)),
            casAgainst: previousStats.casAgainst + ((opponentResolution?.players || []).reduce((sum: number, p: any) => sum + (p.cas || 0), 0)),
            points: previousStats.points + (result === 'W' ? 3 : result === 'D' ? 1 : 0),
        };

        return {
            ...team!,
            teamState,
            stats: updatedStats,
        } as CompetitionTeam;
    };

    const applyMatchResolution = (baseComp: Competition, roundIndex: string, matchIndex: number, resolution: MatchResolution) => {
        const updatedComp = cloneCompetition(baseComp);
        const matchupList = updatedComp.format === 'Liguilla' ? updatedComp.schedule : updatedComp.bracket;
        if (!matchupList) return updatedComp;

        const match = matchupList[roundIndex]?.[matchIndex];
        if (!match) return updatedComp;

        match.score1 = resolution.team1.score;
        match.score2 = resolution.team2.score;
        match.played = true;
        match.dateStatus = 'played';
        match.resolution = resolution;

        const winner = resolution.team1.score > resolution.team2.score
            ? resolution.team1.teamName
            : resolution.team2.score > resolution.team1.score
                ? resolution.team2.teamName
                : resolution.winnerTeam || null;

        if (winner) {
            match.winner = winner;
        }

        const team1 = updatedComp.teams.find(t => t.teamName === resolution.team1.teamName);
        const team2 = updatedComp.teams.find(t => t.teamName === resolution.team2.teamName);

        if (team1 && team2) {
            const updatedTeam1 = buildPlayerMatchSummary(team1, team2, resolution.team1, resolution.team2, resolution.team1.score, resolution.team2.score);
            const updatedTeam2 = buildPlayerMatchSummary(team2, team1, resolution.team2, resolution.team1, resolution.team2.score, resolution.team1.score);

            updatedComp.teams = updatedComp.teams.map(team => {
                if (team.teamName === updatedTeam1.teamName) return updatedTeam1;
                if (team.teamName === updatedTeam2.teamName) return updatedTeam2;
                return team;
            });
        }

        if (updatedComp.format === 'Torneo' && match.winner) {
            rebuildBracketProgression(updatedComp.bracket!, parseInt(roundIndex, 10));
        }

        return updatedComp;
    };

    const handleCreateCompetition = async () => {
        if (!newCompetitionName.trim() || !user) {
            setConfirmation({
                title: "Campo requerido",
                message: "Por favor, introduce un nombre para la competición.",
                onConfirm: () => setConfirmation(null),
                type: 'info'
            });
            return;
        }

        const teams: CompetitionTeam[] = [];
        if (ownerTeamToJoin) {
            const baseTeam = managedTeams.find(t => t.name === ownerTeamToJoin);
            if (baseTeam) {
                teams.push(createCompetitionEntry(baseTeam, user.id || '', user.name || '', user.email || '', false));
            }
        }

        const newCompetition: Omit<Competition, 'id'> = {
            name: newCompetitionName.trim(),
            format: newCompetitionFormat,
            phase: 'registration',
            seasonNumber: 1,
            visibility: newCompVisibility,
            maxTeams: newCompMaxTeams,
            joinCode: generateJoinCode(newCompetitionName.trim()),
            teams,
            ownerId: user.id,
            ownerName: user.name,
            createdBy: user.id,
            participantIds: [user.id],
            status: 'Open',
            scheduling: {
                availability: newCompAvailability,
                cadence: newCompCadence,
                preferredTime: newCompPreferredTime,
                durationMinutes: newCompDurationMinutes,
                startDate: newCompStartDate,
                timezone: 'Europe/Madrid',
            },
            baseTeam: managedTeams.find(t => t.name === ownerTeamToJoin),
            rules: {
                reglamento: newCompReglamento,
                muerteSubita: newCompMuerteSubita,
                incentivos: newCompIncentivos,
                tiempoTurno: newCompTiempoTurno,
                mercenarios: newCompMercenarios,
                pettyCashEnabled: newCompPettyCash,
                prayersToNuffleEnabled: newCompPrayers,
                expensiveMistakesEnabled: newCompExpensiveMistakes,
                redraftBudgetBase: newCompRedraftBase
            }
        };
        const createdCompetitionId = await onCompetitionCreate(newCompetition);
        if (!createdCompetitionId) {
            setConfirmation({
                title: "No se pudo crear",
                message: "La liga no pudo guardarse en Firebase. Revisa tu sesiÃ³n o permisos e intÃ©ntalo de nuevo.",
                onConfirm: () => setConfirmation(null),
                type: 'info'
            });
            return;
        }

        setPendingCreatedCompetitionId(createdCompetitionId);
        setNewCompetitionName('');
        setOwnerTeamToJoin('');
        setNewCompPettyCash(true);
        setNewCompPrayers(true);
        setNewCompExpensiveMistakes(true);
        setNewCompRedraftBase(0);
        setNewCompAvailability('both');
        setNewCompCadence('weekly');
        setNewCompPreferredTime('20:30');
        setNewCompDurationMinutes(180);
        setNewCompStartDate(getDefaultStartDate());
        setActiveTab('organization');
    };

    const handleUpdateClone = (updatedTeam: ManagedTeam) => {
        if (!selectedCompetition || !statsModalTeam) return;
        
        const updatedComp = {
            ...selectedCompetition,
            teams: selectedCompetition.teams.map(t => 
                (
                    (statsModalEntryId && t.entryId === statsModalEntryId) ||
                    (!statsModalEntryId && t.ownerId === statsModalTeam.ownerId && t.teamName === statsModalTeam.name)
                )
                ? { ...t, teamState: updatedTeam } 
                : t
            )
        };
        
        onCompetitionUpdate(updatedComp);
        setSelectedCompetition(updatedComp);
        setStatsModalTeam(updatedTeam);
    };

    const handleJoinCompetition = () => {
        if (!joinModalState.comp || !user) return;

        if (joinModalState.comp.status !== 'Open') {
            setConfirmation({
                title: "Competición cerrada",
                message: "No puedes inscribir equipos en una competición que ya ha comenzado o ha finalizado.",
                onConfirm: () => setConfirmation(null),
                type: 'info'
            });
            return;
        }
        
        let targetTeamName = joinModalState.teamToJoin;
        
        // Fallback to first managed team if none selected but available
        if (!targetTeamName && managedTeams.length > 0) {
            targetTeamName = managedTeams[0].name;
        }

        if (!targetTeamName) {
            setConfirmation({
                title: "Sin equipo",
                message: "Debes crear al menos un equipo en el Gremio para unirte a una liga.",
                onConfirm: () => setConfirmation(null),
                type: 'info'
            });
            return;
        }

        const baseTeam = managedTeams.find(t => t.name === targetTeamName);
        if (!baseTeam) return;

        const cleanComp = cloneCompetition(joinModalState.comp);

        if (cleanComp.maxTeams && cleanComp.teams.length >= cleanComp.maxTeams) {
            setConfirmation({
                title: "Cupo completo",
                message: "Esta competición ya ha alcanzado el número máximo de equipos permitidos.",
                onConfirm: () => setConfirmation(null),
                type: 'info'
            });
            return;
        }
        
        // Check if team already exists in competition
        if (cleanComp.teams.some(t => t.teamName === targetTeamName)) {
            setConfirmation({
                title: "Equipo duplicado",
                message: "Este equipo ya está inscrito en la competición.",
                onConfirm: () => setConfirmation(null),
                type: 'info'
            });
            return;
        }

        // Crear el clon (Franquicia de Competición)
        const updatedComp = {
            ...cleanComp,
            participantIds: Array.from(new Set([...(cleanComp.participantIds || []), user.id])),
            teams: [...cleanComp.teams, createCompetitionEntry(baseTeam, user.id, user.name, user.email || '', false)]
        };
        onCompetitionUpdate(updatedComp as Competition);
        
        // Update local state if we are in detail view
        if (selectedCompetition && selectedCompetition.id === updatedComp.id) {
            setSelectedCompetition(updatedComp);
        }

        setJoinModalState({ comp: null, teamToJoin: '' });
    };

    const handleAddManualParticipant = () => {
        if (!selectedCompetition || !user) return;

        if (selectedCompetition.status !== 'Open') {
            setConfirmation({
                title: "Competición cerrada",
                message: "Solo puedes añadir participantes manuales mientras la competición está abierta.",
                onConfirm: () => setConfirmation(null),
                type: 'info'
            });
            return;
        }

        const coachName = manualAddState.coachName.trim();
        const franchiseName = manualAddState.franchiseName.trim();
        const targetRosterName = manualAddState.baseRosterName || baseTeams[0]?.name || '';
        const baseTeam = baseTeams.find(t => t.name === targetRosterName);

        if (!coachName) {
            setConfirmation({
                title: "Entrenador requerido",
                message: "Introduce el nombre del entrenador manual para continuar.",
                onConfirm: () => setConfirmation(null),
                type: 'info'
            });
            return;
        }

        if (!targetRosterName || !baseTeam) {
            setConfirmation({
                title: "Raza requerida",
                message: "Selecciona una raza base del catálogo para añadirla manualmente a la competición.",
                onConfirm: () => setConfirmation(null),
                type: 'info'
            });
            return;
        }

        if (!franchiseName) {
            setConfirmation({
                title: "Nombre requerido",
                message: "Define el nombre de la franquicia manual para continuar.",
                onConfirm: () => setConfirmation(null),
                type: 'info'
            });
            return;
        }

        const cleanComp = cloneCompetition(selectedCompetition);

        if (cleanComp.maxTeams && cleanComp.teams.length >= cleanComp.maxTeams) {
            setConfirmation({
                title: "Cupo completo",
                message: "Esta competición ya ha alcanzado el número máximo de equipos permitidos.",
                onConfirm: () => setConfirmation(null),
                type: 'info'
            });
            return;
        }

        if (cleanComp.teams.some(t => t.teamName === franchiseName && t.entryId !== manualAddState.editEntryId)) {
            setConfirmation({
                title: "Equipo duplicado",
                message: "Esta franquicia ya está inscrita en la competición.",
                onConfirm: () => setConfirmation(null),
                type: 'info'
            });
            return;
        }

        const builtTeamState = buildManualTeamFromRoster(baseTeam, franchiseName, {
            treasury: manualAddState.treasury,
            rerolls: manualAddState.rerolls,
            dedicatedFans: manualAddState.dedicatedFans,
            apothecary: manualAddState.apothecary
        }, manualRosterCounts);
        const budgetSummary = calculateManualTeamSpend(baseTeam, {
            treasury: manualAddState.treasury,
            rerolls: manualAddState.rerolls,
            dedicatedFans: manualAddState.dedicatedFans,
            apothecary: manualAddState.apothecary
        }, manualRosterCounts);

        if (builtTeamState.players.length === 0) {
            setConfirmation({
                title: "Plantilla vacía",
                message: "Añade al menos un jugador al roster manual antes de inscribir la franquicia.",
                onConfirm: () => setConfirmation(null),
                type: 'info'
            });
            return;
        }

        if (budgetSummary.overBudget) {
            setConfirmation({
                title: "Presupuesto excedido",
                message: `La franquicia manual supera el límite de creación de ${Math.round(MANUAL_TEAM_BUDGET / 1000)}k. Ajusta jugadores, rerolls, fans, boticario o tesorería reservada antes de continuar.`,
                onConfirm: () => setConfirmation(null),
                type: 'info'
            });
            return;
        }

        const manualEntry: CompetitionTeam = {
            entryId: manualAddState.editEntryId || (crypto.randomUUID ? crypto.randomUUID() : `entry_${Date.now()}_${Math.floor(Math.random() * 10000)}`),
            teamName: franchiseName,
            ownerId: '',
            ownerName: coachName,
            isManual: true,
            teamState: builtTeamState,
            stats: manualAddState.editEntryId
                ? (cleanComp.teams.find(t => t.entryId === manualAddState.editEntryId)?.stats || { played: 0, won: 0, drawn: 0, lost: 0, tdFor: 0, tdAgainst: 0, casFor: 0, casAgainst: 0, points: 0 })
                : { played: 0, won: 0, drawn: 0, lost: 0, tdFor: 0, tdAgainst: 0, casFor: 0, casAgainst: 0, points: 0 }
        };

        const updatedComp: Competition = {
            ...cleanComp,
            teams: manualAddState.editEntryId
                ? cleanComp.teams.map(team => team.entryId === manualAddState.editEntryId ? manualEntry : team)
                : [...cleanComp.teams, manualEntry]
        };

        onCompetitionUpdate(updatedComp);
        setSelectedCompetition(updatedComp);
        resetManualParticipantState();
    };

    const handleDeleteManualParticipant = (entryId?: string) => {
        if (!selectedCompetition || !entryId) return;

        const target = selectedCompetition.teams.find(team => team.entryId === entryId && team.isManual);
        if (!target) return;

        setConfirmation({
            title: "¿Eliminar participante manual?",
            message: `Se eliminará la franquicia manual "${target.teamName}" de la competición. Podrás volver a crearla más tarde si hace falta.`,
            type: 'danger',
            onConfirm: () => {
                const cleanComp = cloneCompetition(selectedCompetition);
                const updatedComp: Competition = {
                    ...cleanComp,
                    teams: cleanComp.teams.filter(team => team.entryId !== entryId)
                };
                onCompetitionUpdate(updatedComp);
                setSelectedCompetition(updatedComp);
                setConfirmation(null);
            }
        });
    };

    const handleStartCompetition = (comp: Competition) => {
        if (comp.teams.length < 2) {
            setConfirmation({
                title: "Equipos insuficientes",
                message: "Se necesitan al menos 2 equipos para iniciar la competición.",
                onConfirm: () => setConfirmation(null),
                type: 'info'
            });
            return;
        }
        const teamNames = comp.teams.map(t => t.teamName);
        const cleanComp = cloneCompetition(comp);

        let updatedComp: Competition;

        if (comp.format === 'Liguilla') {
            const rawSchedule = generateSchedule(teamNames);
            updatedComp = {
                ...cleanComp,
                status: 'In Progress',
                phase: 'regular_season',
                schedule: applySchedulingToRounds(rawSchedule, cleanComp.scheduling, cleanComp.name, cleanComp.teams, cleanComp.format),
                bracket: null,
            };
        } else { // Torneo
            const rawBracket = generateBracket(teamNames);
            updatedComp = {
                ...cleanComp,
                status: 'In Progress',
                phase: 'playoffs',
                bracket: applySchedulingToRounds(rawBracket, cleanComp.scheduling, cleanComp.name, cleanComp.teams, cleanComp.format),
                schedule: null,
            };
        }

        onCompetitionUpdate(updatedComp);
        setSelectedCompetition(updatedComp);
    };

    const handleSaveScore = (resolution: MatchResolution) => {
        if (!selectedCompetition || !scoreModalState) return;
        const updatedComp = applyMatchResolution(selectedCompetition, scoreModalState.roundIndex, scoreModalState.matchIndex, resolution);
        onCompetitionUpdate(updatedComp);
        setSelectedCompetition(updatedComp);
        const preferredTeam = updatedComp.teams.find(team => team.teamName === resolution.team1.teamName)
            || updatedComp.teams.find(team => team.teamName === resolution.team2.teamName);
        if (preferredTeam?.entryId) {
            setSelectedEntryId(preferredTeam.entryId);
        }
        setScoreModalState(null);
    };

    const openManualResolution = (roundIndex: string, matchIndex: number, matchup: Matchup) => {
        setScoreModalState({ isOpen: true, roundIndex, matchIndex, matchup });
    };

    const handleWinnerSelect = (roundIndexStr: string, matchIndex: number, winnerTeam: string) => {
        if (!selectedCompetition || !selectedCompetition.bracket) return;

        const cleanComp = cloneCompetition(selectedCompetition);
        let newBracket = cleanComp.bracket!;
        const currentMatch = newBracket[roundIndexStr][matchIndex];

        if (currentMatch.winner === winnerTeam) { // Deselecting
            currentMatch.winner = null;
            currentMatch.played = false;
        } else {
            currentMatch.winner = winnerTeam;
            currentMatch.played = true;
        }

        rebuildBracketProgression(newBracket, parseInt(roundIndexStr, 10));

        const updatedComp = { ...cleanComp, bracket: newBracket };
        onCompetitionUpdate(updatedComp);
        setSelectedCompetition(updatedComp);
    };

    const renderCreateView = () => (
        <div className="max-w-[1200px] mx-auto w-full p-4 sm:p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">Configuración</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase italic">Nueva <span className="text-primary">Competición</span></h1>
                    <p className="text-slate-400 mt-2 font-medium italic">Crea una liga legendaria o un torneo de eliminación directa en el Viejo Mundo.</p>
                </div>
                <button
                    onClick={() => setView('list')}
                    className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] hover:underline group italic transition-all shrink-0"
                >
                    <span className="material-symbols-outlined font-bold transform group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    Volver a la lista
                </button>
            </div>

            {/* Selector Component */}
            <div className="flex mb-10">
                <div className="flex h-12 w-full max-w-md items-center justify-center rounded-xl bg-zinc-900 border border-white/10 p-1.5 shadow-xl">
                    <button
                        onClick={() => setNewCompetitionFormat('Liguilla')}
                        className={`flex h-full grow items-center justify-center rounded-lg px-4 transition-all text-[10px] font-bold uppercase tracking-widest italic gap-2 ${newCompetitionFormat === 'Liguilla' ? 'bg-primary text-black' : 'text-slate-400 hover:text-white'}`}
                    >
                        <span className="material-symbols-outlined text-sm font-bold">trophy</span> Nueva Liga
                    </button>
                    <button
                        onClick={() => setNewCompetitionFormat('Torneo')}
                        className={`flex h-full grow items-center justify-center rounded-lg px-4 transition-all text-[10px] font-bold uppercase tracking-widest italic gap-2 ${newCompetitionFormat === 'Torneo' ? 'bg-primary text-black' : 'text-slate-400 hover:text-white'}`}
                    >
                        <span className="material-symbols-outlined text-sm font-bold">bolt</span> Nuevo Torneo
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Configuration */}
                <div className="lg:col-span-7 space-y-8">
                    <section className="bg-zinc-900/40 rounded-[2rem] border border-white/5 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/10 transition-colors"></div>
                        
                        <div className="flex items-center gap-3 mb-8">
                            <span className="material-symbols-outlined text-primary font-bold">settings</span>
                            <h3 className="text-xl font-bold text-white uppercase italic tracking-tight">Configuración General</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Nombre de la Competición</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">edit_note</span>
                                    <input
                                        type="text"
                                        value={newCompetitionName}
                                        onChange={e => setNewCompetitionName(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-slate-700 font-bold"
                                        placeholder="Ej: Copa de los Reinos del Caos"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Formato</label>
                                    <div className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-slate-300 font-bold text-sm">
                                        {newCompetitionFormat === 'Liguilla' ? 'Round Robin (Todos contra todos)' : 'Eliminatoria Directa'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Reglamento</label>
                                    <div className="relative">
                                        <select 
                                            value={newCompReglamento}
                                            onChange={(e) => setNewCompReglamento(e.target.value as any)}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all font-bold appearance-none"
                                        >
                                            <option value="BB2025">BB2025 (3ª Temporada)</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">expand_more</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Visibilidad</label>
                                    <div className="flex bg-black/40 border border-white/10 rounded-2xl p-1">
                                        <button 
                                            type="button" 
                                            onClick={() => setNewCompVisibility('Public')} 
                                            className={`flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest italic rounded-xl transition-all ${newCompVisibility === 'Public' ? 'bg-primary text-black' : 'text-slate-500 hover:text-white'}`}
                                        >
                                            <span className="material-symbols-outlined text-sm">public</span>
                                            Pública
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setNewCompVisibility('Private')} 
                                            className={`flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest italic rounded-xl transition-all ${newCompVisibility === 'Private' ? 'bg-primary text-black' : 'text-slate-500 hover:text-white'}`}
                                        >
                                            <span className="material-symbols-outlined text-sm">vpn_key</span>
                                            Privada
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Máximo de Equipos</label>
                                    <div className="relative">
                                        <select 
                                            value={newCompMaxTeams}
                                            onChange={(e) => setNewCompMaxTeams(Number(e.target.value))}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all font-bold appearance-none"
                                        >
                                            {[4, 6, 8, 10, 12, 14, 16, 20].map(n => (
                                                <option key={n} value={n}>{n} Equipos</option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">expand_more</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-zinc-900/40 rounded-[2rem] border border-white/5 p-8 shadow-2xl backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="material-symbols-outlined text-primary font-bold">calendar_month</span>
                            <h3 className="text-xl font-bold text-white uppercase italic tracking-tight">Planificación de Jornadas</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Cuándo se juega</label>
                                <div className="flex bg-black/40 border border-white/10 rounded-2xl p-1">
                                    {[
                                        { value: 'weekdays', label: 'Entre semana' },
                                        { value: 'weekends', label: 'Fin de semana' },
                                        { value: 'both', label: 'Ambos' },
                                    ].map(option => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setNewCompAvailability(option.value as CompetitionAvailability)}
                                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest italic rounded-xl transition-all ${newCompAvailability === option.value ? 'bg-primary text-black' : 'text-slate-500 hover:text-white'}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Cadencia</label>
                                <div className="flex bg-black/40 border border-white/10 rounded-2xl p-1">
                                    {[
                                        { value: 'weekly', label: 'Semanal' },
                                        { value: 'biweekly', label: 'Quincenal' },
                                    ].map(option => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setNewCompCadence(option.value as CompetitionCadence)}
                                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest italic rounded-xl transition-all ${newCompCadence === option.value ? 'bg-primary text-black' : 'text-slate-500 hover:text-white'}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Fecha base</label>
                                <input
                                    type="date"
                                    value={newCompStartDate}
                                    onChange={e => setNewCompStartDate(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Hora preferida</label>
                                <input
                                    type="time"
                                    value={newCompPreferredTime}
                                    onChange={e => setNewCompPreferredTime(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all font-bold"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Duración estimada</label>
                                <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-2xl px-4 py-3">
                                    <button onClick={() => setNewCompDurationMinutes(Math.max(60, newCompDurationMinutes - 30))} className="text-primary font-bold opacity-70 hover:opacity-100 p-1">-</button>
                                    <div className="flex-1 text-center text-white font-black uppercase tracking-widest text-[10px] italic">
                                        {Math.floor(newCompDurationMinutes / 60)}h {newCompDurationMinutes % 60 ? `${newCompDurationMinutes % 60}m` : ''}
                                    </div>
                                    <button onClick={() => setNewCompDurationMinutes(Math.min(480, newCompDurationMinutes + 30))} className="text-primary font-bold opacity-70 hover:opacity-100 p-1">+</button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-zinc-900/40 rounded-[2rem] border border-white/5 p-8 shadow-2xl backdrop-blur-xl group">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary font-bold">groups</span>
                                <h3 className="text-xl font-bold text-white uppercase italic tracking-tight">Gestión de Participantes</h3>
                            </div>
                            <span className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest italic">
                                {ownerTeamToJoin ? '1' : '0'} / {newCompMaxTeams} Equipos
                            </span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <button 
                                onClick={() => setIsSelectingOwnerTeam(true)}
                                className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest italic transition-all shadow-lg shadow-primary/5"
                            >
                                <span className="material-symbols-outlined text-[20px] font-bold">add_circle</span>
                                Mis Equipos
                            </button>
                        </div>

                        {isSelectingOwnerTeam && (
                            <div className="mb-6 p-6 bg-black/60 rounded-3xl border border-primary/20 animate-in zoom-in-95 duration-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Selecciona tu equipo para unirlo</h4>
                                    <button onClick={() => setIsSelectingOwnerTeam(false)} className="text-slate-500 hover:text-white">
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {managedTeams.length > 0 ? (
                                        managedTeams.map(team => (
                                            <button
                                                key={team.name}
                                                onClick={() => { setOwnerTeamToJoin(team.name); setIsSelectingOwnerTeam(false); }}
                                                className="w-full text-left p-4 rounded-xl border border-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-between group"
                                            >
                                                <span className="text-white font-bold italic uppercase text-xs">{team.name}</span>
                                                <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity">add</span>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="text-center py-4 text-slate-500 text-[10px] font-bold uppercase italic">No tienes equipos en el Gremio</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {ownerTeamToJoin ? (
                                <div className="flex items-center justify-between p-5 rounded-2xl bg-black/40 border border-white/5 group/host transition-all hover:border-primary/30">
                                    <div className="flex items-center gap-4">
                                        <div className="size-14 bg-zinc-900 rounded-xl border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                                            <span className="material-symbols-outlined text-primary text-3xl font-bold">shield</span>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white uppercase italic text-sm tracking-tight">{ownerTeamToJoin}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Host: {user?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 italic">Host</span>
                                        <button onClick={() => setOwnerTeamToJoin('')} className="text-slate-600 hover:text-red-500 transition-colors p-2">
                                            <span className="material-symbols-outlined font-bold">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center bg-black/20 rounded-2xl border border-dashed border-white/5">
                                    <p className="text-slate-500 font-bold italic uppercase tracking-widest text-xs">Aún no has inscrito ninguno de tus equipos</p>
                                </div>
                            )}

                            <div className="p-8 text-center bg-black/20 rounded-2xl border border-dashed border-white/5">
                                <p className="text-slate-500 font-bold italic uppercase tracking-widest text-xs">Esperando más aspirantes...</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Summary & Actions */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-primary rounded-[2.5rem] p-10 text-zinc-900 relative overflow-hidden group shadow-2xl shadow-primary/20">
                        {/* Background Pattern Decor */}
                        <div className="absolute -right-10 -bottom-10 text-zinc-900/5 pointer-events-none">
                            <span className="material-symbols-outlined text-[240px] rotate-12 font-black">emoji_events</span>
                        </div>
                        
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-70 italic">Resumen de Élite</h4>
                            <div className="text-5xl font-black mb-8 tracking-tighter uppercase italic break-words leading-none">
                                {newCompetitionName || 'Copa sin nombre'}
                            </div>
                            
                            <ul className="space-y-4 mb-10 text-sm font-black uppercase italic tracking-tight">
                                <li className="flex items-center gap-3 pb-4 border-b border-zinc-900/10">
                                    <span className="material-symbols-outlined text-xl font-bold">check_circle</span> 
                                    Formato {newCompetitionFormat}
                                </li>
                                <li className="flex items-center gap-3 pb-4 border-b border-zinc-900/10">
                                    <span className="material-symbols-outlined text-xl font-bold">check_circle</span> 
                                    Reglamento {newCompReglamento}
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-xl font-bold">check_circle</span> 
                                    {ownerTeamToJoin ? '1' : '0'} Participante{ownerTeamToJoin !== '' ? '' : 's'}
                                </li>
                            </ul>

                            <div className="grid grid-cols-2 gap-3 mb-8">
                                <div className="rounded-2xl border border-zinc-900/10 bg-white/30 px-4 py-3">
                                    <p className="text-[9px] font-black uppercase tracking-[0.18em] opacity-60">Temporada</p>
                                    <p className="text-lg font-black italic">T1</p>
                                </div>
                                <div className="rounded-2xl border border-zinc-900/10 bg-white/30 px-4 py-3">
                                    <p className="text-[9px] font-black uppercase tracking-[0.18em] opacity-60">Fase inicial</p>
                                    <p className="text-lg font-black italic">InscripciÃ³n</p>
                                </div>
                            </div>

                            <button
                                onClick={handleCreateCompetition}
                                disabled={!newCompetitionName.trim()}
                                className="w-full bg-zinc-900 text-primary py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-black/20 disabled:opacity-50 disabled:scale-100 italic"
                            >
                                Empezar Competición
                            </button>
                            <p className="text-center text-[10px] font-black uppercase tracking-widest mt-6 opacity-60 italic">Esto guardará la liga y permitirá unirse a otros</p>
                        </div>
                    </div>

                    {/* Rule Preview Card */}
                    <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl">
                        <h4 className="text-white font-black italic uppercase tracking-widest text-sm mb-6 flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-xl font-bold">history_edu</span>
                            Detalles de Reglas
                        </h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center py-4 border-b border-white/5 group">
                                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Muerte Súbita</span>
                                <button 
                                    onClick={() => setNewCompMuerteSubita(!newCompMuerteSubita)}
                                    className={`font-black uppercase tracking-widest text-[10px] italic px-3 py-1 rounded-lg transition-all ${newCompMuerteSubita ? 'bg-primary text-black' : 'bg-primary/5 text-primary border border-primary/10'}`}
                                >
                                    {newCompMuerteSubita ? 'Habilitado' : 'Desactivado'}
                                </button>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-white/5">
                                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Incentivos</span>
                                <select 
                                    value={newCompIncentivos}
                                    onChange={(e) => setNewCompIncentivos(e.target.value as any)}
                                    className="bg-transparent text-white font-black uppercase tracking-widest text-[10px] italic outline-none text-right"
                                >
                                    <option value="Todos">Todos</option>
                                    <option value="Reducidos">Reducidos</option>
                                    <option value="Ninguno">Ninguno</option>
                                </select>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-white/5">
                                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Tiempo por Turno</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setNewCompTiempoTurno(Math.max(1, newCompTiempoTurno - 1))} className="text-primary font-bold opacity-50 hover:opacity-100 p-1">-</button>
                                    <span className="text-white font-black uppercase tracking-widest text-[10px] italic w-20 text-center">{newCompTiempoTurno} Minutos</span>
                                    <button onClick={() => setNewCompTiempoTurno(Math.min(10, newCompTiempoTurno + 1))} className="text-primary font-bold opacity-50 hover:opacity-100 p-1">+</button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center py-4">
                                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Mercenarios</span>
                                <button 
                                    onClick={() => setNewCompMercenarios(!newCompMercenarios)}
                                    className={`font-black uppercase tracking-widest text-[10px] italic underline decoration-primary/30 underline-offset-4 transition-all ${newCompMercenarios ? 'text-white' : 'text-slate-600'}`}
                                >
                                    {newCompMercenarios ? 'Habilitado' : 'Desactivado'}
                                </button>
                            </div>
                            <div className="flex justify-between items-center py-4 border-t border-white/5">
                                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Petty Cash</span>
                                <button 
                                    onClick={() => setNewCompPettyCash(!newCompPettyCash)}
                                    className={`font-black uppercase tracking-widest text-[10px] italic underline decoration-primary/30 underline-offset-4 transition-all ${newCompPettyCash ? 'text-white' : 'text-slate-600'}`}
                                >
                                    {newCompPettyCash ? 'Habilitado' : 'Desactivado'}
                                </button>
                            </div>
                            <div className="flex justify-between items-center py-4 border-t border-white/5">
                                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Prayers To Nuffle</span>
                                <button 
                                    onClick={() => setNewCompPrayers(!newCompPrayers)}
                                    className={`font-black uppercase tracking-widest text-[10px] italic underline decoration-primary/30 underline-offset-4 transition-all ${newCompPrayers ? 'text-white' : 'text-slate-600'}`}
                                >
                                    {newCompPrayers ? 'Habilitado' : 'Desactivado'}
                                </button>
                            </div>
                            <div className="flex justify-between items-center py-4 border-t border-white/5">
                                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Expensive Mistakes</span>
                                <button 
                                    onClick={() => setNewCompExpensiveMistakes(!newCompExpensiveMistakes)}
                                    className={`font-black uppercase tracking-widest text-[10px] italic underline decoration-primary/30 underline-offset-4 transition-all ${newCompExpensiveMistakes ? 'text-white' : 'text-slate-600'}`}
                                >
                                    {newCompExpensiveMistakes ? 'Habilitado' : 'Desactivado'}
                                </button>
                            </div>
                            <div className="flex justify-between items-center py-4 border-t border-white/5">
                                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Base Redraft</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setNewCompRedraftBase(Math.max(0, newCompRedraftBase - 50000))} className="text-primary font-bold opacity-50 hover:opacity-100 p-1">-</button>
                                    <span className="text-white font-black uppercase tracking-widest text-[10px] italic w-24 text-center">
                                        {newCompRedraftBase.toLocaleString('es-ES')} mo
                                    </span>
                                    <button onClick={() => setNewCompRedraftBase(newCompRedraftBase + 50000)} className="text-primary font-bold opacity-50 hover:opacity-100 p-1">+</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info box */}
                    <div className="flex gap-4 p-6 rounded-[2rem] bg-primary/5 border border-primary/10">
                        <span className="material-symbols-outlined text-primary font-bold shrink-0">info</span>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                            Los calendarios se generan de forma equilibrada una vez iniciada la competición para asegurar la mejor experiencia competitiva.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDetailView = () => {
        if (!selectedCompetition) return null;

        return (
            <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-10">
                <button
                    onClick={() => { setView('list'); setSelectedCompetition(null); }}
                    className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] mb-4 hover:underline group italic transition-all"
                >
                    <span className="material-symbols-outlined font-bold transform group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    Volver a la lista
                </button>

                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-zinc-900/40 border border-white/5 p-10 rounded-[2.5rem] relative overflow-visible backdrop-blur-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3"></div>

                    <div className="relative z-10 space-y-2 min-w-0 flex-1">
                        <div className="flex gap-2">
                            <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] italic border ${selectedCompetition.status === 'Open' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-primary/10 text-primary border-primary/20'
                                }`}>
                                {selectedCompetition.status}
                            </span>
                            <span className="text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] italic border bg-white/5 text-slate-300 border-white/10">
                                T{selectedCompetition.seasonNumber || 1}
                            </span>
                            <span className="text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] italic border bg-primary/10 text-primary border-primary/20">
                                {selectedCompetition.phase === 'registration' && 'Inscripción'}
                                {selectedCompetition.phase === 'regular_season' && 'Temporada'}
                                {selectedCompetition.phase === 'playoffs' && 'Playoffs'}
                                {selectedCompetition.phase === 'offseason' && 'Offseason'}
                                {selectedCompetition.phase === 'redraft' && 'Redraft'}
                            </span>
                            {selectedCompetition.visibility === 'Private' && (
                                <span className="text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] italic border bg-red-500/10 text-red-500 border-red-500/20 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">lock</span> PRIVADA
                                </span>
                            )}
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white italic truncate tracking-tighter uppercase pt-2">
                            {selectedCompetition.name}
                        </h2>
                        <div className="flex flex-wrap items-center gap-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm font-bold text-primary">military_tech</span> {selectedCompetition.format}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm font-bold text-primary">person</span> {selectedCompetition.ownerName}</span>
                            {selectedCompetition.rules && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                    <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm font-bold text-primary">gavel</span> {selectedCompetition.rules.reglamento}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {user?.id === selectedCompetition.ownerId && (
                        <div className="relative z-10 flex flex-wrap gap-3 w-full xl:w-auto xl:justify-end shrink-0">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}?join=${selectedCompetition.id}`);
                                    setConfirmation({
                                        title: "Enlace Copiado",
                                        message: "¡Enlace de invitación copiado al portapapeles! Envíalo a otros coaches por WhatsApp o Discord para que se unan.",
                                        onConfirm: () => setConfirmation(null),
                                        type: 'info'
                                    });
                                }}
                                className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-black font-black py-3 px-6 rounded-2xl text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-primary/5 flex items-center gap-2 whitespace-nowrap"
                            >
                                <span className="material-symbols-outlined text-sm font-bold">link</span>
                                Invitar
                            </button>
                            {selectedCompetition.status === 'Open' && (
                                <button
                                    onClick={() => handleStartCompetition(selectedCompetition)}
                                    className="bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600 hover:text-white font-black py-3 px-8 rounded-2xl text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-green-900/10 whitespace-nowrap"
                                >
                                    Iniciar Competición
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setConfirmation({
                                        title: "¿Eliminar competición?",
                                        message: "Esta acción es irreversible. Se perderán todos los datos de la liga.",
                                        onConfirm: () => {
                                            onCompetitionDelete(selectedCompetition.id);
                                            setView('list');
                                            setSelectedCompetition(null);
                                            setConfirmation(null);
                                        },
                                        type: 'danger'
                                    });
                                }}
                                className="bg-red-600/20 text-red-500 border border-red-500/30 hover:bg-red-600 hover:text-white font-black py-3 px-8 rounded-2xl text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-red-900/10 whitespace-nowrap"
                            >
                                Eliminar
                            </button>
                        </div>
                    )}
                </div>

                {/* Tab Navigation */}
                <div className="flex bg-zinc-900/60 p-1 rounded-2xl border border-white/5 backdrop-blur-md w-fit mx-auto">
                    {[
                        { id: 'summary', icon: 'dashboard', label: 'Resumen' },
                        { id: 'standings', icon: 'format_list_numbered', label: 'Clasificación' },
                        { id: 'calendar', icon: 'calendar_month', label: 'Calendario' },
                        { id: 'stats', icon: 'monitoring', label: 'Estadísticas' },
                        { id: 'news', icon: 'newspaper', label: 'La Gaceta' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setDetailTab(tab.id as any)}
                            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${detailTab === tab.id ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-white'}`}
                        >
                            <span className="material-symbols-outlined text-sm font-bold">{tab.icon}</span>
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {detailTab === 'summary' && (
                        <div className="space-y-12">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                <div className="lg:col-span-8 bg-zinc-900/20 border border-white/5 p-10 rounded-[2.5rem]">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                                        <h3 className="text-xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
                                            <span className="material-symbols-outlined font-bold text-primary">groups</span>
                                            Equipos Inscritos <span className="text-primary font-black ml-1">({selectedCompetition.teams.length})</span>
                                        </h3>

                                        <div className="flex flex-wrap gap-3">
                                            {!selectedCompetition.teams.some(t => t.ownerId === user?.id) && (
                                                <button
                                                    onClick={() => setJoinModalState({ comp: selectedCompetition, teamToJoin: managedTeams[0]?.name || '' })}
                                                    className="bg-primary text-black font-black py-3 px-8 rounded-2xl text-[10px] uppercase tracking-widest transition-all hover:scale-105 shadow-lg shadow-primary/20"
                                                >
                                                    Inscribir mi Equipo
                                                </button>
                                            )}
                                            {user?.id === selectedCompetition.ownerId && (
                                                <button
                                                    onClick={() => openManualParticipantModal()}
                                                    className="bg-black/40 border border-white/10 text-white font-black py-3 px-8 rounded-2xl text-[10px] uppercase tracking-widest transition-all hover:border-primary/30 hover:text-primary"
                                                >
                                                    Anadir participante manual
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {selectedCompetition.teams.length > 0 ? (
                                        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                                            {selectedCompetition.teams.map(t => (
                                                <div
                                                    key={t.entryId || `${t.ownerId || 'manual'}:${t.ownerName}:${t.teamName}`}
                                                    onClick={() => setSelectedEntryId(t.entryId || null)}
                                                    className={`p-5 bg-black/40 border rounded-2xl flex flex-col gap-4 group transition-all overflow-hidden min-w-0 min-h-[140px] cursor-pointer ${selectedEntryId === t.entryId ? 'border-primary/50 bg-primary/5' : 'border-white/5 hover:border-primary/30'}`}
                                                >
                                                    <div className="flex items-start gap-4 min-w-0">
                                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm italic shrink-0">
                                                            {t.teamName.charAt(0)}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-black text-white uppercase italic tracking-tight break-words">{t.teamName}</p>
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest break-words">{t.ownerName} {t.isManual ? '- Manual' : ''}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-auto flex flex-col gap-3 min-w-0">
                                                        <div className="flex items-center justify-between gap-3 min-w-0 flex-wrap">
                                                            {t.stats && (
                                                                <div className="text-left shrink-0">
                                                                    <p className="text-[10px] font-black text-primary italic uppercase">{t.stats.points} PTS</p>
                                                                    <p className="text-[8px] text-slate-600 font-bold uppercase">{t.stats.played} PJ</p>
                                                                </div>
                                                            )}
                                                            {user?.id === selectedCompetition.ownerId && (
                                                                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end ml-auto">
                                                                {t.teamState && (
                                                                    <button
                                                                        onClick={() => openCloneDashboard(t)}
                                                                        className="w-9 h-9 rounded-xl border border-primary/20 bg-primary/10 text-primary hover:bg-primary hover:text-black transition-all flex items-center justify-center"
                                                                        title="Ver ficha del clon"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                                    </button>
                                                                )}
                                                                {t.isManual && (
                                                                    <button
                                                                        onClick={() => openManualParticipantModal(t)}
                                                                        className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center"
                                                                        title="Editar franquicia manual"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                                                    </button>
                                                                )}
                                                                {t.isManual && (
                                                                    <button
                                                                        onClick={() => handleDeleteManualParticipant(t.entryId)}
                                                                        className="w-9 h-9 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                                                                        title="Eliminar franquicia manual"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                                    </button>
                                                                )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10">
                                            <p className="text-slate-500 font-bold italic uppercase tracking-widest text-xs">Esperando aspirantes... Unete o invita a otros coaches!</p>
                                        </div>
                                    )}

                                    {(() => {
                                        const selectedEntry = selectedCompetition.teams.find(team => team.entryId === selectedEntryId) || selectedCompetition.teams[0];
                                        const teamState = selectedEntry?.teamState;
                                        if (!selectedEntry || !teamState) return null;

                                        const ready = buildTeamReadySummary(teamState);
                                        const treasury = Math.max(0, teamState.treasury || 0);
                                        const fans = Math.max(0, teamState.dedicatedFans || 0);
                                        const mngCount = teamState.players.filter(player => (player.missNextGame || 0) > 0).length;
                                        const injuryCount = teamState.players.reduce((sum, player) => sum + (player.lastingInjuries?.length || 0), 0);
                                        const pendingLevelUps = getPendingLevelUps(teamState);
                                        const playerAlerts = teamState.players
                                            .map(player => {
                                                const advances = player.advancements?.length || 0;
                                                const nextLevel = SPP_LEVELS[advances] || Number.POSITIVE_INFINITY;
                                                const needsLevelUp = (player.spp || 0) >= nextLevel;
                                                const injuries = player.lastingInjuries?.length || 0;
                                                const isMng = (player.missNextGame || 0) > 0;
                                                return {
                                                    id: player.id,
                                                    name: player.customName || player.position,
                                                    position: player.position,
                                                    injuries,
                                                    isMng,
                                                    needsLevelUp,
                                                };
                                            })
                                            .filter(player => player.injuries > 0 || player.isMng || player.needsLevelUp)
                                            .slice(0, 6);

                                        return (
                                            <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div>
                                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest italic">Ficha del clon</p>
                                                        <h4 className="text-2xl font-black text-white uppercase italic tracking-tight">{selectedEntry.teamName}</h4>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{selectedEntry.ownerName} {selectedEntry.isManual ? '- Manual' : ''}</p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-3">
                                                        <button
                                                            onClick={() => openCloneDashboard(selectedEntry)}
                                                            className="bg-primary/10 border border-primary/20 text-primary font-black py-3 px-5 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-primary hover:text-black transition-all"
                                                        >
                                                            Abrir clon
                                                        </button>
                                                        {selectedEntry.isManual && (
                                                            <button
                                                                onClick={() => openManualParticipantModal(selectedEntry)}
                                                                className="bg-black/40 border border-white/10 text-white font-black py-3 px-5 rounded-2xl text-[10px] uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-all"
                                                            >
                                                                Editar alta
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
                                                    <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-3xl space-y-1 min-w-0">
                                                        <p className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase italic leading-tight break-words">Tesoreria</p>
                                                        <p className="text-xl font-black text-primary italic">{Math.round(treasury / 1000)}k</p>
                                                    </div>
                                                    <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-3xl space-y-1 min-w-0">
                                                        <p className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase italic leading-tight break-words">Fans</p>
                                                        <p className="text-xl font-black text-white italic">{fans}</p>
                                                    </div>
                                                    <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-3xl space-y-1 min-w-0">
                                                        <p className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase italic leading-tight break-words">Disponibles</p>
                                                        <p className="text-xl font-black text-white italic">{ready?.availableCount || 0}</p>
                                                    </div>
                                                    <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-3xl space-y-1 min-w-0">
                                                        <p className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase italic leading-tight break-words">MNG</p>
                                                        <p className="text-xl font-black text-amber-400 italic">{mngCount}</p>
                                                    </div>
                                                    <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-3xl space-y-1 min-w-0">
                                                        <p className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase italic leading-tight break-words">Lesiones</p>
                                                        <p className="text-xl font-black text-red-400 italic">{injuryCount}</p>
                                                    </div>
                                                    <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-3xl space-y-1 min-w-0">
                                                        <p className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase italic leading-tight break-words">Subidas</p>
                                                        <p className="text-xl font-black text-primary italic">{pendingLevelUps}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="p-5 bg-black/30 border border-white/5 rounded-3xl">
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-3">Estado de partido</p>
                                                        <div className="flex flex-wrap gap-3 text-[10px] font-black uppercase tracking-widest">
                                                            <span className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white">{ready?.availableCount || 0} listos</span>
                                                            <span className="px-3 py-2 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300">{ready?.unavailableCount || 0} bajas</span>
                                                            <span className="px-3 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary">{Math.round((ready?.realTV || teamState.totalTV || 0) / 1000)}k TV real</span>
                                                            {!!ready?.journeymenNeeded && <span className="px-3 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300">{ready.journeymenNeeded} sustitutos</span>}
                                                        </div>
                                                    </div>
                                                    <div className="p-5 bg-black/30 border border-white/5 rounded-3xl">
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-3">Ultimo seguimiento</p>
                                                        {teamState.history?.length ? (
                                                            <div className="space-y-2">
                                                                {[...teamState.history].slice(-2).reverse().map(item => (
                                                                    <div key={item.id} className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-widest">
                                                                        <span className="text-white truncate">{item.opponentName}</span>
                                                                        <span className="text-slate-500">{item.score}</span>
                                                                        <span className={`${item.result === 'W' ? 'text-emerald-400' : item.result === 'L' ? 'text-red-400' : 'text-amber-300'}`}>{item.result}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Aun sin actas registradas</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="p-5 bg-black/30 border border-white/5 rounded-3xl">
                                                    <div className="flex items-center justify-between gap-3 mb-4">
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Alertas de plantilla</p>
                                                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">{playerAlerts.length} visibles</span>
                                                    </div>
                                                    {playerAlerts.length > 0 ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {playerAlerts.map(player => (
                                                                <div key={player.id} className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl space-y-2 min-w-0">
                                                                    <div className="flex items-start justify-between gap-3">
                                                                        <div className="min-w-0">
                                                                            <p className="text-sm font-black text-white uppercase italic truncate">{player.name}</p>
                                                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">{player.position}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-widest">
                                                                        {player.needsLevelUp && <span className="px-2 py-1 rounded-xl bg-primary/10 border border-primary/20 text-primary">Subida pendiente</span>}
                                                                        {player.isMng && <span className="px-2 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">MNG</span>}
                                                                        {player.injuries > 0 && <span className="px-2 py-1 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">{player.injuries} lesion{player.injuries > 1 ? 'es' : ''}</span>}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sin alertas activas en este clon</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Dashboard de Franquicia del Usuario */}
                                    {selectedCompetition.teams.find(t => t.ownerId === user?.id) && (
                                        <div className="mt-12 pt-12 border-t border-white/5">
                                            <div className="flex items-center gap-3 mb-8">
                                                <span className="material-symbols-outlined text-primary font-bold">account_balance_wallet</span>
                                                <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Estado de mi <span className="text-primary italic">Franquicia</span></h3>
                                            </div>
                                            
                                            {(() => {
                                                const myFranchise = selectedCompetition.teams.find(t => t.ownerId === user?.id);
                                                const myTeam = myFranchise?.teamState;
                                                if (!myFranchise || !myTeam) return null;

                                                const teamReady = buildTeamReadySummary(myTeam);
                                                const availablePlayers = teamReady?.availableCount ?? 0;
                                                const injuredPlayers = teamReady?.unavailableCount ?? 0;
                                                const journeymenNeeded = teamReady?.journeymenNeeded ?? 0;
                                                const realTV = teamReady?.realTV ?? myTeam.totalTV ?? 0;

                                                return (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                        <div className="p-6 bg-zinc-900/40 border border-white/5 rounded-3xl space-y-2">
                                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Plantilla</p>
                                                            <div className="flex items-baseline gap-2">
                                                                <span className="text-2xl font-black text-white italic">{availablePlayers}</span>
                                                                <span className="text-[10px] font-bold text-slate-600 uppercase">Disponibles</span>
                                                            </div>
                                                            {injuredPlayers > 0 && <p className="text-[9px] font-bold text-red-500 uppercase italic">+{injuredPlayers} Bajas</p>}
                                                            {journeymenNeeded > 0 && <p className="text-[9px] font-bold text-primary uppercase italic">{journeymenNeeded} Sustitutos</p>}
                                                        </div>
                                                        <div className="p-6 bg-zinc-900/40 border border-white/5 rounded-3xl space-y-2">
                                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Tesorería Liga</p>
                                                            <div className="flex items-baseline gap-2">
                                                                <span className="text-2xl font-black text-primary italic">{(myTeam.treasury / 1000)}k</span>
                                                                <span className="text-[10px] font-bold text-slate-600 uppercase">GP</span>
                                                            </div>
                                                        </div>
                                                        <div className="p-6 bg-zinc-900/40 border border-white/5 rounded-3xl space-y-2">
                                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">TV Real Partido</p>
                                                            <div className="flex items-baseline gap-2">
                                                                <span className="text-2xl font-black text-white italic">{realTV / 1000}k</span>
                                                                <span className="text-[10px] font-bold text-slate-600 uppercase">TV</span>
                                                            </div>
                                                            {!!teamReady?.tvLoss && <p className="text-[9px] font-bold text-amber-400 uppercase italic">-{teamReady.tvLoss / 1000}k por bajas</p>}
                                                        </div>
                                                        <div 
                                                            onClick={() => openCloneDashboard(myFranchise)}
                                                            className="p-6 bg-primary/10 border border-primary/20 rounded-3xl flex flex-col justify-center items-center gap-2 group cursor-pointer hover:bg-primary/20 transition-all"
                                                        >
                                                            <span className="material-symbols-outlined text-primary font-bold">stadium</span>
                                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest italic">Gestionar Clon</p>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}

                                    {/* Próximo Encuentro */}
                                    {(() => {
                                        if (!user || !selectedCompetition || selectedCompetition.status !== 'In Progress') return null;
                                        
                                        let nextMatch: Matchup | null = null;
                                        let nextRoundIndex: string | null = null;
                                        let nextMatchIndex = -1;
                                        let opponentName = '';
                                        
                                        // Buscar en Ligas
                                        if (selectedCompetition.format === 'Liguilla' && selectedCompetition.schedule) {
                                            for (const [roundIdx, round] of Object.entries(selectedCompetition.schedule)) {
                                                const matchIdx = round.findIndex(m => !isMatchCompleted(m) && (m.team1 === user.name || m.team2 === user.name || selectedCompetition.teams.find(t => t.ownerId === user.id)?.teamName === m.team1 || selectedCompetition.teams.find(t => t.ownerId === user.id)?.teamName === m.team2));
                                                const myMatch = matchIdx >= 0 ? round[matchIdx] : undefined;
                                                if (myMatch) {
                                                    nextMatch = myMatch;
                                                    nextRoundIndex = roundIdx;
                                                    nextMatchIndex = matchIdx;
                                                    const myTeamName = selectedCompetition.teams.find(t => t.ownerId === user.id)?.teamName;
                                                    opponentName = myMatch.team1 === myTeamName ? myMatch.team2 : myMatch.team1;
                                                    break;
                                                }
                                            }
                                        } 
                                        // Buscar en Torneos
                                        else if (selectedCompetition.format === 'Torneo' && selectedCompetition.bracket) {
                                            for (const [roundIdx, round] of Object.entries(selectedCompetition.bracket)) {
                                                const matchIdx = round.findIndex(m => !isMatchCompleted(m) && m.team1 !== 'Por determinar' && m.team2 !== 'Por determinar' && (selectedCompetition.teams.find(t => t.ownerId === user.id)?.teamName === m.team1 || selectedCompetition.teams.find(t => t.ownerId === user.id)?.teamName === m.team2));
                                                const myMatch = matchIdx >= 0 ? round[matchIdx] : undefined;
                                                if (myMatch) {
                                                    nextMatch = myMatch;
                                                    nextRoundIndex = roundIdx;
                                                    nextMatchIndex = matchIdx;
                                                    const myTeamName = selectedCompetition.teams.find(t => t.ownerId === user.id)?.teamName;
                                                    opponentName = myMatch.team1 === myTeamName ? myMatch.team2 : myMatch.team1;
                                                    break;
                                                }
                                            }
                                        }

                                        if (!nextMatch || opponentName === 'BYE') return null;

                                        const opponentFranchise = selectedCompetition.teams.find(t => t.teamName === opponentName);
                                        const myFranchise = selectedCompetition.teams.find(t => t.ownerId === user.id);
                                        const myReady = buildTeamReadySummary(myFranchise?.teamState);
                                        const opponentReady = buildTeamReadySummary(opponentFranchise?.teamState);
                                        const tvDifference = Math.abs((myReady?.realTV || 0) - (opponentReady?.realTV || 0));
                                        const underdog = (myReady?.realTV || 0) < (opponentReady?.realTV || 0)
                                            ? myFranchise?.teamName
                                            : (opponentReady?.realTV || 0) < (myReady?.realTV || 0)
                                                ? opponentFranchise?.teamName
                                                : null;

                                        return (
                                            <div className="mt-12 pt-12 border-t border-white/5">
                                                <div className="flex items-center gap-3 mb-8">
                                                    <span className="material-symbols-outlined text-primary font-bold">event_repeat</span>
                                                    <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Próximo <span className="text-primary italic">Encuentro</span></h3>
                                                </div>

                                                <div className="bg-zinc-900/60 border border-white/5 rounded-[2.5rem] p-6 md:p-8 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 xl:gap-8 relative overflow-hidden group min-w-0">
                                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    
                                                    <div className="flex items-center gap-4 md:gap-6 relative z-10 w-full min-w-0">
                                                        <div className="size-16 md:size-20 bg-zinc-800 rounded-3xl border border-white/10 flex items-center justify-center text-3xl md:text-4xl text-primary font-black italic shrink-0">
                                                            {opponentName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 italic">Próxima mesa</p>
                                                            <h4 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-2 break-words">{opponentName}</h4>
                                                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-bold uppercase min-w-0">
                                                                <span>{opponentFranchise?.teamState?.rosterName || 'Desconocido'}</span>
                                                                <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                                                <span>TV real {(opponentReady?.realTV || 0) / 1000}k</span>
                                                            </div>
                                                            <p className="mt-2 text-[10px] font-black uppercase tracking-widest italic text-primary">
                                                                {nextMatch.dateStatus === 'postponed' ? 'Partido aplazado' : formatScheduledMatchDate(nextMatch.scheduledDate)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="relative z-10 w-full xl:w-auto space-y-4 min-w-0">
                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 xl:min-w-[420px] min-w-0">
                                                            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-1">
                                                                <p className="text-[9px] font-black text-slate-500 uppercase">Mi franquicia</p>
                                                                <p className="text-sm font-black text-white uppercase italic break-words">{myFranchise?.teamName}</p>
                                                                <div className="flex flex-wrap gap-2 text-[9px] font-bold uppercase min-w-0">
                                                                    <span className="text-white">{myReady?.availableCount || 0} listos</span>
                                                                    <span className="text-red-400">{myReady?.unavailableCount || 0} bajas</span>
                                                                    <span className="text-primary">{(myReady?.realTV || 0) / 1000}k TV</span>
                                                                </div>
                                                            </div>
                                                            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-1">
                                                                <p className="text-[9px] font-black text-slate-500 uppercase">Rival</p>
                                                                <p className="text-sm font-black text-white uppercase italic break-words">{opponentFranchise?.teamName}</p>
                                                                <div className="flex flex-wrap gap-2 text-[9px] font-bold uppercase min-w-0">
                                                                    <span className="text-white">{opponentReady?.availableCount || 0} listos</span>
                                                                    <span className="text-red-400">{opponentReady?.unavailableCount || 0} bajas</span>
                                                                    <span className="text-primary">{(opponentReady?.realTV || 0) / 1000}k TV</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase italic text-slate-400 min-w-0">
                                                            <span>Diferencia TV: <span className="text-white">{tvDifference / 1000}k</span></span>
                                                            {underdog && selectedCompetition.rules?.pettyCashEnabled && tvDifference > 0 && (
                                                                <span className="text-primary">Petty Cash para {underdog}</span>
                                                            )}
                                                            {!!myReady?.journeymenNeeded && <span className="text-amber-400">{myReady.journeymenNeeded} sustitutos</span>}
                                                        </div>

                                                            <div className="flex flex-col xl:flex-row gap-3">
                                                                <button 
                                                                    onClick={() => nextRoundIndex != null && openManualResolution(nextRoundIndex, nextMatchIndex, nextMatch!)}
                                                                    className="w-full xl:w-auto bg-primary text-black font-black px-8 py-5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 uppercase tracking-tighter text-sm shadow-xl shadow-primary/10"
                                                                >
                                                                    <span className="material-symbols-outlined font-bold">fact_check</span>
                                                                    Registrar resultado de mesa
                                                                </button>
                                                                {onNavigateToMatch && (
                                                                    <button 
                                                                        onClick={() => onNavigateToMatch(nextMatch!, selectedCompetition, myFranchise?.teamState, opponentFranchise?.teamState)}
                                                                        className="w-full xl:w-auto bg-black/40 border border-white/10 text-white font-black px-8 py-5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:border-primary/30 hover:text-primary uppercase tracking-tighter text-sm"
                                                                    >
                                                                        <span className="material-symbols-outlined font-bold">sports_esports</span>
                                                                        Abrir en Arena
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <p className="text-[9px] font-bold uppercase text-slate-500 leading-relaxed">
                                                                El gestor de ligas prioriza actas de mesa. Arena queda como apoyo opcional.
                                                            </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                <div className="lg:col-span-4 space-y-6">
                                    {selectedCompetition.rules && (
                                        <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl">
                                            <h4 className="text-white font-black italic uppercase tracking-widest text-sm mb-6 flex items-center gap-3">
                                                <span className="material-symbols-outlined text-primary text-xl font-bold">history_edu</span>
                                                Reglas
                                            </h4>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                                    <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Muerte Súbita</span>
                                                    <span className={`font-black uppercase tracking-widest text-[10px] italic ${selectedCompetition.rules.muerteSubita ? 'text-primary' : 'text-slate-600'}`}>
                                                        {selectedCompetition.rules.muerteSubita ? 'Habilitado' : 'Desactivado'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                                    <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Incentivos</span>
                                                    <span className="text-white font-black uppercase tracking-widest text-[10px] italic">{selectedCompetition.rules.incentivos}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                                    <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Turno</span>
                                                    <span className="text-white font-black uppercase tracking-widest text-[10px] italic">{selectedCompetition.rules.tiempoTurno} min</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                                    <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Petty Cash</span>
                                                    <span className={`font-black uppercase tracking-widest text-[10px] italic ${selectedCompetition.rules.pettyCashEnabled ? 'text-white' : 'text-slate-600'}`}>
                                                        {selectedCompetition.rules.pettyCashEnabled ? 'Habilitado' : 'Desactivado'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                                    <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Prayers To Nuffle</span>
                                                    <span className={`font-black uppercase tracking-widest text-[10px] italic ${selectedCompetition.rules.prayersToNuffleEnabled ? 'text-white' : 'text-slate-600'}`}>
                                                        {selectedCompetition.rules.prayersToNuffleEnabled ? 'Habilitado' : 'Desactivado'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                                    <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Expensive Mistakes</span>
                                                    <span className={`font-black uppercase tracking-widest text-[10px] italic ${selectedCompetition.rules.expensiveMistakesEnabled ? 'text-white' : 'text-slate-600'}`}>
                                                        {selectedCompetition.rules.expensiveMistakesEnabled ? 'Habilitado' : 'Desactivado'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                                    <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Redraft Base</span>
                                                    <span className="text-white font-black uppercase tracking-widest text-[10px] italic">
                                                        {(selectedCompetition.rules.redraftBudgetBase || 0).toLocaleString('es-ES')} mo
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center py-2">
                                                    <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Mercenarios</span>
                                                    <span className={`font-black uppercase tracking-widest text-[10px] italic ${selectedCompetition.rules.mercenarios ? 'text-white' : 'text-slate-600'}`}>
                                                        {selectedCompetition.rules.mercenarios ? 'Habilitado' : 'Desactivado'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-8 bg-primary/5 border border-primary/20 rounded-[2rem] text-center space-y-4">
                                        <span className="material-symbols-outlined text-primary text-4xl mb-3">share</span>
                                        <h4 className="text-white font-black italic uppercase tracking-widest text-xs mb-4">
                                            {selectedCompetition.visibility === 'Private' ? 'Código de acceso privado' : 'Invita a más rivales'}
                                        </h4>
                                        <div className="rounded-2xl border border-primary/20 bg-black/30 px-4 py-3 text-left">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">
                                                {selectedCompetition.visibility === 'Private' ? 'Comparte este código' : 'Enlace de invitación'}
                                            </p>
                                            <p className="text-[10px] font-black text-white break-all">
                                                {selectedCompetition.joinCode || selectedCompetition.id}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                const inviteKey = selectedCompetition.joinCode || selectedCompetition.id;
                                                navigator.clipboard.writeText(`${window.location.origin}?join=${inviteKey}`);
                                                setConfirmation({
                                                    title: "Enlace Copiado",
                                        message: "¡Enlace de invitación copiado al portapapeles!",
                                                    onConfirm: () => setConfirmation(null),
                                                    type: 'info'
                                                });
                                            }}
                                            className="w-full bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary py-3 rounded-xl font-black text-[10px] uppercase tracking-widest italic transition-all"
                                        >
                                            Copiar Enlace
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {detailTab === 'standings' && (
                        <div className="space-y-12">
                            {finalWinner && finalWinner !== 'Por determinar' && (
                                <div className="text-center p-10 bg-zinc-900/60 border-2 border-primary/30 rounded-[3rem] relative overflow-hidden shadow-2xl">
                                    <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full"></div>
                                    <span className="material-symbols-outlined text-6xl text-primary font-bold mb-4 block animate-bounce">emoji_events</span>
                                    <h3 className="text-sm font-black text-primary italic uppercase tracking-[0.3em] mb-2">Gran Campeón</h3>
                                    <p className="text-5xl md:text-7xl font-black text-white uppercase italic truncate tracking-tighter drop-shadow-lg">{finalWinner}</p>
                                </div>
                            )}

                            {selectedCompetition.format === 'Liguilla' ? (
                                <div className="bg-zinc-900/20 border border-white/5 rounded-[2.5rem] overflow-hidden">
                                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                        <h3 className="text-xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
                                            <span className="material-symbols-outlined font-bold text-primary">format_list_numbered</span>
                                            Clasificación
                                        </h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-black/40 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                    <th className="p-6">Pos</th>
                                                    <th className="p-6">Equipo</th>
                                                    <th className="p-6 text-center">PJ</th>
                                                    <th className="p-6 text-center">G</th>
                                                    <th className="p-6 text-center">E/P</th>
                                                    <th className="p-6 text-center">TD +/-</th>
                                                    <th className="p-6 text-center text-primary">Pts</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {standings.map((t, idx) => (
                                                    <tr key={t.name} className="hover:bg-white/5 transition-all">
                                                        <td className="p-6 font-black italic text-slate-500">{idx + 1}</td>
                                                        <td className="p-6 font-black text-white italic uppercase">{t.name}</td>
                                                        <td className="p-6 text-center font-bold">{t.p}</td>
                                                        <td className="p-6 text-center font-bold text-green-500">{t.w}</td>
                                                        <td className="p-6 text-center font-bold text-slate-400">{t.d}/{t.l}</td>
                                                        <td className="p-6 text-center font-bold text-slate-400">{t.tdF - t.tdA}</td>
                                                        <td className="p-6 text-center font-black text-primary text-lg">{t.pts}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-zinc-900/20 border border-white/5 rounded-[2.5rem] opacity-50 italic uppercase tracking-widest font-black text-slate-500">
                                    Ver Bracket en pestaña Calendario
                                </div>
                            )}
                        </div>
                    )}

                    {detailTab === 'stats' && (
                        <div className="space-y-12 pb-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Anotadores */}
                                <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
                                     <div className="p-8 border-b border-white/5 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary font-bold">sports_football</span>
                                        </div>
                                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Máximos <span className="text-primary italic">Anotadores</span></h3>
                                    </div>
                                    <div className="p-8">
                                        {(() => {
                                            const allPlayers = selectedCompetition.teams.flatMap(t => 
                                                (t.teamState?.players || []).map(p => ({ ...p, teamName: t.teamName }))
                                            );
                                            const scorers = allPlayers
                                                .filter(p => (p.sppActions?.TD || 0) > 0)
                                                .sort((a, b) => (b.sppActions?.TD || 0) - (a.sppActions?.TD || 0))
                                                .slice(0, 10);
                                            
                                            if (scorers.length === 0) return (
                                                <div className="py-20 text-center space-y-4 opacity-30">
                                                    <span className="material-symbols-outlined text-5xl">edit_off</span>
                                                    <p className="font-bold uppercase tracking-widest text-[10px] italic">No hay touchdowns registrados</p>
                                                </div>
                                            );

                                            return (
                                                <div className="space-y-3">
                                                    {scorers.map((p, idx) => (
                                                        <div key={`${p.teamName}-${p.customName}`} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-primary/20 transition-all group">
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-xs font-black text-slate-700 italic w-4">{idx + 1}</span>
                                                                <div>
                                                                    <p className="text-sm font-black text-white uppercase italic group-hover:text-primary transition-colors">{p.customName}</p>
                                                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{p.teamName}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-2xl font-black text-primary italic leading-none">{p.sppActions?.TD}</span>
                                                                <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest italic">TD</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Carniceros */}
                                <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
                                     <div className="p-8 border-b border-white/5 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-red-500 font-bold">skull</span>
                                        </div>
                                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Mayores <span className="text-red-500 italic">Carniceros</span></h3>
                                    </div>
                                    <div className="p-8">
                                        {(() => {
                                            const allPlayers = selectedCompetition.teams.flatMap(t => 
                                                (t.teamState?.players || []).map(p => ({ ...p, teamName: t.teamName }))
                                            );
                                            const bashers = allPlayers
                                                .filter(p => (p.sppActions?.CASUALTY || 0) > 0)
                                                .sort((a, b) => (b.sppActions?.CASUALTY || 0) - (a.sppActions?.CASUALTY || 0))
                                                .slice(0, 10);
                                            
                                            if (bashers.length === 0) return (
                                                <div className="py-20 text-center space-y-4 opacity-30">
                                                    <span className="material-symbols-outlined text-5xl">medical_services</span>
                                                    <p className="font-bold uppercase tracking-widest text-[10px] italic">Nadie ha mordido el polvo todavía</p>
                                                </div>
                                            );

                                            return (
                                                <div className="space-y-3">
                                                    {bashers.map((p, idx) => (
                                                        <div key={`${p.teamName}-${p.customName}`} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-red-500/20 transition-all group">
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-xs font-black text-slate-700 italic w-4">{idx + 1}</span>
                                                                <div>
                                                                    <p className="text-sm font-black text-white uppercase italic group-hover:text-red-500 transition-colors">{p.customName}</p>
                                                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{p.teamName}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-2xl font-black text-red-500 italic leading-none">{p.sppActions?.CASUALTY}</span>
                                                                <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest italic">CAS</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {detailTab === 'calendar' && (
                        <div className="space-y-12">
                            {selectedCompetition.status === 'Open' ? (
                                <div className="text-center py-20 bg-zinc-900/20 border border-white/5 rounded-[2.5rem] opacity-50 italic uppercase tracking-widest font-black text-slate-500">
                                    El calendario se generará al iniciar la competición
                                </div>
                            ) : (
                                <>
                                    {selectedCompetition.format === 'Liguilla' && selectedCompetition.schedule && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {Object.entries(selectedCompetition.schedule).map(([roundIdx, round]) => (
                                                <div key={roundIdx} className="bg-zinc-900/20 border border-white/5 rounded-[2.5rem] p-8">
                                                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                                                    <h4 className="text-sm font-black text-primary italic tracking-[0.2em] uppercase flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-sm font-bold">calendar_month</span>
                                                        Jornada {parseInt(roundIdx) + 1}
                                                    </h4>
                                                    <span className="text-[10px] font-black uppercase tracking-widest italic px-3 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary">
                                                        {formatScheduledMatchDate((round as Matchup[])[0]?.scheduledDate)}
                                                    </span>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {(round as Matchup[]).map((match, matchIdx) => (
                                                            <div key={matchIdx} className="bg-black/40 p-4 rounded-3xl border border-white/5 flex flex-col gap-3 group">
                                                                <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-widest italic text-slate-500">
                                                                    <span>{getMatchDateStatusLabel(match)}</span>
                                                                    <span className="text-primary">{match.dateStatus === 'postponed' ? 'Aplazado' : formatScheduledMatchDate(match.scheduledDate)}</span>
                                                                </div>
                                                                {!!match.invitedEmails?.length && (
                                                                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                                                                        Invitables: {match.invitedEmails.join(', ')}
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center justify-between gap-4">
                                                                <span className="flex-1 text-right font-black text-[11px] uppercase italic truncate text-slate-300">{match.team1}</span>
                                                                <div className="flex items-center gap-4 px-4 py-2 bg-zinc-900 rounded-2xl border border-white/10 shrink-0 relative overflow-hidden">
                                                                    <div className="font-black text-xl text-white w-8 text-center">{match.score1 ?? '-'}</div>
                                                                    <div className="text-[10px] font-black text-slate-600">VS</div>
                                                                    <div className="font-black text-xl text-white w-8 text-center">{match.score2 ?? '-'}</div>
                                                                    {!match.played && (user?.id === selectedCompetition.ownerId || selectedCompetition.teams.some(t => t.ownerId === user?.id && (t.teamName === match.team1 || t.teamName === match.team2))) && (
                                                                        <button
                                                                            onClick={() => openManualResolution(roundIdx, matchIdx, match)}
                                                                            className="absolute inset-0 bg-primary/90 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-black"
                                                                        >
                                                                            <span className="material-symbols-outlined font-black">edit</span>
                                                                            <span className="ml-2 text-[10px] font-black uppercase tracking-widest italic">Registrar acta</span>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <span className="flex-1 text-left font-black text-[11px] uppercase italic truncate text-slate-300">{match.team2}</span>
                                                                </div>
                                                                {!match.played && (user?.id === selectedCompetition.ownerId || selectedCompetition.teams.some(t => t.ownerId === user?.id && (t.teamName === match.team1 || t.teamName === match.team2))) && (
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {match.dateStatus !== 'confirmed' && (
                                                                            <button
                                                                                onClick={() => handleConfirmMatchDate('schedule', roundIdx, matchIdx)}
                                                                                className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest"
                                                                            >
                                                                                Confirmar
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            onClick={() => openScheduleEditor('schedule', roundIdx, matchIdx, match)}
                                                                            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest"
                                                                        >
                                                                            Mover fecha
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handlePostponeMatch('schedule', roundIdx, matchIdx)}
                                                                            className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-widest"
                                                                        >
                                                                            Aplazar
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {selectedCompetition.format === 'Torneo' && selectedCompetition.bracket && (
                                        <div className="flex gap-10 overflow-x-auto pb-10 scrollbar-premium">
                                            {Object.entries(selectedCompetition.bracket).map(([roundIdx, round]) => (
                                                <div key={roundIdx} className="flex flex-col justify-around min-w-[280px] gap-8">
                                                    <div className="text-center space-y-1">
                                                        <h3 className="text-[10px] font-black text-primary italic uppercase tracking-[0.3em]">
                                                            {parseInt(roundIdx) === 0 ? 'Primera Fase' : Object.keys(selectedCompetition.bracket!).length - 1 === parseInt(roundIdx) ? 'Finalísima' : `Fase ${parseInt(roundIdx) + 1}`}
                                                        </h3>
                                                        <div className="h-0.5 w-12 bg-primary/30 mx-auto rounded-full"></div>
                                                    </div>
                                                    <div className="space-y-12">
                                                        {(round as Matchup[]).map((match, matchIdx) => (
                                                            <div key={matchIdx} className="relative group">
                                                                <div className="bg-zinc-900 border border-white/10 p-4 rounded-[2rem] shadow-2xl relative z-10 space-y-3">
                                                                    <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-widest italic text-slate-500">
                                                                        <span>{getMatchDateStatusLabel(match)}</span>
                                                                        <span className="text-primary">{match.dateStatus === 'postponed' ? 'Aplazado' : formatScheduledMatchDate(match.scheduledDate)}</span>
                                                                    </div>
                                                                    <div className="w-full flex justify-between items-center p-3 rounded-2xl bg-black/40 text-slate-400 font-bold">
                                                                        <span className="truncate text-[10px] uppercase tracking-tighter">{match.team1}</span>
                                                                        <span className="font-black text-sm">{match.score1 ?? '-'}</span>
                                                                    </div>
                                                                    <div className="h-px bg-white/5 w-full mx-auto"></div>
                                                                    <div className="w-full flex justify-between items-center p-3 rounded-2xl bg-black/40 text-slate-400 font-bold">
                                                                        <span className="truncate text-[10px] uppercase tracking-tighter">{match.team2}</span>
                                                                        <span className="font-black text-sm">{match.score2 ?? '-'}</span>
                                                                    </div>
                                                                    {!match.played && (user?.id === selectedCompetition.ownerId || selectedCompetition.teams.some(t => t.ownerId === user?.id && (t.teamName === match.team1 || t.teamName === match.team2))) && (
                                                                        <div className="space-y-2">
                                                                            <button
                                                                                onClick={() => openManualResolution(roundIdx, matchIdx, match)}
                                                                                className="w-full mt-2 py-3 rounded-2xl bg-primary/10 hover:bg-primary/90 text-primary hover:text-black transition-all font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                                                                            >
                                                                                <span className="material-symbols-outlined text-sm font-bold">edit</span>
                                                                                {match.played ? 'Editar acta' : 'Registrar acta'}
                                                                            </button>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {match.dateStatus !== 'confirmed' && (
                                                                                    <button
                                                                                        onClick={() => handleConfirmMatchDate('bracket', roundIdx, matchIdx)}
                                                                                        className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest"
                                                                                    >
                                                                                        Confirmar
                                                                                    </button>
                                                                                )}
                                                                                <button
                                                                                    onClick={() => openScheduleEditor('bracket', roundIdx, matchIdx, match)}
                                                                                    className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest"
                                                                                >
                                                                                    Mover fecha
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handlePostponeMatch('bracket', roundIdx, matchIdx)}
                                                                                    className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-widest"
                                                                                >
                                                                                    Aplazar
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {detailTab === 'news' && (
                        <div className="max-w-4xl mx-auto space-y-12 py-10">
                            <div className="text-center space-y-6">
                                <span className="material-symbols-outlined text-6xl text-primary font-bold mb-4">newspaper</span>
                                <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter">La <span className="text-primary italic">Gaceta</span> de Nuffle</h1>
                                <div className="h-1 w-24 bg-primary mx-auto rounded-full"></div>
                                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs max-w-lg mx-auto leading-relaxed">
                                    Crónicas sangrientas, rumores de vestuario y el reporte oficial de cada encuentro en la arena de <span className="text-white italic">{selectedCompetition.name}</span>
                                </p>
                                
                                {user?.id === selectedCompetition.ownerId && (
                                    <button 
                                        onClick={() => setShowReportModal(true)}
                                        className="mt-6 bg-primary text-black font-black px-8 py-3 rounded-2xl flex items-center gap-2 mx-auto transition-all hover:scale-105 active:scale-95 uppercase tracking-tighter text-[10px] shadow-xl shadow-primary/10"
                                    >
                                        <span className="material-symbols-outlined font-bold text-sm">edit_square</span>
                                        Redactar Crónica
                                    </button>
                                )}
                            </div>
                            
                            {selectedCompetition.reports && selectedCompetition.reports.length > 0 ? (
                                <div className="grid grid-cols-1 gap-12">
                                    {selectedCompetition.reports.slice().reverse().map((report, idx) => (
                                        <div key={report.id || idx} className="bg-zinc-900/40 border border-white/5 rounded-[3rem] p-10 relative overflow-hidden group hover:border-primary/20 transition-all border-l-4 border-l-primary/30">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                                            
                                            <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
                                                <div className="space-y-4 flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-tighter">ÚLTIMA HORA</span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase">{report.date}</span>
                                                    </div>
                                                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors">
                                                        {report.headline || `Duelo de Titanes: ${report.homeTeam.name} vs ${report.opponentTeam.name}`}
                                                    </h2>
                                                    {report.subHeadline && (
                                                        <p className="text-slate-400 font-bold italic text-sm">{report.subHeadline}</p>
                                                    )}
                                                    <div className="h-px w-20 bg-white/10"></div>
                                                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium line-clamp-4 group-hover:line-clamp-none transition-all duration-700">
                                                        {report.article}
                                                    </p>
                                                    
                                                    {report.summary && (
                                                        <div className="mt-4 p-4 bg-black/40 rounded-2xl border border-white/5 italic text-slate-400 text-xs">
                                                            "{report.summary}"
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="w-full md:w-64 bg-black/40 border border-white/5 rounded-3xl p-6 space-y-4 shrink-0">
                                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center border-b border-white/5 pb-2 italic">Reporte Oficial</p>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="text-center flex-1 min-w-0">
                                                            <div className="text-xl font-black text-white italic truncate">{report.homeTeam.score}</div>
                                                            <div className="text-[8px] font-bold text-slate-500 uppercase truncate">{report.homeTeam.name}</div>
                                                        </div>
                                                        <div className="text-[10px] font-black text-primary px-2 italic">VS</div>
                                                        <div className="text-center flex-1 min-w-0">
                                                            <div className="text-xl font-black text-white italic truncate">{report.opponentTeam.score}</div>
                                                            <div className="text-[8px] font-bold text-slate-500 uppercase truncate">{report.opponentTeam.name}</div>
                                                        </div>
                                                    </div>
                                                    
                                                    {report.stats && (
                                                        <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-y-2 gap-x-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-[8px] font-black text-slate-600 uppercase">Casualties</span>
                                                                <span className="text-[10px] font-black text-white">{report.stats.casualties.home} - {report.stats.casualties.opponent}</span>
                                                            </div>
                                                            <div className="flex flex-col text-right">
                                                                <span className="text-[8px] font-black text-slate-600 uppercase">Passes</span>
                                                                <span className="text-[10px] font-black text-white">{report.stats.passes.home} - {report.stats.passes.opponent}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-24 text-center bg-zinc-900/20 border border-dashed border-white/10 rounded-[3rem] space-y-6">
                                    <div className="relative inline-block">
                                        <span className="material-symbols-outlined text-8xl text-white/5">edit_off</span>
                                        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full"></div>
                                    </div>
                                    <div>
                                        <p className="text-white font-black italic uppercase text-lg mb-2">Las rotativas están paradas</p>
                                        <p className="text-slate-500 font-bold italic uppercase tracking-widest text-[10px]">Todavía no se ha redactado ninguna crónica para esta competición.</p>
                                    </div>
                                    {user?.id === selectedCompetition.ownerId && (
                                        <button 
                                            onClick={() => setShowReportModal(true)}
                                            className="px-8 py-3 bg-primary/20 text-primary border border-primary/30 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-black transition-all"
                                        >
                                            Escribir Primera Noticia
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="leagues-light min-h-screen pb-20">
            <AnimatePresence mode="wait">
                {view === 'list' && (
                    <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <LeaguesTabbedList
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            myLeagues={myLeagues}
                            myTournaments={myTournaments}
                            publicLeagues={publicLeagues}
                            publicTournaments={publicTournaments}
                            myCompetitions={myCompetitions}
                            user={user}
                            defaultTeamName={managedTeams[0]?.name || ''}
                            onOpenCompetition={(c) => { setSelectedCompetition(c); setView('detail'); }}
                            onJoinCompetition={(c, teamName) => setJoinModalState({ comp: c, teamToJoin: teamName })}
                            onCreateCompetition={() => setView('create')}
                        />
                    </motion.div>
                )}
                {view === 'create' && <motion.div key="create" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>{renderCreateView()}</motion.div>}
                {view === 'detail' && <motion.div key="detail" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>{renderDetailView()}</motion.div>}
            </AnimatePresence>

            <AnimatePresence>
                {manualAddState.isOpen && selectedCompetition && (
                    <div className="leagues-modal-overlay fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => { resetManualParticipantState(); }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-zinc-900 border border-white/5 rounded-[2.5rem] shadow-2xl max-w-6xl w-full max-h-[92vh] overflow-hidden relative flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            {(() => {
                                const selectedRoster = baseTeams.find(team => team.name === manualAddState.baseRosterName);
                                if (!selectedRoster) return null;

                                const totalPlayers = Object.values(manualRosterCounts).reduce((sum, value) => sum + Number(value || 0), 0);
                                const previewTeam = manualAddState.franchiseName
                                    ? buildManualTeamFromRoster(selectedRoster, manualAddState.franchiseName || selectedRoster.name, {
                                        treasury: manualAddState.treasury,
                                        rerolls: manualAddState.rerolls,
                                        dedicatedFans: manualAddState.dedicatedFans,
                                        apothecary: manualAddState.apothecary
                                    }, manualRosterCounts)
                                    : null;
                                const previewTV = previewTeam ? calculateTeamValue(previewTeam, skills) : 0;
                                const budgetSummary = calculateManualTeamSpend(selectedRoster, {
                                    treasury: manualAddState.treasury,
                                    rerolls: manualAddState.rerolls,
                                    dedicatedFans: manualAddState.dedicatedFans,
                                    apothecary: manualAddState.apothecary
                                }, manualRosterCounts);
                                const isOverBudget = budgetSummary.overBudget;

                                return (
                                    <>
                                        <div className="p-8 lg:p-10 border-b border-white/5 shrink-0">
                                            <div className="flex items-start justify-between gap-6">
                                                <div className="space-y-2">
                                                    <h3 className="text-2xl lg:text-3xl font-black text-white italic uppercase tracking-tighter">{manualAddState.editEntryId ? <>Editar franquicia <span className="text-primary">manual</span></> : <>Añadir participante <span className="text-primary">manual</span></>}</h3>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Registrar coach de mesa en {selectedCompetition.name}</p>
                                                </div>
                                                <div className="flex flex-wrap gap-2 justify-end">
                                                    <span className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-slate-300 text-[10px] font-black uppercase tracking-widest">{selectedRoster.name}</span>
                                                    <span className="px-3 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">{totalPlayers} jugadores</span>
                                                    <span className={`px-3 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${isOverBudget ? 'border-red-400/40 bg-red-500/10 text-red-300' : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'}`}>{isOverBudget ? `Exceso ${Math.round(Math.abs(budgetSummary.remainingBudget) / 1000)}k` : `Restante ${Math.round(budgetSummary.remainingBudget / 1000)}k`}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-8 lg:p-10 overflow-y-auto space-y-8">
                                            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)] gap-8">
                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="md:col-span-2">
                                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Entrenador</label>
                                                            <input
                                                                type="text"
                                                                value={manualAddState.coachName}
                                                                onChange={e => setManualAddState(prev => ({ ...prev, coachName: e.target.value }))}
                                                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all font-bold"
                                                                placeholder="Ej: Jorge Álvarez"
                                                            />
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Nombre de franquicia</label>
                                                            <input
                                                                type="text"
                                                                value={manualAddState.franchiseName}
                                                                onChange={e => setManualAddState(prev => ({ ...prev, franchiseName: e.target.value }))}
                                                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all font-bold"
                                                                placeholder="Ej: Barbas del Barril"
                                                            />
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Raza base</label>
                                                            <div className="relative">
                                                                <select
                                                                    value={manualAddState.baseRosterName}
                                                                    onChange={e => setManualAddState(prev => ({ ...prev, baseRosterName: e.target.value }))}
                                                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all font-bold appearance-none"
                                                                >
                                                                    {baseTeams.length > 0 ? (
                                                                        baseTeams.map(t => <option key={t.name} value={t.name}>{t.name}</option>)
                                                                    ) : (
                                                                        <option value="">No hay razas cargadas en master data</option>
                                                                    )}
                                                                </select>
                                                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">expand_more</span>
                                                            </div>
                                                            <p className="mt-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">Usaremos el roster canónico de Firebase y esta franquicia no quedará vinculada a una cuenta web.</p>
                                                        </div>
                                                    </div>

                                                    <div className="rounded-3xl border border-white/10 bg-black/20 p-5 space-y-4">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Economía inicial</h4>
                                                            <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">{Math.round(previewTV / 1000)}k TV</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                            <div>
                                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Tesorería</label>
                                                                <input type="number" min="0" value={manualAddState.treasury} onChange={e => setManualAddState(prev => ({ ...prev, treasury: Number(e.target.value || 0) }))} className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all font-bold" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Rerolls</label>
                                                                <input type="number" min="0" value={manualAddState.rerolls} onChange={e => setManualAddState(prev => ({ ...prev, rerolls: Number(e.target.value || 0) }))} className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all font-bold" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Fans</label>
                                                                <input type="number" min="0" value={manualAddState.dedicatedFans} onChange={e => setManualAddState(prev => ({ ...prev, dedicatedFans: Number(e.target.value || 0) }))} className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all font-bold" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Boticario</label>
                                                                <button type="button" onClick={() => setManualAddState(prev => ({ ...prev, apothecary: !prev.apothecary }))} className={`w-full rounded-2xl px-4 py-4 border font-black uppercase tracking-widest text-[10px] transition-all ${manualAddState.apothecary ? 'bg-primary text-black border-primary' : 'bg-black/40 border-white/10 text-slate-300'}`}>
                                                                    {manualAddState.apothecary ? 'Sí' : 'No'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="rounded-3xl border border-white/10 bg-black/20 p-5 space-y-4">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Roster manual</h4>
                                                        <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
                                                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">{totalPlayers} jugadores</span>
                                                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">{selectedRoster.roster.length} posiciones</span>
                                                        </div>
                                                    </div>
                                                    <div className={`grid grid-cols-2 xl:grid-cols-3 gap-2 text-[10px] font-black uppercase tracking-widest ${isOverBudget ? 'text-red-300' : 'text-slate-300'}`}>
                                                        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">Jugadores: {Math.round(budgetSummary.playersCost / 1000)}k</div>
                                                        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">Rerolls: {Math.round(budgetSummary.rerollsCost / 1000)}k</div>
                                                        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">Fans + Apo: {Math.round((budgetSummary.fansCost + budgetSummary.apothecaryCost) / 1000)}k</div>
                                                        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">Tesorería: {Math.round(budgetSummary.treasuryReserved / 1000)}k</div>
                                                        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">Gastado: {Math.round(budgetSummary.totalSpend / 1000)}k</div>
                                                        <div className={`rounded-2xl border px-3 py-2 ${isOverBudget ? 'border-red-400/40 bg-red-500/10 text-red-300' : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'}`}>
                                                            {isOverBudget ? `Exceso ${Math.round(Math.abs(budgetSummary.remainingBudget) / 1000)}k` : `Restante ${Math.round(budgetSummary.remainingBudget / 1000)}k`}
                                                        </div>
                                                    </div>
                                                    <div className="max-h-[52vh] overflow-y-auto pr-2 space-y-3">
                                                        {selectedRoster.roster.map(position => {
                                                            const maxQty = parseQtyMax(position.qty);
                                                            return (
                                                                <div key={position.position} className="grid grid-cols-[minmax(0,1fr)_96px] gap-3 items-center rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
                                                                    <div className="min-w-0">
                                                                        <p className="text-white font-black uppercase italic text-sm truncate">{position.position}</p>
                                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{position.qty} · {Math.round(position.cost / 1000)}k</p>
                                                                    </div>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max={maxQty}
                                                                        value={manualRosterCounts[position.position] ?? 0}
                                                                        onChange={e => {
                                                                            const next = Math.max(0, Math.min(maxQty, Number(e.target.value || 0)));
                                                                            setManualRosterCounts(prev => ({ ...prev, [position.position]: next }));
                                                                        }}
                                                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-3 py-3 text-white text-center focus:ring-2 focus:ring-primary/50 outline-none transition-all font-black"
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 lg:px-10 border-t border-white/5 bg-zinc-900/80 backdrop-blur-sm shrink-0">
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <button onClick={() => { resetManualParticipantState(); }} className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors">Cancelar</button>
                                                <button
                                                    onClick={handleAddManualParticipant}
                                                    disabled={isOverBudget}
                                                    className="flex-1 bg-primary text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-transform shadow-xl shadow-primary/20 disabled:opacity-40 disabled:hover:scale-100"
                                                >
                                                    {manualAddState.editEntryId ? 'Guardar clon manual' : 'Añadir a la liga'}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {scheduleEditState?.isOpen && (
                    <div className="leagues-modal-overlay fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setScheduleEditState(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-zinc-900 border border-white/5 rounded-[2.5rem] shadow-2xl max-w-xl w-full overflow-hidden relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8 border-b border-white/5 space-y-2">
                                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Gestionar fecha</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Mover, confirmar o reprogramar este partido de liga</p>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="space-y-3">
                                        <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Fecha y hora</span>
                                        <input
                                            type="datetime-local"
                                            value={scheduleEditState.scheduledDate}
                                            onChange={e => setScheduleEditState(current => current ? { ...current, scheduledDate: e.target.value } : current)}
                                            className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 px-4 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all font-bold"
                                        />
                                    </label>
                                    <label className="space-y-3">
                                        <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Duracion en minutos</span>
                                        <input
                                            type="number"
                                            min="30"
                                            step="15"
                                            value={scheduleEditState.durationMinutes}
                                            onChange={e => setScheduleEditState(current => current ? { ...current, durationMinutes: Math.max(30, Number(e.target.value) || 30) } : current)}
                                            className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 px-4 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all font-bold"
                                        />
                                    </label>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                                        Al guardar, esta fecha quedará marcada como confirmada dentro de la liga.
                                    </p>
                                </div>
                            </div>
                            <div className="p-8 bg-black/40 flex gap-4">
                                <button onClick={() => setScheduleEditState(null)} className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors">Cancelar</button>
                                <button onClick={handleSaveMatchDate} className="flex-1 py-4 bg-primary text-black font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10">Guardar fecha</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal: Unirse */}
            <AnimatePresence>
                {joinModalState.comp && (
                    <div className="leagues-modal-overlay fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setJoinModalState({ comp: null, teamToJoin: '' })}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-zinc-900 border border-white/5 rounded-[2.5rem] shadow-2xl max-w-sm w-full overflow-hidden relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8 border-b border-white/5">
                                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Inscripción</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Unirse a "{joinModalState.comp.name}"</p>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-3">
                                    <label htmlFor="teamSelect" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Selecciona tu equipo</label>
                                    <select
                                        id="teamSelect"
                                        value={joinModalState.teamToJoin}
                                        onChange={e => setJoinModalState(s => ({ ...s, teamToJoin: e.target.value }))}
                                        className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 px-4 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all font-bold"
                                    >
                                        <option value="" disabled>Selecciona un equipo...</option>
                                        {managedTeams.length > 0 ? (
                                            managedTeams.map(t => <option key={t.id || t.name} value={t.name}>{t.name}</option>)
                                        ) : (
                                            <option disabled>No tienes equipos en el Gremio</option>
                                        )}
                                    </select>
                                    {managedTeams.length === 0 && (
                                        <p className="text-[9px] text-amber-500 italic mt-1 px-4">
                                            Primero debes forjar un equipo en el Gremio para poder inscribirlo.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="p-8 bg-black/40 flex gap-4">
                                <button onClick={() => setJoinModalState({ comp: null, teamToJoin: '' })} className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors">Cancelar</button>
                                <button onClick={handleJoinCompetition} className="flex-1 py-4 bg-primary text-black font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10">Confirmar</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal: Resultado / Acta */}
            <AnimatePresence>
                {scoreModalState?.isOpen && selectedCompetition && (
                    <CompetitionMatchResolutionModal
                        competition={selectedCompetition}
                        roundIndex={scoreModalState.roundIndex}
                        matchIndex={scoreModalState.matchIndex}
                        matchup={scoreModalState.matchup}
                        onClose={() => setScoreModalState(null)}
                        onSubmit={handleSaveScore}
                    />
                )}
            </AnimatePresence>

            {/* Modal: Confirmación Personalizado */}
            <AnimatePresence>
                {confirmation && (
                    <div className="leagues-modal-overlay fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 backdrop-blur-md" onClick={() => setConfirmation(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center space-y-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center ${confirmation.type === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                                <span className="material-symbols-outlined text-3xl font-bold">
                                    {confirmation.type === 'danger' ? 'warning' : 'info'}
                                </span>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">{confirmation.title}</h3>
                                <p className="text-sm text-slate-400 font-medium leading-relaxed">{confirmation.message}</p>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setConfirmation(null)} className="flex-1 py-4 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors">Cerrar</button>
                                {confirmation.type === 'danger' ? (
                                    <button onClick={confirmation.onConfirm} className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-lg shadow-red-900/20">Confirmar</button>
                                ) : (
                                    <button onClick={confirmation.onConfirm} className="flex-1 py-4 bg-primary text-black font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">Entendido</button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Modal: Gestionar Clon */}
            <AnimatePresence>
                {statsModalTeam && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[100] bg-background-dark/95 backdrop-blur-xl overflow-y-auto"
                    >
                        <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen text-white font-black uppercase tracking-widest text-sm">Cargando clon...</div>}>
                        <TeamDashboard 
                            team={statsModalTeam}
                            onUpdate={handleUpdateClone}
                            onDeleteRequest={() => setConfirmation({
                                title: "Retirar Franquicia",
                                message: "¿Estás seguro de que quieres retirar este equipo de la competición? Se perderá todo el historial del clon.",
                                onConfirm: () => {
                                    const updatedComp = {
                                        ...selectedCompetition!,
                                        teams: selectedCompetition!.teams.filter(t => statsModalEntryId ? t.entryId !== statsModalEntryId : t.teamName !== statsModalTeam.name)
                                    };
                                    onCompetitionUpdate(updatedComp);
                                    setSelectedCompetition(updatedComp);
                                    setStatsModalTeam(null);
                                    setStatsModalEntryId(null);
                                    setConfirmation(null);
                                }
                            })}
                            onBack={() => { setStatsModalTeam(null); setStatsModalEntryId(null); }}
                            isGuest={isGuest}
                            hideDelete={true}
                            syncLabel="Sync Clon"
                            stickyOffset="top-0"
                        />
                        </React.Suspense>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Modal: Redactar Crónica */}
            <AnimatePresence>
                {showReportModal && selectedCompetition && (
                    <div className="leagues-modal-overlay fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setShowReportModal(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-zinc-900 border border-white/5 rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8 border-b border-white/5 shrink-0 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Cronista Real</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Escribiendo para {selectedCompetition.name}</p>
                                </div>
                                <button onClick={() => setShowReportModal(false)} className="text-slate-500 hover:text-white">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="p-8 space-y-6 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase">Titular Principal</label>
                                        <input 
                                            type="text" 
                                            placeholder="Goleada en la Arena..."
                                            value={reportForm.headline}
                                            onChange={e => setReportForm({...reportForm, headline: e.target.value})}
                                            className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 px-4 text-white focus:ring-1 focus:ring-primary outline-none font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase">Sub-titular</label>
                                        <input 
                                            type="text" 
                                            placeholder="Detalles del partido..."
                                            value={reportForm.subHeadline}
                                            onChange={e => setReportForm({...reportForm, subHeadline: e.target.value})}
                                            className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 px-4 text-white focus:ring-1 focus:ring-primary outline-none font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-black/40 p-6 rounded-3xl border border-white/5">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-600 uppercase">Equipo A</label>
                                        <select 
                                            value={reportForm.homeTeam}
                                            onChange={e => setReportForm({...reportForm, homeTeam: e.target.value})}
                                            className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-xs text-white"
                                        >
                                            <option value="">Selección...</option>
                                            {selectedCompetition.teams.map(t => <option key={t.teamName} value={t.teamName}>{t.teamName}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-600 uppercase">TDs</label>
                                        <input type="number" value={reportForm.score1} onChange={e => setReportForm({...reportForm, score1: parseInt(e.target.value)})} className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 text-center text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-600 uppercase">Equipo B</label>
                                        <select 
                                            value={reportForm.opponentTeam}
                                            onChange={e => setReportForm({...reportForm, opponentTeam: e.target.value})}
                                            className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-xs text-white"
                                        >
                                            <option value="">Selección...</option>
                                            {selectedCompetition.teams.map(t => <option key={t.teamName} value={t.teamName}>{t.teamName}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-600 uppercase">TDs</label>
                                        <input type="number" value={reportForm.score2} onChange={e => setReportForm({...reportForm, score2: parseInt(e.target.value)})} className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 text-center text-white" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase">Artículo de Prensa</label>
                                    <textarea 
                                        rows={8}
                                        placeholder="Escribe la crónica del encuentro..."
                                        value={reportForm.article}
                                        onChange={e => setReportForm({...reportForm, article: e.target.value})}
                                        className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 px-4 text-white focus:ring-1 focus:ring-primary outline-none font-medium text-sm leading-relaxed"
                                    />
                                </div>
                            </div>

                            <div className="p-8 bg-black/40 flex gap-4 shrink-0">
                                <button onClick={() => setShowReportModal(false)} className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors">Descartar</button>
                                <button 
                                    onClick={() => {
                                        const newReport: import('../../types').MatchReport = {
                                            id: crypto.randomUUID(),
                                            date: new Date().toLocaleDateString('es-ES'),
                                            headline: reportForm.headline,
                                            subHeadline: reportForm.subHeadline,
                                            article: reportForm.article,
                                            homeTeam: { name: reportForm.homeTeam, rosterName: '', score: reportForm.score1 },
                                            opponentTeam: { name: reportForm.opponentTeam, rosterName: '', score: reportForm.score2 },
                                            gameLog: []
                                        };
                                        const updatedComp = { ...selectedCompetition, reports: [...(selectedCompetition.reports || []), newReport] };
                                        onCompetitionUpdate(updatedComp);
                                        setSelectedCompetition(updatedComp);
                                        setShowReportModal(false);
                                        setReportForm({ headline: '', subHeadline: '', article: '', homeTeam: '', opponentTeam: '', score1: 0, score2: 0 });
                                    } }
                                    className="flex-1 py-4 bg-primary text-black font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10"
                                >
                                    Publicar en La Gaceta
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
